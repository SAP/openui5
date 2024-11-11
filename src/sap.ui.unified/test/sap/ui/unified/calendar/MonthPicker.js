sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/unified/calendar/MonthPicker",
  "sap/m/Label",
  "sap/m/Input"
], function(Element, MonthPicker, Label, Input) {
  "use strict";

  new MonthPicker("MP1",{
	  select: function(oEvent){
		  var oInput = Element.getElementById("Input1");
		  var oMP = oEvent.getSource();
		  var iMonth = oMP.getMonth();
		  oInput.setValue(iMonth);
	  }
  }).placeAt("sample1");

  new Label({text: "selected month", labelFor: "Input1"}).placeAt("event1");
  new Input("Input1",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oMP = Element.getElementById("MP1");
		  if (sValue && !isNaN(sValue)) {
			  var iMonth = parseInt(sValue);
			  if (iMonth > 11) {
				  iMonth = 11;
			  } else if (iMonth < 0) {
				  iMonth = 0;
			  }
			  oMP.setMonth(iMonth);
		  }
	  }
  }).placeAt("event1");

  new MonthPicker("MP2",{
	  month: 5,
	  months: 4,
	  columns: 0,
	  select: function(oEvent){
		  var oInput = Element.getElementById("Input2");
		  var oMP = oEvent.getSource();
		  var iMonth = oMP.getMonth();
		  oInput.setValue(iMonth);
	  }
  }).placeAt("sample2");

  new Label({text: "selected month", labelFor: "Input2"}).placeAt("event2");
  new Input("Input2",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oMP = Element.getElementById("MP2");
		  if (sValue && !isNaN(sValue)) {
			  var iMonth = parseInt(sValue);
			  if (iMonth > 11) {
				  iMonth = 11;
			  } else if (iMonth < 0) {
				  iMonth = 0;
			  }
			  oMP.setMonth(iMonth);
		  }
	  }
  }).placeAt("event2");
});