import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import Button from "sap/m/Button";
QUnit.module("PropertyStrictEquals", {
    beforeEach: function () {
        this.oButton = new Button("myButton");
    },
    afterEach: function () {
        this.oButton.destroy();
    }
});
[{
        textValue: "foo",
        matcherValue: "foo",
        expected: true,
        logMessage: ""
    }, {
        textValue: "foo",
        matcherValue: "bar",
        expected: false,
        logMessage: "Control 'Element sap.m.Button#myButton' property 'text' has value 'foo' but should have value 'bar'"
    }, {
        textValue: "",
        matcherValue: null,
        expected: false,
        logMessage: "Control 'Element sap.m.Button#myButton' property 'text' has value '' but should have value 'undefined'"
    }, {
        textValue: "{foo",
        matcherValue: "{foo",
        expected: true,
        logMessage: ""
    }].forEach(function (oTestCase) {
    QUnit.test("Should strictmatch for " + JSON.stringify(oTestCase), function (assert) {
        this.oButton.setText(oTestCase.textValue);
        var oMatcher = new PropertyStrictEquals({
            name: "text",
            value: oTestCase.matcherValue
        });
        var fnLogSpy = sinon.spy(oMatcher._oLogger, "debug");
        var bResult = oMatcher.isMatching(this.oButton);
        assert.strictEqual(bResult, oTestCase.expected, "Strict match");
        if (oTestCase.logMessage) {
            sinon.assert.calledWith(fnLogSpy, oTestCase.logMessage);
        }
        else {
            sinon.assert.notCalled(fnLogSpy);
        }
    });
});
QUnit.test("Should complain if control does not have a property", function (assert) {
    var oMatcher = new PropertyStrictEquals({
        name: "aPropertyThatWillNeverBeAddedToTheButton",
        value: "anything"
    });
    var oErrorSpy = this.spy(oMatcher._oLogger, "error");
    var bResult = oMatcher.isMatching(this.oButton);
    assert.strictEqual(bResult, false, "Did not match");
    sinon.assert.calledWith(oErrorSpy, "Control 'Element sap.m.Button#myButton' does not have a property 'aPropertyThatWillNeverBeAddedToTheButton'");
});