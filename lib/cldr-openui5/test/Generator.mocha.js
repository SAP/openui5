/*eslint-env mocha */
import assert from "node:assert";
import { join } from "node:path";
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
	it("enrichEnglishTimezoneNames", function () {
		sinon.mock(Generator).expects("generateTimeZoneNames").withExactArgs("~oTimezoneNames", "~aGermanTimezoneIDs");

		// code under test
		Generator.enrichEnglishTimezoneNames("en-GB", "~oTimezoneNames", "~aGermanTimezoneIDs");

		// code under test
		Generator.enrichEnglishTimezoneNames("ar-SA", "~oTimezoneNames", "~aGermanTimezoneIDs");
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
});
