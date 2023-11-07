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
});
