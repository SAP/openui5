sap.ui.define([
  "sap/m/App",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Label",
  "sap/m/Text",
  "sap/m/Page",
  "sap/m/VBox"
], function(App, SimpleForm, Label, Text, Page, VBox) {
  "use strict";
  // Note: the HTML page 'TextRTLTest.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");
  app.placeAt("body");

  var form = new SimpleForm({
	  maxContainerCols : 2,
	  editable: false,
	  content : [
		  new Label({
			  text: 'default behaviour'
		  }),
		  new Text({
			  text: '(012) 345 678'
		  }),
		  new Label({
			  text: 'textDirection -> ltr'
		  }),
		  new Text({
			  textDirection: 'LTR',
			  text: '(012) 345 678'
		  }),
		  new Label({
			  text: 'textDirection -> ltr, textAlign -> right',
		  }),
		  new Text({
			  textDirection: 'LTR',
			  textAlign: 'Right',
			  text: '(012) 345 678'
		  })
	  ]
  });

  var page = new Page("page", {
	  title:"Phone numbers with spaces in RTL page",
	  content: [
		  new VBox({
			  width : "100%",
			  items : [
				  form
			  ]
		  })
	  ]
  });

  app.addPage(page);
});