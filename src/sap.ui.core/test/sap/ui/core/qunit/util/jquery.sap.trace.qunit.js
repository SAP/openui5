/* global QUnit, sinon*/

sap.ui.define([
	"jquery.sap.trace",
	"sap/ui/Device",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Component"
], function(
	jQuery,
	Device,
	BusyIndicator,
	Component
) {
	"use strict";

	jQuery.sap.measure.clearInteractionMeasurements();

	function getHeaderContent(aHeaders, sHeaderName) {
		var sHeaderContent;
		aHeaders.forEach(function(_aHeaderFields) {
			if (_aHeaderFields[0] === sHeaderName) {
				sHeaderContent = _aHeaderFields[1];
			}
		});
		if (!sHeaderContent) {
			throw new Error(sHeaderName + " header was not found!");
		}
		return sHeaderContent;
	}

	QUnit.module("Activation", {
		afterEach: function() {
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.measure.clearInteractionMeasurements();
		}
	});

	QUnit.test("FESR - meta tag", function(assert) {
		assert.ok(jQuery.sap.fesr.getActive(), "Meta tag was recognized successfully");
		jQuery.sap.fesr.setActive(false);
	});

	QUnit.test("FESR", function(assert) {
		var spy;
		// setup
		jQuery.sap.fesr.setActive(true);
		assert.ok(jQuery.sap.interaction.getActive(), "Implicit interaction activation successful");
		jQuery.sap.interaction.notifyStepStart(null, null, true);
		var oReq = new XMLHttpRequest();
		// first request with FESR header of startup interaction
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		jQuery.sap.interaction.notifyStepEnd();
		jQuery.sap.interaction.notifyStepStart(null, null, true);
		spy = this.spy(window.XMLHttpRequest.prototype, "setRequestHeader");
		oReq = new XMLHttpRequest();
		// second request with FESR header belonging to first interaction after startup
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		jQuery.sap.interaction.notifyStepEnd();
		// assertions
		sinon.assert.calledWith(spy, "SAP-PASSPORT");
		sinon.assert.calledWith(spy, "SAP-Perf-FESRec");
		sinon.assert.calledWith(spy, "SAP-Perf-FESRec-opt");
		jQuery.sap.fesr.setActive(false);
		assert.ok(!jQuery.sap.interaction.getActive(), "Implicit interaction deactivation successful");
	});

	QUnit.test("Passport", function(assert) {
		// setup
		jQuery.sap.passport.setActive(true);
		var spy = this.spy(window.XMLHttpRequest.prototype, "setRequestHeader");
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		// assertions
		sinon.assert.calledWith(spy, "SAP-PASSPORT");
		jQuery.sap.passport.setActive(false);
	});

	QUnit.test("interaction", function(assert) {
		// setup
		jQuery.sap.interaction.setActive(true);
		assert.ok(jQuery.sap.interaction.getActive(), "Activation successful");
		jQuery.sap.interaction.notifyStepStart(null, null, true);
		var oReq = new XMLHttpRequest();
		// first request with FESR header of startup interaction
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.setRequestHeader("test","test");
		oReq.send();
		jQuery.sap.interaction.notifyStepEnd();
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements(true).pop();
		assert.ok(oMeasurement.bytesSent, "bytesSent is set");
		assert.ok(oMeasurement.bytesReceived, "bytesReceived is set");
		jQuery.sap.interaction.setActive(false);
		assert.ok(!jQuery.sap.interaction.getActive(), "Deactivation successful");
	});

	QUnit.module("Passport Header", {
		afterEach: function() {
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.measure.clearInteractionMeasurements();
		}
	});

	QUnit.test("header length", function(assert) {
		// setup
		jQuery.sap.passport.setActive(true);
		var spy = this.spy(window.XMLHttpRequest.prototype, "setRequestHeader");
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		// assertions
		assert.ok((spy.args[0][1].length === 608) || (spy.args[0][1].length === 460), "SAP PP header length " + Math.floor(spy.args[0][1].length / 2) + " is compliant");
		jQuery.sap.passport.setActive(false);
	});

	QUnit.module("FESR Header", {
		beforeEach: function() {
			this.spy = sinon.spy(window.XMLHttpRequest.prototype, "setRequestHeader");
			this.stub = sinon.stub(performance, "getEntriesByType").returns([]);
			this.start = function(aRequests) {
				return new Promise(function (resolve) {
					var iEndtimeOfLastRequest = 0;
					jQuery.sap.fesr.setActive(true);
					jQuery.sap.interaction.notifyStepStart(null, null, true);
					// Save performance.now() timestamp after interaction was started and before it was ended
					var iNow = performance.now();
					aRequests.forEach(function(oRequest) {
						iEndtimeOfLastRequest = oRequest.responseEnd > iEndtimeOfLastRequest ? oRequest.responseEnd : iEndtimeOfLastRequest;
						// Add performance.now() timestamp to the start- and end-times if available
						oRequest.startTime = oRequest.startTime ? oRequest.startTime + iNow : undefined;
						oRequest.requestStart = oRequest.requestStart ? oRequest.requestStart + iNow : undefined;
						oRequest.responseEnd = oRequest.responseEnd ? oRequest.responseEnd + iNow : undefined;
					});
					this.stub.returns(aRequests);
					setTimeout(function () {
						// Trigger request within setTimeout to set the preliminary end of startup interaction after the last request was ended
						this.oReq = new XMLHttpRequest();
						this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
						this.oReq.send();
						jQuery.sap.interaction.notifyStepEnd();
						// Second request to send FESR header via piggyback
						this.oReq = new XMLHttpRequest();
						this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
						this.oReq.send();
						resolve();
					}, iEndtimeOfLastRequest + 1 /*Wait for the last finished request before ending the interaction*/);
				}.bind(this));
			};
		},
		afterEach: function() {
			this.spy.restore();
			this.stub.restore();
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.measure.clearInteractionMeasurements();
			jQuery.sap.fesr.setActive(false);
		}
	});

	QUnit.test("mandatory header properties", function(assert) {
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 4,
			requestStart: 5,
			responseEnd: 6,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 7,
			requestStart: 8,
			responseEnd: 9,
			initiatorType: "xmlhttprequest"
		}]).then(function () {
			var sFESR = getHeaderContent(this.spy.args, "SAP-Perf-FESRec");
			assert.ok(sFESR, "mandatory header present");
			var aFESR = sFESR.split(",");
			assert.strictEqual(aFESR[0].length, 32, "root_context_id - length");
			assert.strictEqual(aFESR[1].length, 32, "transaction_id - length");
			assert.strictEqual(parseInt(aFESR[2]), 3, "client_navigation_time");
			assert.strictEqual(parseInt(aFESR[3]), 6, "client_round_trip_time");
			assert.strictEqual(parseInt(aFESR[5]), 3, "network_round_trips");
			assert.ok(aFESR[6].length <= 40, "epp-action");
			assert.strictEqual(parseInt(aFESR[7]), 0, "network_time");
			assert.strictEqual(parseInt(aFESR[8]), 6, "request_time");
			assert.strictEqual(aFESR[9], Device.os.name + "_" + Device.os.version, "client_os");
			assert.strictEqual(aFESR[10], "SAP_UI5", "client_type");
		}.bind(this));
	});

	QUnit.test("optional header properties", function(assert) {
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 4,
			requestStart: 5,
			responseEnd: 6,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 7,
			requestStart: 8,
			responseEnd: 9,
			initiatorType: "xmlhttprequest"
		}]).then(function () {
			var sFESRopt = getHeaderContent(this.spy.args, "SAP-Perf-FESRec-opt");
			assert.ok(sFESRopt, "optional header present");
			var aFESRopt = sFESRopt.split(",");
			assert.ok(aFESRopt[0].length <= 20, "application_name - length");
			assert.ok(aFESRopt[1].length <= 20, "step_name - length");
			assert.ok(aFESRopt[3].length <= 20, "client_model - length");
			assert.ok(aFESRopt[4].length <= 16, "client_data_sent - length");
			assert.ok(!isNaN(aFESRopt[4]), "client_data_sent is a number");
			assert.ok(aFESRopt[5].length <= 16, "client_data_received - length");
			assert.ok(!isNaN(aFESRopt[5]), "client_data_received is a number");
			assert.ok(aFESRopt[8].length <= 16, "client_processing_time - length");
			assert.ok(!isNaN(aFESRopt[8]), "client_processing_time is a number");
			assert.ok(aFESRopt[9] === "X" || !aFESRopt[9], "compressed");
			assert.ok(!isNaN(aFESRopt[14]), "global busy indicator duration is a number");
			assert.ok(parseInt(aFESRopt[16]) >= 0 && parseInt(aFESRopt[16]) <= 4, "extension_3 (client device) between 0 and 4");
			assert.ok(aFESRopt[18].length >= 14 && aFESRopt[18].length <= 20, "extension_5 (interaction start time) between 1 and 20 chars - length");
			assert.ok(aFESRopt[19].length >= 1 && aFESRopt[19].length <= 70, "application_name between 1 and 70 chars - length");
		}.bind(this));
	});


	// Negative durations which are logged during the following tests are caused
	// by the very simple mock of request timings.
	QUnit.test("request timings with gap", function(assert) {
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 3,
			requestStart: 4,
			responseEnd: 5,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 10, // 5ms gap to request 2
			requestStart: 11,
			responseEnd: 12,
			initiatorType: "xmlhttprequest"
		}]).then(function () {
			var sFESR = getHeaderContent(this.spy.args, "SAP-Perf-FESRec");
			assert.ok(sFESR, "mandatory header present");
			var aFESR = sFESR.split(",");
			assert.strictEqual(parseInt(aFESR[2]), 3, "client_navigation_time");
			assert.strictEqual(parseInt(aFESR[3]), 6, "client_round_trip_time");
			assert.strictEqual(parseInt(aFESR[5]), 3, "network_round_trips");
			assert.strictEqual(parseInt(aFESR[8]), 6, "request_time");
		}.bind(this));
	});

	QUnit.test("request timings with overlap", function(assert) {
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 2, // overlap with request 1
			requestStart: 3,
			responseEnd: 4,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 3, // overlap with reqeust 2
			requestStart: 4,
			responseEnd: 5,
			initiatorType: "xmlhttprequest"
		}]).then(function () {
			var sFESR = getHeaderContent(this.spy.args, "SAP-Perf-FESRec");
			assert.ok(sFESR, "mandatory header present");
			var aFESR = sFESR.split(",");
			assert.strictEqual(parseInt(aFESR[2]), 3, "client_navigation_time");
			assert.strictEqual(parseInt(aFESR[3]), 4, "client_round_trip_time");
			assert.strictEqual(parseInt(aFESR[5]), 3, "network_round_trips");
			assert.strictEqual(parseInt(aFESR[8]), 6, "request_time");
		}.bind(this));
	});

	QUnit.test("request timings with gaps and overlap", function(assert) {
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 1,
			requestStart: 3,
			responseEnd: 5,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 7,
			requestStart: 8,
			responseEnd: 9,
			initiatorType: "xmlhttprequest"
		}]).then(function () {
			var sFESR = getHeaderContent(this.spy.args, "SAP-Perf-FESRec");
			assert.ok(sFESR, "mandatory header present");
			var aFESR = sFESR.split(",");
			assert.strictEqual(parseInt(aFESR[2]), 3, "client_navigation_time");
			assert.strictEqual(parseInt(aFESR[3]), 6, "client_round_trip_time");
			assert.strictEqual(parseInt(aFESR[5]), 3, "network_round_trips");
			assert.strictEqual(parseInt(aFESR[8]), 8, "request_time");
		}.bind(this));
	});

	QUnit.test("ignore incomplete request", function(assert) {
		// mock an incomplete request
		return this.start([{
			startTime: 1,
			requestStart: 2,
			responseEnd: 3,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 4,
			requestStart: 5,
			responseEnd: 6,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 7,
			requestStart: 8,
			responseEnd: 9,
			initiatorType: "xmlhttprequest"
		}, {
			startTime: 10,
			requestStart: 11,
			initiatorType: "xmlhttprequest"
			// no responseEnd
		}]).then(function () {
			// catch the interaction measurement
			var aInteractions = jQuery.sap.measure.getAllInteractionMeasurements();
			this.oInteraction = aInteractions[aInteractions.length - 1];

			// sixth call of setRequestHeader
			var sFESR = getHeaderContent(this.spy.args, "SAP-Perf-FESRec");
			assert.ok(sFESR, "mandatory header present");
			var aFESR = sFESR.split(",");
			assert.strictEqual(parseInt(aFESR[2]), 3, "client_navigation_time");
			assert.strictEqual(parseInt(aFESR[3]), 6, "client_round_trip_time");
			assert.strictEqual(parseInt(aFESR[5]), 3, "completed network_round_trips");
			assert.strictEqual(parseInt(aFESR[7]), 0, "network_time");
			assert.strictEqual(parseInt(aFESR[8]), 6, "request_time");

			assert.strictEqual(this.oInteraction.completeRoundtrips, 3, "complete request counted");
		}.bind(this));
	});

	QUnit.module("Global busy duration measurement",{
		beforeEach: function() {
			jQuery.sap.fesr.setActive(true);
			jQuery.sap.interaction.notifyStepStart(null, null, true);
			this.oReq = new XMLHttpRequest();
			// first request with FESR header of startup interaction
			this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
			this.oReq.send();
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.interaction.notifyStepStart(null, null, true);
			this.oReq = new XMLHttpRequest();
			// second request with FESR header belonging to first interaction after startup
			this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
			this.oReq.send();
		}, afterEach: function() {
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.fesr.setActive(false);
			jQuery.sap.measure.clearInteractionMeasurements();
		}
	});

	// Check if global busy indicator measurement works without delay
	QUnit.test("Busy indicator without delay", function(assert) {
		BusyIndicator.show(0);
		BusyIndicator.hide();
		jQuery.sap.interaction.notifyStepEnd();
		jQuery.sap.interaction.notifyStepStart(null, null, true);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		assert.ok(oMeasurement.busyDuration >= 0, "Global Busy duration is bigger than or equal to zero.");

		var oReq = new XMLHttpRequest();
		var spy = this.spy(oReq, "setRequestHeader");
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now());
		oReq.send();
		var iBusyDurationRequest = parseInt(getHeaderContent(spy.args, "SAP-Perf-FESRec-opt").split(",")[14]);
		assert.ok(iBusyDurationRequest + 1 >= oMeasurement.busyDuration && iBusyDurationRequest - 1 <= oMeasurement.busyDuration,
			"Header is filled; FESR entry: " + iBusyDurationRequest + "; Measurement: " + oMeasurement.busyDuration);
		spy.restore();
	});

	// Check if global busy indicator measurement works with delay
	QUnit.test("Busy indicator with delay", function(assert) {
		BusyIndicator.show(1);
		var done = assert.async();
		assert.expect(2);
		var fnSpy = this.spy;
		setTimeout(function() {
			BusyIndicator.hide();
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.interaction.notifyStepStart(null, null, true);
			var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
			assert.ok(oMeasurement.busyDuration > 0, "Global Busy duration is bigger than zero.");

			var oReq = new XMLHttpRequest();
			var spy = fnSpy(oReq, "setRequestHeader");
			oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now());
			oReq.send();
			var iBusyDurationRequest = parseInt(getHeaderContent(spy.args, "SAP-Perf-FESRec-opt").split(",")[14]);
			assert.ok(iBusyDurationRequest + 1 >= oMeasurement.busyDuration && iBusyDurationRequest - 1 <= oMeasurement.busyDuration,
				"Header is filled; FESR entry: " + iBusyDurationRequest + "; Measurement: " + oMeasurement.busyDuration);
			spy.restore();
			done();
		}, 100);
	});

	QUnit.module("component integration", {
		beforeEach: function() {
			jQuery.sap.fesr.setActive(true);
			jQuery.sap.interaction.notifyStepStart(null, null, true);
			this.oReq = new XMLHttpRequest();
			// first request with FESR header of startup interaction
			this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
			this.oReq.send();
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.interaction.notifyStepStart(null, null, true);
			this.oReq = new XMLHttpRequest();
			// second request with FESR header belonging to first interaction after startup
			this.oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
			this.oReq.send();
			jQuery.sap.interaction.notifyStepEnd();
		}, afterEach: function() {
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.fesr.setActive(false);
			jQuery.sap.measure.clearInteractionMeasurements();
		}
	});

	QUnit.test("named component", function(assert) {
		jQuery.sap.interaction.notifyStepStart(null, null, true);
		var sName = "foo.sap.ui.fesr.test.a.component.name.with.seventy.characters.Component.js";

		try {
			// mock a component initialization
			Component.create({name:sName});
		} catch (e) {/* we do not really want to load the component */}

		var fnSpy = this.spy;
		var done = assert.async();
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();

		// we need to use the timeout here, as the request-timing is not found otherwise
		setTimeout(function() {
			jQuery.sap.interaction.notifyStepEnd();
			jQuery.sap.interaction.notifyStepStart(null, null, true);

			var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
			assert.strictEqual(oMeasurement.component, "undetermined");
			assert.strictEqual(oMeasurement.stepComponent, sName);

			oReq = new XMLHttpRequest();
			var spy = fnSpy(oReq, "setRequestHeader");
			oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
			oReq.send();

			var aHeaderValues = getHeaderContent(spy.args, "SAP-Perf-FESRec-opt").split(",");
			var sComponentName20Chars = aHeaderValues[0];
			assert.strictEqual(sComponentName20Chars.length, 20);
			assert.strictEqual(sComponentName20Chars, "racters.Component.js");
			var sComponentName70Chars = aHeaderValues[19];
			assert.strictEqual(sComponentName70Chars.length, 70);
			assert.strictEqual(sComponentName70Chars, "sap.ui.fesr.test.a.component.name.with.seventy.characters.Component.js");
			spy.restore();
			done();
		}, 0);
	});

});