sap.ui.define([
  "sap/m/App",
  "sap/ui/model/json/JSONModel",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/Label",
  "sap/m/ColumnListItem",
  "sap/m/Text",
  "sap/m/ObjectMarker",
  "sap/m/MessageToast",
  "sap/m/Panel",
  "sap/m/library",
  "sap/ui/table/Table",
  "sap/ui/table/Column",
  "sap/m/Page"
], function(
  App,
  JSONModel,
  Table,
  Column,
  Label,
  ColumnListItem,
  Text,
  ObjectMarker,
  MessageToast,
  Panel,
  mobileLibrary,
  TableTable,
  TableColumn,
  Page
) {
  "use strict";

  // shortcut for sap.m.ObjectMarkerType
  const ObjectMarkerType = mobileLibrary.ObjectMarkerType;

  // Note: the HTML page 'ObjectMarker.html' loads this module via data-sap-ui-on-init

  var oApp = new App({  initialPage: "page" });

  var aData = [
	  { lastName: "Dente", name: "Al", type: "Locked", addInfo: "someVeryLongTextToSeeIfItWillWrap" },
	  { lastName: "Friese", name: "Andy", type: "Draft", addInfo: "someVeryLongTextToSeeIfItWillWrap" },
	  { lastName: "Mann", name: "Anita", type: "Unsaved", addInfo: "someVeryLongTextToSeeIfItWillWrap" },
	  { lastName: "Schutt", name: "Doris", type: "Favorite", addInfo: "someVeryLongTextToSeeIfItWillWrap" },
	  { lastName: "Open", name: "Doris", type: "Flagged", addInfo: "someVeryLongTextToSeeIfItWillWrap" }
  ];

  var oModel = new JSONModel();
  oModel.setData({ modelData: aData });

  var oTable = new Table({
	  columns : [
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
			  header : new Label({
				  text : "Object Marker"
			  })
		  }),
		  new Column({
			  header : new Label({
				  text : "Object Marker (active)"
			  })
		  }),
		  new Column({
			  header : new Label({
				  text : "Object Marker with long text"
			  })
		  }),
		  new Column({
			  header : new Label({
				  text : "Object Marker (active) with long text"
			  })
		  })
	  ]
  });

  oTable.setModel(oModel);
  oTable.bindItems("/modelData", new ColumnListItem({
	  vAlign: "Middle",
	  cells : [
		  new Text({
			  text : "{lastName}",
			  wrapping : false
		  }),
		  new Text({
			  text : "{name}",
			  wrapping : false
		  }),
		  new ObjectMarker({
			  type: "{type}"
		  }),
		  new ObjectMarker({
			  type: "{type}",
			  press: function(oEvent) {
				  MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
			  }
		  }),
		  new ObjectMarker({
			  type: "{type}",
			  additionalInfo: "{addInfo}",
		  }),
		  new ObjectMarker({
			  type: "{type}",
			  additionalInfo: "{addInfo}",
			  press: function(oEvent) {
				  MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
			  }
		  })
	  ]
  }));

  var oTablePanel = new Panel({
	  headerText: "In a table usecase",
	  content: oTable
  });

  var oStandalonePanel = new Panel("standalone-panel", {
	  headerText: "Standalone usecase",
	  content: [
		  new ObjectMarker({
		  }).setType(ObjectMarkerType.Locked),
		  new ObjectMarker({
			  type: "Flagged"
		  }),
		  new ObjectMarker({
			  type: ObjectMarkerType.Favorite
		  }),
		  new ObjectMarker({
			  type: "Locked"
		  }),
		  new ObjectMarker({
			  type: "Draft",
			  press: function(oEvent) {
				  MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
			  }
		  }),
		  new ObjectMarker({
			  type: ObjectMarkerType.Unsaved
		  })
	  ]
  });

  var oUITable = new TableTable({
  columns : [
	  new TableColumn({
		  name : "ID2",
		  label : new Label({
			  text : "Object Marker with press event"
		  }),
		  template : new ObjectMarker({
			  type : "{type}",
			  press: function(oEvent) {
				  MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
			  }
		  })
	  }),
	  new TableColumn({
		  name : "ID3",
		  label : new Label({
			  text : "Object Marker"
		  }),
		  hAlign:"End",
		  template : new ObjectMarker({
			  type : "{type}"
		  })
	  }),
	  new TableColumn({
		  name : "ID4",
		  label : new Label({
			  text : "Object Marker"
		  }),
		  template : new ObjectMarker({
			  type : "{type}"
		  })
	  })
  ]
});

  var aTData = [
	  {type : "Flagged"},
	  {type : "Draft"},
	  {type : "Unsaved"},
	  {type : "Favorite"}
  ];

  oUITable.setModel(new JSONModel(aTData));

  oUITable.bindAggregation("rows", {
	  path : "/"
  });

  var oUITablePanel = new Panel({
		  headerText: "In a sap.ui.table.Table usecase",
		  content: oUITable
	  });

  var oPage = new Page("page", {
	  title:"Object Marker",
	  content: [
		  oStandalonePanel,
		  oTablePanel,
		  oUITablePanel
	  ]
  });

  oApp.addPage(oPage).placeAt("body");
});