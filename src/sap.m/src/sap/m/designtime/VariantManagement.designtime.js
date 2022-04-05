/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.fl.variants.VariantManagement control.
sap.ui.define([
], function(
) {
	"use strict";

	return {
		annotations: {},
		properties: {
			showSetAsDefault: {
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
			executeOnSelectionForStandardDefault: {
				ignore: false
			},
			displayTextForExecuteOnSelectionForStandardVariant: {
				ignore: false
			}
		},
		actions: {
//			controlVariant: function(oVariantManagement) {
//				var oAppComponent = flUtils.getAppComponentForControl(oVariantManagement);
//				var sControlId = oVariantManagement.getId();
//				var oModel = oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME);
//				var sVariantManagementReference = oAppComponent.getLocalId(sControlId) || sControlId;
//				return {
//					validators: [
//						"noEmptyText",
//						{
//							validatorFunction: function(sNewText) {
//								var iDuplicateCount = oModel._getVariantTitleCount(sNewText, sVariantManagementReference) || 0;
//								return iDuplicateCount === 0;
//							},
//							errorMessage: sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")
//						}
//					]
//				};
//			}
		}
	};
});