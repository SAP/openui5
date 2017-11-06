/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.Form control
sap.ui.define([],
	function() {
	"use strict";

	return {
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/ui/layout/designtime/form/Form.icon.svg"
			}
		},
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
				childNames : {
					singular : "GROUP_CONTROL_NAME",
					plural : "GROUP_CONTROL_NAME_PLURAL"
				},
				domRef: ":sap-domref",
				actions: {
					move: "moveControls",
					createContainer :  {
						changeType : "addGroup",
						isEnabled : true,
						getCreatedContainerId : function(sNewControlID) {
							return sNewControlID;
						}
					}
				}

			}
		}
	};

}, /* bExport= */ false);