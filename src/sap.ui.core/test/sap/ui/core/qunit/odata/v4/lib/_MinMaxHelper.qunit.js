/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_MinMaxHelper"
], function (Log, _AggregationHelper, _Cache, _MinMaxHelper) {
	/*eslint camelcase: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._MinMaxHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("createCache: success", function (assert) {
		var oAggregation = {groupLevels : []},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			// handleResponse must be at the prototype
			oCache = Object.assign(Object.create({handleResponse : sinon.stub()}), {
					sMetaPath : "/meta/path",
					mQueryOptions : {$count : "~count~", "sap-client" : "123"},
					oRequestor : {
						buildQueryString : function () {}
					},
					sResourcePath : "SalesOrderList"
				}),
			fnHandleResponse = oCache.handleResponse,
			mMeasureRange = {
				MinAndMax : {
					min : 3,
					max : 99
				},
				OnlyMin : {
					min : 7
				},
				OnlyMax : {
					max : 10
				}
			},
			mQueryOptions = oCache.mQueryOptions,
			sQueryOptionsJSON = JSON.stringify(mQueryOptions),
			oRequestor = oCache.oRequestor,
			oRequestorMock = this.mock(oRequestor),
			sResourcePath,
			oResponseRecord = {},
			oResult = { /*GET response*/
				value : [
					{
						"@odata.id" : null,
						UI5min__MinAndMax : 3,
						UI5max__MinAndMax : 99,
						UI5min__OnlyMin : 7,
						UI5max__OnlyMax : 10,
						UI5__count : "43",
						"UI5__count@odata.type" : "#Decimal"
					},
					oResponseRecord
				]
			},
			mTypeForMetaPath = {/*fetchTypes result*/};

		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(oRequestor), "resource/path",
				sinon.match.same(mQueryOptions), true)
			.returns(oCache);

		assert.strictEqual(
			// code under test
			_MinMaxHelper.createCache(oRequestor, "resource/path", oAggregation, mQueryOptions),
			oCache);
		assert.ok(oCache.hasOwnProperty("handleResponse"), "overridden");


		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
				$count : "~count~", $skip : 42, $top : 57, "sap-client" : "123"
			}, 1, false, {})
			.callsFake(function (_oAggregation, _mQueryOptions, _iLevel, _bFollowUp,
					mAlias2MeasureAndMethod) {
				Object.assign(mAlias2MeasureAndMethod, {
					UI5min__MinAndMax : {
						measure : "MinAndMax",
						method : "min"
					},
					UI5max__MinAndMax : {
						measure : "MinAndMax",
						method : "max"
					},
					UI5min__OnlyMin : {
						measure : "OnlyMin",
						method : "min"
					},
					UI5max__OnlyMax : {
						measure : "OnlyMax",
						method : "max"
					}
				});

				return "~firstQueryOptions~";
			});
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, "~firstQueryOptions~", false, true)
			.returns("?$apply=1st");

		// code under test
		sResourcePath = oCache.getResourcePathWithQuery(42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");


		// code under test
		oCache.handleResponse(42, 99, oResult, mTypeForMetaPath);

		assert.notOk(oCache.hasOwnProperty("handleResponse"), "reverted to prototype");
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(42, 99, sinon.match.same(oResult),
			sinon.match.same(mTypeForMetaPath)));
		assert.strictEqual(oResult["@odata.count"], "43");
		assert.strictEqual(oResult.value.length, 1);
		assert.strictEqual(oResult.value[0], oResponseRecord);


		// code under test
		return oCache.getMeasureRangePromise().then(function (mMeasureRange0) {
			assert.deepEqual(mMeasureRange0, mMeasureRange, "mMeasureRange");


			oAggregationHelperMock.expects("buildApply")
				.withExactArgs(sinon.match.same(oAggregation), {
					$count : "~count~", $skip : 42, $top : 57, "sap-client" : "123"
				}, 1, true, sinon.match.object)
				.returns("~followUpQueryOptions~");
			oRequestorMock.expects("buildQueryString")
				.withExactArgs(oCache.sMetaPath, "~followUpQueryOptions~", false, true)
				.returns("?$apply=2nd");

			// code under test
			sResourcePath = oCache.getResourcePathWithQuery(42, 99);

			assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
			assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");
		});
	});
});