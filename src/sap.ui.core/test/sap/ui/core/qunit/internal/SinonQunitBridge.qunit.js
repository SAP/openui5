/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global foo, QUnit, sinon */

	// global test object which is mocked in each test to ensure that verifyAndRestore must run
	window.foo = {
		bar : function () {},
		baz : function () {}
	};

	// QUnit.todo does not exist in QUnit 1. Use QUnit.test instead -> the errors will be visible.
	QUnit.todo = QUnit.todo || QUnit.test;

	function afterEach() {
		sinon.assert.pass("pass");
	}

	function beforeEach() {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
	}

	var oHooks = {
		beforeEach : beforeEach,
		afterEach : afterEach
	};

	function useMock(assert) {
		assert.strictEqual(foo.bar("baz"), 42, "use mock");
	}

	// QUnit.module("nested 1", function () {});
	// QUnit.module("nested 2", {}, function () {});

	QUnit.module("no module object");

	QUnit.test("test", function (assert) {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);

		useMock(assert);

		this.spy(foo, "baz");
		foo.baz("qux");
		sinon.assert.calledWithExactly(foo.baz, "qux");
	});

	QUnit.module("empty module object", {});

	QUnit.test("test", function (assert) {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);

		useMock(assert);

		this.stub(foo, "baz");
		foo.baz("qux");
		sinon.assert.calledWithExactly(foo.baz, "qux");
	});

	QUnit.module("beforeEach/afterEach", oHooks);

	QUnit.test("test", useMock);

	QUnit.module("afterEach throws error", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
		},
		afterEach : function () {
			throw new Error("afterEach failed intentionally");
		}
	});

	// This test MUST report the failure 'afterEach failed on test: afterEach failed intentionally'
	QUnit.todo("test", useMock);

	QUnit.module("afterEach returns Promise", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
		},
		afterEach : function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					sinon.assert.pass("pass in Promise");
					resolve();
				}, 0);
			});
		}
	});

	QUnit.test("test", useMock);

	QUnit.module("afterEach Promise fails", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
		},
		afterEach : function () {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					reject(new Error("afterEach Promise rejected intentionally"));
				}, 0);
			});
		}
	});

	// This test MUST report the failure 'Promise rejected after "test": afterEach Promise rejected
	// intentionally'
	QUnit.todo("test", useMock);

	QUnit.module("beforeEach/afterEach again", oHooks);

	QUnit.test("test1", useMock);

	QUnit.test("test2", useMock);
}());