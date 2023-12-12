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
		return requireP(["sap/ui/thirdparty/d3"]).then(function([d3]) {
			assert.ok(d3 != null, "d3 exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/d3") === d3, "probing works for d3");
		});
	});

	QUnit.test("hasher", function(assert){
		return requireP(["sap/ui/thirdparty/hasher"]).then(function([hasher]) {
			assert.ok(hasher != null, "hasher exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/hasher") === hasher, "probing works for hasher");
		});
	});

	QUnit.test("sinon", function(assert){
		return requireP(["sap/ui/thirdparty/sinon"]).then(function([sinon]) {
			assert.ok(sinon != null, "sinon exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/sinon") === sinon, "probing works for sinon");
		});
	});

	QUnit.test("datajs", function(assert){
		return requireP(["sap/ui/thirdparty/datajs"]).then(function([datajs]) {
			assert.ok(datajs != null, "datajs exports something");
			assert.ok(sap.ui.require("sap/ui/thirdparty/datajs") === datajs, "probing works for datajs");
		});
	});

	QUnit.test("Complex test: load sap.viz", function(assert) {
		return requireP(["sap/ui/core/Core", "sap/ui/core/Lib", "sap/ui/thirdparty/jquery"]).then(function([Core, Library, jQuery]) {
			return Promise.resolve(
				jQuery.ajax({
					url: sap.ui.require.toUrl("sap/viz/library.js"),
					method: "HEAD"
				})
			).then(function() {
				Core.boot();
				return Library.load("sap.viz")
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
