/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataUtils"
], function (jQuery, BaseODataUtils, _Helper, ODataUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataUtils", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("compare: basics", function (assert) {
		var vValue1 = {},
			vValue2 = {};

		this.mock(BaseODataUtils).expects("compare")
			.withExactArgs(sinon.match.same(vValue1), sinon.match.same(vValue2))
			.returns(42);

		assert.strictEqual(ODataUtils.compare(vValue1, vValue2), 42);
	});

	//*********************************************************************************************
	QUnit.test("compare: true", function (assert) {
		var vValue1 = {},
			vValue2 = {};

		this.mock(BaseODataUtils).expects("compare")
			.withExactArgs(sinon.match.same(vValue1), sinon.match.same(vValue2), true/*bAsDecimal*/)
			.returns(42);

		// legacy V2 signature as called via ExpressionParser from old _AnnotationHelperExpression
		assert.strictEqual(ODataUtils.compare(vValue1, vValue2, true), 42);
	});

	//*********************************************************************************************
	QUnit.test("compare: Decimal", function (assert) {
		var vValue1 = {},
			vValue2 = {};

		this.mock(BaseODataUtils).expects("compare")
			.withExactArgs(sinon.match.same(vValue1), sinon.match.same(vValue2), true/*bAsDecimal*/)
			.returns(42);

		assert.strictEqual(ODataUtils.compare(vValue1, vValue2, "Decimal"), 42);
	});

	//*********************************************************************************************
	QUnit.test("parseDate", function (assert) {
		assert.strictEqual(ODataUtils.parseDate("2000-01-01").getTime(), Date.UTC(2000, 0, 1));

		[
			"20000101",
			"2000-01-01T16:00:00Z",
			"2000-00-01",
			"2000-13-01",
			"2000-01-00",
			"2000-01-32",
			"2000-02-30",
			// Note: negative year values not supported at SAP
			"-0006-12-24", "-6-12-24"
		].forEach(function (sDate) {
			assert.throws(function () {
				ODataUtils.parseDate(sDate);
			}, new Error("Not a valid Edm.Date value: " + sDate), sDate);
		});
	});

	//*********************************************************************************************
	QUnit.test("parseDateTimeOffset", function (assert) {
		assert.strictEqual(
			ODataUtils.parseDateTimeOffset("2015-03-08T19:32:56.123456789012+02:00").getTime(),
			Date.UTC(2015, 2, 8, 17, 32, 56, 123));

		[
			"2000-01-01T16:00Z",
			"2000-01-01t16:00:00z",
			"2000-01-01T16:00:00.0Z",
			"2000-01-01T16:00:00.000Z",
			"2000-01-02T01:00:00.000+09:00",
			"2000-01-02T06:00:00.000+14:00", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
			"2000-01-01T16:00:00.000456789012Z"
		].forEach(function (sDateTimeOffset) {
			assert.strictEqual(
				ODataUtils.parseDateTimeOffset(sDateTimeOffset).getTime(),
				Date.UTC(2000, 0, 1, 16, 0, 0, 0),
				sDateTimeOffset);
		});

		[
			"2000-02-30T16:00Z",
			"2000-02-30T17:32:56.123456789012",
			"2000-01-01",
			"2000-01-32T16:00:00.000Z",
			"2000-01-01T16:00:00.1234567890123Z",
			"2000-01-01T16:00:00.000+14:01", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
			"2000-01-01T16:00:00.000+00:60",
			"2000-01-01T16:00:00.000~00:00",
			"2000-01-01T16:00:00.Z",
			// Note: negative year values not supported at SAP
			"-0006-12-24T00:00:00Z",
			"-6-12-24T16:00:00Z"
		].forEach(function (sDateTimeOffset) {
			assert.throws(function () {
				ODataUtils.parseDateTimeOffset(sDateTimeOffset);
			}, new Error("Not a valid Edm.DateTimeOffset value: " + sDateTimeOffset),
			sDateTimeOffset);
		});
	});

	//*********************************************************************************************
	QUnit.test("parseTimeOfDay", function (assert) {
		assert.strictEqual(ODataUtils.parseTimeOfDay("23:59:59.123456789012").getTime(),
			Date.UTC(1970, 0, 1, 23, 59, 59, 123));

		[
			"23:59",
			"23:59:59",
			"23:59:59.1",
			"23:59:59.123",
			"23:59:59.123456789012"
		].forEach(function (sTimeOfDay) {
			var oDate = ODataUtils.parseTimeOfDay(sTimeOfDay);

			assert.strictEqual(oDate.getUTCHours(), 23, sTimeOfDay);
			assert.strictEqual(oDate.getUTCMinutes(), 59, sTimeOfDay);
		});

		[
			"23",
			"23:60",
			"23:59:60",
			"24:00:00",
			"23:59:59.1234567890123"
		].forEach(function (sTimeOfDay) {
			assert.throws(function () {
				ODataUtils.parseTimeOfDay(sTimeOfDay);
			}, new Error("Not a valid Edm.TimeOfDay value: " + sTimeOfDay),
			sTimeOfDay);
		});
	});

	//*********************************************************************************************
	QUnit.test("compare: DateTime", function (assert) {
		var oDate1 = {},
			oDate2 = {},
			oODataUtilsMock = this.mock(ODataUtils);

		oODataUtilsMock.expects("parseDateTimeOffset").withExactArgs("foo").returns(oDate1);
		oODataUtilsMock.expects("parseDateTimeOffset").withExactArgs("bar").returns(oDate2);
		this.mock(BaseODataUtils).expects("compare")
			.withExactArgs(sinon.match.same(oDate1), sinon.match.same(oDate2))
			.returns(42);

		assert.strictEqual(ODataUtils.compare("foo", "bar", "DateTime"), 42);
	});

	//*********************************************************************************************
	QUnit.test("formatLiteral", function (assert) {
		this.mock(_Helper).expects("formatLiteral")
			.withExactArgs(42, "foo")
			.returns("bar");

		assert.strictEqual(ODataUtils.formatLiteral(42, "foo"), "bar");
	});
});
//TODO from https://www.w3.org/TR/xmlschema11-2/#vp-dt-timezone:
// "Values from any one date/time datatype using the seven-component model (all except duration)
// are ordered the same as their ·timeOnTimeline· values, except that if one value's
// ·timezoneOffset· is absent and the other's is not, and using maximum and minimum ·timezoneOffset·
// values for the one whose ·timezoneOffset· is actually absent changes the resulting (strict)
// inequality, the original two values are incomparable." (this is inherited by OData V4)