/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dom/units/Rem",
	"sap/m/App",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Popover",
	"sap/m/OverflowToolbar",
	"sap/m/library",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	qutils,
	createAndAppendDiv,
	Element,
	Library,
	Rem,
	App,
	ToolbarSpacer,
	Button,
	Page,
	VBox,
	Popover,
	OverflowToolbar,
	mLibrary,
	FlexBox,
	Text,
	nextUIUpdate
) {
	"use strict";

	// Keyboard resize step in px, must match RESIZE_STEP in sap/m/PopoverResize.
	const RESIZE_STEP = Rem.toPx(1);

	// A single keyboard step is a small movement, so the tolerance is smaller than
	// for the mouse tests but still allows for sub-pixel rounding of the layout.
	const acceptableMargin = 4;

	const PlacementType = mLibrary.PlacementType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);

	function createTestPage() {
		const popover = new Popover("popover", {
			title: "Popover Popover Popover Popover",
			placement: mLibrary.PlacementType.Top,
			content: [
				new Text({
					text: "This is a Popover"
				})
			],
			// Fixed content size so there is always headroom to grow/shrink and the
			// keyboard step is not clamped by the natural content dimensions.
			contentWidth: "300px",
			contentHeight: "150px",
			resizable: true,
			initialFocus: "closeBtn",
			footer: new OverflowToolbar({
				content: [
					new ToolbarSpacer(),
					new Button({
						text: "Button 1"
					}),
					new Button({
						text: "Button 2"
					}),
					new Button("closeBtn", {
						text: "Close",
						press: () => {
							popover.close();
						}
					})
				]
			})
		});

		const vBox = new VBox({
			height: "100%",
			renderType: mLibrary.FlexRendertype.Bare,
			items: [
				new FlexBox("flexBox", {
					height: "100%",
					renderType: mLibrary.FlexRendertype.Bare,
					justifyContent: mLibrary.FlexJustifyContent.Center,
					alignItems: mLibrary.FlexAlignItems.Center,
					items: [
						new Button("btnOpen", {
							text: "Open Popover",
							press: function () {
								popover.openBy(this);
							}
						})
					]
				})
			]
		});

		const popoverResizePage = new Page("popoverResizePage", {
			title: "Popover Resize",
			content: [
				vBox
			]
		});

		const app = new App("myApp", {
			initialPage: "popoverResizePage"
		});
		app.addPage(popoverResizePage);

		return app;
	}

	async function openPopover() {
		const popover = Element.getElementById("popover");
		const btnOpen = Element.getElementById("btnOpen");
		btnOpen.firePress();
		await nextUIUpdate();

		return new Promise((resolve) => {
			popover.attachEventOnce("afterOpen", () => {
				resolve(popover);
			});
		});
	}

	function getKeyboardHandle(popover) {
		return popover.getDomRef("keyboardHandle");
	}

	// Simulate a Shift + arrow key press on the keyboard resize handle. The
	// keyboard resize only reacts when the event target is the handle itself.
	function pressResizeKey(popover, sKey) {
		const oHandle = getKeyboardHandle(popover);
		qutils.triggerKeydown(oHandle, sKey, /* shift */ true, /* alt */ false, /* ctrl */ false);
	}

	QUnit.module("Keyboard resize - rendering", {
		beforeEach: async function () {
			this.oApp = createTestPage();
			this.oApp.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			const popover = Element.getElementById("popover");
			popover.close();
			popover.destroy();

			this.oApp.destroy();
		}
	});

	QUnit.test("Keyboard resize handle is rendered when resizable", async function (assert) {
		const popover = await openPopover();
		const oHandle = getKeyboardHandle(popover);

		assert.ok(oHandle, "keyboard resize handle is rendered");
		assert.ok(oHandle.classList.contains("sapMPopoverKeyboardResizeHandle"), "handle has the expected style class");
		assert.strictEqual(oHandle.getAttribute("tabindex"), "0", "handle is focusable");
		assert.strictEqual(oHandle.getAttribute("role"), "img", "handle has role img");
	});

	QUnit.test("Keyboard resize handle carries the accessibility annotations", async function (assert) {
		const popover = await openPopover();
		const oHandle = getKeyboardHandle(popover);
		const oRb = Library.getResourceBundleFor("sap.m");

		assert.strictEqual(oHandle.getAttribute("aria-roledescription"),
			oRb.getText("POPOVER_HANDLE_ARIA_ROLEDESCRIPTION"), "aria-roledescription is set");
		assert.strictEqual(oHandle.getAttribute("aria-label"),
			oRb.getText("POPOVER_RESIZE_HANDLE_ARIA_LABEL"), "aria-label is set");

		const sDescribedBy = oHandle.getAttribute("aria-describedby");
		assert.ok(sDescribedBy, "aria-describedby is set");

		const oDescText = popover._getResizeHandleDescribedByText();
		assert.strictEqual(sDescribedBy, oDescText.getId(), "aria-describedby points to the invisible description");
		assert.strictEqual(oDescText.getText(),
			oRb.getText("POPOVER_RESIZE_HANDLE_ARIA_DESCRIBEDBY"), "description announces the resize shortcut");
	});

	QUnit.test("No keyboard resize handle is rendered when not resizable", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setResizable(false);
		await nextUIUpdate();

		await openPopover();

		assert.notOk(getKeyboardHandle(popover), "keyboard resize handle is not rendered");
	});

	QUnit.test("Keyboard handle is part of the initial focus fallback chain", async function (assert) {
		const popover = Element.getElementById("popover");
		// Remove all focusable elements so only the keyboard handle remains.
		popover.setInitialFocus(null);
		popover.setShowHeader(false);
		popover.destroyFooter();
		popover.destroyContent();
		await nextUIUpdate();

		await openPopover();

		assert.strictEqual(popover._getInitialFocusId(), getKeyboardHandle(popover).id,
			"the keyboard handle is used as the initial focus when there is nothing else focusable");
	});

	QUnit.module("Keyboard resize - behavior", {
		beforeEach: async function () {
			this.oApp = createTestPage();
			this.oApp.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			const popover = Element.getElementById("popover");
			popover.close();
			popover.destroy();

			this.oApp.destroy();
		}
	});

	QUnit.test("PlacementType Top - Shift+ArrowUp increases the height", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;

		// A Top popover sits above the opener, so growing upward can be clamped by the
		// space to the top edge. Shrink first to guarantee there is room to grow back.
		pressResizeKey(popover, "ARROW_DOWN");
		pressResizeKey(popover, "ARROW_DOWN");
		await nextUIUpdate();

		const contentHeight = contentDomRef.offsetHeight;

		pressResizeKey(popover, "ARROW_UP");
		await nextUIUpdate();

		assert.ok(popover.isResized(), "popover is marked as resized");
		assert.ok(contentDomRef.offsetHeight > contentHeight,
			"height increased");
		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth) < acceptableMargin,
			"width is unchanged");
	});

	QUnit.test("PlacementType Top - Shift+ArrowDown decreases the height", async function (assert) {
		const popover = await openPopover();

		// Grow first so there is room to shrink and we do not hit the min height.
		pressResizeKey(popover, "ARROW_UP");
		pressResizeKey(popover, "ARROW_UP");
		await nextUIUpdate();

		const contentDomRef = popover.getDomRef("cont");
		const contentHeight = contentDomRef.offsetHeight;

		pressResizeKey(popover, "ARROW_DOWN");
		await nextUIUpdate();

		assert.ok(Math.abs(contentHeight - contentDomRef.offsetHeight - RESIZE_STEP) < acceptableMargin,
			"height decreased by one resize step");
	});

	QUnit.test("PlacementType Top - Shift+ArrowRight increases the width and offsetX", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const offsetX = popover._getActualOffsetX();

		pressResizeKey(popover, "ARROW_RIGHT");
		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - RESIZE_STEP) < acceptableMargin,
			"width increased by one resize step");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight) < acceptableMargin,
			"height is unchanged");
		assert.ok(Math.abs(popover._getActualOffsetX() - offsetX - RESIZE_STEP / 2) < acceptableMargin,
			"offsetX is adjusted to keep the popover centered on the opener");
	});

	QUnit.test("Keyboard resize does not mutate the public properties", async function (assert) {
		const popover = await openPopover();
		const contentWidth = popover.getContentWidth();
		const contentHeight = popover.getContentHeight();
		const offsetX = popover.getOffsetX();
		const offsetY = popover.getOffsetY();

		pressResizeKey(popover, "ARROW_UP");
		pressResizeKey(popover, "ARROW_RIGHT");
		await nextUIUpdate();

		assert.strictEqual(popover.getContentWidth(), contentWidth, "contentWidth property is not changed");
		assert.strictEqual(popover.getContentHeight(), contentHeight, "contentHeight property is not changed");
		assert.strictEqual(popover.getOffsetX(), offsetX, "offsetX property is not changed");
		assert.strictEqual(popover.getOffsetY(), offsetY, "offsetY property is not changed");
	});

	QUnit.test("PlacementType Right - Shift+ArrowLeft decreases the width", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setPlacement(PlacementType.Right);
		await nextUIUpdate();

		await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;

		// A Right popover sits to the right of the opener and may already reach the
		// viewport edge, so shrinking is the direction with guaranteed headroom.
		pressResizeKey(popover, "ARROW_LEFT");
		await nextUIUpdate();

		assert.ok(popover.isResized(), "popover is marked as resized");
		assert.ok(contentDomRef.offsetWidth < contentWidth,
			"width decreased");
	});

	QUnit.test("Repeated presses accumulate", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentHeight = contentDomRef.offsetHeight;
		const iSteps = 3;

		// Shrinking has guaranteed headroom (down to the min height), so the full
		// accumulated step size can be observed without clamping against the viewport.
		for (let i = 0; i < iSteps; i++) {
			pressResizeKey(popover, "ARROW_DOWN");
		}
		await nextUIUpdate();

		assert.ok(Math.abs(contentHeight - contentDomRef.offsetHeight - iSteps * RESIZE_STEP) < acceptableMargin,
			"height decreased by the accumulated number of steps");
	});

	QUnit.test("Arrowless Top - keyboard resize keeps handle focus so resizing continues", async function (assert) {
		const popover = Element.getElementById("popover");
		// No arrow + Top/Bottom is the branch of _resize that applies the new size
		// directly to the content DOM (no invalidate/re-render), so the keyboard
		// handle is not recreated and keeps its focus between presses.
		popover.setShowArrow(false);
		await nextUIUpdate();

		await openPopover();
		const contentDomRef = popover.getDomRef("cont");

		// Focus the handle as a real keyboard user would before resizing.
		const oHandle = getKeyboardHandle(popover);
		oHandle.focus();
		assert.strictEqual(document.activeElement, oHandle, "keyboard handle is focused before resizing");

		// First press resizes without re-rendering the popover.
		pressResizeKey(popover, "ARROW_DOWN");
		await nextUIUpdate();

		// The handle is still the same DOM node and still holds focus.
		assert.strictEqual(getKeyboardHandle(popover), oHandle, "the keyboard handle DOM node is preserved (no re-render)");
		assert.strictEqual(document.activeElement, oHandle, "focus stays on the keyboard handle after resizing");

		const contentHeight = contentDomRef.offsetHeight;

		// Second press must still reach the handle and resize further.
		pressResizeKey(popover, "ARROW_DOWN");
		await nextUIUpdate();

		assert.ok(contentDomRef.offsetHeight < contentHeight,
			"a consecutive Shift+Arrow press still resizes the popover");
	});

	QUnit.module("Keyboard resize - guards", {
		beforeEach: async function () {
			this.oApp = createTestPage();
			this.oApp.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			const popover = Element.getElementById("popover");
			popover.close();
			popover.destroy();

			this.oApp.destroy();
		}
	});

	QUnit.test("Arrow without Shift does not resize", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentHeight = contentDomRef.offsetHeight;

		qutils.triggerKeydown(getKeyboardHandle(popover), "ARROW_UP", false, false, false);
		await nextUIUpdate();

		assert.notOk(popover.isResized(), "popover is not resized without the Shift modifier");
		assert.strictEqual(contentDomRef.offsetHeight, contentHeight, "height is unchanged");
	});

	QUnit.test("Non-arrow key does not resize", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentHeight = contentDomRef.offsetHeight;

		qutils.triggerKeydown(getKeyboardHandle(popover), "A", true, false, false);
		await nextUIUpdate();

		assert.notOk(popover.isResized(), "popover is not resized by a non-arrow key");
		assert.strictEqual(contentDomRef.offsetHeight, contentHeight, "height is unchanged");
	});

	QUnit.test("Shift+Arrow on another element does not resize", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentHeight = contentDomRef.offsetHeight;

		// Fire the key on the content, not on the keyboard handle.
		qutils.triggerKeydown(contentDomRef, "ARROW_UP", true, false, false);
		await nextUIUpdate();

		assert.notOk(popover.isResized(), "popover is not resized when the handle is not the target");
		assert.strictEqual(contentDomRef.offsetHeight, contentHeight, "height is unchanged");
	});

	QUnit.test("Shift+Arrow does not resize when not resizable", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setResizable(false);
		await nextUIUpdate();

		await openPopover();

		// There is no keyboard handle, so no resizing.
		popover._keyboardResize({
			which: 38, // ARROW_UP
			shiftKey: true,
			target: popover.getDomRef()
		});

		assert.notOk(popover.isResized(), "popover is not resized");
	});
});
