/*global QUnit*/

sap.ui.define([], function () {
		"use strict";

		QUnit.module("Init", {
			setup: function () {
				this.oCodeEditor = new sap.ui.codeeditor.CodeEditor({
					type: "html",
					height: "300px",
					maxLines: 70,
					visible: false
				});
				this.oButton = new sap.m.Button({
					text: "click"
				});

				this.oCodeEditor.placeAt("qunit-fixture");
				this.oButton.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			teardown: function () {
				this.oCodeEditor.destroy();
				this.oButton.destroy();
			}
		});

		QUnit.test("Initial state", function (assert) {
			assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === false, "should not use worker initially.");
		});

		QUnit.test("On focus", function (assert) {
			this.oCodeEditor.setVisible(true);
			this.oCodeEditor.focus();

			assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === true, "should use worker when focused.");
		});

		QUnit.test("On blur", function (assert) {
			this.oCodeEditor.setVisible(true);
			this.oCodeEditor.focus();
			this.oButton.focus();

			assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === false, "should not use worker after blur.");
		});

});