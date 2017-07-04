/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSection control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name : {
			singular : function(){
				return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
			},
			plural : function(){
				return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
			}
		},
		actions : {
			remove : {
				changeType : "stashControl"
			},
			reveal : {
				changeType : "unstashControl"
			},
			rename: function () {
				return {
					changeType: "rename",
					domRef: ".sapUxAPObjectPageSectionTitle"
				};
			}
		},
		aggregations: {
			subSections: {
				domRef : ":sap-domref .sapUxAPObjectPageSectionContainer",
				actions : {
					move: {
						changeType: "moveControls"
					}
				}
			}
		}
	};

}, /* bExport= */ false);
