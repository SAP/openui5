sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmCarouselIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("carousel").getVisible(), false, "then the carousel element is invisible");
	};

	var fnConfirmCarouselIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("carousel").getVisible(), true, "then the carousel element is visible");
	};

	elementActionTest("Checking the remove action for Carousel", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Carousel id="carousel" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "carousel"
		},
		afterAction: fnConfirmCarouselIsInvisible,
		afterUndo: fnConfirmCarouselIsVisible,
		afterRedo: fnConfirmCarouselIsInvisible
	});
});