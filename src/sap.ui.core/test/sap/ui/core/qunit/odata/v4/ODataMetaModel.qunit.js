/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/ContextBinding",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/_SyncPromise",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function (ContextBinding, FilterProcessor, JSONListBinding, MetaModel, Helper, SyncPromise,
		ODataMetaModel, ODataModel, PropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var oMetadata = {
			"$EntityContainer" : "com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer",
			"com.sap.gateway.iwbep.tea_busi.v0001.TEAM" : {
				"$Key" : ["Team_Id"],
				"Team_Id" : {
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 10
				},
				"TEAM_2_EMPLOYEES" : {
					"$isCollection" : true,
					"$kind" : "NavigationProperty",
					"$Type" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
				}
			},
			"com.sap.gateway.iwbep.tea_busi.v0001.Worker" : {
				"$Key" : ["ID"],
				"ID" : {
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 4
				},
				"AGE" : {
					"$Type" : "Edm.Int16",
					"$Nullable" : false
				},
				"EMPLOYEE_2_TEAM" : {
					"$kind" : "NavigationProperty",
					"$Type" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM",
					"$Nullable" : false
				}
			},
			"com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"EMPLOYEES" : {
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "T€AMS"
					},
					"$Type" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
				},
				"T€AMS" : {
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
				}
			},
			"name.space.Broken" : {
				"$kind" : "Term",
				"$Type" : "not.Found"
			},
			"name.space.Term" : { // only case with a qualified name and a $Type
				"$kind" : "Term",
				"$Type" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
			},
			"$Term" : "name.space.Term" // replacement for any reference to the term
		},
		oContainerData = oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer"],
