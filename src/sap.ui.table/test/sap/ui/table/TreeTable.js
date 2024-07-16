sap.ui.define([
  "sap/m/Button",
  "sap/ui/table/TreeTable",
  "sap/ui/table/library",
  "sap/ui/table/Column",
  "sap/m/Text",
  "sap/m/CheckBox",
  "sap/m/ProgressIndicator",
  "sap/m/Toolbar",
  "sap/ui/model/json/JSONModel",
  "sap/ui/table/utils/TableUtils",
  "sap/base/Log"
], function(Button, TreeTable, tableLibrary, Column, Text, CheckBox, ProgressIndicator, Toolbar, JSONModel, TableUtils, Log) {
  "use strict";

  // shortcut for sap.ui.table.SelectionMode
  const SelectionMode = tableLibrary.SelectionMode;

  // Note: the HTML page 'TreeTable.html' loads this module via data-sap-ui-on-init

  (new Button({
	  text: "Just a Button before"
  })).placeAt("content");

  var oTable = new TreeTable({
	  expandFirstLevel: true,
	  title: "Title of the TreeTable",
	  footer: "Footer of the Table",
	  groupHeaderProperty: "name",
	  selectionMode: SelectionMode.MultiToggle,
	  columns: [
		  new Column(
				  {label: "Name", template: new Text({text: "{name}", wrapping: false}), filterProperty: "name", sortProperty: "name"}),
		  new Column({label: "Description", template: "description", sortProperty: "description"}),
		  new Column({label: "Available", template: new CheckBox({selected: "{checked}"})}),
		  new Column({label: "ProgressIndicator", template: new ProgressIndicator({
			  displayValue: "50",
			  percentValue: "10",
			  showaValue: true,
			  width: "100%"
		  })})
	  ]
  });

  oTable.attachToggleOpenState(function(oEvent) {
	  Log.info("ToggleOpenState: rowIndex: " + oEvent.getParameter("rowIndex") +
						  " - rowContext: " + oEvent.getParameter("rowContext") +
						  " - expanded? " + oEvent.getParameter("expanded"));
  });

  oTable.attachRowSelectionChange(function(oEvent) {
	  Log.info("RowSelectionChange: rowIndex: " + oEvent.getParameter("rowIndex") +
						  " - rowContext: " + oEvent.getParameter("rowContext"));
  });

  // set Model and bind Table
  var oModel = new JSONModel();
  oModel.setData(TABLESETTINGS.treeTestData);
  oTable.setModel(oModel);
  oTable.bindRows("/root");
  oTable.placeAt("content");
  (new Button({text: "Just a Button after"})).placeAt("content");

  TABLESETTINGS.init(oTable, function(oButton) {
	  null.addContent(oButton);
  }, {
	  FLATMODE: {
		  text: "Flat Mode (protected)",
		  value: function(oTable) {
			  return TableUtils.Grouping.isInFlatMode(oTable);
		  },
		  input: "boolean",
		  action: function(oTable, bValue) {
			  oTable.setUseFlatMode(!!bValue);
		  }
	  }
  });
});