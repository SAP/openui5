/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.ResponsivePopover control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "RESPONSIVE_POPOVER_NAME",
				plural: "RESPONSIVE_POPOVER_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.getDomRef().shadowRoot.querySelector(".ui5-popup-header-text");
					},
					getLabel: function(oControl) {
						return oControl.getDomRef().getAttribute("header-text");
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});