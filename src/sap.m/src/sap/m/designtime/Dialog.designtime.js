/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.DialogType control
sap.ui.define([],
	function () {
		"use strict";

		return {
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
					domRef : "> .sapMDialogSection"
				},
				customHeader: {
					domRef: function (oControl) {
						if (oControl._getAnyHeader()) {
							return oControl._getAnyHeader().getDomRef();
						}
					}
				}
			}
		};

	}, /* bExport= */ false);
