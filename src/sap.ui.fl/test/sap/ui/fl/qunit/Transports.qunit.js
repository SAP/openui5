/*global QUnit, sinon*/
(function() {
	'use strict';

	jQuery.sap.require("sap.ui.fl.transport.Transports");
	jQuery.sap.require("sap.ui.fl.LrepConnector");
	sinon.config.useFakeTimers = false;

	QUnit.module("sap.ui.fl.transport.Transports", {
		beforeEach: function() {
			this.oTransports = new sap.ui.fl.transport.Transports();
			this.oServer = sinon.fakeServer.create();
		},
		afterEach: function() {
			this.oServer.restore();
			this.oTransports = null;
		}
	});

	QUnit.test("sap.ui.fl.transport.Transports.getTransports", function(assert) {
		var oObject;
		this.oServer.respondWith([200, {
			"Content-Type": "application/json",
			"Content-Length": 13,
			"X-CSRF-Token": "0987654321"
		}, '{ "localonly":false, "transports":[{"transportId":"4711","owner":"TESTUSER","description":"test transport1"}] }']);
		this.oServer.autoRespond = true;

		oObject = {
			"package": "testpackage",
			name: "testname",
			namespace: "namespace",
			type: "variant"
		};

		return this.oTransports.getTransports(oObject).then(function(oResult) {
			assert.equal(oResult.transports[0].transportId, '4711');
			assert.equal(oResult.localonly, false);
		});
	});

	QUnit.test("sap.ui.fl.transport.Transports.makeChangesTransportable", function(assert) {
		var oParams;
		this.oServer.respondWith([204, {}, ""]);
		this.oServer.autoRespond = true;

		oParams = {
			transportId: "testtransport1", changeIds: [{
				namespace: "testnamespace/",
				fileName: "testname",
				fileType: "testtype"
			}]
		};

		return this.oTransports.makeChangesTransportable(oParams).then(function() {
			assert.ok(true);
		});
	});

	QUnit.test("sap.ui.fl.transport.Transports.makeChangesTransportable - no transport", function(assert) {
		var oParams;
		this.oServer.respondWith([204, {}, ""]);
		this.oServer.autoRespond = true;

		oParams = {
			changeIds: [{
				namespace: "testnamespace/",
				fileName: "testname",
				fileType: "testtype"
			}]
		};

		return this.oTransports.makeChangesTransportable(oParams)["catch"](function() {
			assert.ok(true);
		});
	});

	QUnit.test("sap.ui.fl.transport.Transports.makeChangesTransportable - no change IDs", function(assert) {
		var oParams;
		this.oServer.respondWith([204, {}, ""]);
		this.oServer.autoRespond = true;

		oParams = {transportId: "testtransport1"};

		return this.oTransports.makeChangesTransportable(oParams)["catch"](function() {
			assert.ok(true);
		});
	});

}());
