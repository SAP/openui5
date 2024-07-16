sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/model/type/Date",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/CalendarType",
  "sap/ui/unified/CalendarRow",
  "sap/ui/unified/CalendarAppointment",
  "sap/ui/unified/library",
  "sap/m/Label",
  "sap/m/Input",
  "sap/ui/core/library",
  "sap/m/RadioButtonGroup",
  "sap/m/RadioButton",
  "sap/m/ToggleButton",
  "sap/m/ComboBox",
  "sap/ui/core/Item",
  "sap/ui/unified/CalendarLegend",
  "sap/ui/unified/CalendarLegendItem"
], function(
  Element,
  TypeDate,
  DateFormat,
  CalendarType,
  CalendarRow,
  CalendarAppointment,
  unifiedLibrary,
  Label,
  Input,
  coreLibrary,
  RadioButtonGroup,
  RadioButton,
  ToggleButton,
  ComboBox,
  Item,
  CalendarLegend,
  CalendarLegendItem
) {
  "use strict";

  // shortcut for sap.ui.unified.GroupAppointmentsMode
  const GroupAppointmentsMode = unifiedLibrary.GroupAppointmentsMode;

  // shortcut for sap.ui.unified.CalendarAppointmentVisualization
  const CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

  // shortcut for sap.ui.unified.CalendarIntervalType
  const CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");
  var oFormatYyyyMMddHHmm = DateFormat.getInstance({pattern: "yyyyMMddHHmm", calendarType: CalendarType.Gregorian});

  var handleSelect = function(oEvent){
	  var oTV = Element.getElementById("EventTV");
	  var oAppointment = oEvent.getParameter("appointment");
	  if (oAppointment) {
		  oTV.setText("Appointment selected - ID:" + oAppointment.getId() + " , key:" + oAppointment.getKey());
	  }else {
		  var aAppointments = oEvent.getParameter("appointments");
		  oTV.setText(aAppointments.length + " Appointments selected");
	  }
  };

  var handleIntervalSelect = function(oEvent){
	  var oTV = Element.getElementById("EventTV");
	  var oStartDate = oEvent.getParameter("startDate");
	  var oEndDate = oEvent.getParameter("endDate");
	  var bSubInterval = oEvent.getParameter("subInterval");
	  oTV.setText("Interval selected - Start:" + oFormatYyyyMMddHHmm.format(oStartDate) + " , End:" + oFormatYyyyMMddHHmm.format(oEndDate) + " , SubInterval:" + bSubInterval);
  };

  var handleStartDateChange = function(oEvent){

	  var oRow = oEvent.oSource;
	  var oStartDate = oRow.getStartDate();
	  var oTF = Element.getElementById("TF1");
	  oTF.setValue(oFormatYyyyMMddHHmm.format(oStartDate));

  };

  var oRow1 = new CalendarRow("Row1",  {
		  select: handleSelect,
		  startDateChange: handleStartDateChange,
		  intervalSelect: handleIntervalSelect,
		  legend: "Legend1"
	  }).placeAt("sample1");

  var oStartDate = UI5Date.getInstance();
  oStartDate.setMinutes(oStartDate.getMinutes() + 60);
  var oEndDate = UI5Date.getInstance();
  oEndDate.setMinutes(oEndDate.getMinutes() + 180);
  var oApp = new CalendarAppointment("App1", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.None,
	  title: "Ñagçyfox 1",
	  tooltip: "Tooltip 1",
	  /*text: "Appointment of 2 hours, 1 hour in future",*/
	  key: "A1"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setMinutes(oStartDate.getMinutes() - 60);
  oEndDate = UI5Date.getInstance();
  oEndDate.setMinutes(oEndDate.getMinutes() + 90);
  oApp = new CalendarAppointment("App2", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type01,
	  title: "Ñagçyfox 2",
	  icon: "sap-icon://call",
	  tooltip: "Tooltip 2",
	  text: "Ñagçyfox 2.5 hours, 1 hour in past",
	  key: "A2"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setMinutes(oStartDate.getMinutes() - 180);
  oEndDate = UI5Date.getInstance();
  oEndDate.setMinutes(oEndDate.getMinutes() - 120);
  oApp = new CalendarAppointment("App3", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type02,
	  title: "Appointment 3",
	  tooltip: "Tooltip 3",
	  text: "Appointment of 1 hour, 3 hour in past",
	  key: "A3"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setDate(oStartDate.getDate() - 1);
  oEndDate = UI5Date.getInstance();
  oEndDate.setDate(oEndDate.getDate() + 1);
  oApp = new CalendarAppointment("App4", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type03,
	  title: "Appointment 4",
	  tooltip: "Tooltip 4",
	  text: "Appointment of 3 days, 1 day in past",
	  key: "A4"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setDate(oStartDate.getDate() + 2);
  oStartDate.setHours(0);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setDate(oEndDate.getDate() + 1);
  oEndDate.setMilliseconds(-1);
  oApp = new CalendarAppointment("App5", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type04,
	  title: "Ñagçyfox 5",
	  icon: "images/m_01.png",
	  tooltip: "Tooltip 5",
	  /*text: "Appointment of 1 complete day, 2 days in future",*/
	  key: "A5"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setMonth(oStartDate.getMonth() + 2)
  oStartDate.setDate(1);
  oStartDate.setHours(0);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setMonth(oEndDate.getMonth() + 3);
  oEndDate.setMilliseconds(-1);
  oApp = new CalendarAppointment("App6", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type05,
	  title: "Appointment 6",
	  tooltip: "Tooltip 6",
	  text: "Appointment of 3 complete months, 2 months in future",
	  key: "A6"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setHours(oStartDate.getHours() + 6);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setMinutes(30);
  oApp = new CalendarAppointment("App7", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type06,
	  tentative: true,
	  title: "Appointment 7",
	  tooltip: "Tooltip 7",
	  text: "Appointment of 30 minutes, 6 hour in future",
	  key: "A7"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance(oEndDate.getTime());
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setHours(oStartDate.getHours() + 1);
  oEndDate.setMinutes(0);
  oApp = new CalendarAppointment("App8", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type07,
	  tentative: true,
	  title: "Appointment 8",
	  tooltip: "Tooltip 8",
	  text: "Appointment of 30 minutes, 6.5 hour in future",
	  key: "A8"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setHours(oStartDate.getHours() + 7);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setHours(oEndDate.getHours() + 2);
  oApp = new CalendarAppointment("App9", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type08,
	  title: "Appointment 9",
	  tooltip: "Tooltip 9",
	  key: "A9"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setHours(oEndDate.getHours() + 1);
  oApp = new CalendarAppointment("App10", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type09,
	  title: "Appointment 10",
	  icon: "sap-icon://sap-ui5",
	  tooltip: "Tooltip 10",
	  key: "A10"
  });
  oRow1.addAppointment(oApp);

  oStartDate = UI5Date.getInstance(oEndDate.getTime());
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setHours(oEndDate.getHours() + 2);
  oApp = new CalendarAppointment("App11", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type10,
	  title: "Appointment 11",
	  tooltip: "Tooltip 11",
	  text: "Appointment of 120 minutes, 7 hour in future",
	  key: "A11"
  });
  oRow1.addAppointment(oApp);

  // Interval Headers
  oStartDate = UI5Date.getInstance();
  oStartDate.setHours(oStartDate.getHours() + 1);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setHours(oStartDate.getHours() + 2);
  oApp = new CalendarAppointment("IntervalHead0", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type01,
	  title: "Interval Header 0 - span over 2 Intervals",
	  tooltip: "Test",
	  text: "IntervalHeader of 2 hours, 1 hour in future",
	  key: "I0"
  });
  oRow1.addIntervalHeader(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setDate(oStartDate.getDate() + 2);
  oStartDate.setHours(0);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setDate(oStartDate.getDate() + 1);
  oApp = new CalendarAppointment("IntervalHead1", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.None,
	  title: "Ñagçyfox 1",
	  tooltip: "Test",
	  text: "IntervalHeader of 1 day, 2 days in future",
	  key: "I1"
  });
  oRow1.addIntervalHeader(oApp);

  oStartDate = UI5Date.getInstance();
  oStartDate.setDate(oStartDate.getDate() + 3);
  oStartDate.setHours(0);
  oStartDate.setMinutes(0);
  oStartDate.setSeconds(0);
  oStartDate.setMilliseconds(0);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setDate(oStartDate.getDate() + 1);
  oApp = new CalendarAppointment("IntervalHead2", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type02,
	  title: "Ñagçyfox 2",
	  tooltip: "Test",
	  text: "IntervalHeader of 1 day, 3 days in future",
	  icon: "sap-icon://sap-ui5",
	  key: "I2"
  });
  oRow1.addIntervalHeader(oApp);

  var oLabel = new Label({text: "start date", labelFor: "TF1"}).placeAt("event1");
  var oInput = new Input("TF1",{
	  width:"10rem",
	  value: oFormatYyyyMMddHHmm.format(oRow1.getStartDate()),
	  editable: true,
	  placeholder: "yyyyMMddHHmm",
	  change: function(oEvent){
		  var oTF = oEvent.oSource;
		  var sValue = oEvent.getParameter('newValue');
		  var oRow = Element.getElementById("Row1");
		  var oDate = oFormatYyyyMMddHHmm.parse(sValue);
		  if(oDate) {
			  oRow.setStartDate(oDate);
			  oTF.setValueState(ValueState.None);
		  }else {
			  oTF.setValueState(ValueState.Error);
		  }
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "Interval type", labelFor: "RG1"}).placeAt("event1");
  new RadioButtonGroup("RG1", {
	  columns: 3,
	  buttons: [new RadioButton("I1",{text: CalendarIntervalType.Hour}),
			  new RadioButton("I2",{text: CalendarIntervalType.Day}),
			  new RadioButton("I3",{text: CalendarIntervalType.Month})],
	  select: function(oEvent){
		  var oRow = Element.getElementById("Row1");
		  if(oEvent.getParameter("selectedIndex") == 0){
			  oRow.setIntervalType(CalendarIntervalType.Hour);
		  }else if(oEvent.getParameter("selectedIndex") == 1){
			  oRow.setIntervalType(CalendarIntervalType.Day);
		  }else{
			  oRow.setIntervalType(CalendarIntervalType.Month);
		  }
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "intervals", labelFor: "TF2"}).placeAt("event1");
  var oInput = new Input("TF2",{
	  value: oRow1.getIntervals(),
	  width: "10rem",
	  editable: true,
	  placeholder: "Number",
	  change: function(oEvent){
		  var oTF = oEvent.oSource;
		  var sValue = oEvent.getParameter('newValue');
		  var oRow = Element.getElementById("Row1");
		  if(isNaN(sValue)) {
			  oTF.setValueState(ValueState.Error);
		  }else {
			  oTF.setValueState(ValueState.None);
			  oRow.setIntervals(parseInt(sValue));
		  }
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "NonWorkingDays",
	  pressed: true,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  if (bPressed) {
			  oRow1.setNonWorkingDays([1,3]);
		  } else {
			  oRow1.setNonWorkingDays([]);
		  }
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "NonWorkingHours",
	  pressed: false,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  if (bPressed) {
			  oRow1.setNonWorkingHours([0,1,2,3,4,5,6,18,19,20,21,22,23]);
		  } else {
			  oRow1.setNonWorkingHours();
		  }
	  }
  }).placeAt("event1");

  oStartDate = UI5Date.getInstance();
  oStartDate.setMinutes(oStartDate.getMinutes() + 180);
  oEndDate = UI5Date.getInstance(oStartDate.getTime());
  oEndDate.setMinutes(oEndDate.getMinutes() + 120);
  var oExtraApp = new CalendarAppointment("ExtraApp", {
	  startDate: oStartDate,
	  endDate: oEndDate,
	  type: CalendarDayType.Type10,
	  title: "Extra Appointment",
	  icon: "sap-icon://sap-ui5",
	  tooltip: "Extra",
	  text: "This is a extra appointment!"
  });

  oButton = new ToggleButton({
	  text: "extra appointment",
	  pressed: false,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  if (bPressed) {
			  oRow1.addAppointment(oExtraApp);
		  } else {
			  oRow1.removeAppointment(oExtraApp);
		  }
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "Subintervals",
	  pressed: false,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  oRow1.setShowSubIntervals(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "IntervalHeaders",
	  pressed: true,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  oRow1.setShowIntervalHeaders(bPressed);
		  var oButtonEmpty = Element.getElementById("B-Empty");
		  oButtonEmpty.setVisible(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton("B-Empty", {
	  text: "EmptyIntervalHeaders",
	  pressed: true,
	  press: function(oEvent){
		  var bPressed = oEvent.getParameter("pressed");
		  oRow1.setShowEmptyIntervalHeaders(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton("B-OneLine", {
	  text: "Single line Appointments",
	  pressed: false,
	  press: function(oEvent){
		  oEvent.getParameter("pressed");
	  }
  }).placeAt("event1");

  new ComboBox("DB-Vis", {
	  selectedKey: CalendarAppointmentVisualization.Standard,
	  items: [
					  new Item("I-1",{text:"Standard", key: CalendarAppointmentVisualization.Standard}),
					  new Item("I-2",{text:"Filled", key: CalendarAppointmentVisualization.Filled})
					  ],
	  change: function(oEvent){
		  var sKey = oEvent.getSource().getSelectedKey();
		  oRow1.setAppointmentsVisualization(sKey);
	  }
  }).placeAt("event1");

  new ComboBox("DB-GroupAppointment", {
	  selectedKey: GroupAppointmentsMode.Collapsed,
	  tooltip: "Group appointment mode",
	  items: [
		  new Item("GAM-I-1",{text:"Collapsed", key: GroupAppointmentsMode.Collapsed}),
		  new Item("GAM-I-2",{text:"Expanded", key: GroupAppointmentsMode.Expanded})
	  ],
	  change: function(oEvent){
		  var sKey = oEvent.getSource().getSelectedKey();
		  oRow1.setGroupAppointmentsMode(sKey);
	  }
  }).placeAt("event1");

  new CalendarRow("Row2",  {
		  select: handleSelect,
		  width: "600px",
		  height: "6rem",
		  intervals: 6,
		  legend: "Legend1",
		  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
		  intervalHeaders: [ new CalendarAppointment("R2H1",{
								  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
								  type: CalendarDayType.Type01,
								  title: "Ñagçyfox",
								  tooltip: "Test",
								  icon: "sap-icon://sap-ui5"
								})
							],
		  appointments: [ new CalendarAppointment("R2A1", {
								  startDate: UI5Date.getInstance("2015", "0", "1", "08", "00"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
								  type: CalendarDayType.Type01,
								  title: "Ñagçyfox 1",
								  icon: "images/m_01.png",
								  tooltip: "Tooltip 1",
								  text: "Ñagçyfox 1"
							  }),
						  new CalendarAppointment("R2A2", {
								  startDate: UI5Date.getInstance("2015", "0", "1", "08", "15"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
								  type: CalendarDayType.Type02,
								  title: "Ñagçyfox 2",
								  icon: "sap-icon://home",
								  tooltip: "Tooltip 2",
								  text: "Ñagçyfox 2"
							  }),
						  new CalendarAppointment("R2A3", {
								  startDate: UI5Date.getInstance("2015", "0", "1", "08", "30"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "09", "30"),
								  type: CalendarDayType.Type03,
								  title: "Ñagçyfox 3",
								  icon: "sap-icon://home",
								  tooltip: "Tooltip 3"
							  }),
						  new CalendarAppointment("R2A4", {
								  startDate: UI5Date.getInstance("2015", "0", "1", "08", "45"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "09", "45"),
								  type: CalendarDayType.Type04,
								  title: "Ñagçyfox 4",
								  tooltip: "Tooltip 4"
							  }),
						  new CalendarAppointment("R2A5", {
								  startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
								  endDate: UI5Date.getInstance("2015", "0", "1", "10", "00"),
								  type: CalendarDayType.Type05,
								  title: "Ñagçyfox 5",
								  tooltip: "Tooltip 5"
							  })
						 ]
	  }).placeAt("sample2");

  new CalendarLegend("Legend1", {
	  items: [
			  new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "Typ 1"}),
			  new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "Typ 2"}),
			  new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "Typ 3"}),
			  new CalendarLegendItem("T4", {type: CalendarDayType.Type04, text: "Typ 4"}),
			  new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "Typ 5"}),
			  new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "Typ 6"}),
			  new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "Typ 7"}),
			  new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "Typ 8"}),
			  new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "Typ 9"}),
			  new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Typ 10"}),
			  ]
  }).placeAt("legend");

  // exent text output
  oEventText = new Label("EventTV", {
	  text: "event text"
  }).placeAt("eventText");
});