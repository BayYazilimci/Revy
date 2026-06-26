#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
EmlakJet Web Scraper v2
Sayfalama ile kiralık/satılık ilanları gezer, detayları çıkarır ve CSV olarak kaydeder.

Yeni özellikler (v2):
  - Liste sayfasından: resim URL'si (img src) + data-listing-id
  - Detay sayfasından: koordinatlar (lat/lng), bina yaşı, kat, ısıtma tipi,
    banyo sayısı, eşya durumu, açıklama, tüm resimler
  - RSC (React Server Components) payload'ından initialListing JSON parse
"""

import argparse
import csv
from datetime import datetime
import hashlib
import json
import re
import sys
import time

# Windows console encoding fix
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from bs4 import BeautifulSoup
import requests


# Varsayılan header bilgisi (gerçek tarayıcı taklidi için)
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.google.com/",
    "Connection": "keep-alive",
}

BASE_URL = "https://www.emlakjet.com"


def get_session():
    """Yeni bir HTTP istek oturumu (Session) oluşturur ve varsayılan başlıkları atar."""
    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)
    return session


def fetch_page(session, url, retries=3, timeout=15):
    """
    Verilen URL'yi çeker. Hata durumunda yeniden deneme (retry) yapar.
    """
    for attempt in range(1, retries + 1):
        try:
            response = session.get(url, timeout=timeout)
            response.encoding = 'utf-8'
            if response.status_code == 200:
                return response.text
            elif response.status_code == 404:
                print(f"[-] Sayfa bulunamadı (404): {url}")
                return None
            else:
                print(f"[!] Hata Kodu {response.status_code} (Deneme {attempt}/{retries}) - URL: {url}")
        except requests.RequestException as e:
            print(f"[!] Ağ Hatası: {e} (Deneme {attempt}/{retries}) - URL: {url}")
        
        if attempt < retries:
            time.sleep(2 * attempt)  # Üstel gecikme
            
    return None


def extract_listing_data(article, sequence_id):
    """
    İlan kartı (article) elementinden alanları ayıklayıp sözlük olarak döner.
    Liste sayfasından çekilen temel veriler + resim URL'si.
    """
    # 1. Listing ID (data-listing-id attribute)
    listing_id_num = article.get("data-listing-id", "")
    
    # 2. Başlık ve URL
    h3 = article.find("h3")
    title = "N/A"
    url = "N/A"
    if h3:
        a_tag = h3.find("a")
        if a_tag:
            title = a_tag.get_text(strip=True)
            url = a_tag.get("href", "N/A")
            if url.startswith("/"):
                url = BASE_URL + url
        else:
            title = h3.get_text(strip=True)
            
    # 3. Fiyat
    # İçinde "₺" karakteri barındıran en alt seviye (child içermeyen) etiketi buluyoruz
    price = "N/A"
    price_tag = article.find(lambda tag: tag.name in ["span", "div"] and "₺" in tag.get_text() and not tag.find_all())
    if price_tag:
        price = price_tag.get_text(strip=True)
        
    # 4. Konum ve Detay Metinleri
    # İlk <p> konumu, ikinci <p> ise diğer özellikleri içerir.
    location = "N/A"
    details_text = ""
    p_tags = article.find_all("p", class_=lambda c: c and "text-xs" in c)
    if p_tags and len(p_tags) >= 2:
        location = p_tags[0].get_text(strip=True)
        details_text = p_tags[1].get_text(strip=True)
    else:
        # Fallback arama (yapı değişirse)
        for p in article.find_all("p"):
            text = p.get_text(strip=True)
            if "," in text and "·" not in text:
                location = text
            elif "·" in text or "m²" in text:
                details_text = text

    # Detayları parse edelim
    rooms = "N/A"
    square_meters = "N/A"
    listing_date = "N/A"
    
    if details_text:
        parts = [p.strip() for p in details_text.split("·")]
        for part in parts:
            if "m²" in part:
                square_meters = part
            elif "+" in part or "Oda" in part or re.match(r"^\d+t\d+$", part.lower()):
                rooms = part
            elif re.search(r"\d{2}\.\d{2}\.\d{4}", part):
                listing_date = part

    # 5. Resim URL'si (liste sayfasındaki thumbnail)
    image_url = ""
    img_tag = article.find("img")
    if img_tag:
        image_url = img_tag.get("src", "") or img_tag.get("data-src", "")

    # İlan için benzersiz bir ID üretiyoruz (varsa linkin hashi, yoksa sequence_id)
    unique_str = url if url != "N/A" else f"{title}-{price}-{location}"
    listing_hash = hashlib.md5(unique_str.encode("utf-8")).hexdigest()[:10]
    ilan_id = f"EJ-{listing_hash}"

    return {
        "id": ilan_id,
        "listing_id": listing_id_num,
        "title": title,
        "price": price,
        "location": location,
        "rooms": rooms,
        "square_meters": square_meters,
        "listing_date": listing_date,
        "url": url,
        "image_url": image_url,
        # Detay sayfasından doldurulacak alanlar (başlangıçta boş)
        "latitude": "",
        "longitude": "",
        "building_age": "",
        "floor": "",
        "total_floors": "",
        "heating_type": "",
        "bathroom_count": "",
        "furnished": "",
        "description": "",
        "neighborhood": "",
        "listing_type": "",
        "all_images": "",
        "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def extract_detail_data(html):
    """
    Detay sayfasının HTML'inden RSC payload'undaki initialListing JSON'unu parse eder.
    Koordinat, resimler, bina yaşı, kat vb. bilgileri döner.
    """
    result = {
        "latitude": "",
        "longitude": "",
        "building_age": "",
        "floor": "",
        "total_floors": "",
        "heating_type": "",
        "bathroom_count": "",
        "furnished": "",
        "description": "",
        "neighborhood": "",
        "listing_type": "",
        "all_images": "",
        "image_url": "",  # Detaydan yüksek çözünürlüklü resim
    }
    
    if not html:
        return result
    
    # --- Yöntem 1: RSC payload'dan initialListing çıkar ---
    listing = _extract_initial_listing_from_rsc(html)
    
    if listing:
        # Koordinatlar
        location = listing.get("location", {})
        coords = location.get("coordinates", {})
        if coords:
            lat = coords.get("lat")
            lng = coords.get("lng")
            if lat and lng and str(lat) != "$undefined":
                result["latitude"] = str(lat)
                result["longitude"] = str(lng)
        
        # Mahalle
        neighborhood = location.get("neighborhood", {})
        if isinstance(neighborhood, dict):
            result["neighborhood"] = neighborhood.get("name", "")
        
        # İlan tipi
        tx_type = listing.get("transactionType", "")
        if tx_type == "rent":
            result["listing_type"] = "Kiralık"
        elif tx_type == "sale":
            result["listing_type"] = "Satılık"
        
        # Resimler
        images = listing.get("images", [])
        if images:
            img_urls = []
            for img in images:
                if isinstance(img, dict):
                    img_urls.append(img.get("url", ""))
                elif isinstance(img, str):
                    img_urls.append(img)
            
            if img_urls:
                result["image_url"] = img_urls[0]
                result["all_images"] = " | ".join(img_urls[:10])  # İlk 10 resim
        
        # Açıklama (HTML tag'larını temizle)
        desc = listing.get("description", "")
        if desc and desc != "$undefined":
            desc = re.sub(r'<[^>]+>', ' ', desc)
            desc = re.sub(r'\s+', ' ', desc).strip()
            result["description"] = desc[:500]  # İlk 500 karakter
        
        # Özellikler - properties array'inden çek
        properties_list = listing.get("properties", [])
        for prop in properties_list:
            if isinstance(prop, dict):
                name = prop.get("name", "")
                value = prop.get("value", "")
                if value == "$undefined":
                    continue
                    
                if "Bina Yaşı" in name:
                    result["building_age"] = str(value)
                elif "Bulunduğu Kat" in name:
                    result["floor"] = str(value)
                elif "Kat Sayısı" in name:
                    result["total_floors"] = str(value)
                elif "Isıtma" in name or "Isınma" in name:
                    result["heating_type"] = str(value)
                elif "Banyo" in name:
                    result["bathroom_count"] = str(value)
                elif "Eşya" in name:
                    result["furnished"] = str(value)
        
        # quickInfos array'inden de kontrol et
        quick_infos = listing.get("quickInfos", [])
        for qi in quick_infos:
            if isinstance(qi, dict):
                name = qi.get("name", "")
                value = qi.get("value", "")
                if value == "$undefined":
                    continue
                    
                if "Bina Yaşı" in name and not result["building_age"]:
                    result["building_age"] = str(value)
                elif "Kat" in name and "Sayısı" not in name and not result["floor"]:
                    result["floor"] = str(value)
    
    # --- Yöntem 2 (Fallback): JSON-LD + og:image ---
    if not result["image_url"] or not result["latitude"]:
        soup = BeautifulSoup(html, "html.parser")
        
        # og:image
        if not result["image_url"]:
            og_img = soup.find("meta", property="og:image")
            if og_img:
                result["image_url"] = og_img.get("content", "")
        
        # JSON-LD'den resimler
        if not result["all_images"]:
            ld_scripts = soup.find_all("script", type="application/ld+json")
            for s in ld_scripts:
                if s.string:
                    try:
                        ld_data = json.loads(s.string)
                        graph = ld_data.get("@graph", [ld_data])
                        for item in graph:
                            if item.get("@type") == "Product":
                                ld_images = item.get("image", [])
                                if isinstance(ld_images, list):
                                    result["all_images"] = " | ".join(ld_images[:10])
                                    if not result["image_url"] and ld_images:
                                        result["image_url"] = ld_images[0]
                    except (json.JSONDecodeError, TypeError):
                        pass
        
        # HTML'den detay bilgileri (fallback)
        if not result["building_age"]:
            _extract_detail_from_html(soup, result)
    
    return result


def _extract_initial_listing_from_rsc(html):
    """
    RSC (React Server Components) payload'undan initialListing JSON'unu çıkarır.
    Next.js App Router sayfalarında veri self.__next_f.push() çağrıları içinde gömülüdür.
    """
    # self.__next_f.push([1,"..."]) pattern'lerini bul
    rsc_chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.+?)"\]\)', html, re.DOTALL)
    
    for chunk in rsc_chunks:
        if "initialListing" not in chunk:
            continue
        
        try:
            # Escaped string'i decode et
            decoded = chunk.encode('utf-8').decode('unicode_escape', errors='replace')
            
            # "initialListing":{...} JSON'unu bul
            start = decoded.find('"initialListing"')
            if start < 0:
                continue
            
            json_start = decoded.find('{', start + len('"initialListing"'))
            if json_start < 0:
                continue
            
            # Balanced braces ile JSON sonunu bul
            depth = 0
            end_pos = json_start
            for pos in range(json_start, len(decoded)):
                ch = decoded[pos]
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        end_pos = pos + 1
                        break
            
            json_str = decoded[json_start:end_pos]
            listing = json.loads(json_str)
            
            # $undefined değerlerini None'a çevir
            _clean_undefined(listing)
            
            return listing
            
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            # JSON parse başarısız olursa devam et
            continue
    
    return None


def _clean_undefined(obj):
    """$undefined değerlerini None'a çevirir (recursive)"""
    if isinstance(obj, dict):
        for key in list(obj.keys()):
            if obj[key] == "$undefined":
                obj[key] = None
            elif isinstance(obj[key], (dict, list)):
                _clean_undefined(obj[key])
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if item == "$undefined":
                obj[i] = None
            elif isinstance(item, (dict, list)):
                _clean_undefined(item)


