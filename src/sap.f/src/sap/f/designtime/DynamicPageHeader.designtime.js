/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.DynamicPageHeader control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			content : {
				domRef :  ":sap-domref .sapFDynamicPageHeaderContent",
				actions : {
					move : {
						changeType : "moveControls"
					}
				}
			}
		},
		actions : {
			remove : {
				changeType : "hideControl"
			},
			reveal : {
				changeType : "unhideControl"
			}
		},
		name: {
			singular: "DYNAMIC_PAGE_HEADER_NAME",
			plural: "DYNAMIC_PAGE_HEADER_NAME_PLURAL"
		}
	};

});
