/*global QUnit*/
/*!
 * ${copyright}
 */

sap.ui.require([
	"sap/ui/core/support/techinfo/moduleTreeHelper"
], function (moduleTreeHelper) {
	"use strict";

	// set debug mode to false to be able to run it in testsuite easily
	window["sap-ui-debug"] = false;

	QUnit.module("module / hierarchy / tree conversions", {
		beforeEach: function () {
			this.oModules = {
				"sap/ui/Device.js": {
					"name": "sap/ui/Device.js",
					"state": 4,
					"group": null,
					"data": null,
					"loaded": null,
					"content": {}
				},
				"sap/ui/core/Configuration": {
					"name": "sap/ui/core/Configuration.js",
					"state": 4,
					"group": null,
					"loaded": null,
					"url": "../../../../../../../resources/sap/ui/core/Configuration.js"
				},
				"sap/ui/core/Locale.js": {
					"name": "sap/ui/core/Locale.js",
					"state": 4,
					"group": null,
					"loaded": null,
					"url": "../../../../../../../resources/sap/ui/core/Locale.js"
				},
				"sap/m/Button.js": {
					"name": "sap/m/Button.js",
					"state": 4,
					"group": null,
					"loaded": null,
					"url": "../../../../../../../resources/sap/m/Button.js"
				},
				"sap/m/Text.js": {
					"name": "sap/m/Text.js",
					"state": 4,
					"group": null,
					"loaded": null,
					"url": "../../../../../../../resources/sap/m/Text.js"
				}
			};
			this.oHierarchy = {
				"sap": {
					"ui": {
						"Device.js": false,
						"core": {
							"Configuration": false,
							"Locale.js": false
						}
					},
					"m": {
						"Button.js": false,
						"Text.js": false
					}
				}
			};
			this.oTree = {
				"tree": {
					"text": "All",
					"nodes": [
						{
							"text": "sap",
							"nodes": [
								{
									"text": "ui",
									"nodes": [
										{
											"text": "Device.js",
											"nodes": [],
											"selected": false
										}, {
											"text": "core",
											"nodes": [
												{
													"text": "Configuration",
													"nodes": [],
													"selected": false
												}, {
													"text": "Locale.js",
													"nodes": [],
													"selected": false
												}
											],
											"selected": false
										}
									],
									"selected": false
								}, {
									"text": "m",
									"nodes": [
										{
											"text": "Button.js",
											"nodes": [],
											"selected": false
										}, {
											"text": "Text.js",
											"nodes": [],
											"selected": false
										}
									],
									"selected": false
								}
							],
							"selected": false
						}
					],
					"selected": false
				},
				"depth": 0
			};
		}
	});

	QUnit.test("set should work properly", function(assert) {
		// set root node
		moduleTreeHelper.set(this.oHierarchy, "", true);
		assert.strictEqual(this.oHierarchy[""], true);

		// unset root node
		moduleTreeHelper.set(this.oHierarchy, "", false);
		assert.strictEqual(this.oHierarchy[""], false);

		// set file
		moduleTreeHelper.set(this.oHierarchy, "sap/ui/Device.js", true);
		assert.strictEqual(this.oHierarchy.sap.ui["Device.js"], true);

		// unset file
		moduleTreeHelper.set(this.oHierarchy, "sap/ui/Device.js", false);
		assert.strictEqual(this.oHierarchy.sap.ui["Device.js"], false);

		// set namespace
		moduleTreeHelper.set(this.oHierarchy, "sap/", true);
		assert.strictEqual(this.oHierarchy.sap[""], true);

		// unset namespace
		moduleTreeHelper.set(this.oHierarchy, "sap/", false);
		assert.strictEqual(this.oHierarchy.sap[""], false);

		// set namespace without /
		moduleTreeHelper.set(this.oHierarchy, "sap/ui", true);
		assert.strictEqual(this.oHierarchy.sap.ui[""], true);

		// unset namespace without /
		moduleTreeHelper.set(this.oHierarchy, "sap/ui", false);
		assert.strictEqual(this.oHierarchy.sap.ui[""], false);

		// create module
		moduleTreeHelper.set(this.oHierarchy, "sap/ui/something/", true, true);
		assert.strictEqual(this.oHierarchy.sap.ui.something[""], true);

		// create file
		moduleTreeHelper.set(this.oHierarchy, "sap/ui/something/Else.js", true, true);
		assert.strictEqual(this.oHierarchy.sap.ui.something["Else.js"], true);
	});

	QUnit.test("get should work properly", function(assert) {
		// get file
		assert.strictEqual(moduleTreeHelper.get(this.oHierarchy, "sap/ui/Device.js"), false);

		// get file set
		this.oHierarchy.sap.ui["Device.js"] = true;
		assert.strictEqual(moduleTreeHelper.get(this.oHierarchy, "sap/ui/Device.js"), true);

		// get namespace
		assert.strictEqual(moduleTreeHelper.get(this.oHierarchy, "sap/"), undefined);

		// get namespace set
		this.oHierarchy.sap.ui[""] = true;
		assert.strictEqual(moduleTreeHelper.get(this.oHierarchy, "sap/ui/"), true);

		// get something that does not exist
		assert.strictEqual(moduleTreeHelper.get(this.oHierarchy, "foo/bar"), false);

	});

	QUnit.test("Should convert modules to module hierarchy", function(assert) {
		var oHierarchy = {};

		// example
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// false
		window["sap-ui-debug"] = false;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// true
		window["sap-ui-debug"] = true;
		this.oHierarchy[""] = true;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// single modules
		window["sap-ui-debug"] = "sap/ui/Device.js";
		this.oHierarchy.sap.ui["Device.js"] = true;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// module branch
		window["sap-ui-debug"] = "sap/ui/";
		this.oHierarchy.sap.ui[""] = true;
		this.oHierarchy.sap.ui["Device.js"] = false;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// module branch + single module
		window["sap-ui-debug"] = "sap/ui/,sap/m/Button.js";
		this.oHierarchy.sap.m["Button.js"] = true;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// single module wildcard
		window["sap-ui-debug"] = "sap/m/T*";
		this.oHierarchy.sap.m["Button.js"] = false;
		this.oHierarchy.sap.m["Text.js"] = true;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// module branch wildcard
		window["sap-ui-debug"] = "sap/ui/c*";
		this.oHierarchy.sap.ui.core[""] = true;
		this.oHierarchy.sap.ui.core["Configuration"] = true;
		this.oHierarchy.sap.ui.core["Locale.js"] = true;
		this.oHierarchy.sap.m["Text.js"] = false;
		moduleTreeHelper.modulesToHierarchy({modules: this.oModules}, oHierarchy);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");
	});

	QUnit.test("Should convert modules to module tree", function(assert) {
		var oTree;

		window["sap-ui-debug"] = false;
		oTree = moduleTreeHelper.toTreeModel({modules: this.oModules});
		assert.deepEqual(oTree, this.oTree, "The modules have been converted to a tree correctly");
		assert.deepEqual(oTree.depth, 0, "The modules have been converted to a tree correctly");

		window["sap-ui-debug"] = true;
		oTree = moduleTreeHelper.toTreeModel({modules: this.oModules});
		assert.deepEqual(oTree.depth, 4, "The modules have been converted to a tree correctly");
	});

	QUnit.test("Should convert module tree to module hierarchy", function(assert) {
		var oHierarchy;

		// nothing selected
		oHierarchy = moduleTreeHelper.toHierarchy(this.oTree.tree);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// root node selected in tree
		this.oTree.tree.selected = true;
		this.oHierarchy[""] = true;
		oHierarchy = moduleTreeHelper.toHierarchy(this.oTree.tree);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");
		this.oTree.tree.selected = false;
		delete this.oHierarchy[""];

		// namespace selected in tree
		this.oTree.tree.nodes[0].nodes[0].selected = true;
		this.oHierarchy.sap.ui[""] = true;
		oHierarchy = moduleTreeHelper.toHierarchy(this.oTree.tree);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");

		// namespace and module selected in tree
		this.oTree.tree.nodes[0].nodes[0].nodes[0].selected = true;
		this.oHierarchy.sap.ui["Device.js"] = true;
		oHierarchy = moduleTreeHelper.toHierarchy(this.oTree.tree);
		assert.deepEqual(oHierarchy, this.oHierarchy, "The modules have been converted to a hierarchy correctly");
	});

	QUnit.test("Should convert module tree to debug string", function(assert) {
		var sDebug;

		// nothing selected
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, false, "The modules have been converted to a debug string correctly");

		// root node selected in tree
		this.oTree.tree.selected = true;
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, true, "The modules have been converted to a debug string correctly");
		this.oTree.tree.selected = false;

		// namespace selected in tree
		this.oTree.tree.nodes[0].nodes[0].selected = true;
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, "sap/ui/", "The modules have been converted to a debug string correctly");

		// namespace and module selected in tree
		this.oTree.tree.nodes[0].nodes[0].nodes[0].selected = true;
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, "sap/ui/", "The modules have been converted to a debug string correctly");

		// several namespace selected in tree
		this.oTree.tree.nodes[0].nodes[0].nodes[0].selected = true;
		this.oTree.tree.nodes[0].nodes[1].selected = true;
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, "sap/ui/,sap/m/", "The modules have been converted to a debug string correctly");
		this.oTree.tree.nodes[0].nodes[1].selected = false;

		// several namespace and files selected in tree
		this.oTree.tree.nodes[0].nodes[1].nodes[1].selected = true;
		sDebug = moduleTreeHelper.toDebugInfo(this.oTree.tree);
		assert.strictEqual(sDebug, "sap/ui/,sap/m/Text.js", "The modules have been converted to a debug string correctly");
	});

	QUnit.test("Should convert a glob pattern to a partial JS regexp.", function(assert) {
		assert.strictEqual(moduleTreeHelper.makeRegExp("/^test$/"), "/\\^test\\$/(?:[^/]+/)*", "The pattern has been converted correctly");
		assert.strictEqual(moduleTreeHelper.makeRegExp("/^sap/u*/"), "/\\^sap/u[^/]*/(?:[^/]+/)*", "The pattern has been converted correctly");
		assert.strictEqual(moduleTreeHelper.makeRegExp("/^**$/"), "/\\^[^/]*[^/]*\\$/(?:[^/]+/)*", "The pattern has been converted correctly");
	});

	QUnit.test("Should convert debug string to selection count", function(assert) {
		// nothing selected
		moduleTreeHelper.toDebugInfo = function () {
			return false;
		};
		assert.strictEqual(moduleTreeHelper.getSelectionCount(), 0, "The count is 0");

		// root node selected in tree
		moduleTreeHelper.toDebugInfo = function () {
			return true;
		};
		assert.strictEqual(moduleTreeHelper.getSelectionCount(), 1, "The count is 1");

		// namespace selected in tree
		moduleTreeHelper.toDebugInfo = function () {
			return "sap/ui/";
		};
		assert.strictEqual(moduleTreeHelper.getSelectionCount(), 1, "The count is 1");

		// several namespace and files selected in tree
		moduleTreeHelper.toDebugInfo = function () {
			return "sap/ui/,sap/m/Text.js";
		};
		assert.strictEqual(moduleTreeHelper.getSelectionCount(), 2, "The count is 2");
	});

	QUnit.test("Should recursively select a tree node", function(assert) {
		moduleTreeHelper.recursiveSelect(this.oTree.tree, true);
		assert.ok(this.oTree.tree.nodes[0].selected, "The root node is selected");
		assert.ok(this.oTree.tree.nodes[0].nodes[0].selected, "The child node is selected");
		assert.ok(this.oTree.tree.nodes[0].nodes[0].nodes[0].selected, "The child child node is selected");
	});
});