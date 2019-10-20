
/** google developer console'dan oluşturduğunuz Client ID */
ClientID = '';
/** google developer console'dan oluşturduğunuz API KEY */
ApiKey = '';

DiscoverDocs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

/** kullanılacak api */
Scopes = 'https://www.googleapis.com/auth/calendar';

/** google calendar api init işlemi (sayfa load edildikten sonra çalışır) */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/** google calendar api init işlemi (sayfa load edildikten sonra handleClientLoad fonksiyonunda çağırılır)
 * daha önce izin verilip verilmediğini dinler, izin verilmemişse izin ister
 * */
function initClient() {
    gapi.client.init({
        apiKey: ApiKey,
        clientId: ClientID,
        discoveryDocs: DiscoverDocs,
        scope: Scopes
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        if (!GoogleCalendarAPI.isSignedIn) {
            gapi.auth2.getAuthInstance().signIn();
        }
    },
        function (error) {
            updateSigninStatus(false);
            console.log(JSON.stringify(error, null, 2));
        });
}

/**
 * google hesabından calendar izni verildi mi
 * @param {boolean} isSignedIn izin verildiyse true döner
 */
function updateSigninStatus(isSignedIn) {
    GoogleCalendarAPI.isSignedIn = isSignedIn;
}

/** Google Calendar API */
GoogleCalendarAPI = {

    /** google hesabınızdan google takvim uygulaması için izin verildiyse true değeri alır */
    isSignedIn: false,

    /** takvim ile ilgili işlemler bu property altında yapılıyor */
    calendar: {

        /** google takvim listesini döndürür */
        list: function () {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {
                gapi.client.calendar.calendarList.list({
                    maxResult: 250,
                    minAccessRole: 'writer'
                }).then(function (response) {
                    resolve(response.result.items);
                });
            });
        },

        /**
         * yeni bir google takvim tanımı yapmak için kullanılır
         * @param {string} name takvim adı
         */
        insert: function (name) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {

                gapi.client.calendar.calendars.insert({
                    summary: name,
                    timeZone: 'Europe/Istanbul'
                }).execute(function (e) {
                    if (e.id) {
                        resolve(e.id);
                    }
                    else {
                        reject(e.error);
                    }
                });

            });
        }
    },

    /** takvim etkinlikleriyle ilgili işlemler bu property altında yapılıyor */
    events: {
        /**
         * takvime ait etklinlikleri döndürür
         * @param {string} calendarID google calendar (google takvim) ID
         * @param {dateTime} startDate başlangıç tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki başlangıç tarihi gelir)
         * @param {dateTime} endDate bitiş tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki bitiş tarihi gelir)
         */
        list: function (calendarID, startDate, endDate) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {
                gapi.client.calendar.events.list({
                    calendarId: calendarID,
                    timeMin: startDate,
                    timeMax: endDate,
                    showDeleted: false,
                    singleEvents: true,
                    maxResult: 100,
                    orderBy: 'startTime'
                }).then(function (response) {
                    return resolve(response.result.items);
                });
            });
        },

        /**
        * takvime ait etklinlikleri asenkron olarak döndürür
        * @param {string} calendarID google calendar (google takvim) ID
        * @param {dateTime} startDate başlangıç tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki başlangıç tarihi gelir)
        * @param {dateTime} endDate bitiş tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki bitiş tarihi gelir)
        */
        listAsync: async function (calendarID, startDate, endDate) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var events = await gapi.client.calendar.events.list({
                calendarId: calendarID,
                timeMin: startDate,
                timeMax: endDate,
                showDeleted: false,
                singleEvents: true,
                maxResult: 100,
                orderBy: 'startTime'
            }).then(function (response) {
                return response.result.items;
            });

            return events;
        },

        /**
         * takvime yeni bir etkinlik ekler
         * @param {string} calendarID  google calendar (google takvim) ID
         * @param {object} event google etkinlik 
         */
        insert: function (calendarID, event) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {
                gapi.client.calendar.events.insert({
                    calendarId: calendarID,
                    resource: event
                }).execute(function (response) {
                    if (response.id) {
                        resolve(response);
                    }
                    else {
                        reject(response.error);
                    }
                });
            });
        },

        /**
        * takvime asenkron olarak yeni bir etkinlik ekler
        * @param {string} calendarID  google calendar (google takvim) ID
        * @param {object} event google etkinlik 
        */
        insertAsync: async function (calendarID, event) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.insert({
                calendarId: calendarID,
                resource: event
            }).execute(function (response) {
                return response;
            });

            return response;
        },

        /**
         *  takvimde bir etkinliği günceller
         * @param {string} calendarID  google calendar (google takvim) ID
         * @param {object} event google etkinlik
         */
        update: function (calendarID, event) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {
                gapi.client.calendar.events.update({
                    calendarId: calendarID,
                    resource: event,
                    eventId: event.id
                }).execute(function (response) {
                    resolve(response);
                });
            });
        },

        /**
        *  takvimde bir etkinliği asenkron olarak günceller
        * @param {string} calendarID  google calendar (google takvim) ID
        * @param {object} event google etkinlik
        */
        updateAsync: async function (calendarID, event) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.update({
                calendarId: calendarID,
                resource: event,
                eventId: event.id
            }).execute(function (response) {
                return response;
            });

            return response;
        },

        /**
         * takvimden etkinlik siler
         * @param {string} calendarID google calendar (google takvim) ID
         * @param {string} eventID google etkinlik id
         */
        delete: function (calendarID, eventID) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise(function (resolve, reject) {
                gapi.client.calendar.events.delete({
                    calendarId: calendarID,
                    eventId: eventID
                }).execute(function (response) {
                    resolve(response);
                });
            });
        },

        /**
         * takvimden etkinliği asenkron olarak siler
         * @param {string} calendarID google calendar (google takvim) ID
         * @param {string} eventID google etkinlik id
         */
        deleteAsync: async function (calendarID, eventID) {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.delete({
                calendarId: calendarID,
                eventId: eventID
            }).execute(function (response) {
                return response;
            });

            return response;
        },
    },

    /** fullcalendar ile google calendar arası convert işlemleri bu property altında yapılıyor */
    converter: {
        /**
         * google etkinlik nesnesini FullCalendar eklentisinin özelliklerine göre convert eder
         * @param {object} googleEvent
         */
        toFullCalendarEvent: function (googleEvent) {
            var event = {
                id: googleEvent.id,
                start: googleEvent.start.dateTime != null ? googleEvent.start.dateTime : googleEvent.start.date,
                end: googleEvent.end.dateTime != null ? googleEvent.end.dateTime : googleEvent.end.date,
                title: googleEvent.summary,
                description: googleEvent.description,
                url: googleEvent.htmlLink,
                color: '#669933'
            };

            return event;
        },

        /**
         * google etkinlik listesini FullCalendar eklentisinin özelliklerine göre convert eder
         * @param {Array} googleEvents
         */
        toFullCalendarEventList: function (googleEvents) {
            var i = 0, n = googleEvents.length;
            var events = [];

            for (i = 0; i < n; i++) {
                var event = GoogleCalendarAPI.converter.toFullCalendarEvent(googleEvents[i]);
                events.push(event);
            }

            return events;
        }
    }

}