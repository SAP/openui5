(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/IconTabFilter",
		"sap/m/Button",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, IconTabFilter, Button, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.IconTabFilter",
			create: function () {
				return new IconTabFilter({
					text: "Old Text"
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

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

		rtaControlEnablingCheck("Checking the rename action for a IconTabFilter title", {
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
})();