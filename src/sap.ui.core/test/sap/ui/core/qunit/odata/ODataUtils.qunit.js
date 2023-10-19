/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/CalendarType",
	"sap/ui/core/Configuration",
	'sap/ui/model/odata/ODataUtils',
	'sap/ui/model/Filter',
	'sap/ui/model/odata/Filter',
	'sap/ui/model/FilterOperator'
], function(CalendarType, Configuration, ODataUtils, Filter, ODataFilter, FilterOperator) {

	"use strict";

	function time(iMillis) {
		return {
			__edmType: "Edm.Time",
			ms: iMillis
		};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataUtils", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		}
	});

	//*********************************************************************************************
	QUnit.test("formatValue", function(assert) {
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		var oDateTime = new Date(Date.UTC(2015, 4, 30, 13, 47, 26)),
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oDateTimeMs = new Date(Date.UTC(2015, 4, 30, 13, 47, 26, 253)),
			oTime = time(49646000);

		[
			// t: the tested type
			// v: the value to format
			// r: the expected result
			// d: test description
			{t: "Edm.String", v: "test", r: "'test'", d: "simple text"},
			{t: "Edm.String", v: "te'st", r: "'te''st'", d: "text with single quote"},
			{t: "Edm.Time", v: "PT13H47M26S", r: "time'PT13H47M26S'", d: "time as string"},
			{t: "Edm.Time", v: oTime, r: "time'PT13H47M26S'", d: "time as object"},
			{t: "Edm.DateTime", v: "May 30, 2015 1:47:26 PM UTC", r: "datetime'2015-05-30T13:47:26'", d: "datetime as string"},
			{t: "Edm.DateTime", v: "2015-05-30T13:47:26.253Z", r: "datetime'2015-05-30T13:47:26.253'", d: "datetime as string including milliseconds"},
			{t: "Edm.DateTime", v: oDateTime, r: "datetime'2015-05-30T13:47:26'", d: "datetime as object"},
			{t: "Edm.DateTime", v: oDateTimeMs, r: "datetime'2015-05-30T13:47:26.253'", d: "datetime as object including milliseconds"},
			{t: "Edm.DateTimeOffset", v: "May 30, 2015 1:47:26 PM UTC", r: "datetimeoffset'2015-05-30T13:47:26Z'", d: "datetime as string"},
			{t: "Edm.DateTimeOffset", v: oDateTime, r: "datetimeoffset'2015-05-30T13:47:26Z'", d: "datetime as object"},
			{t: "Edm.Guid", v: "936DA01F-9ABD-4D9D-80C7-02AF85C822A8", r: "guid'936DA01F-9ABD-4D9D-80C7-02AF85C822A8'", d: ""},
			{t: "Edm.Decimal", v: 3.46 , r: "3.46m", d: ""},
			{t: "Edm.Byte", v: 67, r: "67", d: ""},
			{t: "Edm.Int16", v: 4567, r: "4567", d: ""},
			{t: "Edm.Int32", v: 34567, r: "34567", d: ""},
			{t: "Edm.Int64", v: 234567, r: "234567l", d: ""},
			{t: "Edm.SByte", v: -67, r: "-67", d: ""},
			{t: "Edm.Double", v: 3.46, r: "3.46d", d: ""},
			{t: "Edm.Float", v: 3.46, r: "3.46f", d: ""},
			{t: "Edm.Single", v: 3.46, r: "3.46f", d: ""},
			{t: "Edm.Binary", v: "1qkYNhtk/P5uvZ0N2zAUsiScDJA=", r: "binary'1qkYNhtk/P5uvZ0N2zAUsiScDJA='", d: ""},
			{t: "Edm.Boolean", v: true, r: "true", d: ""}
		].forEach(function (oFixture) {
			assert.equal(ODataUtils.formatValue(oFixture.v, oFixture.t), oFixture.r, oFixture.t + " format " + oFixture.d);
		});
	});

	QUnit.test("formatValue with different CalendarType", function(assert) {
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		var oDateTime = new Date(Date.UTC(2015, 4, 30, 13, 47, 26)),
			sOldCalendarType = Configuration.getCalendarType(),
			oTime = time(49646000);

		Configuration.setCalendarType(CalendarType.Japanese);
		[
			// t: the tested type
			// v: the value to format
			// r: the expected result
			// d: test description
			{t: "Edm.Time", v: "PT13H47M26S", r: "time'PT13H47M26S'", d: "time as string"},
			{t: "Edm.Time", v: oTime, r: "time'PT13H47M26S'", d: "time as object"},
			{t: "Edm.DateTime", v: "May 30, 2015 1:47:26 PM UTC", r: "datetime'2015-05-30T13:47:26'", d: "datetime as string"},
			{t: "Edm.DateTime", v: "2015-05-30T13:47:26.253Z", r: "datetime'2015-05-30T13:47:26.253'", d: "datetime as string including milliseconds"},
			{t: "Edm.DateTime", v: oDateTime, r: "datetime'2015-05-30T13:47:26'", d: "datetime as object"},
			{t: "Edm.DateTimeOffset", v: "May 30, 2015 1:47:26 PM UTC", r: "datetimeoffset'2015-05-30T13:47:26Z'", d: "datetime as string"},
			{t: "Edm.DateTimeOffset", v: oDateTime, r: "datetimeoffset'2015-05-30T13:47:26Z'", d: "datetime as object"}
		].forEach(function (oFixture) {
			assert.equal(ODataUtils.formatValue(oFixture.v, oFixture.t), oFixture.r, oFixture.t + " format " + oFixture.d);
		});
		Configuration.setCalendarType(sOldCalendarType);
	});

	//*********************************************************************************************
	QUnit.test("parseValue", function(assert) {
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		var oDateTime = new Date(Date.UTC(2015, 4, 30, 13, 47, 26)),
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oDateTimeMs = new Date(Date.UTC(2015, 4, 30, 13, 47, 26, 253)),
			oTime = time(49646000);

		// v: value to format; r: expected result; t: tested type; d: test description
		[
			// simple types
			{v: "'test'", r: "test", t: "Edm.String", d: "- simple text"},
			{v: "'te''st'", r: "te'st", t: "Edm.String", d: "- text with single quote"},
			{
				v: "guid'936DA01F-9ABD-4D9D-80C7-02AF85C822A8'",
				r: "936DA01F-9ABD-4D9D-80C7-02AF85C822A8",
				t: "Edm.Guid"
			},
			{
				v: "binary'1qkYNhtk/P5uvZ0N2zAUsiScDJA='",
				r: "1qkYNhtk/P5uvZ0N2zAUsiScDJA=",
				t: "Edm.Binary"
			},
			{v: "true", r: true, t: "Edm.Boolean", d: "- 'true'"},
			{v: "false", r: false, t: "Edm.Boolean", d: "- 'false'"},
			{v: "null", r: null, t: "'null'", d: "value"},
			// numeric types
			{v: "3.46m", r: "3.46", t: "Edm.Decimal"},
			{v: "67", r: 67, t: "Edm.Byte"},
			{v: "4567", r: 4567, t: "Edm.Int16"},
			{v: "34567", r: 34567, t: "Edm.Int32"},
			{v: "234567l", r: "234567", t: "Edm.Int64"},
			{v: "-67", r: -67, t: "Edm.SByte"},
			{v: "3.46d", r: "3.46", t: "Edm.Double"},
			{v: "3.46f", r: "3.46", t: "Edm.Single"},
			// date / time types
			{v: "time'PT13H47M26S'", r: oTime, t: "Edm.Time"},
			{v: "datetime'2015-05-30T13:47:26'", r: oDateTime, t: "Edm.DateTime"},
			{
				v: "datetime'2015-05-30T13:47:26.253'",
				r: oDateTimeMs,
				t: "Edm.DateTime",
				d: "with ms"
			},
			{v: "datetimeoffset'2015-05-30T13:47:26Z'", r: oDateTime, t: "Edm.DateTimeOffset"}
			//TODO Edm.Binary with "X'"", should not occur due to normalization
			//TODO Edm.Binary with case insensitive "bInAry'"
			//TODO Edm.Boolean with "0"/"1" cannot be distingushed from number types without knowing
			// the type
			//TODO Capital letters for Decimal, Double, Int64 and Single shoud not occur due to
			// normalization
			//TODO "Nan", "-INF" and "INF" can occur in Single and Double according to
			// 2.2.2 Abstract Type Szstem in OData V2 spec
		].forEach(function (oFixture) {
			assert.deepEqual(ODataUtils.parseValue(oFixture.v), oFixture.r,
				oFixture.t + " " + (oFixture.d || ""));
			assert.deepEqual(ODataUtils.formatValue(ODataUtils.parseValue(oFixture.v), oFixture.t),
				oFixture.v, oFixture.t + " " + (oFixture.d || ""));
		});

		assert.throws(function () {
			ODataUtils.parseValue("dummy");
		}, new Error("Cannot parse value 'dummy', no Edm type found"));
	});

	//*********************************************************************************************
	QUnit.test("parseValue with different CalendarType", function(assert) {
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		var oDateTime = new Date(Date.UTC(2015, 4, 30, 13, 47, 26)),
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oDateTimeMs = new Date(Date.UTC(2015, 4, 30, 13, 47, 26, 253)),
			sOldCalendarType = Configuration.getCalendarType(),
			oTime = time(49646000);

		Configuration.setCalendarType(CalendarType.Japanese);

		// v: value to format; r: expected result; t: tested type; d: test description
		[
			{v: "time'PT13H47M26S'", r: oTime, t: "Edm.Time"},
			{v: "datetime'2015-05-30T13:47:26'", r: oDateTime, t: "Edm.DateTime"},
			{
				v: "datetime'2015-05-30T13:47:26.253'",
				r: oDateTimeMs,
				t: "Edm.DateTime",
				d: "with ms"
			},
			{v: "datetimeoffset'2015-05-30T13:47:26Z'", r: oDateTime, t: "Edm.DateTimeOffset"}
		].forEach(function (oFixture) {
			assert.deepEqual(ODataUtils.parseValue(oFixture.v), oFixture.r,
				oFixture.t + " " + (oFixture.d || ""));
			assert.deepEqual(ODataUtils.formatValue(ODataUtils.parseValue(oFixture.v), oFixture.t),
				oFixture.v, oFixture.t + " " + (oFixture.d || ""));
		});
		Configuration.setCalendarType(sOldCalendarType);
	});

	QUnit.test("compare", function (assert) {
		var iDate1 = Date.UTC(2015, 4, 26),
			iDate2 = Date.UTC(2015, 4, 30),
			iTime1 = Date.UTC(1970, 0, 1, 12, 47, 36),
			iTime2 = Date.UTC(1970, 0, 1, 12, 47, 49);

		[
			// t: the tested type
			// s1, s2: the same value twice (in case different instances can have the same value)
			// gt: a value that is greater than s1
			// d: a test description prefix (t is taken if d is not given)
			{t: "Edm.Boolean", s1: false, s2: false, gt: true},
			{t: "Edm.Byte", s1: 0, s2: 0, gt: 1},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.Date", s1: new Date(iDate1), s2: new Date(iDate1), gt: new Date(iDate2)},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.Date", s1: new Date(iDate1), s2: iDate1, gt: iDate2, d: "Edm.Date+millis"},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.Date", s1: iDate1, s2: new Date(iDate1), gt: new Date(iDate2),
				d: "millis+Edm.Date"},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTime", s1: new Date(iDate1), s2: new Date(iDate1), gt: new Date(iDate2)},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTime", s1: new Date(iDate1), s2: iDate1, gt: iDate2,
				d: "Edm.DateTime+millis"},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTime", s1: iDate1, s2: new Date(iDate1), gt: new Date(iDate2),
				d: "millis+Edm.DateTime"},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTimeOffset", s1: new Date(iDate1), s2: new Date(iDate1),
				// no need to use UI5Date.getInstance as only the UTC timestamp is used
				gt: new Date(iDate2)},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTimeOffset", s1: new Date(iDate1), s2: iDate1, gt: iDate2,
				d: "Edm.DateTimeOffset+millis"},
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			{t: "Edm.DateTimeOffset", s1: iDate1, s2: new Date(iDate1), gt: new Date(iDate2),
				d: "millis+Edm.DateTimeOffset"},
			{t: "Edm.Double", s1: 0, s2: 0, gt: 1},
			{t: "Edm.Float", s1: 0, s2: 0, gt: 1},
			{t: "Edm.Guid", s1: "bar", s2: "bar", gt: "foo"},
			{t: "Edm.Int16", s1: 0, s2: 0, gt: 1},
			{t: "Edm.Int32", s1: 0, s2: 0, gt: 1},
			{t: "Edm.SByte", s1: 0, s2: 0, gt: 1},
			{t: "Edm.Single", s1: 0, s2: 0, gt: 1},
			{t: "Edm.String", s1: "bar", s2: "bar", gt: "foo"},
			{t: "Edm.Time", s1: time(iTime1), s2: time(iTime1), gt: time(iTime2)},
			{t: "Edm.Time", s1: time(iTime1), s2: iTime1, gt: iTime2, d: "Edm.Time+millis"},
			{t: "Edm.Time", s1: iTime1, s2: time(iTime1), gt: time(iTime2), d: "millis+Edm.Time"}
		].forEach(function (oFixture) {
			var sDesc = oFixture.d || oFixture.t;

			function testCompare(fnComparator) {
				assert.strictEqual(fnComparator(oFixture.s1 , oFixture.s2), 0, sDesc + ": s === s");
				assert.strictEqual(fnComparator(oFixture.s1 , oFixture.gt), -1, sDesc + ": s < gt");
				assert.strictEqual(fnComparator(oFixture.gt , oFixture.s2), 1, sDesc + ": gt > s");

				assert.ok(isNaN(fnComparator(oFixture.s1, null)), sDesc + ": s, null");
				assert.ok(isNaN(fnComparator(null, oFixture.s2)), sDesc + ": null, s");
				assert.ok(isNaN(fnComparator(oFixture.s1, undefined)), sDesc + ": s, undefined");
				assert.ok(isNaN(fnComparator(undefined, oFixture.s2)), sDesc + ": undefined, s");

				assert.strictEqual(fnComparator(null, null), 0, sDesc + ": null,null");
				assert.strictEqual(fnComparator(undefined, undefined), 0,
					sDesc + ": undefined,undefined");
			}

			testCompare(ODataUtils.compare);
			testCompare(ODataUtils.getComparator(oFixture.t));
		});
	});

	//*********************************************************************************************
	QUnit.test("compare as decimal", function (assert) {
		var fnDecimal = ODataUtils.getComparator("Edm.Decimal"),
			fnInt64 = ODataUtils.getComparator("Edm.Int64");

		assert.strictEqual(fnDecimal, fnInt64, "functions identical, no need to test Int64 separately");

		[
			{p1: "11", p2: "2", r: 1, t: "first is longer"},
			{p1: "2", p2: "11", r: -1, t: "second is longer"},
			{p1: "11", p2: "12", r: -1, t: "same length 1"},
			{p1: "12", p2: "11", r: 1, t: "same length 2"},

			{p1: "-1", p2: "2", r: -1, t: "first is negative"},
			{p1: "2", p2: "-1", r: 1, t: "second is negative"},
			{p1: "+2", p2: "2", r: 0, t: "first has + sign"},
			{p1: "2", p2: "+2", r: 0, t: "second has + sign"},
			{p1: "+2", p2: "-2", r: 1, t: "+ and -"},

			{p1: "02.10", p2: "2.1", r: 0, t: "excess zeroes"},
			{p1: "2.0", p2: "2", r: 0, t: "unnecessary decimals"},
			{p1: "200", p2: "199", r: 1, t: "significant trailing zeroes"},

			{p1: "1.2", p2: "1.456", r: -1, t: "both have decimals"},
			{p1: "1.234", p2: "2", r: -1, t: "first has decimals"},

			{p1: "-1.2", p2: "-1.45", r: 1, t: "both are negative"},

			{p1: null, p2: "-1", r: NaN, t: "p1 is null"},
			{p1: "-1", p2: null, r: NaN, t: "p2 is null"},
			{p1: null, p2: null, r: 0, t: "both are null"},
			{p1: undefined, p2: "-1", r: NaN, t: "p1 is undefined"},
			{p1: "-1", p2: undefined, r: NaN, t: "p2 is undefined"},
			{p1: undefined, p2: undefined, r: 0, t: "both are undefined"},
			{p1: "foo", p2: "-1", r: NaN, t: "p1 not a decimal"},
			{p1: "-1", p2: "foo", r: NaN, t: "p2 not a decimal"},

			// do not accept anything but string, esp. not numbers
			{p1: -1, p2: "-1", r: NaN, t: "p1 is a number"},
			{p1: "-1", p2: -1, r: NaN, t: "p2 is a number"}
		].forEach(function (oFixture) {
			if (isNaN(oFixture.r)) {
				assert.ok(isNaN(ODataUtils.compare(oFixture.p1, oFixture.p2, true)), oFixture.t);
				assert.ok(isNaN(fnDecimal(oFixture.p1, oFixture.p2)), oFixture.t);
				assert.ok(isNaN(fnInt64(oFixture.p1, oFixture.p2)), oFixture.t);
			} else {
				assert.strictEqual(ODataUtils.compare(oFixture.p1, oFixture.p2, true),
					oFixture.r, oFixture.t);
				assert.strictEqual(fnDecimal(oFixture.p1, oFixture.p2), oFixture.r, oFixture.t);
			}
		});
	});

	QUnit.test("setOrigin - argument configuration", function (assert) {
		// one string argument after service url
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=XYZ_999/", "aLiAsS"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=XYZ_999/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/", "aLiAsS"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=aLiAsS/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=XYZ_999/?sap-client=400&myParam=abc", "aLiAsS"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=XYZ_999/?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=XYZ_999/?sap-client=400&myParam=abc", "aLiAsS"), "/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=XYZ_999/?sap-client=400&myParam=abc");

		// simple cases
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/", {alias: "ABC_543"}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=ABC_543/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/?sap-client=400&myParam=abc", {alias: "ABC_543"}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=ABC_543/?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION?sap-client=400&myParam=abc", {alias: "ABC_543"}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=ABC_543?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/", {system: "Test"}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/", {client: "552"}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/");

		// slash trimming (or not)
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION");

		// multi origin segment parameter
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/?sap-client=400&myParam=abc"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo"), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/", {force: true}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo", {force: true}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;mo");

		//alias has precedence
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)", {
			alias: "DingDong",
			system: "abap",
			client: "003",
			force: true
		}),
		"/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=DingDong");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)?sap-client=400&myParam=abc", {
			alias: "DingDong",
			system: "abap",
			client: "003",
			force: true
		}),
		"/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=DingDong?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(TH.123)/?sap-client=400&myParam=abc", {
			alias: "DingDong",
			system: "abap",
			client: "003",
			force: true
		}),
		"/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=DingDong/?sap-client=400&myParam=abc");

		//no force
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)", {
			alias: "DingDong"
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)", {
			system: "DingDong",
			client: 567
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/", {
			alias: "DingDong"
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/", {
			system: "DingDong",
			client: 567
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(TH.123)/?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567
		}), "/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(TH.123)/?sap-client=400&myParam=abc");

		//force
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)", {
			alias: "DingDong",
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=DingDong");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(DingDong.567)");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/", {
			alias: "DingDong",
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=DingDong/");

		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(DingDong.567)/");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(DingDong.567)?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(DingDong.567)/?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(TH.123)/?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(DingDong.567)/?sap-client=400&myParam=abc");

		// no origin on the service part
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(DingDong.567)?sap-client=400&myParam=abc");
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION/?sap-client=400&myParam=abc", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWBEP;o=CANT_TOUCH_THIS/TEA_TEST_APPLICATION;o=sid(DingDong.567)/?sap-client=400&myParam=abc");

		//force on URLs with ending non origin segment
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/test;x=123;o=TEST;v=2", {
			alias: "DingDong",
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=sid(TH.123)/test;x=123;o=DingDong;v=2");

		// force, non-origin params & url params
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=TEST;v=2/?foo=10&bar=20", {
			alias: "DingDong",
			force: true
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=DingDong;v=2/?foo=10&bar=20");

		// no force
		assert.equal(ODataUtils.setOrigin("/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=TEST;v=2/?foo=10&bar=20", {
			alias: "DingDong"
		}), "/sap/opu/odata/IWBEP/TEA_TEST_APPLICATION;o=TEST;v=2/?foo=10&bar=20");
});

	QUnit.test("setAnnotationOrigin", function(assert) {

		// SID without force
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			system: "DingDong",
			client: 567
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=sid(DingDong.567)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// Alias without force
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Foo123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// Alias without force and existing origin
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// SID with force and existing origin
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			system: "DingDong",
			client: 567,
			force: true
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=sid(DingDong.567)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// Alias with force and existing origin
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123",
			force: true
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Foo123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// Missing $value
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/", {
			alias: "Foo123",
			force: true
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Bla123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/");

		// url parameter changed
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?foo=baa&test=23", {
			alias: "Foo123"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Foo123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?foo=baa&test=23");

		// url parameter with no change
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?foo=baa&test=23", {
			alias: "Foo123",
			force: true
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?foo=baa&test=23");

		// Alias without force and other origin
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123"
		}), "/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;v=2;o=Foo123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// $value without Annotations
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;v=2/MissingAnnotation(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123"
		}), "/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;v=2/MissingAnnotation(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// force with existing path parameter
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;o=CM.123;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123",
			force: true
		}), "/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;o=Foo123;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// force with existing path parameters
		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;x=123;o=CM.123;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Foo123",
			force: true
		}), "/sap/opu;o=CANT_TOUCH_THIS/odata/IWFND/CATALOGSERVICE;x=123;o=Foo123;v=2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value");

		// Hana XS
		assert.equal(ODataUtils.setAnnotationOrigin("/path/path2/annotations/anno.xml", {
			preOriginBaseUri: "/path/path2/myservice.xsodata",
			system: "Foo345",
			client: 123
		}), "/path/path2/annotations/anno.xml;o=sid(Foo345.123)");

		assert.equal(ODataUtils.setAnnotationOrigin("/path/path2/annotations/anno.xml", {
			preOriginBaseUri: "/path/path2/myservice.xsodata",
			alias: "Bla123"
		}), "/path/path2/annotations/anno.xml;o=Bla123");

		assert.equal(ODataUtils.setAnnotationOrigin("/path/path2/annotations/anno.xml?parameter1=Test&parameter2=123", {
			preOriginBaseUri: "/path/path2/myservice.xsodata",
			system: "Foo345",
			client: 123
		}), "/path/path2/annotations/anno.xml;o=sid(Foo345.123)?parameter1=Test&parameter2=123");

		assert.equal(ODataUtils.setAnnotationOrigin("/path/path2/annotations/anno.xml?parameter1=Test&parameter2=123", {
			preOriginBaseUri: "/path/path2/myservice.xsodata",
			alias: "Bla1234"
		}), "/path/path2/annotations/anno.xml;o=Bla1234?parameter1=Test&parameter2=123");

		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceNames(Namespace='IWBEP',Name='TEA_TEST_APPLICATION',Version='0001')/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Alias"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Alias/ServiceNames(Namespace='IWBEP',Name='TEA_TEST_APPLICATION',Version='0001')/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value",
			"segment after service starts with '/ServiceNames('");

		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceNames%28Namespace='IWBEP',Name='TEA_TEST_APPLICATION',Version='0001'%29/Annotations%28TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001'%29/$value", {
			alias: "Alias"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Alias/ServiceNames%28Namespace='IWBEP',Name='TEA_TEST_APPLICATION',Version='0001'%29/Annotations%28TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001'%29/$value",
			"segment after service starts with '/ServiceNames%28'");

		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection('ZTEA_TEST_APPLICATION_0001')/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value", {
			alias: "Alias"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Alias/ServiceCollection('ZTEA_TEST_APPLICATION_0001')/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value",
			"segment after service starts with '/ServiceCollection('");

		assert.equal(ODataUtils.setAnnotationOrigin("/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection%28'ZTEA_TEST_APPLICATION_0001'%29/Annotations%28TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001'%29/$value", {
			alias: "Alias"
		}), "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2;o=Alias/ServiceCollection%28'ZTEA_TEST_APPLICATION_0001'%29/Annotations%28TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001'%29/$value",
			"segment after service starts with '/ServiceCollection%28'");
	});

	QUnit.test("createFilterParams: Brackets should be correct", function(assert) {
		var oFilter1 = new Filter({
			path: 'Price',
			operator: FilterOperator.EQ,
			value1: "100"
		});

		var oMultiFilterWithSingleFilter = new Filter([oFilter1]),
			oMultiFilter = new Filter({
				filters: [
					new Filter({
						path: 'Quantity',
						operator: FilterOperator.LT,
						value1: 20
					}),
					new Filter({
						path: 'Price',
						operator: FilterOperator.GT,
						value1: 14.0
					})
				],
				and: false
			});

		var oMultiFilterWithSingleMultiFilter = new Filter([oMultiFilter]);

		var aFilters = [];
		aFilters.push(oMultiFilterWithSingleFilter);
		aFilters.push(oMultiFilterWithSingleMultiFilter);

		var sFilterString = ODataUtils.createFilterParams(aFilters);

		assert.ok(sFilterString, "Filter string should be created");
		assert.equal(sFilterString, "$filter=Price%20eq%20100%20and%20(Quantity%20lt%2020%20or%20Price%20gt%2014)", "Filter string (brackets available on multifilter group) should be correct.");
	});

	QUnit.test("createFilterParams: Create filter params with empty filter", function(assert) {
		var oFilter1, oFilter2, sFilterString;

		oFilter1 = new Filter({});
		oFilter2 = new Filter({});

		sFilterString = ODataUtils.createFilterParams([oFilter1, oFilter2]);
		assert.equal(sFilterString, "$filter=true%20or%20true", "Filter string should be returned.");

		oFilter1 = new Filter({
			filters: []
		});
		oFilter2 = new Filter({
			filters: []
		});

		sFilterString = ODataUtils.createFilterParams([oFilter1, oFilter2]);
		assert.equal(sFilterString, "$filter=false%20and%20false", "Filter string should be returned.");

		oFilter1 = new Filter({
			filters: []
		});

		sFilterString = ODataUtils.createFilterParams(oFilter1);
		assert.equal(sFilterString, "$filter=false", "Filter string should be returned.");
	});

	/** @deprecated As of version 1.22.0 reason sap.ui.model.odata.Filter*/
	QUnit.test("createFilterParams: Use API with deprecated sap.ui.model.odata.Filter", function(assert) {
		var oFilter1 = new ODataFilter('Customer',[{
			operator: 'EQ',
			value1: "test0"
		}]);

		var oFilter2 = new ODataFilter('CollectionSegment',[{
			operator: 'EQ',
			value1: "test1"
		}]);

		var oFilter3 = new ODataFilter('CompanyCode',[{
			operator: 'EQ',
			value1: "test2"
		}]);

		var aFilters = [oFilter1, oFilter2, oFilter3];

		var sFilterString = ODataUtils.createFilterParams(aFilters);
		assert.equal(sFilterString, "$filter=Customer%20eq%20test0%20and%20CollectionSegment%20eq%20test1%20and%20CompanyCode%20eq%20test2", "Filter string should be returned.");
	});

	//*********************************************************************************************
	QUnit.test("_mergeIntervals", function (assert) {
		// code under test: without interval
		assert.strictEqual(ODataUtils._mergeIntervals([]), undefined);

		// code under test: with intervals
		assert.deepEqual(ODataUtils._mergeIntervals(
				[{start : 1, end : 3}, {start : 4, end : 5}, {start : 6, end : 9}]),
			{start : 1, end : 9});
	});

	//*********************************************************************************************
