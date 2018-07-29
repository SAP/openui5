/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/test/LibraryEnablementTest",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function (
	LibraryEnablementTest,
	Button,
	sinon
) {
	"use strict";

	QUnit.module("Given that a sap.m Library is tested", {
		beforeEach: function() {
			function fnCreate() {
				return new Button();
			}

			this.fnSpyCreate = sinon.spy(fnCreate);

			this.bCreateCalled = false;
			this.oLibraryEnablementTest = new LibraryEnablementTest({
				libraryName : "sap.m",
				testData : {
					"sap.m.Button" : {
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
			var fnDone = assert.async();

			this.oLibraryEnablementTest.run().then(function(oResult) {
				assert.ok(oResult, "A result is returned");
				assert.ok(oResult.children.length > 1, "Library Test was successfully performed");
				assert.ok(this.fnSpyCreate.callCount, 1, "and the create function was called once");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});