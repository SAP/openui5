/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/controls/BaseEditor"
],
	function (
		BaseEditor
	) {
		"use strict";

		QUnit.module("Init", {
			beforeEach: function () {
			},
			afterEach: function () {
				this.oBaseEditor.destroy();
			}
		});

		QUnit.test("Init with config and json", function (assert) {
			var done = assert.async();

			this.oBaseEditor = new BaseEditor({
				config: {
					context: "context",
					properties: {
						"prop1": {
							path: "prop1",
							type: "string"
						}
					},
					propertyEditors: {
						"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
					}
				},
				json: {
					context: {
						prop1: "value1",
						prop2: "value2"
					},
					fooPath: {
						foo1: "bar1"
					}
				}
			});

			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(oEvent.getParameter("propertyEditors").length, 1, "1 property editor is created");
				done();
			});
		});
	}
);
