/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/transport/TransportSelection",
	"sap/ui/fl/Change",
	"sap/m/MessageBox"
], function(
	sinon,
	ApplyConnector,
	LrepConnector,
	WriteUtils,
	TransportSelection,
	Change,
	MessageBox
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnReturnData(nStatus, oHeader, sBody) {
		sandbox.server.respondWith(function(request) {
			request.respond(nStatus, oHeader, sBody);
		});
	}

	QUnit.module("LrepConnector", {
		beforeEach : function () {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach: function() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when get flex info is triggered", function (assert) {
			var oExpectedResponse = {
				isResetEnabled: false,
				isPublishEnabled: false
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", layer: "VENDOR"};
			var sUrl = "/sap/bc/lrep/flex/info/reference?layer=VENDOR&appVersion=1.0.0";
			return LrepConnector.getFlexInfo(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a flex info request is send containing the reference in the url and the app version and the layer as query parameters");
				assert.deepEqual(oResponse, oExpectedResponse, "getFlexInfo response flow is correct");
			});
		});

		QUnit.test("when calling publish successfully", function(assert) {
			var oMockTransportInfo = {
				packageName : "PackageName",
				transport : "transportId"
			};
			var oMockNewChange = {
				packageName : "$TMP",
				fileType : "change",
				id : "changeId2",
				namespace : "namespace",
				getDefinition : function() {
					return {
						packageName : this.packageName,
						fileType : this.fileType
					};
				},
				getId : function() {
					return this.id;
				},
				getNamespace : function() {
					return this.namespace;
				},
				setResponse : function(oDefinition) {
					this.packageName = oDefinition.packageName;
				},
				getPackage : function() {
					return this.packageName;
				}
			};

			var oAppVariantDescriptor = {
				packageName : "$TMP",
				fileType : "appdescr_variant",
				fileName : "manifest",
				id : "customer.app.var.id",
				namespace : "namespace",
				getDefinition : function() {
					return {
						fileType : this.fileType,
						fileName : this.fileName
					};
				},
				getNamespace : function() {
					return this.namespace;
				},
				getPackage : function() {
					return this.packageName;
				}
			};

			var sLayer = "CUSTOMER";
			var sReference = "sampleComponent";
			var sAppVersion = "1.0.0";
			var aMockLocalChanges = [oMockNewChange];
			var aAppVariantDescriptors = [oAppVariantDescriptor];

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var fnCheckTransportInfoStub = sandbox.stub(TransportSelection.prototype, "checkTransportInfo").returns(true);
			var fnPrepareChangesForTransportStub = sandbox.stub(TransportSelection.prototype, "_prepareChangesForTransport").returns(Promise.resolve());

			return LrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				},
				layer: sLayer,
				reference: sReference,
				appVersion: sAppVersion,
				localChanges: aMockLocalChanges,
				appVariantDescriptors: aAppVariantDescriptors
			}).then(function() {
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
				assert.ok(fnPrepareChangesForTransportStub.calledOnce, "then _prepareChangesForTransport called once");
				assert.ok(fnPrepareChangesForTransportStub.calledWith(oMockTransportInfo, aMockLocalChanges, aAppVariantDescriptors, {
					reference: sReference,
					appVersion: sAppVersion,
					layer: sLayer
				}), "then _prepareChangesForTransport called with the transport info and changes array");
			});
		});

		QUnit.test("when calling publish unsuccessfully", function(assert) {
			sandbox.stub(TransportSelection.prototype, "openTransportSelection").rejects();
			sandbox.stub(MessageBox, "show");
			return LrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				}
			}).then(function(sResponse) {
				assert.equal(sResponse, "Error", "then Promise.resolve() with error message is returned");
			});
		});

		QUnit.test("when calling publish successfully, but with cancelled transport selection", function(assert) {
			sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves();
			return LrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				}
			}).then(function(sResponse) {
				assert.equal(sResponse, "Cancel", "then Promise.resolve() with cancel message is returned");
			});
		});

		QUnit.test("when calling reset in VENDOR layer with mix content of $TMP and transported changes", function (assert) {
			var oMockTransportInfo = {
				packageName : "PackageName",
				transport : "transportId"
			};
			// changes for the component
			var oVENDORChange1 = new Change({
				fileType: "change",
				layer: "VENDOR",
				fileName: "1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oVENDORChange2 = new Change({
				fileType: "change",
				layer: "VENDOR",
				fileName: "2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: false,
				isProductiveSystem: function() {return false;},
				isAtoEnabled: function() {return false;}
			};
			sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&generator=Change.createInitialFileContent";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			return LrepConnector.reset({
				url: "/sap/bc/lrep",
				appVersion: "1.0.0",
				layer: "VENDOR",
				generator: "Change.createInitialFileContent",
				changes: [oVENDORChange1, oVENDORChange2],
				reference: "flexReference"
			}).then(function(aChanges) {
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.deepEqual(aChanges, [], "empty array is returned");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in VENDOR layer for transported changes with selector and change type", function (assert) {
			var oMockTransportInfo = {
				packageName : "PackageName",
				transport : "transportId"
			};
			// changes for the component
			var oVENDORChange1 = new Change({
				fileType: "change",
				layer: "VENDOR",
				fileName: "1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oVENDORChange2 = new Change({
				fileType: "change",
				layer: "VENDOR",
				fileName: "2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var aChanges = [oVENDORChange1, oVENDORChange2];


			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: false,
				isProductiveSystem: function() {return false;},
				isAtoEnabled: function() {return false;}
			};
			sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));
			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&selector=abc123&changeType=labelChange";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);

			return LrepConnector.reset({
				url: "/sap/bc/lrep",
				appVersion: "1.0.0",
				layer: "VENDOR",
				changeTypes: ["labelChange"],
				selectorIds: ["abc123"],
				changes: aChanges,
				reference: "flexReference"
			}).then(function() {
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in CUSTOMER layer with ATO_NOTIFICATION", function (assert) {
			// changes for the component
			var oUserChange = new Change({
				fileType: "change",
				layer: "USER",
				fileName: "1",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oCUSTOMERChange1 = new Change({
				fileType: "change",
				layer: "CUSTOMER",
				fileName: "2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oCUSTOMERChange2 = new Change({
				fileType: "change",
				layer: "CUSTOMER",
				fileName: "3",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var aChanges = [oCUSTOMERChange1, oUserChange, oCUSTOMERChange2];

			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isProductiveSystem: function() {return false;},
				isAtoEnabled: function() {return true;}
			};
			sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=CUSTOMER&appVersion=1.0.0&changelist=ATO_NOTIFICATION&generator=Change.createInitialFileContent";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);

			return LrepConnector.reset({
				url: "/sap/bc/lrep",
				appVersion: "1.0.0",
				layer: "CUSTOMER",
				generator: "Change.createInitialFileContent",
				changes: aChanges,
				reference: "flexReference"
			}).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in CUSTOMER layer with selector IDs", function (assert) {
			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isProductiveSystem: function() {return false;},
				isAtoEnabled: function() {return true;}
			};
			sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=CUSTOMER&appVersion=1.0.0&selector=view--control1,feview--control2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);

			var aControlIds = [
				"view--control1",
				"feview--control2"
			];
			return LrepConnector.reset({
				url: "/sap/bc/lrep",
				appVersion: "1.0.0",
				layer: "CUSTOMER",
				changes: [],
				reference: "flexReference",
				selectorIds: aControlIds
			}).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in USER layer with selector IDs", function (assert) {
			var oTransportStub = sandbox.stub(TransportSelection.prototype, "setTransports");
			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isProductiveSystem: function() {return false;},
				isAtoEnabled: function() {return true;}
			};
			sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=USER&appVersion=1.0.0&generator=Change.createInitialFileContent&selector=view--control1,feview--control2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			var aControlIds = [
				"view--control1",
				"feview--control2"
			];
			return LrepConnector.reset({
				url: "/sap/bc/lrep",
				appVersion: "1.0.0",
				layer: "USER",
				changes: [],
				reference: "flexReference",
				selectorIds: aControlIds,
				generator: "Change.createInitialFileContent"
			}).then(function() {
				assert.equal(oTransportStub.callCount, 0, "no transport data was requested");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered", function (assert) {
			var oExpectedResponse = {
				isKeyUser: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return LrepConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oResponse, oExpectedResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered when settings already stored in apply connector", function (assert) {
			var oExpectedResponse = {
				isKeyUser: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			ApplyConnector.settings = {isKeyUser: false};
			return LrepConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {isKeyUser: false}, "the settings object is obtain from apply connector correctly");
				assert.equal(sandbox.server.requestCount, 0, "no request is sent to back end");
			});
		});

		QUnit.test("given a mock server, when write a local change is triggered", function (assert) {
			var mPropertyBag = {
				flexObjects: [],
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.write(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : "[]"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a local change is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a transportable variant is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove change is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: "VENDOR"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove variant is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: "VENDOR"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
	});

	QUnit.module("LrepConnector.appVariant", {
		beforeEach : function () {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach: function() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when appVariant.getManifest is triggered", function (assert) {
			var mPropertyBag = {
				appVarUrl: "/sap/bc/lrep/content/apps/someBaseAppId/appVariants/someAppVariantID/manifest.appdescr_variant",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.getManifest(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(mPropertyBag.appVarUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.load is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.load(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.create is triggered", function (assert) {
			var oFlexObject = {
				fileName: "manifest",
				fileType: "appdescr_variant",
				id: "someAppVariantId",
				isAppVariantRoot: true,
				layer: "CUSTOMER",
				namespace: "apps/someBaseApplicationId/appVariants/someAppVariantId/",
				packageName: "",
				reference: "sap.ui.rta.test.variantManagement",
				version: "1.0.0",
				content: []
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: "CUSTOMER",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.create(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.assignCatalogs is triggered", function (assert) {
			var mPropertyBag = {
				action: "assignCatalogs",
				assignFromAppId: "someBaseApplicationId",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=assignCatalogs&assignFromAppId=someBaseApplicationId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.assignCatalogs(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.unassignCatalogs is triggered", function (assert) {
			var mPropertyBag = {
				action: "unassignCatalogs",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=unassignCatalogs";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.unassignCatalogs(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.update is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.list is triggered", function (assert) {
			var mPropertyBag = {
				layer: "VENDOR",
				"sap.app/id": "someId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/app_variant_overview/?layer=VENDOR&sap.app%2fid=someId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.list(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
	});
	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
