sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/model/type/Date",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/CalendarType",
  "sap/ui/unified/calendar/MonthsRow",
  "sap/ui/core/library",
  "sap/ui/commons/Label",
  "sap/ui/commons/TextField",
  "sap/ui/unified/DateRange",
  "sap/ui/commons/ToggleButton",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/core/Item",
  "sap/ui/commons/ListBox"
], function(
  Element,
  TypeDate,
  DateFormat,
  CalendarType,
  MonthsRow,
  coreLibrary,
  Label,
  TextField,
  DateRange,
  ToggleButton,
  DateTypeRange,
  Item,
  ListBox
) {
  "use strict";

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

  var aSpecialDays = [["20150101",undefined,"Neujahr",1],
					  ["20150106",undefined,"Heilige Drei Könige",1],
					  ["20150214",undefined,"Valentinstag",2],
					  ["20150216",undefined,"Rosenmontag",2],
					  ["20150217",undefined,"Fastnacht",2],
					  ["20150218",undefined,"Aschermittwoch",2],
					  ["20150403",undefined,"Karfreitag",1],
					  ["20150405",undefined,"Ostersonntag",1],
					  ["20150406",undefined,"Ostermontag",1],
					  ["20150501",undefined,"Maifeiertag",1],
					  ["20150510",undefined,"Muttertag",2],
					  ["20150514",undefined,"Christi Himmelfahrt",1],
					  ["20150524",undefined,"Pfingstsonntag",1],
					  ["20150525",undefined,"Pfingstmontag",1],
					  ["20150604",undefined,"Fronleichnam",1],
					  ["20150815",undefined,"Mariä Himmelfahrt",2],
					  ["20151003",undefined,"Tag der Deutschen Einheit",1],
					  ["20151004",undefined,"Erntedankfest",2],
					  ["20151031",undefined,"Reformationstag",2],
					  ["20151101",undefined,"Allerheiligen",1],
					  ["20151115",undefined,"Volkstrauertag",2],
					  ["20151118",undefined,"Buß- und Bettag",2],
					  ["20151122",undefined,"Totensonntag",2],
					  ["20151129",undefined,"1. Advent",2],
					  ["20151206",undefined,"Nikolaus",2],
					  ["20151206",undefined,"2. Advent",2],
					  ["20151213",undefined,"3. Advent",2],
					  ["20151220",undefined,"4. Advent",2],
					  ["20151224",undefined,"Heiligabend",2],
					  ["20151225","20141226","Weihnachten",1],
					  ["20151231",undefined,"Silvester",2],
					  ["20160101",undefined,"Neujahr",1],
					  ["20160106",undefined,"Heilige Drei Könige",1],
					  ["20150804","20140810","Urlaub",3],
					  ["20150701",undefined,"Type01",1],
					  ["20150702",undefined,"Type02",2],
					  ["20150703",undefined,"Type03",3],
					  ["20150704",undefined,"Type04",4],
					  ["20150705",undefined,"Type05",5],
					  ["20150706",undefined,"Type06",6],
					  ["20150707",undefined,"Type07",7],
					  ["20150708",undefined,"Type08",8],
					  ["20150709",undefined,"Type09",9],
					  ["20150710",undefined,"Type10",10]];

  var oMonthsRow = new MonthsRow("MR1",{
	  focus: function(oEvent){
		  var oTF = Element.getElementById("TF2");
		  var oDate = oEvent.getParameter("date");
		  if (oDate) {
			  oTF.setValue(oFormatYyyymmdd.format(oDate));
		  } else {
			  oTF.setValue("");
		  }
		  if (!oEvent.getParameter("notVisible")) {
			  oTF.setValueState(ValueState.None);
		  } else {
			  oTF.setValueState(ValueState.Error);
		  }
	  },
	  select: function(oEvent){
		  var oTF = Element.getElementById("TF3");
		  var oMonthsRow = oEvent.oSource;
		  var aSelectedDates = oMonthsRow.getSelectedDates();
		  var oDate;
		  if (aSelectedDates.length > 0 ) {
			  oDate = aSelectedDates[0].getStartDate();
			  oTF.setValue(oFormatYyyymmdd.format(oDate));
		  } else {
			  oTF.setValue("");
		  }
	  }
  }).placeAt("sample1");

  var oLabel = new Label({text: "start date", labelFor: "TF1"}).placeAt("event1");
  var oInput = new TextField("TF1",{
	  editable: true,
	  placeholder: "yyyyMMdd",
	  change: function(oEvent){
		  var oTF = oEvent.oSource;
		  var sValue = oEvent.getParameter('newValue');
		  var oDatesRow = Element.getElementById("MR1");
		  var oDate = oFormatYyyymmdd.parse(sValue);
		  if (oDate) {
			  oDatesRow.setStartDate(oDate);
			  oTF.setValueState(ValueState.None);
		  } else {
			  oTF.setValueState(ValueState.Error);
		  }
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "focused date", labelFor: "TF2"}).placeAt("event1");
  var oInput = new TextField("TF2",{
	  editable: true,
	  placeholder: "yyyyMMdd",
	  change: function(oEvent){
		  var oTF = oEvent.oSource;
		  var sValue = oEvent.getParameter('newValue');
		  var oMonthsRow = Element.getElementById("MR1");
		  var oDate = oFormatYyyymmdd.parse(sValue);
		  if (oDate) {
			  oMonthsRow.setDate(oDate);
			  oTF.setValueState(ValueState.None);
		  } else {
			  oTF.setValueState(ValueState.Error);
		  }
	  }
  }).placeAt("event1");

  oLabel = new Label({text: "selected date", labelFor: "TF3"}).placeAt("event1");
  oInput = new TextField("TF3",{
	  editable: true,
	  placeholder: "yyyyMMdd",
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oMonthsRow = Element.getElementById("MR1");
		  if(sValue.length == 8 && !isNaN(sValue)){
			  var oDate = oFormatYyyymmdd.parse(sValue);
			  var aSelectedDates = oMonthsRow.getSelectedDates();
			  var oDateRange;
			  if (aSelectedDates.length == 0 ) {
				  oDateRange = new DateRange({startDate: oDate});
				  oMonthsRow.addSelectedDate(oDateRange);
			  } else {
				  oDateRange = aSelectedDates[0];
				  oDateRange.setStartDate(oDate);
			  }
		  }else if(!sValue){
			  oMonthsRow.destroySelectedDates();
		  }
	  }
  }).placeAt("event1");

  new ToggleButton({
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
				  Element.getElementById("MR1").addSpecialDate(new DateTypeRange({
					  startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
					  endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
					  type: sType,
					  tooltip: aSpecialDay[2]
				  }));
			  }
		  } else {
			  Element.getElementById("MR1").destroySpecialDates();
		  }
	  }
  }).placeAt("event1");

  // single interval selection
  oMonthsRow = new MonthsRow("MR2",{
	  intervalSelection: true,
	  months: 6,
	  select: function(oEvent){
		  var oTF1 = Element.getElementById("TF2-start");
		  var oTF2 = Element.getElementById("TF2-end");
		  var oMonthsRow = oEvent.oSource;
		  var aSelectedDates = oMonthsRow.getSelectedDates();
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

  oMonthsRow = new MonthsRow("MR3",{
	  intervalSelection: false,
	  singleSelection: false,
	  showHeader: true,
	  months: 18,
	  select: function(oEvent){
		  var oLB = Element.getElementById("LB");
		  var oMonthsRow = oEvent.oSource;
		  var aSelectedDates = oMonthsRow.getSelectedDates();
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
});