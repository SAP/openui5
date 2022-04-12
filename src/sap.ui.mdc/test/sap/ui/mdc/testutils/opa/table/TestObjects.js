/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Assertions",
	"./Actions"
], function(
	Opa5,
	p13nActions,
	p13nAssertions,
	TableActions
) {
	"use strict";

	Opa5.createPageObjects({
		onTable: {
			actions: {
				iPersonalizeFilter: function(oControl, aSettings) {
					return p13nActions.iPersonalizeFilter.call(this, oControl, aSettings, TableActions.iOpenThePersonalizationDialog);
				},
				iPersonalizeGroup: function(oControl, aSettings) {
					return p13nActions.iPersonalizeGroup.call(this, oControl, aSettings, TableActions.iOpenThePersonalizationDialog);
				},
				iPersonalizeColumns: function(oControl, aItems) {
					return p13nActions.iPersonalizeColumns.call(this, oControl, aItems, TableActions.iOpenThePersonalizationDialog);
				},
				iPersonalizeSort: function(oControl, aSettings) {
					return p13nActions.iPersonalizeSort.call(this, oControl, aSettings, TableActions.iOpenThePersonalizationDialog);
				},
				iResetThePersonalization: function(oControl) {
					return p13nActions.iResetThePersonalization.call(this, oControl, TableActions.iOpenThePersonalizationDialog);
				}
            },
            assertions: {}
        }
    });

});
