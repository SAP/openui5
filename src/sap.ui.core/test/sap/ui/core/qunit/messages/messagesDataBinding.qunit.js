/*!
 * ${copyright}
 */
/*global QUnit*/
// QUnit script for DataBinding Messages
sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/m/Input",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService" // used only indirectly
], function(
	Messaging,
	ODataModel,
	Message,
	MessageType,
	Input,
	_fakeService
) {
	"use strict";

	var sServiceUri = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sServiceUri = "/proxy/http/" + sServiceUri.replace("http://","");

	/**
	 * Removes all shared Metadata
	 */
	function cleanSharedData() {
		ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}

	QUnit.module("Technical error", {
		beforeEach: function() {
			cleanSharedData();
		},
		afterEach: function() {
		}
	});

	QUnit.test("ListBinding error message", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false, defaultCountMode:"None"});
		oModel.metadataLoaded().then(function() {
			var oListBinding = oModel.bindList("/Products", null, null, null, {custom: {Error500:true}});
			//attach change to register binding at model
			oListBinding.attachChange(function(oEvent) {
			});
			oListBinding.attachAggregatedDataStateChange(function(oEvent) {
				var oDataState = oEvent.getParameter("dataState");
				var changes = oDataState.getChanges();
				assert.ok(changes, 'datastate has changes');
				assert.ok(changes.messages, 'datastate has changes with messages');
				assert.equal(changes.messages.value.length, 1, 'one message propagated');
				assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
				done();
			});
			oListBinding.initialize();
			oListBinding.getContexts();
		});
	});
	QUnit.test("ContextBinding error message", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false, defaultCountMode:"None"});
		oModel.metadataLoaded().then(function() {
			var oContextBinding = oModel.bindContext("/Products(2)", null, {custom: {Error500:true}});
			//attach change to register binding at model
			oContextBinding.attachChange(function(oEvent) {
			});
			oContextBinding.attachAggregatedDataStateChange(function(oEvent) {
				var oDataState = oEvent.getParameter("dataState");
				var changes = oDataState.getChanges();
				assert.ok(changes, 'datastate has changes');
				assert.ok(changes.messages, 'datastate has changes with messages');
				assert.equal(changes.messages.value.length, 1, 'one message propagated');
				assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
				done();
			});
			oContextBinding.initialize();
		});
	});
	QUnit.test("TreeBinding error message", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false});
		oModel.metadataLoaded().then(function() {
			var oTreeBinding = oModel.bindTree("/Products", null, null, {custom: {Error500:true}});
			//attach change to register binding at model
			oTreeBinding.attachChange(function(oEvent) {
			});
			oTreeBinding.attachAggregatedDataStateChange(function(oEvent) {
				var oDataState = oEvent.getParameter("dataState");
				var changes = oDataState.getChanges();
				assert.ok(changes, 'datastate has changes');
				assert.ok(changes.messages, 'datastate has changes with messages');
				assert.equal(changes.messages.value.length, 1, 'one message propagated');
				assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
				done();
			});
			oTreeBinding.initialize();
			// refresh indicates that the adapter code has been loaded and the binding has been
			// successfully initialized
			oTreeBinding.attachEventOnce("refresh", function () {
				oTreeBinding.getContexts();
			});
		});
	});
	QUnit.module("Message: control id", {
		beforeEach: function() {
			cleanSharedData();
		},
		afterEach: function() {
		}
	});

	QUnit.test("getControlIds", function(assert) {
		assert.expect(8);
		var done = assert.async();
		var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false, defaultCountMode:"None"});
		oModel.metadataLoaded().then(function() {
			var oInput1 = new Input({value:"{/Products(1)/ProductName}"});
			var oInput2 = new Input({value:"{/Products(1)/ProductName}"});
			oInput1.setModel(oModel);
			oInput2.setModel(oModel);
			var oMessage = new Message({
				processor: oModel,
				type: MessageType.Error,
				message: "Some message text",
				target: "/Products(1)/ProductName"
			});
			Messaging.addMessages(oMessage);
			//timeout so the async datastate is already calculated
			setTimeout(function() {
				var oDataState = oInput2.getBinding("value").getDataState();
				if (oDataState.getMessages().length > 0) {
					var aMessages = oDataState.getMessages();
					assert.ok(true, "Messages propagated");
					assert.equal(aMessages.length, 1, "1 message propagated");
					assert.equal(aMessages[0].getControlIds().length, 2, "2 control ids added");
					assert.deepEqual(aMessages[0].getControlIds(), [oInput1.getId(), oInput2.getId()], "IDs set correctly");
					assert.equal(aMessages[0].getControlId(), oInput2.getId(), "Legacy API: ID returned correctly");
					oInput2.destroy();
					assert.equal(aMessages[0].getControlIds().length, 1, "1 control id removed");
					assert.deepEqual(aMessages[0].getControlIds(), [oInput1.getId()], "IDs set correctly");
					assert.equal(aMessages[0].getControlId(), oInput1.getId(), "Legacy API: ID returned correctly");
					oInput2.destroy();
					done();
				}
			}, 0);
		});
	});
});
