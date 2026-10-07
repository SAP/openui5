/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/utils/convertTreeToMarkdown",
	"../../fixture/tree"
], function (convertTreeToMarkdown, testTree) {
	"use strict";

	QUnit.module("convertTreeToMarkdown");

	QUnit.test("Return value structure - String contains markdown header '## Page content'", function (assert) {
		var result = convertTreeToMarkdown([]);
		assert.ok(result.includes("## Page content"), "String contains markdown header");
	});

	QUnit.test("Return value structure - String contains properly indented hierarchy", function (assert) {
		// testTree[1] is the sap-ui-area root containing the full ComponentContainer hierarchy
		var result = convertTreeToMarkdown(testTree[1]);
		var lines = result.split("\n");
		assert.ok(lines[2].startsWith("  Component"), "ComponentContainer is indented at level 1");
		assert.ok(lines[3].startsWith("    XMLView"), "XMLView is indented at level 2");
		assert.ok(lines[4].startsWith("      Button"), "Button is indented at level 3");
		assert.ok(lines[5].startsWith("        Icon"), "Icon is indented at level 4");
	});

	QUnit.test("formatAttrValue - circular object in node data renders as [object] placeholder", function (assert) {
		// Simulates a plain object with a circular reference, as can occur when
		// a live UI5 component or routing descriptor is stored in mProperties/mAssociations.
		var oCircular = {};
		oCircular.self = oCircular;

		var oNode = {
			id: "someId",
			name: "sap.m.Button",
			type: "sap-ui-control",
			content: [],
			data: { componentRef: oCircular }
		};

		var sResult, bThrew = false;
		try {
			sResult = convertTreeToMarkdown(oNode);
		} catch (e) {
			bThrew = true;
		}
		assert.ok(!bThrew, "convertTreeToMarkdown does not throw for circular object in node data");
		assert.ok(sResult && sResult.includes('[object]'), "circular object is rendered as [object] placeholder");
	});

	QUnit.test("formatAttrValue - plain object in node data is serialized normally", function (assert) {
		var oNode = {
			id: "someId",
			name: "sap.m.Button",
			type: "sap-ui-control",
			content: [],
			data: { config: { key: "value" } }
		};

		var sResult = convertTreeToMarkdown(oNode);
		assert.ok(sResult.includes("config="), "plain object key is present in output");
		assert.ok(sResult.includes("key"), "plain object content is serialized in output");
	});
});
