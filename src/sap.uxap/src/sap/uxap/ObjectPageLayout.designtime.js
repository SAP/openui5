/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name : {
			singular : function(){
				return sap.uxap.i18nModel.getResourceBundle().getText("LAYOUT_CONTROL_NAME");
			},
			plural : function(){
				return sap.uxap.i18nModel.getResourceBundle().getText("LAYOUT_CONTROL__PLURAL");
			}
		},
		aggregations : {
			sections : {
				domRef : ":sap-domref > .sapUxAPObjectPageWrapper",
				childrenName : {
					singular : function(){
						return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
					},
					plural : function(){
						return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
					}
				},
				actions : {
					move : "moveElements",
					reveal : {
						changeType : "unstashControl"
					}
				}
			}
		},

		cloneDomRef : ":sap-domref > header"
	};

}, /* bExport= */ false);
