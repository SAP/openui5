/* global QUnit */

sap.ui.define([
	"sap/ui/layout/library"
], function (library) {
	"use strict";

	var mGridTypes = {
		"CSSGridTrack": {
			validValues: [
				"10rem 10rem 50rem 500px",
				"1fr 3fr 1fr",
				"repeat(3, 1fr)",
				"20px repeat(6, 1fr) 20px",
				"repeat(5, 1fr 2fr)",
				"8px auto",
				"minmax(100px, 1fr)",
				"fit-content(40%)",
				"200px repeat(auto-fill, 100px) 300px",
				"minmax(100px, max-content)",
				"repeat(auto-fill, 200px) 20%",
				"repeat(12, minmax(250px, 1fr))",
				"repeat(auto-fit, minmax(250px, 1fr))",
				"repeat(auto-fill, minmax(100px, 1fr))",
				""
			],
			invalidValues: [
				"10remm 10rem 10pxxx",
				"minnmax(100px, 1fr)",
				"area1 area2 area3",
				5,
				0,
				true,
				false,
				undefined,
				null,
				[],
				{},
				5.6,
				"a",
				"test"
			]
		},
		"CSSGridGapShortHand": {
			validValues: [
				"0.5px 0.5rem",
				"   5px    1px	",
				"5px",
				"0px",
				"5%",
				""
			],
			invalidValues: [
				"10remm 10rem 10pxxx",
				5,
				0,
				true,
				false,
				undefined,
				null,
				[],
				{},
				5.6,
				"a",
				"test"
			]
		},
		"CSSGridLine": {
			validValues: [
				"",
				"auto",
				"inherit",
				"1",
				"span 2",
				"span 2 / 5",
				"span 2 / -5",
				"5 / 7",
				"7 / span 5",
				"span 7 / span 5"
			],
			invalidValues: [
				"10remm 10rem 10pxxx",
				"auto auto",
				"1 / 2 / 3 / 5",
				"span / span",
				"span / span 2",
				"span",
				5,
				0,
				true,
				false,
				undefined,
				null,
				[],
				{},
				5.6,
				"a",
				"test"
			]
		}
	};

	function testValues(sName, sType, aValues, bExpected, sMessage) {
		QUnit.test(sName, function (assert) {
			aValues.forEach(function (sValue) {
				var bValid = library.cssgrid[sType].isValid(sValue);
				assert.equal(bValid, bExpected, "'" + sValue + "' " + sMessage);
			});
		});
	}

	Object.keys(mGridTypes).forEach(function (sType) {
		QUnit.module(sType);

		testValues("Valid values", sType, mGridTypes[sType].validValues, true, "should be a valid value");
		testValues("Invalid values", sType, mGridTypes[sType].invalidValues, false, "should be an invalid value");
	});
});