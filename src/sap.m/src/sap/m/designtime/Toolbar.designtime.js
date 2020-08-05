/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Toolbar control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations: {
			content: {
				domRef: ":sap-domref",
				actions: {
					move: "moveControls"
				}
			}
		},
		templates: {
			create: "sap/m/designtime/Toolbar.create.fragment.xml"
		}
	};

});