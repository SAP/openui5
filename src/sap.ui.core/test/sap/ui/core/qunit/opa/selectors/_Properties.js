/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_ControlSelectorGenerator",
    "sap/m/Input"
], function (_ControlSelectorGenerator, Input) {
    "use strict";

    QUnit.module("_Properties", {
        beforeEach: function () {
            this.oInput = new Input({placeholder: "myText"});
            this.oInput.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oInput.destroy();
        }
    });

    QUnit.test("Should generate selector for property", function (assert) {
        var fnDone = assert.async();
       _ControlSelectorGenerator._generate({control: this.oInput, includeAll: true})
            .then(function (aSelectors) {
                assert.strictEqual(aSelectors[0][0].properties.valueState, "None", "Should generate selector with property valueState");
                assert.strictEqual(aSelectors[0][1].properties.placeholder, "myText", "Should generate selector with property placeholder");
                assert.strictEqual(aSelectors[0][2].properties.editable, true, "Should generate selector with property type");
                assert.strictEqual(aSelectors[0][3].properties.type, "Text", "Should generate selector with property type");
            }).finally(fnDone);
    });
});
