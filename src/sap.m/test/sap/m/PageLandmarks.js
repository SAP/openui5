sap.ui.define([
  "sap/m/App",
  "sap/m/PageAccessibleLandmarkInfo",
  "sap/ui/core/library",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/m/Title",
  "sap/m/Button"
], function(App, PageAccessibleLandmarkInfo, coreLibrary, Page, Bar, Title, Button) {
  "use strict";

  // shortcut for sap.ui.core.AccessibleLandmarkRole
  const AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

  // Note: the HTML page 'PageLandmarks.html' loads this module via data-sap-ui-on-init

  var oApp = new App();
  oApp.placeAt("body");

  var oDefaultLandmarkInfo = new PageAccessibleLandmarkInfo();
  var oCustomLandmarkInfo = new PageAccessibleLandmarkInfo({
	  headerRole: AccessibleLandmarkRole.Banner,
	  headerLabel: "Header label from LandmarkInfo",
	  subHeaderRole: AccessibleLandmarkRole.Banner,
	  subHeaderLabel: "SubHeader label from LandmarkInfo",
	  rootRole: AccessibleLandmarkRole.Region,
	  rootLabel: "Root label from LandmarkInfo",
	  contentRole: AccessibleLandmarkRole.Main,
	  contentLabel: "Content label from LandmarkInfo",
	  footerRole: AccessibleLandmarkRole.Banner,
	  footerLabel: "Footer label from LandmarkInfo"
  });

  var oPage = new Page({
	  title: "A Page",
	  subHeader: new Bar({
		  contentMiddle: [
			  new Title({ text: "SubHeader title" })
		  ]
	  }),
	  content: [
		  new Button({
			  text: "Clear Landmarks",
			  press: function(){
				  oPage.setLandmarkInfo(null);
			  }
		  }),
		  new Button({
			  text: "Add Default Landmarks",
			  press: function(){
				  oPage.setLandmarkInfo(oDefaultLandmarkInfo);
			  }
		  }),
		  new Button({
			  text: "Add Custom Landmarks",
			  press: function(){
				  oPage.setLandmarkInfo(oCustomLandmarkInfo);
			  }
		  })
	  ],
	  footer: new Bar({
		  contentMiddle: [
			  new Title({ text: "Footer title" })
		  ]
	  })
  });
  oApp.addPage(oPage);
});