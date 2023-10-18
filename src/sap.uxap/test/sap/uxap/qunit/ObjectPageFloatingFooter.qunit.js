/*global QUnit*/
sap.ui.define(["sap/ui/core/Core",
               "sap/ui/core/Configuration",
               "sap/ui/core/mvc/XMLView",
			   "sap/m/OverflowToolbar",
			   "sap/m/HBox",
               "sap/uxap/ObjectPageLayout",
			   "sap/uxap/ObjectPageSection",
			   "sap/uxap/ObjectPageSubSection"],
function (Core, Configuration, XMLView, OverflowToolbar, HBox, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection) {
	"use strict";

	QUnit.module("ObjectPage - Rendering - Footer Visibility", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-162_ObjectPageSample",
				viewName: "view.UxAP-162_ObjectPageSample"
			}).then(function (oView) {
				this.objectPageSampleView = oView;
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
		// Arrange
		var $footerWrapper = this.oObjectPage._$footerWrapper,
			oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$();

		// Assert
		assert.ok($footer.length, "The footer is rendered");
		assert.ok($footerWrapper.length, "The footer wrapper is rendered");
	});

	QUnit.test("ObjectPage Footer visibility", function (assert) {
		// Arrange
		var $footerWrapper = this.oObjectPage._$footerWrapper,
			oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$();

		// Assert
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible initially");

		// Act - Trigger show animation
		this.oObjectPage.setShowFooter(true);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the beginning of the show animation.");
		assert.ok($footer.hasClass(ObjectPageLayout.SHOW_FOOTER_CLASS_NAME),
		"Footer has the " + ObjectPageLayout.SHOW_FOOTER_CLASS_NAME + " CSS class at the beginning of the show animation");

		// Act - Simulate end of animation
		this.oObjectPage._onToggleFooterAnimationEnd(oFooter);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the end of the show animation.");

		// Act - Trigger hide animation
		this.oObjectPage.setShowFooter(false);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the beginning of the hide animation.");
		assert.ok($footer.hasClass(ObjectPageLayout.HIDE_FOOTER_CLASS_NAME),
		"Footer has the " + ObjectPageLayout.HIDE_FOOTER_CLASS_NAME + " CSS class at the beginning of the hide animation");

		// Act - Simulate end of animation
		this.oObjectPage._onToggleFooterAnimationEnd(oFooter);

		// Assert
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible at the end of the hide animation.");
	});

	QUnit.test("ObjectPage Footer is visible after setting to false and then to true consecutively", function (assert) {
		// Arrange
		var $footerWrapper = this.oObjectPage._$footerWrapper;

		// Act
		this.oObjectPage.setShowFooter(false);
		this.oObjectPage.setShowFooter(true);

		// Assert
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "Footer is visible");
	});

	QUnit.test("Animation CSS class is removed after the animation is over", function (assert) {
		// Arrange
		var oFooter = this.oObjectPage.getFooter(),
			$footer = oFooter.$();

		// Act
		this.oObjectPage.setShowFooter(true);
		this.oObjectPage._onToggleFooterAnimationEnd(oFooter); // Simulate end of animation

		// Assert
		assert.notOk($footer.hasClass(ObjectPageLayout.SHOW_FOOTER_CLASS_NAME),
		"Footer hasn't applied " + ObjectPageLayout.SHOW_FOOTER_CLASS_NAME + " CSS class at end of the show animation");

		// Act
		this.oObjectPage.setShowFooter(false);
		this.oObjectPage._onToggleFooterAnimationEnd(oFooter); // Simulate end of animation

		// Assert
		assert.notOk($footer.hasClass(ObjectPageLayout.HIDE_FOOTER_CLASS_NAME),
		"Footer hasn't applied " + ObjectPageLayout.HIDE_FOOTER_CLASS_NAME + " CSS class at end of the hide animation");
	});

	QUnit.test("Footer is toggled when animations disabled", function (assert) {
		// Arrange
		var $footerWrapper = this.oObjectPage._$footerWrapper,
			sOriginalMode = Core.getConfiguration().getAnimationMode();

		//setup
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.none);

		// Act: toggle to 'true'
		this.oObjectPage.setShowFooter(true);
		// Check
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "footer is shown");

		// Act: toggle to 'false'
		this.oObjectPage.setShowFooter(false);
		// Check
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "footer is hidden");

		// Clean up
		Core.getConfiguration().setAnimationMode(sOriginalMode);
	});

	QUnit.test("Footer is toggled when animations are set to 'minimal'", function (assert) {
		// Arrange
		var $footerWrapper = this.oObjectPage._$footerWrapper,
			sOriginalMode = Core.getConfiguration().getAnimationMode();

		//setup
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.minimal);

		// Act: toggle to 'true'
		this.oObjectPage.setShowFooter(true);

		// Check
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "footer is shown");

		// Act: toggle to 'false'
		this.oObjectPage.setShowFooter(false);

		// Check
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "footer is hidden");

		// Clean up
		Core.getConfiguration().setAnimationMode(sOriginalMode);
	});

	QUnit.test("ObjectPage floating footer animation is forced to end in case of a sudden invalidate", function (assert) {
		// Act
		this.oObjectPage.invalidate();
		this.oObjectPage.invalidate();

		// Assert
		assert.equal(!this.oObjectPage._bIsFooterAanimationGoing, true, "Footer is visible");
	});

	QUnit.test("When footer is visible, CSS class is applied to the ObjectPageLayout", function (assert) {
		// Assert - when footer is not visible, CSS class is not applied
		assert.notOk(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutFooterVisible"), "ObjectPage does not have CSS class");
		assert.strictEqual(this.oObjectPage._$opWrapper.css("scroll-padding-bottom"), "auto", "No scroll padding bottom on the wrapper");

		// Act - toggle to 'true'
		this.oObjectPage.setShowFooter(true);

		// Assert - when footer is visible, CSS class is applied
		assert.ok(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutFooterVisible"), "ObjectPage has CSS class");
		assert.strictEqual(this.oObjectPage._$opWrapper.css("scroll-padding-bottom"), "58px", "58px scroll padding bottom on the wrapper");
	});

	QUnit.module("ObjectPage - Setter");

	QUnit.test("Setting 'footer' aggregation and 'showFooter' property", function (assert) {
		// Arrange
		var oObjectPage = new ObjectPageLayout({
			sections: [new ObjectPageSection({
				subSections: [new ObjectPageSubSection({
					blocks: [new HBox({
						height: "2000px"
					})]
				})]
			})]
		}),
		fnDone = assert.async();

		oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.expect(1);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			oObjectPage.addEventDelegate({
				onAfterRendering: function () {
					// Assert
					assert.ok(true, "No error is thrown");

					oObjectPage.destroy();
					fnDone();
				}
			});

			// Act
			oObjectPage.setShowFooter(true);
			oObjectPage.setFooter(new OverflowToolbar());
			Core.applyChanges();
		});
	});

});
