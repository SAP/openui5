sap.ui.define([
  "sap/m/Shell",
  "sap/m/SplitApp",
  "sap/m/Page",
  "sap/m/HBox",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/Switch"
], function(Shell, SplitApp, Page, HBox, Label, Button, Switch) {
  "use strict";
  // Note: the HTML page 'Shell_Fiori2.html' loads this module via data-sap-ui-on-init

  var oShell= new Shell("myShell", {
	  title: "My Application",
	  logo: "images/SAPUI5.png",
	  showLogout: false
  });

  var oApp = new SplitApp("myApp", {
	  masterPages: new Page("page1", {
		  title: "Some Master"
	  }),
	  detailPages: new Page("page2", {
		  title: "Some Detail",
		  content: [
			  new HBox({items:[
				  new Label({
					  text: "Logo: "
				  }),
				  new Button({
					  text: "SAPUI5 Logo",
					  press: function() {
						  oShell.setLogo("images/SAPUI5.png");
					  }
				  }),
				  new Button({
					  text: "SAP big",
					  press: function() {
						  oShell.setLogo("images/SAPLogo@2.jpg");
					  }
				  }),
				  new Button({
					  text: "SAP small",
					  press: function() {
						  oShell.setLogo("images/SAPLogo.jpg");
					  }
				  }),
				  new Button({
					  text: "Wide Logo",
					  press: function() {
						  oShell.setLogo("images/wide-logo.png");
					  }
				  }),
				  new Button({
					  text: "Tall Logo",
					  press: function() {
						  oShell.setLogo("images/tall-logo.png");
					  }
				  }),
				  new Button({
					  text: "NO Logo",
					  press: function() {
						  oShell.setLogo("");
					  }
				  })
			  ]}),
			  new HBox({items:[
				  new Label({
					  text: "Limit App Width: "
				  }),
				  new Switch({
					  state: true,
					  change: function(oEvent) {
						  var bLimit = oEvent.getParameter("state");
						  oShell.setAppWidthLimited(bLimit);
					  }
				  })
			  ]})
		  ]
	  })
  });

  oShell.setApp(oApp);
  oShell.placeAt("content");
});