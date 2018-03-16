sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/UIComponentMetadata"
], function(jQuery, Component, UIComponent, UIComponentMetadata) {

	"use strict";
	/*global sinon, QUnit*/

	function Deferred() {
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
	}

	// used to get access to the non-public core parts
	var oRealCore;
	var TestCorePlugin = function() {};
	TestCorePlugin.prototype.startPlugin = function(oCore, bOnInit) {
		oRealCore = oCore;
	};
	sap.ui.getCore().registerPlugin(new TestCorePlugin());

	function unloadResources() {
		// unload libs and components (not an API)
		jQuery.sap.unloadResources('sap.test.lib2.library-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/lib2/library-preload.js', false, true, true);
		jQuery.sap.unloadResources('sap.test.lib3.library-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/lib3/library-preload.js', false, true, true);
		jQuery.sap.unloadResources('sap.test.lib4.library-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/lib4/library-preload.js', false, true, true);
		jQuery.sap.unloadResources('sap/test/mycomp/Component-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/mycomp/Component-preload.js', false, true, true);
		jQuery.sap.unloadResources('sap/test/mysubcomp/Component-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/mysubcomp/Component-preload.js', false, true, true);
		jQuery.sap.unloadResources('sap/test/manifestcomp/Component-preload', true, true, true);
		jQuery.sap.unloadResources('sap/test/manifestcomp/Component-preload.js', false, true, true);
		// undo module path registration (official API)
		jQuery.sap.registerResourcePath("sap/test");
		jQuery.sap.registerResourcePath("sap/test/lib2");
		jQuery.sap.registerResourcePath("sap/test/lib3");
		jQuery.sap.registerResourcePath("sap/test/lib4");
		jQuery.sap.registerResourcePath("sap/test/lib5");
		jQuery.sap.registerResourcePath("sap/test/mycomp");
		jQuery.sap.registerResourcePath("sap/test/mysubcomp");
		jQuery.sap.registerResourcePath("sap/test/my2ndsubcomp");
		jQuery.sap.registerResourcePath("sap/test/manifestcomp");
		// remove script tags for Component-preload.js modules (not an API)
		jQuery("SCRIPT[data-sap-ui-module^='sap/test/']").remove();
	}



	QUnit.module("Async (Pre-)Loading", {
		afterEach: function() {
			unloadResources();
		}
	});

	QUnit.test("dependencies as simple strings", function (assert) {

		var done = assert.async();

		jQuery.sap.registerModulePath("sap.test", "./testdata/async");
		var oResult = sap.ui.component.load({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				libs: [ 'sap.test.lib2', 'sap.test.lib3' ],
				components: ['sap.test.mysubcomp']
			}
		});
		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			sap.ui.component({name: "sap.test.mycomp"});
			done();
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with objects names", function (assert) {

		var done = assert.async();

		jQuery.sap.registerModulePath("sap.test", "./testdata/async");
		var oResult = sap.ui.component.load({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2'
					},
					'sap.test.lib3'
				],
				components: [ {
					name: 'sap.test.mysubcomp'
				}]
			}
		});
		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			sap.ui.component({name: "sap.test.mycomp"});
			done();
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with names and some URLs", function (assert) {

		var done = assert.async();

		// register URls for those entities that are not listed in the hints below
		jQuery.sap.registerModulePath("sap.test.lib3", "./testdata/async/lib3");
		jQuery.sap.registerModulePath("sap.test.lib4", "./testdata/async/lib4");
		jQuery.sap.registerModulePath("sap.test.mycomp", "./testdata/async/mycomp");

		var oResult = sap.ui.component.load({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2',
						url: '../testdata/components/async/lib2'
					},
					'sap.test.lib3'
				],
				components: [ {
					name: 'sap.test.mysubcomp',
					url: '../testdata/components/async/mysubcomp'
				}]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			sap.ui.component({name: "sap.test.mycomp"});
			done();
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with names, some URLs and lazy dependencies", function (assert) {

		var done = assert.async();

		// register URls for those entities that are not listed in the hints below
		jQuery.sap.registerModulePath("sap.test.lib3", "./testdata/async/lib3");
		jQuery.sap.registerModulePath("sap.test.lib4", "./testdata/async/lib4");
		jQuery.sap.registerModulePath("sap.test.mycomp", "./testdata/async/mycomp");

		var oResult = sap.ui.component.load({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2',
						url: './testdata/async/lib2',
						lazy: false
					},
					{
						name: 'sap.test.lib5',
						url: './testdata/async/lib5',
						lazy: true
					},
					{
						name: 'sap.test.lib6',
						lazy: true
					},
					'sap.test.lib3'
				],
				components: [
					{
						name: 'sap.test.mysubcomp',
						url: './testdata/async/mysubcomp'
					},
					{
						name: 'sap.test.my2ndsubcomp',
						url: './testdata/async/my2ndsubcomp',
						lazy: true
					},
					{
						name: 'sap.test.my3rdsubcomp',
						lazy: true
					}
				]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			sap.ui.component({name: "sap.test.mycomp"});
			done();
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("Manifest from component instance", function(assert) {

		jQuery.sap.registerModulePath("samples.components", "../../../../../../test-resources/sap/ui/core/samples/components/");

		//setup fake server and data
		var oManifest = {
			"sap.app" : {
				"id" : "samples.components.button"
			}
		};

		var oServer = this.sandbox.useFakeServer();
		oServer.useFilters = true;
		oServer.autoRespond = true;
		oServer.xhr.addFilter(function(method, url) {
			return url !== "/anylocation/manifest.json?sap-language=EN";
		});

		oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
			200,
			{
				"Content-Type": "application/json"
			},
			JSON.stringify(oManifest)
		]);

		// start test
		var oCompPromise = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json",
			async: true
		});

		var oDone = assert.async();

		oCompPromise.then(function(oComponent) {
			assert.ok(true, "Promise of Component has been resolved correctly");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
			var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
			assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");
			oDone();
		}, function(oError) {
			assert.ok(false,"Promise of Component hasn't been resolved correctly");
			oDone();
		});
	});

	QUnit.test("waitFor component", function(assert) {
		var done = assert.async();

		var bPromiseResolved = false;

		// resolve the Promise after 1sec
		var p = new Promise(function(fnResolve, fnReject) {
			setTimeout(function() {
				bPromiseResolved = true;
				assert.ok(true, "Promise was resolved."); // just for logging
				fnResolve();
			}, 1000);
		});

		jQuery.sap.registerModulePath("sap.test", "./testdata/async");
		sap.ui.component({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				waitFor: p
			}
		}).then(function(oComponent) {
			assert.ok(bPromiseResolved, "Promise was resolved before Component instantiation.");
			done();
		}, function(oError) {
			assert.ok(false, "Promise of Component hasn't been resolved correctly.");
			done();
		});
	});

	QUnit.test("sap.ui.component: 'asyncHints.preloadOnly' should be ignored", function(assert) {

		jQuery.sap.registerModulePath("sap.test", "./testdata/async");

		return sap.ui.component({
			name: "sap.test.mycomp",
			async: true,
			asyncHints: {
				preloadOnly: true // this should only be passed to "sap.ui.component.load"!
			}
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");
		});
	});


	QUnit.module("Synchronization of Preloads", {
		beforeEach: function(assert) {
			this.oldCfgPreload = oRealCore.oConfiguration.preload;
			this.loadScript = sinon.stub(jQuery.sap, "_loadJSResourceAsync");
			this.requireSpy = sinon.stub(sap.ui, "require").callsArgWith(1);
		},
		afterEach: function(assert) {
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
			this.requireSpy.restore();
			this.loadScript.restore();
		}
	});

	QUnit.test("preload only", function(assert) {

		oRealCore.oConfiguration.preload = 'async'; // sync or async both activate the preload

		function contains(dep) {
			return sinon.match(function(value) {
				return Array.isArray(value) && value.indexOf(dep) >= 0;
			});
		}

		this.loadScript.withArgs("scenario1/comp/Component-preload.js").returns( Promise.resolve(true) );
		this.loadScript.withArgs("scenario1/lib1/library-preload.js").returns( Promise.resolve(true) );
		this.loadScript.withArgs("scenario1/lib2/library-preload.js").returns( Promise.resolve(true) );
		this.requireSpy.withArgs( ["scenario1/comp/Component"] ).callsArgWith(1, Component);

		// first load with preloadOnly: true and check that none of the relvant modules have been required
		return sap.ui.component.load({
			name: "scenario1.comp",
			async: true,
			asyncHints: {
				libs: [ "scenario1.lib1", "scenario1.lib2" ],
				preloadOnly: true
			}
		}).then(function(ComponentClass) {
			assert.ok( this.loadScript.calledThrice, "_loadJSResourceAsync has been called 3 times");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/lib1/library') ), "lib1 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/lib2/library') ), "lib2 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/comp/Component') ), "component never has been required");

			// then load again and check that modules now are required
			return sap.ui.component.load({
				name: "scenario1.comp",
				async: true,
				asyncHints: {
					libs: [ "scenario1.lib1", "scenario1.lib2" ]
				}
			}).then(function() {
				assert.ok( this.requireSpy.calledWith( contains('scenario1/lib1/library') ), "lib1 has been required");
				assert.ok( this.requireSpy.calledWith( contains('scenario1/lib2/library') ), "lib2 has been required");
				assert.ok( this.requireSpy.calledWith( contains('scenario1/comp/Component') ), "component has been required");
			}.bind(this));

		}.bind(this));

	});

	QUnit.test("preload bundles and libs", function(assert) {

		oRealCore.oConfiguration.preload = 'async'; // sync or async both activate the preload

		function contains(dep) {
			return sinon.match(function(value) {
				return Array.isArray(value) && value.indexOf(dep) >= 0;
			});
		}

		var taskChecksDone = assert.async();
		var deferredBundle = new Deferred();
		var deferredLib1 = new Deferred();
		var deferredLib2 = new Deferred();
		this.loadScript.withArgs("scenario2/bundle.js").returns(deferredBundle.promise);
		this.loadScript.withArgs("scenario2/lib1/library-preload.js").returns(deferredLib1.promise);
		this.loadScript.withArgs("scenario2/lib2/library-preload.js").returns(deferredLib2.promise);
		this.loadScript.withArgs("scenario2/comp/Component-preload.js").returns(Promise.resolve(true));
		this.requireSpy.withArgs( ["scenario2/comp/Component"] ).callsArgWith(1, Component);

		var promise = sap.ui.component({
			name: "scenario2.comp",
			async: true,
			asyncHints: {
				preloadBundles: [
					"scenario2/bundle.js"
				],
				libs: [ "scenario2.lib1", "scenario2.lib2" ]
			}
		});

		setTimeout(function() {
			// check after execution of micro tasks that libs have not been required
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/lib1/library') ), "lib1 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/lib2/library') ), "lib2 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/comp/Component') ), "component never has been required");

			deferredLib1.resolve(true);
			deferredLib2.resolve(true);

			setTimeout(function() {
				// check after next execution of micro tasks that libs have not been required
				assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/lib1/library') ), "lib1 has not been required as long as loading the bundle did not resolve");
				assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/lib2/library') ), "lib2 has not been required as long as loading the bundle did not resolve");
				assert.ok( this.requireSpy.neverCalledWith( contains('scenario2/comp/Component') ), "component never has been required");

				deferredBundle.resolve();

				setTimeout(function() {
					// check after next execution of micro tasks that libs have been required
					assert.ok( this.requireSpy.calledWith( contains('scenario2/lib1/library') ), "lib1 has been required");
					assert.ok( this.requireSpy.calledWith( contains('scenario2/lib2/library') ), "lib2 has been required");
					assert.ok( this.requireSpy.calledWith( contains('scenario2/comp/Component') ), "component has been required");

					taskChecksDone();

				}.bind(this), 10);

			}.bind(this), 10);

		}.bind(this), 10);

		return promise;

	});


	QUnit.module("Async (Pre-)Loading (Manifest First)", {
		beforeEach: function() {
			this.oldCfgPreload = oRealCore.oConfiguration.preload;

			// Register test module path
			jQuery.sap.registerModulePath("sap.test", "./testdata/async");

			// Create spies
			this.oLoadLibrariesSpy = sinon.spy(sap.ui.getCore(), "loadLibraries");
			this.oRegisterPreloadedModulesSpy = sinon.spy(jQuery.sap, "registerPreloadedModules");
		},
		afterEach: function() {
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
			unloadResources();

			// Restore spies
			this.oLoadLibrariesSpy.restore();
			this.oRegisterPreloadedModulesSpy.restore();

			// remove registered callbacks
			Component._fnLoadComponentCallback = undefined;
		}
	});

	QUnit.test("dependencies with manifest component", function(assert) {
		oRealCore.oConfiguration.preload = 'async'; // sync or async both activate the preload

		var done = assert.async();

		// start test
		sap.ui.component({
			manifestUrl : "./testdata/async/manifestcomp/manifest.json",
			async: true
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");

			// Verify that all expected libraries have been prelaoded
			// "sap.test.lib3" is declared as "lazy" and shouldn't get preloaded initially
			sinon.assert.calledWithExactly(this.oLoadLibrariesSpy,
			[
				"sap.test.lib2",
				"sap.test.lib4"
			], {
				async: true
			});

			// Verify that all expected components have been preloaded
			sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
				name: "sap/test/manifestcomp/Component-preload"
			});
			sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
				name: "sap/test/mycomp/Component-preload"
			});

			// "lazy" component should not get preloaded automatically
			sinon.assert.neverCalledWithMatch(this.oRegisterPreloadedModulesSpy, {
				name: "sap/test/mysubcomp/Component-preload"
			});

			done();
		}.bind(this), function(oError) {
			assert.ok(false, "Promise of Component hasn't been resolved correctly.");
			done();
		});
	});

	QUnit.test("load component callback", function(assert) {
		var done = assert.async();

		jQuery.getJSON("./testdata/async/manifestcomp/manifest.json", function(oLoadedManifest) {

			var oConfig = {
				manifestUrl : "./testdata/async/manifestcomp/manifest.json",
				async: true,
				asyncHints: {
					libs: ["sap.ui.core"],
					requests: [{ name: "sap.ui.fl.changes", reference: "componentName" }]
				}
			};

			var oStorage = {};

			// check after the component was loaded
			var fnCheckForModification = function (oComponent) {
				var oOriginalManifest = oComponent.getManifest();
				assert.notDeepEqual(oOriginalManifest, this.manifestInCallback.getRawJson(), "the manifest was passed as a copy");
				done();
			};

			// install a manifest load callback hook
			Component._fnLoadComponentCallback = function(oConfig, oManifest, oPassedConfig, oPassedManifest) {
				assert.ok(true, "Component._fnLoadComponentCallback called!");
				assert.deepEqual(oConfig, oPassedConfig, "the config was passed");
				assert.notEqual(oConfig, oPassedConfig, "the passed config is a copy");
				assert.deepEqual(oManifest, oPassedManifest.getRawJson(), "the manifest was passed");
				oPassedManifest.getRawJson().modification = "someModification";
				this.manifestInCallback = oPassedManifest;
			}.bind(oStorage, oConfig, oLoadedManifest);

			// start test
			var oComponentPromise = sap.ui.component(oConfig);

			oComponentPromise.then(fnCheckForModification.bind(oStorage));
		});
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			// Register test module path
			jQuery.sap.registerModulePath("sap.test", "./testdata/async");
		},
		afterEach: function() {
			unloadResources();
		}
	});

	QUnit.test("delegate runAsOwner", function(assert) {
		var done = assert.async();

		var oOwnerComponent = new UIComponent("ownerId");

		// start test
		oOwnerComponent.runAsOwner(function() {
			sap.ui.component({
				manifestUrl : "./testdata/async/manifestcomp/manifest.json",
				async: true
			}).then(function(oComponent) {
				assert.equal(Component.getOwnerIdFor(oComponent), "ownerId", "Owner Component delegated properly.");
				done();
			}, function(oError) {
				assert.ok(false, "Promise of Component hasn't been resolved correctly.");
				done();
			});
		});

	});

});