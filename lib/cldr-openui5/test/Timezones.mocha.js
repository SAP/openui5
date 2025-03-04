/*eslint-env mocha */
import assert from "node:assert";
import fs from "node:fs/promises";
import sinon from "sinon";
import Timezones from "../lib/Timezones.js";

describe("Timezones.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
	});

	//*********************************************************************************************
	it("loadTimezonesFiles: success", async function () {
		const oTimezones = new Timezones();
		const oFsMock = sinon.mock(fs);
		oFsMock.expects("readFile").withExactArgs(sinon.match(/_timezones.js$/), "utf8").resolves("~content");
		oFsMock.expects("readFile").withExactArgs(sinon.match(/TimezoneUtils.js$/), "utf8")
			.resolves("~content1");
		sinon.mock(oTimezones).expects("loadBCP47Timezones").withExactArgs();

		// code under test
		await oTimezones.loadTimezonesFiles();

		assert.strictEqual(oTimezones.sFileContent, "~content");
		assert.strictEqual(oTimezones.sUtilsFileContent, "~content1");
	});

	//*********************************************************************************************
	it("loadTimezonesFiles: error", async function () {
		const oTimezones = new Timezones();
		const oError = new Error("~error");
		const fsMock = sinon.mock(fs);
		fsMock.expects("readFile").withExactArgs(sinon.match(/_timezones.js$/), "utf8").rejects(oError);

		// code under test (readFile "_timezones.js" fails)
		await assert.rejects(async function () {
			await oTimezones.loadTimezonesFiles();
		}, oError);

		fsMock.expects("readFile")
			.withExactArgs(sinon.match(/_timezones.js$/), "utf8")
			.resolves();
		fsMock.expects("readFile")
			.withExactArgs(sinon.match(/TimezoneUtils.js$/), "utf8")
			.rejects(oError);

		// code under test (readFile "TimezoneUtils.js" fails)
		await assert.rejects(async function () {
			await oTimezones.loadTimezonesFiles();
		}, oError);

		fsMock.expects("readFile")
			.withExactArgs(sinon.match(/_timezones.js$/), "utf8")
			.resolves();
		fsMock.expects("readFile")
			.withExactArgs(sinon.match(/TimezoneUtils.js$/), "utf8")
			.resolves();
		sinon.mock(oTimezones).expects("loadBCP47Timezones")
			.withExactArgs()
			.rejects(oError);

		// code under test (loadBCP47Timezones fails)
		await assert.rejects(async function () {
			await oTimezones.loadTimezonesFiles();
		}, oError);
	});

	//*********************************************************************************************
	it("writeTimezonesFiles: success", async function () {
		const oTimezones = new Timezones();
		oTimezones.sFileContent = "~content";
		oTimezones.sUtilsFileContent = "~utilsFilecontent";

		let sPath;
		const oFsMock = sinon.mock(fs);
		oFsMock.expects("writeFile").callsFake(function (sPath0, sContent0) {
			sPath = sPath0;
			assert.ok(sPath0.endsWith("_timezones.js"));
			assert.strictEqual(sContent0, "~content");
			return Promise.resolve();
		});
		const oConsoleMock = sinon.mock(console);
		oConsoleMock.expects("log").callsFake(function (sText) {
			assert.strictEqual(sText, `DONE, timezones updated: ${sPath}`);
		});
		let sTimezoneUtilsPath;
		oFsMock.expects("writeFile").callsFake(function (sPath0, sContent0) {
			sTimezoneUtilsPath = sPath0;
			assert.ok(sPath0.endsWith("TimezoneUtils.js"));
			assert.strictEqual(sContent0, "~utilsFilecontent");
			return Promise.resolve();
		});
		oConsoleMock.expects("log").callsFake(function (sText) {
			assert.strictEqual(sText, `DONE, TimezoneUtils updated: ${sTimezoneUtilsPath}`);
		});

		// code under test
		await oTimezones.writeTimezonesFiles();
	});

	//*********************************************************************************************
	it("writeTimezonesFiles: error", async function () {
		const oTimezones = new Timezones();
		oTimezones.sFileContent = "~content";

		const oError = new Error("~error");
		sinon.mock(fs).expects("writeFile").callsFake(function (sPath0, sContent0) {
			assert.ok(/^.*_timezones.js$/.test(sPath0));
			assert.strictEqual(sContent0, "~content");
			return Promise.reject(oError);
		});
		sinon.mock(console).expects("log").never();


		// code under test
		await assert.rejects(async function () {
			await oTimezones.writeTimezonesFiles();
		}, oError);
	});

	//*********************************************************************************************
	it("processABAPTimezonesArray: success", async function () {
		const oFsMock = sinon.mock(fs);
		const oJSONContent = {
			d: {
				results: [
					{
						"value": "~sTimezone1"
					}, {
						"value": "~sTimezone2"
					}
				]
			}
		};
		const oStats = {mtime: new Date().toUTCString()};
		const oTimezones = new Timezones();
		oFsMock.expects("stat").withExactArgs(sinon.match(/ABAPTz.json$/)).resolves(oStats);
		oFsMock.expects("readFile").withExactArgs(sinon.match(/ABAPTz.json$/)).resolves("~content");
		sinon.mock(JSON).expects("parse").withExactArgs("~content").returns(oJSONContent);
		sinon.mock(oTimezones).expects("updateArray")
			.withExactArgs("aABAPTimezoneIDs",
				sinon.match((aParam) => {
					return aParam === oTimezones.aABAPTimezoneIDs &&
						aParam[0] === "~sTimezone1" &&
						aParam[1] === "~sTimezone2" &&
						aParam.length === 2 &&
						aParam === oTimezones.aABAPTimezoneIDs;
				})
			);
		sinon.mock(console).expects("log")
			.withExactArgs("DONE, the aABAPTimezonesIDs in the _timezones.js file has been updated");

		// code under test
		await oTimezones.processABAPTimezonesArray();

		assert.deepEqual(oTimezones.aABAPTimezoneIDs, ["~sTimezone1", "~sTimezone2"]);
	});

	//*********************************************************************************************
	it("processABAPTimezonesArray: error file is older than 7 days", async function () {
		const oDate = new Date();
		const oError = new Error("The 'ABAPTz.json' file is more than 7 days old."
				+ " Please update the file and run this job again.");
		oDate.setDate(oDate.getDate() - 14);
		const oStats = {mtime: oDate.toUTCString()};
		sinon.mock(fs).expects("stat").withExactArgs(sinon.match(/ABAPTz.json$/)).resolves(oStats);

		// code under test
		await assert.rejects(async function () {
			await new Timezones().processABAPTimezonesArray();
		}, oError);
	});

	//*********************************************************************************************
	it("processABAPTimezonesArray: error", async function () {
		const oError = new Error("~error");
		sinon.mock(fs).expects("stat").withExactArgs(sinon.match(/ABAPTz.json$/)).rejects(oError);

		// code under test
		await assert.rejects(async function () {
			await new Timezones().processABAPTimezonesArray();
		}, oError);
	});

	//*********************************************************************************************
	it("updateArray", function () {
		const oTimezones = new Timezones();
		oTimezones.sFileContent = "\t// comment0\n"
			+ "\tvar aArray0 = [\"value0\", \"value1\"];\n"
			+ "\t// comment1\n"
			+ "\tvar aArray1 = [\"value2\", \"value3\"];\n"
			+ "\tcomment2\n"
			+ "\tvar aArray2 = [\"value4\", \"value5\"];";

		// code under test
		oTimezones.updateArray("aArray1", ["value30", "value20", "value10", "value20"]);

		assert.strictEqual(
			oTimezones.sFileContent,
			"\t// comment0\n"
				+ "\tvar aArray0 = [\"value0\", \"value1\"];\n"
				+ "\t// comment1\n"
				+ "\tvar aArray1 = [\n"
				+ "\t\t\"value10\",\n"
				+ "\t\t\"value20\",\n"
				+ "\t\t\"value30\"\n"
				+ "\t];\n"
				+ "\tcomment2\n"
				+ "\tvar aArray2 = [\"value4\", \"value5\"];");
	});

	//*********************************************************************************************
	it("updateTimezones", async function () {
		const oTimezones = new Timezones();
		const oMock = sinon.mock(oTimezones);

		oMock.expects("loadTimezonesFiles").withExactArgs().resolves();
		oMock.expects("processABAPTimezonesArray").withExactArgs().resolves();
		oMock.expects("processCLDRTimezonesArray").withExactArgs("~sCLDRVersion");
		oMock.expects("updateTimezonesMap").withExactArgs();

		// code under test
		await oTimezones.updateTimezones("~sCLDRVersion");
	});

	//*********************************************************************************************
	it("updateTimezonesMap", function () {
		const oTimezones = new Timezones();
		oTimezones.sUtilsFileContent = "foo\n"
			+ "\tTimezoneUtils.mTimezoneAliases2ABAPTimezones = {\n"
			+ "\t\t\"America/Catamarca\": \"America/Argentina/Catamarca\"\n"
			+ "\t\t\"America/Buenos_Aires\": \"America/Argentina/Buenos_Aires\",\n"
			+ "\t};\n"
			+ "bar";
		oTimezones.mAlias2SupportedTz = {
			"Same/ID/As/ABAP": "Same/ID/As/ABAP",
			"Foo/Bar": "America/Buenos_Aires",
			"America/Argentina/Buenos_Aires_Alias": "America/Buenos_Aires",
			"America/Argentina/Katamarka_Alias": "America/Catamarca",
			"America/Some_City_ABAP_Alias": "America/Some_City_CLDR",
			"Etc/Universal": "Etc/UTC", // this mapping must never end up in the final map
			"Only/In/Alias": "Only/in/CLDR"
		};
		const mCLDR2ABAPTimezoneMapping = {
			"Same/ID/As/ABAP": "Same/ID/As/ABAP",
			"America/Buenos_Aires": "America/Argentina/Buenos_Aires",
			"America/Catamarca": "America/Argentina/Katamarka", // test changed city name
			"America/Some_City_CLDR": "America/Some_City_ABAP" // test new entry
		};

		const oTimezonesMock = sinon.mock(oTimezones);
		oTimezonesMock.expects("getCLDR2ABAPTimezoneMapping").withExactArgs().returns(mCLDR2ABAPTimezoneMapping);

		// code under test
		oTimezones.updateTimezonesMap();

		assert.strictEqual(oTimezones.sUtilsFileContent,
			"foo\n"
			+ "\tTimezoneUtils.mTimezoneAliases2ABAPTimezones = {\n"
			+ "\t\t\"America/Argentina/Buenos_Aires_Alias\": \"America/Argentina/Buenos_Aires\",\n"
			+ "\t\t\"America/Argentina/Katamarka_Alias\": \"America/Argentina/Katamarka\",\n"
			+ "\t\t\"America/Some_City_ABAP_Alias\": \"America/Some_City_ABAP\",\n"
			+ "\t\t\"Foo/Bar\": \"America/Argentina/Buenos_Aires\",\n"
			+ "\t\t\"Only/In/Alias\": \"Only/in/CLDR\"\n"
			+ "\t};\n"
			+ "bar");
	});

	//*********************************************************************************************
	it("loadBCP47Timezones", async function () {
		const oTimezones = new Timezones();
		const BCP47ParsedContent = {
			keyword: {
				u: {
					tz: {
						"foo": {
							"_description": "Bar",
							"_alias": "Foo/Bar"
						},
						"baz": {
							"_description": "Foo",
							"_alias": "Bar/Foo Baz/Bar"
						},
						"_baz": { "_alias": "Baz"}, // "_" keys are ignored}
						"unk": {
							"_alias": "Etc/Unknown Factory"
						}
					}
				}
			}
		};
		sinon.mock(fs).expects("readFile").withExactArgs(sinon.match(/timezone.json$/), "utf8")
			.resolves("~content2");
		sinon.mock(JSON).expects("parse").withExactArgs("~content2").returns(BCP47ParsedContent);

		// code under test
		await oTimezones.loadBCP47Timezones();

		assert.deepEqual(oTimezones.aSupportedTimezones,["Foo/Bar", "Bar/Foo"]);
		assert.deepEqual(oTimezones.mAlias2SupportedTz, {
			"Foo/Bar": "Foo/Bar",
			"Bar/Foo": "Bar/Foo",
			"Baz/Bar": "Bar/Foo"
		});
	});

	//*********************************************************************************************
	it("loadBCP47Timezones: error log", async function () {
		const oTimezones = new Timezones();
		const BCP47ParsedContent = {
			keyword: {
				u: {
					tz: {
						"bar": {
							"_deprecated": true,
							"_description": "Bar"
						},
						"foo": {
							"_description": "Foo" // neither _alias, nor _deprecated
						}
					}
				}
			}
		};

		sinon.mock(fs).expects("readFile").withExactArgs(sinon.match(/timezone.json$/), "utf8")
			.resolves("~content2");
		sinon.mock(JSON).expects("parse").withExactArgs("~content2").returns(BCP47ParsedContent);
		sinon.mock(console).expects("log")
			.withExactArgs("ERROR: BCP47 timezone with key 'foo' has no _alias and is not deprecated");

		// code under test
		await oTimezones.loadBCP47Timezones();

		assert.deepEqual(oTimezones.aSupportedTimezones, []);
		assert.deepEqual(oTimezones.mAlias2SupportedTz, {});
	});

	//*********************************************************************************************
	it("getCLDR2ABAPTimezoneMapping", function () {
		const oTimezones = new Timezones();
		oTimezones.mCLDR2ABAPTimezones = {};

		// code under test
		assert.strictEqual(oTimezones.getCLDR2ABAPTimezoneMapping(), oTimezones.mCLDR2ABAPTimezones);

		oTimezones.mCLDR2ABAPTimezones = undefined;
		oTimezones.aABAPTimezoneIDs = ["America/Argentina/Buenos_Aires", "tzABAPAndCLDR"];
		oTimezones.aSupportedTimezones = ["America/Buenos_Aires", "tzABAPAndCLDR", "tzOnlyCLDR"];
		oTimezones.mAlias2SupportedTz = {
			"America/Buenos_Aires": "America/Buenos_Aires",
			"America/Argentina/Buenos_Aires": "America/Buenos_Aires",
			"tzABAPAndCLDR": "tzABAPAndCLDR",
			"tzOnlyCLDR": "tzOnlyCLDR"
		};
		const mCLRD2ABAPTimezoneResult = {"America/Buenos_Aires": "America/Argentina/Buenos_Aires"};
		sinon.mock(console).expects("log")
			.withExactArgs("WARNING: No matching ABAP timezone found for CLDR timezone 'tzOnlyCLDR'");

		// code under test
		assert.deepEqual(oTimezones.getCLDR2ABAPTimezoneMapping(), mCLRD2ABAPTimezoneResult);
	});

	//*********************************************************************************************
	it("isTimezoneSupported", function () {
		const oTimezones = new Timezones();

		sinon.mock(oTimezones).expects("getCLDR2ABAPTimezoneMapping").withExactArgs()
			.returns({"America/Buenos_Aires": "America/Argentina/Buenos_Aires"});
		oTimezones.aSupportedTimezones = ["America/Buenos_Aires", "Europe/Berlin"];
		assert.ok(!oTimezones.oSupportedABAPTimezoneIDs);

		// code under test
		assert.strictEqual(oTimezones.isTimezoneSupported("America/Argentina/Buenos_Aires"), true);
		assert.strictEqual(oTimezones.isTimezoneSupported("Foo/Bar"), false);
		assert.deepEqual(oTimezones.oSupportedABAPTimezoneIDs,
			new Set(["America/Argentina/Buenos_Aires", "Europe/Berlin"]));
	});

	//*********************************************************************************************
	[true, false].forEach((bHasDeprecatedTimezones) => {
		it(`deleteUnsupportedTimezoneNames: Has deprecated time zone = ${bHasDeprecatedTimezones}`, function () {
			const oCurrentTimezones = "~oCurrentTimezones";
			const oTimezones = new Timezones();
			const oTimezonesMock = sinon.mock(oTimezones);

			oTimezonesMock.expects("_deleteUnsupportedTimezoneNames")
				.withExactArgs("~oCurrentTimezones", sinon.match.instanceOf(Set))
				.callsFake((oCurrentTimezones, oDeprecatedTimezones) => {
					if (bHasDeprecatedTimezones) {
						oDeprecatedTimezones.add("Foo/Bar");
						oDeprecatedTimezones.add("Bar/Baz");
					}
				});
			sinon.mock(console).expects("log")
				.withExactArgs("INFO: Deleted deprecated timezone translations: Foo/Bar, Bar/Baz")
				.exactly(bHasDeprecatedTimezones ? 1 : 0);

			// code under test
			oTimezones.deleteUnsupportedTimezoneNames(oCurrentTimezones);

			oTimezonesMock.expects("_deleteUnsupportedTimezoneNames").withExactArgs("~oCurrentTimezones",
				sinon.match.instanceOf(Set));

			// code under test - does not log twice
			oTimezones.deleteUnsupportedTimezoneNames(oCurrentTimezones);
		});
	});

	//*********************************************************************************************
	it("_deleteUnsupportedTimezoneNames: Delete deprecated time zones", function () {
		const oCurrentTimezones = {Foo: "~Foo", Bar: "~Bar", Baz: "~Baz"};
		const oDeprecatedTimezones = {add() {}};
		const oTimezones = new Timezones();
		const oTimezonesMock = sinon.mock(oTimezones);

		oTimezonesMock.expects("isTimezoneSupported").withExactArgs("~Prefix/Foo").returns(false);
		const oDeprecatedTimezonesMock = sinon.mock(oDeprecatedTimezones);
		oDeprecatedTimezonesMock.expects("add")
			.withExactArgs("~Prefix/Foo");
		oTimezonesMock.expects("isTimezoneSupported").withExactArgs("~Prefix/Bar").returns(true);
		oTimezonesMock.expects("isTimezoneSupported").withExactArgs("~Prefix/Baz").returns(false);
		oDeprecatedTimezonesMock.expects("add")
			.withExactArgs("~Prefix/Baz");

		// code under test
		oTimezones._deleteUnsupportedTimezoneNames(oCurrentTimezones, oDeprecatedTimezones, "~Prefix/");

		assert.deepEqual(oCurrentTimezones, {Bar: "~Bar"});
	});

	//*********************************************************************************************
	it("_deleteUnsupportedTimezoneNames: 'Etc/Universal' is never deleted", function () {
		const oCurrentTimezones = {Universal: "~Universal"};
		const oDeprecatedTimezones = {add() {}};
		const oTimezones = new Timezones();

		sinon.mock(oTimezones).expects("isTimezoneSupported").withExactArgs("Etc/Universal").returns(false);
		sinon.mock(oDeprecatedTimezones).expects("add").never();

		// code under test
		oTimezones._deleteUnsupportedTimezoneNames(oCurrentTimezones, oDeprecatedTimezones, "Etc/");

		assert.deepEqual(oCurrentTimezones, {Universal: "~Universal"});
	});

	//*********************************************************************************************
	it("_deleteUnsupportedTimezoneNames: Recursion", function () {
		const oFoo = {};
		const oBar = {};
		const oCurrentTimezones = {Foo: oFoo, Bar: oBar};
		const oTimezones = new Timezones();
		const oTimezonesMock = sinon.mock(oTimezones);

		oTimezonesMock.expects("_deleteUnsupportedTimezoneNames")
			.withExactArgs(sinon.match.same(oCurrentTimezones), "~Set")
			.callThrough();
		oTimezonesMock.expects("_deleteUnsupportedTimezoneNames")
			.withExactArgs(sinon.match.same(oFoo), "~Set", "Foo/");
		oTimezonesMock.expects("_deleteUnsupportedTimezoneNames")
			.withExactArgs(sinon.match.same(oBar), "~Set", "Bar/");

		// code under test
		oTimezones._deleteUnsupportedTimezoneNames(oCurrentTimezones, "~Set");
	});

	//*********************************************************************************************
	it("processCLDRTimezonesArray", function () {
		const oTimezones = new Timezones();
		oTimezones.aSupportedTimezones = "~aSupportedTimezones";
		const oTimezonesMock = sinon.mock(oTimezones);
		oTimezonesMock.expects("updateCLDRVersion").withExactArgs("~sCLDRVersion");
		oTimezonesMock.expects("updateArray").withExactArgs("aCLDRTimezoneIDs", "~aSupportedTimezones");
		sinon.mock(console).expects("log")
			.withExactArgs("DONE, the aCLDRTimezoneIDs in the _timezones.js file has been updated");

		// code under test
		oTimezones.processCLDRTimezonesArray("~sCLDRVersion");
	});

	//*********************************************************************************************
	it("updateCLDRVersion", function () {
		const oTimezones = new Timezones();
		oTimezones.sFileContent = "CLDR 43.0.0 time zone keys as described by the CLDR BCP47 package";

		// code under test
		oTimezones.updateCLDRVersion("~sCLDRVersion");

		assert.strictEqual(oTimezones.sFileContent,
			"CLDR ~sCLDRVersion time zone keys as described by the CLDR BCP47 package");
	});
});
