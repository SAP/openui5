sap.ui.require(["sap/ui/test/_ParameterValidator"], function (Validator) {
	QUnit.module("Validator - Single validation error", {
		beforeEach: function () {
			this._sErrorPrefix = "Parameter validator";
			this.oValidator = new Validator({
				errorPrefix: this._sErrorPrefix
			});
			this.mValidationInfo = {
				funcParam: "func",
				arrayParam: "array",
				anyParam: "any",
				numericParam: "numeric",
				stringParam: "string"
			}
		}
	});

	QUnit.test("Should not throw an exception if the func parameter is a function", function (assert) {
		this.oValidator.validate({
			validationInfo: this.mValidationInfo,
			inputToValidate: {
				funcParam: function () {}
			}
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should throw an exception if the func param is not a function", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					validationInfo: this.mValidationInfo,
					inputToValidate: {
						funcParam: {}
					}
				});
			}.bind(this),
			new Error("Parameter validator - the 'funcParam' parameter needs to be a function but '[object Object]' was passed",
				"The expected exception was thrown")
		);
	});

	QUnit.test("Should not throw an exception if the array parameter is an array", function (assert) {
		this.oValidator.validate({
			validationInfo: this.mValidationInfo,
			inputToValidate: {
				arrayParam: []
			}
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should throw an exception if the array param is not an array", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					validationInfo: this.mValidationInfo,
					inputToValidate: {
						arrayParam: {}
					}
				});
			}.bind(this),
			new Error("Parameter validator - the 'arrayParam' parameter needs to be an array but '[object Object]' was passed",
				"The expected exception was thrown")
		);
	});

	["foo", $.noop, undefined, null, true, /foo/, 1].forEach(function (vAnyParam) {
		QUnit.test("Should not throw an exception if the any parameter is " + vAnyParam, function (assert) {
			this.oValidator.validate({
				validationInfo: this.mValidationInfo,
				inputToValidate: {
					anyParam: []
				}
			});

			assert.ok(true, "no exception has been thrown");
		});
	});

	QUnit.test("Should not throw an exception if the numeric parameter is a number", function (assert) {
		this.oValidator.validate({
			validationInfo: this.mValidationInfo,
			inputToValidate: {
				numericParam: 13.37
			}
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should throw an exception if the numeric param is not a number", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					validationInfo: this.mValidationInfo,
					inputToValidate: {
						numericParam: NaN
					}
				});
			}.bind(this),
			new Error("Parameter validator - the 'numericParam' parameter needs to be numeric but 'NaN' was passed",
				"The expected exception was thrown")
		);
	});

	QUnit.test("Should not throw an exception if the string is a string", function (assert) {
		this.oValidator.validate({
			validationInfo: this.mValidationInfo,
			inputToValidate: {
				stringParam: "foo"
			}
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should throw an exception if the string param is not a number", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					validationInfo: this.mValidationInfo,
					inputToValidate: {
						stringParam: NaN
					}
				});
			}.bind(this),
			new Error("Parameter validator - the 'stringParam' parameter needs to be a string but 'NaN' was passed",
				"The expected exception was thrown")
		);
	});

	QUnit.test("Should not throw an exception if the valid parameter is not given and not mandatory", function (assert) {
		this.oValidator.validate({
			validationInfo: this.mValidationInfo,
			inputToValidate: {}
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should not throw an exception if all valid parameters are given", function (assert) {
		this.oValidator.validate({
			inputToValidate: {},
			validationInfo: this.mValidationInfo,
			allowUnknownProperties: true
		});

		assert.ok(true, "no exception has been thrown");
	});

	QUnit.test("Should throw an exception if no input is given", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					validationInfo: this.mValidationInfo
				});
			}.bind(this),
			new Error("Parameter validator - No 'inputToValidate' given but it is a mandatory parameter"),
			"The expected exception was thrown"
		);
	});

	QUnit.test("Should throw an exception if no validation info is given", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					inputToValidate: {}
				});
			}.bind(this),
			new Error("Parameter validator - No 'validationInfo' given but it is a mandatory parameter",
			"The expected exception was thrown")
		);
	});

	QUnit.test("Should throw an exception if allowUnknownProperties is not a boolean", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					inputToValidate: {},
					validationInfo: this.mValidationInfo,
					allowUnknownProperties: {}
				});
			}.bind(this),
			new Error("Parameter validator - the 'allowUnknownProperties' parameter" +
				" needs to be a boolean value but '[object Object]' was passed")
		);
	});

	QUnit.test("Should throw an exception if we have an unknown property", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					inputToValidate: {},
					validationInfo: this.mValidationInfo,
					allowUnknownProperties: true,
					foo: "bar"
				});
			}.bind(this),
			new Error("Parameter validator - The property 'foo' is not defined in the API")
		);
	});

	QUnit.module("Validator - Multiple errors", {
		beforeEach: function () {
			this._sErrorPrefix = "Parameter validator";
			this.oValidator = new Validator({
				errorPrefix: this._sErrorPrefix
			});
		}
	});

	QUnit.test("Should throw an exception if we have multiple unknown properties", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					inputToValidate: {},
					validationInfo: {},
					allowUnknownProperties: true,
					foo: "bar",
					biz: "baz"
				});
			}.bind(this),
			new Error("Multiple errors where thrown Parameter validator\n" +
				"The property 'foo' is not defined in the API\n" +
				"The property 'biz' is not defined in the API")
		);
	});

	QUnit.test("Should throw an exception if we have multiple missing properties", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
				});
			}.bind(this),
			new Error("Multiple errors where thrown Parameter validator\n" +
				"No 'validationInfo' given but it is a mandatory parameter\n" +
				"No 'inputToValidate' given but it is a mandatory parameter")
		);
	});

	QUnit.test("Should throw a mixture of missing/wrong and additional parameters", function (assert) {
		assert.throws(function () {
				this.oValidator.validate({
					inputToValidate: false,
					allowUnknownProperties: {},
					foo: "bar"
				});
			}.bind(this),
			new Error("Multiple errors where thrown Parameter validator\n" +
				"The property 'foo' is not defined in the API\n" +
				"No 'validationInfo' given but it is a mandatory parameter\n" +
				"the 'inputToValidate' parameter needs to be an object but 'false' was passed\n" +
				"the 'allowUnknownProperties' parameter needs to be a boolean value but '[object Object]' was passed")
		);
	});
});