/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Link control
sap.ui.define([], function() {
	"use strict";

	return {
		name : {
			singular : "LINK_NAME",
			plural : "LINK_NAME_PLURAL"
		},
		palette : {
			group : "ACTION",
			icons : {
				svg : "sap/m/designtime/Link.icon.svg"
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
		templates: {
			create: "sap/m/designtime/Link.create.fragment.xml"
		}
	};
}, /* bExport= */false);
