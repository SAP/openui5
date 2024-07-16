sap.ui.define([
  "sap/m/App",
  "sap/m/Button",
  "sap/m/Page",
  "sap/m/PageAccessibleLandmarkInfo",
  "sap/m/Bar"
], function(App, Button, Page, PageAccessibleLandmarkInfo, Bar) {
  "use strict";
  // Note: the HTML page 'Page.html' loads this module via data-sap-ui-on-init

  var oApp = new App("myApp", {
	  initialPage: "page"
  });

  var aBackgrounds = ["List", "Solid", "Transparent", "Standard"];
  var iCurrentBackground = 0;

  var oSetBusyButton = new Button({
	  id: "setbusy-button", text: "Set busy",
	  tooltip: "Set the page to busy", press: function () {
		  oPage.setBusy(true);
	  }
  });

  var fnCycleBackgrounds = function () {
	  oPage.setBackgroundDesign(aBackgrounds[iCurrentBackground]);

	  if (iCurrentBackground < aBackgrounds.length) {
		  iCurrentBackground++;
	  } else {
		  iCurrentBackground = 0;
	  }
  };

  var oChangeBackground = new Button({
	  id: "background-change-button", text: "Cycle background",
	  tooltip: "Cycles the backgrounds", press: fnCycleBackgrounds
  });

  var oPage = new Page("page", {
	  landmarkInfo: new PageAccessibleLandmarkInfo(),
	  title: "Page Control",
	  showNavButton: true,
	  contentOnlyBusy: true,
	  content: [
		  new Button('hide-show-header', {
			   text: "Hide/show header",
			   press: function () {
				   oPage.setShowHeader(!oPage.getShowHeader());
			   }
		  }),
		  new Button('hide-show-footer', {
			   text: "Hide/show footer",
			   press: function () {
				   oPage.setShowFooter(!oPage.getShowFooter());
			   }
		  }),
		  new Button('toggle-floating-footer', {
			  text: "Toggle FloatingFooter",
			  press: function () {
				  oPage.setFloatingFooter(!oPage.getFloatingFooter());
			  }
		  })
	  ],
	  footer: new Bar({
		  contentLeft: oSetBusyButton,
		  contentRight: oChangeBackground
	  })
  });

  oApp.addPage(oPage).placeAt("content");
});