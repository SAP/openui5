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
				domRef : function(oElement) {
					var aSections = oElement.getSections();
					var bSectionsVisible = aSections.some(function(oSection) {
						return oSection.getVisible();
					});

					if (bSectionsVisible) {
						return oElement.$("opwrapper").get(0);
					} else {
						return oElement.$("sectionsContainer").get(0);
					}
				},
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
