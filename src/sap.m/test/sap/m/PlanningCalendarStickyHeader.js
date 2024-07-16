sap.ui.define([
  "sap/m/Popover",
  "sap/ui/core/Element",
  "sap/m/App",
  "sap/m/Label",
  "sap/m/Bar",
  "sap/m/Input",
  "sap/m/Button",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/MultiComboBox",
  "sap/m/PlanningCalendarRow",
  "sap/ui/unified/library",
  "sap/ui/unified/CalendarAppointment",
  "sap/ui/core/format/DateFormat",
  "sap/m/Title",
  "sap/m/PlanningCalendar",
  "sap/ui/unified/DateTypeRange",
  "sap/m/Page",
  "sap/base/Log"
], function(
  Popover,
  Element,
  App,
  Label,
  Bar,
  Input,
  Button,
  Select,
  Item,
  MultiComboBox,
  PlanningCalendarRow,
  unifiedLibrary,
  CalendarAppointment,
  DateFormat,
  Title,
  PlanningCalendar,
  DateTypeRange,
  Page,
  Log
) {
  "use strict";

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // Note: the HTML page 'PlanningCalendarStickyHeader.html' loads this module via data-sap-ui-on-init

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");
  var app = new App("myApp");

  var oEventLabel = new Label({text: "Events log"});
  function createFooter(){
	  return new Bar({
		  contentLeft: new Input("inputFocusHelper", {value: "VisualTest focus helper, Don't remove."}),
		  contentMiddle: [new Button({
			  text: "PlanningCalendar",
			  press: function(){
				  app.to("page1");
			  }
		  })],
		  contentRight: [
			  oEventLabel,
			  new Button({
				  text: "Show empty interval headers",
				  press: function() {
					  var bSEIH = oPC1.getShowEmptyIntervalHeaders();
					  oPC1.setShowEmptyIntervalHeaders(!bSEIH);
				  }
			  }),
			  new Select('select_width', {
				  items: [
					  new Item('select_width_item_0', {
						  text: '100%',
						  key: '100%'
					  }),
					  new Item('select_width_item_1', {
						  text: 'x < 600px',
						  key: '500px'
					  }),
					  new Item('select_width_item_2', {
						  text: '600px < x < 1024px',
						  key: '700px'
					  }),
					  new Item('select_width_item_3', {
						  text: '1024px < x',
						  key: '1200px'
					  })
				  ],
				  change: function(oEvent) {
					  var sSelectedWidth = oEvent.getParameter('selectedItem').getKey();
					  Element.getElementById('PC1').setWidth(sSelectedWidth);
				  }
			  }),
			  new MultiComboBox({
				  id : "MCB1",
				  width: "230px",
				  placeholder : "Choose built-in views",
				  items : [
					  oItem20 = new Item({
						  key : "Hour",
						  text : "Hour"
					  }),

					  oItem21 = new Item({
						  key : "Day",
						  text : "Day"
					  }),

					  oItem22 = new Item({
						  key : "Month",
						  text : "Month"
					  }),

					  oItem23 = new Item({
						  key : "Week",
						  text : "1 week"
					  }),

					  oItem24 = new Item({
						  key : "One Month",
						  text : "1 month"
					  })
				  ],
				  selectionFinish : function(oEvent) {
					  var aSelectedKeys = this.getSelectedKeys();
					  oPC1.setBuiltInViews(aSelectedKeys);
				  }
			  })
		  ]
	  });
  }

  var handleAppointmentSelect = function(oEvent){
	  var oInput = Element.getElementById("I1"),
		  oAppointment = oEvent.getParameter("appointment"),
		  sPopoverValue,
		  bDiffType,
		  aAppointments,
		  sValue,
		  sGroupAppointmentType,
		  sGroupAppDomRefId = oEvent.getParameter("domRefId"),
		  sTitle,
		  i;

	  if (oAppointment) {
		  oInput.setValue("Appointment selected: " + oAppointment.getId());
		  sPopoverValue = "Appointment selected: " + oAppointment.getId();
		  sTitle = "Appointment";
	  } else {
		  aAppointments = oEvent.getParameter("appointments");
		  sValue = aAppointments.length + " Appointments selected: ";
		  sGroupAppointmentType = aAppointments[0].getType();
		  sTitle = "Group Appointment";
		  for (i = 1; i < aAppointments.length; i++) {
			  if (sGroupAppointmentType !== aAppointments[i].getType()) {
				  bDiffType = true;
			  }
			  sValue = sValue + aAppointments[i].getId() + " ";
		  }
		  oInput.setValue(sValue);
		  if (bDiffType) {
			  sPopoverValue = aAppointments.length + " Appointments of different types selected";
		  } else {
			  sPopoverValue = aAppointments.length + " Appointments of " + sGroupAppointmentType + " selected";
		  }
	  }
	  var oPopover = new Popover({
		  title: sTitle,
		  content: new Label({
			  text: sPopoverValue
		  })
	  });
	  oPopover.addStyleClass("sapUiContentPadding");
	  oPopover.openBy(document.getElementById(sGroupAppDomRefId));
	  setEventLog("'appointmentSelect' for appointment: " + (oAppointment ? oAppointment.getTitle() : "<no app>"));
  };

  var handleStartDateChange = function(oEvent) {
	  var oDf = DateFormat.getTimeInstance("HH:mm:ss");
	  setEventLog("startDateChange event at " + oDf.format(UI5Date.getInstance()) + " with params:"  + JSON.stringify(oEvent.mParameters));
  };

  var handleRowSelectionChange = function(oEvent) {
	  var oRows = oEvent.getParameter("rows"),
		  sValue = oRows.length + " row(s) selected";
	  setEventLog("rowSelectionChange:" + sValue);
  };

  //adds some event info to the event log label
  function setEventLog(sMessage) {
	  oEventLabel.setText(sMessage);
  }

  var oTitle = new Title("Title1", {
	  text: "Title"
  });

  var oPC1 = PlanningCalendar("PC1", {
	  stickyHeader: true,
	  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
	  rows: [ new PlanningCalendarRow("Row1", {
				  icon: "sap-icon://employee",
				  title: "Max Mustermann",
				  text: "Musterteam",
				  tooltip: "Header tooltip",
				  intervalHeaders: [ new CalendarAppointment("R1H1",{
									  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
									  type: CalendarDayType.Type02,
									  title: "SAPUI5",
									  tooltip: "Test",
									  icon: "sap-icon://sap-ui5"
									 })
								   ],
				  appointments: [ new CalendarAppointment("R1A1", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
									  type: CalendarDayType.Type03,
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
				  icon: "../ui/unified/images/m_01.png",
				  title: "Edward",
				  text: "the great",
				  tooltip: "Header tooltip",
				  intervalHeaders: [ new CalendarAppointment("R2H1",{
									  startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
									  type: CalendarDayType.Type01,
									  title: "SAPUI5",
									  tooltip: "Test",
									  icon: "sap-icon://sap-ui5"
									 })
								   ],
				  appointments: [ new CalendarAppointment("R2A1", {
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
					  intervalHeaders: [ new CalendarAppointment("R3H1",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "08", "59"),
										  type: CalendarDayType.Type01,
										  title: "Type01",
										  tooltip: "Type01",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H2",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "09", "59"),
										  type: CalendarDayType.Type02,
										  title: "Type02",
										  tooltip: "Type02",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H3",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
										  type: CalendarDayType.Type03,
										  title: "Type03",
										  tooltip: "Type03",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H4",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "11", "59"),
										  type: CalendarDayType.Type04,
										  title: "Type04",
										  tooltip: "Type04",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H5",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "12", "59"),
										  type: CalendarDayType.Type05,
										  title: "Type05",
										  tooltip: "Type05",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H6",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
										  type: CalendarDayType.Type06,
										  title: "Type06",
										  tooltip: "Type06",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H7",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "14", "59"),
										  type: CalendarDayType.Type07,
										  title: "Type07",
										  tooltip: "Type07",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H8",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "15", "59"),
										  type: CalendarDayType.Type08,
										  title: "Type08",
										  tooltip: "Type08",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H9",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "16", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
										  type: CalendarDayType.Type09,
										  title: "Type09",
										  tooltip: "Type09",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H10",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "17", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "17", "59"),
										  type: CalendarDayType.Type10,
										  title: "Type10",
										  tooltip: "Type10",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R3H11",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "18", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "18", "59"),
										  type: CalendarDayType.None,
										  title: "None",
										  tooltip: "None",
										  icon: "sap-icon://palette"
										 })
									   ],
					  appointments: [ new CalendarAppointment("R3A1", {
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
					  icon: "sap-icon://palette",
					  title: "Custom Color",
					  tooltip: "Custom Colors",
					  intervalHeaders: [ new CalendarAppointment("R4H1",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "10", "59"),
										  color: "#c14646",
										  title: "Red",
										  tooltip: "Red",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R4H2",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "13", "59"),
										  color: "#759421",
										  title: "Green",
										  tooltip: "Green",
										  icon: "sap-icon://palette"
										 }),
										 new CalendarAppointment("R4H3",{
										  startDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
										  endDate: UI5Date.getInstance("2015", "0", "1", "16", "59"),
										  color: "#0092d1",
										  title: "Blue",
										  tooltip: "Blue",
										  icon: "sap-icon://palette"
										 })
									   ],
					  appointments: [ new CalendarAppointment("R4A1", {
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
					  }), new PlanningCalendarRow({
						  icon: "sap-icon://employee",
						  title: "Max Mustermann",
						  text: "Musterteam",
						  tooltip: "Header tooltip",
						  intervalHeaders: [ new CalendarAppointment({
											  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
											  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
											  type: CalendarDayType.Type02,
											  title: "SAPUI5",
											  tooltip: "Test",
											  icon: "sap-icon://sap-ui5"
											 })
										   ],
						  appointments: [ new CalendarAppointment({
											  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
											  endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
											  type: CalendarDayType.Type03,
											  title: "2 days meeting",
											  icon: "../ui/unified/images/m_01.png",
											  tooltip: "2 days meeting",
											  text: "Room 1"
										  }),
										  new CalendarAppointment({
											  startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
											  endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
											  type: CalendarDayType.Type06,
											  title: "Appointment 2",
											  icon: "sap-icon://home",
											  tooltip: "Tooltip 2",
											  text: "Home",
											  tentative: true
										  }),
										  new CalendarAppointment({
											  startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
											  endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
											  type: CalendarDayType.Type02,
											  title: "Blocker 3",
											  icon: "sap-icon://home",
											  tooltip: "Tooltip 3"
										  }),
										  new CalendarAppointment({
											  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
											  endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
											  type: CalendarDayType.Type09,
											  title: "Meeting 4",
											  tooltip: "Tooltip 4",
											  selected: true
										  })
										]
						  }), new PlanningCalendarRow({
							  icon: "sap-icon://employee",
							  title: "Max Mustermann",
							  text: "Musterteam",
							  tooltip: "Header tooltip",
							  intervalHeaders: [ new CalendarAppointment({
												  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
												  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
												  type: CalendarDayType.Type02,
												  title: "SAPUI5",
												  tooltip: "Test",
												  icon: "sap-icon://sap-ui5"
												 })
											   ],
							  appointments: [ new CalendarAppointment({
												  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
												  endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
												  type: CalendarDayType.Type03,
												  title: "2 days meeting",
												  icon: "../ui/unified/images/m_01.png",
												  tooltip: "2 days meeting",
												  text: "Room 1"
											  }),
											  new CalendarAppointment({
												  startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
												  endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
												  type: CalendarDayType.Type06,
												  title: "Appointment 2",
												  icon: "sap-icon://home",
												  tooltip: "Tooltip 2",
												  text: "Home",
												  tentative: true
											  }),
											  new CalendarAppointment({
												  startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
												  endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
												  type: CalendarDayType.Type02,
												  title: "Blocker 3",
												  icon: "sap-icon://home",
												  tooltip: "Tooltip 3"
											  }),
											  new CalendarAppointment({
												  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
												  endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
												  type: CalendarDayType.Type09,
												  title: "Meeting 4",
												  tooltip: "Tooltip 4",
												  selected: true
											  })
											]
							  }), new PlanningCalendarRow({
								  icon: "sap-icon://employee",
								  title: "Max Mustermann",
								  text: "Musterteam",
								  tooltip: "Header tooltip",
								  intervalHeaders: [ new CalendarAppointment({
													  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
													  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
													  type: CalendarDayType.Type02,
													  title: "SAPUI5",
													  tooltip: "Test",
													  icon: "sap-icon://sap-ui5"
													 })
												   ],
								  appointments: [ new CalendarAppointment({
													  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
													  endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
													  type: CalendarDayType.Type03,
													  title: "2 days meeting",
													  icon: "../ui/unified/images/m_01.png",
													  tooltip: "2 days meeting",
													  text: "Room 1"
												  }),
												  new CalendarAppointment({
													  startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
													  endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
													  type: CalendarDayType.Type06,
													  title: "Appointment 2",
													  icon: "sap-icon://home",
													  tooltip: "Tooltip 2",
													  text: "Home",
													  tentative: true
												  }),
												  new CalendarAppointment({
													  startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
													  endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
													  type: CalendarDayType.Type02,
													  title: "Blocker 3",
													  icon: "sap-icon://home",
													  tooltip: "Tooltip 3"
												  }),
												  new CalendarAppointment({
													  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
													  endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
													  type: CalendarDayType.Type09,
													  title: "Meeting 4",
													  tooltip: "Tooltip 4",
													  selected: true
												  })
												]
								  }),
					  new PlanningCalendarRow("Row5", {
						  icon: "sap-icon://employee",
						  title: "Appointments of the same type",
						  tooltip: "Header tooltip",
						  intervalHeaders: [ new CalendarAppointment("R5H1",{
							  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
							  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
							  type: CalendarDayType.Type02,
							  title: "SAPUI5",
							  tooltip: "Test",
							  icon: "sap-icon://sap-ui5"
						  })
						  ],
						  appointments: [ new CalendarAppointment("R5A1", {
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
							  })
						  ]
					  })
		  ],
	  specialDates: [ new DateTypeRange({
						  startDate: UI5Date.getInstance(2015, 0, 1, 12, 00),
						  endDate: UI5Date.getInstance(2015, 0, 1, 14, 00),
						  type: CalendarDayType.Type01,
						  tooltip: "Lunch"
					  }),
					  new DateTypeRange({
						  startDate: UI5Date.getInstance(2015, 0, 6),
						  type: CalendarDayType.Type02,
						  tooltip: "Heilige 3 Könige"
					  }),
					  new DateTypeRange({
						  startDate: UI5Date.getInstance(2015, 1, 1),
						  endDate: UI5Date.getInstance(2015, 1, 3),
						  type: CalendarDayType.Type03,
						  tooltip: "Test"
					  })
					],
	  toolbarContent: [oTitle],
	  appointmentSelect: handleAppointmentSelect,
	  startDateChange: handleStartDateChange,
	  rowSelectionChange: handleRowSelectionChange
  });

  var oInput = new Input("I1", {
	  editable: false,
	  width: "100%"
  });

  var page1 = new Page("page1", {
	  title:"Mobile PlanningCalendar",
	  content : [
		  oPC1,
		  oInput
	  ],
	  footer: createFooter()
  });

  app.addPage(page1);

  app.placeAt("body");
});