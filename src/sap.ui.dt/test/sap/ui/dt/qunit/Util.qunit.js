/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/Util",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Util,
	ManagedObject,
	jQuery,
	sinon
) {
	'use strict';
	var sandbox = sinon.sandbox.create();

	QUnit.module('wrapError()', function () {
		QUnit.test("string as parameter", function (assert) {
			var sError = "I am an error as string";
			assert.strictEqual(Util.wrapError(sError).message, sError, "error as string is correctly wrapped");
		});
		QUnit.test("Error object as parameter", function (assert) {
			var oError = new Error("I am an error inside an object");
			assert.strictEqual(Util.wrapError(oError), oError, "same error object is returned");
		});
		QUnit.test("any object as parameter", function (assert) {
			var oError = Util.wrapError({});
			assert.ok(oError instanceof Error, "error object returned");
			assert.strictEqual(oError.message, '', "message is empty");
		});
		QUnit.test("no parameter is specified", function (assert) {
			var oError = Util.wrapError();
			assert.ok(oError instanceof Error, "error object returned");
			assert.strictEqual(oError.message, '', "message is empty");
		});
		QUnit.test("null as parameter", function (assert) {
			var oError = Util.wrapError(null);
			assert.ok(oError instanceof Error, "error object returned");
			assert.strictEqual(oError.message, '', "message is empty");
		});
	});

	QUnit.module('isForeignError()', function () {
		QUnit.test("foreign error as parameter", function (assert) {
			var oError = new Error("This error happened somewhere else");
			assert.equal(Util.isForeignError(oError), true, "error from somewhere else is recognized as foreign");
		});
		QUnit.test("foreign error as parameter", function (assert) {
			var oError = new Error("This error happened in DT");
			oError.name = "sap.ui.dt.FileName#MethodName";
			assert.equal(Util.isForeignError(oError), false, "error from sap.ui.dt is recognized as not foreign");
		});
		QUnit.test("wrong parameter specified", function (assert) {
			assert.throws(
				function () {
					Util.isForeignError();
				},
				"error throws if no parameter is specified"
			);
			assert.throws(
				function () {
					Util.isForeignError('error');
				},
				"error throws if a string specified"
			);
			assert.throws(
				function () {
					Util.isForeignError({
						name: ''
					});
				},
				"error throws if a plain object specified"
			);
			assert.throws(
				function () {
					Util.isForeignError(function () {});
				},
				"error throws if a function object specified"
			);
			assert.throws(
				function () {
					Util.isForeignError(null);
				},
				"error throws if a null object specified"
			);
		});
	});

	QUnit.module('createError()', function () {
		QUnit.test("both parameters are specified", function (assert) {
			var oError = Util.createError("FileName#MethodName", "custom text message");
			assert.ok(oError instanceof Error, "Error instance returned from the factory");
			assert.ok(oError.name.indexOf('sap.ui.dt') !== -1, "Name of the error contains library information");
			assert.ok(oError.name.indexOf('FileName#MethodName') !== -1, "Name of the error contains location information");
			assert.equal(oError.message, "custom text message", "message of the error equals to specified message");
		});
		QUnit.test("message is omitted", function (assert) {
			var oError = Util.createError("FileName#MethodName");
			assert.ok(oError instanceof Error, "Error instance returned from the factory");
			assert.ok(oError.name.indexOf('sap.ui.dt') !== -1, "Name of the error contains library information");
			assert.ok(oError.name.indexOf('FileName#MethodName') !== -1, "Name of the error contains location information");
			assert.equal(oError.message, undefined, "message is empty");
		});
		QUnit.test("location is omitted", function (assert) {
			var oError = Util.createError(null, "custom text message");
			assert.ok(oError instanceof Error, "Error instance returned from the factory");
			assert.ok(oError.name.indexOf('sap.ui.dt') !== -1, "Name of the error contains library information");
			assert.ok(oError.name.indexOf('FileName#MethodName') === -1, "Name of the error doesn't contain location information");
			assert.equal(oError.message, "custom text message", "message of the error equals to specified message");
		});
		QUnit.test("called without parameters", function (assert) {
			var oError = Util.createError();
			assert.ok(oError instanceof Error, "Error instance returned from the factory");
			assert.ok(oError.name.indexOf('sap.ui.dt') !== -1, "Name of the error contains library information");
			assert.equal(oError.message, undefined, "message is empty");
		});
	});

	QUnit.module('errorToString()', function () {
		QUnit.test("string as parameter", function (assert) {
			var sError = Util.errorToString('error message');
			assert.strictEqual(sError, 'error message', "message is correct");
		});
		QUnit.test("Error object as parameter", function (assert) {
			var sError = Util.errorToString(new Error('error message'));
			assert.ok(sError.indexOf('error message') !== -1, "error message is in output");
		});
		QUnit.test("Error object as parameter", function (assert) {
			var oError = new Error('error message');
			var sStack = oError.stack;
			oError.stack = oError.toString() + "\t\n \t\n" + oError.stack + '  \n';
			assert.ok(oError.toString() + sStack, "duplicate text and whitespaces are trimmed");
		});
		QUnit.test("called with wrong parameter", function (assert) {
			assert.throws(
				function () {
					Util.errorToString();
				},
				"throws when no parameter is specified"
			);
			assert.throws(
				function () {
					Util.errorToString(null);
				},
				"throws when null is specified as parameter"
			);
			assert.throws(
				function () {
					Util.errorToString({});
				},
				"throws when plain object is specified as parameter"
			);
		});
	});

	QUnit.module('propagateError()', function () {
		QUnit.test("when Error is foreign", function (assert) {
			var oError = new Error('original error message');
			var oErrorPropagated = Util.propagateError(oError, 'FileName#MethodName', 'custom error message');

			assert.ok(oErrorPropagated instanceof Error, "Error object is returned");
			assert.strictEqual(oErrorPropagated, oError, "same Error object is returned");
			assert.ok(oErrorPropagated.message.indexOf('original error message') !== -1, "message contains original message");
			assert.ok(oErrorPropagated.message.indexOf('custom error message') !== -1, "message contains custom message");
		});
		QUnit.test("when Error is not foreign", function (assert) {
			var oError = Util.createError('FileName#MethodName', 'original error message');
			var oErrorPropagated = Util.propagateError(oError, 'FileName#MethodName2', 'custom error message');

			assert.ok(oErrorPropagated instanceof Error, "Error object is returned");
			assert.strictEqual(oErrorPropagated, oError, "same Error object is returned");
			assert.ok(oErrorPropagated.message.indexOf('original error message') !== -1, "message contains original message");
			assert.ok(oErrorPropagated.message.indexOf('custom error message') === -1, "message contains custom message");
		});
	});

	QUnit.module('getObjectType()', function () {
		QUnit.test("when called with a ManagedObject object", function (assert) {
			var oObject = new ManagedObject();
			var sType = Util.getObjectType(oObject);
			assert.ok(sType.includes(oObject.getMetadata().getName()));
			assert.ok(sType.includes(oObject.getId()));
			oObject.destroy();
		});

		QUnit.test("when called with a string", function (assert) {
			assert.strictEqual(Util.getObjectType("foo"), "string");
		});
	});

	QUnit.module('printf()', function () {
		QUnit.test("basic functionality", function(assert) {
			assert.equal(
				Util.printf("Arg1: {0}, Arg2: {1}", "Val1", "Val2"),
				"Arg1: Val1, Arg2: Val2",
				"The string has been correctly assembled"
			);
		});
	});

	QUnit.module('objectValues()', function () {
		QUnit.test("objectValues()", function(assert) {
			var sValue1 = "test1";
			var sValue2 = "test2";
			var mObject = {
				value1: sValue1,
				value2: sValue2
			};

			assert.deepEqual(Util.objectValues(mObject), [sValue1, sValue2], "the correct object values were returned");
		});
	});

	QUnit.module('isInteger()', function () {
		QUnit.test("basic functionality", function(assert) {
			assert.ok(Util.isInteger(0), "zero is an integer");
			assert.ok(Util.isInteger(1.0), "real number pretended as integer is an integer");
			assert.notOk(Util.isInteger("0"), "string of zero is not an integer");
			assert.notOk(Util.isInteger(0.1), "real number is not an integer");
			assert.notOk(Util.isInteger(true), "boolean is not an integer");
			assert.notOk(Util.isInteger(), "undefined is not an integer");
			assert.notOk(Util.isInteger(null), "null is not an integer");
			assert.notOk(Util.isInteger({}), "object is not an integer");
		});
	});

	QUnit.module('castArray()', function () {
		QUnit.test("castArray()", function(assert) {
			var sValue = "test1";
			var nValue = 7;
			var aValue = ["xyz", 1, {text: "test"}];
			var mObject = {
				value1: sValue,
				value2: nValue
			};

			assert.deepEqual(Util.castArray(sValue), [sValue], "the correct string in an array is returned");
			assert.deepEqual(Util.castArray(aValue), ["xyz", 1, {text: "test"}], "the correct array is returned");
			assert.deepEqual(Util.castArray(mObject), [mObject], "the correct object in an array is returned");
			assert.deepEqual(Util.castArray(), [], "the correct empty array is returned");
		});
	});

	QUnit.module('wrapIntoPromise()', function () {
		QUnit.test("basic functionality", function (assert) {
			assert.ok(jQuery.isFunction(Util.wrapIntoPromise(function () {})));
			assert.ok(Util.wrapIntoPromise(function () {})() instanceof Promise);
			assert.ok(Util.wrapIntoPromise(function () {})() instanceof Promise);
		});
		QUnit.test("promise resolve with certain value", function (assert) {
			return Util.wrapIntoPromise(function () {
				return 'value';
			})().then(function (vValue) {
				assert.strictEqual(vValue, 'value');
			});
		});
		QUnit.test("nested promises resolve with certain value", function (assert) {
			return Util.wrapIntoPromise(function () {
				return Promise.resolve('value');
			})().then(function (vValue) {
				assert.strictEqual(vValue, 'value');
			});
		});
		QUnit.test("non-function is passed", function (assert) {
			assert.throws(function () {
				Util.wrapIntoPromise({});
			});
		});
	});

	QUnit.module('waitForSynced()', {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when waitForSynced is called with the DT in 'syncing' status which later turns to 'synced'", function(assert) {
			assert.expect(7);
			var fnToBeResolved = sandbox.stub();
			var oDesignTime = {
				getStatus: sandbox.stub().returns("syncing"),
				attachEventOnce: function(sEventName, fnHandler) {
					if (sEventName === "synced") {
						assert.ok(true, "then the handler was attached to the synced event");
						fnToBeResolved.callsFake(fnHandler);
					} else if (sEventName === "syncFailed") {
						assert.ok(true, "then the handler was attached to the syncFailed event");
					}
				}
			};
			var aMockParams = ["mockParam1", "mockParam2"];

			// Original function
			var fnOriginalStub = sandbox.stub().resolves("returnObject");

			// Wrapper function
			var fnReturn = Util.waitForSynced(oDesignTime, fnOriginalStub);
			assert.ok(typeof fnReturn === "function", "then a function was returned");

			var oReturnPromise = fnReturn.apply(null, aMockParams);
			assert.strictEqual(fnToBeResolved.callCount, 0, "then the 'synced' callback function was not called");
			setTimeout(fnToBeResolved, 50);
			return oReturnPromise.then(function(sReturn) {
				assert.ok(fnToBeResolved.calledOnce, "then the wrapper function returns a resolved promise only after the 'synced' callback function was called");
				return fnOriginalStub().then(function(sExpectedReturn) {
					assert.strictEqual(sExpectedReturn, sReturn, "then calling the returned function returns the correct value");
					assert.ok(fnOriginalStub.calledWith(aMockParams[0], aMockParams[1]), "then the returned function was called with the correct arguments");
				});
			});
		});

		QUnit.test("when waitForSynced is called without function with the DT in 'syncing' status which later turns to 'synced'", function(assert) {
			assert.expect(5);
			var fnToBeResolved = sandbox.stub();
			var oDesignTime = {
				getStatus: sandbox.stub().returns("syncing"),
				attachEventOnce: function(sEventName, fnHandler) {
					if (sEventName === "synced") {
						assert.ok(true, "then the handler was attached to the synced event");
						fnToBeResolved.callsFake(fnHandler);
					} else if (sEventName === "syncFailed") {
						assert.ok(true, "then the handler was attached to the syncFailed event");
					}
				}
			};
			var aMockParams = ["mockParam1", "mockParam2"];

			// Wrapper function
			var fnReturn = Util.waitForSynced(oDesignTime);
			assert.ok(typeof fnReturn === "function", "then a function was returned");

			var oReturnPromise = fnReturn.apply(null, aMockParams);
			assert.strictEqual(fnToBeResolved.callCount, 0, "then the 'synced' callback function was not called");
			setTimeout(fnToBeResolved, 50);
			return oReturnPromise.then(function() {
				assert.ok(fnToBeResolved.calledOnce, "then the wrapper function returns a resolved promise only after the 'synced' callback function was called");
			});
		});

		QUnit.test("when waitForSynced is called with the DT in 'synced' status", function(assert) {
			var oDesignTime = {
				getStatus: sandbox.stub().returns("synced"),
				attachEventOnce: function(sEventName) {
					if (sEventName === "synced") {
						assert.ok(false, "this should never be called");
					} else if (sEventName === "syncFailed") {
						assert.ok(false, "this should never be called");
					}
				}
			};
			var aMockParams = ["mockParam1", "mockParam2"];

			// Original function
			var fnOriginalStub = sandbox.stub().resolves("returnObject");

			// Wrapper funcion
			var fnReturn = Util.waitForSynced(oDesignTime, fnOriginalStub);
			assert.ok(typeof fnReturn === "function", "then a function was returned");

			return fnReturn.apply(null, aMockParams).then(function(sReturn) {
				return fnOriginalStub().then(function(sExpectedReturn) {
					assert.strictEqual(sExpectedReturn, sReturn, "then calling the returned function returns the correct value");
					assert.ok(fnOriginalStub.calledWith(aMockParams[0], aMockParams[1]), "then the returned function was called with the correct arguments");
				});
			});
		});

		QUnit.test("when waitForSynced is called with the DT in 'syncing' status which later turns to 'syncFailed'", function(assert) {
			assert.expect(4);
			var oDesignTime = {
				getStatus: sandbox.stub().returns("syncing"),
				attachEventOnce: function(sEventName, fnHandler) {
					if (sEventName === "synced") {
						assert.ok(true, "then the handler was attached to the synced event");
					} else if (sEventName === "syncFailed") {
						assert.ok(true, "then the handler was attached to the syncFailed event");
						fnHandler(); // callback
					}
				}
			};
			var fnPassed = function () {
				return "returnObject";
			};
			var fnReturn = Util.waitForSynced(oDesignTime, fnPassed);
			assert.ok(typeof fnReturn === "function", "then a function was returned");
			return fnReturn().catch(function() {
				assert.ok(true, "then a Promise.reject() was returned");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});