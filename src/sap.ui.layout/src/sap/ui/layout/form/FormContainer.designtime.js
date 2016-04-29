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
				domRef : function() {
					var oDomRef = this.getDomRef();
					if (!oDomRef && this.getFormElements().length === 0) {
						var oTitle = this.getTitle();
						if (oTitle) {
							return oTitle.getDomRef();
						}
					} else {
						return oDomRef;
					}
				}
			}
		}
	};

}, /* bExport= */ false);