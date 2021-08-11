/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine"
], function (Engine) {
	"use strict";

	return {
		actions: {
			settings: function () {
				return {
					name: "filterbar.ADAPT_TITLE",
					handler: function (oControl, mPropertyBag) {
						return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "Item");
					}
				};
			}
		}
	};
});
