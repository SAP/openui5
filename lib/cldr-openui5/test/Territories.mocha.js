/*eslint-env mocha */
import assert from "node:assert";
import fs from "node:fs/promises";
import { join } from "node:path";
import sinon from "sinon";
import Territories from "../lib/Territories.js";

describe("Territories.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
		sinon.restore();
	});

	//*********************************************************************************************
	it("constructor", function () {
		// code under test
		const oTerritories = new Territories();

		assert.deepEqual(oTerritories.mTerritoriesCache, {});
		assert.deepEqual(oTerritories.mCustomTerritories, {
			ar: {
				TW: "تايوان",
				HK: "هونج كونج",
				MO: "ماكاو"
			},
			"ar_EG": {
				TW: "تايوان",
				HK: "هونج كونج",
				MO: "ماكاو"
			},
			"ar_SA": {
				TW: "تايوان",
				HK: "هونج كونج",
				MO: "ماكاو"
			},
			hi: {
				TW: "ताईवान",
				HK: "हांग कांग",
				MO: "मकाओ"
			},
			kk: {
				TW: "Тайвань",
				HK: "Гонконг",
				MO: "Макао"
			}
		});
	});

	//*********************************************************************************************
	it("cacheLocaleTerritories", function () {
		const oTerritories = new Territories();

		// code under test
		oTerritories.cacheLocaleTerritories({EN: "~en", HK: "~hk", MO: "~mo", TW: "~tw"}, "~locale");

		assert.deepEqual(oTerritories.mTerritoriesCache, {"~locale": {HK: "~hk", MO: "~mo", TW: "~tw"}});
	});

	//*********************************************************************************************
	it("updateLocaleTerritories: use short alternative", function () {
		const oTerritories = new Territories();
		const oData = {
			territories: {
				"HK": "~hk",
				"HK-alt-short": "~hk short",
				"MO": "~mo",
				"MO-alt-short": "~mo short"
			}
		};

		sinon.mock(oTerritories).expects("cacheLocaleTerritories")
			.withExactArgs(sinon.match.same(oData.territories), "~locale");

		// code under test
		oTerritories.updateLocaleTerritories(oData, "~locale");

		assert.deepEqual(oData.territories, {
			"HK": "~hk short",
			"HK-alt-short": "~hk short",
			"MO": "~mo short",
			"MO-alt-short": "~mo short"
		});
	});

	//*********************************************************************************************
	it("updateLocaleTerritories: use custom territories", function () {
		const oTerritories = new Territories();
		oTerritories.mCustomTerritories["~locale"] = {HK: "~hk custom", MO: "~mo custom"};
		const oData = {territories: {HK: "~hk", MO: "~mo"}};

		sinon.mock(oTerritories).expects("cacheLocaleTerritories")
			.withExactArgs(sinon.match.same(oData.territories), "~locale");

		// code under test
		oTerritories.updateLocaleTerritories(oData, "~locale");

		assert.deepEqual(oData.territories, {HK: "~hk custom", MO: "~mo custom"});
	});

	//*********************************************************************************************
	it("writeTerritoriesCache: success", async function () {
		const oTerritories = new Territories();
		oTerritories.mTerritoriesCache["~locale"] = "~territories";
		const sExpectedFileContent = JSON.stringify({"~locale": "~territories"}, null, "\t");

		sinon.mock(fs).expects("writeFile")
			.withExactArgs(sinon.match(join("resources", "territories.json")), sExpectedFileContent)
			.resolves();
		sinon.mock(console).expects("log").withExactArgs(sinon.match(/DONE, territories updated:.*territories\.json/));

		// code under test
		await oTerritories.writeTerritoriesCache();
	});

	//*********************************************************************************************
	it("writeTerritoriesCache: error", async function () {
		const oTerritories = new Territories();
		oTerritories.mTerritoriesCache["~locale"] = "~territories";
		const sExpectedFileContent = JSON.stringify({"~locale": "~territories"}, null, "\t");

		const oError = new Error("~error");
		sinon.mock(fs).expects("writeFile")
			.withExactArgs(sinon.match(join("resources", "territories.json")), sExpectedFileContent)
			.rejects(oError);
		sinon.mock(console).expects("log").never();

		// code under test
		await assert.rejects(async function () {
			await oTerritories.writeTerritoriesCache();
		}, oError);
	});

});
