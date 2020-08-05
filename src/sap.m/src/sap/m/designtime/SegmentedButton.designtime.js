/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.SegmentedButton control
sap.ui.define([],
	function() {
	"use strict";

	return {
		palette: {
			group: "ACTION",
			icons: {
				svg: "sap/m/designtime/SegmentedButton.icon.svg"
			}
		},
		templates: {
			create: "sap/m/designtime/SegmentedButton.create.fragment.xml"
		},
		aggregations: {
			"items": {
				ignore: true
			}
		}
	};

});