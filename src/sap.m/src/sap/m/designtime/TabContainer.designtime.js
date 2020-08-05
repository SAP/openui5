/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.TabContainer control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "TABCONTAINER_NAME",
				plural: "TABCONTAINER_NAME_PLURAL"
			},
			palette: {
				group: "CONTAINER"
				// TODO: uncomment this when icon is avaiable
				// icons: {
				// 	svg: "sap/m/designtime/TabContainer.icon.svg"
				// }
			},
			templates: {
				create: "sap/m/designtime/TabContainer.create.fragment.xml"
			}
		};

	});