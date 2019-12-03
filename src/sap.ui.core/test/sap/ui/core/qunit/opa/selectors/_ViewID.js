/*global QUnit */
sap.ui.define([
    "sap/ui/test/selectors/_ControlSelectorGenerator",
    "sap/ui/thirdparty/jquery",
    "sap/m/Button",
    'sap/m/App',
    'sap/ui/core/mvc/View',
    'sap/ui/core/library'
], function (_ControlSelectorGenerator, $, Button, App, View, library) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = library.mvc.ViewType;

    var sViewContent = '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" viewName="myView">' +
        '<App id="myApp">' +
            '<Page id="page1">' +
                '<SearchField id="mySearch" placeholder="Test"></SearchField>' +
                '<SearchField placeholder="Placeholder"></SearchField>' +
            '</Page>' +
        '</App>' +
    '</mvc:View>';

    QUnit.module("_ViewID", {
        beforeEach: function () {
            sap.ui.controller("myController", {});
            this.oView = sap.ui.view("myView", {
                viewContent: sViewContent,
                type: ViewType.XML
            });
            this.oButton = new Button("myButton");
            this.oButton.placeAt("qunit-fixture");
            this.oView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oView.destroy();
            this.oButton.destroy();
        }
    });

    QUnit.test("Should generate selector for control with stable ID", function (assert) {
        var fnDone = assert.async();
        _ControlSelectorGenerator._generate({control: $("form input").control()[0], includeAll: true})
            .then(function (aSelector) {
                var mViewIdSelector = aSelector[1][0];
                assert.strictEqual(mViewIdSelector.viewName, "myView", "Should generate selector with viewName");
                assert.strictEqual(mViewIdSelector.id, "mySearch", "Should generate selector with ID");
                assert.ok(!mViewIdSelector.controlType, "Should not include controlType matcher");
            }).finally(fnDone);
    });

    QUnit.test("Should not generate selector for control with generated ID", function (assert) {
        var fnDone = assert.async();
        _ControlSelectorGenerator._generate({control: $("form input").control()[1], includeAll: true, shallow: true})
            .then(function (aSelector) {
                assert.ok(!hasViewIdSelector(aSelector), "Should not generate selector");
            }).finally(fnDone);
    });

    QUnit.test("Should not generate selector for control with no view", function (assert) {
        var fnDone = assert.async();
        _ControlSelectorGenerator._generate({control: this.oButton, includeAll: true, shallow: true})
            .then(function (aSelector) {
                assert.ok(!hasViewIdSelector(aSelector), "Should not generate selector");
            }).finally(fnDone);
    });

    function hasViewIdSelector(aSelectors) {
        return aSelectors.filter(function (aSelectorsOfType) {
            return aSelectorsOfType.filter(function (mSelector) {
                return mSelector.viewName && mSelector.id && Object.keys(mSelector).length === 2;
            }).length;
        }).length;
    }
});
