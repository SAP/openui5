/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/Device"], function(jQuery) {
	/*global QUnit, sinon */
	"use strict";

	QUnit.module("misc");

	QUnit.test("jQuery.sap.now", function (assert) {
		var iDateNow = Date.now(),
			vTimestamp = jQuery.sap.now();

		assert.expect(2);
		assert.equal(typeof vTimestamp, "number", "number");
		assert.ok(vTimestamp > iDateNow - 100 && vTimestamp < iDateNow + 100, "plausible");
	});

	QUnit.test("jQuery.sap.assert", function (assert) {
		var assertSpy = this.spy(),
			sWindowName = (typeof window === "undefined" || window.top == window) ? "" : "[" + window.location.pathname.split('/').slice(-1)[0] + "] ",
			sMessage = "foo",
			sRefMessage = sWindowName + sMessage,
			messageSpy = this.spy(function () {
				return sMessage;
			}),
			consoleAssert;


		// the fallback console.log is tested as well
		/* eslint-disable no-console */
		if (console.assert) {
			consoleAssert = console.assert;
			console.assert = assertSpy;
		} else {
			consoleAssert = console.log;
			console.log = assertSpy;
			sMessage = "[Assertions] " + sMessage;
		}
		/* eslint-enable no-console */

		jQuery.sap.assert(true, sMessage);
		assert.notOk(assertSpy.called, "true, String");
		sinon.assert.neverCalledWith(assertSpy, true, sRefMessage);
		assertSpy.resetHistory();

		jQuery.sap.assert(false, sMessage);
		assert.ok(assertSpy.calledOnce, "false, String");
		sinon.assert.calledWith(assertSpy, false, sRefMessage);
		assertSpy.resetHistory();

		jQuery.sap.assert(true, messageSpy);
		assert.notOk(messageSpy.called, "true, function");
		assert.notOk(assertSpy.called);
		sinon.assert.neverCalledWith(assertSpy, true, sRefMessage);
		assertSpy.resetHistory();
		messageSpy.resetHistory();

		jQuery.sap.assert(false, messageSpy);
		sinon.assert.calledOnce(messageSpy);
		sinon.assert.calledOnce(assertSpy);
		sinon.assert.calledWith(assertSpy, false, sRefMessage);
		assertSpy.resetHistory();
		messageSpy.resetHistory();

		/* eslint-disable no-console */
		if (console.assert) {
			console.assert = consoleAssert;
		} else {
			console.log = consoleAssert;
		}
		/* eslint-enable no-console */
	});



	QUnit.module("localStorage", {
		beforeEach: function () {
			// to check the behavior of this test in the absence of localStorage, uncomment the following line
			// delete window.localStorage;
			this.bLocalStorage = (function () {
				try {
					localStorage.setItem("foo", "foo");
					localStorage.removeItem("foo");
					return true;
				} catch (e) {
					return false;
				}
			}());
			this.stub(window, "alert");
			this.stub(console, 'warn'); // eslint-disable-line no-console
		},
		afterEach: function () {
			jQuery.sap.debug(false);
		}
	});

	QUnit.test("jQuery.sap.debug", function (assert) {

		assert.expect(7);
		assert.strictEqual(jQuery.sap.debug(true), this.bLocalStorage ? "true" : undefined, "activation - boolean");
		assert.strictEqual(jQuery.sap.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
		assert.strictEqual(jQuery.sap.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - 1");
		assert.strictEqual(jQuery.sap.debug(false), this.bLocalStorage ? null : undefined, "deactivation - boolean");
		assert.strictEqual(jQuery.sap.debug(null), this.bLocalStorage ? null : undefined, "deactivation - null");
		assert.strictEqual(jQuery.sap.debug(0), this.bLocalStorage ? null : undefined, "deactivation - 0");

		if (this.bLocalStorage) {
			assert.equal(alert.callCount, 5, "alerts");
		} else {
			assert.equal(console.warn.callCount, 6, "console warnings"); // eslint-disable-line no-console
		}
	});

	QUnit.test("jQuery.sap.setReboot", function (assert) {

		assert.expect(4);
		assert.strictEqual(jQuery.sap.setReboot("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
		assert.strictEqual(jQuery.sap.setReboot(""), this.bLocalStorage ? null : undefined, "deactivation - string");
		assert.strictEqual(jQuery.sap.setReboot(), this.bLocalStorage ? null : undefined, "deactivation - undefined");

		if (this.bLocalStorage) {
			assert.equal(alert.callCount, 1, "alerts");
		} else {
			assert.equal(console.warn.callCount, 3, "console warnings"); // eslint-disable-line no-console
		}
	});

	QUnit.test("jQuery.sap.statistics", function (assert) {

		assert.expect(4);
		assert.strictEqual(jQuery.sap.statistics(true), this.bLocalStorage ? true : undefined, "activation - boolean");
		assert.strictEqual(jQuery.sap.statistics(false), this.bLocalStorage ? false : undefined, "deactivation - boolean");
		assert.strictEqual(jQuery.sap.statistics(), this.bLocalStorage ? false : undefined, "deactivation - undefined");
		if (this.bLocalStorage) {
			assert.equal(alert.callCount, 2, "alerts");
		} else {
			assert.equal(console.warn.callCount, 3, "console warnings"); // eslint-disable-line no-console
		}
	});

	QUnit.module("Object");

	QUnit.test("jQuery.sap.factory", function (assert) {
		var oProto = {};

		// assert.expect(8);
		var fnFactory = jQuery.sap.factory(oProto);
		assert.strictEqual(typeof fnFactory, "function", "{} - typeof function");
		assert.strictEqual(fnFactory.prototype, oProto, "{} - return value");

		fnFactory = jQuery.sap.factory(null);
		assert.strictEqual(typeof fnFactory, "function", "null - typeof function");
		assert.strictEqual(fnFactory.prototype, null, "null - return value");

		fnFactory = jQuery.sap.factory(undefined);
		assert.strictEqual(typeof fnFactory, "function", "undefined - typeof function");
		assert.strictEqual(fnFactory.prototype, undefined, "undefined - return value");

		fnFactory = jQuery.sap.factory();
		assert.strictEqual(typeof fnFactory, "function", "no param - typeof function");
		assert.strictEqual(fnFactory.prototype, undefined, "no param - return value");
	});

	QUnit.test("jQuery.sap.newObject", function (assert) {
		var oProto = {};
		var oObject = {};

		oObject.prototype = oProto;

		// assert.expect();
		var oNewObject = jQuery.sap.newObject(oObject);
		assert.strictEqual(typeof oNewObject, "object", "{} - typeof object");
		assert.strictEqual(oNewObject.prototype, oProto, "{} - prototype set");

		oNewObject = jQuery.sap.newObject(null);
		assert.strictEqual(typeof oNewObject, "object", "null - typeof object");
		assert.strictEqual(oNewObject.prototype, undefined, "null - prototype undefined");

		oNewObject = jQuery.sap.newObject();
		assert.strictEqual(typeof oNewObject, "object", "no param - typeof object");
		assert.strictEqual(oNewObject.prototype, undefined, "no param - prototype undefined");
	});

	QUnit.test("jQuery.sap.getter", function (assert) {
		var oValue = {},
			fnGetter = jQuery.sap.getter(oValue);

		assert.strictEqual(fnGetter(), oValue);
	});

	QUnit.test("jQuery.sap.getObject", function (assert) {
		var UNIQUE = {}, oObject = {}, foo;

		// falsy path is mapped to empty object {} when iNoCreates parameter is set to 0
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: "" } } }), {});
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: 0 } } }), {});
		assert.strictEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: 1 } } }), 1);
		assert.strictEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: " " } } }), " ");
		assert.strictEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: "a" } } }), "a");
		assert.strictEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: true } } }), true);
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: false } } }), {});
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: undefined } } }), {});
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: null } } }), {});
		assert.propEqual(jQuery.sap.getObject("a.b.c", 0, { a: { b: { c: NaN } } }), {});


		assert.strictEqual(jQuery.sap.getObject(), undefined, "no params");

		// falsy path is mapped to [ "" ]
		assert.strictEqual(jQuery.sap.getObject("", undefined, { "": UNIQUE }), UNIQUE, "empty path should return property '' of the context");
		assert.strictEqual(jQuery.sap.getObject(undefined, undefined, { "": UNIQUE }), UNIQUE, "undefined path should return property '' of the context");

		foo = jQuery.sap.getObject("foo");
		assert.strictEqual(window.foo, foo, "foo");
		assert.notOk(window.foo);
		assert.notOk(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo.foo.foo");
		assert.strictEqual(window.foo, foo, "foo.foo.foo");
		assert.notOk(window.foo);
		assert.notOk(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo", 0);
		assert.strictEqual(window.foo, foo, "foo, 0");
		assert.ok(window.foo);
		assert.ok(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo", undefined);
		assert.strictEqual(window.foo, undefined, "foo, undefined");
		assert.notOk(window.foo);
		assert.notOk(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo", null);
		assert.strictEqual(window.foo, foo, "foo, null");
		assert.ok(window.foo);
		assert.ok(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo", NaN);
		assert.strictEqual(window.foo, undefined, "foo, NaN");
		assert.notOk(window.foo);
		assert.notOk(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", 0);
		assert.strictEqual(window.foo.foo.foo, foo, "foo.foo.foo, 0");
		assert.ok(window.foo.foo.foo);
		assert.ok(foo);
		assert.ok(foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", 1);
		assert.strictEqual(window.foo.foo.foo, foo, "foo.foo.foo, 1");
		assert.notOk(window.foo.foo.foo);
		assert.ok(window.foo.foo);
		delete window.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", 2);
		assert.strictEqual(window.foo.foo, foo, "foo.foo.foo, 2");
		assert.notOk(window.foo.foo);
		assert.ok(window.foo);
		delete window.foo;

		oObject = {};
		foo = jQuery.sap.getObject("foo.foo.foo", 3, oObject);
		assert.strictEqual(foo, undefined, "access to non-existing property should return undefined (path 'foo.foo.foo', iNoCreates 3)");
		assert.deepEqual(oObject, {}, "if iNoCreate is > 0 and greater than or equal the length of the path, then the context should not be touched");

		oObject = {};
		foo = jQuery.sap.getObject("", 1, oObject);
		assert.strictEqual(foo, undefined, "access to non-existing property should return undefined (path '', iNoCreates 1)");
		assert.deepEqual(oObject, {}, "if iNoCreate is > 0 and greater than or equal the length of the path, then the context should not be touched");

		oObject = {};
		foo = jQuery.sap.getObject("", 0, oObject);
		assert.deepEqual(foo, {}, "access to non-existing property with empty name returns an empty object (path '', iNoCreates 0)");
		assert.deepEqual(oObject, { "": {} }, "if iNoCreate is 0, then property '' of the context is created (bug)");

		oObject = {
			foo: {
				foo: {
					foo: UNIQUE
				}
			}
		};
		foo = jQuery.sap.getObject("foo.foo.foo", 3, oObject);
		assert.strictEqual(foo, UNIQUE, "access to existing property should return its value independent from iNoCreate (path 'foo.foo.foo', iNoCreates 3)");
		foo = jQuery.sap.getObject("foo.foo.foo", 2, oObject);
		assert.strictEqual(foo, UNIQUE, "access to existing property should return its value independent from iNoCreate (path 'foo.foo.foo', iNoCreates 2)");
		foo = jQuery.sap.getObject("foo.foo.foo", 1, oObject);
		assert.strictEqual(foo, UNIQUE, "access to existing property should return its value independent from iNoCreate (path 'foo.foo.foo', iNoCreates 1)");
		foo = jQuery.sap.getObject("foo.foo.foo", 0, oObject);
		assert.strictEqual(foo, UNIQUE, "access to existing property should return its value independent from iNoCreate (path 'foo.foo.foo', iNoCreates 0)");
		foo = jQuery.sap.getObject("foo.foo.foo", undefined, oObject);
		assert.strictEqual(foo, UNIQUE, "access to existing property should return its value independent from iNoCreate (path 'foo.foo.foo', iNoCreates undefined)");

		oObject = {};
		foo = jQuery.sap.getObject("foo", oObject);
		assert.strictEqual(oObject.foo, foo, "foo, {}");
		assert.notOk(oObject.foo);
		delete oObject.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", 0, oObject);
		assert.strictEqual(oObject.foo.foo.foo, foo, "foo.foo.foo, 0, {}");
		assert.ok(oObject.foo.foo.foo);
		assert.ok(foo);
		delete oObject.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", undefined, oObject);
		assert.strictEqual(oObject.foo, undefined, "foo.foo.foo, undefined, {}");
		assert.notOk(oObject.foo);
		assert.notOk(foo);
		delete oObject.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", null, oObject);
		assert.strictEqual(oObject.foo.foo.foo, foo, "foo.foo.foo, null, {}");
		assert.ok(oObject.foo.foo.foo);
		assert.ok(foo);
		delete oObject.foo;

		foo = jQuery.sap.getObject("foo.foo.foo", NaN, oObject);
		assert.strictEqual(oObject.foo, undefined, "foo.foo.foo, NaN, {}");
		assert.notOk(oObject.foo);
		assert.notOk(foo);
		delete oObject.foo;
	});

	QUnit.test("jQuery.sap.setObject", function (assert) {
		var oObject = {}, bar = "bar";

		assert.strictEqual(jQuery.sap.setObject(), undefined, "no params");

		jQuery.sap.setObject("foo", bar);
		assert.strictEqual(window.foo, bar, "foo, \"bar\"");
		delete window.foo;

		jQuery.sap.setObject("foo.foo.foo", bar);
		assert.strictEqual(window.foo.foo.foo, bar, "foo.foo.foo, \"bar\"");
		delete window.foo;

		jQuery.sap.setObject("foo", bar, oObject);
		assert.strictEqual(oObject.foo, bar, "foo, bar, {}");
		delete oObject.foo;

		jQuery.sap.setObject("foo.foo.foo", bar, oObject);
		assert.strictEqual(oObject.foo.foo.foo, bar, "foo.foo.foo, bar, {}");
		delete oObject.foo;
	});

	QUnit.module("jQuery");

	QUnit.test("jQuery.browser", function (assert) {
		assert.ok(jQuery.browser);
	});

	QUnit.test("jQuery.support", function (assert) {
		assert.ok(jQuery.support);
	});

});
