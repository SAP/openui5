/* eslint-disable max-nested-callbacks */
/* global QUnit*/
sap.ui.define([
	'sap/ui/core/util/MockServer',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/m/Input',
	"sap/ui/core/Messaging",
	"sap/ui/core/Item"
], function (MockServer, ODataModel, Input, Messaging, Item) {
	"use strict";

	QUnit.module("Messaging End2End", {
		before: function () {
			var that = this;

			this.sServiceUri = "/SalesOrderSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";


			//--- Mocking ----
			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
			this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
			this.oMockServer.start();
			var aRequests = that.oMockServer.getRequests();

			var oMsgTemplate = {
				code: "MESSAGE/CODE",
				message: "Fatal error!",
				severity: "error"
			};

			var bCreateRequestFailure = true;

			aRequests.forEach(function (oRequest) {
				var sPath = String(oRequest.path);
				if (sPath.indexOf("$") == -1) {

					oRequest._fnOrginalResponse = oRequest.response;
					oRequest.response = function (oXhr) {
						oXhr._fnOrignalXHRRespond = oXhr.respond;
						oXhr.respond = function (status, headers, content) {
							var oMessages;
							if (oXhr.url.indexOf("SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct") >= 0) {
								oMessages = Object.assign({}, oMsgTemplate);
							} else if (oXhr.url.indexOf("SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')") >= 0) {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "",
									details: [
										oMsgTemplate
									]
								};
							} else if (oXhr.url.indexOf("SalesOrderSet('0500000000')/ToLineItems") >= 0) {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "",
									details: [
										Object.assign({ target: "(SalesOrderID='0500000000',ItemPosition='0000000010')" }, oMsgTemplate),
										Object.assign({ target: "(SalesOrderID='0500000000',ItemPosition='0000000040')" }, oMsgTemplate)
									]
								};
							} else if (oXhr.url.indexOf("SalesOrderSet('0500000000')") >= 0) {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "CustomerName",
									details: [
										oMsgTemplate,
										Object.assign({ target: "ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')" }, oMsgTemplate),
										Object.assign({ target: "ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000040')" }, oMsgTemplate)
									]
								};
							} else if (oXhr.url.indexOf("SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct") >= 0) {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "",
									details: [
										Object.assign({ target: "ID" }, oMsgTemplate),
										Object.assign({ target: "Adress/ZIP" }, oMsgTemplate)
									]
								};
							} else if (oXhr.url === "/SalesOrderSrv/SalesOrderSet") {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "",
									details: [
										Object.assign({ target: "('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID" }, oMsgTemplate),
										Object.assign({ target: "('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP" }, oMsgTemplate)
									]
								};
							} else if (oXhr.url.indexOf("ContactSet") >= 0) {
								if (bCreateRequestFailure){
									status = 400;
									content = JSON.stringify({
										error:{
											code: "MESSAGE/CODE",
											message: "Operation failed",
											severity: "error"
											}
									});
								}
								bCreateRequestFailure = !bCreateRequestFailure;
							} else if (oXhr.url.indexOf("ProductSet('HT-1000')/ToSupplier") >= 0) {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "Operation failed",
									severity: "error",
									target: "/BusinessPartnerSet('0100000000')/City"
								};
							} else if (oXhr.url === "/SalesOrderSrv/SalesOrderSet?$expand=ToLineItems%2CToLineItems%2FToProduct") {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "I'm just a container!",
									severity: "warning",
									target: "",
									details: [
										Object.assign({ target: "ID" }, oMsgTemplate),
										Object.assign({ target: "Adress/ZIP" }, oMsgTemplate)
									]
								};
							} else if (oXhr.url.startsWith("/SalesOrderSrv/BusinessPartnerSet")){

								oMessages = {
									code: "MESSAGE/CODE",
									message: "Correct text",
									severity: "warning",
									target: "('0100000000')/EmailAddress",
									details: [
										Object.assign({ target: "" , message: "Unrelevant text"}, oMsgTemplate),
										Object.assign({ target: "('0100000000')/ToSalesOrders('0500000001')/Note", message: "Unrelevant text"}, oMsgTemplate)
									]
								};

							}

							if (oMessages) {
								headers["sap-message"] = JSON.stringify(oMessages);
							}
							oXhr._fnOrignalXHRRespond.apply(this, [status, headers, content]);
						};
					};
				}
			});
			that.oMockServer.start();
		}, afterEach : function(){
			Messaging.removeAllMessages();
		}

	});

	var checkMessages = function(aMessages, assert){
		aMessages.forEach(function (oMsg) {
			if (oMsg.aTargets[0] === "/SalesOrderSet('0500000000')") {
				assert.equal(oMsg.aFullTargets[0], "/SalesOrderSet('0500000000')");
			} else if (oMsg.aTargets[0] === "/SalesOrderSet('0500000000')/ToLineItems") {
				assert.equal(oMsg.aFullTargets[0], "/SalesOrderSet('0500000000')/ToLineItems");
				assert.equal(oMsg.message, "I'm just a container!");
			} else if (oMsg.aTargets[0] === "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')") {
				assert.equal(oMsg.aFullTargets[0], "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
			} else if (oMsg.aTargets[0] === "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000040')") {
				assert.equal(oMsg.aFullTargets[0], "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000040')");
			} else if (oMsg.aTargets[0] === "/ProductSet('HT-1000')") {
				assert.equal(oMsg.aFullTargets[0], "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
			} else {
				assert.ok(false, "Unexpected message target: " + oMsg.aTargets[0]);
			}
		});
	};

	QUnit.test("Canonical Paths - ODataMessageParser: Calculate targets with canonical request", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		this.oModelCanonical.metadataLoaded().then(function () {
			that.oModelCanonical.read("/SalesOrderSet('0500000000')");
			var fnRequestCompleted = function () {
				var oSalesOrderCtx = that.oModelCanonical.createBindingContext("/SalesOrderSet('0500000000')");
				that.oModelCanonical.read("ToLineItems", {
					context: oSalesOrderCtx,
					success: function () {
						var oSalesOrderLineItemSetCtx = that.oModelCanonical.createBindingContext("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", oSalesOrderCtx);
						that.oModelCanonical.read("ToProduct", {
							context: oSalesOrderLineItemSetCtx,
							success: function () {
								var aMessages = Messaging.getMessageModel().getData();
								assert.equal(aMessages.length, 4, "Correct message count.");
								checkMessages(aMessages, assert);
							}
						});
						done();
					}
				});
				that.oModelCanonical.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModelCanonical.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});


	QUnit.test("Canonical Paths - ODataMessageParser: Not loaded entities", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		this.oModelCanonical.metadataLoaded().then(function () {
			that.oModelCanonical.read("/SalesOrderSet");
			var fnRequestCompleted = function () {
				var aMessages = Messaging.getMessageModel().getData();
				assert.equal(aMessages.length, 3, "Correct message count.");
				assert.equal(aMessages[1].aTargets[0], "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[1].aFullTargets[0], "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[2].aTargets[0], "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				assert.equal(aMessages[2].aFullTargets[0], "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				done();
				that.oModelCanonical.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModelCanonical.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("Canonical Paths - ODataMessageParser: Not loaded entities properties", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		this.oModelCanonical.metadataLoaded().then(function () {
			that.oModelCanonical.read("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct");
			var fnRequestCompleted = function () {
				var aMessages = Messaging.getMessageModel().getData();
				assert.equal(aMessages.length, 3, "Correct message count.");
				assert.equal(aMessages[1].aTargets[0], "/ProductSet('HT-1030')/ID");
				assert.equal(aMessages[1].aFullTargets[0], "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[2].aTargets[0], "/ProductSet('HT-1030')/Adress/ZIP");
				assert.equal(aMessages[2].aFullTargets[0], "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				done();
				that.oModelCanonical.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModelCanonical.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});


	QUnit.test("Canonical Paths - ODataPropertyBinding: Propagation with deep paths", function(assert) {
		var done = assert.async();
		var oModel = new ODataModel(this.sServiceUri);

		oModel.createBindingContext("/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')", function(oContext) {
			var oInput = new Input({ value: "{ToProduct/ID}" });
			oInput.setBindingContext(oContext);
			Messaging.registerObject(oInput);
			oInput.setModel(oModel);

			oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct");

			var fnChangeHandler = function (oEvent) {
				oInput.getBinding("value").detachEvent("AggregatedDataStateChange", fnChangeHandler);
				assert.ok(true, "AggregatedDataStateChange event fired correctly.");
				var aModelMessages = oEvent.getParameter("dataState").getModelMessages();
				assert.equal(aModelMessages.length, 1, "Message propagated correctly.");
				assert.equal(aModelMessages[0].controlIds[0], oInput.getId(), "Control ID set");
				done();
			};

			oInput.getBinding("value").attachEvent("AggregatedDataStateChange", fnChangeHandler);
		});
	});

	QUnit.test("Affected Targets - ODataMessageParser._getAffectedTargets - Correct cleanup of newly created entries", function(assert){
		var done = assert.async();
		var oModel = new ODataModel(this.sServiceUri);

		var oCreateEntryProduct = {
			properties: {
				"FirstName":"My Name"
			}
		};

		oModel.metadataLoaded().then(function(){

			var oMessageModel = Messaging.getMessageModel();

			oModel.createEntry("/ContactSet", oCreateEntryProduct);
			oModel.submitChanges({success: function(){
				assert.equal(oMessageModel.oData.length, 1, "One message with UID has been created.");
				assert.equal(oMessageModel.oData[0].aTargets[0].indexOf("/ContactSet('id"), 0, "Message contains UID.");
				oModel.submitChanges({
					success: function(){
						assert.equal(oMessageModel.oData.length, 0, "Message with UID has been deleted.");
						done();
				}});
			}});
		});
	});

	QUnit.test("Affected Targets - ODataMessageParser._createTarget - Absolute message targets", function(assert){
		var done = assert.async();
		var oModel = new ODataModel(this.sServiceUri);

		oModel.metadataLoaded().then(function(){

			var oMessageModel = Messaging.getMessageModel();

			oModel.read("/ProductSet('HT-1000')/ToSupplier", {
				success: function(){
					assert.equal(oMessageModel.oData[0].aTargets[0], "/BusinessPartnerSet('0100000000')/City", "Target was set correctly.");
					assert.equal(oMessageModel.oData[0].aFullTargets[0], "/BusinessPartnerSet('0100000000')/City", "The canonical target is used as fall-back when an absolute path is used in the message target.");
					done();
			}});
		});
	});

	QUnit.test("ODataListBinding - Deep path is set and updated when context has changed", function(assert){
		var done = assert.async();
		var oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		oModelCanonical.metadataLoaded().then(function(){

			oModelCanonical.read("/SalesOrderSet", {
				urlParameters: { "$expand": "ToLineItems,ToLineItems/ToProduct" }
			});

			var fnBatchHandler1 = function(){
				oModelCanonical.detachBatchRequestCompleted(fnBatchHandler1);
				oModelCanonical.createBindingContext("/SalesOrderSet('0500000000')", undefined, {}, function(oContext){
					var oODataListBinding = oModelCanonical.bindList("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems", oContext);
					assert.equal(oODataListBinding.sDeepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems", "Deep path is set correctly.");

					oModelCanonical.createBindingContext("/SalesOrderSet('0500000001')", undefined, {}, function(oContext){
						oODataListBinding.initialize();
						oODataListBinding.setContext(oContext);
						assert.equal(oODataListBinding.sDeepPath, "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems", "Deep path is set correctly.");

					});
					done();
				});
			};
			oModelCanonical.attachBatchRequestCompleted(fnBatchHandler1);
		});
	});

	QUnit.test("ODataListBinding - Message propagation to list binding", function(assert){
		var done = assert.async();
		var oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		oModelCanonical.metadataLoaded().then(function(){

			oModelCanonical.read("/SalesOrderSet");
			oModelCanonical.read("/SalesOrderSet('0500000000')/ToLineItems");
			var oBinding_SalesOrders = oModelCanonical.bindList("/SalesOrderSet");
			var oBinding_SO_0500000000 = oModelCanonical.bindList("/SalesOrderSet('0500000000')/ToLineItems");
			var oBinding_SO_0500000001 = oModelCanonical.bindList("/SalesOrderSet('0500000001')/ToLineItems");

			oModelCanonical.addBinding(oBinding_SalesOrders);
			oModelCanonical.addBinding(oBinding_SO_0500000000);
			oModelCanonical.addBinding(oBinding_SO_0500000001);

			var fnHandleBatch1 = function(){
				oModelCanonical.detachBatchRequestCompleted(fnHandleBatch1);

				/**
				 * message full targets, after first batch:
				 * /SalesOrderSet
				 * /SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID
				 * /SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP
				 * /SalesOrderSet('0500000000')/ToLineItems
				 * /SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')
				 * /SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000040')
				 *
				*/
				assert.equal(oBinding_SalesOrders.getDataState().getModelMessages().length, 6, "Correct number of messages is propagated to the list binding ('" + oBinding_SalesOrders.getPath() + "').");
				assert.equal(oBinding_SO_0500000000.getDataState().getModelMessages().length, 3, "Correct number of messages is propagated to the list binding ('" + oBinding_SO_0500000000.getPath() + "').");
				assert.equal(oBinding_SO_0500000001.getDataState().getModelMessages().length, 2, "Correct number of messages is propagated to the list binding ('" + oBinding_SO_0500000001.getPath() + "').");
				oModelCanonical.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
				var fnBatchHandler2 = function(){
					oModelCanonical.detachBatchRequestCompleted(fnBatchHandler2);

					/**
					 * message full targets, after second batch:
					 * /SalesOrderSet
					 * /SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID
					 * /SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP
					 * /SalesOrderSet('0500000000')/ToLineItems
					 * /SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')
					 * /SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000040')
					 * /SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct
					 *
					*/

					assert.equal(oBinding_SalesOrders.getDataState().getModelMessages().length, 7, "Correct number of messages is propagated to the list binding ('" + oBinding_SalesOrders.getPath() + "').");
					assert.equal(oBinding_SO_0500000000.getDataState().getModelMessages().length, 4, "Correct number of messages is propagated to the list binding ('" + oBinding_SO_0500000000.getPath() + "').");
					assert.equal(oBinding_SO_0500000001.getDataState().getModelMessages().length, 2, "Correct number of messages is propagated to the list binding ('" + oBinding_SO_0500000001.getPath() + "').");
					done();
				};
				oModelCanonical.attachBatchRequestCompleted(fnBatchHandler2);
			};
			oModelCanonical.attachBatchRequestCompleted(fnHandleBatch1);
		});
	});


	QUnit.test("MessageMixin: Ignore list bindings", function (assert) {
		var done = assert.async(),
			oModel = new ODataModel(this.sServiceUri);

		oModel.metadataLoaded().then(function (){
			var bCall1, bCall2,
				oInput = new Input({
					// the order of the properties influence the order of refreshDataState calls
					value: {path: "/BusinessPartnerSet('0100000000')/EmailAddress"},
					suggestionItems: {
						path: "/BusinessPartnerSet",
						template: new Item({text: "{EmailAddress}"})
					}
				}),
				fnOriginalRefreshDataState = oInput.refreshDataState;

			oInput.setModel(oModel);
			Messaging.registerObject(oInput);

			oInput.refreshDataState = function (sName, oDataState) {
				fnOriginalRefreshDataState.apply(this, arguments);
				if (sName === "value") {
					assert.strictEqual(oInput.getValueStateText(), "Correct text",
						"refreshDataState for property 'value'");
					assert.strictEqual(oInput.getValueState(), "Warning");
					bCall1 = true;
				} else if (sName === "suggestionItems") {
					// value state from value is not overwritten
					assert.strictEqual(oInput.getValueStateText(), "Correct text",
						"refreshDataState for property 'suggestionItems'");
					assert.strictEqual(oInput.getValueState(), "Warning");
					bCall2 = true;
				}
				if (bCall1 && bCall2) {
					oInput.destroy();
					done();
				}
			};
		});
	});
});