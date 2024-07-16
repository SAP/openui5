sap.ui.define([
	"sap/ui/core/mvc/XMLView",
], function(XMLView) {
	"use strict";
	XMLView.create({
		definition: document.getElementById('myXml').textContent,
	}).then(function(oXMLView) {
		oXMLView.placeAt("content");
	});
})