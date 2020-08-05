/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/testrecorder/inspector/ControlAPI",
	"sap/ui/core/support/ToolsAPI",
	"../../fixture/tree",
	"../../fixture/treeAPI"
], function (ControlAPI, ToolsAPI, testTree, testTreeAPI) {
	"use strict";

	QUnit.module("ControlAPI", {
		beforeEach: function () {
			this.fnGetFrameworkData = sinon.stub(ToolsAPI, "getFrameworkInformation");
			this.fnGetFrameworkData.returns({
				commonInformation: {
					frameworkName: "OpenUI5",
					version: "1.0",
					buildTime: "20190725103116",
					jquery: "2.2.3"
				},
				onfigurationComputed: {
					language: "en-US"
				}
			});
			this.fnGetRenderedControlTree = sinon.stub(ToolsAPI, "getRenderedControlTree");
			this.fnGetRenderedControlTree.returns(testTree);
			this.fnGetControlOwnData = sinon.stub(ToolsAPI, "getControlProperties");
			this.fnGetControlOwnData.returns({
				inherited: [{
					meta: {controlName: "sap.ui.core.Control"},
					properties: {
						busy: {value: false, type: "boolean"}
					}
				}],
				own: {
					meta: {controlName: "sap.m.Button"},
					properties: {
						text: {value: "test", type: "string"}
					}
				}
			});
			this.fnGetControlBindings = sinon.stub(ToolsAPI, "getControlBindings");
			this.fnGetControlBindings.returns(testTreeAPI.DEFAULT_INPUT);
		},
		afterEach: function () {
			this.fnGetFrameworkData.restore();
			this.fnGetRenderedControlTree.restore();
			this.fnGetControlOwnData.restore();
			this.fnGetControlBindings.restore();
		}
	});

	QUnit.test("Should get framework data", function (assert) {
		var data = ControlAPI.getFrameworkData();
		assert.strictEqual(data.framework.name, "OpenUI5", "Should have framework name");
		assert.strictEqual(data.framework.version, "1.0", "Should have framework version");
	});

	QUnit.test("Should get data for all controls", function (assert) {
		var data = ControlAPI.getAllControlData();
		assert.deepEqual(data, {renderedControls: testTree});
	});

	QUnit.test("Should get own data of a control by its ID", function (assert) {
		var data = ControlAPI.getControlData({
			controlId: "__button4-container-cart---welcomeView--row-1"
		});
		assert.deepEqual(data, testTreeAPI.DEFAULT_OUTPUT);
	});

});
