-- seed_images.sql
-- Scraper verisinden çekilen resimlerle properties tablosunu güncelle
-- Supabase Dashboard > SQL Editor > Run

-- Toplam: 30 ilan güncellenecek

-- İlan #19524130 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19524130/9B4AB16C0D89C5A2007AA5786FEC336B19524130.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19524130/9B4AB16C0D89C5A2007AA5786FEC336B19524130.jpg","https://imaj.emlakjet.com/listing/19524130/90AC9F328B0A9ED37193B23282EFA5DD19524130.jpg","https://imaj.emlakjet.com/listing/19524130/0002905938E5ADEBD06E3EF5D1C6D1B219524130.jpg","https://imaj.emlakjet.com/listing/19524130/BC3ACA3A1CFCAAADB5882D77E97BB58B19524130.jpg","https://imaj.emlakjet.com/listing/19524130/75629308CCD52EF50C3E27D67E93BC3A19524130.jpg","https://imaj.emlakjet.com/listing/19524130/16D2AF27176C1477116FA6148DFB0D4619524130.jpg","https://imaj.emlakjet.com/listing/19524130/D6AA0DD3763B589B540538AB4C3F250E19524130.jpg","https://imaj.emlakjet.com/listing/19524130/C491AFD0B5D631E468A78A0E274A1F3519524130.jpg","https://imaj.emlakjet.com/listing/19524130/F23E9E6A856EF60DCCD1F606A828184419524130.jpg"}'::text[]
WHERE description LIKE '%-19524130'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19524128 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19524128/BF05E5846DBE07DE489A578A6564AE8119524128.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19524128/BF05E5846DBE07DE489A578A6564AE8119524128.jpg","https://imaj.emlakjet.com/listing/19524128/7D84406860F90766FFD587D8BEBC544819524128.jpg","https://imaj.emlakjet.com/listing/19524128/778F6AE72EEC7A326F4CB7E6291155B219524128.jpg","https://imaj.emlakjet.com/listing/19524128/19E629E2CF87FD9D7ABA5AC6A7B3470D19524128.jpg","https://imaj.emlakjet.com/listing/19524128/D2A46213C06FD1F6005AF50D138259DB19524128.jpg","https://imaj.emlakjet.com/listing/19524128/9488D04779042DD8018D16F55F15538A19524128.jpg","https://imaj.emlakjet.com/listing/19524128/306C3E70F0FAF69C0B56980226441F3B19524128.jpg","https://imaj.emlakjet.com/listing/19524128/691A0D364AB761FBB90B2EA59A5BD68419524128.jpg","https://imaj.emlakjet.com/listing/19524128/EB9A86A2C7139EDD7886811AD2EB5B7F19524128.jpg"}'::text[]
WHERE description LIKE '%-19524128'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19518260 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19518260/87C6A463A90B33E13A08E2E610BA1E2619518260.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19518260/87C6A463A90B33E13A08E2E610BA1E2619518260.jpg","https://imaj.emlakjet.com/listing/19518260/75F9551864126E618D13612A8EBE7F5319518260.jpg","https://imaj.emlakjet.com/listing/19518260/7A7EB745287CB2EAEA19C2A70ACF0CA919518260.jpg","https://imaj.emlakjet.com/listing/19518260/90242CD1F46B37D7F8ABA4C6D7B8DFE719518260.jpg","https://imaj.emlakjet.com/listing/19518260/EA85F5A3244289543253F24D0DBCE27219518260.jpg","https://imaj.emlakjet.com/listing/19518260/8BA64B57DF7AB228CE15B38B366EB29019518260.jpg","https://imaj.emlakjet.com/listing/19518260/2FBF284E766F6559EC3F6522A26897E619518260.jpg","https://imaj.emlakjet.com/listing/19518260/5BA519E3AC19922EDE1D631587C3CFC319518260.jpg","https://imaj.emlakjet.com/listing/19518260/5568F3B6D70EC802258C3B78171CCF1419518260.jpg"}'::text[]
WHERE description LIKE '%-19518260'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19515117 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19515117/8C698CF8A02D855D1A23D970D4245BA419515117.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19515117/8C698CF8A02D855D1A23D970D4245BA419515117.jpg","https://imaj.emlakjet.com/listing/19515117/6077B20F631106B85D0E8037AC8292E819515117.jpg","https://imaj.emlakjet.com/listing/19515117/CCBDE6E82E5E694FE31A27C8B8C7EAFC19515117.jpg","https://imaj.emlakjet.com/listing/19515117/1BF4B25CC9553D1C57A12EAD973A4AAF19515117.jpg","https://imaj.emlakjet.com/listing/19515117/D36CE7A5E1C958F4398605A3CC306E7B19515117.jpg","https://imaj.emlakjet.com/listing/19515117/27F7C035BA388D038E178E62D75DAAF119515117.jpg","https://imaj.emlakjet.com/listing/19515117/11DBF19966A254F107243972F85057D919515117.jpg","https://imaj.emlakjet.com/listing/19515117/B8F811EC27F6D4DDFB574D927EA22D4119515117.jpg","https://imaj.emlakjet.com/listing/19515117/C44DD76B9D5B7BC46A3187D7315BC1B819515117.jpg"}'::text[]
WHERE description LIKE '%-19515117'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19514209 (7 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19514209/939D870B434CBE172BDA2BF4B9E531A319514209.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19514209/939D870B434CBE172BDA2BF4B9E531A319514209.jpg","https://imaj.emlakjet.com/listing/19514209/2F8B1FE737C978599DB6063AFB1B6EFB19514209.jpg","https://imaj.emlakjet.com/listing/19514209/9BCC086B0BF0A1403814C7D18AF7488C19514209.jpg","https://imaj.emlakjet.com/listing/19514209/C057DBC8A08A0A754045039FB67625A519514209.jpg","https://imaj.emlakjet.com/listing/19514209/276D7D1AD1E3CDA9A5F4B1825A24E88219514209.jpg","https://imaj.emlakjet.com/listing/19514209/D4313C2A09F120C89FF11EF558A92DDD19514209.jpg","https://imaj.emlakjet.com/listing/19514209/D48246E196BFE730BF64273F4113FC9C19514209.jpg"}'::text[]
WHERE description LIKE '%-19514209'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19510635 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19510635/95AB064971DDE46E038F2504E1DB06C919510635.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19510635/95AB064971DDE46E038F2504E1DB06C919510635.jpg","https://imaj.emlakjet.com/listing/19510635/2593214555474615BDB9F1569062811319510635.jpg","https://imaj.emlakjet.com/listing/19510635/0486B4D22ABFA81F1825A4764C3A9A8719510635.jpg","https://imaj.emlakjet.com/listing/19510635/57924F1F5652E2E58B788C5492089FBF19510635.jpg","https://imaj.emlakjet.com/listing/19510635/D399C9C61E605A46C7E3160D51ED6BA019510635.jpg","https://imaj.emlakjet.com/listing/19510635/0653EED1D5F1545252243D9687DCB4D219510635.jpg","https://imaj.emlakjet.com/listing/19510635/D2C7644F77C8E8B1E71AFBC22B2852EE19510635.jpg","https://imaj.emlakjet.com/listing/19510635/EF247A8D864560664A693E30DF30FC1619510635.jpg","https://imaj.emlakjet.com/listing/19510635/3293E044C7A06CE4608BF293E766133519510635.jpg"}'::text[]
WHERE description LIKE '%-19510635'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19509731 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19509731/8D33F6912083CC56CE6796AA33F7EB0219509731.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19509731/8D33F6912083CC56CE6796AA33F7EB0219509731.jpg","https://imaj.emlakjet.com/listing/19509731/8077F2708CA74B30782CADC5D6BBFDC619509731.jpg","https://imaj.emlakjet.com/listing/19509731/12D88242D729FDED735F0EFF556CA78219509731.jpg","https://imaj.emlakjet.com/listing/19509731/8CB69BA62A2EAD5D63A18C556A60820219509731.jpg","https://imaj.emlakjet.com/listing/19509731/797F17AEEBB5D38CCD5DA397DF60290A19509731.jpg","https://imaj.emlakjet.com/listing/19509731/4906B72D8C5FE543831D2F4989C216DF19509731.jpg","https://imaj.emlakjet.com/listing/19509731/D5D6F7F3067445384E3D093FAD4A3CFB19509731.jpg","https://imaj.emlakjet.com/listing/19509731/F541037B35C2BBD2808E90976AA7CD4C19509731.jpg","https://imaj.emlakjet.com/listing/19509731/19CF878C505B41EEA036828FBE95AEFE19509731.jpg"}'::text[]
WHERE description LIKE '%-19509731'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19509334 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19509334/B5D265B94176206569C53B6E6826CE5619509334.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19509334/B5D265B94176206569C53B6E6826CE5619509334.jpg","https://imaj.emlakjet.com/listing/19509334/085E2674E153791389927E08A3719C9F19509334.jpg","https://imaj.emlakjet.com/listing/19509334/2F33CAB10F34218CFBA42057BBD8EA3D19509334.jpg","https://imaj.emlakjet.com/listing/19509334/5A0D725DFE45019BDA311D07206B292119509334.jpg","https://imaj.emlakjet.com/listing/19509334/52F1D32D212957143BA108CD51A0FA2619509334.jpg","https://imaj.emlakjet.com/listing/19509334/B5DD399FAEC819ACA22944FC3994785E19509334.jpg","https://imaj.emlakjet.com/listing/19509334/3288F66D4155C01708E469A33B5C6D4E19509334.jpg","https://imaj.emlakjet.com/listing/19509334/FC83593C8C85D1F31A209439200B6FB519509334.jpg","https://imaj.emlakjet.com/listing/19509334/69475AC29369B81653765F3F3A651C9019509334.jpg"}'::text[]
WHERE description LIKE '%-19509334'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19503873 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19503873/10F35098AA7E357DBF768703BCB996A419503873.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19503873/10F35098AA7E357DBF768703BCB996A419503873.jpg","https://imaj.emlakjet.com/listing/19503873/139FBB3E0ADE26473E87B716EC697C1019503873.jpg","https://imaj.emlakjet.com/listing/19503873/1FD07CFE7C6CD69E932D288F23BF630219503873.jpg","https://imaj.emlakjet.com/listing/19503873/ADDD4980594F68638FD4843ABADC262619503873.jpg","https://imaj.emlakjet.com/listing/19503873/A9C0EA4310851EDEAD37EF88E8AF385119503873.jpg","https://imaj.emlakjet.com/listing/19503873/B0F82E38A70521585082853DB9BBCEDB19503873.jpg","https://imaj.emlakjet.com/listing/19503873/B9E466C7DB016BA0B3F8B2CF407ACF0919503873.jpg","https://imaj.emlakjet.com/listing/19503873/E2DC8C81E91921CA108ABA36F1B5C25919503873.jpg","https://imaj.emlakjet.com/listing/19503873/0DD5ABCC7E622C8B0CA5B20A51CB3F6919503873.jpg"}'::text[]
WHERE description LIKE '%-19503873'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19502964 (6 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19502964/46937E3FFD369BF287141FB198E04E7A19502964.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19502964/46937E3FFD369BF287141FB198E04E7A19502964.jpg","https://imaj.emlakjet.com/listing/19502964/FC61B7DA5A41D2F22E8CE6919F7E65DC19502964.jpg","https://imaj.emlakjet.com/listing/19502964/E2DF5007FF18D03A33883505CC37BEFB19502964.jpg","https://imaj.emlakjet.com/listing/19502964/DDE89C9104A4A6A03DA4BEFFA3E2A8CC19502964.jpg","https://imaj.emlakjet.com/listing/19502964/3E115DDBA73AB1B50BF8FAE8ECF8B53B19502964.jpg","https://imaj.emlakjet.com/listing/19502964/EB7F52435F5A8E68B17239F7E0945DC519502964.jpg"}'::text[]
WHERE description LIKE '%-19502964'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19502653 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19502653/64B528FB46D4B3A7A6D2359E8265636219502653.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19502653/64B528FB46D4B3A7A6D2359E8265636219502653.jpg","https://imaj.emlakjet.com/listing/19502653/624DBAD20674F83F6A57D0A721931B1719502653.jpg","https://imaj.emlakjet.com/listing/19502653/1138E88342AC997FA5A6398EC525C44B19502653.jpg","https://imaj.emlakjet.com/listing/19502653/559A6EB5EA0312205A85C5A57160375919502653.jpg","https://imaj.emlakjet.com/listing/19502653/3EB319350293492BF6C1AD94BFF2053B19502653.jpg","https://imaj.emlakjet.com/listing/19502653/2B947E51528A6B025DB62D0F5D66904019502653.jpg","https://imaj.emlakjet.com/listing/19502653/03A8BE55189B549FC37334F101FF5BC619502653.jpg","https://imaj.emlakjet.com/listing/19502653/189222CC7F90C57628E38AC3A0F5203719502653.jpg","https://imaj.emlakjet.com/listing/19502653/D7AD1CD8DD7AA4E3974731356675C75A19502653.jpg"}'::text[]
WHERE description LIKE '%-19502653'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19501632 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19501632/39139C778C1139D7D23A04C12747E28119501632.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19501632/39139C778C1139D7D23A04C12747E28119501632.jpg","https://imaj.emlakjet.com/listing/19501632/1C8BC19FC85E3758E4733AE7E396C96019501632.jpg","https://imaj.emlakjet.com/listing/19501632/5DF588F0DDE8621F43E833E8309ABC6F19501632.jpg","https://imaj.emlakjet.com/listing/19501632/19F271BBAE35CA8D3F2A5852F40AC0A319501632.jpg","https://imaj.emlakjet.com/listing/19501632/3FDF5BCFA13C58BBE5265244A5DBC40719501632.jpg","https://imaj.emlakjet.com/listing/19501632/1BB0DD1399B93F39288905CA783EB86819501632.jpg","https://imaj.emlakjet.com/listing/19501632/B4C8BF52D552ED3A0B0DC27A5F679CC719501632.jpg","https://imaj.emlakjet.com/listing/19501632/66EDEA209E1E2C082FF4244B7DA68E5419501632.jpg","https://imaj.emlakjet.com/listing/19501632/D37EA003CC4217BA02984DFA42A50C2519501632.jpg"}'::text[]
WHERE description LIKE '%-19501632'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19501423 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19501423/8FD1D5ECE78CBBF3DBDA7DCF3A05A7B919501423.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19501423/8FD1D5ECE78CBBF3DBDA7DCF3A05A7B919501423.jpg","https://imaj.emlakjet.com/listing/19501423/0E91DFC135A96C247D333008B8413A2E19501423.jpg","https://imaj.emlakjet.com/listing/19501423/2949EB8EA438DD623C8D89DE5D6D469519501423.jpg","https://imaj.emlakjet.com/listing/19501423/4F72E0622E50A5678151DC6DED9C6B3519501423.jpg","https://imaj.emlakjet.com/listing/19501423/4B668EAA9B7B9DCFDFECAB5EDB14B2C919501423.jpg","https://imaj.emlakjet.com/listing/19501423/AE44F338032BEAA282710D9BE98AB62319501423.jpg","https://imaj.emlakjet.com/listing/19501423/F2F9990D31397E4B0D168F12B596A3AA19501423.jpg","https://imaj.emlakjet.com/listing/19501423/26AA554649D121463045F82658226DB619501423.jpg","https://imaj.emlakjet.com/listing/19501423/4FEA49096751629A30915469A9341ACF19501423.jpg"}'::text[]
WHERE description LIKE '%-19501423'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19498340 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19498340/7021BA2F3EA9539E0F54CE38DBE0566119498340.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19498340/7021BA2F3EA9539E0F54CE38DBE0566119498340.jpg","https://imaj.emlakjet.com/listing/19498340/C07E0A9D4CF0B9EB923EF5FDA1E15BC519498340.jpg","https://imaj.emlakjet.com/listing/19498340/0EDFC2C223F8F36727FC68F300A7469519498340.jpg","https://imaj.emlakjet.com/listing/19498340/0C3D07E3DC34D4DCF8FE6B3F0ED2C1FE19498340.jpg","https://imaj.emlakjet.com/listing/19498340/D822B921797A0F04856483712A24CC1519498340.jpg","https://imaj.emlakjet.com/listing/19498340/849F3AF5F8D3B82D1F211EB545A1160319498340.jpg","https://imaj.emlakjet.com/listing/19498340/57F2FD1DDFE60E498031614C2CAC69BE19498340.jpg","https://imaj.emlakjet.com/listing/19498340/BCC424463269796C65167C394506AF1219498340.jpg","https://imaj.emlakjet.com/listing/19498340/C73A82C76AFAE515C9C30888548A2A1119498340.jpg"}'::text[]
WHERE description LIKE '%-19498340'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19497028 (6 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19497028/77DE387C65A0979166EA4CA8BEE9788C19497028.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19497028/77DE387C65A0979166EA4CA8BEE9788C19497028.jpg","https://imaj.emlakjet.com/listing/19497028/AA0FCA1E09E980B17D4B79C224C7BEC319497028.jpg","https://imaj.emlakjet.com/listing/19497028/37B6924520AC9E0C1F5DF893298B640719497028.jpg","https://imaj.emlakjet.com/listing/19497028/C33A92F5EE0971AD4D89D9E53422F97B19497028.jpg","https://imaj.emlakjet.com/listing/19497028/FDE6B251497EE28E05C3D3336583C29519497028.jpg","https://imaj.emlakjet.com/listing/19497028/B85CB1B7BC72579F73B256C1325166D919497028.jpg"}'::text[]
WHERE description LIKE '%-19497028'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19496898 (6 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19496898/30516B00842C32D0ABA46B86E69A038019496898.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19496898/30516B00842C32D0ABA46B86E69A038019496898.jpg","https://imaj.emlakjet.com/listing/19496898/E1E270431BFF9F48DF0640CE14231F7219496898.jpg","https://imaj.emlakjet.com/listing/19496898/4A4721AA09794004FE6936F8B57D990719496898.jpg","https://imaj.emlakjet.com/listing/19496898/4899ADCADF3655E8554B70ADC4F52DF019496898.jpg","https://imaj.emlakjet.com/listing/19496898/EE81C278C8727AE845A13504743447EE19496898.jpg","https://imaj.emlakjet.com/listing/19496898/F1550D1297188D7F1AC4FC49BBD22D7D19496898.jpg"}'::text[]
WHERE description LIKE '%-19496898'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19496750 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19496750/F3CCDD27D2000E3F9255A7E3E2C4880019496750.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19496750/F3CCDD27D2000E3F9255A7E3E2C4880019496750.jpg","https://imaj.emlakjet.com/listing/19496750/156005C5BAF40FF51A327F1C34F2975B19496750.jpg","https://imaj.emlakjet.com/listing/19496750/CC00910B41506963B3B4E63BDC72176419496750.jpg","https://imaj.emlakjet.com/listing/19496750/6DC448CB0776B6A871F44680F8C450CD19496750.jpg","https://imaj.emlakjet.com/listing/19496750/1BFBB251899C94ED7CDF0F9BAFCD2DA519496750.jpg","https://imaj.emlakjet.com/listing/19496750/55D7E755CE7DEA2AA2425D2573FC4D3819496750.jpg","https://imaj.emlakjet.com/listing/19496750/BACF7A84E7A57A9CD7863362F31DA0D819496750.jpg","https://imaj.emlakjet.com/listing/19496750/307B09AF6BBC89D1991A91927C384B3B19496750.jpg","https://imaj.emlakjet.com/listing/19496750/E38A9F0E3F9AB5428C0A24B6B59E038119496750.jpg"}'::text[]
WHERE description LIKE '%-19496750'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19494244 (8 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19494244/FADF4578160932648FC784D4AC60168019494244.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19494244/FADF4578160932648FC784D4AC60168019494244.jpg","https://imaj.emlakjet.com/listing/19494244/5168DE6615D371E8B680736FA8AC683219494244.jpg","https://imaj.emlakjet.com/listing/19494244/522332264CC4F5B5810B42E631CFB51019494244.jpg","https://imaj.emlakjet.com/listing/19494244/0536986A49A5E663966C27A9F2FD78FF19494244.jpg","https://imaj.emlakjet.com/listing/19494244/61519D69400EA14F50E1D6F80E3165DF19494244.jpg","https://imaj.emlakjet.com/listing/19494244/61C3E1422CDED9C5FBBBC833C7432B0119494244.jpg","https://imaj.emlakjet.com/listing/19494244/58127D2E7958F59E7F5A0F8E05D788FB19494244.jpg","https://imaj.emlakjet.com/listing/19494244/AEB2CEC32A91009D75EF1FC45965D7F719494244.jpg"}'::text[]
WHERE description LIKE '%-19494244'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19494243 (3 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19494243/1815DBDF7371B67CBD288E47B725FD6F19494243.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19494243/1815DBDF7371B67CBD288E47B725FD6F19494243.jpg","https://imaj.emlakjet.com/listing/19494243/BE5CE1F506221E045FF36384C68536DB19494243.jpg","https://imaj.emlakjet.com/listing/19494243/8E6E15FE36B6CDD763146AD393EB009519494243.jpg"}'::text[]
WHERE description LIKE '%-19494243'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19494238 (7 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19494238/57AA556D161CC0752B21E8361DA7EB4A19494238.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19494238/57AA556D161CC0752B21E8361DA7EB4A19494238.jpg","https://imaj.emlakjet.com/listing/19494238/A88308726AF2B971AE2369C47A20D32119494238.jpg","https://imaj.emlakjet.com/listing/19494238/811A9B8AF0C1F5B2FC30F45206D9E2D719494238.jpg","https://imaj.emlakjet.com/listing/19494238/9314CF2B4A91CCC43B25B3FF43F35FC919494238.jpg","https://imaj.emlakjet.com/listing/19494238/E62C0AED916AD0521FB282E3B52B717019494238.jpg","https://imaj.emlakjet.com/listing/19494238/EAD61B194748F640C07DE3A6FB4A303D19494238.jpg","https://imaj.emlakjet.com/listing/19494238/18698F03083A6CD59F7284AA186BDCC419494238.jpg"}'::text[]
WHERE description LIKE '%-19494238'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19494235 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19494235/191F7921EFD450CA2E643EA0BE1F414B19494235.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19494235/191F7921EFD450CA2E643EA0BE1F414B19494235.jpg","https://imaj.emlakjet.com/listing/19494235/0272A99E799BBCD46C81414A67DB527219494235.jpg","https://imaj.emlakjet.com/listing/19494235/3017C924BEB85101F3F800A2B95A98E519494235.jpg","https://imaj.emlakjet.com/listing/19494235/FDC576D3C873B76C5E985B41F203397B19494235.jpg","https://imaj.emlakjet.com/listing/19494235/65D07C07C09CF13230A77D0A8AEDB94519494235.jpg","https://imaj.emlakjet.com/listing/19494235/DF93E63A15C98B1508CAD95636FFA03119494235.jpg","https://imaj.emlakjet.com/listing/19494235/6AC3693558E7671C4421850DEA79F1BE19494235.jpg","https://imaj.emlakjet.com/listing/19494235/1F10F3A9C4B1C43636F93D7F87C1664A19494235.jpg","https://imaj.emlakjet.com/listing/19494235/34E47B71EA3EB62E6C27F491A776BDFF19494235.jpg"}'::text[]
WHERE description LIKE '%-19494235'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19494230 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19494230/E88E2CA6CCA8469BC73368040F4712C919494230.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19494230/E88E2CA6CCA8469BC73368040F4712C919494230.jpg","https://imaj.emlakjet.com/listing/19494230/07EF4C1F9197411BA0BB8A534BDD160519494230.jpg","https://imaj.emlakjet.com/listing/19494230/AC1A8DDD0927088D09DAEDCBE37E68FF19494230.jpg","https://imaj.emlakjet.com/listing/19494230/4DF2F8192A8E174D1F4B92BB0847DD4419494230.jpg","https://imaj.emlakjet.com/listing/19494230/DB9431459A04B55778AE650343F8637A19494230.jpg","https://imaj.emlakjet.com/listing/19494230/6B26D2D60CFD60477A04A4353B26DC1819494230.jpg","https://imaj.emlakjet.com/listing/19494230/4F3552CB34957EC9C29ABA550A3A264219494230.jpg","https://imaj.emlakjet.com/listing/19494230/3BA9074D4746EB4C34C47AB49B83DAF519494230.jpg","https://imaj.emlakjet.com/listing/19494230/D93A294DE1994064DB37D1122DBB30E219494230.jpg"}'::text[]
WHERE description LIKE '%-19494230'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19482676 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19482676/E09CE2C14BD526B690B1A7A80E38697C19482676.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19482676/E09CE2C14BD526B690B1A7A80E38697C19482676.jpg","https://imaj.emlakjet.com/listing/19482676/C6C2016D304D75EE196C0324373B9A9219482676.jpg","https://imaj.emlakjet.com/listing/19482676/3A47E76A0001CEEB22FA8A001DC01C5819482676.jpg","https://imaj.emlakjet.com/listing/19482676/EBFA492409E7CE876000FDFA0368760119482676.jpg","https://imaj.emlakjet.com/listing/19482676/7D73C8C8B74D9F0855DCD260EE2B601319482676.jpg","https://imaj.emlakjet.com/listing/19482676/FC53699DA899DC3D476BDDF8E79A470019482676.jpg","https://imaj.emlakjet.com/listing/19482676/188D19C55A1D38E59435CA5CB4465A0719482676.jpg","https://imaj.emlakjet.com/listing/19482676/07DD93B06980CDBE786EE192F1501AA619482676.jpg","https://imaj.emlakjet.com/listing/19482676/E78D9DA73FAC80235B2F112D13C1ECE719482676.jpg"}'::text[]
WHERE description LIKE '%-19482676'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19480789 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19480789/126DA2684D323495032BF549A6B26A7619480789.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19480789/126DA2684D323495032BF549A6B26A7619480789.jpg","https://imaj.emlakjet.com/listing/19480789/73B121AEF5FE95F45B64BCCBB272CC4E19480789.jpg","https://imaj.emlakjet.com/listing/19480789/39766AA60BA5D1525824C1BFB76C35CF19480789.jpg","https://imaj.emlakjet.com/listing/19480789/65A1F137AEEF4FF998CD1E0848730E5819480789.jpg","https://imaj.emlakjet.com/listing/19480789/17ED38A4610C2ECE2B2F5C1B3CF2605B19480789.jpg","https://imaj.emlakjet.com/listing/19480789/87D419DF42940188B9BB0AD2173C941E19480789.jpg","https://imaj.emlakjet.com/listing/19480789/AF91EED5475C74C84A5BDC993FD668A419480789.jpg","https://imaj.emlakjet.com/listing/19480789/C3F0B47164A6B7F926FDAA8624959D7119480789.jpg","https://imaj.emlakjet.com/listing/19480789/F304A8277C784CE5AF9C8DED0A47C93C19480789.jpg"}'::text[]
WHERE description LIKE '%-19480789'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19479584 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19479584/022C14C5AC6C5F0B31802138CD6E6E4619479584.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19479584/022C14C5AC6C5F0B31802138CD6E6E4619479584.jpg","https://imaj.emlakjet.com/listing/19479584/4E1393C25321BA7F3F0A10244760093819479584.jpg","https://imaj.emlakjet.com/listing/19479584/4071BC7CE718343C3B104AC14038B7E319479584.jpg","https://imaj.emlakjet.com/listing/19479584/1C9ACFB0CC15D7EDE7D516641944FF0319479584.jpg","https://imaj.emlakjet.com/listing/19479584/5C8188A233001818EE6BE97A6CA88EE519479584.jpg","https://imaj.emlakjet.com/listing/19479584/18869E5A5584BB6C8A1ADDBCCD1E900819479584.jpg","https://imaj.emlakjet.com/listing/19479584/97E53899FDAEA7E3DCE911322C1A0BB419479584.jpg","https://imaj.emlakjet.com/listing/19479584/C0C886B5CBC63EEBD3A502F367495E6519479584.jpg","https://imaj.emlakjet.com/listing/19479584/4E95F0FF6DFE3B86A332167B4FCCF40619479584.jpg"}'::text[]
WHERE description LIKE '%-19479584'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19477219 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19477219/EBAC958F43E4AB4054C811F6617BB8AD19477219.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19477219/EBAC958F43E4AB4054C811F6617BB8AD19477219.jpg","https://imaj.emlakjet.com/listing/19477219/6D3968B284285B1C768DE3A71B56BB2C19477219.jpg","https://imaj.emlakjet.com/listing/19477219/CA2D8D0055875E2CD8319C0009000C8219477219.jpg","https://imaj.emlakjet.com/listing/19477219/A59B3672D9E23C34204651033E3BD9D419477219.jpg","https://imaj.emlakjet.com/listing/19477219/32420F1A7A076E38CBBB12AED318D41519477219.jpg","https://imaj.emlakjet.com/listing/19477219/9434366EF84BEC84F9ED138E1DA9536B19477219.jpg","https://imaj.emlakjet.com/listing/19477219/33DFED7ABC11875AF20255E559E0DE9E19477219.jpg","https://imaj.emlakjet.com/listing/19477219/39608FB445DE548436D6826C9704390319477219.jpg","https://imaj.emlakjet.com/listing/19477219/7D7548A904B83D52BD279EE3FF220EC819477219.jpg"}'::text[]
WHERE description LIKE '%-19477219'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19477155 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19477155/4A0B9A8AE623937925F469BA7158B6D219477155.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19477155/4A0B9A8AE623937925F469BA7158B6D219477155.jpg","https://imaj.emlakjet.com/listing/19477155/FC8E8D8C3E464992B48BABB4587861B019477155.jpg","https://imaj.emlakjet.com/listing/19477155/56384508BA5297A0968EB0E37E7C35DA19477155.jpg","https://imaj.emlakjet.com/listing/19477155/F52D08A56959FDEB4EFE1FC2D74754FD19477155.jpg","https://imaj.emlakjet.com/listing/19477155/30C7DA186634E6FE242905C98635AEE519477155.jpg","https://imaj.emlakjet.com/listing/19477155/91F37C145B89B19398405267897BD9C419477155.jpg","https://imaj.emlakjet.com/listing/19477155/CAEB9B1E02D040C5AB3640B8D091127F19477155.jpg","https://imaj.emlakjet.com/listing/19477155/904EE38B052D7CE134F1C2FF12EE74EA19477155.jpg","https://imaj.emlakjet.com/listing/19477155/AF9F9DD15F3AF9A0963867645570AB1819477155.jpg"}'::text[]
WHERE description LIKE '%-19477155'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19473828 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19473828/5C9E5D3D17EAC65F7C8BB74CB41F24E019473828.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19473828/5C9E5D3D17EAC65F7C8BB74CB41F24E019473828.jpg","https://imaj.emlakjet.com/listing/19473828/DF9F2F381EC4C7EE82144D3E34BA7FFF19473828.jpg","https://imaj.emlakjet.com/listing/19473828/50C9263294A30914F47219D11538EE6B19473828.jpg","https://imaj.emlakjet.com/listing/19473828/387E8A50E3AE88B87DE616183B76BBE819473828.jpg","https://imaj.emlakjet.com/listing/19473828/9E60ED35AA22D6998E5B4281A1CF913C19473828.jpg","https://imaj.emlakjet.com/listing/19473828/7EF3AD836119E00518897F622B7B7F2C19473828.jpg","https://imaj.emlakjet.com/listing/19473828/952D82C420C02319FDE47216DE78597619473828.jpg","https://imaj.emlakjet.com/listing/19473828/55E7463DB118EDAFB86C506A4911315919473828.jpg","https://imaj.emlakjet.com/listing/19473828/167C6193EBBB806873EC8F0A72B927FD19473828.jpg"}'::text[]
WHERE description LIKE '%-19473828'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19469876 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19469876/2DD2DC878EDA9BC4C2481BFA75BA6ED719469876.jpg', all_images = '{"https://imaj.emlakjet.com/listing/19469876/2DD2DC878EDA9BC4C2481BFA75BA6ED719469876.jpg","https://imaj.emlakjet.com/listing/19469876/54993849216A18397DD77861FED91FC619469876.jpg","https://imaj.emlakjet.com/listing/19469876/45F62A90D2C2202F011BFB072B38F86919469876.jpg","https://imaj.emlakjet.com/listing/19469876/2166BCED6543F50E1E688DA697F3C83019469876.jpg","https://imaj.emlakjet.com/listing/19469876/A32637937BE2A03728B9C73EA6CE200A19469876.jpg","https://imaj.emlakjet.com/listing/19469876/E0F935E7F6E3EE304856328470ED562919469876.jpg","https://imaj.emlakjet.com/listing/19469876/07FB5DF08FFA1B022E1BF26FB46FF4AD19469876.jpg","https://imaj.emlakjet.com/listing/19469876/0A00B48FA99488F5B6ACFEC3D24B119019469876.jpg","https://imaj.emlakjet.com/listing/19469876/EF3FC56BA50982B1DC499F2DECBC94D919469876.jpg"}'::text[]
WHERE description LIKE '%-19469876'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İlan #19469465 (9 resim)
UPDATE public.properties
SET img = 'https://imaj.emlakjet.com/listing/19469465/4E45FA443F11D1116A1214ACF949A33019469465.jpeg', all_images = '{"https://imaj.emlakjet.com/listing/19469465/4E45FA443F11D1116A1214ACF949A33019469465.jpeg","https://imaj.emlakjet.com/listing/19469465/68AB1F2EC2BC540E9BD2C63CC3EF29E919469465.jpeg","https://imaj.emlakjet.com/listing/19469465/8D6DD18CC5585077AD0C48DBC6F8D2E719469465.jpeg","https://imaj.emlakjet.com/listing/19469465/88D3F387A386A796150C00894A8DFC5A19469465.jpeg","https://imaj.emlakjet.com/listing/19469465/A2A682643BB2EAA1C6C369C52E74D28819469465.jpeg","https://imaj.emlakjet.com/listing/19469465/6335662F6515671B9DA478CAB3E3F17B19469465.jpeg","https://imaj.emlakjet.com/listing/19469465/138E61AD57B0B66378646843F933F0DE19469465.jpeg","https://imaj.emlakjet.com/listing/19469465/0ACC4502FCE8EE0ECF87B85053175E5419469465.jpeg","https://imaj.emlakjet.com/listing/19469465/423BCECDD060DFA30CB57E0BC2C429F219469465.jpeg"}'::text[]
WHERE description LIKE '%-19469465'
  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');

-- İşlem tamamlandı
-- Toplam: 30 ilan güncellendi
