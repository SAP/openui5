 /*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/base/OwnStatics",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeManager",
	"sap/ui/test/utils/waitForThemeApplied"
], function(
	Localization,
	OwnStatics,
	Library,
	Theming,
	ThemeManager,
	themeApplied
) {
	"use strict";

	const { includeLibraryTheme, attachChange } = OwnStatics.get(Theming);
	const { getAllLibraryInfoObjects } = OwnStatics.get(ThemeManager);
	const mAllRequiredLibCss = new Set();

	attachChange((oEvent) => {
		if (oEvent.library) {
			mAllRequiredLibCss.add(oEvent.library.libName);
		}
	});

	function getSheetHref(oLink) {
		if (oLink.sheet) {
			return oLink.sheet.href;
		} else if (oLink.styleSheet) {
			return oLink.styleSheet.href;
		}
		return undefined;
	}

	const sCoreVersion = Library.all()["sap.ui.core"].version;

	function testApplyTheme(assert, sTheme) {
		const allLibInfoObjects = getAllLibraryInfoObjects();
		const observer = new MutationObserver((mutations) => {
			// still an array even if we filter only for one attribute (see "attributeFilter" in the observer options);
			for (const mu of mutations) {
				if (mu.type === "attributes" && mu.attributeName === "id") {
					assert.strictEqual(mu.target.getAttribute("id"), null, `The ID '${mu.oldValue}' has been removed from the link element.`);
					assert.strictEqual(mu.target.getAttribute("data-sap-ui-foucmarker"), mu.oldValue, `The previous ID '${mu.oldValue}' has been added as attribute 'data-sap-ui-foucmarker' to the link element.`);
					const newLinkElement = document.getElementById(mu.oldValue);
					assert.ok(newLinkElement && newLinkElement !== mu.target, `New element with ID '${mu.oldValue}' has been added to the DOM.`);
				}
			}
		});
		allLibInfoObjects.forEach((oLibInfo) => {
			observer.observe(oLibInfo.cssLinkElement, { attributes: true, attributeOldValue: true, attributeFilter: ["id"] });
		});

		if (sTheme) {
			Theming.setTheme(sTheme);
		}
	}

	function testThemeLoaded(assert) {
		getAllLibraryInfoObjects().forEach(function(lib) {
			const sSheetHref = getSheetHref(lib.cssLinkElement);
			assert.equal(sSheetHref, lib.cssLinkElement.href, `href of loaded ${lib.id} stylesheet should be equal with link href.`);
		});
	}

	function testThemeManagerCleanup(assert) {
		getAllLibraryInfoObjects().forEach(function(lib) {
			const oOldLibraryCss = document.querySelectorAll(`link[data-sap-ui-foucmarker='${lib.linkId}']`);
			assert.equal(oOldLibraryCss && oOldLibraryCss.length || 0, 0, `Old stylesheet for library ${lib.id} has been removed.`);
		});
	}

	function checkCssAddedInCorrectOrder(assert) {
		const aAllCssElements = document.querySelectorAll("link[id^=sap-ui-theme-]");
		assert.ok([...mAllRequiredLibCss].every((id, idx, allLibs) => {
			if (allLibs[idx + 1]) {
				return document.getElementById(`sap-ui-theme-${id}`).compareDocumentPosition(document.getElementById(`sap-ui-theme-${allLibs[idx + 1]}`)) === Node.DOCUMENT_POSITION_FOLLOWING;
			} else {
				return aAllCssElements[aAllCssElements.length - 1].getAttribute("id").replace("sap-ui-theme-", "") === id;
			}
		}), `Link tags for libraries: '${[...mAllRequiredLibCss].join("', '")}' have been added in the expected order.`);
	}

	QUnit.module("Basic", {
		beforeEach: themeApplied,
		afterEach: checkCssAddedInCorrectOrder
	});

	QUnit.test("Initial theme check", function(assert) {
		// Expect 1 assert for each library from testThemeLoaded
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(getAllLibraryInfoObjects().size + 1);
		// Check if the declared library stylesheets have been fully loaded
		testThemeLoaded(assert);
	});

	QUnit.test("After theme change with legacy custom.css", function(assert) {
		// Expect 3 assert for each library from testApplyTheme
		// Expect 1 assert for each library from testThemeLoaded
		// Expect 1 assert for each library from testThemeManagerCleanup
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect((getAllLibraryInfoObjects().size * 5) + 2);
		testApplyTheme(assert, "legacy");

		return themeApplied().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeManagerCleanup(assert);

			// Check if the custom.css has been included
			const oCustomCss = document.getElementById("sap-ui-core-customcss");
			if (!oCustomCss) {
				assert.ok(false, "Custom CSS file hasn't been included");
			} else {
				const oCustomCssHref = oCustomCss.getAttribute("href");
				const sExpectedCustomCssPath = new URL(`test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/legacy/custom.css?sap-ui-dist-version=${sCoreVersion}`, document.baseURI).toString();
				assert.equal(oCustomCssHref, sExpectedCustomCssPath, "Custom CSS file gets loaded from the correct location.");
			}
		});
	});

	QUnit.test("After theme change with custom.css", function(assert) {
		// Expect 3 assert for each library from testApplyTheme
		// Expect 1 assert for each library from testThemeLoaded
		// Expect 1 assert for each library from testThemeManagerCleanup
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect((getAllLibraryInfoObjects().size * 5) + 2);
		testApplyTheme(assert, "customcss");

		return themeApplied().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeManagerCleanup(assert);

			// Check if the custom.css has been included
			const oCustomCss = document.getElementById("sap-ui-core-customcss");
			if (!oCustomCss) {
				assert.ok(false, "Custom CSS file hasn't been included");
			} else {
				const oCustomCssHref = oCustomCss.getAttribute("href");
				const sExpectedCustomCssPath = new URL(`test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/customcss/custom.css?sap-ui-dist-version=${sCoreVersion}`, document.baseURI).toString();
				assert.equal(oCustomCssHref, sExpectedCustomCssPath, "Custom CSS file gets loaded from the correct location.");
			}
		});
	});

	QUnit.test("After theme change without custom.css", function(assert) {
		// Expect 3 assert for each library from testApplyTheme
		// Expect 1 assert for each library from testThemeLoaded
		// Expect 1 assert for each library from testThemeManagerCleanup
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect((getAllLibraryInfoObjects().size * 5) + 2);
		testApplyTheme(assert, "sap_hcb");

		return themeApplied().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeManagerCleanup(assert);

			// Check if the custom.css has been included
			const oCustomCss = document.getElementById("sap-ui-core-customcss");
			assert.strictEqual(oCustomCss, null, "Custom CSS file should not be included.");
		});
	});

	QUnit.test("Provide custom css using metadata of custom lib after core was booted and theme fully applied", function(assert) {
		// Expect 6 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(7);
		const mExpectedLinkURIs = {
			"sap-ui-theme-sap.ui.core": `/sap/ui/core/themes/sap_hcb/library.css?sap-ui-dist-version=${sCoreVersion}`, // Fallback to sap_hcb for core lib because of theme metadata
			"sap-ui-theme-testlibs.customCss.lib1": `/libraries/customCss/lib1/themes/customTheme/library.css?sap-ui-dist-version=${sCoreVersion}`,
			"sap-ui-theme-testlibs.customCss.lib2": `/libraries/customCss/lib2/themes/sap_hcb/library.css?sap-ui-dist-version=${sCoreVersion}`
		};
		const checkLoadedCss = function () {
			const aAllThemeLinksForLibs = document.querySelectorAll("link[id^=sap-ui-theme]");
			const aCustomCssLink = document.querySelectorAll("link[id=sap-ui-core-customcss]");
			let oLib2CssLink;
			aAllThemeLinksForLibs.forEach(function ($link) {
				// Depending on order of test execution there could be more link tags as expected by this test
				// Only do asserts here for the expected link tags and check for complete test execution by assert.expect
				if (mExpectedLinkURIs[$link.id]) {
					assert.ok($link.getAttribute("href").endsWith(mExpectedLinkURIs[$link.id]), "URI of library.css link tag is correct");
				}
				if ($link.id === "sap-ui-theme-testlibs.customCss.lib2") {
					oLib2CssLink = $link;
				}
			});

			assert.ok(performance.getEntriesByType("resource").filter(function (oResource) {
				return oResource.name === oLib2CssLink.getAttribute("href") && oResource.initiatorType === "link";
			}).length <= 1, "No CSS request for custom theme and custom library which is not part of DIST layer");

			assert.ok(oLib2CssLink.sheet.href === oLib2CssLink.href && oLib2CssLink.href.includes("sap_hcb"));
			assert.ok(aCustomCssLink[0].getAttribute("href")
				.endsWith(`/libraries/customCss/sap/ui/core/themes/customTheme/custom.css?sap-ui-dist-version=${sCoreVersion}`), "URI of custom.css link tag is correct");
		};
		Theming.setTheme("customTheme");

		return themeApplied().then(function () {
			return Promise.all([
				Library.load("testlibs.customCss.lib1"),
				Library.load("testlibs.customCss.lib2")
			]).then(function () {
				return themeApplied().then(checkLoadedCss);
			});
		});
	});

	QUnit.test("RTL switch doesn't use suppress FOUC feature", async function(assert) {
		// Expect 1 assert for each library from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		const allLibInfoObjects = getAllLibraryInfoObjects();
		const allOldCssLinkElements = Array.from(allLibInfoObjects.values()).map((libInfoObject) => libInfoObject.cssLinkElement);
		assert.expect(allLibInfoObjects.size + 1);

		// testApplyTheme should NOT trigger any asserts, since there should be no change of the existing link attributes
		// the existing link attributes should be replaced which is check by the asserts after the await Promise.all
		testApplyTheme(assert);

		Localization.setRTL(true);

		// we can't wait for the RTL changes using themeApplied since RTL should not trigger themeApplied
		// therefore we chain manually to the requests and wait for them
		// We also can't check synchronous anymore since the CSS are exchanged async
		await Promise.all(Array.from(allLibInfoObjects.values()).map((libInfoObject) => libInfoObject.cssLoaded));

		allOldCssLinkElements.forEach((oldLinkElement) => {
			const newLinkElement = document.getElementById(oldLinkElement.getAttribute("id"));
			assert.ok(newLinkElement && newLinkElement !== oldLinkElement, `The link element for lib ${oldLinkElement.getAttribute("id")} should have been replaced`);
		});

		Localization.setRTL(false);
	});

	QUnit.test("Check link tags modified by defineProperty (e.g. AppCacheBuster) are handled correctly", function (assert) {
		const done = assert.async();
		// Expect 5 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(6);

		const oDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "href");

		Object.defineProperty(HTMLLinkElement.prototype, "href", {
			get: oDescriptor.get,
			set: function(val) {
				if (!val.endsWith("-qunit")) {
					val = val + "-qunit";
				}
				oDescriptor.set.call(this, val);
			}
		});

		assert.notOk(document.getElementById("sap-ui-theme-sap.ui.fakeLib"), "Link element for FakeLib should not be available because library theme was not included yet");
		assert.notOk(getAllLibraryInfoObjects().has("sap.ui.fakeLib"), "FakeLib should not be available because library theme was not included yet");
		includeLibraryTheme({libName: "sap.ui.fakeLib"});

		themeApplied().then(function () {
			const oFakeLibLibraryInfo = getAllLibraryInfoObjects("sap.ui.fakeLib");
			assert.ok(document.getElementById("sap-ui-theme-sap.ui.fakeLib").href.endsWith("-qunit"), "Library CSS for 'sap.ui.fakeLib' should be added and end with '-qunit'");
			assert.ok(oFakeLibLibraryInfo, "Library info for FakeLib should exist because a library theme was added");

			includeLibraryTheme({libName: "sap.ui.fakeLib"});


			themeApplied().then(() => {
				assert.deepEqual(oFakeLibLibraryInfo, getAllLibraryInfoObjects("sap.ui.fakeLib"), "Library info object should not have changed since no link tag changed");

				Object.defineProperty(HTMLLinkElement.prototype, "href", oDescriptor);
				done();
			});
		});
	});


	QUnit.module("Library Loading", {
		beforeEach: themeApplied,
		afterEach: checkCssAddedInCorrectOrder
	});

	QUnit.test("Library.load()", async function(assert) {
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(2);
		await Library.load("sap.ui.customthemefallback.testlib");

		return themeApplied().then(function() {
			assert.ok(true, "Applied event has been fired");
		});
	});

	/**
	 * @deprecated
	 */
	QUnit.test("sap.ui.getCore().loadLibraries()", async function(assert) {
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(2);
		await sap.ui.getCore().loadLibraries(["sap.ui.failingcssimport.testlib"], {
			async: true
		});

		return themeApplied().then(function() {
			assert.ok(true, "Applied event has been fired");
		});
	});

	QUnit.test("require without Library.load/Core.loadLibraries", function(assert) {
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect(2);
		// Fake direct require to a library.js module by just calling initLibrary
		Library.init({
			name : "sap.ui.fake.testlib",
			apiVersion: 2,
			version: "1.0.0",
			dependencies : ["sap.ui.core"],
			types: [],
			controls: [],
			elements: []
		});

		return themeApplied().then(function() {
			assert.ok(true, "Applied event has been fired");
		});
	});


	QUnit.module("CORS", {
		beforeEach: function(assert) {

			this.descLinkSheet = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "sheet");

			Object.defineProperty(HTMLLinkElement.prototype, "sheet", {
				get: function() {
					const obj = {
						href: this.href
					};
					Object.defineProperty(obj, "cssRules", {
						get: function() {
							throw new Error();
						},
						set: function() {}
					});
					return obj;
				},
				set: function() {},
				configurable: true
			});
			const Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			sinon.spy(Log, "error");
			return themeApplied();
		},
		afterEach: function(assert) {
			checkCssAddedInCorrectOrder(assert);
			Object.defineProperty(HTMLLinkElement.prototype, "sheet", this.descLinkSheet);
			const Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			Log.error.restore();
		}
	});

	QUnit.test("Accessing HTMLLinkElement#sheet.cssRules throws exception", function(assert) {
		// Expect 3 assert for each library from testApplyTheme
		// Expect 1 assert for each library from testThemeLoaded
		// Expect 1 assert for each library from testThemeManagerCleanup
		// Expect 1 assert from beforeEach of the module
		// Expect 1 assert from afterEach of the module
		// Expect 1 assert from the test
		// Expect 1 assert from checkCssAddedInCorrectOrder
		assert.expect((getAllLibraryInfoObjects().size * 5) + 4);
		testApplyTheme(assert, "customcss");

		return themeApplied().then(function() {

			// Check if the declared library stylesheets have been fully loaded
			testThemeLoaded(assert);

			// Check if the old stylesheets have been removed again
			testThemeManagerCleanup(assert);


			const Log = sap.ui.require("sap/base/Log");
			sinon.assert.neverCalledWithMatch(Log.error, sinon.match("Error during check styles"));
		});
	});
});
