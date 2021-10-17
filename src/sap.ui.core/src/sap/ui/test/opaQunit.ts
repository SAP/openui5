import URI from "sap/ui/thirdparty/URI";
import Opa from "sap/ui/test/Opa";
import Opa5 from "sap/ui/test/Opa5";
import jQueryDOM from "sap/ui/thirdparty/jquery";
import QUnitPause from "sap/ui/test/qunitPause";
QUnitPause.setupAfterQUnit();
QUnit.begin(function (oDetails) {
    if (sap && sap.ui && jQueryDOM("#qunit-userAgent").length > 0) {
        jQueryDOM("#qunit-userAgent")[0].innerText += "; UI5: " + sap.ui.version;
    }
    Opa._usageReport.begin({ uri: new URI().toString(), totalTests: oDetails.totalTests });
});
QUnit.moduleStart(function (oDetails) {
    Opa._usageReport.moduleStart(oDetails);
});
QUnit.testStart(function () {
    Opa._usageReport.testStart();
});
QUnit.testDone(function (oDetails) {
    Opa._usageReport.testDone(oDetails);
    var bQUnitTimeout = oDetails.assertions.some(function (oAssertion) {
        return !oAssertion.result && oAssertion.message === "Test timed out";
    });
    if (bQUnitTimeout) {
        Opa._stopQueue({ qunitTimeout: QUnit.config.testTimeout / 1000 });
    }
});
QUnit.moduleDone(function (oDetails) {
    Opa._usageReport.moduleDone(oDetails);
});
QUnit.done(function (oDetails) {
    Opa._usageReport.done(oDetails);
});
window.opaSkip = opaSkip;
window.opaTest = opaTest;
window.opaTodo = QUnit.todo ? opaTodo : opaTest;
function opaTest() {
    callQUnit("test", arguments, function (assert, fnDone) {
        Opa._usageReport.opaEmpty();
        resetOPA();
        fnDone();
    }, function (assert, fnDone, oOptions) {
        Opa._usageReport.opaEmpty(oOptions);
        assert.ok(false, oOptions.errorMessage);
        resetOPA();
        if (!QUnitPause.shouldPauseOnAssert()) {
            QUnitPause.emitPause();
        }
        var oPauseDeferred = jQueryDOM.Deferred();
        QUnitPause.onResume(function () {
            if (!oOptions.qunitTimeout) {
                setTimeout(fnDone, 0);
            }
            oPauseDeferred.resolve();
        });
        return oPauseDeferred.promise();
    });
}
function opaTodo() {
    callQUnit("todo", arguments, function (assert, fnDone) {
        resetOPA();
        fnDone();
    }, function (assert, fnDone, oOptions) {
        if (oOptions.qunitTimeout) {
            resetOPA();
        }
        else {
            assert.ok(false, oOptions.errorMessage);
            resetOPA();
            setTimeout(fnDone, 0);
        }
    });
}
function opaSkip(testName, expected, callback, async) {
    configQUnit();
    var fnTestBody = function () { };
    if (isQUnit2()) {
        QUnit.skip(testName, fnTestBody);
    }
    else {
        QUnit.skip(testName, expected, fnTestBody, async);
    }
}
function callQUnit(sQUnitFn, aArgs, fnDone, fnFail) {
    configQUnit();
    var mTestBodyArgs = {
        testName: aArgs[0],
        expected: aArgs.length === 2 ? null : aArgs[1],
        callback: aArgs.length === 2 ? aArgs[1] : aArgs[2],
        async: aArgs[3]
    };
    if (isQUnit2() && typeof mTestBodyArgs.async !== "undefined") {
        throw new Error("Qunit >=2.0 is used, which no longer supports the 'async' parameter for tests.");
    }
    var fnTestBody = createTestBody(mTestBodyArgs, fnDone, fnFail);
    var mQUnitFnArgs = [mTestBodyArgs.testName, fnTestBody, mTestBodyArgs.async];
    if (!isQUnit2()) {
        mQUnitFnArgs.splice(1, 0, mTestBodyArgs.expected);
    }
    QUnit[sQUnitFn].apply(this, mQUnitFnArgs);
}
function createTestBody(mConfig, fnDone, fnFail) {
    return function (assert) {
        var fnAsync = assert.async();
        Opa.config.testName = mConfig.testName;
        Opa.assert = assert;
        Opa5.assert = assert;
        if (isQUnit2() && mConfig.expected !== null) {
            assert.expect(mConfig.expected);
        }
        mConfig.callback.call(this, Opa.config.arrangements, Opa.config.actions, Opa.config.assertions);
        QUnitPause.setupBeforeOpaTest();
        Opa.emptyQueue().done(function () {
            fnDone(assert, fnAsync);
        }).fail(function (oOptions) {
            fnFail(assert, fnAsync, oOptions);
        });
    };
}
function configQUnit() {
    if (!QUnit.config.testTimeout || QUnit.config.testTimeout === 30000) {
        QUnit.config.testTimeout = 90000;
    }
    QUnit.config.reorder = false;
    QUnit.config.scrolltop = false;
}
function resetOPA() {
    Opa.assert = undefined;
    Opa5.assert = undefined;
}
function isQUnit2() {
    return QUnit.test.length === 2;
}
QUnit.config.urlConfig.push({
    id: "opaExecutionDelay",
    value: {
        400: "fast",
        700: "medium",
        1000: "slow"
    },
    label: "Opa speed",
    tooltip: "Each waitFor will be delayed by a number of milliseconds. If it is not set Opa will execute the tests as fast as possible"
});
Opa5._getEventProvider().attachEvent("onExtensionAfterInit", function (oEvent) {
    var oParams = oEvent.getParameters();
    if (oParams.extension.getAssertions) {
        var oAssertions = oParams.extension.getAssertions();
        jQueryDOM.each(oAssertions, function (sName, fnAssertion) {
            QUnit.assert[sName] = function () {
                var qunitThis = this;
                var oAssertionPromise = fnAssertion.apply(oParams.appWindow, arguments).always(function (oResult) {
                    qunitThis.push(oResult.result, oResult.actual, oResult.expected, oResult.message);
                });
                Opa.config.assertions._schedulePromiseOnFlow(oAssertionPromise);
            };
        });
    }
});