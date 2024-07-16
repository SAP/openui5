sap.ui.define([
  "sap/m/App",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/ui/model/json/JSONModel",
  "sap/m/ActionSheet",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/base/Log"
], function(App, List, StandardListItem, JSONModel, ActionSheet, Button, mobileLibrary, Page, Bar, Log) {
  "use strict";

  // shortcut for sap.m.PlacementType
  const PlacementType = mobileLibrary.PlacementType;

  // Note: the HTML page 'ActionSheet.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp", {initialPage: "page1"});

  var oList2 = new List({
	  inset: true
  });

  var data = {
	  navigation: [{
		  title: "Travel Expend",
		  description: "Access the travel expend workflow",
		  icon: "images/travel_expend.png",
		  iconInset: false,
		  type: "Navigation",
		  press: 'detailPage'
	  }, {
		  title: "Travel and expense report",
		  description: "Access travel and expense reports",
		  icon: "images/travel_expense_report.png",
		  iconInset: false,
		  type: "Navigation",
		  press: 'detailPage'
	  }, {
		  title: "Travel Request",
		  description: "Access the travel request workflow",
		  icon: "images/travel_request.png",
		  iconInset: false,
		  type: "Navigation",
		  press: 'detailPage'
	  }, {
		  title: "Work Accidents",
		  description: "Report your work accidents",
		  icon: "images/wounds_doc.png",
		  iconInset: false,
		  type: "Navigation",
		  press: 'detailPage'
	  }, {
		  title: "Travel Settings",
		  description: "Change your travel worflow settings",
		  icon: "images/settings.png",
		  iconInset: false,
		  type: "Navigation",
		  press: 'detailPage'
	  }]
  };

  var oItemTemplate1 = new StandardListItem({
	  title: "{title}",
	  description: "{description}",
	  icon: "{icon}",
	  iconInset: "{iconInset}",
	  type: "{type}"
  });

  function bindListData(data, itemTemplate, list) {
	  var oModel = new JSONModel();
	  // set the data for the model
	  oModel.setData(data);
	  // set the model to the list
	  list.setModel(oModel);

	  // bind Aggregation
	  list.bindAggregation("items", "/navigation", itemTemplate);
  }

  bindListData(data, oItemTemplate1, oList2)

  var oActionSheet = new ActionSheet("actionSheet1", {
	  showCancelButton: false,
	  buttons: [
		  new Button('actionSheetButton',{
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  })
	  ],
	  placement: PlacementType.Bottom,
	  cancelButtonPress: function () {
		  Log.info("sap.m.ActionSheet: cancelButton is pressed");
	  }
  });

  var oActionSheetWithManyButtons = new ActionSheet("actionSheet2", {
	  showCancelButton: false,
	  buttons: [
		  new Button('actionSheetWithManyButtonsButton',{
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),

		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),

		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  }),
		  new Button({
			  icon: "sap-icon://accept",
			  text: "Accept Action"
		  }),
		  new Button({
			  icon: "sap-icon://decline",
			  text: "Reject Action"
		  }),
		  new Button({
			  text: "Default Action"
		  })

	  ],
	  placement: PlacementType.Bottom,
	  cancelButtonPress: function () {
		  Log.info("sap.m.ActionSheet: cancelButton is pressed");
	  }
  });

  var oActionSheetWithoutIcons = new ActionSheet('actionSheet3',{
	  buttons: [
		  new Button("specialButton",{
			  icon: "sap-icon://decline",
			  visible: false,
			  text: "First button"
		  }),
		  new Button("actionSheetWithoutIconsButton",{
			  text: "Second button"
		  }),
		  new Button({
			  text: "Third Button"
		  }),
		  new Button({
			  text: "Fourth button"
		  })
	  ]
  });

  var page1 = new Page("page1", {
	  title: "Mobile ActionSheet Control",
	  content: [
		  new Button('noTitleNoCancel',{
			  text: "No Title, No Cancel",
			  press: function () {
				  oActionSheet.setTitle(null);
				  oActionSheet.setShowCancelButton(false);
				  oActionSheet.openBy(this);
			  }
		  }).addStyleClass("newButton"),
		  new Button('noTitleWithCancel',{
			  text: "No Title, With Cancel",
			  press: function () {
				  oActionSheet.setTitle(null);
				  oActionSheet.setShowCancelButton(true);
				  oActionSheet.openBy(this);
			  }
		  }).addStyleClass("newButton"),
		  new Button('withTitleAndCancel',{
			  text: "With Title and Cancel",
			  press: function () {
				  oActionSheet.setTitle("Please choose one action");
				  oActionSheet.setShowCancelButton(true);
				  oActionSheet.openBy(this);
			  }
		  }).addStyleClass("newButton"),
		  new Button('withManyButtons',{
			  text: "With Many Buttons",
			  press: function () {
				  oActionSheetWithManyButtons.setTitle("Please choose one action");
				  oActionSheetWithManyButtons.setShowCancelButton(true);
				  oActionSheetWithManyButtons.openBy(this);
			  }
		  }).addStyleClass("newButton"),
		  new Button('withoutIcons',{
			  text: "Without icons",
			  press: function () {
				  oActionSheetWithoutIcons.openBy(this);
			  }
		  }),
		  oList2
	  ],
	  footer: new Bar({
		  contentRight: new Button({
			  icon: "sap-icon://manager",
			  press: function () {
				  oActionSheet.setPlacement(PlacementType.Vertical);
				  oActionSheet.setShowCancelButton(true);
				  oActionSheet.openBy(this);
			  }
		  })
	  })
  });

  app.addPage(page1).placeAt("content");
});