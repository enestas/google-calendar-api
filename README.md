# google-calendar-api
FullCalendar &amp; Google Calendar Senkronizasyonu

Google Calendar API kullanarak, kullanıcıların takvim etkinliklerini özel bir web uygulamasından yönetmesini nasıl sağlarız diyen geliştiriciler için bu proje çözüm olacaktır diye düşünüyorum :)

Daha önce .Net tabanlı yazmış olduğum desktop uygulamalarda google takvim senkronizasyonunu yapmıştım. Ancak web tabanlı projelerde ne yazık ki 
google'ın api dökümanları ve örnekleri yetersiz kalmış durumda. 

.Net tabanlı örnekler ile lokalinizde senkronizasyonu sağlayabilseniz dahi iş projeyi sunucuda yayınlamaya gelince herkes aynı hüsranla karşı karşıya kalıyor.  
.Net tarafında GoogleWebAuthorizationBroker.AuthorizeAsync metodunda kullanıcının client tarafından oturum açıp uygulamaya izin vermesi gerektiği için problem oluşmakta.
Bu nedenle bu işlemin aslında client tarafında yapılması gerekiyor. Google'ın dökümanlarını incelediğinizde javascript ile authanticate işlemi nasıl sağlanıyor bunun örneği var
ancak etkinlik ve takvimlerin yönetimiyle ilgili detaylıca bir javascript örneği yok. Sadece event insert için örnek var. 

Bende bu kaynak açığını kapatmak adına javascript ile kapsamlı bir Google Calendar API kullanım örneği hazırlamaya karar verdim ve ortaya bu proje çıktı. 
Bu projede oturum açıp uygulamaya erişim izni, takvimleri listeleme, takvim ekleme, düzenleme, silme, etkinlikleri listeleme, etkinlik ekleme, düzenleme ve silme işlemlerini
hazırladım. 

Scripts/googlecalendar/ klasörü altındaki javascript dosyalarını inceleyebilir ve projelerinizde kullanabilirsiniz. 
Kod üzerinde dökümantasyonunu olabildiğince anlaşılır şekilde yapmaya çalıştım umarım açıklayıcı olmuştur :)




