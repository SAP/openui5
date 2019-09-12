/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, BindingMode, BaseContext, ContextBinding, FilterProcessor, JSONListBinding,
		MetaModel, _ODataHelper, AnnotationHelper, Context, _SyncPromise, ODataMetaModel,
		ODataModel, PropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mScope = {
			"$Annotations" : {
				"name.space.Id" : {
					// Common := com.sap.vocabularies.Common.v1
					"@Common.Label" : "ID"
				},
				"tea_busi.DefaultContainer" : {
					"@DefaultContainer" : {}
				},
				"tea_busi.DefaultContainer/T€AMS" : {
					"@T€AMS" : {}
				},
				"tea_busi.TEAM" : {
					"@Common.Text" : {
						"$Path" : "Name"
					},
					"@Common.Text@UI.TextArrangement" : {
						"$EnumMember" : "UI.TextArrangementType/TextLast"
					},
					// UI := com.sap.vocabularies.UI.v1
					"@UI.Badge" : {
						"@Common.Label" : "Label inside",
						"$Type" : "UI.BadgeType",
						"HeadLine" : {
							"$Type" : "UI.DataField",
							"Value" : {
								"$Path" : "Name"
							}
						},
						"Title" : {
							"$Type" : "UI.DataField",
							"Value" : {
								"$Path" : "Team_Id"
							}
						}
					},
					"@UI.Badge@Common.Label" : "Best Badge Ever!",
					"@UI.LineItem" : [{
						"@UI.Importance" : {
							"$EnumMember" : "UI.ImportanceType/High"
						},
						"$Type" : "UI.DataField",
						"Label" : "Team ID",
						"Label@Common.Label" : "Team ID's Label",
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
						"$EnumMember" : "UI.TextArrangementType/TextLast"
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
			"$EntityContainer" : "tea_busi.DefaultContainer",
			"empty." : {
				"$kind" : "Schema"
			},
			"name.space." : {
				"$kind" : "Schema"
			},
			// tea_busi := com.sap.gateway.iwbep.tea_busi.v0001
			"tea_busi." : {
				"$kind" : "Schema",
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
					"$Type" : "tea_busi.TEAM",
					"@Common.Label" : "Hail to the Chief"
				}
			}],
			"tea_busi.ContainedC" : {
				"$kind" : "EntityType",
				"$Key" : ["Id"],
				"Id" : {
					"$kind" : "Property",
					"$Type" : "Edm.String"
				},
				"C_2_EMPLOYEE" : {
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.Worker"
				},
				"C_2_S" : {
					"$ContainsTarget" : true,
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.ContainedS"
				}
			},
			"tea_busi.ContainedS" : {
				"$kind" : "EntityType",
				"$Key" : ["Id"],
				"Id" : {
					"$kind" : "Property",
					"$Type" : "Edm.String"
				},
				"S_2_C" : {
					"$ContainsTarget" : true,
					"$kind" : "NavigationProperty",
					"$isCollection" : true,
					"$Type" : "tea_busi.ContainedC"
				},
				"S_2_EMPLOYEE" : {
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.Worker"
				}
			},
			"tea_busi.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"ChangeManagerOfTeam" : {
					"$kind" : "ActionImport",
					"$Action" : "tea_busi.AcChangeManagerOfTeam"
				},
				"EMPLOYEES" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "T€AMS",
						"EMPLOYEE_2_EQUIPM€NTS" : "EQUIPM€NTS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"EQUIPM€NTS" : {
					"$kind" : "EntitySet",
					"$Type" : "tea_busi.EQUIPMENT"
				},
				"GetEmployeeMaxAge" : {
					"$kind" : "FunctionImport",
					"$Function" : "tea_busi.FuGetEmployeeMaxAge"
				},
				"Me" : {
					"$kind" : "Singleton",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "T€AMS",
						"EMPLOYEE_2_EQUIPM€NTS" : "EQUIPM€NTS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"TEAMS" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "tea_busi.TEAM"
				},
				"T€AMS" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"TEAM_2_EMPLOYEES" : "EMPLOYEES"
					},
					"$Type" : "tea_busi.TEAM"
				}
			},
			"tea_busi.EQUIPMENT" : {
				"$kind" : "EntityType",
				"$Key" : ["ID"],
				"ID" : {
					"$kind" : "Property",
					"$Type" : "Edm.Int32",
					"$Nullable" : false
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
					"$OnDelete" : "None",
					"$OnDelete@Common.Label" : "None of my business",
					"$ReferentialConstraint" : {
						"foo" : "bar",
						"foo@Common.Label" : "Just a Gigolo"
					},
					"$Type" : "tea_busi.Worker"
				},
				"TEAM_2_CONTAINED_S" : {
					"$ContainsTarget" : true,
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.ContainedS"
				},
				"TEAM_2_CONTAINED_C" : {
					"$ContainsTarget" : true,
					"$kind" : "NavigationProperty",
					"$isCollection" : true,
					"$Type" : "tea_busi.ContainedC"
				},
				// Note: "value" is a symbolic name for an operation's return type iff. it is
				// primitive
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
				"EMPLOYEE_2_CONTAINED_S" : {
					"$ContainsTarget" : true,
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.ContainedS"
				},
				"EMPLOYEE_2_EQUIPM€NTS" : {
					"$kind" : "NavigationProperty",
					"$isCollection" : true,
					"$Type" : "tea_busi.EQUIPMENT",
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
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		oTeamData = mScope["tea_busi.TEAM"],
		oTeamLineItem = mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
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
			oPromiseMock = oTestContext.mock(Promise),
			oReason = new Error("rejected"),
			oRejectedPromise = Promise.reject(oReason),
			sRequestMethodName = sMethodName.replace("fetch", "request"),
			oResult = {},
			oSyncPromise = _SyncPromise.resolve(oRejectedPromise);

		// resolve...
		oExpectation = oTestContext.mock(oMetaModel).expects(sMethodName).exactly(4);
		oExpectation = oExpectation.withExactArgs.apply(oExpectation, aArguments);
		oExpectation.returns(_SyncPromise.resolve(oResult));

		// get: fulfilled
		assert.strictEqual(oMetaModel[sGetMethodName].apply(oMetaModel, aArguments), oResult);

		// reject...
		oExpectation.returns(oSyncPromise);
		oPromiseMock.expects("resolve")
			.withExactArgs(sinon.match.same(oSyncPromise))
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
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oMetaModel = new ODataMetaModel();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var sAnnotationUri = "my/annotation.xml",
			aAnnotationUris = [ sAnnotationUri, "uri2.xml"],
			oMetadataRequestor = {
				read : function () { throw new Error(); }
			},
			sUrl = "/~/$metadata",
			oMetaModel;

		// code under test
		oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl);

		assert.ok(oMetaModel instanceof MetaModel);
		assert.strictEqual(oMetaModel.aAnnotationUris, undefined);
		assert.ok(oMetaModel.hasOwnProperty("aAnnotationUris"), "own property aAnnotationUris");
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, sUrl);
		assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
		assert.strictEqual(oMetaModel.toString(),
			"sap.ui.model.odata.v4.ODataMetaModel: /~/$metadata");

		// code under test
		oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, aAnnotationUris);

		assert.strictEqual(oMetaModel.aAnnotationUris, aAnnotationUris, "arrays are passed");

		// code under test
		oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, sAnnotationUri);

		assert.deepEqual(oMetaModel.aAnnotationUris, [sAnnotationUri],
			"single annotation is wrapped");
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
	[{
		vAnnotationURI: undefined,
		aAdditionalRequest : []
	}, {
		vAnnotationURI: "/my/annotation.xml",
		aAdditionalRequest : ["/my/annotation.xml"]
	}, {
		vAnnotationURI: ["/my/annotation.xml"],
		aAdditionalRequest : ["/my/annotation.xml"]
	}, {
		vAnnotationURI: ["/my/annotation.xml", "/another/annotation.xml"],
		aAdditionalRequest : ["/my/annotation.xml", "/another/annotation.xml"]
	}].forEach(function (oFixture) {
		var title = "fetchEntityContainer - " + JSON.stringify(oFixture.vAnnotationURI);
		QUnit.test(title, function (assert) {
			var oMetadataRequestor = {
					read : function () {}
				},
				oMetadataRequestorMock = this.mock(oMetadataRequestor),
				sUrl = "/~/$metadata",
				oMetaModel = new ODataMetaModel(oMetadataRequestor, sUrl, oFixture.vAnnotationURI),
				oMergedMetadata = {},
				aReadResults = [{/*mScope metadata*/}],
				oPromise = Promise.resolve(aReadResults[0]),
				oSyncPromise;

			oMetadataRequestorMock.expects("read").withExactArgs(sUrl)
				.returns(oPromise);

			oFixture.aAdditionalRequest.forEach(function (sAnnotationUrl) {
				var oAnnotationResult = {/*mScope*/};

				aReadResults.push(oAnnotationResult);
				oMetadataRequestorMock.expects("read").withExactArgs(sAnnotationUrl, true)
					.returns(Promise.resolve(oAnnotationResult));
			});
			this.mock(oMetaModel).expects("_mergeMetadata")
				.withExactArgs(sinon.match(function (aMetadata) {
					var i, n;
					if (aMetadata.length !== aReadResults.length) {
						return false;
					}
					for (i = 0, n = aMetadata.length; i < n; i += 1) {
						if (aMetadata[i] !== aReadResults[i]) {
							return false;
						}
						return true;
					}
				})).returns(oMergedMetadata);

			// code under test
			oSyncPromise = oMetaModel.fetchEntityContainer();

			// pending
			assert.strictEqual(oSyncPromise.isFulfilled(), false);
			assert.strictEqual(oSyncPromise.isRejected(), false);
			assert.strictEqual(oSyncPromise.getResult(), oSyncPromise);
			// already caching
			assert.strictEqual(oMetaModel.fetchEntityContainer(), oSyncPromise);

			return oSyncPromise.then(function (mScope) {
				// fulfilled
				assert.strictEqual(oSyncPromise.isFulfilled(), true);
				assert.strictEqual(oSyncPromise.isRejected(), false);
				assert.strictEqual(mScope, oMergedMetadata);
				assert.strictEqual(oSyncPromise.getResult(), oMergedMetadata);
				// still caching
				assert.strictEqual(oMetaModel.fetchEntityContainer(), oSyncPromise);
			});
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
	}, { // transient entity
		dataPath : "/Foo/-1/bar",
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
	// --> we could distinguish "/<path>" from "<literal>"
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
			//TODO merge facets of return type and type definition?!
			: mScope["name.space.DerivedPrimitiveFunction"][0].$ReturnType,
		"/ChangeManagerOfTeam/value" : oTeamData.value,
		"/tea_busi.AcChangeManagerOfTeam/value" : oTeamData.value,
		// annotations ----------------------------------------------------------------------------
		"/@DefaultContainer"
			: mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/tea_busi.DefaultContainer@DefaultContainer"
			: mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/tea_busi.DefaultContainer/@DefaultContainer" // w/o $Type, slash makes no difference!
			: mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/$EntityContainer@DefaultContainer" // Note: we could change this
			: mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/$EntityContainer/@DefaultContainer" // w/o $Type, slash makes no difference!
			: mScope.$Annotations["tea_busi.DefaultContainer"]["@DefaultContainer"],
		"/T€AMS/$Type/@UI.LineItem" : oTeamLineItem,
		"/T€AMS/@UI.LineItem" : oTeamLineItem,
		"/T€AMS/@UI.LineItem/0/Label" : oTeamLineItem[0].Label,
		"/T€AMS/@UI.LineItem/0/@UI.Importance" : oTeamLineItem[0]["@UI.Importance"],
		"/T€AMS@T€AMS"
			: mScope.$Annotations["tea_busi.DefaultContainer/T€AMS"]["@T€AMS"],
		"/T€AMS/@Common.Text"
			: mScope.$Annotations["tea_busi.TEAM"]["@Common.Text"],
		"/T€AMS/@Common.Text@UI.TextArrangement"
			: mScope.$Annotations["tea_busi.TEAM"]["@Common.Text@UI.TextArrangement"],
		"/T€AMS/Team_Id@Common.Text"
			: mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		"/T€AMS/Team_Id@Common.Text@UI.TextArrangement"
			: mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text@UI.TextArrangement"],
		"/tea_busi./@Schema" : mScope["tea_busi."]["@Schema"],
		// inline annotations
		"/ChangeManagerOfTeam/$Action/0/$ReturnType/@Common.Label" : "Hail to the Chief",
		"/T€AMS/TEAM_2_EMPLOYEES/$OnDelete@Common.Label" : "None of my business",
		"/T€AMS/TEAM_2_EMPLOYEES/$ReferentialConstraint/foo@Common.Label" : "Just a Gigolo",
		"/T€AMS/@UI.LineItem/0/Label@Common.Label" : "Team ID's Label",
		"/T€AMS/@UI.Badge@Common.Label" : "Best Badge Ever!", // annotation of annotation
		"/T€AMS/@UI.Badge/@Common.Label" : "Label inside", // annotation of record
		// "@" to access to all annotations, e.g. for iteration
		"/T€AMS@" : mScope.$Annotations["tea_busi.DefaultContainer/T€AMS"],
		"/T€AMS/@" : mScope.$Annotations["tea_busi.TEAM"],
		"/T€AMS/Team_Id@" : mScope.$Annotations["tea_busi.TEAM/Team_Id"],
		// "14.5.12 Expression edm:Path"
		// Note: see integration test "{field>Value/$Path@com.sap.vocabularies.Common.v1.Label}"
		"/T€AMS/@UI.LineItem/0/Value/$Path@Common.Text"
			: mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		"/T€AMS/@UI.LineItem/0/Value/$Path/@Common.Label"
			: mScope.$Annotations["name.space.Id"]["@Common.Label"],
		"/EMPLOYEES/@UI.LineItem/0/Value/$Path@Common.Text"
			: mScope.$Annotations["tea_busi.TEAM/Team_Id"]["@Common.Text"],
		// "14.5.2 Expression edm:AnnotationPath"
		"/EMPLOYEES/@UI.Facets/0/Target/$AnnotationPath/"
			: mScope.$Annotations["tea_busi.Worker"]["@UI.LineItem"],
		"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/"
			: mScope.$Annotations["tea_busi.Worker/EMPLOYEE_2_TEAM"]["@Common.Label"],
		"/EMPLOYEES/@UI.Facets/2/Target/$AnnotationPath/"
			: mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
		"/EMPLOYEES/@UI.Facets/3/Target/$AnnotationPath/"
			: mScope.$Annotations["tea_busi.TEAM"]["@UI.LineItem"],
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

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));

			// code under test
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

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));

			// code under test
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
			sODataMetaModel);

		// code under test
		oSyncPromise = this.oMetaModel.fetchObject(sMetaPath, null);

		assert.strictEqual(oSyncPromise.isFulfilled(), true);
		assert.strictEqual(oSyncPromise.getResult(), null);
	});

	//*********************************************************************************************
	["/empty.Container/@", "/T€AMS/Name@"].forEach(function (sPath) {
		QUnit.test("fetchObject returns {} (anonymous empty object): " + sPath, function (assert) {
			var oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));

			// code under test
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
			// Unsupported path after @@... -------------------------------------------------------
			"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath@@this.is.ignored/foo"
				: "Unsupported path after @@this.is.ignored",
			"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/@@this.is.ignored@foo"
				: "Unsupported path after @@this.is.ignored",
			// ...is not a function but... --------------------------------------------------------
			"/@@sap.ui.model.odata.v4.AnnotationHelper.invalid"
				: "sap.ui.model.odata.v4.AnnotationHelper.invalid is not a function but: undefined",
			"/@@sap.ui.model.odata.v4.AnnotationHelper"
				: "sap.ui.model.odata.v4.AnnotationHelper is not a function but: "
					+ sap.ui.model.odata.v4.AnnotationHelper,
			// Unsupported overloads --------------------------------------------------------------
			"/name.space.EmptyOverloads/" : "Unsupported overloads",
			"/name.space.OverloadedAction/" : "Unsupported overloads",
			"/name.space.OverloadedFunction/" : "Unsupported overloads"
		}, function (sPath, sWarning) {
			QUnit.test("fetchObject fails: " + sPath + ", warn = " + bWarn, function (assert) {
				var oSyncPromise;

				this.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(_SyncPromise.resolve(mScope));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING, sODataMetaModel).returns(bWarn);
				this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0)
					.withExactArgs(sWarning, sPath, sODataMetaModel);

				// code under test
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

				this.mock(this.oMetaModel).expects("fetchEntityContainer")
					.returns(_SyncPromise.resolve(mScope));
				this.oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.DEBUG, sODataMetaModel).returns(bDebug);
				this.oLogMock.expects("debug").exactly(bDebug ? 1 : 0)
					.withExactArgs(sMessage, sPath, sODataMetaModel);

				// code under test
				oSyncPromise = this.oMetaModel.fetchObject(sPath);

				assert.strictEqual(oSyncPromise.isFulfilled(), true);
				assert.deepEqual(oSyncPromise.getResult(), undefined);
			});
		});
	});

	//*********************************************************************************************
	[
		"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath",
		"/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath/"
	].forEach(function (sPath) {
		QUnit.test("fetchObject: " + sPath + "@@...isMultiple", function (assert) {
			var oContext,
				fnIsMultiple = this.mock(AnnotationHelper).expects("isMultiple"),
				oResult = {},
				oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer").atLeast(1)
				.returns(_SyncPromise.resolve(mScope));
			fnIsMultiple
				.withExactArgs(
					this.oMetaModel.getObject(sPath),
					sinon.match({
						context : sinon.match.object,
						schemaChildName : "tea_busi.Worker"
					}))
				.returns(oResult);

			// code under test
			oSyncPromise = this.oMetaModel.fetchObject(sPath
				+ "@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple");

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), oResult);
			oContext = fnIsMultiple.args[0][1].context;
			assert.ok(oContext instanceof BaseContext);
			assert.strictEqual(oContext.getModel(), this.oMetaModel);
			assert.strictEqual(oContext.getPath(), sPath);
			assert.strictEqual(oContext.getObject(), this.oMetaModel.getObject(sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchObject: ...@@.isMultiple", function (assert) {
		var oContext,
			fnIsMultiple,
			sPath = "/EMPLOYEES/@UI.Facets/1/Target/$AnnotationPath",
			oResult = {},
			oScope = {
				isMultiple : function () {}
			},
			oSyncPromise;

		this.mock(this.oMetaModel).expects("fetchEntityContainer").atLeast(1)
			.returns(_SyncPromise.resolve(mScope));
		fnIsMultiple = this.mock(oScope).expects("isMultiple");
		fnIsMultiple
			.withExactArgs(
				this.oMetaModel.getObject(sPath),
				sinon.match({
					context : sinon.match.object,
					schemaChildName : "tea_busi.Worker"
				}))
			.returns(oResult);

		// code under test
		oSyncPromise = this.oMetaModel.fetchObject(sPath + "@@.isMultiple", null, {scope : oScope});

		assert.strictEqual(oSyncPromise.isFulfilled(), true);
		assert.strictEqual(oSyncPromise.getResult(), oResult);
		oContext = fnIsMultiple.args[0][1].context;
		assert.ok(oContext instanceof BaseContext);
		assert.strictEqual(oContext.getModel(), this.oMetaModel);
		assert.strictEqual(oContext.getPath(), sPath);
		assert.strictEqual(oContext.getObject(), this.oMetaModel.getObject(sPath));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		QUnit.test("fetchObject: " + "...@@... throws", function (assert) {
			var oError = new Error("This call failed intentionally"),
				sPath = "/@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple",
				oSyncPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer").atLeast(1)
				.returns(_SyncPromise.resolve(mScope));
			this.mock(AnnotationHelper).expects("isMultiple")
				.throws(oError);
			this.oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING, sODataMetaModel).returns(bWarn);
			this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0).withExactArgs(
				"Error calling sap.ui.model.odata.v4.AnnotationHelper.isMultiple: " + oError,
				sPath, sODataMetaModel);

			// code under test
			oSyncPromise = this.oMetaModel.fetchObject(sPath);

			assert.strictEqual(oSyncPromise.isFulfilled(), true);
			assert.strictEqual(oSyncPromise.getResult(), undefined);
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
					oMetaModelMock = this.mock(this.oMetaModel),
					oType;

				oMetaModelMock.expects("fetchObject").twice()
					.withExactArgs(undefined, oMetaContext)
					.returns(_SyncPromise.resolve(oProperty));
				if (oProperty.$Type === "Edm.String") { // simulate annotation for strings
					oMetaModelMock.expects("fetchObject")
						.withExactArgs("@com.sap.vocabularies.Common.v1.IsDigitSequence",
							oMetaContext)
						.returns(_SyncPromise.resolve(oConstraints && oConstraints.isDigitSequence));
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

		this.mock(this.oMetaModel).expects("fetchObject").twice()
			.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
			.returns(_SyncPromise.resolve({
				$isCollection : true,
				$Nullable : false, // must not be turned into a constraint for Raw!
				$Type : "Edm.String"
			}));
		this.oLogMock.expects("warning").withExactArgs(
			"Unsupported collection type, using sap.ui.model.odata.type.Raw",
			sPath, sODataMetaModel);

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

			this.mock(this.oMetaModel).expects("fetchObject").twice()
				.withExactArgs(undefined, this.oMetaModel.getMetaContext(sPath))
				.returns(_SyncPromise.resolve({
					$Nullable : false, // must not be turned into a constraint for Raw!
					$Type : sQualifiedName
				}));
			this.oLogMock.expects("warning").withExactArgs(
				"Unsupported type '" + sQualifiedName + "', using sap.ui.model.odata.type.Raw",
				sPath, sODataMetaModel);

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
	[{ // simple entity from a set
		dataPath : "/TEAMS/0",
		canonicalUrl : "/TEAMS(~1)",
		requests : [{
			entityType : "tea_busi.TEAM",
			predicate : "(~1)"
		}]
	}, { // simple entity in transient context
		dataPath : "/TEAMS/-1",
		canonicalUrl : "/TEAMS(~1)",
		requests : [{
			entityType : "tea_busi.TEAM",
			// TODO a transient entity does not necessarily have all key properties, but this is
			//      required to create a dependent cache
			predicate : "(~1)"
		}]
	}, { // simple entity by key predicate
		dataPath : "/TEAMS('4%3D2')",
		canonicalUrl : "/TEAMS('4%3D2')",
		requests : []
	}, { // simple singleton
		dataPath : "/Me",
		canonicalUrl : "/Me",
		requests : []
	}, { // navigation to root entity
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/1",
		canonicalUrl : "/EMPLOYEES(~1)",
		requests : [{
			entityType : "tea_busi.Worker",
			predicate : "(~1)"
		}]
	}, { // navigation to root entity
		dataPath : "/TEAMS('42')/TEAM_2_EMPLOYEES/1",
		canonicalUrl : "/EMPLOYEES(~1)",
		requests : [{
			entityType : "tea_busi.Worker",
			predicate : "(~1)"
		}]
	}, { // navigation to root entity with key predicate
		dataPath : "/TEAMS('42')/TEAM_2_EMPLOYEES('23')",
		canonicalUrl : "/EMPLOYEES('23')",
		requests : []
	}, { // multiple navigation to root entity
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/1/EMPLOYEE_2_TEAM",
		canonicalUrl : "/T%E2%82%ACAMS(~1)",
		requests : [{
			entityType : "tea_busi.TEAM",
			predicate : "(~1)"
		}]
	}, { // navigation from entity set to single contained entity
		dataPath : "/TEAMS/0/TEAM_2_CONTAINED_S",
		canonicalUrl : "/TEAMS(~1)/TEAM_2_CONTAINED_S",
		requests : [{
			entityType : "tea_busi.TEAM",
			path : "/TEAMS/0",
			predicate : "(~1)"
		}]
	}, { // navigation from singleton to single contained entity
		dataPath : "/Me/EMPLOYEE_2_CONTAINED_S",
		canonicalUrl : "/Me/EMPLOYEE_2_CONTAINED_S",
		requests : []
	}, { // navigation to contained entity within a collection
		dataPath : "/TEAMS/0/TEAM_2_CONTAINED_C/1",
		canonicalUrl : "/TEAMS(~1)/TEAM_2_CONTAINED_C(~2)",
		requests : [{
			entityType : "tea_busi.TEAM",
			path : "/TEAMS/0",
			predicate : "(~1)"
		}, {
			entityType : "tea_busi.ContainedC",
			path : "/TEAMS/0/TEAM_2_CONTAINED_C/1",
			predicate : "(~2)"
		}]
	}, { // navigation to contained entity with a key predicate
		dataPath : "/TEAMS('42')/TEAM_2_CONTAINED_C('foo')",
		canonicalUrl : "/TEAMS('42')/TEAM_2_CONTAINED_C('foo')",
		requests : []
	}, { // navigation from contained entity to contained entity
		dataPath : "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1",
		canonicalUrl : "/TEAMS(~1)/TEAM_2_CONTAINED_S/S_2_C(~2)",
		requests : [{
			entityType : "tea_busi.TEAM",
			path : "/TEAMS/0",
			predicate : "(~1)"
		}, {
			entityType : "tea_busi.ContainedC",
			path : "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_C/1",
			predicate : "(~2)"
		}]
	}, { // navigation from contained to root entity
		// must be appended nevertheless since we only have a type, but no set
		dataPath : "/TEAMS/0/TEAM_2_CONTAINED_S/S_2_EMPLOYEE",
		canonicalUrl : "/TEAMS(~1)/TEAM_2_CONTAINED_S/S_2_EMPLOYEE",
		requests : [{
			entityType : "tea_busi.TEAM",
			path : "/TEAMS/0",
			predicate : "(~1)"
		}]
	}, { // navigation from entity w/ key predicate to contained to root entity
		dataPath : "/TEAMS('42')/TEAM_2_CONTAINED_S/5/S_2_EMPLOYEE",
		canonicalUrl : "/TEAMS('42')/TEAM_2_CONTAINED_S(~1)/S_2_EMPLOYEE",
		requests : [{
			entityType : "tea_busi.ContainedS",
			path : "/TEAMS('42')/TEAM_2_CONTAINED_S/5",
			predicate : "(~1)"
		}]
	}, { // decode entity set initially, encode it finally
		dataPath : "/T%E2%82%ACAMS/0",
		canonicalUrl : "/T%E2%82%ACAMS(~1)",
		requests : [{
			entityType : "tea_busi.TEAM",
			predicate : "(~1)"
		}]
	}, { // decode navigation property, encode entity set when building sCandidate
		dataPath : "/EMPLOYEES('7')/EMPLOYEE_2_EQUIPM%E2%82%ACNTS(42)",
		canonicalUrl : "/EQUIPM%E2%82%ACNTS(42)",
		requests : []
	}].forEach(function (oFixture) {
		QUnit.test("fetchCanonicalPath: " + oFixture.dataPath, function (assert) {
			var oContext = Context.create(this.oModel, undefined, oFixture.dataPath),
				oContextMock = this.mock(oContext),
				oEntityInstance = {},
				oODataHelperMock = this.mock(_ODataHelper),
				oPromise;

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));
			oFixture.requests.forEach(function (oRequest) {
				if (oRequest.path) {
					oContextMock.expects("fetchAbsoluteValue").withExactArgs(oRequest.path)
						.returns(_SyncPromise.resolve(oEntityInstance));
				} else {
					oContextMock.expects("fetchValue").withExactArgs("")
						.returns(_SyncPromise.resolve(oEntityInstance));
				}
				oODataHelperMock.expects("getKeyPredicate")
					.withExactArgs(sinon.match.same(mScope[oRequest.entityType]),
						sinon.match.same(oEntityInstance))
					.returns(oRequest.predicate);
			});

			// code under test
			oPromise = this.oMetaModel.fetchCanonicalPath(oContext);

			assert.ok(!oPromise.isRejected());
			return oPromise.then(function (sCanonicalUrl) {
				assert.strictEqual(sCanonicalUrl, oFixture.canonicalUrl);
			});
		});
	});
	//TODO support non-navigation properties, paths in navigation property bindings
	//TODO prefer instance annotation at payload for "odata.editLink"?!
	//TODO target URLs like "com.sap.gateway.iwbep.tea_busi_product.v0001.Container/Products(...)"?

	//*********************************************************************************************
	[{
		dataPath : "/TEAMS/0/Team_Id",
		message : "Not a navigation property: Team_Id"
	}, {
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/0/ID",
		message : "Not a navigation property: ID"
	}, {
		dataPath : "/TEAMS/0/unknown",
		message : "Not a navigation property: unknown"
	}, {
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/0/unknown",
		message : "Not a navigation property: unknown"
	}, {
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/0",
		instance : undefined,
		message : "No instance to calculate key predicate"
	}, {
		dataPath : "/TEAMS/0/TEAM_2_EMPLOYEES/0",
		instance : {},
		message : "Missing value for key property 'ID'"
	}, {
		absolute : true,
		dataPath : "/TEAMS/0/TEAM_2_CONTAINED_S",
		instance : {},
		message : "Missing value for key property 'Team_Id' at /TEAMS/0"
	}, {
		absolute : true,
		dataPath : "/TEAMS('42')/TEAM_2_CONTAINED_C/0",
		instance : {},
		message : "Missing value for key property 'Id'"
	}].forEach(function (oFixture) {
		QUnit.test("fetchCanonicalUrl: error for " + oFixture.dataPath, function (assert) {
			var oContext = Context.create(this.oModel, undefined, oFixture.dataPath),
				oPromise;

			this.oLogMock.expects("error").withExactArgs(oFixture.message, oFixture.dataPath,
				sODataMetaModel);
			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));
			if ("instance" in oFixture) {
				this.mock(oContext)
					.expects(oFixture.absolute ? "fetchAbsoluteValue" : "fetchValue")
					.returns(_SyncPromise.resolve(oFixture.instance));
			} else {
				this.mock(oContext).expects("fetchValue").never();
				this.mock(_ODataHelper).expects("getKeyPredicate").never();
			}

			oPromise = this.oMetaModel.fetchCanonicalPath(oContext);
			assert.ok(oPromise.isRejected());
			assert.strictEqual(oPromise.getResult().message,
				oFixture.dataPath + ": " + oFixture.message);
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
			mParameters = {},
			sPath = "foo",
			mParameters = {},
			oValue = {};

		//TODO call fetchObject instead once lazy loading is implemented
		this.mock(this.oMetaModel).expects("getProperty")
			.withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(mParameters))
			.returns(oValue);

		// code under test
		oBinding = this.oMetaModel.bindProperty(sPath, oContext, mParameters);

		assert.ok(oBinding instanceof PropertyBinding);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getModel(), this.oMetaModel);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.mParameters, mParameters, "mParameters available internally");
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
		var fnApply = this.mock(FilterProcessor).expects("apply"),
			oBinding,
			oMetaModel = this.oMetaModel, // instead of "that = this"
			oContext = oMetaModel.getMetaContext("/EMPLOYEES"),
			aFilters = [],
			fnGetValue, // fnApply.args[0][2]
			aIndices = ["ID", "AGE"], // mock filter result
			sPath = "",
			aSorters = [];

		this.mock(oMetaModel).expects("_getObject")
			.withExactArgs(sPath, sinon.match.same(oContext))
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
			.withExactArgs("fooPath", sinon.match.same(oBinding.oList[aIndices[0]]))
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
			"EMPLOYEE_2_CONTAINED_S" : oWorkerData.EMPLOYEE_2_CONTAINED_S,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM,
			"EMPLOYEE_2_EQUIPM€NTS" : oWorkerData["EMPLOYEE_2_EQUIPM€NTS"]
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
			"EMPLOYEE_2_CONTAINED_S" : oWorkerData.EMPLOYEE_2_CONTAINED_S,
			"EMPLOYEE_2_TEAM" : oWorkerData.EMPLOYEE_2_TEAM,
			"EMPLOYEE_2_EQUIPM€NTS" : oWorkerData["EMPLOYEE_2_EQUIPM€NTS"]
		}
	}, {
		// <template:repeat list="{meta>/}" ...>
		// Iterate all OData path segments, i.e. entity sets and imports.
		// Implicit scope lookup happens here!
		metaPath : "/",
		result : {
			"ChangeManagerOfTeam" : oContainerData.ChangeManagerOfTeam,
			"EMPLOYEES" : oContainerData.EMPLOYEES,
			"EQUIPM€NTS" : oContainerData["EQUIPM€NTS"],
			"GetEmployeeMaxAge" : oContainerData.GetEmployeeMaxAge,
			"Me" : oContainerData.Me,
			"TEAMS" : oContainerData.TEAMS,
			"T€AMS" : oContainerData["T€AMS"]
		}
	}, {
		// <template:repeat list="{property>@}" ...>
		// Iterate all external targeting annotations.
		contextPath : "/T€AMS/Team_Id",
		metaPath : "@",
		result : mScope.$Annotations["tea_busi.TEAM/Team_Id"],
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

			this.mock(this.oMetaModel).expects("fetchEntityContainer")
				.returns(_SyncPromise.resolve(mScope));

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
			assert.deepEqual(mScope, oMetadataClone, "metadata unchanged");
		});
	});
	//TODO iterate mix of inline and external targeting annotations
	//TODO iterate annotations like "foo@..." for our special cases, e.g. annotations of annotation
	//TODO Avoid copies of objects? Makes sense only after we get rid of JSONListBinding which
	// makes copies itself. If we get rid of it, we might become smarter in updateIndices and
	// learn from the path which collection to iterate: sPath = "", "$", or "@", oContext holds
	// the resolved path. Could we support setContext() then?

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

	//*********************************************************************************************
	QUnit.test("_mergeMetadata", function (assert) {
		var sWorker = "com.sap.gateway.default.iwbep.tea_busi.v0001.Worker/",
			sBasicSalaryCurr = sWorker + "ComplexType_Salary/BASIC_SALARY_CURR",
			sBasicSalaryCurr2 = "another.schema.2.ComplexType_Salary/BASIC_SALARY_CURR",
			sBonusCurr = sWorker + "ComplexType_Salary/BONUS_CURR",
			sCommonLabel = "@com.sap.vocabularies.Common.v1.Label",
			sCommonQuickInfo = "@com.sap.vocabularies.Common.v1.QuickInfo",
			sCommonText = "@com.sap.vocabularies.Common.v1.Text",
			oExpectedMergedMetadata,
			oMergedMetadata,
			sBaseUrl = "/" + window.location.pathname.split("/")[1]
				+ "/test-resources/sap/ui/core/qunit/odata/v4/data/",
			oMetadata = jQuery.sap.sjax({url : sBaseUrl + "metadata.json", dataType : 'json'}).data,
			oAnnotation = jQuery.sap.sjax({url : sBaseUrl + "annotations1.json", dataType : 'json'})
				.data,
			oAnnotationCopy,
			oMetadataCopy = JSON.parse(JSON.stringify(oMetadata));

		// code under test
		oMergedMetadata = this.oMetaModel._mergeMetadata([oMetadataCopy]);

		assert.strictEqual(oMergedMetadata, oMetadataCopy, "same instance is returned");
		assert.deepEqual(oMergedMetadata.$Annotations,
			jQuery.extend({}, oMetadata["com.sap.gateway.default.iwbep.tea_busi.v0001."].$Annotations),
			"$Annotations have been shifted and merged from schemas to root");
		assert.strictEqual(oMergedMetadata["com.sap.gateway.default.iwbep.tea_busi.v0001."].$Annotations,
			undefined, "$Annotations removed from schema");

		// prepare test with annotations
		oAnnotationCopy = JSON.parse(JSON.stringify(oAnnotation));
		oExpectedMergedMetadata = JSON.parse(JSON.stringify(oMetadata));
		oExpectedMergedMetadata.$Annotations = jQuery.extend({},
				oMetadata["com.sap.gateway.default.iwbep.tea_busi.v0001."].$Annotations);
		delete oExpectedMergedMetadata["com.sap.gateway.default.iwbep.tea_busi.v0001."].$Annotations;
		// all kind entries are merged
		oExpectedMergedMetadata["my.schema.2.FuGetEmployeeMaxAge"] =
			oAnnotationCopy["my.schema.2.FuGetEmployeeMaxAge"];
		oExpectedMergedMetadata["my.schema.2.Entity"] =
			oAnnotationCopy["my.schema.2.Entity"];
		oExpectedMergedMetadata["my.schema.2.DefaultContainer"] =
			oAnnotationCopy["my.schema.2.DefaultContainer"];
		oExpectedMergedMetadata["my.schema.2."] =
			oAnnotationCopy["my.schema.2."];
		oExpectedMergedMetadata["another.schema.2."] =
			oAnnotationCopy["another.schema.2."];
		// update annotations
		oExpectedMergedMetadata.$Annotations[sBasicSalaryCurr][sCommonLabel]
			= oAnnotationCopy["my.schema.2."].$Annotations[sBasicSalaryCurr][sCommonLabel];
		oExpectedMergedMetadata.$Annotations[sBasicSalaryCurr][sCommonQuickInfo]
			= oAnnotationCopy["my.schema.2."].$Annotations[sBasicSalaryCurr][sCommonQuickInfo];
		oExpectedMergedMetadata.$Annotations[sBonusCurr][sCommonText]
			= oAnnotationCopy["my.schema.2."].$Annotations[sBonusCurr][sCommonText];
		oExpectedMergedMetadata.$Annotations[sBasicSalaryCurr2]
			= oAnnotationCopy["another.schema.2."].$Annotations[sBasicSalaryCurr2];
		delete oExpectedMergedMetadata["my.schema.2."].$Annotations;
		delete oExpectedMergedMetadata["another.schema.2."].$Annotations;

		oMetadataCopy = JSON.parse(JSON.stringify(oMetadata));
		oAnnotationCopy = JSON.parse(JSON.stringify(oAnnotation));

		// code under test
		oMergedMetadata = this.oMetaModel._mergeMetadata([oMetadataCopy, oAnnotationCopy]);

		assert.strictEqual(oMergedMetadata, oMetadataCopy, "same instance as first element");
		assert.deepEqual(oMergedMetadata, oExpectedMergedMetadata, "merged metadata as expected");
	});

	//*********************************************************************************************
	QUnit.test("_mergeMetadata - error", function (assert) {
		var sBaseUrl = "/" + window.location.pathname.split("/")[1]
				+ "/test-resources/sap/ui/core/qunit/odata/v4/data/",
			oAnnotation = jQuery.sap.sjax({url : sBaseUrl + "annotations2.json", dataType : 'json'})
				.data,
			oMetadata = jQuery.sap.sjax({url : sBaseUrl + "metadata.json", dataType : 'json'}).data,
			oMetaModel = new ODataMetaModel({} /*requestor*/, "/url", "/my/annotation.xml");

		assert.throws(function () {
			// code under test
			oMetaModel._mergeMetadata([oMetadata, oAnnotation]);
		}, new Error("Overwriting 'com.sap.gateway.default.iwbep.tea_busi.v0001.Department'"
				+ " with the value defined in '/my/annotation.xml' is not supported"));
	});
});
//TODO getContext vs. createBindingContext; map of "singletons" vs. memory leak