/*eslint-env mocha */
import assert from "node:assert";
import fs from "node:fs/promises";
import { join } from "node:path";
import sinon from "sinon";
import Territories from "../lib/Territories.js";

describe("Territories.js", function () {

	//*********************************************************************************************
	afterEach(function () {
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
			ar_EG: {
				TW: "تايوان",
				HK: "هونج كونج",
				MO: "ماكاو"
			},
			ar_SA: {
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
		const oStub = sinon.stub(oTerritories, "cacheLocaleTerritories");
		const oData = {
			territories: {
				"HK": "~hk",
				"HK-alt-short": "~hk short",
				"MO": "~mo",
				"MO-alt-short": "~mo short"
			}
		};

		// code under test
		oTerritories.updateLocaleTerritories(oData, "~locale");

		assert.deepEqual(oData.territories, {
			"HK": "~hk short",
			"HK-alt-short": "~hk short",
			"MO": "~mo short",
			"MO-alt-short": "~mo short"
		});

		assert.strictEqual(oStub.callCount, 1);
		assert.ok(oStub.getCall(0).calledWithExactly(sinon.match.same(oData.territories), "~locale"));
	});

	//*********************************************************************************************
	it("updateLocaleTerritories: use custom territories", function () {
		const oTerritories = new Territories();
		oTerritories.mCustomTerritories["~locale"] = {HK: "~hk custom", MO: "~mo custom"};
		const oStub = sinon.stub(oTerritories, "cacheLocaleTerritories");
		const oData = {territories: {HK: "~hk", MO: "~mo"}};

		// code under test
		oTerritories.updateLocaleTerritories(oData, "~locale");

		assert.deepEqual(oData.territories, {HK: "~hk custom", MO: "~mo custom"});

		assert.strictEqual(oStub.callCount, 1);
		assert.ok(oStub.getCall(0).calledWithExactly(sinon.match.same(oData.territories), "~locale"));
	});

	//*********************************************************************************************
	it("writeTerritoriesCache: success", async function () {
		const oTerritories = new Territories();
		oTerritories.mTerritoriesCache["~locale"] = "~territories";
		const sExpectedFileContent = JSON.stringify({"~locale": "~territories"}, null, "\t");
		const oStubLog = sinon.stub(console, "log");
		const oStubWriteFile = sinon.stub(fs, "writeFile");

		oStubWriteFile.resolves();

		// code under test
		await oTerritories.writeTerritoriesCache();

		assert.strictEqual(oStubWriteFile.callCount, 1);
		assert.ok(oStubWriteFile.getCall(0)
			.calledWithExactly(sinon.match(join("resources", "territories.json")), sExpectedFileContent));
		assert.strictEqual(oStubLog.callCount, 1);
		assert.ok(oStubLog.getCall(0).calledWithExactly(sinon.match(/DONE, territories updated:.*territories\.json/)));
	});

	//*********************************************************************************************
	it("writeTerritoriesCache: error", async function () {
		const oTerritories = new Territories();
		oTerritories.mTerritoriesCache["~locale"] = "~territories";
		const sExpectedFileContent = JSON.stringify({"~locale": "~territories"}, null, "\t");
		const oStubLog = sinon.stub(console, "error");
		const oStubWriteFile = sinon.stub(fs, "writeFile");

		const oError = new Error("~error");
		oStubWriteFile.rejects(oError);

		// code under test
		await oTerritories.writeTerritoriesCache();

		assert.strictEqual(oStubWriteFile.callCount, 1);
		assert.ok(oStubWriteFile.getCall(0)
			.calledWithExactly(sinon.match(join("resources", "territories.json")), sExpectedFileContent));
		assert.strictEqual(oStubLog.callCount, 2);
		assert.ok(oStubLog.getCall(0).calledWithExactly("failed to write 'territories.json'"));
		assert.ok(oStubLog.getCall(1).calledWithExactly(oError));
	});

});
