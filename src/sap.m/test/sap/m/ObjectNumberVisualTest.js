sap.ui.define([
  "sap/m/ObjectNumber",
  "sap/m/Button",
  "sap/ui/core/library",
  "sap/m/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Title",
  "sap/m/VBox"
], function(ObjectNumber, Button, coreLibrary, mobileLibrary, App, Page, Title, VBox) {
  "use strict";

  // shortcut for sap.m.ObjectNumberDisplayMode
  const ObjectNumberDisplayMode0 = mobileLibrary.ObjectNumberDisplayMode;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // Note: the HTML page 'ObjectNumberVisualTest.html' loads this module via data-sap-ui-on-init

  const on1 = new ObjectNumber("on1", {
	  number: "300,000,000",
	  unit: "Euro"
  }).addStyleClass("sapUiSmallMargin");

  const on2 = new ObjectNumber("on2", {
	  number: "300,000,000",
	  unit: "Euro"
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  const oButtonEmphasized = new Button("emphasized", {
	  text:"Toggle emphasized",
	  press: function(){
		  on1.setEmphasized(!on1.getEmphasized());
		  on2.setEmphasized(!on2.getEmphasized());
	  }
  });

  const oButtonNum = new Button("num", {
	  text:"Set number",
	  press: function(){
		  on1.setNumber("100");
		  on2.setNumber("100");
	  }
  });

  const oButtonUnit = new Button("unit", {
	  text:"Set unit",
	  press: function(){
		  on1.setUnit("Dollars");
		  on2.setUnit("Dollars");
	  }
  });

  const oButtonStateS = new Button("change_stateS", {
	  text:"Success state",
	  press: function(){
		  on1.setState(ValueState.Success);
		  on2.setState(ValueState.Success);
	  }
  });

  const oButtonStateE = new Button("change_stateE", {
	  text:"Error state",
	  press: function(){
		  on1.setState(ValueState.Error);
		  on2.setState(ValueState.Error);
	  }
  });

  const oButtonStateW = new Button("change_stateW", {
	  text:"Warning state",
	  press: function(){
		  on1.setState(ValueState.Warning);
		  on2.setState(ValueState.Warning);
	  }
  });

  const oButtonStateI = new Button("change_stateI", {
	  text:"Information state",
	  press: function(){
		  on1.setState(ValueState.Information);
		  on2.setState(ValueState.Information);
	  }
  });

  const on3 = new ObjectNumber("on3", {
	  number: "300",
	  unit: "Euro",
	  active: true
  }).addStyleClass("sapUiSmallMargin");

  const on4 = new ObjectNumber("on4", {
	  number: "300000",
	  unit: "Euro",
	  active: true
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  const on5 = new ObjectNumber("on5", {
	  number: "1.50",
	  active: true,
	  inverted: true
  }).addStyleClass("sapUiSmallMargin");

  const on6 = new ObjectNumber("on6", {
	  number: "1.50",
	  unit: "Euro",
	  inverted: true
  }).addStyleClass("sapUiSmallMargin");

  const on7 = new ObjectNumber("on7", {
	  number: "300000",
	  unit: "Euro",
	  inverted: true,
	  active: true
  }).addStyleClass("sapMObjectNumberLarge").addStyleClass("sapUiSmallMargin");

  const ObjectNumberDisplayMode = ObjectNumberDisplayMode0;

  // --- Currency mode ---

  // USD, useSymbol=true (default) → symbol "$"
  const onCurrency1 = new ObjectNumber("onCurrency1", {
	  number: "1234.5",
	  unit: "USD",
	  displayMode: ObjectNumberDisplayMode.Currency
  });

  // USD, useSymbol=false → ISO code "USD"
  const onCurrency2 = new ObjectNumber("onCurrency2", {
	  number: "1234.5",
	  unit: "USD",
	  displayMode: ObjectNumberDisplayMode.Currency,
	  useSymbol: false
  });

  // EUR, maxPrecision=4 → 2 extra figure-space padding digits
  const onCurrency3 = new ObjectNumber("onCurrency3", {
	  number: "99",
	  unit: "EUR",
	  displayMode: ObjectNumberDisplayMode.Currency,
	  maxPrecision: 4
  });

  // JPY — 0 CLDR decimal digits, edge case
  const onCurrency4 = new ObjectNumber("onCurrency4", {
	  number: "12000",
	  unit: "JPY",
	  displayMode: ObjectNumberDisplayMode.Currency
  });

  // CHF — standard 2 decimal digits, maxPrecision matches CLDR (no padding)
  const onCurrency5 = new ObjectNumber("onCurrency5", {
	  number: "750",
	  unit: "CHF",
	  displayMode: ObjectNumberDisplayMode.Currency,
	  maxPrecision: 2
  });

  // --- Unit mode ---

  // kg, no maxPrecision → integer rendering
  const onUnit1 = new ObjectNumber("onUnit1", {
	  number: "42",
	  unit: "kg",
	  displayMode: ObjectNumberDisplayMode.Unit
  });

  // km, maxPrecision=2 → formatted to 2 decimal places
  const onUnit2 = new ObjectNumber("onUnit2", {
	  number: "3.5",
	  unit: "km",
	  displayMode: ObjectNumberDisplayMode.Unit,
	  maxPrecision: 2
  });

  // m², maxPrecision=3 → formatted to 3 decimal places
  const onUnit3 = new ObjectNumber("onUnit3", {
	  number: "0.5",
	  unit: "m²",
	  displayMode: ObjectNumberDisplayMode.Unit,
	  maxPrecision: 3
  });

  // useSymbol=true has no effect in Unit mode — raw unit string shown
  const onUnit4 = new ObjectNumber("onUnit4", {
	  number: "100",
	  unit: "kWh",
	  displayMode: ObjectNumberDisplayMode.Unit,
	  useSymbol: true
  });

  // emphasized unit
  const onUnit5 = new ObjectNumber("onUnit5", {
	  number: "200",
	  unit: "kg",
	  displayMode: ObjectNumberDisplayMode.Unit,
	  emphasized: true
  });

  const app = new App();
  const page = new Page({
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
		  on7,
		  new Title({ text: "Currency mode" }).addStyleClass("sapUiSmallMarginBegin"),
		  new VBox({
			  renderType: "Bare",
			  items: [onCurrency1, onCurrency2, onCurrency3, onCurrency4, onCurrency5]
		  }).addStyleClass("sapUiSmallMarginBeginEnd"),
		  new Title({ text: "Unit mode" }).addStyleClass("sapUiSmallMarginBegin"),
		  new VBox({
			  renderType: "Bare",
			  items: [onUnit1, onUnit2, onUnit3, onUnit4, onUnit5]
		  }).addStyleClass("sapUiSmallMarginBeginEnd")
	  ]
  });
  app.setInitialPage(page.getId());
  app.addPage(page);

  app.placeAt('body');
});