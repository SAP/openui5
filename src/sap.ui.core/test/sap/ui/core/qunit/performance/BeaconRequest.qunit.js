/*global QUnit, sinon*/
sap.ui.define(["sap/ui/performance/BeaconRequest"], function (BeaconRequest) {
	"use strict";

	QUnit.module("BeaconRequest API (happy path)");

	QUnit.test("Browser support", function(assert) {
		assert.ok(BeaconRequest.isSupported(), "Current browser is supported");
	});

	QUnit.test("Beacon Request object has been initialized successfully", function(assert) {
		var beaconRequest = new BeaconRequest({
			url: "example.url"
		});

		assert.ok(beaconRequest._sUrl, "Url has been set");
		assert.equal(beaconRequest._nMaxBufferLength, 10, "Max buffer length default value has been set");
	});


	QUnit.test("Pass all appended data to sendBeacon", function (assert) {
		var sendBeaconSpy = sinon.stub(window.navigator, "sendBeacon").returns(true);

		var beaconRequest = new BeaconRequest({
			url: "example.url"
		});

		beaconRequest.append("key1", "value1");
		beaconRequest.append("key2", "value2");
		beaconRequest.send();

		var oBlobToCompare = new Blob(["sap-fesr-only=1&key1=value1&key2=value2"], {
			type: "application/x-www-form-urlencoded;charset=UTF-8"
		});
		assert.deepEqual(sendBeaconSpy.getCall(0).args[1], oBlobToCompare, "sendBeacon has been called");

		sendBeaconSpy.restore();
	});

	QUnit.test("Send data automatically if max buffer length has been reached after append", function (assert) {

		var beaconRequest = new BeaconRequest({
			url: "example.url"
		}), maxBufferLength = 10;

		var sendSpy = sinon.stub(beaconRequest, "send").returns(true);

		var aBuffer = new Array(maxBufferLength - 1).fill({ key: "key", value: "value" });

		aBuffer.forEach(function(bufferValues) {
			beaconRequest.append(bufferValues.key, bufferValues.value);
		});

		assert.ok(beaconRequest.getBufferLength(), 9, "9 Items have been appended");
		assert.strictEqual(sendSpy.callCount, 0, "Data has not been send yet");
		beaconRequest.append("key", "value");

		assert.ok(beaconRequest.getBufferLength(), 10, "10 Items have been appended");
		assert.strictEqual(sendSpy.callCount, 1, "Data has been send");

		sendSpy.restore();
	});

	QUnit.test("Send beacon and clear the buffer when data has been send", function (assert) {
		var sendBeaconSpy = sinon.stub(window.navigator, "sendBeacon").returns(true);

		var beaconRequest = new BeaconRequest({
			url: "example.url"
		});

		beaconRequest.append("key", "value");
		beaconRequest.send();

		assert.strictEqual(sendBeaconSpy.getCall(0).args[0], "example.url", "sendBeacon has been called");
		assert.strictEqual(beaconRequest.getBufferLength(), 0, "Buffer has been cleared");

		sendBeaconSpy.restore();
	});

	QUnit.test("Send beacon on window close", function(assert) {
		var done = assert.async();
		assert.expect(2);
		let resLoad, resArranged;
		const pLoaded = Promise.all([
			new Promise((res) => {
				resLoad = res;
			}), new Promise((res) => {
				resArranged = res;
			})
		]);

		// setup iframe which will apply a stub on BeaconRequest#send to check
		// if it is called on the iframe's window unload event - defined in
		// static/sendBeaconRequest.js
		var oIframe = document.createElement("iframe");
		oIframe.setAttribute("src", sap.ui.require.toUrl("performance/static/sendBeaconRequest.html"));
		document.getElementById('qunit-fixture').appendChild(oIframe);

		// checks if the arrangements in the iframe have been completed
		function arranged(msg) {
			assert.equal(msg.data.token, "arranged", "BeaconRequest#send has been replaced");
			window.removeEventListener("message", arranged);
			resArranged();
		}

		// checks the if the stub has been called
		function assertions(msg) {
			if (msg.data.token !== "called") {
				return;
			}
			assert.equal(msg.data.token, "called", "BeaconRequest#send has been called");
			window.removeEventListener("message", assertions);
			done();
		}

		oIframe.onload = resLoad;
		window.addEventListener("message", arranged);

		pLoaded.then(() => {
			window.addEventListener("message", assertions);
			document.getElementById('qunit-fixture').removeChild(oIframe);
		});
	});

	QUnit.test("Do not send beacon if the buffer is empty", function(assert) {
		var sendBeaconSpy = sinon.stub(window.navigator, "sendBeacon").returns(true);

		var beaconRequest = new BeaconRequest({
			url: "example.url"
		});

		// do not add anything
		beaconRequest.send();

		assert.ok(sendBeaconSpy.notCalled, "example.url", "sendBeacon has not been called");

		sendBeaconSpy.restore();
	});

	QUnit.module("BeaconRequest API (sad path)");

	QUnit.test("Fail if sendBeacon is not supported", function (assert) {
		var sendBeaconStub = sinon.stub(window, "navigator").value({});
		assert.notOk(BeaconRequest.isSupported(), "Beacon API should not be supported ");
		sendBeaconStub.restore();
	});

	QUnit.test("Throw if check for beacon API support fails in constructor", function (assert) {
		var sendBeaconStub = sinon.stub(window, "navigator").value({ });

		assert.throws(function () {
			(new BeaconRequest());
		}, new Error("Beacon API is not supported"), "Initialization failed, beacon API not supported");

		sendBeaconStub.restore();
	});

	QUnit.test("Throw if beacon url was not set", function (assert) {
		assert.throws(function () {
			(new BeaconRequest());
		}, new Error("Beacon url must be valid"), "Initialization failed, no beacon url provided");
	});
});