/*global QUnit, sinon */
sap.ui.define([
    'sap/ui/test/RecordReplay',
    'sap/m/SearchField',
    "sap/ui/thirdparty/jquery",
    'sap/m/App',
    'sap/ui/core/mvc/View',
    'sap/ui/core/mvc/ViewType'
], function (RecordReplay, SearchField, $, App, View, ViewType) {
    "use strict";

    QUnit.module("RecordReplay - control selector", {
        beforeEach: function () {
            sap.ui.controller("myController", {});
            this.oView = sap.ui.view("myView", {
                viewContent: '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" viewName="myView">' +
                '<App id="myApp"><Page id="page1">' +
                '<SearchField id="mySearch" placeholder="Test"></SearchField>' +
                '<SearchField placeholder="Placeholder"></SearchField>' +
                '</Page></App>' +
                '</mvc:View>',
                type: ViewType.XML
            });
            this.oView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oView.destroy();
            sap.ui.getCore().setModel();
        }
    });

    QUnit.test("Should generate selector for DOM element", function (assert) {
        var fnDone = assert.async();
        RecordReplay.findControlSelectorByDOMElement({
            domElement: $("#myView--mySearch")[0]
        }).then(function (mSelector) {
            assert.strictEqual(mSelector.id, "myView--mySearch", "Should generate a selector");
            assert.ok(!mSelector.interaction, "Should not include interaction suffix");
        }).finally(fnDone);
    });

    QUnit.test("Should generate selector for DOM element with interaction ID suffix", function (assert) {
        var fnDone = assert.async();
        RecordReplay.findControlSelectorByDOMElement({
            domElement: $("#myView--mySearch-reset")[0]
        }).then(function (mSelector) {
            assert.strictEqual(mSelector.id, "myView--mySearch", "Should generate a selector");
            assert.strictEqual(mSelector.interaction.idSuffix, "reset", "Should generate a selector with interaction DOM ID suffix");
        }).finally(fnDone);
    });

    QUnit.module("RecordReplay - DOM element search", {
        beforeEach: function () {
            this.oSearchField = new SearchField("mySearch", {placeholder: "Test"});
            this.oSearchField.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oSearchField.destroy();
        }
    });

    QUnit.test("Should find DOM element by control selector", function (assert) {
        var fnDone = assert.async();
        Promise.all([RecordReplay.findDOMElementByControlSelector({
            selector: {
                controlType: "sap.m.SearchField",
                propertyStrictEquals: {name: "placeholder", value: "Test"}
            }
        }), RecordReplay.findDOMElementByControlSelector({
            selector: {
                controlType: "sap.m.SearchField",
                propertyStrictEquals: {name: "placeholder", value: "Test"},
                interaction: "focus"
            }
        })]).then(function (aDOMElements) {
            assert.equal(aDOMElements[0], $("#mySearch-search")[0], "Should find the search field button");
            assert.equal(aDOMElements[1], $("#mySearch input")[0], "Should find the search field input");
        }).finally(fnDone);
    });

    QUnit.test("Should reject if no DOM element is found by a control selector", function (assert) {
        var fnDone = assert.async();
        RecordReplay.findDOMElementByControlSelector({
            selector: {
                controlType: "sap.m.App"
            }
        }).catch(function (oError) {
            assert.ok(oError.toString().match(/No DOM element found/), "Should reject when no DOM element matches the selector");
            this.oSearchField.destroy();
            RecordReplay.findDOMElementByControlSelector({
                selector: {
                    controlType: "sap.m.SearchField"
                }
            }).catch(function (oError) {
                assert.ok(oError.toString().match(/No DOM element found/), "Should reject when an error occurs while searching for DOM element");
            });
        }.bind(this)).finally(fnDone);
    });

    QUnit.module("RecordReplay - Interaction", {
        beforeEach: function () {
            this.oActionSpy = sinon.spy();
            this.mSearchFieldSelector = {
                controlType: "sap.m.SearchField"
            };
            this.oSearchField = new SearchField();
            this.oSearchField.attachSearch(this.oActionSpy);
            this.oSearchField.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oSearchField.destroy();
        }
    });

    QUnit.test("Should press on a control", function (assert) {
        var fnDone = assert.async();
        RecordReplay.interactWithControl({
            control: this.mSearchFieldSelector,
            interactionType: RecordReplay.InteractionType.Press
        }).then(function () {
            assert.ok(this.oActionSpy.called, "Should press the search button");
        }.bind(this)).finally(fnDone);
    });

    QUnit.test("Should enter text in control", function (assert) {
        var fnDone = assert.async();
        this.oSearchField.setShowSearchButton(false);
        RecordReplay.interactWithControl({
            control: this.mSearchFieldSelector,
            interactionType: RecordReplay.InteractionType.EnterText,
            enterText: "Test"
        }).then(function () {
            assert.ok(this.oActionSpy.called, "Should enter search text");
            assert.strictEqual(this.oSearchField.getValue(), "Test", "Should enter search text");
        }.bind(this)).finally(function () {
            this.oSearchField.setShowSearchButton(true);
            fnDone();
        }.bind(this));
    });

    QUnit.test("Should complain when interaction is not supported", function (assert) {
        var fnDone = assert.async();
        RecordReplay.interactWithControl({
            control: this.mSearchFieldSelector,
            interactionType: "SomeOtherType"
        }).catch(function (oError) {
            assert.ok(oError.toString().match(/Unsupported interaction type/), "Should reject when interaction is not supported");
        }).finally(fnDone);
    });

    QUnit.test("Should fail if control selector does not match any control", function (assert) {
        var fnDone = assert.async();
        this.oSearchField.destroy();
        RecordReplay.interactWithControl({
            control: {},
            interactionType: RecordReplay.InteractionType.Press
        }).catch(function (oError) {
            assert.ok(oError.toString().match(/No controls found using selector/), "Should reject when control selector matches no controls");
        }).finally(fnDone);
    });

    QUnit.module("RecordReplay - AutoWait", {
        beforeEach: function () {
            this.fnWaitAsyncStub = sinon.spy(sap.ui.test.autowaiter._autoWaiterAsync, "waitAsync");
            this.fnConfigStub = sinon.spy(sap.ui.test.autowaiter._autoWaiterAsync, "extendConfig");
            this.fnHasToWaitStub = sinon.spy(sap.ui.test.autowaiter._autoWaiter, "hasToWait");
        },
        afterEach: function () {
            this.fnWaitAsyncStub.restore();
            this.fnConfigStub.restore();
            this.fnHasToWaitStub.restore();
        }
    });

    QUnit.test("Should wait for UI5 processing to complete", function (assert) {
        var fnDone = assert.async();
        //force polling
        var oTimeout = setTimeout(function() {}, 200);

        RecordReplay.waitForUI5({timeout: 10000, interval: 100}).then(function () {
            assert.ok(this.fnHasToWaitStub.called, "Should call autoWaiter");
            assert.ok(!sap.ui.test.autowaiter._autoWaiter.hasToWait(), "Should wait for processing to end");
            assert.ok(this.fnConfigStub.calledOnce, "Should configure polling parameters");
            assert.ok(this.fnWaitAsyncStub.calledOnce, "Should poll for autoWaiter conditions to be met");
        }.bind(this)).catch(function (error) {
            assert.ok(false, "Should not reach here" + error);
        }).finally(function () {
            clearTimeout(oTimeout);
            fnDone();
        });
    });

    QUnit.test("Should timeout when UI5 processing is not complete", function (assert) {
        var fnDone = assert.async();
        //force polling
        var oTimeout = setTimeout(function() {}, 200);

        RecordReplay.waitForUI5({timeout: 100, interval: 100}).then(function () {
            assert.ok(false, "Should not reach here");
        }).catch(function (oError) {
            assert.ok(this.fnHasToWaitStub.called, "Should call autoWaiter");
            assert.ok(sap.ui.test.autowaiter._autoWaiter.hasToWait(), "Should have pending processing");
            assert.ok(oError.toString().match(/Polling stopped.*there is still pending asynchronous work/), "Should receive polling error message");
        }.bind(this)).finally(function () {
            clearTimeout(oTimeout);
            fnDone();
        });
    });
});
