/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/test/LibraryEnablementTest2"
],
function(
	LibraryEnablementTest2
) {
	"use strict";

	QUnit.module("Given that a sap.ui.testLibrary Library is tested", {
		beforeEach: function() {
			this.oLibraryEnablementTest2 = new LibraryEnablementTest2();
			this.aLibraries = ["sap.ui.testLibrary"];
		},
		afterEach: function() {
			this.oLibraryEnablementTest2.destroy();
		}
	}, function () {
		QUnit.test("when the test is started", function(assert) {
			var done = assert.async();

			this.oLibraryEnablementTest2.run(this.aLibraries).then(function(oResult) {
				assert.ok(oResult, "A result is returned");
				assert.ok(oResult.results.length > 0, "Library Test was successfully performed");
				done();
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
