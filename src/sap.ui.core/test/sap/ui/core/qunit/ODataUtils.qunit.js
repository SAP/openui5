/*!
 * ${copyright}
 */
sap.ui.require([
	'sap/ui/model/odata/ODataUtils'
], function(ODataUtils) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	function time(iMillis) {
		return {
			__edmType: "Edm.Time",
			ms: iMillis
		};
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.ODataUtils");

	//*********************************************************************************************
	test("compare", function () {
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
			{t: "Edm.Date", s1: new Date(iDate1), s2: new Date(iDate1), gt: new Date(iDate2)},
			{t: "Edm.Date", s1: new Date(iDate1), s2: iDate1, gt: iDate2, d: "Edm.Date+millis"},
			{t: "Edm.Date", s1: iDate1, s2: new Date(iDate1), gt: new Date(iDate2),
				d: "millis+Edm.Date"},
			{t: "Edm.DateTime", s1: new Date(iDate1), s2: new Date(iDate1), gt: new Date(iDate2)},
			{t: "Edm.DateTime", s1: new Date(iDate1), s2: iDate1, gt: iDate2,
				d: "Edm.DateTime+millis"},
			{t: "Edm.DateTime", s1: iDate1, s2: new Date(iDate1), gt: new Date(iDate2),
				d: "millis+Edm.DateTime"},
			{t: "Edm.DateTimeOffset", s1: new Date(iDate1), s2: new Date(iDate1),
				gt: new Date(iDate2)},
			{t: "Edm.DateTimeOffset", s1: new Date(iDate1), s2: iDate1, gt: iDate2,
				d: "Edm.DateTimeOffset+millis"},
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
			{t: "Edm.Time", s1: iTime1, s2: time(iTime1), gt: time(iTime2), d: "millis+Edm.Time"},
		].forEach(function (oFixture) {
			var sDesc = oFixture.d || oFixture.t;

			function testCompare(fnComparator) {
				strictEqual(fnComparator(oFixture.s1 , oFixture.s2), 0, sDesc + ": s === s");
				strictEqual(fnComparator(oFixture.s1 , oFixture.gt), -1, sDesc + ": s < gt");
				strictEqual(fnComparator(oFixture.gt , oFixture.s2), 1, sDesc + ": gt > s");

				ok(isNaN(fnComparator(oFixture.s1, null)), sDesc + ": s, null");
				ok(isNaN(fnComparator(null, oFixture.s2)), sDesc + ": null, s");
				ok(isNaN(fnComparator(oFixture.s1, undefined)), sDesc + ": s, undefined");
				ok(isNaN(fnComparator(undefined, oFixture.s2)), sDesc + ": undefined, s");

				strictEqual(fnComparator(null, null), 0, sDesc + ": null,null");
				strictEqual(fnComparator(undefined, undefined), 0,
					sDesc + ": undefined,undefined");
			}

			testCompare(ODataUtils.compare);
			testCompare(ODataUtils.getComparator(oFixture.t));
		});
	});

	//*********************************************************************************************
	test("compare as decimal", function () {
		var fnDecimal = ODataUtils.getComparator("Edm.Decimal"),
			fnInt64 = ODataUtils.getComparator("Edm.Int64");

		strictEqual(fnDecimal, fnInt64, "functions identical, no need to test Int64 separately");

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
				ok(isNaN(ODataUtils.compare(oFixture.p1, oFixture.p2, true)), oFixture.t);
				ok(isNaN(fnDecimal(oFixture.p1, oFixture.p2)), oFixture.t);
				ok(isNaN(fnInt64(oFixture.p1, oFixture.p2)), oFixture.t);
			} else {
				strictEqual(ODataUtils.compare(oFixture.p1, oFixture.p2, true),
					oFixture.r, oFixture.t);
				strictEqual(fnDecimal(oFixture.p1, oFixture.p2), oFixture.r, oFixture.t);
			}
		});
	});
});
