/*global QUnit*/
sap.ui.define(["sap/f/ProductSwitchItem", "sap/ui/qunit/utils/nextUIUpdate"],
	function (ProductSwitchItem, nextUIUpdate) {
		"use strict";

		var TESTS_DOM_CONTAINER = "qunit-fixture",
			oUtil = {
				getProductSwitchItem: function () {
					return new ProductSwitchItem();
				}
			};

		QUnit.module("ProductSwitchItem - API ", {
			beforeEach: async function () {
				this.oProductSwitchItem = oUtil.getProductSwitchItem();
				this.oProductSwitchItem.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitchItem.destroy();
				this.oProductSwitchItem = null;
			}
		});

		QUnit.test("Instantiation", function (assert) {
			assert.ok(this.oProductSwitchItem, "The ProductSwitchitem is instantiated successfully");
		});

		QUnit.test("src property", async function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getSrc(), "", "Default value is set");

			this.oProductSwitchItem.setSrc("sap-icon://home");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getSrc(), "sap-icon://home", "Value of the src property is successfully changed");
			assert.strictEqual(this.oProductSwitchItem._getIcon().getSrc(), this.oProductSwitchItem.getSrc(), "Src value is successfully forwarded to the internal aggregation");

			this.oProductSwitchItem.setSrc(null);
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getSrc(), "", "Value of the src property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getIcon().getSrc(), "", "Src value is successfully forwarded to the internal aggregation");
		});

		QUnit.test("title property", async function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTitle(), "", "Default value is set");

			this.oProductSwitchItem.setTitle("Test title");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getTitle(), "Test title", "Value of the title property is changed");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getText(), this.oProductSwitchItem.getTitle(), "Title value is successfully forwarded to the internal aggregation");

			this.oProductSwitchItem.setSubTitle("Test subtitle");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 1, "Value of maxLines property of the internal aggregation _title is 1");

			this.oProductSwitchItem.setTitle(null);
			this.oProductSwitchItem.setSubTitle(null);
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getTitle(), "", "Value of the title property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getText(), this.oProductSwitchItem.getTitle(), "Title value is successfully forwarded to the internal aggregation.");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 2, "Value of maxLines property of the internal aggregation _title is 2");
		});

		QUnit.test("subTitle property", async function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "", "Default value is set");

			this.oProductSwitchItem.setSubTitle("Test subtitle");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "Test subtitle", "Value of the subTitle propert is changed");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 1, "Value of maxLines property of the internal aggregation _title is 1");

			this.oProductSwitchItem.setSubTitle(null);
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getSubTitle(), "", "Value of the subTitle property is successfully reset");
			assert.strictEqual(this.oProductSwitchItem._getTitle().getMaxLines(), 2, "Value of maxLines property of the internal aggregation _title is 2");
		});

		QUnit.test("targetSrc property", async function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "", "Default value is set");

			this.oProductSwitchItem.setTargetSrc("https://testlink.com");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "https://testlink.com", "Default value is successfully changed");

			this.oProductSwitchItem.setTargetSrc(null);
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getTargetSrc(), "", "Value of the targetSrc property is successfully reset");
		});

		QUnit.test("target property", async function (assert) {
			assert.strictEqual(this.oProductSwitchItem.getTarget(), "", "Default value is set");

			this.oProductSwitchItem.setTarget("_blank");
			await nextUIUpdate();

			assert.strictEqual(this.oProductSwitchItem.getTarget(), "_blank", "Default value is successfully changed");

			this.oProductSwitchItem.setTarget(null);
			await nextUIUpdate();

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
			beforeEach: async function () {
				this.oProductSwitchItem = oUtil.getProductSwitchItem();
				this.oProductSwitchItem.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitchItem.destroy();
				this.oProductSwitchItem = null;
			}
		});

		QUnit.test("_title aggregation additonal classses", function (assert) {
			assert.ok(this.oProductSwitchItem._getTitle().hasStyleClass("sapFPSItemMainTitle"), "Internal aggregation has sapFPSItemMainTitle additional class");
			assert.ok(this.oProductSwitchItem._getTitle().hasStyleClass("sapFPSItemTitle"), "Internal aggregation has sapFPSItemTitle additional class");
		});

		QUnit.module("ProductSwitchItem - Accessibility", {
			beforeEach: async function () {
				this.oProductSwitchItem = oUtil.getProductSwitchItem();
				this.oProductSwitchItem.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitchItem.destroy();
				this.oProductSwitchItem = null;
			}
		});

		QUnit.test("Attributes", function (assert) {
			var $ProductSwitchItem = this.oProductSwitchItem.$();

			assert.equal($ProductSwitchItem.attr("role"), "menuitemradio", "Role menuitem is set on the ProductSwitch item");
		});

		QUnit.test("Tooltip", async function (assert) {
			// Arrange
			var $ProductSwitchItem = this.oProductSwitchItem.$(),
				sTooltip = "Tooltip";

			// Act
			this.oProductSwitchItem.setTooltip(sTooltip);
			await nextUIUpdate();

			// Assert
			assert.strictEqual($ProductSwitchItem.attr("title"), sTooltip, "Tooltip is set");
		});
	});
