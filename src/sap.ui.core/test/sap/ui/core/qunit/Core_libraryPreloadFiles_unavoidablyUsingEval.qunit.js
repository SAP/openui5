/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib"
], function(ObjectPath, jQuery, Library) {
	"use strict";

	// custom assertion
	QUnit.assert.isLibLoaded = function(libName) {
		var isLoaded = ObjectPath.get(libName) && Library.all()[libName];
		this.ok(isLoaded, "library '" + libName + "' should have been loaded");
		if ( !isLoaded ) {
			// provide more details in QUnit report
			this.ok(ObjectPath.get(libName), "namespace for " + libName + " should exist");
			this.ok(Library.all()[libName], "Core should know and list " + libName + " as 'loaded'");
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
		'none':	[ 'none', 'none', 'none', 'none', 'none' ],
		'both': [ 'js', 'jserror,json', 'js', 'json', 'js' ],
		'js':   [ 'js', 'jserror', 'js', 'none', 'js' ],
		'json': [ 'json', 'json', 'jsonerror', 'json', 'none'],
		'both,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js':
				[ null, 'json', 'js', null, null ],
		'js,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:none,testlibs.scenario8.lib3:none':
				[ null, 'json', 'none', null, null ],
		'json,testlibs.scenario7.lib2:none,testlibs.scenario8.lib2:none,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js':
				[ null, 'none', 'js', null, null ],
		'both,testlibs.scenario7.lib4:none,testlibs.scenario8.lib4:none,testlibs.scenario7.lib5:none,testlibs.scenario8.lib5:none':
				[ null, null, null, 'none', 'none' ]
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

		this.spy(sap.ui.loader._, 'loadJSResourceAsync');
		this.spy(XMLHttpRequest.prototype, 'open');
		this.spy(sap.ui.require, 'load');
		this.spy(jQuery.sap, 'require');
		// TODO this.spy(Log, 'error');
		// @evo-todo: ui5loader and Core.js use different loggers.
		// This does not only make this test unnecessarily complex but also leads to redundant log entries. Should be cleaned up
		// Main question: log early (place where an error is detected first) or log late (where the most significant context can be given)
		this.spy(sap.ui.loader._.logger, 'error');

		var vResult = sap.ui.getCore().loadLibraries([
			'testlibs.scenario7.lib1', // both, not configured
			'testlibs.scenario7.lib2', // json, not configured
			'testlibs.scenario7.lib3', // js, not configured
			{ name: 'testlibs.scenario7.lib4', json: true }, // json, configured
			{ name: 'testlibs.scenario7.lib5', json: false } // js, configured
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
				var matcherAjaxLibPreloadJSON = sinon.match(matcher("-preload\\.json$"));
				var matcherLibraryModule = "testlibs/scenario7/" + lib + "/library";
				var matcherLibraryResource = matcher("\\.js$");

				assert.isLibLoaded('testlibs.scenario7.' + lib);

				if ( expected === 'none' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been requested for '" + lib + "'");
					assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been requested for '" + lib + "'");
					assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
				} else if ( expected === 'js' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(matcherLibPreloadJS), "library-preload.js should have been loaded for '" + lib + "'");
					assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been requested for '" + lib + "'");
					assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
				} else if ( expected === 'jserror,json' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(matcherLibPreloadJS), "library-preload.js should have been requested for '" + lib + "'");
					assert.ok(sap.ui.loader._.logger.error.calledWith(matcher("-preload\\.js").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
					assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been loaded for '" + lib + "'");
					assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
				} else if ( expected === 'jserror' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(matcherLibPreloadJS), "library-preload.js should have been requested for '" + lib + "'");
					assert.ok(sap.ui.loader._.logger.error.calledWith(matcher("-preload\\.js").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
					assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been loaded for '" + lib + "'");
					assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
				} else if ( expected === 'jsonerror' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been loaded for '" + lib + "'");
					assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been requested for '" + lib + "'");
					// assert.ok(Log.error.calledWith(matcher("-preload\\.json").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
					assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
				} else if ( expected === 'json' ) {
					assert.ok(sap.ui.loader._.loadJSResourceAsync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been requested for '" + lib + "'");
					assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been loaded for '" + lib + "'");
					assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
				} else {
					assert.ok(false, "[test code broken] unhandled expectation " + expected);
				}
			});

		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});

	/*
	 * Scenario8:
	 *
	 *   lib1 (js, json)
	 *   lib2 (json)
	 *   lib3 (js)
	 */
	QUnit.test("sync", function(assert) {

		assert.ok(EXPECTATIONS[cfgLibraryPreloadFiles], "[precondition] configured variants should be described in EXPECTATIONS");

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

		this.spy(sap.ui, 'requireSync');
		this.spy(XMLHttpRequest.prototype, 'open');
		this.spy(sap.ui.require, 'load');
		this.spy(jQuery.sap, 'require');
		// TODO this.spy(Log, 'error');

		sap.ui.getCore().loadLibraries([
			'testlibs.scenario8.lib1', // both, not configured
			'testlibs.scenario8.lib2', // json, not configured
			'testlibs.scenario8.lib3', // js, not configured
			{ name: 'testlibs.scenario8.lib4', json: true }, // json, configured
			{ name: 'testlibs.scenario8.lib5', json: false } // js, configured
		], { async: false });

		EXPECTATIONS[cfgLibraryPreloadFiles].forEach(function(expected, idx) {

			if ( expected == null ) {
				return;
			}

			var lib = "lib" + (idx + 1);
			function matcher(suffix) {
				return sinon.match(new RegExp("scenario8\\/" + lib + "\\/library" + suffix));
			}
			var matcherLibPreloadJS = matcher("-preload$");
			var matcherAjaxLibPreloadJSON = sinon.match(matcher("-preload\\.json$"));
			var matcherLibraryModule = "testlibs/scenario8/" + lib + "/library";
			var matcherLibraryResource = matcher("\\.js$");

			assert.isLibLoaded('testlibs.scenario8.' + lib);

			if ( expected === 'none' ) {
				assert.ok(sap.ui.requireSync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been loaded for '" + lib + "'");
				assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been loaded for '" + lib + "'");
				assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
			} else if ( expected === 'js' ) {
				assert.ok(sap.ui.requireSync.calledWith(matcherLibPreloadJS), "library-preload.js should have been loaded for '" + lib + "'");
				assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been loaded for '" + lib + "'");
				assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
			} else if ( expected === 'jserror,json' ) {
				assert.ok(sap.ui.requireSync.calledWith(matcherLibPreloadJS), "library-preload.js should have been requested for '" + lib + "'");
				// TODO assert.ok(Log.error.calledWith(matcher("-preload\\.js").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
				assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been loaded for '" + lib + "'");
				assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
			} else if ( expected === 'jserror' ) {
				assert.ok(sap.ui.requireSync.calledWith(matcherLibPreloadJS), "library-preload.js should have been requested for '" + lib + "'");
				// TODO assert.ok(Log.error.calledWith(matcher("-preload\\.js").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
				assert.ok(XMLHttpRequest.prototype.open.neverCalledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should not have been loaded for '" + lib + "'");
				assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
			} else if ( expected === 'jsonerror' ) {
				assert.ok(sap.ui.requireSync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been requested for '" + lib + "'");
				assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been requested for '" + lib + "'");
				// assert.ok(Log.error.calledWith(matcher("-preload\\.json").and(sinon.match(/failed to load/))), "error should have been logged for failing request");
				assert.ok(sap.ui.require.load.calledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should have been loaded for '" + lib + "'");
			} else if ( expected === 'json' ) {
				assert.ok(sap.ui.requireSync.neverCalledWith(matcherLibPreloadJS), "library-preload.js should not have been requested for '" + lib + "'");
				assert.ok(XMLHttpRequest.prototype.open.calledWith(sinon.match.any, matcherAjaxLibPreloadJSON), "library-preload.json should have been loaded for '" + lib + "'");
				assert.ok(sap.ui.require.load.neverCalledWith(sinon.match.any, matcherLibraryResource, matcherLibraryModule), "library.js should not have been requested for '" + lib + "'");
			} else {
				assert.ok(false, "unhandled expectation " + expected);
			}
		});

		this.oLibraryGetPreloadStub.restore();
	});

});