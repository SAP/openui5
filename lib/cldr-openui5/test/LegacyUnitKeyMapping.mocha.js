/*eslint-env mocha */
import assert from "node:assert";
import fs from "node:fs/promises";
import { join } from "node:path";
import sinon from "sinon";
import LegacyUnitKeyMapping from "../lib/LegacyUnitKeyMapping.js";

describe("LegacyUnitKeyMapping.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
		sinon.restore();
	});

	//*********************************************************************************************
	it("constructor", function () {
		// code under test
		const oUnitMapper = new LegacyUnitKeyMapping("~aLocales");

		assert.strictEqual(oUnitMapper.aLocales, "~aLocales");
		assert.deepEqual(oUnitMapper.mLocale2LegacyUnits, {});
		assert.strictEqual(oUnitMapper.mChangedUnitKeys, undefined);
	});

	//*********************************************************************************************
	it("importOldUnits", async function () {
		const oUnitMapper = new LegacyUnitKeyMapping(["de", "foo", "en"]);

		const oFsMock = sinon.mock(fs);
		oFsMock.expects("readFile")
			.withExactArgs(join("~path", "de.json"))
			.resolves("{\"units\":{\"short\":\"~deUnits\"}}");
		oFsMock.expects("readFile").withExactArgs(join("~path", "foo.json")).rejects(/*file not found*/);
		oFsMock.expects("readFile")
			.withExactArgs(join("~path", "en.json"))
			.resolves("{\"units\":{\"short\":\"~enUnits\"}}");

		// code under test
		await oUnitMapper.importOldUnits("~path");

		assert.deepEqual(oUnitMapper.mLocale2LegacyUnits, {
			de: "~deUnits",
			en: "~enUnits"
		});
	});

	//*********************************************************************************************
	it("analyseUnits: skip unknown locales", function () {
		const oUnitMapper = new LegacyUnitKeyMapping(["en"]);
		const oCldrData = {units: {"short": "~units"}};

		sinon.mock(oUnitMapper).expects("collectChangedUnitKeys").never();

		// code under test
		oUnitMapper.analyseUnits(oCldrData, "~unknownLocale");
	});

	//*********************************************************************************************
	it("analyseUnits: add renamed keys to mChangedUnitKeys", function () {
		const oUnitMapper = new LegacyUnitKeyMapping(["de", "en"]);
		const oCldrData = {units: {"short": "~newUnits"}};

		oUnitMapper.mChangedUnitKeys = {oldKey0: null, oldKey1: null};
		oUnitMapper.mLocale2LegacyUnits.de = {oldKey0: "~unit0", oldKey1: "~unit1"};
		oUnitMapper.mLocale2LegacyUnits.en = {oldKey0: "~unit0", oldKey1: "~unit1"};
		oUnitMapper.mLocale2LegacyUnits.foo = {oldKey0: "~unit2", oldKey1: "~unit3"};

		const oConsoleMock = sinon.mock(console);
		oConsoleMock.expects("error").never();
		const oUnitMapperMock = sinon.mock(oUnitMapper);
		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit0", "~newUnits").returns("newKey0");
		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit1", "~newUnits").returns(undefined);

		// code under test: found keys are assigned
		oUnitMapper.analyseUnits(oCldrData, "de");

		assert.deepEqual(oUnitMapper.mChangedUnitKeys,
			{oldKey0: {key: "newKey0", locale: "de"}, oldKey1: null});

		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit0", "~newUnits").returns(undefined);
		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit1", "~newUnits").returns("newKey1");

		// code under test: found keys are assigned, not found keys do not overwrite earlier found keys
		oUnitMapper.analyseUnits(oCldrData, "en");

		assert.deepEqual(oUnitMapper.mChangedUnitKeys,
			{oldKey0: {key: "newKey0", locale: "de"}, oldKey1: {key: "newKey1", locale: "en"}});

		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit2", "~newUnits").returns(undefined);
		oUnitMapperMock.expects("findNewUnitKey").withExactArgs("~unit3", "~newUnits").returns("~unexpectedKey");
		oConsoleMock.expects("error")
			.withExactArgs("ERROR: contradictory unit keys found for ~unit3\n"
				+ "\tfound unit keys: newKey1 (en) vs. ~unexpectedKey (foo)");

		// code under test: log error if another key is found in a different locale
		oUnitMapper.analyseUnits(oCldrData, "foo");

		assert.deepEqual(oUnitMapper.mChangedUnitKeys,
			{oldKey0: {key: "newKey0", locale: "de"}, oldKey1: {key: "newKey1", locale: "en"}});
	});

	//*********************************************************************************************
	it("collectChangedUnitKeys", function () {
		const oUnitMapper = new LegacyUnitKeyMapping();
		const oOldUnits = {u0: "notRelevant", u1: "notRelevant", u2: "notRelevant", u3: "notRelevant"};
		const oNewUnits = {u0: "notRelevant", u2: "notRelevant", u4: "notRelevant", u5: "notRelevant"};

		// code under test
		const mResult = oUnitMapper.collectChangedUnitKeys(oOldUnits, oNewUnits);

		assert.strictEqual(mResult, oUnitMapper.mChangedUnitKeys);
		assert.deepEqual(mResult, {u1: null, u3: null});

		// code under test: does not overwrite created data
		assert.strictEqual(oUnitMapper.collectChangedUnitKeys(oOldUnits, oNewUnits), mResult);
	});

	//*********************************************************************************************
	it("findNewUnitKey", function () {
		const oUnitMapper = new LegacyUnitKeyMapping();
		const oNewUnits = {key0: {displayName: "g"}, key1: {displayName: "kg"}, key2: {displayName: "t"}};

		// code under test
		assert.strictEqual(oUnitMapper.findNewUnitKey({displayName: "l"}, oNewUnits), undefined);
		// code under test
		assert.strictEqual(oUnitMapper.findNewUnitKey({displayName: "t"}, oNewUnits), "key2");
	});

	//*********************************************************************************************
	it("getFinalUnitMapping", function () {
		const oUnitMapper = new LegacyUnitKeyMapping();
		oUnitMapper.mChangedUnitKeys = {
			oldKey0: {key: "newKey0", locale: "de"},
			oldKey1: null,
			oldKey2: {key: "newKey2", locale: "en"}
		};

		// code under test
		assert.strictEqual(oUnitMapper.getFinalUnitMapping(),
			JSON.stringify({oldKey0: "newKey0", oldKey1: null, oldKey2: "newKey2"}, null, "\t"));
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function (vEmpty) {
		it(`writeUnitMappingToLocaleData: no changed keys found: empty value ${JSON.stringify(vEmpty)}`, function () {
			const oUnitMapper = new LegacyUnitKeyMapping();
			oUnitMapper.mChangedUnitKeys = vEmpty;

			sinon.mock(console).expects("log").withExactArgs("INFO: no new legacy unit keys detected");

			// code under test
			oUnitMapper.writeUnitMappingToLocaleData();
		});
	});

	//*********************************************************************************************
	it("writeUnitMappingToLocaleData: writeFile successful", async function () {
		const oUnitMapper = new LegacyUnitKeyMapping();
		oUnitMapper.mChangedUnitKeys = "~mChangedUnitKeys";

		let sFilePath;
		const oFsMock = sinon.mock(fs);
		oFsMock.expects("readFile").withExactArgs(sinon.match("LocaleData.js")).callsFake(function (sFilePath0) {
			sFilePath = sFilePath0;
			return Promise.resolve("~fileContent");
		});
		sinon.mock(oUnitMapper).expects("getFinalUnitMapping").withExactArgs().returns("~legacyUnitMapping");
		oFsMock.expects("writeFile")
			.withExactArgs(
				sinon.match(function (sFilePath0) {
					return sFilePath0 === sFilePath;
				}),
				"// FIXME: New Legacy Unit Keys found\n"
				+ "// 1. Enhance mLegacyUnit2CurrentUnit\n"
				+ "// 2. Update related tests\n"
				+ "// 3. Update demokit mapping: https://ui5.sap.com/#/topic/8e618a8d93cb4f92adc911b96047eb8d\n"
				+ "// ~legacyUnitMapping\n~fileContent"
			)
			.resolves();
		sinon.mock(console).expects("log").withExactArgs("DONE, new legacy unit keys added to LocaleData.js");

		// code under test
		await oUnitMapper.writeUnitMappingToLocaleData();
	});

	//*********************************************************************************************
	it("writeUnitMappingToLocaleData: writeFile fails", async function () {
		const oUnitMapper = new LegacyUnitKeyMapping();
		oUnitMapper.mChangedUnitKeys = "~mChangedUnitKeys";

		let sFilePath;
		const oFsMock = sinon.mock(fs);
		oFsMock.expects("readFile").withExactArgs(sinon.match("LocaleData.js")).callsFake(function (sFilePath0) {
			sFilePath = sFilePath0;
			return Promise.resolve("~fileContent");
		});
		sinon.mock(oUnitMapper).expects("getFinalUnitMapping").withExactArgs().returns("~legacyUnitMapping");
		const oError = new Error("~error");
		oFsMock.expects("writeFile")
			.withExactArgs(
				sinon.match(function (sFilePath0) {
					return sFilePath0 === sFilePath;
				}),
				"// FIXME: New Legacy Unit Keys found\n"
				+ "// 1. Enhance mLegacyUnit2CurrentUnit\n"
				+ "// 2. Update related tests\n"
				+ "// 3. Update demokit mapping: https://ui5.sap.com/#/topic/8e618a8d93cb4f92adc911b96047eb8d\n"
				+ "// ~legacyUnitMapping\n~fileContent"
			)
			.rejects(oError);
		sinon.mock(console).expects("log").never();

		// code under test
		await assert.rejects(async function () {
			await oUnitMapper.writeUnitMappingToLocaleData();
		}, oError);
	});

});
