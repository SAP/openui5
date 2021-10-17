import Element from "sap/ui/core/Element";
var testObject = { id: "testObject" };
QUnit.module("Delegates", {
    beforeEach: function (assert) {
        var that = this;
        this.resetCounters();
        function testFunction() {
            assert.ok(true, "this test only checks whether the function is executed");
            that.counter++;
            that.lastThisId = this.id ? this.id : this.getId();
        }
        this.element = new Element();
        this.del1 = {
            id: "del1",
            onSomeEvent: testFunction
        };
        this.del2 = {
            id: "del2",
            onSomeEvent: testFunction
        };
    },
    afterEach: function () {
        this.element.destroy();
    },
    resetCounters: function () {
        this.counter = 0;
        this.lastThisId = undefined;
    }
});
QUnit.test("Adding Delegates", function (assert) {
    var element = this.element;
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
    assert.equal(element.aDelegates.length, 0, "Element should have no after delegates");
    element.addDelegate(this.del1);
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
    assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");
    element.addDelegate(this.del2, true);
    assert.equal(element.aBeforeDelegates.length, 1, "Element should have one before delegate");
    assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");
});
QUnit.test("Triggering Delegates", function (assert) {
    assert.expect(4);
    var element = this.element;
    element.addDelegate(this.del1);
    element.addDelegate(this.del2, true);
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.counter, 2, "event handler method should be called twice");
    assert.equal(this.lastThisId, "del1");
});
QUnit.test("Removing Delegates", function (assert) {
    var element = this.element;
    element.addDelegate(this.del1);
    element.addDelegate(this.del2, true);
    element.removeDelegate(this.del1);
    assert.equal(element.aBeforeDelegates.length, 1, "Element should have one before delegate");
    assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.counter, 1, "event handler method should be called once");
    element.removeDelegate(this.del2);
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegate");
    assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");
});
QUnit.test("Other 'this' context", function (assert) {
    var element = this.element;
    element.addDelegate(this.del1, testObject);
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.lastThisId, "testObject", "the test object should have been the this context");
});
QUnit.test("Cloning", function (assert) {
    var element = this.element;
    element.addDelegate(this.del1, testObject);
    element.addDelegate(this.del2, false, true);
    var clone = element.clone();
    var oEvent = jQuery.Event("SomeEvent");
    clone._handleEvent(oEvent);
    assert.equal(this.counter, 1, "only one handler should be cloned and executed");
    assert.equal(this.lastThisId, "del2", "the second delegate is the one which should be executed");
    assert.equal(clone.aBeforeDelegates.length, 0, "Clone should have no before delegates");
    assert.equal(clone.aDelegates.length, 1, "Clone should have one after delegate");
});
QUnit.test("Cloned 'this' context", function (assert) {
    var element = this.element;
    var originalId = element.getId();
    element.addDelegate(this.del2, false, element, true);
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.counter, 1, "one handler should be cloned and executed");
    assert.equal(this.lastThisId, originalId, "the original element should be the this context");
    var clone = element.clone();
    var cloneId = clone.getId();
    this.lastThisId = undefined;
    this.counter = 0;
    oEvent = jQuery.Event("SomeEvent");
    clone._handleEvent(oEvent);
    assert.equal(this.counter, 1, "one handler should be cloned and executed");
    assert.equal(this.lastThisId, cloneId, "the clone should be the this context");
});
QUnit.test("addEventDelegate method", function (assert) {
    var element = this.element;
    element.addEventDelegate(this.del1, testObject);
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
    assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.counter, 1, "the handler should be executed");
    assert.equal(this.lastThisId, "testObject", "the this context should be set correctly");
    var clone = element.clone();
    this.lastThisId = undefined;
    this.counter = 0;
    oEvent = jQuery.Event("SomeEvent");
    clone._handleEvent(oEvent);
    assert.equal(this.counter, 1, "the handler should be cloned and executed");
    assert.equal(this.lastThisId, "testObject", "the this context should be set correctly");
    assert.equal(clone.aBeforeDelegates.length, 0, "Clone should have no before delegates");
    assert.equal(clone.aDelegates.length, 1, "Clone should have one after delegate");
});
QUnit.test("removeEventDelegate method", function (assert) {
    var element = this.element;
    element.addEventDelegate(this.del1, testObject);
    element.removeEventDelegate(this.del1);
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
    assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");
    var oEvent = jQuery.Event("SomeEvent");
    element._handleEvent(oEvent);
    assert.equal(this.counter, 0, "the handler should not be executed");
});
QUnit.test("removeDelegate from within delegate", function (assert) {
    var oDelegate1 = {
        onAfterRendering: function () {
            assert.ok(true, "Invoke onAfterRendering on delegate #1");
            element.removeEventDelegate(oDelegate1);
        }
    };
    var oDelegate2 = {
        onAfterRendering: function () {
            assert.ok(true, "Invoke onAfterRendering on delegate #2");
            element.removeEventDelegate(oDelegate2);
            assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
            assert.equal(element.aDelegates.length, 0, "Element should have no after delegates");
        }
    };
    var element = this.element;
    element.addEventDelegate(oDelegate1);
    element.addEventDelegate(oDelegate2);
    assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
    assert.equal(element.aDelegates.length, 2, "Element should have two after delegates");
    var oEvent = jQuery.Event("AfterRendering");
    element._handleEvent(oEvent);
});