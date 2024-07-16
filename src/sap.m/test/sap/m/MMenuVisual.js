sap.ui.define([
  "sap/m/Menu",
  "sap/m/MenuItem",
  "sap/m/Button",
  "sap/m/Page",
  "sap/m/App"
], function(Menu, MenuItem, Button, Page, App) {
  "use strict";
  // Note: the HTML page 'MMenuVisual.html' loads this module via data-sap-ui-on-init

  var oMenu1,
	  oMenu2,
	  oMenu3,
	  oButton1,
	  oButton2,
	  oButton3,
	  oApp,
	  oPage;

  oButton1 = new Button("B1", {
	  text:'FirstButton',
	  press: function(oEvent){
		  oMenu1.openBy(oEvent.getSource().getDomRef());
	  }
  });

  oButton2 = new Button("B2", {
	  text:'SecondButton',
	  press: function(oEvent){
		  oMenu2.openBy(oEvent.getSource().getDomRef());
	  }
  });

  oButton3 = new Button("B3", {
	  text:'ThirdButton',
	  press: function(oEvent){
		  oMenu3.openBy(oEvent.getSource().getDomRef());
	  }
  });

  oMenu1 = new Menu("M1", {
	  items: [
		  new MenuItem({
			  text: "Item 1 is veeeery loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end",
			  icon: "sap-icon://save"
		  }),
		  new MenuItem({
			  text: "Item 2 is also veeeery loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end, but have no icon"
		  }),
		  new MenuItem({
			  text: "Item 3 is quite loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end, have icon and a submenu",
			  icon: "sap-icon://save",
			  items: [
				  new MenuItem({
					  text: "Submenu Item 1",
					  icon: "sap-icon://save"
				  }),
				  new MenuItem({
					  text: "Submenu Item 2",
					  icon: "sap-icon://save"
				  }),
			  ]
		  }),
		  new MenuItem({
			  text: "Item 4 is also loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end, have a submenu but no icon",
			  items: [
				  new MenuItem({
					  text: "Submenu Item 3",
					  icon: "sap-icon://save"
				  }),
				  new MenuItem({
					  text: "Submenu Item 4",
					  icon: "sap-icon://save"
				  }),
			  ]
		  }),
		  new MenuItem({
			  text: "Regular Item 5",
			  icon: "sap-icon://save"
		  })
	  ]
  });

  oMenu2 = new Menu("M2", {
	  items: [
		  new MenuItem({
			  text: "Item 1 is veeeery loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end",
			  icon: "sap-icon://save"
		  }),
		  new MenuItem({
			  text: "Item 2 is also veeeery loooong and may be longer than the available screen width which will lead to ellipsis to be displayed at the end, but have no icon"
		  }),
		  new MenuItem({
			  text: "Regular Item 5",
			  icon: "sap-icon://save"
		  })
	  ]
  });

  oMenu3 = new Menu("M3", {
	  width: "300px",
	  items: [
		  new MenuItem({
			  text: "Item 1",
			  shortcutText: "Ctrl+S",
			  icon: "sap-icon://save"
		  }),
		  new MenuItem({
			  text: "Item 2"
		  }),
		  new MenuItem({
			  text: "Item 3",
			  shortcutText: "Ctrl+A",
			  icon: "sap-icon://save",
			  items: [
				  new MenuItem({
					  text: "Submenu Item 1",
					  shortcutText: "Ctrl+B",
					  icon: "sap-icon://save"
				  }),
				  new MenuItem({
					  text: "Submenu Item 2",
					  icon: "sap-icon://save"
				  }),
			  ]
		  }),
		  new MenuItem({
			  text: "Item 4",
			  shortcutText: "Ctrl+C"
		  }),
		  new MenuItem({
			  text: "Regular Item 5",
			  icon: "sap-icon://save"
		  })
	  ]
  });

  oApp = new App("myApp").placeAt("body");

  oPage = new Page({
	  title: "Menu Test",
	  content : [
		  oButton1,
		  oButton2,
		  oButton3
	  ]
  });

  oApp.addPage(oPage);
});