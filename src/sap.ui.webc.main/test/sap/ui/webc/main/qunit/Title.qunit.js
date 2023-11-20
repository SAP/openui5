/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Title"
], function(createAndAppendDiv, Core, Title) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Some text..."
			});
			this.oTitle.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTitle.destroy();
			this.oTitle = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oTitle.$(), "Rendered");
	});
});