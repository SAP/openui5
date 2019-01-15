/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/test/LibraryEnablementTest",
	"dt/control/SimpleScrollControl",
	"sap/ui/thirdparty/sinon-4",
	// ensure the test library is loaded so it can be used in the library enablement test
	"sap/ui/testLibrary/library"
],
function (
	LibraryEnablementTest,
	SimpleScrollControl,
	sinon
) {
	"use strict";

	QUnit.module("Given that a sap.m Library is tested", {
		beforeEach: function() {
			function fnCreate() {
				return new SimpleScrollControl();
			}
			this.fnSpyCreate = sinon.spy(fnCreate);

			this.bCreateCalled = false;
			this.oLibraryEnablementTest = new LibraryEnablementTest({
				libraryName : "sap.ui.testLibrary",
				testData : {
					"dt.control.SimpleScrollControl" : {
						create : this.fnSpyCreate
					}
				}
			});
		},
		afterEach: function() {
			this.oLibraryEnablementTest.destroy();
		}
	}, function () {
		QUnit.test("when the test is started", function (assert) {
			return this.oLibraryEnablementTest.run()
			.then(function(oResult) {
				assert.ok(oResult, "A result is returned");
				assert.ok(oResult.children.length > 0, "Library Test was successfully performed");
				assert.ok(this.fnSpyCreate.callCount, 1, "and the create function was called once");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});