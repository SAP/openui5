import ControlIterator from "sap/ui/qunit/utils/ControlIterator";
sap.ui.loader.config({
    map: {
        "*": {
            "sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
        }
    }
});
ControlIterator.run(function (sControlName, oControlClass, oInfo) {
    QUnit.test("Testing control " + sControlName, function (assert) {
        assert.ok(true, sControlName + " would be tested now");
    });
}, {
    done: function (oResult) {
        QUnit.start();
    }
});