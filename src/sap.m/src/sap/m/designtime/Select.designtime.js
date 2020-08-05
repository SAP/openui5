/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Select control
sap.ui.define([],
	function() {
	"use strict";

	return {
		palette: {
			group: "INPUT",
			icons: {
				svg: "sap/m/designtime/Select.icon.svg"
			}
		},
		aggregations : {
			items : {
				domRef : ":sap-domref"
			},
			picker: {
				ignore: true
			}
		},
		templates: {
			create: "sap/m/designtime/Select.create.fragment.xml"
		}
	};

});