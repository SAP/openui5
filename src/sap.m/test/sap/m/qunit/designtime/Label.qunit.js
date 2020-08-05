sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(QUnitUtils, createAndAppendDiv, elementActionTest) {
	'use strict';
	createAndAppendDiv("content");


	// Rename action
	var fnConfirmLabelIsRenamedWithNewValue = function (oLabel, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getText(),
			"New Value",
			"then the control has been renamed to the new value (New Value)");
	};

	var fnConfirmLabelIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getText(),
			"Label 1",
			"then the control has been renamed to the old value (Label 1)");
	};

	elementActionTest("Checking the rename action for a Label", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:Label text="Label 1" id="label" />' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "label",
			parameter: function (oView) {
				return {
					newValue: 'New Value',
					renamedElement: oView.byId("label")
				};
			}
		},
		previousActions: [
			{
				name: "rename",
				controlId: "label",
				parameter: function (oView) {
					return {
						newValue: 'Intermediate Value',
						renamedElement: oView.byId("label")
					};
				}
			}
		],
		changesAfterCondensing: 1,
		afterAction: fnConfirmLabelIsRenamedWithNewValue,
		afterUndo: fnConfirmLabelIsRenamedWithOldValue,
		afterRedo: fnConfirmLabelIsRenamedWithNewValue
	});

	// Remove and reveal actions
	var fnConfirmLabelIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getVisible(), false, "then the Label element is invisible");
	};

	var fnConfirmLabelIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getVisible(), true, "then the Label element is visible");
	};

	elementActionTest("Checking the remove action for Label", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:Label text="Label 1" id="label" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "label",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("label")
				};
			}
		},
		previousActions: [
			{
				name: "remove",
				controlId: "label",
				parameter: function(oView) {
					return {
						removedElement: oView.byId("label")
					};
				}
			},
			{
				name: "reveal",
				controlId: "label",
				parameter: function() {
					return {
					};
				}
			}
		],
		changesAfterCondensing: 1,
		afterAction: fnConfirmLabelIsInvisible,
		afterUndo: fnConfirmLabelIsVisible,
		afterRedo: fnConfirmLabelIsInvisible
	});

	elementActionTest("Checking the reveal action for a Label", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:Label text="Label 1" id="label" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "label",
			parameter: function(){
				return {};
			}
		},
		previousActions: [
			{
				name: "reveal",
				controlId: "label",
				parameter: function() {
					return {
					};
				}
			},
			{
				name: "remove",
				controlId: "label",
				parameter: function(oView) {
					return {
						removedElement: oView.byId("label")
					};
				}
			}
		],
		changesAfterCondensing: 1,
		afterAction: fnConfirmLabelIsVisible,
		afterUndo: fnConfirmLabelIsInvisible,
		afterRedo: fnConfirmLabelIsVisible
	});

});