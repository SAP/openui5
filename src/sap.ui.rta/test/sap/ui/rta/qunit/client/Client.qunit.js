/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/Client",
	"sap/ui/core/postmessage/Bus",
	"sap/ui/thirdparty/sinon-4"
],
function (
	RTAClient,
	PostMessageBus,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var CHANNEL_ID = 'sap.ui.rta.service.receiver';

	function createIframe(sSrc) {
		return new Promise(function (fnResolve) {
			var oIframe = document.createElement('iframe');

			oIframe.onload = function (oEvent) {
				fnResolve(oEvent.target);
			};
			if (sSrc) {
				oIframe.src = sSrc;
			}

			document.getElementById('qunit-fixture').appendChild(oIframe);
		});
	}

	function getPostMessageBus(oWindow) {
		var PostMessageBus = oWindow.sap.ui.requireSync('sap/ui/core/postmessage/Bus');
		return PostMessageBus.getInstance();
	}

	QUnit.module("Initialisation", {
		beforeEach: function () {
			this.oPostMessageBus = getPostMessageBus(window);
		},
		afterEach: function () {
			this.oPostMessageBus.destroy();
		}
	}, function () {
		QUnit.test("creating an instance without window parameter", function (assert) {
			assert.throws(function () {
				new RTAClient({
					origin: "http://example.com"
				});
			});
		});
		QUnit.test("creating an instance with invalid window parameter (incorrect window instance)", function (assert) {
			assert.throws(function () {
				new RTAClient({
					window: window,
					origin: "http://example.com"
				});
			});
		});
		QUnit.test("creating an instance with invalid window parameter (nil case)", function (assert) {
			assert.throws(function () {
				new RTAClient({
					window: null,
					origin: "http://example.com"
				});
			});
			assert.throws(function () {
				new RTAClient({
					window: undefined,
					origin: "http://example.com"
				});
			});
		});
		QUnit.test("creating an instance without origin parameter", function (assert) {
			return createIframe().then(function (oIframe) {
				assert.throws(function () {
					new RTAClient({
						window: oIframe.contentWindow
					});
				});
			});
		});
		QUnit.test("creating an instance with invalid origin parameter (non a string)", function (assert) {
			return createIframe().then(function (oIframe) {
				assert.throws(function () {
					new RTAClient({
						window: oIframe.contentWindow,
						origin: {}
					});
				});
			});
		});
		QUnit.test("creating an instance with invalid origin parameter (nil case)", function (assert) {
			return createIframe().then(function (oIframe) {
				assert.throws(function () {
					new RTAClient({
						window: oIframe.contentWindow,
						origin: null
					});
				});
				assert.throws(function () {
					new RTAClient({
						window: oIframe.contentWindow,
						origin: undefined
					});
				});
			});
		});
		QUnit.test("creating an instance with invalid origin parameter (invalid string)", function (assert) {
			return createIframe().then(function (oIframe) {
				assert.throws(function () {
					new RTAClient({
						window: oIframe.contentWindow,
						origin: 'example.com'
					});
				});
			});
		});
		QUnit.test("creating an instance with valid origin and window parameters", function (assert) {
			return createIframe().then(function (oIframe) {
				var oRTAClient = new RTAClient({
					window: oIframe.contentWindow,
					origin: "http://example.com"
				});
				assert.ok(oRTAClient instanceof RTAClient);
				assert.ok(typeof oRTAClient.getService === 'function');
				oRTAClient.destroy();
			});
		});
		QUnit.test("attempt to change window parameter after initial initialisation", function (assert) {
			return createIframe().then(function (oIframe) {
				var oRTAClient = new RTAClient({
					window: oIframe.contentWindow,
					origin: "http://example.com"
				});
				assert.throws(function () {
					oRTAClient.setWindow(oIframe.contentWindow);
				});
				oRTAClient.destroy();
			});
		});
		QUnit.test("attempt to change origin parameter after initial initialisation", function (assert) {
			return createIframe().then(function (oIframe) {
				var oRTAClient = new RTAClient({
					window: oIframe.contentWindow,
					origin: "http://example.com"
				});
				assert.throws(function () {
					oRTAClient.setOrigin("http://www.sap.com");
				});
				oRTAClient.destroy();
			});
		});
	});

	QUnit.module("Handshake", {
		before: function () {
			QUnit.config.fixture = null;
			return createIframe('./iframe.html?loadframework').then(function (oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		beforeEach: function (assert) {
			this.oPostMessageBus = getPostMessageBus(window);
			this.oPostMessageBusInIframe = getPostMessageBus(this.oIframeWindow);
			this.oRTAClient = new RTAClient({
				window: this.oIframeWindow,
				origin: this.oIframeWindow.location.origin
			});
		},
		afterEach: function () {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInIframe.destroy();
			sandbox.restore();
		},
		after: function () {
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("CONNECT message should be sent after receiving READY message", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === PostMessageBus.event.CONNECT
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					assert.ok(true);
					fnDone();
				});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("no messages are sent before connection is acknowledged", function (assert) {
			var oPublishSpy = sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId !== PostMessageBus.event.CONNECT
						);
					}.bind(this))
				);
			this.oRTAClient.getService('foo');
			assert.ok(oPublishSpy.notCalled);
		});
		QUnit.test("queued messages are sent after connection is acknowledged", function (assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId !== PostMessageBus.event.CONNECT
						);
					}.bind(this))
				)
				.onFirstCall()
					.returns()
				.onSecondCall()
					.callsFake(function () {
						assert.ok(true);
						fnDone();
					});

			this.oRTAClient.getService('foo');
			this.oRTAClient.getService('bar');
			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("queued messages are rejected after connection is declined", function (assert) {
			var fnDone1 = assert.async();
			var fnDone2 = assert.async();

			sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === PostMessageBus.event.CONNECT
						);
					}.bind(this))
				)
				.callsFake(function () {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: PostMessageBus.event.DECLINED
					});
				}.bind(this));

			this.oRTAClient.getService('foo').catch(function () {
				assert.ok(true);
				fnDone1();
			});
			this.oRTAClient.getService('bar').catch(function () {
				assert.ok(true);
				fnDone2();
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
	});

	QUnit.module("Ignore irrelevant events", {
		before: function () {
			QUnit.config.fixture = null;
			return Promise.all([
				createIframe('./iframe.html?loadframework').then(function (oIframe) {
					this.oIframeWindow1 = oIframe.contentWindow;
				}.bind(this)),
				createIframe('./iframe.html?loadframework').then(function (oIframe) {
					this.oIframeWindow2 = oIframe.contentWindow;
				}.bind(this))
			]);
		},
		beforeEach: function (assert) {
			this.oPostMessageBus = getPostMessageBus(window);
			this.oPostMessageBusInIframe1 = getPostMessageBus(this.oIframeWindow1);
			this.oPostMessageBusInIframe2 = getPostMessageBus(this.oIframeWindow2);
			this.oRTAClient = new RTAClient({
				window: this.oIframeWindow1,
				origin: this.oIframeWindow1.location.origin
			});
		},
		afterEach: function () {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInIframe1.destroy();
			this.oPostMessageBusInIframe2.destroy();
			sandbox.restore();
		},
		after: function () {
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("READY event from another window is ignored", function (assert) {
			var fnDone = assert.async();
			var oPublishStub = sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === PostMessageBus.event.CONNECT
						);
					}.bind(this))
				)
				.callsFake(function () {
					throw new Error('this must never be called');
				});

			this.oPostMessageBusInIframe2.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});

			// We assume that we subscribe later than the Client does it AND that UI5 calls listeners
			// in subscription order. If these conditions are not met, then wrap it into setTimeout(function () {}, 20);
			this.oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.READY, function () {
				assert.ok(oPublishStub.notCalled);
				fnDone();
			});
		});
		QUnit.test("ACCEPTED event from another window is ignored", function (assert) {
			var fnDone = assert.async();
			// Flow:
			// 1. iframe1 sends READY
			// 2. current window sends CONNECT to iframe1
			// 3. CONNECT event is intercepted with stub and ACCEPTED event from iframe2 is emitted
			var oPublishStub = sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					if (mParameters.eventId === PostMessageBus.event.CONNECT) {
						// We assume that we subscribe later than the Client does it AND that UI5 calls listeners
						// in subscription order. If these conditions are not met, then wrap it into setTimeout(function () {}, 20);
						this.oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.ACCEPTED, function () {
							assert.notOk(
								oPublishStub.calledWithMatch(
									sinon.match(function (mParameters) {
										return (
											mParameters.target === this.oIframeWindow1
											&& mParameters.origin === this.oIframeWindow1.location.origin
											&& mParameters.channelId === CHANNEL_ID
											&& mParameters.eventId !== PostMessageBus.event.CONNECT
										);
									}.bind(this))
								)
							);
							fnDone();
						}, this);
						this.oPostMessageBusInIframe2.publish({
							target: window,
							origin: window.location.origin,
							channelId: CHANNEL_ID,
							eventId: PostMessageBus.event.ACCEPTED
						});
					}
				}.bind(this));

			this.oRTAClient.getService('foo');

			this.oPostMessageBusInIframe1.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("DECLINED event from another window is ignored", function (assert) {
			var fnDone = assert.async();
			assert.expect(1);

			// Flow:
			// 1. iframe1 sends READY
			// 2. current window sends CONNECT to iframe1
			// 3. CONNECT event is intercepted with stub and DECLINED event from iframe2 is emitted
			sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === PostMessageBus.event.CONNECT
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					// We assume that we subscribe later than the Client does it AND that UI5 calls listeners
					// in subscription order. If these conditions are not met, then wrap it into setTimeout(function () {}, 20);
					this.oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.DECLINED, function () {
						setTimeout(function () {
							assert.ok(true);
							fnDone();
						}, 20);
					}, this);
					this.oPostMessageBusInIframe2.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: PostMessageBus.event.DECLINED
					});
				}.bind(this));

			this.oRTAClient.getService('foo').catch(function () {
				assert.ok(false, 'this must never be called');
			});

			this.oPostMessageBusInIframe1.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("response events from another window are ignored", function (assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe2.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'callMethod',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: "success",
							body: true
						}
					});

					setTimeout(function () {
						assert.ok(true);
						fnDone();
					}, 20);
				}.bind(this));

			this.oRTAClient.getService('foo').then(
				function () {
					assert.ok(false, 'must never be called');
				},
				function () {
					assert.ok(false, 'must never be called');
				}
			);

			this.oPostMessageBusInIframe1.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("events are ignored from another window", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe1.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mParameters.data.id,
							type: "response",
							body: {
								events: ["customEvent"]
							}
						}
					});
				}.bind(this))
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow1
							&& mParameters.origin === this.oIframeWindow1.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe1.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'subscribe',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: 'success',
							body: {
								id: 'eventHandlerId'
							}
						}
					});
					this.oPostMessageBusInIframe2.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'event',
						data: {
							body: {
								service: 'foo',
								event: 'customEvent',
								data: {
									foo: 'bar'
								}
							}
						}
					});
					setTimeout(function () {
						assert.ok(true);
						fnDone();
					}, 20);
				}.bind(this));

			this.oRTAClient.getService('foo').then(function (oService) {
				oService.attachEvent('customEvent', function (vData) {
					assert.ok(false, 'must never be called');
				});
			});

			this.oPostMessageBusInIframe1.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
	});

	QUnit.module("API - getService()", {
		before: function () {
			QUnit.config.fixture = null;
			return createIframe('./iframe.html?loadframework').then(function (oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		beforeEach: function (assert) {
			this.oPostMessageBus = getPostMessageBus(window);
			this.oPostMessageBusInIframe = getPostMessageBus(this.oIframeWindow);
			this.oRTAClient = new RTAClient({
				window: this.oIframeWindow,
				origin: this.oIframeWindow.location.origin
			});
		},
		afterEach: function () {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInIframe.destroy();
			sandbox.restore();
		},
		after: function () {
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("service name is required", function (assert) {
			assert.throws(function () {
				this.oRTAClient.getService();
			}.bind(this));
		});
		QUnit.test("rejects immediately without sending a request when connection is DECLINED", function (assert) {
			var fnDone = assert.async();
			var oPublishStub = sandbox.stub(this.oPostMessageBus, 'publish')
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					if (mParameters.eventId === PostMessageBus.event.CONNECT) {
						// We assume that we subscribe later than the Client does it AND that UI5 calls listeners
						// in subscription order. If these conditions are not met, then wrap it into setTimeout(function () {}, 20);
						this.oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.DECLINED, function () {
							this.oRTAClient.getService('foo').catch(function () {
								assert.notOk(
									oPublishStub.calledWithMatch(
										sinon.match(function (mParameters) {
											return (
												mParameters.target === this.oIframeWindow
												&& mParameters.origin === this.oIframeWindow.location.origin
												&& mParameters.channelId === CHANNEL_ID
												&& mParameters.eventId !== PostMessageBus.event.CONNECT
											);
										}.bind(this))
									)
								);
								fnDone();
							}.bind(this));
						}, this);
						this.oPostMessageBusInIframe.publish({
							target: window,
							origin: window.location.origin,
							channelId: CHANNEL_ID,
							eventId: PostMessageBus.event.DECLINED
						});
					}
				}.bind(this));

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("service methods are properly created and wrapped into promises", function (assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mData = mParameters.data;
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mData.id,
							type: "response",
							body: {
								methods: ["method1", "method2"]
							}
						}
					});
				}.bind(this));

			this.oRTAClient.getService("foo").then(function (oService) {
				assert.ok(typeof oService.method1 === "function");
				assert.ok(typeof oService.method2 === "function");
				assert.ok(oService.method1('a', 'b', 'c') instanceof Promise);
				fnDone();
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("service properties are properly passed 'as is' through", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mData = mParameters.data;
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mData.id,
							type: "response",
							body: {
								properties: {
									customProperty1: 'value',
									customProperty2: {
										foo: 'bar'
									}
								}
							}
						}
					});
				}.bind(this));

			this.oRTAClient.getService("foo").then(function (oService) {
				assert.strictEqual(oService.customProperty1, 'value');
				assert.deepEqual(oService.customProperty2, { foo: 'bar' });
				fnDone();
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("attachEvent(), detachEvent(), attachEventOnce() helpers are created when service has events", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mData = mParameters.data;
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mData.id,
							type: "response",
							body: {
								events: ["customEvent"]
							}
						}
					});
				}.bind(this));

			this.oRTAClient.getService("foo").then(function (oService) {
				assert.ok(typeof oService.attachEvent === 'function');
				assert.ok(typeof oService.detachEvent === 'function');
				assert.ok(typeof oService.attachEventOnce === 'function');
				fnDone();
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("calling a service method with a successful response", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mParameters.data.id,
							type: "response",
							body: {
								methods: ["customMethod"]
							}
						}
					});
				}.bind(this))
				// callMethod events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'callMethod'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mRequestBody = mParameters.data.body;
					assert.strictEqual(mRequestBody.service, 'foo');
					assert.strictEqual(mRequestBody.method, 'customMethod');
					assert.deepEqual(mRequestBody.arguments, ['a', 'b', 'c']);
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'callMethod',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: "success",
							body: true
						}
					});
				}.bind(this));

			this.oRTAClient.getService("foo").then(function (oService) {
				oService.customMethod('a', 'b', 'c').then(function (vResult) {
					assert.strictEqual(vResult, true);
					fnDone();
				});
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("calling a service method with an error response", function (assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mParameters.data.id,
							type: "response",
							body: {
								methods: ["customMethod"]
							}
						}
					});
				}.bind(this))
				// callMethod events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'callMethod'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mRequestBody = mParameters.data.body;
					assert.strictEqual(mRequestBody.service, 'foo');
					assert.strictEqual(mRequestBody.method, 'customMethod');
					assert.deepEqual(mRequestBody.arguments, ['a', 'b', 'c']);
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'callMethod',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: "error",
							body: "some error occur"
						}
					});
				}.bind(this));

			this.oRTAClient.getService("foo").then(function (oService) {
				oService.customMethod('a', 'b', 'c').then(
					function (vResult) {
						assert.ok(false, "must never be called");
					},
					function (vError) {
						assert.strictEqual(vError, "some error occur");
						fnDone();
					}
				);
			});

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
		QUnit.test("receiving a message with an incorrect type", function (assert) {
			var fnDone = assert.async();

			this.oRTAClient.getService("foo").then(
				function () {
					assert.ok(false, 'must never be called');
				},
				function () {
					assert.ok(false, 'must never be called');
				}
			);

			sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mParameters.data.id,
							type: "request",
							body: null
						}
					});
					setTimeout(function () {
						assert.ok(true);
						fnDone();
					}, 20);
				}.bind(this));

			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
		});
	});

	QUnit.module("API - Events", {
		before: function () {
			QUnit.config.fixture = null;
			return createIframe('./iframe.html?loadframework').then(function (oIframe) {
				this.oIframeWindow = oIframe.contentWindow;
			}.bind(this));
		},
		beforeEach: function (assert) {
			this.oPostMessageBus = getPostMessageBus(window);
			this.oPostMessageBusInIframe = getPostMessageBus(this.oIframeWindow);
			this.oRTAClient = new RTAClient({
				window: this.oIframeWindow,
				origin: this.oIframeWindow.location.origin
			});
			this.oPublishStub = sandbox.stub(this.oPostMessageBus, 'publish')
				.callThrough()
				// getService events
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'getService'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'getService',
						data: {
							id: mParameters.data.id,
							type: "response",
							body: {
								events: ["customEvent"]
							}
						}
					});
				}.bind(this));
			this.oPostMessageBusInIframe.publish({
				target: window,
				origin: window.location.origin,
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});
			return this.oRTAClient.getService('foo').then(function (oService) {
				this.oService = oService;
			}.bind(this));
		},
		afterEach: function () {
			this.oPostMessageBus.destroy();
			this.oPostMessageBusInIframe.destroy();
			sandbox.restore();
		},
		after: function () {
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("attachEvent() without arguments", function (assert) {
			assert.throws(function () {
				this.oService.attachEvent();
			}.bind(this));
		});
		QUnit.test("attachEvent() with invalid event name", function (assert) {
			assert.throws(function () {
				this.oService.attachEvent({}, function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.attachEvent('', function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.attachEvent(undefined, function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.attachEvent(null, function () {});
			}.bind(this));
		});
		QUnit.test("attachEvent() with invalid event handler", function (assert) {
			assert.throws(function () {
				this.oService.attachEvent('customEvent');
			}.bind(this));
			assert.throws(function () {
				this.oService.attachEvent('customEvent', null);
			}.bind(this));
			assert.throws(function () {
				this.oService.attachEvent('customEvent', {});
			}.bind(this));
		});
		QUnit.test("attachEvent() with valid arguments", function (assert) {
			var fnDone = assert.async();
			this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mRequestBody = mParameters.data.body;
					assert.strictEqual(mRequestBody.service, 'foo');
					assert.strictEqual(mRequestBody.event, 'customEvent');
					fnDone();
				});

			this.oService.attachEvent('customEvent', function () {});
		});
		QUnit.test("second attachEvent() for the same event must not notify RTA instance again", function (assert) {
			var oPublishStub = this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				);

			this.oService.attachEvent('customEvent', function () {});
			this.oService.attachEvent('customEvent', function () {});
			assert.ok(oPublishStub.calledOnce);
		});
		QUnit.test("detachEvent() without arguments", function (assert) {
			assert.throws(function () {
				this.oService.detachEvent();
			}.bind(this));
		});
		QUnit.test("detachEvent() with invalid event name", function (assert) {
			assert.throws(function () {
				this.oService.detachEvent({}, function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.detachEvent('', function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.detachEvent(undefined, function () {});
			}.bind(this));
			assert.throws(function () {
				this.oService.detachEvent(null, function () {});
			}.bind(this));
		});
		QUnit.test("detachEvent() with invalid event handler", function (assert) {
			assert.throws(function () {
				this.oService.detachEvent('customEvent');
			}.bind(this));
			assert.throws(function () {
				this.oService.detachEvent('customEvent', null);
			}.bind(this));
			assert.throws(function () {
				this.oService.detachEvent('customEvent', {});
			}.bind(this));
		});
		QUnit.test("detachEvent() with valid arguments", function (assert) {
			var fnDone = assert.async();
			this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'subscribe',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: 'success',
							body: {
								id: 'eventHandlerId'
							}
						}
					});
				}.bind(this))
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'unsubscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					var mRequestBody = mParameters.data.body;
					assert.strictEqual(mRequestBody.service, 'foo');
					assert.strictEqual(mRequestBody.event, 'customEvent');
					assert.strictEqual(mRequestBody.id, 'eventHandlerId');
					fnDone();
				});

			var fnHandler = function () {};
			this.oService.attachEvent('customEvent', fnHandler);
			this.oService.detachEvent('customEvent', fnHandler);
		});
		QUnit.test("only last detachEvent() must notify RTA instance", function (assert) {
			var fnDone = assert.async();
			this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'subscribe',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: 'success',
							body: {
								id: 'eventHandlerId'
							}
						}
					});
				}.bind(this));

			var oUnsubscribeStub = this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'unsubscribe'
						);
					}.bind(this))
				);

			var fnHandler1 = function () {};
			var fnHandler2 = function () {};

			this.oService.attachEvent('customEvent', fnHandler1);
			this.oService.attachEvent('customEvent', fnHandler2);

			setTimeout(function () {
				this.oService.detachEvent('customEvent', fnHandler1);
				assert.ok(oUnsubscribeStub.notCalled);
				this.oService.detachEvent('customEvent', fnHandler2);
				assert.ok(oUnsubscribeStub.calledOnce);
				fnDone();
			}.bind(this), 20);
		});
		QUnit.test("whether event handler receives event data", function (assert) {
			var fnDone = assert.async();
			this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'subscribe',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: 'success',
							body: {
								id: 'eventHandlerId'
							}
						}
					});
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'event',
						data: {
							body: {
								service: 'foo',
								event: 'customEvent',
								data: {
									foo: 'bar'
								}
							}
						}
					});
				}.bind(this));

			this.oService.attachEvent('customEvent', function (vData) {
				assert.deepEqual(vData, { foo: 'bar' });
				fnDone();
			});
		});
		QUnit.test("attachEventOnce() unsubscribes automatically after receiving first event", function (assert) {
			var fnDone = assert.async();
			this.oPublishStub
				.withArgs(
					sinon.match(function (mParameters) {
						return (
							mParameters.target === this.oIframeWindow
							&& mParameters.origin === this.oIframeWindow.location.origin
							&& mParameters.channelId === CHANNEL_ID
							&& mParameters.eventId === 'subscribe'
						);
					}.bind(this))
				)
				.callsFake(function (mParameters) {
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'subscribe',
						data: {
							id: mParameters.data.id,
							type: "response",
							status: 'success',
							body: {
								id: 'eventHandlerId'
							}
						}
					});
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'event',
						data: {
							body: {
								service: 'foo',
								event: 'customEvent',
								data: {
									foo: 'bar'
								}
							}
						}
					});
					this.oPostMessageBusInIframe.publish({
						target: window,
						origin: window.location.origin,
						channelId: CHANNEL_ID,
						eventId: 'event',
						data: {
							body: {
								service: 'foo',
								event: 'customEvent',
								data: {
									foo2: 'bar2'
								}
							}
						}
					});
				}.bind(this));

			var oSpy = sandbox.spy();
			var oStub = sandbox.stub()
				.onFirstCall().returns()
				.onSecondCall().callsFake(function (vData) {
					assert.deepEqual(vData, { foo2: 'bar2' });
					assert.ok(oSpy.calledOnce);
					fnDone();
				});
			this.oService.attachEventOnce('customEvent', oSpy);
			this.oService.attachEvent('customEvent', oStub);

		});
	});

	QUnit.start();

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});