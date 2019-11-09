/** Google Calendar API */
GoogleCalendarAPI = {

    /** kullanıcı google hesabından google takvim uygulaması için izin verdiyse true değeri alır */
    isSignedIn: false,

    /** takvimler ile ilgili işlemler bu property altında yapılıyor */
    calendar: {

        /** google takvim listesini döndürür
         * https://developers.google.com/calendar/v3/reference/calendarList/list
         * */
        list: () => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.calendarList.list({
                    maxResult: 250,
                    minAccessRole: 'writer' /* owner, writer, freeBusyReader, reader */
                }).then((response) => {
                    if (response.status == 200)
                        resolve(response.result.items);
                    else
                        reject(response.result.error.message);
                });
            });
        },

        /**
        * yeni bir google takvim tanımı yapmak için kullanılır
        * https://developers.google.com/calendar/v3/reference/calendars/insert
        * @param {string} name takvim adı
        */
        insert: (name) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {

                gapi.client.calendar.calendars.insert({
                    summary: name,
                    timeZone: 'Europe/Istanbul'
                }).execute((e) => {
                    if (e.id) {
                        resolve(e.id);
                    }
                    else {
                        reject(e.message);
                    }
                });

            });
        },

        /**
       * mevcut bir google takvimin adını düzenlemek için kullanılır
       * https://developers.google.com/calendar/v3/reference/calendars/update
       * @param {string} calendarID takvim ID
       * @param {string} name takvim adı
       */
        update: (calendarID, name) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {

                gapi.client.calendar.calendars.update({
                    calendarId: calendarID,
                    summary: name
                }).execute((e) => {
                    if (e.id) {
                        resolve(e.id);
                    }
                    else {
                        reject(e.message);
                    }
                });

            });
        },

        /**
       *  takvimi siler
       * @param {string} calendarID takvim ID 
       */
        delete: (calendarID) => {
            return new Promise((resolve, reject) => {

                gapi.client.calendar.calendars.delete({
                    calendarId: calendarID,
                }).execute((e) => {
                    if (e.code == 404)
                        reject(e.message);
                    else
                        resolve(true);
                });

            });
        }
    },

    /** takvim etkinlikleriyle ilgili işlemler bu property altında yapılıyor */
    events: {
        /**
       * takvime ait etklinlikleri döndürür
       * https://developers.google.com/calendar/v3/reference/events/list
       * @param {string} calendarID google calendar (google takvim) ID
       * @param {Date} startDate başlangıç tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki başlangıç tarihi gelir)
       * @param {Date} endDate bitiş tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki bitiş tarihi gelir)
       */
        list: (calendarID, startDate, endDate) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.events.list({
                    calendarId: calendarID,
                    timeMin: startDate,
                    timeMax: endDate,
                    showDeleted: false,
                    singleEvents: true,
                    maxResult: 1000, /* max dönecek event sayısı, varsayılan değeri 250, max değeri ise 2500 den fazla olamaz */
                    orderBy: 'startTime' /* startTime, updated */
                }).then((response) => {
                    if (response.status == 200)
                        resolve(response.result.items);
                    else
                        reject(response.result.error.message);
                });
            });
        },

        /**
     * takvime ait etklinlikleri asenkron olarak döndürür
     * @param {string} calendarID google calendar (google takvim) ID
     * @param {Date} startDate başlangıç tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki başlangıç tarihi gelir)
     * @param {Date} endDate bitiş tarihi (fullcalendar eklentisindeki seçili tarih aralığındaki bitiş tarihi gelir)
     */
        listAsync: async (calendarID, startDate, endDate) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var events = await gapi.client.calendar.events.list({
                calendarId: calendarID,
                timeMin: startDate,
                timeMax: endDate,
                showDeleted: false,
                singleEvents: true,
                maxResult: 1000,
                orderBy: 'startTime'
            }).then((response) => {
                if (response.status == 200)
                    return response.result.items;
            });

            return events;
        },

        /**
        * takvime yeni bir etkinlik ekler
        * https://developers.google.com/calendar/v3/reference/events/insert
        * @param {string} calendarID  google calendar (google takvim) ID
        * @param {any} event google etkinlik 
        */
        insert: (calendarID, event) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.events.insert({
                    calendarId: calendarID,
                    resource: event
                }).execute((response) => {
                    if (response.id) {
                        resolve(response);
                    }
                    else {
                        reject(response.message);
                    }
                });
            });
        },

        /**
      * takvime asenkron olarak yeni bir etkinlik ekler
      * @param {string} calendarID  google calendar (google takvim) ID
      * @param {any} event google etkinlik 
      */
        insertAsync: async (calendarID, event) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.insert({
                calendarId: calendarID,
                resource: event
            }).execute((response) => {
                return response;
            });

            return response;
        },

        /**
        *  takvimde bir etkinliği günceller
        *  https://developers.google.com/calendar/v3/reference/events/update
        * @param {string} calendarID  google calendar (google takvim) ID
        * @param {any} event google etkinlik
        */
        update: (calendarID, event) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.events.update({
                    calendarId: calendarID,
                    resource: event,
                    eventId: event.id
                }).execute((response) => {
                    if (response.code == 400) {
                        reject(response.message);
                    }
                    else {
                        resolve(response);
                    }
                });
            });
        },

        /**
     *  takvimde bir etkinliği asenkron olarak günceller
     * @param {string} calendarID  google calendar (google takvim) ID
     * @param {any} event google etkinlik
     */
        updateAsync: async (calendarID, event) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.update({
                calendarId: calendarID,
                resource: event,
                eventId: event.id
            }).execute((response) => {
                return response;
            });

            return response;
        },

        /**
        * takvimden etkinlik siler
        * https://developers.google.com/calendar/v3/reference/events/delete
        * @param {string} calendarID google calendar (google takvim) ID
        * @param {string} eventID google etkinlik id
        */
        delete: (calendarID, eventID) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.events.delete({
                    calendarId: calendarID,
                    eventId: eventID
                }).execute((response) => {
                    resolve(response);
                });
            });
        },

        /**
       * takvimden etkinliği asenkron olarak siler
       * @param {string} calendarID google calendar (google takvim) ID
       * @param {string} eventID google etkinlik id
       */
        deleteAsync: async (calendarID, eventID) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.delete({
                calendarId: calendarID,
                eventId: eventID
            }).execute((response) => {
                return response;
            });

            return response;
        },

        /**
       * bir etkinliği başka bir takvime taşır
       * https://developers.google.com/calendar/v3/reference/events/move
       * @param {string} calendarID mevcut google calendar (google takvim) ID
       * @param {string} eventID google etkinlik id
       * @param {string} destinationCalendarID hedef google calendar (google takvim) ID
       */
        move: (calendarID, eventID, destinationCalendarID) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            return new Promise((resolve, reject) => {
                gapi.client.calendar.events.move({
                    calendarId: calendarID,
                    eventId: eventID,
                    destinationCalendarId: destinationCalendarID
                }).execute((response) => {
                    if (response.id) {
                        resolve(response);
                    }
                    else {
                        reject(response.message);
                    }
                });
            });
        },

        /**
      * bir etkinliği asenkron olarak bir takvime taşır
      * https://developers.google.com/calendar/v3/reference/events/move
      * @param {string} calendarID mevcut google calendar (google takvim) ID
      * @param {string} eventID google etkinlik id
      * @param {string} destinationCalendarID hedef google calendar (google takvim) ID
      */
        moveAsync: async (calendarID, eventID, destinationCalendarID) => {
            if (!GoogleCalendarAPI.isSignedIn)
                return null;

            var response = await gapi.client.calendar.events.move({
                calendarId: calendarID,
                eventId: eventID,
                destinationCalendarId: destinationCalendarID
            }).execute((response) => {
                return response;
            });

            return response;
        }
    },

    /** takvimler için renk listesini bu property altından çekebilirsiniz
     * https://developers.google.com/calendar/v3/reference/colors/get
     * */
    colors: {
        get: () => {
            return new Promise((resolve, reject) => {
                gapi.client.calendar.colors.get().execute((response) => {
                    resolve(response);
                });
            });
        }
    },

    /** fullcalendar ile google calendar arası convert işlemleri bu property altında yapılıyor */
    converter: {
        /**
       * google etkinlik nesnesini FullCalendar eklentisinin özelliklerine göre convert eder
       * @param {any} googleEvent
       */
        toFullCalendarEvent: (googleEvent, color) => {
            var event = {
                id: googleEvent.id,
                start: googleEvent.start.dateTime != null ? googleEvent.start.dateTime : googleEvent.start.date,
                end: googleEvent.end.dateTime != null ? googleEvent.end.dateTime : googleEvent.end.date,
                title: googleEvent.summary,
                description: googleEvent.description,
                //url: googleEvent.htmlLink,
                color: color
            };

            return event;
        },

        /**
         * google etkinlik listesini FullCalendar eklentisinin özelliklerine göre convert eder
         * @param {Array} googleEvents
         * @param {string} color etkinlik rengi, default olarak #669933 verdim, ancak takvimin kendi color kodu verilebilir
         */
        toFullCalendarEventList: (googleEvents, color = '#669933') => {
            var i = 0, n = googleEvents.length;
            var events = [];

            for (i = 0; i < n; i++) {
                var event = GoogleCalendarAPI.converter.toFullCalendarEvent(googleEvents[i], color);
                events.push(event);
            }

            return events;
        }
    }

}