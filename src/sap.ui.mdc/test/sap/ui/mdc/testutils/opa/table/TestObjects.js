/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Assertions"
], function(
	Opa5,
	p13nActions,
	p13nAssertions
) {
	"use strict";

	Opa5.createPageObjects({
		onTable: {
			actions: {
				iPersonalizeFilter: function(oControl, aSettings) {
					return p13nActions.iPersonalizeFilter.call(this, oControl, aSettings);
				},
				iPersonalizeGroup: function(oControl, aSettings) {
					return p13nActions.iPersonalizeGroup.call(this, oControl, aSettings);
				},
				iPersonalizeColumns: function(oControl, aItems) {
					return p13nActions.iPersonalizeColumns.call(this, oControl, aItems);
				},
				iPersonalizeSort: function(oControl, aSettings) {
					return p13nActions.iPersonalizeSort.call(this, oControl, aSettings);
				},
				iResetThePersonalization: function(oControl) {
					return p13nActions.iResetThePersonalization.call(this, oControl);
				}
            },
            assertions: {}
        }
    });

});
