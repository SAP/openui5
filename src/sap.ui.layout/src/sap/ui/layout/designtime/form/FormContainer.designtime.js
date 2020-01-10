/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.FormContainer control
sap.ui.define([
	'sap/ui/fl/changeHandler/ChangeHandlerMediator',
	"sap/ui/thirdparty/jquery",
	'sap/ui/layout/form/Form'
], function(
	ChangeHandlerMediator,
	jQuery,
	Form
) {
	"use strict";

	function _allFormElementsInvisible(oFormContainer){
		return oFormContainer.getFormElements().every(function(oFormElement){
			return oFormElement.getVisible() === false;
		});
	}

	function fnFindForm(oElement){
		if (oElement && !(oElement instanceof Form)){
			 return fnFindForm(oElement.getParent());
		}
		return oElement;
	}

	function fnIsLayoutSupported(oFormContainer){
		var oForm = fnFindForm(oFormContainer);
		if (oForm &&
			oForm.getLayout() &&
			oForm.getLayout().getMetadata().getName() === "sap.ui.layout.form.GridLayout"){
			return false;
		}
		return true;
	}

	return {
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/ui/layout/designtime/form/FormContainer.icon.svg"
			}
		},
		isVisible: function(oFormContainer) {
			return oFormContainer.isVisible();
		},
		actions: {
			remove: function(oFormContainer){
				if (fnIsLayoutSupported(oFormContainer)){
					return {
						changeType: "hideControl"
					};
				} else {
					return null;
				}
			},
			rename: function(oFormContainer) {
				if (fnIsLayoutSupported(oFormContainer)){
					return {
						changeType: "renameGroup",
						domRef: function (oFormContainer) {
							if (!oFormContainer.getRenderedDomRef()){
								var oTitleOrToolbar = oFormContainer.getTitle() || oFormContainer.getToolbar();
								return oTitleOrToolbar.getDomRef();
							}
							return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
						},
						isEnabled : function (oFormContainer) {
							return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
						}
					};
				} else {
					return null;
				}
			}
		},
		aggregations : {
			formElements : {
				childNames : {
					singular : "FIELD_CONTROL_NAME",
					plural : "FIELD_CONTROL_NAME_PLURAL"
				},
				domRef: function (oFormContainer) {
					var oDomRef = oFormContainer.getRenderedDomRef();
					var oHeader = oFormContainer.getTitle() || oFormContainer.getToolbar();
					if (oDomRef) {
						return oDomRef;
					}
					if (oFormContainer.getFormElements().length === 0 || _allFormElementsInvisible(oFormContainer)) {
						if (oHeader instanceof sap.ui.core.Element) {
							return oHeader.getDomRef();
						}
						if (typeof oHeader === "string") {
							return jQuery(oDomRef).find(".sapUiFormTitle").get(0);
						}
					}
					return undefined;
				},
				actions: {
					move: function(oFormContainer){
						if (fnIsLayoutSupported(oFormContainer)){
							return {
								changeType : "moveControls"
							};
						} else {
							return null;
						}
					},
					addODataProperty : function(oFormContainer){
						if (fnIsLayoutSupported(oFormContainer)){
							var mChangeHandlerSettings = ChangeHandlerMediator.getAddODataFieldWithLabelSettings(oFormContainer);

							if (mChangeHandlerSettings){
								return {
									changeType: "addFormField",
									changeOnRelevantContainer : true,
									changeHandlerSettings : mChangeHandlerSettings
								};
							}
						} else {
							return null;
						}
					}
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

});