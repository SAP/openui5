/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/demo/cardExplorer/util/SchemaValidator"
], function(SchemaValidator) {
	"use strict";

	QUnit.module("SchemaValidator", {
		beforeEach: function () {
			this.fakeAjvClass = function () { };

			this.fakeAjvClass.prototype.addMetaSchema = function () { };
			this._requireAjvStub = sinon.stub(SchemaValidator, "_requireAjv").returns(this.fakeAjvClass);
			this._loadSchema = sinon.stub(SchemaValidator, "_loadSchema").returns({});
		},
		afterEach: function () {
			this._requireAjvStub.restore();
			this._loadSchema.restore();
			SchemaValidator._fnValidate = null; // reset cached validate function if such
		}
	});

	QUnit.test("Initialize only once", function (assert) {
		var done = assert.async(),
			fnValidateSuccess = function () { return true; };

		this.fakeAjvClass.prototype.compileAsync = function () {
			return Promise.resolve(fnValidateSuccess);
		};

		assert.notOk(SchemaValidator._fnValidate, "Should not initialize if never required");

		SchemaValidator.validate({})
			.then(function () {
				assert.ok(this._requireAjvStub.calledOnce, "Should call requireAjv once");
			}.bind(this))
			.then(function () {
				return SchemaValidator.validate({});
			})
			.then(function () {
				assert.strictEqual(this._requireAjvStub.callCount, 1, "Should NOT call requireAjv second time");
				done();
			}.bind(this));
	});

	QUnit.test("Initialization fail", function (assert) {
		var done = assert.async();

		this.fakeAjvClass.prototype.compileAsync = function () {
			return Promise.reject();
		};

		SchemaValidator.validate({})
			.catch(function (sMessage) {
				assert.strictEqual(sMessage, "Could not initialize Validator. Schema validation skipped!!!", "Initialization error should be thrown");
				done();
			});
	});

	QUnit.test("Manifest validation success", function (assert) {
		var done = assert.async(),
			fnValidateSuccess = function () { return true; };

		this.fakeAjvClass.prototype.compileAsync = function () {
			return Promise.resolve(fnValidateSuccess);
		};

		SchemaValidator.validate({})
			.then(function () {
				assert.ok(true, "When 'validate' returns no errors, should resolve promise");
				done();
			});
	});

	QUnit.test("Manifest validation error", function (assert) {
		var done = assert.async(),
			fnValidateError = function () { return false; };

		this.fakeAjvClass.prototype.compileAsync = function () {
			return Promise.resolve(fnValidateError);
		};

		SchemaValidator.validate({})
			.catch(function () {
				assert.ok(true, "When 'validate' returns errors, should reject promise");
				done();
			});
	});
});