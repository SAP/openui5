/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(CodeEditor,
			Button,
			Library,
			Theming,
			KeyCodes,
			nextUIUpdate,
			createAndAppendDiv) {
	"use strict";

	var DOM_RENDER_LOCATION = "content";
	createAndAppendDiv(DOM_RENDER_LOCATION);

	function nextAceEditorRendering(oCodeEditor) {
		return new Promise((res) => {
			oCodeEditor._oEditor.renderer.once("afterRender", res);
		});
	}

	QUnit.module("Init", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor({
				type: "html",
				height: "300px",
				maxLines: 70
			});
			this.oButton = new Button({
				text: "click"
			});
			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			this.oButton.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Initial state", function (assert) {
		assert.notOk(this.oCodeEditor._oEditor.getSession().getUseWorker(), "should not use worker initially.");
		assert.ok(this.oCodeEditor._oEditor.getOption("enableKeyboardAccessibility"), "keyboard accessibility is set");
	});

	QUnit.test("On focus", function (assert) {
		this.oCodeEditor.focus();

		assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === true, "should use worker when focused.");
	});

	QUnit.test("On blur", function (assert) {
		this.oCodeEditor.focus();
		this.oButton.focus();

		assert.ok(this.oCodeEditor._oEditor.getSession().getUseWorker() === false, "should not use worker after blur.");
	});

	QUnit.test("change value when on focus", async function (assert) {
		this.oCodeEditor.focus();
		this.oCodeEditor.setValue("text");
		await nextUIUpdate();

		assert.strictEqual(this.oCodeEditor.getValue(), "text", "value is not reset");
	});

	QUnit.test("Focused elements in code editor editable:false", async function (assert) {
		var oBlurSpy = sinon.spy(document.activeElement, "blur");

		this.oCodeEditor.setEditable(false);

		await nextUIUpdate();

		//ACT
		this.oCodeEditor.focus();

		// ASSERT
		assert.strictEqual(document.activeElement, this.oCodeEditor.getFocusDomRef(), "When code editor is not editable the focus should remain on the code editor");
		assert.strictEqual(oBlurSpy.notCalled, true, "document.activeElement.blur() should not have been called");

		oBlurSpy.restore();

		this.oButton.focus();
	});

	QUnit.test("Focused elements in code editor editable:true", function (assert) {
		//ACT
		this.oCodeEditor.focus();

		// ASSERT
		assert.strictEqual(document.activeElement, this.oCodeEditor.getFocusDomRef(), "When code editor is editable focus should be on the code editor");
	});

	QUnit.test("ACE Editor is read only when editable is false", async function (assert) {
		//Arrange
		this.oCodeEditor.setEditable(false);
		await nextUIUpdate();

		//ACT
		this.oCodeEditor.focus();

		// ASSERT
		assert.strictEqual(this.oCodeEditor._oEditor.getReadOnly(), true, "When code editor is not editable the ACE editor is read-only");
	});

	QUnit.test("Readonly change event", async function (assert) {
		// Arrange
		var oSpy = sinon.spy();
		var oSpy2 = sinon.spy();
		this.oCodeEditor.setEditable(false);
		this.oCodeEditor.attachLiveChange(oSpy);
		this.oCodeEditor.attachChange(oSpy2);
		await nextUIUpdate();

		// Act
		this.oCodeEditor.setValue("somevalue");
		await nextUIUpdate();

		// Assert
		assert.ok(oSpy.notCalled, "Should not fire liveChange event when readonly.");
		assert.ok(oSpy2.notCalled, "Should not fire change event when readonly.");
	});

	QUnit.test("Scrollbar positions are maintained after rerendering", async function (assert) {
		// Arrange
		var sText = "ui5 \n".repeat(100); // lots of text to show the scrollbar
		this.oCodeEditor.setValue(sText);

		this.oCodeEditor.setWidth("300px");
		await nextAceEditorRendering(this.oCodeEditor);
		var fInitialScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();
		assert.strictEqual(fInitialScrollbarPos, 0, "Initial scroll position should be 0");

		// Act
		this.oCodeEditor._oEditor.gotoLine(Infinity, Infinity, false); // go to last line, last char, do not animate
		await nextAceEditorRendering(this.oCodeEditor);

		// Assert
		var fNewScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();
		assert.ok(fNewScrollbarPos > fInitialScrollbarPos, "Scroll position should be larger than initial");
		assert.notStrictEqual(fInitialScrollbarPos, fNewScrollbarPos, "scrollbar position changed after calling gotoLine");

		// Act
		this.oCodeEditor.invalidate();
		await nextAceEditorRendering(this.oCodeEditor);

		// Assert
		var fPrevScrollbarPos = fNewScrollbarPos;
		fNewScrollbarPos = this.oCodeEditor._oEditor.getSession().getScrollTop();

		assert.strictEqual(fNewScrollbarPos, fPrevScrollbarPos, "scrollbar position remains the same after rerendering");
	});

	QUnit.test("Method getAceEditor", function (assert) {
		var oInternalEditor = this.oCodeEditor.getAceEditor();
		assert.ok(oInternalEditor, "internal editor instance is available");
	});

	QUnit.module("Properties", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor({
				tooltip: "Code editor control"
			});

			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("Tooltip", function (assert) {
		assert.strictEqual(this.oCodeEditor.getDomRef().title, "Code editor control", "Tooltip is correctly set");
	});

	QUnit.module("Destroy");

	QUnit.test("ACE Editor should be destroyed on exit", async function (assert) {
		// Arrange
		var oCodeEditor = new CodeEditor({});
		oCodeEditor.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		oCodeEditor.destroy();

		// Assert
		assert.notOk(oCodeEditor._oEditorDomRef, "DOM node of the editor should be destroyed.");
		assert.notOk(oCodeEditor._oEditor, "ACE editor should be destroyed");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor();
			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("tab indexes", function (assert) {
		var aFocusableElements = this.oCodeEditor.getDomRef().querySelectorAll('.ace_keyboard-focus[tabindex="0"]');

		// Assert
		assert.strictEqual(aFocusableElements.length, 2, "There are 2 focusable elements");
	});

	QUnit.test("keyboard navigation", function (assert) {
		this.oCodeEditor.focus();
		assert.strictEqual(document.activeElement, this.oCodeEditor._oEditor.renderer.scroller, "focus is on the scroller");

		document.activeElement.dispatchEvent(new KeyboardEvent("keyup", { keyCode: KeyCodes.ENTER }));
		assert.ok(document.activeElement.classList.contains("ace_text-input"), "focus goes to the text area");

		document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { keyCode: KeyCodes.ESCAPE }));
		assert.strictEqual(document.activeElement, this.oCodeEditor._oEditor.renderer.scroller, "focus is on the scroller");
	});

	QUnit.test("Aria role and roledescription", function(assert) {
		// Arrange
		var sExpectedRoleDescriptionText = Library.getResourceBundleFor("sap.ui.codeeditor").getText("CODEEDITOR_ROLE_DESCRIPTION");

		// Assert
		assert.strictEqual(this.oCodeEditor.$().attr("role"), "application", "aria-role is 'application'");
		assert.strictEqual(this.oCodeEditor.$().attr("aria-roledescription"), sExpectedRoleDescriptionText, "aria-roledescription is '" + sExpectedRoleDescriptionText + "'");
	});

	QUnit.test("labelFor", function (assert) {
		// Arrange
		var sIdForLabel = this.oCodeEditor.getIdForLabel();

		// Assert
		assert.strictEqual(sIdForLabel, this.oCodeEditor.getId() + "-editor-textarea", "The id of the textarea should be returned");
		assert.ok(document.getElementById(sIdForLabel), "Element that can be labeled should exist");
	});

	QUnit.test("focusDomRef", function (assert) {
		// Assert
		assert.ok(this.oCodeEditor.getFocusDomRef(),"Focus dom ref exists");
		assert.strictEqual(this.oCodeEditor.getFocusDomRef(), this.oCodeEditor.getDomRef().querySelector(".ace_scroller.ace_keyboard-focus"), "Focus dom ref should be correct");

		// Act
		this.oCodeEditor.getFocusDomRef().focus();
		document.activeElement.dispatchEvent(new KeyboardEvent("keyup", { keyCode: KeyCodes.ENTER }));

		// Assert
		assert.ok(this.oCodeEditor.getFocusDomRef(),"Focus dom ref exists");
		assert.strictEqual(this.oCodeEditor.getFocusDomRef(), this.oCodeEditor.getDomRef().querySelector(".ace_text-input"), "Focus dom ref should be correct while typing");
	});

	QUnit.test("focusDomRef when editor is not rendered", function (assert) {
		// Arrange
		const editor = new CodeEditor();

		// Assert
		assert.strictEqual(editor.getFocusDomRef(), null, "Focus dom ref should be correct");

		// Clean up
		editor.destroy();
	});

	QUnit.module("Theming", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor();

			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("Initial rendering", function (assert) {
		var oCodeEditor = new CodeEditor();
		assert.strictEqual(oCodeEditor.getColorTheme(), "default", "Initial theme is set correctly");

		oCodeEditor.destroy();
	});

	QUnit.test("Theme change", function (assert) {
		const done = assert.async(2);
		const initialTheme = "default";
		let callCount = 0;
		const handleThemeApplied = (oEvent) => {
			callCount++;

			if (oEvent.theme === "sap_fiori_3") {
				assert.strictEqual(this.oCodeEditor.getColorTheme(), "default", "theme is correct");
			} else if (oEvent.theme === "sap_fiori_3_hcb") {
				assert.strictEqual(this.oCodeEditor.getColorTheme(), "default", "theme is correct");
			}

			Theming.setTheme("sap_fiori_3_hcb");

			if (callCount === 2) {
				Theming.detachApplied(handleThemeApplied);
				Theming.setTheme(initialTheme);
			}

			done();
		};

		Theming.setTheme("sap_fiori_3");
		Theming.attachApplied(handleThemeApplied);
	});

	QUnit.module("Worker", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor();
			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("Iframe is created upon worker initialization", function(assert) {
		// Act
		this.oCodeEditor.focus();

		// Assert
		assert.ok(document.querySelector("iframe[src$='aceWorkerProxy.html']"), "Iframe should be added to the DOM");
	});

	QUnit.test("Iframe is removed when all editors are destroyed", async function(assert) {
		// Arrange
		this.oCodeEditor.focus();
		var oAnotherCodeEditor = new CodeEditor();
		oAnotherCodeEditor.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		oAnotherCodeEditor.focus();

		// Act
		oAnotherCodeEditor.destroy();

		// Assert
		assert.ok(document.querySelector("iframe[src$='aceWorkerProxy.html']"), "Iframe should NOT be removed from the DOM");

		// Act
		this.oCodeEditor.destroy();

		// Assert
		assert.notOk(document.querySelector("iframe[src$='aceWorkerProxy.html']"), "Iframe should be removed from the DOM");
	});

	QUnit.module("Code validation", {
		beforeEach: async function () {
			this.oCodeEditor = new CodeEditor();
			this.oCodeEditor.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCodeEditor.destroy();
		}
	});

	QUnit.test("Errors are reported for invalid JavaScript syntax", function(assert) {
		// Arrange
		var done = assert.async();
		this.oCodeEditor._oEditor.getSession().once("changeAnnotation", function (e, session) {
			var aErrors = session.getAnnotations();

			// Assert
			assert.ok(aErrors.length > 0, "There should be errors reported by the worker");

			done();
		});
		this.oCodeEditor._oEditor.getSession().setUseWorker(true);

		// Act
		this.oCodeEditor.setValue("function () { some invalid JavaScript }");
	});
});