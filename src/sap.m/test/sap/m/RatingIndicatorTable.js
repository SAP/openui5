sap.ui.define([
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/App",
  "sap/m/Label",
  "sap/ui/model/json/JSONModel",
  "sap/m/library",
  "sap/ui/core/Item",
  "sap/m/Select",
  "sap/m/ToggleButton",
  "sap/ui/model/Sorter",
  "sap/ui/model/Filter",
  "sap/m/Toolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/Text",
  "sap/ui/core/Icon",
  "sap/m/Title",
  "sap/m/Button",
  "sap/m/Column",
  "sap/m/Link",
  "sap/m/ColumnListItem",
  "sap/m/CheckBox",
  "sap/m/RatingIndicator",
  "sap/m/DatePicker",
  "sap/m/Table",
  "sap/m/Page",
  "sap/ui/core/Core"
], function(
  MessageBox,
  MessageToast,
  App,
  Label,
  JSONModel,
  mobileLibrary,
  Item,
  Select,
  ToggleButton,
  Sorter,
  Filter,
  Toolbar,
  ToolbarSpacer,
  Text,
  Icon,
  Title,
  Button,
  Column,
  Link,
  ColumnListItem,
  CheckBox,
  RatingIndicator,
  DatePicker,
  Table,
  Page,
  Core
) {
  "use strict";

  // shortcut for sap.m.ListType
  const ListType = mobileLibrary.ListType;

  // shortcut for sap.m.ListMode
  const ListMode = mobileLibrary.ListMode;

  // Note: the HTML page 'RatingIndicatorTable.html' loads this module via data-sap-ui-on-init

  var aData = [
	  {lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
	  {lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
	  {lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
	  {lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
	  {lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
	  {lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
	  {lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
	  {lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
	  {lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
	  {lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
	  {lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
	  {lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
	  {lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
	  {lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
	  {lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
	  {lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
	  {lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
	  {lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
	  {lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
	  {lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"}
  ];

  var oApp = new App;

  function openViewSettingsDialog() {
	  MessageToast.show("View Settings Dialog");
  }

  function openPersonalizationDialog() {
	  MessageToast.show("Personalization Dialog");
  }

  var oSalaryFooter = new Label({
	  text : "9.470.095 EUR"
  });

  var oModel = new JSONModel();
  oModel.setData({modelData: aData});

  var aModes = Object.keys(ListMode).map(function(sMode) {
	  return new Item({
		  key: sMode,
		  text: sMode
	  });
  });

  var oModes = new Select({
	  tooltip: "Mode",
	  items: aModes,
	  change: function(oEvent) {
		  var sMode = oEvent.getParameter("selectedItem").getKey();
		  oTable.setMode(sMode);
	  }
  });

  var aTypes = Object.keys(ListType).map(function(sType) {
	  return new Item({
		  key: sType,
		  text: sType
	  });
  });

  var oTypes = new Select({
	  tooltip: "Item Type",
	  items: aTypes,
	  change: function(oEvent) {
		  var sType = oEvent.getParameter("selectedItem").getKey();
		  oTable.getItems().forEach(function(oItem) {
			  oItem.setProperty("type", sType, true);
		  });
		  oTable.invalidate();
	  }
  });

  var oGrowing = new ToggleButton({
	  text : "Growing",
	  press : function() {
		  oTable.setGrowing(oGrowing.getPressed());
		  oModel.setDefaultBindingMode(oGrowing.getPressed() ? "OneWay" : "TwoWay");
		  oTable.bindItems("/modelData", oTemplate);
	  }
  });

  var oMerging = new ToggleButton({
	  text : "Merging",
	  press : function() {
		  var oAvailableColumn = oTable.getColumns()[2];
		  oAvailableColumn.setMergeFunctionName("getSelected");
		  oAvailableColumn.setMergeDuplicates(oMerging.getPressed());
	  }
  });

  var oGrouping = new ToggleButton({
	  text : "Grouping",
	  press : function() {
		  var oBinding = oTable.getBinding("items");
		  if (oGrouping.getPressed()) {
			  oBinding.sort([
				  new Sorter("checked", true, function(oContext) {
					  var bChecked = oContext.getProperty("checked");
					  var sStatus = bChecked ? "Available" : "Unavailable";
					  return {
						  key : sStatus,
						  text : sStatus
					  }
				  })
			  ]);
		  } else {
			  oBinding.sort([]);
		  }
	  }
  });

  var oNoData = new ToggleButton({
	  text : "No Data",
	  press : function() {
		  var oBinding = oTable.getBinding("items");
		  var oSalaryColumn = oTable.getColumns()[7];
		  if (oNoData.getPressed()) {
			  oSalaryColumn.setFooter(null);
			  oBinding.filter([new Filter("name", "Contains", "xxx")]);
		  } else {
			  oSalaryColumn.setFooter(oSalaryFooter.clone());
			  oBinding.filter([]);
		  }
	  }
  });

  var oTableActions = new Toolbar({
	  content : [
		  oModes, oTypes, new ToolbarSpacer(), oNoData, new ToolbarSpacer(), oGrowing, oGrouping, oMerging

	  ]
  });

  var oTableInfo = new Toolbar({
	  active : true,
	  content : [
		  new Text({
			  text : "The quick brown fox jumps over the lazy dog.",
			  wrapping : false
		  }),
		  new ToolbarSpacer(),
		  new Icon({
			  src : "sap-icon://add-filter"
		  })
	  ]
  });

  var oTableHeader = new Toolbar({
	  content : [
		  new Title({
			  text : "Keyboard Handling Test Page"
		  }),
		  new ToolbarSpacer(),
		  new Button({
			  tooltip: "View Settings",
			  icon: "sap-icon://drop-down-list",
			  press: openViewSettingsDialog
		  }),
		  new Button({
			  tooltip: "Personalization Settings",
			  icon: "sap-icon://action-settings",
			  press: openPersonalizationDialog
		  })
	  ]
  });

  var aColumns = [
	  new Column({
		  header : new Label({
			  text : "LastName"
		  })
	  }),
	  new Column({
		  header : new Label({
			  text : "FirstName"
		  })
	  }),
	  new Column({
		  hAlign: "Center",
		  header : new Label({
			  text : "Available"
		  })
	  }),
	  new Column({
		  header : new Link({
			  text : "Website"
		  }),
		  minScreenWidth : "XXLarge",
		  popinDisplay : "Inline",
		  demandPopin : true
	  }),
	  new Column({
		  hAlign: "Center",
		  header : new Label({
			  text : "Image"
		  }),
		  minScreenWidth : "Phone",
	  }),
	  new Column({
		  header : new Label({
			  text : "Raiting"
		  }),
		  minScreenWidth : "Tablet",
		  popinDisplay : "WithoutHeader",
		  demandPopin : true
	  }),
	  new Column({
		  header : new Label({
			  text : "Birthday"
		  }),
		  minScreenWidth: "800px"
	  }),
	  new Column({
		  hAlign: "End",
		  header : new Label({
			  text : "Salary"
		  }),
		  footer : oSalaryFooter.clone(),
		  minScreenWidth : "Desktop",
		  popinDisplay : "Inline",
		  demandPopin : true
	  }),
  ];

  var oTemplate = new ColumnListItem({
	  vAlign: "Middle",
	  type : "{type}",
	  detailPress: function() {
		  setTimeout(function() {
			  MessageToast.show("detail is pressed");
		  }, 10);
	  },
	  cells : [
		  new Text({
			  text : "{lastName}",
			  wrapping : false
		  }),
		  new Text({
			  text : "{name}",
			  wrapping : false
		  }),
		  new CheckBox({
			  selected: "{checked}"
		  }),
		  new Link({
			  text: "{linkText}"
		  }),
		  new Icon({
			  src : "sap-icon://{src}"
		  }),
		  new RatingIndicator({
			  value: "{rating}"
		  }),
		  new DatePicker({
			  value : "{birthday}",
			  valueFormat : "yyyy-MM-dd",
			  displayFormat : "dd.MM.yyyy"
		  }),
		  new Text({
			  text : "{money} EUR",
		  }),
	  ]
  });

  var oSwipe = new Button({
	  text : "Swipe Button",
	  type : "Accept",
	  press : function(e) {
		  oTable.swipeOut();
	  }
  });

  var oTable = new Table({
	  growingThreshold: 50,
	  growingScrollToLoad : false,
	  footerText : "Static table footer text",
	  headerToolbar : oTableHeader,
	  infoToolbar : oTableInfo,
	  swipeContent : oSwipe,
	  columns : aColumns,
	  selectionChange : function(e) {
		  MessageToast.show("selection is changed");
	  },
	  "delete" : function(oEvent) {
		  var oItem = oEvent.getParameter("listItem");

		  MessageBox.confirm("Are you sure to delete this record?", {
			  onClose: function(sResult){
				  if (sResult == MessageBox.Action.CANCEL) {
					  return;
				  }

				  oTable.removeItem(oItem);
				  setTimeout(function() {
					  oTable.focus();
				  }, 0);
			  }
		  });
	  },
	  itemPress : function(e) {
		  MessageToast.show("item is pressed");
	  }
  });

  oTable.setModel(oModel);
  oTable.bindItems("/modelData2", oTemplate);

  var oPage = new Page({
	  title : "Table Test Page",
	  enableScrolling : true,
	  footer: oTableActions,
	  content : [oTable]
  });

  oApp.addPage(oPage).placeAt("body");
});