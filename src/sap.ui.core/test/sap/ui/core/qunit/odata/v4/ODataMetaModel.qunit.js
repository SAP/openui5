/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
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
], function (jQuery, BindingMode, ContextBinding, FilterProcessor, JSONListBinding, MetaModel,
		_ODataHelper, SyncPromise, ODataMetaModel, ODataModel, PropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mScope = {
			"$EntityContainer" : "tea_busi.DefaultContainer",
			"empty." : {
				"$kind" : "Schema"
			},
			"name.space." : {
				"$kind" : "Schema",
				"$Annotations" : {
					"name.space.Id" : {
						// Common := com.sap.vocabularies.Common.v1
						"@Common.Label" : "ID"
					}
				}
			},
			// tea_busi := com.sap.gateway.iwbep.tea_busi.v0001
			"tea_busi." : {
				"$kind" : "Schema",
				"$Annotations" : {
					"tea_busi.DefaultContainer" : {
						"@DefaultContainer" : {}
					},
					"tea_busi.DefaultContainer/T€AMS" : {
						"@T€AMS" : {}
					},
					"tea_busi.TEAM" : {
						// UI := com.sap.vocabularies.UI.v1
						"@UI.LineItem" : [{
							"@UI.Importance" : {
								"$EnumMember" : "UI.ImportanceType/High"
							},
							"$Type" : "UI.DataField",
							"Label" : "Team ID",
							"Value" : {
								"$Path" : "Team_Id"
							}
						}]
					},
					"tea_busi.TEAM/Team_Id" : {
						"@Common.Label" : "Team ID",
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
							"Target" : {
								// term cast
								"$AnnotationPath" : "@UI.LineItem"
							}
						}, {
							"$Type" : "UI.ReferenceFacet",
							"Target" : {
								// term cast at navigation property itself
								"$AnnotationPath" : "EMPLOYEE_2_TEAM@Common.Label"
							}
						}, {
							"$Type" : "UI.ReferenceFacet",
							"Target" : {
								// navigation property and term cast
								"$AnnotationPath" : "EMPLOYEE_2_TEAM/@UI.LineItem"
							}
						}, {
							"$Type" : "UI.ReferenceFacet",
							"Target" : {
								// type cast, navigation properties and term cast (at its type)
								"$AnnotationPath"
									: "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem"
							}
						}],
						"@UI.LineItem" : [{
							"$Type" : "UI.DataField",
							"Label" : "Team ID",
							"Value" : {
								"$Path" : "EMPLOYEE_2_TEAM/Team_Id"
							}
						}]
					},
					"tea_busi.Worker/EMPLOYEE_2_TEAM" : {
						"@Common.Label" : "Employee's Team"
					}
				},
				"@Schema" : {}
			},
			"empty.Container" : {
				"$kind" : "EntityContainer"
			},
			"name.space.BadContainer" : {
				"$kind" : "EntityContainer",
				"DanglingActionImport" : {
					"$kind" : "ActionImport",
					"$Action" : "not.Found"
				},
				"DanglingFunctionImport" : {
					"$kind" : "FunctionImport",
					"$Function" : "not.Found"
				}
			},
			"name.space.Broken" : {
				"$kind" : "Term",
				"$Type" : "not.Found"
			},
			"name.space.BrokenFunction" : [{
				"$kind" : "Function",
				"$ReturnType" : {
					"$Type" : "not.Found"
				}
			}],
			"name.space.DerivedPrimitiveFunction" : [{
				"$kind" : "Function",
				"$ReturnType" : {
					"$Type" : "name.space.Id"
				}
			}],
			"name.space.EmptyOverloads" : [],
			"name.space.Id" : {
				"$kind" : "TypeDefinition",
				"$UnderlyingType" : "Edm.String",
				"$MaxLength" : 10
			},
			"name.space.Term" : { // only case with a qualified name and a $Type
				"$kind" : "Term",
				"$Type" : "tea_busi.Worker"
			},
			"name.space.OverloadedAction" : [{
				"$kind" : "Action"
			}, {
				"$kind" : "Action"
			}],
			"name.space.OverloadedFunction" : [{
				"$kind" : "Function",
				"$ReturnType" : {
					"$Type" : "Edm.String"
				}
			}, {
				"$kind" : "Function",
				"$ReturnType" : {
					"$Type" : "Edm.String"
				}
			}],
			"name.space.VoidAction" : [{
				"$kind" : "Action"
			}],
			"tea_busi.AcChangeManagerOfTeam" : [{
				"$kind" : "Action",
				"$ReturnType" : {
					"$Type" : "tea_busi.TEAM"
				}
			}],
			"tea_busi.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"ChangeManagerOfTeam" : {
					"$kind" : "ActionImport",
					"$Action" : "tea_busi.AcChangeManagerOfTeam"
				},
				"EMPLOYEES" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "T€AMS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"GetEmployeeMaxAge" : {
					"$kind" : "FunctionImport",
					"$Function" : "tea_busi.FuGetEmployeeMaxAge"
				},
				"T€AMS" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "tea_busi.TEAM"
				}
			},
			"tea_busi.FuGetEmployeeMaxAge" : [{
				"$kind" : "Function",
				"$ReturnType" : {
					"$Type" : "Edm.Int16"
				}
			}],
			"tea_busi.TEAM" : {
				"$kind" : "EntityType",
				"$Key" : ["Team_Id"],
				"Team_Id" : {
					"$kind" : "Property",
					"$Type" : "name.space.Id",
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
				},
				"value" : {
					"$kind" : "Property",
					"$Type" : "Edm.String"
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
			"$$Loop" : "$$Loop/", // some endless loop
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
			oPromiseMock = oTestContext.oSandbox.mock(Promise),
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
		oPromiseMock.expects("resolve").withExactArgs(oSyncPromise)
			.returns(oRejectedPromise); // return any promise (this is not unwrapping!)

		// request (promise still pending!)
		assert.strictEqual(oMetaModel[sRequestMethodName].apply(oMetaModel, aArguments),
			oRejectedPromise);

		// restore early so that JS coding executed from Selenium Webdriver does not cause
		// unexpected calls on the mock when it uses Promise.resolve and runs before automatic
		// mock reset in afterEach
		oPromiseMock.restore();

		// get: pending
		if (bThrow) {
			assert.throws(function () {
				oMetaModel[sGetMethodName].apply(oMetaModel, aArguments);
			}, new Error("Result pending"));
		} else {
			assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), undefined,
				"pending");
		}
		return oRejectedPromise.catch(function () {
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
	 * an almost resolved sPath (just '|' replaced by '/').
	 *
	 * @param {object} mFixture
	 *   map<string, any>
	 * @param {function} fnTest
	 *   function(string sPath, any vResult, string sContextPath, string sMetaPath)
	 */
	function forEach(mFixture, fnTest) {
		var sPath;

		for (sPath in mFixture) {
			var i = sPath.indexOf("|"),
				sContextPath = "",
				sMetaPath = sPath.slice(i + 1),
				vValue = mFixture[sPath];

			if (i >= 0) {
				sContextPath = sPath.slice(0, i);
				sPath = sContextPath + "/" + sMetaPath;
			}

			fnTest(sPath, vValue, sContextPath, sMetaPath);
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
		assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
		assert.strictEqual(oMetaModel.toString(),
			"sap.ui.model.odata.v4.ODataMetaModel: /~/$metadata");
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oMetaModel = new ODataMetaModel();

		assert.throws(function () { //TODO implement
			oMetaModel.bindTree();
		}, new Error("Unsupported operation: v4.ODataMetaModel#bindTree"));

		assert.throws(function () {
			oMetaModel.getOriginalProperty();
		}, new Error("Unsupported operation: v4.ODataMetaModel#getOriginalProperty"));

		assert.throws(function () { //TODO implement
			oMetaModel.isList();
		}, new Error("Unsupported operation: v4.ODataMetaModel#isList"));

		assert.throws(function () {
			oMetaModel.refresh();
		}, new Error("Unsupported operation: v4.ODataMetaModel#refresh"));

		assert.throws(function () {
			oMetaModel.setLegacySyntax(); // argument does not matter!
		}, new Error("Unsupported operation: v4.ODataMetaModel#setLegacySyntax"));

		assert.throws(function () {
			oMetaModel.setDefaultBindingMode(BindingMode.OneWay);
		});
		assert.throws(function () {
			oMetaModel.setDefaultBindingMode(BindingMode.TwoWay);
		});
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

		this.oSandbox.mock(oMetadataRequestor).expects("read").withExactArgs(sUrl)
			.returns(oPromise);

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
	}, { // any segment with digits only
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
		// absolute path
		"/" : "/",
		"/foo/bar|/" : "/", // context is ignored
		// relative path
		"" : undefined, // w/o context --> important for MetaModel#createBindingContext etc.
		"|foo/bar" : undefined, // w/o context
		"/|" : "/",
		"/|foo/bar" : "/foo/bar",
		"/foo|bar" : "/foo/bar",
		"/foo/bar|" : "/foo/bar",
		"/foo/|bar" : "/foo/bar",
		// trailing slash is preserved
		"/foo/bar/" : "/foo/bar/",
		"/foo|bar/" : "/foo/bar/",
		// relative path that starts with a dot
		"/foo/bar|./" : "/foo/bar/",
		"/foo|./bar/" : "/foo/bar/",
		"/foo/|./bar/" : "/foo/bar/",
		// annotations
		"/foo|@bar" : "/foo@bar",
		"/foo/|@bar" : "/foo/@bar",
		"/foo|./@bar" : "/foo/@bar",
		"/foo/|./@bar" : "/foo/@bar",
		// technical properties
		"/foo|$kind" : "/foo/$kind",
		"/foo/|$kind" : "/foo/$kind",
		"/foo|./$kind" : "/foo/$kind",
		"/foo/|./$kind" : "/foo/$kind"
	}, function (sPath, sResolvedPath, sContextPath, sMetaPath) {
		QUnit.test("resolve: " + sContextPath + " > " + sMetaPath, function (assert) {
			var oContext = sContextPath && this.oMetaModel.getContext(sContextPath);

			assert.strictEqual(this.oMetaModel.resolve(sMetaPath, oContext), sResolvedPath);
		});
	});
	//TODO make sure that Context objects are only created for absolute paths?!

	//*********************************************************************************************
	[".bar", ".@bar", ".$kind"].forEach(function (sPath) {
		QUnit.test("resolve: unsupported relative path " + sPath, function (assert) {
			var oContext = this.oMetaModel.getContext("/foo");

			assert.raises(function () {
				this.oMetaModel.resolve(sPath, oContext);
			}, new Error("Unsupported relative path: " + sPath));
		});
	});

	//*********************************************************************************************
	//TODO better map meta model path to pure JSON path (look up inside JsonModel)?
	// what about @sapui.name then, which requires a literal as expected result?
	forEach({
		// "JSON" drill-down ----------------------------------------------------------------------
		"/$EntityContainer" : "tea_busi.DefaultContainer",
		"/tea_busi./$kind" : "Schema",
		"/tea_busi.DefaultContainer/$kind" : "EntityContainer",
		// trailing slash: object vs. name --------------------------------------------------------
		"/" : oContainerData,
		"/$EntityContainer/" : oContainerData,
		"/T€AMS/" : oTeamData,
		"/T€AMS/$Type/" : oTeamData,
		// scope lookup ("17.3 QualifiedName") ----------------------------------------------------
		"/$EntityContainer/$kind" : "EntityContainer",
		"/$EntityContainer/T€AMS/$Type" : "tea_busi.TEAM",
		"/$EntityContainer/T€AMS/$Type/Team_Id" : oTeamData.Team_Id,
		// "17.3 QualifiedName", e.g. type cast ---------------------------------------------------
		"/tea_busi." : mScope["tea_busi."], // access to schema
		"/tea_busi.DefaultContainer/EMPLOYEES/tea_busi.Worker/AGE" : oWorkerData.AGE,
		// implicit $Type insertion ---------------------------------------------------------------
		"/T€AMS/Team_Id" : oTeamData.Team_Id,
		"/T€AMS/TEAM_2_EMPLOYEES" : oTeamData.TEAM_2_EMPLOYEES,
		"/T€AMS/TEAM_2_EMPLOYEES/AGE" : oWorkerData.AGE,
		// scope lookup, then implicit $Type insertion!
		"/$$Term/AGE" : oWorkerData.AGE,
		// "17.2 SimpleIdentifier": lookup inside current schema child ----------------------------
		"/T€AMS" : oContainerData["T€AMS"],
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/" : oWorkerData,
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/$Type" : "tea_busi.Worker",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE" : oWorkerData.AGE,
		// operations -----------------------------------------------------------------------------
		"/ChangeManagerOfTeam/" : oTeamData,
		//TODO mScope[mScope["..."][0].$ReturnType.$Type] is where the next OData simple identifier
		//     would live in case of entity/complex type, but we would like to avoid warnings for
		//     primitive types - how to tell the difference?
//		"/GetEmployeeMaxAge/" : "Edm.Int16",
		// Note: "value" is a symbolic name for the whole return type iff. it is primitive
		"/GetEmployeeMaxAge/value" : mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
		"/GetEmployeeMaxAge/value/$Type" : "Edm.Int16", // path may continue!
		"/tea_busi.FuGetEmployeeMaxAge/value"
			: mScope["tea_busi.FuGetEmployeeMaxAge"][0].$ReturnType,
		"/name.space.DerivedPrimitiveFunction/value"
			: mScope["name.space.DerivedPrimitiveFunction"][0].$ReturnType, //TODO merge facets of return type and type definition?!
		"/ChangeManagerOfTeam/value" : oTeamData.value,
		"/tea_busi.AcChangeManagerOfTeam/value" : oTeamData.value,
		// annotations ----------------------------------------------------------------------------
		"/@DefaultContainer"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/tea_busi.DefaultContainer@DefaultContainer"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/$EntityContainer@DefaultContainer"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/$EntityContainer/@DefaultContainer" // Note: w/o $Type, slash makes no difference!
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/T€AMS/$Type/@UI.LineItem" : oTeamLineItem,
		"/T€AMS/@UI.LineItem" : oTeamLineItem,
		"/T€AMS/@UI.LineItem/0/Label" : oTeamLineItem[0].Label,
		"/T€AMS/@UI.LineItem/0/@UI.Importance" : oTeamLineItem[0]["@UI.Importance"],
		"/T€AMS@T€AMS"
			: mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer/T€AMS"]["@T€AMS"],
		"/T€AMS/Team_Id@Common.Text"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		"/T€AMS/Team_Id@Common.Text@UI.TextArrangement"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]
				["@Common.Text@UI.TextArrangement"],
		"/tea_busi./@Schema" : mScope["tea_busi."]["@Schema"],
		// "@" to access to all annotations, e.g. for iteration
		"/T€AMS@" : mScope["tea_busi."].$Annotations["tea_busi.DefaultContainer/T€AMS"],
		"/T€AMS/@" : mScope["tea_busi."].$Annotations["tea_busi.TEAM"],
		"/T€AMS/Team_Id@" : mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"],
		// "14.5.12 Expression edm:Path"
		"/T€AMS/@UI.LineItem/0/Value/$Path@Common.Text"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		"/T€AMS/@UI.LineItem/0/Value/$Path/@Common.Label"
			: mScope["name.space."].$Annotations["name.space.Id"]["@Common.Label"],
		"/EMPLOYEES/@UI.LineItem/0/Value/$Path@Common.Text"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		// "14.5.2 Expression edm:AnnotationPath"
		"/EMPLOYEES/@UI.Facets/0/Target/$AnnotationPath/"
			: mScope["tea_busi."].$Annotations["tea_busi.Worker"]["@UI.LineItem"],
		"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/"
			: mScope["tea_busi."].$Annotations["tea_busi.Worker/EMPLOYEE_2_TEAM"]["@Common.Label"],
		"/EMPLOYEES/@UI.Facets/2/Target/$AnnotationPath/"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
		"/EMPLOYEES/@UI.Facets/3/Target/$AnnotationPath/"
			: mScope["tea_busi."].$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
		// @sapui.name ----------------------------------------------------------------------------
		"/@sapui.name" : "tea_busi.DefaultContainer",
		"/tea_busi.DefaultContainer@sapui.name" : "tea_busi.DefaultContainer",
		"/tea_busi.DefaultContainer/@sapui.name" : "tea_busi.DefaultContainer", // no $Type here!
		"/$EntityContainer/@sapui.name" : "tea_busi.DefaultContainer",
		"/T€AMS@sapui.name" : "T€AMS",
		"/T€AMS/@sapui.name" : "tea_busi.TEAM",
		"/T€AMS/Team_Id@sapui.name" : "Team_Id",
		"/T€AMS/TEAM_2_EMPLOYEES@sapui.name" : "TEAM_2_EMPLOYEES",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/@sapui.name" : "tea_busi.Worker",
		"/T€AMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/AGE@sapui.name" : "AGE",
		"/T€AMS@T€AMS@sapui.name" : "@T€AMS",
		"/T€AMS@/@T€AMS@sapui.name" : "@T€AMS",
		"/T€AMS@T€AMS/@sapui.name" : "@T€AMS", // no $Type inside @T€AMS, / makes no difference!
		"/T€AMS@/@T€AMS/@sapui.name" : "@T€AMS", // dito
		"/T€AMS/@UI.LineItem/0/@UI.Importance/@sapui.name" : "@UI.Importance", // in "JSON" mode
		"/T€AMS/Team_Id@/@Common.Label@sapui.name" : "@Common.Label" // avoid indirection here!
	}, function (sPath, vResult) {
		QUnit.test("fetchObject: " + sPath, function (assert) {
			var oSyncPromise;

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			oSyncPromise = this.oMetaModel.fetchObject(sPath);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), vResult);
			// self-guard to avoid that a complex right-hand side evaluates to undefined
			assert.notStrictEqual(vResult, undefined, "use this test for defined results only!");
		});
	});
	//TODO annotations at enum member ".../<10.2.1 Member Name>@..." (Note: "<10.2.2 Member Value>"
	// might be a string! Avoid indirection!)
	//TODO special cases where inline and external targeting annotations need to be merged!
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
	[
		// "JSON" drill-down ----------------------------------------------------------------------
		"/$missing",
		"/tea_busi.DefaultContainer/$missing",
		"/tea_busi.DefaultContainer/missing", // "17.2 SimpleIdentifier" treated like any property
		"/tea_busi.FuGetEmployeeMaxAge/0/tea_busi.FuGetEmployeeMaxAge", // "0" switches to JSON
		"/tea_busi.TEAM/$Key/this.is.missing",
		"/tea_busi.Worker/missing", // entity container (see above) treated like any schema child
		// scope lookup ("17.3 QualifiedName") ----------------------------------------------------
		"/$EntityContainer/$missing",
		"/$EntityContainer/missing",
		// implicit $Type insertion ---------------------------------------------------------------
		"/T€AMS/$Key", // avoid $Type insertion for following $ segments
		"/T€AMS/missing",
		"/T€AMS/$missing",
		// annotations ----------------------------------------------------------------------------
		"/tea_busi.Worker@missing",
		"/tea_busi.Worker/@missing",
		// "@" to access to all annotations, e.g. for iteration
		"/tea_busi.Worker/@/@missing",
		// operations -----------------------------------------------------------------------------
		"/name.space.VoidAction/"
	].forEach(function (sPath) {
		QUnit.test("fetchObject: " + sPath + " --> undefined", function (assert) {
			var oSyncPromise;

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			oSyncPromise = this.oMetaModel.fetchObject(sPath);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), undefined);
		});
	});

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
	["/empty.Container/@", "/T€AMS/Name@"].forEach(function (sPath) {
		QUnit.test("fetchObject returns {} (anonymous empty object): " + sPath, function (assert) {
			var oSyncPromise;

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
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
			"/$$Loop/" : "Invalid recursion at /$$Loop",
			// Invalid segment (warning) ----------------------------------------------------------
			"//$Foo" : "Invalid empty segment",
			"/tea_busi./$Annotations" : "Invalid segment: $Annotations", // entrance forbidden!
			// Unknown ... ------------------------------------------------------------------------
			"/not.Found" : "Unknown qualified name 'not.Found'",
			"/not.Found@missing" : "Unknown qualified name 'not.Found'",
			"/." : "Unknown child '.' of 'tea_busi.DefaultContainer'",
			"/Foo" : "Unknown child 'Foo' of 'tea_busi.DefaultContainer'",
			"/$EntityContainer/$kind/" : "Unknown child 'EntityContainer'"
				+ " of 'tea_busi.DefaultContainer' at /$EntityContainer/$kind",
			// implicit $Action, $Function, $Type insertion
			"/name.space.BadContainer/DanglingActionImport/" : "Unknown qualified name 'not.Found'"
				+ " at /name.space.BadContainer/DanglingActionImport/$Action",
			"/name.space.BadContainer/DanglingFunctionImport/" :
				"Unknown qualified name 'not.Found'"
				+ " at /name.space.BadContainer/DanglingFunctionImport/$Function",
			"/name.space.Broken/" :
				"Unknown qualified name 'not.Found' at /name.space.Broken/$Type",
			"/name.space.BrokenFunction/" : "Unknown qualified name 'not.Found'"
				+ " at /name.space.BrokenFunction/0/$ReturnType/$Type",
			//TODO align with "/GetEmployeeMaxAge/" : "Edm.Int16"
			"/GetEmployeeMaxAge/@sapui.name" : "Unknown qualified name 'Edm.Int16'"
				+ " at /tea_busi.FuGetEmployeeMaxAge/0/$ReturnType/$Type",
			"/GetEmployeeMaxAge/value/@sapui.name" : "Unknown qualified name 'Edm.Int16'"
				+ " at /tea_busi.FuGetEmployeeMaxAge/0/$ReturnType/$Type",
			// implicit scope lookup
			"/name.space.Broken/$Type/" :
				"Unknown qualified name 'not.Found' at /name.space.Broken/$Type",
			"/tea_busi.DefaultContainer/$kind/@sapui.name" : "Unknown child 'EntityContainer'"
				+ " of 'tea_busi.DefaultContainer' at /tea_busi.DefaultContainer/$kind",
			// Unsupported path before @sapui.name ------------------------------------------------
			"/$EntityContainer@sapui.name" : "Unsupported path before @sapui.name",
			"/tea_busi.FuGetEmployeeMaxAge/0@sapui.name" : "Unsupported path before @sapui.name",
			"/tea_busi.TEAM/$Key/not.Found/@sapui.name" : "Unsupported path before @sapui.name",
			"/GetEmployeeMaxAge/value@sapui.name" : "Unsupported path before @sapui.name",
			// Unsupported path after @sapui.name -------------------------------------------------
			"/@sapui.name/foo" : "Unsupported path after @sapui.name",
			"/$EntityContainer/T€AMS/@sapui.name/foo" : "Unsupported path after @sapui.name",
			// Unsupported overloads --------------------------------------------------------------
			"/name.space.EmptyOverloads/" : "Unsupported overloads",
			"/name.space.OverloadedAction/" : "Unsupported overloads",
			"/name.space.OverloadedFunction/" : "Unsupported overloads"
		}, function (sPath, sWarning) {
			QUnit.test("fetchObject fails: " + sPath + ", warn = " + bWarn, function (assert) {
				var oSyncPromise;

				this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(SyncPromise.resolve(mScope));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING).returns(bWarn);
				this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0)
					.withExactArgs(sWarning, sPath, "sap.ui.model.odata.v4.ODataMetaModel");

				oSyncPromise = this.oMetaModel.fetchObject(sPath);

				assert.strictEqual(oSyncPromise.isFulfilled(), true);
				assert.deepEqual(oSyncPromise.getResult(), undefined);
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		forEach({
			// Invalid segment (debug) ------------------------------------------------------------
			"/$Foo/@bar" : "Invalid segment: @bar",
			"/$Foo/$Bar" : "Invalid segment: $Bar",
			"/$Foo/$Bar/$Baz" : "Invalid segment: $Bar",
			"/$EntityContainer/T€AMS/Team_Id/$MaxLength/." : "Invalid segment: .",
			"/$EntityContainer/T€AMS/Team_Id/$Nullable/." : "Invalid segment: .",
			"/$EntityContainer/T€AMS/Team_Id/NotFound/Invalid" : "Invalid segment: Invalid"
		}, function (sPath, sMessage) {
			QUnit.test("fetchObject fails: " + sPath + ", debug = " + bDebug, function (assert) {
				var oSyncPromise;

				this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(SyncPromise.resolve(mScope));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.DEBUG).returns(bDebug);
				this.oLogMock.expects("debug").exactly(bDebug ? 1 : 0)
					.withExactArgs(sMessage, sPath, "sap.ui.model.odata.v4.ODataMetaModel");

				oSyncPromise = this.oMetaModel.fetchObject(sPath);

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
	}, {
		$Type : "Edm.DateTimeOffset"
	},{
		$Precision : 7,
		$Type : "Edm.DateTimeOffset",
		__constraints : {precision : 7}
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
	}, {
		$Type : "Edm.String",
		__constraints : {isDigitSequence : true}
	}, {
		$Type : "Edm.TimeOfDay"
	}, {
		$Precision : 3,
		$Type : "Edm.TimeOfDay",
		__constraints : {precision : 3}
	}].forEach(function (oProperty0) {
		// Note: take care not to modify oProperty0, clone it first!
		[false, true].forEach(function (bNullable) {
			// Note: JSON.parse(JSON.stringify(...)) cannot clone Infinity!
			var oProperty = jQuery.extend(true, {}, oProperty0),
				oConstraints = oProperty.__constraints;

			delete oProperty.__constraints;
			if (!bNullable) {
				oProperty.$Nullable = false;
				oConstraints = oConstraints || {};
				oConstraints.nullable = false;
			}

			QUnit.test("fetchUI5Type: " + JSON.stringify(oProperty), function (assert) {
				var sPath = "/EMPLOYEES/0/ENTRYDATE",
					oMetaContext = this.oMetaModel.getMetaContext(sPath),
					oMetaModelMock = this.oSandbox.mock(this.oMetaModel),
					oType;

				oMetaModelMock.expects("fetchObject").twice()
					.withExactArgs(undefined, oMetaContext)
					.returns(SyncPromise.resolve(oProperty));
				if (oProperty.$Type === "Edm.String") { // simulate annotation for strings
					oMetaModelMock.expects("fetchObject")
						.withExactArgs("@com.sap.vocabularies.Common.v1.IsDigitSequence",
							oMetaContext)
						.returns(SyncPromise.resolve(oConstraints && oConstraints.isDigitSequence));
				}

				oType = this.oMetaModel.fetchUI5Type(sPath).getResult();

				assert.strictEqual(oType.getName(),
					"sap.ui.model.odata.type." + oProperty.$Type.slice(4)/*cut off "Edm."*/);
				assert.deepEqual(oType.oConstraints, oConstraints);
				assert.strictEqual(this.oMetaModel.getUI5Type(sPath), oType, "cached");
			});
		});
	});
	//TODO later: support for facet DefaultValue?

	//*********************************************************************************************
	QUnit.test("fetchUI5Type: collection", function (assert) {
		var sPath = "/EMPLOYEES/0/foo",
			oType;

		this.oSandbox.mock(this.oMetaModel).expects("fetchObject").twice()
			.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
			.returns(SyncPromise.resolve({
				$isCollection : true,
				$Nullable : false, // must not be turned into a constraint for Raw!
				$Type : "Edm.String"
			}));
		this.oLogMock.expects("warning").withExactArgs(
			"Unsupported collection type, using sap.ui.model.odata.type.Raw",
			sPath, "sap.ui.model.odata.v4.ODataMetaModel");

		oType = this.oMetaModel.fetchUI5Type(sPath).getResult();

		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
		assert.strictEqual(this.oMetaModel.getUI5Type(sPath), oType, "cached");
	});

	//*********************************************************************************************
	//TODO make Edm.Duration work with OData V4
	["acme.Type", "Edm.Duration", "Edm.GeographyPoint"].forEach(function (sQualifiedName) {
		QUnit.test("fetchUI5Type: unsupported type " + sQualifiedName, function (assert) {
			var sPath = "/EMPLOYEES/0/foo",
				oType;

			this.oSandbox.mock(this.oMetaModel).expects("fetchObject").twice()
				.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
				.returns(SyncPromise.resolve({
					$Nullable : false, // must not be turned into a constraint for Raw!
					$Type : sQualifiedName
				}));
			this.oLogMock.expects("warning").withExactArgs(
				"Unsupported type '" + sQualifiedName + "', using sap.ui.model.odata.type.Raw",
				sPath, "sap.ui.model.odata.v4.ODataMetaModel");

			oType = this.oMetaModel.fetchUI5Type(sPath).getResult();

			assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Raw");
			assert.strictEqual(this.oMetaModel.getUI5Type(sPath), oType, "cached");
		});
	});

	//*********************************************************************************************
	QUnit.test("getUI5Type, requestUI5Type", function (assert) {
		return checkGetAndRequest(this, assert, "fetchUI5Type", ["sPath"], true);
	});

	//*********************************************************************************************
	[{
		dataPath : "/T€AMS/0",
		canonicalUrl : "/~/T%E2%82%ACAMS(...)",
		entityType : "tea_busi.TEAM"
	}, {
		dataPath : "/T€AMS/0/TEAM_2_EMPLOYEES/1",
		canonicalUrl : "/~/EMPLOYEES(...)",
		entityType : "tea_busi.Worker"
	}, {
		dataPath : "/T€AMS/0/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM",
		canonicalUrl : "/~/T%E2%82%ACAMS(...)",
		entityType : "tea_busi.TEAM"
	}].forEach(function (oFixture) {
		QUnit.test("requestCanonicalUrl: " + oFixture.dataPath, function (assert) {
			var oInstance = {},
				oContext = {
					requestValue : function (sPath) {
						assert.strictEqual(sPath, "");
						return Promise.resolve(oInstance);
					}
				};

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));
			this.oSandbox.stub(_ODataHelper, "getKeyPredicate",
				function (oEntityType0, oInstance0) {
					assert.strictEqual(oEntityType0, mScope[oFixture.entityType]);
					assert.strictEqual(oInstance0, oInstance);
					return "(...)";
				}
			);

			return this.oMetaModel.requestCanonicalUrl("/~/", oFixture.dataPath, oContext)
				.then(function (sCanonicalUrl) {
					assert.strictEqual(sCanonicalUrl, oFixture.canonicalUrl);
				}).catch(function (oError) {
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
		dataPath : "/T€AMS/0/Team_Id",
		message : "Not a navigation property: Team_Id (/T€AMS/0/Team_Id)"
	}, {
		dataPath : "/T€AMS/0/TEAM_2_EMPLOYEES/0/ID",
		message : "Not a navigation property: ID (/T€AMS/0/TEAM_2_EMPLOYEES/0/ID)"
	}].forEach(function (oFixture) {
		QUnit.test("requestCanonicalUrl: error for " + oFixture.dataPath, function (assert) {
			var oContext = {
					requestValue : function (sPath) {
						assert.strictEqual(sPath, "");
						return Promise.resolve({});
					}
				};

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));
			this.oSandbox.mock(_ODataHelper).expects("getKeyPredicate").never();

			return this.oMetaModel.requestCanonicalUrl("/~/", oFixture.dataPath, oContext)
				.then(function (sCanonicalUrl) {
					assert.ok(false, sCanonicalUrl);
				}).catch(function (oError) {
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

		this.oSandbox.mock(this.oMetaModel).expects("getProperty").withExactArgs(sPath, oContext)
			.returns(oValue);

		// code under test
		oBinding = this.oMetaModel.bindProperty(sPath, oContext);

		assert.ok(oBinding instanceof PropertyBinding);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getModel(), this.oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.getValue(), oValue);

		// code under test: must not call getProperty() again!
		assert.strictEqual(oBinding.getExternalValue(), oValue);

		// code under test
		assert.throws(function () {
			oBinding.setExternalValue("foo");
		}, /Unsupported operation: ODataMetaPropertyBinding#setValue/);
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

		this.oSandbox.mock(oMetaModel).expects("_getObject")
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
		this.oSandbox.mock(this.oMetaModel).expects("getProperty")
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
		pathIntoObject : "./",
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
		pathIntoObject : "EMPLOYEES/",
		result : {
			"ID" : oWorkerData.ID,
			"AGE" : oWorkerData.AGE,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM
		}
	}, {
		// <template:repeat list="{meta>/}" ...>
		// Iterate all OData path segments, i.e. entity sets and imports.
		// Implicit scope lookup happens here!
		metaPath : "/",
		result : {
			"ChangeManagerOfTeam" : oContainerData.ChangeManagerOfTeam,
			"EMPLOYEES" : oContainerData.EMPLOYEES,
			"GetEmployeeMaxAge" : oContainerData.GetEmployeeMaxAge,
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
		// <template:repeat list="{field>./@}" ...>
		// Iterate all inline annotations.
		contextPath : "/T€AMS/$Type/@UI.LineItem/0",
		metaPath : "./@",
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
				sPathIntoObject = oFixture.pathIntoObject || oFixture.metaPath;

			this.oSandbox.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(SyncPromise.resolve(mScope));

			// code under test
			oObject = this.oMetaModel._getObject(oFixture.metaPath, oContext);

			assert.strictEqual(fnGetObjectSpy.callCount, 1);
			assert.ok(fnGetObjectSpy.alwaysCalledWithExactly(sPathIntoObject, oContext),
				fnGetObjectSpy.printf("%C"));
			if (oFixture.strict) {
				assert.strictEqual(oObject, oFixture.result);
			} else {
				assert.deepEqual(oObject, oFixture.result);
			}
			assert.deepEqual(mScope, oMetadataClone, "meta data unchanged");
		});

		//*********************************************************************************************
		QUnit.test("events", function (assert) {
			var oMetaModel = new ODataMetaModel();

			assert.throws(function () {
				oMetaModel.attachParseError();
			}, new Error("Unsupported event 'parseError': v4.ODataMetaModel#attachEvent"));

			assert.throws(function () {
				oMetaModel.attachRequestCompleted();
			}, new Error("Unsupported event 'requestCompleted': v4.ODataMetaModel#attachEvent"));

			assert.throws(function () {
				oMetaModel.attachRequestFailed();
			}, new Error("Unsupported event 'requestFailed': v4.ODataMetaModel#attachEvent"));

			assert.throws(function () {
				oMetaModel.attachRequestSent();
			}, new Error("Unsupported event 'requestSent': v4.ODataMetaModel#attachEvent"));
		});
	});
	//TODO iterate mix of inline and external targeting annotations
	//TODO iterate annotations like "foo@..." for our special cases, e.g. annotations of annotation
	//TODO Avoid copies of objects? Makes sense only after we get rid of JSONListBinding which
	// makes copies itself. If we get rid of it, we might become smarter in updateIndices and
	// learn from the path which collection to iterate: sPath = "", "$", or "@", oContext holds
	// the resolved path. Could we support setContext() then?
});
//TODO getContext vs. createBindingContext; map of "singletons" vs. memory leak