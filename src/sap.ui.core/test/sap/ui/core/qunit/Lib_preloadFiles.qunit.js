/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib"
], function(ObjectPath, jQuery, Library) {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	// custom assertion
	QUnit.assert.isLibLoaded = function(libName) {
		var isLoaded = Library.isLoaded(libName) && sap.ui.require(libName.replace(/\./g, "/") + "/library");
		/**
		 * @deprecated
		 */
		isLoaded &&= ObjectPath.get(libName);
		this.ok(isLoaded, "library '" + libName + "' should have been loaded");
		if ( !isLoaded ) {
			// provide more details in QUnit report
			/**
			 * @deprecated
			 */
			this.ok(ObjectPath.get(libName), "namespace for " + libName + " should exist");
			this.ok(sap.ui.require(libName.replace(/\./g, "/") + "/library"), "library module should have been required");
			this.ok(Library.isLoaded(libName), "Core should know and list " + libName + " as 'loaded'");
		}
	};

	/*
	 * Scenario7/8
	 *
	 *   lib1 (js, json)
	 *   lib2 (json)
	 *   lib3 (js)
	 *   lib4 (json)
	 *   lib5 (js)
	 */
	var EXPECTATIONS = {
		'none':	[ 'none', 'none', 'none' ],
		'js':   [ 'js', 'jserror', 'js' ]
	};

	var match = /(?:[?&])sap-ui-xx-libraryPreloadFiles=([^&]*)(?:&|$)/.exec(window.location.search);
	var cfgLibraryPreloadFiles = (match && decodeURIComponent(match[1])) || 'both';

	var $title = jQuery("head>title");
	$title.text($title.text() + cfgLibraryPreloadFiles.replace(/testlibs.scenario/g, '...'));

	QUnit.module("libraryPreloadFiles=" + cfgLibraryPreloadFiles.replace(/testlibs.scenario/g, '...'), {
		afterEach: function(assert) {
			delete window.testlibs;
		}
	});

	QUnit.test("async", function(assert) {

		assert.ok(EXPECTATIONS[cfgLibraryPreloadFiles], "[precondition] configured variants should be described in EXPECTATIONS");

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

		this.spy(privateLoaderAPI, 'loadJSResourceAsync');
		this.spy(XMLHttpRequest.prototype, 'open');
		this.spy(sap.ui.require, 'load');
		// TODO this.spy(Log, 'error');
		// @evo-todo: ui5loader and Core.js use different loggers.
		// This does not only make this test unnecessarily complex but also leads to redundant log entries. Should be cleaned up
		// Main question: log early (place where an error is detected first) or log late (where the most significant context can be given)
		this.spy(privateLoaderAPI.logger, 'error');

		var vResult = Library._load([
			'testlibs.scenario7.lib1', // both, not configured
			'testlibs.scenario7.lib2', // json, not configured
			'testlibs.scenario7.lib3'  // js, not configured
		]);

		return vResult.then(function() {
			EXPECTATIONS[cfgLibraryPreloadFiles].forEach(function(expected, idx) {

				if ( expected == null ) {
					return;
				}

				var lib = "lib" + (idx + 1);
				function matcher(suffix) {
					return sinon.match(new RegExp("scenario7\\/" + lib + "\\/library" + suffix));
				}
				var matcherLibPreloadJS = matcher("-preload\\.js$");

				var matcherLibraryModule = "testlibs/scenario7/" + lib + "/library";
				var matcherLibraryResource = matcher("\\.js$");

				assert.isLibLoaded('testlibs.scenario7.' + lib);

				if ( expected === 'none' ) {
					assert.ok(privateLoaderAPI.loadJSResourceAsync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been requested for '" + lib + "'");
					assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
				} else if ( expected === 'js' ) {
					assert.ok(privateLoaderAPI.loadJSResourceAsync.calledWith(matcherLibPreloadJS), "library-preload.js should have been loaded for '" + lib + "'");
					assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
				} else if ( expected === 'jserror' ) {
					assert.ok(privateLoaderAPI.loadJSResourceAsync.calledWith(matcherLibPreloadJS), "library-preload.js should have been requested for '" + lib + "'");
					assert.ok(privateLoaderAPI.logger.error.calledWith(matcher("-preload\\.js").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
					assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
				} else {
					assert.ok(false, "[test code broken] unhandled expectation " + expected);
				}
			});

		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});

});