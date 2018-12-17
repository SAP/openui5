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

    function stubSelectors() {
        var oTestSelector = {property: "text"};
        return aSelectorGenerators.map(function (selector, i) {
            var fnStub = sinon.stub(selector.prototype, "_generate");
            fnStub.returns(i === 4 ? [oTestSelector] : oTestSelector);
            return fnStub;
        });
    }

    QUnit.module("_ControlSelectorGenerator", {
        beforeEach: function () {
            this.aGenerateStubs = stubSelectors();
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

    QUnit.test("Should continue if ancestor selector generation throws error", function (assert) {
        var oTestControl = {id: "testControl"};
        var fnAncestorStub = sinon.stub(aSelectorGenerators[0].prototype, "_getAncestors");
        var fnOriginalGenerate = _ControlSelectorGenerator._generate;
        _ControlSelectorGenerator._generate = function (oOptions) {
            if (oOptions.validationRoot === oTestControl || oOptions.control === oTestControl) {
                throw new Error("Test");
            }
            return fnOriginalGenerate(oOptions);
        };

        fnAncestorStub.returns({validation: oTestControl});
        var oResult = _ControlSelectorGenerator._generate({control: this.oText});
        assert.strictEqual(oResult.property, "text", "Should not throw error if relative selector throws error but there are other matching selectors");

        fnAncestorStub.returns({selector: oTestControl});
        oResult = _ControlSelectorGenerator._generate({control: this.oText});
        assert.strictEqual(oResult.property, "text", "Should not throw error if generation for ancestor throws error but there are other matching selectors");

        fnAncestorStub.restore();
        _ControlSelectorGenerator._generate = fnOriginalGenerate;
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