def _extract_detail_from_html(soup, result):
    """
    HTML elementlerinden detay bilgilerini çeker (fallback yöntem).
    RSC parse başarısız olursa kullanılır.
    """
    keywords_map = {
        "Bina Yaşı": "building_age",
        "Bulunduğu Kat": "floor",
        "Kat Sayısı": "total_floors",
        "Isıtma": "heating_type",
        "Banyo": "bathroom_count",
        "Eşya Durumu": "furnished",
    }
    
    for keyword, field in keywords_map.items():
        if result.get(field):
            continue
        
        elements = soup.find_all(string=re.compile(re.escape(keyword)))
        for el in elements:
            parent = el.parent
            if parent:
                grandparent = parent.parent
                if grandparent:
                    text = grandparent.get_text(" | ", strip=True)
                    parts = text.split(" | ")
                    # "Bina Yaşı | 6-10" formatında
                    for j, part in enumerate(parts):
                        if keyword in part and j + 1 < len(parts):
                            result[field] = parts[j + 1].strip()
                            break
                    if result[field]:
                        break


def parse_listings_page(html_content):
    """HTML içeriğindeki ilan kartlarını ve sonraki sayfa URL'sini bulur."""
    soup = BeautifulSoup(html_content, "html.parser")
    articles = soup.find_all("article")
    
    next_url = None
    next_link = soup.find("link", rel="next")
    if next_link:
        next_url = next_link.get("href")
        if next_url and next_url.startswith("/"):
            next_url = BASE_URL + next_url
            
    return articles, next_url


