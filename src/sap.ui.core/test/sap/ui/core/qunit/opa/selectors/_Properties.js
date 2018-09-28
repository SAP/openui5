/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_Properties",
    "sap/m/Input"
], function (_Properties, Input) {
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
        var oProperties = new _Properties();
        var aSelectors = oProperties.generate(this.oInput);
        aSelectors.forEach(function (mSelector) {
            if (mSelector.properties.placeholder) {
                assert.strictEqual(mSelector.properties.placeholder, "myText", "Should generate selector with property");
            }
        });
    });
});
