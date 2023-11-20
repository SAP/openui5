/* global define, require, QUnit */
define(function () {
	"use strict";

	QUnit.module("UI5 Loader tests for AMD compliant config paths", {
		before: function () {
			require.config({
				paths: {
					"sub/foo": "app/foo-nodep",
					"sub/sub/baz": "app/subdir/baz"
				}
			});
		}
	});

	QUnit.test("Should load module containing dependencies", function(assert) {
		var done = assert.async();
		require(["app/foo"], function(Foo) {
			assert.strictEqual(Foo.deps.bar, "bar", "Loaded foo with relative dependency to bar");
			assert.strictEqual(Foo.deps.baz, "baz", "Loaded foo with relative dependency to baz");
			done();
		});
	});

	QUnit.test("Should load module from root", function(assert) {
		var done = assert.async();
		require(["root"], function(Root) {
			assert.strictEqual(Root.name, "root", "Loaded from root");
			done();
		});
	});

	QUnit.test("Should load module without dependencies from subdir", function(assert) {
		var done = assert.async();
		require(["sub/foo"], function(Foo) {
			assert.strictEqual(Foo.name, "foo-nodep", "Loaded from app/foo-nodep");
			done();
		});
	});

	QUnit.test("Should load module without dependencies from subsubdir", function(assert) {
		var done = assert.async();
		require(["sub/sub/baz"], function(Baz) {
			assert.strictEqual(Baz.name, "baz", "Loaded from app/subdir/baz");
			done();
		});
	});

	QUnit.test("Should load module from subdir which wasn't defined in paths", function(assert) {
		var done = assert.async();
		require(["app/bar"], function(Bar) {
			assert.strictEqual(Bar.name, "bar", "Loaded from app/bar");
			done();
		});
	});

});