//		oTeamData = oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"],
		oWorkerData = oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.Worker"];

	/**
	 * Checks the "get*" and "request*" methods corresponding to the named "fetch*" method,
	 * using the given arguments.
	 *
	 * @param {object} oTestContext
	 *   the QUnit "this" object
	 * @param {object} assert
	 *   the QUnit "assert" object
	 * @param {string} sMethodName
	 *   method name "fetch*"
	 * @param {object[]} aArguments
	 *   method arguments
	 * @param {boolean} [bThrow=false]
	 *   whether the "get*" method throws if the promise is not fulfilled
	 * @returns {Promise}
	 *   the "request*" method's promise
	 */
	function checkGetAndRequest(oTestContext, assert, sMethodName, aArguments, bThrow) {
		var oExpectation,
			sGetMethodName = sMethodName.replace("fetch", "get"),
			oMetaModel = oTestContext.oMetaModel,
			oReason = new Error("rejected"),
			oRejectedPromise = Promise.reject(oReason),
			sRequestMethodName = sMethodName.replace("fetch", "request"),
			oResult = {},
			oSyncPromise = SyncPromise.resolve(oRejectedPromise);

		// resolve...
		oExpectation = oTestContext.oSandbox.mock(oMetaModel).expects(sMethodName).exactly(4);
		oExpectation = oExpectation.withExactArgs.apply(oExpectation, aArguments);
		oExpectation.returns(SyncPromise.resolve(oResult));

		// get: fulfilled
		assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), oResult);

		// reject...
		oExpectation.returns(oSyncPromise);
		oTestContext.oSandbox.mock(Promise).expects("resolve").withExactArgs(oSyncPromise)
			.returns(oRejectedPromise); // return any promise (this is not unwrapping!)

		// request (promise still pending!)
		assert.strictEqual(oMetaModel[sRequestMethodName].apply(oMetaModel, aArguments),
			oRejectedPromise);

		// get: pending
		if (bThrow) {
			assert.throws(function () {
				oMetaModel[sGetMethodName].apply(oMetaModel, aArguments);
			}, new Error("Result pending"));
		} else {
			assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), undefined,
				"pending");
		}
		return oRejectedPromise["catch"](function () {
			// get: rejected
			if (bThrow) {
				assert.throws(function () {
					oMetaModel[sGetMethodName].apply(oMetaModel, aArguments);
				}, oReason);
			} else {
				assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments),
					undefined, "rejected");
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataMetaModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oMetaModel = new ODataMetaModel();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetadataRequestor = {
				read : function () { throw new Error(); }
			},
			sUrl = "/~/$metadata",
			oMetaModel;

		// code under test
		oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl);

		assert.ok(oMetaModel instanceof MetaModel);
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, sUrl);
	});

	//*********************************************************************************************
	QUnit.test("fetchEntityContainer", function (assert) {
		var oMetadataRequestor = {
				read : function () {}
			},
			sUrl = "/~/$metadata",
			oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl),
			oPromise = Promise.resolve({/*oMetadata*/}),
			oSyncPromise;

		this.mock(oMetadataRequestor).expects("read").withExactArgs(sUrl).returns(oPromise);

		// code under test
		oSyncPromise = oMetaModel.fetchEntityContainer();

		// pending
		assert.strictEqual(oSyncPromise.isFulfilled(), false);
		assert.strictEqual(oSyncPromise.isRejected(), false);
		assert.strictEqual(oSyncPromise.getResult(), oSyncPromise);
		// already caching
		assert.strictEqual(oMetaModel.fetchEntityContainer(), oSyncPromise);

		return oPromise.then(function (oMetadata) {
			// fulfilled
			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.isRejected(), false);
			assert.strictEqual(oSyncPromise.getResult(), oMetadata);
			// still caching
			assert.strictEqual(oMetaModel.fetchEntityContainer(), oSyncPromise);
		});
	});
	//TODO later support "$Extends" : "<13.1.2 EntityContainer Extends>"

	//*********************************************************************************************
	[{
		dataPath: "/Foo",
		metaPath: "/$EntityContainer/Foo"
	}, { // e.g. function call plus key predicate
		dataPath: "/Foo/name.space.bar_42(key='value')(key='value')",
		metaPath: "/$EntityContainer/Foo/name.space.bar_42"
	}, {
		dataPath: "/Foo(key='value')(key='value')/bar",
		metaPath: "/$EntityContainer/Foo/bar"
	}, { // segment parameter names do not matter
		dataPath: "/Foo[0];foo=42",
		metaPath: "/$EntityContainer/Foo"
	}, {
		dataPath: "/Foo[0];bar=42/bar",
		metaPath: "/$EntityContainer/Foo/bar"
	}, { // any segment with digits only
		dataPath: "/Foo/" + Date.now(),
		metaPath: "/$EntityContainer/Foo"
	}, {
		dataPath: "/Foo/" + Date.now() + "/bar",
		metaPath: "/$EntityContainer/Foo/bar"
	}, { // global removal needed
		dataPath: "/Foo(key='value')/" + Date.now() + "/bar(key='value')/"  + Date.now(),
		metaPath: "/$EntityContainer/Foo/bar"
	}].forEach(function (oFixture) {
		QUnit.test("getMetaContext: " + oFixture.dataPath, function (assert) {
			var oMetaContext = this.oMetaModel.getMetaContext(oFixture.dataPath);

			assert.strictEqual(oMetaContext.getModel(), this.oMetaModel);
			assert.strictEqual(oMetaContext.getPath(), oFixture.metaPath);
		});
	});
	//TODO $all, $count, $crossjoin, $ref, $value
	// Q: Do we need to keep signatures to resolve overloads?
	// A: Most probably not. The spec says "All bound functions with the same function name and
	//    binding parameter type within a namespace MUST specify the same return type."
	//    "All unbound functions with the same function name within a namespace MUST specify the
	//    same return type." --> We can find the return type (from the binding parameter type).
	//    If it comes to annotations, the signature might make a difference, but then "unordered
	//    set of (non-binding) parameter names" is unique.

	//*********************************************************************************************
	//TODO extend map lookup from QualifiedName to TargetPath?
	[{
		metaPath : "/",
		result : oMetadata
	}, {
		metaPath : "/Foo",
		result : undefined
	}, { // "It does not matter whether that name is valid or not."
		metaPath : "/Foo/@sapui.name",
		result : "Foo"
	}, {
		metaPath : "/$Foo",
		result : undefined
	}, {
		metaPath : "/$EntityContainer",
		result : "com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer"
	}, {
		metaPath : "/$EntityContainer/$kind",
		result : "EntityContainer"
	}, {
		contextPath : "/$EntityContainer",
		metaPath : "$kind",
		result : "EntityContainer"
	}, {
		metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/$kind",
		result : "EntityContainer"
	}, {
		metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/Foo",
		result : undefined
	}, {
		metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/$Foo",
		result : undefined
	}, {
		metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/@sapui.name",
		result : "com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer"
	}, {
		metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/./@sapui.name",
		result : "com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer"
	}, {
		metaPath : "/$EntityContainer/Foo",
		result : undefined
	}, {
		metaPath : "/$EntityContainer/$Foo",
		result : undefined
	}, { // avoid implicit OData drill-down for following $ segments
		metaPath : "/$EntityContainer/T€AMS/$Key",
		result : undefined
	}, {
		metaPath : "/$EntityContainer/T€AMS/@sapui.name",
		result : "T€AMS"
	}, {
		metaPath : "/$EntityContainer/T€AMS/./@sapui.name",
		result : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
	}, {
		metaPath : "/$EntityContainer/T€AMS/Team_Id/@sapui.name",
		result : "Team_Id"
	}, {
		metaPath : "/$EntityContainer/T€AMS/$Type/Team_Id",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"].Team_Id
	}, {
		metaPath : "/$EntityContainer/T€AMS/Team_Id",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"].Team_Id
	}, {
		metaPath : "/$EntityContainer/T€AMS/TEAM_2_EMPLOYEES/@sapui.name",
		result : "TEAM_2_EMPLOYEES"
	}, {
		metaPath : "/$EntityContainer/T€AMS/TEAM_2_EMPLOYEES",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"].TEAM_2_EMPLOYEES
	}, {
		metaPath : "/$EntityContainer/T€AMS/TEAM_2_EMPLOYEES/AGE",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.Worker"].AGE
	}, {
		metaPath : "/$EntityContainer/T€AMS/$Type",
		result : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
	}, { //TODO can we simply use a trailing slash here? resolvePath currently does not support it
		metaPath : "/$EntityContainer/T€AMS/$Type/.",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"]
	}, {
		metaPath : "/$EntityContainer/T€AMS/.",
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.TEAM"]
	}, {
		metaPath : "/$EntityContainer/T€AMS/Foo",
		result : undefined
	}, {
		metaPath : "/$EntityContainer/T€AMS/$Foo",
		result : undefined
	}, {
		metaPath : "/$Term/AGE", // map lookup, then drill-down into type!
		result : oMetadata["com.sap.gateway.iwbep.tea_busi.v0001.Worker"].AGE
	}].forEach(function (oFixture) {
		var sPath = oFixture.contextPath
			? oFixture.contextPath + " / "/*make cut more visible*/ + oFixture.metaPath
			: oFixture.metaPath;

		QUnit.test("fetchObject: " + sPath, function (assert) {
			var oContext = oFixture.contextPath && this.oMetaModel.getContext(oFixture.contextPath),
				oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(oMetadata));

			oSyncPromise = this.oMetaModel.fetchObject(oFixture.metaPath, oContext);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), oFixture.result);
		});
	});
	//TODO special cases from sap.ui.model.odata.ODataMetaModel#_getObject:
	// - "Invalid relative path w/o context"
	// - BindingParser.parseExpression() ??? we hardly have any arrays...
	//TODO $count?
	//TODO this.oList => getObject/getProperty MUST also accept object instead of context!


	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		[{
			metaPath : "/$Foo/.",
			warning : "Invalid part: ."
		}, {
			metaPath : "/$Foo/$Bar",
			warning : "Invalid part: $Bar"
		}, {
			metaPath : "/$Foo/$Bar/$Baz",
			warning : "Invalid part: $Bar"
		}, {
			metaPath : "/$EntityContainer/T€AMS/Team_Id/$MaxLength/.",
			warning : "Invalid part: ."
		}, {
			metaPath : "/$EntityContainer/T€AMS/Team_Id/$Nullable/.",
			warning : "Invalid part: ."
		}, {
			contextPath : "/$EntityContainer",
			metaPath : "$kind/Foo",
			warning : "Unknown qualified name EntityContainer before Foo"
		}, {
			metaPath : "/name.space.Broken/Foo", // implicit drill-down into type
			warning : "Unknown qualified name not.Found before Foo"
		}, {
			metaPath : "/name.space.Broken/$Type/Foo", // implicit map lookup
			warning : "Unknown qualified name not.Found before Foo"
		}, {
			metaPath : "/@sapui.name",
			warning : "Invalid path before @sapui.name"
		}, {
			metaPath : "/com.sap.gateway.iwbep.tea_busi.v0001.DefaultContainer/$kind/@sapui.name",
			warning : "Invalid path before @sapui.name"
		}, {
			metaPath : "/$EntityContainer/T€AMS/@sapui.name/foo",
			warning : "Invalid path after @sapui.name"
		}].forEach(function (oFixture) {
			var sPath = oFixture.contextPath
				? oFixture.contextPath + "/" + oFixture.metaPath
				: oFixture.metaPath;

			QUnit.test("fetchObject fails: " + sPath + ", warn = " + bWarn, function (assert) {
				var oContext = oFixture.contextPath
						&& this.oMetaModel.getContext(oFixture.contextPath),
					oSyncPromise;

				this.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(SyncPromise.resolve(oMetadata));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING)
					.returns(bWarn);
				this.oLogMock.expects("warning")
					.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
					.withExactArgs(oFixture.warning, sPath,
						"sap.ui.model.odata.v4.ODataMetaModel");

				oSyncPromise = this.oMetaModel.fetchObject(oFixture.metaPath, oContext);

				assert.strictEqual(oSyncPromise.isFulfilled(), true);
				assert.deepEqual(oSyncPromise.getResult(), undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getObject, requestObject", function (assert) {
		return checkGetAndRequest(this, assert, "fetchObject", ["sPath", {/*oContext*/}]);
	});

	//*********************************************************************************************
	[{
		$Type : "Edm.Boolean"
	},{
		$Type : "Edm.Byte"
	}, {
		$Type : "Edm.Date"
//	}, {
//		$Type : "Edm.DateTimeOffset"
//	},{
//		$Type : "Edm.DateTimeOffset",
//		facets: [{Name: "Precision", Value: "7"}]
//		constraints: {precision: 7} //TODO implement
	}, {
		$Type : "Edm.Decimal"
	}, {
		$Precision : 20,
		$Scale : 5,
		$Type : "Edm.Decimal",
		__constraints : {precision : 20, scale : 5}
	}, {
		$Precision : 20,
		$Scale : "variable",
		$Type : "Edm.Decimal",
		__constraints : {precision : 20, scale : Infinity}
	}, {
		$Type : "Edm.Double"
	}, {
		$Type : "Edm.Guid"
	}, {
		$Type : "Edm.Int16"
	}, {
		$Type : "Edm.Int32"
	}, {
		$Type : "Edm.Int64"
	}, {
		$Type : "Edm.SByte"
	}, {
		$Type : "Edm.Single"
	}, {
		$Type : "Edm.String"
	}, {
		$MaxLength : 255,
		$Type : "Edm.String",
		__constraints : {maxLength : 255}
	}].forEach(function (oProperty) {
		var oConstraints = oProperty.__constraints;

		delete oProperty.__constraints;

		// order is important because oConstraints is modified!
		[true, false].forEach(function (bNullable) {
			if (!bNullable) {
				oProperty.$Nullable = false;
				oConstraints = oConstraints || {};
				oConstraints.nullable = false;
			}

			QUnit.test("fetchUI5Type: " + JSON.stringify(oProperty), function (assert) {
				var sPath = "/EMPLOYEES[0];list=1/ENTRYDATE",
					oType;

				this.oSandbox.mock(this.oMetaModel).expects("fetchObject")
					.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
					.returns(SyncPromise.resolve(oProperty));

				oType = this.oMetaModel.fetchUI5Type(sPath).getResult();
				assert.strictEqual(oType.getName(),
					"sap.ui.model.odata.type." + oProperty.$Type.slice(4)/*cut off "Edm."*/);
				assert.deepEqual(oType.oConstraints, oConstraints);
			});
		});
	});
	//TODO later: support for facet DefaultValue?

	//*********************************************************************************************
	QUnit.test("fetchUI5Type: caching", function (assert) {
		var sPath = "/EMPLOYEES[0];list=1/ENTRYDATE",
			oProperty = {$Type : "Edm.String"},
			oType;

		this.oSandbox.mock(this.oMetaModel).expects("fetchObject")
			.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath)).twice()
			.returns(SyncPromise.resolve(oProperty));

		oType = this.oMetaModel.fetchUI5Type(sPath).getResult();

		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.String");
		assert.strictEqual(oProperty["$ui5.type"], oType, "cache filled");
		assert.strictEqual(this.oMetaModel.fetchUI5Type(sPath).getResult(), oType, "cache used");
	});

	//*********************************************************************************************
	//TODO make these types work with odata v4
	["Edm.DateTimeOffset", "Edm.Duration", "Edm.TimeOfDay"].forEach(function (sQualifiedName) {
		QUnit.test("fetchUI5Type: unsupported type " + sQualifiedName, function (assert) {
			var sPath = "/EMPLOYEES[0];list=1/foo",
				oSyncPromise;

			this.oSandbox.mock(this.oMetaModel).expects("fetchObject")
				.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
				.returns(SyncPromise.resolve({$Type : sQualifiedName}));

			oSyncPromise = this.oMetaModel.fetchUI5Type(sPath);
			assert.ok(oSyncPromise.isRejected());
			assert.strictEqual(oSyncPromise.getResult().message,
				"Unsupported EDM type '" + sQualifiedName + "' at " + sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("getUI5Type, requestUI5Type", function (assert) {
		return checkGetAndRequest(this, assert, "fetchUI5Type", ["sPath"], true);
	});

	//*********************************************************************************************
	[{
		dataPath : "/T€AMS[0];bar=42",
		canonicalUrl : "/~/T%E2%82%ACAMS(...)",
		entityType : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
	}, {
		dataPath : "/T€AMS[0];bar=42/TEAM_2_EMPLOYEES/1",
		canonicalUrl : "/~/EMPLOYEES(...)",
		entityType : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
	}, {
		dataPath : "/T€AMS[0];bar=42/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM",
		canonicalUrl : "/~/T%E2%82%ACAMS(...)",
		entityType : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
	}].forEach(function (oFixture) {
		QUnit.test("requestCanonicalUrl: " + oFixture.dataPath, function (assert) {
			var oInstance = {};

			function read(sPath, bAllowObjectAccess) {
				assert.strictEqual(sPath, oFixture.dataPath);
				assert.strictEqual(bAllowObjectAccess, true);
				return Promise.resolve(oInstance);
			}

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(oMetadata));
			this.oSandbox.stub(Helper, "getKeyPredicate", function (oEntityType0, oInstance0) {
				assert.strictEqual(oEntityType0, oMetadata[oFixture.entityType]);
				assert.strictEqual(oInstance0, oInstance);
				return "(...)";
			});

			return this.oMetaModel.requestCanonicalUrl("/~/", oFixture.dataPath, read)
				.then(function (sCanonicalUrl) {
					assert.strictEqual(sCanonicalUrl, oFixture.canonicalUrl);
				})["catch"](function (oError) {
					assert.ok(false, oError.message + "@" + oError.stack);
				});
		});
	});
	//TODO support non-navigation properties
	//TODO "4.3.2 Canonical URL for Contained Entities"
	//TODO prefer instance annotation at payload for "odata.editLink"?!
	//TODO target URLs like "com.sap.gateway.iwbep.tea_busi_product.v0001.Container/Products(...)"?

	//*********************************************************************************************
	[{
		dataPath : "/T€AMS[0];list=0/Team_Id",
		message : "Not a navigation property: Team_Id (/T€AMS[0];list=0/Team_Id)"
	}, {
		dataPath : "/T€AMS[0];list=0/TEAM_2_EMPLOYEES/0/ID",
		message : "Not a navigation property: ID (/T€AMS[0];list=0/TEAM_2_EMPLOYEES/0/ID)"
	}].forEach(function (oFixture) {
		QUnit.test("requestCanonicalUrl: error for " + oFixture.dataPath, function (assert) {
			function read(sPath, bAllowObjectAccess) {
				assert.strictEqual(sPath, oFixture.dataPath);
				assert.strictEqual(bAllowObjectAccess, true);
				return Promise.resolve({});
			}

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(oMetadata));
			this.oSandbox.mock(Helper).expects("getKeyPredicate").never();

			return this.oMetaModel.requestCanonicalUrl("/~/", oFixture.dataPath, read)
				.then(function (sCanonicalUrl) {
					assert.ok(false, sCanonicalUrl);
				})["catch"](function (oError) {
					assert.strictEqual(oError.message, oFixture.message);
				});
		});
	});

	//*********************************************************************************************
	["bar", null, undefined, 42].forEach(function (vValue) {
		QUnit.test("getProperty: primitive value " + vValue, function (assert) {
			var oContext = {};

			this.mock(this.oMetaModel).expects("getObject").withExactArgs("foo", oContext)
				.returns(vValue);

			assert.strictEqual(this.oMetaModel.getProperty("foo", oContext), vValue,
				"property access to primitive values only");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		QUnit.test("getProperty: object values, warn = " + bWarn, function (assert) {
			var oContext = this.oMetaModel.getContext("/$EntityContainer"),
				sPath = "EMPLOYEES",
				sResolvedPath = "/$EntityContainer/EMPLOYEES";

			this.mock(this.oMetaModel).expects("getObject").withExactArgs(sPath, oContext)
				.returns({});
			this.oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bWarn);
			this.mock(this.oMetaModel).expects("resolve").withExactArgs(sPath, oContext)
				.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
				.returns(sResolvedPath);
			this.oLogMock.expects("warning")
				.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Accessed value is not primitive", sResolvedPath,
					"sap.ui.model.odata.v4.ODataMetaModel");

			assert.strictEqual(this.oMetaModel.getProperty(sPath, oContext), null,
				"no property access to objects");
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty", function (assert) {
		var oBinding,
			oContext = {},
			mParameters = {},
			sPath = "foo",
			oValue = {};

		this.mock(this.oMetaModel).expects("getProperty").withExactArgs(sPath, oContext)
			.returns(oValue);

		oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);

		assert.ok(oBinding instanceof PropertyBinding);
		assert.strictEqual(oBinding.getModel(), this.oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.getValue(), oValue);
	});

	//*********************************************************************************************
	["ENTRYDATE", "/$EntityContainer/EMPLOYEES/ENTRYDATE"].forEach(function (sPath) {
		QUnit.test("bindContext: " + sPath, function (assert) {
			var bAbsolutePath = sPath[0] === "/",
				oBinding,
				oBoundContext,
				iChangeCount = 0,
				oContext = this.oMetaModel.getMetaContext("/EMPLOYEES"),
				oContextCopy = this.oMetaModel.getMetaContext("/EMPLOYEES"),
				oNewContext = this.oMetaModel.getMetaContext("/T€AMS"),
				mParameters = {};

			oBinding = this.oMetaModel.bindContext(sPath, oContextCopy, mParameters);

			assert.ok(oBinding instanceof ContextBinding);
			assert.strictEqual(oBinding.getModel(), this.oMetaModel);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContextCopy);
			assert.strictEqual(oBinding.mParameters, mParameters);

			assert.strictEqual(oBinding.isInitial(), true);
			assert.strictEqual(oBinding.getBoundContext(), null);

			// setContext **********
			oBinding.attachChange(function (oEvent) {
				assert.strictEqual(oEvent.getId(), "change");
				iChangeCount += 1;
			});

			// code under test
			oBinding.setContext(oContext);

			assert.strictEqual(iChangeCount, 0, "still initial");
			assert.strictEqual(oBinding.isInitial(), true);
			assert.strictEqual(oBinding.getBoundContext(), null);
			assert.strictEqual(oBinding.getContext(), oContext);

			// code under test
			oBinding.initialize();

			assert.strictEqual(iChangeCount, 1, "ManagedObject relies on 'change' event!");
			assert.strictEqual(oBinding.isInitial(), false);
			oBoundContext = oBinding.getBoundContext();
			assert.strictEqual(oBoundContext.getModel(), this.oMetaModel);
			assert.strictEqual(oBoundContext.getPath(),
				bAbsolutePath ? sPath : oContext.getPath() + "/" + sPath);

			// code under test
			oBinding.setContext(oContextCopy);

			assert.strictEqual(iChangeCount, 1, "context unchanged");
			assert.strictEqual(oBinding.getBoundContext(), oBoundContext);

			// code under test
			// Note: checks equality on resolved path, not simply object identity of context!
			oBinding.setContext(oNewContext);

			if (bAbsolutePath) {
				assert.strictEqual(iChangeCount, 1, "context unchanged");
				assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
			} else {
				assert.strictEqual(iChangeCount, 2, "context changed");
				oBoundContext = oBinding.getBoundContext();
				assert.strictEqual(oBoundContext.getModel(), this.oMetaModel);
				assert.strictEqual(oBoundContext.getPath(), oNewContext.getPath() + "/" + sPath);
			}

			// code under test
			oBinding.setContext(null);

			if (bAbsolutePath) {
				assert.strictEqual(iChangeCount, 1, "context unchanged");
				assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
			} else {
				assert.strictEqual(iChangeCount, 3, "context changed");
				assert.strictEqual(oBinding.isInitial(), false);
				assert.strictEqual(oBinding.getBoundContext(), null);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList", function (assert) {
		var fnApply = this.oSandbox.mock(FilterProcessor).expects("apply"),
			oBinding,
			oMetaModel = this.oMetaModel, // instead of "that = this"
			oContext = oMetaModel.getMetaContext("/EMPLOYEES"),
			aFilters = [],
			fnGetValue, // fnApply.args[0][2]
			aIndices = ["ID", "AGE"], // mock filter result
			mParameters = {},
			sPath = "",
			aSorters = [];

		this.mock(oMetaModel).expects("_getObject")
			.withExactArgs(sPath, oContext)
			.returns({
				"ID" : {/*...*/},
				"AGE" : {/*...*/},
				"EMPLOYEE_2_TEAM" : {/*...*/}
			});
		fnApply.withArgs(["ID", "AGE", "EMPLOYEE_2_TEAM"], aFilters).returns(aIndices);

		// code under test: implicitly calls oBinding.applyFilter()
		oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);

		assert.ok(oBinding instanceof JSONListBinding);
		assert.strictEqual(oBinding.getModel(), oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.aSorters, aSorters);
		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.aIndices, aIndices);
		assert.strictEqual(oBinding.iLength, oBinding.aIndices.length);

		assert.raises(function () {
			oBinding.enableExtendedChangeDetection();
		}, new Error("Unsupported operation"));

		assert.deepEqual(oBinding.getCurrentContexts().map(function (oContext) {
			assert.strictEqual(oContext.getModel(), oMetaModel);
			return oContext.getPath();
		}), [ // see aIndices
			"/$EntityContainer/EMPLOYEES/ID",
			"/$EntityContainer/EMPLOYEES/AGE"
		]);

		// further tests regarding the getter provided to FilterProcessor.apply()
		fnGetValue = fnApply.args[0][2];
		this.mock(this.oMetaModel).expects("getProperty")
			.withExactArgs("fooPath", oBinding.oList[aIndices[0]])
			.returns("foo");

		// code under test: "@sapui.name" is treated specially
		assert.strictEqual(fnGetValue(aIndices[0], "@sapui.name"), aIndices[0]);

		// code under test: all other paths are passed through
		assert.strictEqual(fnGetValue(aIndices[0], "fooPath"), "foo");
	});

	//*********************************************************************************************
	[{
		// <template:repeat list="{entitySet>}" ...>
		// Iterate all OData path segments, i.e. (navigation) properties.
		// Implicit drill-down into the entity set's type happens here!
		//TODO support for $BaseType
		contextPath : "/$EntityContainer/EMPLOYEES",
		metaPath : "",
		result : {
			"ID" : oWorkerData.ID,
			"AGE" : oWorkerData.AGE,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM
		}
	}, {
		// <template:repeat list="{meta>/$EntityContainer}" ...>
		// Iterate all OData path segments, i.e. entity sets.
		// Implicit map lookup happens here!
		metaPath : "/$EntityContainer",
		result : {
			"EMPLOYEES" : oContainerData.EMPLOYEES,
			"T€AMS" : oContainerData["T€AMS"]
		}
	}].forEach(function (oFixture) {
		var sResolvedPath = oFixture.contextPath
			? oFixture.contextPath + " / "/*make cut more visible*/ + oFixture.metaPath
			: oFixture.metaPath;

		QUnit.test("_getObject: " + sResolvedPath, function (assert) {
			var oContext = oFixture.contextPath && this.oMetaModel.getContext(oFixture.contextPath),
				oMetadataUsed = JSON.parse(JSON.stringify(oMetadata)),
				oObject;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(oMetadataUsed));

			// code under test
			oObject = this.oMetaModel._getObject(oFixture.metaPath, oContext);

			assert.deepEqual(oObject, oFixture.result);
			assert.deepEqual(oMetadataUsed, oMetadata, "used meta data unchanged");
		});
	});
	//TODO Avoid copies of objects? Makes sense only after we get rid of JSONListBinding which
	// makes copies itself. If we get rid of it, we might become smarter in updateIndices and
	// learn from the path which collection to iterate: sPath = "", "$", or "@", oContext holds
	// the resolved path. Could we support setContext() then?
});
//TODO getContext vs. createBindingContext; map of "singletons" vs. memory leak