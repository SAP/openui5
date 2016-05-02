/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Panel control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations: {
			headerToolbar: {
				domRef: ":sap-domref > .sapMPanelHdr, :sap-domref > .sapUiDtEmptyHeader"
			},
			infoToolbar: {
				domRef: ":sap-domref > .sapUiDtEmptyInfoToolbar"
			},
			content: {
				domRef: ".sapMPanelContent",
				show: function () {
					this.setExpanded(true);
				}
			}
		}
	};

}, /* bExport= */ false);
