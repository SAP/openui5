sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/App",
  "sap/m/Switch",
  "sap/m/OverflowToolbarLayoutData",
  "sap/m/Label",
  "sap/m/Bar",
  "sap/m/Button",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Title",
  "sap/m/PlanningCalendar",
  "sap/m/PlanningCalendarRow",
  "sap/ui/unified/CalendarAppointment",
  "sap/ui/unified/library",
  "sap/m/Page"
], function(
  Element,
  App,
  Switch,
  OverflowToolbarLayoutData,
  Label,
  Bar,
  Button,
  Select,
  Item,
  Title,
  PlanningCalendar,
  PlanningCalendarRow,
  CalendarAppointment,
  unifiedLibrary,
  Page
) {
  "use strict";

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // Note: the HTML page 'PlanningCalendarAppointmentSize.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");
  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");
  var oButtonSwitchReducedHeight = new Switch("reduced_height",{
	  state: false,
	  change: function (oEvent) {
		  oEvent.getParameter("state");
	  },
	  layoutData: new OverflowToolbarLayoutData({
		  group: 1
	  })
  });

  var oLegendLabelHeight = new Label({
	  text: "Activate Reduced Height",
	  labelFor: oButtonSwitchReducedHeight.getId(),
	  layoutData: new OverflowToolbarLayoutData({
		  group: 1
	  })
  });

  var oEventLabel = new Label({text: "Events log"});
  function createFooter(){
	  return new Bar({
		  contentMiddle: [new Button({
			  text: "PlanningCalendar",
			  press: function(){
				  app.to("page1");
			  }
		  })],
		  contentRight: [
			  oLegendLabelHeight,
			  oButtonSwitchReducedHeight,
			  oEventLabel,
			  new Select('select_height', {
				  items: [
					  new Item('Regular', {
						  text: 'Regular',
						  key: 'Regular'
					  }),
					  new Item('Half-Size', {
						  text: 'Half-Size',
						  key: 'HalfSize'
					  }),
					  new Item('Large', {
						  text: 'Large',
						  key: 'Large'
					  }),
					  new Item('Automatic', {
						  text: 'Automatic',
						  key: 'Automatic'
					  })
				  ],
				  change: function(oEvent) {
					  var sSelectedSize = oEvent.getParameter('selectedItem').getKey();
					  oPC1.setAppointmentHeight(sSelectedSize);
				  }
			  }),
			  new Select('select_rounding', {
				  items: [
					  new Item('None', {
						  text: 'None',
						  key: 'None'
					  }),
					  new Item('halfColumn', {
						  text: 'Half Column',
						  key: 'HalfColumn'
					  })
				  ],
				  change: function(oEvent) {
					  var sSelectedRouding = oEvent.getParameter('selectedItem').getKey();
					  oPC1.setAppointmentRoundWidth(sSelectedRouding);
				  }
			  }),
			  new Select('select_width', {
				  items: [
					  new Item('select_width_item_0', {
						  text: '100%',
						  key: '100%'
					  }),
					  new Item('select_width_item_3', {
						  text: '1024px < x',
						  key: '1200px'
					  })
				  ],
				  change: function (oEvent) {
					  var sSelectedWidth = oEvent.getParameter('selectedItem').getKey();
					  Element.getElementById('PC1').setWidth(sSelectedWidth);
				  }
			  }),
		  ]
	  });
  }

  var oTitle = new Title("Title1", {
	  text: "Title"
  });

  var oPC1 = new PlanningCalendar("PC1", {
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
				  appointments: [
								  new CalendarAppointment("R1A1", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "2", "09", "00"),
									  type: CalendarDayType.Type03,
									  title: "2 days meeting",
									  icon: "../ui/unified/images/m_01.png",
									  tooltip: "2 days meeting",
									  text: "Room 1"
								  }),
								  new CalendarAppointment("R1A2", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "10", "15"),
									  type: CalendarDayType.Type03,
									  title: "1/2 hour meeting",
									  icon: "../ui/unified/images/m_01.png",
									  tooltip: "1/2 hour meeting",
								  }),
								  new CalendarAppointment("R1A12", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
									  type: CalendarDayType.Type03,
									  title: "1 hour meeting",
									  icon: "../ui/unified/images/m_01.png",
									  tooltip: "1 hour meeting",
								  }),
								  new CalendarAppointment("R1A21", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "11", "15"),
									  type: CalendarDayType.Type03,
									  title: "1/2 hour meeting",
									  icon: "../ui/unified/images/m_01.png",
									  tooltip: "1/2 hour meeting",
									  text: "Private"
								  }),
								  new CalendarAppointment("R1A122", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "11", "45"),
									  type: CalendarDayType.Type03,
									  title: "1 hour meeting",
									  icon: "../ui/unified/images/m_01.png",
									  tooltip: "1 hour meeting",
								  }),
								  new CalendarAppointment("R1A3", {
									  startDate: UI5Date.getInstance("2014", "11", "31", "10", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "3", "09", "00"),
									  type: CalendarDayType.Type06,
									  title: "Appointment 2",
									  icon: "sap-icon://home",
									  tooltip: "Tooltip 2",
									  text: "Home",
									  tentative: true
								  }),
								  new CalendarAppointment("R1A4", {
									  startDate: UI5Date.getInstance("2014", "11", "31", "08", "30"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
									  type: CalendarDayType.Type02,
									  title: "Blocker 3",
									  icon: "sap-icon://home",
									  tooltip: "Tooltip 3",
									  text: "Day off"
								  }),
								  new CalendarAppointment("R1A5", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "10", "45"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4",
									  text: "Online",
									  description: "Private meeting",
									  selected: true
								  }),
								  new CalendarAppointment("R1A5A", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4",
									  text: "Online",
									  description: "Private meeting"
								  }),
								  new CalendarAppointment("R1A5B", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4",
									  description: "Private meeting"
								  }),
								  new CalendarAppointment("R1A5C", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "13", "0"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
								  new CalendarAppointment("R1A5D", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
								  new CalendarAppointment("R1A5E", {
									  startDate: UI5Date.getInstance("2015", "0", "1", "13", "00"),
									  endDate: UI5Date.getInstance("2015", "0", "1", "14", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
								  new CalendarAppointment("R1A5F", {
									  startDate: UI5Date.getInstance("2015", "0", "4", "11", "50"),
									  endDate: UI5Date.getInstance("2015", "0", "6", "14", "40"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
								  new CalendarAppointment("R1A5G", {
									  startDate: UI5Date.getInstance("2015", "0", "6", "14", "40"),
									  endDate: UI5Date.getInstance("2015", "0", "8", "14", "38"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
								  new CalendarAppointment("R1A5H", {
									  startDate: UI5Date.getInstance("2015", "0", "8", "14", "38"),
									  endDate: UI5Date.getInstance("2015", "0", "10", "14", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
								  }),
							  ]
					  }),
				  new PlanningCalendarRow("Row2", {
				  icon: "../ui/unified/images/m_01.png",
				  title: "Edward",
				  text: "the great",
				  tooltip: "Header tooltip",
				  appointments: [
					  new CalendarAppointment("R2A2", {
									  startDate: UI5Date.getInstance("2015", "1", "1", "00", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "1", "11", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 1",
									  tooltip: "Tooltip 1"
					  }),
					  new CalendarAppointment("R2A3", {
									  startDate: UI5Date.getInstance("2015", "1", "1", "12", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "1", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 2",
									  tooltip: "Tooltip 2"
					  }),
					  new CalendarAppointment("R2A4", {
									  startDate: UI5Date.getInstance("2015", "1", "2", "00", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "2", "10", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 3",
									  tooltip: "Tooltip 3"
					  }),
					  new CalendarAppointment("R2A5", {
									  startDate: UI5Date.getInstance("2015", "1", "2", "12", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "2", "17", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 4",
									  tooltip: "Tooltip 4"
					  }),
					  new CalendarAppointment("R2A6", {
									  startDate: UI5Date.getInstance("2015", "1", "3", "03", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "3", "10", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 5",
									  tooltip: "Tooltip 5"
					  }),
					  new CalendarAppointment("R2A7", {
									  startDate: UI5Date.getInstance("2015", "1", "3", "15", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "3", "16", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 6",
									  tooltip: "Tooltip 6"
					  }),
					  new CalendarAppointment("R2A8", {
									  startDate: UI5Date.getInstance("2015", "1", "5", "00", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "5", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 7",
									  tooltip: "Tooltip 7"
					  }),
					  new CalendarAppointment("R2A9", {
									  startDate: UI5Date.getInstance("2015", "1", "5", "13", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "6", "11", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 8",
									  tooltip: "Tooltip 8"
					  }),
					  new CalendarAppointment("R2A10", {
									  startDate: UI5Date.getInstance("2015", "1", "6", "10", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "6", "16", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 9",
									  tooltip: "Tooltip 9"
					  }),
					  new CalendarAppointment("R2A11", {
									  startDate: UI5Date.getInstance("2015", "1", "6", "03", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "7", "11", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 10",
									  tooltip: "Tooltip 10"
					  }),
					  new CalendarAppointment("R2A12", {
									  startDate: UI5Date.getInstance("2015", "1", "7", "09", "00"),
									  endDate: UI5Date.getInstance("2015", "1", "7", "18", "00"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 11",
									  tooltip: "Tooltip 11"
					  }),
					  new CalendarAppointment("R2A13", {
									  startDate: UI5Date.getInstance("2015", "1", "8", "12", "21"),
									  endDate: UI5Date.getInstance("2015", "1", "8", "15", "14"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 12",
									  tooltip: "Tooltip 12"
					  }),
					  new CalendarAppointment("R2A14", {
									  startDate: UI5Date.getInstance("2015", "1", "8", "16", "12"),
									  endDate: UI5Date.getInstance("2015", "1", "9", "10", "18"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 13",
									  tooltip: "Tooltip 13"
					  }),
					  new CalendarAppointment("R2A15", {
									  startDate: UI5Date.getInstance("2015", "1", "9", "14", "36"),
									  endDate: UI5Date.getInstance("2015", "1", "9", "19", "44"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
					  new CalendarAppointment("R2A16", {
									  startDate: UI5Date.getInstance("2015", "1", "10", "0", "0"),
									  endDate: UI5Date.getInstance("2015", "1", "10", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
					  new CalendarAppointment("R2A17", {
									  startDate: UI5Date.getInstance("2015", "1", "11", "0", "0"),
									  endDate: UI5Date.getInstance("2015", "1", "11", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
					  new CalendarAppointment("R2A18", {
									  startDate: UI5Date.getInstance("2015", "1", "12", "0", "0"),
									  endDate: UI5Date.getInstance("2015", "1", "12", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
					  new CalendarAppointment("R2A19", {
									  startDate: UI5Date.getInstance("2015", "1", "13", "0", "0"),
									  endDate: UI5Date.getInstance("2015", "1", "13", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
					  new CalendarAppointment("R2A20", {
									  startDate: UI5Date.getInstance("2015", "1", "14", "0", "0"),
									  endDate: UI5Date.getInstance("2015", "1", "14", "23", "59"),
									  type: CalendarDayType.Type09,
									  title: "Meeting 14",
									  tooltip: "Tooltip 14"
					  }),
				  ]
				  }),
				  ],
	  toolbarContent: [oTitle]
  });

  var page1 = new Page("page1", {
	  title:"Mobile PlanningCalendar",
	  content : [
		  oPC1
	  ],
	  footer: createFooter()
  });

  app.addPage(page1);

  app.placeAt("body");
});