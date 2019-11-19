/*global QUnit*/
sap.ui.define(["sap/ui/core/Core", "sap/f/ProductSwitch", "sap/f/ProductSwitchItem", "sap/ui/qunit/QUnitUtils", "sap/ui/events/KeyCodes"],
	function (Core, ProductSwitch, ProductSwitchItem, QUnitUtils, KeyCodes) {
		"use strict";

		var TESTS_DOM_CONTAINER = "qunit-fixture",
			oUtil = {
				getProductSwitchItem: function (sTitle, sSubTitle, sSrc) {
					return new ProductSwitchItem({
						title: sTitle,
						subTitle: sSubTitle,
						src: sSrc
					});
				},
				getProductSwitchItems: function (iCount) {
					var aCreatedItems = [];

					for (var i = 0; i < iCount; i++) {
						aCreatedItems.push(this.getProductSwitchItem("Title" + i, "SubTitle" + i, "sap-icon://home"));
					}

					return aCreatedItems;
				},
				getProductSwitch: function (iCount) {
					return new ProductSwitch({items: this.getProductSwitchItems(iCount)});
				}
			};

		QUnit.module("ProductSwitch - API ", {
			beforeEach: function () {
				this.oProductSwitch = oUtil.getProductSwitch();
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Instantiation", function (assert) {
			assert.ok(this.oProductSwitch, "The ProductSwitch is instantiated successfully");
		});

		QUnit.test("items aggregation", function (assert) {
			assert.ok(this.oProductSwitch._getGridContainer(), "Internal aggregation for forwarding is instatiated.");
			assert.strictEqual(this.oProductSwitch.getItems().length, this.oProductSwitch._getGridContainer().getItems().length, "Items are succcessfully forwarded");

			this.oProductSwitch.addItem(oUtil.getProductSwitchItem());
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitch.getItems().length, this.oProductSwitch._getGridContainer().getItems().length, "Items are succcessfully forwarded");
		});

		QUnit.test("items aggregation forwarding - insertItem", function (assert) {
			var oItem = oUtil.getProductSwitchItem();

			this.oProductSwitch.insertItem(oItem, 0);
			Core.applyChanges();

			assert.equal(this.oProductSwitch._getGridContainer().getItems()[0], oItem, "insertItem is forwarded successfully");
			assert.equal(this.oProductSwitch.getItems()[0], oItem, "insertItem is executed successfully");
		});

		QUnit.test("items aggregation forwarding - removeItem", function (assert) {
			var oItem;

			oUtil.getProductSwitchItems(5).forEach(function(oCreatedItem) {
				this.oProductSwitch.addItem(oCreatedItem);
			}, this);
			Core.applyChanges();

			oItem  = this.oProductSwitch.getItems()[0];

			assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
			assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");

			this.oProductSwitch.removeItem(oItem);
			Core.applyChanges();

			assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
			assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully removed");
		});

		QUnit.test("items aggregation forwarding - removeAllItems", function (assert) {
			var aItems = oUtil.getProductSwitchItems(5);

			aItems.forEach(function(oCreatedItem) {
				this.oProductSwitch.addItem(oCreatedItem);
			}, this);
			Core.applyChanges();

			aItems.forEach(function(oItem) {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");
			}, this);

			this.oProductSwitch.removeAllItems();
			Core.applyChanges();

			aItems.forEach(function(oItem) {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully removed");
			}, this);
		});

		QUnit.test("items aggregation forwarding - destroyAllItems", function (assert) {
			var aItems = oUtil.getProductSwitchItems(5);

			aItems.forEach(function(oCreatedItem) {
				this.oProductSwitch.addItem(oCreatedItem);
			}, this);
			Core.applyChanges();

			aItems.forEach(function(oItem) {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");
			}, this);

			this.oProductSwitch.destroyItems();
			Core.applyChanges();

			aItems.forEach(function(oItem) {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully destroyed");
			}, this);
		});

		QUnit.module("ProductSwitch - private methods ", {
			beforeEach: function () {
				this.oProductSwitch = oUtil.getProductSwitch();
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Layout update after items count change", function (assert) {
			var oItem = oUtil.getProductSwitchItem();

			oUtil.getProductSwitchItems(6).forEach(function(oCreatedItem) {
				this.oProductSwitch.addItem(oCreatedItem);
			}, this);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 3, "Layout columns are updated");

			this.oProductSwitch.addItem(oItem);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 4, "Layout columns are updated");

			this.oProductSwitch.removeItem(oItem);
			Core.applyChanges();

			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 3, "Layout columns are updated");
		});

		QUnit.module("ProductSwitch - Accessibility", {
			beforeEach: function () {
				this.oProductSwitch = oUtil.getProductSwitch(5);
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Attributes", function (assert) {
			var $ProductSwitch = this.oProductSwitch.$(),
				oRb = Core.getLibraryResourceBundle("sap.f");

			assert.equal($ProductSwitch.attr("role"), "menu", "Role menu is set on the container");
			assert.equal($ProductSwitch.attr("aria-label"), oRb.getText("PRODUCTSWITCH_CONTAINER_LABEL"), "Container aria-label is set correctly");
		});

		QUnit.test("Setsize and Posinset values", function (assert) {
			var aItems = this.oProductSwitch.getItems(),
				iItemCount = aItems.length,
				oItem = aItems[3],
				$Item = oItem.$();

			assert.equal($Item.attr("aria-setsize"), iItemCount, "aria-setsize has the correct value");
			assert.equal($Item.attr("aria-posinset"), "4", "aria-posinset has the correct value");

			this.oProductSwitch.setSelectedItem(oItem);

			assert.equal($Item.attr("aria-checked"), "true", "aria-checked is correctly set");

			this.oProductSwitch.rerender();

			assert.equal($Item.attr("aria-checked"), "true", "aria-checked is still correctly set");
		});

	});
