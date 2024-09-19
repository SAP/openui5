// Note: the HTML page 'DynamicPageKPI.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], async function(XMLView) {
	"use strict";
	(await XMLView.create({
		definition: document.getElementById('#view1').textContent
	})).placeAt("content");
});