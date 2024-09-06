/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/_Helper",
	"sap/ui/model/BindingMode",
	"sap/ui/model/MetaModel",
	"sap/ui/model/Model",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/ODataMetaModel"
], (Log, SyncPromise, _Helper, BindingMode, MetaModel, Model, JSONModel, ODataMetaModelUtils, ODataMetaModel) => {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMetaModel (ODataMetaModelNoFakeService)", {
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor: oLoadedPromiseSync is resolved", function (assert) {
		const oDataModel = {
			_requestAnnotationChanges() {},
			annotationsLoaded() {}
		};
		let fnResolve;
		this.mock(oDataModel).expects("annotationsLoaded").returns(new Promise((resolve) => { fnResolve = resolve; }));
		const oMetadata = {getServiceMetadata() {}};

		// code under test
		const oDataMetaModel = new ODataMetaModel(oMetadata, /*oAnnotations*/undefined, oDataModel);

		assert.ok(oDataMetaModel.oLoadedPromiseSync instanceof SyncPromise);
		assert.notOk(oDataMetaModel.oLoadedPromiseSync.isFulfilled());

		this.mock(oMetadata).expects("getServiceMetadata").withExactArgs().returns({foo: "bar"});
		this.mock(oDataModel).expects("_requestAnnotationChanges").withExactArgs().returns(SyncPromise.resolve());
		this.mock(ODataMetaModelUtils).expects("merge")
			.withExactArgs({/*no oAnnotations*/}, /*copy of service metadata*/{foo: "bar"},
				sinon.match.same(oDataMetaModel), /*bIgnoreAnnotationsFromMetadata*/undefined);

		// code under test
		fnResolve("~annotationLoaded");

		return oDataMetaModel.oLoadedPromiseSync.then((vResult) => {
			assert.strictEqual(vResult, undefined);
			assert.ok(oDataMetaModel.oLoadedPromiseSync.isFulfilled());
			assert.strictEqual(oDataMetaModel.oLoadedPromiseSync.getResult(), undefined);
		}, () => {
			assert.ok(false);
		});
	});

	//*********************************************************************************************
	QUnit.test("constructor: oLoadedPromiseSync is rejected", function (assert) {
		const oDataModel = {annotationsLoaded() {}};
		let fnReject;
		this.mock(oDataModel).expects("annotationsLoaded")
			.returns(new Promise((resolve, reject) => { fnReject = reject; }));
		this.mock(ODataMetaModelUtils).expects("merge").never();

		// code under test
		const oDataMetaModel = new ODataMetaModel(/*oMetadata*/{}, /*oAnnotations*/undefined, oDataModel);

		assert.ok(oDataMetaModel.oLoadedPromiseSync instanceof SyncPromise);
		assert.notOk(oDataMetaModel.oLoadedPromiseSync.isFulfilled());

		// code under test
		fnReject("~error");

		return oDataMetaModel.oLoadedPromiseSync.then(() => {
			assert.ok(false);
		}, (oError0) => {
			assert.ok(oDataMetaModel.oLoadedPromiseSync.isRejected());
			assert.strictEqual(oError0, "~error");
			assert.strictEqual(oDataMetaModel.oLoadedPromiseSync.getResult(), "~error");
		});
	});

	//*********************************************************************************************
	QUnit.test("constructor: uses ODataAnnotations#getData", function (assert) {
		const oMetadata = {getServiceMetadata() {}};
		const oAnnotations = {getData() {}};
		let fnResolve;
		const oDataModel = {
			_requestAnnotationChanges() {},
			annotationsLoaded() {}
		};
		this.mock(oDataModel).expects("annotationsLoaded").withExactArgs()
			.returns(new Promise((resolve) => { fnResolve = resolve; }));

		// code under test
		const oDataMetaModel = new ODataMetaModel(oMetadata, oAnnotations, oDataModel);

		assert.ok(oDataMetaModel.oLoadedPromiseSync instanceof SyncPromise);
		assert.notOk(oDataMetaModel.oLoadedPromiseSync.isFulfilled());

		this.mock(oMetadata).expects("getServiceMetadata").withExactArgs().returns({foo: "bar"});
		this.mock(oAnnotations).expects("getData").withExactArgs().returns("~annotationData");
		this.mock(oDataModel).expects("_requestAnnotationChanges").withExactArgs().returns(SyncPromise.resolve());
		this.mock(ODataMetaModelUtils).expects("merge")
			.withExactArgs("~annotationData", /*copy of service metadata*/{foo: "bar"},
				sinon.match.same(oDataMetaModel), /*bIgnoreAnnotationsFromMetadata*/undefined);

		// code under test
		fnResolve("~annotationLoaded");

		return oDataMetaModel.oLoadedPromiseSync;
	});

	//*********************************************************************************************
	QUnit.test("constructor: using V2 ODataModel with annotation changes", function (assert) {
		const oMetadata = {getServiceMetadata() {}};
		const oMetadataMock = this.mock(oMetadata);
		oMetadataMock.expects("getServiceMetadata").withExactArgs().never();
		const oDataModel = {
			bIgnoreAnnotationsFromMetadata: "~bIgnoreAnnotationsFromMetadata",
			_requestAnnotationChanges() {},
			annotationsLoaded() {}
		};
		let fnResolve;
		const oAnnotationsLoadedPromise = new Promise((resolve) => {
			fnResolve = resolve;
		});
		this.mock(oDataModel).expects("annotationsLoaded").withExactArgs().returns(oAnnotationsLoadedPromise);
		const oAnnotations = {getData() {}};

		// code under test
		const oMetaModel = new ODataMetaModel(oMetadata, oAnnotations, oDataModel);

		assert.strictEqual(oMetaModel.oModel, null);
		assert.strictEqual(oMetaModel.sDefaultBindingMode, BindingMode.OneTime);
		assert.ok(oMetaModel.oLoadedPromise instanceof Promise);
		assert.ok(oMetaModel.oLoadedPromiseSync instanceof SyncPromise);
		assert.notOk(oMetaModel.oLoadedPromiseSync.isFulfilled());
		assert.strictEqual(oMetaModel.oMetadata, oMetadata);
		assert.strictEqual(oMetaModel.oDataModel, oDataModel);
		assert.deepEqual(oMetaModel.mQueryCache, {});
		assert.deepEqual(oMetaModel.mQName2PendingRequest, {});
		assert.strictEqual(oMetaModel.oResolver, undefined);
		assert.deepEqual(oMetaModel.mSupportedBindingModes, {"OneTime": true});

		oMetadataMock.expects("getServiceMetadata").withExactArgs().returns({foo: "bar"});
		this.mock(oAnnotations).expects("getData").withExactArgs().returns("~annotationsData");
		let fnAnnotationChangeResolve;
		const oAnnotationChangesPromise = new Promise((resolve) => {
			fnAnnotationChangeResolve = resolve;
		});
		this.mock(oDataModel).expects("_requestAnnotationChanges").withExactArgs().returns(oAnnotationChangesPromise);

		// code under test - resolve annotations loaded Promise
		fnResolve();

		return oAnnotationsLoadedPromise.then(() => {
			this.mock(ODataMetaModelUtils).expects("merge")
				.withExactArgs("~annotationsData", {foo: "bar"}, sinon.match.same(oMetaModel),
					"~bIgnoreAnnotationsFromMetadata");
			this.mock(_Helper).expects("deepClone").withExactArgs("~aAnnotationChanges", 20)
				.returns("~aClonedAnnotationChanges");
			this.mock(oMetaModel).expects("_applyAnnotationChanges").withExactArgs().callsFake(() => {
				// cloning annotation changes is done before applying them
				assert.strictEqual(oMetaModel.aAnnotationChanges, "~aClonedAnnotationChanges");
			});

			// code under test - resolve annotation change Promise
			fnAnnotationChangeResolve("~aAnnotationChanges");

			return oAnnotationChangesPromise.then(() => {
				assert.strictEqual(oMetaModel.aAnnotationChanges, "~aClonedAnnotationChanges");
				// not yet fulfilled as loadedPromise is not yet fulfilled
				assert.notOk(oMetaModel.oLoadedPromiseSync.isFulfilled());
				assert.ok(oMetaModel.oModel instanceof JSONModel);
				assert.strictEqual(oMetaModel.oModel.getDefaultBindingMode(), BindingMode.OneTime);
				assert.deepEqual(oMetaModel.oModel.getData(), {foo: "bar"});

				return oMetaModel.oLoadedPromise.then(() => {
					assert.ok(oMetaModel.oLoadedPromiseSync.isFulfilled());
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		const oDataModel = {
			_requestAnnotationChanges() {},
			annotationsLoaded() {}
		};
		this.mock(oDataModel).expects("annotationsLoaded").withExactArgs().returns(undefined);
		this.mock(oDataModel).expects("_requestAnnotationChanges").withExactArgs().returns(SyncPromise.resolve());
		const oMetaModel = new ODataMetaModel({
			getServiceMetadata() { return {dataServices: {}}; }
		}, undefined, oDataModel);

		assert.strictEqual(oMetaModel.oDataModel, oDataModel);

		return oMetaModel.loaded().then((vLoadedResult) => {
			assert.strictEqual(vLoadedResult, undefined);

			this.mock(Model.prototype).expects("destroy");

			const oModelMock = this.mock(oMetaModel.oModel);
			const oResult = {};
			// generic dispatching
			["destroy", "isList"].forEach((sName) => {
				oModelMock.expects(sName).withExactArgs("foo", 0, false).returns(oResult);

				assert.strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
			});
			const oMetaModelMock = this.mock(oMetaModel);
			// getProperty dispatches to _getObject
			oMetaModelMock.expects("_getObject").withExactArgs("foo", 0, false)
				.returns(oResult);
			assert.strictEqual(oMetaModel.getProperty("foo", 0, false), oResult, "getProperty");

			assert.throws(() => { oMetaModel.refresh(); }, /Unsupported operation: ODataMetaModel#refresh/);

			oMetaModel.setLegacySyntax(); // allowed
			oMetaModel.setLegacySyntax(false); // allowed
			assert.throws(() => { oMetaModel.setLegacySyntax(true); }, /Legacy syntax not supported by ODataMetaModel/);

			assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
			assert.strictEqual(oMetaModel.oModel.getDefaultBindingMode(), BindingMode.OneTime);
			assert.throws(() => { oMetaModel.setDefaultBindingMode(BindingMode.OneWay); });
			assert.throws(() => { oMetaModel.setDefaultBindingMode(BindingMode.TwoWay); });
		});
	});

	//*********************************************************************************************
	QUnit.test("_applyAnnotationChanges: no annotation changes", function (assert) {
		const oMetaModel = {aAnnotationChanges: undefined};

		// code under test
		ODataMetaModel.prototype._applyAnnotationChanges.call(oMetaModel);
	});

	//*********************************************************************************************
	QUnit.test("_applyAnnotationChanges: annotation changes exist", function (assert) {
		const aAnnotationChanges = [{path: "/~Path0", value: "foo"}, {path: "/~Path1", value: "bar"}];
		const oMetaModel = {
			aAnnotationChanges: aAnnotationChanges,
			oModel: {setProperty() {}},
			_getObject() {}
		};
		const oMetaModelMock = this.mock(oMetaModel);
		oMetaModelMock.expects("_getObject").withExactArgs("/~Path0", undefined, true).returns(null);
		oMetaModelMock.expects("_getObject").withExactArgs("/~Path1", undefined, true).returns("/~resolvedPath1");
		const oModelMock = this.mock(oMetaModel.oModel);
		oModelMock.expects("setProperty").withExactArgs("/~resolvedPath1", "bar");

		// code under test
		ODataMetaModel.prototype._applyAnnotationChanges.call(oMetaModel);

		assert.notStrictEqual(oMetaModel.aAnnotationChanges, aAnnotationChanges);
		assert.deepEqual(oMetaModel.aAnnotationChanges, [{path: "/~Path0", value: "foo"}]);

		oMetaModelMock.expects("_getObject").withExactArgs("/~Path0", undefined, true).returns("/~resolvedPath0");
		oModelMock.expects("setProperty").withExactArgs("/~resolvedPath0", "foo");

		// code under test - last annotation change applied -> aAnnotationChanges is reset
		ODataMetaModel.prototype._applyAnnotationChanges.call(oMetaModel);

		assert.strictEqual(oMetaModel.aAnnotationChanges, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getObject: as path; path contains an invalid part", function (assert) {
		const oModel = {
			_getObject() {}
		};
		const oMetaModel = {
			oModel,
			resolve() {}
		};
		this.mock(oMetaModel).expects("resolve").withExactArgs("~path", undefined).returns("/~resolved/Path");
		this.mock(oModel).expects("_getObject").withExactArgs("/").returns({});

		// code under test
		assert.strictEqual(ODataMetaModel.prototype._getObject.call(oMetaModel, "~path", undefined, true), null);
	});

	//*********************************************************************************************
	QUnit.test("_getObject: as path; path exist in model data", function (assert) {
		const oModel = {
			_getObject() {}
		};
		const oMetaModel = {
			oModel,
			resolve() {}
		};
		this.mock(oMetaModel).expects("resolve").withExactArgs("~path", undefined).returns("/foo/bar");
		this.mock(oModel).expects("_getObject").withExactArgs("/").returns({foo: {bar: "baz"}});

		// code under test
		assert.strictEqual(ODataMetaModel.prototype._getObject.call(oMetaModel, "~path", undefined, true), "/foo/bar/");
	});

	//*********************************************************************************************
	QUnit.test("_sendBundledRequest", function (assert) {
		const mInitialQName2PendingRequest = {
			foo: {resolve() {}, reject() {}},
			bar: {resolve() {}, reject() {}}
		};
		const oMetaModel = {
			mQName2PendingRequest: mInitialQName2PendingRequest,
			_applyAnnotationChanges() {},
			_mergeMetadata() {},
			oDataModel: {
				addAnnotationUrl() {}
			}
		};
		const oMetaModelMock = this.mock(oMetaModel);
		let fnResolve;
		const oPromise = new Promise((resolve) => {
			fnResolve = resolve;
		});

		this.mock(oMetaModel.oDataModel).expects("addAnnotationUrl")
			.withExactArgs("$metadata?sap-value-list=bar,foo")
			.returns(oPromise);

		// code under test
		ODataMetaModel.prototype._sendBundledRequest.call(oMetaModel);

		assert.deepEqual(oMetaModel.mQName2PendingRequest, {});

		const oMergeMetadataExpectation = oMetaModelMock.expects("_mergeMetadata").withExactArgs("~oResponse");
		const oFooResolveExpectation = this.mock(mInitialQName2PendingRequest.foo).expects("resolve")
			.withExactArgs("~oResponse");
		const oBarMock = this.mock(mInitialQName2PendingRequest.bar);
		const oError = new Error("Failed to process response for 'bar'");
		const oBarResolveExpectation = oBarMock.expects("resolve").withExactArgs("~oResponse").throws(oError);
		const oBarRejectExpectation = oBarMock.expects("reject").withExactArgs(sinon.match.same(oError));
		const oApplyAnnotationChangesExpectation = oMetaModelMock.expects("_applyAnnotationChanges").withExactArgs();

		// code under test
		fnResolve("~oResponse");

		return oPromise.then(() => {
			assert.ok(oMergeMetadataExpectation.calledBefore(oFooResolveExpectation));
			assert.ok(oMergeMetadataExpectation.calledBefore(oBarResolveExpectation));
			assert.ok(oFooResolveExpectation.calledBefore(oApplyAnnotationChangesExpectation));
			assert.ok(oBarResolveExpectation.calledBefore(oBarRejectExpectation));
			assert.ok(oBarRejectExpectation.calledBefore(oApplyAnnotationChangesExpectation));
		});
	});

	//*********************************************************************************************
[{
	oPropertyAnnotations: {
		"~namespace.~entityTypeName": {
			"~propertyName": {
				"com.sap.vocabularies.Common.v1.Label": "~LabelViaValueList",
				"com.sap.vocabularies.Common.v1.ValueList": "~oValueList"
			}
		}
	},
	mValueLists: {"~bar": "~baz"},
	bWithValueList: true
}, {
	oPropertyAnnotations: {},
	mValueLists: {},
	bWithValueList: false
}].forEach((oFixture) => {
	const sTitle = "getODataValueLists: " + (oFixture.bWithValueList ? "success case" : "no value list from server");
	QUnit.test(sTitle, function (assert) {
		const oModel = {getObject() {}};
		const oMetaModel = {
			mContext2Promise: {},
			oModel: oModel,
			mQName2PendingRequest: {},
			_sendBundledRequest() {}
		};
		const oMetaModelMock = this.mock(oMetaModel);
		const oPropertyContext = {getObject() {}, getPath() {}};
		const sPropertyMetaPath = "/dataServices/schema/0/entityType/13/property/42";
		this.mock(oPropertyContext).expects("getPath").withExactArgs().returns(sPropertyMetaPath);
		const oProperty = {
			"com.sap.vocabularies.Common.v1.Label": "~Label",
			name: "~propertyName",
			"sap:value-list": "foo"
		};
		this.mock(oPropertyContext).expects("getObject").withExactArgs().returns(oProperty);
		const oODataMetaModelUtilsMock = this.mock(ODataMetaModelUtils);
		oODataMetaModelUtilsMock.expects("getValueLists").withExactArgs(sinon.match.same(oProperty)).returns({});
		const oModelMock = this.mock(oModel);
		oModelMock.expects("getObject").withExactArgs("/dataServices/schema/0")
			.returns({namespace: "~namespace"});
		oModelMock.expects("getObject").withExactArgs("/dataServices/schema/0/entityType/13")
			.returns({name: "~entityTypeName"});
		const oSendBundleRequestExpectation = oMetaModelMock.expects("_sendBundledRequest").withExactArgs();

		// code under test
		const oValueListLoadPromise = ODataMetaModel.prototype.getODataValueLists.call(oMetaModel, oPropertyContext);

		assert.ok(oValueListLoadPromise instanceof Promise);
		assert.strictEqual(oMetaModel.mContext2Promise[sPropertyMetaPath], oValueListLoadPromise);
		const oPendingRequest = oMetaModel.mQName2PendingRequest["~namespace.~entityTypeName/~propertyName"];
		assert.ok(typeof oPendingRequest.resolve === "function");

		setTimeout(() => {
			assert.ok(oSendBundleRequestExpectation.calledOnce);
			const oResponse = {
				"annotations": {
					"propertyAnnotations": oFixture.oPropertyAnnotations
				}
			};
			oODataMetaModelUtilsMock.expects("getValueLists").withExactArgs(sinon.match.same(oProperty))
				.returns(oFixture.mValueLists);

			// code under test
			oPendingRequest.resolve(oResponse);

			assert.strictEqual(oProperty["com.sap.vocabularies.Common.v1.Label"], "~Label"); // not overwitten!
			if (oFixture.bWithValueList) {
				assert.strictEqual(oProperty["com.sap.vocabularies.Common.v1.ValueList"], "~oValueList");
				assert.notOk(oMetaModel.mContext2Promise[sPropertyMetaPath]);
			} else {
				assert.strictEqual(oMetaModel.mContext2Promise[sPropertyMetaPath], oValueListLoadPromise);
			}
		}, 0);

		return oValueListLoadPromise.then((mValueLists0) => {
			assert.ok(oFixture.bWithValueList);
			assert.strictEqual(mValueLists0, oFixture.mValueLists);
		}, (oError) => {
			assert.notOk(oFixture.bWithValueList);
			assert.strictEqual(oError.message, "No value lists returned for " + sPropertyMetaPath);
		});
	});
});

	//*********************************************************************************************
[true, false].forEach((bWithSharedModel) => {
	[true, false].forEach((bWithInternalModel) => {
	const sTitle = "destroy: " + (bWithSharedModel ? "with" : "without") + " shared model; "
			+ (bWithInternalModel ? "with" : "without") + " internal model";

	QUnit.test(sTitle, function (assert) {
		const oODataMetaModel = {};
		this.mock(MetaModel.prototype).expects("destroy").withExactArgs("parameters", "passed", "through");
		if (bWithSharedModel) {
			oODataMetaModel.oSharedModelCache = {
				bFirstCodeListRequested: false,
				oModel: {destroy() {}}
			};
			this.mock(oODataMetaModel.oSharedModelCache.oModel).expects("destroy");
		}
		if (bWithInternalModel) {
			oODataMetaModel.oModel = {destroy() {}};
			this.mock(oODataMetaModel.oModel).expects("destroy").returns("~destroyed");
		}

		// code under test
		assert.strictEqual(ODataMetaModel.prototype.destroy.call(oODataMetaModel, "parameters", "passed", "through"),
			bWithInternalModel ? "~destroyed" : undefined);

		assert.notOk("oSharedModelCache" in oODataMetaModel);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getCodeListTerm", function (assert) {
		assert.strictEqual(ODataMetaModel.getCodeListTerm(), undefined);
		assert.strictEqual(ODataMetaModel.getCodeListTerm("foo"), undefined);
		assert.strictEqual(ODataMetaModel.getCodeListTerm("/##@@requestCurrencyCodes"), "CurrencyCodes");
		assert.strictEqual(ODataMetaModel.getCodeListTerm("/##@@requestUnitsOfMeasure"), "UnitsOfMeasure");
	});

	//*********************************************************************************************
	QUnit.test("_getKeyPath: success case", function (assert) {
		var oType = {
				key: {
					propertyRef: [{name: "~key"}]
				}
			};

		// code under test
		assert.deepEqual(ODataMetaModel._getKeyPath(oType, "~sTypePath"), "~key");
	});

	//*********************************************************************************************
[
	{key: {propertyRef: undefined}},
	{key: {propertyRef: []}},
	{key: {propertyRef: ["~key1", "~key2"]}}
].forEach(function (oType, i) {
	QUnit.test("_getKeyPath: error case: " + i, function (assert) {
		// code under test
		assert.throws(() => {
			ODataMetaModel._getKeyPath(oType, "~sTypePath");
		}, new Error("Single key expected: ~sTypePath"));
	});
});

	//*********************************************************************************************
[{
	standardCode: undefined,
	typeMetadata: {}
}, {
	standardCode: {Path: "~StandardCode"},
	typeMetadata: {
		"Org.OData.Core.V1.AlternateKeys": [{
			Key: [{
				Name: {Path: "~ExternalCode"}
			}]
		}]
	}
}].forEach(function (oFixture, i) {
	QUnit.test("_getPropertyNamesForCodeListCustomizing: success case: " + i, function (assert) {
		const oDataModel = {getObject() {}};
		const oDataModelMock = this.mock(oDataModel);
		oDataModelMock.expects("getObject").withExactArgs("/~collectionPath/##").returns(oFixture.typeMetadata);
		this.mock(ODataMetaModel).expects("_getKeyPath")
			.withExactArgs(oFixture.typeMetadata, "/~collectionPath/##")
			.returns("~keyPath");
		const oKeyMetadata = {
			"com.sap.vocabularies.CodeList.v1.StandardCode": oFixture.standardCode,
			"com.sap.vocabularies.Common.v1.Text": {Path: "~Text"},
			"com.sap.vocabularies.Common.v1.UnitSpecificScale": {Path: "~UnitSpecificScale"}
		};
		oDataModelMock.expects("getObject").withExactArgs("/~collectionPath/~keyPath/##").returns(oKeyMetadata);
		const oMetaModel = {oDataModel: oDataModel};

		// code under test
		assert.deepEqual(
			ODataMetaModel.prototype._getPropertyNamesForCodeListCustomizing.call(oMetaModel, "~collectionPath"),
			{
				code: oFixture.typeMetadata["Org.OData.Core.V1.AlternateKeys"] ? "~ExternalCode" : "~keyPath",
				standardCode: oFixture.standardCode ? "~StandardCode" : undefined,
				text: "~Text",
				unitSpecificScale: "~UnitSpecificScale"
			});
	});
});

	//*********************************************************************************************
[{
	error: "Single alternative expected: /~collectionPath/##Org.OData.Core.V1.AlternateKeys",
	typeMetadata: {"Org.OData.Core.V1.AlternateKeys": [{Key: [{/* not relevant */}]}, {Key: [{/* not relevant */}]}]}
}, {
	error: "Single key expected: /~collectionPath/##Org.OData.Core.V1.AlternateKeys/0/Key",
	typeMetadata: {"Org.OData.Core.V1.AlternateKeys": [{Key: [{/* not relevant */}, {/* not relevant */}]}]}
}].forEach((oFixture, i) => {
	QUnit.test("_getPropertyNamesForCodeListCustomizing: error case: " + i, function (assert) {
		const oDataModel = {getObject() {}};
		const oDataModelMock = this.mock(oDataModel);
		oDataModelMock.expects("getObject").withExactArgs("/~collectionPath/##").returns(oFixture.typeMetadata);
		this.mock(ODataMetaModel).expects("_getKeyPath")
			.withExactArgs(sinon.match.same(oFixture.typeMetadata), "/~collectionPath/##")
			.returns("~keyPath");
		oDataModelMock.expects("getObject").withExactArgs("/~collectionPath/~keyPath/##").returns("~oKeyMetadata");
		const oMetaModel = {oDataModel: oDataModel};

		// code under test
		assert.throws(() => {
			ODataMetaModel.prototype._getPropertyNamesForCodeListCustomizing.call(oMetaModel, "~collectionPath");
		}, oFixture.error);
	});
});
});