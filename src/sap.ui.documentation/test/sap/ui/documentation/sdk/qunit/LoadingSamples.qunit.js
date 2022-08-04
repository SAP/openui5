/*global QUnit*/
sap.ui.define([],
	function () {
		"use strict";

		var sFrameURL = sap.ui.require.toUrl("sap/ui/documentation/sdk/index.html"),
			sSampleId = "sap.m.sample.Button";


		function createURL() {
			var sURLPath = document.location.href.substring(0,
				document.location.href.lastIndexOf('/test-resources/sap/ui/documentation/sdk/')),
				oURL = new URL(sURLPath + "/" + sFrameURL),
				oURLParams = new URLSearchParams();

			oURLParams.append("sap-ui-xx-dk-origin", window.location.origin);
			oURLParams.append("sap-ui-xx-sample-id", sSampleId);
			oURLParams.append("sap-ui-xx-sample-origin", ".");
			oURLParams.append("sap-ui-xx-sample-lib", "sap.m");

			oURL.search = oURLParams;
			return oURL;
		}

		QUnit.module("Samples", {

			beforeEach: function () {
				this.iframe = document.createElement('iframe');
				this.oURL = createURL();
				document.body.appendChild(this.iframe);
			},
			afterEach: function () {
				this.iframe.parentElement.removeChild(this.iframe);
				this.iframe = null;
				this.oURL = createURL();
			}
		});

		QUnit.test("creates bootstrap tag", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			assert.expect(1);

			oFrame.onload = function() {
				var oScriptTag = oFrame.contentDocument.querySelector("script#sap-ui-bootstrap");
				assert.ok(oScriptTag, "tag is created");
				done();
			};

			oFrame.src = sFrameURL;
		});

		//Settings thrown to the iframe are correctly applied to the sample app and passed from it on request
		QUnit.test("applies initial settings", function(assert) {
			var done = assert.async(),
				oFrame = this.iframe,
				oSettings = {
					"sap-ui-theme": "sap_belize",
					"sap-ui-rtl": true,
					"sap-ui-density": "sapUiSizeCondensed"
				};
			Object.keys(oSettings).forEach(function(oKey) {
				this.oURL.searchParams.append(oKey, oSettings[oKey]);
			}.bind(this));
			assert.expect(1);
			function onMessage(oMessage) {
				if (oMessage.data.type === "SETTINGS") {
						assert.ok(oMessage.data.data.density === oSettings["sap-ui-density"] &&
						oMessage.data.data.RTL === oSettings["sap-ui-rtl"] &&
						oMessage.data.data.theme === oSettings["sap-ui-theme"], "settings are applied");
						window.removeEventListener("message", onMessage);
						done();
				} else if (oMessage.data.type === "INIT") {
					oFrame.contentWindow.postMessage({
						type: "SETTINGS",
						reason: "get"
					}, window.location.origin);
				}
			}
			window.addEventListener("message", onMessage);

			oFrame.src = this.oURL.toString();

		});

		//Component creation
		QUnit.test("Given a sampleId creates a componnet with that name", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe,
				oCallParams = {},
				oSpy;
			oCallParams.id = "sampleComp-" + sSampleId;
			oCallParams.name = sSampleId;
			assert.expect(2);

			var onMessage = function (oMessage) {
				if (oMessage.data.type === "INIT") {
					window.removeEventListener("message", onMessage);
					assert.ok(oMessage.data.config.sample, "Component is created");
					assert.ok(oSpy.calledWith(oCallParams), 'Component create has been called');
					done();
				} else if (oMessage.data.type === "LOAD") {
					oSpy = this.spy(oFrame.contentWindow.sap.ui.core.Component, "create");
				}
			}.bind(this);

			window.addEventListener("message", onMessage);

			oFrame.src = this.oURL.toString();
		});


		//Messaging
		QUnit.module("Messaging", {

			beforeEach: function () {
				this.iframe = document.createElement('iframe');
				this.oURL = createURL();
				document.body.appendChild(this.iframe);
			},
			afterEach: function () {
				this.iframe.parentElement.removeChild(this.iframe);
				this.iframe = null;
				this.oURL = null;
			}
		});

		// RTA
		QUnit.test("Iframe sends a message, when RTA setup is ready", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			function onMessage(oMessage) {
				if (oMessage.data.type === "RTA") {
					window.removeEventListener("message", onMessage);
					assert.ok(oMessage.data.data.msg, "RTA setup is loaded");
					done();
				}
			}
			window.addEventListener("message", onMessage);

			oFrame.src = this.oURL.toString();
		});

		//INIT
		QUnit.test("Iframe sends a message, when Component is ready and placed in the container", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			function onMessage(oMessage) {
				if (oMessage.data.type === "INIT") {
					window.removeEventListener("message", onMessage);
					assert.ok(true, "Component is ready and placed in the container");
					done();
				}
			}
			window.addEventListener("message", onMessage);



			oFrame.src = this.oURL.toString();
		});

		//ERROR
		QUnit.test("Iframe sends an Error message, when Component cannot be created", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			function onMessage(oMessage) {
				if (oMessage.data.type === "ERR") {
					window.removeEventListener("message", onMessage);
					assert.ok(oMessage.data.data.msg, "Error is thrown, when sampleId does not match any sample");
					done();
				}
			}
			window.addEventListener("message", onMessage);

			this.oURL.searchParams.set("sap-ui-xx-sample-id", sSampleId + "dummyString");
			oFrame.src = this.oURL.toString();
		});

		//SETTINGS
		QUnit.test("Iframe sends applied settings, when requested", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			function onMessage(oMessage) {
				if (oMessage.data.type === "SETTINGS") {
					window.removeEventListener("message", onMessage);
					assert.ok(oMessage.data.data, "Initial settings has been send back on request");
					done();
				} else if (oMessage.data.type === "INIT") {
					oFrame.contentWindow.postMessage({
						type: "SETTINGS",
						reason: "get"
					}, window.location.origin);
				}
			}
			window.addEventListener("message", onMessage);

			oFrame.src = this.oURL.toString();
		});

		//Resources
		QUnit.module("Messaging", {

			beforeEach: function () {
				this.iframe = document.createElement('iframe');
				this.oURL = createURL();
				document.body.appendChild(this.iframe);
			},
			afterEach: function () {
				this.iframe.parentElement.removeChild(this.iframe);
				this.iframe = null;
				this.oURL = null;
			}
		});

		//SETTINGS
		QUnit.test("Resources from certain library has been loaded", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe;

			function onMessage(oMessage) {
				if (oMessage.data.type === "SETTINGS") {
					window.removeEventListener("message", onMessage);
					assert.ok(oMessage.data.data, "Initial settings has been send back on request");
					done();
				} else if (oMessage.data.type === "INIT") {
					oFrame.contentWindow.postMessage({
						type: "SETTINGS",
						reason: "get"
					}, window.location.origin);
				}
			}
			window.addEventListener("message", onMessage);

			oFrame.src = this.oURL.toString();
		});
	});