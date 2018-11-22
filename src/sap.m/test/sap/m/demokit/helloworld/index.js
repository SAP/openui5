sap.ui.getCore().attachInit(function () {
	"use strict";

	// create a mobile app and display page1 initially
	sap.ui.require([
		"sap/m/App",
		"sap/m/Page",
		"sap/m/Button"
	], function (App, Page, Button) {
		var app = new App("myApp", {
			initialPage: "page1"
		});

		// create the first page
		var page1 = new Page("page1", {
			title: "Hello World",
			showNavButton: false,
			content: new Button({
				text: "Go to Page 2",
				press: function () {
					// navigate to page2
					app.to("page2");
				}
			})
		});

		// create the second page with a back button
		var page2 = new Page("page2", {
			title: "Hello Page 2",
			showNavButton: true,
			navButtonPress: function () {
				// go back to the previous page
				app.back();
			}
		});

		// add both pages to the app
		app.addPage(page1).addPage(page2);
		// place the app into the HTML document
		app.placeAt("content");
	});
});