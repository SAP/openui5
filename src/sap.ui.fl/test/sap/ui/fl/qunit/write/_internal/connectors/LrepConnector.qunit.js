/* global QUnit */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer"
], function(
	MessageBox,
	BusyIndicator,
	Lib,
	sinon,
	FlexObjectFactory,
	InitialLrepConnector,
	InitialUtils,
	Version,
	WriteLrepConnector,
	WriteUtils,
	TransportSelection,
	Settings,
	Layer
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function fnReturnData(nStatus, oHeader, sBody) {
		sandbox.server.respondWith(function(request) {
			request.respond(nStatus, oHeader, sBody);
		});
	}

	QUnit.module("LrepConnector", {
		before() {
			this.oMockNewChange = {
				packageName: "$TMP",
				fileType: "change",
				id: "changeId2",
				namespace: "namespace",
				getFileType() {
					return this.fileType;
				},
				getId() {
					return this.id;
				},
				getNamespace() {
					return this.namespace;
				},
				setResponse(oDefinition) {
					this.packageName = oDefinition.packageName;
				},
				getFlexObjectMetadata() {
					return {
						packageName: this.packageName
					};
				}
			};

			this.oAppVariantDescriptor = {
				packageName: "$TMP",
				fileType: "appdescr_variant",
				fileName: "manifest",
				id: "customer.app.var.id",
				namespace: "namespace",
				getDefinition() {
					return {
						fileType: this.fileType,
						fileName: this.fileName
					};
				},
				getNamespace() {
					return this.namespace;
				},
				getPackage() {
					return this.packageName;
				}
			};

			this.sLayer = Layer.CUSTOMER;
			this.sReference = "sampleComponent";
			this.aMockLocalChanges = [this.oMockNewChange];
			this.aAppVariantDescriptors = [this.oAppVariantDescriptor];
		},
		beforeEach() {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when error happen in the ABAP back end", function(assert) {
			var oExpectedResponse = {
				messages: [
					{
						severity: "Error",
						text: "Error text 1"
					},
					{
						severity: "Error",
						text: "Error text 2"
					}
				]
			};
			fnReturnData(500, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "reference", layer: Layer.VENDOR};
			return WriteLrepConnector.getFlexInfo(mPropertyBag).catch(function(oError) {
				assert.equal(oError.userMessage, "Error text 1\nError text 2\n", "Correct user message is returned in the error object");
				assert.equal(oError.status, "500", "Correct status is returned in the error object");
				assert.equal(oError.message, "Internal Server Error", "Correct message is returned in the error object");
			});
		});

		QUnit.test("given a mock server, when get flex info is triggered", function(assert) {
			var oExpectedResponse = {
				isResetEnabled: false,
				isPublishEnabled: false
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "reference", layer: Layer.VENDOR};
			var sUrl = "/sap/bc/lrep/flex/info/reference?layer=VENDOR";
			return WriteLrepConnector.getFlexInfo(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a flex info request is send containing the reference in the url and the app version and the layer as query parameters");
				assert.deepEqual(oResponse, oExpectedResponse, "getFlexInfo response flow is correct");
			});
		});

		QUnit.test("given a mock server, when get contexts is triggered", function(assert) {
			var oExpectedResponse = {
				types: [
					{
						type: "ROLE",
						values: [
							{
								id: "/IWBEP/RT_MGW_DSP",
								description: "Role for accessing remote system from Service Builder at design time"
							}]
					}
				],
				lastHitReached: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", type: "role", $skip: 100, $filter: "SAP"};
			var sUrl = "/sap/bc/lrep/flex/contexts/?type=role&%24skip=100&%24filter=SAP";
			return WriteLrepConnector.getContexts(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a getContexts request is send containing the type and layer as query parameters");
				assert.deepEqual(oResponse, oExpectedResponse, "getContexts response flow is correct");
			});
		});

		QUnit.test("given a mock server, when post requst to get contexts description is triggered", function(assert) {
			var oExpectedResponse = {
				types: [
					{
						type: "ROLE",
						values: [
							{
								id: "/IWBEP/RT_MGW_DSP",
								description: "Role for accessing remote system from Service Builder at design time"
							}]
					}
				],
				lastHitReached: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]}};
			var sUrl = "/sap/bc/lrep/flex/contexts/?sap-language=EN";
			return WriteLrepConnector.loadContextDescriptions(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "HEAD", "first request method is HEAD");
				assert.equal(sandbox.server.getRequest(0).url, "/sap/bc/lrep/actions/getcsrftoken/", "request is send containing the correct url");
				assert.equal(sandbox.server.getRequest(1).method, "POST", "second request method is POST");
				assert.equal(sandbox.server.getRequest(1).url, sUrl, "request is send containing the correct url");
				assert.deepEqual(oResponse, oExpectedResponse, "response flow is correct");
			});
		});

		QUnit.test("when calling publish successfully", function(assert) {
			var oMockTransportInfo = {
				packageName: "PackageName",
				transport: "transportId"
			};

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var fnCheckTransportInfoStub = sandbox.stub(TransportSelection.prototype, "checkTransportInfo").returns(true);
			var fnPrepareChangesForTransportStub = sandbox.stub(TransportSelection.prototype, "_prepareChangesForTransport").returns(Promise.resolve());
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			return WriteLrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				},
				layer: this.sLayer,
				reference: this.sReference,
				localChanges: this.aMockLocalChanges,
				appVariantDescriptors: this.aAppVariantDescriptors
			}).then(function(sMessage) {
				assert.equal(sMessage, oResourceBundle.getText("MSG_TRANSPORT_SUCCESS"), "the correct message was returned");
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.equal(fnOpenTransportSelectionStub.getCall(0).args.localObjectVisible, undefined, "the local object option is not changed");
				assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
				assert.ok(fnPrepareChangesForTransportStub.calledOnce, "then _prepareChangesForTransport called once");
				assert.ok(fnPrepareChangesForTransportStub.calledWith(oMockTransportInfo, this.aMockLocalChanges, this.aAppVariantDescriptors, {
					reference: this.sReference,
					layer: this.sLayer
				}), "then _prepareChangesForTransport called with the transport info and changes array");
			}.bind(this));
		});

		QUnit.test("when calling publish successfully in S/4 Hana Cloud", function(assert) {
			var oMockTransportInfo = {
				packageName: "PackageName",
				transport: "ATO_NOTIFICATION"
			};

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var fnCheckTransportInfoStub = sandbox.stub(TransportSelection.prototype, "checkTransportInfo").returns(true);
			var fnPrepareChangesForTransportStub = sandbox.stub(TransportSelection.prototype, "_prepareChangesForTransport").resolves();
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			return WriteLrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				},
				layer: this.sLayer,
				reference: this.sReference,
				localChanges: this.aMockLocalChanges,
				appVariantDescriptors: this.aAppVariantDescriptors
			}).then(function(sMessage) {
				assert.equal(sMessage, oResourceBundle.getText("MSG_ATO_NOTIFICATION"), "the correct message was returned");
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
				assert.ok(fnPrepareChangesForTransportStub.calledOnce, "then _prepareChangesForTransport called once");
				assert.ok(fnPrepareChangesForTransportStub.calledWith(oMockTransportInfo, this.aMockLocalChanges, this.aAppVariantDescriptors, {
					reference: this.sReference,
					layer: this.sLayer
				}), "then _prepareChangesForTransport called with the transport info and changes array");
			}.bind(this));
		});

		QUnit.test("when calling publish unsuccessfully", function(assert) {
			sandbox.stub(TransportSelection.prototype, "openTransportSelection").rejects();
			sandbox.stub(MessageBox, "show");
			return WriteLrepConnector.publish({
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
			return WriteLrepConnector.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				}
			}).then(function(sResponse) {
				assert.equal(sResponse, "Cancel", "then Promise.resolve() with cancel message is returned");
			});
		});

		QUnit.test("when calling condense successfully", function(assert) {
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: []});
			var mCondense = {
				namespace: "namespace",
				layer: this.sLayer,
				"delete": {
					change: ["change1", "change2"]
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [{
						change3: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "change3",
							namespace: "b",
							packageName: "$TMP",
							changeType: "labelChange",
							creation: "",
							reference: "",
							selector: {
								id: "abc123"
							},
							content: {
								something: "change_content"
							}
						}
					}]
				}
			};

			return WriteLrepConnector.condense({
				flexObjects: mCondense,
				url: "/sap/bc/lrep",
				reference: this.sReference
			}).then(function() {
				assert.equal(oStubSendRequest.args[0][0], "/sap/bc/lrep/actions/condense/sampleComponent?sap-language=EN", "the correct route is used");
				assert.equal(oStubSendRequest.args[0][2].payload, JSON.stringify(mCondense), "the request contains the correct map of changes as payload");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling reset in VENDOR layer with mix content of $TMP and transported changes", function(assert) {
			var oMockTransportInfo = {
				packageName: "PackageName",
				transport: "transportId"
			};
			// changes for the component
			var oVENDORChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
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

			var oVENDORChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
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
				isProductiveSystem() {return false;},
				isAtoEnabled() {return false;}
			};
			var oAdjustedResponse = {
				response: [
					{fileName: "c1"},
					{fileName: "c2"}
				]
			};
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSetting));
			sandbox.spy(BusyIndicator, "hide");
			sandbox.spy(BusyIndicator, "show");
			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&changelist=transportId&generator=Change.createInitialFileContent";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: [{name: "c1"}, {name: "c2"}]});
			return WriteLrepConnector.reset({
				url: "/sap/bc/lrep",
				layer: Layer.VENDOR,
				generator: "Change.createInitialFileContent",
				changes: [oVENDORChange1, oVENDORChange2],
				reference: "flexReference"
			}).then(function(oResponse) {
				assert.ok(BusyIndicator.show.calledTwice);
				assert.ok(BusyIndicator.hide.calledOnce);
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.deepEqual(oResponse, oAdjustedResponse, "expected Response");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in VENDOR layer for transported changes with selector and change type", function(assert) {
			var oMockTransportInfo = {
				packageName: "PackageName",
				transport: "transportId"
			};
			// changes for the component
			var oVENDORChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
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

			var oVENDORChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
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
				isProductiveSystem() {return false;},
				isAtoEnabled() {return false;}
			};
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSetting));
			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&changelist=transportId&selector=abc123&changeType=labelChange";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: []});

			return WriteLrepConnector.reset({
				url: "/sap/bc/lrep",
				layer: Layer.VENDOR,
				changeTypes: ["labelChange"],
				selectorIds: ["abc123"],
				changes: aChanges,
				reference: "flexReference"
			}).then(function() {
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in CUSTOMER layer with ATO_NOTIFICATION", function(assert) {
			var oMockTransportInfo = {
				transport: "ATO_NOTIFICATION"
			};
			// changes for the component
			var oUserChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.USER,
				fileName: "c1",
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

			var oCUSTOMERChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "c2",
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

			var oCUSTOMERChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "c3",
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
				isProductiveSystem() {return false;},
				isAtoEnabled() {return true;}
			};
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSetting));
			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves(oMockTransportInfo);
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=CUSTOMER&changelist=ATO_NOTIFICATION&generator=Change.createInitialFileContent";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: []});

			return WriteLrepConnector.reset({
				url: "/sap/bc/lrep",
				layer: Layer.CUSTOMER,
				generator: "Change.createInitialFileContent",
				changes: aChanges,
				reference: "flexReference"
			}).then(function() {
				assert.equal(fnOpenTransportSelectionStub.callCount, 3, "then openTransportSelection called three times");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in CUSTOMER layer with selector IDs", function(assert) {
			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isProductiveSystem() {return false;},
				isAtoEnabled() {return true;}
			};
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSetting));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=CUSTOMER&selector=view--control1,feview--control2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: []});

			var aControlIds = [
				"view--control1",
				"feview--control2"
			];
			return WriteLrepConnector.reset({
				url: "/sap/bc/lrep",
				layer: Layer.CUSTOMER,
				changes: [],
				reference: "flexReference",
				selectorIds: aControlIds
			}).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("when calling resetChanges in USER layer with selector IDs", function(assert) {
			var oTransportStub = sandbox.stub(TransportSelection.prototype, "setTransports");
			// Settings in registry
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isProductiveSystem() {return false;},
				isAtoEnabled() {return true;}
			};
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSetting));
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=USER&generator=Change.createInitialFileContent&selector=view--control1,feview--control2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves({response: []});
			var aControlIds = [
				"view--control1",
				"feview--control2"
			];
			return WriteLrepConnector.reset({
				url: "/sap/bc/lrep",
				layer: Layer.USER,
				changes: [],
				reference: "flexReference",
				selectorIds: aControlIds,
				generator: "Change.createInitialFileContent"
			}).then(function() {
				assert.equal(oTransportStub.callCount, 0, "no transport data was requested");
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered without a public layer available", function(assert) {
			var oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: true
			};

			var oExpectedResponse = Object.assign({isVariantAdaptationEnabled: false}, oServerResponse);

			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oServerResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return WriteLrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oExpectedResponse, oResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered with a public layer available", function(assert) {
			var oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isPublicLayerAvailable: true,
				isLocalResetEnabled: true
			};

			var oExpectedResponse = Object.assign({isVariantAdaptationEnabled: true}, oServerResponse);

			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oServerResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return WriteLrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oExpectedResponse, oResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered when settings already stored in apply connector", function(assert) {
			var oExpectedResponse = {
				isKeyUser: false
			};
			var mPropertyBag = {url: "/sap/bc/lrep"};
			InitialLrepConnector.settings = {isKeyUser: false};
			return WriteLrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, oExpectedResponse, "the settings object is obtain from apply connector correctly");
				assert.equal(sandbox.server.requestCount, 0, "no request is sent to back end");
			});
		});

		QUnit.test("given a mock server, when write a draft is triggered", function(assert) {
			var mPropertyBag = {
				flexObjects: [],
				url: "/sap/bc/lrep",
				parentVersion: "versionGUID"
			};
			var sUrl = "/sap/bc/lrep/changes/?parentVersion=versionGUID&sap-language=EN";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.write(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when write a local change is triggered", function(assert) {
			var mPropertyBag = {
				flexObjects: [],
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/?sap-language=EN";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.write(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a local change is triggered", function(assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName?sap-language=EN";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.update(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a transportable variant is triggered", function(assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?changelist=transportID&sap-language=EN";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.update(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove change is triggered", function(assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.remove(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove change is triggered with parentVersion", function(assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID",
				parentVersion: "parentVersionGUID"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID&parentVersion=parentVersionGUID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.remove(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove variant is triggered", function(assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.remove(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove variant is triggered with parentVersion", function(assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID",
				parentVersion: "parentVersionGUID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID&parentVersion=parentVersionGUID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WriteLrepConnector.remove(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
	});

	QUnit.module("LrepConnector.appVariant", {
		beforeEach() {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
			this.oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();
		},
		afterEach() {
			WriteUtils.sendRequest.restore();
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when appVariant.getManifirstSupport is triggered", function(assert) {
			var mPropertyBag = {
				appId: "test.app.id"
			};
			var oExpectedResponse = true;
			var sUrl = "/sap/bc/ui2/app_index/ui5_app_mani_first_supported/?id=test.app.id";
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			return WriteLrepConnector.appVariant.getManifirstSupport(mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse, true);
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a getManifirstSupport request is send containing the id as query parameters");
				assert.deepEqual(oResponse, oExpectedResponse, "getManifirstSupport response flow is correct");
			});
		});

		QUnit.test("given a mock server, when appVariant.getManifest is triggered", function(assert) {
			var mPropertyBag = {
				appVarUrl: "/sap/bc/lrep/content/apps/someBaseAppId/appVariants/someAppVariantID/manifest.appdescr_variant",
				layer: Layer.CUSTOMER,
				url: "/sap/bc/lrep"
			};

			return WriteLrepConnector.appVariant.getManifest(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(mPropertyBag.appVarUrl, "GET", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.load is triggered", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";

			return WriteLrepConnector.appVariant.load(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "GET", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.create is triggered with transport info provided", function(assert) {
			var oFlexObject = {
				fileName: "manifest",
				fileType: "appdescr_variant",
				id: "someAppVariantId",
				isAppVariantRoot: true,
				layer: Layer.CUSTOMER,
				namespace: "apps/someBaseApplicationId/appVariants/someAppVariantId/",
				packageName: "",
				reference: "sap.ui.rta.test.variantManagement",
				version: "1.0.0",
				content: []
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: Layer.CUSTOMER,
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				transport: "aTransport"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?changelist=aTransport&sap-language=EN";

			return WriteLrepConnector.appVariant.create(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.create is triggered, ATO is enable and skipIam is provided", function(assert) {
			var oFlexObject = {
				fileName: "manifest",
				fileType: "appdescr_variant",
				id: "someAppVariantId",
				isAppVariantRoot: true,
				layer: Layer.CUSTOMER,
				namespace: "apps/someBaseApplicationId/appVariants/someAppVariantId/",
				packageName: "",
				reference: "sap.ui.rta.test.variantManagement",
				version: "1.0.0",
				content: []
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: Layer.CUSTOMER,
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				skipIam: true,
				transport: "ATO_NOTIFICATION"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN";

			return WriteLrepConnector.appVariant.create(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.create is triggered, no transport info provided and ATO is not enabled", function(assert) {
			var oFlexObject = {
				fileName: "manifest",
				fileType: "appdescr_variant",
				id: "someAppVariantId",
				isAppVariantRoot: true,
				layer: Layer.CUSTOMER,
				namespace: "apps/someBaseApplicationId/appVariants/someAppVariantId/",
				packageName: "",
				reference: "sap.ui.rta.test.variantManagement",
				version: "1.0.0",
				content: []
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: Layer.CUSTOMER,
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				settings: {
					isAtoEnabled() {
						return false;
					}
				}
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?sap-language=EN";

			return WriteLrepConnector.appVariant.create(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.assignCatalogs is triggered", function(assert) {
			var mPropertyBag = {
				action: "assignCatalogs",
				assignFromAppId: "someBaseApplicationId",
				layer: Layer.CUSTOMER,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=assignCatalogs&assignFromAppId=someBaseApplicationId";

			return WriteLrepConnector.appVariant.assignCatalogs(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.unassignCatalogs is triggered", function(assert) {
			var mPropertyBag = {
				action: "unassignCatalogs",
				layer: Layer.CUSTOMER,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=unassignCatalogs";

			return WriteLrepConnector.appVariant.unassignCatalogs(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.update is triggered with transport info provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				transport: "aTransport"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId?changelist=aTransport&sap-language=EN";

			return WriteLrepConnector.appVariant.update(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "PUT", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.update is triggered with transport selection successful", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				settings: {
					isAtoEnabled() {
						return true;
					}
				},
				appVariant: {
					getDefinition() {
						return {
							fileName: "manifest",
							fileType: "appdescr_variant"
						};
					},
					getPackage() {return "aPackage";},
					getNamespace() {return "aNameSpace";}
				}
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId?changelist=aTransport&sap-language=EN";
			var oStubOpenTransportSelection = sinon.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return WriteLrepConnector.appVariant.update(mPropertyBag).then(function() {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.equal(oStubOpenTransportSelection.getCalls()[0].args[0].package, "", "no package information is sent to get transport info");
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "PUT", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				TransportSelection.prototype.openTransportSelection.restore();
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.update is triggered with with transport selection unsuccessful", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				settings: {
					isAtoEnabled() {
						return true;
					}
				},
				appVariant: {
					getDefinition() {
						return {
							fileName: "manifest",
							fileType: "appdescr_variant"
						};
					},
					getPackage() {return "aPackage";},
					getNamespace() {return "aNameSpace";}
				}
			};
			var oStubOpenTransportSelection = sinon.stub(TransportSelection.prototype, "openTransportSelection").resolves(undefined);
			return WriteLrepConnector.appVariant.update(mPropertyBag).then(function() {},
				function(oError) {
					assert.ok(oStubOpenTransportSelection.calledOnce);
					assert.equal(oError.message, "Transport information could not be determined", "promise rejected with correct error message");
					TransportSelection.prototype.openTransportSelection.restore();
				});
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered with transport info provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				transport: "aTransport"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId?changelist=aTransport";
			return WriteLrepConnector.appVariant.remove(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered with transport selection successful", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				appVariant: {
					getDefinition() {
						return {
							fileName: "manifest",
							fileType: "appdescr_variant"
						};
					},
					getPackage() {
						return "aPackage";
					},
					getNamespace() {
						return "aNameSpace";
					}
				}
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId?changelist=aTransport";
			var oStubOpenTransportSelection = sinon.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return WriteLrepConnector.appVariant.remove(mPropertyBag).then(function() {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				TransportSelection.prototype.openTransportSelection.restore();
			}.bind(this));
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered with transport selection unsuccessful", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				appVariant: {
					getDefinition() {
						return {
							fileName: "manifest",
							fileType: "appdescr_variant"
						};
					},
					getPackage() {
						return "aPackage";
					},
					getNamespace() {
						return "aNameSpace";
					}
				}
			};
			var oStubOpenTransportSelection = sinon.stub(TransportSelection.prototype, "openTransportSelection").resolves(undefined);
			return WriteLrepConnector.appVariant.remove(mPropertyBag).then(function() {},
				function(oError) {
					assert.ok(oStubOpenTransportSelection.calledOnce);
					assert.equal(oError.message, "Transport information could not be determined", "promise rejected with correct error message");
					TransportSelection.prototype.openTransportSelection.restore();
				});
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered with cancel from transport dialog", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep",
				appVariant: {
					getDefinition() {
						return {
							fileName: "manifest",
							fileType: "appdescr_variant"
						};
					},
					getPackage() {
						return "aPackage";
					},
					getNamespace() {
						return "aNameSpace";
					}
				}
			};
			var oStubOpenTransportSelection = sinon.stub(TransportSelection.prototype, "openTransportSelection").resolves("cancel");
			return WriteLrepConnector.appVariant.remove(mPropertyBag).then(function() {},
				function(oError) {
					assert.ok(oStubOpenTransportSelection.calledOnce);
					assert.equal(oError, "cancel", "promise rejected with cancel value");
					TransportSelection.prototype.openTransportSelection.restore();
				});
		});

		QUnit.test("given a mock server, when appVariant.list is triggered", function(assert) {
			var mPropertyBag = {
				layer: Layer.VENDOR,
				reference: "someId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/app_variant_overview/?layer=VENDOR&sap.app%2fid=someId";

			return WriteLrepConnector.appVariant.list(mPropertyBag).then(function() {
				assert.ok(this.oStubSendRequest.calledWith(sUrl, "GET", {
					tokenUrl: undefined,
					initialConnector: InitialLrepConnector,
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
			}.bind(this));
		});
	});

	QUnit.module("LrepConnector.contextBasedAdaptation", {
		beforeEach() {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
			this.sLayer = Layer.CUSTOMER;
			this.sAppId = "ZDEMOTE_ST";
			this.sAdaptationId = "id_12345678";

			this.oStubWriteSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			this.oStubInitialUtilsSendRequest = sandbox.stub(InitialUtils, "sendRequest").callsFake(function() {
				return Promise.resolve({response: {}});
			});
		},
		afterEach() {
			WriteUtils.sendRequest.restore();
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("Given a mock server, when contextBasedAdaptation.create is triggered", function(assert) {
			var contextBasedAdaptationData = {
				id: "__fiori0",
				title: "test title",
				property: "1",
				description: "test description",
				contexts: {
					role: ["/GRVTY/TEST", "/FLX/TSTRL_01"]
				}
			};

			var mPropertyBag = {
				flexObject: contextBasedAdaptationData,
				layer: this.sLayer,
				appId: this.sAppId,
				parentVersion: "4124001231923DHS91231230",
				url: "/sap/bc/lrep"
			};

			return WriteLrepConnector.contextBasedAdaptation.create(mPropertyBag).then(function() {
				assert.equal(this.oStubWriteSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubWriteSendRequest.getCall(0).args;
				assert.strictEqual(oCallArguments[0], `/sap/bc/lrep/flex/apps/${this.sAppId}/adaptations/?parentVersion=${
					 mPropertyBag.parentVersion}&sap-language=EN`, "the correct url was passed");
				assert.strictEqual(oCallArguments[1], "POST", "the correct http method was passed");
				assert.deepEqual(oCallArguments[2].payload, JSON.stringify(contextBasedAdaptationData), "the correct payload was passed");
			}.bind(this));
		});

		QUnit.test("Given a mock server, when contextBasedAdaptation.update is triggered", function(assert) {
			var contextBasedAdaptationData = {
				title: "another test title",
				property: "2",
				description: "another test description",
				contexts: {
					role: ["/FLX/TSTRL_01", "/GRVTY/UPDATE_TEST"]
				}
			};

			var mPropertyBag = {
				flexObject: contextBasedAdaptationData,
				layer: this.sLayer,
				appId: this.sAppId,
				adaptationId: this.sAdaptationId,
				parentVersion: "4124001231923DHS91231230",
				url: "/sap/bc/lrep"
			};

			return WriteLrepConnector.contextBasedAdaptation.update(mPropertyBag).then(function() {
				assert.equal(this.oStubWriteSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubWriteSendRequest.getCall(0).args;
				assert.strictEqual(oCallArguments[0], `/sap/bc/lrep/flex/apps/${this.sAppId}/adaptations/${mPropertyBag.adaptationId}?parentVersion=${
					 mPropertyBag.parentVersion}&sap-language=EN`, "the correct url was passed");
				assert.strictEqual(oCallArguments[1], "PUT", "the correct http method was passed");
				assert.deepEqual(oCallArguments[2].payload, JSON.stringify(contextBasedAdaptationData), "the correct payload was passed");
			}.bind(this));
		});

		QUnit.test("Given a mock server, when contextBasedAdaptation.load is triggered", function(assert) {
			var mPropertyBag = {
				layer: this.sLayer,
				appId: this.sAppId,
				url: "/sap/bc/lrep",
				version: "4124001231923DHS91231231"
			};

			return WriteLrepConnector.contextBasedAdaptation.load(mPropertyBag).then(function() {
				assert.equal(this.oStubInitialUtilsSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubInitialUtilsSendRequest.getCall(0).args;
				assert.strictEqual(oCallArguments[0], `/sap/bc/lrep/flex/apps/${this.sAppId}/adaptations/?version=${mPropertyBag.version}`, "the correct url was passed");
				assert.strictEqual(oCallArguments[1], "GET", "the correct http method was passed");
			}.bind(this));
		});

		QUnit.test("Given a mock server, when contextBasedAdaptation.remove is triggered", function(assert) {
			var mPropertyBag = {
				layer: this.sLayer,
				appId: this.sAppId,
				adaptationId: this.sAdaptationId,
				url: "/sap/bc/lrep",
				parentVersion: "4124001231923DHS91231230"
			};

			return WriteLrepConnector.contextBasedAdaptation.remove(mPropertyBag).then(function() {
				assert.equal(this.oStubWriteSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubWriteSendRequest.getCall(0).args;
				assert.strictEqual(oCallArguments[0], `/sap/bc/lrep/flex/apps/${this.sAppId}/adaptations/${mPropertyBag.adaptationId}?parentVersion=${mPropertyBag.parentVersion}&sap-language=EN`, "the correct url was passed");
				assert.strictEqual(oCallArguments[1], "DELETE", "the correct http method was passed");
			}.bind(this));
		});

		QUnit.test("Given a mock server, when contextBasedAdaptation.reorder is triggered", function(assert) {
			var oFlexObject = {priorities: ["id_9188277817982_0210", "id_877748372927_9812", "id_8837817291721_8271"]};

			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: this.sLayer,
				appId: this.sAppId,
				url: "/sap/bc/lrep"
			};

			return WriteLrepConnector.contextBasedAdaptation.reorder(mPropertyBag).then(function() {
				assert.equal(this.oStubWriteSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubWriteSendRequest.getCall(0).args;
				assert.strictEqual(oCallArguments[0], `/sap/bc/lrep/flex/apps/${this.sAppId}/adaptations/?sap-language=EN`, "the correct url was passed");
				assert.strictEqual(oCallArguments[1], "PUT", "the correct http method was passed");
				assert.deepEqual(oCallArguments[2].payload, JSON.stringify(oFlexObject), "the correct payload was passed");
			}.bind(this));
		});
	});

	QUnit.module("LrepConnector.ui2personalization", {
		beforeEach() {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
			this.oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();
		},
		afterEach() {
			WriteUtils.sendRequest.restore();
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when ui2Personalization.create is triggered", function(assert) {
			var oContainerData = {
				reference: "test.app",
				containerKey: "container12",
				itemName: "tablePersonalization",
				content: {}
			};

			var mPropertyBag = {
				flexObject: oContainerData
			};

			return WriteLrepConnector.ui2Personalization.create(mPropertyBag).then(function() {
				assert.equal(this.oStubSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubSendRequest.getCall(0).args;
				assert.equal(oCallArguments[0], "/sap/bc/lrep/ui2personalization/", "the correct url was passed");
				assert.equal(oCallArguments[1], "PUT", "the correct method was passed");
				assert.equal(oCallArguments[2].payload, JSON.stringify(oContainerData), "the correct payload was passed");
			}.bind(this));
		});

		QUnit.test("given a mock server, when ui2Personalization.remove is triggered", function(assert) {
			var mPropertyBag = {
				reference: "test.app",
				containerKey: "container12",
				itemName: "tablePersonalization"
			};

			return WriteLrepConnector.ui2Personalization.remove(mPropertyBag).then(function() {
				assert.equal(this.oStubSendRequest.callCount, 1, "one call was sent");
				var oCallArguments = this.oStubSendRequest.getCall(0).args;
				assert.equal(oCallArguments[0], "/sap/bc/lrep/ui2personalization/?reference=test.app" +
					"&containerkey=container12&itemname=tablePersonalization", "the correct url was passed");
				assert.equal(oCallArguments[1], "DELETE", "the correct method was passed");
			}.bind(this));
		});
	});

	QUnit.module("LrepConnector.versions.load", {
		afterEach() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("get Versions", function(assert) {
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "com.sap.test.app",
				limit: 10
			};
			assert.equal(mPropertyBag.limit, 10);
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/com.sap.test.app"
			};
			var aReturnedVersions = {versions: [{
				versionId: Version.Number.Draft
			}, {
				versionId: "versionGUID"
			}]};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: aReturnedVersions});
			return WriteLrepConnector.versions.load(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, [{
					version: Version.Number.Draft
				}, {
					version: "versionGUID"
				}], "the versions list is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/sap/bc/lrep/flex/versions/com.sap.test.app?sap-language=EN&limit=10", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("LrepConnector.versions.discardDraft", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("discard draft", function(assert) {
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "com.sap.test.app"
			};
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/com.sap.test.app"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return WriteLrepConnector.versions.discardDraft(mPropertyBag).then(function() {
				assert.equal(oStubSendRequest.getCall(0).args[0], "/sap/bc/lrep/flex/versions/draft/com.sap.test.app", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "DELETE", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("LrepConnector.versions.activate", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("activate draft", function(assert) {
			var sActivateVersion = Version.Number.Draft;
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion
			};

			var sExpectedUrl = `/sap/bc/lrep/flex/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=EN`;
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/com.sap.test.app",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			};
			var oActivatedVersion = {
				versionId: "versionGUID"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return WriteLrepConnector.versions.activate(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "versionGUID"
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate old version", function(assert) {
			var sActivateVersion = "1";
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "com.sap.test.app",
				title: "new reactivate Title",
				version: sActivateVersion
			};

			var sExpectedUrl = `/sap/bc/lrep/flex/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=EN`;
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/com.sap.test.app",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new reactivate Title\"}"
			};
			var oActivatedVersion = {
				versionId: "versionGUID"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return WriteLrepConnector.versions.activate(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "versionGUID"
				}, "the reactivated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate original app", function(assert) {
			var sActivateVersion = Version.Number.Original;
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion
			};

			var sExpectedUrl = `/sap/bc/lrep/flex/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=EN`;
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/com.sap.test.app",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			};
			var oActivatedVersion = {
				versionId: "versionGUID"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return WriteLrepConnector.versions.activate(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "versionGUID"
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("LrepConnector.versions.publish", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling publish successfully", function(assert) {
			var oMockTransportInfo = {
				transport: "transportId"
			};

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var fnCheckTransportInfoStub = sandbox.stub(TransportSelection.prototype, "checkTransportInfo").returns(true);
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			var sExpectedUrl = "/sap/bc/lrep/flex/versions/publish/sampleComponent?transport=transportId&version=versionToPublish";
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			};

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return WriteLrepConnector.versions.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				},
				layer: "CUSTOMER",
				reference: "sampleComponent",
				version: "versionToPublish"
			}).then(function(sMessage) {
				assert.equal(sMessage, oResourceBundle.getText("MSG_TRANSPORT_SUCCESS"), "the correct message was returned");
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("when calling publish successfully in S/4 Hana Cloud", function(assert) {
			var oMockTransportInfo = {
				transport: "ATO_NOTIFICATION"
			};

			var fnOpenTransportSelectionStub = sandbox.stub(TransportSelection.prototype, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
			var fnCheckTransportInfoStub = sandbox.stub(TransportSelection.prototype, "checkTransportInfo").returns(true);
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			var sExpectedUrl = "/sap/bc/lrep/flex/versions/publish/sampleComponent?transport=ATO_NOTIFICATION&version=versionToPublish";
			var mExpectedPropertyBag = {
				initialConnector: InitialLrepConnector,
				tokenUrl: "/sap/bc/lrep/actions/getcsrftoken/",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			};

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return WriteLrepConnector.versions.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				},
				layer: "CUSTOMER",
				reference: "sampleComponent",
				version: "versionToPublish"
			}).then(function(sMessage) {
				assert.equal(sMessage, oResourceBundle.getText("MSG_ATO_NOTIFICATION"), "the correct message was returned");
				assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
				assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("when calling publish unsuccessfully", function(assert) {
			sandbox.stub(TransportSelection.prototype, "openTransportSelection").rejects();
			sandbox.stub(MessageBox, "show");
			return WriteLrepConnector.versions.publish({
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
			return WriteLrepConnector.versions.publish({
				transportDialogSettings: {
					rootControl: null,
					styleClass: null
				}
			}).then(function(sResponse) {
				assert.equal(sResponse, "Cancel", "then Promise.resolve() with cancel message is returned");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
