import $ from "jquery.sap.global";
import GherkinTestGenerator from "sap/ui/test/gherkin/GherkinTestGenerator";
export class qUnitTestHarness {
    static test(args: any) {
        if (!args || typeof args !== "object") {
            throw new Error("qUnitTestHarness.test: input all arguments via a single object");
        }
        if (typeof args.featurePath !== "string" && !(args.featurePath instanceof String)) {
            throw new Error("qUnitTestHarness.test: parameter 'featurePath' must be a valid string");
        }
        if ((typeof args.steps !== "function") || !((new args.steps())._generateTestStep)) {
            throw new Error("qUnitTestHarness.test: parameter 'steps' must be a valid StepDefinitions constructor");
        }
        var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps);
        var oFeatureTest = oTestGenerator.generate();
        QUnit.module(oFeatureTest.name, {
            beforeEach: function () {
                oTestGenerator.setUp();
            },
            afterEach: function () {
                oTestGenerator.tearDown();
            }
        });
        $.sap.log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
        oFeatureTest.testScenarios.forEach(function (oTestScenario) {
            var fnTestFunction = (!oFeatureTest.skip && !oTestScenario.skip) ? QUnit.test : QUnit.skip;
            fnTestFunction(oTestScenario.name, function (assert) {
                $.sap.log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
                oTestScenario.testSteps.forEach(function (oTestStep) {
                    $.sap.log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
                    assert.ok(oTestStep.isMatch, oTestStep.text);
                    if (oTestStep.isMatch) {
                        QUnit.config.current.assertions.pop();
                    }
                    oTestGenerator.execute(oTestStep, assert);
                });
            });
        });
    }
}