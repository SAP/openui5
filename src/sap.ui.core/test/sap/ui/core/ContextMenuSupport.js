sap.ui.define([
  "sap/ui/core/IconPool",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/Menu",
  "sap/m/MenuItem",
  "sap/ui/unified/Menu",
  "sap/ui/unified/MenuItem",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/App",
  "sap/m/Page"
], function(IconPool, Button, mobileLibrary, Menu, MenuItem, UnifiedMenu, UnifiedMenuItem, List, StandardListItem, App, Page) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  var oButtonSample = new Button("myButtonSample", {
	  type: ButtonType.Default,
	  text: "Open Button ContextMenu",
	  enabled: true,
	  tooltip: "tooltip"
  });

  var oButtonContextMenu = new Menu({
	  items: [
		  new MenuItem({ text: "Open", icon: "sap-icon://add"}),
		  new MenuItem({ text: "Move to trash", icon: "sap-icon://delete"}),
		  new MenuItem({ text: "Get info", icon: "sap-icon://hint"}),
		  new MenuItem({ text: "More", icon: "sap-icon://overflow"})
	  ]
  });

  var oListMenu = new Menu({
	  items: [
		  new MenuItem({ text: "Copy", icon: "sap-icon://copy" }),
		  new MenuItem({ text: "Edit", icon: "sap-icon://edit" }),
		  new MenuItem({ text: "Open in new tab", icon: "sap-icon://action" }),
		  new MenuItem({ text: "Save as tile", icon: "sap-icon://save", startsSection: true }),
		  new MenuItem({ text: "Action one" }),
		  new MenuItem({ text: "Second action", enabled: false }),
		  new MenuItem({ text: "Action three more ..."}),
		  new MenuItem({ text: "Fourth option" })
	  ]
  });

  var oPageContextMenu = new UnifiedMenu({
	  items: [
		  new UnifiedMenuItem( { text: "Example with Unified Menu" } ),
		  new UnifiedMenuItem( { text: "Example" } ),
		  new UnifiedMenuItem( { text: "Example" } )
	  ]
  });


  var oList = new List({
	  items: [
		  new StandardListItem({
			  id: "firstItem",
			  title: "Monitor Locking Cable",
			  description: "P1239123",
			  icon: "sap-icon://laptop"
		  }),
		  new StandardListItem({
			  title: "Laptop Case",
			  description: "123-3123-111",
			  icon: "sap-icon://it-host"
		  }),
		  new StandardListItem({
			  title: "USB Stick 16Gbyte",
			  description: "XKT-2342432432",
			  icon: "sap-icon://it-system"
		  }),
		  new StandardListItem({
			  title: "Deskjet Super Highspeed",
			  description: "KTZ-23432423",
			  icon: "sap-icon://e-learning"
		  }),
		  new StandardListItem({
			  id: "lastItem",
			  title: "Laser Allround Pro",
			  description: "554325-423",
			  icon: "sap-icon://it-instance"
		  })
	  ]
  });

  var oBasicButton = new Button({
	  text: "Button without a ContextMenu"
  });

  var oLeftDownButton = new Button({
	  id: "leftDownBtn",
	  text: "Down Left"
  }).addStyleClass("down-left");

  var oRightDownButton = new Button({
	  id: "rightDownBtn",
	  text: "Down Right"
  }).addStyleClass("down-right");


  /* ---------------------------------------- */

  var oApp = new App();
  var oPage = new Page({
	  id: "testPage",
	  content: [
		  oButtonSample,
		  oBasicButton,
		  oList,
		  oLeftDownButton,
		  oRightDownButton
	  ]
  });
  oApp.addPage(oPage);

  oPage.setContextMenu(oPageContextMenu);
  oButtonSample.setContextMenu(oButtonContextMenu);
  oLeftDownButton.setContextMenu(oButtonContextMenu);
  oRightDownButton.setContextMenu(oButtonContextMenu);


  oList.getItems().forEach(function(oListItem) {
	  // mad hacks
	  sap.ui.core.ContextMenuSupport.apply(oListItem);
	  oListItem.setContextMenu(oListMenu);
  });

  oApp.addPage(oPage);
  oApp.placeAt("body");
});