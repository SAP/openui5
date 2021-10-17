import ControlIterator from "sap/ui/qunit/utils/ControlIterator";
sap.ui.loader.config({
    map: {
        "*": {
            "sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
        }
    }
});
QUnit.test("Testing all controls", function (assert) {
    var testDone = assert.async();
    ControlIterator.run(function (sControlName, oControlClass, oInfo) {
        assert.ok(true, sControlName + " would be tested now");
    }, {
        done: function (oResult) {
            testDone();
        }
    });
});