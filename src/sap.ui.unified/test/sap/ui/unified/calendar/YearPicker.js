sap.ui.define([
		  "sap/ui/core/Element",
		  "sap/ui/core/date/UniversalDate",
		  "sap/ui/unified/calendar/YearPicker",
		  "sap/m/Label",
		  "sap/m/Input"
		], function(Element, UniversalDate, YearPicker, Label, Input) {
		  "use strict";
		  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

		  new YearPicker("YP1",{
			  select: function(oEvent){
				  var oInput = Element.getElementById("Input1");
				  var oYP = oEvent.getSource();
				  var oDate = new UniversalDate(oYP.getDate());
				  oInput.setValue(oDate.getFullYear());
			  }
		  }).placeAt("sample1");

		  new Label({text: "selected Year", labelFor: "Input1"}).placeAt("event1");
		  new Input("Input1",{
			  change: function(oEvent){
				  oEvent.getSource();
				  var sValue = oEvent.getParameter('value');
				  var oYP = Element.getElementById("YP1");
				  if (sValue && !isNaN(sValue)) {
					  var iYear = parseInt(sValue);
//						var oDate = new UniversalDate(iYear, 0, 1);
//						if(iYear < 100) {
//							oDate.setFullYear(iYear);
//						}
					  var oDate = new UniversalDate();
					  oDate.setFullYear(iYear);
					  oDate.setMonth(0);
					  oDate.setDate(1);
					  oYP.setDate(oDate.getJSDate());
				  }
			  }
		  }).placeAt("event1");

		  var oDate = UI5Date.getInstance(2015,0,1);
		  new YearPicker("YP2",{
			  years: 5,
			  columns: 0,
			  date: oDate,
			  select: function(oEvent){
				  var oInput = Element.getElementById("Input2");
				  var oYP = oEvent.getSource();
				  var oDate = new UniversalDate(oYP.getDate());
				  oInput.setValue(oDate.getFullYear());
			  }
		  }).placeAt("sample2");

		  new Label({text: "selected Year", labelFor: "Input2"}).placeAt("event2");
		  new Input("Input2",{
			  change: function(oEvent){
				  oEvent.getSource();
				  var sValue = oEvent.getParameter('value');
				  var oYP = Element.getElementById("YP2");
				  if (sValue && !isNaN(sValue)) {
					  var iYear = parseInt(sValue);
//					var oDate = new UniversalDate(iYear, 0, 1);
//					if(iYear < 100) {
//						oDate.setFullYear(iYear);
//					}
					  var oDate = new UniversalDate();
					  oDate.setFullYear(iYear);
					  oDate.setMonth(0);
					  oDate.setDate(1);
					  oYP.setDate(oDate.getJSDate());
				  }
			  }
		  }).placeAt("event2");
		});