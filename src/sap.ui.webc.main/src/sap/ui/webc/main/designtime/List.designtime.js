/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.List control
sap.ui.define([],
	function () {
		"use strict";

		function isParentListBaseInstanceAndBound(oElement) {
			var oParent = oElement;
			while (oParent) {
				if (oParent.isA("sap.ui.webc.main.List")) {
					var oBinding = oParent.getBinding("items");
					if (oBinding) {
						return true;
					}
					return false;
				}
				oParent = oParent.getParent();
			}
			return false;
		}

		return {
			name: {
				singular: "LIST_NAME",
				plural: "LIST_NAME_PLURAL"
			},
			aggregations: {
				items: {
					propagateMetadata: function(oElement) {
						if (isParentListBaseInstanceAndBound(oElement)) {
							return {
								// prevent remove & rename actions on "items" aggregation and its inner controls when binding exists
								actions: {
									remove: null,
									rename: null
								}
							};
						}
					},
					actions: {
						move: "moveControls"
					}
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.getDomRef().getDomRef().querySelector(".ui5-list-header");
						},
						getTextMutators: function (oControl) {
							return {
								getText: function () {
									return oControl.getHeaderText();
								},
								setText: function (sNewText) {
									oControl.setHeaderText(sNewText);
								}
							};
						},
						isEnabled: function (oControl) {
							return oControl.getHeaderText().length > 0;
						},
						validators: [
							"noEmptyText"
						]
					};
				}
			}
		};
	});