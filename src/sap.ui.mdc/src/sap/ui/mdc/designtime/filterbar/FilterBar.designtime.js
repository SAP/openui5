/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.mdc.FilterBar control
sap.ui.define([], function() {
	"use strict";

	return {
		actions: {
			settings: function () {
				return {
					handler: function (oControl, mPropertyBag) {
						return oControl.getRTASettingsActionHandler(mPropertyBag);
					}
				};
			}
		}
	};
});
