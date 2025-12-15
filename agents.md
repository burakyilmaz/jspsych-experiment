# Proje Amacı

Bu proje, tez çalışması için geliştirilen bir deney uygulamasıdır. Katılımcıların dilsel (linguistic) ve görsel (visual) yeteneklerini test etmek amacıyla iki farklı test türü içerir.

## Test Türleri

- **Linguistic Test**: Dilsel uyaranlar ve görevler içeren test.
- **Visual Test**: Görsel uyaranlar ve görevler içeren test.

Katılımcıların hangi teste gireceği, araştırmacılar tarafından önceden belirlenir. Bazı katılımcılara linguistic test, bazılarına ise visual test gönderilir.

## Linguistic Test Detayları

Bu testte, bir katılımcı bizim önceden belirlediğimiz x adet cümle arasından y adet cümle görecek arka arkaya. Bir cümle ekrana geldikten sonra örneğin 3 saniye gibi bir süre ekranda kalmalı ki katılımcının okuduğundan emin olalım. Bu sayılar bizim tarafımızdan parametre olarak belirlenecek. Her katılımcının gördüğü cümleler random olarak belirlenecek.

Katılımcı cümlelerin hepsini okuduktan sonra test kısmına geçecek. Burada da gördüğü cümlelerdeki fiillerin çekimlerini doğru hatırlıyor mu bunu test edeceğiz. Örneğin:

"Gülten güzel bir ağaç ..."
çizdi veya çizmiş olarak gösterilecek "..." üç nokta yerine yani bazı katılımcılar "Gülten güzel bir ağaç çizdi" olarak görürken bazıları "Gülten güzel bir ağaç çizmiş" olarak görebilir. Bu da random belirlenecek. Her bir katılımcı için hangi versiyonu gördü ise o doğru cevap olarak kabul edilecek. Çünkü test kısmında üç nokta vereceğiz ve şıklarda hem çizdi hem de çizmiş olarak göstereceğiz.

Bir de tuzak sorular olacak. Bunlar da daha önce study kısmında katılımcıya gösterilmeyen cümleler olacak. Bu sayede kullanıcının hafıza iyi çalışıyor mu bunu test etmiş olacağız. Bu tuzak cümlelerdeki doğru cevap "Yeni Cümle" seçeneği olarak kabul edilecek. Bu tuzak soru oranı %50 olarak belirlenecek. Yani katılımcıya study esnasında y adet cümle gösterdiysek test kısmında y/2 adet tuzak cümle, y/2 adet daha önce gördüğü cümle gösterilecek. y değeri her zaman çift sayı olmalı bu yüzden.