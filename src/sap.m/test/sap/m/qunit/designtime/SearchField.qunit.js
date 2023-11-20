sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function (createAndAppendDiv, elementActionTest) {
	'use strict';
	createAndAppendDiv("content");

	// Remove and reveal actions
	var fnConfirmSearchFieldIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("searchField").getVisible(), false, "then the SearchField element is invisible");
	};

	var fnConfirmSearchFieldIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("searchField").getVisible(), true, "then the SearchField element is visible");
	};

	elementActionTest("Checking the remove action for SearchField", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:SearchField id="searchField" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "searchField"
		},
		afterAction: fnConfirmSearchFieldIsInvisible,
		afterUndo: fnConfirmSearchFieldIsVisible,
		afterRedo: fnConfirmSearchFieldIsInvisible
	});

	elementActionTest("Checking the reveal action for SearchField", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:SearchField id="searchField" visible="false" />' +
			'</mvc:View>',
		action: {
			name: "reveal",
			controlId: "searchField"
		},
		afterAction: fnConfirmSearchFieldIsVisible,
		afterUndo: fnConfirmSearchFieldIsInvisible,
		afterRedo: fnConfirmSearchFieldIsVisible
	});

});