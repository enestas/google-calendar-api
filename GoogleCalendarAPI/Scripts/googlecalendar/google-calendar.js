var CurrentCalendarID = null;
var CalendarList = [];
var CurrentCalendar = {};

/** google developer console'dan oluşturduğunuz Client ID */
ClientID = '';

/** google developer console'dan oluşturduğunuz API KEY */
ApiKey = '';

DiscoverDocs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

/** kullanılacak api */
Scopes = 'https://www.googleapis.com/auth/calendar';

/** google calendar api init işlemi (sayfa load edildikten sonra çalışır) */
handleClientLoad = () => {
    gapi.load('client:auth2', initClient);
};

/** google calendar api init işlemi (sayfa load edildikten sonra handleClientLoad fonksiyonunda çağırılır)
 * daha önce izin verilip verilmediğini dinler, izin verilmemişse izin ister
 * */
initClient = () => {
    gapi.client.init({
        apiKey: ApiKey,
        clientId: ClientID,
        discoveryDocs: DiscoverDocs,
        scope: Scopes
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        if (!GoogleCalendarAPI.isSignedIn) {
            gapi.auth2.getAuthInstance().signIn();
        }
    },
        (error) => {
            updateSigninStatus(false);
            console.log(JSON.stringify(error, null, 2));
        });
};

/**
 * google hesabından calendar izni verildi mi
 * @param {boolean} isSignedIn izin verildiyse true döner
 */
updateSigninStatus = (isSignedIn) => {
    GoogleCalendarAPI.isSignedIn = isSignedIn;
};

/** uygulama izni yoksa uyarı mesajı üzerinden tetiklemek için kullanılır */
handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
}

/** FullCalendar Initializing işlemi */
InitCalendar = () => {
    $('#calendar').fullCalendar({
        lang: 'tr',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        events: GetGoogleEventList,
        dayClick: (date, jsEvent, view) => {
            NewEvent(date.format('YYYY-MM-DD hh:mm'));
        },
        eventClick: (event) => {
            ShowEvent(event);
        },
        eventDrop: (event, delta, revertFunc) => {
            UpdateEventDate(event);
        },
        eventResize: (event, delta, revertFunc) => {
            UpdateEventDate(event);
        }
    });
}

/** Google takvimlerini listeler */
GetGoogleCalendarList = () => {
    if (!GoogleCalendarAPI.isSignedIn) {
        $('#calendarList').html('Uygulama izini verilmemiş. Uygulama izni vermek için <a href="javascript:;" onclick="handleAuthClick();">tıklayın</a>');
        return;
    };

    GoogleCalendarAPI.calendar.list().then((response) => {
        var html = '';

        CalendarList = response;

        html += '<div class="btn-group"><a href="javacsript:;" class="btn btn-sm btn-default" onclick="NewCalendar()">Yeni Takvim Ekle</a>';
        html += '<a href="javacsript:;" id="btnEditCalendar" class="btn btn-sm btn-default"  style="display:none" onclick="EditCalendar()">Seçili Takvimi Düzenle</a>';
        html += '<a href="javacsript:;"  id="btnDeleteCalendar" class="btn btn-sm btn-default" style="display:none" onclick="DeleteCalendar()">Seçili Takvimi Sil</a>';

        html += '</div><div class="list-group" style="margin-top:10px;">';

        response.map((item) => {
            html += '<a style="cursor:pointer" data-calendarid="' + item.id + '" class="list-group-item list-group-item-action" onclick="SetCalendarID(\'' + item.id + '\')">' + item.summary + '</a>';
        });

        html += '</div>'

        $('#calendarList').html(html);

        if (CurrentCalendarID != null)
            SetCalendarID(CurrentCalendarID);

    });

}

/** Yeni bir google takvim oluşturmak için modal form açar */
NewCalendar = () => {
    var html = '';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlık</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtTitle" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    bootbox.dialog({
        message: html,
        title: "Yeni",
        size: "large",
        buttons: {
            success: {
                label: "Kaydet", className: "btn-success",
                callback: () => {
                    var Name = $('#txtTitle').val();

                    if (Name.length == 0) {
                        bootbox.alert("Takvim adı giriniz");
                        return false;
                    }

                    GoogleCalendarAPI.calendar.insert(Name).
                        then((response) => {
                            $('#messageBox').html('Takvim eklendi');

                            setTimeout(() => {
                                GetGoogleCalendarList();

                                if (CurrentCalendarID != null)
                                    SetCalendarID(CurrentCalendarID);

                            }, 1000);

                        }).catch((error) => {
                            bootbox.alert(error);
                        });

                    var message = '<div class="alert alert-info" style="margin-top:5px;" id="messageBox">Takvim ekleniyor...</div>';

                    $('#calendarList').append(message);
                }
            },
            danger: {
                label: "İptal",
                className: "btn-default"
            }
        }
    });
}

