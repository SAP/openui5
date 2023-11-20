/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest"
], function (Component, Library, Manifest) {
	"use strict";

	QUnit.module("Async dependency loading", {
		beforeEach: function () {
			window.sapUiTestScriptForUnitTest = this.stub();

			// spy loadLibrary calls directly on prototype as implementation bypasses Core facade
			this.oLoadLibrarySpy = this.spy(Library, "_load");
			this.oLoadDependeciesAndIncludesSpy = this.spy(Manifest.prototype, "loadDependenciesAndIncludes");
		},
		afterEach: function (assert) {
			var aCssDomElements = document.querySelectorAll("link[data-sap-ui-manifest-uid");
			assert.strictEqual(aCssDomElements.length, 0, "No CSS files with given pattern found in DOM");
		}
	});

	QUnit.test("Simple component", function (assert) {
		return Component.create({
			name: "sap.ui.test.dependencyLoading.component1",
			manifest: false
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 3,
				"Function loadDependenciesAndIncludes called three times (for sap.ui.core.Component, sap.ui.core.UIComponent and sap.ui.test.dependencyLoading.component1) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 3, "Library._load() called 3 times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m", { sync: false }), "First Library._load() call with arguments: 'sap.m', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt", { sync: false }), "Second Library._load() call with arguments: 'sap.tnt', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core", { sync: false }), "Third Library._load() call with arguments: 'sap.ui.core', { sync: false }");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("Component variant", function (assert) {
		return Component.create({
			name: "sap.ui.test.dependencyLoading.component1",
			manifest: sap.ui.require.toUrl("sap/ui/test/dependencyLoading/componentVariant") + "/manifest.json"
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 3,
				"Function loadDependenciesAndIncludes called three times (for sap.ui.core.Component, sap.ui.core.UIComponent and sap.ui.test.dependencyLoading.component1 with variant manifest) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 4, "Library._load() called 4 times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly(["sap.m", "sap.ui.core", "sap.ui.table"], { sync: false }), "First Library._load() call with arguments: '['sap.m', 'sap.ui.core', 'sap.ui.table'], { sync: false }'==> preload dependencies");

			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.m", { sync: false }), "Second Library._load() call with arguments: 'sap.m', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core", { sync: false }), "Third Library._load() call with arguments: 'sap.ui.core', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(3).calledWithExactly("sap.ui.table", { sync: false }), "Fourth Library._load() call with arguments: 'sap.ui.table', { sync: false }");

			var aScriptDomElements = document.querySelectorAll("script[data-sap-ui-module$='inheritedScript.js']");
			assert.strictEqual(aScriptDomElements.length, 1, "One script with expected criteria found in DOM");
			// Check that the script are loaded in the correct and expected order
			assert.ok(aScriptDomElements[0].src.includes("componentVariant_1"), "Script 'componentVariant_1_inheritedScript.js' defined in 'componentVariant/manifest.json' found in DOM");
			//Check that the scripts are executed in the correct and expected order
			assert.ok(window.sapUiTestScriptForUnitTest.getCall(0).calledWithExactly(1), "Test stub was called with expected parameters while executing script 'componentVariant_1_inheritedScript.js'");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("Extended component", function (assert) {
		return Component.create({
			name: "sap.ui.test.dependencyLoading.component4",
			manifest: false
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 5,
				"Function loadDependenciesAndIncludes called five times (for sap.ui.core.Component, sap.ui.core.UIComponent, sap.ui.test.dependencyLoading.component1, sap.ui.test.dependencyLoading.component3 and sap.ui.test.dependencyLoading.component4) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 9, "Library._load() called nine times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m", { sync: false }), "First Library._load() call with arguments: 'sap.m', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt", { sync: false }), "Second Library._load() call with arguments: 'sap.tnt', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core", { sync: false }), "Third Library._load() call with arguments: 'sap.ui.core', { sync: false }");

			assert.ok(this.oLoadLibrarySpy.getCall(3).calledWithExactly("sap.m", { sync: false }), "Fourth Library._load() call with arguments: 'sap.m', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(4).calledWithExactly("sap.ui.core", { sync: false }), "Fifth Library._load() call with arguments: 'sap.ui.core', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(5).calledWithExactly("sap.ui.layout", { sync: false }), "Sixth Library._load() call with arguments: 'sap.ui.layout', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(6).calledWithExactly("sap.m", { sync: false }), "Seventh Library._load() call with arguments: 'sap.m', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(7).calledWithExactly("sap.ui.core", { sync: false }), "Eighth Library._load() call with arguments: 'sap.ui.core', { sync: false }");
			assert.ok(this.oLoadLibrarySpy.getCall(8).calledWithExactly("sap.ui.table", { sync: false }), "Ninth Library._load() call with arguments: 'sap.ui.table', { sync: false }");

			var aScriptDomElements = document.querySelectorAll("script[data-sap-ui-module$='extendedScript.js']");
			assert.strictEqual(aScriptDomElements.length, 3, "Three scripts with expected criteria found in DOM");
			// Check that the script are loaded in the correct and expected order
			assert.ok(aScriptDomElements[0].src.includes("component3_1"), "Script 'component3_1_extendedScript.js' defined in 'component3/manifest.json' found in DOM");
			assert.ok(aScriptDomElements[1].src.includes("component4_1"), "Script 'component4_1_extendedScript.js' defined in 'component4/manifest.json' found in DOM");
			assert.ok(aScriptDomElements[2].src.includes("component4_2"), "Script 'component4_2_extendedScript.js' defined in 'component4/manifest.json' found in DOM");
			//Check that the scripts are executed in the correct and expected order
			assert.ok(window.sapUiTestScriptForUnitTest.getCall(0).calledWithExactly(1), "First call of test stub with expected parameters while executing script 'component3_1_extendedScript.js'");
			assert.ok(window.sapUiTestScriptForUnitTest.getCall(1).calledWithExactly(2), "Second call test stub with expected parameters while executing script 'component4_1_extendedScript.js'");
			assert.ok(window.sapUiTestScriptForUnitTest.getCall(2).calledWithExactly(3), "Third call test stub with expected parameters while executing script 'component4_2_extendedScript.js'");

			var aCssDomElements = document.querySelectorAll("link[data-sap-ui-manifest-uid");
			assert.strictEqual(aCssDomElements.length, 2, "Two CSS files with expected criteria found in DOM");
			// Check that the script are loaded in the correct and expected order
			assert.ok(aCssDomElements[0].href.includes("comp3"), "CSS 'comp3extended.css' defined in 'component3/manifest.json' found in DOM");
			assert.ok(aCssDomElements[1].href.includes("comp4"), "CSS 'comp4extended.css' defined in 'component4/manifest.json' found in DOM");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});
});
