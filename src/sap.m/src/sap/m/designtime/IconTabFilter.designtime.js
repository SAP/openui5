/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.IconTabBar control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/m/designtime/IconTabFilter.icon.svg"
				}
			},
			actions: {
				rename: function (oPage) {
					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.$().find(".sapMITBText")[0];
						}
					};
				}
			}
		};

	}, /* bExport= */ false);
