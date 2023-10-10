/*!
 * ${copyright}
 */

// Provides the design time metadata for the sap.tnt.NavigationList control
sap.ui.define([
], function () {
	"use strict";

	return {
		aggregations: {
			items: {
				domRef: ":sap-domref",
				actions: {
					move: "moveControls"
				}
			}
		}
	};
});