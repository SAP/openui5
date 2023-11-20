sap.ui.define([
	"sap/m/StandardListItem",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	StandardListItem,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.StandardListItem",
			create: function () {
				return new StandardListItem({
					title: "Title"
				});
			}
		});
	})
	.then(function() {
		// Rename action
		var fnConfirmTitleIsRenamedWithNewValue = function (oStandardListItem, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getTitle(),
				"New Title",
				"then the control has been renamed to the new value (New Title)");
		};

		var fnConfirmTitleIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getTitle(),
				"Initial Title",
				"then the control has been renamed to the old value (Initial Title)");
		};

		elementActionTest("Checking the rename action for a StandardListItem", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:List id="list">' +
			'<m:StandardListItem id="listItem1" title="Initial Title"/>' +
			'<m:StandardListItem id="listItem2" title="Item"/>' +
			'<m:StandardListItem id="listItem3" title="Item"/>' +
			'</m:List>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "listItem1",
				parameter: function (oView) {
					return {
						newValue: 'New Title',
						renamedElement: oView.byId("listItem1")
					};
				}
			},
			afterAction: fnConfirmTitleIsRenamedWithNewValue,
			afterUndo: fnConfirmTitleIsRenamedWithOldValue,
			afterRedo: fnConfirmTitleIsRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmStandardListItemIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getVisible(), false, "then the StandardListItem element is invisible");
		};

		var fnConfirmStandardListItemIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getVisible(), true, "then the StandardListItem element is visible");
		};

		elementActionTest("Checking the remove action for a StandardListItem", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:List id="list">' +
			'<m:StandardListItem id="listItem1" title="Item"/>' +
			'<m:StandardListItem id="listItem2" title="Item"/>' +
			'<m:StandardListItem id="listItem3" title="Item"/>' +
			'</m:List>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "listItem1"
			},
			afterAction: fnConfirmStandardListItemIsInvisible,
			afterUndo: fnConfirmStandardListItemIsVisible,
			afterRedo: fnConfirmStandardListItemIsInvisible
		});

		elementActionTest("Checking the reveal action for a StandardListItem", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:List id="list">' +
			'<m:StandardListItem id="listItem1" title="Item" visible="false"/>' +
			'<m:StandardListItem id="listItem2" title="Item"/>' +
			'<m:StandardListItem id="listItem3" title="Item"/>' +
			'</m:List>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "listItem1"
			},
			afterAction: fnConfirmStandardListItemIsVisible,
			afterUndo: fnConfirmStandardListItemIsInvisible,
			afterRedo: fnConfirmStandardListItemIsVisible
		});
	});
});