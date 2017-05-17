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
		actions: {
			remove: {
				changeType: "hideControl"
			},
			rename: {
				changeType: "renameGroup",
				domRef: function (oFormContainer) {
					return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
				},
				isEnabled : function (oFormContainer) {
					return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
				}
			}
		},
		aggregations : {
			formElements : {
				domRef: function (oFormContainer) {
					var oDomRef = oFormContainer.getDomRef();
					if (!oDomRef && oFormContainer.getFormElements().length === 0 || _allFormElementsInvisible(oFormContainer)) {
						var oHeader = oFormContainer.getTitle() || oFormContainer.getToolbar();
						if (oHeader) {
							return oHeader.getDomRef();
						}
					} else {
						return oDomRef;
					}
				},
				actions: {
					move: "moveControls"
				}
			},
			toolbar : {
				domRef: function (oFormContainer) {
					var oToolbar = oFormContainer.getToolbar();
					if (oToolbar) {
						return oToolbar.getDomRef();
					}
				}
			}
		},
		name: {
			singular: "GROUP_CONTROL_NAME",
			plural: "GROUP_CONTROL_NAME_PLURAL"
		}
	};

}, /* bExport= */ false);