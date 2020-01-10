/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.fl.variants.VariantManagement control.
sap.ui.define([
	"sap/ui/fl/Utils"
], function(
	flUtils
) {
	"use strict";
	var fnSetControlAttributes = function (oVariantManagement, bDesignTimeMode) {
		var oAppComponent = flUtils.getAppComponentForControl(oVariantManagement);
		var sControlId = oVariantManagement.getId();
		var oModel = oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME);
		var sVariantManagementReference = oAppComponent.getLocalId(sControlId) || sControlId;

		if (!oModel) {
			return;
		}

		oModel.setModelPropertiesForControl(sVariantManagementReference, bDesignTimeMode, oVariantManagement);
		oModel.checkUpdate(true);
	};
	return {
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
		variantRenameDomRef: function(oVariantManagement) {
			return oVariantManagement.getTitle().getDomRef("inner");
		},
		customData: {},
		tool: {
			start: function(oVariantManagement) {
				// In personalization mode the variant management overlay cannot be selected
				var bDesignTimeMode = true;
				fnSetControlAttributes(oVariantManagement, bDesignTimeMode);
			},
			stop: function(oVariantManagement) {
				var bDesignTimeMode = false;
				fnSetControlAttributes(oVariantManagement, bDesignTimeMode);
			}
		}
	};
});