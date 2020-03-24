/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.tnt.NavigationListItem control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "ACTION"
			},
			actions: {
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapTntNavLIText")[0];
					}
				}
			},
			templates: {
				create: "sap/tnt/designtime/NavigationListItem.create.fragment.xml"
			}
		};
	});