import $ from "jquery.sap.global";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import opaTest from "sap/ui/test/opaQunit";
import Opa5 from "sap/ui/test/Opa5";
import GherkinTestGenerator from "sap/ui/test/gherkin/GherkinTestGenerator";
import dataTableUtils from "sap/ui/test/gherkin/dataTableUtils";
import StepDefinitions from "sap/ui/test/gherkin/StepDefinitions";
import componentLauncher from "sap/ui/test/launchers/componentLauncher";
import iFrameLauncher from "sap/ui/test/launchers/iFrameLauncher";
export class opa5TestHarness {
    private static _fnAlternateTestStepGenerator(oStep: any) {
        var sContext = oStep.keyword;
        var sFinalFunction = oStep.text;
        var aMatch = oStep.text.match(/(.*?)\s*:\s*(.*)/);
        if (aMatch) {
            sContext += "." + dataTableUtils.normalization.camelCase(aMatch[1]);
            sFinalFunction = aMatch[2];
        }
        sFinalFunction = dataTableUtils.normalization.camelCase(sFinalFunction);
        var sToEval = sContext + "." + sFinalFunction + "();";
        var func;
        if (/^(Given|When|Then)(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(sContext) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(sFinalFunction)) {
            func = function (Given, When, Then) {
                Log.info("[GHERKIN] Generated Step: " + sToEval);
                var oContext = ObjectPath.get(sContext, { Given: Given, When: When, Then: Then });
                if (oContext && typeof oContext[sFinalFunction] === "function") {
                    oContext[sFinalFunction]();
                }
                else {
                    throw new TypeError(sContext + "." + sFinalFunction + " is not a function");
                }
            };
        }
        else {
            func = function (Given, When, Then) {
                Log.info("[GHERKIN] Generated Step (eval): " + sToEval);
                eval(sToEval);
            };
        }
        return {
            isMatch: true,
            text: oStep.text,
            regex: /Generated Step/,
            parameters: [],
            func: func,
            _sToEval: sToEval
        };
    }
    static test(args: any) {
        if (!args || typeof args !== "object") {
            throw new Error("opa5TestHarness.test: input all arguments via a single object");
        }
        if (typeof args.featurePath !== "string" && !(args.featurePath instanceof String)) {
            throw new Error("opa5TestHarness.test: parameter 'featurePath' must be a valid string");
        }
        if (args.steps && ((typeof args.steps !== "function") || !((new args.steps())._generateTestStep))) {
            throw new Error("opa5TestHarness.test: if specified, parameter 'steps' must be a valid StepDefinitions constructor");
        }
        if (!args.steps && (args.generateMissingSteps !== true)) {
            throw new Error("opa5TestHarness.test: if parameter 'generateMissingSteps' is not true then parameter 'steps' must be a valid StepDefinitions constructor");
        }
        if (args.generateMissingSteps && (typeof args.generateMissingSteps !== "boolean")) {
            throw new Error("opa5TestHarness.test: if specified, parameter 'generateMissingSteps' must be a valid boolean");
        }
        if (!args.steps) {
            args.steps = StepDefinitions;
        }
        var fnTestStepGenerator = (args.generateMissingSteps) ? this._fnAlternateTestStepGenerator : null;
        var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps, fnTestStepGenerator);
        var oFeatureTest = oTestGenerator.generate();
        QUnit.module(oFeatureTest.name, {
            beforeEach: function () {
                oTestGenerator.setUp();
            },
            afterEach: function () {
                if (this._oOpa5.hasAppStarted()) {
                    this._oOpa5.iTeardownMyApp();
                }
                oTestGenerator.tearDown();
            }.bind(this)
        });
        Log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
        oFeatureTest.testScenarios.forEach(function (oTestScenario) {
            var fnTestFunction = (!oFeatureTest.skip && !oTestScenario.skip) ? this._opaTest : QUnit.skip;
            fnTestFunction(oTestScenario.name, function (Given, When, Then) {
                Log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
                oTestScenario.testSteps.forEach(function (oTestStep) {
                    this._oOpa5.waitFor({
                        viewName: "",
                        success: function () {
                            Log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
                            Opa5.assert.ok(oTestStep.isMatch, oTestStep.text);
                            if (oTestStep.isMatch) {
                                QUnit.config.current.assertions.pop();
                            }
                            oTestStep.parameters = (oTestStep.parameters || []).concat([Given, When, Then]);
                            oTestGenerator.execute(oTestStep, Opa5.assert);
                        }
                    });
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
}
QUnit.config.urlConfig.splice(0, 0, {
    id: "closeFrame",
    label: "Close Frame",
    tooltip: "Closes the application-under-test's frame after all tests have executed",
    value: "true"
});
QUnit.done(function () {
    if (jQuery.sap.getUriParameters().get("closeFrame")) {
        Opa5.emptyQueue();
    }
});