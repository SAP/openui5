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
					domRef: ":sap-domref > .sapMPopoverCont",
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

	});