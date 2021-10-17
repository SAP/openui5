import FESR from "sap/ui/performance/trace/FESR";
import Interaction from "sap/ui/performance/trace/Interaction";
import XHRInterceptor from "sap/ui/performance/XHRInterceptor";
import Passport from "sap/ui/performance/trace/Passport";
var requestCounter = 0;
QUnit.module("FESR", {
    beforeEach: function (assert) {
        assert.notOk(FESR.getActive(), "FESR is deactivated");
    },
    afterEach: function (assert) {
        assert.notOk(FESR.getActive(), "FESR is deactivated");
    },
    dummyRequest: function () {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "resources/ui5loader.js?noCache=" + Date.now() + "-" + (++requestCounter), false);
        xhr.send();
        return xhr;
    }
});
QUnit.test("activation", function (assert) {
    assert.expect(9);
    assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
    FESR.setActive(true);
    assert.ok(FESR.getActive(), "FESR should must be active");
    assert.ok(XHRInterceptor.isRegistered("FESR", "open"), "FESR must be registered");
    assert.ok(XHRInterceptor.isRegistered("PASSPORT_ID", "open"), "PASSPORT_ID must be registered");
    assert.ok(XHRInterceptor.isRegistered("PASSPORT_HEADER", "open"), "PASSPORT_HEADER must be registered");
    FESR.setActive(false);
    assert.notOk(FESR.getActive(), "should must not be active");
    assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
});
QUnit.test("onBeforeCreated hook: interactionType 1", function (assert) {
    assert.expect(8);
    var oHandle = {
        stepName: "undetermined_startup",
        appNameLong: "undetermined",
        appNameShort: "undetermined",
        interactionType: 1
    };
    var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
    var fnOnBeforeCreated = FESR.onBeforeCreated;
    FESR.setActive(true);
    Interaction.notifyStepStart("startup", true);
    FESR.onBeforeCreated = function (oFESRHandle, oInteraction) {
        assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
        delete oFESRHandle.timeToInteractive;
        assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
        assert.throws(function () { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
        assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
        return {
            stepName: "newStepName",
            appNameLong: "newAppNameLong",
            appNameShort: "newAppNameShort",
            timeToInteractive: 1000,
            interactionType: 1
        };
    };
    var oXhrHandle = this.dummyRequest();
    Interaction.end(true);
    oXhrHandle.abort();
    oXhrHandle = this.dummyRequest();
    assert.ok(oHeaderSpy.args.some(function (args) {
        if (args[0] === "SAP-Perf-FESRec") {
            var values = args[1].split(",");
            return values[4] === "1000";
        }
    }), "Found the FESR header field values.");
    assert.ok(oHeaderSpy.args.some(function (args) {
        if (args[0] === "SAP-Perf-FESRec-opt") {
            var values = args[1].split(",");
            return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "1" && values[19] === "newAppNameLong";
        }
    }), "Found the optional FESR header field values.");
    Interaction.end(true);
    Interaction.clear();
    FESR.onBeforeCreated = fnOnBeforeCreated;
    FESR.setActive(false);
    FESR.onBeforeCreated = fnOnBeforeCreated;
    oHeaderSpy.restore();
    oXhrHandle.abort();
});
QUnit.test("onBeforeCreated hook: interactionType 2", function (assert) {
    assert.expect(8);
    var oHandle = {
        stepName: "undetermined_other_interaction",
        appNameLong: "undetermined",
        appNameShort: "undetermined",
        interactionType: 2
    };
    var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
    var fnOnBeforeCreated = FESR.onBeforeCreated;
    FESR.setActive(true);
    Interaction.end(true);
    Interaction.start("other_interaction");
    FESR.onBeforeCreated = function (oFESRHandle, oInteraction) {
        assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
        delete oFESRHandle.timeToInteractive;
        assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
        assert.throws(function () { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
        assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
        return {
            stepName: "newStepName",
            appNameLong: "newAppNameLong",
            appNameShort: "newAppNameShort",
            timeToInteractive: 1000,
            interactionType: 2
        };
    };
    var oXhrHandle = this.dummyRequest();
    Interaction.end(true);
    oXhrHandle.abort();
    oXhrHandle = this.dummyRequest();
    assert.ok(oHeaderSpy.args.some(function (args) {
        if (args[0] === "SAP-Perf-FESRec") {
            var values = args[1].split(",");
            return values[4] === "1000";
        }
    }), "Found the FESR header field values.");
    assert.ok(oHeaderSpy.args.some(function (args) {
        if (args[0] === "SAP-Perf-FESRec-opt") {
            var values = args[1].split(",");
            return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "2" && values[19] === "newAppNameLong";
        }
    }), "Found the optional FESR header field values.");
    Interaction.end(true);
    Interaction.clear();
    FESR.onBeforeCreated = fnOnBeforeCreated;
    FESR.setActive(false);
    FESR.onBeforeCreated = fnOnBeforeCreated;
    oHeaderSpy.restore();
    oXhrHandle.abort();
});
QUnit.test("Passport Integration - Passport Action in Client ID field", function (assert) {
    assert.expect(6);
    var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
    var oPassportHeaderSpy = sinon.spy(Passport, "header");
    FESR.setActive(true);
    Interaction.notifyStepStart("startup", "startup", true);
    var oXhrHandle = this.dummyRequest();
    var sPassportAction = oPassportHeaderSpy.args[0][4];
    oHeaderSpy.reset();
    oPassportHeaderSpy.reset();
    Interaction.end(true);
    oXhrHandle.abort();
    oXhrHandle = this.dummyRequest();
    assert.ok(oHeaderSpy.args.some(function (args) {
        if (args[0] === "SAP-Perf-FESRec") {
            var sAction = args[1].split(",")[6];
            var bStepCountAvailable = sAction.match("^.*\\d$");
            assert.ok(bStepCountAvailable, "count was properly added");
            var bEquals = sAction === sPassportAction;
            assert.ok(bEquals, "action string matches");
            return bEquals && bStepCountAvailable;
        }
    }), "Found the FESR header field values.");
    assert.strictEqual(oHeaderSpy.args.filter(function (args) {
        return args[0] === "SAP-PASSPORT";
    }).length, 1, "Header is set once");
    Interaction.end(true);
    Interaction.clear();
    FESR.setActive(false);
    oHeaderSpy.restore();
    oPassportHeaderSpy.restore();
    oXhrHandle.abort();
});
QUnit.test("Beacon URL", function (assert) {
    assert.expect(4);
    FESR.setActive(true, "example.url");
    assert.equal(FESR.getBeaconURL(), "example.url", "Returns beacon url");
    FESR.setActive(false);
    assert.equal(FESR.getBeaconURL(), undefined, "Beacon URL was reset");
});
QUnit.test("Beacon strategy", function (assert) {
    assert.expect(9);
    this.clock = sinon.useFakeTimers();
    window.performance.getEntriesByType = function () { return []; };
    var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
    var fileReader = new FileReader();
    var done = assert.async();
    var addFakeProcessingTime = function () {
        var notifyAsyncStepCallback;
        notifyAsyncStepCallback = Interaction.notifyAsyncStep();
        this.clock.tick(1);
        notifyAsyncStepCallback();
    }.bind(this);
    FESR.setActive(true, "example.url");
    for (var index = 0; index < 10; index++) {
        Interaction.start();
        addFakeProcessingTime();
        Interaction.end(true);
    }
    assert.equal(sendBeaconStub.callCount, 1, "Beacon send triggered");
    var urlSendTo = sendBeaconStub.getCall(0).args[0], blobToSend = sendBeaconStub.getCall(0).args[1];
    assert.equal(urlSendTo, "example.url", "Buffer send to example.url");
    assert.ok(blobToSend instanceof Blob, "Send data is of type blob");
    assert.ok(sendBeaconStub.getCall(0).args[1].size > 0, "Blob contains FESR data");
    fileReader.onloadend = function (e) {
        var data = e.target.result;
        assert.ok(data.startsWith("sap-fesr-only=1"), "Send blob contains fesr-only header");
        var nSAPPerfFESRecOpt = data.match(/SAP-Perf-FESRec-opt/g).length;
        var nSAPPerfFESRec = data.match(/SAP-Perf-FESRec=/g).length;
        assert.equal(nSAPPerfFESRec, 10, "Send blob contains SAP-Perf-FESRec entries");
        assert.equal(nSAPPerfFESRecOpt, 10, "Send blob contains SAP-Perf-FESRec-opt entries");
        done();
    };
    fileReader.readAsText(blobToSend);
    FESR.setActive(false);
    sendBeaconStub.restore();
    this.clock.restore();
});
QUnit.test("Beacon timeout", function (assert) {
    assert.expect(9);
    this.clock = sinon.useFakeTimers();
    var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
    window.performance.getEntriesByType = function () { return []; };
    var addFakeProcessingTime = function () {
        var notifyAsyncStepCallback;
        notifyAsyncStepCallback = Interaction.notifyAsyncStep();
        this.clock.tick(1);
        notifyAsyncStepCallback();
    }.bind(this);
    FESR.setActive(true, "example.url");
    Interaction.start();
    addFakeProcessingTime();
    Interaction.end(true);
    this.clock.tick(60000);
    assert.ok(sendBeaconStub.calledOnce, "Beacon called once after 60s");
    sendBeaconStub.reset();
    this.clock.tick(30000);
    Interaction.start();
    addFakeProcessingTime();
    Interaction.end(true);
    this.clock.tick(30000);
    assert.ok(sendBeaconStub.notCalled, "Beacon not called when Interaction occured");
    this.clock.tick(30000);
    assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called 60s after Interaction");
    sendBeaconStub.reset();
    this.clock.tick(30000);
    Interaction.start();
    addFakeProcessingTime();
    Interaction.end(true);
    this.clock.tick(30000);
    Interaction.start();
    addFakeProcessingTime();
    Interaction.end(true);
    assert.ok(sendBeaconStub.notCalled, "Beacon not called when Interaction occured");
    this.clock.tick(30000);
    assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called 60s after Interaction");
    sendBeaconStub.reset();
    Interaction.start();
    addFakeProcessingTime();
    Interaction.end(true);
    FESR.setActive(false);
    assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called after deactivation");
    sendBeaconStub.reset();
    this.clock.tick(60000);
    assert.ok(sendBeaconStub.notCalled, "Beacon not called after deactivation");
    delete window.performance.getEntriesByType;
    sendBeaconStub.restore();
    this.clock.restore();
});