def save_to_csv(data_list, filename):
    """Veriyi Excel uyumlu UTF-8-sig kodlaması ile CSV dosyasına yazar."""
    if not data_list:
        print("[-] Kaydedilecek veri bulunamadı.")
        return

    fieldnames = [
        "id", "listing_id", "title", "price", "location", "rooms", "square_meters",
        "listing_date", "url", "image_url", "latitude", "longitude",
        "building_age", "floor", "total_floors", "heating_type",
        "bathroom_count", "furnished", "description", "neighborhood",
        "listing_type", "all_images", "scraped_at"
    ]
    
    try:
        with open(filename, mode="w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data_list)
        print(f"[+] Veriler başarıyla '{filename}' dosyasına kaydedildi. (Toplam: {len(data_list)} ilan)")
    except Exception as e:
        print(f"[!] CSV Yazma Hatası: {e}")


def main():
    parser = argparse.ArgumentParser(description="EmlakJet Web Scraper v2")
    parser.add_argument("-c", "--category", default="kiralik-daire", help="Kategori (örn: kiralik-daire, satilik-daire)")
    parser.add_argument("-m", "--max-pages", type=int, default=50, help="Maksimum sayfa limiti (varsayılan: 50)")
    parser.add_argument("-o", "--output", default="emlak_verileri.csv", help="Çıktı CSV dosya adı")
    parser.add_argument("-s", "--sleep", type=float, default=1.5, help="İstekler arası bekleme süresi (sn)")
    parser.add_argument("--no-detail", action="store_true", help="Detay sayfası çekmeden sadece liste verisi topla")
    parser.add_argument("--detail-sleep", type=float, default=2.0, help="Detay sayfası istekleri arası bekleme süresi (sn)")
    args = parser.parse_args()

    session = get_session()
    
    # Başlangıç URL'i
    current_url = f"{BASE_URL}/{args.category}"
    all_listings = []
    page = 1
    id_counter = 1

    print(f"[*] EmlakJet Scraper v2 Başlatıldı: {current_url}")
    print(f"[*] Maksimum Sayfa Limiti: {args.max_pages}")
    print(f"[*] Detay sayfası çekme: {'KAPALI' if args.no_detail else 'AÇIK'}")
    print(f"[*] İstekler arası bekleme: {args.sleep} sn (liste), {args.detail_sleep} sn (detay)\n")

    try:
        # === AŞAMA 1: Liste sayfalarını tara ===
        print("=" * 60)
        print("AŞAMA 1: Liste sayfalarından ilan toplama")
        print("=" * 60)
        
        while current_url and page <= args.max_pages:
            print(f"\n[*] Sayfa {page} çekiliyor: {current_url}")
            
            html = fetch_page(session, current_url)
            if not html:
                print(f"[!] Sayfa {page} içeriği alınamadı. İşlem sonlandırılıyor.")
                break
                
            articles, next_url = parse_listings_page(html)
            print(f"[+] Sayfa {page} üzerinde {len(articles)} ilan bulundu.")
            
            if not articles:
                print("[-] Bu sayfada ilan kartı bulunamadı. Döngüden çıkılıyor.")
                break
                
            for art in articles:
                data = extract_listing_data(art, id_counter)
                all_listings.append(data)
                id_counter += 1
                
            print(f"[~] Toplam toplanan ilan sayısı: {len(all_listings)}")
            
            if not next_url:
                print("[*] Sonraki sayfa bağlantısı bulunamadı (Son sayfaya ulaşıldı).")
                break
                
            current_url = next_url
            page += 1
            
            # Rate limiting
            time.sleep(args.sleep)

        print(f"\n[OK] Asama 1 tamamlandi. Toplam: {len(all_listings)} ilan toplandi.")
        
        # === AŞAMA 2: Detay sayfalarından ek bilgi çek ===
        if not args.no_detail and all_listings:
            print(f"\n{'=' * 60}")
            print("AŞAMA 2: Detay sayfalarından ek bilgi çekme")
            print(f"{'=' * 60}")
            
            detail_count = 0
            failed_count = 0
            total = len(all_listings)
            
            eta_per_item = args.detail_sleep + 1.5  # ortalama istek süresi tahmini
            estimated_minutes = (total * eta_per_item) / 60
            print(f"[*] {total} ilan için detay çekilecek. Tahmini süre: ~{estimated_minutes:.0f} dakika\n")
            
            for i, listing in enumerate(all_listings):
                url = listing.get("url", "")
                if not url or url == "N/A":
                    continue
                
                progress = f"[{i+1}/{total}]"
                print(f"{progress} Detay çekiliyor: {listing['title'][:50]}...", end=" ", flush=True)
                
                detail_html = fetch_page(session, url, retries=2, timeout=15)
                if detail_html:
                    detail_data = extract_detail_data(detail_html)
                    
                    # Liste sayfasından gelen veriyi detay verisiyle güncelle
                    for key, value in detail_data.items():
                        if value and (not listing.get(key) or listing.get(key) == ""):
                            listing[key] = value
                    
                    # Koordinat bilgisi varsa göster
                    lat = detail_data.get("latitude", "")
                    lng = detail_data.get("longitude", "")
                    coord_info = f"KOORD {lat},{lng}" if lat and lng else "KOORD yok"
                    img_info = "IMG var" if detail_data.get("image_url") else "IMG yok"
                    
                    print(f"[OK] {coord_info} {img_info}")
                    detail_count += 1
                else:
                    print("[FAIL] cekilemedi")
                    failed_count += 1
                
                # Rate limiting
                time.sleep(args.detail_sleep)
            
            print(f"\n[OK] Asama 2 tamamlandi. Basarili: {detail_count}, Basarisiz: {failed_count}")

    except KeyboardInterrupt:
        print("\n\n[!] Kullanıcı tarafından işlem durduruldu (Ctrl+C). O ana kadar toplanan veriler kaydediliyor...")
    
    # CSV'ye kaydet
    save_to_csv(all_listings, args.output)
    
    # İstatistikler
    if all_listings:
        with_image = sum(1 for l in all_listings if l.get("image_url"))
        with_coords = sum(1 for l in all_listings if l.get("latitude"))
        with_age = sum(1 for l in all_listings if l.get("building_age"))
        
        print(f"\n{'=' * 60}")
        print("İSTATİSTİKLER")
        print(f"{'=' * 60}")
        print(f"  Toplam ilan: {len(all_listings)}")
        print(f"  Resimli: {with_image} ({with_image*100//len(all_listings)}%)")
        print(f"  Koordinatlı: {with_coords} ({with_coords*100//len(all_listings)}%)")
        print(f"  Bina yaşı: {with_age} ({with_age*100//len(all_listings)}%)")


if __name__ == "__main__":
    main()
