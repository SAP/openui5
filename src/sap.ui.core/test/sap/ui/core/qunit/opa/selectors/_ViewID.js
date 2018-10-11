/*global QUnit */
sap.ui.define([
    "sap/ui/test/selectors/_ViewID",
    "sap/ui/thirdparty/jquery",
    "sap/m/Button",
    'sap/m/App',
    'sap/ui/core/mvc/View',
    'sap/ui/core/mvc/ViewType'
], function (_ViewID, $, Button, App, View, ViewType) {
    "use strict";

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
        var oViewID = new _ViewID();
        var mSelector = oViewID.generate($("form input").control()[0]);
        assert.strictEqual(mSelector.viewName, "myView", "Should generate selector with viewName");
        assert.strictEqual(mSelector.id, "mySearch", "Should generate selector with ID");
        assert.ok(!mSelector.controlType, "Should not include controlType matcher");
    });

    QUnit.test("Should not generate selector for control with generated ID", function (assert) {
        var oViewID = new _ViewID();
        var mSelector = oViewID.generate($("form input").control()[1]);
        assert.ok(!mSelector, "Should not generate selector");
    });

    QUnit.test("Should not generate selector for control with no view", function (assert) {
        var oViewID = new _ViewID();
        var mSelector = oViewID.generate(this.oButton);
        assert.ok(!mSelector, "Should not generate selector");
    });
});
