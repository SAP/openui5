sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(createAndAppendDiv, elementActionTest) {
	'use strict';

	createAndAppendDiv("content");

	var listItem = "m:StandardListItem";

	// Remove and reveal actions
	var fnConfirmListItemIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("listItem1").getVisible(), false, "then the StandardListItem is invisible");
	};

	var fnConfirmListItemIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("listItem1").getVisible(), true, "then the StandardListItem is visible");
	};


	elementActionTest("Checking the remove action for " + listItem, {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:List id="list">' +
			'<' + listItem + ' id="listItem1" title="Item"/>' +
			'<' + listItem + ' id="listItem2" title="Item"/>' +
			'<' + listItem + ' id="listItem3" title="Item"/>' +
		'</m:List>' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "listItem1"
		},
		afterAction: fnConfirmListItemIsInvisible,
		afterUndo: fnConfirmListItemIsVisible,
		afterRedo: fnConfirmListItemIsInvisible
	});

	elementActionTest("Checking the reveal action for " + listItem, {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
		'<m:List id="list">' +
			'<' + listItem + ' id="listItem1" title="Item" visible="false"/>' +
			'<' + listItem + ' id="listItem2" title="Item"/>' +
			'<' + listItem + ' id="listItem3" title="Item"/>' +
		'</m:List>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "listItem1"
		},
		afterAction: fnConfirmListItemIsVisible,
		afterUndo: fnConfirmListItemIsInvisible,
		afterRedo: fnConfirmListItemIsVisible
	});

});