/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_DropdownItem",
    "sap/ui/model/json/JSONModel",
    "sap/m/Select",
    "sap/ui/core/Item"
], function (_DropdownItem, JSONModel, Select, Item) {
    "use strict";

    QUnit.module("_DropdownItem", {
        beforeEach: function () {
            var oJSONModel = new JSONModel({
                items: [{id: "1", name: "Item 11"}, {id: "2", name: "Item 22"}]
            });
            sap.ui.getCore().setModel(oJSONModel);
            this.oSelect = new Select("mySelect");
            this.oSelect.bindItems({
                path: "/items",
                template: new Item({
                    key: "{id}",
                    text: "{name}"
                })
            });
            this.oSelect.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.oSelect.destroy();
        }
    });

    QUnit.test("Should generate selector for item inside dropdown", function (assert) {
        var oDropdownItem = new _DropdownItem();
        var mSelector = oDropdownItem.generate(this.oSelect.getItems()[0], {id: "mySelect"});
        assert.strictEqual(mSelector.ancestor.id, "mySelect", "Should generate selector with the dropdown ancestor");
        assert.strictEqual(mSelector.controlType, "sap.ui.core.Item", "Should generate selector with item type");
        assert.strictEqual(mSelector.properties.key, "1", "Should generate selector with item selector key");
    });

    QUnit.test("Should find ancestor select list", function (assert) {
        var oDropdownItem = new _DropdownItem();
        var mAncestors = oDropdownItem._getAncestors(this.oSelect.getItems()[0]);
        assert.strictEqual(mAncestors.selector, this.oSelect.getList(), "Should find ancestor select list");
    });
});
