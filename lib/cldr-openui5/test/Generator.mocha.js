/*eslint-env mocha */
import assert from "node:assert";
import configs from "../lib/config.js";
import { join, resolve } from "node:path";
import fs from "node:fs";
import fileContent from "../lib/fileContent.js";
import Generator from "../lib/Generator.js";
import j2j from "json2json";
import sinon from "sinon";
import Territories from "../lib/Territories.js";
import Timezones from "../lib/Timezones.js";
import trailingCurrencyCodeFormatter from "../lib/trailingCurrencyCodeFormatter.js";
import util from "../lib/util.js";

describe("Generator.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
	});

	//*********************************************************************************************
	it("constructor", function () {
		// code under test
		const oGenerator = new Generator("~sSourceFolder", "~sOutputFolder", "~sCLDRVersion");

		assert.strictEqual(oGenerator._sCLDRVersion, "~sCLDRVersion");
		assert.deepEqual(oGenerator._aCompleteCLDRTimezoneIDs, []);
		assert.strictEqual(oGenerator._sOutputFolder, "~sOutputFolder");
		assert.strictEqual(oGenerator._sSourceFolder, "~sSourceFolder");
		assert.deepEqual(oGenerator._aTasks, []);
		assert.ok(oGenerator._oTerritories instanceof Territories);
		assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(oGenerator._sTimestamp));
		assert.ok(oGenerator._oTimezones instanceof Timezones);
		assert.deepEqual(oGenerator._aLastTimezoneIDs, []);
		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, null);
	});

	//*********************************************************************************************
	it("private members", function () {
		// code under test
		assert.strictEqual(Generator["#oCurrencySignReplacements"], undefined);
		assert.strictEqual(Generator["#oIndianCurrencyFormatShort"], undefined);
		assert.strictEqual(Generator["#oIndiaDecimalFormatShort"], undefined);
		assert.strictEqual(Generator["#oTZNamesReplacements"], undefined);
	});

	//*********************************************************************************************
	it("addStaticData: with calendar preferences", function () {
		const oUtilMock = sinon.mock(util);
		oUtilMock.expects("getCurrencyDigits").withExactArgs().returns("~CurrencyDigits");
		oUtilMock.expects("getPluralRules").withExactArgs("~sCLDRTag").returns({"~PluralRules": "~PluralRules"});
		oUtilMock.expects("getWeekData").withExactArgs("~sCLDRTag").returns({"~WeekData": "~WeekData"});
		oUtilMock.expects("getTimeData").withExactArgs("~sCLDRTag").returns({"~TimeData": "~TimeData"});
		oUtilMock.expects("getCalendarData").withExactArgs().returns({"~CalendarData": "~CalendarData"});
		oUtilMock.expects("getDayPeriodRules").withExactArgs("~sCLDRTag")
			.returns({"~DayPeriodRules": "~DayPeriodRules"});
		oUtilMock.expects("getCalendarPreference").withExactArgs("~sCLDRTag").returns("~CalendarPreference");
		const oResult = {};

		// code under test
		Generator.addStaticData(oResult, "~sCLDRTag");

		assert.deepEqual(oResult, {
			calendarPreference: "~CalendarPreference",
			currencyDigits: "~CurrencyDigits",
			"~CalendarData": "~CalendarData",
			"~DayPeriodRules": "~DayPeriodRules",
			"~PluralRules": "~PluralRules",
			"~TimeData": "~TimeData",
			"~WeekData": "~WeekData"
		});
	});

	//*********************************************************************************************
	it("addStaticData: no calendar preferences", function () {
		const oUtilMock = sinon.mock(util);
		oUtilMock.expects("getCurrencyDigits").withExactArgs().returns("~CurrencyDigits");
		oUtilMock.expects("getPluralRules").withExactArgs("zh-Hans-~foo").returns({"~PluralRules": "~PluralRules"});
		oUtilMock.expects("getWeekData").withExactArgs("zh-Hans-~foo").returns({"~WeekData": "~WeekData"});
		oUtilMock.expects("getTimeData").withExactArgs("zh-Hans-~foo").returns({"~TimeData": "~TimeData"});
		oUtilMock.expects("getCalendarData").withExactArgs().returns({"~CalendarData": "~CalendarData"});
		oUtilMock.expects("getDayPeriodRules").withExactArgs("zh-Hans-~foo")
			.returns({"~DayPeriodRules": "~DayPeriodRules"});
		oUtilMock.expects("getCalendarPreference").withExactArgs("zh-Hans-~foo").returns(undefined);
		const oResult = {};

		// code under test
		Generator.addStaticData(oResult, "zh-Hans-~foo");

		assert.deepEqual(oResult, {
			currencyDigits: "~CurrencyDigits",
			"~CalendarData": "~CalendarData",
			"~DayPeriodRules": "~DayPeriodRules",
			"~PluralRules": "~PluralRules",
			"~TimeData": "~TimeData",
			"~WeekData": "~WeekData"
		});
	});

	//*********************************************************************************************
	it("checkDuplicateTimezoneNames: all different", function () {
		sinon.mock(Generator).expects("getAllChildValues").withExactArgs("~oTimezoneNames").returns(["~a", "~b"]);

		// code under test
		Generator.checkDuplicateTimezoneNames("~sCLDRTag", "~oTimezoneNames");
	});

	//*********************************************************************************************
	it("checkDuplicateTimezoneNames: with duplicates", function () {
		sinon.mock(Generator).expects("getAllChildValues").withExactArgs("~oTimezoneNames")
			.returns(["~a", "~b", "~c", "~b", "~a"]);

		assert.throws(() => {
			// code under test
			Generator.checkDuplicateTimezoneNames("~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' contains duplicate time zone names: ~b, ~a"));
	});

	//*********************************************************************************************
	it("checkTimezoneNames: forward error of checkDuplicateTimezoneNames", function () {
		const oError = new Error("failed intenionally");
		sinon.mock(Generator).expects("checkDuplicateTimezoneNames")
			.withExactArgs("~sCLDRTag", "~oTimezoneNames")
			.throws(oError);

		assert.throws(() => {
			// code under test
			Generator.checkTimezoneNames("~sCLDRTag", "~oTimezoneNames");
		}, oError);
	});

	//*********************************************************************************************
	it("checkTimezoneNames", function () {
		sinon.mock(Generator).expects("checkDuplicateTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Generator).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames")
			.returns(["A", "A/B", "A/c/D", "e", "F/g"]);
		const oConsoleMock = sinon.mock(console);
		oConsoleMock.expects("log")
			.withExactArgs("WARNING: Unusual time zone ID found 'A/c/D' for locale '~sCLDRTag', maybe check and"
				+ " replace.");
		oConsoleMock.expects("log")
			.withExactArgs("WARNING: Unusual time zone ID found 'e' for locale '~sCLDRTag', maybe check and replace.");
		oConsoleMock.expects("log")
			.withExactArgs("WARNING: Unusual time zone ID found 'F/g' for locale '~sCLDRTag', maybe check and"
				+ " replace.");

		// code under test
		Generator.checkTimezoneNames("~sCLDRTag", "~oTimezoneNames");
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: forward error of checkTimezoneNames", function () {
		const oError = new Error("failed intenionally");
		sinon.mock(Generator).expects("checkTimezoneNames")
			.withExactArgs("~sCLDRTag", "~oTimezoneNames")
			.throws(oError);

		assert.throws(() => {
			// code under test
			Generator.prototype.checkTimezonesConsistency.call({}, "~sCLDRTag", "~oTimezoneNames");
		}, oError);
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: first run", function () {
		const oGenerator = {
			_aLastTimezoneIDs: []
		};
		sinon.mock(Generator).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Generator).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns("~aTimezoneIDs");

		// code under test
		Generator.prototype.checkTimezonesConsistency.call(oGenerator, "~sCLDRTag", "~oTimezoneNames");

		assert.strictEqual(oGenerator._aLastTimezoneIDs, "~aTimezoneIDs");
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has same time zone IDs", function () {
		const oGenerator = {
			_aLastTimezoneIDs: ["~foo"]
		};
		const aTimezoneIDs = ["~foo"];
		sinon.mock(Generator).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Generator).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		// code under test
		Generator.prototype.checkTimezonesConsistency.call(oGenerator, "~sCLDRTag", "~oTimezoneNames");

		assert.strictEqual(oGenerator._aLastTimezoneIDs, aTimezoneIDs);
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has same amount but different time zone IDs", function () {
		const oGenerator = {
			_aLastTimezoneIDs: ["~b", "~c"]
		};
		const aTimezoneIDs = ["~a", "~c"];
		sinon.mock(Generator).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Generator).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		assert.throws(() => {
			// code under test
			Generator.prototype.checkTimezonesConsistency.call(oGenerator, "~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' has inconsistent time zone IDs; missing IDs: ~b; unexpected IDs: ~a"));
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has different time zone IDs", function () {
		const oGenerator = {
			_aLastTimezoneIDs: ["~b", "~c", "~d"]
		};
		const aTimezoneIDs = ["~a", "~c", "~e"];
		sinon.mock(Generator).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Generator).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		assert.throws(() => {
			// code under test
			Generator.prototype.checkTimezonesConsistency.call(oGenerator, "~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' has inconsistent time zone IDs; missing IDs: ~b,~d; unexpected IDs: ~a,~e"));
	});

	//*********************************************************************************************
	it("checkUnsupporedRTLCodes: success", function () {
		// code under test (the supported ones -> rAllRTLCharacters in NumberFormat.js)
		Generator.checkUnsupporedRTLCodes("someUI5Tag", {foo : "\u061c\u200e\u200f\u202a\u202b\u202c"});
	});

	//*********************************************************************************************
	["\u202d", "\u202e", "\u2066", "\u2067", "\u2068", "\u2069"].forEach(function(sRTLCode) {
		it("checkUnsupportedRTLCodes: \\u" + sRTLCode.codePointAt(0).toString(16), function () {
			const oResult = {foo : {bar : `unsupported ${sRTLCode} in bar pattern`}};

			/* eslint-disable max-nested-callbacks */
			assert.throws(() => {
				// code under test
				Generator.checkUnsupporedRTLCodes("someUI5Tag", oResult);
			}, new Error(`Unsupported RTL character \\u${sRTLCode.codePointAt(0).toString(16)}`
				+ ` found for locale someUI5Tag`
			));
		});
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir and write successful", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		const oResult = {a: "b", c: {d: "e", f: 42}};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", oResult);

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const sResolvedPath = resolve(join("~outputFolder/~sUI5Tag.json"));
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(null, sResolvedPath);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		const oWriteFileExpectation = sinon.mock(fs).expects("writeFile")
			.withExactArgs(sResolvedPath, "{\n\t\"a\": \"b\",\n\t\"c\": {\n\t\t\"d\": \"e\",\n\t\t\"f\": 42\n\t}\n}",
				sinon.match.func);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](null);

		sinon.mock(oGenerator).expects("emit").withExactArgs("localeJSONReady", sResolvedPath);

		// code under test - called by fs.writeFile
		oWriteFileExpectation.args[0][2](null);
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir with error", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", "~oResult");

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const oError = new Error("Failed intentionally");
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(oError, undefined);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		sinon.mock(fs).expects("writeFile").never();
		sinon.mock(oGenerator).expects("emit").withExactArgs("error", oError);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](oError);
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir successful and write fails", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", "~oResult");

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const oError = new Error("Failed intentionally");
		const sResolvedPath = resolve(join("~outputFolder/~sUI5Tag.json"));
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(oError, sResolvedPath);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		const oWriteFileExpectation =
			sinon.mock(fs).expects("writeFile").withExactArgs(sResolvedPath, sinon.match.string, sinon.match.func);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](null);

		sinon.mock(oGenerator).expects("emit").withExactArgs("error", oError);

		// code under test - called by fs.writeFile
		oWriteFileExpectation.args[0][2](oError);
	});

	//*********************************************************************************************
	it("cleanupTimezoneNames", function () {
		const oResult = {
			territories: {"002": "~002", "019": "~019", "142": "~142", "150": "~150", AQ: "~AQ", AR: "~AR", AU: "~AU"},
			timezoneNames: {
				Africa: {},
				America: {
					Argentina: {}
				},
				Antarctica: {},
				Asia: {},
				Australia: {Currie: "~toBeDeleted"},
				Etc: {
					Unknown: "~toBeDeleted",
					UTC: {
						"long": {standard: "~UTClong"},
						"short": {standard: "~UTCshort"}
					}
				},
				Europe: {},
				Pacific: {Enderbury: "~toBeDeleted", Johnston: "~toBeDeleted"}
			}
		};

		// code under test
		Generator.cleanupTimezoneNames(oResult);

		assert.deepEqual(oResult, {
			territories: {"002": "~002", "019": "~019", "142": "~142", "150": "~150", AQ: "~AQ", AR: "~AR", AU: "~AU"},
			timezoneNames: {
				Africa: {"_parent": "~002"},
				America: {
					"_parent": "~019",
					Argentina: {"_parent": "~AR"}
				},
				Antarctica: {"_parent": "~AQ"},
				Asia: {"_parent": "~142"},
				Australia: {"_parent": "~AU"},
				Etc: {
					Universal: "~UTClong",
					UTC: "~UTCshort"
				},
				Europe: {"_parent": "~150"},
				Pacific: {}
			}
		});
	});

	//*********************************************************************************************
	[
		{sUI5Tag: "zh_CN", sCLDRTag: "zh-Hans-CN"},
		{sUI5Tag: "zh_SG", sCLDRTag: "zh-Hans-SG"},
		{sUI5Tag: "zh_TW", sCLDRTag: "zh-Hant-TW"},
		{sUI5Tag: "zh_HK", sCLDRTag: "zh-Hans-HK"},
		{sUI5Tag: "en", sCLDRTag: "en"},
		{sUI5Tag: "de_CH", sCLDRTag: "de-CH"},
		{sUI5Tag: "cnr", sCLDRTag: "sr-Latn-ME"},
		{sUI5Tag: "foo_bar", sCLDRTag: "foo-bar"}
	].forEach(({sUI5Tag, sCLDRTag}) => {
		it("getCLDRTag: " + sUI5Tag + " -> " + sCLDRTag, function () {
			// code under test
			assert.strictEqual(Generator.getCLDRTag(sUI5Tag), sCLDRTag);
		});
	});

	//*********************************************************************************************
	it("getParentLocaleTag", function () {
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("foo/bar/cldr-core/supplemental/parentLocales.json"))
			.twice()
			.returns({
				supplemental : {
					parentLocales : {
						parentLocale : {"~CLDRTag" : "~ParentCLDRTag"}
					}
				}
			});

		// code under test
		assert.strictEqual(Generator.getParentLocaleTag("foo/bar/", "~CLDRTag"), "~ParentCLDRTag");
		assert.strictEqual(Generator.getParentLocaleTag("foo/bar/", "~CLDRTagWithNoParent"), undefined);
	});

	//*********************************************************************************************
	it("formatLocaleData", function () {
		const sFilePath = join("~sSrcFolder/~packageName/main/~LocaleTag/~fileName");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilePath).returns(true);
		sinon.mock(fileContent).expects("getContent")
			.withExactArgs(sFilePath)
			.returns({
				main : {
					"~LocaleTag" : {
						identity : {language : "~Language"},
						localeDisplayNames : {languages : {}}
					}
				}
			});

		const oObjectTemplate = {template : "~Template", transform() {}};
		sinon.mock(j2j).expects("ObjectTemplate").withExactArgs("~Template").returns(oObjectTemplate);
		sinon.mock(oObjectTemplate).expects("transform")
			.withExactArgs({ identity : { language : "~Language" },localeDisplayNames : { languages : {} } })
			.returns({data : "~oResult", template : "~Template"});

		const mConfig = {
			fileName : "~fileName",
			packageName : "~packageName",
			template : "~Template"
		};
		const oResult = {data : "~oResult"};

		// code under test
		Generator.formatLocaleData("~sSrcFolder", mConfig, "~LocaleTag", oResult);

		assert.deepEqual(oResult, {data : "~oResult", template : "~Template"});
	});

	//*********************************************************************************************
	it("formatLocaleData: file doesn't exist", function () {
		const sFilePath = join("~sSrcFolder/~packageName/main/~LocaleTag/~fileName");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilePath).returns(false);
		sinon.mock(fileContent).expects("getContent").never();
		sinon.mock(j2j).expects("ObjectTemplate").never();

		const mConfig = {
			fileName : "~fileName",
			packageName : "~packageName"
		};

		// code under test
		Generator.formatLocaleData("~sSrcFolder", mConfig, "~LocaleTag", "~oResult");
	});

	//*********************************************************************************************
	it("getAllChildValues", function () {
		const oNode = {
			"~a": "~A",
			"~b": {/*...*/},
			"~c": "~C",
			"~d": {/*...*/},
			"_parent": "~parent"
		};
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("getAllChildValues").withExactArgs(sinon.match.same(oNode)).callThrough();
		oGeneratorMock.expects("getAllChildValues")
			.withExactArgs(sinon.match.same(oNode["~b"]))
			.returns(["~X", "~Y"]);
		oGeneratorMock.expects("getAllChildValues")
			.withExactArgs(sinon.match.same(oNode["~d"]))
			.returns(["~Z"]);

		// code under test
		assert.deepEqual(Generator.getAllChildValues(oNode), ["~A", "~X", "~Y", "~C", "~Z"]);
	});

	//*********************************************************************************************
	it("getTimezoneIDs: without prefix", function () {
		const oTimezoneNames = {
			"~a": "~A",
			"~b": {/*...*/},
			"~c": "~C",
			"_parent": "~parent"
		};
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("getTimezoneIDs").withExactArgs(sinon.match.same(oTimezoneNames)).callThrough();
		oGeneratorMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames["~b"]), "~b/")
			.returns(["~b/~x", "~b/~y"]);

		// code under test
		assert.deepEqual(Generator.getTimezoneIDs(oTimezoneNames), ["~a", "~b/~x", "~b/~y", "~c"]);
	});

	//*********************************************************************************************
	it("getTimezoneIDs: with prefix", function () {
		const oTimezoneNames = {
			"~a": "~A",
			"~b": {/*...*/},
			"~c": "~C",
			"_parent": "~parent"
		};
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames), "~prefix/")
			.callThrough();
		oGeneratorMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames["~b"]), "~prefix/~b/")
			.returns(["~prefix/~b/~x", "~prefix/~b/~y"]);

		// code under test
		assert.deepEqual(Generator.getTimezoneIDs(oTimezoneNames, "~prefix/"),
			["~prefix/~a", "~prefix/~b/~x", "~prefix/~b/~y", "~prefix/~c"]);
	});

	//*********************************************************************************************
	it("processConfigTemplates: without parent tag", function () {
		sinon.mock(Generator).expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");

		// code under test
		Generator.processConfigTemplates("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");
	});

	// *********************************************************************************************
	it("processConfigTemplates: with parent tag", function () {
		const oGeneratorMock = sinon.mock(Generator);

		oGeneratorMock.expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sParentLocaleTag", "~oResult");
		oGeneratorMock.expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");

		// code under test
		Generator.processConfigTemplates("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult", "~sParentLocaleTag");
	});

	//*********************************************************************************************
	[
		{CLDRTag : "zh-Hans-CN", PathTag : "zh-Hans"},
		{CLDRTag : "zh-Hant-TW", PathTag : "zh-Hant"}
	].forEach(function (oFixture) {
		it("processConfigTemplates: with special sCLDRTag: " + oFixture.CLDRTag, function () {
			sinon.mock(Generator).expects("formatLocaleData")
				.withExactArgs("~sSrcFolder", "~mConfig", oFixture.PathTag, "~oResult");

			// code under test
			Generator.processConfigTemplates("~sSrcFolder", "~mConfig", oFixture.CLDRTag, "~oResult");
		});
	});

	//*********************************************************************************************
	it("generateTimeZoneNames", function () {
		const oTimezoneNames = {
			"America": {
				"Adak": "Adak2",
				"Argentina": {
					"Buenos_Aires": "Buenos Aires"
				},
				"North_Dakota": {
					"Beulah": "Beulah, North Dakota"
				}
			}
		};
		const aGermanTimezoneIDs = ["Africa/Addis_Ababa", "Africa/Algiers", "America/Argentina/Buenos_Aires1",
			"Europe/Amsterdam", "America/North_Dakota/Beulah"];
		const oResult = {
			"Africa": {
				"Addis_Ababa": "Addis Ababa",
				"Algiers": "Algiers"
			},
			"America": {
				"Adak": "Adak2",
				"Argentina": {
					"Buenos_Aires": "Buenos Aires",
					"Buenos_Aires1": "Buenos Aires1"
				},
				"North_Dakota": {
					"Beulah": "Beulah, North Dakota"
				}
			},
			"Europe": {
				"Amsterdam": "Amsterdam"
			}
		};

		// code under test
		Generator.generateTimeZoneNames(oTimezoneNames, aGermanTimezoneIDs);

		assert.deepEqual(oTimezoneNames, oResult);
	});

	//*********************************************************************************************
	[true, false].forEach((bStringValueInCLDRData) => {
		const sTitle = `replaceObjectValuesInTimezoneNames:`
			+ ` ${bStringValueInCLDRData ? "replacement isn't done" : "replacement is done"}`;
		it(sTitle, function () {
			const oTimezoneNames = {
				America: {
					Thule: bStringValueInCLDRData ? "~sLocaleSpecificName" : {foo: "bar"}
				},
				Europe: {
					Dublin: bStringValueInCLDRData ? "~sLocaleSpecificName" : {foo: "bar"},
					London: bStringValueInCLDRData ? "~sLocaleSpecificName" : {foo: "bar"}
				},
				Pacific: {
					Honolulu: bStringValueInCLDRData ? "~sLocaleSpecificName" : {foo: "bar"}
				},
				"~a": "~notReplaced"
			};
			const oConsoleMock = sinon.mock(console);
			oConsoleMock.expects("log").withExactArgs("America/Thule\'s time zone name {\"foo\":\"bar\"} was"
				+ " replaced by \'Thule\' for locale \'~sCLDRTag\'")
				.exactly(bStringValueInCLDRData ? 0 : 1);
			oConsoleMock.expects("log").withExactArgs("Europe/Dublin\'s time zone name {\"foo\":\"bar\"} was"
				+ " replaced by \'Dublin\' for locale \'~sCLDRTag\'")
				.exactly(bStringValueInCLDRData ? 0 : 1);
			oConsoleMock.expects("log").withExactArgs("Europe/London\'s time zone name {\"foo\":\"bar\"} was"
				+ " replaced by \'London\' for locale \'~sCLDRTag\'")
				.exactly(bStringValueInCLDRData ? 0 : 1);
			oConsoleMock.expects("log").withExactArgs("Pacific/Honolulu\'s time zone name {\"foo\":\"bar\"} was"
				+ " replaced by \'Honolulu\' for locale \'~sCLDRTag\'")
				.exactly(bStringValueInCLDRData ? 0 : 1);

			// code under test
			Generator.replaceObjectValuesInTimezoneNames("~sCLDRTag", oTimezoneNames);

			assert.deepEqual(oTimezoneNames, {
				America: {
					Thule: bStringValueInCLDRData ? "~sLocaleSpecificName" : "Thule"
				},
				Europe: {
					Dublin: bStringValueInCLDRData ? "~sLocaleSpecificName" : "Dublin",
					London: bStringValueInCLDRData ? "~sLocaleSpecificName" : "London"
				},
				Pacific: {
					Honolulu: bStringValueInCLDRData ? "~sLocaleSpecificName" : "Honolulu"
				},
				"~a": "~notReplaced"
			});
		});
	});

	//*********************************************************************************************
	it("replaceOutdatedCLDRTimezoneNames", function () {
		const oTimezoneNames = {
			Africa: {Asmera: "~Asmera"},
			America: {
				Argentina: {},
				"Buenos_Aires": "~Buenos_Aires",
				Catamarca: "~Catamarca",
				"Coral_Harbour": "~Coral_Harbour",
				Cordoba: "~Cordoba",
				Godthab: "~Godthab",
				Indiana: {},
				Indianapolis: "~Indianapolis",
				Jujuy: "~Jujuy",
				Kentucky: {},
				Louisville: "~Louisville",
				Mendoza: "~Mendoza"
			},
			Asia: {Calcutta: "~Calcutta", Katmandu: "~Katmandu", Rangoon: "~Rangoon", Saigon: "~Saigon"},
			Atlantic: {Faeroe: "~Faeroe"},
			Pacific: {Ponape: "~Ponape", Truk: "~Truk"}
		};

		// code under test
		Generator.replaceOutdatedCLDRTimezoneNames(oTimezoneNames);

		assert.deepEqual(oTimezoneNames, {
			Africa: {Asmara: "~Asmera"},
			America: {
				Argentina: {
					"Buenos_Aires": "~Buenos_Aires",
					Catamarca: "~Catamarca",
					Cordoba: "~Cordoba",
					Jujuy: "~Jujuy",
					Mendoza: "~Mendoza"
				},
				Atikokan: "~Coral_Harbour",
				Indiana: {Indianapolis: "~Indianapolis"},
				Kentucky: {Louisville: "~Louisville"},
				Nuuk: "~Godthab"
			},
			Asia: {"Ho_Chi_Minh": "~Saigon", Kathmandu: "~Katmandu", Kolkata: "~Calcutta", Yangon: "~Rangoon"},
			Atlantic: {Faroe: "~Faeroe"},
			Pacific: {Chuuk: "~Truk", Pohnpei: "~Ponape"}
		});
	});

	//*********************************************************************************************
	it("updateTimezones: remember complete time zone IDs", function () {
		const oGenerator = {
			_aCompleteCLDRTimezoneIDs: [],
			checkTimezonesConsistency() {}
		};
		const oGeneratorMock = sinon.mock(Generator);
		const oResult = {
			timezoneNames: "~timezoneNames"
		};
		oGeneratorMock.expects("getTimezoneIDs").withExactArgs("~timezoneNames").returns("~completeTimezonNames");
		oGeneratorMock.expects("replaceOutdatedCLDRTimezoneNames").withExactArgs("~timezoneNames");
		oGeneratorMock.expects("replaceObjectValuesInTimezoneNames").withExactArgs("~sCLDRTag", "~timezoneNames");
		oGeneratorMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		oGeneratorMock.expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		sinon.mock(oGenerator).expects("checkTimezonesConsistency").withExactArgs("~sCLDRTag", "~sortedTimezoneNames");

		// code under test
		Generator.prototype.updateTimezones.call(oGenerator, oResult, "~sCLDRTag");

		assert.strictEqual(oGenerator._aCompleteCLDRTimezoneIDs, "~completeTimezonNames");
		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("updateTimezones: generateTimeZoneNames", function () {
		const oGenerator = {
			_aCompleteCLDRTimezoneIDs: "~_aCompleteCLDRTimezoneIDs",
			checkTimezonesConsistency() {}
		};
		const oGeneratorMock = sinon.mock(Generator);
		const oResult = {
			timezoneNames: "~timezoneNames"
		};
		oGeneratorMock.expects("generateTimeZoneNames").withExactArgs("~timezoneNames", "~_aCompleteCLDRTimezoneIDs");
		oGeneratorMock.expects("replaceOutdatedCLDRTimezoneNames").withExactArgs("~timezoneNames");
		oGeneratorMock.expects("replaceObjectValuesInTimezoneNames").withExactArgs("~sCLDRTag", "~timezoneNames");
		oGeneratorMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		oGeneratorMock.expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		sinon.mock(oGenerator).expects("checkTimezonesConsistency").withExactArgs("~sCLDRTag", "~sortedTimezoneNames");

		// code under test
		Generator.prototype.updateTimezones.call(oGenerator, oResult, "~sCLDRTag");

		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("updateTimezones: fix appendItems for zh-Hans-* locales", function () {
		const oGenerator = {
			_aCompleteCLDRTimezoneIDs: "~_aCompleteCLDRTimezoneIDs",
			checkTimezonesConsistency() {}
		};
		const oGeneratorMock = sinon.mock(Generator);
		const oResult = {
			"ca-gregorian": {
				dateTimeFormats: {
					appendItems: {Timezone: "~toBeReplaced"}
				}
			},
			timezoneNames: "~timezoneNames"
		};
		oGeneratorMock.expects("generateTimeZoneNames").withExactArgs("~timezoneNames", "~_aCompleteCLDRTimezoneIDs");
		oGeneratorMock.expects("replaceOutdatedCLDRTimezoneNames").withExactArgs("~timezoneNames");
		oGeneratorMock.expects("replaceObjectValuesInTimezoneNames").withExactArgs("zh-Hans-~foo", "~timezoneNames");
		oGeneratorMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		oGeneratorMock.expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		sinon.mock(oGenerator).expects("checkTimezonesConsistency")
			.withExactArgs("zh-Hans-~foo", "~sortedTimezoneNames");

		// code under test
		Generator.prototype.updateTimezones.call(oGenerator, oResult, "zh-Hans-~foo");

		assert.strictEqual(oResult["ca-gregorian"].dateTimeFormats.appendItems.Timezone, "{1} {0}");
		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("sort", function () {
		const oObject = {"~b": {/*...*/}, "~d": {/*...*/}, "~a": "~A", "~c": null};
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("sort").withExactArgs(sinon.match.same(oObject)).callThrough();
		oGeneratorMock.expects("sort").withExactArgs(sinon.match.same(oObject["~b"])).returns("~b_Sorted");
		oGeneratorMock.expects("sort").withExactArgs(sinon.match.same(oObject["~d"])).returns("~d_Sorted");

		// code under test
		const oResult = Generator.sort(oObject);

		assert.deepEqual(oResult, {"~a": "~A", "~b": "~b_Sorted", "~c": null, "~d": "~d_Sorted"});
		assert.deepEqual(Object.keys(oResult), ["~a", "~b", "~c", "~d"]);
	});

	//*********************************************************************************************
	[
		{
			sCLDRTag: "ar",
			accounting: "0\u202b¤\u200e\u202c",
			"currencyFormat-sap-short": "0\u202a¤\u202c",
			"currencyFormat-short": "0\u202b¤\u200e\u202c",
			"sap-accounting": "0\u202a¤\u202c",
			"sap-standard": "0\u202a¤\u202c",
			standard: "0\u202b¤\u200e\u202c"
		}, {
			sCLDRTag: "de",
			accounting: "0¤",
			"currencyFormat-sap-short": "0¤",
			"currencyFormat-short": "0¤",
			"sap-accounting": "0¤",
			"sap-standard": "0¤",
			standard: "0¤"
		}, {
			sCLDRTag: "fa",
			accounting: "0\u202a¤\u202c",
			"currencyFormat-sap-short": "0\u202a¤\u202c",
			"currencyFormat-short": "0\u202a¤\u202c",
			"sap-accounting": "0\u202a¤\u202c",
			"sap-standard": "0\u202a¤\u202c",
			standard: "0\u202a¤\u202c"
		}, {
			sCLDRTag: "he",
			accounting: "0¤\u200e",
			"currencyFormat-sap-short": "0\u200e¤",
			"currencyFormat-short": "0\u200e¤",
			"sap-accounting": "0¤\u200e",
			"sap-standard": "0¤\u200e",
			standard: "0¤\u200e"
		}
	].forEach((oFixture) => {
		it("updateCurrencyFormats integrative test: " + "'" + oFixture.sCLDRTag + "'", function () {
			const oResult = {
				currencyFormat: {
					standard: "0¤",
					accounting: "0¤",
					currencySpacing: {
						beforeCurrency: {
							insertBetween: "\u00a0"
						}
					}
				},
				"currencyFormat-short": {
					"1000-one": "0¤"
				}
			};

			// code under test
			Generator.updateCurrencyFormats(oFixture.sCLDRTag, oResult);

			assert.strictEqual(oResult.currencyFormat.accounting, oFixture.accounting);
			assert.deepEqual(oResult["currencyFormat-sap-short"], {"1000-one": oFixture["currencyFormat-sap-short"]});
			assert.deepEqual(oResult["currencyFormat-short"], {"1000-one": oFixture["currencyFormat-short"]});
			assert.strictEqual(oResult.currencyFormat["sap-accounting"], oFixture["sap-accounting"]);
			assert.strictEqual(oResult.currencyFormat["sap-standard"], oFixture["sap-standard"]);
			assert.strictEqual(oResult.currencyFormat.standard, oFixture.standard);
		});
	});

	//*********************************************************************************************
	it("updateCurrencyFormats integrative test 'en-IN'", function () {
		const oResult = {
			currencyFormat: {
				standard: "0¤",
				accounting: "0¤",
				currencySpacing: {
					beforeCurrency: {
						insertBetween: "\u00a0"
					}
				}
			},
			"currencyFormat-short": "~currencyFormatShort",
			"decimalFormat-short": "~decimalFormatShort"
		};

		// code under test
		Generator.updateCurrencyFormats("en-IN", oResult);

		assert.deepEqual(oResult["currencyFormat-short"],
			{
				"1000-one": "¤0K",
				"1000-other": "¤0K",
				"10000-one": "¤00K",
				"10000-other": "¤00K",
				"100000-one": "¤000K",
				"100000-other": "¤000K",
				"1000000-one": "¤0M",
				"1000000-other": "¤0M",
				"10000000-one": "¤00M",
				"10000000-other": "¤00M",
				"100000000-one": "¤000M",
				"100000000-other": "¤000M",
				"1000000000-one": "¤0B",
				"1000000000-other": "¤0B",
				"10000000000-one": "¤00B",
				"10000000000-other": "¤00B",
				"100000000000-one": "¤000B",
				"100000000000-other": "¤000B",
				"1000000000000-one": "¤0T",
				"1000000000000-other": "¤0T",
				"10000000000000-one": "¤00T",
				"10000000000000-other": "¤00T",
				"100000000000000-one": "¤000T",
				"100000000000000-other": "¤000T"
			}
		);
		assert.deepEqual(oResult["decimalFormat-short"],
			{
				"1000-one": "0K",
				"1000-other": "0K",
				"10000-one": "00K",
				"10000-other": "00K",
				"100000-one": "000K",
				"100000-other": "000K",
				"1000000-one": "0M",
				"1000000-other": "0M",
				"10000000-one": "00M",
				"10000000-other": "00M",
				"100000000-one": "000M",
				"100000000-other": "000M",
				"1000000000-one": "0B",
				"1000000000-other": "0B",
				"10000000000-one": "00B",
				"10000000000-other": "00B",
				"100000000000-one": "000B",
				"100000000000-other": "000B",
				"1000000000000-one": "0T",
				"1000000000000-other": "0T",
				"10000000000000-one": "00T",
				"10000000000000-other": "00T",
				"100000000000000-one": "000T",
				"100000000000000-other": "000T"
			}
		);
	});

	//*********************************************************************************************
	[
		{
			sCLDRTag: "ar",
			currencySign: "\u202b¤\u200e\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202b¤\u200e\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: true
		}, {
			sCLDRTag: "fa",
			currencySign: "\u202a¤\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202a¤\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: false
		}, {
			sCLDRTag: "he",
			currencySign: "¤\u200e",
			currencySignTrailing: "¤\u200e",
			shortCurrencySign: "\u200e¤",
			shortCurrencySignTrailing: "\u200e¤",
			transformTrailingCurrency: false
		}, {
			sCLDRTag: "foo",
			currencySign: "¤",
			currencySignTrailing: "¤",
			shortCurrencySign: "¤",
			shortCurrencySignTrailing: "¤",
			transformTrailingCurrency: true
		}
	].forEach((oFixture) => {
		it("updateCurrencyFormats: " + "'" + oFixture.sCLDRTag + "'", function () {
			const oResult = {
				currencyFormat: {
					currencySpacing: {
						beforeCurrency: {
							insertBetween: "~CurrencySpacingBefore"
						}
					}
				},
				"currencyFormat-short": "~CurrencyFormatShort"
			};

			sinon.mock(Generator).expects("updateAccountingAndStandardCurrencyFormat")
				.withExactArgs(sinon.match.same(oResult.currencyFormat), oFixture.currencySign,
					"~CurrencySpacingBefore", oFixture.transformTrailingCurrency, oFixture.currencySignTrailing);
			sinon.mock(Generator).expects("updateShortCurrencyFormats")
				.withExactArgs("~CurrencyFormatShort", oFixture.shortCurrencySign, "~CurrencySpacingBefore",
					oFixture.transformTrailingCurrency, oFixture.shortCurrencySignTrailing)
				.returns("~CurrencyFormatSAPShort");

			// code under test
			Generator.updateCurrencyFormats(oFixture.sCLDRTag, oResult);

			assert.strictEqual(oResult["currencyFormat-sap-short"], "~CurrencyFormatSAPShort");
		});
	});

	//*********************************************************************************************
	it("getTrailingCurrency transform trailing: true", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformCurrencyPattern")
			.withExactArgs("~foo", "~CurrencySpacingBefore")
			.returns("~a¤;~b¤~c;¤~b");

		// code under test
		assert.strictEqual(
			Generator.getTrailingCurrency("~foo", "~CurrencySpacingBefore", true, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingCurrency transform trailing: false", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformCurrencyPattern").never();

		// code under test
		assert.strictEqual(
			Generator.getTrailingCurrency("~a¤;~b¤~c;¤~b", "~CurrencySpacingBefore", false, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingShortCurrency transform trailing: true", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformShortCurrencyPattern")
			.withExactArgs("~foo", "~CurrencySpacingBefore")
			.returns("~a¤;~b¤~c;¤~b");

		// code under test
		assert.strictEqual(
			Generator.getTrailingShortCurrency("~foo", "~CurrencySpacingBefore", true, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingShortCurrency transform trailing: false", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformShortCurrencyPattern").never();

		// code under test
		assert.strictEqual(
			Generator.getTrailingShortCurrency("~a¤;~b¤~c;¤~b", "~CurrencySpacingBefore", false, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("updateAccountingAndStandardCurrencyFormat", function () {
		const oCurrencyFormat = {
			accounting: "~x¤~y;~z¤",
			standard: "~a¤~b;~c¤"
		};
		const GeneratorMock = sinon.mock(Generator);

		GeneratorMock.expects("getTrailingCurrency")
			.withExactArgs("~a¤~b;~c¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~currencySignTrailingReplacement")
			.returns("~standardTrailing");
		GeneratorMock.expects("getTrailingCurrency")
			.withExactArgs("~x¤~y;~z¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~currencySignTrailingReplacement")
			.returns("~accountingTrailing");

		// code under test
		Generator.updateAccountingAndStandardCurrencyFormat(oCurrencyFormat, "$", "~CurrencySpacingBefore",
			"~bTransformTrailingCurrency", "~currencySignTrailingReplacement");

		assert.strictEqual(oCurrencyFormat.accounting, "~x$~y;~z$");
		assert.strictEqual(oCurrencyFormat.standard, "~a$~b;~c$");
		assert.strictEqual(oCurrencyFormat["sap-accounting"], "~accountingTrailing");
		assert.strictEqual(oCurrencyFormat["sap-standard"], "~standardTrailing");
	});

	//*********************************************************************************************
	it("updateShortCurrencyFormats", function () {
		const oCurrencyFormatShort = {a: "a¤;¤A", b: "b¤;¤B"};
		const GeneratorMock = sinon.mock(Generator);

		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("a¤;¤A", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			.returns("~newA");

		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("b¤;¤B", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			.returns("~newB");

		// code under test
		assert.deepEqual(
			Generator.updateShortCurrencyFormats(oCurrencyFormatShort, "€", "~CurrencySpacingBefore",
				"~bTransformTrailingCurrency", "~sShortCurrencySignTrailingReplacement"),
			{a: "~newA", b: "~newB"}
		);

		assert.deepEqual(oCurrencyFormatShort, {a: "a€;€A", b: "b€;€B"});
	});

	//*********************************************************************************************
	["~sUI5Tag", "zh_TW" /* BCP: 2380141822 */].forEach((sUI5Tag) => {
		it("generateLocaleFile", function () {
			const oGenerator = {
				_sCLDRVersion: "~sCLDRVersion",
				_sSourceFolder: "~sSourceFolder",
				_oTerritories: {
					updateLocaleTerritories() {}
				},
				_sTimestamp: "~sTimestamp",
				aUI5Tags: [sUI5Tag],
				checkAllDateTimePatterns() {},
				checkUnsupporedRTLCodes() {},
				cleanupFileCacheAndWriteResult() {},
				updateMonthAbbreviations() {},
				updateTimezones() {}
			};
			const oGeneratorMock = sinon.mock(Generator);
			let oResult;

			oGeneratorMock.expects("getCLDRTag").withExactArgs(sUI5Tag).returns("~sCLDRTag");
			oGeneratorMock.expects("getParentLocaleTag")
				.withExactArgs("~sSourceFolder", "~sCLDRTag")
				.returns("~sParentLocaleTag");
			configs.forEach((mConfig, i) => {
				oGeneratorMock.expects("processConfigTemplates")
					.withExactArgs("~sSourceFolder", sinon.match.same(mConfig), "~sCLDRTag", sinon.match.object,
						"~sParentLocaleTag")
					.callsFake((sSourceFolder, mConfig, sCLDRTag, oResult0, sParentLocaleTag) => {
						if (i === 0) {
							assert.deepEqual(oResult0, {
								"__buildtime": "~sTimestamp",
								"__license": "This file has been derived from Unicode Common Locale Data Repository"
									+ " (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice"
									+ " in the Unicode-Data-Files-LICENSE.txt available at the same location as this"
									+ " file or visit http://www.unicode.org/copyright.html",
								"__version": "~sCLDRVersion"
							});
							oResult = oResult0;
						} else {
							assert.strictEqual(oResult, oResult0);
						}
					});
			});
			sinon.mock(oGenerator).expects("updateMonthAbbreviations")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			oGeneratorMock.expects("addMissingLanguageNameForMontenegrin")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			sinon.mock(oGenerator._oTerritories).expects("updateLocaleTerritories")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			oGeneratorMock.expects("updateCurrencyFormats")
				.withExactArgs("~sCLDRTag", sinon.match((oResult0) => oResult0 === oResult));
			sinon.mock(oGenerator).expects("updateTimezones")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), "~sCLDRTag");
			oGeneratorMock.expects("addStaticData")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), "~sCLDRTag");
			oGeneratorMock.expects("checkUnsupporedRTLCodes")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));
			sinon.mock(oGenerator).expects("checkAllDateTimePatterns")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));
			sinon.mock(oGenerator).expects("cleanupFileCacheAndWriteResult")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));

			// code under test
			Generator.prototype.generateLocaleFile.call(oGenerator, sUI5Tag);
		});
	});

	//*********************************************************************************************
	it("getPropertyPathValue", function () {
		const oData = {
			a: "A",
			b: {
				c: "C",
				d: {
					e: 42,
					f: {
						g: ["G"]
					}
				}
			}
		};
		const oDataCopy = JSON.parse(JSON.stringify(oData));

		// code under test
		assert.strictEqual(Generator.getPropertyPathValue(oData, []), oData);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "x", "y"]), undefined);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["a"]), "A");
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "c"]), "C");
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d"]), oData.b.d);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d", "e"]), 42);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d", "f", "g"]), oData.b.d.f.g);

		assert.deepEqual(oData, oDataCopy, "source object not modified");
	});

	//*********************************************************************************************
	it("updateAlternatives", function () {
		const oGeneratorMock = sinon.mock(Generator);
		const aFormerData = ["a", "bFormer", ["c", "cFormer"], ["dFormer0", "dFormer1"], ["eFormer0", "e"]];
		oGeneratorMock.expects("getPropertyPathValue")
			.withExactArgs("~oFormerData", "~aPropertyPathNames")
			.returns(aFormerData);
		const aCurrentData = ["a", "b", "c", "d", "e"];
		oGeneratorMock.expects("getPropertyPathValue")
			.withExactArgs("~oData", "~aPropertyPathNames")
			.returns(aCurrentData);

		// code under test
		Generator.updateAlternatives("~oFormerData", "~oData", "~aPropertyPathNames");

		assert.deepEqual(aCurrentData,
			["a", ["b", "bFormer"], ["c", "cFormer"], ["d", "dFormer0", "dFormer1"], ["e", "eFormer0"]]);
	});

	//*********************************************************************************************
	it("updateMonthAbbreviations: no former CLDR data", function () {
		const oGenerator = {_sOutputFolder: "~_sOutputFolder"};
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("~_sOutputFolder/~sUI5Tag.json"))
			.throws(new Error());

		// code under test
		Generator.prototype.updateMonthAbbreviations.call(oGenerator, "~oResult", "~sUI5Tag");
	});

	//*********************************************************************************************
	it("updateMonthAbbreviations: with former CLDR data", function () {
		const oGenerator = {_sOutputFolder: "~_sOutputFolder"};
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("~_sOutputFolder/~sUI5Tag.json"))
			.returns("~oFormerCLDRData");
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-gregorian", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-gregorian", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-islamic", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-islamic", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-japanese", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-japanese", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-persian", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-persian", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-buddhist", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-buddhist", "months", "stand-alone", "abbreviated"]);

		// code under test
		Generator.prototype.updateMonthAbbreviations.call(oGenerator, "~oResult", "~sUI5Tag");
	});

	//*********************************************************************************************
	it("start: success", function () {
		const oGenerator = {
			_sOutputFolder: "~_sOutputFolder",
			_sSourceFolder: "~_sSourceFolder",
			_aTasks: [],
			_oTerritories: {
				writeTerritoriesCache() {}
			},
			_oTimezones: {
				updateTimezones() {},
				ready() {}
			},
			emit() {},
			generateLocaleFile() {},
			logUnsupportedDateTimePatterns() {}
		};
		const oGeneratorMock = sinon.mock(oGenerator);
		sinon.mock(util).expects("setSupplePath").withExactArgs(join("~_sSourceFolder/cldr-core/supplemental"));
		sinon.mock(oGenerator._oTimezones).expects("updateTimezones").withExactArgs({
			"America/Argentina/Buenos_Aires": "America/Buenos_Aires",
			"America/Argentina/Catamarca": "America/Catamarca",
			"America/Argentina/Cordoba": "America/Cordoba",
			"America/Argentina/Jujuy": "America/Jujuy",
			"America/Argentina/Mendoza": "America/Mendoza",
			"America/Indiana/Indianapolis": "America/Indianapolis",
			"America/Kentucky/Louisville": "America/Louisville",
			"Africa/Asmara": "Africa/Asmera",
			"Asia/Kathmandu": "Asia/Katmandu",
			"Asia/Kolkata": "Asia/Calcutta",
			"Atlantic/Faroe": "Atlantic/Faeroe",
			"Pacific/Pohnpei": "Pacific/Ponape",
			"Asia/Yangon": "Asia/Rangoon",
			"Pacific/Chuuk": "Pacific/Truk",
			"America/Nuuk": "America/Godthab",
			"Asia/Ho_Chi_Minh": "Asia/Saigon",
			"America/Atikokan": "America/Coral_Harbour"
		});
		[
			"ar", "ar_EG", "ar_SA", "bg", "ca", "cnr", "cs", "cy", "da", "de", "de_AT", "de_CH", "el", "el_CY",
			"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
			"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
			"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
			"lv", "mk", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr",
			"sr_Latn", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"
		].forEach((sUI5LanguageTag) => {
			oGeneratorMock.expects("generateLocaleFile").withExactArgs(sUI5LanguageTag);
		});
		oGeneratorMock.expects("logUnsupportedDateTimePatterns").withExactArgs();
		sinon.mock(oGenerator._oTerritories).expects("writeTerritoriesCache").withExactArgs()
			.returns("~writeTerritoriesCache");
		sinon.mock(oGenerator._oTimezones).expects("ready").withExactArgs().returns("~ready");
		oGeneratorMock.expects("emit").withExactArgs("allLocaleJSONReady", [undefined]);

		// code under test
		assert.strictEqual(Generator.prototype.start.call(oGenerator), oGenerator);
	});

	//*********************************************************************************************
	it("logUnsupportedDateTimePatterns: no unsupported patterns found", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		sinon.mock(console).expects("log").never();

		// code under test
		return Generator.prototype.logUnsupportedDateTimePatterns.call(oGenerator);
	});

	//*********************************************************************************************
	it("logUnsupportedDateTimePatterns: unsupported patterns", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: {foo: "~bar", baz: [{}, {}, {}]}};
		sinon.mock(console).expects("log")
			.withExactArgs("ERROR: Unsupported date time patterns found: "
				+ JSON.stringify({foo: "~bar", baz: "3 occurrence(s)"}, undefined, "\t"));

		// code under test
		return Generator.prototype.logUnsupportedDateTimePatterns.call(oGenerator);
	});

	//*********************************************************************************************
	it("checkAllDateTimePatterns", function () {
		const oGenerator = {checkDateTimePatternsForPath() {}};
		const oGeneratorMock = sinon.mock(oGenerator);
		[
			["ca-gregorian", "dateFormats"],
			["ca-gregorian", "timeFormats"],
			["ca-gregorian", "dateTimeFormats", "availableFormats"],
			["ca-gregorian", "dateTimeFormats", "intervalFormats"],
			["ca-islamic", "dateFormats"],
			["ca-islamic", "timeFormats"],
			["ca-islamic", "dateTimeFormats", "availableFormats"],
			["ca-islamic", "dateTimeFormats", "intervalFormats"],
			["ca-japanese", "dateFormats"],
			["ca-japanese", "timeFormats"],
			["ca-japanese", "dateTimeFormats", "availableFormats"],
			["ca-japanese", "dateTimeFormats", "intervalFormats"],
			["ca-persian", "dateFormats"],
			["ca-persian", "timeFormats"],
			["ca-persian", "dateTimeFormats", "availableFormats"],
			["ca-persian", "dateTimeFormats", "intervalFormats"],
			["ca-buddhist", "dateFormats"],
			["ca-buddhist", "timeFormats"],
			["ca-buddhist", "dateTimeFormats", "availableFormats"],
			["ca-buddhist", "dateTimeFormats", "intervalFormats"]
		].forEach((aPropertyPathNames) => {
			oGeneratorMock.expects("checkDateTimePatternsForPath")
				.withExactArgs("~sUI5Tag", "~oResult", aPropertyPathNames);
		});

		// code under test
		Generator.prototype.checkAllDateTimePatterns.call(oGenerator, "~sUI5Tag", "~oResult");
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: recursive call", function () {
		const oGenerator = {checkDateTimePatternsForPath() {}};
		const aPropertyPathNames = ["~foo", "~bar"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({nestedObject: {}});
		sinon.mock(oGenerator).expects("checkDateTimePatternsForPath")
			.withExactArgs("~sUI5Tag", "~oResult", ["~foo", "~bar", "nestedObject"]);

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult", aPropertyPathNames);
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: remember unsupported pattern symbols", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		const aPropertyPathNames = ["~foo", "~bar"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({
				delimiters: "\u002d\u007E\u2010\u2011\u2012\u2013\u2014\ufe58\ufe63\uff0d\uFF5E", // ignored,
				ignoredValues: "0123456789{}[]", // ignored
				intervalFormatFallback: "abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXYZ", // ignored
				rtl: "\u061c\u200e\u200f\u202a\u202b\u202c", // ignored
				supportedSymbols: "aBcdDEGhHkKLmMqQusSVwWXyYzZ",
				unsupportedSymbols0: "abcdefghijklmnopqrstuvwxz", // unsupported: "befgijlnoprtvx"
				unsupportedSymbols0copy: "abcdefghijklmnopqrstuvwxz", // unsupported: "befgijlnoprtvx"
				unsupportedSymbols1: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // unsupported: ACFIJNOPRTU"
				whitespaces: "\u3000\u0020\u1680\u2000\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u00A0"
					+ "\u2007\u202F" //ignored
			});

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
			aPropertyPathNames);

		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, {
			befgijlnoprtvx: {
				"~sUI5Tag": [
					"\"abcdefghijklmnopqrstuvwxz\" found in ~foo/~bar/unsupportedSymbols0",
					"\"abcdefghijklmnopqrstuvwxz\" found in ~foo/~bar/unsupportedSymbols0copy"
				]
			},
			ACFIJNOPRTU: {
				"~sUI5Tag": ["\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\" found in ~foo/~bar/unsupportedSymbols1"]
			}
		});
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: print pattern symbol occurrences of e/v in availableFormats", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		const aPropertyPathNames = ["~foo", "~bar", "availableFormats"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({
				foov: "h:mm v", // ignored,
				bare: "h:mm a e", // ignored
				barev: "h:mm a e v", // ignored
				baz: " e",
				foo: " v",
				Fe: "Fe",
				fooe: "h:mm v"
			});

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
			aPropertyPathNames);

		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, {
			e: {
				"~sUI5Tag": ["\" e\" found in ~foo/~bar/availableFormats/baz"]
			},
			F: {
				"~sUI5Tag": ["\"Fe\" found in ~foo/~bar/availableFormats/Fe"]
			},
			v: {
				"~sUI5Tag": [
					"\" v\" found in ~foo/~bar/availableFormats/foo",
					"\"h:mm v\" found in ~foo/~bar/availableFormats/fooe"
				]
			}
		});
	});

	//*********************************************************************************************
	[
		{
			sPatternKey: "hmv",
			oExpectedLog: {
				e: {
					"~sUI5Tag": ["\"h:mm:ss e\" found in ~foo/~bar/intervalFormats/hmv/m"]
				}
			}
		}, {
			sPatternKey: "hme",
			oExpectedLog: {
				v: {
					"~sUI5Tag": ["\"h:mm:ss v\" found in ~foo/~bar/intervalFormats/hme/h"]
				}
			}
		}, {
			sPatternKey: "hm",
			oExpectedLog: {
				v: {
					"~sUI5Tag": ["\"h:mm:ss v\" found in ~foo/~bar/intervalFormats/hm/h"]
				},
				e: {
					"~sUI5Tag": ["\"h:mm:ss e\" found in ~foo/~bar/intervalFormats/hm/m"]
				}
			}
		}
	].forEach((oFixture) => {
		const sTitle = `checkDateTimePatternsForPath: print pattern symbol occurrences of e/v in intervalFormats for`
			+ ` key: ${oFixture.sPatternKey}`;
		it(sTitle, function () {
			const oGenerator = {_mUnsupportedDateTimePatterns: null};
			const aPropertyPathNames = ["~foo", "~bar", "intervalFormats", oFixture.sPatternKey];
			const oGeneratorMock = sinon.mock(Generator);
			oGeneratorMock.expects("getPropertyPathValue")
				.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
				.returns({
					h: "h:mm:ss v",
					m: "h:mm:ss e"
				});

			// code under test
			Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
				aPropertyPathNames);

			assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, oFixture.oExpectedLog);
		});
	});

	//*********************************************************************************************
	[{
		sUI5Tag: "ko",
		oExpectedLog: {
			ee: {
				"ko": ["\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/e"]
			}
		}
	}, {
		sUI5Tag: "~sUI5Tag",
		oExpectedLog: {
			ee: {
				"~sUI5Tag": [
					"\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/d",
					"\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/e"
				]
			}
		}
	}].forEach((oFixture) => {
		const sTitle = "checkDateTimePatternsForPath: Exclude the known Korean interval pattern 'GyMMMEd/d'"
			+ " from the output";
		it(sTitle, function () {
			const oGenerator = {_mUnsupportedDateTimePatterns: null};
			const aPropertyPathNames = ["~foo", "~bar", "intervalFormats", "GyMMMEd"];
			sinon.mock(Generator).expects("getPropertyPathValue")
				.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
				.returns({
					d: "e - e", // ignored for locale/UI5Tag 'ko'
					e: "e - e"
				});

			// code under test
			Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, oFixture.sUI5Tag, "~oResult",
				aPropertyPathNames);

			assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, oFixture.oExpectedLog);
		});
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: language name for cnr already exists", function () {
		const oResult = {languages: {cnr: "~cnr"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").never();

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.strictEqual(oResult.languages, oLanguages);
		assert.strictEqual(oResult.languages.cnr, "~cnr");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: reuse sr_ME translation", function () {
		const oResult = {languages: {"c": "~c", "cm": "~cm", "cnra": "~cnra", "sr_ME": "~sr_ME"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").never();

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
		assert.strictEqual(oResult.languages.cnr, "~sr_ME");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
		assert.strictEqual(oResult.languages["sr_ME"], "~sr_ME");
		assert.deepEqual(Object.keys(oResult.languages), ["c", "cm", "cnr", "cnra", "sr_ME"]);
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: from resource bundle", function () {
		const oResult = {languages: {"cnra": "~cnra"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag")
			.returns({"languagename.cnr": {text: "~cnr"}});

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
		assert.strictEqual(oResult.languages.cnr, "~cnr");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
		assert.deepEqual(Object.keys(oResult.languages), ["cnr", "cnra"]);
	});

	//*********************************************************************************************
	[{}, undefined].forEach((vResourceBundle, i) => {
		it("addMissingLanguageNameForMontenegrin: no translation found in resource bundle, #" + i, function () {
			const oResult = {languages: {sr: "~sr"}, territories: {ME: "~ME"}};
			const oLanguages = oResult.languages;
			sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag")
				.returns(vResourceBundle);

			// code under test
			Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

			assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
			assert.strictEqual(oResult.languages.cnr, "~sr (~ME)");
			assert.strictEqual(oResult.languages.cnr_ME, "~sr (~ME)");
		});
	});

	//*********************************************************************************************
	it("getResourceBundle: recursive call", function () {
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("getResourceBundle").withExactArgs("~a_~b").callThrough();
		const ofsMock = sinon.mock(fs);
		ofsMock.expects("existsSync").withExactArgs(resolve("./lib/i18n/i18n_~a_~b.json")).returns(false);
		oGeneratorMock.expects("getResourceBundle").withExactArgs("~a").returns("~oBundle");

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~a_~b"), "~oBundle");
	});

	//*********************************************************************************************
	it("getResourceBundle: no resource bundle", function () {
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~a").callThrough();
		sinon.mock(fs).expects("existsSync").withExactArgs(resolve("./lib/i18n/i18n_~a.json")).returns(false);

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~a"), undefined);
	});

	//*********************************************************************************************
	it("getResourceBundle: load resource bundle and parse", function () {
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag").callThrough();
		const sFilename = resolve("./lib/i18n/i18n_~sUI5Tag.json");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilename).returns(true);
		sinon.mock(fileContent).expects("getContent").withExactArgs(sFilename).returns("~oBundle");

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~sUI5Tag"), "~oBundle");
	});
});
