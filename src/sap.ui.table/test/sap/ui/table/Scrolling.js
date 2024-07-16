sap.ui.define([
  "sap/ui/table/Table",
  "sap/ui/table/library",
  "sap/m/OverflowToolbar",
  "sap/m/ToggleButton",
  "sap/m/ToolbarSeparator",
  "sap/m/Label",
  "sap/m/Input",
  "sap/ui/model/type/Integer",
  "sap/m/Slider",
  "sap/m/Text",
  "sap/m/CheckBox",
  "sap/ui/model/type/Boolean",
  "sap/ui/core/Control",
  "sap/ui/table/Column",
  "sap/m/ObjectStatus",
  "sap/ui/core/Icon",
  "sap/ui/core/library",
  "sap/m/Button",
  "sap/m/DatePicker",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/ComboBox",
  "sap/m/MultiComboBox",
  "sap/m/Link",
  "sap/ui/unified/Currency",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Context"
], function(
  Table,
  tableLibrary,
  OverflowToolbar,
  ToggleButton,
  ToolbarSeparator,
  Label,
  Input,
  Integer,
  Slider,
  Text,
  CheckBox,
  TypeBoolean,
  Control,
  Column,
  ObjectStatus,
  Icon,
  coreLibrary,
  Button,
  DatePicker,
  Select,
  Item,
  ComboBox,
  MultiComboBox,
  Link,
  Currency,
  JSONModel,
  Context
) {
  "use strict";

  // shortcut for sap.ui.core.HorizontalAlign
  const HorizontalAlign = coreLibrary.HorizontalAlign;

  // shortcut for sap.ui.table.SelectionMode
  const SelectionMode = tableLibrary.SelectionMode;

  // Note: the HTML page 'Scrolling.html' loads this module via data-sap-ui-on-init

  // create table with supported sap.m controls
  var oTable = new Table({
	  firstVisibleRow: 770000
  });
  oTable.setFooter("Footer of the Table");
  oTable.setSelectionMode(SelectionMode.MultiToggle);

  // Variable row heights test control
  var VariableRowHeightControl = Control.extend("sap.ui.table.test.VariableRowHeightControl", {
	  metadata: {
		  properties: {
			  height: {type: "string", defaultValue: "auto"},
			  text: {type: "string", defaultValue: ""}
		  }
	  },
	  renderer: {
		  apiVersion: 2,
		  render: function(oRm, oControl) {
			  var sText = oControl.getText();

			  oRm.openStart("div", oControl);
			  oRm.style("height", oControl.getHeight());
			  oRm.style("position", "relative");
			  oRm.style("display", "flex");
			  oRm.style("align-items", "center");
			  oRm.openEnd();

			  oRm.openStart("span");
			  oRm.style("position", "absolute");
			  oRm.style("top", "0");
			  oRm.openEnd();
			  oRm.text(sText);
			  oRm.close("span");

			  oRm.openStart("span");
			  oRm.style("z-index", "1");
			  oRm.style("background-color", "white");
			  oRm.openEnd();
			  oRm.text(sText);
			  oRm.close("span");

			  oRm.openStart("span");
			  oRm.style("position", "absolute");
			  oRm.style("bottom", "0");
			  oRm.openEnd();
			  oRm.text(sText);
			  oRm.close("span");

			  oRm.close("div");
		  }
	  }
  });

  // Create the columns.

  // VariableRowHeightControl
  oTable.addColumn(new Column({
	  label: new Label({text: "VariableRowHeightControl"}),
	  template: new VariableRowHeightControl({
		  height: "{height}",
		  text: {
			  path: "config>/firstRowIndex",
			  formatter: function(iFirstRowIndex) {
				  var oRow = this.getParent();

				  if (oRow == null) {
					  return "";
				  }

				  var oTable = oRow.getParent();
				  var iRowAggregationIndex = oTable.indexOfRow(oRow);
				  var iRowIndex = iFirstRowIndex + iRowAggregationIndex;
				  return "Row #" + (iRowIndex + 1);
			  }
		  }
	  }),
	  width: "150px"
  }));

  // sap.m.Text
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Text"}),
	  template: new Text({text: "Einstein"}),
	  width: "120px"
  }));

  // sap.m.Label
  oTable.addColumn(oColumn = new Column({
	  label: new Label({text: "m.Label"}),
	  template: new Label({text: "Albert"}),
	  width: "6em"
  }));

  // sap.m.ObjectStatus
  oTable.addColumn(oColumn = new Column({
	  label: new Label({text: "m.ObjectStatus"}),
	  template: new ObjectStatus({text: "Success", state: "Success"}),
	  width: "200px"
  }));

  // sap.ui.core.Icon
  oTable.addColumn(oColumn = new Column({
	  resizable: false,
	  label: new Label({text: "core.Icon"}),
	  template: new Icon({src: "sap-icon://account", decorative: false}),
	  width: "80px",
	  hAlign: HorizontalAlign.Center
  }));

  // sap.m.Button
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Button"}),
	  template: new Button({text: "Button"}),
	  width: "100px"
  }));

  // sap.m.Input
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Input"}),
	  template: new Input({value: "Theory of relativity"}),
	  width: "200px"
  }));

  // sap.m.DatePicker
  oTable.addColumn(new Column({
	  label: new Label({text: "m.DatePicker"}),
	  template: new DatePicker({dateValue: new Date("1879-03-14")}),
	  width: "200px"
  }));

  // sap.m.Select
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Select"}),
	  template: new Select({
		  items: [
			  new Item({key: "v1", text: "Value 1"}),
			  new Item({key: "v2", text: "Value 2"}),
			  new Item({key: "v3", text: "Value 3"}),
			  new Item({key: "v4", text: "Value 4"})
		  ]
	  }),
	  width: "150px"
  }));

  // sap.m.Select
  oTable.addColumn(new Column({
	  label: new Label({text: "m.ComboBox"}),
	  template: new ComboBox({
		  items: [
			  new Item({key: "v1", text: "Value 1"}),
			  new Item({key: "v2", text: "Value 2"}),
			  new Item({key: "v3", text: "Value 3"}),
			  new Item({key: "v4", text: "Value 4"})
		  ]
	  }),
	  width: "150px"
  }));

  // sap.m.Select
  oTable.addColumn(new Column({
	  label: new Label({text: "m.MultiComboBox"}),
	  template: new MultiComboBox({
		  items: [
			  new Item({key: "v1", text: "Value 1"}),
			  new Item({key: "v2", text: "Value 2"}),
			  new Item({key: "v3", text: "Value 3"}),
			  new Item({key: "v4", text: "Value 4"})
		  ]
	  }),
	  width: "250px"
  }));

  // sap.m.Checkbox
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Checkbox"}),
	  template: new CheckBox({selected: true, text: "Genius"}),
	  width: "50px"
  }));

  // sap.m.Link
  oTable.addColumn(new Column({
	  label: new Label({text: "m.Link"}),
	  template: new Link({href: "http://www.sap.com", text: "www.sap.com"}),
	  width: "150px"
  }));

  // sap.ui.unified.Currency
  oTable.addColumn(new Column({
	  label: new Label({text: "unified.Currency"}),
	  template: new Currency({value: 123.45, currency: "EUR"}),
	  width: "200px"
  }));

  // set Model and bind Table
  var oRowModel = new JSONModel({
	  default: {
		  height: undefined
	  },
	  custom: [
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"},
		  {height: "auto"}
	  ]
  });
  var oConfigModel = new JSONModel({
	  rowWiseScrolling: false,
	  alternatingRowHeights: false,
	  rowCount: 1000000000,
	  firstRowIndex: 0,
	  rowHeight: "auto"
  });
  oTable.setModel(oRowModel);
  oTable.setModel(oConfigModel, "config");
  oTable.bindRows("/");
  oTable.getBinding().getLength = function() {
	  return oConfigModel.getProperty("/rowCount");
  };
  oTable.getBinding().getContexts = function(iStartIndex, iLength) {
	  var aContexts = [];
	  var iBindingLength = this.getLength();
	  var iCount = iStartIndex + iLength > iBindingLength ? iBindingLength - iStartIndex : iLength;
	  var bAlternatingRowHeights = oConfigModel.getProperty("/alternatingRowHeights");

	  for (var i = 0; i < iCount; i++) {
		  var iIndex = iStartIndex + i;
		  var sPath = "/default";

		  if (bAlternatingRowHeights) {
			  if (iIndex % 2 > 0) {
				  sPath = "/custom/0";
			  }
		  } else {
			  if (iIndex % 10 > 0) {
				  sPath = "/custom/" + (iIndex % 10);
			  }
		  }

		  aContexts.push(new Context(oRowModel, sPath));
	  }

	  var iOldFirstRowIndex = oConfigModel.getProperty("/firstRowIndex");
	  var iNewFirstRowIndex = iStartIndex;

	  if (iOldFirstRowIndex !== iNewFirstRowIndex) {
		  oConfigModel.setProperty("/firstRowIndex", iNewFirstRowIndex, null, true);
	  }

	  return aContexts;
  };
  oTable._bVariableRowHeightEnabled = true;
  oTable.setRowMode("Auto");
  oTable.placeAt("table");

  TABLESETTINGS.init(oTable, function(oButton) {
	  null.addContent(oButton);
  });
});