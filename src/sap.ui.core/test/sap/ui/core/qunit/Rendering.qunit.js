
/* global QUnit */
sap.ui.define([
	"sap/ui/core/Rendering",
	"sap/ui/core/UIArea",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/testlib/TestButton"
], function(Rendering, UIArea, nextUIUpdate, TestButton) {
	"use strict";

	QUnit.test("UI dirty state - initial", function(assert) {
		assert.equal(Rendering.isPending(), false, "UI should not be dirty initially");
	});



	QUnit.module("Invalidation and Rendering", {
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



	QUnit.module("Prerendering Tasks");

	QUnit.test("in standard order", async function (assert) {
		var bCalled1 = false,
			bCalled2 = false;

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		Rendering.addPrerenderingTask(task1);
		Rendering.addPrerenderingTask(task2);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");
		var oMyArea = UIArea.create("qunit-fixture");
		oMyArea.invalidate();
		await nextUIUpdate();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
		oMyArea.destroy();
	});

	QUnit.test("in reverse order", async function (assert) {
		var bCalled1 = false,
			bCalled2 = false;

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		Rendering.addPrerenderingTask(task2);
		Rendering.addPrerenderingTask(task1, true);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");
		var oMyArea = UIArea.create("qunit-fixture");
		oMyArea.invalidate();
		await nextUIUpdate();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
		oMyArea.destroy();
	});

});
