import PipelineFactory from "sap/ui/test/pipelines/PipelineFactory";
QUnit.module("positive tests");
QUnit.test("Should wrap a single function", function (assert) {
    var fnMatcher = function () {
    };
    var oFactory = new PipelineFactory({
        name: "Matcher",
        functionName: "isMatching"
    });
    var aResult = oFactory.create(fnMatcher);
    assert.ok(Array.isArray(aResult), "Casted a single function to an array");
    assert.strictEqual(aResult[0].isMatching, fnMatcher, "The resulting object has the anonymous function on a functionName property");
});
QUnit.test("Should wrap a single object", function (assert) {
    var oObjectContainingTheFunction = {
        myFunction: function () { }
    };
    var oFactory = new PipelineFactory({
        name: "Matcher",
        functionName: "myFunction"
    });
    var aResult = oFactory.create(oObjectContainingTheFunction);
    assert.ok(Array.isArray(aResult), "Casted a single object to an array");
    assert.strictEqual(aResult[0], oObjectContainingTheFunction, "The resulting object was untouched");
});
QUnit.test("Should wrap multiple functions", function (assert) {
    var fnAnonymousFunction = function () {
    }, oObjectWithFunction = {
        someName: function () { }
    };
    var oFactory = new PipelineFactory({
        name: "Matcher",
        functionName: "someName"
    });
    var aResult = oFactory.create([fnAnonymousFunction, oObjectWithFunction]);
    assert.ok(Array.isArray(aResult), "Casted a single function to an array");
    assert.strictEqual(aResult[0].someName, fnAnonymousFunction, "The resulting object has the anonymous function on a functionName property");
    assert.strictEqual(aResult[1], oObjectWithFunction, "The matcher was untouched since it was already implementing the contract");
});