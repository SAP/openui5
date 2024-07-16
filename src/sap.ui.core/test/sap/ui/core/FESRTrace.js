sap.ui.define([
  "sap/m/App",
  "sap/m/Page",
  "sap/m/HBox",
  "sap/m/Button"
], function(App, Page, HBox, Button) {
  "use strict";
  // Note: the HTML page 'FESRTrace.html' loads this module via data-sap-ui-on-init

  function createRequest() {
	  var oReq = new XMLHttpRequest();
	  oReq.open("GET", "../../../../resources/sap-ui-core.js");
	  oReq.send();
  }

  var oApp = new App("myApp", {
	  pages: new Page("page", {
		  title: "FESR Testpage",
		  content: [
			  new HBox({
				  items: [
					  new Button({
						  text: "1. Interaction",
						  press: function() {
							  createRequest();
						  }
					  }),
					  new Button({
						  text: "2. Interaction",
						  press: function() {
							  createRequest();
							  createRequest();
						  }
					  }),
					  new Button({
						  text: "3. Interaction",
						  press: function() {
							  createRequest();
							  createRequest();
							  createRequest();
						  }
					  }),
					  new Button({
						  text: "4. Interaction",
						  press: function() {
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
						  }
					  }),
					  new Button({
						  text: "5. Interaction",
						  press: function() {
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
						  }
					  }),
					  new Button({
						  text: "Stop Interaction",
						  press: function() {
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
							  createRequest();
						  }
					  })
				  ]
			  })
		  ]
	  })
  });
  oApp.placeAt("content");
});