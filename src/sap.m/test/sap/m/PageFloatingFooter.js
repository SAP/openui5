sap.ui.define([
  "sap/m/App",
  "sap/m/Button",
  "sap/m/Panel",
  "sap/m/Text",
  "sap/m/Page",
  "sap/m/PageAccessibleLandmarkInfo",
  "sap/m/Bar"
], function(App, Button, Panel, Text, Page, PageAccessibleLandmarkInfo, Bar) {
  "use strict";
  // Note: the HTML page 'PageFloatingFooter.html' loads this module via data-sap-ui-on-init

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

  var sText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tincidunt scelerisque elit, at egestas libero elementum ac. Vivamus pulvinar felis eros, id tristique risus aliquam id. Nulla ac congue urna, eu mollis risus. Suspendisse purus magna, cursus nec volutpat at, mattis id risus. Etiam varius vestibulum lectus a sagittis. Pellentesque pharetra velit at eleifend luctus. Ut porta, tortor in sagittis ultrices, diam tellus molestie quam, et tempus lorem neque vitae tortor. Praesent mollis sodales magna, eu lobortis ligula vestibulum id. Nunc non velit turpis. Nullam euismod aliquam augue, non porta risus. Morbi aliquet id elit et cursus. Etiam sed aliquet leo. Vivamus fermentum lectus id varius consequat. Nunc vel arcu non magna lobortis finibus id nec dolor. Curabitur sapien odio, facilisis ac metus a, placerat accumsan neque. Vestibulum tempor eros mi, non dignissim tortor aliquet dignissim.";
  var aContent = [
		  new Button({
			  text: "Toggle floating footer",
			  press: function () {
				  var ff = oPage.getFloatingFooter();
				  oPage.setFloatingFooter(!ff);
			  }
		  }),
		  new Button({
			  text: "Toggle footer visibility",
			  press: function () {
				  var showFooter = oPage.getShowFooter();
				  oPage.setShowFooter(!showFooter);
			  }
		  }),
		  new Button({
			  text: "Add Panel",
			  press: function () {
				  var sapPanel = new Panel({
					  content: new Text({
						  text: sText + sText
					  })
				  });
				  oPage.addContent(sapPanel);
			  }
		  }),
		  new Button({
			  text: "Remove Panel",
			  press: function () {
				  oPage.removeContent(5);
			  }
		  })
  ];


  for (var i = 0; i < 10; i++) {
	  var sapPanel = new Panel({
		  content: [
			  new Text({ text: sText + sText}),
			  new Button("button" + i, {text: "Test"})
		  ]
	  });
	  aContent.push(sapPanel);
  }

  var oPage = new Page("page", {
	  landmarkInfo: new PageAccessibleLandmarkInfo(),
	  title: "Page Control",
	  showNavButton: true,
	  contentOnlyBusy: true,
	  floatingFooter: true,
	  content: [
		  aContent
	  ],
	  footer: new Bar({
		  contentLeft: oSetBusyButton,
		  contentRight: oChangeBackground
	  })
  });

  oApp.addPage(oPage).placeAt("content");
});