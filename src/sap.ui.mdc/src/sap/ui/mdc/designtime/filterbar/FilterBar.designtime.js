/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine"
], (Engine) => {
	"use strict";

	return {
		actions: {
			settings: {
                "sap.ui.mdc": function(oControl) {
                    const bImplicitPersistence = Engine.getInstance()._determineModification(oControl).payload.hasPP;
                    return {
                        name: "filterbar.ADAPT_TITLE",
                        handler: function (oControl, mPropertyBag) {
                            //CHECK: move metadata finalizing to Engine?
                            return oControl.initializedWithMetadata().then(() => {
                                return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "Item");
                            });
                        },
                        CAUTION_variantIndependent: bImplicitPersistence
                    };
                }
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