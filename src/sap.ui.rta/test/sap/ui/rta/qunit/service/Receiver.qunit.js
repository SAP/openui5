/* global QUnit */

sap.ui.define([
	"sap/ui/rta/Client",
	"sap/ui/rta/service/Receiver",
	"sap/ui/core/postmessage/Bus",
	"sap/ui/thirdparty/sinon-4"
], function(
	RTAClient,
	Receiver,
	PostMessageBus,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const CHANNEL_ID = "sap.ui.rta.service.receiver";

	function createIframe(sSrc) {
		return new Promise(function(fnResolve) {
			const oIframe = document.createElement("iframe");

			oIframe.onload = function(oEvent) {
				fnResolve(oEvent.target);
			};
			oIframe.src = sSrc;

			document.getElementById("qunit-fixture").appendChild(oIframe);
		});
	}

	function getPostMessageBus(oWindow) {
		return new Promise(function(resolve) {
			oWindow.sap.ui.require(["sap/ui/core/postmessage/Bus"], function(oPostMessageBus) {
				resolve(oPostMessageBus.getInstance());
			});
		});
	}

	QUnit.module("API - Events (Receiver)", {
		async before() {
			QUnit.config.fixture = null;
			const oIframe = await createIframe("test-resources/sap/ui/rta/qunit/client/iframe.html?loadframework");
			this.oIframeWindow = oIframe.contentWindow;
		},
		async beforeEach() {
			this.oRTAClient = new RTAClient({
				window: this.oIframeWindow,
				origin: this.oIframeWindow.location.origin
			});
			this.oPostMessageBus = await getPostMessageBus(window);
			this.oPostMessageBusInIframe = await getPostMessageBus(this.oIframeWindow);
		},
		afterEach() {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInIframe.destroy();
			sandbox.restore();
		},
		after() {
			QUnit.config.fixture = "";
		}
	}, function() {
		QUnit.test("Receiver responds to getService event on the bus", function(assert) {
			const fnDone = assert.async();
			const oService = {
				foo: "bar",
				myMethod() {}
			};
			const oRta = {
				getService() { return Promise.resolve(oService); },
				_mServices: { foo: { service: { events: ["event1"] } } }
			};
			const oBus = PostMessageBus.getInstance();
			sandbox.stub(oBus, "subscribe").callsFake(function(sChannelId, sEventId, fnHandler) {
				if (sChannelId === CHANNEL_ID && sEventId === "getService") {
					fnHandler({
						eventId: sEventId,
						source: window,
						origin: window.location.origin,
						data: {
							id: "test-id-1",
							type: "request",
							body: {
								arguments: ["foo"]
							}
						}
					});
				}
			});
			sandbox.stub(oBus, "publish").callsFake(function(mParameters) {
				if (mParameters.eventId !== PostMessageBus.event.READY) {
					assert.strictEqual(mParameters.target, window);
					assert.strictEqual(mParameters.origin, window.location.origin);
					assert.strictEqual(mParameters.channelId, CHANNEL_ID);
					assert.strictEqual(mParameters.eventId, "getService");
					assert.strictEqual(mParameters.data.id, "test-id-1");
					assert.strictEqual(mParameters.data.type, "response");
					assert.deepEqual(mParameters.data.body.methods, ["myMethod"]);
					assert.deepEqual(mParameters.data.body.properties, { foo: "bar" });
					assert.deepEqual(mParameters.data.body.events, ["event1"]);
					fnDone();
				}
			});
			const oReceiver = new Receiver(oRta);
			assert.ok(oReceiver, "Receiver instance should be created");
		});

		QUnit.test("Receiver responds to callMethod event on the bus", function(assert) {
			const fnDone = assert.async();
			const oService = {
				myAsyncMethod(a, b) {
					assert.strictEqual(a, 1);
					assert.strictEqual(b, 2);
					return Promise.resolve("ok");
				}
			};
			const oRta = {
				getService() { return Promise.resolve(oService); },
				_mServices: { foo: { service: { events: [] } } }
			};
			const oBus = PostMessageBus.getInstance();
			sandbox.stub(oBus, "subscribe").callsFake(function(sChannelId, sEventId, fnHandler) {
				if (sChannelId === CHANNEL_ID && sEventId === "callMethod") {
					fnHandler({
						eventId: sEventId,
						source: window,
						origin: window.location.origin,
						data: {
							id: "test-id-2",
							type: "response",
							body: {
								method: "myAsyncMethod",
								arguments: [1, 2]
							}
						}
					});
				}
			});
			sandbox.stub(oBus, "publish").callsFake(function(mParameters) {
				if (mParameters.eventId !== PostMessageBus.event.READY) {
					assert.strictEqual(mParameters.target, window);
					assert.strictEqual(mParameters.origin, window.location.origin);
					assert.strictEqual(mParameters.channelId, CHANNEL_ID);
					assert.strictEqual(mParameters.eventId, "callMethod");
					assert.strictEqual(mParameters.data.type, "response");
					assert.strictEqual(mParameters.data.status, "success");
					assert.strictEqual(mParameters.data.id, "test-id-2");
					assert.strictEqual(mParameters.data.body, "ok");
					fnDone();
				}
			});
			const oReceiver = new Receiver(oRta);
			assert.ok(oReceiver, "Receiver instance should be created");
		});

		QUnit.test("Receiver responds to subscribe event on the bus", function(assert) {
			const fnDone = assert.async();
			let bAttachCalled = false;
			const oService = {
				attachEvent() {
					bAttachCalled = true;
				}
			};
			const oRta = {
				getService() { return Promise.resolve(oService); }
			};
			const oBus = PostMessageBus.getInstance();
			sandbox.stub(oBus, "subscribe").callsFake(function(sChannelId, sEventId, fnHandler) {
				if (sChannelId === CHANNEL_ID && sEventId === "subscribe") {
					fnHandler({
						eventId: sEventId,
						source: window,
						origin: window.location.origin,
						data: {
							id: "test-id-4",
							type: "request",
							body: {
								service: "foo",
								event: "myEvent",
								id: "handler-id"
							}
						}
					});
				}
			});
			sandbox.stub(oBus, "publish").callsFake(function(mParameters) {
				if (mParameters.eventId !== PostMessageBus.event.READY) {
					assert.strictEqual(mParameters.target, window);
					assert.strictEqual(mParameters.origin, window.location.origin);
					assert.strictEqual(mParameters.channelId, CHANNEL_ID);
					assert.strictEqual(mParameters.eventId, "subscribe");
					assert.strictEqual(mParameters.data.type, "response");
					assert.strictEqual(mParameters.data.status, "success");
					assert.strictEqual(mParameters.data.id, "test-id-4");
					assert.ok(bAttachCalled, "bAttachCalled should be called");
					fnDone();
				}
			});
			const oReceiver = new Receiver(oRta);
			assert.ok(oReceiver, "Receiver instance should be created");
		});

		QUnit.test("Receiver responds to unsubscribe event on the bus", function(assert) {
			const fnDone = assert.async();
			let bDetachCalled = false;
			const oService = {
				detachEvent() {
					bDetachCalled = true;
				}
			};
			const oRta = {
				getService() { return Promise.resolve(oService); }
			};
			const oBus = PostMessageBus.getInstance();
			sandbox.stub(oBus, "subscribe").callsFake(function(sChannelId, sEventId, fnHandler) {
				if (sChannelId === CHANNEL_ID && sEventId === "unsubscribe") {
					fnHandler({
						eventId: sEventId,
						source: window,
						origin: window.location.origin,
						data: {
							id: "test-id-4",
							type: "request",
							body: {
								service: "foo",
								event: "myEvent",
								id: "handler-id"
							}
						}
					});
				}
			});
			sandbox.stub(oBus, "publish").callsFake(function(mParameters) {
				if (mParameters.eventId !== PostMessageBus.event.READY) {
					assert.strictEqual(mParameters.target, window);
					assert.strictEqual(mParameters.origin, window.location.origin);
					assert.strictEqual(mParameters.channelId, CHANNEL_ID);
					assert.strictEqual(mParameters.eventId, "unsubscribe");
					assert.strictEqual(mParameters.data.type, "response");
					assert.strictEqual(mParameters.data.status, "success");
					assert.strictEqual(mParameters.data.id, "test-id-4");
					assert.ok(bDetachCalled, "detachEvent should be called");
					fnDone();
				}
			});
			const oReceiver = new Receiver(oRta);
			assert.ok(oReceiver, "Receiver instance should be created");
		});

		QUnit.test("Receiver unsubscribes from all events on destroy", function(assert) {
			const oRta = {};
			const oBus = PostMessageBus.getInstance();
			const aUnsubscribed = [];
			// Spy on unsubscribe
			sandbox.stub(oBus, "unsubscribe").callsFake(function(channelId, eventId, fnHandler) {
				aUnsubscribed.push({ channelId, eventId, fnHandler });
			});
			// Stub subscribe to avoid side effects
			sandbox.stub(oBus, "subscribe").callsFake(function() {});
			const oReceiver = new Receiver(oRta);
			assert.ok(oReceiver, "Receiver instance should be created");
			// Call destroy
			oReceiver.destroy();
			// Check that unsubscribe was called for all events
			const aExpectedEvents = ["getService", "callMethod", "subscribe", "unsubscribe"];
			const aActualEvents = aUnsubscribed.map(function(e) { return e.eventId; });
			assert.deepEqual(aActualEvents.sort(), aExpectedEvents.sort(), "Unsubscribed from all expected events");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
