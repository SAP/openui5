/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/StylesheetManager",
	"sap/ui/thirdparty/sinon-4"
],
function (
	StylesheetManager,
	sinon
) {
	"use strict";

	QUnit.config.reorder = false;

	var sandbox = sinon.sandbox.create();

	var COLOR_BLACK = "rgb(0, 0, 0)";
	var COLOR_RED = "rgb(255, 0, 0)";

	function getColor(oNode) {
		return window.getComputedStyle(oNode).color;
	}

	QUnit.module("Base functionality", {
		before: function () {
			this.oFixture = document.getElementById("qunit-fixture");
		},
		beforeEach: function () {
			this.oNode = document.createElement("div");
			this.oNode.appendChild(document.createTextNode("Some text"));
			this.oNode.classList.add("customCssClass");
			this.oFixture.appendChild(this.oNode);
		},
		afterEach: function () {
			sandbox.restore();
			StylesheetManager.remove("mockdata/StylesheetManager");
		}
	}, function () {
		QUnit.test("loading of custom CSS file", function (assert) {
			assert.strictEqual(getColor(this.oNode), COLOR_BLACK, "then color is black");

			return StylesheetManager.add("mockdata/StylesheetManager").then(function () {
				assert.ok(true, "CSS file seems to be loaded");
				assert.strictEqual(getColor(this.oNode), COLOR_RED, "then color is red");
			}.bind(this));
		});

		QUnit.test("removal of custom CSS file", function (assert) {
			return StylesheetManager.add("mockdata/StylesheetManager").then(function () {
				assert.ok(true, "CSS file seems to be loaded");
				assert.strictEqual(getColor(this.oNode), COLOR_RED, "then color is red");
				StylesheetManager.remove("mockdata/StylesheetManager");
				assert.strictEqual(getColor(this.oNode), COLOR_BLACK, "then color is black");
			}.bind(this));
		});

		QUnit.test("when requested by several consumers", function (assert) {
			return Promise.all([
				StylesheetManager.add("mockdata/StylesheetManager"),
				StylesheetManager.add("mockdata/StylesheetManager"),
				StylesheetManager.add("mockdata/StylesheetManager")
			]).then(function () {
				assert.ok(true, "CSS file seems to be loaded");

				assert.strictEqual(getColor(this.oNode), COLOR_RED, "then color is red");

				StylesheetManager.remove("mockdata/StylesheetManager");
				assert.strictEqual(getColor(this.oNode), COLOR_RED, "then color is red");

				StylesheetManager.remove("mockdata/StylesheetManager");
				assert.strictEqual(getColor(this.oNode), COLOR_RED, "then color is red");

				StylesheetManager.remove("mockdata/StylesheetManager");
				assert.strictEqual(getColor(this.oNode), COLOR_BLACK, "then color is black");
			}.bind(this));
		});

		QUnit.test("when requesting unknown CSS file", function (assert) {
			var fnDone = assert.async();
			StylesheetManager.add("mockdata/UnknownCssFile")
				.then(
					function () {
						assert.ok(false, "should never go here");
					},
					function () {
						assert.ok(true, "Promise is rejected properly");
						fnDone();
					}
				);
		});

	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
