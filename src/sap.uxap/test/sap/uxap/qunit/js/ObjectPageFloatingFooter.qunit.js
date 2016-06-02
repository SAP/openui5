(function (QUnit, sinon, core, controller, xmlview) {
	sap.ui.require(["jquery.sap.global"], function (jQuery) {

		jQuery.sap.registerModulePath("view", "./view");

		controller("viewController", {});

		QUnit.module("ObjectPage - Rendering - Footer Visibility", {
			beforeEach: function () {
				this.objectPageSampleView = xmlview("UxAP-162_ObjectPageSample", {
					viewName: "view.UxAP-162_ObjectPageSample"
				});
				sinon.config.useFakeTimers = true;
				this.objectPageSampleView.placeAt("qunit-fixture");
				core.applyChanges();
				this.oObjectPage = this.objectPageSampleView.byId("objectPage162")
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

			core.applyChanges();
			this.clock.tick(1000);

			assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible");
			assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterHide"));

			this.oObjectPage.setShowFooter(true);

			assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "Footer is visible again");
			assert.ok($footer.hasClass("sapUxAPObjectPageFloatingFooterShow"));
		});
	});

}(QUnit, sinon, sap.ui.getCore(), sap.ui.controller, sap.ui.xmlview));
