/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/VersionInfo"
], function(
	merge,
	StorageUtils,
	InitialKeyUserConnector,
	InitialLrepConnector,
	InitialPersonalizationConnector,
	InitialUtils,
	FlexObjectFactory,
	FlVariant,
	States,
	WriteUtils,
	JsObjectConnector,
	WriteKeyUserConnector,
	WriteLrepConnector,
	Storage,
	FeaturesAPI,
	FlexConfiguration,
	Layer,
	sinon,
	VersionInfo
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given Storage when write is called", {
		beforeEach() {
			sandbox.stub(VersionInfo, "load").resolves({version: "1234"});
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no is layer provided", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				flexObjects: []
			};

			return Storage.write(mPropertyBag).catch(function(sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var aFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: aFlexObjects
			};
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.USER]}
			]);

			return Storage.write(mPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
			});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var aFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: aFlexObjects
			};
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.write(mPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connector configurations were found to write into layer: VENDOR");
			});
		});

		QUnit.test("then it calls write of the connector", function(assert) {
			var aFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: aFlexObjects
			};
			var sUrl = "/some/url";
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var oWriteStub = sandbox.stub(WriteLrepConnector, "write").resolves({});

			return Storage.write(mPropertyBag).then(function() {
				assert.strictEqual(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.strictEqual(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.strictEqual(oWriteCallArgs.flexObjects, aFlexObjects, "the flexObjects were passed in the property bag");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer when writing", function(assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl = "/PersonalizationConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedUrl = `${sUrl}/changes/`;
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);
			// sandbox.stub(WriteUtils, "getRequestOptions").returns({});

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.strictEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.strictEqual(oSendRequestCallArgs[2].payload, "[{\"support\":{\"sapui5Version\":\"1234\"}}]", "with correct payload");
				assert.strictEqual(oSendRequestCallArgs[2].contentType, "application/json; charset=utf-8", "with correct contentType");
				assert.strictEqual(oSendRequestCallArgs[2].dataType, "json", "with correct dataType");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = `${sUrl}/v2/changes/`;
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.strictEqual(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for PUBLIC layer when writing", function(assert) {
			var mPropertyBag = {
				layer: Layer.PUBLIC,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = `${sUrl}/v2/changes/`;
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing draft changes", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
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
				assert.strictEqual(oWriteStub.getCall(0).args[0].draft, true, "then the draft flag is passed");
			});
		});

		QUnit.test("when creating changes without a draft flag", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			var oIsDraftEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag)
			.then(function() {
				assert.strictEqual(oIsDraftEnabledStub.callCount, 0, "then draftEnabled is not checked");
			});
		});

		QUnit.test("when creating changes for a draft but the layer does not support a draft", function(assert) {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};

			return Storage.write(mPropertyBag)
			.catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "Draft is not supported for the given layer: CUSTOMER",
					"then request is rejected with an error message");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = `${sUrl1}/v2/changes/`;
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.strictEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl2, "the correct url was added");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer ", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = `${sUrl1}/flex/keyuser/v2/changes/`;
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetWriteUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.strictEqual(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});
	});

	function createChangesAndSetState(aStates, aDependentSelectors) {
		var aChanges = [];
		aStates.forEach(function(sState, i) {
			aChanges[i] = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: `c${i.toString()}`,
				namespace: "a.name.space",
				changeType: "labelChange",
				dependentSelector: aDependentSelectors && aDependentSelectors[i] || {},
				content: {
					prop: `some Content ${i}`
				}
			});
			if (sState === "update") {
				// Changes can't be directly set to "dirty" from "new"
				aChanges[i].setState(States.LifecycleState.PERSISTED);
				aChanges[i].setState(States.LifecycleState.DIRTY);
			}
			aChanges[i].condenserState = sState;
		});
		return aChanges;
	}

	QUnit.module("Given Storage when condense is called", {
		beforeEach() {
			sandbox.stub(VersionInfo, "load").resolves({version: "123"});
			this.sLayer = Layer.CUSTOMER;
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			var mPropertyBag = {
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]],
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function(sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("and no array with changes is provided", function(assert) {
			var mPropertyBag = {
				layer: this.sLayer,
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function(sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No changes were provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it calls condense of the connector (persisted and dirty changes) and update the response", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			aAllChanges[0].setState(States.LifecycleState.PERSISTED);
			var oCreatedChange = aAllChanges[2].convertToFileContent();
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: ["c0"]
				},
				create: {
					change: [{c2: merge(oCreatedChange, {support: {sapui5Version: "123"}})}]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]]
			};
			var sUrl = "/some/url";
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);
			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({status: 205});

			return Storage.condense(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.response.length, 1, "one change is save in the backend");
				assert.deepEqual(oResult.response[0], oCreatedChange, "content of the change is correct");
				assert.strictEqual(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.strictEqual(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "the flexObject was passed in the property bag");
				assert.strictEqual(oResult.response[0].support.sapui5Version, "123", "the version was added");
			});
		});

		QUnit.test("then it calls condense of the connector (persisted change that is not updated + create)", function(assert) {
			var aAllChanges = createChangesAndSetState(["select", "select"]);
			aAllChanges[0].setState(States.LifecycleState.PERSISTED);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [{c1: merge(aAllChanges[1].convertToFileContent(), {support: {sapui5Version: "123"}})}]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: aAllChanges
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "only the create is passed to the connector");
			});
		});

		QUnit.test("and two changes are created by condenser in a certain order", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "select", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{
							c2: merge(aAllChanges[2].convertToFileContent(), {support: {sapui5Version: "123"}})
						},
						{
							c1: merge(aAllChanges[1].convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the 'create' changes on FlexObject are on the same order (without unnecessary 'reorder')"
				);
			});
		});

		QUnit.test("and create and update changes are created by condenser in a certain order", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "select", "update", "update", "select"]);
			const oSupportInformation = aAllChanges[1].getSupportInformation();
			oSupportInformation.sapui5Version = "oldVersion";
			aAllChanges[1].setSupportInformation(oSupportInformation);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{
							c4: merge(aAllChanges[4].convertToFileContent(), {support: {sapui5Version: "123"}})
						},
						{
							c1: merge(aAllChanges[1].convertToFileContent(), {support: {sapui5Version: "oldVersion"}})
						}
					]
				},
				update: {
					change: [
						{c2: {
							content: {
								prop: "some Content 2"
							}}
						},
						{c3: {
							content: {
								prop: "some Content 3"
							}}
						}
					]
				},
				reorder: {
					change: ["c3", "c2", "c1"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[4], aAllChanges[3], aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the necessary changes get reordered (the first create is already at the right position)"
				);
			});
		});

		QUnit.test("and a new change is before an already persisted change in condensedChanges array", function(assert) {
			var aAllChanges = createChangesAndSetState(["select", "select", "select"]);
			aAllChanges[0].setState(States.LifecycleState.PERSISTED);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{
							c2: merge(aAllChanges[2].convertToFileContent(), {support: {sapui5Version: "123"}})
						},
						{
							c1: merge(aAllChanges[1].convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					]
				},
				reorder: {
					change: ["c2", "c1", "c0"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1], aAllChanges[0]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the changes get reordered (because they come before the persisted change)"
				);
			});
		});

		QUnit.test("and the changes are updated and reordered by condenser", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "update", "update"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				update: {
					change: [
						{
							c1: {
								content: {
									prop: "some Content 1"
								}
							}
						},
						{
							c2: {
								content: {
									prop: "some Content 2"
								}
							}
						}
					]
				},
				reorder: {
					change: ["c2", "c1"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and no condensed changes are returned by condenser", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "delete"]);
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense");

			return Storage.condense(mPropertyBag).then(function() {
				assert.ok(oWriteStub.notCalled, "then the write method is not called on the connector");
			});
		});

		QUnit.test("and changes in 'delete' state are returned by condenser - local reset case", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "delete"]);
			aAllChanges[0].setState(States.LifecycleState.DELETED);
			aAllChanges[1].setState(States.LifecycleState.DELETED);
			aAllChanges[2].setState(States.LifecycleState.DELETED);
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [],
				reference: "reference"
			};

			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: ["c0", "c1", "c2"]
				}
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense");

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and changes in 'delete' state are returned by condenser - local reset together with other changes", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "update", "select"]);
			aAllChanges[0].setState(States.LifecycleState.DELETED);
			aAllChanges[1].setState(States.LifecycleState.DELETED);
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[3]],
				reference: "reference"
			};

			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: ["c0", "c1"]
				},
				update: {
					change: [
						{c2: {
							content: {
								prop: "some Content 2"
							}}
						}
					]
				},
				create: {
					change: [
						{
							c3: merge(aAllChanges[3].convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					]
				}
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense");

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and the changes are updated by condenser", function(assert) {
			var aAllChanges = createChangesAndSetState(["update", "update", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				update: {
					change: [
						{
							c0: {
								content: {
									prop: "some Content 0"
								}
							}
						},
						{
							c1: {
								content: {
									prop: "some Content 1"
								}
							}
						}
					]
				},
				create: {
					change: [
						{
							c2: merge(aAllChanges[2].convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0], aAllChanges[1], aAllChanges[2]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and select and delete get condensed", function(assert) {
			var aAllChanges = createChangesAndSetState(["select", "delete"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{
							c0: merge(aAllChanges[0].convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and changes belonging to a variant are provided", function(assert) {
			var oChange0 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "c0",
				namespace: "a.name.space",
				changeType: "labelChange",
				variantReference: "variant_0",
				content: {
					prop: "some Content 0"
				}
			});
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				layer: Layer.CUSTOMER,
				fileName: "c1",
				namespace: "a.name.space",
				changeType: "setTitle",
				variantReference: "variant_0",
				content: {
					prop: "some Content 1"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_management_change",
				layer: Layer.CUSTOMER,
				fileName: "c2",
				namespace: "a.name.space",
				changeType: "setDefault",
				variantReference: "variant_0",
				variantManagementReference: "variantManagementId",
				content: {
					prop: "some Content 2"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "c3",
				namespace: "a.name.space",
				changeType: "labelChange",
				variantReference: "variant_0",
				content: {
					prop: "some Content 3"
				}
			});
			oChange3.setState(States.LifecycleState.PERSISTED);
			var oVariant = new FlVariant({
				layer: Layer.CUSTOMER,
				id: "newVariant",
				variantReference: "variant_0",
				flexObjectMetadata: {
					namespace: "a.name.space",
					reference: "myReference"
				},
				content: {
					title: "foo"
				}
			});

			var aAllChanges = [oVariant, oChange0, oChange1, oChange2, oChange3];
			aAllChanges = aAllChanges.map(function(oChange) {
				oChange.condenserState = "select";
				return oChange;
			});
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{
							c0: merge(oChange0.convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					],
					ctrl_variant: [
						{
							newVariant: merge(oVariant.convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					],
					ctrl_variant_change: [
						{
							c1: merge(oChange1.convertToFileContent(), {support: {sapui5Version: "123"}})
						}
					],
					ctrl_variant_management_change: [
						{
							c2: merge(oChange2.convertToFileContent(), {support: {sapui5Version: "123"}})
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

			return Storage.condense(mPropertyBag).then(function() {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});
	});

	QUnit.module("Given Storage when contextBasedAdaptation.create is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a context-based adaptations is returned", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oContextBasedAdaptation = {
				id: "<Adaptation ID>",
				reference: "<app id>",
				versionId: "<Draft version Id>",
				title: "",
				description: "",
				contexts: {
					"<context type 1>": ["<context type value 1 for type 1>", "<context type value n for type 1>"],
					"<context type 2>": ["<context type value 1 for type 2>", "<context type value m for type 2>"]
				},
				createdBy: "MAXMUSTERMANN",
				createdAt: "2022-05-12T12:18:31.5922020Z",
				changedBy: "MAXMUSTERMANN",
				changedAt: "2022-05-12T12:18:31.5922020Z"
			};
			sandbox.stub(WriteUtils, "sendRequest").resolves({response: oContextBasedAdaptation, status: 201});

			return Storage.contextBasedAdaptation.create(mPropertyBag).then(function(oReturnedContextBasedAdaptation) {
				assert.deepEqual(oReturnedContextBasedAdaptation.response, oContextBasedAdaptation);
				assert.equal(oReturnedContextBasedAdaptation.status, 201);
			});
		});

		QUnit.test("and a context-based adaptation is not returned", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteUtils, "sendRequest").rejects({status: 404});

			return Storage.contextBasedAdaptation.create(mPropertyBag)
			.catch(function(oRejectedRepose) {
				assert.equal(oRejectedRepose.status, 404);
			});
		});

		QUnit.test("and the method is not implemented in the connector JsObjectConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.contextBasedAdaptation.create(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.create is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the NeoLrepConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "NeoLrepConnector"}]);

			return Storage.contextBasedAdaptation.create(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.create is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the KeyUserConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);

			return Storage.contextBasedAdaptation.create(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.create is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when contextBasedAdaptation.reorder is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of context-based adaptations is reorderd", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteUtils, "sendRequest").resolves({response: "", status: 200});

			return Storage.contextBasedAdaptation.reorder(mPropertyBag).then(function(oReturnedContextBasedAdaptations) {
				assert.equal(oReturnedContextBasedAdaptations.status, 200);
			});
		});

		QUnit.test("and the reorder of context-based adaptation is failing", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteUtils, "sendRequest").rejects({status: 404});

			return Storage.contextBasedAdaptation.reorder(mPropertyBag)
			.catch(function(oRejectedRepose) {
				assert.equal(oRejectedRepose.status, 404);
			});
		});

		QUnit.test("and the method is not implemented in the connector JsObjectConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{connector: "JsObjectConnector"}]);

			return Storage.contextBasedAdaptation.reorder(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.reorder is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the NeoLrepConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{connector: "NeoLrepConnector"}]);

			return Storage.contextBasedAdaptation.reorder(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.reorder is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the KeyUserConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);

			return Storage.contextBasedAdaptation.reorder(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.reorder is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when contextBasedAdaptation.load is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of context-based adaptations is returned", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aContextBasedAdaptations = {
				adaptations: [
					{
						id: "<adaptationId1>",
						contexts: {
							"<context type 1>": ["<context type value 1 for type 1>", "<context type value n for type 1>"],
							"<context type 2>": ["<context type value 1 for type 2>", "<context type value m for type 2>"]
						},
						title: "",
						description: "",
						createdBy: "MAXMUSTERMANN",
						createdAt: "2022-05-12T12:18:31.5922020Z",
						changedBy: "MAXMUSTERMANN",
						changedAt: "2022-05-12T12:18:31.5922020Z"
					}
				]
			};
			sandbox.stub(InitialUtils, "sendRequest").resolves({response: aContextBasedAdaptations});

			return Storage.contextBasedAdaptation.load(mPropertyBag).then(function(oReturnedContextBasedAdaptations) {
				assert.deepEqual(oReturnedContextBasedAdaptations, aContextBasedAdaptations);
			});
		});

		QUnit.test("and loading of context-based adaptation is failing", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteUtils, "sendRequest").rejects({status: 404});

			return Storage.contextBasedAdaptation.load(mPropertyBag)
			.catch(function(oRejectedRepose) {
				assert.equal(oRejectedRepose.status, 404);
			});
		});

		QUnit.test("and the method is not implemented in the connector JsObjectConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.contextBasedAdaptation.load(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.load is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the NeoLrepConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{connector: "NeoLrepConnector"}]);

			return Storage.contextBasedAdaptation.load(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.load is not implemented", "then the rejection message is passed");
			});
		});

		QUnit.test("and the method is not implemented in the KeyUserConnector", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);

			return Storage.contextBasedAdaptation.load(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "contextBasedAdaptation.load is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.load is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedVersions = [];
			sandbox.stub(InitialUtils, "sendRequest").resolves({response: {versions: aReturnedVersions}});

			return Storage.versions.load(mPropertyBag).then(function(aVersions) {
				assert.deepEqual(aVersions, aReturnedVersions);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{loadConnector: "someConnector", writeConnector: "my/connectors/BaseConnector"}
			]);

			return Storage.versions.load(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.load is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.activate is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oActivatedVersion = {versionNumber: 1};
			sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});

			return Storage.versions.activate(mPropertyBag).then(function(oReturnedActivatedVersion) {
				assert.deepEqual(oReturnedActivatedVersion, oActivatedVersion);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{loadConnector: "someConnector", writeConnector: "my/connectors/BaseConnector"}
			]);

			return Storage.versions.activate(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.activate is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.discardDraft is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and discarding takes place", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oDiscardStub = sandbox.stub(WriteKeyUserConnector.versions, "discardDraft").resolves();

			return Storage.versions.discardDraft(mPropertyBag).then(function() {
				assert.strictEqual(oDiscardStub.callCount, 1, "the discarding of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{loadConnector: "someConnector", writeConnector: "my/connectors/BaseConnector"}
			]);

			return Storage.versions.discardDraft(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.discardDraft is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.publish is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and publish takes place", function(assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: ["ALL"], url: "/sap/bc/lrep"}
			]);

			var oPublishStub = sandbox.stub(WriteLrepConnector.versions, "publish").resolves();

			return Storage.versions.publish(mPropertyBag).then(function() {
				assert.strictEqual(oPublishStub.callCount, 1, "the publish of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.versions.publish(mPropertyBag).catch(function(sRejectionMessage) {
				assert.ok(sRejectionMessage, "then rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when reset is called", {
		beforeEach() {
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function(assert) {
			var mPropertyBag = {
				reference: "reference"
			};

			return Storage.reset(mPropertyBag).catch(function(sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);

			return Storage.reset(mPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer by default layer settings of the connector", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector"}
			]);

			return Storage.reset(mPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
			});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.VENDOR,
				reference: "reference"
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.reset(mPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
					"Multiple Connector configurations were found to write into layer: VENDOR");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: LrepConnector aiming for USER layer", function(assert) {
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

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var sExpectedUrl = `${sUrl}/changes/`;
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.reset(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";
			var sUrl2 = "/KeyUserConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl},
				{connector: "KeyUserConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function() {
				var oGetResetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetResetUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetResetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetResetUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.deepEqual(oGetResetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetResetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
			});
		});
	});

	QUnit.module("Given Storage when variant management context sharing is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a response is returned for getContexts", function(assert) {
			var mPropertyBag = {
				type: "role",
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.getContexts(mPropertyBag).then(function(oResponse) {
				assert.strictEqual(oStubSendRequest.callCount, 1, "send request was called once");
				assert.strictEqual(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?type=role", "url is correct");
				assert.strictEqual(oResponse.lastHitReached, true, "response is as expected");
			});
		});

		QUnit.test("and a response is returned for loadContextDescriptions", function(assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.loadContextDescriptions(mPropertyBag).then(function(oResponse) {
				assert.strictEqual(oStubSendRequest.callCount, 1, "send request was called once");
				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl was called twice");
				assert.strictEqual(oStubGetUrl.returnValues[1], "/sap/bc/lrep/actions/getcsrftoken/", "token url is correct");
				assert.strictEqual(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?sap-language=EN", "post url is correct");
				assert.ok(oResponse.lastHitReached, "response is as expected");
			});
		});

		QUnit.test("and a response is rejected for loadContextDescriptions when using not LrepConnector", function(assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.loadContextDescriptions(mPropertyBag).catch(function() {
				assert.strictEqual(oSpySendRequest.callCount, 0, "no request was send");
			});
		});

		QUnit.test("and a response is rejected for getContexts when using not LrepConnector", function(assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.getContexts(mPropertyBag).catch(function() {
				assert.strictEqual(oSpySendRequest.callCount, 0, "no request was send");
			});
		});
	});

	QUnit.module("Given Storage when translation.getSourceLanguage is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of languages is returned", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedLanguages = [
				"en-US",
				"de-DE"
			];
			sandbox.stub(WriteKeyUserConnector.translation, "getSourceLanguages").resolves(aReturnedLanguages);
			var oSpyGetConnectors = sandbox.spy(StorageUtils, "getConnectors");

			return Storage.translation.getSourceLanguages(mPropertyBag).then(function(aLanguages) {
				assert.ok(oSpyGetConnectors.calledWith("sap/ui/fl/write/_internal/connectors/", false), "StorageUtils getConnectors is called with correct params");
				assert.strictEqual(aLanguages, aReturnedLanguages);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			return Storage.translation.getSourceLanguages(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.getSourceLanguages is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when translation.getTranslationTexts is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a download file is returned", function(assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				targetLanguage: "de-DE",
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteKeyUserConnector.translation, "getTexts").resolves({test: "test"});

			return Storage.translation.getTexts(mPropertyBag).then(function(oDownloadFile) {
				assert.deepEqual(oDownloadFile, {test: "test"});
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			return Storage.translation.getTexts(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.getTexts is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when translation.postTranslationTexts is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a token is returned", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				layer: Layer.CUSTOMER,
				payload: {}
			};

			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteKeyUserConnector.translation, "postTranslationTexts").resolves({payload: {}});

			return Storage.translation.postTranslationTexts(mPropertyBag).then(function(oDownloadFile) {
				assert.deepEqual(oDownloadFile, {payload: {}});
			});
		});

		QUnit.test("and the method is not implemented in the connector", function(assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				layer: Layer.CUSTOMER,
				payload: {}
			};

			return Storage.translation.postTranslationTexts(mPropertyBag).catch(function(sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.postTranslationTexts is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given a storage and a connector is correctly configured", {
		beforeEach() {
			this.oConnector = {};
			sandbox.stub(StorageUtils, "getConnectors").resolves([{
				connector: "JsObjectConnector",
				layers: ["ALL"],
				writeConnectorModule: this.oConnector
			}]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getSeenFeatureIds", function(assert) {
			const done = assert.async();
			this.oConnector.getSeenFeatureIds = (mPropertyBag) => {
				assert.strictEqual(mPropertyBag.layer, Layer.CUSTOMER, "the layer is passed");
				done();
			};
			Storage.getSeenFeatureIds({layer: Layer.CUSTOMER});
		});

		QUnit.test("setSeenFeatureIds", function(assert) {
			const done = assert.async();
			this.oConnector.setSeenFeatureIds = (mPropertyBag) => {
				assert.strictEqual(mPropertyBag.layer, Layer.CUSTOMER, "the layer is passed");
				assert.deepEqual(mPropertyBag.seenFeatureIds, ["feature1"], "the seenFeatureIds is passed");
				done();
			};
			Storage.setSeenFeatureIds({layer: Layer.CUSTOMER, seenFeatureIds: ["feature1"]});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});