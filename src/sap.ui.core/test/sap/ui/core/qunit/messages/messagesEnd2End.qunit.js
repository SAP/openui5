/* global QUnit*/
sap.ui.define([
	'sap/ui/core/util/MockServer',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/qunit/utils/createAndAppendDiv'
], function (MockServer, ODataModel, createAndAppendDiv) {
	"use strict";

	// create content div
	createAndAppendDiv('content');

	QUnit.module("Canoncial Paths", {
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
									target: "",
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
							} else if (oXhr.url.indexOf("SalesOrderSet") >= 0) {
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
							}
							if (oMessages) {
								headers["sap-message"] = JSON.stringify(oMessages);
							}
							oXhr._fnOrignalXHRRespond.apply(this, arguments);
						};
					};
				}
			});
			that.oMockServer.start();
		}, afterEach : function(){
			sap.ui.getCore().getMessageManager().removeAllMessages();
		}

	});

	var checkMessages = function(aMessages, assert){
		aMessages.forEach(function (oMsg) {
			if (oMsg.target === "/SalesOrderSet('0500000000')") {
				assert.equal(oMsg.fullTarget, "/SalesOrderSet('0500000000')");
			} else if (oMsg.target === "/SalesOrderSet('0500000000')/ToLineItems") {
				assert.equal(oMsg.fullTarget, "/SalesOrderSet('0500000000')/ToLineItems");
				assert.equal(oMsg.message, "I'm just a container!");
			} else if (oMsg.target === "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')") {
				assert.equal(oMsg.fullTarget, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
			} else if (oMsg.target === "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000040')") {
				assert.equal(oMsg.fullTarget, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000040')");
			} else if (oMsg.target === "/ProductSet('HT-1000')") {
				assert.equal(oMsg.fullTarget, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
			} else {
				assert.ok(false, "Unexpected message target: " + oMsg.target);
			}
		});
	};

	QUnit.test("ODataMessageParser: Calculate targets with canonical request", function (assert) {
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
								var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().oData;
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


	QUnit.test("ODataMessageParser: Not loaded entities", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		this.oModelCanonical.metadataLoaded().then(function () {
			that.oModelCanonical.read("/SalesOrderSet");
			var fnRequestCompleted = function () {
				var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().oData;
				assert.equal(aMessages.length, 3, "Correct message count.");
				assert.equal(aMessages[1].target, "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[1].fullTarget, "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[2].target, "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				assert.equal(aMessages[2].fullTarget, "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				done();
				that.oModelCanonical.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModelCanonical.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("ODataMessageParser: Not loaded entities properties", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModelCanonical = new ODataModel(this.sServiceUri, { canonicalRequests: true });

		this.oModelCanonical.metadataLoaded().then(function () {
			that.oModelCanonical.read("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct");
			var fnRequestCompleted = function () {
				var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().oData;
				assert.equal(aMessages.length, 3, "Correct message count.");
				assert.equal(aMessages[1].target, "/ProductSet('HT-1030')/ID");
				assert.equal(aMessages[1].fullTarget, "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ID");
				assert.equal(aMessages[2].target, "/ProductSet('HT-1030')/Adress/ZIP");
				assert.equal(aMessages[2].fullTarget, "/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/Adress/ZIP");
				done();
				that.oModelCanonical.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModelCanonical.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});

});