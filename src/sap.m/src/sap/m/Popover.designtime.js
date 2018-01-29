/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Popover control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				content: {
					domRef: ":sap-domref > .sapMPopoverCont > .sapMPopoverScroll",
					actions: {
						move: "moveControls"
					}
				},
				customHeader: {
					domRef: ":sap-domref > .sapMPopoverHeader"
				},
				subHeader: {
					domRef: ":sap-domref > .sapMPopoverSubHeader"
				},
				footer: {
					domRef: ":sap-domref > .sapMPopoverFooter"
				},
				beginButton: {
					domRef: ":sap-domref > header.sapMPopoverHeader .sapMBarLeft"
				},
				endButton: {
					domRef: ":sap-domref > header.sapMPopoverHeader .sapMBarRight"
				}
			}
		};

	}, /* bExport= */ false);
