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

    QUnit.module("_ViewID", {
        beforeEach: function () {
            sap.ui.controller("myController", {});
            this.oViewWithId = sap.ui.view("myView", {
                viewContent: createViewContent("myView"),
                type: ViewType.XML
            });
            this.oViewNoId = sap.ui.view({
                viewContent: createViewContent("myViewWithoutId"),
                type: ViewType.XML
            });
            this.oButton = new Button("myButton");
            this.oButton.placeAt("qunit-fixture");
            this.oViewWithId.placeAt("qunit-fixture");
            this.oViewNoId.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oViewWithId.destroy();
            this.oViewNoId.destroy();
            this.oButton.destroy();
        }
    });

    QUnit.test("Should generate selector for control in a view with stable ID", function (assert) {
        var fnDone = assert.async();
        _ControlSelectorGenerator._generate({control: $("#myView form input").control()[0], includeAll: true})
            .then(function (aSelector) {
                var mViewIdSelector = aSelector[1][0];
                assert.strictEqual(mViewIdSelector.viewId, "myView", "Should generate selector with viewName");
                assert.strictEqual(mViewIdSelector.id, "mySearch", "Should generate selector with ID");
                assert.ok(!mViewIdSelector.controlType, "Should not include controlType matcher");
            }).finally(fnDone);
    });

    QUnit.test("Should generate selector for control with stable ID in any view", function (assert) {
        var fnDone = assert.async();
        var $view = $(".sapUiView").filter(function (i, $elem) {
            return $elem.id !== "myView";
        });
        _ControlSelectorGenerator._generate({control: $view.find("form input").control()[0], includeAll: true})
            .then(function (aSelector) {
                var mViewIdSelector = aSelector[0][0];
                assert.strictEqual(mViewIdSelector.viewName, "myViewWithoutId", "Should generate selector with viewName");
                assert.strictEqual(mViewIdSelector.id, "mySearch", "Should generate selector with ID");
                assert.ok(!mViewIdSelector.controlType, "Should not include controlType matcher");
            }).finally(fnDone);
    });

    QUnit.test("Should not generate selector for control with generated ID", function (assert) {
        var fnDone = assert.async();
        _ControlSelectorGenerator._generate({control: $("#myView form input").control()[1], includeAll: true, shallow: true})
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

    function createViewContent (sViewName) {
        return '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" ' +
            'controllerName="myController" viewName="' + sViewName + '">' +
            '<App id="myApp">' +
                '<Page id="page1">' +
                    '<SearchField id="mySearch" placeholder="Test"></SearchField>' +
                    '<SearchField placeholder="Placeholder"></SearchField>' +
                '</Page>' +
            '</App>' +
        '</mvc:View>';
    }

    function hasViewIdSelector(aSelectors) {
        return aSelectors.filter(function (aSelectorsOfType) {
            return aSelectorsOfType.filter(function (mSelector) {
                return (mSelector.viewName || mSelector.viewId) && mSelector.id && Object.keys(mSelector).length === 2;
            }).length;
        }).length;
    }
});
