/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_TableRowItem",
    "sap/ui/test/selectors/_ControlSelectorGenerator",
    "sap/ui/thirdparty/jquery",
    "sap/m/App",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library"
], function (_TableRowItem, _ControlSelectorGenerator, $, App, View, JSONModel, library) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = library.mvc.ViewType;

    var iTest = 0; // workaround for duplicate ids even after everything is destroyed
    function getViewContent() {
        return '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" viewName="myView">' +
            '<App id="myApp">' +
                '<Page id="page1">' +
                    '<Table id="myTable" items="{/items}" width="300px">' +
                        '<columns>' +
                            '<Column><Text text="Name"/></Column>' +
                            '<Column><Text text="Button"/></Column>' +
                        '</columns>' +
                        '<items>' +
                            '<ColumnListItem>' +
                                '<cells>' +
                                    '<ObjectIdentifier id="objectId' + iTest + '" title="{id}" text="{name}"/>' +
                                    '<Button id="press' + iTest + '" text="Press"></Button>' +
                                '</cells>' +
                            '</ColumnListItem>' +
                        '</items>' +
                    '</Table>' +
                '</Page>' +
            '</App>' +
        '</mvc:View>';
    }

    QUnit.module("_TableRow", {
        beforeEach: function () {
            var oJSONModel = new JSONModel({
                items: [{id: "ID1", name: "Item 11"}, {id: "ID2", name: "Item 22"}]
            });
            sap.ui.getCore().setModel(oJSONModel);
            sap.ui.controller("myController", {});
            this.oView = sap.ui.view("myView", {
                viewContent: getViewContent(iTest++),
                type: ViewType.XML
            });
            this.oView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            sap.ui.getCore().setModel();
            this.oView.destroy();
        }
    });

    QUnit.test("Should select a control in table row", function (assert) {
        var fnDone = assert.async();
        var oControl = sap.ui.getCore().byId("myView--objectId" + iTest + "-myView--myTable-0");
        _ControlSelectorGenerator._generate({control: oControl._getTextControl(), includeAll: true})
            .then(function (aSelectors) {
                var mTableSelector = aSelectors[1][0];
                assert.strictEqual(mTableSelector.properties.text, "Item 11", "Should include control selector relative to row");
                assert.strictEqual(mTableSelector.ancestor.bindingPath.path, "/items/0", "Should include row binding context path");
                assert.strictEqual(mTableSelector.ancestor.controlType, "sap.m.ColumnListItem", "Should include row type");
                assert.strictEqual(mTableSelector.ancestor.ancestor.id, "myView--myTable", "Should include table selector");
            }).finally(fnDone);
    });

    QUnit.test("Should find control table and row", function (assert) {
        var oGenerator = new _TableRowItem();
        var oControl = sap.ui.getCore().byId("myView--objectId" + iTest + "-myView--myTable-0");
        var oRow = oGenerator._getValidationRoot(oControl);
        var oTable = oGenerator._getAncestor(oControl);
        assert.ok(oGenerator._isAncestorRequired());
        assert.ok(oGenerator._isValidationRootRequired());
        assert.ok(oRow.getId().match(/__item[0-9]+-myView--myTable-0/), "Should find control's row");
        assert.strictEqual(oTable.getId(), "myView--myTable", "Should find control's table");
        assert.strictEqual(oRow.getMetadata().getName(), "sap.m.ColumnListItem", "Should have row as validation ancestor");
        assert.strictEqual(oTable.getMetadata().getName(), "sap.m.Table", "Should have table as selector ancestor");
    });
});
