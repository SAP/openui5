sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Deferred",
	"sap/base/util/fetch",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/ui/core/UIComponentMetadata",
	"sap/ui/VersionInfo"
], function(
	Log,
	Deferred,
	fetch,
	LoaderExtensions,
	Component,
	Library,
	Manifest,
	UIComponent,
	UIComponentMetadata,
	VersionInfo
) {

	"use strict";
	/*global sinon, QUnit*/

	var privateLoaderAPI = sap.ui.loader._;

	/**
	 * Checks whether the given (JavaScript) resource has been loaded
	 * and executed.
	 */
	function hasBeenLoadedAndExecuted(sResourceName) {
		return privateLoaderAPI.getModuleState(sResourceName) === 4 /* READY */;
	}

	function unloadResources() {
		// unload libs and components (not an API)
		privateLoaderAPI.unloadResources('sap.test.lib2.library-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/lib2/library-preload.js', false, true, true);
		privateLoaderAPI.unloadResources('sap.test.lib3.library-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/lib3/library-preload.js', false, true, true);
		privateLoaderAPI.unloadResources('sap.test.lib4.library-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/lib4/library-preload.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/mycomp/Component.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/mycomp/Component-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/mycomp/Component-preload.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/mysubcomp/Component.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/mysubcomp/Component-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/mysubcomp/Component-preload.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/manifestcomp/Component.js', false, true, true);
		privateLoaderAPI.unloadResources('sap/test/manifestcomp/Component-preload', true, true, true);
		privateLoaderAPI.unloadResources('sap/test/manifestcomp/Component-preload.js', false, true, true);
		// undo module path registration (official API)
		sap.ui.loader.config({
			paths: {
				"sap/test": null,
				"sap/test/lib2": null,
				"sap/test/lib3": null,
				"sap/test/lib4": null,
				"sap/test/lib5": null,
				"sap/test/mycomp": null,
				"sap/test/mysubcomp": null,
				"sap/test/my2ndsubcomp": null,
				"sap/test/manifestcomp": null
			}
		});
		// remove script tags for Component-preload.js modules (not an API)
		document.querySelectorAll("SCRIPT[data-sap-ui-module^='sap/test/']").forEach(function(elem) {
			elem.remove();
		});
	}



	QUnit.module("Async (Pre-)Loading", {
		beforeEach: function() {
			this.oRegisterResourcePathSpy = sinon.spy(LoaderExtensions, "registerResourcePath");
		},
		afterEach: function() {
			this.oRegisterResourcePathSpy.restore();
			unloadResources();
		}
	});

	QUnit.test("dependencies as simple strings", function (assert) {

		var done = assert.async();

		sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});
		var oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [ 'sap.test.lib2', 'sap.test.lib3' ],
				components: ['sap.test.mysubcomp']
			}
		});
		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			Component.create({name: "sap.test.mycomp"}).then(function () {
				done();
			});
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with objects names", function (assert) {

		var done = assert.async();

		sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});
		var oResult = Component.load({
			name: "sap.test.mycomp",
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
			Component.create({name: "sap.test.mycomp"}).then(function () {
				done();
			});
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with names and some URLs", function (assert) {

		var done = assert.async();

		// register URls for those entities that are not listed in the hints below
		sap.ui.loader.config({paths:{"sap/test/lib3":"test-resources/sap/ui/core/qunit/component/testdata/async/lib3"}});
		sap.ui.loader.config({paths:{"sap/test/lib4":"test-resources/sap/ui/core/qunit/component/testdata/async/lib4"}});
		sap.ui.loader.config({paths:{"sap/test/mycomp":"test-resources/sap/ui/core/qunit/component/testdata/async/mycomp"}});

		var oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2',
						url: 'test-resources/sap/ui/core/qunit/component/testdata/components/async/lib2'
					},
					'sap.test.lib3'
				],
				components: [ {
					name: 'sap.test.mysubcomp',
					url: 'test-resources/sap/ui/core/qunit/component/testdata/components/async/mysubcomp'
				}]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {
			Component.create({name: "sap.test.mycomp"}).then(function () {
				done();
			});
		}, function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("dependencies with names, some URLs and lazy dependencies", function (assert) {

		var done = assert.async();

		// register URls for those entities that are not listed in the hints below
		sap.ui.loader.config({paths:{"sap/test/lib3":"test-resources/sap/ui/core/qunit/component/testdata/async/lib3"}});
		sap.ui.loader.config({paths:{"sap/test/lib4":"test-resources/sap/ui/core/qunit/component/testdata/async/lib4"}});
		sap.ui.loader.config({paths:{"sap/test/mycomp":"test-resources/sap/ui/core/qunit/component/testdata/async/mycomp"}});

		var oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2',
						url: 'test-resources/sap/ui/core/qunit/component/testdata/async/lib2',
						lazy: false
					},
					{
						name: 'sap.test.lib5',
						url: 'test-resources/sap/ui/core/qunit/component/testdata/async/lib5',
						lazy: true
					},
					{
						name: 'sap.test.lib6',
						lazy: true
					},
					{
						name: 'sap.test.lib7',
						lazy: true,
						url: {
							url: 'test-resources/sap/ui/core/qunit/component/testdata/async/lib7',
							'final': true
						}
					},
					'sap.test.lib3'
				],
				components: [
					{
						name: 'sap.test.mysubcomp',
						url: 'test-resources/sap/ui/core/qunit/component/testdata/async/mysubcomp'
					},
					{
						name: 'sap.test.my2ndsubcomp',
						url: 'test-resources/sap/ui/core/qunit/component/testdata/async/my2ndsubcomp',
						lazy: true
					},
					{
						name: 'sap.test.my3rdsubcomp',
						lazy: true
					},
					{
						name: 'sap.test.my4thsubcomp',
						lazy: true,
						url: {
							url: 'test-resources/sap/ui/core/qunit/component/testdata/async/my4thsubcomp',
							'final': true
						}
					}
				]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		oResult.then(function() {

			// All "url"s should be registered via LoaderExtensions.registerResourcePath
			sinon.assert.callCount(this.oRegisterResourcePathSpy, 6);

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib2",
				"test-resources/sap/ui/core/qunit/component/testdata/async/lib2");

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib5",
				"test-resources/sap/ui/core/qunit/component/testdata/async/lib5");

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib7", {
				url: "test-resources/sap/ui/core/qunit/component/testdata/async/lib7",
				"final": true
			});

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/mysubcomp",
				"test-resources/sap/ui/core/qunit/component/testdata/async/mysubcomp");

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/my2ndsubcomp",
				"test-resources/sap/ui/core/qunit/component/testdata/async/my2ndsubcomp");

			sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/my4thsubcomp", {
				url: "test-resources/sap/ui/core/qunit/component/testdata/async/my4thsubcomp",
				"final": true
			});

			Component.create({name: "sap.test.mycomp"}).then(function () {
				done();
			});
		}.bind(this), function() {
			assert.ok(false, "loading component failed");
			done();
		});

		// TODO spy on requireModule, check that expected modules have been loaded
	});

	QUnit.test("Manifest from component instance", function(assert) {

		//setup fake server and data
		var oManifest = {
			"sap.app" : {
				"id" : "samples.components.button"
			}
		};

		var oServer = this._oSandbox.useFakeServer();
		oServer.autoRespond = true;
		oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
			200,
			{
				"Content-Type": "application/json"
			},
			JSON.stringify(oManifest)
		]);

		// start test
		var oCompPromise = Component.create({
			manifest: "/anylocation/manifest.json"
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

		sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});
		Component.create({
			name: "sap.test.mycomp",
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

	QUnit.test("Component.create: 'asyncHints.preloadOnly' should be ignored", function(assert) {

		sap.ui.loader.config({paths:{"sap/test01":"test-resources/sap/ui/core/qunit/component/testdata/async"}});

		return Component.create({
			name: "sap.test01.mycomp",
			asyncHints: {
				preloadOnly: true // this should only be passed to "Component.load"!
			}
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");
		});
	});

	/**
	 * @deprecated Since 1.56
	 */
	QUnit.test("sap.ui.component: 'asyncHints.preloadOnly' should be ignored", function(assert) {

		sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});

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
			this.loadScript = sinon.stub(privateLoaderAPI, "loadJSResourceAsync");
			this.requireSpy = sinon.stub(sap.ui, "require").callsArgWith(1);
		},
		afterEach: function(assert) {
			this.requireSpy.restore();
			this.loadScript.restore();
		}
	});

	QUnit.test("preload only", function(assert) {

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("async"); // sync or async both activate the preload

		function contains(dep) {
			return sinon.match(function(value) {
				return Array.isArray(value) && value.indexOf(dep) >= 0;
			});
		}

		this.loadScript.withArgs("scenario1/comp/Component-preload.js").returns( Promise.resolve(true) );
		this.loadScript.withArgs("scenario1/lib1/library-preload.js").returns( Promise.resolve(true) );
		this.loadScript.withArgs("scenario1/lib2/library-preload.js").returns( Promise.resolve(true) );
		this.requireSpy.withArgs( ["scenario1/comp/Component"] ).callsArgWith(1, Component);

		// first load with preloadOnly: true and check that none of the relevant modules have been required
		return Component.load({
			name: "scenario1.comp",
			asyncHints: {
				libs: [ "scenario1.lib1", "scenario1.lib2" ],
				preloadOnly: true
			}
		}).then(function(ComponentClass) {
			assert.ok( this.loadScript.calledThrice, "loadJSResourceAsync has been called 3 times");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/lib1/library') ), "lib1 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/lib2/library') ), "lib2 never has been required");
			assert.ok( this.requireSpy.neverCalledWith( contains('scenario1/comp/Component') ), "component never has been required");

			// then load again and check that modules now are required
			return Component.load({
				name: "scenario1.comp",
				asyncHints: {
					libs: [ "scenario1.lib1", "scenario1.lib2" ]
				}
			}).then(function() {
				assert.ok( this.requireSpy.calledWith( contains('scenario1/lib1/library') ), "lib1 has been required");
				assert.ok( this.requireSpy.calledWith( contains('scenario1/lib2/library') ), "lib2 has been required");
				assert.ok( this.requireSpy.calledWith( contains('scenario1/comp/Component') ), "component has been required");
			}.bind(this));

		}.bind(this)).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});

	QUnit.test("preload bundles and libs", function(assert) {

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("async"); // sync or async both activate the preload

		function contains(dep) {
			return sinon.match(function(value) {
				return Array.isArray(value) && value.indexOf(dep) >= 0;
			});
		}

		var deferredBundle = new Deferred();
		var deferredLib1 = new Deferred();
		var deferredLib2 = new Deferred();
		this.loadScript.withArgs("scenario2/bundle.js").returns(deferredBundle.promise);
		this.loadScript.withArgs("scenario2/lib1/library-preload.js").returns(deferredLib1.promise);
		this.loadScript.withArgs("scenario2/lib2/library-preload.js").returns(deferredLib2.promise);
		this.loadScript.withArgs("scenario2/comp/Component-preload.js").returns(Promise.resolve(true));
		this.requireSpy.withArgs( ["scenario2/comp/Component"] ).callsArgWith(1, Component);

		var promise = Component.create({
			name: "scenario2.comp",
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

			}.bind(this), 10);

		}.bind(this), 10);

		return promise.then(function () {
			// check after next execution of micro tasks that libs have been required
			assert.ok( this.requireSpy.calledWith( contains('scenario2/lib1/library') ), "lib1 has been required");
			assert.ok( this.requireSpy.calledWith( contains('scenario2/lib2/library') ), "lib2 has been required");
			assert.ok( this.requireSpy.calledWith( contains('scenario2/comp/Component') ), "component has been required");
		}.bind(this)).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});


	QUnit.module("Async (Pre-)Loading (Manifest First)", {
		beforeEach: function() {

			// Register test module path
			sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});

			// Create spies
			this.oLogWarningSpy = sinon.spy(Log, "warning");
			this.oLoadLibrarySpy = sinon.spy(Library, "_load");
			this.oManifestLoad = sinon.spy(Manifest, "load");
		},
		afterEach: function() {
			unloadResources();

			// Restore spies
			this.oLogWarningSpy.restore();
			this.oLoadLibrarySpy.restore();
			this.oManifestLoad.restore();

			// remove registered callbacks
			Component._fnLoadComponentCallback = undefined;
		}
	});

	QUnit.test("dependencies with manifest component", function(assert) {
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("async"); // sync or async both activate the preload

		var done = assert.async();

		// start test
		Component.create({
			manifest: "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json"
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");

			// As manifest first is used, one manifest.json should have been loaded
			sinon.assert.calledOnce(this.oManifestLoad);

			// Verify that all expected libraries have been prelaoded
			// "sap.test.lib3" is declared as "lazy" and shouldn't get preloaded initially
			sinon.assert.calledWithExactly(this.oLoadLibrarySpy,
			[
				"sap.test.lib2",
				"sap.test.lib4"
			], {
				sync: false
			});

			// Verify that all expected components have been preloaded
			assert.ok(hasBeenLoadedAndExecuted("sap/test/manifestcomp/Component-preload.js"));

			assert.ok(hasBeenLoadedAndExecuted("sap/test/mycomp/Component-preload.js"));

			// "lazy" component should not have been preloaded automatically
			assert.notOk(hasBeenLoadedAndExecuted("sap/test/mysubcomp/Component-preload.js"));

			// Make sure that the component dependencies are available after creating the instance
			assert.ok(sap.ui.require("sap/test/mycomp/Component"), "mycomp Component class should be loaded");
			assert.ok(!sap.ui.require("sap/test/mysubcomp/Component"), "mysubcomp Component class should not be loaded");

			// No deprecation warnings should be logged
			sinon.assert.neverCalledWithMatch(this.oLogWarningSpy, "Do not use deprecated function 'sap.ui.component.load'");

		}.bind(this), function(oError) {
			assert.ok(false, "Promise of Component hasn't been resolved correctly.");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("dependencies with component (no manifest first)", function(assert) {
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("async"); // sync or async both activate the preload

		var done = assert.async();

		// start test
		Component.create({
			name: "sap.test.manifestcomp",
			manifest: false
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component has been created.");

			// Verify that all expected libraries have been preloaded
			// "sap.test.lib3" is declared as "lazy" and shouldn't get preloaded initially
			sinon.assert.calledWithExactly(this.oLoadLibrarySpy, "sap.test.lib2", { sync: false });
			sinon.assert.calledWithExactly(this.oLoadLibrarySpy, "sap.test.lib4", { sync: false });

			// Verify that all expected components have been preloaded
			assert.ok(hasBeenLoadedAndExecuted("sap/test/manifestcomp/Component-preload.js"));
			assert.ok(hasBeenLoadedAndExecuted("sap/test/mycomp/Component-preload.js"));

			// "lazy" component should not get preloaded automatically
			assert.notOk(hasBeenLoadedAndExecuted("sap/test/mysubcomp/Component-preload.js"));

			// Make sure that the component dependencies are available after creating the instance
			assert.ok(sap.ui.require("sap/test/mycomp/Component"), "mycomp Component class should be loaded");
			assert.ok(!sap.ui.require("sap/test/mysubcomp/Component"), "mysubcomp Component class should not be loaded");

			// As manifest first is not used, no manifest.json should have been loaded
			sinon.assert.notCalled(this.oManifestLoad);

		}.bind(this), function(oError) {
			assert.ok(false, "Promise of Component hasn't been resolved correctly.");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Hook _fnLoadComponentCallback", function(assert) {

		assert.expect(9); // ensure a complete test execution

		var MANIFEST_URL = "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json";

		return fetch(MANIFEST_URL, {
			headers: {
				"Content-Type": fetch.ContentTypes.JSON
			}
		}).then(function(oResponse) {
			return oResponse.json();
		}).then(function(oOriginalManifest) {

			var oConfig = {
				manifest: MANIFEST_URL,
				async: true,
				asyncHints: {
					libs: ["sap.ui.core"],
					requests: [{ name: "sap.ui.fl.changes", reference: "componentName" }]
				}
			};

			var manifestInCallback;

			// install a manifest load callback hook
			Component._fnLoadComponentCallback = function(oPassedConfig, oPassedManifest) {

				// ignore any call to the hook other than the one for the component under test
				// (hook is also called when loading a component dependency)
				if (oPassedConfig.manifest !== MANIFEST_URL) {
					return;
				}

				assert.ok(true, "Component._fnLoadComponentCallback called!");
				assert.deepEqual(oConfig, oPassedConfig, "a config was passed");
				assert.notStrictEqual(oConfig, oPassedConfig, "the passed config is a copy");
				assert.deepEqual(oOriginalManifest, oPassedManifest.getRawJson(),
					"the passed raw manifest should have the same content as the original manifest");
				assert.deepEqual(oOriginalManifest, oPassedManifest.getJson(),
					"the passed manifest should have the same content as the original manifest");

				oPassedManifest.getJson().modification = "someModification";
				assert.notDeepEqual(oOriginalManifest, oPassedManifest.getJson(),
					"the passed manifest should no longer have the same content as the original manifest");
				manifestInCallback = oPassedManifest;

				return Promise.resolve();
			};

			// start test
			return Component.create(oConfig).then(function(oComponent) {
				// check after the component was loaded
				var oFinalManifest = oComponent.getManifest();
				assert.strictEqual(oFinalManifest, manifestInCallback.getJson(),
					"the created component instance should use the modified manifest");
				assert.equal(oFinalManifest.modification, "someModification",
					"the used manifest should contain the modification");
				assert.deepEqual(oOriginalManifest, manifestInCallback.getRawJson(),
					"the raw manifest of the component instance should be the original manifest");
			});
		});
	});

	QUnit.module("Consume Transitive dependency information", {
		beforeEach: function() {
			sap.ui.loader.config({
				paths: {
					"testlibs": "test-resources/sap/ui/core/qunit/testdata/libraries"
				}
			});

			// Clear cached version info data before each test starts
			VersionInfo._reset();

			return LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("testlibs/scenario15/sap-ui-version.json"),
				async: true
			}).then(function(oVersionInfo) {
				this.oServer = this._oSandbox.useFakeServer();
				this.oServer.autoRespond = true;
				this.oServer.respondWith("GET", sap.ui.require.toUrl("sap-ui-version.json"), [
					200,
					{
						"Content-Type": "application/json"
					},
					JSON.stringify(oVersionInfo)
				]);
			}.bind(this));
		},
		afterEach: function() {
			sap.ui.loader.config({
				paths:{
					"testlibs": null
				}
			});
		}
	});

	/**
	 * Library Preload Scenario 15
	 */
	QUnit.test("Load library-preload.js instead of Component-preload.js when the Component.js is included in a library preload", function(assert) {
		return VersionInfo.load().then(function() {
			this.spy(sap.ui, 'require');
			this.spy(privateLoaderAPI, 'loadJSResourceAsync');

			var loadLibrariesSpy = this.spy(Library, '_load');

			this.spy(LoaderExtensions, 'loadResource');

			var pLoad =  Component.load({
				name: "testlibs.scenario15.lib1.comp"
			});

			assert.equal(LoaderExtensions.loadResource.callCount, 1, "The loadResource call is called once");

			var sURL = LoaderExtensions.loadResource.getCall(0).args[0].url;
			assert.ok(/\/scenario15\/lib1\/comp\/manifest\.json/.test(sURL), "The manifest.json load request is sent");

			return pLoad.then(function() {
				// the component should be required
				sinon.assert.calledWith(sap.ui.require, ["testlibs/scenario15/lib1/comp/Component"]);

				// no component preload should be triggered since the component is contained in lib1
				sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));

				// load of trans. dependencies should be triggered
				var loadedLibraries = loadLibrariesSpy.getCall(0).args[0];
				assert.deepEqual(loadedLibraries, [
					"testlibs.scenario15.lib1",
					"testlibs.scenario15.lib3",
					"testlibs.scenario15.lib4",
					"testlibs.scenario15.lib6",
					"testlibs.scenario15.lib8",
					"testlibs.scenario15.lib9"
				]);

				// lib10 is loaded with a separate request and not part of the initial loadLibraries call
				sinon.assert.calledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/scenario15\/lib10\/library-preload\.js$/));

				// lib5 is not requested --> lazy: true
				sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/scenario15\/lib5\/library-preload\.js$/));
			});
		}.bind(this));
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			// Register test module path
			sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});

			this.oLogSpy = this.spy(Log, "warning");
		},
		afterEach: function() {
			unloadResources();

			this.oLogSpy.restore();
		}
	});

	QUnit.test("delegate runAsOwner", function(assert) {
		var done = assert.async();

		var oOwnerComponent = new UIComponent("ownerId");

		// start test
		oOwnerComponent.runAsOwner(function() {
			Component.create({
				manifest: "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json"
			}).then(function(oComponent) {
				assert.equal(Component.getOwnerIdFor(oComponent), "ownerId", "Owner Component delegated properly.");
				done();
			}, function(oError) {
				assert.ok(false, "Promise of Component hasn't been resolved correctly.");
				done();
			});
		});

	});

	QUnit.module("embeddedBy", {
		beforeEach: function() {
			this.oLogSpy = this.spy(Log, "warning");

			sap.ui.loader.config({
				paths: {
					"testlibs": "test-resources/sap/ui/core/qunit/testdata/libraries"
				}
			});
		},
		afterEach: function() {
			this.oLogSpy.restore();

			privateLoaderAPI.unloadResources('testlibs/scenario16/embeddingLib/library-preload.js', true, true, true);
		}
	});

	QUnit.test("[library IS NOT loaded]: NO 'Component-preload.js' is loaded, AND warning is logged", function(assert) {
		this.spy(privateLoaderAPI, 'loadJSResourceAsync');

		return Component.create({
			name: "testlibs.scenario16.embeddingLib.embeddedComponent"
		}).then(function(oComponent) {
			sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));

			assert.ok(this.oLogSpy.calledWith(
				"Component 'testlibs.scenario16.embeddingLib.embeddedComponent' is defined to be embedded in a library or another component" +
				"The relatively given preload for the embedding resource was not loaded before hand. Please make sure to load the embedding resource containing this Component before instantiating.",
				undefined,
				"sap.ui.core.Component#embeddedBy"
			), "Warning log was issued");
		}.bind(this));
	});

	QUnit.test("[library IS loaded]: NO 'Component-preload.js' is loaded, NO warning is logged", function(assert) {
		this.spy(privateLoaderAPI, 'loadJSResourceAsync');

		return Library.load("testlibs.scenario16.embeddingLib").then(function() {
			return Component.create({
				name: "testlibs.scenario16.embeddingLib.embeddedComponent"
			}).then(function(oComponent) {
				sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));

				assert.ok(this.oLogSpy.neverCalledWith(
					"Component 'testlibs.scenario16.embeddingLib.embeddedComponent' is defined to be embedded in a library or another component" +
					"The relatively given preload for the embedding resource was not loaded before hand. Please make sure to load the embedding resource containing this Component before instantiating.",
					undefined,
					"sap.ui.core.Component#embeddedBy"
				), "Warning log was NOT issued");
			}.bind(this));
		}.bind(this));

	});

});
