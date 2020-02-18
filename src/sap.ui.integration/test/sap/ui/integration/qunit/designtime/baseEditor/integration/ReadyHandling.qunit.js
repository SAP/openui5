/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils"
], function (
	BaseEditor,
	QUnitUtils
) {
	"use strict";

	QUnit.module("Given a nested array editor", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var mConfig = {
				"properties": {
					"arrayLevel1": {
						"path": "/arrayLevel1",
						"type": "array",
						"template": {
							"arrayLevel2": {
								"path": "arrayLevel2",
								"type": "array",
								"template": {
									"stringLevel3": {
										"path": "stringLevel3",
										"type": "string"
									}
								}
							}
						}
					}
				},
				"propertyEditors": {
					"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				arrayLevel1: [{
					arrayLevel2: [{
						stringLevel3: "Foo"
					}]
				}]
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				fnDone();
			});
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a nested complex editor changes", function (assert) {
			var fnDone = assert.async();

			var oArrayLevel1 = this.oBaseEditor.getPropertyEditorsByNameSync("arrayLevel1")[0];
			oArrayLevel1.attachEventOnce("ready", function () {
				assert.ok(true, "Then the ready event bubbles to the outer array editor");
				assert.deepEqual(
					this.oBaseEditor.getJson(),
					{
						arrayLevel1: [{
							arrayLevel2: [{
								stringLevel3: "Foo"
							},
							{}]
						}]
					},
					"Then the base editor has received the value change"
				);
				fnDone();
			}, this);

			var oArrayLevel2 = oArrayLevel1.getAggregation("propertyEditor")._aEditorWrappers[0].getAggregation("propertyEditors")[0];
			var oAddButton = oArrayLevel2.getAggregation("propertyEditor").getContent().getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});