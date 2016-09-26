jQuery.sap.require("sap.ui.fl.transport.TransportSelection");
jQuery.sap.require("sap.m.Label");
jQuery.sap.require("sap.ui.commons.ListBox");

QUnit.module("sap.ui.fl.transport.TransportSelection", {
	beforeEach: function() {
		this.oTransportSelection = new sap.ui.fl.transport.TransportSelection();

		this.oServer = sinon.fakeServer.create();
		this.oLrepConnector = sap.ui.fl.LrepConnector.createConnector();
		this.mSampleDefaultHeader = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				}
		};
		this.sendAjaxRequestStub = sinon.stub(this.oLrepConnector, "_sendAjaxRequest");
		this.getDefaultOptionsStub = sinon.stub(this.oLrepConnector, "_getDefaultOptions").returns(this.mSampleDefaultHeader);
	},
	afterEach: function() {
		this.getDefaultOptionsStub.restore();
		this.sendAjaxRequestStub.restore();
		this.oServer.restore();
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
	var oObject = { package:"testpackage", name:"testname", type:"variant" };

	var fOkay = function(oResult) {
		assert.equal(oResult.getParameters().selectedTransport, '4711');
		done();
	};
	var fError = function() {
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
	var oObject = { name:"testname", type:"variant" };

	var fOkay = function(oResult) {
		assert.equal(oResult.getParameters().selectedTransport, '');
		done();
	};
	var fError = function() {
		done();
	};

	this.oTransportSelection.selectTransport(oObject, fOkay, fError);
});

QUnit.module("sap.ui.fl.transport.TransportSelection", {
	beforeEach: function() {
		this.oTransportSelection = new sap.ui.fl.transport.TransportSelection();
	},
	afterEach: function() {}
});

QUnit.test("shall be instantiable", function(assert) {
	assert.ok(this.oTransportSelection);
	assert.ok(this.oTransportSelection.oTransports);
});

QUnit.test("_createEventObject", function(assert) {
	var oEvent = this.oTransportSelection._createEventObject({ "package" : "$TMP"}, { transportId : "1234"});
	assert.equal(oEvent.mParameters.selectedPackage, "$TMP");
	assert.equal(oEvent.mParameters.selectedTransport, "1234");
	assert.equal(oEvent.getParameter("selectedPackage"), "$TMP");
});

QUnit.test("_toLREPObject", function(assert) {
	var oObj = this.oTransportSelection._toLREPObject({ "type":"variant","name":"id_1414740501651_318","namespace":"ns","package":"" });
	assert.ok(!oObj["package"]);
	assert.equal(oObj.name, "id_1414740501651_318");
});

QUnit.test("_getTransport", function(assert) {
	var oEvent = this.oTransportSelection._getTransport({ transports : [ { locked : true, "transportId" : "1234"} ] });
	assert.equal(oEvent.transportId, "1234");
});

QUnit.test("_checkDialog", function(assert) {
	var oEvent = this.oTransportSelection._checkDialog();
	assert.ok(oEvent);
});

QUnit.test("_hasLock - with locked transport ", function(assert) {
	var oEvent = this.oTransportSelection._hasLock([ { locked : true, "transportId" : "1234"} ]);
	assert.equal(oEvent.transportId, "1234");
});

QUnit.test("_hasLock - without locked transport ", function(assert) {
	var oEvent = this.oTransportSelection._hasLock([ ]);
	assert.ok(!oEvent);
});

QUnit.test("_openDialog", function(assert) {
	var oEvent, fSuccess, fError;

	fSuccess = function() {};
	fError = function() {};
	oEvent = this.oTransportSelection._openDialog({}, fSuccess, fError);
	assert.ok(oEvent);
	oEvent.close();
});

QUnit.test("_openDialog with compact mode", function(assert) {
	var oEvent, fSuccess, fError;

	fSuccess = function() {};
	fError = function() {};
	oEvent = this.oTransportSelection._openDialog({}, fSuccess, fError, true);
	assert.ok(oEvent);
	oEvent.close();
});


