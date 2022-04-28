sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ExtensionPoint"
], function (XMLView, JSONModel, ExtensionPoint) {
	"use strict";

	ExtensionPoint.registerExtensionProvider(function() {
		return "sap/ui/sample/mvc/XMLViewBindableAggregationEPProvider";
	});

	XMLView.create({
		viewName: "sap.ui.sample.mvc.XMLViewBindableAggregation"
	}).then(function (oView) {
		oView.placeAt("content");
	});
});
