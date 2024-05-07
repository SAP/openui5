sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/unified/library",
	"sap/m/PlanningCalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/library",
	"sap/m/PlanningCalendarRow",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/core/format/DateFormat",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/library",
	"sap/m/Title",
	"sap/m/ObjectListItem",
	"sap/m/PlanningCalendar",
	"sap/ui/core/CustomData",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/m/Page",
	"sap/ui/core/date/UI5Date"
], function(
	Element,
	unifiedLibrary,
	PlanningCalendarLegend,
	CalendarLegendItem,
	Dialog,
	Button,
	App,
	Label,
	JSONModel,
	MessageToast,
	mobileLibrary,
	PlanningCalendarRow,
	CalendarAppointment,
	DateFormat,
	DateTypeRange,
	coreLibrary,
	MTitle,
	ObjectListItem,
	PlanningCalendar,
	CustomData,
	FlexBox,
	MText,
	Icon,
	Page,
	UI5Date
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.unified.StandardCalendarLegendItem
	var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oLegend = new PlanningCalendarLegend("Legend1", {
		standardItems: [StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay, StandardCalendarLegendItem.Today],
		items: [
			new CalendarLegendItem("T1", {
				type: CalendarDayType.Type01,
				text: "Type 1 in Legend Calendar area"
			}),
			new CalendarLegendItem("T2", {
				type: CalendarDayType.Type02,
				text: "Type 2 in Legend Calendar area"
			}),
			new CalendarLegendItem("T3", {
				type: CalendarDayType.Type03,
				text: "Type 3 in Legend Calendar area"
			}),
			new CalendarLegendItem("T4", {
				type: CalendarDayType.Type04,
				text: "Type 4 in Legend Calendar area"
			}),
			new CalendarLegendItem("T5", {
				type: CalendarDayType.Type05,
				text: "Type 5 in Legend Calendar area"
			}),
			new CalendarLegendItem("T6", {
				type: CalendarDayType.Type06,
				text: "Type 6 in Legend Calendar area"
			}),
			new CalendarLegendItem("T7", {
				type: CalendarDayType.Type07,
				text: "Type 7 in Legend Calendar area"
			}),
			new CalendarLegendItem("T8", {
				type: CalendarDayType.Type08,
				text: "Type 8 in Legend Calendar area"
			}),
			new CalendarLegendItem("T9", {
				type: CalendarDayType.Type09,
				text: "Type 9 in Legend Calendar area"
			}),
			new CalendarLegendItem("T10", {
				type: CalendarDayType.Type10,
				text: "Type 10 in Legend Calendar area"
			})
		],
		appointmentItems: [
			new CalendarLegendItem("T31", {
				type: CalendarDayType.Type01,
				text: "Type Private Appointment"
			}),
			new CalendarLegendItem("T32", {
				type: CalendarDayType.Type02,
				text: "Type Face2Face Appointment"
			}),
			new CalendarLegendItem("T33", {
				type: CalendarDayType.Type12,
				text: "Type Public Appointment"
			})
		]
	});

	var oDialog = new Dialog("D1", {
		title: "Legend",
		content: [oLegend],
		endButton: new Button({
			text: "Close",
			press: function () {
				oDialog.close();
			}
		})
	});

	var app = new App("myApp");

	var oEventLabel = new Label({text: "Events log"});

	var oModel = new JSONModel();

	oModel.setData({
		headerContentBinding: [{
			name: "Edward II",
			text: "headerContent aggregation with binding"
		}]
	});

	var handleIntervalSelect = function (oEvent) {
		new MessageToast.show("Interval Select was handled");
	};

	var handleAppointmentSelect = function (oEvent) {
		var oInput = Element.getElementById("I1"),
			oAppointment = oEvent.getParameter("appointment"),
			aAppointments,
			sValue,
			i;

		if (oAppointment) {
			oInput.setValue("Appointment selected: " + oAppointment.getId());
		} else {
			aAppointments = oEvent.getParameter("appointments");
			sValue = aAppointments.length + " Appointments selected: ";
			for (i = 1; i < aAppointments.length; i++) {
				sValue = sValue + aAppointments[i].getId() + " ";
			}
			oInput.setValue(sValue);
		}
		setEventLog("'appointmentSelect' for appointment: " + (oAppointment ? oAppointment.getTitle() : "<no app>"));
	};

	var handleStartDateChange = function (oEvent) {
		var oDf = DateFormat.getTimeInstance("HH:mm:ss");
		setEventLog("startDateChange event at " + oDf.format(UI5Date.getInstance()) + " with params:" + JSON.stringify(oEvent.mParameters));
	};

	var handleRowSelectionChange = function (oEvent) {
		var oRows = oEvent.getParameter("rows"),
			sValue = oRows.length + " row(s) selected";
		setEventLog("rowSelectionChange:" + sValue);
	};

	//adds some event info to the event log label
	function setEventLog(sMessage) {
		oEventLabel.setText(sMessage);
		oEventLabel.$().attr('style', "background-color: rgb(" + Math.ceil(Math.random() * 255).toString() + "," + Math.ceil(Math.random() * 255).toString() + "," + Math.ceil(Math.random() * 255).toString() + ");");
	}

	var handleRowHeaderPress = function (oEvent) {
		var oRow = oEvent.getParameter("row"),
			sEmployeeInfo = oRow.getTitle() + " " + oRow.getText();
		setEventLog("'rowHeaderPress' on employee:\n'" + sEmployeeInfo + "'");
	};

	var handleLegend = function () {
		oDialog.open();
	};

	var oButtonLegend = new Button("B_Legend", {
		icon: "sap-icon://legend",
		type: ButtonType.Transparent,
		tooltip: "Open PlanningCalendar legend",
		press: handleLegend
	});


	var oTitle = new MTitle("Title1", {
		text: "Title"
	});

	var oOLI = new ObjectListItem({
		title: "{name}",
		intro: "{text}"
	});

	var oPC1 = new PlanningCalendar("PC1", {
		startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
		rows: [
			new PlanningCalendarRow("Row1", {
				customData: new CustomData({key: "myKey", value: "myValue", writeToDom: true}),
				icon: "../ui/unified/images/m_01.png",
				title: "Max Mustermann",
				text: "Musterteam",
				tooltip: "Header tooltip",
				rowHeaderDescription: "Has popup",
				specialDates: [
					new DateTypeRange({
						startDate: UI5Date.getInstance(2015, 0, 7),
						endDate: UI5Date.getInstance(2015, 0, 8),
						type: CalendarDayType.NonWorking
					}),
					new DateTypeRange({
						startDate: UI5Date.getInstance(2015, 0, 3),
						endDate: UI5Date.getInstance(2015, 0, 4),
						type: CalendarDayType.Working
					})
				],
				intervalHeaders: [
					new CalendarAppointment("R1H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						type: CalendarDayType.Type02,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R1A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
						type: CalendarDayType.Type03,
						customContent: [
							new FlexBox({
								direction: "Column",
								items: [
									new MText({
										text: "TG2P11: Maintenance"
									}),
									new FlexBox({
										items: [
											new Icon({
												src: "sap-icon://pharmacy"
											}),
											new Icon({
												src: "sap-icon://add-product"
											}),
											new Icon({
												src: "sap-icon://employee-rejections"
											}),
											new Icon({
												src: "sap-icon://doctor"
											}),
											new Icon({
												src: "sap-icon://add-employee"
											})
										]
									})
								]
							})
						],
						title: "2 days meeting",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "2 days meeting",
						text: "Room 1"
					}),
					new CalendarAppointment("R1A2", {
						startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
						endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
						type: CalendarDayType.Type06,
						title: "Appointment 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home",
						tentative: true
					}),
					new CalendarAppointment("R1A3", {
						startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
						type: CalendarDayType.Type02,
						title: "Blocker 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R1A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
						type: CalendarDayType.Type09,
						title: "Meeting 4",
						tooltip: "Tooltip 4",
						selected: true
					})
				]
			}),
			new PlanningCalendarRow("Row2", {
				title: "This must not be shown",
				headerContent: {
					path: "/headerContentBinding",
					template: oOLI
				},
				intervalHeaders: [
					new CalendarAppointment("R2H1", {
						startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R2A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "Event 1",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "Tooltip 1",
						text: "Room 1"
					}),
					new CalendarAppointment("R2A2", {
						startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type02,
						title: "Event 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home"
					}),
					new CalendarAppointment("R2A3", {
						startDate: UI5Date.getInstance("2015", "0", "3", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "4", "23", "59"),
						type: CalendarDayType.Type03,
						title: "Event 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R2A4", {
						startDate: UI5Date.getInstance("2015", "1", "1", "00", "00"),
						endDate: UI5Date.getInstance("2015", "1", "28", "23", "59"),
						type: CalendarDayType.Type04,
						title: "Event 4",
						icon: "sap-icon://home",
						tooltip: "Tooltip 4"
					})
				]
			}),
			new PlanningCalendarRow("Row3", {
				icon: "sap-icon://palette",
				title: "Color Mixer",
				tooltip: "Colors",
				intervalHeaders: [
					new CalendarAppointment("R3H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						type: CalendarDayType.Type01,
						title: "Type01",
						tooltip: "Type01",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						type: CalendarDayType.Type02,
						title: "Type02",
						tooltip: "Type02",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						type: CalendarDayType.Type03,
						title: "Type03",
						tooltip: "Type03",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						type: CalendarDayType.Type04,
						title: "Type04",
						tooltip: "Type04",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						type: CalendarDayType.Type05,
						title: "Type05",
						tooltip: "Type05",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						type: CalendarDayType.Type06,
						title: "Type06",
						tooltip: "Type06",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						type: CalendarDayType.Type07,
						title: "Type07",
						tooltip: "Type07",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						type: CalendarDayType.Type08,
						title: "Type08",
						tooltip: "Type08",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						type: CalendarDayType.Type09,
						title: "Type09",
						tooltip: "Type09",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H10", {
						startDate: UI5Date.getInstance("2015", "0", "1", "17", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "17", "59"),
						type: CalendarDayType.Type10,
						title: "Type10",
						tooltip: "Type10",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R3H11", {
						startDate: UI5Date.getInstance("2015", "0", "1", "18", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "18", "59"),
						type: CalendarDayType.None,
						title: "None",
						tooltip: "None",
						icon: "sap-icon://palette"
					})
				],
				appointments: [
					new CalendarAppointment("R3A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						type: CalendarDayType.Type01,
						title: "Type01",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 1"
					}),
					new CalendarAppointment("R3A2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						type: CalendarDayType.Type02,
						title: "Type02",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 2"
					}),
					new CalendarAppointment("R3A3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						type: CalendarDayType.Type03,
						title: "Type03",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R3A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						type: CalendarDayType.Type04,
						title: "Type04",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 4"
					}),
					new CalendarAppointment("R3A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						type: CalendarDayType.Type05,
						title: "Type05",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 5"
					}),
					new CalendarAppointment("R3A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						type: CalendarDayType.Type06,
						title: "Type06",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 6"
					}),
					new CalendarAppointment("R3A7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						type: CalendarDayType.Type07,
						title: "Type07",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 7"
					}),
					new CalendarAppointment("R3A8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						type: CalendarDayType.Type08,
						title: "Type08",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 8"
					}),
					new CalendarAppointment("R3A9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						type: CalendarDayType.Type09,
						title: "Type09",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 9"
					}),
					new CalendarAppointment("R3A10", {
						startDate: UI5Date.getInstance("2015", "0", "1", "17", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "17", "59"),
						type: CalendarDayType.Type10,
						title: "Type10",
						icon: "sap-icon://palette",
						tooltip: "Tooltip 10"
					}),
					new CalendarAppointment("R3A11", {
						startDate: UI5Date.getInstance("2015", "0", "1", "18", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "18", "59"),
						type: CalendarDayType.None,
						title: "None",
						icon: "sap-icon://palette",
						tooltip: "None"
					})
				]
			}),
			new PlanningCalendarRow("Row4", {
				title: "Custom Color",
				tooltip: "Custom Colors",
				intervalHeaders: [
					new CalendarAppointment("R4H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						color: "#c14646",
						title: "Red",
						tooltip: "Red",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4H2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						color: "#759421",
						title: "Green",
						tooltip: "Green",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4H3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						color: "#0092d1",
						title: "Blue",
						tooltip: "Blue",
						icon: "sap-icon://palette"
					})
				],
				appointments: [
					new CalendarAppointment("R4A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
						color: "#e09d00",
						title: "#e09d00",
						tooltip: "#e09d00",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
						color: "#e6600d",
						title: "#e6600d",
						tooltip: "#e6600d",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A3", {
						startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
						color: "#c14646",
						title: "#c14646",
						tooltip: "#c14646",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
						color: "#853808",
						title: "#853808",
						tooltip: "#853808",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
						color: "#de54c1",
						title: "#de54c1",
						tooltip: "#de54c1",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
						color: "#0092d1",
						title: "#0092d1",
						tooltip: "#0092d1",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A7", {
						startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
						color: "#1a9898",
						title: "#1a9898",
						tooltip: "#1a9898",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A8", {
						startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
						color: "#759421",
						title: "#759421",
						tooltip: "#759421",
						icon: "sap-icon://palette"
					}),
					new CalendarAppointment("R4A9", {
						startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
						color: "#1fbbff",
						title: "#1fbbff",
						tooltip: "#1fbbff",
						icon: "sap-icon://palette"
					})
				]
			}),
			new PlanningCalendarRow("Row5", {
				icon: "sap-icon://employee",
				title: "Appointments of the same type",
				tooltip: "Header tooltip",
				intervalHeaders: [
					new CalendarAppointment("R5H1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						type: CalendarDayType.Type02,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
				],
				appointments: [
					new CalendarAppointment("R5A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
						type: CalendarDayType.Type02,
						title: "2 days meeting",
						icon: "../ui/unified/images/m_01.png",
						tooltip: "2 days meeting",
						text: "Room 1"
					}),
					new CalendarAppointment("R5A2", {
						startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
						endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
						type: CalendarDayType.Type02,
						title: "Appointment 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip 2",
						text: "Home",
						tentative: true
					}),
					new CalendarAppointment("R5A3", {
						startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
						type: CalendarDayType.Type02,
						title: "Blocker 3",
						icon: "sap-icon://home",
						tooltip: "Tooltip 3"
					}),
					new CalendarAppointment("R5A4", {
						startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
						endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
						type: CalendarDayType.Type02,
						title: "Meeting 4",
						tooltip: "Tooltip 4",
						selected: true
					}),
					new CalendarAppointment("R5A5", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
						endDate: UI5Date.getInstance("2015", "0", "1", "11", "30"),
						type: CalendarDayType.Type02,
						title: "Meeting 5",
						tooltip: "Tooltip 5",
						selected: true
					}),
					new CalendarAppointment("R5A6", {
						startDate: UI5Date.getInstance("2015", "0", "1", "11", "30"),
						endDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
						type: CalendarDayType.Type02,
						title: "Meeting 5",
						tooltip: "Tooltip 5",
						selected: true
					})
				]
			})
		],
		specialDates: [
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 1, 12, 0),
				endDate: UI5Date.getInstance(2015, 0, 1, 14, 0),
				type: CalendarDayType.Type01,
				tooltip: "Lunch"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 6),
				type: CalendarDayType.Type02,
				tooltip: "Heilige 3 Könige"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 10),
				type: CalendarDayType.Type01,
				secondaryType: CalendarDayType.Working,
				tooltip: "Lunch"
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 6),
				type: CalendarDayType.NonWorking
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 1, 1),
				endDate: UI5Date.getInstance(2015, 1, 3),
				type: CalendarDayType.Type03,
				tooltip: "Test",
				secondaryType: CalendarDayType.NonWorking
			}),
			new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 1, 4),
				endDate: UI5Date.getInstance(2015, 1, 4),
				type: CalendarDayType.Type03,
				color:"#4b0082",
				tooltip: "Test"
			})
		],
		toolbarContent: [
			oTitle,
			oButtonLegend
		],
		legend: oLegend,
		intervalSelect: handleIntervalSelect,
		appointmentSelect: handleAppointmentSelect,
		startDateChange: handleStartDateChange,
		rowHeaderPress: handleRowHeaderPress,
		rowSelectionChange: handleRowSelectionChange
	});

	var page1 = new Page("page1", {
		title: "PlanningCalendar Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [
			oPC1
		]
	}).addStyleClass("sapUiContentPadding");

	app.setModel(oModel);
	app.addPage(page1);

	app.placeAt("body");
});
