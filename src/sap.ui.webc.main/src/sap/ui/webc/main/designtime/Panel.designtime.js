/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.Panel control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name: {
			singular: "PANEL_NAME",
			plural: "PANEL_NAME_PLURAL"
		},
		actions: {
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl",
				getLabel: function (oControl) {
					return oControl.getHeaderText() || oControl.getId();
				}
			},
			rename: {
				changeType: "rename",
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-header-title");
				},
				getTextMutators: function (oControl) {
					return {
						getText: function () {
							return oControl.getDomRef().getAttribute("header-text");
						},
						setText: function (sNewText) {
							oControl.getDomRef().setAttribute("header-text", sNewText);
						}
					};
				}
			}
		},
		aggregations: {
			header: {
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-header");
				}
			},
			content: {
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-content");
				},
				actions: {
					move: "moveControls"
				}
			}
		}
	};

});