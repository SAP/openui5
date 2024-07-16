sap.ui.define([
  "sap/m/Menu",
  "sap/m/MessageToast",
  "sap/m/MenuItem",
  "sap/m/MenuButton",
  "sap/ui/core/Popup",
  "sap/m/Button",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Page",
  "sap/m/FlexBox",
  "sap/m/App"
], function(Menu, MessageToast, MenuItem, MenuButton, Popup, Button, Select, Item, Page, FlexBox, App) {
  "use strict";
  // Note: the HTML page 'MenuButtonMenuPosition.html' loads this module via data-sap-ui-on-init

  var oMenu = new Menu({
	  title: "random 7",
	  itemSelected: function(oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "responde now"
		  }),
		  new MenuItem({
			  text: "before sending"
		  }),
		  new MenuItem({
			  text: "Do not send"
		  })
	  ]
  });

  var oMenuButton = new MenuButton("posMenuId", {
	  width: "16rem",
	  text: "Menu position",
	  menuPosition: Popup.Dock.BeginBottom,
	  menu: oMenu
  });

  var i = 0;
  var oButton = new Button("posButtonId", {
	  text: "Change menuPosition",
	  press: function() {
			  i++;
			  switch (i) {
			  case 1:
				  oMenuButton.setMenuPosition(Popup.Dock.BeginTop);
				  oSelect.setSelectedKey(Popup.Dock.BeginTop);
				  break;
			  case 2:
				  oMenuButton.setMenuPosition(Popup.Dock.BeginCenter);
				  oSelect.setSelectedKey(Popup.Dock.BeginCenter);
				  break;
			  case 3:
				  oMenuButton.setMenuPosition(Popup.Dock.LeftTop);
				  oSelect.setSelectedKey(Popup.Dock.LeftTop);
				  break;
			  case 4:
				  oMenuButton.setMenuPosition(Popup.Dock.LeftCenter);
				  oSelect.setSelectedKey(Popup.Dock.LeftCenter);
				  break;
			  case 5:
				  oMenuButton.setMenuPosition(Popup.Dock.LeftBottom);
				  oSelect.setSelectedKey(Popup.Dock.LeftBottom);
				  break;
			  case 6:
				  oMenuButton.setMenuPosition(Popup.Dock.CenterTop);
				  oSelect.setSelectedKey(Popup.Dock.CenterTop);
				  break;
			  case 7:
				  oMenuButton.setMenuPosition(Popup.Dock.CenterCenter);
				  oSelect.setSelectedKey(Popup.Dock.CenterCenter);
				  break;
			  case 8:
				  oMenuButton.setMenuPosition(Popup.Dock.CenterBottom);
				  oSelect.setSelectedKey(Popup.Dock.CenterBottom);
				  break;
			  case 9:
				  oMenuButton.setMenuPosition(Popup.Dock.RightTop);
				  oSelect.setSelectedKey(Popup.Dock.RightTop);
				  break;
			  case 10:
				  oMenuButton.setMenuPosition(Popup.Dock.RightCenter);
				  oSelect.setSelectedKey(Popup.Dock.RightCenter);
				  break;
			  case 11:
				  oMenuButton.setMenuPosition(Popup.Dock.RightBottom);
				  oSelect.setSelectedKey(Popup.Dock.RightBottom);
				  break;
			  case 12:
				  oMenuButton.setMenuPosition(Popup.Dock.EndTop);
				  oSelect.setSelectedKey(Popup.Dock.EndTop);
				  break;
			  case 13:
				  oMenuButton.setMenuPosition(Popup.Dock.EndCenter);
				  oSelect.setSelectedKey(Popup.Dock.EndCenter);
				  break;
			  case 14:
				  oMenuButton.setMenuPosition(Popup.Dock.EndBottom);
				  oSelect.setSelectedKey(Popup.Dock.EndBottom);
				  break;
			  default:
			  case 0:
				  oMenuButton.setMenuPosition(Popup.Dock.BeginBottom);
				  oSelect.setSelectedKey(Popup.Dock.BeginBottom);
				  break;
		  }
	  }
  });

  var oSelect = new Select('select_position', {
	  items: [
		  new Item({
			  text: 'BeginBottom',
			  key: Popup.Dock.BeginBottom
		  }),
		  new Item({
			  text: 'BeginTop',
			  key: Popup.Dock.BeginTop
		  }),
		  new Item({
			  text: 'BeginCenter',
			  key: Popup.Dock.BeginCenter
		  }),
		  new Item({
			  text: 'LeftTop',
			  key: Popup.Dock.LeftTop
		  }),
		  new Item({
			  text: 'LeftCenter',
			  key: Popup.Dock.LeftCenter
		  }),
		  new Item({
			  text: 'LeftBottom',
			  key: Popup.Dock.LeftBottom
		  }),
		  new Item({
			  text: 'CenterTop',
			  key: Popup.Dock.CenterTop
		  }),
		  new Item({
			  text: 'CenterCenter',
			  key: Popup.Dock.CenterCenter
		  }),
		  new Item({
			  text: 'CenterBottom',
			  key: Popup.Dock.CenterBottom
		  }),
		  new Item({
			  text: 'RightTop',
			  key: Popup.Dock.RightTop
		  }),
		  new Item({
			  text: 'RightCenter',
			  key: Popup.Dock.RightCenter
		  }),
		  new Item({
			  text: 'RightBottom',
			  key: Popup.Dock.RightBottom
		  }),
		  new Item({
			  text: 'EndTop',
			  key: Popup.Dock.EndTop
		  }),
		  new Item({
			  text: 'EndCenter',
			  key: Popup.Dock.EndCenter
		  }),
		  new Item({
			  text: 'EndBottom',
			  key: Popup.Dock.EndBottom
		  })
	  ],
	  change: function(oEvent) {
		  var sPosition = oEvent.getParameter('selectedItem').getKey();
		  oMenuButton.setMenuPosition(sPosition);
	  }
  });

  oButton.placeAt("ctr_cont");
  oSelect.placeAt("ctr_cont");

  var oPage = new Page("page0", {
	  showHeader: false,
	  content: [
		  new FlexBox({
			  height: "300px",
			  width: "600px",
			  justifyContent: "Center",
			  alignItems: "Center",
			  items: oMenuButton
		  })
	  ]
  });

  var oApp = new App({
	  initialPage: "page0",
	  pages: [
		  oPage
	  ]
  });

  oApp.placeAt("menu_cont");
});