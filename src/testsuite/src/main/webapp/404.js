sap.ui.define([
	"sap/m/Page",
	"sap/ui/core/mvc/XMLView"
], function (Page, XMLView) {
	"use strict";

	// initialize the UI component
	XMLView.create({
		viewName: "sap.ui.documentation.sdk.view.VersionNotFound"
	}).then(function (oView) {
		new Page({
			showHeader: false,
			content: oView,
		}).placeAt("content");
	});
});
