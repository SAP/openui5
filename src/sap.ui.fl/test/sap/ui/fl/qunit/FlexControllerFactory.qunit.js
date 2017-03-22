/*globals QUnit*/
jQuery.sap.require("sap.ui.fl.FlexControllerFactory");
jQuery.sap.require("sap.ui.fl.FlexController");

(function (FlexControllerFactory, FlexController) {
	'use strict';

	QUnit.module("sap.ui.fl.FlexControllerFactory", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("shall provide an API to create a FlexController", function (assert) {
		assert.strictEqual(typeof FlexControllerFactory.create, 'function');
	});

	QUnit.test("shall create a new FlexController", function (assert) {
		var oFlexController;

		//Call CUT
		oFlexController = FlexControllerFactory.create("myComponent");
		assert.ok(oFlexController);
	});

	QUnit.test("shall cache and reuse the created FlexController instances", function (assert) {
		var oFlexController1, oFlexController2;

		//Call CUT
		oFlexController1 = FlexControllerFactory.create("myComponent");
		oFlexController2 = FlexControllerFactory.create("myComponent");

		assert.strictEqual(oFlexController1, oFlexController2);
	});

}(sap.ui.fl.FlexControllerFactory, sap.ui.fl.FlexController));

