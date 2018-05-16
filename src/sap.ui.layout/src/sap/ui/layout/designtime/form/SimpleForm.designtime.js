/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.SimpleForm control
sap.ui.define(["sap/ui/fl/changeHandler/ChangeHandlerMediator"], function(ChangeHandlerMediator) {
	"use strict";

	var fnGetStableElements = function(oElement) {
		var aStableElements = [];
		var oLabel;
		var oTitleOrToolbar;
		if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
			oLabel = oElement.getLabel();
			if (oLabel) {
				aStableElements.push(oLabel);
			}
			aStableElements = aStableElements.concat(oElement.getFields());
		} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
			oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
			if (oTitleOrToolbar) {
				aStableElements[0] = oTitleOrToolbar;
			}
			oElement.getFormElements().forEach(function(oFormElement) {
				oLabel = oFormElement.getLabel();
				if (oLabel) {
					aStableElements.push(oLabel);
				}
				aStableElements = aStableElements.concat(oFormElement.getFields());
			});
		}
		return aStableElements;
	};

	var oFormPropagatedMetadata = {
		aggregations : {
			formContainers : {
				//maybe inherited from Form
				childNames : {
					singular : "GROUP_CONTROL_NAME",
					plural : "GROUP_CONTROL_NAME_PLURAL"
				},
				getIndex : function(oForm, oFormContainer) {
					var aFormContainers = oForm.getFormContainers();

					if (oFormContainer) {
						return aFormContainers.indexOf(oFormContainer) + 1;
					}
					// if there is no Elements in the FormContainer, the SimpleForm is empty and
					// the index has to be 0, otherwise the SimpleForm doesn't behave as expected.
					if (aFormContainers.length > 0 && aFormContainers[0].getFormElements().length === 0 &&
						aFormContainers[0].getTitle() === null) {
						return 0;
					}

					return aFormContainers.length;
				},
				beforeMove : function (oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
					if (oSimpleForm){
						oSimpleForm._bChangedByMe = true;
					}
				},
				afterMove : function (oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
					if (oSimpleForm){
						oSimpleForm._bChangedByMe = false;
					}
				},
				actions : {
					move : {
						changeType : "moveSimpleFormGroup"
					},
					createContainer : {
						changeType : "addSimpleFormGroup",
						changeOnRelevantContainer : true,
						isEnabled : function (oForm) {
							var aFormContainers = oForm.getFormContainers();

							for (var i = 0; i < aFormContainers.length; i++) {
								if (aFormContainers[i].getToolbar && aFormContainers[i].getToolbar()) {
									return false;
								}
							}
							return true;
						},
						getCreatedContainerId : function(sNewControlID) {
							var oTitle = sap.ui.getCore().byId(sNewControlID);
							var sParentElementId = oTitle.getParent().getId();

							return sParentElementId;
						}
					}
				}
			}
		},
		getStableElements : fnGetStableElements
	};

	var oFormContainerPropagatedMetadata = {
		name : {
			singular : "GROUP_CONTROL_NAME",
			plural : "GROUP_CONTROL_NAME_PLURAL"
		},
		aggregations: {
			formElements : {
				childNames : {
					singular : "FIELD_CONTROL_NAME",
					plural : "FIELD_CONTROL_NAME_PLURAL"
				},
				beforeMove : function (oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
					if (oSimpleForm){
						oSimpleForm._bChangedByMe = true;
					}
				},
				afterMove : function (oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
					if (oSimpleForm){
						oSimpleForm._bChangedByMe = false;
					}
				},
				actions : {
					move : {
						changeType : "moveSimpleFormField"
					},
					addODataProperty : function (oFormContainer) {
						var mChangeHandlerSettings = ChangeHandlerMediator.getAddODataFieldWithLabelSettings(oFormContainer);

						if (mChangeHandlerSettings){
							return {
								changeType: "addSimpleFormField",
								changeOnRelevantContainer : true,
								changeHandlerSettings : mChangeHandlerSettings
							};
						}
					}
				}
			}
		},
		actions: {
			rename : function(oRenamedElement) {
				return {
					changeType : "renameTitle",
					changeOnRelevantContainer : true,
					isEnabled : !(oRenamedElement.getToolbar() || !oRenamedElement.getTitle()),
					domRef : function (oControl){
						if (oControl.getTitle && oControl.getTitle()) {
							return oControl.getTitle().getDomRef();
						}
					}
				};
			},
			remove : function(oRemovedElement) {
				return {
					changeType : "removeSimpleFormGroup",
					changeOnRelevantContainer : true,
					isEnabled : !!(oRemovedElement.getToolbar() || oRemovedElement.getTitle()),
					getConfirmationText : function(oRemovedElement){
						var bContent = false;
						if (oRemovedElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer"
								&& oRemovedElement.getToolbar && oRemovedElement.getToolbar()) {
							var aToolbarContent = oRemovedElement.getToolbar().getContent();
							if (aToolbarContent.length > 1) {
									bContent = true;
							} else if ((aToolbarContent.length === 1) &&
												(!aToolbarContent[0].getMetadata().isInstanceOf("sap.ui.core.Label") &&
												!aToolbarContent[0] instanceof sap.ui.core.Title && !aToolbarContent[0] instanceof sap.m.Title)) {
									bContent = true;
							}
						}
						if (bContent) {
							var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout.designtime");
							return oTextResources.getText("MSG_REMOVING_TOOLBAR");
						}
					},
					getState : function(oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
						var aContent = oSimpleForm.getContent();
						return {
							content : aContent.map(function(oElement) {
								return {
									element : oElement,
									visible : oElement.getVisible ? oElement.getVisible() : undefined,
									index : aContent.indexOf(oElement)
								};
							})
						};
					},
					restoreState : function(oSimpleForm, oState) { //TODO has to be relevant container/selector, TODO extract as function
						oSimpleForm.removeAllContent();
						oState.content.forEach(function(oElementState) {
							oSimpleForm.insertContent(oElementState.element, oElementState.index);
							if (oElementState.element.setVisible){
								oElementState.element.setVisible(oElementState.visible);
							}
						});
					}
				};
			}
		},
		getStableElements : fnGetStableElements
	};

	var oFormElementPropagatedMetadata = {
		name : {
			singular : "FIELD_CONTROL_NAME",
			plural : "FIELD_CONTROL_NAME_PLURAL"
		},
		actions: {
			rename : {
				changeType : "renameLabel",
				changeOnRelevantContainer : true,
				domRef : function (oControl){
					return oControl.getLabel().getDomRef();
				},
				getState : function(oSimpleForm) {
					var aContent = oSimpleForm.getContent();
					return {
						content : aContent.map(function(oElement) {
							return {
								element : oElement,
								text : oElement.getText ? oElement.getText() : undefined,
								index : aContent.indexOf(oElement)
							};
						})
					};
				},
				restoreState : function(oSimpleForm, oState) {
					oSimpleForm.removeAllContent();
					oState.content.forEach(function(oElementState) {
						oSimpleForm.insertContent(oElementState.element, oElementState.index);
						if (oElementState.element.setText){
							oElementState.element.setText(oElementState.text);
						}
					});
				}
			},
			remove : {
				changeType : "hideSimpleFormField",
				changeOnRelevantContainer : true,
				getState : function(oSimpleForm) { //TODO has to be relevant container/selector, TODO extract as function
					var aContent = oSimpleForm.getContent();
					return {
						content : aContent.map(function(oElement) {
							return {
								element : oElement,
								visible : oElement.getVisible ? oElement.getVisible() : undefined,
								index : aContent.indexOf(oElement)
							};
						})
					};
				},
				restoreState : function(oSimpleForm, oState) { //TODO has to be relevant container/selector, TODO extract as function
					oSimpleForm.removeAllContent();
					oState.content.forEach(function(oElementState) {
						oSimpleForm.insertContent(oElementState.element, oElementState.index);
						if (oElementState.element.setVisible){
							oElementState.element.setVisible(oElementState.visible);
						}
					});
				}
			},
			reveal : {
				changeType : "unhideSimpleFormField",
				changeOnRelevantContainer : true
			}
		},
		getStableElements : fnGetStableElements
	};

	return {
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/ui/layout/designtime/form/SimpleForm.icon.svg"
			}
		},
		aggregations : {
			content : {
				ignore : true
			},
			title : {
				ignore : true
			},
			toolbar : {
				ignore : function(oSimpleForm){
					return !oSimpleForm.getToolbar();
				},
				domRef : function(oSimpleForm){
					return oSimpleForm.getToolbar().getDomRef();
				}
			},
			form : {
				ignore : false,
				propagateMetadata : function(oElement){
					var sType = oElement.getMetadata().getName();
					if (sType === "sap.ui.layout.form.Form") {
						return oFormPropagatedMetadata;
					} else if (sType === "sap.ui.layout.form.FormContainer") {
						return oFormContainerPropagatedMetadata;
					} else if ( sType === "sap.ui.layout.form.FormElement") {
						return oFormElementPropagatedMetadata;
					} else {
						return {
							actions: null
						};
					}
				},
				propagateRelevantContainer : true
			}
		}
	};

}, /* bExport= */false);