QUnit.test('setTransports should set the same transport for all (non-$TMP) changes after a transport popup', function(assert) {
	var oRootControl = new sap.ui.core.Control();
	var oChange = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change1",
		fileType: "change"
	});
	var oChange2 = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change2",
		fileType: "change"
	});
	var oChange3 = new sap.ui.fl.Change({
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

	var oTransportSelection = new sap.ui.fl.transport.TransportSelection();
	this.sandbox.stub(oTransportSelection, "openTransportSelection").returns(Promise.resolve(oTransportInfo));

	return oTransportSelection.setTransports(aChanges, oRootControl).then(function() {
		assert.equal(aChanges[0].getRequest(), "testTransport1");
		assert.equal(aChanges[1].getRequest(), "testTransport1");
		assert.equal(aChanges[2].getRequest(), "testTransport1");
	});
});

QUnit.test('setTransports should set a transport for non-$TMP changes without transport popup if a package name is already within the change', function(assert) {
	var oRootControl = new sap.ui.core.Control();
	var oChange = new sap.ui.fl.Change({
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
			{"transportId":"ABC123","owner":"aPerson","description":"text here","locked": false},
			{"transportId":sSecondTransportId,"owner":"someone","description":"more text there","locked": true}
		]
	});

	this.oTransportSelection.oTransports.getTransports = function () {
		return oTransportResponse;
	};

	return this.oTransportSelection.setTransports([oChange], oRootControl).then( function () {
		assert.equal(oChange.getRequest(), sSecondTransportId, "the request was set to the transport id returned from the backend call");
	});
});

QUnit.test('should open the transport dialog if a customer wants to transport a change which is not locked on any transport', function(assert) {
	var done = assert.async();
	var oRootControl = new sap.ui.core.Control();
	var oChange = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change1",
		fileType: "change"
	});

	var sSecondTransportId = "ABC456";

	var aTransports = [
		{"transportId":"ABC123","owner":"aPerson","description":"text here","locked": false},
		{"transportId":sSecondTransportId,"owner":"someone","description":"more text there","locked": false}
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

	var oTransportSelection = new sap.ui.fl.transport.TransportSelection();
	sinon.stub(oTransportSelection.oTransports, "getTransports").returns(Promise.resolve(oTransportResponse));
	var oOpenDialogStub = sinon.stub(oTransportSelection, "_openDialog", fnSimulateDialogSelectionAndOk);

	oTransportSelection.setTransports([oChange], oRootControl).then( function () {
		assert.ok(oOpenDialogStub.calledOnce, "the dialog was opened");
		var oOpenDialogArguments = oOpenDialogStub.getCall(0).args[0];
		assert.equal(oOpenDialogArguments.hidePackage, true, "the package selection should be invisible");
		assert.equal(oOpenDialogArguments.pkg, undefined, "no package was within the given change");
		assert.equal(oOpenDialogArguments.transports, aTransports, "the returned transports are passed");
		done();
	});
});

QUnit.test('setTransports should set a transport for all (non-$TMP) changes without transport popup if they are already locked within a open transport', function(assert) {
	var oRootControl = new sap.ui.core.Control();
	var oChange = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change1",
		fileType: "change"
	});
	var oChange2 = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change2",
		fileType: "change"
	});
	var oChange3 = new sap.ui.fl.Change({
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
			{"transportId":"ABC123","owner":"aPerson","description":"text here","locked": false},
			{"transportId":sSecondTransportId,"owner":"someone","description":"more text there","locked": true}
		]
	});

	this.oTransportSelection.oTransports.getTransports = function () {
		return oTransportResponse;
	};

	return this.oTransportSelection.setTransports(aChanges, oRootControl).then(function() {
		assert.equal(aChanges[0].getRequest(), sSecondTransportId);
		assert.equal(aChanges[1].getRequest(), sSecondTransportId);
		assert.equal(aChanges[2].getRequest(), sSecondTransportId);
	});
});

QUnit.test('setTransports should NOT set a transport for $TMP changes without transport popup', function(assert) {
	var oRootControl = new sap.ui.core.Control();
	var oChange = new sap.ui.fl.Change({
		namespace: "testns",
		fileName: "change1",
		fileType: "change"
	});

	this.sandbox.stub(oChange, "getDefinition").returns({"packageName": "$TMP"});
	var oSetRequestSpy = this.sandbox.stub(oChange, "setRequest");

	return this.oTransportSelection.setTransports([oChange], oRootControl).then( function () {
		assert.ok(!oSetRequestSpy.called);
	});
});
