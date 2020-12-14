/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/Button",
	"sap/ui/core/Core"
], function (CodeEditor, Button, Core) {
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
			Core.applyChanges();
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
		Core.applyChanges();

		this.oCodeEditor.focus();

		assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === true, "should use worker when focused.");
	});

	QUnit.test("On blur", function (assert) {
		this.oCodeEditor.setVisible(true);
		Core.applyChanges();

		this.oCodeEditor.focus();
		this.oButton.focus();

		assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === false, "should not use worker after blur.");
	});

	QUnit.test("change value when on focus", function (assert) {
		this.oCodeEditor.setVisible(true);
		Core.applyChanges();

		this.oCodeEditor.focus();
		this.oCodeEditor.setValue("text");
		Core.applyChanges();

		assert.strictEqual(this.oCodeEditor.getValue(), "text", "value is not reset");
	});

	QUnit.test("Focused elements in code editor editable:false", function (assert) {
		var oBlurSpy = sinon.spy(document.activeElement, "blur");

		this.oCodeEditor.setEditable(false);
		this.oCodeEditor.setVisible(true);
		Core.applyChanges();

		//ACT
		this.oCodeEditor.focus();

		// ASSERT
		assert.strictEqual(document.activeElement.classList.contains("ace_text-input"), true, "When code editor is not editable the focus should remain on the code editor");
		assert.strictEqual(oBlurSpy.notCalled, true, "document.activeElement.blur() should not have been called");

		oBlurSpy.restore();

		this.oButton.focus();
	});

	QUnit.test("Focused elements in code editor editable:true", function (assert) {

		//Arrange
		this.oCodeEditor.setVisible(true);
		Core.applyChanges();

		//ACT
		this.oCodeEditor.focus();

		// ASSERT
		assert.strictEqual(document.activeElement.classList.contains("ace_text-input"), true, "When code editor is editable focus should be on the code editor");
	});

	QUnit.test("ACE Editor is read only when editable is false", function (assert) {
		//Arrange
		this.oCodeEditor.setVisible(true);

		this.oCodeEditor.setEditable(false);
		Core.applyChanges();

		//ACT
		this.oCodeEditor.focus();

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
		Core.applyChanges();

		// Act
		this.oCodeEditor.setValue("somevalue");
		Core.applyChanges();

		// Assert
		assert.ok(oSpy.notCalled, "Should not fire liveChange event when readonly.");
		assert.ok(oSpy2.notCalled, "Should not fire change event when readonly.");
	});

	QUnit.test("Scrollbar positions are maintained after rerendering", function (assert) {
		// Arrange
		var sText = "ui5 \n".repeat(100); // lots of text to show the scrollbar
		this.oCodeEditor.setValue(sText);
		this.oCodeEditor.setVisible(true);
		this.oCodeEditor.setWidth("300px");

		Core.applyChanges();

		var fInitialScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();
		this.oCodeEditor._oEditor.gotoLine(Infinity, Infinity, false); // go to last line, last char, do not animate

		// Assert
		var fNewScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();
		assert.notStrictEqual(fInitialScrollbarPos, fNewScrollbarPos, "scrollbar position changed after calling gotoLine");

		// Act
		this.oCodeEditor.invalidate();
		Core.applyChanges();

		// Assert
		var fUnchangedScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();
		assert.strictEqual(fNewScrollbarPos, fUnchangedScrollbarPos, "scrollbar position remains the same after rerendering");
	});

	QUnit.test("Method getInternalEditorInstance", function (assert) {
		var oInternalEditor = this.oCodeEditor.getInternalEditorInstance();
		assert.ok(oInternalEditor, "internal editor instance is available");
	});

	QUnit.module("Properties", {
		beforeEach: function () {
			this.oCodeEditor = new CodeEditor({
				tooltip: "Code editor control"
			});

			this.oCodeEditor.placeAt("qunit-fixture");
			Core.applyChanges();
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
		Core.applyChanges();

		// Act
		oCodeEditor.destroy();

		// Assert
		assert.notOk(oCodeEditor._oEditorDomRef, "DOM node of the editor should be destroyed.");
		assert.notOk(oCodeEditor._oEditor, "ACE editor should be destroyed");
	});

	QUnit.module("Accessibility");

	QUnit.test("Aria role and roledescription", function(assert) {
		var oCodeEditor = new CodeEditor({}),
			sExpectedRoleDescriptionText = Core.getLibraryResourceBundle("sap.ui.codeeditor").getText("CODEEDITOR_ROLE_DESCRIPTION");

		oCodeEditor.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oCodeEditor.$().attr("role"), "application", "aria-role is 'application'");
		assert.strictEqual(oCodeEditor.$().attr("aria-roledescription"), sExpectedRoleDescriptionText, "aria-roledescription is '" + sExpectedRoleDescriptionText + "'");

		oCodeEditor.destroy();
	});

	QUnit.module("Size", {
		beforeEach: function () {
			this.oCodeEditor = new CodeEditor({});

			this.oCodeEditor.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("Resize is called explicitly only once", function (assert) {
		// Arrange
		var oEditor = this.oCodeEditor,
			fnResizeSpy = sinon.spy(oEditor._oEditor, "resize"),
			done = assert.async();

		setTimeout(function () {
			// Assert
			assert.ok(fnResizeSpy.calledOnce, "Resize is called explicitly once");

			setTimeout(function () {
				// Assert
				assert.ok(fnResizeSpy.notCalled, "Resize is not called explicitly a second time");

				// Clean
				fnResizeSpy.restore();
				done();
			}, 500);

			// Act
			fnResizeSpy.reset();
			oEditor.$().width("100px");
		}, 500);

		// Act
		oEditor.$().width("50px");
	});
});