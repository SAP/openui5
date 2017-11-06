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
					svg: "sap/m/designtime/IconTabBar.icon.svg"
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref > .sapMITH > .sapMITBScrollContainer > .sapMITBHead",
					actions: {
						move: "moveControls"
					}
				},
				content: {
					domRef: ":sap-domref > .sapMITBContainerContent > .sapMITBContent",
					actions: {
						move: "moveControls"
					}
				}
			},
			templates: {
				create: "sap/m/designtime/IconTabBar.create.fragment.xml"
			}
		};

	}, /* bExport= */ false);
