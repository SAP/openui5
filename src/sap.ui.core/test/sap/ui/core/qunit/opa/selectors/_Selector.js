/*global QUnit, sinon*/
sap.ui.define([
    "sap/ui/test/selectors/_Selector",
    "sap/ui/core/mvc/View",
    "sap/ui/core/library"
], function (_Selector, View, library) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = library.mvc.ViewType;

    var singleStub = sinon.stub();
    var multiStub = sinon.stub();
    var SingleSelector = _Selector.extend("SingleSelector", {
        _generate: singleStub
    });
    var MultiSelector = _Selector.extend("MultiSelector", {
        _generate: multiStub
    });

    QUnit.module("_Selector", {
        beforeEach: function () {
            sap.ui.controller("myController", {});
            this.oView = sap.ui.view("myView", {
                viewContent: '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" viewName="myView">' +
                '<App id="myApp"><Page id="page1"><Input id="myInput"></Input></Page></App>' +
                '</mvc:View>',
                type: ViewType.XML
            });
            this.oView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
            this.oInput = sap.ui.getCore().byId("myView--myInput");
        },
        afterEach: function () {
            this.oView.destroy();
        }
    });

    QUnit.test("Should add basic selectors", function (assert) {
        singleStub.returns({
            property: "value"
        });
        var oSelector = new SingleSelector();
        var mSelector = oSelector.generate(this.oInput);
        assert.strictEqual(mSelector.property, "value", "Should add _generate result");
        assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
        assert.strictEqual(mSelector.viewName, "myView", "Should add viewName");
    });

    QUnit.test("Should skip basic matchers when requested", function (assert) {
        singleStub.returns({
            skipBasic: true
        });
        var oSelector = new SingleSelector();
        var mSelector = oSelector.generate(this.oInput);
        assert.ok(!Object.keys(mSelector).length, "Should skip basic selectors");
    });

    QUnit.test("Should handle multiple selectors", function (assert) {
        multiStub.returns([{
            property: "value0"
        }, {
            property: "value1"
        }]);
        var oSelector = new MultiSelector();
        var aSelectors = oSelector.generate(this.oInput);
        aSelectors.forEach(function (mSelector, i) {
            assert.strictEqual(mSelector.property, "value" + i, "Should add _generate result");
            assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
            assert.strictEqual(mSelector.viewName, "myView", "Should add viewName");
        });
    });

    QUnit.test("Should handle selector with multiple parts", function (assert) {
        multiStub.returns([[{
            bindingPath: {path: "value0"}
        }, {
            bindingPath: {path: "value1"}
        }]]);
        var oSelector = new MultiSelector();
        var aSelectors = oSelector.generate(this.oInput)[0];
        aSelectors.forEach(function (mSelector, i) {
            assert.strictEqual(mSelector.bindingPath.path, "value" + i, "Should add _generate result");
            assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
            assert.strictEqual(mSelector.viewName, "myView", "Should add viewName");
        });
    });

    QUnit.test("Should find ancestor satisfying a condition", function (assert) {
        var oSelector = new SingleSelector();
        var oAncestor = oSelector._findAncestor(this.oInput, function (oControl) {
            return oControl instanceof View;
        });
        assert.strictEqual(oAncestor.getId(), "myView", "Should find correct ancestor");
    });

    QUnit.test("Should not require ancestor and validation root by default", function (assert) {
        var oSelector = new SingleSelector();
        assert.ok(!oSelector._isAncestorRequired());
        assert.ok(!oSelector._isValidationRootRequired());
        assert.strictEqual(oSelector._getAncestor(), null);
        assert.strictEqual(oSelector._getValidationRoot(), null);
    });
});
