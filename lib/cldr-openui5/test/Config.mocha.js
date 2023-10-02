/*eslint-env mocha */
import assert from "node:assert";
import configs from "../lib/config.js";
import j2j from "json2json";

describe("Json2Json templates in config.js", function () {
	//*********************************************************************************************
	it("currencyFormats template", function () {
		const oCurrencyFormatsTemplate = configs.find(
			(oTemplate) => oTemplate.template.path === "numbers.currencyFormats-numberSystem-latn.");
		const oResult = {
			"currencyFormat-short": {
				"1000-one": "¤ 0K",
				"1000-other": "¤ 0K",
				"10000-one": "¤ 00K",
				"10000-other": "¤ 00K"
			}
		};
		const oSampleCLDRData = {
			"numbers": {
				"currencyFormats-numberSystem-latn": {
					"short": {
						"standard": {
							"1000-count-one": "¤0K",
							"1000-count-one-alt-alphaNextToNumber": "¤ 0K",
							"1000-count-other": "¤0K",
							"1000-count-other-alt-alphaNextToNumber": "¤ 0K",
							"10000-count-one": "¤00K",
							"10000-count-one-alt-alphaNextToNumber": "¤ 00K",
							"10000-count-other": "¤00K",
							"10000-count-other-alt-alphaNextToNumber": "¤ 00K"
						}
					}
				}
			}
		};

		// code under test
		assert.deepEqual(new j2j.ObjectTemplate(oCurrencyFormatsTemplate.template).transform(oSampleCLDRData), oResult);
	});

});
