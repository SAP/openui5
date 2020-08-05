sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(createAndAppendDiv, elementActionTest) {
	'use strict';
	createAndAppendDiv("content");

	// Remove and reveal actions
	var fnConfirmAvatarIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("avatar").getVisible(), false, "then the Avatar element is invisible");
	};

	var fnConfirmAvatarIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("avatar").getVisible(), true, "then the Avatar element is visible");
	};

	elementActionTest("Checking the remove action for Avatar", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f">"' +
		'<f:Avatar initials="NN" id="avatar" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "avatar"
		},
		afterAction: fnConfirmAvatarIsInvisible,
		afterUndo: fnConfirmAvatarIsVisible,
		afterRedo: fnConfirmAvatarIsInvisible
	});

	elementActionTest("Checking the reveal action for Avatar", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f">"' +
		'<f:Avatar initials="NN" id="avatar" visible="false" />' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "avatar"
		},
		afterAction: fnConfirmAvatarIsVisible,
		afterUndo: fnConfirmAvatarIsInvisible,
		afterRedo: fnConfirmAvatarIsVisible
	});

});