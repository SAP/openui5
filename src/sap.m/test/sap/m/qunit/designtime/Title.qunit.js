sap.ui.define([
	"sap/m/Title",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	Title,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Title",
			create: function () {
				return new Title();
			}
		});
	})
	.then(function() {
		// Rename action
		var fnConfirmTitleIsRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myTitle").getText(),
				"New Title",
				"then the control has been renamed to the new value (New Title)");
		};

		var fnConfirmTitleIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myTitle").getText(),
				"Test Title",
				"then the control has been renamed to the old value (Test Title)");
		};

		elementActionTest("Checking the rename action for a Title", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Title id="myTitle" text="Test Title" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "myTitle",
				parameter: function (oView) {
					return {
						newValue: "New Title",
						renamedElement: oView.byId("myTitle")
					};
				}
			},
			afterAction: fnConfirmTitleIsRenamedWithNewValue,
			afterUndo: fnConfirmTitleIsRenamedWithOldValue,
			afterRedo: fnConfirmTitleIsRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmTitleIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myTitle").getVisible(), false, "then the Title element is invisible");
		};

		var fnConfirmTitleIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myTitle").getVisible(), true, "then the Title element is visible");
		};

		elementActionTest("Checking the remove action for Title", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Title id="myTitle" text="Test Title" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myTitle"
			},
			afterAction: fnConfirmTitleIsInvisible,
			afterUndo: fnConfirmTitleIsVisible,
			afterRedo: fnConfirmTitleIsInvisible
		});

		elementActionTest("Checking the reveal action for a Title", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Title id="myTitle" text="Test Title" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myTitle"
			},
			afterAction: fnConfirmTitleIsVisible,
			afterUndo: fnConfirmTitleIsInvisible,
			afterRedo: fnConfirmTitleIsVisible
		});
	});
});