/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
	"sap/ui/fl/transport/TransportSelection",
	"sap/m/Label",
	"sap/ui/fl/LrepConnector",
	"sap/ui/core/Control",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	TransportSelection,
	Label,
	LrepConnector,
	Control,
	Change,
	Utils,
	sinon) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.transport.TransportSelection", {
		beforeEach: function () {
			this.oTransportSelection = new TransportSelection();

			this.oServer = sinon.fakeServer.create();
			this.oLrepConnector = LrepConnector.createConnector();
			this.mSampleDefaultHeader = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				}
			};
			this.sendAjaxRequestStub = sandbox.stub(this.oLrepConnector, "_sendAjaxRequest").returns(Promise.resolve());
			this.getDefaultOptionsStub = sandbox.stub(this.oLrepConnector, "_getDefaultOptions").returns(this.mSampleDefaultHeader);
		},
		afterEach: function () {
			this.getDefaultOptionsStub.restore();
			this.sendAjaxRequestStub.restore();
			this.oServer.restore();
			sandbox.restore();
		}
	});

	QUnit.test("sap.ui.fl.transport.TransportSelection.selectTransport with package", function (assert) {
		var done = assert.async();
		this.oServer.respondWith([
			200,
			{
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			},
			"{ \"localonly\":false, \"transports\":[{\"transportId\":\"4711\",\"owner\":\"TESTUSER\",\"description\":\"test transport1\",\"locked\" : true}] }"
		]);
		this.oServer.autoRespond = true;
		var oObject = {
			"package": "testpackage",
			name: "testname",
			type: "variant"
		};

		var fOkay = function (oResult) {
			assert.equal(oResult.getParameters().selectedTransport, '4711');
			done();
		};
		var fError = function () {
			done();
		};

		this.oTransportSelection.selectTransport(oObject, fOkay, fError);
	});

	QUnit.test("sap.ui.fl.transport.TransportSelection.selectTransport without package", function (assert) {
		var done = assert.async();
		this.oServer.respondWith([
			200,
			{
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			},
			"{ \"localonly\":true, \"transports\":[{\"transportId\":\"4711\",\"owner\":\"TESTUSER\",\"description\":\"test transport1\",\"locked\" : true}] }"
		]);
		this.oServer.autoRespond = true;
		var oObject = {name: "testname", type: "variant"};

		var fOkay = function (oResult) {
			assert.equal(oResult.getParameters().selectedTransport, '');
			done();
		};
		var fError = function () {
			done();
		};

		this.oTransportSelection.selectTransport(oObject, fOkay, fError);
	});

	QUnit.test("when preparing and checking changes for transport", function(assert) {
		var oMockTransportInfo = {
				packageName : "PackageName",
				transport : "transportId"
			},
			oMockTransportInfoInvalid = {
				packageName : "$TMP",
				transport : "transportId"
			},
			oMockTransportedChange = {
				packageName : "aPackage",
				fileType : "change",
				id : "changeId1",
				namespace : "namespace",
				getDefinition : function(){
					return {
						packageName : this.packageName,
						fileType : this.fileType
					};
				},
				getId : function(){
					return this.id;
				},
				getNamespace : function(){
					return this.namespace;
				},
				setResponse : function(oDefinition){
					this.packageName = oDefinition.packageName;
				},
				getPackage : function(){
					return this.packageName;
				}
			},
			oMockNewChange = {
				packageName : "$TMP",
				fileType : "change",
				id : "changeId2",
				namespace : "namespace",
				getDefinition : function(){
					return {
						packageName : this.packageName,
						fileType : this.fileType
					};
				},
				getId : function(){
					return this.id;
				},
				getNamespace : function(){
					return this.namespace;
				},
				setResponse : function(oDefinition){
					this.packageName = oDefinition.packageName;
				},
				getPackage : function(){
					return this.packageName;
				}
			},
			aMockLocalChanges = [oMockTransportedChange, oMockNewChange];
		sandbox.stub(Utils, "getClient").returns('');
		sandbox.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);

		assert.ok(this.oTransportSelection.checkTransportInfo(oMockTransportInfo), "then true is returned for a valid transport info");
		assert.notOk(this.oTransportSelection.checkTransportInfo(oMockTransportInfoInvalid), "then false is returned for an invalid transport info");

		return this.oTransportSelection._prepareChangesForTransport(oMockTransportInfo, aMockLocalChanges).then(function(){
			assert.equal(aMockLocalChanges[0].packageName, "aPackage", "then the transported local change is not updated");
			assert.equal(aMockLocalChanges[1].packageName, oMockTransportInfo.packageName, "but the new local change is updated");
		});
	});



	QUnit.module("sap.ui.fl.transport.TransportSelection", {
		beforeEach: function () {
			this.oTransportSelection = new TransportSelection();
		},
		afterEach: function () {
		}
	});

	QUnit.test("shall be instantiable", function (assert) {
		assert.ok(this.oTransportSelection);
		assert.ok(this.oTransportSelection.oTransports);
	});

	QUnit.test("_createEventObject", function (assert) {
		var oEvent = this.oTransportSelection._createEventObject({"package": "$TMP"}, {transportId: "1234"});
		assert.equal(oEvent.mParameters.selectedPackage, "$TMP");
		assert.equal(oEvent.mParameters.selectedTransport, "1234");
		assert.equal(oEvent.getParameter("selectedPackage"), "$TMP");
	});

	QUnit.test("_toLREPObject", function (assert) {
		var oObj = this.oTransportSelection._toLREPObject({
			"type": "variant",
			"name": "id_1414740501651_318",
			"namespace": "ns",
			"package": ""
		});
		assert.ok(!oObj["package"]);
		assert.equal(oObj.name, "id_1414740501651_318");
	});

	QUnit.test("_getTransport", function (assert) {
		var oEvent = this.oTransportSelection._getTransport({transports: [{locked: true, "transportId": "1234"}]});
		assert.equal(oEvent.transportId, "1234");
	});

	QUnit.test("_checkDialog", function (assert) {
		var oEvent = this.oTransportSelection._checkDialog();
		assert.ok(oEvent);
	});

	QUnit.test("_hasLock - with locked transport ", function (assert) {
		var oEvent = this.oTransportSelection._hasLock([{locked: true, "transportId": "1234"}]);
		assert.equal(oEvent.transportId, "1234");
	});

	QUnit.test("_hasLock - without locked transport ", function (assert) {
		var oEvent = this.oTransportSelection._hasLock([]);
		assert.ok(!oEvent);
	});

	QUnit.test("_openDialog", function (assert) {
		var oEvent, fSuccess, fError;

		fSuccess = function () {
		};
		fError = function () {
		};
		oEvent = this.oTransportSelection._openDialog({}, fSuccess, fError);
		assert.ok(oEvent);
		oEvent.close();
	});

	QUnit.test("_openDialog with compact mode", function (assert) {
		var oEvent, fSuccess, fError;

		fSuccess = function () {
		};
		fError = function () {
		};
		oEvent = this.oTransportSelection._openDialog({}, fSuccess, fError, true);
		assert.ok(oEvent);
		oEvent.close();
	});


	QUnit.test('setTransports should set the same transport for all (non-$TMP) changes after a transport popup', function (assert) {
		var oRootControl = new Control();
		var oChange = new Change({
			namespace: "testns",
			fileName: "change1",
			fileType: "change"
		});
		var oChange2 = new Change({
			namespace: "testns",
			fileName: "change2",
			fileType: "change"
		});
		var oChange3 = new Change({
			namespace: "testns",
			fileName: "change3",
			fileType: "change"
		});
		var aChanges = [
			oChange, oChange2, oChange3
		];
		var oTransportInfo = {
			transport: "testTransport1",
			fromDialog: true
		};

		var oTransportSelection = new TransportSelection();
		this.sandbox.stub(oTransportSelection, "openTransportSelection").returns(Promise.resolve(oTransportInfo));

		return oTransportSelection.setTransports(aChanges, oRootControl).then(function () {
			assert.equal(aChanges[0].getRequest(), "testTransport1");
			assert.equal(aChanges[1].getRequest(), "testTransport1");
			assert.equal(aChanges[2].getRequest(), "testTransport1");
		});
	});

	QUnit.test('setTransports should set a transport for non-$TMP changes without transport popup if a package name is already within the change', function (assert) {
		var oRootControl = new Control();
		var oChange = new Change({
			namespace: "testns",
			fileName: "change1",
			fileType: "change",
			"packageName": "anythingElse"
		});

		var sSecondTransportId = "ABC456";

		var oTransportResponse = Promise.resolve({
			"errorCode": "",
			"localonly": false,
			"transports": [
				{"transportId": "ABC123", "owner": "aPerson", "description": "text here", "locked": false},
				{
					"transportId": sSecondTransportId,
					"owner": "someone",
					"description": "more text there",
					"locked": true
				}
			]
		});

		this.oTransportSelection.oTransports.getTransports = function () {
			return oTransportResponse;
		};

		return this.oTransportSelection.setTransports([oChange], oRootControl).then(function () {
			assert.equal(oChange.getRequest(), sSecondTransportId, "the request was set to the transport id returned from the backend call");
		});
	});

	QUnit.test('should open the transport dialog if a customer wants to transport a change which is not locked on any transport', function (assert) {
		var done = assert.async();
		var oRootControl = new Control();
		var oChange = new Change({
			namespace: "testns",
			fileName: "change1",
			fileType: "change"
		});

		var sSecondTransportId = "ABC456";

		var aTransports = [
			{"transportId": "ABC123", "owner": "aPerson", "description": "text here", "locked": false},
			{"transportId": sSecondTransportId, "owner": "someone", "description": "more text there", "locked": false}
		];
		var oTransportResponse = Promise.resolve({
			"errorCode": "",
			"localonly": false,
			"transports": aTransports
		});

		var fnSimulateDialogSelectionAndOk = function (oConfig, fOkay) {
			var oDialogSelection = {
				selectedTransport: oConfig.transports[1], // second transport was selected
				selectedPackage: oConfig.pkg,
				dialog: true
			};

			var oResponse = {
				getParameters: function () {
					return oDialogSelection;
				}
			};
			fOkay(oResponse);
		};

		var oTransportSelection = new TransportSelection();
		sandbox.stub(oTransportSelection.oTransports, "getTransports").returns(Promise.resolve(oTransportResponse));
		var oOpenDialogStub = sandbox.stub(oTransportSelection, "_openDialog", fnSimulateDialogSelectionAndOk);

		oTransportSelection.setTransports([oChange], oRootControl).then(function () {
			assert.ok(oOpenDialogStub.calledOnce, "the dialog was opened");
			var oOpenDialogArguments = oOpenDialogStub.getCall(0).args[0];
			assert.equal(oOpenDialogArguments.hidePackage, true, "the package selection should be invisible");
			assert.equal(oOpenDialogArguments.pkg, undefined, "no package was within the given change");
			assert.equal(oOpenDialogArguments.transports, aTransports, "the returned transports are passed");
			done();
		});
	});

	QUnit.test('setTransports should set a transport for all (non-$TMP) changes without transport popup if they are already locked within a open transport', function (assert) {
		var oRootControl = new Control();
		var oChange = new Change({
			namespace: "testns",
			fileName: "change1",
			fileType: "change"
		});
		var oChange2 = new Change({
			namespace: "testns",
			fileName: "change2",
			fileType: "change"
		});
		var oChange3 = new Change({
			namespace: "testns",
			fileName: "change3",
			fileType: "change"
		});
		var aChanges = [
			oChange, oChange2, oChange3
		];

		var sSecondTransportId = "ABC456";

		var oTransportResponse = Promise.resolve({
			"errorCode": "",
			"localonly": false,
			"transports": [
				{"transportId": "ABC123", "owner": "aPerson", "description": "text here", "locked": false},
				{
					"transportId": sSecondTransportId,
					"owner": "someone",
					"description": "more text there",
					"locked": true
				}
			]
		});

		this.oTransportSelection.oTransports.getTransports = function () {
			return oTransportResponse;
		};

		return this.oTransportSelection.setTransports(aChanges, oRootControl).then(function () {
			assert.equal(aChanges[0].getRequest(), sSecondTransportId);
			assert.equal(aChanges[1].getRequest(), sSecondTransportId);
			assert.equal(aChanges[2].getRequest(), sSecondTransportId);
		});
	});

	QUnit.test('setTransports should NOT set a transport for $TMP changes without transport popup', function (assert) {
		var oRootControl = new Control();
		var oChange = new Change({
			namespace: "testns",
			fileName: "change1",
			fileType: "change"
		});

		sandbox.stub(oChange, "getDefinition").returns({"packageName": "$TMP"});
		var oSetRequestSpy = sandbox.stub(oChange, "setRequest");

		return this.oTransportSelection.setTransports([oChange], oRootControl).then(function () {
			assert.ok(!oSetRequestSpy.called);
		});
	});

});