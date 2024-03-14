sap.ui.define([
    "sap/m/Button",
    "sap/m/SinglePlanningCalendar",
    "sap/m/SinglePlanningCalendarDayView",
    "sap/m/SinglePlanningCalendarWorkWeekView",
    "sap/m/SinglePlanningCalendarWeekView",
    "sap/m/SinglePlanningCalendarMonthView",
    "sap/ui/unified/CalendarAppointment",
    "sap/ui/core/date/UI5Date",
    "sap/ui/unified/library",
    "sap/m/FlexBox",
    "sap/m/Text",
    "sap/ui/core/Icon",
    "sap/ui/core/Element"
], function(
    Button,
    SinglePlanningCalendar,
    SinglePlanningCalendarDayView,
    SinglePlanningCalendarWorkWeekView,
    SinglePlanningCalendarWeekView,
    SinglePlanningCalendarMonthView,
    CalendarAppointment,
    UI5Date,
    unifiedLibrary,
    FlexBox,
    Text,
    Icon,
    Element
) {
	"use strict";


    var CalendarDayType = unifiedLibrary.CalendarDayType;

    var oSPC = new SinglePlanningCalendar("SinglePlanningCalendar", {
        title: "SinglePlanningCalendar - Appointments with Custom Content",
        startDate: UI5Date.getInstance("2024", "2", "1"),
        startHour: 8,
        endHour: 18,
        fullDay: false,
        views: [
            new SinglePlanningCalendarDayView({
                key: "DayView",
                title: "Day"
            }),
            new SinglePlanningCalendarWorkWeekView({
                key: "WorkWeekView",
                title: "Work Week"
            }),
            new SinglePlanningCalendarWeekView({
                key: "WeekView",
                title: "Full Week"
            }),
            new SinglePlanningCalendarMonthView({
                key: "Month",
                title: "Month"
            })
        ],
        actions: [
            new Button("resetScaleFactor",{
                icon: "sap-icon://reset",
                press: function() {
                    var oSPC = Element.getElementById("SinglePlanningCalendar");
                    oSPC.setScaleFactor(1);

                }
            }),
            new Button("zoomIn",{
                icon: "sap-icon://zoom-in",
                press: function() {
                var oSPC = Element.getElementById("SinglePlanningCalendar");
                var iCurrentScaleFactor = oSPC.getScaleFactor();
                oSPC.setScaleFactor(++iCurrentScaleFactor);
                }
            }),
            new Button("zoomOut",{
                icon: "sap-icon://zoom-out",
                press: function() {
                    var oSPC = Element.getElementById("SinglePlanningCalendar");
                    var iCurrentScaleFactor = oSPC.getScaleFactor();
                    oSPC.setScaleFactor(--iCurrentScaleFactor);
                }
            })
        ],
        appointments: [
            new CalendarAppointment("R1A1", {
                startDate: UI5Date.getInstance("2024", "2", "1", "08", "00"),
                endDate: UI5Date.getInstance("2024", "2", "1", "09", "00"),
                type: CalendarDayType.Type03,
                customContent: [
                    new FlexBox({
                        direction: "Column",
                        items: [
                            new Text({
                                text: "Possible Actions:"
                            }),
                            new FlexBox({
                                items: [
                                    new Icon({
                                        src: "sap-icon://pharmacy"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://add-product"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://employee-rejections"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://doctor"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://add-employee"
                                    })
                                ]
                            })
                        ]
                    })
                ],
                title: "Daily Standup Meeting",
                tooltip: "First Appointment with custom content",
                text: "Room 1"
            }),
            new CalendarAppointment("R1A2", {
                startDate: UI5Date.getInstance("2024", "2", "1", "10", "45"),
                endDate: UI5Date.getInstance("2024", "2", "1", "12", "00"),
                type: CalendarDayType.Type06,
                title: "Private Appointment",
                icon: "sap-icon://home",
                tooltip: "Second Appointment with custom content",
                text: "Home",
                tentative: true,
                customContent: [
                    new FlexBox({
                        direction: "Column",
                        items: [
                            new Text({
                                text: "Possible Actions:"
                            }),
                            new FlexBox({
                                items: [
                                    new Icon({
                                        src: "sap-icon://pharmacy"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://add-product"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://employee-rejections"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://doctor"
                                    }).addStyleClass("sapUiTinyMarginEnd"),
                                    new Icon({
                                        src: "sap-icon://add-employee"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new CalendarAppointment("R1A3", {
                startDate: UI5Date.getInstance("2024", "2", "1", "13", "30"),
                endDate: UI5Date.getInstance("2024", "2", "1", "15", "30"),
                type: CalendarDayType.Type02,
                title: "Sprint Planning",
                icon: "sap-icon://home",
                tooltip: "Sprint Planning"
            }),
            new CalendarAppointment("R1A4", {
                startDate: UI5Date.getInstance("2024", "2", "1", "16", "00"),
                endDate: UI5Date.getInstance("2024", "2", "1", "16", "45"),
                type: CalendarDayType.Type09,
                title: "Meeting with the Manager",
                tooltip: "Meeting with the Manager"
            })
        ]
    });

    oSPC.placeAt("body");

});
