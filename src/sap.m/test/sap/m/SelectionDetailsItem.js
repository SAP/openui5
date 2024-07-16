sap.ui.define([
  "sap/ui/core/Theming",
  "sap/m/SelectionDetailsItemLine",
  "sap/ui/core/Item",
  "sap/m/SelectionDetailsItem",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/List",
  "sap/m/Page",
  "sap/m/NavContainer",
  "sap/m/App"
], function(Theming, SelectionDetailsItemLine, Item, SelectionDetailsItem, JSONModel, MessageToast, List, Page, NavContainer, App) {
  "use strict";
  // Note: the HTML page 'SelectionDetailsItem.html' loads this module via data-sap-ui-on-init

  var fnCreateLine = function(id, context) {
	  return new SelectionDetailsItemLine(id, {
		  label: "{label}",
		  value: "{value}",
		  displayValue: "{displayValue}",
		  unit: "{unit}"
	  });
  };

  var fnCreateAction = function(id, context) {
	  return new Item({
		  text: "{text}"
	  });
  };

  var aItems = [
	  new SelectionDetailsItem({
		  lines: {
			  path: "/lines/0",
			  factory: fnCreateLine
		  },
		  actions: {
			  path: "/actions/0",
			  factory: fnCreateAction
		  },
		  enableNav: true
	  }),
	  new SelectionDetailsItem({
		  lines: {
			  path: "/lines/1",
			  factory: fnCreateLine
		  },
		  actions: {
			  path: "/actions/1",
			  factory: fnCreateAction
		  },
		  enableNav: false
	  })
  ];

  var oModel = new JSONModel({
	  lines: [
		  [
			  {
				  label: "Company Name",
				  value: "Cabbage Corp"
			  }, {
				  label: "Product Category",
				  value: "Cabbages"
			  }, {
				  label: "Date",
				  displayValue: new Date().toLocaleString()
			  }
		  ], [
			  {
				  label: "Company Name",
				  value: "Future Industries"
			  }, {
				  label: "Product Category",
				  value: "Satomobiles"
			  }, {
				  label: "Price",
				  value: "10,000.00",
				  unit: "Yuons"
			  }
		  ]
	  ],
	  actions: [[{
		  text: "Item action 1"
	  }, {
		  text: "Item action 2"
	  }],
	  [{
		  text: "Item action 1"
	  }, {
		  text: "Item action 2"
	  }, {
		  text: "Item action 3"
	  }]]
  });

  var oNavContainer;

  var fnNavigateToDetails = function() {
	  oNavContainer.to("detailsPage");
  };
  var fnNavigateBack = function() {
	  oNavContainer.back();
  };
  var fnActionPress = function(oEvent) {
	  MessageToast.show(oEvent.getParameter("action").getText() + "\n is pressed on " + oEvent.getParameter("items")[0].getId());
  };

  var oList = new List(),
	  oListItem;
  for (var i = 0; i < aItems.length; i++) {
	  oListItem = aItems[i].setModel(oModel)._getListItem();

	  oListItem.attachPress(fnNavigateToDetails);
	  oListItem._getParentElement().attachEvent("_actionPress", fnActionPress, this);

	  oList.addItem(oListItem);
  }

  var oPage = new Page({
	  showHeader: false,
	  content: [
		  oList
	  ]
  });

  var oPageDetails = new Page("detailsPage", {
	  showHeader: false,
	  content: []
  });

  oNavContainer = new NavContainer({
	  pages: [ oPage, oPageDetails ]
  });

  var oApp = new App({
	  pages: new Page({
		  title: "Selection Details Items",
		  content: [ oNavContainer ],
		  showNavButton: true,
		  navButtonPress: fnNavigateBack
	  })
  });
  oApp.placeAt("content");

  //set the contrast class for belize plus
  if (Theming.getTheme() === "sap_belize_plus") {
	  oApp.addStyleClass("sapContrastPlus");
  }
});