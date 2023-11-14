/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/core/Core"
], function (
	BaseEditor,
	oCore
) {
	"use strict";

	function createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign(
			{
				type: "separator",
				path: "content"
			},
			mConfigOptions
		);

		return {
			context: "/",
			properties: {
				sampleSeparator: mPropertyConfig
			},
			propertyEditors: {
				"separator": "sap/ui/integration/designtime/baseEditor/propertyEditor/separatorEditor/SeparatorEditor"
			}
		};
	}

	QUnit.module("Separator Editor: Given an editor config", {
		beforeEach: function() {
			var mJson = {
				content: ""
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson,
				config: createBaseEditorConfig()
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleSeparator").then(function (aPropertyEditors) {
				this.oSeparatorEditor = aPropertyEditors[0];
				oCore.applyChanges();
				this.oSeparatorEditorElement = this.oSeparatorEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a SeparatorEditor is created", function (assert) {
			assert.ok(this.oSeparatorEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oSeparatorEditor.getDomRef() && this.oSeparatorEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oSeparatorEditor.getDomRef() && this.oSeparatorEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
			assert.ok(this.oSeparatorEditorElement.isA("sap.m.ToolbarSpacer"), "Label: The content is a ToolbarSpacer");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});