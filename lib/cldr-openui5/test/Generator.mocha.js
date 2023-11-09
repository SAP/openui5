/*eslint-env mocha */
import assert from "node:assert";
import { join, resolve } from "node:path";
import fs from "node:fs";
import fileContent from "../lib/fileContent.js";
import Generator from "../lib/Generator.js";
import j2j from "json2json";
import sinon from "sinon";

describe("Generator.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
		sinon.restore();
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
	it("#oTZNamesReplacements is private member", function () {
		// code under test
		assert.strictEqual(Generator["#oTZNamesReplacements"], undefined);
	});

	//*********************************************************************************************
	const oCAReplacements = {"Europe/Mariehamn": "Mariehamn"};
	const oCYReplacements = {
		"Atlantic/Cape_Verde": "Cape Verde",
		"Europe/Moscow": "Moscow",
		"Europe/Zaporozhye": "Zaporozhye"
	};
	const oENReplacements = {"Europe/London": "London", "Europe/Dublin": "Dublin", "Pacific/Honolulu": "Honolulu"};
	const oFRReplacements = {"America/Tegucigalpa": "Tégucigalpa"};
	const oITReplacements = {"America/Panama": "Panamá", "Asia/Qostanay": "Qostanay", "Indian/Christmas": "Natale"};
	const oPTReplacements = {"Asia/Makassar": "Makassar"};
	const oAllReplacements = {"Pacific/Kanton": "Kanton"};
	[
		{sCLDRTag: "ca", oReplacements: oCAReplacements},
		{sCLDRTag: "cy", oReplacements: oCYReplacements},
		{sCLDRTag: "en", oReplacements: oENReplacements},
		{sCLDRTag: "en_AU", oReplacements: oENReplacements},
		{sCLDRTag: "en_GB", oReplacements: oENReplacements},
		{sCLDRTag: "en_HK", oReplacements: oENReplacements},
		{sCLDRTag: "en_IE", oReplacements: oENReplacements},
		{sCLDRTag: "en_IN", oReplacements: oENReplacements},
		{sCLDRTag: "en_NZ", oReplacements: oENReplacements},
		{sCLDRTag: "en_PG", oReplacements: oENReplacements},
		{sCLDRTag: "en_SG", oReplacements: oENReplacements},
		{sCLDRTag: "en_ZA", oReplacements: oENReplacements},
		{sCLDRTag: "fr", oReplacements: oFRReplacements},
		{sCLDRTag: "fr_BE", oReplacements: oFRReplacements},
		{sCLDRTag: "fr_CA", oReplacements: oFRReplacements},
		{sCLDRTag: "fr_CH", oReplacements: oFRReplacements},
		{sCLDRTag: "fr_LU", oReplacements: oFRReplacements},
		{sCLDRTag: "it", oReplacements: oITReplacements},
		{sCLDRTag: "it_CH", oReplacements: oITReplacements},
		{sCLDRTag: "pt", oReplacements: oPTReplacements},
		{sCLDRTag: "pt_PT", oReplacements: oPTReplacements}
	].forEach((oFixture) => {
		it("fixTimezoneNames: with locale specific replacements: " + oFixture.sCLDRTag, function () {
			const oGeneratorMock = sinon.mock(Generator);
			oGeneratorMock.expects("replaceTimezoneNames")
				.withExactArgs(oFixture.sCLDRTag, oFixture.oReplacements, "~oTimezoneNames");
			oGeneratorMock.expects("replaceTimezoneNames")
				.withExactArgs(oFixture.sCLDRTag, oAllReplacements, "~oTimezoneNames");

			// code under test
			Generator.fixTimezoneNames(oFixture.sCLDRTag, "~oTimezoneNames");
		});
	});

	//*********************************************************************************************
	[
		"ar", "ar_EG", "ar_SA", "bg", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY", "es", "es_AR", "es_BO",
		"es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "he", "hi", "hr", "hu", "id", "ja",
		"kk", "ko", "lt", "lv", "ms", "nb", "nl", "nl_BE", "pl", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv",
		"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"
	].forEach((sCLDRTag) => {
		it("fixTimezoneNames: without locale specific replacements: " + sCLDRTag, function () {
			sinon.mock(Generator).expects("replaceTimezoneNames")
				.withExactArgs(sCLDRTag, oAllReplacements, "~oTimezoneNames");

			// code under test
			Generator.fixTimezoneNames(sCLDRTag, "~oTimezoneNames");
		});
	});

	//*********************************************************************************************
	it("replaceTimezoneNames", function () {
		const oTimezoneNames = {
			"~a": {"~b": "~fromCLDR"},
			"~c": {"~d": "~sameValue"},
			"~e": {
				"~f": {"~any": "~value"}
			},
			"~g": {}
		};
		const oReplacements = {
			"~a/~b": "~fromReplacement", // don't overwrite string values
			"~c/~d": "~sameValue",
			"~e/~f": "~overwriteObjectValue",
			"~g/~h": "~newValue"
		};
		const oConsoleMock = sinon.mock(console);
		oConsoleMock.expects("log").withExactArgs("~e/~f\'s time zone name {\"~any\":\"~value\"} was replaced by"
			+ " '~overwriteObjectValue' for locale '~sCLDRTag'");
		oConsoleMock.expects("log").withExactArgs("~g/~h\'s time zone name undefined was replaced by '~newValue'"
			+ " for locale '~sCLDRTag'");

		// code under test
		Generator.replaceTimezoneNames("~sCLDRTag", oReplacements, oTimezoneNames);

		assert.deepEqual(oTimezoneNames, {
			"~a": {"~b": "~fromCLDR"},
			"~c": {"~d": "~sameValue"},
			"~e": {"~f": "~overwriteObjectValue"},
			"~g": {"~h": "~newValue"}
		});
	});

	//*********************************************************************************************
	it("enrichEnglishTimezoneNames", function () {
		sinon.mock(Generator).expects("generateTimeZoneNames").withExactArgs("~oTimezoneNames", "~aGermanTimezoneIDs");

		// code under test
		Generator.enrichEnglishTimezoneNames("en-GB", "~oTimezoneNames", "~aGermanTimezoneIDs");

		// code under test
		Generator.enrichEnglishTimezoneNames("ar-SA", "~oTimezoneNames", "~aGermanTimezoneIDs");
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
});
