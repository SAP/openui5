sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Table",
  "sap/m/Toolbar",
  "sap/m/Label",
  "sap/m/ToolbarSpacer",
  "sap/m/Button",
  "sap/ui/model/json/JSONModel",
  "sap/m/Column",
  "sap/m/ColumnListItem",
  "sap/m/TablePersoController",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], function(
  Element,
  Table,
  Toolbar,
  Label,
  ToolbarSpacer,
  Button,
  JSONModel,
  Column,
  ColumnListItem,
  TablePersoController,
  App,
  Page,
  jQuery
) {
  "use strict";

  var oData = {
	  items: [
		  {
			  name: "Michelle",
			  color: "orange",
			  number: 3.14,
			  tools: 2.0,
			  support: 'prime',
			  events: 'None',
			  city: 'Walldorf',
			  country: 'Germany',
			  phone: '03525-2323-2352352',
			  test1:"Test1",
			  test2:"Test2",
			  test3:"Test3",
			  test4:"Test4",
			  test5:"Test5",
			  test6:"Test6",
			  test7:"Test7",
			  test8:"Test8",
			  test9:"Test9"
		  }, {
			  name: "Joseph",
			  color: "blue",
			  number: 1.618,
			  tools: 2.0,
			  support: 'prime',
			  events: 'None',
			  city: 'Walldorf',
			  country: 'Germany',
			  phone: '03525-2323-2352352',
			  test1:"Test1",
			  test2:"Test2",
			  test3:"Test3",
			  test4:"Test4",
			  test5:"Test5",
			  test6:"Test6",
			  test7:"Test7",
			  test8:"Test8",
			  test9:"Test9"
		  }, {
			  name: "David",
			  color: "green",
			  number: 0.12,
			  tools: 2.0,
			  support: 'normal',
			  events: 'None',
			  city: 'Walldorf',
			  country: 'Germany',
			  phone: '03525-2323-2352352',
			  test1:"Test1",
			  test2:"Test2",
			  test3:"Test3",
			  test4:"Test4",
			  test5:"Test5",
			  test6:"Test6",
			  test7:"Test7",
			  test8:"Test8",
			  test9:"Test9"
		  },
	  ],
	  cols: [
		  "Test1", "Test2", "Test3","Test4","Test5","Name", "Color", "Number", "Tools", "Support", "Events", "City", "Country", "Phone"
	  ]
  };

  //make sure table id suffix is set (this is necessary for personalization)
  var oTable = new Table('testTable', {
	  headerToolbar: new Toolbar({
		  content: [
			  new Label({
				  text: "Info"
			  }), new ToolbarSpacer({}),
			  /* new sap.m.Button("idPersonalizationResetButton", {
				  icon: "sap-icon://refresh"
			  }), */
			  new Button("idPersonalizationButton", {
				  icon: "sap-icon://action-settings"
			  })
		  ]
	  })
	  /* Note: this example of implicit data binding
	  columns: oData.cols.map(function (colname) {
		  //make sure column id suffix is set
		  return new sap.m.Column(colname, { header: new sap.m.Label({ text: colname }), visible: colname != "Color"})
	  })*/
  });

  oTable.setModel(new JSONModel(oData));

  /* Note: this example of data binding uses formatter
  oTable.bindAggregation("columns", {
	  path: "/cols",
	  template: new sap.m.Column({
		  header: new sap.m.Label({
			  text: {
				  path: ""
			  }
		  }),
		  visible: {
			  path: "",
			  formatter: function(sValue) {
				  return sValue !== "Color";
			  }
		  }

	  })
  });*/

  // Note: this example of data binding uses factory
  oTable.bindAggregation("columns", "/cols", function(sId, oContext) {
	  var sColname = oContext.getProperty(oContext.getPath());
	  //make sure column id suffix is set
	  return new Column(sColname, {
		  header: new Label({
			  text: sColname
		  }),
		  visible: sColname !== "Color"
	  });
  });

  oTable.bindAggregation("items", "/items", new ColumnListItem({
	  cells: oData.cols.map(function(colname) {
		  return new Label({
			  text: "{" + colname.toLowerCase() + "}"
		  });
	  })
  }));

  var oPersoService = {
	  getPersData: function() {
		  var oDeferred = new jQuery.Deferred();
		  var oBundle = this._oBundle;
		  oDeferred.resolve(oBundle);
		  return oDeferred.promise();
	  },

	  setPersData: function(oBundle) {
		  var oDeferred = new jQuery.Deferred();
		  this._oBundle = oBundle;
		  oDeferred.resolve();
		  return oDeferred.promise();
	  },

	  resetPersData: function() {
		  var oDeferred = new jQuery.Deferred();

		  var oInitialData = {
			  _persoSchemaVersion: "1.0",
			  aColumns: [
				  {
					  id: "empty_component-testTable-Name",
					  order: 2,
					  text: "Name",
					  visible: true
				  }, {
					  id: "empty_component-testTable-Number",
					  order: 1,
					  text: "Number",
					  visible: true
				  }, {
					  id: "empty_component-testTable-Color",
					  order: 0,
					  text: "Color",
					  visible: true
				  }
			  ]
		  };

		  this._oBundle = oInitialData;

		  //				this._oBundle = null;
		  oDeferred.resolve();
		  return oDeferred.promise();
	  },

	  getCaption: function(oColumn) {
		  if (oColumn.getHeader() && oColumn.getHeader().getText) {
			  if (oColumn.getHeader().getText() == "Color") {
				  return "Color: this is a very very very very long Column Name to check how the TablePersoDialog deals with it";
			  }
		  }
		  return null;
	  },

	  getGroup: function(oColumn) {
		  if (oColumn.getHeader() && oColumn.getHeader().getText) {
			  if (oColumn.getHeader().getText() == "Color") {
				  return "Primary Group";
			  }
		  }
		  return "Secondary Group";
	  }
  };

  //		jQuery.sap.require("sap.m.TablePersoController");

  var oTPC = new TablePersoController({
	  table: oTable,
	  persoService: oPersoService,
	  hasGrouping: false
  });
  oTPC.activate();

  Element.getElementById("idPersonalizationButton").attachPress(function() {
	  oTPC.openDialog();
  });

  var app = new App("myApp", {
	  initialPage: "page"
  }), page = new Page("page", {
	  title: "TablePersoDialog Testpage",
	  content: [
		  oTable
	  ]
  });

  app.addPage(page);
  app.placeAt("body");
});