/* global QUnit*/

sap.ui.define([
	"controlEnablementReport/LibraryScanner"
], function (
	LibraryScanner
) {
	"use strict";

	QUnit.module("Given that a sap.ui.testLibrary Library is tested", {
		beforeEach: function() {
			this.oLibraryScanner = new LibraryScanner();
			this.aLibraries = ["sap.ui.testLibrary"];
		},
		afterEach: function() {
			this.oLibraryScanner.destroy();
		}
	}, function () {
		QUnit.test("when the test is started", function(assert) {
			return this.oLibraryScanner.run(this.aLibraries).then(function (oResult) {
				assert.ok(oResult, "A result is returned");
				assert.ok(oResult.results.length > 0, "Library Test was successfully performed");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
