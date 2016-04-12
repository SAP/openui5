sap.ui.define(['jquery.sap.global', 'sap/ui/test/Opa5'], function ($, Opa5) {
	"use strict";


	QUnit.module("Launchers and teardown");

	QUnit.test("Should teardown a component", function(assert) {
		// System under Test
		var done = assert.async();
		var oOpa5 = new Opa5();
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			}
		});

		oOpa5.waitFor({
			success: function () {
				assert.ok($(".sapUiOpaComponent").is(":visible"), "Component is launched");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "Component is gone again");
			done();
		});
	});

	QUnit.test("Should teardown an IFrame", function(assert) {
		// System under Test
		var done = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.iStartMyAppInAFrame("../testdata/emptySite.html");

		oOpa5.waitFor({
			success: function () {
				assert.ok($(".opaFrame").is(":visible"), "IFrame is launched");
			}
		});

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue().done(function () {
			assert.ok(!$(".opaFrame").length, "IFrame is gone again");
			done();
		});
	});

	QUnit.module("Teardown - invalid invokations", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			this.clock.restore();
		}
	});

	QUnit.test("Should complain if nothing is launched", function (assert) {
		var oOpa5 = new Opa5();

		oOpa5.iTeardownMyApp();

		Opa5.emptyQueue();

		assert.throws(function () {
			this.clock.tick(500);
		}.bind(this), "A teardown was called but there was nothing to tear down");
	});
});