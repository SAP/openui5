/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.SimpleForm control
sap.ui.define([], function() {
	"use strict";

	return {
		aggregations : {
			content : {
				ignore : true
			},
			form : {
				ignore : false,
				actions : {
					move : function(oElement){
						var sType = oElement.getMetadata().getName();

						if (sType === "sap.ui.layout.form.FormContainer" || sType === "sap.ui.core.Title" || sType === "sap.ui.core.Toolbar"){
							return "moveSimpleFormGroup";
						} else if (sType === "sap.ui.layout.form.FormElement" || sType === "sap.ui.core.Label"){
							return "moveSimpleFormField";
						}
					}
				},
				beforeMove : function(oMovedElement, oSource, oTarget) {
				}

			}
		}
	};

}, /* bExport= */false);
