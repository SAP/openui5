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
				childNames : {
					singular : function(){
						return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
					},
					plural : function(){
						return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
					}
				},
				actions : {
					move : "moveControls"
				}
			},
			vScroll : {
				ignore: false,
				domRef : function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}
		},

		cloneDomRef : ":sap-domref > header"
	};

}, /* bExport= */ false);