[{
	description : "range w/o prefetch, no elements",
	range : [0, 10, 0],
	readRange : {start : 0, length : 10},
	aElements : [],
	intervals : [{start : 0, end : 10}]
}, {
	description : "range w/o prefetch, 1 element",
	range : [0, 10, 0],
	readRange : {start : 0, length : 10},
	aElements : [{}],
	intervals : [{start : 1, end : 10}]
}, {
	description : "range w/o prefetch, 1 element, limit = 1",
	range : [0, 10, 0],
	readRange : {start : 0, length : 10},
	aElements : [{}],
	limit : 1,
	intervals : []
}, {
	description : "range w/o prefetch, 3 elements, limit 9, 2 gaps",
	range : [0, 10, 0],
	readRange : {start : 0, length : 10},
	aElements : [{}, undefined, undefined, {}, undefined, {}],
	limit : 9,
	intervals : [{start : 1, end : 3}, {start : 4, end : 5}, {start : 6, end : 9}]
}, {
	description : "range w/ prefetch, no elements, left gap < prefetch",
	range : [51, 10, 100],
	readRange : {start : 0, length : 161},
	aElements : [],
	intervals : [{start : 0, end : 161}]
}, {
	description : "range w/ prefetch, no elements, left gap > prefetch",
	range : [151, 10, 100],
	readRange : {start : 51, length : 210},
	aElements : [],
	intervals : [{start : 51, end : 261}]
}, {
	description : "range w/ prefetch outside of limit, 3 elements, limit 111, 2 gaps",
	range : [6, 10, 100],
	readRange : {start : 0, length : 116},
	aElements : [{}, undefined, undefined, {}, undefined, {}],
	limit : 111,
	intervals : [{start : 1, end : 3}, {start : 4, end : 5}, {start : 6, end : 111}]
}].forEach(function (oFixture) {
	QUnit.test("_getReadIntervals: " + oFixture.description, function (assert) {
		var aIntervals;

		this.mock(ODataUtils).expects("_getReadRange")
			.withExactArgs(sinon.match.same(oFixture.aElements), oFixture.range[0],
				oFixture.range[1], oFixture.range[2])
			.returns(oFixture.readRange);

		// code under test
		aIntervals = ODataUtils._getReadIntervals(oFixture.aElements, oFixture.range[0],
			oFixture.range[1], oFixture.range[2], oFixture.limit);

		assert.deepEqual(aIntervals, oFixture.intervals);
	});
});

	//*********************************************************************************************
