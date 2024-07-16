sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/model/type/Date",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/CalendarType",
  "sap/ui/unified/calendar/Month",
  "sap/ui/core/library",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/ResponsiveGridLayout",
  "sap/ui/layout/library",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/ui/commons/ToggleButton",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/unified/DateRange",
  "sap/ui/commons/TextField",
  "sap/ui/commons/ComboBox",
  "sap/ui/core/ListItem",
  "sap/ui/commons/Label",
  "sap/ui/core/Item",
  "sap/ui/commons/ListBox"
], function(
  Element,
  TypeDate,
  DateFormat,
  CalendarType,
  Month,
  coreLibrary,
  Form,
  ResponsiveGridLayout,
  layoutLibrary,
  FormContainer,
  FormElement,
  ToggleButton,
  DateTypeRange,
  DateRange,
  TextField,
  ComboBox,
  ListItem,
  Label,
  Item,
  ListBox
) {
  "use strict";

  // shortcut for sap.ui.layout.BackgroundDesign
  const BackgroundDesign = layoutLibrary.BackgroundDesign;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

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
					  ["20160710",undefined,"Type10",10]];

  var oMonth = new Month("Month1",
		  {
			  date: UI5Date.getInstance(2016, 0, 1) /* to make sure special dates are in visible range */,
			  focus: function (oEvent) {
				  var oTF = Element.getElementById("TF1");
				  var oDate = oEvent.getParameter("date");
				  if (oDate) {
					  oTF.setValue(oFormatYyyymmdd.format(oDate));
				  } else {
					  oTF.setValue("");
				  }
				  if (!oEvent.getParameter("otherMonth")) {
					  oTF.setValueState(ValueState.None);
				  } else {
					  oTF.setValueState(ValueState.Error);
				  }
			  },
			  select: function (oEvent) {
				  var oTF = Element.getElementById("TF2");
				  var oMonth = oEvent.oSource;
				  var aSelectedDates = oMonth.getSelectedDates();
				  var oDate;
				  if (aSelectedDates.length > 0) {
					  oDate = aSelectedDates[0].getStartDate();
					  oTF.setValue(oFormatYyyymmdd.format(oDate));
				  } else {
					  oTF.setValue("");
				  }
			  }
		  }).placeAt("sample1");

  var oForm = new Form("F1", {
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
	  fields: [ new ToggleButton({
							  text: "special days",
							  press: function(oEvent){
								  var bPressed = oEvent.getParameter("pressed");
								  if (bPressed) {
									  for (var i = 0; i < aSpecialDays.length; i++) {
										  var aSpecialDay = aSpecialDays[i];
										  var sType = "";
										  if(aSpecialDay[3] < 10) {
											  sType = "Type0"+aSpecialDay[3];
										  }else {
											  sType = "Type"+aSpecialDay[3];
										  }
										  Element.getElementById("Month1").addSpecialDate(new DateTypeRange({
											  startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
											  endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
											  type: sType,
											  tooltip: aSpecialDay[2]
										  }));
									  }
								  } else {
									  Element.getElementById("Month1").destroySpecialDates();
								  }
							  }
						  }),
						  new ToggleButton({
							  text: "disable days",
							  press: function(oEvent){
								  var bPressed = oEvent.getParameter("pressed");
								  var oMonth = Element.getElementById("Month1");
								  if (bPressed) {
									  var oDate = oMonth.getDate();
									  if (oDate) {
										  oDate = UI5Date.getInstance(oDate.getTime());
									  } else {
										  oDate = UI5Date.getInstance();
									  }
									  oDate.setDate(2);
									  oMonth.addDisabledDate(new DateRange({
										  startDate: oDate
									  }));
									  oStartDate = UI5Date.getInstance(oDate);
									  oStartDate.setDate(10);
									  oEndDate = UI5Date.getInstance(oDate);
									  oEndDate.setDate(20);
									  oMonth.addDisabledDate(new DateRange({
										  startDate: oStartDate,
										  endDate: oEndDate
									  }));
								  } else {
									  oMonth.destroyDisabledDates();
								  }
							  }
						  })
		  ]
	  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E2", {
	  label: "focused date",
	  fields: [ new TextField("TF1",{
							  editable: true,
							  placeholder: "yyyyMMdd",
							  change: function(oEvent){
								  var oTF = oEvent.oSource;
								  var sValue = oEvent.getParameter('newValue');
								  var oMonth = Element.getElementById("Month1");
								  var oDate = oFormatYyyymmdd.parse(sValue);
								  oMonth.setDate(oDate);
								  oTF.setValueState(ValueState.None);
							  }
						  })
		  ]
	  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E3", {
	  label: "selected date",
	  fields: [ new TextField("TF2",{
							  editable: true,
							  placeholder: "yyyyMMdd",
							  change: function(oEvent){
								  var sValue = oEvent.getParameter('newValue');
								  var oMonth = Element.getElementById("Month1");
								  if(sValue.length == 8 && !isNaN(sValue)){
									  var oDate = oFormatYyyymmdd.parse(sValue);
									  var aSelectedDates = oMonth.getSelectedDates();
									  var oDateRange;
									  if (aSelectedDates.length == 0 ) {
										  oDateRange = new DateRange({startDate: oDate});
										  oMonth.addSelectedDate(oDateRange);
									  } else {
										  oDateRange = aSelectedDates[0];
										  oDateRange.setStartDate(oDate);
									  }
								  }else if(!sValue){
									  oMonth.destroySelectedDates();
								  }
							  }
						  })
		  ]
	  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E4", {
	  label: "primary calendar type",
	  fields: [ new ComboBox("CB1",{
							  editable: true,
							  items: [
											  new ListItem({text: CalendarType.Gregorian, key: CalendarType.Gregorian}),
											  new ListItem({text: CalendarType.Islamic, key: CalendarType.Islamic}),
											  new ListItem({text: CalendarType.Japanese, key: CalendarType.Japanese}),
											  ],
							  change: function(oEvent){
								  var oItem = oEvent.getParameter('selectedItem');
								  var oMonth = Element.getElementById("Month1");
								  var sKey = "";
								  if (oItem) {
									  sKey = oItem.getKey();
								  }
								  oMonth.setPrimaryCalendarType(sKey);
							  }
							  })
		  ]
	  });
  oFormContainer.addFormElement(oFormElement);

  oFormElement = new FormElement("F1E5", {
	  label: "secondary calendar type",
	  fields: [ new ComboBox("CB2",{
							  editable: true,
							  items: [
											  new ListItem({text: CalendarType.Gregorian, key: CalendarType.Gregorian}),
											  new ListItem({text: CalendarType.Islamic, key: CalendarType.Islamic}),
											  new ListItem({text: CalendarType.Japanese, key: CalendarType.Japanese}),
											  ],
							  change: function(oEvent){
								  var oItem = oEvent.getParameter('selectedItem');
								  var oMonth = Element.getElementById("Month1");
								  var sKey = "";
								  if (oItem) {
									  sKey = oItem.getKey();
								  }
								  oMonth.setSecondaryCalendarType(sKey);
							  }
							  })
		  ]
	  });
  oFormContainer.addFormElement(oFormElement);

  // single interval selection
  oMonth = new Month("Month2",{
	  intervalSelection: true,
	  select: function(oEvent){
		  var oTF1 = Element.getElementById("TF2-start");
		  var oTF2 = Element.getElementById("TF2-end");
		  var oMonth = oEvent.oSource;
		  var aSelectedDates = oMonth.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  oDate = aSelectedDates[0].getStartDate();
			  if (oDate) {
				  oTF1.setValue(oFormatYyyymmdd.format(oDate));
			  } else {
				  oTF1.setValue("");
			  }
			  oDate = aSelectedDates[0].getEndDate();
			  if (oDate) {
				  oTF2.setValue(oFormatYyyymmdd.format(oDate));
			  } else {
				  oTF2.setValue("");
			  }
		  } else {
			  oTF1.setValue("");
			  oTF2.setValue("");
		  }
	  }
  }).placeAt("sample2");

  oLabel = new Label({text: "selected date from", labelFor: "TF2-start"}).placeAt("event2");
  oInput = new TextField("TF2-start",{
	  editable: false
  }).placeAt("event2");
  oLabel = new Label({text: "to", labelFor: "TF2-end"}).placeAt("event2");
  oInput = new TextField("TF2-end",{
	  editable: false
  }).placeAt("event2");

  oMonth = new Month("Month3",{
	  intervalSelection: false,
	  singleSelection: false,
	  showHeader: true,
	  firstDayOfWeek: 2,
	  nonWorkingDays: [3, 5],
	  select: function(oEvent){
		  var oLB = Element.getElementById("LB");
		  var oMonth = oEvent.oSource;
		  var aSelectedDates = oMonth.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  var aItems = oLB.getItems();
			  var oItem;
			  for(var i=0; i<aSelectedDates.length; i++){
				  oDate = aSelectedDates[i].getStartDate();
				  if(aItems[i]) {
					  oItem = aItems[i];
				  }else {
					  oItem = new Item();
					  oLB.addItem(oItem);
				  }
				  if (oDate) {
					  oItem.setText(oFormatYyyymmdd.format(oDate));
				  } else {
					  oItem.setText("");
				  }
			  }
			  if(aItems.length > aSelectedDates.length) {
				  for(var i=aSelectedDates.length; i<aItems.length; i++){
					  oLB.removeItem(i);
					  aItems[i].destroy();
				  }
			  }
		  } else {
			  oLB.destroyItems();
		  }
	  }
  }).placeAt("sample3");

  oLabel = new Label({text: "selected dates", labelFor: "LB"}).placeAt("event3");

  new ListBox("LB",{
	  editable: false,
	  visibleItems: 10,
	  width: "8em"
  }).placeAt("event3");

  new ToggleButton("button4",{
	  text : "Toggle week numbers",
	  press: function (oEvent) {
		  var oMonth = Element.getElementById("Month3");
		  oMonth.setShowWeekNumbers(!oMonth.getShowWeekNumbers());
	  }
  }).placeAt("event3");
});