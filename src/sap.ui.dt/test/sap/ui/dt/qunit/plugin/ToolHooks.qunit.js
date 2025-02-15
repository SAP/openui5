/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/m/Button",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	ElementDesignTimeMetadata,
	ElementOverlay,
	ToolHooks,
	Button,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Given an overlay and a ToolHooks plugin...", {
		async beforeEach(assert) {
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oElementOverlay = new ElementOverlay({
				isRoot: true,
				element: this.oButton,
				designTimeMetadata: new ElementDesignTimeMetadata({
					data: {}
				}),
				init: assert.async()
			});
			this.oToolHooksPlugin = new ToolHooks();
		},
		afterEach() {
			this.oElementOverlay.destroy();
			this.oButton.destroy();
			this.oToolHooksPlugin.destroy();
		}
	}, function() {
		QUnit.test("with both functions in DesignTimeMetadata", function(assert) {
			assert.expect(3);
			const sButtonId = this.oButton.getId();
			this.oElementOverlay.setDesignTimeMetadata({
				tool: {
					start(oButton) {
						assert.equal(oButton.getId(), sButtonId, "the function was called with the control as parameter");
					},
					stop(oButton, oVersionWasActivated) {
						assert.equal(oButton.getId(), sButtonId, "the function was called with the control as parameter");
						assert.equal(
							oVersionWasActivated.versionWasActivated,
							false,
							"the function was called with the correct version activated flag"
						);
					}
				}
			});
			this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);
			this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);
		});

		QUnit.test("when the flag versionWasActivated is set", function(assert) {
			assert.expect(2);
			const sButtonId = this.oButton.getId();
			this.oToolHooksPlugin.setVersionWasActivated(true);
			this.oElementOverlay.setDesignTimeMetadata({
				tool: {
					stop(oButton, oVersionWasActivated) {
						assert.equal(oButton.getId(), sButtonId, "the function was called with the control as parameter");
						assert.equal(
							oVersionWasActivated.versionWasActivated,
							true,
							"the function was called with the correct version activated flag"
						);
					}
				}
			});
			this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);
		});

		QUnit.test("with both entries not being a function in DesignTimeMetadata", function(assert) {
			this.oElementOverlay.setDesignTimeMetadata({
				tool: {
					start: "notAFunction",
					stop: "notAFunction"
				}
			});
			assert.throws(function() {this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);});
			assert.throws(function() {this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);});
		});

		QUnit.test("with no tool section in DesignTimeMetadata", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);
			this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);
			assert.ok(true, "the function does not throw an error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});