/** seçili google takvimi düzenlemek için modal form açar */
EditCalendar = () => {
    var html = '';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlık</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtTitle" value="' + CurrentCalendar.summary + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    bootbox.dialog({
        message: html,
        title: "Yeni",
        size: "large",
        buttons: {
            success: {
                label: "Kaydet", className: "btn-success",
                callback: () => {
                    var Name = $('#txtTitle').val();

                    if (Name.length == 0) {
                        bootbox.alert("Takvim adı giriniz");
                        return false;
                    }

                    GoogleCalendarAPI.calendar.update(CurrentCalendarID, Name).then((response) => {
                        $('#messageBox').html('Takvim güncellendi');

                        setTimeout(() => {
                            GetGoogleCalendarList();
                        }, 1000);

                    }).catch((error) => {
                        bootbox.alert(error);
                    });

                    var message = '<div class="alert alert-info" style="margin-top:5px;" id="messageBox">Takvim güncelleniyor...</div>';

                    $('#calendarList').append(message);
                }
            },
            danger: {
                label: "İptal",
                className: "btn-default"
            }
        }
    });
}

/** seçili google takvimi siler */
DeleteCalendar = () => {
    bootbox.dialog({
        message: "Silmek istediğinize emin misiniz?",
        title: "Dikkat",
        buttons: {
            success: {
                label: "Evet",
                className: "btn-danger",
                callback: () => {
                    GoogleCalendarAPI.calendar.delete(CurrentCalendarID).then((response) => {
                        SetCalendarID(null);
                        GetGoogleCalendarList();

                        $('#calendar').fullCalendar('refetchEvents');
                        $('#calendar').fullCalendar('today');

                    }).catch((error) => {
                        $('#calendar').fullCalendar('refetchEvents');
                        $('#calendar').fullCalendar('today');

                        bootbox.alert(error);
                    });
                }
            },
            danger: {
                label: "Hayır",
                className: "btn-default"
            }
        }
    });
}

/**  Takvim seçimi */
SetCalendarID = (ID) => {
    $('[data-calendarid]').removeClass('active');
    $('[data-calendarid="' + ID + '"]').addClass('active');

    CurrentCalendarID = ID;
    CurrentCalendar = CalendarList.filter(c => c.id === ID);

    var Calendar = $('#calendar');

    $('#btnEditCalendar').show();
    $('#btnDeleteCalendar').show();

    setTimeout(() => {
        Calendar.fullCalendar('refetchEvents');
        Calendar.fullCalendar('today');
    }, 200);
}

/** Seçilen takvimin etkinliklerini yükler */
GetGoogleEventList = (start, end, timeZone, callback) => {
    if (CurrentCalendarID == null)
        return callback([]);

    GoogleCalendarAPI.events.list(CurrentCalendarID, start._d.toISOString(), end._d.toISOString()).
        then((events) => {
            var eventList = GoogleCalendarAPI.converter.toFullCalendarEventList(events, CurrentCalendar.backgroundColor);
            return callback(eventList);
        });
}

// Seçilen tarih için yeni event oluşturma, modal açar
NewEvent = (selectedDate) => {
    if (CurrentCalendarID == null) {
        bootbox.alert("Takvim seçiniz");
        return;
    }

    var html = '';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlık</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtTitle" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Açıklama</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtDescription" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlangıç Tarihi</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtStartDate" value="' + selectedDate + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Bitiş Tarihi</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtEndDate" value="' + selectedDate + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    bootbox.dialog({
        message: html,
        title: "Yeni",
        size: "large",
        buttons: {
            success: {
                label: "Kaydet", className: "btn-success",
                callback: () => {
                    var StartDate = new Date($('#txtStartDate').val()).toISOString();
                    var EndDate = new Date($('#txtEndDate').val()).toISOString();

                    var event = {
                        summary: $('#txtTitle').val(),
                        description: $('#txtDescription').val(),
                        start: {
                            // date: StartDate, /* sadece tarih için date kullanılabilir */
                            dateTime: StartDate, /* tarih ve saat için dateTime kullanılabilir */
                            timeZone: 'Europe/Istanbul'
                        },
                        end: {
                            // date: EndDate, /* sadece tarih için date kullanılabilir */
                            dateTime: EndDate, /* tarih ve saat için dateTime kullanılabilir */
                            timeZone: 'Europe/Istanbul'
                        },
                        reminders: {
                            useDefault: true
                        }
                    };

                    GoogleCalendarAPI.events.insert(CurrentCalendarID, event).
                        then((response) => {
                            $('#calendar').fullCalendar('refetchEvents');
                        }).catch((error) => {
                            $('#calendar').fullCalendar('refetchEvents');
                            bootbox.alert(error);
                        });
                }
            },
            danger: {
                label: "İptal",
                className: "btn-default"
            }
        }
    });
}

