/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/ui/base/BindingParser",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/_AnnotationHelperBasics",
	"sap/ui/model/odata/v4/_AnnotationHelperExpression",
	"sap/ui/performance/Measurement"
], function (Log, deepEqual, BindingParser, ManagedObject, SyncPromise, Basics, Expression,
		Measurement) {
	"use strict";

	var sAnnotationHelper = "sap.ui.model.odata.v4.AnnotationHelper";

	function assertRejected(assert, oSyncPromise, vExpectedReason) {
		assert.strictEqual(oSyncPromise.isRejected(), true);
		assert.strictEqual(oSyncPromise.getResult(), vExpectedReason);
		oSyncPromise.caught();
	}

	function clone(v) {
		return JSON.parse(JSON.stringify(v));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._AnnotationHelperExpression", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[//TODO $Binary, $EnumMember
		{constant : undefined, type : "Edm.Boolean",
			values : [false, true]},

		{constant : "$Date", type : "Edm.Date", expectType : "string",
			values : ["2000-01-01"]},

		{constant : "$DateTimeOffset", type : "Edm.DateTimeOffset", expectType : "string",
			values : ["2000-01-01T16:00Z"]},

		{constant : "$Decimal", type : "Edm.Decimal", expectType : "string",
			values : ["+1.1"]},

		{constant : undefined, type : "Edm.Double",
			values : [3.1415926535, Infinity, -Infinity, NaN]},
		{constant : "$Float", type : "Edm.Double",
			values : ["INF", "-INF", "NaN"]},

		//TODO {"$Duration" : "P11D23H59M59.999999999999S"}

		{constant : "$Guid", type : "Edm.Guid", expectType : "string",
			values : ["12345678-ABCD-EFab-cdef-123456789012"]},

		{constant : undefined, type : "Edm.Int32",
			values : [-9007199254740991, 0, 9007199254740991]},
		{constant : "$Int", type : "Edm.Int64", expectType : "string",
			values : ["-9007199254740992", "9007199254740992"]},

		{constant : undefined, type : "Edm.String", values : ["", "foo"]},

		{constant : "$TimeOfDay", type : "Edm.TimeOfDay", expectType : "string",
			values : ["23:59:59.123456789012"]}
	].forEach(function (oFixture) {
		oFixture.values.forEach(function (vConstantValue) {
			var oValue = {};

			function testIt(oRawValue, sProperty, vConstantValue) {
				QUnit.test("14.4.x Constant Expression: " + JSON.stringify(oRawValue),
					function (assert) {
						var oBasics = this.mock(Basics),
							oModel = {},
							oPathValue = {
								model : oModel,
								path : "/my/path",
								value : oRawValue
							},
							oExpectedResult,
							oResult;

						oBasics.expects("error").never();
						if (oFixture.expectType) {
							oBasics.expects("expectType").twice()
								.withExactArgs(sinon.match.same(oPathValue), "object");
							oBasics.expects("expectType")
								.withExactArgs({
										model : sinon.match.same(oModel),
										path : "/my/path/" + sProperty,
										value : vConstantValue
									}, oFixture.expectType);
						}

						oExpectedResult = {
							result : "constant",
							type : oFixture.type,
							value : vConstantValue
						};

						// code under test
						oResult = Expression.expression(oPathValue).unwrap();

						assert.deepEqual(oResult, oExpectedResult);
					}
				);
			}

			oValue[oFixture.constant] = vConstantValue;
			if (oFixture.constant === undefined) {
				testIt(vConstantValue, undefined, vConstantValue);
			} else {
				testIt(oValue, oFixture.constant, vConstantValue);
			}
		});
	});

	//*********************************************************************************************
[{
	input : undefined,
	output : {
		parseKeepsEmptyString : true // Note: default value
	}
}, {
	input : {
		shortLimit : 1000,
		style : "short"
	},
	output : {
		parseKeepsEmptyString : true, // Note: default value
		shortLimit : 1000,
		style : "short"
	}
}, {
	input : {
		parseKeepsEmptyString : false, // Note: will not be overruled
		shortLimit : 1000,
		style : "short"
	},
	output : {
		parseKeepsEmptyString : false,
		shortLimit : 1000,
		style : "short"
	}
}].forEach(function (oFixture, i) {
	[true, false].forEach(function (bComplexBinding) {
		var sTitle = "path: sync; bComplexBinding = " + bComplexBinding + ", " + i;

		QUnit.test(sTitle, function (assert) {
			var mConstraints = {},
				sFormatOptions = JSON.stringify(oFixture.input),
				oMetaModel = {
					fetchObject : function () {},
					getConstraints : function () {},
					getObject : function () {}
				},
				oMetaModelMock = this.mock(oMetaModel),
				sPath = "/BusinessPartnerList/@UI.LineItem/0/Value/$Path",
				oPathValue = {
					complexBinding : bComplexBinding,
					model : oMetaModel,
					path : sPath,
					value : "BusinessPartnerID"
				},
				oProperty = {
					$Type : "Edm.String"
				},
				oResult;

			this.mock(Basics).expects("expectType")
				.withExactArgs(sinon.match.same(oPathValue), "string");
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/BusinessPartnerList/@UI.LineItem/0/Value/$Path/$")
				.returns(SyncPromise.resolve(oProperty));
			oMetaModelMock.expects("getConstraints")
				.withExactArgs(sinon.match.same(oProperty), sPath)
				.exactly(bComplexBinding ? 1 : 0)
				.returns(mConstraints);
			this.mock(Expression).expects("fetchCurrencyOrUnit")
				.exactly(bComplexBinding ? 1 : 0)
				.withExactArgs(sinon.match.same(oPathValue), oPathValue.value, "Edm.String",
					sinon.match.same(mConstraints))
				.returns(undefined);
			this.mock(Expression).expects("pathResult")
				.withExactArgs(sinon.match.same(oPathValue), "Edm.String", oPathValue.value,
					sinon.match.same(bComplexBinding ? mConstraints : undefined))
				.returns("~result~");

			// code under test
			oResult = Expression.path(oPathValue).unwrap();

			assert.strictEqual(oResult, "~result~");
			assert.strictEqual(JSON.stringify(oFixture.input), sFormatOptions, "unchanged");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchCurrencyOrUnit: neither unit nor currency", function (assert) {
		var oModel = {
				getObject : function () {}
			},
			oModelMock = this.mock(oModel),
			oPathValue = {
				model : oModel,
				path : "~path~",
				value : "n/a" // sValue must be used instead!
			};

		oModelMock.expects("getObject")
			.withExactArgs("~path~@Org.OData.Measures.V1.Unit/$Path")
			.returns(undefined);
		oModelMock.expects("getObject")
			.withExactArgs("~path~@Org.OData.Measures.V1.ISOCurrency/$Path")
			.returns(undefined);

		// code under test
		assert.strictEqual(Expression.fetchCurrencyOrUnit(oPathValue, "~value~", "foo", {}),
			undefined);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bUnit) {
		[
			// no format options
			"Edm.Decimal", "Edm.Int64",
			// with format option parseAsString=false
			"Edm.Byte", "Edm.Double", "Edm.Int16", "Edm.Int32", "Edm.SByte", "Edm.Single"
		].forEach(function (sType, i) {
			[false, true].forEach(function (bSkipDecimalsValidation) {
				var sTitle = "fetchCurrencyOrUnit: " + (bUnit ? "Measure" : "Amount") + " type = "
						+ sType + " bSkipDecimalsValidation = " + bSkipDecimalsValidation;

			QUnit.test(sTitle, function (assert) {
				var oBasicsMock = this.mock(Basics),
					mConstraints = {},
					oExpressionMock = this.mock(Expression),
					oModel = {
						fetchObject : function () {},
						getConstraints : function () {},
						getObject : function () {}
					},
					oModelMock = this.mock(oModel),
					sPathForFetchObject,
					oPathValue = {
						model : oModel,
						path : "~path~",
						prefix : "~prefix~",
						value : "n/a" // sValue must be used instead!
					},
					oResult,
					oTarget = {
						$Type : "~type1~"
					},
					mUnitOrCurrencyConstraints = {},
					sValue = (bUnit ? "~unit~" : "~currency~");

				oModelMock.expects("getObject")
					.withExactArgs("~path~@Org.OData.Measures.V1.Unit/$Path")
					.returns(bUnit ? "~unit~" : undefined);
				oModelMock.expects("getObject")
					.exactly(bUnit ? 0 : 1)
					.withExactArgs("~path~@Org.OData.Measures.V1.ISOCurrency/$Path")
					.returns("~currency~");

				sPathForFetchObject = bUnit
					? "~path~@Org.OData.Measures.V1.Unit/$Path/$"
					: "~path~@Org.OData.Measures.V1.ISOCurrency/$Path/$";
				oResult = bUnit
					? {
						result : "composite",
						type : "sap.ui.model.odata.type.Unit",
						value : "{" + (i > 1 ? "formatOptions:{parseAsString:false}," : "")
							+ "mode:'TwoWay',parts:[~binding0~,~binding1~,{mode:'OneTime',"
							+ "path:'/##@@requestUnitsOfMeasure',targetType:'any'}],"
							+ "type:'sap.ui.model.odata.type.Unit'"
							+ (bSkipDecimalsValidation
								? ",constraints:{'skipDecimalsValidation':true}"
								: "")
							+ "}"
					}
					: {
						result : "composite",
						type : "sap.ui.model.odata.type.Currency",
						value : "{" + (i > 1 ? "formatOptions:{parseAsString:false}," : "")
							+ "mode:'TwoWay',parts:[~binding0~,~binding1~,{mode:'OneTime',"
							+ "path:'/##@@requestCurrencyCodes',targetType:'any'}],"
							+ "type:'sap.ui.model.odata.type.Currency'"
							+ (bSkipDecimalsValidation
								? ",constraints:{'skipDecimalsValidation':true}"
								: "")
							+ "}"
					};
				oModelMock.expects("fetchObject")
					.withExactArgs(sPathForFetchObject)
					.returns(SyncPromise.resolve(oTarget));
				oModelMock.expects("getObject")
					.withExactArgs(
						"~path~@com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasureQuantity")
					.returns(bSkipDecimalsValidation || undefined);
				oExpressionMock.expects("pathResult")
					.withExactArgs(sinon.match.same(oPathValue), sType, "~value~",
						sinon.match.same(mConstraints))
					.returns("~pathResult~");
				oBasicsMock.expects("resultToString")
					.withExactArgs("~pathResult~", false, true)
					.returns("~binding0~");
				oModelMock.expects("getConstraints")
					.withExactArgs(sinon.match.same(oTarget), sPathForFetchObject.slice(0, -2))
					.returns(mUnitOrCurrencyConstraints);
				oExpressionMock.expects("pathResult")
					.withExactArgs(sinon.match.same(oPathValue), "~type1~", sValue,
						sinon.match.same(mUnitOrCurrencyConstraints))
					.returns("~pathResultCurrencyOrUnit~");
				oBasicsMock.expects("resultToString")
					.withExactArgs("~pathResultCurrencyOrUnit~", false, true)
					.returns("~binding1~");

				// code under test
				Expression.fetchCurrencyOrUnit(oPathValue, "~value~", sType, mConstraints)
					.then(function (oResult0) {
						assert.deepEqual(oResult0, oResult);
					});
			});
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAsync) {
		QUnit.test("path: with Currency/Unit, bAsync = " + bAsync, function (assert) {
			var mConstraints = {},
				oMetaModel = {
					fetchObject : function () {},
					getConstraints : function () {}
				},
				sPath = "/ProductList/@UI.LineItem/0/Value/$Path",
				oPathValue = {
					complexBinding : true,
					model : oMetaModel,
					path : sPath
				},
				oPromise,
				oProperty = {$Type : "type"},
				oResult = {};

			this.mock(Basics).expects("expectType")
				.withExactArgs(sinon.match.same(oPathValue), "string");
			this.mock(oMetaModel).expects("fetchObject")
				.withExactArgs("/ProductList/@UI.LineItem/0/Value/$Path/$")
				.returns(SyncPromise.resolve(oProperty));
			this.mock(oMetaModel).expects("getConstraints")
				.withExactArgs(sinon.match.same(oProperty), sPath)
				.returns(mConstraints);
			this.mock(Expression).expects("fetchCurrencyOrUnit")
				.withExactArgs(sinon.match.same(oPathValue), oPathValue.value, "type",
					sinon.match.same(mConstraints))
				.returns(SyncPromise.resolve(bAsync ? Promise.resolve(oResult) : oResult));

			// code under test
			oPromise = Expression.path(oPathValue);

			assert.strictEqual(oPromise.isPending(), bAsync);

			return oPromise.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchDateTimeWithTimezone: no timezone", function (assert) {
		var oModel = {
				getObject : function () {}
			},
			oModelMock = this.mock(oModel),
			oPathValue = {
				model : oModel,
				path : "~path~"
			};

		oModelMock.expects("getObject")
			.withExactArgs("~path~@com.sap.vocabularies.Common.v1.Timezone/$Path")
			.returns(undefined);

		// code under test
		assert.strictEqual(
			Expression.fetchDateTimeWithTimezone(oPathValue, "~value~", {}),
			undefined
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchDateTimeWithTimezone", function (assert) {
		var sAnnotationTargetPath = "~path~@com.sap.vocabularies.Common.v1.Timezone/$Path",
			oBasicsMock = this.mock(Basics),
			oExpressionMock = this.mock(Expression),
			oModel = {
				fetchObject : function () {},
				getConstraints : function () {},
				getObject : function () {}
			},
			oPathValue = {
				model : oModel,
				path : "~path~",
				prefix : "~prefix~",
				value : "n/a" // sValue must be used instead!
			},
			oTarget = {
				$Type : "~type1~"
			};

		this.mock(oModel).expects("getObject")
			.withExactArgs(sAnnotationTargetPath)
			.returns("~timezone~");
		this.mock(oModel).expects("fetchObject")
			.withExactArgs(sAnnotationTargetPath + "/$")
			.returns(SyncPromise.resolve(oTarget));
		oExpressionMock.expects("pathResult")
			.withExactArgs(sinon.match.same(oPathValue), "Edm.DateTimeOffset", "~value~",
				"~constraints~")
			.returns("~pathResult~");
		oBasicsMock.expects("resultToString")
			.withExactArgs("~pathResult~", false, true)
			.returns("~binding0~");
		this.mock(oModel).expects("getConstraints")
			.withExactArgs(sinon.match.same(oTarget), sAnnotationTargetPath)
			.returns("~timezoneConstraints~");
		oExpressionMock.expects("pathResult")
			.withExactArgs(sinon.match.same(oPathValue), "~type1~", "~timezone~",
				"~timezoneConstraints~")
			.returns("~pathResultTimezone~");
		oBasicsMock.expects("resultToString")
			.withExactArgs("~pathResultTimezone~", false, true)
			.returns("~binding1~");

		// code under test
		Expression.fetchDateTimeWithTimezone(oPathValue, "~value~", "~constraints~")
			.then(function (oResult) {
				assert.deepEqual(oResult, {
					result : "composite",
					type : "sap.ui.model.odata.type.DateTimeWithTimezone",
					value : "{mode:'TwoWay',parts:[~binding0~,~binding1~]"
						+ ",type:'sap.ui.model.odata.type.DateTimeWithTimezone'}"
				});
			});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAsync) {
		QUnit.test("path: with timezone, bAsync = " + bAsync, function (assert) {
			var oMetaModel = {
					fetchObject : function () {},
					getConstraints : function () {}
				},
				sPath = "/ProductList/@UI.LineItem/0/Value/$Path",
				oPathValue = {
					complexBinding : true,
					model : oMetaModel,
					path : sPath
				},
				oPromise,
				oProperty = {$Type : "Edm.DateTimeOffset"};

			this.mock(Basics).expects("expectType")
				.withExactArgs(sinon.match.same(oPathValue), "string");
			this.mock(oMetaModel).expects("fetchObject")
				.withExactArgs(sPath + "/$")
				.returns(SyncPromise.resolve(oProperty));
			this.mock(oMetaModel).expects("getConstraints")
				.withExactArgs(sinon.match.same(oProperty), sPath)
				.returns("~constraints~");
			this.mock(Expression).expects("fetchDateTimeWithTimezone")
				.withExactArgs(sinon.match.same(oPathValue), oPathValue.value, "~constraints~")
				.returns(SyncPromise.resolve(bAsync ? Promise.resolve("~result~") : "~result~"));

			// code under test
			oPromise = Expression.path(oPathValue);

			assert.strictEqual(oPromise.isPending(), bAsync);

			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, "~result~");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("path fails sync, 'uncaught (in promise)' expected", function (assert) {
		var oError = new Error("foo"),
			fnListener = SyncPromise.listener,
			oMetaModel = {
				fetchObject : function () {}
			},
			oPathValue = {
				model : oMetaModel,
				path : "/BusinessPartnerList/@UI.LineItem/0/Value/$Path",
				value : "BusinessPartnerID"
			},
			oResult,
			oSyncPromiseMock = sinon.mock(SyncPromise);

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs(oPathValue.path + "/$")
			.returns(SyncPromise.reject(oError));
		try {
			if (!fnListener) {
				SyncPromise.listener = function () {};
			}
			oSyncPromiseMock.expects("listener").never(); // path() must not call SyncPromise#caught

			// code under test
			oResult = Expression.path(oPathValue);
		} finally {
			oSyncPromiseMock.restore(); // Note: SyncPromise#then internally calls #caught
			SyncPromise.listener = fnListener;
		}

		return oResult.then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("path still synchronous", function (assert) {
		var oMetaModel = {
				fetchObject : function () {}
			},
			oPathValue = {
				model : oMetaModel,
				path : "/BusinessPartnerList/@UI.LineItem/0/Value/$Path",
				value : "BusinessPartnerID"
			},
			oResult;

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs(oPathValue.path + "/$")
			.returns(SyncPromise.resolve(Promise.reject(new Error("foo"))));
		this.mock(Expression).expects("fetchCurrencyOrUnit").never();
		this.mock(Expression).expects("pathResult")
			.withExactArgs(sinon.match.same(oPathValue), undefined, /* "foo" not yet available */
				oPathValue.value, undefined)
			.returns("~result~");

		// code under test
		oResult = Expression.path(oPathValue).unwrap();

		assert.strictEqual(oResult, "~result~");
	});

	//*********************************************************************************************
	QUnit.test("path asynchronous", function (assert) {
		var oMetaModel = {
				fetchObject : function () {}
			},
			oPathValue = {
				model : oMetaModel,
				path : "/BusinessPartnerList/@UI.LineItem/0/Value/$Path",
				value : "BusinessPartnerID",
				$$valueAsPromise : true
			},
			oPromise;

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/BusinessPartnerList/@UI.LineItem/0/Value/$Path/$")
			.returns(SyncPromise.resolve(Promise.resolve({$Type : "Edm.Foo"})));
		this.mock(Expression).expects("fetchCurrencyOrUnit").never();
		this.mock(Expression).expects("pathResult")
			.withExactArgs(sinon.match.same(oPathValue), "Edm.Foo", oPathValue.value, undefined)
			.returns("~result~");

		// code under test
		oPromise = Expression.path(oPathValue).unwrap();

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, "~result~");
		});
	});

	//*********************************************************************************************
[{
	sInputValue : "_it/_ShipToParty/isHidden",
	sValue : "_ShipToParty/isHidden"
}, {
	sInputValue : "_its/_ShipToParty/isHidden",
	sValue : "_its/_ShipToParty/isHidden"
// Note: AH.format is used for property bindings only, not for context bindings; thus an empty path
// (behind the binding parameter's name) is not supported
//}, {
//  sInputValue : "_it",
//  sOutputValue : "~prefix~",
//  sValue : ""
}].forEach(function (oFixture) {
	var sTitle = "path: add prefix, but ignore first segment; " + oFixture.sInputValue;

	QUnit.test(sTitle, function (assert) {
		var mConstraints = {},
			oMetaModel = {
				fetchObject : function () {},
				getConstraints : function () {}
			},
			oPathValue = {
				complexBinding : true,
				ignoreAsPrefix : "_it/",
				model : oMetaModel,
				path : "/T€AMS/name.space.OverloadedAction@Core.OperationAvailable/$Path",
				value : oFixture.sInputValue,
				$$valueAsPromise : true
			},
			oPromise,
			oProperty = {$Type : "Edm.Foo"};

		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/T€AMS/name.space.OverloadedAction@Core.OperationAvailable/$Path/$")
			.returns(SyncPromise.resolve(Promise.resolve(oProperty)));
		this.mock(oMetaModel).expects("getConstraints")
			.withExactArgs(sinon.match.same(oProperty), oPathValue.path)
			.returns(mConstraints);
		this.mock(Expression).expects("fetchCurrencyOrUnit")
			.withExactArgs(sinon.match.same(oPathValue), oFixture.sValue, "Edm.Foo",
				sinon.match.same(mConstraints))
			.returns(undefined); // no currency/unit found
		this.mock(Expression).expects("pathResult")
			.withExactArgs(sinon.match.same(oPathValue), "Edm.Foo", oFixture.sValue,
				sinon.match.same(mConstraints))
			.returns("~result~");

		// code under test
		oPromise = Expression.path(oPathValue).unwrap();

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, "~result~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("pathResult: not Edm.String", function (assert) {
		var mConstraints = {},
			oPathValue = {
				formatOptions : {},
				parameters : {},
				prefix : "~prefix~"
			},
			oResult;

		// code under test
		oResult = Expression.pathResult(oPathValue, "Edm.SomeType", "path", mConstraints);

		assert.strictEqual(oResult.constraints, mConstraints);
		assert.strictEqual(oResult.formatOptions, oPathValue.formatOptions);
		assert.strictEqual(oResult.parameters, oPathValue.parameters);
		assert.strictEqual(oResult.result, "binding");
		assert.strictEqual(oResult.type, "Edm.SomeType");
		assert.strictEqual(oResult.value, oPathValue.prefix + "path");
	});

	//*********************************************************************************************
[{
	pathValue : undefined,
	result : {parseKeepsEmptyString : true}
}, {
	pathValue : {foo : "bar"},
	result : {foo : "bar", parseKeepsEmptyString : true}
}, {
	pathValue : {foo : "bar", parseKeepsEmptyString : false},
	result : {foo : "bar", parseKeepsEmptyString : false}
}].forEach(function (oFixture) {
	QUnit.test("pathResult: Edm.String, " + oFixture.pathValue, function (assert) {
		var mConstraints = {},
			oPathValue = {
				formatOptions : oFixture.pathValue,
				parameters : {},
				prefix : "~prefix~"
			},
			oResult;

		// code under test
		oResult = Expression.pathResult(oPathValue, "Edm.String", "path", mConstraints);

		assert.strictEqual(oResult.constraints, mConstraints);
		assert.deepEqual(oResult.formatOptions, oFixture.result);
		assert.strictEqual(oResult.parameters, oPathValue.parameters);
		assert.strictEqual(oResult.result, "binding");
		assert.strictEqual(oResult.type, "Edm.String");
		assert.strictEqual(oResult.value, oPathValue.prefix + "path");
	});
});

	//*********************************************************************************************
	//TODO $AnnotationPath, $NavigationPropertyPath
["$Name", "$Path", "$PropertyPath"].forEach(function (sProperty) {
	var oRawValue = {};

	oRawValue[sProperty] = "foo";

	QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
		var oPathValue = {value : oRawValue},
			oSubPathValue = {},
			oResult = {/*SyncPromise*/};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), sProperty)
			.returns(oSubPathValue);
		this.mock(Expression).expects("path")
			.withExactArgs(sinon.match.same(oSubPathValue))
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});
});

	//*********************************************************************************************
	QUnit.test("expression: $kind is 'Property'", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			oPathValue = {
				foo : "bar",
				model : oMetaModel,
				path : "/SomeEntity/SomeProperty",
				value : {
					$kind : "Property"
				}
			},
			oResult = {/*SyncPromise*/};

		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/SomeEntity/SomeProperty@sapui.name")
			.returns("SomeProperty");
		this.mock(Expression).expects("path")
			.withExactArgs({
				foo : "bar",
				model : sinon.match.same(oMetaModel),
				path : "/SomeEntity/SomeProperty",
				value : "SomeProperty"
			})
			.returns(oResult);

		// code under test
		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	QUnit.test("expression: error for $LabeledElement", function (assert) {
		var oError = new SyntaxError(),
			oPathValue = {
				value : {
					$LabeledElement : {/**/},
					$Name : "Team"
				}
			};

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Unsupported OData expression",
				sAnnotationHelper)
			.throws(oError);

		assertRejected(assert, Expression.expression(oPathValue), oError);
	});

	//*********************************************************************************************
	QUnit.test("expression: {$Apply : []}", function (assert) {
		var oPathValue = {value : {$Apply : [], $Function : "foo"}},
			oSubPathValue = {},
			oResult = {/*SyncPromise*/};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$Apply")
			.returns(oSubPathValue);
		this.mock(Expression).expects("apply")
			.withExactArgs(sinon.match.same(oPathValue),
				sinon.match.same(oSubPathValue))
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	QUnit.test("expression: []", function (assert) {
		var oPathValue = {value : []},
			oResult = {/*SyncPromise*/};

		this.mock(Expression).expects("collection").withExactArgs(sinon.match.same(oPathValue))
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	QUnit.test("expression: {$If : []}", function (assert) {
		var oPathValue = {value : {$If : []}},
			oSubPathValue = {},
			oResult = {/*SyncPromise*/};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$If")
			.returns(oSubPathValue);
		this.mock(Expression).expects("conditional")
			.withExactArgs(sinon.match.same(oSubPathValue), "bInCollection")
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue, "bInCollection"), oResult);
	});

	//*********************************************************************************************
	["$And", "$Eq", "$Ge", "$Gt", "$Le", "$Lt", "$Ne", "$Or"].forEach(function (sOperator) {
		var oRawValue = {},
			oOperatorValue = {};

		oRawValue[sOperator] = oOperatorValue;

		QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
			var oPathValue = {
					complexBinding : true,
					path : "/my/path",
					value : oRawValue
				},
				oSubPathValue = {
					complexBinding : true,
					path : "/my/path/" + sOperator,
					value : oOperatorValue
				},
				oResult = {/*SyncPromise*/};

			this.mock(Expression).expects("operator")
				.withExactArgs(oSubPathValue, sOperator.slice(1))
				.returns(oResult);

			// code under test
			assert.strictEqual(Expression.expression(oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("expression: {$Not : {}}", function (assert) {
		var oOperatorValue = {},
			oPathValue = {
				complexBinding : true,
				path : "/my/path",
				value : {$Not : oOperatorValue}
			},
			oSubPathValue = {
				complexBinding : true,
				path : "/my/path/$Not",
				value : oOperatorValue
			},
			oResult = {/*SyncPromise*/};

		this.mock(Expression).expects("not")
			.withExactArgs(oSubPathValue).returns(oResult);

		// code under test
		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	[null, {$Null : null}].forEach(function (oRawValue) {
		QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
			var oPathValue = {path : "/my/path", value : oRawValue};

			assert.deepEqual(Expression.expression(oPathValue).unwrap(), {
				result : "constant",
				type : "edm:Null",
				value : null
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("expression: unknown", function (assert) {
		var oError = new SyntaxError(),
			oPathValue = {value : {}};

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Unsupported OData expression",
				sAnnotationHelper)
			.throws(oError);

		assertRejected(assert, Expression.expression(oPathValue), oError);
	});
	//TODO $Cast, $IsOf, $LabeledElement, $LabeledElementReference, $UrlRef
	//TODO 14.5.5 Expression Collection, 14.5.14 Expression Record

	//*********************************************************************************************
	QUnit.test("String constants {@i18n>...} turned into a binding", function (assert) {
		assert.deepEqual(Expression.constant({value : "{@i18n>foo/bar}"}, "String"), {
			ignoreTypeInPath : true,
			result : "binding",
			type : "Edm.String",
			value : "@i18n>foo/bar"
		});
	});

	//*********************************************************************************************
	QUnit.test("Only simple binding syntax allowed for {@i18n>...}", function (assert) {
		/*
		 * @param {string} sValue
		 */
		function check(sValue) {
			assert.deepEqual(Expression.constant({value : sValue}, "String"), {
				result : "constant",
				type : "Edm.String",
				value : sValue
			});
		}

		// leading/trailing whitespace or empty path
		[" {@i18n>foo/bar}", "{@i18n>foo/bar} ", "{@i18n>}"].forEach(function (sValue) {
			check(sValue);
		});

		// Bad chars would need escaping and complex syntax... Keep it simple!
		// (see _AnnotationHelperBasics: rBadChars)
		["\\", "{", "}", ":"].forEach(function (sBadChar) {
			check("{@i18n>foo" + sBadChar + "bar}");
		});
	});

	//*********************************************************************************************
	QUnit.test("apply: unknown function", function (assert) {
		var oError = new SyntaxError(),
			oPathValue = {path : "/my/path", value : {$Apply : [], $Function : "foo"}},
			oPathValueFunction = {value : oPathValue.value.$Function},
			oBasics = this.mock(Basics);

		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$Function", "string")
			.returns(oPathValueFunction);
		oBasics.expects("error")
			.withExactArgs(sinon.match.same(oPathValueFunction), "unknown function: foo",
				sAnnotationHelper)
			.throws(oError);

		assertRejected(assert, Expression.apply(oPathValue), oError);
	});

	//*********************************************************************************************
	["concat", "fillUriTemplate", "uriEncode"].forEach(function (sName) {
		QUnit.test("apply: " + sName, function (assert) {
			var oPathValue = {},
				oResult = {/*SyncPromise*/},
				oPathValueParameters = {};

			this.mock(Basics).expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), "$Function", "string")
				.returns({value : "odata." + sName});
			this.mock(Expression).expects(sName)
				.withExactArgs(sinon.match.same(oPathValueParameters))
				.returns(oResult);

			assert.strictEqual(
				Expression.apply(oPathValue, oPathValueParameters), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("uriEncode: Edm.String", function (assert) {
		var oPathValue = {},
			oResultParameter = {
				result : "binding",
				type : "Edm.String",
				value : "path"
			};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0)
			.returns(SyncPromise.resolve(oResultParameter));
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResultParameter), true, false, true).callThrough();

		assert.deepEqual(Expression.uriEncode(oPathValue).unwrap(), {
			result : "expression",
			type : "Edm.String",
			value : "odata.uriEncode(%{path},'Edm.String')"
		});
	});
	//TODO Edm.Binary, Edm.Duration

	//*********************************************************************************************
	QUnit.test("uriEncode: not Edm.String", function (assert) {
		var oPathValue = {},
			oResultParameter = {
				result : "binding",
				type : "Edm.NotAString",
				value : "path"
			};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0)
			.returns(SyncPromise.resolve(oResultParameter));
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResultParameter), true, false, true).callThrough();

		assert.deepEqual(Expression.uriEncode(oPathValue).unwrap(), {
			result : "expression",
			type : "Edm.String",
			value : "String(%{path})"
		});
	});

	//*********************************************************************************************
	QUnit.test("wrapExpression", function (assert) {
		assert.deepEqual(Expression.wrapExpression({result : "binding", value : "path"}),
				{result : "binding", value : "path"});
		assert.deepEqual(Expression.wrapExpression({result : "composite", value : "{a}{b}"}),
				{result : "composite", value : "{a}{b}"});
		assert.deepEqual(Expression.wrapExpression({result : "constant", value : "42"}),
				{result : "constant", value : "42"});
		assert.deepEqual(Expression.wrapExpression({result : "expression", value : "%{test)?-1:1"}),
				{result : "expression", value : "(%{test)?-1:1)"});
	});

	//*********************************************************************************************
	QUnit.test("collection: empty", function (assert) {
		var oPathValue = {value : []};

		this.mock(Basics).expects("expectType")
			.withExactArgs(sinon.match.same(oPathValue), "array");

		// code under test
		assert.deepEqual(Expression.collection(oPathValue).unwrap(), {
			result : "expression",
			value : "odata.collection([])"
		});
	});

	//*********************************************************************************************
	QUnit.test("collection: non-empty", function (assert) {
		var oBasicsMock = this.mock(Basics),
			oExpressionMock = this.mock(Expression),
			oPathValue = {
				// Note: we use strings instead of dummy objects to avoid sinon.match.same
				value : ["{A}", "{B}", "{C}"]
			},
			oPromise;

		oBasicsMock.expects("expectType").withExactArgs(sinon.match.same(oPathValue), "array");
		oBasicsMock.expects("descend").withExactArgs(sinon.match.same(oPathValue), 0, true)
			.returns("{0}");
		oExpressionMock.expects("expression").withExactArgs("{0}", true)
			.returns(SyncPromise.resolve(Promise.resolve("{a}")));
		oBasicsMock.expects("descend").withExactArgs(sinon.match.same(oPathValue), 1, true)
			.returns("{1}");
		oExpressionMock.expects("expression").withExactArgs("{1}", true)
			.returns(SyncPromise.resolve(Promise.resolve("{b}")));
		oBasicsMock.expects("descend").withExactArgs(sinon.match.same(oPathValue), 2, true)
			.returns("{2}");
		oExpressionMock.expects("expression").withExactArgs("{2}", true)
			.returns(SyncPromise.resolve(Promise.resolve("{c}")));

		// code under test
		oPromise = Expression.collection(oPathValue);

		assert.strictEqual(oPromise.isPending(), true);
		oBasicsMock.expects("resultToString").withExactArgs("{a}", true, false, true).returns("a");
		oBasicsMock.expects("resultToString").withExactArgs("{b}", true, false, true).returns("b");
		oBasicsMock.expects("resultToString").withExactArgs("{c}", true, false, true).returns("c");

		return oPromise.then(function (oResult) {
			assert.deepEqual(oResult, {
				result : "expression",
				value : "odata.collection([a,b,c])"
			});
		});
	});

	//*********************************************************************************************
	function conditional(bP1isNull, bP2isNull, bComplexBinding, sType) {
		var sTitle = "conditional: " + bP1isNull + ", " + bP2isNull + ", bComplexBinding = "
				+ bComplexBinding;

		QUnit.test(sTitle, function (assert) {
			var oBasics = this.mock(Basics),
				oExpectedPathValue = {
					complexBinding : false,
					foo : "bar",
					value : [0, 1/*, 2*/]
				},
				oExpression = this.mock(Expression),
				oPathValue = {
					complexBinding : bComplexBinding,
					foo : "bar",
					value : [0, 1/*, 2*/] // length 2 is unrealistic, but must not matter here!
				},
				oNullParameter = {result : "constant", type : "edm:Null", value : "null"},
				oParameter0 = {result : "expression", value : "A"},
				oParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "B"},
				oParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "C"},
				oWrappedParameter0 = {result : "expression", value : "(A)"},
				oWrappedParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "(B)"},
				oWrappedParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "(C)"};

			oExpression.expects("parameter")
				.withExactArgs(bComplexBinding
					? oExpectedPathValue
					: sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
					0, "Edm.Boolean")
				.returns(SyncPromise.resolve(oParameter0));
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1)
				.returns(SyncPromise.resolve(oParameter1));
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 2)
				.returns(SyncPromise.resolve(oParameter2));

			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter0)).returns(oWrappedParameter0);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter1)).returns(oWrappedParameter1);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter2)).returns(oWrappedParameter2);

			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter0), true, false, true)
				.returns("(A)");
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter1), true,
					sinon.match.same(oPathValue.complexBinding), undefined)
				.returns(oWrappedParameter1.value);
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter2), true,
					sinon.match.same(oPathValue.complexBinding), undefined)
				.returns(oWrappedParameter2.value);

			// code under test
			assert.deepEqual(Expression.conditional(oPathValue).unwrap(), {
				result : "expression",
				type : sType || "foo",
				value : "(A)?" + oWrappedParameter1.value + ":" + oWrappedParameter2.value
			});

			assert.strictEqual(oPathValue.complexBinding, bComplexBinding, "unchanged");
		});
	}

	conditional(false, false, true);
	conditional(false, false, false);
	conditional(true, false, true);
	conditional(true, false, false);
	conditional(false, true, true);
	conditional(false, true, false);
	conditional(true, true, true, "edm:Null");
	conditional(true, true, false, "edm:Null");

	//*********************************************************************************************
	QUnit.test("conditional: w/ incorrect types", function (assert) {
		var oExpression = this.mock(Expression),
			oPathValue = {value : [0, 1, 2]},
			oParameter0 = {},
			oParameter1 = {type : "foo"},
			oParameter2 = {type : "bar"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, "Edm.Boolean")
			.returns(SyncPromise.resolve(oParameter0));
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 1)
			.returns(SyncPromise.resolve(oParameter1));
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 2)
			.returns(SyncPromise.resolve(oParameter2));

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue),
				"Expected same type for second and third parameter, types are 'foo' and 'bar'",
				sAnnotationHelper)
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.conditional(oPathValue).unwrap();
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("conditional: w/o else as direct child of collection", function (assert) {
		var oBasicsMock = this.mock(Basics),
			oCondition = {},
			oExpressionMock = this.mock(Expression),
			oPathValue = {
				value : ["condition", "then"/*, no "else"*/]
			},
			oThen = {type : "then's type"},
			oWrappedCondition = {},
			oWrappedElse = {},
			oWrappedThen = {};

		oExpressionMock.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, "Edm.Boolean")
			.returns(SyncPromise.resolve(oCondition));
		oExpressionMock.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 1)
			.returns(SyncPromise.resolve(oThen));
		oExpressionMock.expects("wrapExpression")
			.withExactArgs(sinon.match.same(oCondition)).returns(oWrappedCondition);
		oBasicsMock.expects("resultToString")
			.withExactArgs(sinon.match.same(oWrappedCondition), true, false, true)
			.returns("(condition)");
		oExpressionMock.expects("wrapExpression")
			.withExactArgs(sinon.match.same(oThen)).returns(oWrappedThen);
		oBasicsMock.expects("resultToString")
			.withExactArgs(sinon.match.same(oWrappedThen), true, undefined, undefined)
			.returns("(then)");
		oExpressionMock.expects("wrapExpression")
			.withExactArgs({result : "constant", type : "edm:Null", value : undefined})
			.returns(oWrappedElse);
		oBasicsMock.expects("resultToString")
			.withExactArgs(sinon.match.same(oWrappedElse), true, undefined, undefined)
			.returns("(undefined)");

		// code under test
		assert.deepEqual(Expression.conditional(oPathValue, /*bInCollection*/true).unwrap(), {
			result : "expression",
			type : "then's type",
			value : "(condition)?(then):(undefined)"
		});
	});

	//*********************************************************************************************
	[{
		title : "composite binding",
		asExpression : false,
		expression : false,
		parameter2 : {result : "constant", type : "Edm.String", value : "{foo}"},
		parameter2ToString : "\\{foo\\}",
		result : {result : "composite", value : "\\{foo\\}"}
	}, {
		title : "composite binding w/ null",
		asExpression : false,
		expression : false,
		parameter2 : {result : "constant", type : "edm:Null", value : "null"},
		result : {result : "composite", value : ""}
	}, {
		title : "expression binding",
		asExpression : true,
		expression : true,
		parameter2 : {result : "constant", type : "Edm.String", value : "foo\\bar"},
		parameter2ToString : "'foo\\\\bar'",
		result : {result : "expression", value : "+'foo\\\\bar'"}
	}, {
		title : "expression binding w/ null",
		asExpression : true,
		expression : true,
		parameter2 : {result : "constant", type : "edm:Null", value : "null"},
		result : {result : "expression", value : ""}
	}, {
		title : "expression parameter",
		asExpression : false,
		expression : true,
		parameter2 : {result : "expression", type : "Edm.String", value : "%{foo}?42:23"},
		parameter2ToString : "(%{foo}?42:23)",
		result : {result : "expression", value : "+(%{foo}?42:23)"}
	}].forEach(function (oFixture) {
		QUnit.test("concat: " + oFixture.title, function (assert) {
			var oBasicsMock = this.mock(Basics),
				sBinding = "{path}",
				oExpression = this.mock(Expression),
				bComplexBinding = {/* boolean */},
				oPathValue = {
					asExpression : oFixture.asExpression,
					complexBinding : bComplexBinding,
					value : [{}, {}]
				},
				oParameter1 = {result : "binding", type : "Edm.String", value : "path"},
				sParameter1Result = (oFixture.expression ? "$" : "") + sBinding,
				oParameter2 = clone(oFixture.parameter2);

			oBasicsMock.expects("expectType")
				.withExactArgs(sinon.match.same(oPathValue), "array");
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0)
				.returns(SyncPromise.resolve(oParameter1));
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1)
				.returns(SyncPromise.resolve(oParameter2));
			oBasicsMock.expects("resultToString")
				.withExactArgs(sinon.match.same(oParameter1), oFixture.expression,
					sinon.match.same(bComplexBinding))
				.returns(sParameter1Result);
			oBasicsMock.expects("resultToString")
				.withExactArgs(sinon.match.same(oParameter2), oFixture.expression,
					sinon.match.same(bComplexBinding))
				.exactly(oFixture.parameter2ToString ? 1 : 0)
				.returns(oFixture.parameter2ToString);

			assert.deepEqual(Expression.concat(oPathValue).unwrap(), {
				result : oFixture.result.result,
				type : "Edm.String",
				value : sParameter1Result + oFixture.result.value
			});
		});
	});

	//*********************************************************************************************

	QUnit.test("fillUriTemplate: template only", function (assert) {
		var oPathValue = {complexBinding : true, value : ["template"]},
			oParameterResult = {
				result : "constant",
				type : "Edm.String",
				value : oPathValue.value[0]
			};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				0, "Edm.String")
			.returns(SyncPromise.resolve(oParameterResult));

		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oParameterResult), true, false, true)
			.callThrough();

		// code under test
		assert.deepEqual(Expression.fillUriTemplate(oPathValue).unwrap(), {
			result : "expression",
			type : "Edm.String",
			value : "odata.fillUriTemplate('template',{})"
		});
	});
	//TODO "The odata.fillUriTemplate standard client-side function takes two or more expressions as
	// arguments and returns a value of type Edm.String." --> we could drop this test?!

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with one parameter", function (assert) {
		var oBasicsMock = this.mock(Basics),
			oExpression = this.mock(Expression),
			oParameterResultTemplate = {
				result : "expression",
				type : "Edm.String",
				value : "'template({p0})'"
			},
			oPathValue = {
				complexBinding : true,
				path : "/my/path",
				value : [
					{/*this could be an arbitrary expression*/},
					{
						$LabeledElement : {
							$Path : "parameter"
						},
						$Name : "p0"
					}
				]
			},
			oPathValueParameter1 = {
				complexBinding : false,
				path : "/my/path/1",
				value : oPathValue.value[1]
			},
			oPathValueParameter1Expression = {
				result : "binding",
				type : "Edm.String",
				value : "parameter"
			},
			oPathValueParameter1LabeledElement = {
				complexBinding : false,
				path : "/my/path/1/$LabeledElement",
				value : oPathValue.value[1].$LabeledElement
			};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				0, "Edm.String")
			.returns(SyncPromise.resolve(oParameterResultTemplate));
		oBasicsMock.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				1, "object")
			.returns(oPathValueParameter1);
		oBasicsMock.expects("descend")
			.withExactArgs(sinon.match.same(oPathValueParameter1), "$LabeledElement", true)
			.returns(oPathValueParameter1LabeledElement);
		oExpression.expects("expression")
			.withExactArgs(sinon.match.same(oPathValueParameter1LabeledElement))
			.returns(SyncPromise.resolve(oPathValueParameter1Expression));
		oBasicsMock.expects("resultToString")
			.withExactArgs(sinon.match.same(oParameterResultTemplate), true, false, true)
			.callThrough();
		oBasicsMock.expects("property")
			.withExactArgs(sinon.match.same(oPathValueParameter1), "$Name", "string")
			.returns(oPathValueParameter1.value.$Name);
		oBasicsMock.expects("resultToString")
			.withExactArgs(sinon.match.same(oPathValueParameter1Expression), true, false, true)
			.callThrough();

		// code under test
		assert.deepEqual(Expression.fillUriTemplate(oPathValue).unwrap(), {
			result : "expression",
			type : "Edm.String",
			value : "odata.fillUriTemplate('template({p0})',{'p0':%{parameter}})"
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with two parameters", function (assert) {
		var oExpression = this.mock(Expression),
			oPathValue = {
				path : "/my/path",
				value : [
					"template({p0},{p1})",
					{
						$LabeledElement : {
							$Path : "parameter"
						},
						$Name : "p0"
					},
					{
						$LabeledElement : "foo",
						$Name : "p1"
					}
				]
			};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				0, "Edm.String")
			.returns(SyncPromise.resolve({
				result : "constant",
				type : "Edm.String",
				value : oPathValue.value[0]
			}));
		oExpression.expects("expression").withExactArgs({
				asExpression : true,
				complexBinding : false,
				path : "/my/path/1/$LabeledElement",
				value : oPathValue.value[1].$LabeledElement
			}).returns(SyncPromise.resolve({
				result : "binding",
				type : "Edm.String",
				value : "parameter"
			}));
		oExpression.expects("expression").withExactArgs({
				asExpression : true,
				complexBinding : false,
				path : "/my/path/2/$LabeledElement",
				value : oPathValue.value[2].$LabeledElement
			}).returns(SyncPromise.resolve({
				result : "constant",
				type : "Edm.String",
				value : "foo"
			}));

		assert.deepEqual(Expression.fillUriTemplate(oPathValue).unwrap(), {
			result : "expression",
			type : "Edm.String",
			value : "odata.fillUriTemplate('template({p0},{p1})',{'p0':%{parameter},'p1':'foo'})"
		});
	});

	//*********************************************************************************************
	[{
		parameter : {result : "binding", type : "Edm.Boolean", value : "path"},
		value : "!%{path}"
	}, {
		parameter : {result : "expression", type : "Edm.Boolean", value : "!%{path}"},
		parameterWrapped : {result : "expression", type : "Edm.Boolean", value : "(!%{path})"},
		value : "!(!%{path})"
	}].forEach(function (oFixture) {
		QUnit.test("Not", function (assert) {
			var oExpectedResult = {
					result : "expression",
					type : "Edm.Boolean",
					value : oFixture.value
				},
				oPathValue = {
					complexBinding : true,
					path : "/foo"
				},
				oWrapResult = oFixture.parameterWrapped
					? oFixture.parameterWrapped
					: oFixture.parameter;

			this.mock(Expression).expects("expression")
				.withExactArgs({asExpression : true, complexBinding : false, path : "/foo"})
				.returns(SyncPromise.resolve(oFixture.parameter));
			this.mock(Expression).expects("wrapExpression")
				.withExactArgs(sinon.match.same(oFixture.parameter))
				.returns(oWrapResult);
			this.mock(Basics).expects("resultToString")
				.withExactArgs(sinon.match.same(oWrapResult), true, false, true)
				.callThrough();

			assert.deepEqual(Expression.not(oPathValue).unwrap(), oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{i : {result : "binding", category : "boolean", value : "foo"}, o : "{foo}"},
		{i : {result : "constant", category : "string", value : "foo"}, o : "foo"}
	].forEach(function (oFixture) {
		[false, true].forEach(function (bWrap) {
			var sTitle = "formatOperand: " + JSON.stringify(oFixture) + ", bWrap = " + bWrap;

			QUnit.test(sTitle, function (assert) {
				if (bWrap) {
					this.mock(Expression).expects("wrapExpression")
						.withExactArgs(sinon.match.same(oFixture.i))
						.returns(oFixture.i);
				}
				this.mock(Basics).expects("resultToString")
					.withExactArgs(sinon.match.same(oFixture.i), true, false, true)
					.returns(oFixture.o);

				assert.strictEqual(Expression.formatOperand(oFixture.i, bWrap), oFixture.o);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: simple constants", function (assert) {
		assert.strictEqual(Expression.formatOperand({
				result : "constant",
				category : "boolean",
				value : true
			}, true), "true");
		assert.strictEqual(Expression.formatOperand({
				result : "constant",
				category : "number",
				value : 42
			}, true), "42");
	});

	//*********************************************************************************************
	QUnit.test("adjustOperands", function (assert) {
		var oP11 = {result : "binding", type : "Edm.Int32", category : "number"},
			oP12 = {result : "constant", type : "Edm.Int64", category : "Decimal"},
			oP31 = {result : "binding", type : "Edm.Int64", category : "Decimal"},
			oP32 = {result : "constant", type : "Edm.Int32", category : "number"},
			oP41 = {result : "binding", type : "Edm.Decimal", category : "Decimal"},
			oP42 = {result : "constant", type : "Edm.Int32", category : "number"},
			mTypes = {
				"Edm.Boolean" : "boolean",
				"Edm.Date" : "Date",
				"Edm.DateTimeOffset" : "DateTimeOffset",
				"Edm.Decimal" : "Decimal",
				"Edm.Int32" : "number",
				"Edm.Int64" : "Decimal",
				"Edm.String" : "string",
				"Edm.TimeOfDay" : "TimeOfDay"
			},
			aResults = ["binding", "constant"];

		function isActiveCase(o1, o2) {
			return (deepEqual(o1, oP11) && deepEqual(o2, oP12))
				|| (deepEqual(o1, oP31) && deepEqual(o2, oP32))
				|| (deepEqual(o1, oP41) && deepEqual(o2, oP42));
		}

		aResults.forEach(function (sResult1) {
			aResults.forEach(function (sResult2) {
				Object.keys(mTypes).forEach(function (sType1) {
					Object.keys(mTypes).forEach(function (sType2) {
						var oParameter1
								= {result : sResult1, type : sType1, category : mTypes[sType1]},
							oParameter2
								= {result : sResult2, type : sType2, category : mTypes[sType2]},
							sText = JSON.stringify(oParameter1) + " op "
								+ JSON.stringify(oParameter2);

						if (!isActiveCase(oParameter1, oParameter2)) {
							Expression.adjustOperands(oParameter1, oParameter2);
							assert.deepEqual({
								p1 : oParameter1,
								p2 : oParameter2
							}, {
								p1 : {result : sResult1, type : sType1, category : mTypes[sType1]},
								p2 : {result : sResult2, type : sType2, category : mTypes[sType2]}
							}, sText);
						}
					});
				});
			});
		});

		Expression.adjustOperands(oP11, oP12);
		assert.deepEqual({
			p1 : oP11,
			p2 : oP12
		}, {
			p1 : {result : "binding", type : "Edm.Int32", category : "number"},
			p2 : {result : "constant", type : "Edm.Int64", category : "number"}
		}, "special case 1");

		Expression.adjustOperands(oP31, oP32);
		assert.deepEqual({
			p1 : oP31,
			p2 : oP32
		}, {
			p1 : {result : "binding", type : "Edm.Int64", category : "Decimal"},
			p2 : {result : "constant", type : "Edm.Int64", category : "Decimal"}
		}, "special case 3");

		Expression.adjustOperands(oP41, oP42);
		assert.deepEqual({
			p1 : oP41,
			p2 : oP42
		}, {
			p1 : {result : "binding", type : "Edm.Decimal", category : "Decimal"},
			p2 : {result : "constant", type : "Edm.Decimal", category : "Decimal"}
		}, "special case 3");
	});

	//*********************************************************************************************
	[
		{text : "And", operator : "&&", type : "Edm.Boolean"},
		{text : "Eq", operator : "==="},
		{text : "Ge", operator : ">="},
		{text : "Gt", operator : ">"},
		{text : "Le", operator : "<="},
		{text : "Lt", operator : "<"},
		{text : "Ne", operator : "!=="},
		{text : "Or", operator : "||", type : "Edm.Boolean"}
	].forEach(function (oFixture) {
		QUnit.test("operator " + oFixture.text, function (assert) {
			var oPathValue = {},
				oParameter0 = {
					result : "binding",
					type : oFixture.type || "Edm.String",
					value : "path1"
				},
				oParameter1 = {
					result : "expression",
					type : oFixture.type || "Edm.String",
					value : "!%{path2}"
				},
				oExpectedResult = {
					result : "expression",
					type : "Edm.Boolean",
					value : "%{path1}" + oFixture.operator + "(!%{path2})"
				},
				oExpression = this.mock(Expression);

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					oFixture.type)
				.returns(SyncPromise.resolve(oParameter0));
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1,
					oFixture.type)
				.returns(SyncPromise.resolve(oParameter1));

			// code under test
			assert.deepEqual(Expression.operator(oPathValue, oFixture.text).unwrap(),
				oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{type : "Edm.Boolean", category : "boolean", compare : false},
		{type : "Edm.Byte", category : "number", compare : false},
		{type : "Edm.Date", category : "Date", compare : false},
		{type : "Edm.DateTimeOffset", category : "DateTimeOffset", compare : true},
		{type : "Edm.Decimal", category : "Decimal", compare : true},
		{type : "Edm.Double", category : "number", compare : false},
		{type : "Edm.Guid", category : "string", compare : false},
		{type : "Edm.Int16", category : "number", compare : false},
		{type : "Edm.Int32", category : "number", compare : false},
		{type : "Edm.Int64", category : "Decimal", compare : true},
		{type : "Edm.SByte", category : "number", compare : false},
		{type : "Edm.Single", category : "number", compare : false},
		{type : "Edm.String", category : "string", compare : false},
		{type : "Edm.TimeOfDay", category : "TimeOfDay", compare : false}
	].forEach(function (oFixture) {
		QUnit.test("operator Eq on " + oFixture.type, function (assert) {
			var oExpression = this.mock(Expression),
				oPathValue = {},
				oParameter0 = {type : oFixture.type},
				oParameter1 = {type : oFixture.type},
				sExpectedResult = oFixture.compare ? "odata.compare(p0,p1)===0" : "p0===p1";

			if (oFixture.category === "Decimal") {
				sExpectedResult = "odata.compare(p0,p1,'Decimal')===0";
			} else if (oFixture.category === "DateTimeOffset") {
				sExpectedResult = "odata.compare(p0,p1,'DateTime')===0";
			}
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					undefined)
				.returns(SyncPromise.resolve(oParameter0));
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1,
					undefined)
				.returns(SyncPromise.resolve(oParameter1));

			oExpression.expects("adjustOperands")
				.withExactArgs(sinon.match.same(oParameter0), sinon.match.same(oParameter1));
			oExpression.expects("adjustOperands")
				.withExactArgs(sinon.match.same(oParameter1), sinon.match.same(oParameter0));

			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oParameter0), !oFixture.compare)
				.returns("p0");
			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oParameter1), !oFixture.compare)
				.returns("p1");

			// code under test
			assert.deepEqual(Expression.operator(oPathValue, "Eq").unwrap(),
				{result : "expression", type : "Edm.Boolean", value : sExpectedResult});

			assert.strictEqual(oParameter0.category, oFixture.category);
			assert.strictEqual(oParameter1.category, oFixture.category);
		});
	});
	//TODO how to compare edm:Null to any other value?

	//*********************************************************************************************
	QUnit.test("operator: mixed types", function (assert) {
		var oExpression = this.mock(Expression),
			oPathValue = {complexBinding : true},
			oParameter0 = {type : "Edm.String"},
			oParameter1 = {type : "Edm.Boolean"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				0, undefined)
			.returns(SyncPromise.resolve(oParameter0));
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
				1, undefined)
			.returns(SyncPromise.resolve(oParameter1));

		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter0), sinon.match.same(oParameter1));
		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter1), sinon.match.same(oParameter0));

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Expected two comparable parameters "
				+ "but instead saw Edm.String and Edm.Boolean", sAnnotationHelper)
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.operator(oPathValue, "Eq").unwrap();
		}, SyntaxError);
	});

	//*********************************************************************************************
	function compareWithNull(sType0, sType1, sResult0, sResult1) {
		var sResult = sResult0 + "===" + sResult1;

		QUnit.test("operator: " + sResult, function (assert) {
			var oExpression = this.mock(Expression),
			oPathValue = {complexBinding : true},
			oParameter0 = {type : sType0},
			oParameter1 = {type : sType1};

			oExpression.expects("parameter")
				.withExactArgs(
					sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
					0, undefined)
				.returns(SyncPromise.resolve(oParameter0));
			oExpression.expects("parameter")
				.withExactArgs(
					sinon.match.same(oPathValue).and(sinon.match({complexBinding : false})),
					1, undefined)
				.returns(SyncPromise.resolve(oParameter1));

			oExpression.expects("adjustOperands").never();

			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oParameter0), true)
				.returns(sResult0);
			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oParameter1), true)
				.returns(sResult1);

			assert.deepEqual(Expression.operator(oPathValue, "Eq").unwrap(),
				{result : "expression", type : "Edm.Boolean", value : sResult});
		});
	}

	compareWithNull("Edm.String", "edm:Null", "p0", "null");
	compareWithNull("edm:Null", "Edm.String", "null", "p1");
	// TODO learn about operator precedence and avoid unnecessary "()" around expressions

	//*********************************************************************************************
	QUnit.test("parameter: w/o type expectation", function (assert) {
		var oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {};

		this.mock(Expression).expects("expression").withExactArgs(oPathValueParameter)
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(Expression.parameter(oPathValue, 0).unwrap(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ correct type", function (assert) {
		var oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {type : "Edm.String"};

		this.mock(Expression).expects("expression").withExactArgs(oPathValueParameter)
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(Expression.parameter(oPathValue, 0, "Edm.String").unwrap(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ incorrect type", function (assert) {
		var oError = new SyntaxError(),
			oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {type : "Edm.Guid"};

		this.mock(Expression).expects("expression").withExactArgs(oPathValueParameter)
			.returns(SyncPromise.resolve(oResult));
		this.mock(Basics).expects("error")
			.withExactArgs(oPathValueParameter, "Expected Edm.String but instead saw Edm.Guid",
				sAnnotationHelper)
			.throws(oError);

		assertRejected(assert, Expression.parameter(oPathValue, 0, "Edm.String"), oError);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: success", function (assert) {
		var bComplexBinding = {/* boolean */},
			oPathValue = {complexBinding : bComplexBinding, value : 42},
			oResult = {},
			sResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.returns(SyncPromise.resolve(oResult));
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResult), false, sinon.match.same(bComplexBinding))
			.returns(sResult);

		assert.strictEqual(Expression.getExpression(oPathValue), sResult);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: async", function (assert) {
		var bComplexBinding = {/* boolean */},
			oPathValue = {complexBinding : bComplexBinding, value : 42},
			oPromise,
			oResult = {},
			sResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.returns(SyncPromise.resolve(Promise.resolve(oResult)));
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResult), false, sinon.match.same(bComplexBinding))
			.returns(sResult);

		// code under test
		oPromise = Expression.getExpression(oPathValue);

		assert.ok(oPromise instanceof Promise, "native promise to be used by API");

		return oPromise.then(function (vResult) {
			assert.strictEqual(vResult, sResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("getExpression: error", function (assert) {
		var oPathValue = {value : 42};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.returns(SyncPromise.reject(new SyntaxError()));
		this.mock(Basics).expects("toErrorString")
			.withExactArgs(sinon.match.same(oPathValue.value))
			.returns("~");
		this.mock(BindingParser.complexParser).expects("escape")
			.withExactArgs("~")
			.returns("###");

		assert.strictEqual(Expression.getExpression(oPathValue), "Unsupported: ###");
	});

	//*********************************************************************************************
	QUnit.test("getExpression: failure", function (assert) {
		var oError = {},
			oPathValue = {value : 42};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.returns(SyncPromise.reject(oError));

		assert.throws(function () {
			Expression.getExpression(oPathValue);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: undefined SHOULD return undefined", function (assert) {
		var oPathValue = {value : undefined}; // "code under test"

		this.mock(Basics).expects("resultToString").never();
		this.mock(Basics).expects("toErrorString").never();
		this.mock(Expression).expects("expression").never();

		assert.strictEqual(Expression.getExpression(oPathValue), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: complex binding mode is disabled", function () {
		var oPathValue = {value : 42},
			oParser = ManagedObject.bindingParser;

		this.oLogMock.expects("warning")
			.withExactArgs(
				"Complex binding syntax not active", null, "sap.ui.model.odata.v4.AnnotationHelper")
			.once(); // just a single warning, no matter how many calls to getExpression()!

		// preparation
		ManagedObject.bindingParser = BindingParser.simpleParser;

		try {
			// code under test
			Expression.getExpression(oPathValue);
			Expression.getExpression(oPathValue);
		} finally {
			// clean up
			ManagedObject.bindingParser = oParser;
		}
	});

	//*********************************************************************************************
	QUnit.test("getExpression: Performance measurement points, success", function () {
		this.mock(Measurement).expects("average")
			.withExactArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression", "",
				["sap.ui.model.odata.v4.AnnotationHelper"]);
		this.mock(Expression).expects("expression").returns(SyncPromise.resolve({}));
		this.mock(Measurement).expects("end")
			.withExactArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression");

		// code under test
		Expression.getExpression({value : 42});
	});

	//*********************************************************************************************
	QUnit.test("getExpression: Performance measurement points, error", function () {
		this.mock(Measurement).expects("average")
			.withExactArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression", "",
				["sap.ui.model.odata.v4.AnnotationHelper"]);
		this.mock(Expression).expects("expression").returns(SyncPromise.reject(new SyntaxError()));
		this.mock(Measurement).expects("end")
			.withExactArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression");

		// code under test
		Expression.getExpression({value : 42});
	});
});
