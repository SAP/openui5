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

						if (sType === "sap.ui.layout.form.FormContainer"){
							return "moveSimpleFormGroup";
						} else if (sType === "sap.ui.layout.form.FormElement"){
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
