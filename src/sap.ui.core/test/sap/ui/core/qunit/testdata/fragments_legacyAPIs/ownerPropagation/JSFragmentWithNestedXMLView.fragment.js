sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], function(XMLView) {
	"use strict";
	return {
		createContent: function () {
			return XMLView.create({
				viewName: "testdata.fragments_legacyAPIs.ownerPropagation.XMLView"
			});
		}
	};
});