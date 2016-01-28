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

	var mScope = {
			"$EntityContainer" : "tea_busi.DefaultContainer",
			"empty." : {
				"$kind" : "Schema"
			},
			// tea_busi := com.sap.gateway.iwbep.tea_busi.v0001
			"tea_busi." : {
				"$kind" : "Schema",
				"$Annotations" : {
					"tea_busi.DefaultContainer" : {
						"@empty" : {}
					},
					"tea_busi.DefaultContainer/T€AMS" : {
						"@empty" : {}
					},
					"tea_busi.TEAM" : {
						// UI := com.sap.vocabularies.UI.v1
						"@UI.LineItem" : [{
							"@UI.Importance" : {
								"$EnumMember" : "UI.ImportanceType/High"
							},
							"$Type" : "UI.LineItem",
							"Label" : "Team ID",
							"Value" : {
								"$Path" : "Team_Id"
							}
						}]
					},
					"tea_busi.TEAM/Team_Id" : {
						// Common := com.sap.vocabularies.Common.v1
						"@Common.Text" : {
							"$Path" : "Name"
						},
						"@Common.Text@UI.TextArrangement" : {
							"$EnumMember"
								: "UI.TextArrangementType/TextLast"
						}
					},
					"tea_busi.Worker" : {
						"@UI.Facets" : [{
							"$Type" : "UI.ReferenceFacet",
							"Label" : "Team",
							"Target" : {
								"$AnnotationPath" : "EMPLOYEE_2_TEAM/@UI.LineItem" // term cast
							}
						}],
						"@UI.LineItem" : [{
							"$Type" : "UI.LineItem",
							"Label" : "Team ID",
							"Value" : {
								"$Path" : "EMPLOYEE_2_TEAM/Team_Id"
							}
						}]
					}
				},
				"@empty" : {}
			},
			"empty.Container" : {
				"$kind" : "EntityContainer"
			},
			"tea_busi.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"EMPLOYEES" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "T€AMS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"T€AMS" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "tea_busi.TEAM"
				}
			},
			"tea_busi.TEAM" : {
				"$kind" : "EntityType",
				"$Key" : ["Team_Id"],
				"Team_Id" : {
					"$kind" : "Property",
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 10
				},
				"Name" : {
					"$kind" : "Property",
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 40
				},
				"TEAM_2_EMPLOYEES" : {
					"$kind" : "NavigationProperty",
					"$isCollection" : true,
					"$Type" : "tea_busi.Worker"
				}
			},
			"tea_busi.Worker" : {
				"$kind" : "EntityType",
				"$Key" : ["ID"],
				"ID" : {
					"$kind" : "Property",
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 4
				},
				"AGE" : {
					"$kind" : "Property",
					"$Type" : "Edm.Int16",
					"$Nullable" : false
				},
				"EMPLOYEE_2_TEAM" : {
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.TEAM",
					"$Nullable" : false
				}
			},
			"name.space.Broken" : {
				"$kind" : "Term",
				"$Type" : "not.Found"
			},
			"name.space.Term" : { // only case with a qualified name and a $Type
				"$kind" : "Term",
				"$Type" : "tea_busi.Worker"
			},
			"$$Loop" : "$$Loop/.", // some endless loop
			"$$Term" : "name.space.Term" // replacement for any reference to the term
		},
		oContainerData = mScope["tea_busi.DefaultContainer"],
		oTeamData = mScope["tea_busi.TEAM"],
		oTeamLineItem = mScope["tea_busi."].$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
		oWorkerData = mScope["tea_busi.Worker"];

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

	/**
	 * Runs the given test for each name/value pair in the given fixture. The name is interpreted
	 * as a path "[<sContextPath>'|']<sMetaPath>" and cut accordingly. The test is called with
	 * the resolved sPath (i.e. '|' replaced by '/').
	 *
	 * @param {object} mFixture
	 *   map<string, any>
	 * @param {function} fnTest
	 *   function(string sPath, string sContextPath, string sMetaPath, any vResult)
	 */
	function forEach(mFixture, fnTest) {
		var i,
			sContextPath = "",
			sMetaPath,
			sPath,
			vValue;

		for (sPath in mFixture) {
			vValue = mFixture[sPath];
			i = sPath.indexOf("|");
			sMetaPath = sPath.slice(i + 1);
			if (i >= 0) {
				sContextPath = sPath.slice(0, i);
				sPath = sContextPath + "/" + sMetaPath;
			}

			fnTest(sPath, sContextPath, sMetaPath, vValue);
		}
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
			oPromise = Promise.resolve({/*mScope*/}),
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

		return oPromise.then(function (mScope) {
			// fulfilled
			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.isRejected(), false);
			assert.strictEqual(oSyncPromise.getResult(), mScope);
			// still caching
			assert.strictEqual(oMetaModel.fetchEntityContainer(), oSyncPromise);
		});
	});
	//TODO later support "$Extends" : "<13.1.2 EntityContainer Extends>"

	//*********************************************************************************************
	[{
		dataPath : "/Foo",
		metaPath : "/Foo"
	}, { // e.g. function call plus key predicate
		dataPath : "/Foo/name.space.bar_42(key='value')(key='value')",
		metaPath : "/Foo/name.space.bar_42"
	}, {
		dataPath : "/Foo(key='value')(key='value')/bar",
		metaPath : "/Foo/bar"
	}, { // segment parameter names do not matter
		dataPath : "/Foo[0];foo=42",
		metaPath : "/Foo"
	}, {
		dataPath : "/Foo[0];bar=42/bar",
		metaPath : "/Foo/bar"
	}, { // any segment with digits only
		//TODO remove once v4.ODataListBinding|getDependentPath() does not create such segments
		//     anymore!
		dataPath : "/Foo/" + Date.now(),
		metaPath : "/Foo"
	}, {
		dataPath : "/Foo/" + Date.now() + "/bar",
		metaPath : "/Foo/bar"
	}, { // global removal needed
		dataPath : "/Foo(key='value')/" + Date.now() + "/bar(key='value')/"  + Date.now(),
		metaPath : "/Foo/bar"
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
	forEach({
		// "JSON" drill-down ----------------------------------------------------------------------
		"/" : mScope,
		"/$Foo" : undefined,
		"/$EntityContainer" : "tea_busi.DefaultContainer",
		"/tea_busi." : mScope["tea_busi."], // access to schema
		"/tea_busi./$kind" : "Schema",
		"/tea_busi.DefaultContainer/$kind" : "EntityContainer",
		"/tea_busi.DefaultContainer/$Foo" : undefined,
		"/tea_busi.TEAM/$Key/not.Found" : undefined,
		// scope lookup ("17.3 QualifiedName") ----------------------------------------------------
		"/$EntityContainer/$kind" : "EntityContainer",
		"/$EntityContainer|$kind" : "EntityContainer",
		"/$EntityContainer/$Foo" : undefined,
		"/$EntityContainer/T€AMS/$Type" : "tea_busi.TEAM",
		"/$EntityContainer/T€AMS/$Type/Team_Id" : oTeamData.Team_Id,
		// "17.3 QualifiedName", e.g. type cast ---------------------------------------------------
		"/tea_busi.DefaultContainer/EMPLOYEES/tea_busi.Worker/AGE" : oWorkerData.AGE,
		// implicit $Type insertion ---------------------------------------------------------------
		"/T€AMS/$Key" : undefined, // avoid for following $ segments
		"/T€AMS/Foo" : undefined,
		"/T€AMS/$Foo" : undefined,
		"/T€AMS/Team_Id" : oTeamData.Team_Id,
		"/T€AMS/TEAM_2_EMPLOYEES" : oTeamData.TEAM_2_EMPLOYEES,
		"/T€AMS/TEAM_2_EMPLOYEES/AGE" : oWorkerData.AGE,
		// scope lookup, then implicit $Type insertion!
		"/$$Term/AGE" : oWorkerData.AGE,
		// "17.2 SimpleIdentifier": lookup inside current schema child ----------------------------
		"/T€AMS" : oContainerData["T€AMS"],
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/." : oWorkerData,
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/$Type" : "tea_busi.Worker",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE" : oWorkerData.AGE,
		// "14.5.12 Expression edm:Path"
		// Note: An edm:Path cannot address annotations at a structural property!
		// Annotations at a navigation property can be addressed like "EMPLOYEE_2_TEAM@empty".
		// "EMPLOYEE_2_TEAM/@empty" addresses an annotation at the target type.
		//TODO Do we want to be consequent with this?
		//     "T€AMS/@UI.LineItem" vs. "T€AMS@empty", no explicit $Type needed?
		//     "Address@foo" vs. "Address/@foo", no explicit $Type needed?
		//     For the path/context split, we need to undo the implicit "/" at times! How?
		"/T€AMS/$Type/@UI.LineItem/0/Value/$Path/@empty"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@empty"],
		"/EMPLOYEES/$Type/@UI.LineItem/0/Value/$Path/@empty"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@empty"],
		// "14.5.2 Expression edm:AnnotationPath"
//TODO		"/EMPLOYEES/$Type/@UI.Facets/0/Target/$AnnotationPath/." // incl. term cast!
//			: mScope["tea_busi."].$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
		// placeholder "." ------------------------------------------------------------------------
		"/." : oContainerData,
		"/T€AMS/$Type/." : oTeamData,
		"/T€AMS/." : oTeamData,
		// @sapui.name ----------------------------------------------------------------------------
		"/./@sapui.name" : "tea_busi.DefaultContainer",
		"/tea_busi.DefaultContainer/@sapui.name" : "tea_busi.DefaultContainer",
		"/tea_busi.DefaultContainer/./@sapui.name" : "tea_busi.DefaultContainer",
		"/T€AMS/@sapui.name" : "T€AMS",
		"/T€AMS/./@sapui.name" : "tea_busi.TEAM",
		"/T€AMS/Team_Id/@sapui.name" : "Team_Id",
		"/T€AMS/TEAM_2_EMPLOYEES/@sapui.name" : "TEAM_2_EMPLOYEES",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/./@sapui.name" : "tea_busi.Worker",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE/@sapui.name" : "AGE",
		"/T€AMS/@empty/@sapui.name" : "@empty",
		"/T€AMS/@/@empty/@sapui.name" : "@empty",
		"/T€AMS/$Type/@UI.LineItem/0/@UI.Importance/@sapui.name" : "@UI.Importance",
		// annotations ----------------------------------------------------------------------------
		"/$EntityContainer/@empty"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer"]["@empty"],
		"/tea_busi.Worker/@missing" : undefined,
		"/tea_busi.Worker/@/@missing" : undefined,
		"/T€AMS/$Type/./@UI.LineItem" : oTeamLineItem,
		"/T€AMS/$Type/@UI.LineItem" : oTeamLineItem,
		"/T€AMS/$Type/@UI.LineItem/0/Label" : oTeamLineItem[0].Label,
		"/T€AMS/$Type/@UI.LineItem/0/@UI.Importance" : oTeamLineItem[0]["@UI.Importance"],
		"/T€AMS/@empty"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer/T€AMS"]["@empty"],
		"/T€AMS/Team_Id/@Common.Text"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		"/T€AMS/Team_Id/@Common.Text@UI.TextArrangement"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]
				["@Common.Text@UI.TextArrangement"],
		"/tea_busi./@empty" : mScope["tea_busi."]["@empty"],
		// "@" to access to all annotations, e.g. for iteration
		"/T€AMS/Team_Id/@" : mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]
	}, function (sPath, sContextPath, sMetaPath, vResult) {
		QUnit.test("fetchObject: " + sPath, function (assert) {
			var oContext = sContextPath && this.oMetaModel.getContext(sContextPath),
				oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			oSyncPromise = this.oMetaModel.fetchObject(sMetaPath, oContext);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), vResult);
		});
	});
	//TODO special cases where inline and external targeting annotations need to be merged!
	//TODO $AnnotationPath that refers to annotation at nav.property: "EMPLOYEE_2_TEAM@empty"
	//TODO support also external targeting from a different schema!
	//TODO MySchema.MyFunction/MyParameter --> requires search in array?!
	//TODO $count?
	//TODO this.oList => getObject/getProperty MUST also accept object instead of context!
	//TODO "For annotations targeting a property of an entity type or complex type, the path
	// expression is evaluated starting at the outermost entity type or complex type named in the
	// Target of the enclosing edm:Annotations element, i.e. an empty path resolves to the
	// outermost type, and the first segment of a non-empty path MUST be a property or navigation
	// property of the outermost type, a type cast, or a term cast." --> consequences for us?

	//*********************************************************************************************
	QUnit.test("fetchObject: Invalid relative path w/o context", function (assert) {
		var sMetaPath = "some/relative/path",
			oSyncPromise;

		this.oLogMock.expects("error").withExactArgs("Invalid relative path w/o context", sMetaPath,
			"sap.ui.model.odata.v4.ODataMetaModel");

		oSyncPromise = this.oMetaModel.fetchObject(sMetaPath, null);

		assert.strictEqual(oSyncPromise.isFulfilled(), true);
		assert.strictEqual(oSyncPromise.getResult(), null);
	});

	//*********************************************************************************************
	["/empty.Container/@", "/T€AMS/Name/@"].forEach(function (sPath) {
		QUnit.test("fetchObject returns {} (anonymous empty object): " + sPath, function (assert) {
			var oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			oSyncPromise = this.oMetaModel.fetchObject(sPath);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.deepEqual(oSyncPromise.getResult(), {}); // strictEqual would not work!
		});
	});
	//TODO if there are no annotations for an external target, avoid {} unless "@" is used?

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		forEach({
			"/$$Loop/." : "Invalid recursion at /$$Loop",
			// Invalid segment --------------------------------------------------------------------
			"//." : "Invalid empty segment",
			"/$Foo/." : "Invalid segment: .",
			"/$Foo/@bar" : "Invalid segment: @bar",
			"/$Foo/$Bar" : "Invalid segment: $Bar",
			"/$Foo/$Bar/$Baz" : "Invalid segment: $Bar",
			"/$EntityContainer/T€AMS/Team_Id/$MaxLength/." : "Invalid segment: .",
			"/$EntityContainer/T€AMS/Team_Id/$Nullable/." : "Invalid segment: .",
			"/tea_busi./$Annotations" : "Invalid segment: $Annotations", // entrance forbidden!
			// Unknown ... ------------------------------------------------------------------------
			"/name.space.not.Found" :
				"Unknown qualified name 'name.space.not.Found'",
			"/Foo" : "Unknown child 'Foo' of 'tea_busi.DefaultContainer'",
			"/$EntityContainer/Foo" : "Unknown child 'Foo' of 'tea_busi.DefaultContainer'",
			"/tea_busi.DefaultContainer/Foo" : "Unknown child 'Foo' of 'tea_busi.DefaultContainer'",
			"/$EntityContainer|$kind/Foo" : "Unknown child 'EntityContainer'"
				+ " of 'tea_busi.DefaultContainer' at /$EntityContainer/$kind",
			// implicit $Type insertion
			"/name.space.Broken/Foo" :
				"Unknown qualified name 'not.Found' at /name.space.Broken/$Type",
			// implicit scope lookup
			"/name.space.Broken/$Type/Foo" :
				"Unknown qualified name 'not.Found' at /name.space.Broken/$Type",
			// Unsupported path before @sapui.name ------------------------------------------------
			"/@sapui.name" : "Unsupported path before @sapui.name",
			"/@sapui.name/foo" : "Unsupported path before @sapui.name", // one warning is enough
			"/$Foo/@sapui.name" : "Unsupported path before @sapui.name", // not "Invalid segment: "
			// no @sapui.name for technical properties or inside "JSON" mode:
			"/tea_busi.DefaultContainer/$kind/@sapui.name" : "Unsupported path before @sapui.name",
			"/tea_busi.TEAM/$Key/not.Found/@sapui.name" : "Unsupported path before @sapui.name",
			"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/@sapui.name"
				: "Unsupported path before @sapui.name",
			// Unsupported path after @sapui.name -------------------------------------------------
			"/$EntityContainer/T€AMS/@sapui.name/foo" : "Unsupported path after @sapui.name",
			// Unsupported path before @... -------------------------------------------------------
			"/@bar" : "Unsupported path before @bar"
		}, function (sPath, sContextPath, sMetaPath, sWarning) {
			QUnit.test("fetchObject fails: " + sPath + ", warn = " + bWarn, function (assert) {
				var oContext = sContextPath && this.oMetaModel.getContext(sContextPath),
					oSyncPromise;

				this.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(SyncPromise.resolve(mScope));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING).returns(bWarn);
				this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0)
					.withExactArgs(sWarning, sPath, "sap.ui.model.odata.v4.ODataMetaModel");

				oSyncPromise = this.oMetaModel.fetchObject(sMetaPath, oContext);

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
//		facets : [{Name : "Precision", Value : "7"}]
//		constraints : {precision : 7} //TODO implement
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
		entityType : "tea_busi.TEAM"
	}, {
		dataPath : "/T€AMS[0];bar=42/TEAM_2_EMPLOYEES/1",
		canonicalUrl : "/~/EMPLOYEES(...)",
		entityType : "tea_busi.Worker"
	}, {
		dataPath : "/T€AMS[0];bar=42/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM",
		canonicalUrl : "/~/T%E2%82%ACAMS(...)",
		entityType : "tea_busi.TEAM"
	}].forEach(function (oFixture) {
		QUnit.test("requestCanonicalUrl: " + oFixture.dataPath, function (assert) {
			var oInstance = {};

			function read(sPath, bAllowObjectAccess) {
				assert.strictEqual(sPath, oFixture.dataPath);
				assert.strictEqual(bAllowObjectAccess, true);
				return Promise.resolve(oInstance);
			}

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));
			this.oSandbox.stub(Helper, "getKeyPredicate", function (oEntityType0, oInstance0) {
				assert.strictEqual(oEntityType0, mScope[oFixture.entityType]);
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
				.returns(SyncPromise.resolve(mScope));
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
	QUnit.test("getProperty = getObject", function (assert) {
		assert.strictEqual(this.oMetaModel.getProperty, this.oMetaModel.getObject);
	});

	//*********************************************************************************************
	QUnit.test("bindProperty", function (assert) {
		var oBinding,
			oContext = {},
			sPath = "foo",
			oValue = {};

		this.mock(this.oMetaModel).expects("getProperty").withExactArgs(sPath, oContext)
			.returns(oValue);

		oBinding = this.oMetaModel.bindProperty(sPath, oContext);

		assert.ok(oBinding instanceof PropertyBinding);
		assert.strictEqual(oBinding.getModel(), this.oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getValue(), oValue);
	});

	//*********************************************************************************************
	["ENTRYDATE", "/EMPLOYEES/ENTRYDATE"].forEach(function (sPath) {
		QUnit.test("bindContext: " + sPath, function (assert) {
			var bAbsolutePath = sPath[0] === "/",
				oBinding,
				oBoundContext,
				iChangeCount = 0,
				oContext = this.oMetaModel.getMetaContext("/EMPLOYEES"),
				oContextCopy = this.oMetaModel.getMetaContext("/EMPLOYEES"),
				oNewContext = this.oMetaModel.getMetaContext("/T€AMS");

			oBinding = this.oMetaModel.bindContext(sPath, oContextCopy);

			assert.ok(oBinding instanceof ContextBinding);
			assert.strictEqual(oBinding.getModel(), this.oMetaModel);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContextCopy);

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
		oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters);

		assert.ok(oBinding instanceof JSONListBinding);
		//TODO improve performance by not extending JSONListBinding?
		// - update() makes a shallow copy of this.oList, avoid?!
		// - checkUpdate() calls _getObject() twice; uses jQuery.sap.equal(); avoid?!
		assert.strictEqual(oBinding.getModel(), oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.aSorters, aSorters);
		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.aIndices, aIndices);
		assert.strictEqual(oBinding.iLength, oBinding.aIndices.length);

		assert.raises(function () {
			oBinding.enableExtendedChangeDetection();
		}, new Error("Unsupported operation"));

		assert.deepEqual(oBinding.getCurrentContexts().map(function (oContext) {
			assert.strictEqual(oContext.getModel(), oMetaModel);
			return oContext.getPath();
		}), [ // see aIndices
			"/EMPLOYEES/ID",
			"/EMPLOYEES/AGE"
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
		// Implicit $Type insertion happens here!
		//TODO support for $BaseType
		contextPath : "/EMPLOYEES",
		metaPath : "",
		pathDot : ".",
		result : {
			"ID" : oWorkerData.ID,
			"AGE" : oWorkerData.AGE,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM
		}
	}, {
		// <template:repeat list="{meta>EMPLOYEES}" ...>
		// same as before, but with non-empty path
		contextPath : "/",
		metaPath : "EMPLOYEES",
		pathDot : "EMPLOYEES/.",
		result : {
			"ID" : oWorkerData.ID,
			"AGE" : oWorkerData.AGE,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM
		}
	}, {
		// <template:repeat list="{meta>/}" ...>
		// Iterate all OData path segments, i.e. entity sets.
		// Implicit scope lookup happens here!
		metaPath : "/",
		pathDot : "/.",
		result : {
			"EMPLOYEES" : oContainerData.EMPLOYEES,
			"T€AMS" : oContainerData["T€AMS"]
		}
	}, {
		// <template:repeat list="{property>@}" ...>
		// Iterate all external targeting annotations.
		contextPath : "/T€AMS/Team_Id",
		metaPath : "@",
		result : mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"],
		strict : true
	}, {
		// <template:repeat list="{property>@}" ...>
		// Iterate all external targeting annotations.
		contextPath : "/T€AMS/Name",
		metaPath : "@",
		result : {}
	}, {
		// <template:repeat list="{field>@}" ...>
		// Iterate all inline annotations.
		contextPath : "/T€AMS/$Type/@UI.LineItem/0",
		metaPath : "@",
		result : {
			"@UI.Importance" : oTeamLineItem[0]["@UI.Importance"]
		}
	}, {
		// <template:repeat list="{at>}" ...>
		// Iterate all inline annotations (edge case with empty relative path).
		contextPath : "/T€AMS/$Type/@UI.LineItem/0/@",
		metaPath : "",
		result : {
			"@UI.Importance" : oTeamLineItem[0]["@UI.Importance"]
		}
	}].forEach(function (oFixture) {
		var sResolvedPath = oFixture.contextPath
			? oFixture.contextPath + " / "/*make cut more visible*/ + oFixture.metaPath
			: oFixture.metaPath;

		QUnit.test("_getObject: " + sResolvedPath, function (assert) {
			var oContext = oFixture.contextPath && this.oMetaModel.getContext(oFixture.contextPath),
				fnGetObjectSpy = this.spy(this.oMetaModel, "getObject"),
				oMetadataClone = JSON.parse(JSON.stringify(mScope)),
				oObject,
				sPathDot = oFixture.pathDot || oFixture.metaPath;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			// code under test
			oObject = this.oMetaModel._getObject(oFixture.metaPath, oContext);

			assert.strictEqual(fnGetObjectSpy.callCount, 1);
			assert.ok(fnGetObjectSpy.alwaysCalledWithExactly(sPathDot, oContext),
				fnGetObjectSpy.printf("%C"));
			if (oFixture.strict) {
				assert.strictEqual(oObject, oFixture.result);
			} else {
				assert.deepEqual(oObject, oFixture.result);
			}
			assert.deepEqual(mScope, oMetadataClone, "meta data unchanged");
		});
	});
	//TODO iterate mix of inline and external targeting annotations
	//TODO iterate annotations like "foo@..." for our special cases, e.g. annotations of annotation
	//TODO avoid additional "." in case metaPath already contains one? hard to check...
	//TODO Avoid copies of objects? Makes sense only after we get rid of JSONListBinding which
	// makes copies itself. If we get rid of it, we might become smarter in updateIndices and
	// learn from the path which collection to iterate: sPath = "", "$", or "@", oContext holds
	// the resolved path. Could we support setContext() then?
});
//TODO getContext vs. createBindingContext; map of "singletons" vs. memory leak