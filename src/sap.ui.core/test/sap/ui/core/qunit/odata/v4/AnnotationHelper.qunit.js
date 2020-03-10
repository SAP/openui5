/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/InvisibleText",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_AnnotationHelperBasics",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/_AnnotationHelperExpression"
], function (Log, SyncPromise, InvisibleText, BaseContext, JSONModel, Basics, AnnotationHelper,
		ODataMetaModel, Expression) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mScope = {
			"$Annotations" : {
				"tea_busi.DefaultContainer/EMPLOYEES" : {
					"@Common.Text" : {
						"$Path" : "ID"
					}
				},
				"tea_busi.TEAM" : {
					"@UI.LineItem" : [{
						"@UI.Importance" : {
							"$EnumMember" : "UI.ImportanceType/High"
						},
						"$Type" : "UI.DataFieldWithNavigationPath",
						"Label" : "Team ID",
						"Label@Common.Label" : "Team ID's Label",
						"Target" : {
							"$NavigationPropertyPath" : "TEAM_2_EMPLOYEES"
						},
						"Value" : {
							"$Path" : "Team_Id"
						}
					}]
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
					}]
				},
				"tea_busi.Worker/ID" : {
					"@Common.Label" : "Worker's ID",
					"@Common.Text" : {
						"$Path" : "Name"
					}
				},
				"tea_busi.Worker/Name" : {
					"@Common.Label" : "Worker's Name"
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
				"Name" : {
					"$kind" : "Property",
					"$Type" : "Edm.String"
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
					complexBinding : false,
					ignoreAsPrefix : "",
					model : sinon.match.same(oMetaModel),
					path : "/my/path", // trailing slash removed!
					prefix : "",
					value : sinon.match.same(vRawValue),
					$$valueAsPromise : undefined
				})
				.returns(sResult);

			assert.strictEqual(AnnotationHelper.value(vRawValue, {context : oContext}), sResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("value: $$valueAsPromise", function (assert) {
		var oModel = {
				fetchObject : function () {}
			},
			oContext = {
				getModel : function () {
					return oModel;
				},
				getPath : function () {
					return "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/";
				}
			},
			oPromise,
			oProperty = {
				$Type : "Edm.String"
			},
			vRawValue = {$Path: "EQUIPMENT_2_PRODUCT/Name"};

		this.mock(Expression).expects("getExpression").withExactArgs({
				asExpression : false,
				complexBinding : false,
				ignoreAsPrefix : "",
				model : sinon.match.same(oModel),
				path : "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value",
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : true
			}).callThrough();
		this.mock(oModel).expects("fetchObject")
			.withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path/$")
			.returns(SyncPromise.resolve(Promise.resolve(oProperty)));

		// code under test
		oPromise = AnnotationHelper.value(vRawValue, {$$valueAsPromise : true, context : oContext});

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (sValue) {
			assert.strictEqual(sValue, "{EQUIPMENT_2_PRODUCT/Name}");
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
				fetchObject : function (sPath) {}
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

		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/$Apply/1/$LabeledElement/$Apply/0/$Path/$")
			.returns(SyncPromise.resolve({$Type : "Edm.Guid"})); // City; just kidding
		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/$Apply/2/$LabeledElement/$Apply/0/$Path/$")
			.returns(SyncPromise.resolve({$Type : "Edm.String"})); // Street

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

	//*********************************************************************************************
	["/my/path", "/my/path/"].forEach(function (sPath) {
		QUnit.test("format", function (assert) {
			var oMetaModel = {},
				oContext = new BaseContext(oMetaModel, sPath),
				vRawValue = {},
				vResult = {/*string or Promise*/};

			this.mock(Expression).expects("getExpression")
				.withExactArgs({
					asExpression : false,
					complexBinding : true,
					ignoreAsPrefix : "",
					model : sinon.match.same(oMetaModel),
					path : "/my/path", // trailing slash removed!
					prefix : "",
					value : sinon.match.same(vRawValue),
					$$valueAsPromise : true
				})
				.returns(vResult);

			assert.strictEqual(AnnotationHelper.format(vRawValue, {context : oContext}), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("format: path ends with /$Path", function (assert) {
		var oMetaModel = {},
			sPath = "/Equipments/@UI.LineItem/4/Value/$Path",
			oContext = new BaseContext(oMetaModel, sPath),
			vRawValue = {},
			vResult = {/*string or Promise*/};

		this.mock(Expression).expects("getExpression")
			.withExactArgs({
				asExpression : false,
				complexBinding : true,
				ignoreAsPrefix : "",
				model : sinon.match.same(oMetaModel),
				path : sPath,
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : true
			})
			.returns(vResult);

		assert.strictEqual(AnnotationHelper.format(vRawValue, {context : oContext}), vResult);
	});

	//*********************************************************************************************
	[{
		sPath : "/Equipments/@UI.LineItem/0/Value/$Path@Common.Label",
		sPathForFetchObject : "/Equipments/@UI.LineItem/0/Value/$Path",
		sPathValue : "EQUIPMENT_2_PRODUCT/Name",
		sPrefix : "EQUIPMENT_2_PRODUCT/"
	}, {
		sPath : "/Equipments/@UI.LineItem/0/Value/$Path@Common.Label",
		sPathForFetchObject : "/Equipments/@UI.LineItem/0/Value/$Path",
		sPathValue : "Name",
		sPrefix : ""
	}, {
		sPath : "/Equipments/@UI.LineItem/0/Value/$Path/@Common.Label",
		sPathForFetchObject : "/Equipments/@UI.LineItem/0/Value/$Path",
		sPathValue : "EQUIPMENT_2_PRODUCT",
		sPrefix : "EQUIPMENT_2_PRODUCT/"
	}, {
		sPath : "/Products/@namespace.foo/0/Value/$AnnotationPath/",
		sPathForGetExpression : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathForFetchObject : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathValue : "PRODUCT_2_SUPPLIER/@namespace.bar",
		sPrefix : "PRODUCT_2_SUPPLIER/"
	}, {
		sPath : "/Products/@namespace.foo/0/Value/$AnnotationPath/",
		sPathForGetExpression : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathForFetchObject : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathValue : "PRODUCT_2_SUPPLIER/@namespace.bar",
		sPrefix : "PRODUCT_2_SUPPLIER/"
	}, {
		sPath : "/Products/@namespace.foo/0/Value/$AnnotationPath/",
		sPathForGetExpression : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathForFetchObject : "/Products/@namespace.foo/0/Value/$AnnotationPath",
		sPathValue : "PRODUCT_2_SUPPLIER@namespace.bar",
		sPrefix : ""
	}].forEach(function (oFixture, i) {
		QUnit.test("format: with $Path in value - " + i, function (assert) {
			var oMetaModel = {
					fetchObject : function () {},
					getObject : function () {}
				},
				oMetaModelMock = this.mock(oMetaModel),
				oContext = new BaseContext(oMetaModel, oFixture.sPath),
				vRawValue = {},
				vResult = {/*string or Promise*/};

			oMetaModelMock.expects("fetchObject")
				.withExactArgs(oFixture.sPathForFetchObject)
				.returns(SyncPromise.resolve(oFixture.sPathValue));
			this.mock(Expression).expects("getExpression")
				.withExactArgs({
					asExpression : false,
					complexBinding : true,
					ignoreAsPrefix : "",
					model : sinon.match.same(oMetaModel),
					path : oFixture.sPathForGetExpression || oFixture.sPath,
					prefix : oFixture.sPrefix,
					value : sinon.match.same(vRawValue),
					$$valueAsPromise : true
				})
				.returns(vResult);

			// code under test
			AnnotationHelper.format(vRawValue, {context : oContext}).then(function (vResult0) {
				assert.strictEqual(vResult0, vResult);
			});
		});
	});

	//*********************************************************************************************
	["$PropertyPath", "$NavigationPropertyPath"].forEach(function (sPathSuffix) {
		QUnit.test("format: unsupported path: " + sPathSuffix, function (assert) {
			var sPath = "/Foo/@namespace.annotation/Value/" + sPathSuffix + "/";

			this.mock(Expression).expects("getExpression").never();

			assert.throws(function () {
				// code under test
				AnnotationHelper.format({}, {context : new BaseContext({}, sPath)});
			}, new Error("Unsupported path segment " + sPathSuffix + " in " + sPath));
		});
	});

	//*********************************************************************************************
	[
		"/Foo/@namespace.annotation/Value/$Path/@namespace.other/Value/$Path/",
		"/Foo/@namespace.annotation/Value/$AnnotationPath/@namespace.other/Value/$Path/",
		"/Foo/@namespace.annotation/Value/$Path/@namespace.other/Value/$AnnotationPath/",
		"/Foo/@namespace.annotation/Value/$AnnotationPath/@namespace.other/Value/$AnnotationPath/"
	].forEach(function (sPath) {
		QUnit.test("format: unsupported path: " + sPath, function (assert) {
			this.mock(Expression).expects("getExpression").never();

			assert.throws(function () {
				// code under test
				AnnotationHelper.format({}, {context : new BaseContext({}, sPath)});
			}, new Error("Only one $Path or $AnnotationPath segment is supported: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("format: integration test", function (assert) {
		var mConstraints = {
				maxLength : 10
			},
			oModel = {
				fetchObject : function () {},
				getConstraints : function () {},
				getObject : function () {}
			},
			oContext = {
				getModel : function () {
					return oModel;
				},
				getPath : function () {
					return "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/";
				}
			},
			sMetaPath = "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path",
			oModelMock = this.mock(oModel),
			oProperty = {
				$MaxLength : "10",
				$Type : "Edm.String"
			},
			vRawValue = {$Path: "EQUIPMENT_2_PRODUCT/Name"};

		this.mock(Expression).expects("getExpression").withExactArgs({
				asExpression : false,
				complexBinding : true,
				ignoreAsPrefix : "",
				model : sinon.match.same(oModel),
				path : "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value",
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : true
			}).callThrough();
		oModelMock.expects("fetchObject")
			.withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path/$")
			.returns(SyncPromise.resolve(oProperty));
		oModelMock.expects("getConstraints")
			.withExactArgs(sinon.match.same(oProperty), sMetaPath)
			.returns(mConstraints);
		oModelMock.expects("getObject")
			.withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path"
				+ "@Org.OData.Measures.V1.Unit/$Path")
			.returns(undefined);
		oModelMock.expects("getObject")
			.withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path"
				+ "@Org.OData.Measures.V1.ISOCurrency/$Path")
			.returns(undefined);

		// code under test
		assert.strictEqual(AnnotationHelper.format(vRawValue, {context : oContext}),
			"{path:'EQUIPMENT_2_PRODUCT/Name',type:'sap.ui.model.odata.type.String',"
			+ "constraints:{'maxLength':10},formatOptions:{'parseKeepsEmptyString':true}}");
	});

	//*********************************************************************************************
[false, true].forEach(function (bIsBound) {
	QUnit.test("format: overload; $IsBound : " + bIsBound, function (assert) {
		var oMetaModel = {},
			sPath = "/T€AMS/name.space.OverloadedAction@Core.OperationAvailable",
			oContext = new BaseContext(oMetaModel, sPath),
			vRawValue = {},
			vResult = {/*string or Promise*/};

		this.mock(Expression).expects("getExpression")
			.withExactArgs({
				asExpression : false,
				complexBinding : true,
				ignoreAsPrefix : bIsBound ? "_it/" : "",
				model : sinon.match.same(oMetaModel),
				path : sPath,
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : true
			})
			.returns(vResult);

		assert.strictEqual(
			AnnotationHelper.format(vRawValue, {
				context : oContext,
				overload : {
					$IsBound : bIsBound,
					$Parameter : [{
						$Name : "_it"
					}]
				}
			}),
			vResult
		);
	});
});

	//*********************************************************************************************
	QUnit.test("format: for annotation on parameters of bound operations", function (assert) {
		var oMetaModel = {},
			sPath = "/T€AMS/name.space.OverloadedAction/$Parameter/p1@UI.Hidden",
			oContext = new BaseContext(oMetaModel, sPath),
			vRawValue = {},
			vResult = {/*string or Promise*/};

		this.mock(Expression).expects("getExpression")
			.withExactArgs({
				asExpression : false,
				complexBinding : true,
				ignoreAsPrefix : "", // do not remove binding parameter name
				model : sinon.match.same(oMetaModel),
				path : sPath,
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : true
			})
			.returns(vResult);

		assert.strictEqual(
			// code under test
			AnnotationHelper.format(vRawValue, {
				context : oContext,
				overload : {
					$IsBound : true,
					$Parameter : [{
						$Name : "_it"
					}, {
						$Name : "p1"
					}]
				}
			}),
			vResult
		);
	});

	//*********************************************************************************************
[false, true].forEach(function (bIsBound) {
	QUnit.test("value: overload; $IsBound : " + bIsBound, function (assert) {
		var oMetaModel = {},
			sPath = "/T€AMS/name.space.OverloadedAction@Core.OperationAvailable",
			oContext = new BaseContext(oMetaModel, sPath),
			vRawValue = {},
			vResult = {/*string or Promise*/},
			oValueAsPromise = {/*boolean*/};

		this.mock(Expression).expects("getExpression")
			.withExactArgs({
				asExpression : false,
				complexBinding : false,
				ignoreAsPrefix : bIsBound ? "_it/" : "",
				model : sinon.match.same(oMetaModel),
				path : sPath,
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : sinon.match.same(oValueAsPromise)
			})
			.returns(vResult);

		assert.strictEqual(
			AnnotationHelper.value(vRawValue, {
				context : oContext,
				overload : {
					$IsBound : bIsBound,
					$Parameter : [{
						$Name : "_it"
					}]
				},
				$$valueAsPromise : oValueAsPromise
			}),
			vResult
		);
	});
});

	//*********************************************************************************************
	QUnit.test("value: for parameters of bound operations", function (assert) {
		var oMetaModel = {},
			sPath = "/T€AMS/name.space.OverloadedAction/$Parameter/p1@UI.Hidden",
			oContext = new BaseContext(oMetaModel, sPath),
			vRawValue = {},
			vResult = {/*string or Promise*/},
			oValueAsPromise = {/*boolean*/};

		this.mock(Expression).expects("getExpression")
			.withExactArgs({
				asExpression : false,
				complexBinding : false,
				ignoreAsPrefix : "", // do not remove binding parameter name
				model : sinon.match.same(oMetaModel),
				path : sPath,
				prefix : "",
				value : sinon.match.same(vRawValue),
				$$valueAsPromise : sinon.match.same(oValueAsPromise)
			})
			.returns(vResult);

		assert.strictEqual(
			// code under test
			AnnotationHelper.value(vRawValue, {
				context : oContext,
				overload : {
					$IsBound : true,
					$Parameter : [{
						$Name : "_it"
					}, {
						$Name : "p1"
					}]
				},
				$$valueAsPromise : oValueAsPromise
			}),
			vResult
		);
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: no $Path, just $P...", function (assert) {
		var sPath = "/Equipments@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Precision",
			oContext = {
				getPath : function () { return sPath; }
			};

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext), sPath);
	});

	//*********************************************************************************************
	["", "/@bar"].forEach(function (sSuffix) {
		[
			"/Equipments/@foo/Value/$Path", // at entity type
			"/Equipments@foo/Value/$Path" // at entity set
		].forEach(function (sPath) {
			QUnit.test("resolve$Path: " + sPath + sSuffix, function (assert) {
				var oMetaModel = {
						getObject : function () {}
					},
					oContext = {
						getModel : function () { return oMetaModel; },
						getPath : function () { return sPath + sSuffix; }
					};

				this.mock(oMetaModel).expects("getObject").withExactArgs(sPath)
					.returns("EQUIPMENT_2_PRODUCT/Name");

				// code under test
				assert.strictEqual(AnnotationHelper.resolve$Path(oContext),
					"/Equipments/EQUIPMENT_2_PRODUCT/Name" + sSuffix);
			});
		});
	});

	//*********************************************************************************************
	["$AnnotationPath", "$NavigationPropertyPath", "$Path", "$PropertyPath"
	].forEach(function (sName) {
		QUnit.test("resolve$Path: " + sName + " at entity container", function (assert) {
			var oMetaModel = {
					getObject : function () {}
				},
				sPath = "/@foo/" + sName + "/@bar",
				oContext = {
					getModel : function () { return oMetaModel; },
					getPath : function () { return sPath; }
				};

			this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/" + sName)
				.returns("Me/Name");

			// code under test
			assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Me/Name/@bar");
		});
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: at property", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/Equipments/Category@foo#Q1@foobar#Q2/$Path/@baz",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/Equipments/Category@foo#Q1@foobar#Q2/$Path")
			.returns("EQUIPMENT_2_PRODUCT/Name");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext),
			"/Equipments/EQUIPMENT_2_PRODUCT/Name/@baz");
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: no slash after $Path", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/Equipments/Category@foo/$Path@bar",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/Category@foo/$Path")
			.returns("EQUIPMENT_2_PRODUCT/Name");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext),
			"/Equipments/EQUIPMENT_2_PRODUCT/Name@bar");
	});

	//*********************************************************************************************
	["$NavigationPropertyPath", "$Path", "$PropertyPath"].forEach(function (sName) {
		QUnit.test("resolve$Path: multiple " + sName, function (assert) {
			var oMetaModel = {
					getObject : function () {}
				},
				oMetaModelMock = this.mock(oMetaModel),
				// @bar is an annotation at ID itself
				sPath = "/Equipments@foo/" + sName + "@bar/" + sName + "/@baz",
				oContext = {
					getModel : function () { return oMetaModel; },
					getPath : function () { return sPath; }
				};

			//     /Equipments@foo/$*Path@bar/$*Path/@baz
			// --> /Equipments/EQUIPMENT_2_PRODUCT/ID@bar/$*Path/@baz
			// --> /Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name/@baz
			oMetaModelMock.expects("getObject").withExactArgs("/Equipments@foo/" + sName)
				.returns("EQUIPMENT_2_PRODUCT/ID");
			oMetaModelMock.expects("getObject")
				.withExactArgs("/Equipments/EQUIPMENT_2_PRODUCT/ID@bar/" + sName)
				.returns("PRODUCT_2_SUPPLIER/Supplier_Name");

			// code under test
			assert.strictEqual(AnnotationHelper.resolve$Path(oContext),
				"/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name/@baz");
		});
	});

	//*********************************************************************************************
	[
		"/Equipments/@com.sap.vocabularies.UI.v1.Facets/0/Target/$AnnotationPath",
		"/Equipments@com.sap.vocabularies.UI.v1.Facets/0/Target/$AnnotationPath"
	].forEach(function (sPath) {
		QUnit.test("resolve$Path: " + sPath, function (assert) {
			var oMetaModel = {
					getObject : function () {}
				},
				oContext = {
					getModel : function () { return oMetaModel; },
					getPath : function () { return sPath; }
				};

			this.mock(oMetaModel).expects("getObject").withExactArgs(sPath)
				.returns("EQUIPMENT_2_PRODUCT/@com.sap.vocabularies.Common.v1.QuickInfo");

			// code under test
			assert.strictEqual(AnnotationHelper.resolve$Path(oContext),
				"/Equipments/EQUIPMENT_2_PRODUCT/@com.sap.vocabularies.Common.v1.QuickInfo");
		});
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: resulting path is equivalent", function (assert) {
		var oMetaModel = new ODataMetaModel(),
			sPath = "/EMPLOYEES/@UI.Facets/2/Target/$AnnotationPath/",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1)
			.returns(SyncPromise.resolve(mScope));

		// code under test
		assert.strictEqual(oMetaModel.getObject(AnnotationHelper.resolve$Path(oContext)),
			oMetaModel.getObject(sPath));
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: empty $Path resolves to entity container", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/@foo/$Path@bar",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/$Path").returns("");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/@bar");
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: empty $Path resolves to entity set", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/Equipments@foo/$Path@bar",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments@foo/$Path")
			.returns("");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments@bar");
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: empty $Path resolves to entity type", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/Equipments/@foo/$Path@bar",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/@foo/$Path")
			.returns("");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/@bar");
	});

	//*********************************************************************************************
	QUnit.test("resolve$Path: empty $Path resolves to enclosing type", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			sPath = "/Equipments/Category@foo/$Path@bar",
			oContext = {
				getModel : function () { return oMetaModel; },
				getPath : function () { return sPath; }
			};

		this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/Category@foo/$Path")
			.returns("");

		// code under test
		assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/@bar");
	});

	// Note: only $Path may be empty and the others have additional constraints, but we are not
	// validating $metadata here!
	//*********************************************************************************************
	[undefined, null, false, true, 0, 1, {}, ["a"]].forEach(function (vValue) {
		var sTitle = "resolve$Path: cannot resolve path, unexpected value " + vValue;

		QUnit.test(sTitle, function (assert) {
				var oMetaModel = {
						getObject : function () {}
					},
					sPath = "/@foo/$Path/@bar",
					oContext = {
						getModel : function () { return oMetaModel; },
						getPath : function () { return sPath; }
					};

				this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/$Path")
					.returns(vValue);

			assert.throws(function () {
				// code under test
				AnnotationHelper.resolve$Path(oContext);
			}, new Error("Cannot resolve /@foo/$Path due to unexpected value " + vValue));
		});
	});

	//*********************************************************************************************
	[{
//TODO Unknown child ID of tea_busi.DefaultContainer at /tea_busi.DefaultContainer/EMPLOYEES@Common.Text
//		sInput : "/tea_busi.DefaultContainer/EMPLOYEES@Common.Text/$Path@Common.Label",
//		sOutput : "/tea_busi.DefaultContainer/EMPLOYEES/ID@Common.Label"
//	}, {
		sInput : "/tea_busi.Worker/ID@Common.Text/$Path@Common.Label",
		sOutput : "/tea_busi.Worker/Name@Common.Label"
	}].forEach(function (oFixture) {
		var sPath = oFixture.sInput;

		QUnit.test("resolve$Path: " + sPath, function (assert) {
			var oMetaModel = new ODataMetaModel(),
				oContext = {
					getModel : function () { return oMetaModel; },
					getPath : function () { return sPath; }
				},
				sResolvedPath;

			this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1)
				.returns(SyncPromise.resolve(mScope));
			assert.notStrictEqual(oMetaModel.getObject(sPath), undefined, "sanity check");

			// code under test
			sResolvedPath = AnnotationHelper.resolve$Path(oContext);

			assert.strictEqual(sResolvedPath, oFixture.sOutput);
			assert.strictEqual(oMetaModel.getObject(sResolvedPath), oMetaModel.getObject(sPath));
		});
	});
});
