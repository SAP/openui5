sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], function(XMLView) {
	"use strict";

	XMLView.create({
		viewName : "sap.m.sample.TableTest.applicationUnderTest.view.Table"
	}).then(function(oView) {
		oView.placeAt("content");
	});
});
