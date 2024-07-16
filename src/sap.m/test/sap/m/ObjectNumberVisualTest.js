sap.ui.define([
  "sap/m/ObjectNumber",
  "sap/m/Button",
  "sap/ui/core/library",
  "sap/m/App",
  "sap/m/Page"
], function(ObjectNumber, Button, coreLibrary, App, Page) {
  "use strict";

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // Note: the HTML page 'ObjectNumberVisualTest.html' loads this module via data-sap-ui-on-init

  var on1 = new ObjectNumber("on1", {
	  number: "300,000,000",
	  unit: "Euro"
  }).addStyleClass("sapUiSmallMargin");

  var on2 = new ObjectNumber("on2", {
	  number: "300,000,000",
	  unit: "Euro"
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  var oButtonEmphasized =new Button("emphasized", {
	  text:"Toggle emphasized",
	  press: function(){
		  on1.setEmphasized(!on1.getEmphasized());
		  on2.setEmphasized(!on2.getEmphasized());
	  }
  });

  var oButtonNum =new Button("num", {
	  text:"Set number",
	  press: function(){
		  on1.setNumber("100");
		  on2.setNumber("100");
	  }
  });

  var oButtonUnit =new Button("unit", {
	  text:"Set unit",
	  press: function(){
		  on1.setUnit("Dollars");
		  on2.setUnit("Dollars");
	  }
  });

  var oButtonStateS =new Button("change_stateS", {
	  text:"Success state",
	  press: function(){
		  on1.setState(ValueState.Success);
		  on2.setState(ValueState.Success);
	  }
  });

  var oButtonStateE =new Button("change_stateE", {
	  text:"Error state",
	  press: function(){
		  on1.setState(ValueState.Error);
		  on2.setState(ValueState.Error);
	  }
  });

  var oButtonStateW =new Button("change_stateW", {
	  text:"Warning state",
	  press: function(){
		  on1.setState(ValueState.Warning);
		  on2.setState(ValueState.Warning);
	  }
  });

  var oButtonStateI =new Button("change_stateI", {
	  text:"Information state",
	  press: function(){
		  on1.setState(ValueState.Information);
		  on2.setState(ValueState.Information);
	  }
  });

  var on3 = new ObjectNumber("on3", {
	  number: "300",
	  unit: "Euro",
	  active: true
  }).addStyleClass("sapUiSmallMargin");

  var on4 = new ObjectNumber("on4", {
	  number: "300000",
	  unit: "Euro",
	  active: true
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  var on5 = new ObjectNumber("on5", {
	  number: "1.50",
	  active: true,
	  inverted: true
  }).addStyleClass("sapUiSmallMargin");

  var on6 = new ObjectNumber("on6", {
	  number: "1.50",
	  unit: "Euro",
	  inverted: true
  }).addStyleClass("sapUiSmallMargin");

  var on7 = new ObjectNumber("on7", {
	  number: "300000",
	  unit: "Euro",
	  inverted: true,
	  active: true
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  var app = new App();
  var page = new Page({
	  showHeader : false,
	  enableScrolling : true,
	  content: [
		  on1,
		  on2,
		  oButtonEmphasized,
		  oButtonNum,
		  oButtonUnit,
		  oButtonStateS,
		  oButtonStateE,
		  oButtonStateW,
		  oButtonStateI,
		  on3,
		  on4,
		  on5,
		  on6,
		  on7
	  ]
  });
  app.setInitialPage(page.getId());
  app.addPage(page);

  app.placeAt('body');
});