/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Popover control
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				rename: function (oPopover) {
					// When a custom header is added the title is not visualized and we do not need a rename action.
					if (oPopover.getCustomHeader()) {
						return;
					}
					return {
						changeType: "rename",
						domRef: function (oPopover) {
							return oPopover.getDomRef("title");
						}
					};
				}
			},
			aggregations: {
				content: {
					domRef: ":sap-domref > .sapMPopoverWrapper > .sapMPopoverCont",
					actions: {
						move: "moveControls"
					}
				},
				customHeader: {
					domRef: ":sap-domref > .sapMPopoverWrapper > .sapMPopoverHeader"
				},
				subHeader: {
					domRef: ":sap-domref > .sapMPopoverWrapper > .sapMPopoverSubHeader"
				},
				footer: {
					domRef: ":sap-domref > .sapMPopoverWrapper > .sapMPopoverFooter"
				},
				beginButton: {
					domRef: ":sap-domref > .sapMPopoverWrapper > header.sapMPopoverHeader .sapMBarLeft"
				},
				endButton: {
					domRef: ":sap-domref > .sapMPopoverWrapper > header.sapMPopoverHeader .sapMBarRight"
				}
			}
		};

	});