/* global define, require, QUnit */
define(function () {
	"use strict";

	QUnit.module("UI5 Loader tests for AMD compliant config paths", {
		before: function () {
			require.config({
				paths: {
					"sub/sub/baz": "test-resources/sap/ui/core/qunit/loader/amd/config_paths/app/subdir/baz",
					"app" : "test-resources/sap/ui/core/qunit/loader/amd/base_tag/app"
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
});
