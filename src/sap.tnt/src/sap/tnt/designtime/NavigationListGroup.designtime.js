/*!
 * ${copyright}
 */

// Provides the design time metadata for the sap.tnt.NavigationListItem control
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
						return oControl.$().find(".sapTntNLGroupText")[0];
					}
				}
			},
			templates: {
				create: "sap/tnt/designtime/NavigationListGroup.create.fragment.xml"
			}
		};
	});