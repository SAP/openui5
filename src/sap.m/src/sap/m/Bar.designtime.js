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
				domRef: ":sap-domref > .sapMBarLeft"
			},
			contentMiddle: {
				domRef: ":sap-domref > .sapMBarMiddle > .sapMBarPH"
			},
			contentRight: {
				domRef: ":sap-domref > .sapMBarRight"
			}
		}
	};

}, /* bExport= */ false);
