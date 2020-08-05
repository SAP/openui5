/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.SplitContainer control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name: {
			singular: "SPLIT_CONTAINER_NAME",
			plural: "SPLIT_CONTAINER_NAME_PLURAL"
		},
		palette: {
			group: "CONTAINER"
		},
		aggregations : {
			masterPages : {
				domRef : ":sap-domref > .sapMSplitContainerMaster, :sap-domref > .sapMSplitContainerMobile"
			},
			detailPages : {
				domRef : ":sap-domref > .sapMSplitContainerDetail"
			}
		}
	};

});