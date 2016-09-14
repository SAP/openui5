/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.SimpleForm control
sap.ui.define([], function() {
	"use strict";

	var fnGetFormElementState = function(oFormElement) {
		var that = this;

		var aControlsState = [];

		var oLabel = oFormElement.getLabel();
		var aControls = oFormElement.getFields();
		if (oLabel) {
			aControls = [oLabel].concat(aControls);
		}

		aControls.forEach(function(oControl) {
			aControlsState.push({
				element : oControl,
				visible : oControl.getVisible(),
				index : that.getContent().indexOf(oControl)
			});
		});

		return {
			elementsState : aControlsState
		};
	};

	return {
		aggregations : {
			content : {
				ignore : true
			},
			form : {
				ignore : false,
				actions : {
					move : function(oMovedElement){
						var sType = oMovedElement.getMetadata().getName();

						if (sType === "sap.ui.layout.form.FormContainer"){
							return "moveSimpleFormGroup";
						} else if (sType === "sap.ui.layout.form.FormElement"){
							return "moveSimpleFormField";
						}
					},
					rename : function(oElement){
						var sType = oElement.getMetadata().getName();
						var bIsEnabled = true;
						var oRenameMetadata;
						if (sType === "sap.ui.layout.form.FormContainer"){
							if (oElement.getToolbar && oElement.getToolbar()) {
								bIsEnabled = false;
							}
							oRenameMetadata = {
								changeType : "renameTitle",
								isEnabled : bIsEnabled,
								domRef : function (oControl){
									if (oControl.getTitle && oControl.getTitle()) {
										return oControl.getTitle().getDomRef();
									} else {
										return;
									}
								},
								getState : function (oControl) {
									var oState = {
										oTitle : oControl.getTitle(),
										oldValue : oControl.getTitle().getText()
									};
									return oState;
								},
								restoreState : function (oControl, oState) {
									oState.oTitle.setText(oState.oldValue);
									var sBindingValue = "";
									var oBindingInfo = oState.oTitle.getBindingInfo("text");
									if (oBindingInfo) {
										sBindingValue = oBindingInfo.binding.getValue();
										if (sBindingValue === oState.oldValue) {
											var oBinding = oState.oTitle.getBinding("text");
											if (oBinding) {
												oBinding.resume();
											}
										}
									}
									return true;
								}
							};
						} else if (sType === "sap.ui.layout.form.FormElement"){
							oRenameMetadata = {
								changeType : "renameLabel",
								isEnabled : bIsEnabled,
								domRef : function (oControl){
									return oControl.getLabel().getDomRef();
								},
								getState : function (oControl) {
									var oState = {
										oLabel : oControl.getLabel(),
										oldValue : oControl.getLabel().getText()
									};
									return oState;
								},
								restoreState : function (oControl, oState) {
									oState.oLabel.setText(oState.oldValue);
									var sBindingValue = "";
									var oBindingInfo = oState.oLabel.getBindingInfo("text");
									if (oBindingInfo) {
										sBindingValue = oBindingInfo.binding.getValue();
										if (sBindingValue === oState.oldValue) {
											var oBinding = oState.oLabel.getBinding("text");
											if (oBinding) {
												oBinding.resume();
											}
										}
									}
									return true;
								}
							};
						}
						return oRenameMetadata;
					},
					remove : function(oRemovedElement) {
						var sType = oRemovedElement.getMetadata().getName();

						var sChangeType;
						var bIsEnabled = true;
						if (sType === "sap.ui.layout.form.FormContainer"){
							sChangeType = "removeSimpleFormGroup";
							bIsEnabled = !!oRemovedElement.getTitle() || !!oRemovedElement.getToolbar();
						} else if (sType === "sap.ui.layout.form.FormElement"){
							sChangeType = "hideSimpleFormField";
						}

						return {
							changeType : sChangeType,
							isEnabled : bIsEnabled,
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
									var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");
									return oTextResources.getText("MSG_REMOVING_TOOLBAR");
								}
							},
							getState : function(oRemovedElement) {
								var that = this;

								if (oRemovedElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									return fnGetFormElementState.call(this, oRemovedElement);
								} else {
									var aElementsState = [];
									var oTitleOrToolbar = oRemovedElement.getTitle() || oRemovedElement.getToolbar();
									aElementsState.push({
										element : oTitleOrToolbar,
										index : this.getContent().indexOf(oTitleOrToolbar)
									});

									oRemovedElement.getFormElements().forEach(function(oFormElement) {
										aElementsState = aElementsState.concat(fnGetFormElementState.call(that, oFormElement).elementsState);
									});

									return {
										elementsState : aElementsState
									};
								}
							},
							restoreState : function(oRemovedElement, oState) {
								var that = this;
								if (oRemovedElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									oState.elementsState.forEach(function(oElementState) {
										oElementState.element.setVisible(oElementState.visible);
									});
								} else {
									oState.elementsState.forEach(function(oElementState) {
										if (oElementState.visible) {
											oElementState.element.setVisible(oElementState.visible);
										}
										if (oElementState.index !== undefined) {
											that.removeContent(oElementState.element);
											that.insertContent(oElementState.element, oElementState.index);
										}
									});
								}
							}
						};
					},
					createContainer : function(oElement){
						var sType = oElement.getMetadata().getName();
			            if (sType !== "sap.ui.layout.form.SimpleForm") {
							return;
			            }

			            var oAggregation = oElement.getAggregation("form");
					    var aFormContainers = oAggregation.getFormContainers();

						return {
							changeType : "addSimpleFormGroup",
							isEnabled : function (oElement) {
								for (var i = 0; i < aFormContainers.length; i++) {
									if (aFormContainers[i].getToolbar && aFormContainers[i].getToolbar()) {
										return false;
									}
								}
						        return true;
							},
							restoreState : function (oElement) {
								oElement.destroy();
								return true;
							},
							getState: function (oElement) {
							},
							rootControlName: "sap.ui.layout.form.SimpleForm",
							getParentElementId : function(sNewControlID) {
								var oTitle = sap.ui.getCore().byId(sNewControlID);
								var sParentElementId = oTitle.getParent().getId();

								return sParentElementId;
							},
							getGroupIndex : function(oElement) {
								var iIndex = 0;
								var oLastFormContainer = aFormContainers[aFormContainers.length - 1];
								var aContent = oElement.getContent();

								var iStart = -1;
								var oTitle = oLastFormContainer.getTitle();
								if (oTitle !== null) {
									aContent.some(function(oField, index) {
										if (oField === oTitle) {
											iStart = index;
										}
										if (iStart >= 0 && index > iStart) {
											if (oField instanceof sap.ui.core.Title) {
												iIndex = index;
												return true;
											}
										}
									});
									iIndex = (!iIndex) ? aContent.length : iIndex;
								}

								return iIndex;
							}
						};
					}
				},
				getStableElements : function(oElement) {
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
				}
			}
		}
	};

}, /* bExport= */false);
