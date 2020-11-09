/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor"
], function (
	BaseEditor
) {
	"use strict";

	function createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign(
			{
				label: "Test Group",
				type: "group",
				path: "content"
			},
			mConfigOptions
		);

		return {
			context: "/",
			properties: {
				sampleGroup: mPropertyConfig
			},
			propertyEditors: {
				"group": "sap/ui/integration/designtime/baseEditor/propertyEditor/groupEditor/GroupEditor"
			}
		};
	}

	QUnit.module("Group Editor: Given an editor config", {
		beforeEach: function() {
			var mJson = {
				content: ""
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson,
				config: createBaseEditorConfig()
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleGroup").then(function (aPropertyEditors) {
				this.oGroupEditor = aPropertyEditors[0];
				sap.ui.getCore().applyChanges();
				this.oGroupEditorElement = this.oGroupEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a GroupEditor is created", function (assert) {
			assert.ok(this.oGroupEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oGroupEditor.getDomRef() && this.oGroupEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oGroupEditor.getDomRef() && this.oGroupEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});