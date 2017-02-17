/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.FormContainer control
sap.ui.define([],
	function() {
	"use strict";

	function _allFormElementsInvisible(oFormContainer){

		return oFormContainer.getFormElements().every(function(oFormElement){
			return oFormElement.getVisible() === false;
		});
	}

	return {
		aggregations : {
			formElements : {
				domRef : function(oFormContainer) {
					var oDomRef = oFormContainer.getDomRef();
					if (!oDomRef && oFormContainer.getFormElements().length === 0 || _allFormElementsInvisible(oFormContainer)) {
						var oHeader = oFormContainer.getTitle() || oFormContainer.getToolbar();
						if (oHeader) {
							return oHeader.getDomRef();
						}
					} else {
						return oDomRef;
					}
				}
			}
		}
	};

}, /* bExport= */ false);