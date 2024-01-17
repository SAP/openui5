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
