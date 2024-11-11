sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/unified/calendar/Header",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/ToggleButton"
], function(Element, Header, Label, Input, ToggleButton) {
  "use strict";

  new Header("H1",{
	  textButton0: "Day",
	  textButton1: "Month",
	  textButton2: "Year",
	  pressPrevious: function(oEvent){
			  alert("Previous");
		  },
	  pressNext: function(oEvent){
		  alert("Previous");
	  },
	  pressButton0: function(oEvent){
		  alert("Button 0");
	  },
	  pressButton1: function(oEvent){
		  alert("Button 1");
	  },
	  pressButton2: function(oEvent){
		  alert("Button2");
	  }
  }).placeAt("sample1");

  new Label({text: "Text 1", labelFor: "Input1"}).placeAt("event1");
  new Input("Input1",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setTextButton1(sValue);
	  }
  }).placeAt("event1");

  new Label({text: "additional text 1", labelFor: "Input2"}).placeAt("event1");
  new Input("Input2",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setAdditionalTextButton1(sValue);
	  }
  }).placeAt("event1");

  new Label({text: "Text 2", labelFor: "Input3"}).placeAt("event1");
  new Input("Input3",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setTextButton2(sValue);
	  }
  }).placeAt("event1");

  new Label({text: "additional text 2", labelFor: "Input4"}).placeAt("event1");
  new Input("Input4",{
	  change: function(oEvent){
		  oEvent.getSource();
		  var sValue = oEvent.getParameter('value');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setAdditionalTextButton2(sValue);
	  }
  }).placeAt("event1");

  new ToggleButton({
	  text: "Pevious",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setEnabledPrevious(bPressed);
	  }
  }).placeAt("event1");

  new ToggleButton({
	  text: "Next",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setEnabledNext(bPressed);
	  }
  }).placeAt("event1");

  new ToggleButton({
	  text: "Button 0",
	  pressed: false,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton0(bPressed);
	  }
  }).placeAt("event1");

  new ToggleButton({
	  text: "Button 1",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton1(bPressed);
	  }
  }).placeAt("event1");

  new ToggleButton({
	  text: "Button 2",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton2(bPressed);
	  }
  }).placeAt("event1");
});