/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Bar control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations: {
			contentLeft: {
				domRef: ":sap-domref > .sapMBarLeft",
				actions: {
					move: "moveElements"
				}
			},
			contentMiddle: {
				domRef: ":sap-domref > .sapMBarMiddle > .sapMBarPH",
				actions: {
					move: "moveElements"
				}
			},
			contentRight: {
				domRef: ":sap-domref > .sapMBarRight",
				actions: {
					move: "moveElements"
				}
			}
		}
	};

}, /* bExport= */ false);
