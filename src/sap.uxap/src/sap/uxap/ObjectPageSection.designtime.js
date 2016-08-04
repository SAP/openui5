/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSection control
sap.ui.define([],
	function() {
	"use strict";

	return {
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
