/*global QUnit */

sap.ui.define([
	"sap/ui/core/ws/SapPcpWebSocket",
	"sap/ui/Device"
], function (SapPcpWebSocket, Device) {
	"use strict";

	QUnit.test("Serialize Pcp-Fields", function(assert) {
		assert.expect(1);

		var _serializePcpFields = SapPcpWebSocket.prototype._serializePcpFields,
			_escape = SapPcpWebSocket.prototype._escape;

		// mock instance object
		var ws = {
			_escape: _escape
		};

		var serializedFields = _serializePcpFields.call(ws, {
			test: true,
			foo: 'bar',
			count: 3,
			empty: ""
		}, typeof "", SapPcpWebSocket._MESSAGE);

		assert.equal(serializedFields,
			"pcp-action:MESSAGE\n" +
			"pcp-body-type:text\n" +
			"test:true\n" +
			"foo:bar\n" +
			"count:3\n" +
			"empty:\n" +
			"\n", "Output string equals expected string");
	});

	QUnit.test("Extract Pcp-Fields", function(assert) {
		assert.expect(6);

		var _extractPcpFields = SapPcpWebSocket.prototype._extractPcpFields,
			_unescape = SapPcpWebSocket.prototype._unescape;

		// mock instance object
		var ws = {
			_unescape: _unescape
		};

		var pcpFields = _extractPcpFields.call(ws,
			"pcp-action:MESSAGE\n" +
			"pcp-body-type:text\n" +
			"test:true\n" +
			"empty:\n" +
			"foo:bar\n" +
			"count:3\n" +
			"\n");

		assert.equal(pcpFields["count"], "3", "'count' field has the correct value");
		assert.equal(pcpFields["test"], "true", "'test' field has the correct value");
		assert.equal(pcpFields["empty"], "", "'empty' field has the correct value");
		assert.equal(pcpFields["foo"], "bar", "'foo' field has the correct value");
		assert.equal(pcpFields["pcp-action"], "MESSAGE", "'pcp-action' field has the correct value");
		assert.equal(pcpFields["pcp-body-type"], "text", "'pcp-body-type' field has the correct value");
	});

	// Excluded tests which require a WebSocket connection (no server running yet)
	/*
	QUnit.test("Protocol", function(assert) {
		var done = assert.async();

		if (Device.support.websocket) {
			assert.expect(1);
		} else {
			// skip test if browser doesn't support WebSockets
			assert.expect(0);
			done();
			return;
		}

		var ws = new sap.ui.core.ws.SapPcpWebSocket("ws://localhost:3001", sap.ui.core.ws.SapPcpWebSocket.SUPPORTED_PROTOCOLS.v10);

		ws.attachOpen(function(oEvent) {
			assert.equal(ws.getProtocol(), sap.ui.core.ws.SapPcpWebSocket.SUPPORTED_PROTOCOLS.v10, "protocol is correct");
			done();
		});

	});

	QUnit.test("Wrong protocol", function(assert) {
		var done = assert.async();

		if (Device.support.websocket) {
			assert.expect(2);
		} else {
			// skip test if browser doesn't support WebSockets
			assert.expect(0);
			done();
			return;
		}

		var ws = new sap.ui.core.ws.SapPcpWebSocket("ws://localhost:3001", [ "custom", "protocols" ]);

		ws.attachClose(function(oEvent) {
			assert.equal(oEvent.getParameter("reason"), "", "close reason is correct");
			assert.equal(oEvent.getParameter("code"), 1000, "close code is correct");
			done();
		});

	});
	*/
});