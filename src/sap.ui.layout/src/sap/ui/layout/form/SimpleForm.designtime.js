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
					}
				},
				beforeMove : function(oMovedElement, oSource, oTarget) {
				}

			}
		}
	};

}, /* bExport= */false);
