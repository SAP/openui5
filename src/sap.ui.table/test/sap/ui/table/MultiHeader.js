sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/table/Column",
  "sap/m/Text",
  "sap/m/Label",
  "sap/m/ObjectStatus",
  "sap/ui/core/Icon",
  "sap/ui/core/library",
  "sap/m/CheckBox",
  "sap/ui/table/Table",
  "sap/ui/table/rowmodes/Fixed",
  "sap/ui/table/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Button",
  "sap/ui/layout/Splitter"
], function(
  JSONModel,
  Column,
  Text,
  Label,
  ObjectStatus,
  Icon,
  coreLibrary,
  CheckBox,
  Table,
  Fixed,
  tableLibrary,
  App,
  Page,
  Button,
  Splitter
) {
  "use strict";

  // shortcut for sap.ui.table.SelectionMode
  const SelectionMode = tableLibrary.SelectionMode;

  // shortcut for sap.ui.core.HorizontalAlign
  const HorizontalAlign = coreLibrary.HorizontalAlign;

  // Note: the HTML page 'MultiHeader.html' loads this module via data-sap-ui-on-init

  var oModel = new JSONModel();
  oModel.setData({modelData: TABLESETTINGS.listTestData});

  function createColumns(oTable) {

	  // 1st column with multilabels
	  oTable.addColumn(new Column({
		  multiLabels: [
			  new Text({text: "Row:1, Column header with a long description", wrapping: true, textAlign: "Center", width: "100%"}),
			  new Label({text: "Row:2, Column:1", wrapping: true, required: true})
		  ],
		  headerSpan: "3, 1",
		  template: new Text({text: "{lastName}"}),
		  sortProperty: "lastName",
		  filterProperty: "lastName",
		  width: "100px",
		  flexible: false,
		  autoResizable: true,
		  resizable: true
	  }));

	  // 2nd column with multilabels
	  oTable.addColumn(new Column({
		  multiLabels: [
			  new Text({text: "Row:1, Column:2 invisible", wrapping: false}),
			  new Text({text: "Row:2, Column:2", wrapping: false, textAlign: "Center", width: "100%"}),
			  new Text({text: "Row:3, Column:2", wrapping: false})
		  ],
		  headerSpan: [0, 2],
		  template: new Label({text: "{name}"}),
		  sortProperty: "name",
		  filterProperty: "name",
		  width: "100px",
		  flexible: false,
		  autoResizable: true,
		  resizable: true
	  }));

	  // 3rd column with multilabels
	  oTable.addColumn(new Column({
		  multiLabels: [
			  new Text({text: "Row:1, Column:3 - long text", wrapping: false}),
			  new Text({text: "Row:2, Column:3", wrapping: false}),
			  new Text({text: "Row:3, Column:3", wrapping: false})
		  ],
		  template: new ObjectStatus({text: "{objStatusText}", state: "{objStatusState}"}),
		  sortProperty: "objStatusState",
		  filterProperty: "objStatusState",
		  width: "100px",
		  flexible: true,
		  autoResizable: true,
		  resizable: true
	  }));

	  // Other columns
	  oTable.addColumn(new Column({
		  multiLabels: [
			  new Label({text: "Person"}),
			  new Label({text: "Icon"})
		  ],
		  headerSpan: "2",
		  template: new Icon({src: "sap-icon://account", decorative: false}),
		  hAlign: HorizontalAlign.Center,
		  width: "100px",
		  flexible: true,
		  autoResizable: true,
		  resizable: true
	  }));

	  oTable.addColumn(new Column({
		  multiLabels: [
			  new Label({text: "Person"}),
			  new Label({text: "Gender"})
		  ],
		  template: new Label({text: "{gender}"}),
		  width: "100px",
		  flexible: false,
		  autoResizable: true,
		  resizable: true
	  }));

	  oTable.addColumn(new Column({
		  label: new Label({text: "Checked"}),
		  template: new CheckBox({selected: "{checked}", text: "{checked}"}),
		  width: "100px",
		  flexible: false,
		  autoResizable: true,
		  resizable: true
	  }));
  }

  var oTable1 = new Table({
	  rowMode: new Fixed({
		  fixedTopRowCount: 1,
		  fixedBottomRowCount: 1
	  })
  });
  oTable1.setSelectionMode(SelectionMode.MultiToggle);
  oTable1.setFixedColumnCount(0);
  oTable1.setEnableColumnFreeze(true);
  createColumns(oTable1);
  oTable1.setModel(oModel);
  oTable1.bindRows("/modelData");

  var oTable2 = new Table();
  oTable2.setSelectionMode(SelectionMode.MultiToggle);
  oTable2.setFixedColumnCount(0);
  oTable2.setEnableColumnFreeze(true);
  createColumns(oTable2);
  oTable2.setModel(oModel);
  oTable2.bindRows("/modelData");

  var app = new App("tableApp", {initialPage: "page1"});

  var page1 = new Page("page1", {
	  enableScrolling: false,
	  title: "Page 1",
	  headerContent: [
		  new Button({
			  text: "Go to Table 2",
			  press: function() { app.to("page2", "slide"); }
		  })
	  ],
	  content: [oTable1]
  });

  var page2 = new Page("page2", {
	  title: "Page 2",
	  enableScrolling: true,
	  headerContent: [
		  new Button({
			  text: "Go to Table 1",
			  press: function() { app.to("page1", "slide"); }
		  })
	  ],
	  content: [new Splitter({contentAreas: [oTable2]})]
  });

  app.addPage(page1).addPage(page2).placeAt("body");
});