sap.ui.define([
  "sap/ui/core/Theming",
  "sap/m/Button",
  "sap/m/SelectionDetails",
  "sap/m/SelectionDetailsItemLine",
  "sap/m/SelectionDetailsItem",
  "sap/ui/core/Item",
  "sap/m/MessageToast",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], function(Theming, Button, SelectionDetails, SelectionDetailsItemLine, SelectionDetailsItem, Item, MessageToast, App, Page, jQuery) {
  "use strict";
  // Note: the HTML page 'SelectionDetailsIntegration.html' loads this module via data-sap-ui-on-init

  var _selectionDetailsEventData = {
	  data :[ {
		  data: {
			  Price: 939.00,
			  ProductCategory: "Laptop"
		  },
		  displayData: [
			  {
				  id: "ProductCatagory",
				  label: "Product Catagory",
				  type: "Dimension",
				  unbound: false,
				  unit: undefined,
				  value: "Laptop"
			  }, {
				  id: "Price",
				  label: "Price",
				  type: "Measure",
				  unbound: false,
				  unit: "EUR",
				  value: "939,00"
			  }
		  ]
	  }, {
		  data: {
			  Price: 10000.00,
			  ProductCategory: "Satomobiles",
			  CompanyName : "Future Industries"
		  },
		  displayData: [
			  {
				  id: "ProductCatagory",
				  label: "Satomobiles",
				  type: "Dimension",
				  unbound: false,
				  unit: undefined,
				  value: "Laptop"
			  }, {
				  id: "CompanyName",
				  label: "Company Name",
				  type: "Dimension",
				  unbound: false,
				  unit: undefined,
				  value: "Future Industries"
			  }, {
				  id: "Price",
				  label: "Price",
				  type: "Measure",
				  unbound: false,
				  unit: "EUR",
				  value: "10.000,00"
			  }
		  ]
	  }
  ]};

  var oChangeButton = new Button({
	  text: "Trigger Change",
	  press: function (oEvt) {
		  var oSelectionData = jQuery.extend(true, {}, _selectionDetailsEventData);
		  for (var i = 0; i < Math.random() * 10; i++) {
			  oSelectionData.data.push(jQuery.extend(true, {}, _selectionDetailsEventData.data[Math.ceil(Math.random())]));
		  }
		  this.fireEvent("_selectionDetails", oSelectionData);
	  }
  });

  var oResetActionsButton = new Button({
	  text: "Reset Actions",
	  press: function (oEvt) {
		  oSelectionDetails.destroyActions();
		  oSelectionDetails.destroyActionGroups();
	  }
  });

  var oSelectionDetails = new SelectionDetails("selectionDetails");

  var oResetActionsButton = new Button({
	  text: "Reset Actions",
	  press: function (oEvt) {
		  oSelectionDetails.destroyActions();
		  oSelectionDetails.destroyActionGroups();
	  }
  });

  oSelectionDetails.registerSelectionDetailsItemFactory(["MyFirstData", "MySecondData"],
	  function (aDisplayData, aData, oContext, oData) {
		  var aLines = [];
		  for (var i = 0; i < aDisplayData.length; i++) {
			  aLines.push(new SelectionDetailsItemLine({
				  label: aDisplayData[i].label,
				  value: aDisplayData[i].value,
				  unit: aDisplayData[i].unit
			  }));
		  }
		  return new SelectionDetailsItem({
			  enableNav: Math.random() > 0.5 ? true : false,
			  lines: aLines,
			  actions: [
				  new Item({
					  text: "First Action"
				  })
			  ]
		  });
	  }
  );
  oSelectionDetails.attachEvent("beforeUpdate", function (oEvent) {
	  MessageToast.show("Event 'beforeUpdate' triggered");
  });
  oSelectionDetails.attachEvent("afterUpdate", function (oEvent) {
	  oEvent.getSource().addAction(new Item({
		  text: "First Action",
		  key: "firstAction"
	  }));
	  oEvent.getSource().addActionGroup(new Item({
		  text: "First Action",
		  key: "firstAction"
	  }));
	  MessageToast.show("Event 'afterUpdate' triggered");
  });

  oSelectionDetails.attachSelectionHandler("_selectionDetails", oChangeButton);

  var oApp = new App({
	  pages: new Page({
		  title: "Testpage of sap.m.SelectionDetails control for inner Framework Integration",
		  content: [ oSelectionDetails, oChangeButton, oResetActionsButton ]
	  })
  });
  oApp.placeAt("content");

  //set the contrast class for belize plus
  if (Theming.getTheme() === "sap_belize_plus") {
	  oApp.addStyleClass("sapContrastPlus");
  }
});