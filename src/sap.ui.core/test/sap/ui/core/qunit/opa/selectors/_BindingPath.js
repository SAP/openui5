/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_BindingPath",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Text",
    "sap/m/Input",
    "sap/ui/layout/VerticalLayout",
    "sap/m/List",
    "sap/m/StandardListItem"
], function (_BindingPath, JSONModel, ResourceModel, Text, Input, VerticalLayout, List, StandardListItem) {
    "use strict";

    var mData = {
        propertyText: "myProperty",
        compositeProperty: {
            partOne: "some",
            partTwo: "name"
        }
    };

    QUnit.module("_BindingPath - properties", {
        beforeEach: function () {
            var oModel = new JSONModel(mData);
            var oNamedModel = new JSONModel(mData);
            sap.ui.getCore().setModel(oModel);
            sap.ui.getCore().setModel(oNamedModel, "myModel");

            this.oPropertyText = new Text({text: "{/propertyText}"});
            this.oNamedModelPropertyText = new Text({text: "{myModel>propertyText}"});
            this.oCompositePropertyText = new Text({text: "{/compositeProperty/partOne}+{/compositeProperty/partTwo}"});
            this.oNamedCompositePropertyText = new Text({text: "{myModel>compositeProperty/partOne}+{myModel>compositeProperty/partTwo}"});

            this.oPropertyText.placeAt("qunit-fixture");
            this.oNamedModelPropertyText.placeAt("qunit-fixture");
            this.oCompositePropertyText.placeAt("qunit-fixture");
            this.oNamedCompositePropertyText.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            sap.ui.getCore().setModel(null, "myModel");
            this.oPropertyText.destroy();
            this.oNamedModelPropertyText.destroy();
            this.oCompositePropertyText.destroy();
            this.oNamedCompositePropertyText.destroy();
        }
    });

    QUnit.test("Should generate selector for bound property", function (assert) {
        var oBindingPath = new _BindingPath();
        [this.oPropertyText, this.oNamedModelPropertyText].forEach(function (oControl, i) {
            var aSelectors = oBindingPath.generate(oControl)[0];
            assert.strictEqual(aSelectors.length, 1, "Should generate one selector for " + ["nameless", "named"][i] + " model");
            assert.strictEqual(aSelectors[0].bindingPath.path, (i === 1 ? "" : "/") + "propertyText", "Should generate selector with correct binding path");
            assert.strictEqual(aSelectors[0].bindingPath.modelName, i === 1 ? "myModel" : undefined, "Should generate selector with model name");
        });
    });

    QUnit.test("Should generate selector for composite property", function (assert) {
        var oBindingPath = new _BindingPath();
        [this.oCompositePropertyText, this.oNamedCompositePropertyText].forEach(function (oControl, i) {
            var aSelectors = oBindingPath.generate(oControl)[0];
            assert.strictEqual(aSelectors.length, 2, "Should generate two selectors for " + ["nameless", "named"][i] + " model");
            assert.strictEqual(aSelectors[0].bindingPath.path, (i === 1 ? "" : "/") + "compositeProperty/partOne", "Should generate first selector with correct binding path");
            assert.strictEqual(aSelectors[1].bindingPath.path, (i === 1 ? "" : "/") + "compositeProperty/partTwo", "Should generate second selector with correct binding path");
            assert.strictEqual(aSelectors[0].bindingPath.modelName, i === 1 ? "myModel" : undefined, "Should generate first selector with model name");
            assert.strictEqual(aSelectors[1].bindingPath.modelName, i === 1 ? "myModel" : undefined, "Should generate second selector with model name");
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

    QUnit.module("_BindingPath - element", {
        beforeEach: function () {
            var oModel = new JSONModel(mData);
            sap.ui.getCore().setModel(oModel);

            this.oInput = new Input();
            this.oInput.bindObject({path: "/compositeProperty"});
            this.oInput.bindProperty("value", {path: "partOne"});
            this.oInput.bindProperty("description", {path: "partTwo"});

            this.oTexts = [new Text({text: "{partOne}"}), new Text({text: "{partTwo}"})];
            this.oVerticalLayout = new VerticalLayout({content: this.oTexts});
            this.oVerticalLayout.bindObject({path: "/compositeProperty"});

            this.oInput.placeAt("qunit-fixture");
            this.oVerticalLayout.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.oInput.destroy();
            this.oVerticalLayout.destroy();
        }
    });

    QUnit.test("Should generate selector for control with binding property", function (assert) {
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oInput);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty/partOne", "Should generate selector with correct binding path");
        assert.strictEqual(aSelectors[1][0].bindingPath.path, "/compositeProperty/partTwo", "Should generate selector with correct binding path");
    });

    QUnit.test("Should generate selector for control with parent context", function (assert) {
        var oBindingPath = new _BindingPath();
        var aSelectors = oBindingPath.generate(this.oTexts[0]);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty/partOne", "Should generate selector with correct binding path");

        aSelectors = oBindingPath.generate(this.oTexts[1]);
        assert.strictEqual(aSelectors[0][0].bindingPath.path, "/compositeProperty/partTwo", "Should generate selector with correct binding path");
    });

    QUnit.module("_BindingPath - aggregation", {
        beforeEach: function () {
            var oJSONModel = new JSONModel({
                items: [{id: "1", name: "Item 11"}, {id: "2", name: "Item 22"}],
                emptyItems: [],
                composite: {
                    items: [{id: "1", name: "Item 33"}]
                }
			});
			sap.ui.getCore().setModel(oJSONModel);
            this.aLists = [];
            ["/items", "/emptyItems", "/composite/items"].forEach(function (sPath, index) {
                var oList = new List();
                oList.bindItems({
                    path: sPath,
                    template: new StandardListItem({
                        title: "{name}"
                    })
                });
                oList.placeAt("qunit-fixture");
                this.aLists.push(oList);
            }.bind(this));
			sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.aLists.forEach(function (oList) {
                oList.destroy();
            });
        }
    });

    QUnit.test("Should generate selector for control with aggregation", function (assert) {
        var oBindingPath = new _BindingPath();
        var mSelectorFilled = oBindingPath.generate(this.aLists[0])[0][0];
        assert.strictEqual(mSelectorFilled.bindingPath.path, "/items", "Should generate selector with binding path");
        var mSelectorEmpty = oBindingPath.generate(this.aLists[1])[0][0];
        assert.strictEqual(mSelectorEmpty.bindingPath.path, "/emptyItems", "Should generate selector with binding path");
        var mSelectorComposite = oBindingPath.generate(this.aLists[2])[0][0];
        assert.strictEqual(mSelectorComposite.bindingPath.path, "/composite/items", "Should generate selector with binding path");
    });
});
