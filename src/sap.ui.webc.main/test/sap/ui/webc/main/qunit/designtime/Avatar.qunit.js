sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmAvatarIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("avatar").getVisible(), false, "then the avatar element is invisible");
	};

	var fnConfirmAvatarIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("avatar").getVisible(), true, "then the avatar element is visible");
	};

	elementActionTest("Checking the remove action for Avatar", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Avatar id="avatar" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "avatar"
		},
		afterAction: fnConfirmAvatarIsInvisible,
		afterUndo: fnConfirmAvatarIsVisible,
		afterRedo: fnConfirmAvatarIsInvisible
	});
});