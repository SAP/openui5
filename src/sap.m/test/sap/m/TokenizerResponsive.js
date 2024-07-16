sap.ui.define([
  "sap/m/Tokenizer",
  "sap/m/Token",
  "sap/m/MultiInput",
  "sap/ui/core/Item",
  "sap/m/MultiComboBox",
  "sap/m/VBox",
  "sap/m/Slider",
  "sap/m/Button"
], function(Tokenizer, Token, MultiInput, Item, MultiComboBox, VBox, Slider, Button) {
  "use strict";
  // Note: the HTML page 'TokenizerResponsive.html' loads this module via data-sap-ui-on-init

  //*******************************
  var oNotAdjustedTokenizer = new Tokenizer("nonAdjustedTokenizer", {
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token({text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"})
	  ]
  });

  var oAdjustedTokenizer = new Tokenizer("adjustedTokenizer", {
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token({text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"})
	  ]
  });

  var oMultiInput1 = new MultiInput("multiInput", {
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token({text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"})
	  ],
	  showSuggestion: true,
	  suggestionItems: [
		  new Item({text: "Token 1", key: "0001"}),
		  new Item({text: "Token 2", key: "0002"}),
		  new Item({text: "Token 3", key: "0003"}),
		  new Item({text: "Token 4 - long text example", key: "0004"}),
		  new Item({text: "Token 5", key: "0005"}),
		  new Item({text: "Token 6", key: "0006"}),
		  new Item({text: "Token 7", key: "0007"}),
		  new Item({text: "Token 8", key: "0008"}),
		  new Item({text: "Token 9 - ABCDEF", key: "0009"})
	  ]
  });

  var oMultiCombo1 = new MultiComboBox("multiComboBox", {
	  items: [
		  new Item({text: "Token 1", key: "0001"}),
		  new Item({text: "Token 2", key: "0002"}),
		  new Item({text: "Token 3", key: "0003"}),
		  new Item({text: "Token 4 - long text example", key: "0004"}),
		  new Item({text: "Token 5", key: "0005"}),
		  new Item({text: "Token 6", key: "0006"}),
		  new Item({text: "Token 7", key: "0007"}),
		  new Item({text: "Token 8", key: "0008"}),
		  new Item({text: "Token 9 - ABCDEF", key: "0009"})
	  ],
	  selectedKeys: [
		  "0001",
		  "0002",
		  "0003",
		  "0004",
		  "0005",
		  "0006",
		  "0007",
		  "0008",
		  "0009"
	  ]
  });

  //*******************************
  var oLayout = new VBox({
	  width: "100%",
	  items: [
		  oNotAdjustedTokenizer,
		  oAdjustedTokenizer,
		  oMultiInput1,
		  oMultiCombo1
	  ]
  });

  //*******************************
  var oSlider = new Slider("slider", {
	  value: 100,
	  width: "100%",
	  change: function (oEvent) {
		  var oHandleRect = oEvent.getSource().getClosestHandleDomRef().getClientRects()[0];
		  var iMaxWidth = oHandleRect.right - oHandleRect.width / 2;
		  //oNotAdjustedTokenizer.setMaxWidth(iMaxWidth + "px");
		  oAdjustedTokenizer.setMaxWidth(iMaxWidth + "px");
		  // oMultiInput1.setWidth(iMaxWidth + "px");
		  // oMultiCombo1.setWidth(iMaxWidth + "px");
		  //oLayout.setWidth(iMaxWidth + "px");
		  oLayout.setWidth(oEvent.getParameter("value") + "%");
	  }
  });

  var oToggleExpandedButton = new Button({
	  text: "Toggle Expanded on the adjustable tokenizer (second one)",
	  press: function () {
		  oAdjustedTokenizer.setExpanded(!oAdjustedTokenizer.getExpanded());
	  }
  });

  oToggleExpandedButton.placeAt("content");
  oSlider.placeAt("content");
  oLayout.placeAt("content");
});