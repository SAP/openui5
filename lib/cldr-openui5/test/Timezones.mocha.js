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

	//*********************************************************************************************
	it("checkTimezonesConsistency: forward error of checkTimezoneNames", function () {
		const oTimezones = new Timezones();
		const oError = new Error("failed intentionally");
		sinon.mock(Timezones).expects("checkTimezoneNames")
			.withExactArgs("~sCLDRTag", "~oTimezoneNames")
			.throws(oError);

		assert.throws(() => {
			// code under test
			oTimezones.checkTimezonesConsistency("~sCLDRTag", "~oTimezoneNames");
		}, oError);
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: first run", function () {
		const oTimezones = new Timezones();
		sinon.mock(Timezones).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Timezones).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns("~aTimezoneIDs");

		// code under test
		oTimezones.checkTimezonesConsistency("~sCLDRTag", "~oTimezoneNames");

		assert.strictEqual(oTimezones._aLastTimezoneIDs, "~aTimezoneIDs");
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has same time zone IDs", function () {
		const oTimezones = new Timezones();
		oTimezones._aLastTimezoneIDs = ["~foo"];
		const aTimezoneIDs = ["~foo"];
		sinon.mock(Timezones).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Timezones).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		// code under test
		oTimezones.checkTimezonesConsistency("~sCLDRTag", "~oTimezoneNames");

		assert.strictEqual(oTimezones._aLastTimezoneIDs, aTimezoneIDs);
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has same amount but different time zone IDs", function () {
		const oTimezones = new Timezones();
		oTimezones._aLastTimezoneIDs = ["~b", "~c"];
		const aTimezoneIDs = ["~a", "~c"];
		sinon.mock(Timezones).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Timezones).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		assert.throws(() => {
			// code under test
			oTimezones.checkTimezonesConsistency("~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' has inconsistent time zone IDs; missing IDs: ~b; unexpected IDs: ~a"));
	});

	//*********************************************************************************************
	it("checkTimezonesConsistency: current locale has different time zone IDs", function () {
		const oTimezones = new Timezones();
		oTimezones._aLastTimezoneIDs = ["~b", "~c", "~d"];
		const aTimezoneIDs = ["~a", "~c", "~e"];
		sinon.mock(Timezones).expects("checkTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Timezones).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames").returns(aTimezoneIDs);

		assert.throws(() => {
			// code under test
			oTimezones.checkTimezonesConsistency("~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' has inconsistent time zone IDs; missing IDs: ~b,~d; unexpected IDs: ~a,~e"));
	});

	//*********************************************************************************************
	it("updateLocaleTimezones: remember complete time zone IDs", function () {
		const oTimezones = new Timezones();
		const oTimezoneMock = sinon.mock(oTimezones);
		const oResult = {
			timezoneNames: "~timezoneNames"
		};
		sinon.mock(Timezones).expects("getTimezoneIDs")
			.withExactArgs("~timezoneNames")
			.returns("~completeTimezoneNames");
		oTimezoneMock.expects("moveCLDRTranslationToABAPTimezoneID").withExactArgs("~timezoneNames");
		oTimezoneMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		sinon.mock(Timezones).expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		oTimezoneMock.expects("checkTimezonesConsistency").withExactArgs("~sCLDRTag", "~sortedTimezoneNames");

		// code under test
		oTimezones.updateLocaleTimezones("~sCLDRTag", oResult);

		assert.strictEqual(oTimezones._aCompleteCLDRTimezoneIDs, "~completeTimezoneNames");
		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("updateLocaleTimezones: generateTimeZoneNames", function () {
		const oTimezones = new Timezones();
		oTimezones._aCompleteCLDRTimezoneIDs = "~_aCompleteCLDRTimezoneIDs";
		const oTimezoneMock = sinon.mock(oTimezones);
		const oResult = {
			timezoneNames: "~timezoneNames"
		};
		oTimezoneMock.expects("generateTimeZoneNames").withExactArgs("~timezoneNames");
		oTimezoneMock.expects("moveCLDRTranslationToABAPTimezoneID").withExactArgs("~timezoneNames");
		oTimezoneMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		sinon.mock(Timezones).expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		oTimezoneMock.expects("checkTimezonesConsistency").withExactArgs("~sCLDRTag", "~sortedTimezoneNames");

		// code under test
		oTimezones.updateLocaleTimezones("~sCLDRTag", oResult);

		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("updateLocaleTimezones: fix appendItems for zh-Hans-* locales", function () {
		const oTimezone = new Timezones();
		oTimezone._aCompleteCLDRTimezoneIDs = "~_aCompleteCLDRTimezoneIDs";
		const oTimezoneMock = sinon.mock(oTimezone);
		const oResult = {
			"ca-gregorian": {
				dateTimeFormats: {
					appendItems: {Timezone: "~toBeReplaced"}
				}
			},
			timezoneNames: "~timezoneNames"
		};
		oTimezoneMock.expects("generateTimeZoneNames").withExactArgs("~timezoneNames");
		oTimezoneMock.expects("moveCLDRTranslationToABAPTimezoneID").withExactArgs("~timezoneNames");
		oTimezoneMock.expects("cleanupTimezoneNames").withExactArgs(sinon.match.same(oResult));
		sinon.mock(Timezones).expects("sort").withExactArgs("~timezoneNames").returns("~sortedTimezoneNames");
		oTimezoneMock.expects("checkTimezonesConsistency")
			.withExactArgs("zh-Hans-~foo", "~sortedTimezoneNames");

		// code under test
		oTimezone.updateLocaleTimezones("zh-Hans-~foo", oResult);

		assert.strictEqual(oResult["ca-gregorian"].dateTimeFormats.appendItems.Timezone, "{1} {0}");
		assert.strictEqual(oResult.timezoneNames, "~sortedTimezoneNames");
	});

	//*********************************************************************************************
	it("checkDuplicateTimezoneNames: all different", function () {
		sinon.mock(Timezones).expects("getAllChildValues").withExactArgs("~oTimezoneNames").returns(["~a", "~b"]);

		// code under test
		Timezones.checkDuplicateTimezoneNames("~sCLDRTag", "~oTimezoneNames");
	});

	//*********************************************************************************************
	it("checkDuplicateTimezoneNames: with duplicates", function () {
		sinon.mock(Timezones).expects("getAllChildValues").withExactArgs("~oTimezoneNames")
			.returns(["~a", "~b", "~c", "~b", "~a"]);

		assert.throws(() => {
			// code under test
			Timezones.checkDuplicateTimezoneNames("~sCLDRTag", "~oTimezoneNames");
		}, new Error("'~sCLDRTag' contains duplicate time zone names: ~b, ~a"));
	});

	//*********************************************************************************************
	it("checkTimezoneNames: forward error of checkDuplicateTimezoneNames", function () {
		const oError = new Error("failed intenionally");
		sinon.mock(Timezones).expects("checkDuplicateTimezoneNames")
			.withExactArgs("~sCLDRTag", "~oTimezoneNames")
			.throws(oError);

		assert.throws(() => {
			// code under test
			Timezones.checkTimezoneNames("~sCLDRTag", "~oTimezoneNames");
		}, oError);
	});

	//*********************************************************************************************
	it("checkTimezoneNames", function () {
		sinon.mock(Timezones).expects("checkDuplicateTimezoneNames").withExactArgs("~sCLDRTag", "~oTimezoneNames");
		sinon.mock(Timezones).expects("getTimezoneIDs").withExactArgs("~oTimezoneNames")
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
		Timezones.checkTimezoneNames("~sCLDRTag", "~oTimezoneNames");
	});

	//*********************************************************************************************
	it("cleanupTimezoneNames", function () {
		const oTimezone = new Timezones();
		const oTerritories = {
			"002": "~002",
			"019": "~019",
			"142": "~142",
			"150": "~150",
			AQ: "~AQ",
			AR: "~AR",
			AU: "~AU"
		};
		const oResult = {
			territories: oTerritories,
			timezoneNames: {
				Africa: {},
				America: {
					Argentina: {}
				},
				Antarctica: {},
				Asia: {},
				Australia: {},
				Etc: {
					Universal: "~Universal",
					UTC: {
						"long": {standard: "~UTClong"},
						"short": {standard: "~UTCshort"}
					}
				},
				Europe: {},
				Pacific: {}
			}
		};
		const oExpectedTimezoneNamesForDelete = JSON.parse(JSON.stringify(oResult.timezoneNames));
		oExpectedTimezoneNamesForDelete.Etc =  {Universal: "~UTClong", UTC: "~UTCshort"};
		sinon.mock(oTimezone).expects("deleteUnsupportedTimezoneNames")
			.withExactArgs(oExpectedTimezoneNamesForDelete);

		// code under test
		oTimezone.cleanupTimezoneNames(oResult);

		assert.deepEqual(oResult, {
			territories: oTerritories,
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
	it("generateTimeZoneNames", function () {
		const oTimezone = new Timezones();
		const oTimezoneNames = {
			"America": {
				"Adak": "Adak2",
				"Argentina": {
					"Buenos_Aires": "Buenos Aires"
				},
				"North_Dakota": {
					"Beulah": "Beulah, North Dakota"
				}
			},
			"Europe": {
				"Dublin": {
					"long": {standard: "Dublin Standard Time"}
				}
			}
		};
		oTimezone._aCompleteCLDRTimezoneIDs = ["Africa/Addis_Ababa", "Africa/Algiers",
			"America/Argentina/Buenos_Aires1", "Europe/Amsterdam", "America/North_Dakota/Beulah", "Europe/Dublin"];
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
				"Amsterdam": "Amsterdam",
				"Dublin": "Dublin"
			}
		};

		// code under test
		oTimezone.generateTimeZoneNames(oTimezoneNames);

		assert.deepEqual(oTimezoneNames, oResult);
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
		const oTimezoneMock = sinon.mock(Timezones);
		oTimezoneMock.expects("getAllChildValues").withExactArgs(sinon.match.same(oNode)).callThrough();
		oTimezoneMock.expects("getAllChildValues")
			.withExactArgs(sinon.match.same(oNode["~b"]))
			.returns(["~X", "~Y"]);
		oTimezoneMock.expects("getAllChildValues")
			.withExactArgs(sinon.match.same(oNode["~d"]))
			.returns(["~Z"]);

		// code under test
		assert.deepEqual(Timezones.getAllChildValues(oNode), ["~A", "~X", "~Y", "~C", "~Z"]);
	});

	//*********************************************************************************************
	it("getTimezoneIDs: without prefix", function () {
		const oTimezoneNames = {
			"~a": "~A",
			"~b": {/*...*/},
			"~c": "~C",
			"_parent": "~parent"
		};
		const oTimezoneMock = sinon.mock(Timezones);
		oTimezoneMock.expects("getTimezoneIDs").withExactArgs(sinon.match.same(oTimezoneNames)).callThrough();
		oTimezoneMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames["~b"]), "~b/")
			.returns(["~b/~x", "~b/~y"]);

		// code under test
		assert.deepEqual(Timezones.getTimezoneIDs(oTimezoneNames), ["~a", "~b/~x", "~b/~y", "~c"]);
	});

	//*********************************************************************************************
	it("getTimezoneIDs: with prefix", function () {
		const oTimezoneNames = {
			"~a": "~A",
			"~b": {/*...*/},
			"~c": "~C",
			"_parent": "~parent"
		};
		const oTimezoneMock = sinon.mock(Timezones);
		oTimezoneMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames), "~prefix/")
			.callThrough();
		oTimezoneMock.expects("getTimezoneIDs")
			.withExactArgs(sinon.match.same(oTimezoneNames["~b"]), "~prefix/~b/")
			.returns(["~prefix/~b/~x", "~prefix/~b/~y"]);

		// code under test
		assert.deepEqual(Timezones.getTimezoneIDs(oTimezoneNames, "~prefix/"),
			["~prefix/~a", "~prefix/~b/~x", "~prefix/~b/~y", "~prefix/~c"]);
	});

	//*********************************************************************************************
	it("moveCLDRTranslationToABAPTimezoneID", function () {
		const oTimezone = new Timezones();
		const oTimezoneNames = {
			Africa: {Asmera: "~Asmera"},
			America: {
				Argentina: {},
				"Buenos_Aires": "~Buenos_Aires",
				Catamarca: "~Catamarca"
			},
			Asia: "AsianTimezoneNames",
			Pacific: {
				Enderbury: "~Enderbury",
				Kanton: "~Kanton"
			}
		};

		sinon.mock(oTimezone)
			.expects("getCLDR2ABAPTimezoneMapping")
			.withExactArgs()
			.returns({
				"Africa/Asmera": "Africa/Asmara",
				"America/Buenos_Aires": "America/Argentina/Buenos_Aires",
				"America/Catamarca": "America/Argentina/Catamarca",
				"Pacific/Enderbury": "Pacific/Kanton"
			});

		// code under test
		oTimezone.moveCLDRTranslationToABAPTimezoneID(oTimezoneNames);

		assert.deepEqual(oTimezoneNames, {
			Africa: {Asmara: "~Asmera"},
			America: {
				Argentina: {
					"Buenos_Aires": "~Buenos_Aires",
					Catamarca: "~Catamarca"
				}
			},
			Asia: "AsianTimezoneNames",
			Pacific: {"Kanton": "~Kanton"}
		});
	});

	//*********************************************************************************************
	it("sort", function () {
		const oObject = {"~b": {/*...*/}, "~d": {/*...*/}, "~a": "~A", "~c": null};
		const oTimezoneMock = sinon.mock(Timezones);
		oTimezoneMock.expects("sort").withExactArgs(sinon.match.same(oObject)).callThrough();
		oTimezoneMock.expects("sort").withExactArgs(sinon.match.same(oObject["~b"])).returns("~b_Sorted");
		oTimezoneMock.expects("sort").withExactArgs(sinon.match.same(oObject["~d"])).returns("~d_Sorted");

		// code under test
		const oResult = Timezones.sort(oObject);

		assert.deepEqual(oResult, {"~a": "~A", "~b": "~b_Sorted", "~c": null, "~d": "~d_Sorted"});
		assert.deepEqual(Object.keys(oResult), ["~a", "~b", "~c", "~d"]);
	});
});
