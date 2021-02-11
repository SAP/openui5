/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/connectors/PersonalizationConnector"
], function(
	sinon,
	Layer,
	Change,
	Variant,
	Storage,
	StorageUtils,
	InitialUtils,
	WriteUtils,
	FeaturesAPI,
	InitialLrepConnector,
	WriteLrepConnector,
	InitialKeyUserConnector,
	WriteKeyUserConnector,
	JsObjectConnector,
	InitialPersonalizationConnector,
	WritePersonalizationConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("ApplyStorage.getWriteConnectors", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getWriteConnectors", function (assert) {
			var oStubGetConnectors = sandbox.stub(StorageUtils, "getConnectors").resolves([]);
			return Storage.loadFeatures().then(function () {
				assert.ok(oStubGetConnectors.calledWith("sap/ui/fl/write/_internal/connectors/", false), "StorageUtils getConnectors is called with correct params");
			});
		});
	});

	QUnit.module("Given Storage when write is called", {
		beforeEach: function () {
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no is layer provided", function (assert) {
			var mPropertyBag = {
				reference: "reference"
			};

			return Storage.write(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var oFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: oFlexObjects
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.USER]}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("then it calls write of the connector", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			var sUrl = "/some/url";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var oWriteStub = sandbox.stub(WriteLrepConnector, "write").resolves({});

			return Storage.write(mPropertyBag).then(function () {
				assert.equal(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.equal(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.equal(oWriteCallArgs.flexObjects, oFlexObjects, "the flexObjects were passed in the property bag");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);
			//sandbox.stub(WriteUtils, "getRequestOptions").returns({});

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.equal(oSendRequestCallArgs[2].payload, "[{}]", "with correct payload");
				assert.equal(oSendRequestCallArgs[2].xsrfToken, "123", "with correct token");
				assert.equal(oSendRequestCallArgs[2].contentType, "application/json; charset=utf-8", "with correct contentType");
				assert.equal(oSendRequestCallArgs[2].dataType, "json", "with correct dataType");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = sUrl + "/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});



		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing draft changes", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};
			var oWriteStub = sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag).then(function() {
				assert.equal(oWriteStub.getCall(0).args[0].draft, true, "then the draft flag is passed");
			});
		});

		QUnit.test("when creating changes without a draft flag", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			var oIsDraftEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag)
				.then(function () {
					assert.equal(oIsDraftEnabledStub.callCount, 0, "then draftEnabled is not checked");
				});
		});

		QUnit.test("when creating changes for a draft but the layer does not support a draft", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};

			return Storage.write(mPropertyBag)
				.catch(function (sRejectionMessage) {
					assert.equal(sRejectionMessage, "Draft is not supported for the given layer: CUSTOMER",
						"then request is rejected with an error message");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl2, "the correct url was added");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer ", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/flex/keyuser/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});
	});

	function createChangesAndSetState(aStates, aDependentSelectors) {
		var aChanges = [];
		aStates.forEach(function(sState, i) {
			aChanges[i] = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: i.toString(),
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				selector: {},
				dependentSelector: aDependentSelectors && aDependentSelectors[i] || {},
				content: {
					prop: "some Content " + i
				}
			});
			aChanges[i].condenserState = sState;
		});
		return aChanges;
	}

	QUnit.module("Given Storage when condense is called", {
		beforeEach: function () {
			this.sLayer = Layer.CUSTOMER;
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			var mPropertyBag = {
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]],
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("and no array with changes is provided", function (assert) {
			var mPropertyBag = {
				layer: this.sLayer,
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No changes were provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it calls condense of the connector (persisted and dirty changes)", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			aAllChanges[0].setState("NONE");
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: ["0"]
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [{2: {
						fileType: "change",
						layer: this.sLayer,
						fileName: "2",
						namespace: "a.name.space",
						changeType: "labelChange",
						reference: "",
						selector: {},
						dependentSelector: {},
						content: {
							prop: "some Content 2"
						}
					}}],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]]
			};
			var sUrl = "/some/url";
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);
			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				assert.equal(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.equal(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "the flexObject was passed in the property bag");
			});
		});

		QUnit.test("and the changes are reordered by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "select", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: []
				},
				update: {
					change: []
				},
				reorder: {
					change: ["2", "1"]
				},
				create: {
					change: [
						{1: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						},
						{2: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						}
					],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and no condensed changes are returned by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "delete"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: []
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and the changes are updated by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["update", "update", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: []
				},
				update: {
					change: [
						{0: {
							content: {
								prop: "some Content 0"
							}
						}},
						{1: {
							content: {
								prop: "some Content 1"
							}
						}}
					]
				},
				reorder: {
					change: []
				},
				create: {
					change: [
						{2: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						}
					],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0], aAllChanges[1], aAllChanges[2]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and select and delete get condensed", function (assert) {
			var aAllChanges = createChangesAndSetState(["select", "delete"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: []
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [
						{0: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "0",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 0"
							}}
						}
					],
					ctrl_variant_change: [],
					ctrl_variant_management_change: []
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and changes belonging to a variant are provided", function (assert) {
			var oChange0 = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "0",
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 0"
				}
			});
			var oChange1 = new Change({
				fileType: "ctrl_variant_change",
				layer: Layer.CUSTOMER,
				fileName: "1",
				namespace: "a.name.space",
				changeType: "setTitle",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 1"
				}
			});
			var oChange2 = new Change({
				fileType: "ctrl_variant_management_change",
				layer: Layer.CUSTOMER,
				fileName: "2",
				namespace: "a.name.space",
				changeType: "setDefault",
				reference: "",
				variantReference: "variant_0",
				variantManagementReference: "variantManagementId",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 2"
				}
			});
			var oChange3 = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "3",
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 3"
				}
			});
			oChange3.setState(Change.states.PERSISTED);
			var oVariant = new Variant({
				content: {
					layer: Layer.CUSTOMER,
					fileName: "newVariant",
					fileType: "ctrl_variant",
					namespace: "a.name.space",
					variantReference: "variant_0",
					content: "some Variant Content"
				}
			});

			var aAllChanges = [oVariant, oChange0, oChange1, oChange2, oChange3];
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: []
				},
				update: {
					change: []
				},
				reorder: {
					change: []
				},
				create: {
					change: [
						{0: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "0",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 0"
							}}
						}
					],
					ctrl_variant_change: [
						{1: {
							fileType: "ctrl_variant_change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "setTitle",
							reference: "",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						}
					],
					ctrl_variant_management_change: [
						{2: {
							fileType: "ctrl_variant_management_change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "setDefault",
							reference: "",
							variantManagementReference: "variantManagementId",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: aAllChanges,
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});
	});

	QUnit.module("Given Storage when loadFeatures is called", {
		beforeEach: function() {
			this.url = "/some/url";
			InitialLrepConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with a failing connector", function (assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({isKeyUser: true});
			var oPersonalizationConnectorLoadFeaturesStub = sandbox.stub(WritePersonalizationConnector, "loadFeatures").resolves({isVariantSharingEnabled: false});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").rejects({});

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{
					connector: "LrepConnector",
					url: this.url,
					layers: []
				}, {
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}, {
					connector: "PersonalizationConnector",
					url: this.url,
					layers: [Layer.USER]
				}
			]);

			var oExpectedResponse = {
				isKeyUser: true,
				isVariantSharingEnabled: false,
				isVariantPersonalizationEnabled: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				versioning: {
					CUSTOMER: false,
					USER: false
				},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			var oLogResolveSpy = sandbox.spy(StorageUtils, "logAndResolveDefault");

			return Storage.loadFeatures().then(function (oResponse) {
				assert.equal(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oPersonalizationConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.equal(oLogResolveSpy.callCount, 1, "the logAndResolveDefault called once");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged even with one connector failing");
			});
		});

		QUnit.test("then it calls loadFeatures of the configured connectors", function(assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").resolves({});
			var sUrl = "/some/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl},
				{connector: "JsObjectConnector"}
			]);

			return Storage.loadFeatures().then(function () {
				assert.equal(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: sUrl}, "the url was passed");
				assert.equal(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs, {url: undefined}, "no url was passed");
			});
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isKeyUser: true
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				system: "foo"
			});

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.equal(mFeatures.isKeyUser, true, "the property of the LrepConnector was added");
				assert.equal(mFeatures.system, "foo", "the property of the JsObjectConnector was added");
			});
		});

		QUnit.test("then higher layer overrule the lower layer", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isProductiveSystem: false
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				isProductiveSystem: true
			});

			var DEFAULT_FEATURES = {
				isKeyUser: false,
				isVariantSharingEnabled: false,
				isVariantPersonalizationEnabled: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				draft: {},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.equal(Object.keys(mFeatures).length, Object.keys(DEFAULT_FEATURES).length, "only 9 feature was provided");
				assert.equal(mFeatures.isProductiveSystem, true, "the property was overruled by the second connector");
			});
		});
	});

	QUnit.module("Given Storage when versions.load is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedVersions = [];
			sandbox.stub(JsObjectConnector.versions, "load").resolves(aReturnedVersions);

			return Storage.versions.load(mPropertyBag).then(function (aVersions) {
				assert.equal(aVersions, aReturnedVersions);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.load(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.load is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.activate is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oActivatedVersion = {};
			sandbox.stub(JsObjectConnector.versions, "activate").resolves(oActivatedVersion);

			return Storage.versions.activate(mPropertyBag).then(function (oReturnedActivatedVersion) {
				assert.equal(oReturnedActivatedVersion, oActivatedVersion);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.activate(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.activate is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.discardDraft is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and discarding takes place", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oDiscardStub = sandbox.stub(JsObjectConnector.versions, "discardDraft").resolves();

			return Storage.versions.discardDraft(mPropertyBag).then(function () {
				assert.equal(oDiscardStub.callCount, 1, "the discarding of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			return Storage.versions.discardDraft(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "versions.discardDraft is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when reset is called", {
		beforeEach: function () {
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function (assert) {
			var mPropertyBag = {
				reference: "reference"
			};

			return Storage.reset(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case no connector is available for the layer by default layer settings of the connector", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.VENDOR,
				reference: "reference"
			};

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.equal(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
					"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: LrepConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference",
				changeTypes: "Rename",
				generator: "test",
				selectorIds: "id1"
			};

			var mParameter = {
				layer: Layer.USER,
				reference: "reference",
				changeType: "Rename",
				generator: "test",
				selector: "id1"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";
			var sUrl2 = "/KeyUserConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl},
				{connector: "KeyUserConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetResetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetResetUrlCallArgs[0], "/flex/keyuser/v1/changes/", "with correct route path");
				assert.equal(oGetResetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetResetUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v1/settings", "with correct route path");
				assert.deepEqual(oGetResetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetResetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.equal(oStubSendRequest.callCount, 1, "sendRequest is called once");
			});
		});
	});


	QUnit.module("Given Storage when variant management context sharing is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a response is returned for getContexts", function (assert) {
			var mPropertyBag = {
				type: "role",
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.getContexts(mPropertyBag).then(function (oResponse) {
				assert.equal(oStubSendRequest.callCount, 1, "send request was called once");
				assert.equal(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?type=role", "url is correct");
				assert.ok(oResponse.lastHitReached, "response is as expected");
			});
		});

		QUnit.test("and a response is returned for loadContextDescriptions", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.loadContextDescriptions(mPropertyBag).then(function (oResponse) {
				assert.equal(oStubSendRequest.callCount, 1, "send request was called once");
				assert.equal(oStubGetUrl.callCount, 2, "getUrl was called twice");
				assert.equal(oStubGetUrl.returnValues[1], "/sap/bc/lrep/actions/getcsrftoken/", "token url is correct");
				assert.equal(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?sap-language=en", "post url is correct");
				assert.ok(oResponse.lastHitReached, "response is as expected");
			});
		});

		QUnit.test("and a response is rejected for loadContextDescriptions when using not LrepConnector", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.loadContextDescriptions(mPropertyBag).catch(function () {
				assert.equal(oSpySendRequest.callCount, 0, "no request was send");
			});
		});

		QUnit.test("and a response is rejected for getContexts when using not LrepConnector", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.getContexts(mPropertyBag).catch(function () {
				assert.equal(oSpySendRequest.callCount, 0, "no request was send");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});