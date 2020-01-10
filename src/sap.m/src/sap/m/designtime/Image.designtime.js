/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Image control
sap.ui.define([], function() {
	"use strict";

	return {
		name : {
			singular : "IMAGE_NAME",
			plural : "IMAGE_NAME_PLURAL"
		},
		palette : {
			group : "DISPLAY",
			icons : {
				svg : "sap/m/designtime/Image.icon.svg"
			}
		},
		aggregations : {
			detailBox : {
				ignore : true
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
			create: "sap/m/designtime/Image.create.fragment.xml"
		}
	};
});