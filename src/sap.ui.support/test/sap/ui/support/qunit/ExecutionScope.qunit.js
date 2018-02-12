/*global sinon, QUnit*/
(function () {
    "use strict";

    jQuery.sap.require("sap/ui/support/supportRules/ExecutionScope");
    jQuery.sap.require("sap/ui/thirdparty/sinon");
    jQuery.sap.require("sap/ui/thirdparty/sinon-qunit");


    jQuery.sap.require("sap.ui.model.json.JSONModel");
    // JSON sample data

    // list setup code copied from list.qunit
    var dataOverview = {
        navigation: [{
            title: "Standard List Thumb",
            type: "Navigation",
            press: 'standardListThumb'
        }, {
            title: "Standard List Icon",
            type: "Navigation",
            press: 'standardListIcon'
        }, {
            title: "Standard List Title",
            type: "Navigation",
            press: 'standardListTitle'
        }, {
            title: "Standard List no Image",
            type: "Navigation",
            press: 'standardListNoImage'
        }, {
            title: "Display List",
            type: "Navigation",
            press: 'displayList'
        }, {
            title: "Input List",
            type: "Navigation",
            press: 'inputList'
        }, {
            title: "Custom List",
            type: "Navigation",
            press: 'customList'
        }, {
            title: "Grouped List",
            type: "Navigation",
            press: 'groupedList'
        }, {
            title: "Grouped List without Header/Footer",
            type: "Navigation",
            press: 'groupedNoHeaderList'
        }, {
            title: "No Data List",
            type: "Navigation",
            press: 'noDataList'
        }]
    };

    function bindListData(data, itemTemplate, list) {
        var oModel = new sap.ui.model.json.JSONModel();
        // set the data for the model
        oModel.setData(data);
        // set the model to the list
        list.setModel(oModel);

        // create a CustomData template, set its key to "answer" and bind its value to the answer data
        var oDataTemplate = new sap.ui.core.CustomData({
            key: "xyz"
        });
        oDataTemplate.bindProperty("value", "press");

        // add the CustomData template to the item template
        itemTemplate.addCustomData(oDataTemplate);

        // bind Aggregation
        list.bindAggregation("items", "/navigation", itemTemplate);
    }

    var core;

    sap.ui.getCore().registerPlugin({
        startPlugin: function (oCore) {
            core = oCore;
        }
    });

    QUnit.module("Execution Scope API test", {
        setup: function () {

            var oItemTemplateOverview = new sap.m.StandardListItem({
                title: "{title}",
                type: "{type}"
            });

            var oListOverview = new sap.m.List({
                inset: false,
                headerText: "List Overview",
                footerText: "These are just some list examples and this won't show all possible combinations."
            });

            bindListData(dataOverview, oItemTemplateOverview, oListOverview);

            this.page = new sap.m.Page({
                content: [
                    new sap.m.Panel({
                        id: "innerPanel",
                        content: [
                            new sap.m.Panel({
                                content: [new sap.m.Input(), new sap.m.Input()]
                            }),

                            new sap.m.Button(),

                            oListOverview
                        ]
                    }),
                    new sap.m.MaskInput(),
                    new sap.m.ComboBox(),
                    new sap.m.Button()
                ]
            });
            this.page.placeAt("qunit-fixture");

            this.es = sap.ui.support.supportRules.ExecutionScope(core, {
                type: "global"
            });
        },
        teardown: function () {
            this.es = null;
            this.page.destroy();
        }
    });

    QUnit.test("Fixed public methods", function (assert) {
        var getElementsIsAMethod =
            this.es.getElements && typeof this.es.getElements == "function",
            getPublicElementsIsAMethod =
                this.es.getPublicElements &&
                typeof this.es.getElements == "function",
            getLoggedObjectsIsAMethod =
                this.es.getLoggedObjects &&
                typeof this.es.getLoggedObjects == "function",
            getElementsByClassName =
                this.es.getElementsByClassName &&
                typeof this.es.getElementsByClassName == "function";

        assert.ok(getElementsIsAMethod, " should not be changed");
        assert.ok(getPublicElementsIsAMethod, " should not be changed");
        assert.ok(getLoggedObjectsIsAMethod, " should not be changed");
        assert.ok(getElementsByClassName, " should not be changed");
    });

    QUnit.test("getElementsByClassName", function (assert) {
        var pageElements = this.es.getElementsByClassName("sap.m.Page"),
            buttonElements = this.es.getElementsByClassName(sap.m.Button),
            inputBaseElements = this.es.getElementsByClassName(sap.m.InputBase);

        assert.equal(
            pageElements[0],
            this.page,
            "should select the sap.m.Page"
        );
        assert.equal(buttonElements.length, 2, "should select 2 elements");
        assert.equal(
            inputBaseElements.length,
            4,
            "should select 4 inherited elements"
        );
    });

    QUnit.test("Return type of get functions", function (assert) {
        var elements = this.es.getElements(),
            elementsById = this.es.getElementsByClassName("sap.m.Page");
        assert.equal(elements.constructor, Array, "type should be array");
        assert.equal(elementsById.constructor, Array, "type should be array");
    });

    QUnit.test("getElements with global context", function (assert) {
        var elements = this.es.getElements();
        assert.equal(
            elements.length,
            Object.keys(core.mElements).length,
            " should be equal to core mElements"
        );
    });

    QUnit.test("getPublicElements with global context", function (assert) {
        var publicElements = this.es.getPublicElements();
        assert.equal(
            publicElements.length,
            36,
            " should exclude internal controls from mElements"
        );
    });

    QUnit.test("getElements with subtree context", function (assert) {
        var elementsInCore = this.es.getElements();
        var esNew = sap.ui.support.supportRules.ExecutionScope(core, {
            type: "subtree",
            parentId: "innerPanel"
        });

        var elements = esNew.getElements();

        assert.ok(
            elements.length >= 4,
            "atleast 4 elements should be in this context"
        );
        assert.ok(
            elements.length < elementsInCore.length,
            "should be with less elements than global scope"
        );
    });

    QUnit.test("possibleScopes has the correct values", function (assert) {
        var possibleScopes =
            sap.ui.support.supportRules.ExecutionScope.possibleScopes;

        assert.equal(
            possibleScopes.length,
            3,
            " should contain 3 possible scopes"
        );
        assert.ok(possibleScopes[0] === "global", " global scope is defined");
        assert.ok(possibleScopes[1] === "subtree", " subtree scope is defined");
        assert.ok(
            possibleScopes[2] === "components",
            " components scope is defined"
        );
    });

    QUnit.test("getElements with subtree context", function (assert) {
        var publicPagesByFilter = this.es.getElements({
            "type": "sap.m.Page",
            "public": true,
            "cloned": false
        });

        assert.strictEqual(
            publicPagesByFilter.length,
            1,
            "should be with less elements than global scope"
        );

        var publicNotCloned = this.es.getElements({
            "public": true,
            "cloned": false
        });

        assert.strictEqual(
            publicNotCloned.length,
            17,
            "should be with less elements than global scope"
        );

        var publicElements = this.es.getElements({
            "public": true
        });

        assert.strictEqual(
            publicElements.length,
            36,
            "should be with less elements than global scope"
        );
    });

    QUnit.module("GetLoggedObjects test", {
        setup: function () {
            this.page = new sap.m.Page({
                content: [
                    new sap.m.Panel({
                        id: "innerPanel"
                    })
                ]
            });
            this.page.placeAt("qunit-fixture");
            sinon.stub(jQuery.sap.log, "getLogEntries", function fakeGetLog() {
                return [
                    { supportInfo: { type: "panel", elementId: "innerPanel" } },
                    { supportInfo: {} },
                    { supportInfo: { elementId: "innerPanel" } },
                    {
                        component: "",
                        date: "2017-05-05",
                        details: "",
                        level: 3,
                        message: "SAP Logger started.",
                        time: "10:42:21.464139"
                    },
                    {
                        component: "innerPanel",
                        date: "2017-05-05",
                        details: "innerPanel",
                        level: 3,
                        message: "SAP Logger started.",
                        time: "10:42:21.464139"
                    }
                ];
            });
            this.es = sap.ui.support.supportRules.ExecutionScope(core, {
                type: "global"
            });
            this.filteringFunction = function (logEntry) {
                if (
                    logEntry.supportInfo.hasOwnProperty("elementId") &&
                    logEntry.supportInfo.elementId == "innerPanel"
                ) {
                    return true;
                }
                return false;
            };
        },
        teardown: function () {
            this.es = null;
            this.filteringFunction = null;
            this.page.destroy();
            jQuery.sap.log.getLogEntries.restore();
        }
    });

    QUnit.test("Called with undefined type", function (assert) {
        var objectsFromLog = this.es.getLoggedObjects(),
            allObjectsContainSupportInfo = true;

        assert.equal(
            objectsFromLog.length,
            3,
            "should contain 3 logs with support info object"
        );

        objectsFromLog.forEach(function (logEntry) {
            if (!logEntry.hasOwnProperty("supportInfo")) {
                allObjectsContainSupportInfo = false;
                return;
            }
        });

        assert.ok(
            allObjectsContainSupportInfo,
            "all objects has support info object"
        );
    });

    QUnit.test("Called with specific type", function (assert) {
        var objectsFromLog = this.es.getLoggedObjects("panel"),
            loggedObject;

        assert.equal(objectsFromLog.length, 1, "should contain one log object");
        loggedObject = objectsFromLog[0];
        assert.ok(
            loggedObject.hasOwnProperty("supportInfo"),
            "should contain support info object"
        );
        assert.ok(
            loggedObject.supportInfo.hasOwnProperty("type"),
            "should contain type property"
        );
        assert.ok(
            loggedObject.supportInfo.type === "panel",
            "should match type"
        );
    });

    QUnit.test("Called with custom filtering function", function (assert) {
        var objectsFromLog = this.es.getLoggedObjects(this.filteringFunction);

        assert.equal(objectsFromLog.length, 2, "should contain one log object");

        for (var i = 0; i < objectsFromLog.length; i++) {
            assert.ok(
                objectsFromLog[i].supportInfo.elementId === "innerPanel",
                "log " + (i + 1) + " should contain correct elementId"
            );
        }
    });

    QUnit.test("Containing none valid logs", function (assert) {
        jQuery.sap.log.getLogEntries.restore();
        sinon.stub(jQuery.sap.log, "getLogEntries", function fakeGetLog() {
            return [
                {
                    component: "",
                    date: "2017-05-05",
                    details: "",
                    level: 3,
                    message: "SAP Logger started.",
                    time: "10:42:21.464139"
                },
                {
                    component: "innerPanel",
                    date: "2017-05-05",
                    details: "innerPanel",
                    level: 3,
                    message: "SAP Logger started.",
                    time: "10:42:21.464139"
                }
            ];
        });
        var objectsFromLog = this.es.getLoggedObjects();
        assert.equal(objectsFromLog.length, 0, "should be empty");
    });
})();
