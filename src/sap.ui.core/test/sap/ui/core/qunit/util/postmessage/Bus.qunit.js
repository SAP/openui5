/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/postmessage/Bus",
	"sap/base/Log"
], function(
	PostMessageBus,
	Log
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createIframe(sSrc) {
		return new Promise(function(fnResolve) {
			var oIframe = document.createElement("iframe");
			oIframe.onload = function(oEvent) {
				fnResolve(oEvent.target);
			};
			if (sSrc) {
				oIframe.src = sSrc;
			}

			document.getElementById("qunit-fixture").appendChild(oIframe);
		});
	}

	function getPostMessageBus(oWindow) {
		return new Promise(function(fnResolve) {
			oWindow.sap.ui.require(["sap/ui/core/postmessage/Bus"], function(PostMessageBus) {
				fnResolve(PostMessageBus.getInstance());
			});
		});
	}

	QUnit.module("Singleton", {
		afterEach: function() {
			PostMessageBus.getInstance().destroy();
		}
	}, function() {
		QUnit.test("when created via constructor", function(assert) {
			assert.strictEqual(new PostMessageBus(), new PostMessageBus());
		});

		QUnit.test("when getInstance() is used", function(assert) {
			assert.strictEqual(PostMessageBus.getInstance(), PostMessageBus.getInstance());
		});

		QUnit.test("when a combination of a constructor and getInstance() is used", function(assert) {
			assert.strictEqual(new PostMessageBus(), PostMessageBus.getInstance());
		});
	});

	QUnit.module("Validation", {
		beforeEach: function() {
			return getPostMessageBus(window).then(function(PostMessageBus) {
				this.oPostMessageBus = PostMessageBus;
			}.bind(this))
			.then(createIframe.bind(this, sap.ui.require.toUrl("static/iframe.html")))
			.then(function(oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		afterEach: function() {
			this.oPostMessageBus.destroy();
		}
	}, function() {
		QUnit.test("target parameter", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.publish({
					origin: "http://example.com",
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: {},
					origin: "http://example.com",
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: window,
					origin: "http://example.com",
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.strictEqual(
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				}),
				undefined
			);
			assert.strictEqual(
				this.oPostMessageBus.publish({
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: PostMessageBus.event.READY
				}),
				undefined
			);
		});

		QUnit.test("origin parameter", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: {},
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.strictEqual(
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				}),
				undefined
			);
			assert.strictEqual(
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					channelId: "fakeChannel",
					eventId: PostMessageBus.event.READY
				}),
				undefined
			);
		});

		QUnit.test("channelId parameter", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: {},
					eventId: "fakeEvent"
				});
			}.bind(this));
			assert.strictEqual(
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				}),
				undefined
			);
		});

		QUnit.test("eventId parameter", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel"
				});
			}.bind(this));
			assert.throws(function() {
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: {}
				});
			}.bind(this));
			assert.strictEqual(
				this.oPostMessageBus.publish({
					target: this.oIframeWindow,
					origin: window.location.origin,
					channelId: "fakeChannel",
					eventId: "fakeEvent"
				}),
				undefined
			);
		});
	});

	QUnit.module("Sending message", {
		before: function() {
			QUnit.config.fixture = null;
			return createIframe(sap.ui.require.toUrl("static/iframe.html") + "?loadframework").then(function(oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		beforeEach: function() {
			return Promise.all([
				getPostMessageBus(window), getPostMessageBus(this.oIframeWindow)
			]).then(function(aResult) {
				this.oPostMessageBus = aResult[0];
				this.oPostMessageBusInFrame = aResult [1];
			}.bind(this));
		},
		afterEach: function() {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInFrame.destroy();
			sandbox.restore();
		},
		after: function() {
			QUnit.config.fixture = "";
		}
	}, function() {
		QUnit.test("when a message is sent with an object payload", function(assert) {
			var fnDone = assert.async();
			var mData = {
				foo: "bar"
			};
			this.oPostMessageBusInFrame.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				// JSON.stringify/parse are needed to recreate and an object in current window,
				// otherwise 2 objects could not be compared properly
				assert.deepEqual(JSON.parse(JSON.stringify(oEvent.data)), mData);
				fnDone();
			});
			this.oPostMessageBus.publish({
				target: this.oIframeWindow,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: mData
			});
		});

		QUnit.test("when a message is sent to unknown origin (this origin must be allowed in sender window)", function(assert) {
			var fnDone = assert.async();
			var mData = {
				foo: "bar"
			};
			this.oPostMessageBus.resetAcceptedOrigins();
			this.oPostMessageBusInFrame.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				// JSON.stringify/parse are needed to recreate and an object in current window,
				// otherwise 2 objects could not be compared properly
				assert.deepEqual(JSON.parse(JSON.stringify(oEvent.data)), mData);
				assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes(this.oIframeWindow.location.origin));
				fnDone();
			}, this);
			this.oPostMessageBus.publish({
				target: this.oIframeWindow,
				origin: this.oIframeWindow.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: mData
			});
		});

		QUnit.test("when READY message is sent, origin and target are optional (window.opener use case)", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(window, "parent").value(window);
			sandbox.stub(window, "opener").value(this.oIframeWindow);

			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.READY, function() {
				assert.ok(true);
				fnDone();
			}, this);

			this.oPostMessageBus.publish({
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.READY
			});
		});

		QUnit.test("when READY message is sent, origin and target are optional (window.parent use case)", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(window, "opener").value(null);
			sandbox.stub(window, "parent").value(this.oIframeWindow);

			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.READY, function() {
				assert.ok(true);
				fnDone();
			}, this);

			this.oPostMessageBus.publish({
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.READY
			});
		});
	});

	QUnit.module("Receiving message", {
		before: function() {
			QUnit.config.fixture = null;
			return createIframe(sap.ui.require.toUrl("static/iframe.html") + "?loadframework").then(function(oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		beforeEach: function() {
			return Promise.all([
				getPostMessageBus(window), getPostMessageBus(this.oIframeWindow)
			]).then(function(aResult) {
				this.oPostMessageBus = aResult[0];
				this.oPostMessageBusInFrame = aResult [1];
			}.bind(this));
		},
		afterEach: function() {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInFrame.destroy();
			sandbox.restore();
		},
		after: function() {
			QUnit.config.fixture = "";
		}
	}, function() {
		QUnit.test("when a message is received with an object payload", function(assert) {
			var fnDone = assert.async();
			var mData = {
				foo: "bar"
			};
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				assert.deepEqual(oEvent.data, mData);
				fnDone();
			});

			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: mData
			});

		});

		QUnit.test("when a message is received with a string payload", function(assert) {
			var fnDone = assert.async();
			var sData = "sample";
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				assert.strictEqual(oEvent.data, sData);
				fnDone();
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: sData
			});
		});

		QUnit.test("when a message is received from an unknown origin and is accepted", function(assert) {
			var fnDone1 = assert.async();
			var fnDone2 = assert.async();
			var sData = "sample";
			var sServiceName = "Sample Service";

			// 1. Clear accepted origins (simulate cross-origin message)
			this.oPostMessageBus.resetAcceptedOrigins();
			this.oPostMessageBusInFrame.resetAcceptedOrigins();

			// 2. Stub confirmation dialog
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, function(sMessage) {
				assert.ok(typeof sMessage === "string" && sMessage.indexOf(sServiceName) !== -1);
				assert.ok(typeof sMessage === "string" && sMessage.indexOf(this.oIframeWindow.location.origin) !== -1);
				return Promise.resolve();
			}.bind(this));

			// 3.1. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				assert.strictEqual(oEvent.data, sData);
				assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes(oEvent.origin));
				fnDone1();
			}, this);

			// 3.2. Subscribe in iframe to check ACCEPTED message
			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.ACCEPTED, function(oEvent) {
				assert.strictEqual(oEvent.data, undefined);
				assert.ok(this.oPostMessageBusInFrame.getAcceptedOrigins().includes(oEvent.origin));
				fnDone2();
			}, this);

			// 4. Send CONNECT message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: sServiceName
			});

			// 5. Send service message with payload
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: sData
			});
		});

		QUnit.test("when READY message is sent, origin and target are optional", function(assert) {
			var fnDone = assert.async();
			var sData = "sample";

			// 1. Clear accepted origins (simulate cross-origin message)
			this.oPostMessageBus.resetAcceptedOrigins();

			// 2. Stub confirmation dialog
			var oConfirmationStub = sandbox.stub().returns(Promise.resolve());
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, oConfirmationStub);

			// 3. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", PostMessageBus.event.READY, function(oEvent) {
				assert.strictEqual(oEvent.data, undefined); // no data is allowed in ready event
				assert.ok(oConfirmationStub.notCalled);
				assert.notOk(this.oPostMessageBus.getAcceptedOrigins().includes(oEvent.origin));
				fnDone();
			}, this);

			// 4. Send message
			this.oPostMessageBusInFrame.publish({
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.READY,
				data: sData
			});
		});

		QUnit.test("when a CONNECT message is received from already accepted origin", function(assert) {
			var fnDone = assert.async();

			// 1. Stub confirmation dialog
			var oConfirmationStub = sandbox.stub().returns(Promise.resolve());
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, oConfirmationStub);

			// 2. Make sure origin is pre-accepted
			this.oPostMessageBus.addAcceptedOrigin(this.oIframeWindow.location.origin);

			// 3. Subscribe in iframe to check ACCEPTED message
			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.ACCEPTED, function(oEvent) {
				assert.strictEqual(oEvent.data, undefined);
				assert.ok(oConfirmationStub.notCalled);
				fnDone();
			}, this);

			// 4. Send CONNECT message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: "Sample Service"
			});
		});

		QUnit.test("when a message is received from an unknown origin and is declined", function(assert) {
			var fnDone = assert.async();
			var sServiceName = "Sample Service";

			// 1. Clear accepted origins (simulate cross-origin message)
			this.oPostMessageBus.resetAcceptedOrigins();

			// 2. Stub confirmation dialog
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, function(sMessage) {
				assert.ok(typeof sMessage === "string" && sMessage.indexOf(sServiceName) !== -1);
				return Promise.reject();
			});

			// 3.1. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function() {
				assert.ok(false, "this should never be called");
			}, this);

			// 3.2. Subscribe in iframe to check DECLINED message
			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.DECLINED, function(oEvent) {
				assert.strictEqual(oEvent.data, undefined);
				assert.ok(this.oPostMessageBus.getDeclinedOrigins().includes(this.oIframeWindow.location.origin));
				fnDone();
			}, this);

			// 4. Send CONNECT message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: sServiceName
			});

			// 5. Send service message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent"
			});
		});

		QUnit.test("when a message is received from a declined origin", function(assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			// 1. Block iframe origin
			this.oPostMessageBus.addDeclinedOrigin(this.oIframeWindow.location.origin);

			// 2. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", oSpy);

			// 3. Send message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent"
			});

			// 4. Check whether message was ignored
			setTimeout(function() {
				assert.notOk(oSpy.called);
				fnDone();
			}, 10);
		});

		QUnit.test("when a non-UI5 message is received (not an object)", function(assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			// 1. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", oSpy);

			// 2. Send message
			window.postMessage("message", window.location.origin);

			// 3. Check whether message was ignored
			setTimeout(function() {
				assert.notOk(oSpy.called);
				fnDone();
			}, 10);
		});

		QUnit.test("when a non-UI5 message is received (not signed as UI5)", function(assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();

			// 1. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", oSpy);

			// 2. Send message
			window.postMessage({ foo: "bar" }, window.location.origin);

			// 3. Check whether message was ignored
			setTimeout(function() {
				assert.notOk(oSpy.called);
				fnDone();
			}, 10);
		});

		QUnit.test("when READY message is received (confirmation dialog must not be shown)", function(assert) {
			var fnDone = assert.async();

			// 1. Clear accepted origins (simulate cross-origin message)
			this.oPostMessageBus.resetAcceptedOrigins();

			// 2. Stub confirmation dialog
			var oConfirmationStub = sandbox.stub().returns(Promise.resolve());
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, oConfirmationStub);

			// 3. Subscribe
			this.oPostMessageBus.subscribe("fakeChannel", PostMessageBus.event.READY, function(oEvent) {
				assert.strictEqual(oEvent.data, undefined); // no data is allowed in ready event
				assert.ok(oConfirmationStub.notCalled);
				assert.notOk(this.oPostMessageBus.getAcceptedOrigins().includes(oEvent.origin));
				fnDone();
			}, this);

			// 4. Send message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.READY,
				data: "sample"
			});
		});

		QUnit.test("when PostMessageBus is destroyed between message processing, then event queue must be erased", function(assert) {
			var fnDone = assert.async();

			// 1. Clear accepted origins (simulate cross-origin message)
			this.oPostMessageBus.resetAcceptedOrigins();

			// 2. Spy on processor
			var oProcessingSpy = sandbox.spy(this.oPostMessageBus, "_processEvent");

			// 3. Stub confirmation dialog
			sandbox.stub(sap.ui, "require").withArgs(["sap/ui/core/postmessage/confirmationDialog"]).callsArgWithAsync(1, function() {
				return new Promise(function(fnResolve) {
					this.oPostMessageBus.destroy();
					fnResolve();
					setTimeout(function() {
						assert.ok(oProcessingSpy.calledOnce);
						fnDone();
					});
				}.bind(this));
			}.bind(this));

			// 4. Send CONNECT message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: "Service name"
			});

			// 5. Send service message with payload
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent"
			});
		});

		QUnit.test("when a CONNECT message has no service name or it's not a string", function(assert) {
			var fnDone = assert.async();

			// 3.2. Subscribe in iframe to check DECLINED message
			var oReceiverStub = sandbox.stub()
				.onFirstCall().callsFake(function() {
					assert.ok(!this.oPostMessageBus.getDeclinedOrigins().includes(this.oIframeWindow.location.origin));
				}.bind(this))
				.onSecondCall().callsFake(function() {
					assert.ok(!this.oPostMessageBus.getDeclinedOrigins().includes(this.oIframeWindow.location.origin));
				}.bind(this))
				.onThirdCall().callsFake(function() {
					assert.ok(!this.oPostMessageBus.getDeclinedOrigins().includes(this.oIframeWindow.location.origin));
					fnDone();
				}.bind(this));
			this.oPostMessageBusInFrame.subscribe("fakeChannel", PostMessageBus.event.DECLINED, oReceiverStub, this);

			// 4. Send CONNECT message
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: 123
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: PostMessageBus.event.CONNECT,
				data: {}
			});
		});

		QUnit.test("when several consequent messages have been received", function(assert) {
			var fnDone = sandbox.spy(assert.async(2));

			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				assert.deepEqual(oEvent.data, "foo" + fnDone.callCount);
				fnDone();
			});

			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "foo0"
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "foo1"
			});
		});

		QUnit.test("when error in subscriber functionhappens, following message has to be still delivered (Error object case)", function(assert) {
			var fnDone = sandbox.spy(assert.async(2));
			var oSpy = sandbox.stub(Log, "error");

			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				switch (fnDone.callCount) {
					case 0:
						fnDone();
						throw new Error("some error happens");
					case 1:
						assert.deepEqual(oEvent.data, "bar");
						assert.ok(oSpy.calledOnce);
						assert.ok(
							oSpy.withArgs(
								sinon.match(function(sMessage, sDetail) {
									return (
										typeof sMessage === "string" && sMessage.includes("some error happens")
										|| typeof sDetail === "string" && sDetail.includes("some error happens")
									);
								})
							)
						);
						fnDone();
						break;
					// no default
				}
			});

			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "foo"
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "bar"
			});
		});

		QUnit.test("when error in subscriber functionhappens, second message has to be still delivered still (String error case)", function(assert) {
			var fnDone = sandbox.spy(assert.async(2));
			var oSpy = sandbox.stub(Log, "error");

			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				switch (fnDone.callCount) {
					case 0:
						fnDone();
						throw "some error happens";
					case 1:
						assert.deepEqual(oEvent.data, "bar");
						assert.ok(oSpy.calledOnce);
						assert.ok(
							oSpy.withArgs(
								sinon.match(function(sMessage, sDetail) {
									return (
										typeof sMessage === "string" && sMessage.includes("some error happens")
										|| typeof sDetail === "string" && sDetail.includes("some error happens")
									);
								})
							)
						);
						fnDone();
						break;
					// no default
				}
			});

			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "foo"
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "bar"
			});
		});

		QUnit.test("when error in subscriber functionhappens, second message has to be still delivered still (Empty error case)", function(assert) {
			var fnDone = sandbox.spy(assert.async(2));
			var oSpy = sandbox.stub(Log, "error");

			this.oPostMessageBus.subscribe("fakeChannel", "fakeEvent", function(oEvent) {
				switch (fnDone.callCount) {
					case 0:
						fnDone();
						throw 0;
					case 1:
						assert.deepEqual(oEvent.data, "bar");
						assert.ok(oSpy.calledOnce);
						assert.ok(
							oSpy.withArgs(
								sinon.match(function(sMessage, sDetail) {
									return (
										typeof sMessage === "string" && sMessage.includes("Some unexpected error happened during post message processing")
										|| typeof sDetail === "string" && sDetail.includes("Some unexpected error happened during post message processing")
									);
								})
							)
						);
						fnDone();
						break;
					// no default
				}
			});

			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "foo"
			});
			this.oPostMessageBusInFrame.publish({
				target: window,
				origin: window.location.origin,
				channelId: "fakeChannel",
				eventId: "fakeEvent",
				data: "bar"
			});
		});
	});

	QUnit.module("Accept/Decline origin", {
		beforeEach: function() {
			this.oPostMessageBus = PostMessageBus.getInstance();
		},
		afterEach: function() {
			PostMessageBus.getInstance().destroy();
		}
	}, function() {
		QUnit.test("getAcceptedOrigins() - always returns an array", function(assert) {
			assert.ok(Array.isArray(this.oPostMessageBus.getAcceptedOrigins()));
			this.oPostMessageBus.resetAcceptedOrigins();
			assert.ok(Array.isArray(this.oPostMessageBus.getAcceptedOrigins()));
		});

		QUnit.test("getAcceptedOrigins() - current window origin is automatically accepted", function(assert) {
			assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes(window.location.origin));
		});

		QUnit.test("getAcceptedOrigins() - returned array is immutable", function(assert) {
			var aAcceptedOrigins = this.oPostMessageBus.getAcceptedOrigins();
			aAcceptedOrigins.push("http://example.com");
			assert.notOk(this.oPostMessageBus.getAcceptedOrigins().includes("http://example.com"));
		});

		QUnit.test("setAcceptedOrigins() - called with a valid value", function(assert) {
			this.oPostMessageBus.setAcceptedOrigins(["http://example.com"]);
			assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes("http://example.com"));
		});

		QUnit.test("setAcceptedOrigins() - called with an invalid value (non-array)", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.setAcceptedOrigins("http://example.com");
			}.bind(this));
		});

		QUnit.test("addAcceptedOrigin() - called with a valid value", function(assert) {
			this.oPostMessageBus.addAcceptedOrigin("http://example.com");
			this.oPostMessageBus.addAcceptedOrigin("http://example.com:8080");
			this.oPostMessageBus.addAcceptedOrigin("http://localhost:9090");
			assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes("http://example.com"));
			assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes("http://example.com:8080"));
			assert.ok(this.oPostMessageBus.getAcceptedOrigins().includes("http://localhost:9090"));
		});

		QUnit.test("addAcceptedOrigin() - called with an invalid value (non-string)", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.addAcceptedOrigin({});
			});
		});

		QUnit.test("resetAcceptedOrigins()", function(assert) {
			this.oPostMessageBus.addAcceptedOrigin("http://example.com");
			this.oPostMessageBus.addAcceptedOrigin("http://example.com:8080");
			this.oPostMessageBus.addAcceptedOrigin("http://localhost:9090");
			this.oPostMessageBus.resetAcceptedOrigins();
			assert.strictEqual(this.oPostMessageBus.getAcceptedOrigins().length, 0);
		});

		QUnit.test("getDeclinedOrigins() - always returns an array", function(assert) {
			assert.ok(Array.isArray(this.oPostMessageBus.getDeclinedOrigins()));
		});

		QUnit.test("getDeclinedOrigins() - returned array is immutable", function(assert) {
			var aDeclinedOrigins = this.oPostMessageBus.getDeclinedOrigins();
			aDeclinedOrigins.push("http://example.com");
			assert.notOk(this.oPostMessageBus.getDeclinedOrigins().includes("http://example.com"));
		});

		QUnit.test("setDeclinedOrigins() - called with a valid value", function(assert) {
			this.oPostMessageBus.setDeclinedOrigins(["http://example.com"]);
			assert.ok(this.oPostMessageBus.getDeclinedOrigins().includes("http://example.com"));
		});

		QUnit.test("setDeclinedOrigins() - called with an invalid value (non-array)", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.setDeclinedOrigins("http://example.com");
			}.bind(this));
		});

		QUnit.test("addDeclinedOrigin() - called with a valid value", function(assert) {
			this.oPostMessageBus.addDeclinedOrigin("http://example.com");
			this.oPostMessageBus.addDeclinedOrigin("http://example.com:8080");
			this.oPostMessageBus.addDeclinedOrigin("http://localhost:9090");
			assert.ok(this.oPostMessageBus.getDeclinedOrigins().includes("http://example.com"));
			assert.ok(this.oPostMessageBus.getDeclinedOrigins().includes("http://example.com:8080"));
			assert.ok(this.oPostMessageBus.getDeclinedOrigins().includes("http://localhost:9090"));
		});

		QUnit.test("addDeclinedOrigin() - called with an invalid value (non-string)", function(assert) {
			assert.throws(function() {
				this.oPostMessageBus.addDeclinedOrigin({});
			});
		});

		QUnit.test("resetDeclinedOrigins()", function(assert) {
			this.oPostMessageBus.addDeclinedOrigin("http://example.com");
			this.oPostMessageBus.addDeclinedOrigin("http://example.com:8080");
			this.oPostMessageBus.addDeclinedOrigin("http://localhost:9090");
			this.oPostMessageBus.resetDeclinedOrigins();
			assert.strictEqual(this.oPostMessageBus.getDeclinedOrigins().length, 0);
		});
	});
});