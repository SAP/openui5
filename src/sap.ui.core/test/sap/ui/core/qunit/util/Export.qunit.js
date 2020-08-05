/* global sinon QUnit */

sap.ui.define([
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/util/File",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function (Export, ExportTypeCSV, File, Sorter, Filter, JSONModel) {
	"use strict";

	var getJSONModelData = function() {
		return [
			{ lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-01" },
			{ lastName: "Friese", name: "Andy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01" },
			{ lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "images/Person.png", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-01" },
			{ lastName: "Schutt", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 4, money: 1.1, birthday: "2001-01-01" },
			{ lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-01" },
			{ lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01" },
			{ lastName: "Zara", name: "Lou", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 1, money: 123, birthday: "1965-01-01" },
			{ lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 678.45, birthday: "1978-01-01" },
			{ lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 123.45, birthday: "1968-01-01" },
			{ lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 678.90, birthday: "1968-01-01" },
			{ lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-01" },
			{ lastName: "Time", name: "Justin", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 4, money: 836.4, birthday: "1968-01-01" },
			{ lastName: "Barr", name: "Sandy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 9.3, birthday: "1968-01-01" },
			{ lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 1, money: 6344.21, birthday: "1968-01-01" },
			{ lastName: "Ander", name: "Corey", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 563.2, birthday: "1968-01-01" },
			{ lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-01" },
			{ lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "female", rating: 4, money: 3563, birthday: "1968-01-01" },
			{ lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 5.67, birthday: "1968-01-01" },
			{ lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-01" },
			{ lastName: "Mul\r\nti\r\nLi\r\nne", name: "Peter", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01" },
			{ lastName: "Double \" Quote", name: "\"", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01" },
			{ lastName: "Formula", name: "=FOO()", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01" }
		];
	};

	var createJSONModel = function() {
		return new JSONModel(getJSONModelData());
	};

	var createColumns = function() {
		return [
			{
				name: "First; name",
				template: {
					content: "{name}"
				}
			},
			{
				name: "Last name",
				template: {
					content: {
						path: "lastName"
					}
				}
			},
			{
				name: "Foo bar",
				template: {
					content: {
						path: "checked",
						formatter: function(checked) {
							return (checked) ? "Yes" : "No";
						}
					}
				}
			}
		];
	};

	QUnit.module("generate");

	QUnit.test("Default", function(assert) {
		var done = assert.async();

		new Export({
			exportType: new ExportTypeCSV({
				separatorChar: ";"
			}),
			models: createJSONModel(),
			rows: "{/}",
			columns: createColumns()
		})
		.generate()
		.done(function(sContent) {
			var sExpected =
			"\"First; name\";Last name;Foo bar\r\n" +
			"Al;Dente;Yes\r\n" +
			"Andy;Friese;Yes\r\n" +
			"Anita;Mann;No\r\n" +
			"Doris;Schutt;Yes\r\n" +
			"Doris;Open;Yes\r\n" +
			"Kenya;Dewit;No\r\n" +
			"Lou;Zara;Yes\r\n" +
			"Tim;Burr;Yes\r\n" +
			"Tish;Hughes;Yes\r\n" +
			"Mo;Town;Yes\r\n" +
			"Justin;Case;No\r\n" +
			"Justin;Time;Yes\r\n" +
			"Sandy;Barr;Yes\r\n" +
			"Gene;Poole;Yes\r\n" +
			"Corey;Ander;No\r\n" +
			"Brighton;Early;Yes\r\n" +
			"Constance;Noring;Yes\r\n" +
			"Jack;O'Lantern;Yes\r\n" +
			"Matt;Tress;Yes\r\n" +
			"Peter;\"Mul\r\nti\r\nLi\r\nne\";Yes\r\n" +
			"\"\"\"\";\"Double \"\" Quote\";Yes\r\n" +
			"'=FOO();Formula;Yes";
			assert.equal(sContent, sExpected, "Generated file content should be correct.");
		})
		// ES6 Promise functions should also work
		.then(function() {
			assert.ok(true, 'Generate should call success function.');
		}, function() {
			assert.ok(false, 'Generate should call error function.');
		})
		["catch"](function() {
			assert.ok(false, 'Generate should call catch function.');
		})
		.fail(function() {
			assert.ok(false, 'Generate should not fail.');
		})
		.always(function() {
			this.destroy();
			done();
		});

	});

	QUnit.test("With sorted rows", function(assert) {
		var done = assert.async();

		new Export({
			exportType: new ExportTypeCSV({
				separatorChar: ";"
			}),
			models: createJSONModel(),
			rows: {
				path: '/',
				sorter: new Sorter("lastName", false)
			},
			columns: createColumns()
		})
		.generate()
		.done(function(sContent) {
			var sExpected =
			"\"First; name\";Last name;Foo bar\r\n" +
			"Corey;Ander;No\r\n" +
			"Sandy;Barr;Yes\r\n" +
			"Tim;Burr;Yes\r\n" +
			"Justin;Case;No\r\n" +
			"Al;Dente;Yes\r\n" +
			"Kenya;Dewit;No\r\n" +
			"\"\"\"\";\"Double \"\" Quote\";Yes\r\n" +
			"Brighton;Early;Yes\r\n" +
			"'=FOO();Formula;Yes\r\n" +
			"Andy;Friese;Yes\r\n" +
			"Tish;Hughes;Yes\r\n" +
			"Anita;Mann;No\r\n" +
			"Peter;\"Mul\r\n" +
			"ti\r\n" +
			"Li\r\n" +
			"ne\";Yes\r\n" +
			"Constance;Noring;Yes\r\n" +
			"Jack;O'Lantern;Yes\r\n" +
			"Doris;Open;Yes\r\n" +
			"Gene;Poole;Yes\r\n" +
			"Doris;Schutt;Yes\r\n" +
			"Justin;Time;Yes\r\n" +
			"Mo;Town;Yes\r\n" +
			"Matt;Tress;Yes\r\n" +
			"Lou;Zara;Yes";
			assert.equal(sContent, sExpected, "Generated file content should be correct.");
		})
		.fail(function() {
			assert.ok(false, 'Generate should not fail.');
		})
		.always(function() {
			this.destroy();
			done();
		});

	});

	QUnit.test("With old binding syntax", function(assert) {
		var done = assert.async();

		var oExport = new Export({
			exportType: new ExportTypeCSV({
				separatorChar: ";"
			}),
			models: createJSONModel(),
			columns: createColumns()
		});

		// old binding syntax should also work
		oExport.bindRows('/', null, new Sorter("lastName", false), [ new Filter({ path: "checked", operator: "EQ", value1: true }) ]);

		oExport
		.generate()
		.done(function(sContent) {
			var sExpected =
			"\"First; name\";Last name;Foo bar\r\n" +
			"Sandy;Barr;Yes\r\n" +
			"Tim;Burr;Yes\r\n" +
			"Al;Dente;Yes\r\n" +
			"\"\"\"\";\"Double \"\" Quote\";Yes\r\n" +
			"Brighton;Early;Yes\r\n" +
			"'=FOO();Formula;Yes\r\n" +
			"Andy;Friese;Yes\r\n" +
			"Tish;Hughes;Yes\r\n" +
			"Peter;\"Mul\r\n" +
			"ti\r\n" +
			"Li\r\n" +
			"ne\";Yes\r\n" +
			"Constance;Noring;Yes\r\n" +
			"Jack;O'Lantern;Yes\r\n" +
			"Doris;Open;Yes\r\n" +
			"Gene;Poole;Yes\r\n" +
			"Doris;Schutt;Yes\r\n" +
			"Justin;Time;Yes\r\n" +
			"Mo;Town;Yes\r\n" +
			"Matt;Tress;Yes\r\n" +
			"Lou;Zara;Yes";
			assert.equal(sContent, sExpected, "Generated file content should be correct.");
		})
		.fail(function() {
			assert.ok(false, 'Generate should not fail.');
		})
		.always(function() {
			this.destroy();
			done();
		});

	});

	QUnit.test("Without model", function(assert) {
		var done = assert.async();

		new Export({
			exportType: new ExportTypeCSV({
				separatorChar: ";"
			}),
			rows: "{/}",
			columns: createColumns()
		})
		.generate()
		.done(function(sContent) {
			assert.ok(false, 'Generate should not be successful. Content: ' + sContent);
		})
		.fail(function(sError) {
			assert.equal(sError, "Generate is not possible beause no model was set.", 'Generate should fail with correct message.');
		})
		.always(function() {
			this.destroy();
			done();
		});

	});

	QUnit.test("Without columns", function(assert) {
		var done = assert.async();

		new Export({
			exportType: new ExportTypeCSV({
				separatorChar: ";"
			}),
			rows: "{/}",
			models: createJSONModel()
		})
		.generate()
		.done(function(sContent) {
			var sExpected = "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n";
			assert.equal(sContent, sExpected, 'Generated file content should be correct.');
		})
		.fail(function() {
			assert.ok(false, 'Generate should not fail.');
		})
		.always(function() {
			this.destroy();
			done();
		});

	});

	QUnit.module("saveFile", {
		beforeEach: function() {
			this.oFileMock = sinon.mock(File);

			this.oExport = new Export({
				exportType: new ExportTypeCSV(),
				rows: "{/}",
				columns: createColumns(),
				models: createJSONModel()
			});

		},
		afterEach: function() {
			this.oFileMock.restore();
		}
	});

	QUnit.test("csv, utf-8", function(assert) {

		var oExpectFileSave = this.oFileMock.expects("save");
		var oExport = this.oExport;

		return oExport.generate().then(function(sContent) {

			// Set expected arguments (use content from previous generate() result)
			oExpectFileSave.once().withExactArgs(sContent, "my-file-name", "csv", "text/csv", "utf-8", undefined);

			return oExport.saveFile("my-file-name").then(function() {
				oExpectFileSave.verify();
			});

		});

	});

	QUnit.test("csv, utf-8, byteOrderMark=true", function(assert) {

		var oExpectFileSave = this.oFileMock.expects("save");
		var oExport = this.oExport;
		oExport.getExportType().setByteOrderMark(true);

		return oExport.generate().then(function(sContent) {

			// Set expected arguments (use content from previous generate() result)
			oExpectFileSave.once().withExactArgs(sContent, "my-file-name", "csv", "text/csv", "utf-8", true);

			return oExport.saveFile("my-file-name").then(function() {
				oExpectFileSave.verify();
			});

		});

	});

	QUnit.test("csv, utf-8, byteOrderMark=false", function(assert) {

		var oExpectFileSave = this.oFileMock.expects("save");
		var oExport = this.oExport;
		oExport.getExportType().setByteOrderMark(false);

		return oExport.generate().then(function(sContent) {

			// Set expected arguments (use content from previous generate() result)
			oExpectFileSave.once().withExactArgs(sContent, "my-file-name", "csv", "text/csv", "utf-8", false);

			return oExport.saveFile("my-file-name").then(function() {
				oExpectFileSave.verify();
			});

		});

	});

	QUnit.test("csv, iso-8859-1, byteOrderMark=true", function(assert) {

		var oExpectFileSave = this.oFileMock.expects("save");
		var oExport = this.oExport;

		// Although this does not make sense it should be possible to set the properties
		// but they should get ignored within the sap.ui.core.util.File.save method as
		// byte-order-mark only applies to unicode charsets
		oExport.getExportType().setCharset("iso-8859-1");
		oExport.getExportType().setByteOrderMark(true);

		return oExport.generate().then(function(sContent) {

			// Set expected arguments (use content from previous generate() result)
			oExpectFileSave.once().withExactArgs(sContent, "my-file-name", "csv", "text/csv", "iso-8859-1", true);

			return oExport.saveFile("my-file-name").then(function() {
				oExpectFileSave.verify();
			});

		});

	});

});