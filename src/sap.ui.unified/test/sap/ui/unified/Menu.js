sap.ui.define([
  "sap/ui/core/TooltipBase",
  "sap/ui/unified/Menu",
  "sap/ui/unified/MenuItem",
  "sap/ui/unified/MenuTextFieldItem",
  "sap/m/ToggleButton",
  "sap/ui/core/Popup",
  "sap/m/Text",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/ui/thirdparty/jquery"
], function(TooltipBase, Menu, MenuItem, MenuTextFieldItem, ToggleButton, Popup, Text, Dialog, Button, jQuery) {
  "use strict";
  var idCounter = 0;
  var aMenus = [];
  var bMenuEventingEnabled = false;

  sap.ui.requireSync("sap/ui/core/IconPool");

  /*
   * a simple Tooltip control, inheriting from TooltipBase
   */
  var MyTooltip = TooltipBase.extend("sap.m.test.MyToolTip", {
	  metadata: {
		  library: "sap.m",
		  aggregations: {
			  content: {
				  multiple: false
			  }
		  }
	  },
	  renderer: {
		  apiVersion: 2,
		  render: function (rm, ctrl) {
			  rm.openStart("div", ctrl)
				  .style("background", "white")
				  .style("border", "1px solid black")
				  .style("padding", "0.5rem")
				  .openEnd();

				  rm.openStart("div").openEnd();
					  if (ctrl.getContent()) {
						  rm.renderControl(ctrl.getContent());
					  }
				  rm.close("div");

				  rm.openStart("div").openEnd();
					  rm.icon("sap-icon://flag");
					  rm.icon("sap-icon://favorite");
				  rm.close("div");

			  rm.close("div");
		  }
	  }
  });

  function createSetting(sLabel, oDefaultValue, aValues, fnHandler){
	  var sDom, fnHandle;
	  var sId = "setting" + (idCounter++);
	  if (!aValues || aValues.length == 0) {
		  if (typeof oDefaultValue == "string") {
			  sDom = "<input id='" + sId + "' value='" + oDefaultValue + "'>";
			  fnHandle = function(oEvent) {
				  fnHandler(oEvent, jQuery(oEvent.target).val());
			  };
		  } else if (typeof oDefaultValue == "number") {
			  sDom = "<input id='" + sId + "' value='" + oDefaultValue + "'>";
			  fnHandle = function(oEvent) {
				  fnHandler(oEvent, parseInt(jQuery(oEvent.target).val()));
			  };
		  } else if (typeof oDefaultValue == "boolean") {
			  sDom = "<input type='checkbox' id='" + sId + "'" + (oDefaultValue ? " checked='" + oDefaultValue + "'" : "") + ">";
			  fnHandle = function(oEvent) {
				  fnHandler(oEvent, jQuery(oEvent.target).is(":checked"));
			  };
		  }
	  } else {
		  sDom = "<select id='" + sId + "'>";
		  for (var i = 0; i < aValues.length; i++){
			  sDom += "<option value='" + aValues[i] + "'" + (aValues[i] == oDefaultValue ? " selected='selected'" : "") + ">" + aValues[i] + "</option>";
		  }
		  sDom += "</select>";
		  fnHandle = function(oEvent) {
			  fnHandler(oEvent, jQuery(oEvent.target).find(":selected").attr("value"));
		  };
	  }

	  if (!sDom) {
		  return null;
	  }

	  jQuery("#settings").append("<div id='" + sId + "-frame' style='margin-top:5px;'><div style='display:inline-block;width:200px;'>" + sLabel + ":</div>" + sDom + "</div>");

	  jQuery("#" + sId).on("change", fnHandle); // sId is safe by construction!

	  return sId;
  }

  jQuery(function() {
	  //Cozy Mode
	  createSetting("Cozy Mode", false, null, function(oEvent, val){
		  for (var i = 0; i < aMenus.length; i++) {
			  if (aMenus[i].getRootMenu() === aMenus[i]) {
				  aMenus[i].toggleStyleClass("sapUiSizeCozy", val);
			  }
		  }
	  });

	  //No Icons
	  createSetting("No Icons", false, null, function(oEvent, val){
		  for (var i = 0; i < aMenus.length; i++) {
			  var aItems = aMenus[i].getItems();
			  for (var j = 0; j < aItems.length; j++) {
				  aItems[j].setIcon("");
				  if (!val && aItems[j].__appicon) {
					  aItems[j].setIcon(aItems[j].__appicon);
				  }
			  }
		  }
	  });

	  //Menu Eventing
	  createSetting("Menu Eventing", false, null, function(oEvent, val){
		  bMenuEventingEnabled = val;
	  });

	  //Debug: Avoid Menu Closing
	  var sAvoidClosing = createSetting("Debug - Avoid Closing", false, null, function(oEvent, val){
		  Menu._dbg = !!val;
	  });
	  jQuery("#" + sAvoidClosing + "-frame").toggleClass("SettingHidden");

	  //Debug: Rerendering: Add/Remove items when menu is open
	  var sRerendering = createSetting("Debug - Rerendering", false, null, function(oEvent, val){
		  oRerenderingButton.toggleStyleClass("SettingHidden", !val);

		  function customize(oMenu, bCreate, iLevel) {
			  if (!oMenu) {
				  return;
			  }

			  iLevel = iLevel ? iLevel : 1;
			  var aItems = oMenu.getItems();
			  for (var i = 0; i < aItems.length; i++) {
				  customize(aItems[i].getSubmenu(), bCreate, iLevel + 1);
				  if (!bCreate) {
					  if (aItems[i].__appcustom) {
						  aItems[i].destroy();
					  }
				  }
			  }

			  if (bCreate) {
				  setTimeout(function(){
					  for (var i = 0; i < 5; i++){
						  var oItem = new MenuItem({text: "New Item " + i});
						  oItem.__appcustom = true;
						  oMenu.addItem(oItem);
					  }
				  }, iLevel * 5000);
			  }
		  }

		  customize(oRerenderingButton.getMenu(), val);
	  });
	  jQuery("#" + sRerendering + "-frame").toggleClass("SettingHidden");

	  jQuery(document.body).on("keydown", function(e) {
		  if ( e.keyCode == 68 /*D*/ && e.shiftKey && e.altKey && e.ctrlKey ) {
			  jQuery("#" + sAvoidClosing + "-frame").toggleClass("SettingHidden");
			  jQuery("#" + sRerendering + "-frame").toggleClass("SettingHidden");
		  }
	  });
  });

  function createTest(sText, oMenuConfig) {
	  var iMessageClearTime = 3000;

	  function onSelectFired(oEvent, bOnItem) {
		  if (bMenuEventingEnabled && !bOnItem || !bMenuEventingEnabled && bOnItem) {
			  var oItem = oEvent.getParameter("item");
			  var sText;

			  if (oItem instanceof MenuTextFieldItem) {
				  sText = "You entered value '" + oItem.getValue() + "' to menu item '" + oItem.getLabel() + "'";
			  } else {
				  sText = "You selected menu item '" + oItem.getText() + "'";
			  }

			  jQuery("#output").html(sText + " (" + (bOnItem ? "Item" : "Menu") + " Eventing).");

			  if (iMessageClearTime > 0) {
				  setTimeout(function(){
					  jQuery("#output").html("");
				  }, iMessageClearTime);
			  }
		  }
	  }

	  function createMenuStructure(oConfig) {
		  var oMenu = new Menu(oConfig.config || {});
		  oMenu.attachItemSelect(function(oEvent){
			  onSelectFired(oEvent, false);
		  });
		  aMenus.push(oMenu);
		  var aItems = oConfig.items;
		  for (var i = 0; i < aItems.length; i++){
			  var oMenuItem,
				  oItemConfig = aItems[i].config || {};

			  if (aItems[i].type == "text") {
				  oMenuItem = new MenuTextFieldItem(oItemConfig);
				  oMenuItem.attachSelect(function(oEvent){
					  onSelectFired(oEvent, true);
				  });
			  } else {
				  oMenuItem = new MenuItem(oItemConfig);
				  if (aItems[i].submenu) {
					  oMenuItem.setSubmenu(createMenuStructure(aItems[i].submenu));
				  } else {
					  oMenuItem.attachSelect(function(oEvent){
						  onSelectFired(oEvent, true);
					  });
				  }
			  }

			  oMenuItem.__appicon = oMenuItem.getIcon();
			  oMenu.addItem(oMenuItem);
		  }
		  return oMenu;
	  }

	  const menu = createMenuStructure(oMenuConfig);

	  // Note: sap.m.MenuButton cannot be used with a sap.ui.unified.Menu, it requires a sap.m.Menu
	  // This page therefore uses a sap.m.ToggleButton with a primitive press handler as replacement
	  var oButton = new ToggleButton({
		  text: sText,
		  press: function(oEvent) {
			  const button = oEvent.getSource();
			  if ( button.getPressed() ) {
				  menu.open(false, // bWithKeyboard
					  button, // oOpenerRef
					  Popup.Dock.BeginBottom,
					  Popup.Dock.BeginTop,
					  button, // of
					  "0 +2" // offsets
				  );
				  menu.attachClosed(() => button.setPressed(false));
			  } else {
				  menu.close();
			  }
		  }
	  });
	  oButton.getMenu = () => menu;

	  return oButton;
  }

  //***************************************************

  var oMenuStructure1 = {
	  config: {},
	  items: [
		  {
			  config: {text: "This is an item with a very long text", icon: "images/save_old.png"}
		  },
		  {
			  config: {text: "This is another item with an even longer text", icon: "sap-icon://save", startsSection: true}
		  },
		  {
			  config: {text: "E-Test Item1-3", enabled: false}
		  },
		  {
			  config: {text: "P-Test Item1-4"},
			  submenu: {
				  config: {},
				  items: [
					  {
						  config: {text: "Item2-1", enabled: false}
					  },
					  {
						  config: {text: "Item2-2", startsSection: true}
					  },
					  {
						  config: {text: "Item2-3"}
					  },
					  {
						  config: {text: "Item2-4"},
						  submenu: {
							  config: {},
							  items: [
								  {
									  config: {text: "Item 3-1"}
								  }
							  ]
						  }
					  }
				  ]
			  }
		  },
		  {
			  config: {text: "Some other item"},
			  submenu: {
				  config: {},
				  items: [
					  {
						  config: {text: "Sub item 1"}
					  },
					  {
						  config: {text: "Sub item 2"}
					  },
					  {
						  config: {text: "Sub item 3"}
					  }
				  ]
			  }
		  },
		  {
			  config: {text: "Item5", enabled: false},
			  submenu: {
				  config: {},
				  items: [
					  {
						  config: {text: "Item"}
					  }
				  ]
			  }
		  }
	  ]
  };

  var oMenuStructure2 = {
	  config: {ariaDescription: "Demo Menu"},
	  items: [
		  {
			  config: {text: "Meat", tooltip: "Our offer of Meat"}
		  },
		  {
			  config: {text: "Fish", tooltip: "Our offer of Fish"}
		  },
		  {
			  config: {text: "Cheese", tooltip: "Our offer of Cheese"}
		  },
		  {
			  config: {text: "Fruits", tooltip: "Our offer of Fruits", startsSection: true},
			  submenu: {
				  config: {},
				  items: [
					  {
						  config: {text: "Strawberries", tooltip: "Our offer of Strawberries"}
					  },
					  {
						  config: {text: "Bananas", tooltip: "Our offer of Bananas"}
					  },
					  {
						  config: {text: "Kiwis", tooltip: "Our offer of Kiwis"}
					  },
					  {
						  config: {text: "Grapes", tooltip: "Our offer of Grapes"},
						  submenu: {
							  config: {},
							  items: [
								  {
									  config: {text: "red", tooltip: "Our offer of red Grapes"}
								  },
								  {
									  config: {text: "white", tooltip: "Our offer of white Grapes"}
								  }
							  ]
						  }
					  }
				  ]
			  }
		  },
		  {
			  config: {text: "Vegetables"}
		  },
		  {
			  type: "text",
			  config: {label: "Filter:", startsSection: true, icon: "images/filter.gif"}
		  },
		  {
			  type: "text",
			  config: {value: "FilterValue", label: "Another Filter:", icon: "sap-icon://filter", enabled: false}
		  },
		  {
			  config: {text: "Clear Filter"}
		  }
	  ]
  };

  function createRichTooltip(sTitle) {
	  return new MyTooltip({
		  content: [
			  new Text({
				  text: "some tooltip text"
			  })
		  ]
	  });
  }

  function createManyItems(bWithSubMenu, sPrefix) {
	  var aItems = [];
	  for (var i = 0; i < 100; i++){
		  var oItem = {
			  config: {text: "Item " + (sPrefix ? sPrefix : "") + i, icon: "sap-icon://search"}
		  };
		  aItems.push(oItem);

		  if (bWithSubMenu) {
			  oItem.submenu = {
				  config: {maxVisibleItems: 10},
				  items: createManyItems(false, i + "-")
			  };
		  }
	  }
	  return aItems;
  }

  createTest("Open Menu 1 (Basic)", oMenuStructure1).placeAt("target");
  createTest("Open Menu 2 (TextField)", oMenuStructure2).placeAt("target");
  createTest("Open Menu 3 (RichTooltip)", {
	  config: {},
	  items: [
		  {
			  config: {text: "Item 1", tooltip: createRichTooltip("Item 1")}
		  },
		  {
			  config: {text: "Item 2", tooltip: createRichTooltip("Item 2")}
		  },
		  {
			  config: {text: "Item 3", tooltip: createRichTooltip("Item 3")}
		  },
		  {
			  type: "text",
			  config: {label: "Item 4", tooltip: createRichTooltip("Item 4")}
		  },
		  {
			  config: {text: "Item 5", tooltip: createRichTooltip("Item 5")}
		  }
	  ]
  }).placeAt("target");
  createTest("Open Menu 4 (Large, No Sub Menus)", {
	  config: {},
	  items: createManyItems(false)
  }).placeAt("target");
  createTest("Open Menu 5 (Large, Sub Menus)", {
	  config: {},
	  items: createManyItems(true)
  }).placeAt("target");

  var oRerenderingButton = createTest("Open Menu (Debug: Rerendering)", {
	  config: {},
	  items: [
		  {
			  config: {text: "Item 1"}
		  },
		  {
			  config: {text: "Item 2"},
			  submenu: {
				  config: {},
				  items: [
					  {
						  config: {text: "Item 2-1"}
					  },
					  {
						  config: {text: "Item 2-2"}
					  }
				  ]
			  }
		  }
	  ]
  });
  oRerenderingButton.addStyleClass("SettingHidden").placeAt("target");

  var oDialog = new Dialog({
	  showHeader: false,
	  content: createTest("Menu in Dialog", oMenuStructure1) ,
	  endButton: new Button({
		  text: "Close",
		  press: function () {
			  oDialog.close();
		  }
	  })
  });
  new Button({
	  text: "Open Dialog",
	  press: function () {
		  oDialog.open();
	  }
  }).placeAt("target");
});