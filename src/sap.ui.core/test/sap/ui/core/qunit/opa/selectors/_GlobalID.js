/*global QUnit */
sap.ui.define([
    "sap/ui/test/selectors/_GlobalID",
    "sap/m/Button"
], function (_GlobalID, Button) {
    "use strict";

    QUnit.module("_GlobalID", {
        beforeEach: function () {
            this.oStableIDButton = new Button("myButton");
            this.oGeneratedIDButton = new Button();
            this.oStableIDButton.placeAt("qunit-fixture");
            this.oGeneratedIDButton.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oStableIDButton.destroy();
            this.oGeneratedIDButton.destroy();
        }
    });

    QUnit.test("Should generate selector for control with stable ID", function (assert) {
        var oGlobalID = new _GlobalID();
        var mSelector = oGlobalID.generate(this.oStableIDButton);
        assert.strictEqual(mSelector.id, "myButton", "Should include global ID");
        assert.ok(!mSelector.controlType, "Should not include controlType matcher");
    });

    QUnit.test("Should return undefined for control with generated ID", function (assert) {
        var oGlobalID = new _GlobalID();
        var mSelector = oGlobalID.generate(this.oGeneratedIDButton);
        assert.ok(!mSelector, "Should not generate selector");
    });
});
