# -*- coding: utf-8 -*-
"""
TUİK MEDAS Tam Veri Çekici  (kn=95 — Adrese Dayalı Nüfus Kayıt Sistemi Sonuçları)
================================================================================
https://biruni.tuik.gov.tr/medas/?kn=95&locale=tr

Bu site bir ZK Framework (Java, server-side) uygulamasıdır; veriyi gizli /zkau
AU istekleriyle döner ve her oturumda DOM id'leri değişir. Bu yüzden gizli API'yi
reverse-etmek yerine gerçek arayüz Selenium ile sürülür. Mekanik canlı sitede
adım adım doğrulanmıştır.

AKIŞ (her ölçü × her düzey tipi için):
  1) Göstergeler sekmesi : "Ölçüm" listesinden bir ölçü seç -> (Kırılım) Tamam
                           -> "Göstergeleri Ekle" -> İleri
  2) Zaman sekmesi       : tüm yılları seç (seçilen otomatik sağ panele taşınır)
                           -> İleri
  3) Düzey sekmesi       : düzey tipini seç (Türkiye / İBBS1 / İBBS2 / İBBS3-İl /
                           İlçe) -> tüm bölgeleri seç -> "Rapor Oluştur"
  4) Rapor sekmesi       : CSV export ikonuna bas -> pivot.csv iner

ÖNEMLİ KISIT: site, (gösterge adedi × düzey adedi × zaman adedi) çarpımını
50.000 hücreyle sınırlar. Bu yüzden tek raporda her şey seçilemez; kod her ölçüyü
ve her düzey tipini AYRI rapor olarak çeker. (En büyük kombinasyon İlçe×19 yıl
≈ 18.430 < 50.000 olduğundan parçalamaya gerek kalmaz.)

İnen pivot CSV'ler "geniş" formattadır (boru `|` ayraçlı, değerler E-notasyonu);
kod bunları "uzun/tidy" formata çevirip TEK bir CSV'de birleştirir:
    gosterge ; duzey_tipi ; bolge ; yil ; deger

Kurulum:
    pip install selenium webdriver-manager pandas

Çalıştırma:
    python tuik_medas_scraper.py

- Yarıda kesilirse tekrar çalıştırın: inen ham CSV'ler "ham_pivotlar/" altında
  saklanır ve daha önce çekilen (ölçü, düzey) kombinasyonları atlanır (resume).
"""

import os
import re
import csv
import sys
import glob
import time
import traceback

# Windows konsolunda Türkçe karakter / sembol yazarken çökmeyi önle
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import WebDriverException

try:
    from webdriver_manager.chrome import ChromeDriverManager
    _WDM = True
except ImportError:
    _WDM = False


# ============================== AYARLAR ====================================== #
URL = "https://biruni.tuik.gov.tr/medas/?kn=95&locale=tr"
BASE = os.path.abspath(os.path.dirname(__file__))

HAM_DIR    = os.path.join(BASE, "ham_pivotlar")                 # inen pivot CSV'ler
OUTPUT_CSV = os.path.join(BASE, "tuik_medas_kn95_tum_veriler.csv")  # birleşik çıktı

HEADLESS = True            # ilk denemede False yapıp izleyebilirsiniz
BEKLE    = 0.12            # her tık sonrası AU bekleme adımı (saniye)

# Çekilecek düzey (coğrafi kırılım) tipleri. "Düzey" açılır menüsündeki metinlerle
# eşleşir (büyük/küçük harf duyarsız, kısmi eşleşme). Hepsi için listeyi olduğu
# gibi bırakın; sadece il bazını isterseniz ["İl"] yazabilirsiniz.
DUZEY_TIPLERI = ["Türkiye", "İBBS1", "İBBS2", "İBBS3", "İlçe"]

# Sadece belirli ölçüleri çekmek için indeks listesi verin (ör. [0, 1, 2]).
# None = sayfadaki TÜM ölçüler.
SADECE_OLCU_INDEKSLERI = None
# =========================================================================== #


def tarayici():
    os.makedirs(HAM_DIR, exist_ok=True)
    o = Options()
    if HEADLESS:
        o.add_argument("--headless=new")
    for a in ("--window-size=1500,1200", "--no-sandbox",
              "--disable-gpu", "--disable-dev-shm-usage", "--lang=tr-TR"):
        o.add_argument(a)
    o.add_experimental_option("prefs", {
        "download.default_directory": HAM_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
    })
    drv = (webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=o)
           if _WDM else webdriver.Chrome(options=o))
    drv.set_page_load_timeout(90)
    try:
        drv.execute_cdp_cmd("Page.setDownloadBehavior",
                            {"behavior": "allow", "downloadPath": HAM_DIR})
    except Exception:
        pass
    return drv


