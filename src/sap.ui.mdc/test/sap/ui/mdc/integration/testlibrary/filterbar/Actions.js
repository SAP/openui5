/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./waitForAdaptFiltersButton"
], function(
	Opa5,
	Press,
	waitForAdaptFiltersButton
) {
    "use strict";

    return {

		iChangeAdaptFiltersView: function(sViewMode) {
			return this.waitFor({
				controlType: "sap.ui.mdc.p13n.panels.AdaptFiltersPanel",
				matchers: {
					ancestor: {
						controlType: "sap.ui.mdc.filterbar.FilterBarBase"
					}
				},
				success:function(aGroupPanelBase) {
					Opa5.assert.equal(aGroupPanelBase.length, 1, "Adapt Filters Panel found");
					aGroupPanelBase[0].switchView(sViewMode);
				}
			});
		},

		iPressOnTheAdaptFiltersButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				actions: new Press(),
				success: function onAdaptFiltersButtonFound(oAdaptFiltersButton) {
					Opa5.assert.ok(true, 'The "Adapt Filters" button was pressed');
				}
			});
		}
    };
});
