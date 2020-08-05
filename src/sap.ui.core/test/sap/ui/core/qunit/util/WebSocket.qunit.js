/*global QUnit */

sap.ui.define(["sap/ui/core/ws/WebSocket", "sap/ui/Device", "sap/ui/thirdparty/URI"],
	function (WebSocket, Device, URI) {
		"use strict";

		QUnit.test("Constructor with url only", function (assert) {
			assert.expect(1);
			var theEx;

			try {
				new WebSocket("wss://" + document.location.host + "/foo/bar");
			} catch (ex) {
				theEx = ex;
			}

			if (Device.support.websocket) {
				assert.ok(theEx === undefined, 'No exception was thrown.');
			} else {
				assert.equal(theEx.message, 'Browser does not support WebSockets.', 'No WebSocket support. Correct exception message.');
			}

		});

		QUnit.test("Constructor with url and single protocol", function (assert) {
			assert.expect(1);
			var theEx;

			try {
				new WebSocket("wss://" + document.location.host + "/foo/bar", "my-protocol");
			} catch (ex) {
				theEx = ex;
			}

			if (Device.support.websocket) {
				assert.ok(theEx === undefined, 'No exception was thrown.');
			} else {
				assert.equal(theEx.message, 'Browser does not support WebSockets.', 'No WebSocket support. Correct exception message.');
			}

		});

		QUnit.test("Constructor with url and multiple protocols", function (assert) {
			assert.expect(1);
			var theEx;

			try {
				new WebSocket("wss://" + document.location.host + "/foo/bar", ["my-first-protocol", "my-second-protocol"]);
			} catch (ex) {
				theEx = ex;
			}

			if (Device.support.websocket) {
				assert.ok(theEx === undefined, 'No exception was thrown.');
			} else {
				assert.equal(theEx.message, 'Browser does not support WebSockets.', 'No WebSocket support. Correct exception message.');
			}

		});

		QUnit.test("No url in constructor", function (assert) {
			assert.expect(2);

			var theEx;

			try {
				new WebSocket();
			} catch (ex) {
				theEx = ex;
			}

			assert.ok(theEx !== undefined, "No Url provided. Exception was raised.");

			if (Device.support.websocket) {
				assert.equal(theEx.message, 'sUrl must be a string.', 'Correct exception message.');
			} else {
				assert.equal(theEx.message, 'Browser does not support WebSockets.', 'Correct exception message.');
			}

		});

		QUnit.test("Wrong protocol parameter in constructor", function (assert) {
			assert.expect(2);

			var theEx;

			try {
				new WebSocket("ws://hostname:1234/foo/bar", { wrong: "type" });
			} catch (ex) {
				theEx = ex;
			}

			assert.ok(theEx !== undefined, "Wrong protocol parameter. Exception was raised.");

			if (Device.support.websocket) {
				assert.equal(theEx.message, 'aProtocols must be a string, array of strings or undefined.', 'Correct exception message.');
			} else {
				assert.equal(theEx.message, 'Browser does not support WebSockets.', 'Correct exception message.');
			}

		});

		QUnit.test("Resolve URLs", function (assert) {
			assert.expect(4);

			var _resolveFullUrl = WebSocket.prototype._resolveFullUrl;

			assert.equal(_resolveFullUrl.call(null, "ws://hostname:1234/foo/bar"), "ws://hostname:1234/foo/bar", "resolved full URL (ws://)");
			assert.equal(_resolveFullUrl.call(null, "wss://hostname:1234/foo/bar"), "wss://hostname:1234/foo/bar", "resolved full URL (wss://)");

			var oBaseUri = new URI(document.baseURI);
			oBaseUri.search('').protocol(oBaseUri.protocol() === 'https' ? 'wss' : 'ws');

			assert.equal(_resolveFullUrl.call(null, "/foo/bar"), new URI("/foo/bar").absoluteTo(oBaseUri).toString(), "resolved absolute URL");
			assert.equal(_resolveFullUrl.call(null, "../foo/bar"), new URI("../foo/bar").absoluteTo(oBaseUri).toString(), "resolved relative URL");

		});

		// Excluded tests which require a WebSocket connection (no server running yet)
		/*
		QUnit.test("readyState", function(assert) {
			var done = assert.async();

			if (Device.support.websocket) {
				assert.expect(5);
			} else {
				// skip test if browser doesn't support WebSockets
				assert.expect(0);
				done();
				return;
			}

			var ws = new WebSocket("ws://localhost:3001");
			assert.equal(ws.getReadyState(), sap.ui.core.ws.ReadyState.CONNECTING, "readyState is CONNECTING");

			ws.send("foo");

			ws.attachOpen(function() {
				assert.equal(ws.getReadyState(), sap.ui.core.ws.ReadyState.OPEN, "readyState is OPEN");
			});

			ws.attachMessage(function(oEvent) {
				assert.equal(oEvent.getParameter("data"), "foo", "Correct message received.");

				ws.close();
				assert.equal(ws.getReadyState(), sap.ui.core.ws.ReadyState.CLOSING, "readyState is CLOSING");
			});

			ws.attachClose(function() {
				assert.equal(ws.getReadyState(), sap.ui.core.ws.ReadyState.CLOSED, "readyState is CLOSED");

				done();
			});

		});

		QUnit.test("Send queued message", function(assert) {
			var done = assert.async();

			if (Device.support.websocket) {
				assert.expect(1);
			} else {
				// skip test if browser doesn't support WebSockets
				assert.expect(0);
				done();
				return;
			}

			var ws = new WebSocket("ws://localhost:3001");

			// should be queued and sent when the connection was opened
			ws.send("foo");

			ws.attachMessage(function(oEvent) {
				assert.equal(oEvent.getParameter("data"), "foo", "Correct message received.");

				ws.close();
				done();
			});

		});

		QUnit.test("Close event", function(assert) {
			var done = assert.async();

			if (Device.support.websocket) {
				assert.expect(4);
			} else {
				// skip test if browser doesn't support WebSockets
				assert.expect(0);
				done();
				return;
			}

			var ws = new WebSocket("ws://localhost:3001");

			// causes the server to close the connection
			ws.send("close connection");

			ws.attachClose(function(oEvent) {

				assert.equal(ws.getReadyState(), sap.ui.core.ws.ReadyState.CLOSED, "readyState is CLOSED");

				// check close event parameters
				assert.equal(oEvent.getParameter("code"), 1000, "Correct error code");
				assert.equal(oEvent.getParameter("reason"), "closed from server", "Correct error reason");
				assert.equal(oEvent.getParameter("wasClean"), true, "Correct wasClean flag");

				done();
			});

		});

		QUnit.test("Protocols", function(assert) {
			var done = assert.async();

			if (Device.support.websocket) {
				assert.expect(1);
			} else {
				// skip test if browser doesn't support WebSockets
				assert.expect(0);
				done();
				return;
			}

			var ws = new WebSocket("ws://localhost:3001", "my-protocol");

			ws.attachOpen(function(oEvent) {
				assert.equal(ws.getProtocol(), "my-protocol", "protocol is correct");
				done();
			});

		});
		*/
	});