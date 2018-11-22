/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_TableRowItem",
    "sap/ui/thirdparty/jquery",
    "sap/m/App",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/json/JSONModel"
], function (_TableRowItem, $, App, View, ViewType, JSONModel) {
    "use strict";

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
        var oTableRowItem = new _TableRowItem();
        var oControl = sap.ui.getCore().byId("myView--objectId" + iTest + "-myView--myTable-0");
        var mControlAncestors = oTableRowItem._getAncestors(oControl);
        var mSelector = oTableRowItem.generate(oControl._getTextControl(), {
            id: "myView--myTable"
        }, {
            controlType: "sap.m.Text",
            properties: {text: "Item11"}
        });
        assert.strictEqual(mSelector.properties.text, "Item11", "Should include control selector relative to row");
        assert.strictEqual(mSelector.ancestor.bindingPath.path, "/items/0", "Should include row binding context path");
        assert.strictEqual(mSelector.ancestor.controlType, "sap.m.ColumnListItem", "Should include row type");
        assert.strictEqual(mSelector.ancestor.ancestor.id, "myView--myTable", "Should include table selector");
        assert.ok(mControlAncestors.validation.getId().match("myView--myTable-0$"), "Should get control table");
        assert.strictEqual(mControlAncestors.selector.getId(), "myView--myTable", "Should get control table row");
    });

    QUnit.test("Should find control table and row", function (assert) {
        var oTableRowItem = new _TableRowItem();
        var oControl = sap.ui.getCore().byId("myView--objectId" + iTest + "-myView--myTable-0");
        var oRow = oTableRowItem._findRow(oControl);
        var oTable = oTableRowItem._findTable(oControl);
        var mAncestors = oTableRowItem._getAncestors(oControl);
        assert.ok(oRow.getId().match(/__item[0-9]+-myView--myTable-0/), "Should find control's row");
        assert.strictEqual(oTable.getId(), "myView--myTable", "Should find control's table");
        assert.strictEqual(mAncestors.validation, oRow, "Should have row as validation ancestor");
        assert.strictEqual(mAncestors.selector, oTable, "Should have table as selector ancestor");
    });
});
