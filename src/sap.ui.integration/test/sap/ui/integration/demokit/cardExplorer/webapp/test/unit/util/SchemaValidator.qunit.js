/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/demo/cardExplorer/util/SchemaValidator"
], function(SchemaValidator) {
	"use strict";

	function fnValidateSuccess() {
		return {
			valid: true
		};
	}

	function fnValidateError() {
		return {
			valid: false,
			errors: ["error"]
		};
	}

	QUnit.module("SchemaValidator", {
		beforeEach: function () {
			this.fakeJSVClass = function () { };
			this.fakeJSVClass.prototype.addSchema = function () { };

			this._requireJSVStub = sinon.stub(SchemaValidator, "_requireJsonSchemaValidator").returns(this.fakeJSVClass);
			this._loadSchema = sinon.stub(SchemaValidator, "_loadSchema").returns({});
		},
		afterEach: function () {
			this._requireJSVStub.restore();
			this._loadSchema.restore();
			SchemaValidator._fnValidate = null; // reset cached validate function if such
		}
	});

	QUnit.test("Initialize only once", function (assert) {
		var done = assert.async();

		this.fakeJSVClass.prototype.validate = fnValidateSuccess;

		assert.notOk(SchemaValidator._fnValidate, "Should not initialize if never required");

		SchemaValidator.validate({})
			.then(function () {
				assert.ok(this._requireJSVStub.calledOnce, "Should call _requireJsonSchemaValidator once");
			}.bind(this))
			.then(function () {
				return SchemaValidator.validate({});
			})
			.then(function () {
				assert.strictEqual(this._requireJSVStub.callCount, 1, "Should NOT call _requireJsonSchemaValidator second time");
				done();
			}.bind(this));
	});

	QUnit.test("Initialization fail", function (assert) {
		var done = assert.async();

		this.fakeJSVClass.prototype.addSchema = function () {
			throw "some initialization error";
		};

		SchemaValidator.validate({})
			.catch(function (sMessage) {
				assert.strictEqual(sMessage, "Could not initialize Validator. Schema validation skipped!", "Initialization error should be thrown");
				done();
			});
	});

	QUnit.test("Manifest validation success", function (assert) {
		var done = assert.async();

		this.fakeJSVClass.prototype.validate = fnValidateSuccess;

		SchemaValidator.validate({})
			.then(function () {
				assert.ok(true, "When 'validate' returns no errors, should resolve promise");
				done();
			});
	});

	QUnit.test("Manifest validation error", function (assert) {
		var done = assert.async();

		this.fakeJSVClass.prototype.validate = fnValidateError;

		SchemaValidator.validate({})
			.catch(function () {
				assert.ok(true, "When 'validate' returns errors, should reject promise");
				done();
			});
	});
});