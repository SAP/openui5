/*eslint-env mocha */
import assert from "node:assert";
import configs from "../lib/config.js";
import j2j from "json2json";
import sinon from "sinon";
import util from "../lib/util.js";

describe("Json2json templates in config.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
	});

	//*********************************************************************************************
	it("currencyFormats template", function () {
		const sId = "numbers.json -> scientificFormat|percentFormat|currencyFormat|miscPattern";
		const oJson2JsonConfig = configs.find((oConfig) => oConfig.id === sId);
		const fnTemplateFormat = oJson2JsonConfig.template.format;
		assert.deepEqual(oJson2JsonConfig, {
			id: sId,
			fileName: "numbers.json",
			packageName: "cldr-numbers-full",
			template: {
				choose: [
					"scientificFormats-numberSystem-latn", "percentFormats-numberSystem-latn",
					"currencyFormats-numberSystem-latn", "miscPatterns-numberSystem-latn"
				],
				format: fnTemplateFormat,
				path: "numbers"
			}
		});

		[
			{sKey: "scientificFormats-numberSystem-latn", sResultingKey: "scientificFormat"},
			{sKey: "percentFormats-numberSystem-latn", sResultingKey: "percentFormat"},
			{sKey: "miscPatterns-numberSystem-latn", sResultingKey: "miscPattern"}
		].forEach(({sKey, sResultingKey}) => {
			const oValue = {foo: "bar"};

			// code under test - scientificFormat, percentFormat, miscPattern
			const oFormats = fnTemplateFormat("~UnusedNode", oValue, sKey);

			assert.deepEqual(oFormats, {key: sResultingKey, value: {foo: "bar"}});
			assert.strictEqual(oFormats.value, oValue);
		});

		const oValue = {
			accounting: "~accounting",
			"accounting-alphaNextToNumber": "~accounting-alphaNextToNumber",
			"accounting-noCurrency": "~accounting-noCurrency",
			currencyPatternAppendISO: "~ignored",
			currencySpacing: "~currencySpacing",
			"short": "~ignored",
			standard: "~standard",
			"standard-alphaNextToNumber": "~standard-alphaNextToNumber",
			"standard-noCurrency": "~standard-noCurrency",
			"unitPattern-count-zero": "~ignored"
		};

		// code under test
		const oCurrencyFormats = fnTemplateFormat("~UnusedNode", oValue, "currencyFormats-numberSystem-latn");

		assert.deepEqual(oCurrencyFormats, {
			key: "currencyFormat",
			value: {
				accounting: "~accounting",
				"accounting-alphaNextToNumber": "~accounting-alphaNextToNumber",
				"accounting-noCurrency": "~accounting-noCurrency",
				currencySpacing: "~currencySpacing",
				standard: "~standard",
				"standard-alphaNextToNumber": "~standard-alphaNextToNumber",
				"standard-noCurrency": "~standard-noCurrency"
			}
		});
		assert.notStrictEqual(oCurrencyFormats.value, oValue);
	});

	//*********************************************************************************************
	it("currencyFormats shorts template", function () {
		const oJson2JsonConfig = configs.find((oConfig) => oConfig.id === "numbers.json -> currencyFormat-short");

		// code under test
		assert.deepEqual(
			new j2j.ObjectTemplate(oJson2JsonConfig.template).transform({
				"numbers": {
					"currencyFormats-numberSystem-latn": {
						"short": {
							"standard": {
								"1000-count-one": "¤0K",
								"1000-count-one-alt-alphaNextToNumber": "¤ 0K",
								"1000-count-one-alt-noCurrency": "0K",
								"1000-count-other": "¤0K",
								"1000-count-other-alt-alphaNextToNumber": "¤ 0K",
								"1000-count-other-alt-noCurrency": "0K",
								"10000-count-one": "¤00K",
								"10000-count-one-alt-alphaNextToNumber": "¤ 00K",
								"10000-count-one-alt-noCurrency": "00K",
								"10000-count-other": "¤00K",
								"10000-count-other-alt-alphaNextToNumber": "¤ 00K",
								"10000-count-other-alt-noCurrency": "00K"
							}
						}
					}
				}
			}),
			{
				"currencyFormat-short": {
					"1000-one": "¤0K",
					"1000-one-alphaNextToNumber": "¤ 0K",
					"1000-one-noCurrency": "0K",
					"1000-other": "¤0K",
					"1000-other-alphaNextToNumber": "¤ 0K",
					"1000-other-noCurrency": "0K",
					"10000-one": "¤00K",
					"10000-one-alphaNextToNumber": "¤ 00K",
					"10000-one-noCurrency": "00K",
					"10000-other": "¤00K",
					"10000-other-alphaNextToNumber": "¤ 00K",
					"10000-other-noCurrency": "00K"
				}
			});
	});

	//*********************************************************************************************
	["gregorian", "japanese", "islamic", "persian", "buddhist"].forEach((sCalendar) => {
		it(`removeAltAsciiTimeFormats is called for the ${sCalendar} calendar`, function () {
			const sCalendarKey = `ca-${sCalendar}`;
			// eslint-disable-next-line max-nested-callbacks
			const oDateTimeFormats = configs.find((oTemplate) => {
				const oCalendarTemplate = oTemplate.template.as?.[sCalendarKey];
				return oCalendarTemplate?.choose?.includes("timeFormats") ? oTemplate : undefined;
			});

			const oResultDateFormats = {
				dateFormats: {
					"short": "M/d/yy"
				},
				timeFormats: {
					"short": "h:mm a"
				},
				dateTimeFormats: {
					availableFormats: {
						hmv: "h:mm a v"
					}
				}
			};
			const oCalendarData = {
				dateFormats: {
					"short": "M/d/yy"
				},
				timeFormats: {
					"short": "h:mm a",
					"short-alt-ascii": "h:mm a"
				},
				dateTimeFormats: {
					availableFormats: {
						hmv: "h:mm a v",
						"hmv-alt-ascii": "h:mm a v"
					}
				}
			};
			const oUtilMock = sinon.mock(util);
			oUtilMock.expects("removeAltAsciiTimeFormats")
				.withExactArgs(sinon.match.same(oCalendarData), sinon.match.same(oCalendarData.timeFormats),
					"timeFormats")
				.callThrough();
			oUtilMock.expects("removeAltAsciiTimeFormats")
				.withExactArgs(sinon.match.same(oCalendarData), sinon.match.same(oCalendarData.dateFormats),
					"dateFormats")
				.callThrough();
			oUtilMock.expects("removeAltAsciiTimeFormats")
				.withExactArgs(sinon.match.same(oCalendarData), sinon.match.same(oCalendarData.dateTimeFormats),
					"dateTimeFormats")
				.callThrough();

			// code under test
			assert.deepEqual(new j2j.ObjectTemplate(oDateTimeFormats.template)
				.transform({dates: {calendars: {[sCalendar]: oCalendarData}}}), {[sCalendarKey]: oResultDateFormats});
		});
	});
});
