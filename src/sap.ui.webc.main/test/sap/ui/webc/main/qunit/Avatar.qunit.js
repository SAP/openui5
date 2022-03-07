/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/Avatar",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, Avatar, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oAvatar = new Avatar({
				icon: "employee",
				image: new Button({
					icon: "employee",
					text: "Some text...",
					click: function(oEvent) {
						// console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
					}
				}),
				click: function(oEvent) {
					// console.log("Event click fired for Avatar with parameters: ", oEvent.getParameters());
				}
			});
			this.oAvatar.placeAt("uiArea");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oAvatar.destroy();
			this.oAvatar = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oAvatar.$(), "Rendered");
	});
});