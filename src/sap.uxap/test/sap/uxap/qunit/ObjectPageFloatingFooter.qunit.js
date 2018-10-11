/*global QUnit, sinon*/
sap.ui.define(["sap/ui/thirdparty/jquery",
               "sap/ui/core/Core",
               "sap/ui/core/mvc/Controller",
               "sap/ui/core/mvc/XMLView",
               "sap/uxap/ObjectPageLayout"],
function (jQuery, Core, controller, xmlview, ObjectPageLayout) {
	"use strict";

	controller.create({ name: "viewController" });

	QUnit.module("ObjectPage - Rendering - Footer Visibility", {
		beforeEach: function (assert) {
			var done = assert.async();
			xmlview.create({
				id: "UxAP-162_ObjectPageSample",
				viewName: "view.UxAP-162_ObjectPageSample"
			}).then(function (oView) {
				this.objectPageSampleView = oView;
				sinon.config.useFakeTimers = true;
				this.objectPageSampleView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.oObjectPage = this.objectPageSampleView.byId("objectPage162");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPage Footer rendered correctly", function (assert) {
		var $footerWrapper = this.oObjectPage.$("footerWrapper"),
			oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$();

		assert.ok($footer.length, "The footer is rendered");
		assert.ok($footerWrapper.length, "The footer wrapper is rendered");

		this.oObjectPage.setShowFooter(true);

	});

	QUnit.test("ObjectPage Footer visibility", function (assert) {
		var $footerWrapper = this.oObjectPage.$("footerWrapper"),
			oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$();

		assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible initially");
		this.oObjectPage.setShowFooter(true);

		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "Footer is visible");
		assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterShow"));
		this.oObjectPage.setShowFooter(false);

		Core.applyChanges();
		this.clock.tick(1000);

		assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible");
		assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterHide"));

		this.oObjectPage.setShowFooter(true);

		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "Footer is visible again");
		assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterShow"));
	});

	QUnit.test("ObjectPage Footer is visible after setting to false and then to true consecutively", function (assert) {
		var $footerWrapper = this.oObjectPage.$("footerWrapper");

		this.oObjectPage.setShowFooter(false);
		this.oObjectPage.setShowFooter(true);

		this.clock.tick(1000);

		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "Footer is visible");
	});

	QUnit.test("Animation CSS class is removed after the animation is over", function (assert) {
		var oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$(),
			iSomeMsBeforeAnimationEnd = 20;

		this.oObjectPage.setShowFooter(true);

		this.clock.tick(ObjectPageLayout.FOOTER_ANIMATION_DURATION - iSomeMsBeforeAnimationEnd);
		assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterShow"), "Animation CSS class is still there while animation is running");

		this.clock.tick(iSomeMsBeforeAnimationEnd + 1);
		assert.ok(!$footer.hasClass("sapUxAPObjectPageFloatingFooterShow"), "Animation CSS class is removed");
	});

});
