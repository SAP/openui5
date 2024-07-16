sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/unified/calendar/Header",
  "sap/ui/commons/Label",
  "sap/ui/commons/TextField",
  "sap/ui/commons/ToggleButton"
], function(Element, Header, Label, TextField, ToggleButton) {
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

  var oLabel = new Label({text: "Text 1", labelFor: "TF1"}).placeAt("event1");
  var oInput = new TextField("TF1",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setTextButton1(sValue);
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "additional text 1", labelFor: "TF2"}).placeAt("event1");
  var oInput = new TextField("TF2",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setAdditionalTextButton1(sValue);
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "Text 2", labelFor: "TF3"}).placeAt("event1");
  var oInput = new TextField("TF3",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setTextButton2(sValue);
	  }
  }).placeAt("event1");

  var oLabel = new Label({text: "additional text 2", labelFor: "TF4"}).placeAt("event1");
  var oInput = new TextField("TF4",{
	  editable: true,
	  change: function(oEvent){
		  var sValue = oEvent.getParameter('newValue');
		  var oHeader = Element.getElementById("H1");
		  oHeader.setAdditionalTextButton2(sValue);
	  }
  }).placeAt("event1");

  var oButton = new ToggleButton({
	  text: "Pevious",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setEnabledPrevious(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "Next",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setEnabledNext(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "Button 0",
	  pressed: false,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton0(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "Button 1",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton1(bPressed);
	  }
  }).placeAt("event1");

  oButton = new ToggleButton({
	  text: "Button 2",
	  pressed: true,
	  press: function(oEvent){
		  var oHeader = Element.getElementById("H1");
		  var bPressed = oEvent.getParameter("pressed");
		  oHeader.setVisibleButton2(bPressed);
	  }
  }).placeAt("event1");
});