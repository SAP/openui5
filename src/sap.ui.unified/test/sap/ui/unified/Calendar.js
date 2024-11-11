sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/model/type/Date",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Text",
  "sap/ui/core/Popup",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/CalendarType",
  "sap/ui/core/format/DateFormat",
  "sap/ui/unified/Calendar",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/ResponsiveGridLayout",
  "sap/ui/layout/library",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/m/ToggleButton",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/unified/DateRange",
  "sap/m/Input",
  "sap/m/ComboBox",
  "sap/ui/core/ListItem",
  "sap/ui/core/Item",
  "sap/m/Select",
  "sap/ui/core/library",
  "sap/m/RadioButtonGroup",
  "sap/m/RadioButton",
  "sap/ui/unified/CalendarLegend",
  "sap/ui/unified/CalendarLegendItem",
  "sap/ui/unified/library"
], function(
  Element,
  TypeDate,
  Button,
  Label,
  Text,
  Popup,
  JSONModel,
  CalendarType,
  DateFormat,
  Calendar,
  Form,
  ResponsiveGridLayout,
  layoutLibrary,
  FormContainer,
  FormElement,
  ToggleButton,
  DateTypeRange,
  DateRange,
  Input,
  ComboBox,
  ListItem,
  Item,
  Select,
  coreLibrary,
  RadioButtonGroup,
  RadioButton,
  CalendarLegend,
  CalendarLegendItem,
  unifiedLibrary
) {
  "use strict";

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.layout.BackgroundDesign
  const BackgroundDesign = layoutLibrary.BackgroundDesign;

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

  var oCalendars = new JSONModel(CalendarType);

  var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

  var aSpecialDays = [["20160101",undefined,"Neujahr",1],
	  ["20160106",undefined,"Heilige Drei Könige",1],
	  ["20160208",undefined,"Rosenmontag",2],
	  ["20160209",undefined,"Fastnacht",2],
	  ["20160210",undefined,"Aschermittwoch",2],
	  ["20160214",undefined,"Valentinstag",2],
	  ["20160325",undefined,"Karfreitag",1],
	  ["20160327",undefined,"Ostersonntag",1],
	  ["20160328",undefined,"Ostermontag",1],
	  ["20160501",undefined,"Maifeiertag",1],
	  ["20160505",undefined,"Christi Himmelfahrt",1],
	  ["20160508",undefined,"Muttertag",2],
	  ["20160515",undefined,"Pfingstsonntag",1],
	  ["20160516",undefined,"Pfingstmontag",1],
	  ["20160526",undefined,"Fronleichnam",1],
	  ["20160815",undefined,"Mariä Himmelfahrt",2],
	  ["20161002",undefined,"Erntedankfest",2],
	  ["20161003",undefined,"Tag der Deutschen Einheit",1],
	  ["20161031",undefined,"Reformationstag",2],
	  ["20161101",undefined,"Allerheiligen",1],
	  ["20161113",undefined,"Volkstrauertag",2],
	  ["20161116",undefined,"Buß- und Bettag",2],
	  ["20161120",undefined,"Totensonntag",2],
	  ["20161127",undefined,"1. Advent",2],
	  ["20161204",undefined,"2. Advent",2],
	  ["20161206",undefined,"Nikolaus",2],
	  ["20161211",undefined,"3. Advent",2],
	  ["20161218",undefined,"4. Advent",2],
	  ["20161224",undefined,"Heiligabend",2],
	  ["20161225","20141226","Weihnachten",1],
	  ["20161231",undefined,"Silvester",2],
	  ["20170101",undefined,"Neujahr",1],
	  ["20170106",undefined,"Heilige Drei Könige",1],
	  ["20170804","20140810","Urlaub",3],
	  ["20160701",undefined,"Type01",1],
	  ["20160702",undefined,"Type02",2],
	  ["20160703",undefined,"Type03",3],
	  ["20160704",undefined,"Type04",4],
	  ["20160705",undefined,"Type05",5],
	  ["20160706",undefined,"Type06",6],
	  ["20160707",undefined,"Type07",7],
	  ["20160708",undefined,"Type08",8],
	  ["20160709",undefined,"Type09",9],
	  ["20160710",undefined,"Type10",10],
	  ["20200322",undefined,"Type09",9],
	  ["20200323",undefined,"Type09",9]];

  var oCal = new Calendar("Cal1",{
	  legend: "Legend1",
	  showCurrentDateButton: true,
	  select: function(oEvent){
		  var oInput = Element.getElementById("Input1");
		  var oCalendar = oEvent.getSource();
		  var aSelectedDates = oCalendar.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  oDate = aSelectedDates[0].getStartDate();
			  oInput.setValue(oFormatYyyymmdd.format(oDate));
		  } else {
			  oInput.setValue("");
		  }
	  },
	  cancel: function(oEvent){
		  alert("Cancel");
	  },
	  startDateChange: function(oEvent){
		  var oInput = Element.getElementById("Input2");
		  var oCalendar = oEvent.getSource();
		  var oDate = oCalendar.getStartDate();
		  oInput.setValue(oFormatYyyymmdd.format(oDate));
	  }
  }).placeAt("sample1");

  var oForm = new Form("F1", {
	  editable: true,
	  layout: new ResponsiveGridLayout("L1", {
		  breakpointM: 350,
		  labelSpanL: 6,
		  labelSpanM: 6,
		  backgroundDesign: BackgroundDesign.Transparent
	  }),
	  width: "100%"
  }).placeAt("event1");

  var oFormContainer = new FormContainer("F1C1");
  oForm.addFormContainer(oFormContainer);

  var oFormElement = new FormElement("F1E1", {
	  fields: [ new Button({
		  text: "focus today",
		  press: function(oEvent){
			  Element.getElementById("Cal1").focusDate(UI5Date.getInstance());
			  var oInput = Element.getElementById("Input2");
			  var oCalendar = Element.getElementById("Cal1");
			  var oDate = oCalendar.getStartDate();
			  oInput.setValue(oFormatYyyymmdd.format(oDate));
		  }
	  }),
		  new ToggleButton({
			  text: "special days",
			  press: function(oEvent){
				  var bPressed = oEvent.getParameter("pressed");
				  if (bPressed) {
					  for (var i = 0; i < aSpecialDays.length; i++) {
						  var aSpecialDay = aSpecialDays[i];
						  var sType = "";
						  if (aSpecialDay[3] < 10) {
							  sType = "Type0" + aSpecialDay[3];
						  } else {
							  sType = "Type" + aSpecialDay[3];
						  }
						  Element.getElementById("Cal1").addSpecialDate(new DateTypeRange({
							  startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
							  endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
							  type: sType,
							  tooltip: aSpecialDay[2]
						  }));
					  }
				  } else {
					  Element.getElementById("Cal1").destroySpecialDates();
				  }
			  }
		  }),
		  new ToggleButton({
			  text: "disable days",
			  press: function(oEvent){
				  var bPressed = oEvent.getParameter("pressed");
				  var oCal = Element.getElementById("Cal1");
				  if (bPressed) {
					  var oDate = oCal.getStartDate();
					  if (oDate) {
						  oDate = UI5Date.getInstance(oDate.getTime());
					  } else {
						  oDate = UI5Date.getInstance();
					  }
					  oDate.setDate(2);
					  oCal.addDisabledDate(new DateRange({
						  startDate: oDate
					  }));
					  const oStartDate = UI5Date.getInstance(oDate);
					  oStartDate.setDate(10);
					  const oEndDate = UI5Date.getInstance(oDate);
					  oEndDate.setDate(20);
					  oCal.addDisabledDate(new DateRange({
						  startDate: oStartDate,
						  endDate: oEndDate
					  }));
				  } else {
					  oCal.destroyDisabledDates();
				  }
			  }
		  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E2", {
	  label: "selected date",
	  fields: [ new Input("Input1",{
		  width: "9em",
		  placeholder: "yyyyMMdd",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal1");
			  if (sValue.length == 8 && !isNaN(sValue)) {
				  var oDate = oFormatYyyymmdd.parse(sValue);
				  var aSelectedDates = oCalendar.getSelectedDates();
				  var oDateRange;
				  if (aSelectedDates.length == 0 ) {
					  oDateRange = new DateRange({startDate: oDate});
					  oCalendar.addSelectedDate(oDateRange);
				  } else {
					  oDateRange = aSelectedDates[0];
					  oDateRange.setStartDate(oDate);
				  }
			  } else if (!sValue) {
				  oCalendar.destroySelectedDates();
			  }
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E3", {
	  label: "start date",
	  fields: [ new Input("Input2",{
		  editable: false,
		  width: "9em",
		  placeholder: "yyyyMMdd",
		  value: oFormatYyyymmdd.format(oCal.getStartDate())
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E4", {
	  label: "primary calendar type",
	  fields: [ new ComboBox("CB1",{
		  models: oCalendars,
		  width: "9em",
		  items: {
			  path: "/",
			  template: new ListItem({text:"{}", key:"{}"})
		  },
		  selectionChange: function(oEvent){
			  oEvent.getSource();
			  var oItem = oEvent.getParameter('selectedItem');
			  var oCal = Element.getElementById("Cal1");
			  var sKey = "";
			  if (oItem) {
				  sKey = oItem.getKey();
			  }
			  oCal.setPrimaryCalendarType(sKey);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E5", {
	  label: "secondary calendar type",
	  fields: [ new ComboBox("CB2",{
		  models: oCalendars,
		  width: "9em",
		  items: {
			  path: "/",
			  template: new ListItem({text:"{}", key:"{}"})
		  },
		  selectionChange: function(oEvent){
			  oEvent.getSource();
			  var oItem = oEvent.getParameter('selectedItem');
			  var oCal = Element.getElementById("Cal1");
			  var sKey = "";
			  if (oItem) {
				  sKey = oItem.getKey();
			  }
			  oCal.setSecondaryCalendarType(sKey);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E6", {
	  label: "width",
	  fields: [ new Input("Input3",{
		  width: "9em",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal1");
			  oCalendar.setWidth(sValue);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E7", {
	  label: "min. date",
	  fields: [ new Input("Input-min",{
		  width: "9em",
		  placeholder: "yyyyMMdd",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal1");
			  var oDate;
			  if (sValue.length == 8 && !isNaN(sValue)) {
				  oDate = oFormatYyyymmdd.parse(sValue);
			  }
			  oCalendar.setMinDate(oDate);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E8", {
	  label: "max. date",
	  fields: [ new Input("Input-max",{
		  width: "9em",
		  placeholder: "yyyyMMdd",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal1");
			  var oDate;
			  if (sValue.length == 8 && !isNaN(sValue)) {
				  oDate = oFormatYyyymmdd.parse(sValue);
			  }
			  oCalendar.setMaxDate(oDate);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  // single interval selection
  oCal = new Calendar("Cal2",{
	  intervalSelection: true,
	  ariaLabelledBy: ["H-C2"],
	  select: function(oEvent){
		  var oInput1 = Element.getElementById("Input2-start");
		  var oInput2 = Element.getElementById("Input2-end");
		  var oCalendar = oEvent.getSource();
		  var aSelectedDates = oCalendar.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  oDate = aSelectedDates[0].getStartDate();
			  if (oDate) {
				  oInput1.setValue(oFormatYyyymmdd.format(oDate));
			  } else {
				  oInput1.setValue("");
			  }
			  oDate = aSelectedDates[0].getEndDate();
			  if (oDate) {
				  oInput2.setValue(oFormatYyyymmdd.format(oDate));
			  } else {
				  oInput2.setValue("");
			  }
		  } else {
			  oInput1.setValue("");
			  oInput2.setValue("");
		  }
	  }
  }).placeAt("sample2");

  new Label({text: "selected date from", labelFor: "Input2-start"}).placeAt("event2");
  new Input("Input2-start",{
	  editable: false
  }).placeAt("event2");
  new Label({text: "to", labelFor: "Input2-end"}).placeAt("event2");
  new Input("Input2-end",{
	  editable: false
  }).placeAt("event2");

  oCal = new Calendar("Cal3",{
	  intervalSelection: false,
	  singleSelection: false,
	  firstDayOfWeek: 2,
	  nonWorkingDays: [3, 5],
	  select: function(oEvent){
		  var oLB = Element.getElementById("LB");
		  var oCalendar = oEvent.getSource();
		  var aSelectedDates = oCalendar.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0) {
			  var aItems = oLB.getItems();
			  var oItem;
			  for (var i = 0; i < aSelectedDates.length; i++){
				  oDate = aSelectedDates[i].getStartDate();
				  if (aItems[i]) {
					  oItem = aItems[i];
				  } else {
					  oItem = new Item();
					  oLB.addItem(oItem);
				  }
				  if (oDate) {
					  oItem.setText(oFormatYyyymmdd.format(oDate));
				  } else {
					  oItem.setText("");
				  }
			  }
			  if (aItems.length > aSelectedDates.length) {
				  for (var i = aSelectedDates.length; i < aItems.length; i++){
					  oLB.removeItem(i);
					  aItems[i].destroy();
				  }
			  }
		  } else {
			  oLB.destroyItems();
		  }
	  }
  }).placeAt("sample3");

  new Label({text: "selected dates", labelFor: "LB"}).placeAt("event3");

  new Select("LB",{
	  editable: false,
	  width: "8em"
  }).placeAt("event3");

  new ToggleButton("button5",{
	  text : "Toggle week numbers",
	  press: function (oEvent) {
		  var oCalendar = Element.getElementById("Cal3");
		  oCalendar.setShowWeekNumbers(!oCalendar.getShowWeekNumbers());
	  }
  }).placeAt("event3");

  oCal = new Calendar("Cal4",{
	  months: 2,
	  select: function(oEvent){
		  var oInput = Element.getElementById("Input4");
		  var oCalendar = oEvent.getSource();
		  var aSelectedDates = oCalendar.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  oDate = aSelectedDates[0].getStartDate();
			  oInput.setValue(oFormatYyyymmdd.format(oDate));
		  } else {
			  oInput.setValue("");
		  }
	  },
	  cancel: function(oEvent){
		  alert("Cancel");
	  }
  }).placeAt("sample4");

  oForm = new Form("F4", {
	  layout: new ResponsiveGridLayout("L4", {
		  breakpointM: 350,
		  labelSpanL: 6,
		  labelSpanM: 6,
		  backgroundDesign: BackgroundDesign.Transparent
	  }),
	  width: "100%"
  }).placeAt("event4");

  oFormContainer = new FormContainer("F4C1");
  oForm.addFormContainer(oFormContainer);

  oFormElement = new FormElement("F4E1", {
	  label: new Label({text: "selected date"}),
	  fields: [ new Input("Input4",{
		  placeholder: "yyyyMMdd",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal4");
			  if (sValue.length == 8 && !isNaN(sValue)) {
				  var oDate = oFormatYyyymmdd.parse(sValue);
				  var aSelectedDates = oCalendar.getSelectedDates();
				  var oDateRange;
				  if (aSelectedDates.length == 0 ) {
					  oDateRange = new DateRange({startDate: oDate});
					  oCalendar.addSelectedDate(oDateRange);
				  } else {
					  oDateRange = aSelectedDates[0];
					  oDateRange.setStartDate(oDate);
				  }
			  } else if (!sValue) {
				  oCalendar.destroySelectedDates();
			  }
		  }
	  }),
		  new Button({
			  text: "focus today",
			  press: function(oEvent){
				  Element.getElementById("Cal4").focusDate(UI5Date.getInstance());
			  }
		  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F4E2", {
	  label: new Label({text: "displayed months"}),
	  fields: [ new Input("Input4-2",{
		  value: "2",
		  width: "4em",
		  placeholder: "integer",
		  change: function(oEvent){
			  var oInput = oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal4");
			  var iMonths = parseInt(sValue);
			  if (iMonths > 0) {
				  oCalendar.setMonths(iMonths);
				  oInput.setValueState(ValueState.None);
			  } else {
				  oInput.setValueState(ValueState.Error);
			  }
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F4E3", {
	  label: new Label({text: "width"}),
	  fields: [ new Input("Input4-3",{
		  width: "9em",
		  change: function(oEvent){
			  oEvent.getSource();
			  var sValue = oEvent.getParameter('value');
			  var oCalendar = Element.getElementById("Cal4");
			  oCalendar.setWidth(sValue);
		  }
	  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F4E4", {
	  label: new Label({text: "Single/multiple selection"}),
	  fields: [
		  new RadioButtonGroup({
			  buttons : [
				  new RadioButton({
				  text : "Single Selection"
			  }), new RadioButton({
				  text : "Multiple Selection"
			  })
			  ],
			  select: function (oEvent) {
				  var bSingleSelection = this.getSelectedIndex() === 0 ? true : false;
				  Element.getElementById("Cal4").setSingleSelection(bSingleSelection);
			  }
		  })
	  ]
  });
  oFormContainer.addFormElement(oFormElement);

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
		  new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Typ 10"})
	  ]
  });

  addRemoveSelectedDateSample();

  function addRemoveSelectedDateSample(){
	  var oDateRange = new DateRange({startDate: UI5Date.getInstance(2017, 4, 10)});
	  var oCalRemove = new Calendar({
		  selectedDates: [oDateRange]
	  });

	  var oButton2 = new Button({
		  text: "2) Remove Date",
		  enabled: false,
		  press: function (oEvent) {
			  oEvent.getSource().setEnabled(false);
			  oCalRemove.removeSelectedDate(oDateRange);
			  oButton1.invalidate();// to let UIArea think Calendar is rendered with Button
		  }
	  }).placeAt('removeSelectedDate');

	  new Button({
		  text: "3) Close",
		  press: function (oEvent) {
			  oPopup.close();
		  }
	  }).placeAt('removeSelectedDate');

	  var oButton1 = new Button({
		  text: "1) Open",
		  press: function (oEvent) {
			  var eDock = Popup.Dock;
			  oPopup.open(0, eDock.BeginTop, eDock.BeginBottom, oButton1, null, "fit", true);
			  oButton2.setEnabled(true);
		  }
	  }).placeAt('removeSelectedDate');
	  oCalRemove.setParent(oButton1);

	  var oPopup = new Popup();
	  oPopup.setContent(oCalRemove);
  }
});