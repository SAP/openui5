/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the UI Component
sap.ui.define([],
	function () {
		"use strict";

		return {
			domRef: function(oUIComponent) {
				if (oUIComponent.oContainer) {
					return oUIComponent.oContainer.getDomRef("uiarea");
				}
			},
			aggregations: {
				rootControl: {
					ignore : false
				}
			}
		};
	});