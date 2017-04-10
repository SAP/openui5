/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.Form control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			title : {
				ignore : true
			},
			toolbar : {
				ignore : function(oForm){
					return !oForm.getToolbar();
				},
				domRef : function(oForm){
					return oForm.getToolbar().getDomRef();
				}
			},
			formContainers : {
				domRef: ":sap-domref",
				actions: {
					move: "moveControls"
				}
			}
		}
	};

}, /* bExport= */ false);