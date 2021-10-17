import _ControlSelectorGenerator from "sap/ui/test/selectors/_ControlSelectorGenerator";
import Label from "sap/m/Label";
import Input from "sap/m/Input";
QUnit.module("_LabelFor", {
    beforeEach: function () {
        this.oInput = new Input();
        this.oInputWithLabel = new Input();
        this.oLabel = new Label({ text: "myLabel" });
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
    var fnDone = assert.async();
    _ControlSelectorGenerator._generate({ control: this.oInputWithLabel }).then(function (mSelector) {
        assert.strictEqual(mSelector.labelFor.text, "myLabel", "Should generate selector with the label text");
    }).finally(fnDone);
});
QUnit.test("Should not generate selector for control with no labels", function (assert) {
    var fnDone = assert.async();
    _ControlSelectorGenerator._generate({ control: this.oInput, shallow: true }).catch(function (oError) {
        assert.ok(oError.message.match(/Could not generate a selector for control/), "Should not generate selector");
    }).finally(fnDone);
});