/*eslint-disable semi-style -- positioning the ';' in a separate line simplifies changes to the expectations */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Deferred",
	"sap/base/util/fetch",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentHooks",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest",
	"sap/ui/core/Supportability",
	"sap/ui/core/UIComponent",
	"sap/ui/core/UIComponentMetadata",
	"sap/ui/core/theming/ThemeManager",
	"sap/ui/VersionInfo"
], function(
	Log,
	Deferred,
	fetch,
	LoaderExtensions,
	Component,
	ComponentHooks,
	Library,
	Manifest,
	Supportability,
	UIComponent,
	UIComponentMetadata,
	ThemeManager,
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

	function nextBrowserTask() {
		return new Promise((resolve) => {
			setTimeout(resolve, 0);
		});
	}

	/**
	 * Helper class that simplifies the creation of mocks and expectations
	 * around component preloading and loading.
	 */
	class Helper {
		constructor(sandbox) {
			this.sandbox = sandbox;
			this.#resetMocks();
			// stub the `fireThemeApplied`` method away as it sporadically requires
			// sap/ui/core/theming/Parameters which hinders the tests' expectations
			this.sandbox.stub(ThemeManager, "fireThemeApplied");
		}
		#resetMocks() {
			this.amdMock =
			this.libraryMock =
			this.loaderExtMock =
			this.privateLoaderAPIMock =
			this.publicLoaderAPIMock =  undefined;
		}
		expectNoPaths() {
			this.publicLoaderAPIMock ??= this.sandbox.mock(sap.ui.loader);
			this.publicLoaderAPIMock.expects("config").never();
			return this;
		}
		expectPaths(modulePrefix, path) {
			this.publicLoaderAPIMock ??= this.sandbox.mock(sap.ui.loader);
			this.publicLoaderAPIMock.expects("config")
				.withArgs({
					paths: {
						[modulePrefix]: path
					}
				});
			return this;
		}
		expectNoLibLoad() {
			this.libraryMock ??= this.sandbox.mock(Library);
			this.libraryMock.expects("_load").never();
			return this;
		}
		expectLibLoad(libs, options, resolution = Promise.resolve({})) {
			this.libraryMock ??= this.sandbox.mock(Library);
			if (options !== undefined) {
				this.libraryMock.expects("_load")
					.withArgs(libs, options)
					.returns(resolution);
			} else {
				this.libraryMock.expects("_load")
					.withArgs(libs)
					.returns(resolution);
			}
			return this;
		}
		expectPreload(preloadResource, resolution = Promise.resolve()) {
			this.privateLoaderAPIMock ??= this.sandbox.mock(privateLoaderAPI);
			this.privateLoaderAPIMock.expects("loadJSResourceAsync")
				.withArgs(preloadResource)
				.returns(resolution);
			return this;
		}
		expectManifestLoad(url, resolution = Promise.resolve()) {
			this.loaderExtMock ??= this.sandbox.mock(LoaderExtensions);
			this.loaderExtMock.expects("loadResource")
				.withArgs(sinon.match({async: true, url: sinon.match(url)}))
				.returns(resolution);
			return this;
		}
		expectCompPreload(comp) {
			const preloadResource = `${comp.replace(/\./g, "/")}/Component-preload.js`;
			this.expectPreload(preloadResource);
			return this;
		}
		expectNoRequire() {
			/* ui5lint-disable-next-line no-globals -- sap.ui.require is an allowed global */
			this.amdMock ??= this.sandbox.mock(sap.ui);
			this.amdMock.expects("require").never();
			return this;
		}
		expectRequire(dependencies, imports) {
			/* ui5lint-disable-next-line no-globals -- sap.ui.require is an allowed global */
			this.amdMock ??= this.sandbox.mock(sap.ui);
			this.amdMock.expects("require")
				.withArgs(dependencies, sinon.match.func)
				.callsArgWith(1, ...imports);
			return this;
		}
		verify() {
			this.amdMock?.verify();
			this.loaderExtMock?.verify();
			this.libraryMock?.verify();
			this.publicLoaderAPIMock?.verify();
			this.privateLoaderAPIMock?.verify();
			this.#resetMocks();
			return this;
		}
	}

	QUnit.module("Async (Pre-)Loading", {
		beforeEach: function() {
			this.stub(Supportability, "isPreloadDisabled").returns(false); // activate the preload
			this.oRegisterResourcePathSpy = this.spy(LoaderExtensions, "registerResourcePath");
			this.helper = new Helper(this);
		},
		afterEach: function() {
		}
	});

	QUnit.test("dependencies as simple strings", async function (assert) {

		this.helper
			.expectNoPaths()
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"], {preloadOnly: true})
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"])
			.expectCompPreload("sap.test.mysubcomp")
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act 1st time
		var oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [ 'sap.test.lib2', 'sap.test.lib3' ],
				components: ['sap.test.mysubcomp']
			}
		});

		//
		assert.ok(oResult instanceof Promise, "load should return a promise");
		await oResult;

		// assert
		this.helper.verify();

		// part 2: create component
		this.helper
			.expectNoPaths()
			.expectNoLibLoad()
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act
		const oComponent = await Component.create({name: "sap.test.mycomp"}).catch((err) => {
			assert.notOk(err, "loading component failed");
		});

		// assert
		this.helper.verify();

		// cleanup
		oComponent.destroy();
	});

	QUnit.test("dependencies with objects names", async function (assert) {

		this.helper
			.expectNoPaths()
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"], {preloadOnly: true})
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"])
			.expectCompPreload("sap.test.mysubcomp")
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act
		const oResult = Component.load({
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

		// assert
		assert.ok(oResult instanceof Promise, "load should return a promise");
		await oResult;

		// assert
		this.helper.verify();

		// scenario 2: create component
		this.helper
			.expectNoPaths()
			.expectNoLibLoad()
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		const oComponent = await Component.create({name: "sap.test.mycomp"}).catch((err) => {
			assert.notOk(err, "loading component failed");
		});

		// assert
		this.helper.verify();

		// cleanup
		oComponent.destroy();
	});

	QUnit.test("dependencies with names and some URLs", async function (assert) {

		this.helper
			.expectPaths("sap/test/lib2", "~url~lib2~")
			.expectPaths("sap/test/mysubcomp", "~url~mysubcomp~")
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"], {preloadOnly: true})
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"])
			.expectCompPreload("sap.test.mysubcomp")
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		var oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [
					{
						name: "sap.test.lib2",
						url: "~url~lib2~"
					},
					'sap.test.lib3'
				],
				components: [ {
					name: "sap.test.mysubcomp",
					url: "~url~mysubcomp~"
				}]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		await oResult;

		// assert
		this.helper.verify();

		// scenario 2: create component
		this.helper
			.expectNoPaths()
			.expectNoLibLoad()
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act
		const oComponent = await Component.create({name: "sap.test.mycomp"}).catch((err) => {
			assert.notOk(err, "loading component failed");
		});

		// assert
		this.helper.verify();

		// cleanup
		oComponent.destroy();
	});

	QUnit.test("dependencies with names, some URLs and lazy dependencies", async function (assert) {

		this.helper
			.expectPaths("sap/test/lib2", "~url~lib2~")
			.expectPaths("sap/test/lib5", "~url~lib5~")
			.expectPaths("sap/test/lib7", "~url~lib7~")
			.expectPaths("sap/test/mysubcomp", "~url~mysubcomp~")
			.expectPaths("sap/test/my2ndsubcomp", "~url~my2ndsubcomp~")
			.expectPaths("sap/test/my4thsubcomp", "~url~my4thsubcomp~")
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"], {preloadOnly: true})
			.expectLibLoad(["sap.test.lib2", "sap.test.lib3"])
			.expectCompPreload("sap.test.mysubcomp")
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act
		const oResult = Component.load({
			name: "sap.test.mycomp",
			asyncHints: {
				libs: [
					{
						name: 'sap.test.lib2',
						url: "~url~lib2~",
						lazy: false
					},
					{
						name: 'sap.test.lib5',
						url: "~url~lib5~",
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
							url: "~url~lib7~",
							'final': true
						}
					},
					'sap.test.lib3'
				],
				components: [
					{
						name: 'sap.test.mysubcomp',
						url: "~url~mysubcomp~"
					},
					{
						name: 'sap.test.my2ndsubcomp',
						url: "~url~my2ndsubcomp~",
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
							url: "~url~my4thsubcomp~",
							'final': true
						}
					}
				]
			}
		});

		assert.ok(oResult instanceof Promise, "load should return a promise");
		await oResult;

		// assert
		this.helper.verify();

		// All "url"s should be registered via LoaderExtensions.registerResourcePath
		sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib7", {
			url: "~url~lib7~",
			"final": true
		});
		sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/my4thsubcomp", {
			url: "~url~my4thsubcomp~",
			"final": true
		});

		// scenario 2: create component
		this.helper
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		// act
		const oComponent = await Component.create({name: "sap.test.mycomp"}).catch((err) => {
			assert.notOk(err, "loading component failed");
		});

		// assert
		this.helper.verify();

		// cleanup
		oComponent.destroy();
	});

	QUnit.test("waitFor component", async function(assert) {
		let bPromiseResolved = false;

		// resolve the Promise after 1sec
		const p = new Promise((fnResolve) => {
			setTimeout(() => {
				bPromiseResolved = true;
				assert.ok(true, "Promise was resolved."); // just for logging
				fnResolve();
			}, 1000);
		});

		this.helper
			.expectNoPaths()
			.expectNoLibLoad()
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		const oComponent = await Component.create({
			name: "sap.test.mycomp",
			asyncHints: {
				waitFor: p
			}
		}).catch((err) => {
			assert.notOk(err, "Promise of Component hasn't been resolved correctly.");
		});

		this.helper.verify();
		assert.ok(bPromiseResolved, "Promise was resolved before Component instantiation.");
		oComponent.destroy();
	});

	QUnit.test("Component.create: 'asyncHints.preloadOnly' should be ignored", async function(assert) {

		this.helper
			.expectCompPreload("sap.test.mycomp")
			.expectRequire(["sap/test/mycomp/Component"], [Component])
			;

		const oComponent = await Component.create({
			name: "sap.test.mycomp",
			asyncHints: {
				preloadOnly: true // this should be ignored by Component.create
			}
		});

		this.helper.verify();
		oComponent.destroy();
	});

	QUnit.test("Manifest from component instance", async function(assert) {

		//setup fake server and data
		const oManifest = await LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("testdata/instanceManifest/manifest.json"),
			async: true
		});

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
		const oComponent = await Component.create({
			manifest: "/anylocation/manifest.json"
		}).catch((err) => {
			assert.notOk(err, "Promise of Component hasn't been resolved correctly");
		});

		assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(oComponent.getManifest(), "Manifest is available");
		assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
		var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
		assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

		oComponent.destroy();
	});



	QUnit.module("Synchronization of Preloads", {
		beforeEach: function(assert) {
			this.stub(Supportability, "isPreloadDisabled").returns(false); // activate the preload
			this.helper = new Helper(this);
			this.getManifestStub = sinon.stub(Library.prototype, "loadManifest").callsFake(function() {
				this.oManifest = {
					"sap.ui5": {
						library: {
							css: false
						}
					}
				};
				this._loadingStatus.manifest = Promise.resolve(this.oManifest);
				return this._loadingStatus.manifest;
			});
		},
		afterEach: function(assert) {
			this.getManifestStub.restore();
		}
	});

	QUnit.test("preload only", async function(assert) {

		this.helper
			.expectLibLoad(["scenario1.lib1", "scenario1.lib2"])
			.expectCompPreload("scenario1.comp")
			.expectNoRequire()
			;

		// first load with `preloadOnly: true` and check that none of the relevant modules have been required
		await Component.load({
			name: "scenario1.comp",
			asyncHints: {
				libs: [ "scenario1.lib1", "scenario1.lib2" ],
				preloadOnly: true
			}
		});

		this.helper.verify();

		// then load again w/o `preloadOnly` and check that modules now are required
		this.helper
			.expectRequire(["scenario1/lib1/library", "scenario1/lib2/library"], [{}, {}])
			.expectRequire(["scenario1/comp/Component"], [Component])
			;

		await Component.load({
			name: "scenario1.comp",
			asyncHints: {
				libs: [ "scenario1.lib1", "scenario1.lib2" ]
			}
		});

		this.helper.verify();
	});

	QUnit.test("preload bundles and libs", async function(assert) {

		const deferredBundle = new Deferred();
		const deferredManifest = new Deferred();
		const deferredLib1 = new Deferred();
		const deferredLib2 = new Deferred();

		this.helper
			.expectPreload("scenario2/bundle.js", deferredBundle.promise)
			.expectLibLoad(["scenario2.lib1", "scenario2.lib2"], undefined, [deferredLib1.promise, deferredLib2.promise])
			.expectManifestLoad(sap.ui.require.toUrl("scenario2/comp/manifest.json"), deferredManifest.promise)
			.expectNoRequire()
			;

		var promise = Component.create({
			name: "scenario2.comp",
			asyncHints: {
				preloadBundles: [
					"scenario2/bundle.js"
				],
				libs: [ "scenario2.lib1", "scenario2.lib2" ]
			}
		});

		// check after execution of micro tasks that libs have not been required
		await nextBrowserTask();
		this.helper.verify();


		this.helper
			.expectNoRequire()
			.expectCompPreload("scenario2.comp")
			;

		deferredManifest.resolve();

		//
		await nextBrowserTask();
		this.helper.verify();


		this.helper
			.expectNoRequire()
			;

		deferredLib1.resolve(true);
		deferredLib2.resolve(true);

		await nextBrowserTask();

		// check after next execution of micro tasks that libs still have not been required
		this.helper.verify();

		this.helper
			.expectRequire(["scenario2/lib1/library", "scenario2/lib2/library"], [{}, {}])
			.expectRequire(["scenario2/comp/Component"], [Component])
			//.expectRequire(["sap/ui/core/Component"], [Component])
			;

		deferredBundle.resolve();


		const oComponent = await promise;

		this.helper.verify();

		oComponent.destroy();
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
			// Restore spies
			this.oLogWarningSpy.restore();
			this.oLoadLibrarySpy.restore();
			this.oManifestLoad.restore();

			// remove registered callbacks
			ComponentHooks.onComponentLoaded.deregister();
		}
	});

	QUnit.test("dependencies with manifest component", function(assert) {
		this.oPreloadDisabledStub = sinon.stub(Supportability, "isPreloadDisabled").returns(false); // activate the preload

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
			this.oPreloadDisabledStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("dependencies with component (no manifest first)", function(assert) {
		this.oPreloadDisabledStub = sinon.stub(Supportability, "isPreloadDisabled").returns(false); // activate the preload

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
			this.oPreloadDisabledStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Hook 'onComponentLoaded'", function(assert) {

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
			ComponentHooks.onComponentLoaded.register(function(oPassedConfig, oPassedManifest) {

				// ignore any call to the hook other than the one for the component under test
				// (hook is also called when loading a component dependency)
				if (oPassedConfig.manifest !== MANIFEST_URL) {
					return;
				}

				assert.ok(true, "sap.ui.core.Component: 'onComponentLoaded' hook called!");
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
			});

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

	QUnit.test("Hook 'onPreprocessManifest' and 'onModelCreated'", function(assert) {
		assert.expect(8);
		const oPreprocessManifestExecutedSpy = sinon.spy(ComponentHooks.onPreprocessManifest, "execute");
		const oModelCreatedExecutedSpy = sinon.spy(ComponentHooks.onModelCreated, "execute");

		assert.notOk(Library._get("sap.ui.fl"), "sap.ui.fl library must not be loaded at the begining of this test.");
		assert.notOk(ComponentHooks.onPreprocessManifest.isRegistered(), "No hook for 'preprocessManifest' is registered yet.");
		assert.notOk(ComponentHooks.onModelCreated.isRegistered(), "No hook for 'modelCreated' is registered yet.");

		return Component.create({
			manifest: "test-resources/sap/ui/core/qunit/component/testdata/async/mysimplecomp/manifest.json",
			asyncHints: {
				libs: ['sap.ui.fl']
			}
		}).then(() => {
			assert.ok(Library._get("sap.ui.fl"), "sap.ui.fl library should be loaded at the end of this test.");
			assert.ok(ComponentHooks.onPreprocessManifest.isRegistered(), "Hook for 'preprocessManifest' is registered.");
			assert.ok(ComponentHooks.onModelCreated.isRegistered(), "Hook for 'modelCreated' is registered.");
			assert.strictEqual(oPreprocessManifestExecutedSpy.getCalls().length, 1, "'preprocessManifest' hook was executed exactly once");
			assert.strictEqual(oModelCreatedExecutedSpy.getCalls().length, 1, "'modelCreated' hook was executed exactly once");
			oPreprocessManifestExecutedSpy.restore();
			oModelCreatedExecutedSpy.restore();
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
				sinon.FakeXMLHttpRequest.useFilters = true;
                sinon.FakeXMLHttpRequest.addFilter(function (_sMethod, sUrl) {
                    // If the filter returns true, the request will NOT be faked.
                    // We only want to fake requests that go to the intended service.
                    return !sUrl.includes("sap-ui-version.json");
                });
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
		this.oPreloadDisabledStub = sinon.stub(Supportability, "isPreloadDisabled").returns(false); // activate the preload

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
		}.bind(this)).finally(function () {
			this.oPreloadDisabledStub.restore();
		}.bind(this));
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			// Register test module path
			sap.ui.loader.config({paths:{"sap/test":"test-resources/sap/ui/core/qunit/component/testdata/async"}});

			this.oLogSpy = this.spy(Log, "warning");
		},
		afterEach: function() {
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

	// Note: the tests in this QUnit.module only work in the source code order
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
		}
	});

	QUnit.test("[library IS NOT loaded]: NO 'Component-preload.js' is loaded, AND warning is logged", async function(assert) {
		this.spy(privateLoaderAPI, 'loadJSResourceAsync');

		assert.notOk(Library.isLoaded("testlibs.scenario16.embeddingLib.embeddedComponent"), "[precondition] library is not loaded yet");

		// act
		const oComponent = await Component.create({
			name: "testlibs.scenario16.embeddingLib.embeddedComponent"
		});

		// assert
		sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));
		assert.ok(this.oLogSpy.calledWith(
			"Component 'testlibs.scenario16.embeddingLib.embeddedComponent' is defined to be embedded in a library or another component" +
			"The relatively given preload for the embedding resource was not loaded before hand. Please make sure to load the embedding resource containing this Component before instantiating.",
			undefined,
			"sap.ui.core.Component#embeddedBy"
		), "Warning log was issued");

		// cleanup
		oComponent.destroy();
	});

	QUnit.test("[library IS loaded]: NO 'Component-preload.js' is loaded, NO warning is logged", async function(assert) {
		this.spy(privateLoaderAPI, 'loadJSResourceAsync');

		// act
		await Library.load("testlibs.scenario16.embeddingLib");
		const oComponent = await Component.create({
			name: "testlibs.scenario16.embeddingLib.embeddedComponent"
		});

		// assert
		sinon.assert.neverCalledWith(privateLoaderAPI.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));

		assert.ok(this.oLogSpy.neverCalledWith(
			"Component 'testlibs.scenario16.embeddingLib.embeddedComponent' is defined to be embedded in a library or another component" +
			"The relatively given preload for the embedding resource was not loaded before hand. Please make sure to load the embedding resource containing this Component before instantiating.",
			undefined,
			"sap.ui.core.Component#embeddedBy"
		), "Warning log was NOT issued");

		// cleanup
		oComponent.destroy();
	});
});
