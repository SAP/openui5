import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import browser from "../utils/browser";
import Press from "sap/ui/test/actions/Press";
var UNCAUGHT_ERROR_URL = "test-resources/sap/ui/core/qunit/opa/fixture/uncaughtError.html";
var FAILING_OPA_TEST_URL = "test-resources/sap/ui/core/qunit/opa/fixture/failingOpaTest.html";
QUnit.module("iFrame - errors");
QUnit.test("Should throw error if the iFrame throws an error", function (assert) {
    var done = assert.async();
    var $container = jQuery("<div class='opaFrameContainer'></div>");
    $container.append("<iframe id=\"OpaFrame\" src=\"" + UNCAUGHT_ERROR_URL + "\"></iframe>");
    jQuery("body").append($container);
    var $Frame = jQuery("#OpaFrame").on("load", function () {
        var fnOnErrorSpy = sinon.spy();
        $Frame[0].contentWindow.onerror = fnOnErrorSpy;
        var fnOriginalOnError = window.onerror;
        window.onerror = function (sErrorMsg, sUrl, iLine, iColumn, oError) {
            assert.ok(sErrorMsg.match(/Error in launched application iFrame:.* TestUncaughtError/));
            assert.ok(sErrorMsg.match("uncaughtError.js\nline: \\d+\ncolumn: \\d+"));
            if (oError) {
                assert.ok(sErrorMsg.match("\niFrame error:.* TestUncaughtError"), "Should include error object if browser supports it");
                assert.ok(sErrorMsg.match("onPress"), "Should contain iFrame stack trace");
            }
        };
        var oOpa5 = new Opa5();
        oOpa5.iStartMyAppInAFrame(UNCAUGHT_ERROR_URL);
        oOpa5.waitFor({
            viewName: "myView",
            id: "myButton",
            actions: new Press()
        });
        oOpa5.iTeardownMyAppFrame();
        oOpa5.emptyQueue().done(function () {
            sinon.assert.calledOnce(fnOnErrorSpy);
            sinon.assert.calledWithMatch(fnOnErrorSpy, "TestUncaughtError");
            window.onerror = fnOriginalOnError;
            done();
        });
    });
});
var iTestIndex = 0;
QUnit.module("iFrame - Tests with errors");
function createMatcherForTestMessage(oOptions) {
    var bIncreased = false;
    return function () {
        if (!bIncreased) {
            iTestIndex++;
            bIncreased = true;
        }
        var $Test = Opa5.getJQuery()("#qunit-tests").children(":nth-child(" + iTestIndex + ")");
        return $Test.hasClass(oOptions.passed ? "pass" : "fail") && $Test.find("li>.test-message");
    };
}
opaTest("Should empty the queue if QUnit times out", function (oOpa) {
    oOpa.iStartMyAppInAFrame(FAILING_OPA_TEST_URL + "?sap-ui-qunittimeout=4000&module=Timeouts");
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            QUnit.assert.strictEqual($Messages.eq(0).text(), "Test timed out");
            var sOpaMessage = $Messages.eq(1).text();
            QUnit.assert.contains(sOpaMessage, /QUnit timeout after 4 seconds/);
            QUnit.assert.contains(sOpaMessage, /This is what Opa logged/);
            QUnit.assert.contains(sOpaMessage, /Executing OPA check function on controls null/);
            QUnit.assert.contains(sOpaMessage, /Check function is:/);
            QUnit.assert.contains(sOpaMessage, /Result of check function is: false/);
            QUnit.assert.contains(sOpaMessage, /Callstack:/);
            if (browser.supportsStacktraces()) {
                QUnit.assert.contains(sOpaMessage, /failingOpaTest/);
            }
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: true
        }),
        success: function ($Messages) {
            QUnit.assert.strictEqual($Messages.eq(0).text(), "Ok from test 2");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: true
        }),
        success: function ($Messages) {
            QUnit.assert.strictEqual($Messages.eq(0).text(), "Ok from test 3");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            QUnit.assert.strictEqual($Messages.eq(0).text(), "Test timed out");
            var sOpaMessage = $Messages.eq(1).text();
            QUnit.assert.contains(sOpaMessage, "QUnit timeout after 4 seconds");
            QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
            QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            var sOpaMessage = $Messages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
            QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
            QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
            QUnit.assert.contains(sOpaMessage, "Callstack:");
            QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            var sOpaMessage = $Messages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
            QUnit.assert.contains(sOpaMessage, "bad luck no button was found");
            QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
            QUnit.assert.contains(sOpaMessage, "global ID 'myGlobalId'");
            QUnit.assert.contains(sOpaMessage, "Callstack:");
            QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            var sOpaMessage = $Messages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Queue was stopped manually");
            QUnit.assert.contains(sOpaMessage, "This is what Opa logged");
            QUnit.assert.contains(sOpaMessage, "Callstack:");
            QUnit.assert.doesNotContain(sOpaMessage, "Log message that should not appear in the error");
        }
    });
    oOpa.iTeardownMyApp();
});
opaTest("Should log exceptions in callbacks currectly", function (oOpa) {
    oOpa.iStartMyAppInAFrame(FAILING_OPA_TEST_URL + "?sap-ui-qunittimeout=4000&module=Exceptions");
    function assertException($Messages, sCallbackName) {
        var sOpaMessage = $Messages.eq(0).text();
        var sFailureReason = ["success", "actions"].indexOf(sCallbackName) > -1 ? "success" : "check";
        Opa5.assert.contains(sOpaMessage, "Failure in Opa " + sFailureReason + " function");
        Opa5.assert.contains(sOpaMessage, "Exception thrown by the testcode:");
        Opa5.assert.contains(sOpaMessage, "Doh! An exception in '" + sCallbackName + "'.");
    }
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            assertException($Messages, "check");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            assertException($Messages, "matchers");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            assertException($Messages, "actions");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            assertException($Messages, "success");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function ($Messages) {
            assertException($Messages, "success");
        }
    });
    oOpa.iTeardownMyApp();
});
opaTest("Should write log messages from an iFrame startup", function (oOpa) {
    oOpa.iStartMyAppInAFrame(FAILING_OPA_TEST_URL + "?sap-ui-qunittimeout=90000&module=IFrame");
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function (aMessages) {
            var sOpaMessage = aMessages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Opa timeout after 1 seconds");
            QUnit.assert.contains(sOpaMessage, "0 out of 1 controls met the matchers pipeline requirements -  sap.ui.test.pipelines.MatcherPipeline");
            QUnit.assert.contains(sOpaMessage, "Matchers found no controls so check function will be skipped -  sap.ui.test.Opa5");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function (aMessages) {
            var sOpaMessage = aMessages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Opa timeout after 2 seconds");
            QUnit.assert.contains(sOpaMessage, "There are 0 open XHRs and 1 open FakeXHRs.");
            QUnit.assert.doesNotContain(sOpaMessage, "Should not happen");
        }
    });
    oOpa.waitFor({
        matchers: createMatcherForTestMessage({
            passed: false
        }),
        success: function (aMessages) {
            var sOpaMessage = aMessages.eq(0).text();
            QUnit.assert.contains(sOpaMessage, "Opa timeout after 2 seconds");
            QUnit.assert.contains(sOpaMessage, "Control 'Element sap.m.Button#__xmlview0--myButton' is busy -  sap.ui.test.matchers._Busy");
            QUnit.assert.contains(sOpaMessage, "0 out of 1 controls met the matchers pipeline requirements -  sap.ui.test.pipelines.MatcherPipeline");
            QUnit.assert.contains(sOpaMessage, "Matchers found no controls so check function will be skipped -  sap.ui.test.Opa5");
            QUnit.assert.doesNotContain(sOpaMessage, "Should not happen");
        }
    });
    oOpa.iTeardownMyApp();
});