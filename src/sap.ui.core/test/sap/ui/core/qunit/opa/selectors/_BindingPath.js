/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_BindingPath",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Text",
    "../fixture/bindingPath"
], function (_BindingPath, ResourceModel, Text, fixture) {
    "use strict";

    QUnit.module("_BindingPath - properties", {
        beforeEach: function () {
            fixture.PropertyFixture.beforeEach.call(this);
        },
        afterEach: function () {
            fixture.PropertyFixture.afterEach.call(this);
        }
    });

    QUnit.test("Should generate selector for bound property", function (assert) {
        var oBindingPath = new _BindingPath();
        var aData = [
            {type: "named", modelName: "myModel", prefix: "", control: this.oNamedModelPropertyText},
            {type: "nameless", prefix: "/", control: this.oPropertyText}
        ];
        aData.forEach(function (mData) {
            var aSelectors = oBindingPath.generate(mData.control)[0];
            assert.strictEqual(aSelectors.length, 1, "Should generate one selector for " + mData.type + " model");
            assert.strictEqual(aSelectors[0].bindingPath.propertyPath, mData.prefix + "propertyText", "Should generate selector with correct binding path");
            assert.strictEqual(aSelectors[0].bindingPath.modelName, mData.modelName, "Should generate selector with model name");
        });
    });

    QUnit.test("Should generate selector for composite property", function (assert) {
        var oBindingPath = new _BindingPath();
        var aData = [
            {type: "named", modelName: "myModel", prefix: "", control: this.oNamedCompositePropertyText},
            {type: "nameless", prefix: "/", control: this.oCompositePropertyText}
        ];
        aData.forEach(function (mData) {
            var aSelectors = oBindingPath.generate(mData.control)[0];
            assert.strictEqual(aSelectors.length, 2, "Should generate two selectors for " + mData.type + " model");
            assert.strictEqual(aSelectors[0].bindingPath.propertyPath, mData.prefix + "compositeProperty/partOne", "Should generate first selector with correct binding path");
            assert.strictEqual(aSelectors[1].bindingPath.propertyPath, mData.prefix + "compositeProperty/partTwo", "Should generate second selector with correct binding path");
            assert.strictEqual(aSelectors[0].bindingPath.modelName, mData.modelName, "Should generate first selector with model name");
            assert.strictEqual(aSelectors[1].bindingPath.modelName, mData.modelName, "Should generate second selector with model name");
        });
    });

    QUnit.test("Should not generate selector when there is no binding for the property", function (assert) {
        this.oCompositePropertyText.unbindText();
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oCompositePropertyText);
        assert.ok(!aSelectors.length, "Should not generate selector");
    });

    QUnit.module("_BindingPath - i18n", {
        beforeEach: function () {
            var oResourceModel = new ResourceModel({
                bundleUrl: "test-resources/sap/ui/core/qunit/opa/selectors/i18n.properties"
			});
			sap.ui.getCore().setModel(oResourceModel, "i18n");
            this.oPropertyText = new Text({text: "{i18n>propertyText}"});
            this.oPropertyText.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.oPropertyText.destroy();
        }
    });

    QUnit.test("Should generate selector for bound property", function (assert) {
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oPropertyText)[0];
        assert.strictEqual(aSelectors.length, 1, "Should generate one selector per property");
        assert.strictEqual(aSelectors[0].i18NText.propertyName, "text", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[0].i18NText.key, "propertyText", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[0].i18NText.modelName, "i18n", "Should generate selector with correct binding path");
    });

    QUnit.module("_BindingPath - object binding", {
        beforeEach: function () {
            fixture.ObjectFixture.beforeEach.call(this);
        },
        afterEach: function () {
            fixture.ObjectFixture.afterEach.call(this);
        }
    });

    QUnit.test("Should generate selector for control with bound object", function (assert) {
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oInput);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[0][0].bindingPath.propertyPath, "partOne", "Should generate selector with correct binding property path");
        assert.strictEqual(aSelectors[1][0].bindingPath.path, "/compositeProperty", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[1][0].bindingPath.propertyPath, "partTwo", "Should generate selector with correct binding property path");
    });

    QUnit.test("Should generate selector for control with parent object binding", function (assert) {
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oTexts[0]);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[0][0].bindingPath.propertyPath, "partOne", "Should generate selector with correct binding property path");

        aSelectors = oBindingPath.generate(this.oTexts[1]);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[0][0].bindingPath.propertyPath, "partTwo", "Should generate selector with correct binding property path");
    });

    QUnit.module("_BindingPath - aggregation", {
        beforeEach: function () {
            fixture.AggregationFixture.beforeEach.call(this);
        },
        afterEach: function () {
            fixture.AggregationFixture.afterEach.call(this);
        }
    });

    QUnit.test("Should generate selector for control with aggregation", function (assert) {
        var oBindingPath = new _BindingPath();
        var mSelectorFilled = oBindingPath.generate(this.aLists[0])[0][0];
        assert.strictEqual(mSelectorFilled.bindingPath.propertyPath, "/items", "Should generate selector with binding path");
        var mSelectorEmpty = oBindingPath.generate(this.aLists[1])[0][0];
        assert.strictEqual(mSelectorEmpty.bindingPath.propertyPath, "/emptyItems", "Should generate selector with binding path");
        var mSelectorComposite = oBindingPath.generate(this.aLists[2])[0][0];
        assert.strictEqual(mSelectorComposite.bindingPath.propertyPath, "/composite/items", "Should generate selector with binding path");
    });
});
