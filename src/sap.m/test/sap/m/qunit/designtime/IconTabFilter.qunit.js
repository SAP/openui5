sap.ui.define([
	"sap/m/IconTabFilter",
	"sap/m/Button",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	IconTabFilter,
	Button,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.IconTabFilter",
			create: function () {
				return new IconTabFilter({
					text: "Old Text"
				});
			}
		});
	})
	.then(function() {
		// Rename title action module
		var fnConfirmFilterTextRenamedWithNewValue = function (oRadioButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("filter").getText(),
				"New Text",
				"then the filter title has been renamed to the new value (New Text)");
		};

		var fnConfirmFilterTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("filter").getText(),
				"Old Text",
				"then the filter title has been renamed to the old value (Old Text)");
		};

		elementActionTest("Checking the rename action for a IconTabFilter title", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<IconTabBar id="bar">' +
						'<items>' +
							'<IconTabFilter id="filter" text="Old Text" />' +
						'</items>' +
					'</IconTabBar>' +
				'</mvc:View>',
			action: {
				name: "rename",
				controlId: "filter",
				parameter: function (oView) {
					return {
						newValue: "New Text",
						renamedElement: oView.byId("filter")
					};
				}
			},
			afterAction: fnConfirmFilterTextRenamedWithNewValue,
			afterUndo: fnConfirmFilterTextIsRenamedWithOldValue,
			afterRedo: fnConfirmFilterTextRenamedWithNewValue
		});
	});

});