/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.IconTabBar control
sap.ui.define([],
	function () {
		"use strict";

		return {
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
			}
		};

	}, /* bExport= */ false);
