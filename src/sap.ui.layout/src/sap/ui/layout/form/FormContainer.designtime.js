/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.FormContainer control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			formElements : {
				domRef : function(oElement) {
					var oDomRef = oElement.getDomRef();
					if (!oDomRef && oElement.getFormElements().length === 0) {
						var oGroup = oElement.getTitle() || oElement.getToolbar();
						if (oGroup) {
							return oGroup.getDomRef();
						}
					} else {
						return oDomRef;
					}
				}
			}
		}
	};

}, /* bExport= */ false);