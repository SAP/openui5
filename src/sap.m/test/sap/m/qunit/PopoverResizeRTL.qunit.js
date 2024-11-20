/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/base/i18n/Localization",
	"sap/m/App",
	"sap/ui/core/Element",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Popover",
	"sap/m/OverflowToolbar",
	"sap/m/library",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	qutils,
	createAndAppendDiv,
	Localization,
	App,
	Element,
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

	const mouseMoveOffset = 20;
	const acceptableMargin = 4;

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

	function getResizeHandle(popover) {
		return popover.getDomRef().querySelector(".sapMPopoverResizeHandle");
	}

	QUnit.module("Resize RTL", {
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

	QUnit.test("PlacementType Top, OffsetX = 0", async function (assert) {
		const popover = await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();
		const popoverContentWidth = popover.getContentWidth();
		const popoverContentHeight = popover.getContentHeight();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopRight"), "sapMPopoverResizeHandleTopRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX - mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");

		assert.strictEqual(popover.getOffsetX(), popoverOffsetX, "popoverOffsetX is not changed");
		assert.strictEqual(popover.getOffsetY(), popoverOffsetY, "popoverOffsetY is not changed");

		assert.strictEqual(popover.getContentWidth(), popoverContentWidth, "contentWidth is not changed");
		assert.strictEqual(popover.getContentHeight(), popoverContentHeight, "contentHeight is not changed");
	});

	QUnit.test("PlacementType Top, OffsetX = 100", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetX(100);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopRight"), "sapMPopoverResizeHandleTopRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX - mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Top, OffsetX = -100", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetX(-100);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopLeft"), "sapMPopoverResizeHandleTopLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX + mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Bottom, OffsetX = 0", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setPlacement(mLibrary.PlacementType.Bottom);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomRight"), "sapMPopoverResizeHandleBottomRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX - mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Bottom, OffsetX = 100", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetX(100);
		popover.setPlacement(mLibrary.PlacementType.Bottom);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomRight"), "sapMPopoverResizeHandleBottomRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX - mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Bottom, OffsetX = -100", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetX(-100);
		popover.setPlacement(mLibrary.PlacementType.Bottom);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomLeft"), "sapMPopoverResizeHandleBottomLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.ok(Math.abs(popover._getActualOffsetX() - popoverOffsetX + mouseMoveOffset / 2) < acceptableMargin, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Left, OffsetY = 0", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setPlacement(mLibrary.PlacementType.Left);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopLeft"), "sapMPopoverResizeHandleTopLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY + mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");
	});

	QUnit.test("PlacementType Left, OffsetY = -10", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetY(-10);
		popover.setPlacement(mLibrary.PlacementType.Left);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopLeft"), "sapMPopoverResizeHandleTopLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY + mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");
	});

	QUnit.test("PlacementType Left, OffsetY = 10", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetY(10);
		popover.setPlacement(mLibrary.PlacementType.Left);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomLeft"), "sapMPopoverResizeHandleBottomLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY - mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");
	});

	QUnit.test("PlacementType Right, OffsetY = 0", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setPlacement(mLibrary.PlacementType.Right);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();
		const popoverContentWidth = popover.getContentWidth();
		const popoverContentHeight = popover.getContentHeight();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomRight"), "sapMPopoverResizeHandleBottomRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY - mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");

		assert.strictEqual(popover.getOffsetX(), popoverOffsetX, "popoverOffsetX is not changed");
		assert.strictEqual(popover.getOffsetY(), popoverOffsetY, "popoverOffsetY is not changed");

		assert.strictEqual(popover.getContentWidth(), popoverContentWidth, "contentWidth is not changed");
		assert.strictEqual(popover.getContentHeight(), popoverContentHeight, "contentHeight is not changed");
	});

	QUnit.test("PlacementType Right, OffsetY = 10", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetY(10);
		popover.setPlacement(mLibrary.PlacementType.Right);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomRight"), "sapMPopoverResizeHandleBottomRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY - mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");
	});

	QUnit.test("PlacementType Right, OffsetY = -10", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetY(-10);
		popover.setPlacement(mLibrary.PlacementType.Right);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopRight"), "sapMPopoverResizeHandleTopRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.ok(Math.abs(popover._getActualOffsetY() - popoverOffsetY + mouseMoveOffset / 2) < acceptableMargin, "offsetY is correct");
	});

	QUnit.test("PlacementType Top, No Arrow", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setShowArrow(false);
		await nextUIUpdate();

		await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopRight"), "sapMPopoverResizeHandleTopRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Bottom, No Arrow", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setShowArrow(false);
		popover.setPlacement(mLibrary.PlacementType.Bottom);
		await nextUIUpdate();

		await openPopover();
		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetX = popover.getOffsetX();
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleBottomRight"), "sapMPopoverResizeHandleBottomRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.bottom);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.bottom + mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), popoverOffsetX, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Top, OffsetX = -100, Opener Align = Start", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setShowArrow(true);
		popover.setOffsetY(0);
		popover.setOffsetX(-100);
		popover.setPlacement(mLibrary.PlacementType.Top);
		Element.getElementById("flexBox").setJustifyContent(mLibrary.FlexJustifyContent.Start);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopRight"), "sapMPopoverResizeHandleTopRight class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.right, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.right - mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), 0, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});

	QUnit.test("PlacementType Top, OffsetX = 100, Opener Align = End", async function (assert) {
		const popover = Element.getElementById("popover");
		popover.setOffsetX(100);
		Element.getElementById("flexBox").setJustifyContent(mLibrary.FlexJustifyContent.End);
		await nextUIUpdate();

		await openPopover();

		const contentDomRef = popover.getDomRef("cont");
		const contentWidth = contentDomRef.offsetWidth;
		const contentHeight = contentDomRef.offsetHeight;
		const popoverOffsetY = popover.getOffsetY();

		assert.ok(popover.getDomRef().classList.contains("sapMPopoverResizeHandleTopLeft"), "sapMPopoverResizeHandleTopLeft class is added");

		const resizeHandle = getResizeHandle(popover);
		const boundingRect = resizeHandle.getBoundingClientRect();

		qutils.triggerMouseEvent(resizeHandle, "mousedown", 0, 0, boundingRect.left, boundingRect.top);
		qutils.triggerMouseEvent(document, "mousemove", 0, 0, boundingRect.left + mouseMoveOffset, boundingRect.top - mouseMoveOffset);
		qutils.triggerMouseEvent(document, "mouseup");

		await nextUIUpdate();

		assert.ok(Math.abs(contentDomRef.offsetWidth - contentWidth - mouseMoveOffset) < acceptableMargin, "width is correct");
		assert.ok(Math.abs(contentDomRef.offsetHeight - contentHeight - mouseMoveOffset) < acceptableMargin, "height is correct");

		assert.strictEqual(popover._getActualOffsetX(), -1, "offsetX is correct");
		assert.strictEqual(popover._getActualOffsetY(), popoverOffsetY, "offsetY is correct");
	});
});