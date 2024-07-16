sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/unified/calendar/MonthPicker",
  "sap/ui/commons/Label",
  "sap/ui/commons/TextField"
], function(Element, MonthPicker, Label, TextField) {
  "use strict";
  // Note: the HTML page 'MonthPicker.html' loads this module via data-sap-ui-on-init

  var oMonthPicker = new MonthPicker("MP1",{
	  select: function(oEvent){
		  var oTF = Element.getElementById("TF1");
		  var oMP = oEvent.oSource;
		  var iMonth = oMP.getMonth();
		  oTF.setValue(iMonth);
	  }
  }).placeAt("sample1");

  var oLabel = new Label({text: "selected month", labelFor: "TF1"}).placeAt("event1");
  var oInput = new TextField("TF1",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oMP = Element.getElementById("MP1");
		  if(sValue && !isNaN(sValue)){
			  var iMonth = parseInt(sValue);
			  if(iMonth > 11) {
				  iMonth = 11;
			  }else if(iMonth <0) {
				  iMonth = 0;
			  }
			  oMP.setMonth(iMonth);
		  }
	  }
  }).placeAt("event1");

  oMonthPicker = new MonthPicker("MP2",{
	  month: 5,
	  months: 4,
	  columns: 0,
	  select: function(oEvent){
		  var oTF = Element.getElementById("TF2");
		  var oMP = oEvent.oSource;
		  var iMonth = oMP.getMonth();
		  oTF.setValue(iMonth);
	  }
  }).placeAt("sample2");

  oLabel = new Label({text: "selected month", labelFor: "TF2"}).placeAt("event2");
  oInput = new TextField("TF2",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oMP = Element.getElementById("MP2");
		  if(sValue && !isNaN(sValue)){
			  var iMonth = parseInt(sValue);
			  if(iMonth > 11) {
				  iMonth = 11;
			  }else if(iMonth <0) {
				  iMonth = 0;
			  }
			  oMP.setMonth(iMonth);
		  }
	  }
  }).placeAt("event2");
});