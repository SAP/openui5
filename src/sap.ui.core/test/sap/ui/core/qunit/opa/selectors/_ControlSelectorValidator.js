/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_ControlSelectorValidator",
    "sap/ui/test/_ControlFinder",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/json/JSONModel",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Text"
], function (_ControlSelectorValidator, _ControlFinder, $, JSONModel, List, StandardListItem, Text) {
    "use strict";

    QUnit.module("_ControlSelectorValidator", {
        beforeEach: function () {
            var oJSONModel = new JSONModel({
                items: [
                    {id: "1", title: "SameTitle"},
                    {id: "2", title: "SameTitle"}
                ]
            });
            sap.ui.getCore().setModel(oJSONModel);

            this.oList = new List();
            this.oList.bindItems({
                path: "/items",
                template: new StandardListItem({
                    title: "{title}",
                    type: "Navigation"
                })
            });
            this.oText = new Text({text: "uniqueText"});
            this.oTextNoSelector1 = new Text({text: "duplicateText"});
            this.oTextNoSelector2 = new Text({text: "duplicateText"});

            this.oList.placeAt("qunit-fixture");
            this.oText.placeAt("qunit-fixture");
            this.oTextNoSelector1.placeAt("qunit-fixture");
            this.oTextNoSelector2.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.oList.destroy();
            this.oText.destroy();
            this.oTextNoSelector1.destroy();
            this.oTextNoSelector2.destroy();
        }
    });

    QUnit.test("Should return unique selectors", function (assert) {
        var aSelectors = [];
        var mUniqueSelector = {
            controlType: "sap.m.Text",
            properties: {text: "uniqueText"}
        };
        var oControlSelectorValidator = new _ControlSelectorValidator(aSelectors);
        oControlSelectorValidator._validate(mUniqueSelector);
        assert.strictEqual(aSelectors.length, 1, "Should find one valid selector");
        assert.strictEqual(aSelectors[0], mUniqueSelector, "Should return the unique selector");
    });

    QUnit.test("Should filter out selectors that match multiple controls", function (assert) {
        var aSelectors = [];
        var mDuplicateSelector = {
            controlType: "sap.m.Text",
            properties: {text: "duplicateText"}
        };
        var oControlSelectorValidator = new _ControlSelectorValidator(aSelectors);
        oControlSelectorValidator._validate(mDuplicateSelector);
        assert.ok(!aSelectors.length, "Should not return selectors that are not unique");
    });

    QUnit.test("Should consider validation ancestor", function (assert) {
        var aRowSelectors = [];
        var mFirstRowSelector = {
            controlType: "sap.m.StandardListItem",
            bindingPath: {
                path: "/items/0",
                propertyPath: "title"
            }
        };
        var mRowItemSelector = {
            controlType: "sap.ui.core.Icon",
            properties: {src: "sap-icon://slim-arrow-right"}
        };
        var oRowSelectorValidator = new _ControlSelectorValidator(aRowSelectors);
        oRowSelectorValidator._validate(mFirstRowSelector);
        assert.strictEqual(aRowSelectors.length, 1, "Should match unique validation ancestor");

        var oRow = _ControlFinder._findControls($.extend({}, mFirstRowSelector))[0];
        var aRowItemSelectors = [];
        var oRowItemSelectorValidator = new _ControlSelectorValidator(aRowItemSelectors, oRow);
        oRowItemSelectorValidator._validate(mRowItemSelector);
        assert.strictEqual(aRowItemSelectors.length, 1, "Should match child of unique ancestor");
        assert.strictEqual(aRowItemSelectors[0], mRowItemSelector, "Should match unique child of validation ancestor");
    });
});
