/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.SearchField control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "SEARCH_FIELD_NAME",
				plural: "SEARCH_FIELD_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/SearchField.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/SearchField.create.fragment.xml"
			}
		};
	});