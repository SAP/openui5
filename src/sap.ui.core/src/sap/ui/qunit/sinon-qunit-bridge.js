/*
 * ${copyright}
 */

/*
 * A helper script which enables using Sinon.JS version 1 or 4 within QUnit version 1 or 2. QUnit
 * tests are run in a Sinon sandbox. This allows creating Sinon spies, stubs and mocks via this. The
 * sandbox is created before running beforeEach and is verified and restored when afterEach
 * including all returned promises is finished. This sandbox can be used universally in beforeEach,
 * the test itself and afterEach. It is available as <code>this._oSandbox</code>.
 *
 * This script requires that QUnit and Sinon.JS have been loaded via <script> before. (The global
 * properties QUnit and sinon must exist.)
 *
 * BEWARE: This script does not support QUnit.module with a nested callback function.
 */
(function () {
	"use strict";
	/*global QUnit, sinon */

	var fnQUnitModule = QUnit.module;

	function error(oError) {
		verifyAndRestore(this._oSandbox);
		throw oError;
	}

	function failOutsideTest(sMessage) {
		throw new Error("sinon.assert.fail outside of test: " + sMessage);
	}

	function merge(o1, o2) {
		Object.keys(o2).forEach(function (sKey) {
			o1[sKey] = o2[sKey];
		});
		return o1;
	}

	function nop() {}

	function passOutsideTest(sMessage) {
		throw new Error("sinon.assert.pass outside of test: " + sMessage);
	}

	function success(vResult) {
		if (vResult && typeof vResult.then === "function") {
			return vResult.then(success.bind(this), error.bind(this));
		}
		verifyAndRestore(this._oSandbox);
		return vResult;
	}

	function verifyAndRestore(oSandbox) {
		oSandbox.verifyAndRestore();
		sinon.assert.fail = failOutsideTest;
		sinon.assert.pass = passOutsideTest;
	}

	QUnit.module = function (sName, oHooks, fnNested) {
		var fnAfterEach, fnBeforeEach, oSinonHooks;

		if (typeof oHooks === "function" || typeof fnNested === "function") {
			fnQUnitModule.call(this, sName); // start the module so that the error is attached to it
			throw new Error("QUnit.module with nested callback not supported");
		}

		fnAfterEach = oHooks && oHooks.afterEach || nop;
		fnBeforeEach = oHooks && oHooks.beforeEach || nop;

		oSinonHooks = {
			beforeEach : function (assert) {
				this._oSandbox = sinon.sandbox.create({
					injectInto : this,
					properties : ["mock", "spy", "stub"]
				});

				sinon.assert.fail = function (sMessage) {
					assert.ok(false, sMessage);
				};

				sinon.assert.pass = function (sMessage) {
					assert.ok(true, sMessage);
				};

				return fnBeforeEach.apply(this, arguments);
			},

			afterEach : function (assert) {
				try {
					return success.call(this, fnAfterEach.apply(this, arguments));
				} catch (oError) {
					error.call(this, oError);
				}
			}
		};

		fnQUnitModule.call(this, sName,
			oHooks ? merge(merge({}, oHooks), oSinonHooks) : oSinonHooks);
	};

	sinon.assert.fail = failOutsideTest;
	sinon.assert.pass = passOutsideTest;
}());
