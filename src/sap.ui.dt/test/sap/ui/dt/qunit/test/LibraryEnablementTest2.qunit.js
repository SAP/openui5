/* global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/test/LibraryEnablementTest2"
],
function(
	LibraryEnablementTest2
) {
	"use strict";

	QUnit.module("Given that a sap.ui.layout Library is tested", {
		beforeEach : function(assert) {
			this.oLibraryEnablementTest2 = new LibraryEnablementTest2();
			this.aLibraries = ["sap.ui.layout"];
		},
		afterEach : function() {
			this.oLibraryEnablementTest2.destroy();
		}
	});

	QUnit.test("when the test is started", function(assert) {
		var done = assert.async();

		this.oLibraryEnablementTest2.run(this.aLibraries).then(function(oResult) {
			assert.ok(oResult, "A result is returned");
			assert.ok(oResult.results.length > 1, "Library Test was successfully performed");
			done();
		});
	});
	QUnit.start();
});