# ----------------------------- ZK yardımcıları ----------------------------- #
def click_text(d, text, classes=("z-toolbarbutton", "z-button")):
    """İçinde 'text' geçen ilk görünür ZK butonunu/öğesini tıklar."""
    for c in classes:
        for e in d.find_elements(By.XPATH,
                f"//*[contains(@class,'{c}')][contains(normalize-space(.),'{text}')]"):
            if e.is_displayed():
                _click(d, e)
                return True
    for e in d.find_elements(By.XPATH, f"//button[contains(normalize-space(.),'{text}')]"):
        if e.is_displayed():
            _click(d, e)
            return True
    return False


def _click(d, el):
    try:
        d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        el.click()
    except WebDriverException:
        d.execute_script("arguments[0].click();", el)


def counters(d):
    """Alt bilgi şeridinden (gösterge, düzey, zaman) seçili adetlerini okur."""
    t = d.execute_script(r"""
        let res='';document.querySelectorAll('div,span,td').forEach(e=>{
          let x=(e.textContent||'');
          if(x.indexOf('zaman adedi')>=0 && x.indexOf('50000')>=0 && x.length<180){res=x;}});
        return res;""")
    g = re.search(r'gösterge adedi:\s*(\d+)', t)
    u = re.search(r'düzey adedi:\s*(\d+)',    t)
    z = re.search(r'zaman adedi:\s*(\d+)',    t)
    return (int(g.group(1)) if g else -1,
            int(u.group(1)) if u else -1,
            int(z.group(1)) if z else -1)


def source_listbox_id(d):
    """O an EN ÇOK satıra sahip görünür listbox = 'kaynak' liste (sol)."""
    best, bn = None, -1
    for lb in d.find_elements(By.CSS_SELECTOR, ".z-listbox"):
        if lb.is_displayed():
            n = len(lb.find_elements(By.CSS_SELECTOR, ".z-listitem"))
            if n > bn:
                bn, best = n, lb.get_attribute("id")
    return best, bn


def select_all_source(d, counter_idx, limit=5000):
    """
    Kaynak listenin ilk satırını, liste boşalana kadar tek tek tıklar.
    Seçilen öğe ZK tarafından otomatik 'Seçilen' paneline taşınır.
    counter_idx: 0=gösterge, 1=düzey, 2=zaman  (artışı doğrulamak için)
    """
    sid, n0 = source_listbox_id(d)
    if not sid or n0 == 0:
        return
    moved = 0
    while moved < limit:
        rows = [r for r in d.find_elements(By.CSS_SELECTOR, f"#{sid} .z-listitem")
                if r.is_displayed()]
        if not rows:
            break
        before = counters(d)[counter_idx]
        _click(d, rows[0])
        moved += 1
        for _ in range(25):                 # AU yanıtını bekle
            time.sleep(BEKLE)
            if counters(d)[counter_idx] != before:
                break


def secili_olcu_adlari(d):
    """Göstergeler sekmesindeki 'Ölçüm' listesinin satır metinlerini döndürür."""
    sid, _ = source_listbox_id(d)
    out = []
    for it in d.find_elements(By.CSS_SELECTOR, f"#{sid} .z-listitem"):
        out.append(it.text.strip())
    return sid, out


# ------------------------------ tek kombinasyon ----------------------------- #
def cek_kombinasyon(d, olcu_index, duzey_tipi):
    """Bir (ölçü, düzey tipi) raporunu oluşturup CSV indirir; inen dosya yolunu döndürür."""
    d.get(URL)
    time.sleep(7)

    # 1) Göstergeler: ölçüyü seç
    sid, adlar = secili_olcu_adlari(d)
    if olcu_index >= len(adlar):
        return None, None
    olcu_adi = adlar[olcu_index]
    rows = d.find_elements(By.CSS_SELECTOR, f"#{sid} .z-listitem")
    _click(d, rows[olcu_index])
    time.sleep(1.5)
    click_text(d, "Tamam", classes=("z-button",))      # kırılım onayı (varsa)
    time.sleep(1.2)
    click_text(d, "Göstergeleri Ekle")
    time.sleep(2)
    if counters(d)[0] < 1:
        raise RuntimeError("Gösterge eklenemedi")
    click_text(d, "İleri")
    time.sleep(3)

    # 2) Zaman: tüm yıllar
    select_all_source(d, 2)
    if counters(d)[2] < 1:
        raise RuntimeError("Zaman seçilemedi")
    click_text(d, "İleri")
    time.sleep(3)

    # 3) Düzey: tip seç + tüm bölgeler
    secildi = False
    for s in [s for s in d.find_elements(By.CSS_SELECTOR, "select") if s.is_displayed()]:
        opts = [op.text.strip() for op in s.find_elements(By.TAG_NAME, "option")]
        idx = [i for i, x in enumerate(opts) if duzey_tipi.lower() in x.lower()]
        if idx:
            Select(s).select_by_index(idx[0])
            secildi = True
            break
    if not secildi:
        raise RuntimeError(f"Düzey tipi bulunamadı: {duzey_tipi}")
    time.sleep(3)
    select_all_source(d, 1)
    if counters(d)[1] < 1:
        raise RuntimeError("Düzey/bölge seçilemedi")

    # 4) Rapor oluştur + CSV indir
    before = set(glob.glob(os.path.join(HAM_DIR, "*")))
    if not click_text(d, "Rapor Oluştur"):
        raise RuntimeError("'Rapor Oluştur' butonu yok")
    time.sleep(9)

    tiklandi = d.execute_script(r"""
        let imgs=[...document.querySelectorAll('img')]
          .filter(e=>/csv\.png/i.test(e.getAttribute('src')||'') && e.offsetParent!==null);
        if(imgs.length){let t=imgs[0];(t.closest('a,button,div,span')||t).click();return true;}
        return false;""")
    if not tiklandi:
        raise RuntimeError("CSV export ikonu bulunamadı")

    inen = _indirmeyi_bekle(before, timeout=90)
    return inen, olcu_adi


