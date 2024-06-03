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
	it("constructor", function () {
		// code under test
		const oTimezones = new Timezones();

		assert.ok(oTimezones.pTimezonesReady instanceof Promise);
		assert.strictEqual(typeof oTimezones.fnResolveTimezonesReady, "function");
	});

	//*********************************************************************************************
	it("fetchData", async function () {
		const oTimezones = new Timezones();

		const oResponse = {"~type": function () {}};
		if (global.fetch) { // Avoid TypeError: Attempted to wrap undefined property fetch as function
			sinon.mock(global).expects("fetch").withExactArgs("~url").resolves(oResponse);
		}
		sinon.mock(oResponse).expects("~type").withExactArgs().resolves("~result");

		// code under test
		const vData = await oTimezones.fetchData("~url", "~type");

		assert.strictEqual(vData, "~result");
	});

	//*********************************************************************************************
	it("loadTimezonesFiles: success", async function () {
		const oTimezones = new Timezones();
		const oFsMock = sinon.mock(fs);
		oFsMock.expects("readFile").withExactArgs(sinon.match(/_timezones.js$/), "utf8").resolves("~content");
		oFsMock.expects("readFile").withExactArgs(sinon.match(/TimezoneUtils.js$/), "utf8")
			.resolves("~content1");

		// code under test
		await oTimezones.loadTimezonesFiles();

		assert.strictEqual(oTimezones.sFileContent, "~content");
		assert.strictEqual(oTimezones.sUtilsFileContent, "~content1");
	});

	//*********************************************************************************************
	it("loadTimezonesFiles: error", async function () {
		const oTimezones = new Timezones();

		const oError = new Error("~error");
		sinon.mock(fs).expects("readFile").withExactArgs(sinon.match(/_timezones.js$/), "utf8").rejects(oError);

		// code under test
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
	it("ready", async function () {
		const oTimezones = new Timezones();

		// code under test: promise not fulfilled
		assert.ok(oTimezones.ready() instanceof Promise);

		// resolve promise
		oTimezones.fnResolveTimezonesReady("~foo");

		// code under test: promise fulfilled
		assert.strictEqual(await oTimezones.ready(), undefined);
	});

	//*********************************************************************************************
	it("getTimezonesFromFile", function () {
		const oTimezones = new Timezones();
		let sRawText = "";
		const addLine = (sLine) => { sRawText += `${sLine}\n`; };

		addLine("foo bar"); // dummy text
		addLine("Zone Europe/Berlin foo"); // zone with space
		addLine("Zone	Europe/London	foo"); // zone with tab
		addLine("Zone	America/Argentina/Buenos_Aires	foo"); // zone with three-part-name
		addLine("Link foo/bar Europe/Paris baz"); // link with space
		addLine("Link	foo/bar	Europe/Madrid	baz"); // link with tab
		addLine("# Zone	NAME	FORMAT"); // comment
		addLine("# Link	TARGET	LINK-NAME"); // comment

		// code under test
		assert.deepEqual(
			oTimezones.getTimezonesFromFile(sRawText),
			["Europe/Berlin", "Europe/London", "America/Argentina/Buenos_Aires", "Europe/Paris", "Europe/Madrid"]);
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
			.withExactArgs("aABAPTimezoneIDs", oJSONContent.d.results.map((o) => o.value));
		sinon.mock(console).expects("log").withExactArgs("DONE, the aABAPTimezonesIDS have been updated");

		// code under test
		await oTimezones.processABAPTimezonesArray();
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
	it("processIanaTimezones", async function () {
		const oTimezones = new Timezones();
		const oMock = sinon.mock(oTimezones);

		oMock.expects("requestLatestIanaTimeZoneVersion").withExactArgs().resolves("~version");
		oMock.expects("requestIanaTimeZoneRawData").withExactArgs("~version").resolves(["~file0", "~file1"]);
		oMock.expects("getTimezonesFromFile").withExactArgs("~file0").returns(["tz0", "tz1"]);
		oMock.expects("getTimezonesFromFile").withExactArgs("~file1").returns(["tz2", "tz3"]);
		oMock.expects("updateArray").withExactArgs("aTzTimezoneIDs", ["tz0", "tz1", "tz2", "tz3"]);
		oMock.expects("updateIanaVersion").withExactArgs("~version");

		// code under test
		await oTimezones.processIanaTimezones();
	});

	//*********************************************************************************************
	it("requestIanaTimeZoneRawData", async function () {
		const oTimezones = new Timezones();
		const oMock = sinon.mock(oTimezones);

		const aFetchResult = [
			// allowed: file names with only lower-case characters
			{name: "america", "download_url": "url0"},
			{name: "europa", "download_url": "url1"},
			// not allowed: file name "backzone"
			{name: "backzone", "download_url": "url2"},
			// not allowed: strings containing not only lower-case characters
			{name: "Europe", "download_url": "url3"},
			{name: "europE", "download_url": "url4"},
			{name: "europe2", "download_url": "url5"},
			{name: "europe.c", "download_url": "url6"}
		];
		oMock.expects("fetchData")
			.withExactArgs("https://api.github.com/repos/eggert/tz/contents/?ref=~version", "json")
			.resolves(aFetchResult);
		oMock.expects("fetchData").withExactArgs("url0", "text").resolves("content0");
		oMock.expects("fetchData").withExactArgs("url1", "text").resolves("content1");

		// code under test
		assert.deepEqual(
			await oTimezones.requestIanaTimeZoneRawData("~version"),
			["content0", "content1"]);
	});

	//*********************************************************************************************
	it("requestLatestIanaTimeZoneVersion", async function () {
		const oTimezones = new Timezones();
		const oMock = sinon.mock(oTimezones);

		const aFetchResult = [{ref: "refs/tags/2020x"}, {ref: "refs/tags/2022c"}, {ref: "refs/tags/2022b"}];
		oMock.expects("fetchData")
			.withExactArgs("https://api.github.com/repos/eggert/tz/git/refs/tags", "json")
			.resolves(aFetchResult);

		// code under test
		assert.strictEqual(await oTimezones.requestLatestIanaTimeZoneVersion(), "2022c");
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
	it("updateIanaVersion", function () {
		const oTimezones = new Timezones();
		oTimezones.sFileContent = "foo Version: tz 1234xyz bar";

		// code under test
		oTimezones.updateIanaVersion("~version");

		assert.strictEqual(oTimezones.sFileContent, "foo Version: tz ~version bar");
	});

	//*********************************************************************************************
	it("updateTimezones", async function () {
		const oTimezones = new Timezones();
		const oMock = sinon.mock(oTimezones);

		oMock.expects("loadTimezonesFiles").withExactArgs().resolves();
		oMock.expects("processABAPTimezonesArray").withExactArgs().resolves();
		oMock.expects("processIanaTimezones").withExactArgs().resolves();
		oMock.expects("updateTimezonesMap").withExactArgs("~mCLDR2ABAPTimezones");
		oMock.expects("writeTimezonesFiles").withExactArgs().resolves();
		oMock.expects("fnResolveTimezonesReady").withExactArgs();

		// code under test
		await oTimezones.updateTimezones("~mCLDR2ABAPTimezones");
	});

	//*********************************************************************************************
	it("updateTimezonesMap", function () {
		const oTimezones = new Timezones();
		oTimezones.sUtilsFileContent = "foo\n"
			+ "\tTimezoneUtils.mCLDR2ABAPTimezones = {\n"
			+ "\t\t\"America/Buenos_Aires\": \"America/Argentina/Buenos_Aires\",\n"
			+ "\t\t\"America/Catamarca\": \"America/Argentina/Catamarca\"\n"
			+ "\t};\n"
			+ "bar";

		// code under test
		oTimezones.updateTimezonesMap({
			"America/Argentina/Buenos_Aires": "America/Buenos_Aires",
			"America/Argentina/Katamarka": "America/Catamarca", // test changed city name
			"America/Some_City_ABAP": "America/Some_City_CLDR" // test new entry
		});

		assert.strictEqual(oTimezones.sUtilsFileContent,
			"foo\n"
			+ "\tTimezoneUtils.mCLDR2ABAPTimezones = {\n"
			+ "\t\t\"America/Buenos_Aires\": \"America/Argentina/Buenos_Aires\",\n"
			+ "\t\t\"America/Catamarca\": \"America/Argentina/Katamarka\",\n"
			+ "\t\t\"America/Some_City_CLDR\": \"America/Some_City_ABAP\"\n"
			+ "\t};\n"
			+ "bar");
	});
});
