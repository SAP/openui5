
/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/LoaderExtensions'], function(LoaderExtensions) {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	QUnit.module("sap.base.util.LoaderExtensions");

	QUnit.test("getAllRequiredModules", function(assert) {
		assert.expect(6);
		var done = assert.async();

		var aModules = LoaderExtensions.getAllRequiredModules();
		assert.ok(Array.isArray(aModules), "should return an array");
		assert.ok(aModules.every(function(s){return typeof s == "string";}), "should only contain strings");
		assert.notOk(sap.ui.require('my.required.module'), "module has not yet been loaded");
		assert.notOk(aModules.indexOf('my.required.module') != -1, "module is not contained");

		sap.ui.define('my.required.module', [], function() {
			return {};
		});

		sap.ui.require(['my.required.module'], function(module) {
			aModules = LoaderExtensions.getAllRequiredModules();
			assert.ok(module, "module has been loaded");
			assert.ok(aModules.indexOf('my.required.module') != -1, "module is contained");
			done();
		});
	});

	QUnit.test("toURL - resolve ui5:// pseudo protocol", function(assert) {
		// define paths
		sap.ui.loader.config({
			paths: {
				"my/path/to/ui5app": "test-resource/my/path/to/something",
				"my.path.to.dots.ui5app": "test-resource/my/path/to/something/with/dots",
				"my/cross/app": "http://somewhere.else/my/cross/app/deployment"
			}
		});

		// simple
		var sResolvedURL = LoaderExtensions.resolveUI5Url("ui5://my/path/to/ui5app/file/some.xml");
		assert.equal(sResolvedURL, privateLoaderAPI.resolveURL("test-resource/my/path/to/something/file/some.xml"), "simple url resolution");

		// simple (dots)
		var sResolvedURLDots = LoaderExtensions.resolveUI5Url("ui5://my.path.to.dots.ui5app/file/some.xml");
		assert.equal(sResolvedURLDots, privateLoaderAPI.resolveURL("test-resource/my/path/to/something/with/dots/file/some.xml"), "simple url resolution");

		// simple + url params
		var sResolvedURLWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://my/path/to/ui5app/file/some.xml?param1=true&param2=5");
		assert.equal(sResolvedURLWithUrlParams, privateLoaderAPI.resolveURL("test-resource/my/path/to/something/file/some.xml?param1=true&param2=5"), "simple url resolution");

		// simple (dots) + url params
		var sResolvedURLDotsWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://my.path.to.dots.ui5app/file/some.xml?param1=true&param2=5");
		assert.equal(sResolvedURLDotsWithUrlParams, privateLoaderAPI.resolveURL("test-resource/my/path/to/something/with/dots/file/some.xml?param1=true&param2=5"), "simple url resolution");

		// cross-origin resolution
		var sResolvedCrossURL = LoaderExtensions.resolveUI5Url("ui5://my/cross/app/file/some.xml");
		assert.equal(sResolvedCrossURL, privateLoaderAPI.resolveURL("http://somewhere.else/my/cross/app/deployment/file/some.xml"), "cross origin url resolution");

		// cross-origin resolution + url params
		var sUnmappedCrossURL = LoaderExtensions.resolveUI5Url("ui5://my/cross/app/file/some.xml?param1=true&param2=5");
		assert.equal(sUnmappedCrossURL, privateLoaderAPI.resolveURL("http://somewhere.else/my/cross/app/deployment/file/some.xml?param1=true&param2=5"), "cross origin url resolution");

		// unmapped paths (dots)
		var sUnmappedURLDots = LoaderExtensions.resolveUI5Url("ui5://dot.namespace.not.registered/file/some.xml");
		assert.equal(sUnmappedURLDots, privateLoaderAPI.resolveURL("resources/dot.namespace.not.registered/file/some.xml"), "unmapped paths");

		// unmapped paths (slashes)
		var sUnmappedURLSlashes = LoaderExtensions.resolveUI5Url("ui5://other/namespace/not/registered/file/some.xml");
		assert.equal(sUnmappedURLSlashes, privateLoaderAPI.resolveURL("resources/other/namespace/not/registered/file/some.xml"), "unmapped paths");

		// unmapped paths (dots) + url params
		var sUnmappedDotsWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://other.namespace.not.registered/file/some.xml?param1=true&param2=5");
		assert.equal(sUnmappedDotsWithUrlParams, privateLoaderAPI.resolveURL("resources/other.namespace.not.registered/file/some.xml?param1=true&param2=5"), "unmapped paths with url params");

		// unmapped paths (slashes) + url params
		var sUnmappedSlashesWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://other/namespace/not/registered/file/some.xml?param1=true&param2=5");
		assert.equal(sUnmappedSlashesWithUrlParams, privateLoaderAPI.resolveURL("resources/other/namespace/not/registered/file/some.xml?param1=true&param2=5"), "unmapped paths with url params");

	});

});