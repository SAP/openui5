sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.commons",
		skipTests: [GenericTestCollection.Test.EnforceSemanticRendering],
		objectCapabilities: {
			"sap.ui.commons.InPlaceEdit": {
				aggregations: {
					content: "sap.ui.commons.TextField"
				}
			},
			"sap.ui.commons.SearchField.TF": {
				moduleName: "sap/ui/commons/SearchField"
			},
			"sap.ui.commons.SearchField.CB": {
				moduleName: "sap/ui/commons/SearchField",
				rendererHasDependencies: true
			},
			"sap.ui.commons.ToolbarOverflowPopup": {
				moduleName: "sap/ui/commons/Toolbar",
				create: function (ToolbarOverflowPopup, mParameters) {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/ui/commons/Toolbar"], function (Toolbar) {
							resolve(new ToolbarOverflowPopup(new Toolbar(mParameters)));
						}, reject);
					});
				}
			},
			"sap.ui.commons._DelegatorMenuItem": {
				moduleName: "sap/ui/commons/MenuBar",
				create: function (_DelegatorMenuItem, mParameters) {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/ui/unified/MenuItem"], function (MenuItem) {
							resolve(new _DelegatorMenuItem(new MenuItem()));
						}, reject);
					});
				}
			}
		}
	});

	return oConfig;
});