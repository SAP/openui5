sap.ui.define([
  "sap/ui/table/Table",
  "sap/m/Title",
  "sap/m/IllustratedMessage",
  "sap/m/IllustratedMessageType",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/MessageToast",
  "sap/m/Text",
  "sap/m/table/columnmenu/Menu",
  "sap/m/table/columnmenu/QuickAction",
  "sap/m/table/columnmenu/Item",
  "sap/m/ComboBox",
  "sap/ui/core/Item",
  "sap/ui/table/Column",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/ObjectStatus",
  "sap/ui/core/Icon",
  "sap/ui/core/library",
  "sap/m/DatePicker",
  "sap/ui/model/type/Date",
  "sap/m/Select",
  "sap/m/MultiComboBox",
  "sap/m/CheckBox",
  "sap/m/HBox",
  "sap/m/Link",
  "sap/ui/unified/Currency",
  "sap/m/ProgressIndicator",
  "sap/m/RatingIndicator",
  "sap/ui/model/json/JSONModel",
  "sap/m/VBox",
  "sap/m/FlexItemData",
  "sap/base/Log"
], function(
  Table,
  Title,
  IllustratedMessage,
  IllustratedMessageType,
  Button,
  Toolbar,
  MessageToast,
  Text,
  Menu,
  QuickAction,
  Item,
  ComboBox,
  CoreItem,
  Column,
  Input,
  Label,
  ObjectStatus,
  Icon,
  coreLibrary,
  DatePicker,
  TypeDate,
  Select,
  MultiComboBox,
  CheckBox,
  HBox,
  Link,
  Currency,
  ProgressIndicator,
  RatingIndicator,
  JSONModel,
  VBox,
  FlexItemData,
  Log
) {
  "use strict";

  // shortcut for sap.ui.core.HorizontalAlign
  const HorizontalAlign = coreLibrary.HorizontalAlign;

  // Note: the HTML page 'Table.html' loads this module via data-sap-ui-on-init

  function pressHandler(oEvent) {
	  var bCellClick = oEvent.getId() === "cellClick";
	  Log.warning((bCellClick ? "Cell" : oEvent.getSource().getMetadata().getName()) + " pressed");
	  if (!bCellClick) {
		  oEvent.preventDefault();
	  }
  }

  var oTable = new Table({
	  extension: new Title({text: "Title of the Table", titleStyle: "H3"}),
	  footer: "Footer of the Table",
	  rowMode: "Auto",
	  firstVisibleRow: 1,
	  noData: new IllustratedMessage({
		  illustrationType: IllustratedMessageType.NoSearchResults,
		  title: "No Items found",
		  description: "Adjust your filter settings.",
		  additionalContent: [
			  new Button({text: "Trigger Something", press: function() {alert("Something");} })
		  ]
	  })
  });

  // create columns
  var oControl, oColumn, oMenu;

  // sap.m.Text
  oControl = new Text({text: "{lastName}", wrapping: false});
  oMenu = new Menu({
	  quickActions: [
		  new QuickAction({
			  label: "Quick Action A",
			  content: new Button({text: "Execute QA"})
		  })
	  ],
	  items: [
		  new Item({
			  label: "Item A",
			  icon: "sap-icon://sort",
			  content: new ComboBox({
				  items: [
					  new CoreItem({key: "v1", text: "Value 1"}),
					  new CoreItem({key: "v2", text: "Value 2"})
				  ]
			  })
		  })
	  ]
  });
  oColumn = new Column(
	  {label: new Text({text: "m.Text"}), template: oControl, width: "120px", sortProperty: "lastName", filterProperty: "lastName"});
  oColumn.setHeaderMenu(oMenu);
  oColumn.setCreationTemplate(new Input({value: "{lastName}"}));
  oColumn.data("clipboard", "lastName");
  oTable.addColumn(oColumn);

  // sap.m.Label
  oControl = new Label({text: "{name}"});
  var oMenu2 = new Menu({
	  quickActions: [
		  new QuickAction({
			  label: "custom quick sort",
			  content: new Button({text: "QA2.1"}),
			  category: "Sort"
		  }),
		  new QuickAction({
			  label: "custom quick action",
			  content: new Button({text: "QA2.2"})
		  })
	  ]
  });
  oColumn = new Column(
		  {label: new Label({text: "m.Label"}), template: oControl, sortProperty: "name", filterProperty: "name", width: "6em"});
  oColumn.setHeaderMenu(oMenu2);
  oColumn.setCreationTemplate(new Input({value: "{name}"}));
  oColumn.data("clipboard", "name");
  oTable.addColumn(oColumn);

  // sap.m.ObjectStatus
  oControl = new ObjectStatus({text: "{objStatusText}", state: "{objStatusState}"});
  oColumn = new Column({
	  label: new Label({text: "m.ObjectStatus"}),
	  template: oControl,
	  sortProperty: "objStatusState",
	  filterProperty: "objStatusState",
	  width: "200px"
  }).data("clipboard", "objStatusText");
  oTable.addColumn(oColumn);

  // sap.ui.core.Icon
  oControl = new Icon({src: "sap-icon://account", decorative: false});
  oColumn = new Column({
	  resizable: false,
	  label: new Label({text: "core.Icon"}),
	  template: oControl,
	  width: "80px",
	  hAlign: HorizontalAlign.Center
  }).data("clipboard", "src");
  oTable.addColumn(oColumn);

  // sap.m.Button
  oControl = new Button({text: "{gender}", press: pressHandler});
  oColumn = new Column({label: new Label({text: "m.Button"}), template: oControl, width: "100px"}).data("clipboard", "gender");
  oTable.addColumn(oColumn);

  // sap.m.Input
  oControl = new Input({value: "{name}"});
  oColumn = new Column({label: new Label({text: "m.Input"}), template: oControl, width: "200px"}).data("clipboard", "name");
  oColumn.setCreationTemplate(new Text({text: "{name}"}));
  oTable.addColumn(oColumn);

  // sap.m.DatePicker
  oControl = new DatePicker({dateValue: "{birthdayDate}"});
  oColumn = new Column({label: new Label({text: "m.DatePicker"}), template: oControl, width: "200px", filterProperty: "birthdayDate", filterType: new TypeDate() }).data("clipboard", "birthdayDate");
  oColumn.setCreationTemplate(new DatePicker({dateValue: "{birthdayDate}"}));
  oColumn.setHeaderMenu(new Menu());
  oTable.addColumn(oColumn);

  // sap.m.Select
  oControl = new Select({
	  items: [
		  new CoreItem({key: "v1", text: "Value 1"}),
		  new CoreItem({key: "v2", text: "Value 2"}),
		  new CoreItem({key: "v3", text: "Value 3"}),
		  new CoreItem({key: "v4", text: "Value 4"})
	  ]
  });
  oColumn = new Column({label: new Label({text: "m.Select"}), template: oControl, width: "150px"});
  oColumn.setCreationTemplate((new Select({items: oControl.getItems().map(function(oItem) {return oItem.clone();})})));
  oTable.addColumn(oColumn);

  // sap.m.ComboBox
  oControl = new ComboBox({
	  items: [
		  new CoreItem({key: "v1", text: "Value 1"}),
		  new CoreItem({key: "v2", text: "Value 2"}),
		  new CoreItem({key: "v3", text: "Value 3"}),
		  new CoreItem({key: "v4", text: "Value 4"})
	  ]
  });
  oColumn = new Column({label: new Label({text: "m.ComboBox"}), template: oControl, width: "150px"});
  oTable.addColumn(oColumn);

  // sap.m.MultiComboBox
  oControl = new MultiComboBox({
	  items: [
		  new CoreItem({key: "v1", text: "Value 1"}),
		  new CoreItem({key: "v2", text: "Value 2"}),
		  new CoreItem({key: "v3", text: "Value 3"}),
		  new CoreItem({key: "v4", text: "Value 4"})
	  ]
  });
  oColumn = new Column({label: new Label({text: "m.MultiComboBox"}), template: oControl, width: "250px"});
  oTable.addColumn(oColumn);

  // sap.m.Checkbox
  oControl = new CheckBox({selected: "{checked}", text: "{lastName}"});
  oColumn = new Column({label: new Label({text: "m.Checkbox"}), template: oControl, width: "50px"}).data("clipboard", "checked");
  oColumn.setCreationTemplate(new HBox({items: [new CheckBox({selected: "{checked}"}), new Input({value: "{lastName}"})]}));
  oTable.addColumn(oColumn);

  //sap.m.RadioButton
  //RadioButton makes no sense in the table because to work correctly all radio buttons must be available otherwise the group feature
  //will not work correctly. Radio Button without groups makes not really sense (except of readonly) because the state cannot be changed.
  /*oControl = new sap.m.RadioButton({selected: "{checked}", text: "{lastName}", groupName: ""});
  oColumn = new sap.ui.table.Column({label: new sap.m.Label({text: "m.RadioButton"}), template: oControl, width: "50px"});
  oTable.addColumn(oColumn);*/

  // sap.m.Link
  oControl = new Link({href: "{href}", text: "{linkText}", press: pressHandler});
  oColumn = new Column({label: new Label({text: "m.Link"}), template: oControl, width: "150px"}).data("clipboard", "linkText");
  oTable.addColumn(oColumn);

  // sap.ui.unified.Currency
  oControl = new Currency({value: "{money}", currency: "{currency}"});
  oColumn = new Column({label: new Label({text: "unified.Currency"}), template: oControl, width: "200px"}).data("clipboard", "money");
  oTable.addColumn(oColumn);

  //sap.m.ProgressIndicator
  oControl = new ProgressIndicator({
	  percentValue: {
		  path: "lastName", formatter: function(sValue) {
			  sValue = sValue || "";
			  return (sValue.length * 10) % 100;
		  }
	  },
	  displayValue: {
		  path: "lastName", formatter: function(sValue) {
			  sValue = sValue || "";
			  return (sValue.length * 10) % 100;
		  }
	  }
  });
  oColumn = new Column({label: new Label({text: "m.ProgressIndicator"}), template: oControl, width: "150px"});
  oTable.addColumn(oColumn);

  //sap.m.RatingIndicator
  oControl = new RatingIndicator({
	  value: {
		  path: "lastName", formatter: function(sValue) {
			  sValue = sValue || "";
			  return sValue.length % 5;
		  }
	  }
  });
  oColumn = new Column({label: new Label({text: "m.RatingIndicator"}), template: oControl, width: "200px"});
  oTable.addColumn(oColumn);

  //sap.m.HBox with sap.m.Link || sap.m.Text
  oControl = new HBox({
	  width: "100%", items: [
		  new Link({visible: "{checked}", href: "{href}", text: "{linkText}"}),
		  new Text({text: "{linkText}", wrapping: false, visible: {path: "checked", formatter: function(bChecked) {return !bChecked;}}})
	  ]
  });
  oColumn = new Column({
	  visible: "{flex>/flex}",
	  label: new Label({text: "m.HBox with Link and Text (partially hidden)"}),
	  template: oControl,
	  width: "200px"
  });
  oTable.addColumn(oColumn);

  //sap.m.HBox with sap.m.Link && sap.m.Text
  oControl = new HBox({
	  width: "100%", items: [
		  new Link({href: "{href}", text: "{href}"}),
		  new Text({text: "{linkText}", wrapping: false})
	  ]
  });
  oColumn = new Column(
		  {visible: "{flex>/flex}", label: new Label({text: "m.HBox with Link and Text"}), template: oControl, width: "400px"});
  oTable.addColumn(oColumn);

  //sap.m.HBox with 2 sap.m.Button
  oControl = new HBox({
	  width: "100%", items: [
		  new Button({text: "{gender}"}),
		  new Button({text: "{gender}"})
	  ]
  });
  oColumn = new Column(
		  {visible: "{flex>/flex}", label: new Label({text: "m.HBox with 2 Buttons"}), template: oControl, width: "200px"});
  oTable.addColumn(oColumn);

  //sap.m.HBox with 2 sap.m.Input
  oControl = new HBox({
	  width: "100%", items: [
		  new Input({value: "{name}"}),
		  new Input({value: "{name}"})
	  ]
  });
  oColumn = new Column(
		  {visible: "{flex>/flex}", label: new Label({text: "m.HBox with 2 Inputs"}), template: oControl, width: "200px"});
  oTable.addColumn(oColumn);

  // set Model and bind Table
  var oModel = new JSONModel();
  oModel.setData({modelData: TABLESETTINGS.listTestData});
  oTable.setModel(oModel);

  var oFlexModel = new JSONModel();
  oFlexModel.setData({flex: false});
  oTable.setModel(oFlexModel, "flex");

  TABLESETTINGS.init(oTable, function(oButton) {
	  null.addContent(oButton);
  });

  var oBindingInfo = oTable.getBindingInfo("rows");

  function rebind() {
	  oTable.bindRows(oBindingInfo || {path: "/modelData"});
  }

  var bBindTable = (new URLSearchParams(window.location.search)).get("sap-ui-xx-table-bind") !== "false";
  if (bBindTable) {
	  rebind();
  }

  var oTestLayoutToolbar = new Toolbar({
	  content: [
		  new Label({text: "VBox RenderType"}),
		  new Select({
			  width: "100px",
			  items: [
				  new CoreItem({key: "Bare", text: "Bare"}),
				  new CoreItem({key: "Div", text: "Div"})
			  ],
			  selectedKey: "Div",
			  change: function(oEvent) {
				  var oItem = oEvent.getParameters().selectedItem;
				  oVBox.setRenderType(oItem.getKey());
			  }
		  }),
		  new CheckBox({
			  text: "Show Borders",
			  select: function(oEvent) {
				  var bSelected = oEvent.getParameters().selected;
				  if (bSelected) {
					  oVBox.addStyleClass("vboxborder");
				  } else {
					  oVBox.removeStyleClass("vboxborder");
				  }
			  }
		  })
	  ]
  });

  var oVBox = new VBox({
	  width: "100%",
	  items: [
		  oTestLayoutToolbar,
		  oTable.setLayoutData(new FlexItemData({growFactor: 1})),
		  new Button({text: "Just a Button after"})
	  ]
  }).placeAt("content");
});