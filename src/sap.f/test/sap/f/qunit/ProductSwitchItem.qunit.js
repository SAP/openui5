/*global QUnit*/
sap.ui.define(["sap/ui/core/Core", "sap/f/ProductSwitchItem", "sap/ui/qunit/QUnitUtils", "sap/ui/events/KeyCodes"],
	function (Core, ProductSwitchItem, QUnitUtils, KeyCodes) {
		"use strict";

		var TESTS_DOM_CONTAINER = "qunit-fixture",
			oUtil = {
				getProductSwitchItem: function () {
					return new ProductSwitchItem();
				}
			};

		QUnit.module("ProductSwitchItem - API ", {
			beforeEach: function () {
				this.oProductSwitchItem = oUtil.getProductSwitchItem();
				this.oProductSwitchItem.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oProductSwitchItem.destroy();
				this.oProductSwitchItem = null;
			}
		});

		QUnit.test("Instantiation", function (assert) {
			assert.ok(this.oProductSwitchItem, "The ProductSwitchitem is instantiated successfully");
		});

		QUnit.test("src property", function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getSrc(), "", "Default value is set");

			this.oProductSwitchItem.setSrc("sap-icon://home");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getSrc(), "sap-icon://home", "Value of the src property is successfully changed");
			assert.strictEqual(this.oProductSwitchItem._getIcon().getSrc(), this.oProductSwitchItem.getSrc(), "Src value is successfully forwarded to the internal aggregation");

			this.oProductSwitchItem.setSrc(null);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getSrc(), "", "Value of the src property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getIcon().getSrc(), "", "Src value is successfully forwarded to the internal aggregation");
		});

		QUnit.test("title property", function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTitle(), "", "Default value is set");

			this.oProductSwitchItem.setTitle("Test title");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTitle(), "Test title", "Value of the title property is changed");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getText(), this.oProductSwitchItem.getTitle(), "Title value is successfully forwarded to the internal aggregation");

			this.oProductSwitchItem.setSubTitle("Test subtitle");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 1, "Value of maxLines property of the internal aggregation _title is 1");

			this.oProductSwitchItem.setTitle(null);
			this.oProductSwitchItem.setSubTitle(null);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTitle(), "", "Value of the title property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getText(), this.oProductSwitchItem.getTitle(), "Title value is successfully forwarded to the internal aggregation.");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 2, "Value of maxLines property of the internal aggregation _title is 2");
		});

		QUnit.test("subTitle property", function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "", "Default value is set");

			this.oProductSwitchItem.setSubTitle("Test subtitle");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "Test subtitle", "Value of the subTitle propert is changed");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 1, "Value of maxLines property of the internal aggregation _title is 1");

			this.oProductSwitchItem.setSubTitle(null);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "", "Value of the subTitle property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 2, "Value of maxLines property of the internal aggregation _title is 2");
		});

		QUnit.test("targetSrc property", function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "", "Default value is set");

			this.oProductSwitchItem.setTargetSrc("https://testlink.com");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "https://testlink.com", "Default value is successfully changed");

			this.oProductSwitchItem.setTargetSrc(null);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "", "Value of the targetSrc property is successfully reset");
		});

		QUnit.test("target property", function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTarget(), "", "Default value is set");

			this.oProductSwitchItem.setTarget("_blank");
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTarget(), "_blank", "Default value is successfully changed");

			this.oProductSwitchItem.setTarget(null);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitchItem.getTarget(), "", "Value of the target property is successfully reset");
		});

		QUnit.test("_icon aggregation", function (assert) {
			assert.ok(this.oProductSwitchItem._getIcon(), "Internal aggregation is successfully instantiated");
			assert.ok(this.oProductSwitchItem._getIcon().isA("sap.ui.core.Icon"), "Internal aggregation is with correct type");
		});

		QUnit.test("_title aggregation", function (assert) {
			assert.ok(this.oProductSwitchItem._getTitle(), "Internal aggregation is successfully instantiated");
			assert.ok(this.oProductSwitchItem._getTitle().isA("sap.m.Text"), "Internal aggregation is with correct type");
		});

		QUnit.module("ProductSwitchItem - Renderer ", {
			beforeEach: function () {
				this.oProductSwitchItem = oUtil.getProductSwitchItem();
				this.oProductSwitchItem.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oProductSwitchItem.destroy();
				this.oProductSwitchItem = null;
			}
		});

		QUnit.test("sapFPSItemWithoutIcon class", function (assert) {
			assert.ok(this.oProductSwitchItem.getDomRef().classList.contains("sapFPSItemWithoutIcon"), "Control has sapFPSItemWithoutIcon class when there is no icon");

			this.oProductSwitchItem.setSrc("sap-icon://home");
			Core.applyChanges();

			assert.notOk(this.oProductSwitchItem.getDomRef().classList.contains("sapFPSItemWithoutIcon"), "Control hasn't sapFPSItemWithoutIcon class when there is icon");

			this.oProductSwitchItem.setSrc(null);
			Core.applyChanges();

			assert.ok(this.oProductSwitchItem.getDomRef().classList.contains("sapFPSItemWithoutIcon"), "Control has sapFPSItemWithoutIcon class when there is no icon");
		});

		QUnit.test("_title aggregation additonal classses", function (assert) {
			assert.ok(this.oProductSwitchItem._getTitle().hasStyleClass("sapFPSItemMainTitle"), "Internal aggregation has sapFPSItemMainTitle additional class");
			assert.ok(this.oProductSwitchItem._getTitle().hasStyleClass("sapFPSItemTitle"), "Internal aggregation has sapFPSItemTitle additional class");
		});
	});
