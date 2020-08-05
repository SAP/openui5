/*
 * ! ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	return {
		name: "{name}",
		description: "{description}",
		actions: {
			settings: function () {
				//RTA expects the settings to be returned as function
				return {
					handler: function (oControl, mPropertyBag) {
						return oControl.getRTASettingsActionHandler(mPropertyBag);
					}
				};
			}
		}
	};

});
