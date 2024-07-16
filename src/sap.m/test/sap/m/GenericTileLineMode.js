sap.ui.define([
  "sap/m/library",
  "sap/m/ActionSheet",
  "sap/m/Button",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/GenericTile",
  "sap/ui/core/CustomData",
  "sap/m/Panel",
  "sap/m/OverflowToolbar",
  "sap/m/Label",
  "sap/m/ToolbarSpacer",
  "sap/ui/layout/form/SimpleForm",
  "sap/ui/layout/library",
  "sap/m/Input",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Switch",
  "sap/ui/layout/HorizontalLayout",
  "sap/m/ScrollContainer",
  "sap/m/HBox",
  "sap/m/ToggleButton",
  "sap/m/Page",
  "sap/m/VBox",
  "sap/m/Toolbar",
  "sap/m/App",
  "sap/ui/util/Mobile",
  "sap/ui/core/Core"
], function(
  mobileLibrary,
  ActionSheet,
  Button,
  MessageToast,
  JSONModel,
  GenericTile,
  CustomData,
  Panel,
  OverflowToolbar,
  Label,
  ToolbarSpacer,
  SimpleForm,
  layoutLibrary,
  Input,
  Select,
  Item,
  Switch,
  HorizontalLayout,
  ScrollContainer,
  HBox,
  ToggleButton,
  Page,
  VBox,
  Toolbar,
  App,
  Mobile,
  Core
) {
  "use strict";

  // shortcut for sap.m.InputType
  const InputType = mobileLibrary.InputType;

  // shortcut for sap.ui.layout.form.SimpleFormLayout
  const SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

  // shortcut for sap.m.LoadState
  const LoadState = mobileLibrary.LoadState;

  // shortcut for sap.m.GenericTileScope
  const GenericTileScope = mobileLibrary.GenericTileScope;

  // Note: the HTML page 'GenericTileLineMode.html' loads this module via data-sap-ui-on-init

  Mobile.init();

  function makeTileData() {
	  return {
		  header: "This is a header",
		  subheader: "Subheader",
		  tooltip: "",
		  url: "",
		  state: "Loaded",
		  hasPress: true,
		  scope: "Display"
	  };
  }

  function handlePress(oEvent) {
	  if ((oEvent.getParameter("scope") === GenericTileScope.Actions
		  || oEvent.getParameter("scope") === GenericTileScope.ActionMore)
		  && oEvent.getParameter("action") === "Press") {
		  var oActionSheet = new ActionSheet({
			  title : "Choose Your Action",
			  showCancelButton : true,
			  placement : "Bottom",
			  buttons : [
				  new Button({
					  text : "Move"
				  }),
				  new Button({
					  text : "Whatever"
				  })
			  ],
			  afterClose : function () {
				  oActionSheet.destroy();
			  }
		  });
		  oActionSheet.openBy(oEvent.getParameter("domRef"));
	  } else {
		  MessageToast.show("Action " + oEvent.getParameter("action") + " on " + oEvent.getSource().getId() + " pressed.");
	  }
  }

  var oModel = new JSONModel({
	  items: [
		  makeTileData()
	  ],
	  states: Object.keys(LoadState),
	  scopes: Object.keys(GenericTileScope)
  });

  var fnCreateTile = function() {
	  var oTile = new GenericTile({
		  mode: "LineMode",
		  header: "{header}",
		  subheader: "{subheader}",
		  tooltip: "{tooltip}",
		  url: "{url}",
		  state: "{state}",
		  scope: "{scope}"
	  });
	  oTile.addCustomData(new CustomData({
		  key: "hasPress",
		  value: {
			  path: "hasPress",
			  events: {
				  change: function() {
					  if (this.oValue === true) {
						  oTile.attachPress(handlePress);
					  } else {
						  oTile.detachPress(handlePress);
					  }
				  }
			  }
		  }
	  }));
	  return oTile;
  };

  var fnCreateTileConfig = function(id, context) {
	  return new Panel(id, {
		  backgroundDesign: "Solid",
		  headerToolbar: new OverflowToolbar({
			  content: [
				  new Label({
					  text: context.getPath()
				  }),
				  new ToolbarSpacer(),
				  new Button({
					  text: "Repeat Header",
					  press: function() {
						  var iRepeat = parseInt(window.prompt("Times", 1), 10) || 1;
						  oModel.setProperty(context.getPath("header"), (new Array(iRepeat + 1).join(context.getObject().header)));
						  oModel.refresh(true);
					  }
				  }),
				  new Button({
					  icon: "sap-icon://delete",
					  press: function() {
						  var aItems = oModel.getProperty("/items");
						  var index = parseInt(context.getPath().match(/\/([^\/]*)$/i), 10);
						  aItems.splice(index, 1);
						  oModel.setProperty("/items", aItems);
					  }
				  })
			  ]
		  }),
		  content: [
			  new SimpleForm({
				  labelSpanS: 6,
				  labelSpanM: 6, columnsM: 2,
				  labelSpanL: 2, columnsL: 2,
				  layout: SimpleFormLayout.ResponsiveGridLayout,
				  editable: true,
				  maxContainerCols: 2,
				  content: [
					  new Label({ text: "Header" }),
					  new Input({
						  type: InputType.Text,
						  value: "{header}",
						  placeholder: "Enter a header text...",
						  change: function() {
							  oModel.refresh(true);
						  }
					  }),
					  new Label({ text: "Subheader" }),
					  new Input({
						  type: InputType.Text,
						  value: "{subheader}",
						  placeholder: "Enter a subheader text..."
					  }),
					  new Label({ text: "Tooltip" }),
					  new Input({
						  type: InputType.Text,
						  value: "{tooltip}",
						  placeholder: "Enter a tooltip..."
					  }),
					  new Label({ text: "Url" }),
					  new Input({
						  type: InputType.Url,
						  value: "{url}",
						  placeholder: "Enter an url..."
					  }),
					  new Label({ text: "State" }),
					  new Select({
						  items: {
							  path: "/states",
							  template: new Item({
								  key: "{}",
								  text: "{}"
							  })
						  },
						  selectedKey: "{state}"
					  }),
					  new Label({ text: "Scope" }),
					  new Select({
						  items: {
							  path: "/scopes",
							  template: new Item({
								  key: "{}",
								  text: "{}"
							  })
						  },
						  selectedKey: "{scope}"
					  }),
					  new Label({ text: "Press Event" }),
					  new Switch({
						  state: "{hasPress}"
					  })
				  ]
			  })
		  ]
	  });
  };

  var oTileContainer = new HorizontalLayout({
	  allowWrapping: true,
	  content: {
		  path: "/items",
		  factory: fnCreateTile
	  }
  });

  var oTileConfigContainer = new ScrollContainer({
	  focusable: false,
	  width: "100%",
	  content: [
		  new HBox({
			  items: {
				  path: "/items",
				  factory: fnCreateTileConfig
			  }
		  })
	  ]
  });

  var oAddTileBtn = new Button({
	  text: "Add tile",
	  press: function() {
		  oModel.oData.items.push(makeTileData());
		  oModel.refresh();
	  }
  });

  var oRemoveAllBtn = new Button({
	  text: "Remove all",
	  press: function() {
		  oModel.oData.items = [];
		  oModel.refresh();
	  }
  });

  var oDensityModeButton = new ToggleButton({
	  pressed: false,
	  text: "Cozy",
	  press: function() {
		  if (oDensityModeButton.getPressed()) {
			  oTileContainer.addStyleClass("sapUiSizeCompact");
			  oTileContainer.invalidate();
			  oDensityModeButton.setText("Compact");
		  } else {
			  oTileContainer.removeStyleClass("sapUiSizeCompact");
			  oTileContainer.invalidate();
			  oDensityModeButton.setText("Cozy");
		  }
	  }
  });

  var oPage = new Page("initial-page", {
	  showHeader: false,
	  content: [
		  new VBox({
			  fitContainer: true,
			  items: [
				  new Toolbar({
					  content: [
						  oDensityModeButton,
						  oAddTileBtn,
						  oRemoveAllBtn
					  ]
				  }).addStyleClass("sapUiSizeCompact"),
				  oTileContainer.addStyleClass("TileContainer"),
				  oTileConfigContainer.addStyleClass("sapUiSizeCompact")
			  ]
		  })
	  ]
  }).addStyleClass("sapUiContentPadding").setModel(oModel);

  //create a mobile App embedding the page and place the App into the HTML document
  new App("myApp", {
	  pages: [oPage]
  }).placeAt("content");
});