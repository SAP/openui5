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
				changeType : "stashControl",
				getState : function(oObjectPageSection) {
					return {
						control : oObjectPageSection,
						visible : oObjectPageSection.getVisible()
					};
				},
				restoreState : function(oObjectPageSection, oState) {
					oState.control.setVisible(oState.visible);
				}

			}
		}
	};

}, /* bExport= */ false);
