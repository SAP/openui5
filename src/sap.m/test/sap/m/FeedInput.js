sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/mvc/XMLView"
], function(App, Page, XMLView) {
	"use strict";

	XMLView.create({
		id: 'FeedInputView',
		viewName: 'sap.m.test.FeedInput'
	}).then(function(oView) {
		var app = new App("myApp");
		var page = new Page();
		page.addContent(oView);
		app.addPage(page);
		app.placeAt("content");
	});
});
