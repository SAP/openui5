sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(QUnitUtils, createAndAppendDiv, elementActionTest) {
	'use strict';
	createAndAppendDiv("content");


	// Remove and reveal actions
	var fnConfirmInputIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("input").getVisible(), false, "then the InputBase element is invisible");
	};

	var fnConfirmInputIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("input").getVisible(), true, "then the InputBase element is visible");
	};

	elementActionTest("Checking the remove action for InputBase", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:InputBase id="input" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "input"
		},
		afterAction: fnConfirmInputIsInvisible,
		afterUndo: fnConfirmInputIsVisible,
		afterRedo: fnConfirmInputIsInvisible
	});

	elementActionTest("Checking the reveal action for an InputBase", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:InputBase id="input" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "input"
		},
		afterAction: fnConfirmInputIsVisible,
		afterUndo: fnConfirmInputIsInvisible,
		afterRedo: fnConfirmInputIsVisible
	});

});