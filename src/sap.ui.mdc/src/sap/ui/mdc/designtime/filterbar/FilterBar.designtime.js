/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine"
], function (Engine) {
	"use strict";

	return {
		actions: {
			settings: function () {
				return {
					name: "filterbar.ADAPT_TITLE",
					handler: function (oControl, mPropertyBag) {
						//CHECK: move metadata finalizing to Engine?
						return oControl.initializedWithMetadata().then(function() {
							return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "Item");
						});
					}
				};
			}
		},
		aggregations: {
			layout: {
				ignore: true
			},
			basicSearchField: {
				ignore: true
			},
			filterItems: {
				ignore: true
			}
		},
		properties: {
			showAdaptFiltersButton: {
				ignore: false
			},
			showClearButton: {
				ignore: false
			},
			p13nMode: {
				ignore: false
			}
		}
	};
});
