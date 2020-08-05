/* global define, require, QUnit */
define(function () {
	"use strict";

	QUnit.module("UI5 Loader tests for AMD compliant config paths with modified baseUrl", {
		before: function () {
			require.config({
				baseUrl: "./app",
				paths: {
					"root": "../root",
					"sub/baz": "subdir/baz"
				}
			});
		}
	});

	QUnit.test("Should load module from parent dir, relative to baseUrl", function(assert) {
		var done = assert.async();
		require(["root"], function(Root) {
			assert.strictEqual(Root.name, "root", "Load module from parent dir, relative to baseUrl");
			done();
		});
	});

	QUnit.test("Should load module from root-folder set in baseUrl", function(assert) {
		var done = assert.async();
		require(["foo-nodep"], function(Foo) {
			assert.strictEqual(Foo.name, "foo-nodep", "Load module from root-folder containing no dependencies, relative to baseUrl");
			done();
		});
	});



	QUnit.test("Should load module with dependencies from root-folder set in baseUrl containing dependencies ", function(assert) {
		var done = assert.async();
		require(["foo"], function(Foo) {
			assert.strictEqual(Foo.name, "foo", "Load module foo from root-folder containing dependencies, relative to baseUrl");
			assert.strictEqual(Foo.deps.bar, "bar", "Load module bar from root-folder containing dependencies, relative to baseUrl");
			done();
		});
	});

	QUnit.test("Should load module from subdir relative to baseUrl", function(assert) {
		var done = assert.async();
		require(["sub/baz"], function(Baz) {
			assert.strictEqual(Baz.name, "baz", "Load module from subdir relative to baseUrl");
			done();
		});
	});
});
