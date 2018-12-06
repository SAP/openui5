/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/InvisibleText",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_AnnotationHelperBasics",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/_AnnotationHelperExpression"
], function (jQuery, Log, SyncPromise, InvisibleText, BaseContext, JSONModel, Basics,
		AnnotationHelper, ODataMetaModel, Expression) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mScope = {
			"$Annotations" : {
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
					}]
				}
			},
			"$EntityContainer" : "tea_busi.DefaultContainer",
			// tea_busi := com.sap.gateway.iwbep.tea_busi.v0001
			"tea_busi." : {
				"$kind" : "Schema",
				"@Schema" : {}
			},
			"tea_busi.DefaultContainer" : {
				"$kind" : "EntityContainer",
				"EMPLOYEES" : {
					"$kind" : "EntitySet",
					"$NavigationPropertyBinding" : {
						"EMPLOYEE_2_TEAM" : "TEAMS"
					},
					"$Type" : "tea_busi.Worker"
				},
				"TEAMS" : {
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
					"$Type" : "name.space.Id",
					"$Nullable" : false,
					"$MaxLength" : 10
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
				"EMPLOYEE_2_TEAM" : {
					"$kind" : "NavigationProperty",
					"$Type" : "tea_busi.TEAM",
					"$Nullable" : false
				}
			}
		};

	/**
	 * Checks that the given raw value is turned by <code>AnnotationHelper.value</code> into a value
	 * that a control is able to evaluate into the given expected result.
	 *
	 * @param {object} assert
	 *   QUnit's <code>assert</code>
	 * @param {any} vRawValue
	 *   Any raw value from the meta model
	 * @param {any} vResult
	 *   The expected result
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} [oMetaModel]
	 *   Optional meta model (or dummy)
	 * @param {sap.ui.model.Model} [oModel]
	 *   Optional model (in case bindings are involved)
	 */
	function check(assert, vRawValue, vResult, oMetaModel, oModel) {
		var oContext = new BaseContext(oMetaModel, "/"),
			// code under test
			sText = AnnotationHelper.value(vRawValue, {context : oContext}),
			oInvisibleText = new InvisibleText({text: sText, models : oModel});

		oInvisibleText.bindObject("/");
		assert.strictEqual(oInvisibleText.getText(),
			oInvisibleText.validateProperty("text", vResult),
			JSON.stringify(vRawValue) + " --> " + sText);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.AnnotationHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("isMultiple", function (assert) {
		var mFixture = {
				"" : false,
				"@UI.LineItem" : false,
				"EMPLOYEE_2_TEAM@Common.Label" : false,
				"EMPLOYEE_2_TEAM/@UI.LineItem" : false,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$count" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/@UI.LineItem" : true,
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES@Common.Label" : true,
				"tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem" : false
			},
			oMetaModel = new ODataMetaModel(),
			oContext = new BaseContext(oMetaModel), // Note: path does not matter
			sPath;

		this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1)
			.returns(SyncPromise.resolve(mScope));

		for (sPath in mFixture) {
			assert.strictEqual(
				AnnotationHelper.isMultiple(sPath, {
					context : oContext,
					schemaChildName : "tea_busi.Worker"
				}),
				mFixture[sPath], sPath);
		}
	});
	//TODO later: if details are missing, loop back via oContext
	//TODO error handling? if path is wrong in annotation, a warning might be helpful --> later!
	//TODO multi-valued structural or navigation property "in between" are not recognized; maybe
	// add such checks only in case warnings would be logged?

	//*********************************************************************************************
	[true, false, {}, [], null, undefined].forEach(function (vFetchObjectResult, i) {
		QUnit.test("isMultiple: $$valueAsPromise - " + i, function (assert) {
			var oMetaModel = {
					fetchObject : function () {}
				},
				oPromise;

			this.mock(oMetaModel).expects("fetchObject")
				.withExactArgs("/tea_busi.Worker/EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$isCollection")
				.returns(SyncPromise.resolve(Promise.resolve(vFetchObjectResult)));

			// code under test
			oPromise = AnnotationHelper.isMultiple("EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES", {
				$$valueAsPromise : true,
				context : {
					getModel : function () { return oMetaModel; }
				},
				schemaChildName : "tea_busi.Worker"
			});

			assert.ok(oPromise instanceof Promise, "Promise returned");
			return oPromise.then(function (bIsMultiple) {
				assert.strictEqual(bIsMultiple, i === 0);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getNavigationPath", function (assert) {
		var mFixture = {
				"" : "",
				"@UI.LineItem" : "",
				"EMPLOYEE_2_TEAM@Common.Label" : "EMPLOYEE_2_TEAM",
				"EMPLOYEE_2_TEAM/@UI.LineItem" : "EMPLOYEE_2_TEAM",
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES" : "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$count" : "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/@UI.LineItem"
					: "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES@Common.Label"
					: "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
				"tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem"
					: "TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM",
				"tea_busi.TEAM/TEAM_2_EMPLOYEES/tea_busi.WORKER/EMPLOYEE_2_TEAM/@UI.LineItem"
					: "TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM"
			},
			sPath;

		for (sPath in mFixture) {
			assert.strictEqual(AnnotationHelper.getNavigationPath(sPath), mFixture[sPath], sPath);
		}

		// sinon-4 allows stubbing some library methods like filter
		// assure that the split/filter/join function is not called if the path doesn't contain "."
		this.mock(Array.prototype).expects("filter").never();

		// code under test
		assert.strictEqual(AnnotationHelper.getNavigationPath("EMPLOYEE_2_TEAM"),
			"EMPLOYEE_2_TEAM", "EMPLOYEE_2_TEAM");
	});

	//*********************************************************************************************
	QUnit.test("getNavigationBinding", function (assert) {
		var oAnnotationHelperMock = this.mock(AnnotationHelper),
			mFixture = {
				"" : "",
				"EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES" : "{EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES}",
				"foo\\bar" : Error,
				"foo{bar" : Error,
				"foo}bar" : Error,
				"foo:bar" : Error
			},
			sPath;

		// Note: avoids "Don't make functions within a loop"
		function codeUnderTest() {
			return AnnotationHelper.getNavigationBinding("foo/bar");
		}

		for (sPath in mFixture) {
			oAnnotationHelperMock.expects("getNavigationPath")
				.withExactArgs("foo/bar")
				.returns(sPath);

			if (mFixture[sPath] === Error) {
				assert.throws(codeUnderTest, new Error("Invalid OData identifier: " + sPath));
			} else {
				assert.strictEqual(codeUnderTest(), mFixture[sPath], sPath);
			}
		}
	});

	//*********************************************************************************************
	["/my/path", "/my/path/"].forEach(function (sPath) {
		QUnit.test("value", function (assert) {
			var oMetaModel = {},
				oContext = new BaseContext(oMetaModel, sPath),
				vRawValue = {},
				sResult = "foo";

			this.mock(Expression).expects("getExpression")
				.withExactArgs({
						asExpression : false,
						model : sinon.match.same(oMetaModel),
						path : "/my/path", // trailing slash removed!
						value : sinon.match.same(vRawValue)
					})
				.returns(sResult);

			assert.strictEqual(AnnotationHelper.value(vRawValue, {context : oContext}), sResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("value: 14.5.1 Comparison and Logical Operators", function (assert) {
		check(assert, {
			$And : [{
				$And : [
					{
						$Eq : [
							{"$DateTimeOffset" : "1970-01-01T00:00:00.000Z"},
							{"$DateTimeOffset" : "1970-01-01T00:00:00.000+00:00"}
						]
					}, {
						$Eq : [
							{"$DateTimeOffset" : "1970-01-01T00:00:00.000Z"},
							{"$DateTimeOffset" : "1970-01-01T00:00:00.000-00:00"}
						]
					}
				]
			}, {
				$Le : [
					{"$DateTimeOffset" : "1970-01-01T00:00:00.000Z"},
					{"$DateTimeOffset" : "1970-01-01T00:00:00.000-01:00"}
				]
			}]
		}, true);
	});

	//*********************************************************************************************
	QUnit.test("value: 14.5.3.1.2 Function odata.fillUriTemplate", function (assert) {
		var oMetaModel = {
				getProperty : function (sPath) {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			oModel = new JSONModel({
				Address : {
					City : "MyCity",
					Street : "O'Neil's Alley"
				}
			}),
			sUrl = "https://www.google.de/maps/place/'O''Neil''s Alley',MyCity"
				.replace(/ /g, "%20")
				.replace(/'/g, "%27");

		oMetaModelMock.expects("getProperty")
			.withExactArgs("/$Apply/1/$LabeledElement/$Apply/0/$Path/$Type")
			.returns("Edm.Guid"); // City; just kidding
		oMetaModelMock.expects("getProperty")
			.withExactArgs("/$Apply/2/$LabeledElement/$Apply/0/$Path/$Type")
			.returns("Edm.String"); // Street

		check(assert, {
			$Apply : [
				"https://www.google.de/maps/place/{street},{city}",
				{
					$LabeledElement : {
						$Apply : [{
							$Path : "Address/City"
						}],
						$Function : "odata.uriEncode"
					},
					$Name : "city"
				},
				{
					$LabeledElement : {
						$Apply : [{
							$Path : "Address/Street"
						}],
						$Function : "odata.uriEncode"
					},
					$Name : "street"
				}
			],
			$Function : "odata.fillUriTemplate"
		}, sUrl, oMetaModel, oModel);
	});

	//*********************************************************************************************
	QUnit.test("getValueListType: property path", function (assert) {
		var oMetaModel = {
				getValueListType : function () {}
			},
			oDetails = {
				context : {
					getModel : function () { return oMetaModel; }
				},
				schemaChildName : "tea_busi.Worker"
			},
			oResult = {};

		this.mock(oMetaModel).expects("getValueListType").withExactArgs("/tea_busi.Worker/ID")
			.returns(oResult);

		// code under test
		assert.strictEqual(AnnotationHelper.getValueListType("ID", oDetails), oResult);
	});

	//*********************************************************************************************
	QUnit.test("getValueListType: property object", function (assert) {
		var oMetaModel = {
				getValueListType : function () {}
			},
			oDetails = {
				context : {
					getModel : function () { return oMetaModel; },
					getPath : function () { return "/tea_busi.Worker/ID"; }
				}
			},
			oResult = {};

		this.mock(oMetaModel).expects("getValueListType").withExactArgs("/tea_busi.Worker/ID")
			.returns(oResult);

		// code under test
		assert.strictEqual(
			AnnotationHelper.getValueListType(mScope["tea_busi.Worker"].ID, oDetails),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("getValueListType: $$valueAsPromise", function (assert) {
		var oMetaModel = {
				fetchValueListType : function () {}
			},
			oDetails = {
				$$valueAsPromise : true,
				context : {
					getModel : function () { return oMetaModel; }
				},
				schemaChildName : "tea_busi.Worker"
			},
			oResult = {},
			oSyncPromise = SyncPromise.resolve();

		this.mock(oMetaModel).expects("fetchValueListType").withExactArgs("/tea_busi.Worker/ID")
			.returns(oSyncPromise);
		this.mock(oSyncPromise).expects("unwrap").withExactArgs().returns(oResult);

		// code under test
		assert.strictEqual(AnnotationHelper.getValueListType("ID", oDetails), oResult);
	});

	//*********************************************************************************************
	QUnit.test("label - DataField has a label", function (assert) {
		var oAnnotationHelperMock = this.mock(AnnotationHelper),
			oContext = {},
			oModel = {
				createBindingContext : function () {}
			},
			oDetails = {
				context : {
					getModel : function () { return oModel; }
				}
			},
			vRawValue = {
				Label : "ID",
				Value : {}
			};
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("Label", sinon.match.same(oDetails.context))
			.returns(oContext);
		oAnnotationHelperMock.expects("value")
			.withExactArgs(vRawValue.Label, sinon.match({
				context : sinon.match.same(oContext)
			}));

		// code under test
		AnnotationHelper.label(vRawValue, oDetails);
	});

	//*********************************************************************************************
	QUnit.test("label - follow the path", function (assert) {
		var oAnnotationHelperMock = this.mock(AnnotationHelper),
			oContext = {
				getObject : function () {}
			},
			oModel = {
				createBindingContext : function () {}
			},
			oDetails = {
				context : {
					getModel : function () { return oModel; }
				}
			},
			vRawValue = {
				Value : {
					$Path : "PhoneNumber"
				}
			},
			vResult = {};

		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("Value/$Path@com.sap.vocabularies.Common.v1.Label",
				sinon.match.same(oDetails.context))
			.returns(oContext);
		this.mock(oContext).expects("getObject")
			.withExactArgs("")
			.returns(vResult);
		oAnnotationHelperMock.expects("value")
			.withExactArgs(sinon.match.same(vResult), sinon.match({
				context : sinon.match.same(oContext)
			}));

		// code under test
		AnnotationHelper.label(vRawValue, oDetails);
	});

	//*********************************************************************************************
	QUnit.test("label: follow the path, $$valueAsPromise", function (assert) {
		var oModel = {
				createBindingContext : function () {},
				fetchObject : function () {}
			},
			oContext = {
				getModel : function () { return oModel; }
			},
			oDetails = {
				$$valueAsPromise : true,
				context : {
					getModel : function () { return oModel; }
				}
			},
			oModelMock = this.mock(oModel),
			oPromise,
			vRawValue = {
				Value : {
					$Path : "PhoneNumber"
				}
			},
			vResult = {},
			vValueAtPath = {},
			oFetchObjectPromise = SyncPromise.resolve(Promise.resolve(vValueAtPath));

		oModelMock.expects("createBindingContext")
			.withExactArgs("Value/$Path@com.sap.vocabularies.Common.v1.Label",
				sinon.match.same(oDetails.context))
			.returns(oContext);
		oModelMock.expects("fetchObject")
			.withExactArgs("", oContext)
			.returns(oFetchObjectPromise);
		this.mock(AnnotationHelper).expects("value")
			.withExactArgs(sinon.match.same(vValueAtPath), sinon.match({
				context : sinon.match.same(oContext)
			}))
			.returns(vResult);

		// code under test
		oPromise = AnnotationHelper.label(vRawValue, oDetails);

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (vResult0) {
			assert.strictEqual(vResult0, vResult);
		});
	});

	//*********************************************************************************************
	[
		{},
		{Value : {$Path : ""}},
		{Value : "PhoneNumber"},
		{Value : {$Apply : ["foo", "/", "bar"], $Function : "odata.concat"}}
	].forEach(function (vRawValue) {
		var sTitle = "label - returns undefined, vRawValue = " + JSON.stringify(vRawValue);

		QUnit.test(sTitle, function (assert) {
			// code under test
			assert.strictEqual(AnnotationHelper.label(vRawValue, {/*oDetails*/}), undefined);
		});
	});
});
