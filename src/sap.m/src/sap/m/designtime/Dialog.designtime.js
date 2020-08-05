/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.DialogType control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "DIALOG_NAME",
				plural: "DIALOG_NAME_PLURAL"
			},
			palette: {
				group: "DIALOG"
			},
			actions: {
				rename: function (oDialog) {
					// When a custom header is added the title is not visualized and we do not need a rename action.
					if (oDialog.getCustomHeader()) {
						return;
					}
					return {
						changeType: "rename",
						domRef: function (oDialog) {
							return oDialog.getDomRef("title");
						}
					};
				}
			},
			aggregations: {
				content : {
					domRef : "> .sapMDialogSection",
					actions: {
						move: "moveControls"
					}
				},
				customHeader: {
					domRef: function (oControl) {
						if (oControl._getAnyHeader()) {
							return oControl._getAnyHeader().getDomRef();
						}
					}
				},
				subHeader: {
					domRef: ":sap-domref > .sapMDialogSubHeader"
				},
				beginButton: {
					domRef: function(oControl) {
						return oControl.getBeginButton().getDomRef();
					},
					ignore: function(oControl) {
						return !oControl.getBeginButton() || !!oControl.getButtons().length;
					}
				},
				endButton: {
					domRef: function(oControl) {
						return oControl.getEndButton().getDomRef();
					},
					ignore: function(oControl) {
						return !oControl.getEndButton() || !!oControl.getButtons().length;
					}
				},
				buttons: {
					domRef: function(oControl) {
						if (oControl.getButtons().length) {
							return oControl._oToolbar.getDomRef();
						}
					}
				}
			}
		};

	});