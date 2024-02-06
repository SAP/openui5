/*eslint-env mocha */
import assert from "node:assert";
import util from "../lib/util.js";

describe("Utility methods in utils.js", function () {

	//*********************************************************************************************
	it("removeAltAsciiTimeFormats", function () {
		let oInput = {
			dateFormats: "~vValue"
		};

		// code under test
		assert.deepEqual(util.removeAltAsciiTimeFormats(oInput, oInput.dateFormats, "dateFormats"),
			{key: "dateFormats", value: "~vValue"});

		oInput = {
			timeFormats: {
				foo: "h:mm:ss",
				bar: "B: bb: ss BB",
				"alt-ascii-bar": "b: a: r B",
				"bar-alt-ascii": "a: bb: ss"
			},
			dateTimeFormats: {
				availableFormats: {
					foo: "h:mm:ss 'S' B",
					bar: "b: a: r",
					"alt-ascii-bar": "b: a: r B",
					"bar-alt-ascii": "b: a: r"
				}
			},
			dateFormats: {
				foo: "h:mm:ss 'S' B",
				bar: "b: a: r",
				"bar-alt-ascii": "b: a: r B"
			}
		};

		// code under test
		assert.deepEqual(util.removeAltAsciiTimeFormats(oInput, oInput.timeFormats, "timeFormats"),
			{
				key: "timeFormats",
				value:  {
					foo: "h:mm:ss",
					bar: "B: bb: ss BB",
					"alt-ascii-bar": "b: a: r B"
				}
			});

		assert.deepEqual(util.removeAltAsciiTimeFormats(oInput, oInput.dateTimeFormats, "dateTimeFormats"),
			{
				key: "dateTimeFormats",
				value:  {
					availableFormats: {
						foo: "h:mm:ss 'S' B",
						bar: "b: a: r",
						"alt-ascii-bar": "b: a: r B"
					}
				}
			});

		assert.deepEqual(util.removeAltAsciiTimeFormats(oInput, oInput.dateFormats, "dateFormats"),
			{
				key: "dateFormats", // This property is not affected by the removal
				value:  {
					foo: "h:mm:ss 'S' B",
					bar: "b: a: r",
					"bar-alt-ascii": "b: a: r B"
				}
			});
	});
});
