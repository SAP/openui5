/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/_Helper",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/ODataMetaModel"
], function (Log, SyncPromise, _Helper, BindingMode, JSONModel, ODataMetaModelUtils, ODataMetaModel) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMetaModel (ODataMetaModelNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
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
		assert.deepEqual(oMetaModel.mSupportedBindingModes, {"OneTime" : true});

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
			foo : {resolve() {}, reject() {}},
			bar : {resolve() {}, reject() {}}
		};
		const oMetaModel = {
			mQName2PendingRequest : mInitialQName2PendingRequest,
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
});