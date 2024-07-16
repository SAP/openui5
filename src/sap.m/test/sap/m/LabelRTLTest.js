sap.ui.define([
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Label"
], function(App, Page, Label) {
  "use strict";
  // Note: the HTML page 'LabelRTLTest.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");
  app.placeAt("body");

  var page = new Page("page", {
	  title:"Phone numbers with spaces in RTL page",
	  content: [
		  new Label({
			  text: 'Default behaviour',
			  width: '100%'
		  }),
		  new Label({
			  text: '(012) 345 678',
			  width: '100%'
		  }),
		  new Label({
			  text: 'LTR content direction, wrong default alignment',
			  width: '100%'
		  }),
		  new Label({
			  text: '(012) 345 678',
			  textDirection: 'LTR',
			  width: '100%'
		  }),
		  new Label({
			  text: 'LTR content direction, right alignment',
			  width: '100%'
		  }),
		  new Label({
			  text: '(012) 345 678',
			  textDirection: 'LTR',
			  textAlign: 'Right',
			  width: '100%'
		  })
	  ]
  });

  app.addPage(page);
});