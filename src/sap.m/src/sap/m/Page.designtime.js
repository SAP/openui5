/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Page control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			headerContent : {
				domRef : ":sap-domref .sapMBarRight"
			},
			subHeader : {
				domRef : ":sap-domref .sapMPageSubHeader"
			},
			customHeader : {
				domRef : ":sap-domref .sapMPageHeader"
			},
			content : {
				domRef : ":sap-domref > section"
			},
			footer : {
				domRef : ":sap-domref .sapMPageFooter"
			},
			landmarkInfo : {
				ignore : true
			}
		}
	};

}, /* bExport= */ false);
