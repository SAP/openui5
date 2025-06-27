/* global  QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/link/Factory"
], function(
	Factory
) {
	"use strict";


	QUnit.module("Factory methods", {
		beforeEach: function() {
			this.sandbox = sinon.sandbox.create();
			this.mockUShellServices();
		},
		afterEach: function() {

			this.sandbox.restore();
		},
		mockUShellServices: function () {
			const oCrossAppNavigationStub = {
					id: "CrossApplicationNavigation"
				},
				oUrlParsingStub = {
					id: "UrlParsing"
				},
				oAppNavigationStub = {
					id: "Navigation"
				},
				oGetServiceStub = this.stub();

			oGetServiceStub.withArgs("CrossApplicationNavigation").resolves(oCrossAppNavigationStub);
			oGetServiceStub.withArgs("URLParsing").resolves(oUrlParsingStub);
			oGetServiceStub.withArgs("Navigation").resolves(oAppNavigationStub);

			this.oSAPUIRequireStub = this.stub(sap.ui, "require");
			this.oSAPUIRequireStub.withArgs("sap/ushell/Container").returns({
				getServiceAsync: oGetServiceStub
			});
		}
	});

	QUnit.test("getUShellContainer should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getUShellContainer();

		assert.notEqual(f, null, "getUShellContainer should return a value");
		assert.ok(true);

		done();
	});


	QUnit.test("getServiceAsync for CrossApplicationNavigation should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("CrossApplicationNavigation");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"CrossApplicationNavigation", "service should be CrossApplicationNavigation");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for URLParsing should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("URLParsing");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"UrlParsing", "service should be URLParsing");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for Navigation should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("Navigation");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"Navigation", "service should be Navigation");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for default should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync();

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService,null, "service should be null");
			assert.ok(true);

			done();
		});
	});
});
