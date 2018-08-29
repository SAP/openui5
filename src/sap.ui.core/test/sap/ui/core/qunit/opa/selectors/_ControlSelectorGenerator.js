/*global QUnit, sinon*/
sap.ui.define([
    "sap/ui/test/selectors/_ControlSelectorGenerator",
    "sap/ui/thirdparty/jquery",
    "sap/m/Text",
    "sap/ui/test/_ControlFinder",
    // only selector generators below; import in priority order
    "sap/ui/test/selectors/_GlobalID",
    "sap/ui/test/selectors/_ViewID",
    "sap/ui/test/selectors/_LabelFor",
    "sap/ui/test/selectors/_BindingPath",
    "sap/ui/test/selectors/_Properties",
    "sap/ui/test/selectors/_DropdownItem"
], function (_ControlSelectorGenerator, $, Text, _ControlFinder) {
    "use strict";

    var aSelectorGenerators = Array.prototype.slice.call(arguments, 4);

    QUnit.module("_ControlSelectorGenerator - order", {
        beforeEach: function () {
            this.aGenerateStubs = [];
            var oTestSelector = {property: "text"};
            aSelectorGenerators.forEach(function (selector, i) {
                var fnStub = sinon.stub(selector.prototype, "_generate");
                fnStub.returns(i === 4 ? [oTestSelector] : oTestSelector);
                this.aGenerateStubs.push(fnStub);
            }.bind(this));
            this.fnFindControlsStub = sinon.stub(_ControlFinder, "_findControls");
            this.fnFindControlsStub.returns([{control: "test"}]);
            this.oText = new Text();
            this.oText.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oText.destroy();
            this.fnFindControlsStub.restore();
            this.aGenerateStubs.forEach(function (fnStub) {
                fnStub.restore();
            });
        }
    });

    QUnit.test("Should generate selectors in correct order", function (assert) {
        _ControlSelectorGenerator._generate({control: this.oText});
        var i = 0;
        while (i < this.aGenerateStubs.length - 1) {
            assert.ok(this.aGenerateStubs[i].calledBefore(this.aGenerateStubs[i + 1]), "Should test selectors in priority order");
            i += 1;
        }
    });

    QUnit.test("Should test every selector", function (assert) {
        _ControlSelectorGenerator._generate({control: this.oText});
        this.aGenerateStubs.forEach(function (fnStub) {
            assert.ok(this.fnFindControlsStub.calledAfter(fnStub), "Should test a selectors after every generation");
        }.bind(this));
    });
});
