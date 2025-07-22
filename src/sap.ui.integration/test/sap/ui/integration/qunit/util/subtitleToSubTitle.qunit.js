/* global QUnit */

sap.ui.define([
	"sap/ui/integration/util/subtitleToSubTitle"
], (
	subtitleToSubTitle
) => {
	"use strict";

	QUnit.module("subtitleToSubTitle");

	QUnit.test("subtitleToSubTitle should rename subtitle to subTitle", function (assert) {
		// an array of examples to test
		const aExamples = [
			{ example: { subtitle: "Test Subtitle" }, expected: { subTitle: "Test Subtitle" } },
			{ example: { subTitle: "Test Subtitle" }, expected: { subTitle: "Test Subtitle" } },
			{ example: { subtitle: "" }, expected: { subTitle: "" } },
			{ example: { subtitle: null }, expected: { subTitle: null } },
			{ example: { subtitle: undefined }, expected: { subTitle: undefined } },
			{ example: { subtitle: { part: "test", path: "test" } }, expected: { subTitle: { part: "test", path: "test" } } },
			{ example: {}, expected: {} },
			{ example: null, expected: null },
			{ example: undefined, expected: undefined }
		];

		// iterate through each example
		aExamples.forEach(function (oExample) {
			subtitleToSubTitle(oExample.example);
			assert.deepEqual(oExample.example, oExample.expected, `subtitleToSubTitle renamed correctly for example: ${JSON.stringify(oExample.example)}`);
			assert.notOk(oExample.example?.hasOwnProperty("subtitle"), "The subtitle property should be removed from the configuration");
		});
	});

	QUnit.test("subtitleToSubTitle should rename subtitleMaxLines to subTitleMaxLines", function (assert) {
		// an array of examples to test
		const aExamples = [
			{ example: { subtitleMaxLines: 3 }, expected: { subTitleMaxLines: 3 } },
			{ example: { subtitleMaxLines: 3 }, expected: { subTitleMaxLines: 3 } },
			{ example: { subtitleMaxLines: 0 }, expected: { subTitleMaxLines: 0 } },
			{ example: { subtitleMaxLines: "" }, expected: { subTitleMaxLines: "" } },
			{ example: { subtitleMaxLines: null }, expected: { subTitleMaxLines: null } },
			{ example: { subtitleMaxLines: undefined }, expected: { subTitleMaxLines: undefined } },
			{ example: { subtitleMaxLines: { part: "test", path: "test" } }, expected: { subTitleMaxLines: { part: "test", path: "test" } } },
			{ example: {}, expected: {} },
			{ example: null, expected: null },
			{ example: undefined, expected: undefined }
		];

		// iterate through each example
		aExamples.forEach(function (oExample) {
			subtitleToSubTitle(oExample.example);
			assert.deepEqual(oExample.example, oExample.expected, `subtitleToSubTitle renamed correctly for example: ${JSON.stringify(oExample.example)}`);
			assert.notOk(oExample.example?.hasOwnProperty("subtitleMaxLines"), "The subtitleMaxLines property should be removed from the configuration");
		});
	});

	QUnit.test("subtitleToSubTitle should rename both properties", function (assert) {
		// an array of examples to test
		const aExamples = [
			{ example: { subtitle: "Test Subtitle", subtitleMaxLines: 3 }, expected: { subTitle: "Test Subtitle", subTitleMaxLines: 3  } },
			{ example: { subTitle: "Test Subtitle", subTitleMaxLines: 3 } , expected: { subTitle: "Test Subtitle", subTitleMaxLines: 3  } },
			{ example: { subtitle: "", subtitleMaxLines: 3 } , expected: { subTitle: "", subTitleMaxLines: 3 } },
			{ example: { subtitle: "Test Subtitle", subtitleMaxLines: 0 } , expected: { subTitle: "Test Subtitle", subTitleMaxLines: 0 } }
		];

		// iterate through each example
		aExamples.forEach(function (oExample) {
			subtitleToSubTitle(oExample.example);
			assert.deepEqual(oExample.example, oExample.expected, `subtitleToSubTitle renamed correctly for example: ${JSON.stringify(oExample.example)}`);
			assert.notOk(oExample.example?.hasOwnProperty("subtitle"), "The subtitle property should be removed from the configuration");
			assert.notOk(oExample.example?.hasOwnProperty("subtitleMaxLines"), "The subtitleMaxLines property should be removed from the configuration");
		});
	});
});