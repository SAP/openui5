/*eslint-env mocha */
var assert = require("assert");
var path = require("path");
var fileContent = require("../lib/fileContent.js");
var Generator = require("../lib/generate.js");
var sinon = require("sinon");

describe("generate.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
		sinon.restore();
	});

	//*********************************************************************************************
	it("getPropertyPathValue", function () {
		var oData = {
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
			},
			oDataCopy = JSON.parse(JSON.stringify(oData));

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
		var oGeneratorMock = sinon.mock(Generator),
			aFormerData = ["a", "bFormer", ["c", "cFormer"], ["dFormer0", "dFormer1"], ["eFormer0", "e"]],
			aCurrentData = ["a", "b", "c", "d", "e"];

		oGeneratorMock.expects("getPropertyPathValue")
			.withExactArgs("~oFormerData", "~aPropertyPathNames")
			.returns(aFormerData);
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
		var oGenerator = {_sOutputFolder: "~_sOutputFolder"};

		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(path.join("~_sOutputFolder/~sUI5Tag.json"))
			.throws(new Error());

		// code under test
		Generator.prototype.updateMonthAbbreviations.call(oGenerator, "~oResult", "~sUI5Tag");
	});

	//*********************************************************************************************
	it("updateMonthAbbreviations: with former CLDR data", function () {
		var oGenerator = {_sOutputFolder: "~_sOutputFolder"},
			oGeneratorMock = sinon.mock(Generator);

		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(path.join("~_sOutputFolder/~sUI5Tag.json"))
			.returns("~oFormerCLDRData");
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
