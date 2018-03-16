/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.fl.variants.VariantManagement control.
sap.ui.define([], function() {
	"use strict";
	return {
		domRef: function(oControl) {
			return oControl.getTitle().getDomRef("inner");
		},
		annotations: {},
		properties: {
			showExecuteOnSelection: {
				ignore: false
			},
			showSetAsDefault: {
				ignore: false
			},
			manualVariantKey: {
				ignore: false
			},
			inErrorState: {
				ignore: false
			},
			editable: {
				ignore: false
			},
			modelName: {
				ignore: false
			},
			updateVariantInURL: {
				ignore: false
			}
		},
		customData: {}
	};
}, /* bExport= */false);