def _indirmeyi_bekle(before, timeout=90):
    son = time.time() + timeout
    while time.time() < son:
        yeni = [f for f in (set(glob.glob(os.path.join(HAM_DIR, "*"))) - before)
                if not f.endswith(".crdownload")]
        if yeni:
            time.sleep(0.5)
            return max(yeni, key=os.path.getctime)
        time.sleep(1)
    return None


# --------------------------- pivot CSV -> tidy ------------------------------ #
def _sayi(x):
    x = (x or "").strip()
    if not x or x in ("-", ".", ".."):
        return None
    try:
        f = float(x)
        return int(f) if f.is_integer() else f
    except ValueError:
        return x          # gizlilik dipnotu vb. metinleri olduğu gibi koru


def pivot_to_long(path, gosterge, duzey_tipi):
    """İnen boru-ayraçlı pivot CSV'yi uzun satırlara çevirir."""
    rows = []
    son_yil = None
    with open(path, encoding="utf-8-sig", errors="replace") as fh:
        for raw in fh:
            parts = [p.strip() for p in raw.rstrip("\n").split("|")]
            if not any(parts):
                continue
            # başlık/dipnot satırlarını ele
            yil = parts[0] if parts and re.fullmatch(r"\d{4}", parts[0]) else None
            if yil is None and son_yil is None:
                continue
            if yil:
                son_yil = yil
            bolge = parts[1] if len(parts) > 1 else ""
            deger = _sayi(parts[2]) if len(parts) > 2 else None
            if deger is None or not bolge:
                continue
            rows.append({
                "gosterge":   gosterge,
                "duzey_tipi": duzey_tipi,
                "bolge":      bolge,
                "yil":        son_yil,
                "deger":      deger,
            })
    return rows


# --------------------------------- ana akış --------------------------------- #
def main():
    os.makedirs(HAM_DIR, exist_ok=True)
    d = tarayici()
    tum_satirlar = []
    try:
        # Önce ölçü sayısını/adlarını öğren
        d.get(URL); time.sleep(7)
        _, olcu_adlari = secili_olcu_adlari(d)
        n_olcu = len(olcu_adlari)
        print(f"Toplam ölçü sayısı: {n_olcu}")
        indeksler = (SADECE_OLCU_INDEKSLERI
                     if SADECE_OLCU_INDEKSLERI is not None else range(n_olcu))

        toplam = len(list(indeksler)) * len(DUZEY_TIPLERI)
        sayac = 0
        for oi in indeksler:
            for dt in DUZEY_TIPLERI:
                sayac += 1
                etiket = f"[{sayac}/{toplam}] ölçü#{oi} '{dt}'"
                hedef = os.path.join(HAM_DIR, f"olcu{oi:02d}_{dt}.csv")
                if os.path.exists(hedef):
                    print(f"{etiket}  -> zaten var, atlanıyor")
                    tum_satirlar += pivot_to_long(hedef, olcu_adlari[oi], dt)
                    continue
                try:
                    print(f"{etiket}  -> çekiliyor...")
                    inen, adi = cek_kombinasyon(d, oi, dt)
                    if not inen:
                        print(f"   ! veri inmedi, atlandı")
                        continue
                    os.replace(inen, hedef)         # kalıcı ada taşı (resume için)
                    sat = pivot_to_long(hedef, adi, dt)
                    tum_satirlar += sat
                    print(f"   OK  {len(sat)} satir  ({adi[:45]})")
                except Exception as e:
                    print(f"   ! HATA: {e}")
                    traceback.print_exc()
                    # bir sonraki kombinasyona geç (oturum temiz get ile sıfırlanır)
                    continue
    finally:
        d.quit()

    if not tum_satirlar:
        print("\n[HATA] Hiç veri toplanamadı.")
        return
    df = pd.DataFrame(tum_satirlar).drop_duplicates()
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig", quoting=csv.QUOTE_MINIMAL)
    print(f"\nTAMAMLANDI -> {OUTPUT_CSV}")
    print(f"  Toplam satır: {len(df):,}")
    print(f"  Ölçü: {df['gosterge'].nunique()}, Düzey tipi: {df['duzey_tipi'].nunique()}, "
          f"Bölge: {df['bolge'].nunique()}, Yıl: {df['yil'].nunique()}")


if __name__ == "__main__":
    main()
