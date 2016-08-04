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
						var oRenameMetadata;
						if (sType === "sap.ui.layout.form.FormContainer"){
							oRenameMetadata = {
								changeType : "renameTitle",
								domRef : function (oControl){
									return oControl.getTitle().getDomRef();
								},
								getState : function (oControl) {
									var oState = {
										oldValue : oControl.getTitle().getText()
									};
									return oState;
								},
								restoreState : function (oControl, oState) {
									oControl.getTitle().setText(oState.oldValue);
									var sBindingValue = "";
									var oBindingInfo = oControl.getTitle().getBindingInfo("text");
									if (oBindingInfo) {
										sBindingValue = oBindingInfo.binding.getValue();
										if (sBindingValue === oState.oldValue) {
											var oBinding = oControl.getTitle().getBinding("text");
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
								domRef : function (oControl){
									return oControl.getLabel().getDomRef();
								},
								getState : function (oControl) {
									var oState = {
										oldValue : oControl.getLabel().getText()
									};
									return oState;
								},
								restoreState : function (oControl, oState) {
									oControl.getLabel().setText(oState.oldValue);
									var sBindingValue = "";
									var oBindingInfo = oControl.getLabel().getBindingInfo("text");
									if (oBindingInfo) {
										sBindingValue = oBindingInfo.binding.getValue();
										if (sBindingValue === oState.oldValue) {
											var oBinding = oControl.getLabel().getBinding("text");
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
							bIsEnabled = !!oRemovedElement.getTitle();
						} else if (sType === "sap.ui.layout.form.FormElement"){
							sChangeType = "hideSimpleFormField";
						}

						return {
							changeType : sChangeType,
							isEnabled : bIsEnabled,
							getState : function(oRemovedElement) {
								var that = this;

								if (oRemovedElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									return fnGetFormElementState.call(this, oRemovedElement);
								} else {
									var aElementsState = [];
									var oTitle = oRemovedElement.getTitle();
									aElementsState.push({
										element : oTitle,
										index : this.getContent().indexOf(oTitle)
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
					}
				}
			}
		}
	};

}, /* bExport= */false);
