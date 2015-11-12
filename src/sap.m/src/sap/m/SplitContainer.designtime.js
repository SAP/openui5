/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.SplitContainer control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			masterPages : {
				domRef : ":sap-domref > .sapMSplitContainerMaster"
			},
			detailPages : {
				domRef : ":sap-domref > .sapMSplitContainerDetail"
			}
		}
	};

}, /* bExport= */ false);