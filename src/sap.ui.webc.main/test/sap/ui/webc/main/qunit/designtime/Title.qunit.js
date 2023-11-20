sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmTitleIsRenamedWithNewValue = function (oTitle, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title").getText(),
			"New Title",
			"then the control has been renamed to the new value (New Title)");
	};

	var fnConfirmTitleIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title").getText(),
			"Title",
			"then the control has been renamed to the old value (Title)");
	};

	// Remove and reveal actions
	var fnConfirmTitleIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title").getVisible(), false, "then the title element is invisible");
	};

	var fnConfirmTitleIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title").getVisible(), true, "then the title element is visible");
	};

	elementActionTest("Checking the remove action for Title", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Title id="title" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "title"
		},
		afterAction: fnConfirmTitleIsInvisible,
		afterUndo: fnConfirmTitleIsVisible,
		afterRedo: fnConfirmTitleIsInvisible
	});

	elementActionTest("Checking the rename action for a Title", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Title text="Title" id="title" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "title",
			parameter: function (oView) {
				return {
					newValue: 'New Title',
					renamedElement: oView.byId("title")
				};
			}
		},
		afterAction: fnConfirmTitleIsRenamedWithNewValue,
		afterUndo: fnConfirmTitleIsRenamedWithOldValue,
		afterRedo: fnConfirmTitleIsRenamedWithNewValue
	});
});