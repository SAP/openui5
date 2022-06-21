sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], function(XMLView) {
	"use strict";

	XMLView.create({
		definition: document.getElementById('view1').textContent
	}).then(function(oView) {
		oView.placeAt("content");
	});
});