[{ // no prefetch
	range : [0, 10, 0],
	expected : {start : 0, length : 10}
}, {
	range : [40, 10, 0],
	expected : {start : 40, length : 10}
}, {
	current : [[40, 50]],
	range : [40, 10, 0],
	expected : {start : 40, length : 10}
}, {
	current : [[50, 110]],
	range : [100, 20, 0],
	expected : {start : 100, length : 20}
}, { // initial read with prefetch
	range : [0, 10, 100],
	expected : {start : 0, length : 110}
}, { // iPrefetchLength / 2 available on both sides
	current : [[0, 110]],
	range : [50, 10, 100],
	expected : {start : 50, length : 10}
}, { // missing a row at the end
	current : [[0, 110]],
	range : [51, 10, 100],
	expected : {start : 51, length : 110}
}, { // missing a row before the start
	current : [[100, 260]],
	range : [149, 10, 100],
	expected : {start : 49, length : 110}
}, { // missing a row before the start, do not read beyond 0
	current : [[40, 200]],
	range : [89, 10, 100],
	expected : {start : 0, length : 99}
}, { // missing data on both sides, do not read beyond 0
	range : [430, 10, 100],
	expected : {start : 330, length : 210}
}, { // missing data on both sides, do not read beyond 0
	current : [[40, 100]],
	range : [89, 10, 100],
	expected : {start : 0, length : 199}
}, { // fetch all data
	range : [0, 0, Infinity],
	expected : {start : 0, length : Infinity}
}, { // fetch all data with offset
	range : [1, 0, Infinity],
	expected : {start : 0, length : Infinity}
}].forEach(function (oFixture) {
	QUnit.test("_getReadRange: " + oFixture.range, function (assert) {
		var aElements = [],
			oResult;

		// prepare elements array
		if (oFixture.current) {
			oFixture.current.forEach(function (aRange) {
				var i, n;

				for (i = aRange[0], n = aRange[1]; i < n; i += 1) {
					aElements[i] = i;
				}
			});
		}

		// code under test
		oResult = ODataUtils._getReadRange(aElements, oFixture.range[0], oFixture.range[1],
				oFixture.range[2]);

		assert.deepEqual(oResult, oFixture.expected);
	});
});
});