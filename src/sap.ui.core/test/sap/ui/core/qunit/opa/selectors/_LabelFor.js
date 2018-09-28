/*global QUnit*/
sap.ui.define([
    "sap/ui/test/selectors/_LabelFor",
    "sap/m/Label",
    "sap/m/Input"
], function (_LabelFor, Label, Input) {
    "use strict";

    QUnit.module("_LabelFor", {
        beforeEach: function () {
            this.oInput = new Input();
            this.oInputWithLabel = new Input();
            this.oLabel = new Label({text: "myLabel"});
            this.oLabel.setLabelFor(this.oInputWithLabel);
            this.oInput.placeAt("qunit-fixture");
            this.oInputWithLabel.placeAt("qunit-fixture");
            this.oLabel.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oInput.destroy();
            this.oInputWithLabel.destroy();
            this.oLabel.destroy();
        }
    });

    QUnit.test("Should generate selector for control with associated label", function (assert) {
        var oLabelFor = new _LabelFor();
        var mSelector = oLabelFor.generate(this.oInputWithLabel);
        assert.strictEqual(mSelector.labelFor.text, "myLabel", "Should generate selector with the label text");
    });

    QUnit.test("Should not generate selector for control with no labels", function (assert) {
        var oLabelFor = new _LabelFor();
        var mSelector = oLabelFor.generate(this.oInput);
        assert.ok(!mSelector, "Should not generate selector");
    });
});