// sürükle bırak veya resize ile tarih bilgilerini günceller
UpdateEventDate = (selectedItem) => {
    var StartDate = selectedItem.start._d.toISOString();
    var EndDate = selectedItem.end != null ? selectedItem.end._d.toISOString() : selectedItem.start._d.toISOString();

    var event = {
        id: selectedItem.id,
        summary: selectedItem.title,
        description: selectedItem.description,
        start: {
           // date: StartDate, /* sadece tarih için date kullanılabilir */
            dateTime: StartDate, /* tarih ve saat için dateTime kullanılabilir */
            'timeZone': 'Europe/Istanbul'
        },
        end: {
            // date: EndDate, /* sadece tarih için date kullanılabilir */
            dateTime: EndDate, /* tarih ve saat için dateTime kullanılabilir */
            'timeZone': 'Europe/Istanbul'
        },
        reminders: {
            useDefault: true
        }
    };

    GoogleCalendarAPI.events.update(CurrentCalendarID, event).
        then((response) => {
            $('#calendar').fullCalendar('refetchEvents');
        }).catch((error) => {
            $('#calendar').fullCalendar('refetchEvents');
            bootbox.alert(error);
        });
}

/** Etklnliği düzenlemek için modal form */
ShowEvent = (event) => {
    var html = '';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlık</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtTitle" value="' + event.title + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Açıklama</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtDescription" value="' + event.description + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Başlangıç Tarihi</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtStartDate" value="' + event.start.format('YYYY-MM-DD hh:mm') + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row form-horizontal">';
    html += '<div class="col-md-12">';
    html += '<div class="form-group">';
    html += '<div class="col-lg-2 control-label">Bitiş Tarihi</div>';
    html += '<div class="col-lg-10">';
    html += '<input type="text" class="form-control" id="txtEndDate" value="' + (event.end == null ? event.start.format('YYYY-MM-DD hh:mm') : event.end.format('YYYY-MM-DD hh:mm')) + '" />';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    bootbox.dialog({
        message: html,
        title: "Yeni",
        size: "large",
        buttons: {
            success: {
                label: "Kaydet",
                className: "btn-success",
                callback: () => {
                    var StartDate = new Date($('#txtStartDate').val()).toISOString();
                    var EndDate = new Date($('#txtEndDate').val()).toISOString();

                    var updateEvent = {
                        id: event.id,
                        summary: $('#txtTitle').val(),
                        description: $('#txtDescription').val(),
                        start: {
                            //date: StartDate, /* sadece tarih için date kullanılabilir */
                            dateTime: StartDate,  /* tarih ve saat için dateTime kullanılabilir */
                            timeZone: 'Europe/Istanbul'
                        },
                        end: {
                            //date: EndDate, /* sadece tarih için date kullanılabilir */
                            dateTime: EndDate, /* tarih ve saat için dateTime kullanılabilir */
                            timeZone: 'Europe/Istanbul'
                        },
                        reminders: {
                            useDefault: true
                        }
                    };

                    GoogleCalendarAPI.events.update(CurrentCalendarID, updateEvent).
                        then((response) => {
                            $('#calendar').fullCalendar('refetchEvents');
                        }).catch((error) => {
                            $('#calendar').fullCalendar('refetchEvents');
                            bootbox.alert(error);
                            return false;
                        });
                }
            },
            danger: {
                label: "Sil",
                className: "btn-danger",
                callback: () => {
                    DeleteEvent(event.id);
                }
            },
            close: {
                label: "İptal",
                className: "btn-default"
            }
        }
    });
}

/** etkinliği sil */
DeleteEvent = (id) => {
    bootbox.dialog({
        message: "Silmek istediğinize emin misiniz?",
        title: "Dikkat",
        buttons: {
            success: {
                label: "Evet",
                className: "btn-danger",
                callback: () => {

                    GoogleCalendarAPI.events.delete(CurrentCalendarID, id).then((response) => {
                        $('#calendar').fullCalendar('refetchEvents');
                        $('#calendar').fullCalendar('today');
                    }).catch((error) => {
                        $('#calendar').fullCalendar('refetchEvents');
                        $('#calendar').fullCalendar('today');
                        bootbox.alert(error);
                        });

                }
            },
            danger: {
                label: "Hayır",
                className: "btn-default"
            }
        }
    });
}
