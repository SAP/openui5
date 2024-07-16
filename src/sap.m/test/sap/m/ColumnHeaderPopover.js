sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/Column",
  "sap/m/Label",
  "sap/m/ColumnListItem",
  "sap/m/Text",
  "sap/m/CheckBox",
  "sap/m/Link",
  "sap/ui/core/Icon",
  "sap/m/RatingIndicator",
  "sap/m/DatePicker",
  "sap/m/Table",
  "sap/ui/model/json/JSONModel",
  "sap/m/ColumnPopoverSortItem",
  "sap/ui/core/Item",
  "sap/ui/model/Sorter",
  "sap/m/ColumnPopoverActionItem",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/ui/model/Filter",
  "sap/m/Input",
  "sap/m/ColumnHeaderPopover",
  "sap/m/ColumnPopoverCustomItem",
  "sap/m/Button",
  "sap/m/App",
  "sap/m/Page"
], function(
  MessageToast,
  Column,
  Label,
  ColumnListItem,
  Text,
  CheckBox,
  Link,
  Icon,
  RatingIndicator,
  DatePicker,
  Table,
  JSONModel,
  ColumnPopoverSortItem,
  Item,
  Sorter,
  ColumnPopoverActionItem,
  List,
  StandardListItem,
  Filter,
  Input,
  ColumnHeaderPopover,
  ColumnPopoverCustomItem,
  Button,
  App,
  Page
) {
  "use strict";
  // Note: the HTML page 'ColumnHeaderPopover.html' loads this module via data-sap-ui-on-init

  //***********************TABLE*********************************

  //***********************DATA**********************************
  var oTableData = {
	  headers: [
		  {
			  text: "LastName"
		  },
		  {
			  text: "FirstName"
		  },
		  {
			  hAlign: "Center",
			  text: "Available"
		  },
		  {
			  text: "Test2",
			  minScreenWidth: "XXLarge",
			  popinDisplay: "Inline",
			  demandPopin: true,
			  hAlign: "End"
		  },
		  {
			  hAlign: "Center",
			  text: "Image",
			  minScreenWidth: "Phone",
		  },
		  {
			  text: "Raiting",
			  minScreenWidth: "Tablet",
			  popinDisplay: "WithoutHeader",
			  demandPopin: true
		  },
		  {
			  text: "Birthday",
			  minScreenWidth: "800px"
		  }
	  ],
	  models: [
		  {
			  id: Math.random(),
			  lastName: "Dente",
			  name: "Al",
			  checked: true,
			  linkText: "www.sap.com",
			  href: "http://www.sap.com",
			  src: "employee",
			  gender: "male",
			  rating: 4,
			  money: 5.67,
			  birthday: "1984-06-01",
			  currency: "EUR",
			  type: "Inactive"
		  },
		  {
			  id: Math.random(),
			  lastName: "Friese",
			  name: "Andy",
			  checked: true,
			  linkText: "www.google.de",
			  href: "http://www.google.de",
			  src: "leads",
			  gender: "male",
			  rating: 2,
			  money: 10.45,
			  birthday: "1975-01-01",
			  currency: "EUR",
			  type: "Inactive"
		  },
		  {
			  id: Math.random(),
			  lastName: "Mann",
			  name: "Anita",
			  checked: false,
			  linkText: "www.kicker.de",
			  href: "http://www.kicker.de",
			  src: "employee",
			  gender: "female",
			  rating: 3,
			  money: 1345.212,
			  birthday: "1987-01-07",
			  currency: "EUR",
			  type: "Inactive"
		  },
		  {
			  id: Math.random(),
			  lastName: "Schutt",
			  name: "Doris",
			  checked: true,
			  linkText: "www.facebook.de",
			  href: "http://www.facebook.de",
			  src: "employee",
			  gender: "female",
			  rating: 4,
			  money: 1.1,
			  birthday: "2001-03-01",
			  currency: "USD",
			  type: "Inactive"
		  },
		  {
			  id: Math.random(),
			  lastName: "Open",
			  name: "Doris",
			  checked: true,
			  linkText: "www.spiegel.de",
			  href: "http://www.spiegel.de",
			  src: "doctor",
			  gender: "female",
			  rating: 2,
			  money: 55663.1,
			  birthday: "1953-01-04",
			  currency: "USD",
			  type: "Inactive"
		  },
		  {
			  id: Math.random(),
			  lastName: "Dewit",
			  name: "Kenya",
			  checked: false,
			  linkText: "www.google.de",
			  href: "http://www.google.de",
			  src: "employee",
			  gender: "female",
			  rating: 3,
			  money: 34.23,
			  birthday: "1957-01-01",
			  currency: "EUR",
			  type: "Inactive"
		  }
	  ]
  };

  //******************TEMPLATE*************************************************

  var oColumnTemplate = new Column({
	  header: new Label({text: "{text}"}),
	  hAlign: "{hAlign}",
	  minScreenWidth: "{minScreenWidth}",
	  popinDisplay: "{popinDisplay}",
	  demandPopin: "{demandPopin}"
  });

  var oListTemplate = new ColumnListItem({
	  vAlign: "Middle",
	  type: "{type}",
	  cells: [
		  new Text({
			  text: "{lastName}",
			  wrapping: false
		  }),
		  new Text({
			  text: "{name}",
			  wrapping: false
		  }),
		  new CheckBox({
			  selected: "{checked}"
		  }),
		  new Link({
			  text: "{linkText}"
		  }),
		  new Icon({
			  src: "sap-icon://{src}",
			  decorative: false,
			  press: function () {
			  }
		  }),
		  new RatingIndicator({
			  value: "{rating}"
		  }),
		  new DatePicker({
			  value: "{birthday}",
			  valueFormat: "yyyy-MM-dd",
			  displayFormat: "dd.MM.yyyy"
		  }),
		  new Text({
			  text: "{money} EUR",
		  })
	  ]
  });


  //*****************MODEL AND BINDING**********************************

  var oTable = new Table({
	  growing: true,
	  growingThreshold: 5
  });

  var oModel = new JSONModel(oTableData);
  oTable.setModel(oModel);

  oTable.bindAggregation("columns", {
	  path: "/headers",
	  template: oColumnTemplate
  });
  oTable.bindItems({
	  path: "/models",
	  template: oListTemplate,
	  key: "id"
  });

  oTable.attachEvent("columnPress", function (oEvent) {
	  var oColumn = oEvent.getParameter("column");
	  //if (oColumn === oTable.getColumns()[1]) {
		  var sSortProperty = oColumn.getHeader().getText();
		  // hand added key
		  var oSortItem = new ColumnPopoverSortItem({
			  items: [
				  new Item({
					  text: sSortProperty + " 1"
				  }),
				  new Item({
					  text: sSortProperty + " 2"
				  })
			  ],
			  sort: function (oEvent) {
				  var oTableBinding = oTable.getBinding("items"),
						  bAscending = false,
						  oSorter = new Sorter("name", !bAscending);
				  oTableBinding.sort([oSorter]);
			  }
		  });
		  // TODO: improve - no parent ??
		  //	oColumn.addDependent(oPopover);
		  oPopover.addItem(oSortItem);

		  var oGroupItem = new ColumnPopoverActionItem({
			  icon: "sap-icon://group",
			  text: "group",
			  press: function (oEvent) {
				  var oGrouping = new Sorter("name", true, function (oContext) {
					  var sKey = oContext.getProperty("name");
					  return {
						  key: sKey,
						  text: sKey
					  };
				  });
				  oTable.getBinding("items");
				  oTable.getBinding("items").sort(oGrouping);
			  }
		  });
		  oPopover.addItem(oGroupItem);
		  oPopover.openBy(oColumn);
	  }

  );
  oTable.bActiveHeaders = true;


  //**********************CHP**********************************

  var oList = new List();
  oList.setModel(oModel);
  oList.bindItems({
	  path: "/headers",
	  template: new StandardListItem({
		  title: "{text}"
	  })
  });

  var oListfilter = new List({
	  items: [
		  new StandardListItem({
			  type: "Active",
			  title: "Doris",
			  press: function (oEvent) {
				  var oFilter = new Filter("name", "Contains", "doris");
				  oTable.getBinding("items").filter(oFilter);
				  oPopover.getAggregation("_popover").close();
			  }
		  })
	  ]
  });

  var oData = [
	  {
		  type: "action",
		  visible: false,
		  text: "sort",
		  icon: "sap-icon://money-bills"
	  },
	  {
		  type: "custom",
		  visible: true,
		  text: "custom item tooltip",
		  icon: "sap-icon://call",
		  content: oList
	  },
	  {
		  type: "sort",
		  visible: false
	  },
	  {
		  type: "custom",
		  visible: true,
		  text: "filter",
		  icon: "sap-icon://filter",
		  content: oListfilter
	  } ,
	  {
		  type: "action",
		  visible : true,
		  text: "action",
		  icon: "sap-icon://meeting-room"
	  },
	  {
		  type: "custom",
		  visible : true,
		  text: "custom item tooltip",
		  icon: "sap-icon://money-bills",
		  content: new Input()
	  }
  ];

  function handlePressEvent(oEvent) {
	  MessageToast.show("action");
  }

  var oPopover = new ColumnHeaderPopover();

  var oModel = new JSONModel();
  oPopover.setModel(oModel);
  oModel.setData(oData);
  oPopover.bindItems("/", function (id, oContext) {
	  var oItem = oContext.getObject();
	  switch (oItem.type) {
		  case "action":
			  return new ColumnPopoverActionItem({
				  visible: "{visible}",
				  text: "{text}",
				  icon: "{icon}",
				  press: handlePressEvent
			  });
		  case "custom":
			  return new ColumnPopoverCustomItem({
				  visible: "{visible}",
				  text: "{text}",
				  icon: "{icon}",
				  content: oItem.content
			  });
		  case "sort":
			  return new ColumnPopoverSortItem({
				  visible: "{visible}"
			  });
	  }
  });

  var oButton = new Button({
	  text: "columnHeaderPopover",
	  press: function () {
		  oPopover.openBy(this);
	  }
  });

  //*****************PAGE*********************************************

  var oApp = new App;

  var oPage = new Page({
	  title: "ColumnPopover Test Page",
	  enableScrolling: true,
	  content: [oTable, oButton]
  });

  oApp.addPage(oPage).placeAt("body");
});