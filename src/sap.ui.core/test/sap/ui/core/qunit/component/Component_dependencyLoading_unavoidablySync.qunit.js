/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/core/Lib"
], function (Manifest, Library) {
	"use strict";

	QUnit.module("Sync dependency loading", {
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
		var oComponent = sap.ui.component({
			name: "sap.ui.test.dependencyLoading.component1"
		});

		// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
		assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 0,
			"Function loadDependenciesAndIncludes never called (for sap.ui.core.Component, sap.ui.core.UIComponent and sap.ui.test.dependencyLoading.component1) with parameter bAsync = true");
		assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.callCount, 3,
			"Function loadDependenciesAndIncludes called three times (for sap.ui.core.Component, sap.ui.core.UIComponent and sap.ui.test.dependencyLoading.component1) without parameter");

		// Check for the expected libraries to be loaded
		assert.ok(this.oLoadLibrarySpy.calledTwice, "Library._load() called twice");
		assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m", { sync: true }), "First Library._load() call with arguments: 'sap.m', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt", { sync: true }), "Second Library._load() call with arguments: 'sap.tnt', { sync: true }");

		// Cleanup
		oComponent.destroy();
	});

	QUnit.test("Extended component", function (assert) {
		var oComponent = sap.ui.component({
			name: "sap.ui.test.dependencyLoading.component6"
		});

		// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
		assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 0,
			"Function loadDependenciesAndIncludes never called (for sap.ui.core.Component, sap.ui.core.UIComponent, sap.ui.test.dependencyLoading.component1, sap.ui.test.dependencyLoading.component3 and sap.ui.test.dependencyLoading.component4) with parameter bAsync = true");
		assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.callCount, 5,
			"Function loadDependenciesAndIncludes called five times (for sap.ui.core.Component, sap.ui.core.UIComponent, sap.ui.test.dependencyLoading.component1, sap.ui.test.dependencyLoading.component3 and sap.ui.test.dependencyLoading.component4) without parameter");

		assert.ok(this.oLoadLibrarySpy.callCount, 6, "Library._load() called six times");
		assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m", { sync: true }), "First Library._load() call with arguments: 'sap.m', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt", { sync: true }), "Second Library._load() call with arguments: 'sap.tnt', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.m", { sync: true }), "Third Library._load() call with arguments: 'sap.m', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(3).calledWithExactly("sap.ui.layout", { sync: true }), "Fourth Library._load() call with arguments: 'sap.ui.layout', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(4).calledWithExactly("sap.m", { sync: true }), "Fifth Library._load() call with arguments: 'sap.m', { sync: true }");
		assert.ok(this.oLoadLibrarySpy.getCall(5).calledWithExactly("sap.ui.table", { sync: true }), "Sixth Library._load() call with arguments: 'sap.ui.table', { sync: true }");

		var aScriptDomElements = document.querySelectorAll("script[data-sap-ui-module$='extendedSyncScript.js']");
		assert.strictEqual(aScriptDomElements.length, 0, "No scripts with expected criteria found in DOM because of requireSync");
		//Check that the scripts are executed in the correct and expected order
		assert.ok(window.sapUiTestScriptForUnitTest.getCall(0).calledWithExactly(1), "First call of test stub with expected parameters while executing script 'component3_1_extendedScript.js'");
		assert.ok(window.sapUiTestScriptForUnitTest.getCall(1).calledWithExactly(2), "Second call test stub with expected parameters while executing script 'component4_1_extendedScript.js'");
		assert.ok(window.sapUiTestScriptForUnitTest.getCall(2).calledWithExactly(3), "Third call test stub with expected parameters while executing script 'component4_2_extendedScript.js'");

		var aCssDomElements = document.querySelectorAll("link[data-sap-ui-manifest-uid");
		assert.strictEqual(aCssDomElements.length, 2, "Two CSS files with expected criteria found in DOM");
		// Check that the script are loaded in the correct and expected order
		assert.ok(aCssDomElements[0].href.includes("comp5"), "CSS 'comp5extended.css' defined in 'component5/manifest.json' found in DOM");
		assert.ok(aCssDomElements[1].href.includes("comp6"), "CSS 'comp6extended.css' defined in 'component6/manifest.json' found in DOM");

		// Cleanup
		oComponent.destroy();
	});
});
