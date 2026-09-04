/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/performance/trace/FESR',
	'sap/ui/performance/trace/Interaction',
	'sap/ui/performance/XHRInterceptor',
	'sap/ui/performance/FetchInterceptor',
	'sap/ui/performance/trace/Passport'
],
	function (FESR, Interaction, XHRInterceptor, FetchInterceptor, Passport) {
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
		},
		dummyFetch: function(oSignal) {
			const sUrl = "resources/ui5loader.js?noCache=" + Date.now() + "-" + (++requestCounter);
			const mSettings = {};
			if (oSignal) {
				mSettings.signal = oSignal;
			}
			return fetch(sUrl, mSettings);
		},
		// Issues a synchronous XHR carrying a request body, so the "send" interceptor has a body to
		// account for in bytesSent. Returns the body length used, so the test can assert against it.
		dummyRequestWithBody: function(iBodyLength) {
			const xhr = new XMLHttpRequest();
			const sUrl = "resources/ui5loader.js?noCache=" + Date.now() + "-" + (++requestCounter);
			const sBody = "x".repeat(iBodyLength);
			xhr.open("POST", sUrl, false);
			xhr.send(sBody);
			return { xhr: xhr, bodyLength: sBody.length };
		}
	});

	// The FetchInterceptor calls all registered onResponse hooks once the response body is fully
	// received (its readyState===4 equivalent) — including FESR's own INTERACTION/FESR hooks that
	// assign the request to the interaction. To await exactly that point deterministically (instead
	// of guessing with a timer), we register an additional onResponse hook AFTER FESR is active and
	// resolve a promise when it fires: since all onResponse hooks run in the same pass, our hook
	// running means FESR's hooks for this response have run too.
	function whenFetchTracked() {
		let fnResolve;
		const pTracked = new Promise(function(resolve) { fnResolve = resolve; });
		FetchInterceptor.register("FESR_TEST_TRACKED", {
			onResponse() {
				FetchInterceptor.unregister("FESR_TEST_TRACKED", "onResponse");
				fnResolve();
			}
		});
		return pTracked;
	}

	QUnit.test("activation", async function(assert) {
		assert.expect(14);
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered for XHR");
		assert.notOk(FetchInterceptor.isRegistered("FESR", "onRequest"), "FESR must not be registered for Fetch");
		await FESR.setActive(true);
		assert.ok(FESR.getActive(), "FESR should must be active");
		assert.ok(XHRInterceptor.isRegistered("FESR", "open"), "FESR must be registered for XHR");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_ID", "open"), "PASSPORT_ID must be registered for XHR");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_HEADER", "open"), "PASSPORT_HEADER must be registered for XHR");
		assert.ok(FetchInterceptor.isRegistered("FESR", "onRequest"), "FESR must be registered for Fetch");
		assert.ok(FetchInterceptor.isRegistered("PASSPORT_ID", "onRequest"), "PASSPORT_ID must be registered for Fetch");
		assert.ok(FetchInterceptor.isRegistered("PASSPORT_HEADER", "onRequest"), "PASSPORT_HEADER must be registered for Fetch");
		await FESR.setActive(false);
		assert.notOk(FESR.getActive(), "should must not be active");
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered for XHR");
		assert.notOk(FetchInterceptor.isRegistered("FESR", "onRequest"), "FESR must not be registered for Fetch");
	});

	QUnit.test("[XHR] onBeforeCreated hook: interactionType 1", async function(assert) {
		assert.expect(8);

		var oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 1
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var fnOnBeforeCreated = FESR.onBeforeCreated;

		await FESR.setActive(true);

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

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
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("[FETCH] onBeforeCreated hook: interactionType 1", async function(assert) {
		assert.expect(8);

		const oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 1
		};

		const oHeaderSpy = sinon.spy(Headers.prototype, "append");
		const fnOnBeforeCreated = FESR.onBeforeCreated;

		await FESR.setActive(true);

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000,
				interactionType: 1
			};
		};

		// trigger at least one request for header creation
		const pTracked = whenFetchTracked();
		const oResponse = await this.dummyFetch();
		await oResponse.text();

		// first interaction ends with end
		// wait until the fetch interceptor has enriched the interaction (body complete + timing entry)
		await pTracked;
		Interaction.end(true);

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		const oResponse1 = await this.dummyFetch();
		await oResponse1.text();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				const values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				const values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "1" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("[MIXED: XHR -> FETCH] onBeforeCreated hook: interactionType 1", async function(assert) {
		assert.expect(8);

		const oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 1
		};

		const oHeaderSpy = sinon.spy(Headers.prototype, "append");
		const fnOnBeforeCreated = FESR.onBeforeCreated;

		await FESR.setActive(true);

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000,
				interactionType: 1
			};
		};

		// trigger at least one request for header creation
		const oXhrHandle = this.dummyRequest();

		// first interaction ends with end
		Interaction.end(true);
		oXhrHandle.abort();

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		const oResponse1 = await this.dummyFetch();
		await oResponse1.text();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				const values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				const values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "1" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("[MIXED: FETCH -> XHR] onBeforeCreated hook: interactionType 1", async function(assert) {
		assert.expect(8);

		const oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 1
		};

		const oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		const fnOnBeforeCreated = FESR.onBeforeCreated;

		await FESR.setActive(true);

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "new,AppName,Short",
				timeToInteractive: 1000,
				interactionType: 1
			};
		};

		// trigger at least one request for header creation
		const pTracked = whenFetchTracked();
		const oResponse1 = await this.dummyFetch();
		await oResponse1.text();

		// first interaction ends with end
		// wait until the fetch interceptor has enriched the interaction (body complete + timing entry)
		await pTracked;
		Interaction.end(true);

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		this.dummyRequest(/* bUseUrlObject */ true);

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				const values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				const values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "1" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("[XHR] onBeforeCreated hook: interactionType 2", async function(assert) {
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
		await FESR.setActive(true);
		Interaction.end(true);

		// next interaction
		Interaction.start("other_interaction");

		// implement hook
		FESR.onBeforeCreated = function (oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

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
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		FESR.onBeforeCreated = fnOnBeforeCreated;
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
		oXhrHandle.abort();
	});

	QUnit.test("[FETCH] onBeforeCreated hook: interactionType 2", async function(assert) {
		assert.expect(8);

		const oHandle = {
			stepName:"undetermined_other_interaction",
			appNameLong:"undetermined",
			appNameShort:"undetermined",
			interactionType: 2
		};

		const oHeaderSpy = sinon.spy(Headers.prototype, "append");
		const fnOnBeforeCreated = FESR.onBeforeCreated;

		// startup
		await FESR.setActive(true);
		Interaction.end(true);

		// next interaction
		Interaction.start("other_interaction");

		// implement hook
		FESR.onBeforeCreated = function (oFESRHandle, oInteraction) {
			assert.ok(oFESRHandle.timeToInteractive > 0, "startup time should be > 0");
			//delete startup time as we cannot compare it
			delete oFESRHandle.timeToInteractive;
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");

			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000,
				interactionType: 2
			};
		};

		// trigger at least one request for header creation
		const pTracked = whenFetchTracked();
		const oResponse = await this.dummyFetch();
		await oResponse.text();

		// first interaction ends with end
		// wait until the fetch interceptor has enriched the interaction (body complete + timing entry)
		await pTracked;
		Interaction.end(true);

		// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
		const oResponse1 = await this.dummyFetch();
		await oResponse1.text();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				const values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
			return false;
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				const values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[15] === "2" && values[19] === "newAppNameLong";
			}
			return false;
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		const oInteraction = Interaction.getAll()[1];
		assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
		assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
		Interaction.clear();
		await FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("[XHR] Passport Integration - Passport Action in Client ID field", async function(assert) {
		assert.expect(6);

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var oPassportHeaderSpy = sinon.spy(Passport, "header");

		await FESR.setActive(true);
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
		await FESR.setActive(false);
		oHeaderSpy.restore();
		oPassportHeaderSpy.restore();
		oXhrHandle.abort();
	});

	QUnit.test("[FETCH] Passport Integration - Passport Action in Client ID field", async function(assert) {
		assert.expect(6);

		const oHeaderSpy = sinon.spy(Headers.prototype, "append");
		const oPassportHeaderSpy = sinon.spy(Passport, "header");

		await FESR.setActive(true);
		Interaction.notifyStepStart("startup", "startup", true);
		// trigger at least one request for header creation
		const pTracked = whenFetchTracked();
		const oResponse = await this.dummyFetch();
		await oResponse.text();
		// wait until the fetch interceptor has enriched the interaction (body complete + timing entry)
		await pTracked;
		const sPassportAction = oPassportHeaderSpy.args[0][4];

		oHeaderSpy.resetHistory();
		oPassportHeaderSpy.resetHistory();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.end(true);

		// trigger initial FESR header creation (which should include the actual "action")
		const oResponse1 = await this.dummyFetch();
		await oResponse1.text();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				// duration - end_to_end_time
				const sAction = args[1].split(",")[6];
				const bStepCountAvailable = sAction.match("^.*\\d$");
				assert.ok(bStepCountAvailable, "count was properly added");
				const bEquals = sAction === sPassportAction;
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
		await FESR.setActive(false);
		oHeaderSpy.restore();
		oPassportHeaderSpy.restore();
	});

	QUnit.test("Beacon URL", async function(assert) {
		assert.expect(4);

		await FESR.setActive(true, "example.url");
		assert.equal(FESR.getBeaconURL(), "example.url", "Returns beacon url");

		await FESR.setActive(false);
		assert.equal(FESR.getBeaconURL(), undefined, "Beacon URL was reset");
	});

	QUnit.test("Beacon strategy",async  function(assert) {
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

		await FESR.setActive(true, "example.url");
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
		await FESR.setActive(false);
		sendBeaconStub.restore();
		this.clock.restore();
	});

	QUnit.test("Beacon timeout", async function(assert) {
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

		await FESR.setActive(true, "example.url");
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
		await FESR.setActive(false);
		assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called after deactivation");
		sendBeaconStub.resetHistory();

		this.clock.tick(60000);
		assert.ok(sendBeaconStub.notCalled, "Beacon not called after deactivation");

		// cleanup
		cleanPerformanceObject();
		sendBeaconStub.restore();
		this.clock.restore();
	});

	QUnit.test("[XHR] Request body bytes are counted in bytesSent", async function(assert) {
		// 3 own assertions + the module's beforeEach/afterEach "FESR is deactivated" checks
		assert.expect(5);

		// A body large enough to dominate the request header bytes: if the body is counted at all,
		// bytesSent must be >= the body length. On the buggy code the "send" hook is guarded by the
		// never-existing this.oPendingInteraction and writes to mRequestInfo.get(this._id === undefined),
		// so the body is dropped and bytesSent stays at header-size only (< body length) => this test
		// goes red. With the fix (oPendingInteraction closure + reliable request id) the body is counted.
		const iBodyLength = 10000;

		await FESR.setActive(true);
		// close the startup interaction and open a fresh, empty one we fully control
		Interaction.end(true);
		Interaction.start("body_bytes_interaction");

		const oResult = this.dummyRequestWithBody(iBodyLength);

		Interaction.end(true);
		const aInteractions = Interaction.getAll();
		const oInteraction = aInteractions[aInteractions.length - 1];

		assert.ok(oInteraction.requests.length > 0, "The bodied request was tracked as part of the interaction.");
		assert.ok(oInteraction.bytesSent > 0, "bytesSent was accumulated for the interaction.");
		assert.ok(oInteraction.bytesSent > oResult.bodyLength,
			"bytesSent (" + oInteraction.bytesSent + ") includes the request body of " + oResult.bodyLength + " bytes plus request headers.");

		Interaction.clear();
		await FESR.setActive(false);
	});

	QUnit.test("Semantic Stepname", async function(assert) {
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

		await FESR.setActive(true, "example.url");
		Interaction.start();
		addFakeProcessingTime();
		Interaction.getPending().semanticStepName = "SemanticStepName";
		Interaction.end(true);
		this.clock.tick(60000);
		await FESR.setActive(false);

		// cleanup
		cleanPerformanceObject();
		this.clock.restore();
	});

});