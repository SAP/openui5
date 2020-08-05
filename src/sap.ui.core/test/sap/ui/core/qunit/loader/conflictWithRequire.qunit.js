/*global QUnit, require */
sap.ui.define(function() {
	"use strict";

	function requireP(deps) {
		return new Promise(function(resolve, reject) {
			sap.ui.require(deps, function() {
				resolve(Array.prototype.slice.call(arguments));
			}, reject);
		});
	}

	QUnit.module("", {
		before: function(assert) {
			return requireP(["sap/ui/thirdparty/require"])
				.then(function() {
					assert.ok(true, "require has been loaded");
				});
		}
	});

	QUnit.test("d3", function(assert){
		return requireP(["sap/ui/thirdparty/d3"]).then(function(imports) {
			assert.ok(imports[0] != null, "d3 exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/d3") === imports[0], "probing works for d3");
		});
	});

	QUnit.test("hasher", function(assert){
		return requireP(["sap/ui/thirdparty/hasher"]).then(function(imports) {
			assert.ok(imports[0] != null, "hasher exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/hasher") === imports[0], "probing works for hasher");
		});
	});

	QUnit.test("sinon", function(assert){
		return requireP(["sap/ui/thirdparty/sinon"]).then(function(imports) {
			assert.ok(imports[0] != null, "sinon exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/sinon") === imports[0], "probing works for sinon");
		});
	});

	QUnit.test("datajs", function(assert){
		return requireP(["sap/ui/thirdparty/datajs"]).then(function(imports) {
			assert.ok(imports[0] != null, "datajs exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/datajs") === imports[0], "probing works for datajs");
		});
	});

	QUnit.test("Complex test: load sap.viz", function(assert) {
		return requireP(["sap/ui/core/Core", "sap/ui/thirdparty/jquery"]).then(function(imports) {
			return Promise.resolve(
				imports[1].ajax({
					url: sap.ui.require.toUrl("sap/viz/library.js"),
					method: "HEAD"
				})
			).then(function() {
				sap.ui.getCore().boot();
				return sap.ui.getCore().loadLibrary("sap.viz", { async: true })
				.then(function() {
					return new Promise(function(resolve, reject) {
						require(["css"], function(css) {
							assert.ok(css != null, "css plugin has been loaded");
							resolve();
						}, reject);
					});
				});
			}).catch(function() {
				assert.ok(true, "sap.viz is not available in the current environment.");
			});
		});
	});

});
