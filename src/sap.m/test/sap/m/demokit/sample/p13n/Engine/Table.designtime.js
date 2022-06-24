/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define(["sap/m/p13n/Engine"],
	function(Engine) {
		"use strict";

		return {
			actions: {
                settings: function () {
                    return {
                        handler: function (oControl, mPropertyBag) {
                            return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, ["Columns", "Sorter", "Groups"]);
                        }
                    };
                }
            }
		};
	});