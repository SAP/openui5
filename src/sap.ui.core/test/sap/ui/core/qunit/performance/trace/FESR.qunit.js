/*global QUnit, sinon*/
sap.ui.define(['sap/ui/performance/trace/FESR', 'sap/ui/performance/trace/Interaction', 'sap/ui/performance/XHRInterceptor', 'sap/ui/performance/trace/Passport', 'sap/ui/Device'],
	function (FESR, Interaction, XHRInterceptor, Passport, Device) {
	"use strict";

	QUnit.module("FESR", {
		beforeEach: function(assert) {
			assert.notOk(FESR.getActive(), "FESR is deactivated");
		},
		afterEach: function(assert) {
			assert.notOk(FESR.getActive(), "FESR is deactivated");
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

	QUnit.test("onBeforeCreated hook", function(assert) {
		assert.expect(8);

		var oHandle = {
			stepName:"undetermined_startup",
			appNameLong:"undetermined",
			appNameShort:"undetermined"
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var fnOnBeforeCreated = FESR.onBeforeCreated;

		FESR.setActive(true);
		Interaction.notifyStepStart("startup", true);

		// implement hook
		var fnOnBeforeCreated = FESR.onBeforeCreated;
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
				timeToInteractive: 1000
			};
		};

		// trigger at least one request for header creation
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now(), false);
		xhr.send();
		// first interaction ends with end
		Interaction.end(true);

		//trigger request to send FESR
		xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now(), false);
		xhr.send();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				var values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				var values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[19] === "newAppNameLong";
			}
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.onBeforeCreated =  fnOnBeforeCreated;
		FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("Passport Integration - Passport Action in Client ID field", function(assert) {
		assert.expect(6);

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var oPassportHeaderSpy = sinon.spy(Passport, "header");

		FESR.setActive(true);
		Interaction.notifyStepStart("startup", true);
		// trigger at least one request to enable header creation
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now(), false);
		xhr.send();
		var sPassportAction = oPassportHeaderSpy.args[0][4];

		oHeaderSpy.reset();
		oPassportHeaderSpy.reset();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.end(true);
		// trigger initial FESR header creation (which should include the actual "action")
		xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now(), false);
		xhr.send();

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
		}), "Found the FESR header field values.");

		assert.strictEqual(oHeaderSpy.args.filter(function(args) {
			return args[0] === "SAP-PASSPORT";
		}).length, 1, "Header is set once");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		oHeaderSpy.restore();
		oPassportHeaderSpy.restore();
	});

	if (!Device.browser.msie) {

		QUnit.test("Beacon URL", function(assert) {
			assert.expect(4);

			FESR.setActive(true, "example.url");
			assert.equal(FESR.getBeaconURL(), "example.url", "Returns beacon url");

			FESR.setActive(false);
			assert.equal(FESR.getBeaconURL(), undefined, "Beacon URL was reset");
		});

		QUnit.test("Beacon strategy", function(assert) {
			assert.expect(9);
			var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
			var fileReader = new FileReader();
			var done = assert.async();

			FESR.setActive(true, "example.url");
			for (var index = 0; index < 10; index++) {
				Interaction.start();
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

			FESR.setActive(false);
			sendBeaconStub.restore();
		});

		QUnit.test("Beacon timeout", function(assert) {
			assert.expect(7);
			this.clock = sinon.useFakeTimers();
			var sendBeaconStub = sinon.stub(window.navigator, "sendBeacon").returns(true);
			window.performance.getEntriesByType = function() { return []; };

			FESR.setActive(true, "example.url");
			Interaction.start();
			Interaction.end(true);
			this.clock.tick(60000);
			assert.ok(sendBeaconStub.calledOnce, "Beacon called once after 60s");
			sendBeaconStub.reset();

			this.clock.tick(30000);
			Interaction.start();
			Interaction.end(true);
			this.clock.tick(30000);
			assert.ok(sendBeaconStub.notCalled, "Beacon not called when Interaction occured");
			this.clock.tick(30000);
			assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called 60s after Interaction");
			sendBeaconStub.reset();

			Interaction.start();
			Interaction.end(true);
			FESR.setActive(false);
			assert.ok(sendBeaconStub.calledOnce, "Beacon immediately called after deactivation");
			sendBeaconStub.reset();

			this.clock.tick(60000);
			assert.ok(sendBeaconStub.notCalled, "Beacon not called after deactivation");

			// cleanup
			delete window.performance.getEntriesByType;
			sendBeaconStub.restore();
			this.clock.restore();
		});
	}

});