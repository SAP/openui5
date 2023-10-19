/*global QUnit */
sap.ui.define([
	"sap/ui/core/Rendering",
	"sap/ui/testlib/TestButton",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Rendering, TestButton, nextUIUpdate) {
	"use strict";

	QUnit.test("UI dirty state - initial", function(assert) {
		assert.equal(Rendering.isPending(), false, "UI should not be dirty initially");
	});

	QUnit.module("Basics", {
		beforeEach: function(assert) {
			this.handler = function() {
				assert.ok(true, "(UIUpdated event is fired)");
			};
			Rendering.attachUIUpdated(this.handler);
			this.button = new TestButton("myButton");
		},
		afterEach: function() {
			this.button.destroy();
			Rendering.detachUIUpdated(this.handler);
		}
	});

	// attach / detach event handlers
	QUnit.test("Attaching event handlers", function(assert) {
		assert.expect(0);
	});

	QUnit.test("Control creation", async function(assert) {
		assert.expect(3); // including event handler
		this.button.placeAt("qunit-fixture");
		assert.equal(Rendering.isPending(), true, "UI should be dirty after placing the button into a UIArea");

		await nextUIUpdate();
		assert.equal(Rendering.isPending(), false, "UI should no longer be dirty after calling flush");
	});


	QUnit.test("UI dirty on control modification", async function(assert) {
		assert.expect(6);

		// prepare
		this.button.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.equal(Rendering.isPending(), false, "UI should not be dirty after flush");

		// Act
		this.button.setText("new text");

		// Assert
		assert.equal(Rendering.isPending(), true, "UI should be dirty after setting the button text");
		var done = assert.async();
		setTimeout(function() {
			assert.equal(document.getElementById("myButton").textContent, "new text", "button should have new text after setting the button text and some timeout");
			assert.equal(Rendering.isPending(), false, "UI should not be dirty after setting the button text and some timeout");
			done();
		}, 500);
	});

});