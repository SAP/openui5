/* global QUnit, sinon */

sap.ui.define([
	'sap/ui/codeeditor/CodeEditor',
	'sap/m/Button'
], function (CodeEditor, Button) {
		"use strict";

		QUnit.module("Init", {
			beforeEach: function () {
				this.oCodeEditor = new CodeEditor({
					type: "html",
					height: "300px",
					maxLines: 70,
					visible: false
				});
				this.oButton = new Button({
					text: "click"
				});

				this.oCodeEditor.placeAt("qunit-fixture");
				this.oButton.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
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

		QUnit.test("Focused elements in code editor editable:false", function (assert) {
			//Arrange
			this.oCodeEditor.setEditable(false);
			this.oCodeEditor.setVisible(true);

			//ACT
			this.oCodeEditor.focus();

			// ASSERT
			assert.strictEqual(document.activeElement.classList.contains("ace_text-input"), false, "When code editor is not editable focus should not be on the code editor");
		});

		QUnit.test("Focused elements in code editor editable:true", function (assert) {

			//Arrange
			this.oCodeEditor.setVisible(true);

			//ACT
			this.oCodeEditor.focus();

			// ASSERT
			assert.strictEqual(document.activeElement.classList.contains("ace_text-input"), true, "When code editor is  editable focus should be on the code editor");
		});

		QUnit.test("ACE Editor is read only when editable is false", function (assert) {
			//Arrange
			this.oCodeEditor.setEditable(false);

			// ASSERT
			assert.strictEqual(this.oCodeEditor._oEditor.getReadOnly(), true, "When code editor is not editable the ACE editor is read-only");
		});

		QUnit.test("Readonly change event", function (assert) {

			// Arrange
			var oSpy = sinon.spy();
			var oSpy2 = sinon.spy();
			this.oCodeEditor.setEditable(false);
			this.oCodeEditor.attachLiveChange(oSpy);
			this.oCodeEditor.attachChange(oSpy2);

			// Act
			this.oCodeEditor.setValue("somevalue");

			// Assert
			assert.ok(oSpy.notCalled, "Should not fire liveChange event when readonly.");
			assert.ok(oSpy2.notCalled, "Should not fire change event when readonly.");
		});

		QUnit.module("Properties", {
			beforeEach: function () {
				this.oCodeEditor = new CodeEditor({
					tooltip: "Code editor control"
				});

				this.oCodeEditor.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oCodeEditor.destroy();
			}
		});

		QUnit.test("Tooltip", function (assert) {
			assert.strictEqual(this.oCodeEditor.getDomRef().title, "Code editor control", "Tooltip is correctly set");
		});

		QUnit.module("Destroy");

		QUnit.test("ACE Editor should be destroyed on exit", function (assert) {
			// Arrange
			var oCodeEditor = new CodeEditor({});
			oCodeEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// Act
			oCodeEditor.destroy();

			// Assert
			assert.notOk(oCodeEditor._oEditorDomRef, "DOM node of the editor should be destroyed.");
			assert.notOk(oCodeEditor._oEditor, "ACE editor should be destroyed");
		});
});