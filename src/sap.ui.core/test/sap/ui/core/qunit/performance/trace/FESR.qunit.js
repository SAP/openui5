/*global QUnit, sinon*/
sap.ui.define(['sap/ui/performance/trace/FESR', 'sap/ui/performance/trace/Interaction', 'sap/ui/performance/XHRInterceptor', 'sap/ui/performance/trace/Passport'],
	function (FESR, Interaction, XHRInterceptor, Passport) {
	"use strict";

	QUnit.config.reorder = false;
	var requestCounter = 0;

	// performance is hijacked by sinon's fakeTimers (https://github.com/sinonjs/fake-timers/issues/374)
	// and might be out of sync with the latest specs and APIs. Therefore, mock them further,
	// so they won't affect tests.
	//
	// *Note:* Call this method after sinon.useFakeTimers(); as for example performance.timeOrigin is read only
	// in its nature and cannot be modified otherwise.
	function mockPerformanceObject () {
		const timeOrigin = performance.timeOrigin;
		const clock = sinon.useFakeTimers();
		performance.getEntriesByType = function() {
			return [];
		};
		performance.timeOrigin = timeOrigin;
		return clock;
	}

	function cleanPerformanceObject() {
		delete performance.getEntriesByType;
		delete performance.timeOrigin;
	}

	QUnit.module("FESR", {
		beforeEach: function(assert) {
			assert.notOk(FESR.getActive(), "FESR is deactivated");
		},
		afterEach: function(assert) {
			assert.notOk(FESR.getActive(), "FESR is deactivated");
		},
		dummyRequest: function(bUseUrlObject) {
			var xhr = new XMLHttpRequest();
			const sUrl = "resources/ui5loader.js?noCache=" + Date.now() + "-" + (++requestCounter);
			xhr.open("GET", bUseUrlObject ?  new URL(sUrl, document.baseURI) : sUrl, false);
			xhr.send();
			return xhr;
		}
	});

	QUnit.test("activation", function(assert) {
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

	QUnit.test("onBeforeCreated hook: interactionType 1", function(assert) {
		assert.expect(8);

		var oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 1
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var fnOnBeforeCreated = FESR.onBeforeCreated;

		FESR.setActive(true);

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
			assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
			assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000,
				interactionType: 1
			};
		};

		// trigger at least one request for header creation
		var oXhrHandle = this.dummyRequest();

		// first interaction ends with end
		Interaction.end(true);
		oXhrHandle.abort();

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		oXhrHandle = this.dummyRequest(/* bUseUrlObject */ true);

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				var values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				var values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "1" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
		oXhrHandle.abort();
	});

	QUnit.test("onBeforeCreated hook: interactionType 2", function(assert) {
		assert.expect(8);

		var oHandle = {
			stepName:"undetermined_other_interaction",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 2
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var fnOnBeforeCreated = FESR.onBeforeCreated;

		// startup
		FESR.setActive(true);
		Interaction.end(true);

		// next interaction
		Interaction.start("other_interaction");

		// implement hook
		FESR.onBeforeCreated = function (oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
			assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
			assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000,
				interactionType: 2
			};
		};

		// trigger at least one request for header creation
		var oXhrHandle = this.dummyRequest();

		// first interaction ends with end
		Interaction.end(true);
		oXhrHandle.abort();

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		oXhrHandle = this.dummyRequest(/* bUseUrlObject */ true);

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				var values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				var values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "2" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.onBeforeCreated = fnOnBeforeCreated;
		FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
		oXhrHandle.abort();
	});

	QUnit.test("Passport Integration - Passport Action in Client ID field", function(assert) {
		assert.expect(6);

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var oPassportHeaderSpy = sinon.spy(Passport, "header");

		FESR.setActive(true);
		Interaction.notifyStepStart("startup", "startup", true);
		// trigger at least one request to enable header creation
		var oXhrHandle = this.dummyRequest();
		var sPassportAction = oPassportHeaderSpy.args[0][4];

		oHeaderSpy.resetHistory();
		oPassportHeaderSpy.resetHistory();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.end(true);
		oXhrHandle.abort();
		// trigger initial FESR header creation (which should include the actual "action")
		// using URL object to ensure isCORSRequest can handle URL objects as well
		oXhrHandle = this.dummyRequest(/* bUseUrlObject */ true);

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				// duration - end_to_end_time
				var sAction = args[1].split(",")[6];
				var bStepCountAvailable = sAction.match("^.*\\d$");
				assert.ok(bStepCountAvailable, "count was properly added");
				var bEquals = sAction === sPassportAction;
				assert.ok(bEquals, "action string matches");
				return bEquals && bStepCountAvailable;
			}
			return false;
		}), "Found the FESR header field values.");

		assert.strictEqual(oHeaderSpy.args.filter(function(args) {
			return args[0] === "SAP-PASSPORT";
		}).length, 1, "Header is set once");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		oHeaderSpy.restore();
		oPassportHeaderSpy.restore();
		oXhrHandle.abort();
	});

	QUnit.test("Beacon URL", function(assert) {
		assert.expect(4);

		FESR.setActive(true, "example.url");
		assert.equal(FESR.getBeaconURL(), "example.url", "Returns beacon url");

		FESR.setActive(false);
		assert.equal(FESR.getBeaconURL(), undefined, "Beacon URL was reset");
	});

	QUnit.test("Beacon strategy", function(assert) {
		assert.expect(9);
		this.clock = mockPerformanceObject();
		var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
		var fileReader = new FileReader();
		var done = assert.async();
		// In order to offer protection against timing attacks and fingerprinting, the precision of performance.now() might get rounded depending on browser settings.
		// In Firefox, the privacy.reduceTimerPrecision preference is enabled by default and defaults to 1ms. (see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#reduced_time_precision)
		// Therefore it's necessary to add some fake processing time to avoid filtering of zero duration records
		var addFakeProcessingTime = function () {
			// trigger notifyAsyncStep manually in order to avoid removal of interactions without processing time
			var notifyAsyncStepCallback;

			notifyAsyncStepCallback = Interaction.notifyAsyncStep();
			this.clock.tick(2);
			notifyAsyncStepCallback();
		}.bind(this);

		FESR.setActive(true, "example.url");
		for (var index = 0; index < 10; index++) {
			Interaction.start();
			addFakeProcessingTime();
			Interaction.end(true);
		}

		assert.equal(sendBeaconStub.callCount, 1, "Beacon send triggered");

		var urlSendTo = sendBeaconStub.getCall(0).args[0],
			blobToSend = sendBeaconStub.getCall(0).args[1];

		assert.equal(urlSendTo, "example.url", "Buffer send to example.url");
		assert.ok(blobToSend instanceof Blob, "Send data is of type blob");
		assert.ok(sendBeaconStub.getCall(0).args[1].size > 0, "Blob contains FESR data");

		fileReader.onloadend = function(e) {
			var data = e.target.result;
			assert.ok(data.startsWith("sap-fesr-only=1"), "Send blob contains fesr-only header");
			var nSAPPerfFESRecOpt = data.match(/SAP-Perf-FESRec-opt/g).length;
			var nSAPPerfFESRec = data.match(/SAP-Perf-FESRec=/g).length;
			assert.equal(nSAPPerfFESRec, 10, "Send blob contains SAP-Perf-FESRec entries");
			assert.equal(nSAPPerfFESRecOpt, 10, "Send blob contains SAP-Perf-FESRec-opt entries");
			done();
		};

		fileReader.readAsText(blobToSend);

		// cleanup
		cleanPerformanceObject();
		FESR.setActive(false);
		sendBeaconStub.restore();
		this.clock.restore();
	});

	QUnit.test("Beacon timeout", function(assert) {
		assert.expect(9);
		this.clock = mockPerformanceObject();
		var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
		var addFakeProcessingTime = function () {
			// trigger notifyAsyncStep manually in order to avoid removal of interactions without processing time
			var notifyAsyncStepCallback;

			notifyAsyncStepCallback = Interaction.notifyAsyncStep();
			this.clock.tick(2);
			notifyAsyncStepCallback();
		}.bind(this);

		FESR.setActive(true, "example.url");
		Interaction.start();
		addFakeProcessingTime();
		Interaction.end(true);
		this.clock.tick(60000);
		assert.ok(sendBeaconStub.calledOnce, "Beacon called once after 60s");
		sendBeaconStub.resetHistory();

		this.clock.tick(30000);
		Interaction.start();
		addFakeProcessingTime();
		Interaction.end(true);
		this.clock.tick(30000);
		assert.ok(sendBeaconStub.notCalled, "Beacon not called when Interaction occured");
		this.clock.tick(30000);
		assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called 60s after Interaction");
		sendBeaconStub.resetHistory();

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
		sendBeaconStub.resetHistory();

		Interaction.start();
		addFakeProcessingTime();
		Interaction.end(true);
		FESR.setActive(false);
		assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called after deactivation");
		sendBeaconStub.resetHistory();

		this.clock.tick(60000);
		assert.ok(sendBeaconStub.notCalled, "Beacon not called after deactivation");

		// cleanup
		cleanPerformanceObject();
		sendBeaconStub.restore();
		this.clock.restore();
	});

	QUnit.test("Semantic Stepname", function(assert) {
		assert.expect(3);
		this.clock = mockPerformanceObject();
		var addFakeProcessingTime = function () {
			// trigger notifyAsyncStep manually in order to avoid removal of interactions without processing time
			var notifyAsyncStepCallback;

			notifyAsyncStepCallback = Interaction.notifyAsyncStep();
			this.clock.tick(1);
			notifyAsyncStepCallback();
		}.bind(this);

		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.strictEqual(oFESRHandle.stepName, "SemanticStepName", "Correct Semantic Stepname set.");
			return {
				stepName: oFESRHandle.stepName,
				appNameLong: oFESRHandle.appNameLong,
				appNameShort: oFESRHandle.appNameShort,
				timeToInteractive: oFESRHandle.timeToInteractive,
				interactionType: oFESRHandle.interactionType
			};
		};

		FESR.setActive(true, "example.url");
		Interaction.start();
		addFakeProcessingTime();
		Interaction.getPending().semanticStepName = "SemanticStepName";
		Interaction.end(true);
		this.clock.tick(60000);
		FESR.setActive(false);

		// cleanup
		cleanPerformanceObject();
		this.clock.restore();
	});

});