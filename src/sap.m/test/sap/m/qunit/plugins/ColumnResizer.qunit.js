/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/plugins/ColumnResizer",
	"sap/m/table/columnmenu/Menu",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(
	Localization,
	Column,
	ColumnListItem,
	Table,
	Text,
	ColumnResizer,
	Menu,
	Library,
	KeyCodes,
	QUtils,
	nextUIUpdate,
	jQuery
) {
	"use strict";

	function timeout(iDuration) {
		return new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	function createResponsiveTable(bActiveHeaders) {
		const oTable = new Table({
			autoPopinMode: true,
			contextualWidth: "Auto",
			columns: [
				new Column({
					header: new Text({
						text: "Column1 has a very very long text"
					})
				}),
				new Column({
					header: new Text({
						text: "Column2"
					})
				}),
				new Column({
					header: new Text({
						text: "Column3"
					})
				}),
				new Column({
					header: new Text({
						text: "Column4"
					})
				})
			],
			items: [
				new ColumnListItem({
					cells: [
						new Text({
							text: "Cell1"
						}),
						new Text({
							text: "Cell2"
						}),
						new Text({
							text: "Cell3"
						}),
						new Text({
							text: "Cell4"
						})
					]
				})
			]
		});

		oTable.bActiveHeaders = bActiveHeaders;

		return oTable;
	}

	function createTouchEvent(sEventName, oDomRef, iClientX, oColumnResizer) {
		const oEvent = jQuery.Event(sEventName);
		oEvent.originalEvent = {};
		oEvent.target = oDomRef;
		oEvent.srcControl = oColumnResizer;
		oEvent.isSimulated = true;
		oEvent.targetTouches = [{
			clientX: iClientX
		}];

		return oEvent;
	}

	QUnit.module("DOM", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable();
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			const bRTL = Localization.getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.oTable.destroy(true);
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("Add & deactivate ColumnResizer plugin as a dependent", function(assert) {
		assert.notOk(this.oTable.getDependents().length, "ColumnResizer plugin not added as a dependent by default");
		const oColumnResizer = new ColumnResizer();
		const fnOnActivate = sinon.spy(oColumnResizer, "onActivate");
		const fnOnDeactivate = sinon.spy(oColumnResizer, "onDeactivate");

		this.oTable.addDependent(oColumnResizer);
		assert.ok(this.oTable.getDependents().length, "Dependent added");
		assert.ok(this.oTable.getDependents()[0].isA("sap.m.plugins.ColumnResizer"), "ColumnResizer plugin added as a dependent");
		assert.ok(fnOnActivate.called, "Plugin is activated");
		assert.strictEqual(this.oTable.getFixedLayout(), "Strict", "fixedLayout='Strict'");

		oColumnResizer.setEnabled(false);
		assert.ok(fnOnDeactivate.called, "Plugin is deactivated");
		assert.strictEqual(this.oTable.getFixedLayout(), true, "fixedLayout='true', original value restored");
	});

	QUnit.test("Check Table DOM", async function(assert) {
		const oTableDomRef  = this.oTable.getDomRef("listUl");
		assert.notOk(oTableDomRef.classList.contains("sapMPluginsColumnResizerContainer"), "ColumnResizer container style class not added");
		assert.notOk(oTableDomRef.children[oTableDomRef.children.length - 1].classList.contains("sapMPluginsColumnResizerHandle"), "ColumnResizer handle not created");
		const oColumnResizer = new ColumnResizer();
		this.oTable.addDependent(oColumnResizer);
		await nextUIUpdate();
		assert.ok(oTableDomRef.classList.contains("sapMPluginsColumnResizerContainer"), "ColumnResizer container style class added");
		assert.notOk(oTableDomRef.children[oTableDomRef.children.length - 1].classList.contains("sapMPluginsColumnResizerHandle"), "ColumnResizer handle not yet created");

		// get resizable <th> elements
		let aResizableColumns = jQuery(oColumnResizer.getConfig("resizable")).get();
		aResizableColumns.forEach(function(TH) {
			assert.ok(TH.classList.contains("sapMPluginsColumnResizerResizable"), "Resizable column have the correct style added");
			assert.strictEqual(document.getElementById(TH.getAttribute("aria-describedby")).innerText, Library.getResourceBundleFor("sap.m").getText("COLUMNRESIZER_RESIZABLE"), "The column is resizable, announcement added");
		});

		oColumnResizer.setEnabled(false);
		await nextUIUpdate();
		aResizableColumns = jQuery(oColumnResizer.getConfig("resizable")).get();
		aResizableColumns.forEach(function(TH) {
			assert.notOk(TH.classList.contains("sapMPluginsColumnResizerResizable"), "Resizable column styleClass removed");
			assert.notOk(TH.firstChild.hasAttribute("aria-describedby"), "announcement removed");
		});
	});

	QUnit.test("Plugin behavior - Standalone sap.m.Table (Desktop)", async function(assert) {
		const oMatchMediaStub = sinon.stub(window, "matchMedia");

		oMatchMediaStub.withArgs("(hover:none)").returns({
			matches: false
		});

		const oColumnResizer = new ColumnResizer();
		this.oTable.addDependent(oColumnResizer);
		await nextUIUpdate();

		assert.ok(this.oTable.getDomRef().querySelector(oColumnResizer.getConfig("resizable")).tabIndex, -1, "Resizable columns are focusable");
		assert.notOk(oColumnResizer.getConfig("allowTouchResizing"), "allowTouchResizing=false, since its Desktop device");

		oMatchMediaStub.restore();
	});

	QUnit.test("Plugin behavior - Standalone sap.m.Table (Mobile)", async function(assert) {
		const oMatchMediaStub = sinon.stub(window, "matchMedia");

		oMatchMediaStub.withArgs("(hover:none)").returns({
			matches: true
		});

		const oColumnResizer = new ColumnResizer();
		this.oTable.addDependent(oColumnResizer);
		await nextUIUpdate();

		assert.ok(this.oTable.getDomRef().querySelector(oColumnResizer.getConfig("resizable")).tabIndex, -1, "Resizable columns are focusable");
		assert.ok(oColumnResizer.getConfig("allowTouchResizing"), "allowTouchResizing=true, since its Mobile device");

		oMatchMediaStub.restore();
	});

	QUnit.test("Plugin behavior when sap.m.Table with bActivHeaders=true", async function(assert) {
		this.oTable.bActiveHeaders = true;
		const oColumnResizer = new ColumnResizer();
		this.oTable.addDependent(oColumnResizer);
		await nextUIUpdate();

		assert.notOk(oColumnResizer.getConfig("enableColumnHeaderFocus"), "enableColumnHeaderFocus not set, since bActiveHeaders=true");

		const aFocusable = jQuery(oColumnResizer.getConfig("focusable")).get();
		aFocusable.forEach(function(oFocusable) {
			assert.notOk(oFocusable.classList.contains("sapMPluginsColumnResizerFocusable"), "focusable style class not added by the plugin");
			assert.ok(oFocusable.getAttribute("tabindex"), "Column headers are focusable, since bActiveHeaders=true");
		});
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable();
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			const bRTL = Localization.getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.oTable.destroy(true);
			this.oColumnResizer.destroy(true);
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("Resizer handle", async function(assert) {
		const oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumnDomRef = this.oTable.getColumns()[0].getDomRef();
		assert.notOk(this.oColumnResizer._oHandle, "Column resizing handle not created");

		const fnDisplayHandle = sinon.spy(this.oColumnResizer, "_displayHandle");
		QUtils.triggerEvent("mousemove", oTableDomRef);
		assert.ok(fnDisplayHandle.calledWith(-1), "_displayHandle called with expected parameter");
		assert.ok(this.oColumnResizer._aPositions, "column header positions are available");
		assert.ok(this.oColumnResizer._aPositions.length, "column header positions are available and contains relevant information");

		QUtils.triggerEvent("mousemove", oTableDomRef, {
			clientX: oColumnDomRef.getBoundingClientRect()[this.sEndDirection]
		});
		assert.ok(fnDisplayHandle.calledWith(0), "_displayHandle called for column index 0");
		assert.ok(this.oColumnResizer._oHandle.classList.contains("sapMPluginsColumnResizerHandle"), "Column resizing handle created");
		assert.ok(this.oColumnResizer._oHandle.style[this.sBeginDirection], "left position applied, resizer handle is visible");
		assert.ok(this.oColumnResizer._oHandle.onmouseleave, "onmouseleave event is registered for the handle");

		QUtils.triggerEvent("mouseleave", oTableDomRef);
		await timeout();

		assert.ok(this.oColumnResizer._bPositionsInvalid, "Handle positions are invalidated");
		assert.ok(this.oColumnResizer._oHandle.style[this.sBeginDirection], "Handle positions are not changed after leaving the table");

		this.oTable.setWidth("500px");
		await nextUIUpdate();

		assert.ok(this.oColumnResizer._bPositionsInvalid, "Handle positions are invalidated on table resize");

		QUtils.triggerEvent("mouseleave", this.oColumnResizer._oHandle);
		assert.notOk(this.oColumnResizer._oHandle.style[this.sBeginDirection], "Handle is not visible after mouse leave");
	});

	QUnit.test("Resize handle should have a circle in mobile device", function(assert) {
		const oColumnDomRef = this.oTable.getColumns()[0].getDomRef();
		const oMatchMediaStub = sinon.stub(window, "matchMedia");

		oMatchMediaStub.withArgs("(hover:none)").returns({
			matches: true
		});

		this.oColumnResizer.startResizing(oColumnDomRef);
		assert.strictEqual(this.oColumnResizer._oHandle.childElementCount, 1, "Resize handle circle child element is visible since its a tablet/phone device");
		assert.ok(this.oColumnResizer._oHandle.firstChild.classList.contains("sapMPluginsColumnResizerHandleCircle"), "Correct style class added to the resize handle circle");

		oMatchMediaStub.restore();
	});

	QUnit.test("Resizing style class", function(assert) {
		const oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumn1Dom = this.oTable.getColumns()[1].getDomRef();

		const iClientX = oColumn1Dom.getBoundingClientRect()[this.sEndDirection];
		const oTouchStart = createTouchEvent("touchstart", oColumn1Dom, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oColumn1Dom, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(oTableDomRef.classList.contains("sapMPluginsColumnResizerResizing"), "sapMPluginsColumnResizerResizing styleClass added to the table DOM");

		const oTouchEnd = createTouchEvent("touchend", oColumn1Dom, iClientX, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		assert.notOk(oTableDomRef.classList.contains("sapMPluginsColumnResizerResizing"), "sapMPluginsColumnResizerResizing styleClass removed from the table DOM");
	});

	QUnit.test("Resize column", async function(assert) {
		const oCurrentColumn = this.oTable.getColumns()[1];
		oCurrentColumn.setWidth("100px");
		const oNextColumn = this.oTable.getColumns()[2];
		oNextColumn.setWidth("100px");
		await nextUIUpdate();
		const oCurrentColumnDom = oCurrentColumn.getDomRef();

		this.oColumnResizer.attachColumnResize(function(oEvent) {
			assert.ok(oEvent.getParameter("column"), "columnResize event fired for: " + oEvent.getParameter("column").getId()); // #2-5
		});

		const iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		this.oColumnResizer.startResizing(oCurrentColumnDom);
		const oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);

		const oCurrentColumnOriginalWidth = oCurrentColumn.getWidth();
		const oNextColumnOriginalWidth = oNextColumn.getWidth();
		const iHandleBeginPosition = parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]);

		const oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), iHandleBeginPosition + 20, "Handle position changed by 20px"); // #1

		const oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		await nextUIUpdate();

		const oCurrentColumnUpdatedWidth = oCurrentColumn.getWidth();
		const oNextColumnUpdatedWidth = oNextColumn.getWidth();
		assert.ok(oCurrentColumnOriginalWidth !== oCurrentColumnUpdatedWidth, "CurrentColumn original width !== CurrentColumn updated width"); // #6
		assert.ok(oCurrentColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the CurrentColumn"); // #7
		assert.strictEqual(oCurrentColumnUpdatedWidth, "120px", "CurrentColumn width=120px"); // #8
		assert.ok(oNextColumnOriginalWidth !== oNextColumnUpdatedWidth, "NextColumn original width !== NextColumn updated width"); // #9
		assert.ok(oNextColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the NextColumn"); // #10
		assert.strictEqual(oNextColumnUpdatedWidth, "80px", "NextColumn width=80px"); // #11

		this.oTable.getColumns().forEach(function(oColumn) {
			assert.ok(oColumn.getWidth().indexOf("px") > -1, "All columns should have static width once a column is resized"); // # 12-15
		});
	});

	QUnit.test("Resize columns with Table having dummy column", async function(assert) {
		this.oTable.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("10rem");
		});
		await nextUIUpdate();

		const oCurrentColumn = this.oTable.getColumns()[0],
			oCurrentColumnDom = oCurrentColumn.getDomRef(),
			oNextColumn = this.oTable.getColumns()[1],
			oDummyColumnDom = this.oTable.getDomRef("tblHeadDummyCell"),
			iDummyColumnWidth = oDummyColumnDom.getBoundingClientRect().width;

		assert.ok(iDummyColumnWidth > 0, "Dummy column is visible");

		const iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		QUtils.triggerEvent("mousemove", oCurrentColumnDom, {
			clientX: iClientX
		});
		const oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);

		const oCurrentColumnOriginalWidth = oCurrentColumn.getWidth();
		const oNextColumnOriginalWidth = oNextColumn.getWidth();
		const oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		const oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		await nextUIUpdate();

		const oCurrentColumnUpdatedWidth = oCurrentColumn.getWidth();
		const oNextColumnUpdatedWidth = oNextColumn.getWidth();
		assert.ok(oCurrentColumnOriginalWidth !== oCurrentColumnUpdatedWidth, "Orignial column width != update column width");
		assert.ok(oCurrentColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the column");
		assert.strictEqual(oNextColumnOriginalWidth, oNextColumnUpdatedWidth, "NextColumn width is not change since dummy column has width");
		assert.ok(iDummyColumnWidth > oDummyColumnDom.getBoundingClientRect().width, "Dummy column width reduced");
	});

	QUnit.test("Resize session should not start if valid resizable DOM is not found", function(assert) {
		const oColumnDom = this.oTable.getColumns()[1].getDomRef();
		const oTouchStart = createTouchEvent("touchstart", oColumnDom, 0, this.oColumnResizer);
		const fnStartResizeSession = sinon.spy(this.oColumnResizer, "_startResizeSession");
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(fnStartResizeSession.notCalled, "resize session not started");
	});

	QUnit.test("touchmove should not do anything if resizing session is not started", function(assert) {
		const oColumnDom = this.oTable.getColumns()[1].getDomRef();
		const iClientX = oColumnDom.getBoundingClientRect()[this.sEndDirection];
		const oTouchMove = createTouchEvent("touchmove", oColumnDom, iClientX, this.oColumnResizer);
		const fnSetSessionDistanceX = sinon.spy(this.oColumnResizer, "_setSessionDistanceX");
		this.oColumnResizer.ontouchmove(oTouchMove);
		assert.ok(fnSetSessionDistanceX.notCalled, "resize session not started");
	});

	QUnit.test("columnResize event if prevented then column(s) should not update its width", async function(assert) {
		const oCurrentColumn = this.oTable.getColumns()[1],
			sColumnWidth = oCurrentColumn.getWidth(),
			oCurrentColumnDom = oCurrentColumn.getDomRef(),
			fnFireColumnResie = sinon.spy(this.oColumnResizer, "_fireColumnResize");

		this.oColumnResizer.attachColumnResize(function(oEvent) {
			oEvent.preventDefault();
		});

		const iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		const oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oCurrentColumnDom, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);

		const oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);

		const oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		await nextUIUpdate();

		assert.ok(fnFireColumnResie.called, "_fireColumnResize called");
		assert.strictEqual(oCurrentColumn.getWidth(), sColumnWidth, "Column width did not change due to preventDefault()");
	});

	QUnit.test("Mouse event double click to auto resize column (small column)", async function(assert) {
		const oColumn = this.oTable.getColumns()[0],
			oColumnDomRef = oColumn.getDomRef();

		oColumn.setWidth("100px");
		await nextUIUpdate();

		assert.strictEqual(oColumn.getWidth(), "100px", "Column width is set to 100px initially");
		const iClientX = oColumnDomRef.getBoundingClientRect()[this.sEndDirection],
			oEvent = {
				clientX: iClientX
			};

		QUtils.triggerEvent("mousemove", oColumnDomRef, {
			clientX: iClientX
		});

		this.oColumnResizer.ondblclick(oEvent);
		await nextUIUpdate();
		assert.ok(oColumn.getWidth() !== "100px", "Column width changed due to auto column resize");
		assert.ok(parseInt(oColumn.getWidth()) > 100, "Column is made bigger");
	});

	QUnit.test("Mouse event double click to auto resize column (large column)", async function(assert) {
		const oColumn = this.oTable.getColumns()[2];

		oColumn.setWidth("300px");
		await nextUIUpdate();

		const oColumnDomRef = oColumn.getDomRef();
		assert.strictEqual(oColumn.getWidth(), "300px", "Column width is set to 300px initially (bigger than necessary)");

		const iClientX = oColumnDomRef.getBoundingClientRect()[this.sEndDirection],
			oEvent = {
				clientX: iClientX
			};

		QUtils.triggerEvent("mousemove", oColumnDomRef, {
			clientX: iClientX
		});

		this.oColumnResizer.ondblclick(oEvent);
		await nextUIUpdate();
		assert.ok(oColumn.getWidth() !== "300px", "Column width changed due to auto column resize");
		assert.ok(parseInt(oColumn.getWidth()) < 300, "Column is made bigger");
	});

	QUnit.test("Mouse event double click to auto resize column should consider sort indicator icon", async function(assert) {
		const oColumn = this.oTable.getColumns()[2];

		oColumn.setWidth("300px");
		oColumn.setSortIndicator("Descending");
		await nextUIUpdate();

		const oColumnDomRef = oColumn.getDomRef();
		assert.strictEqual(oColumn.getWidth(), "300px", "Column width is set to 300px initially (bigger than necessary)");
		assert.strictEqual(oColumnDomRef.getAttribute("aria-sort"), "descending", "sort indicator applied");

		const fnGetComputedStyleSpy = sinon.spy(window, "getComputedStyle");

		const iClientX = oColumnDomRef.getBoundingClientRect()[this.sEndDirection],
			oEvent = {
				clientX: iClientX
			};

		QUtils.triggerEvent("mousemove", oColumnDomRef, {
			clientX: iClientX
		});

		this.oColumnResizer.ondblclick(oEvent);
		assert.ok(fnGetComputedStyleSpy.calledWith(oColumnDomRef.firstChild, ":after"), ":after pseudo element was called");
		await nextUIUpdate();
	});

	QUnit.module("Keyboard events", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable();
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();

			const bRTL = Localization.getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.oTable.destroy(true);
			this.oColumnResizer.destroy(true);
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("SHIFT + RIGHT_ARROW", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		const oNextColumn = this.oTable.getColumns()[1];
		oNextColumn.setWidth("100px");
		await nextUIUpdate();

		oColumn.focus();
		QUtils.triggerKeydown(oColumn.getDomRef(), KeyCodes.ARROW_RIGHT, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "116px", "Column 0 has increased width by 16px");
		assert.strictEqual(oNextColumn.getWidth(), "84px", "Column 1 has decreased width by 16px");
	});

	QUnit.test("SHIFT + LEFT_ARROW", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		const oNextColumn = this.oTable.getColumns()[1];
		oNextColumn.setWidth("100px");
		await nextUIUpdate();

		oColumn.focus();
		QUtils.triggerKeydown(oColumn.getDomRef(), KeyCodes.ARROW_LEFT, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "84px", "Column 0 has decreased width by 16px");
		assert.strictEqual(oNextColumn.getWidth(), "116px", "Column 1 has increased width by 16px");
	});

	QUnit.test("Column resize should strictly happen only when SHIFT + ARROW_KEY is pressed", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		await nextUIUpdate();
		const oColumnDomRef = oColumn.getDomRef();
		oColumn.focus();

		// ALT key is pressed
		QUtils.triggerKeydown(oColumnDomRef, KeyCodes.ARROW_LEFT, true, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "100px", "Column width did not change, since ALT key was also pressed");

		// CTRL key is pressed
		QUtils.triggerKeydown(oColumnDomRef, KeyCodes.ARROW_LEFT, true, false, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "100px", "Column width did not change, since CTRL key was also pressed");

		// CTRL & ALT keys are pressed
		QUtils.triggerKeydown(oColumnDomRef, KeyCodes.ARROW_LEFT, true, true, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "100px", "Column width did not change, since CTRL & ALT keys are also pressed");
	});

	QUnit.test("No column resize when text is selected in the column header", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		await nextUIUpdate();
		const oColumnDomRef = oColumn.getDomRef();
		oColumn.focus();

		const bStubWindowGetSelection = sinon.stub(window, "getSelection").callsFake(function() {
			return {
				toString: function() {
					return "foo";
				},
				focusNode: oColumnDomRef.firstChild
			};
		});

		QUtils.triggerKeydown(oColumn.getDomRef(), KeyCodes.ARROW_LEFT, true);
		await nextUIUpdate();
		assert.strictEqual(oColumn.getWidth(), "100px", "Column width did not change, since there was text selected in the column header");

		bStubWindowGetSelection.restore();
	});

	QUnit.test("Cancel column resize with 'ESC' key", function(assert) {
		const oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumn = this.oTable.getColumns()[1],
			oColumnDomRef = oColumn.getDomRef();

		// await timeout();

		const iClientX = oColumnDomRef.getBoundingClientRect()[this.sEndDirection];
		const oTouchStart = createTouchEvent("touchstart", oColumnDomRef, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oColumnDomRef, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);
		const oTouchMove = createTouchEvent("touchmove", oColumnDomRef, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		const fnCancelReszing = sinon.spy(this.oColumnResizer, "_cancelResizing");
		QUtils.triggerKeydown(oTableDomRef, KeyCodes.ESCAPE);
		assert.ok(fnCancelReszing.called, "Column resizing cancelled");
	});


	QUnit.module("API", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable(true);
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();

			const bRTL = Localization.getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.oTable.destroy(true);
			this.oColumnResizer.destroy(true);
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(ColumnResizer.findOn(this.oTable) === this.oColumnResizer, "Plugin found via ColumnResizer.findOn");
	});

	QUnit.test("startResizing", function(assert) {
		const oColumnDomRef = this.oTable.getColumns()[1].getDomRef(),
			fnDisplayHandle = sinon.spy(this.oColumnResizer, "_displayHandle");

		assert.notOk(this.oColumnResizer._oHandle, "Resize handle is not created yet");
		this.oColumnResizer.startResizing(oColumnDomRef);
		assert.ok(fnDisplayHandle.calledWith(1, true), "_displayHandle called with correct parameters");
		assert.ok(this.oColumnResizer._oHandle, "Resize handle is created");
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[1] - this.oColumnResizer._fContainerX), "Resize handle is visible");
		assert.ok(this.oColumnResizer._oAlternateHandle, "Alternate handle is created");
		assert.strictEqual(parseInt(this.oColumnResizer._oAlternateHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[0] - this.oColumnResizer._fContainerX), "Alternate resize handle is visible");
		assert.strictEqual(this.oColumnResizer._iHoveredColumnIndex, -1, "_iHoveredColumnIndex = " + this.oColumnResizer._iHoveredColumnIndex);
	});

	QUnit.test("startResizing - on first column", function(assert) {
		const oColumnDomRef = this.oTable.getColumns()[0].getDomRef();

		this.oColumnResizer.startResizing(oColumnDomRef);
		assert.ok(this.oColumnResizer._oHandle, "Resize handle is created");
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[0] - this.oColumnResizer._fContainerX), "Resize handle is visible");
		assert.ok(this.oColumnResizer._oAlternateHandle, "Alternate handle is created");
		assert.strictEqual(this.oColumnResizer._oAlternateHandle.style[this.sBeginDirection], "", "AlternateHandle is not visible");
	});

	QUnit.test("startResizing - resize column", function(assert) {
		const oColumn0DomRef = this.oTable.getColumns()[0].getDomRef(),
			oColumn1DomRef = this.oTable.getColumns()[1].getDomRef(),
			fnOnMouseMove = sinon.spy(this.oColumnResizer, "_onmousemove");

		this.oColumnResizer.startResizing(oColumn1DomRef);
		const iClientX = oColumn0DomRef.getBoundingClientRect()[this.sEndDirection];
		const oTouchStart = createTouchEvent("touchstart", oColumn0DomRef, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(fnOnMouseMove.calledOnce, "_onmousemove called");
		assert.strictEqual(this.oColumnResizer._iHoveredColumnIndex, 0, "_iHoveredColumnIndex is updated correctly via _onmousemove");
		assert.strictEqual(this.oColumnResizer._oAlternateHandle.style[this.sBeginDirection], "", "AlternateHandle is not visible");
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[0] - this.oColumnResizer._fContainerX), "Resize handle is visible");
	});

	QUnit.test("getColumnResizeButton", function(assert) {
		const oColumn = this.oTable.getColumns()[0],
			fnStartResizingSpy = sinon.spy(this.oColumnResizer, "startResizing");

		const oMatchMediaStub = sinon.stub(window, "matchMedia");
		oMatchMediaStub.withArgs("(hover:none)").returns({
			matches: true
		});

		const oResizerButton = this.oColumnResizer.getColumnResizeButton(oColumn);
		assert.ok(oResizerButton.isA("sap.m.ColumnPopoverActionItem"), "sap.m.ColumnPopoverActionItem instance returned");
		assert.strictEqual(oResizerButton.getText(), Library.getResourceBundleFor("sap.m").getText("COLUMNRESIZER_RESIZE_BUTTON"), "correct text set");
		assert.strictEqual(oResizerButton.getIcon(), "sap-icon://resize-horizontal", "correct icon set");
		assert.ok(oResizerButton.hasListeners("press"), "press event registered");

		oResizerButton.firePress(oColumn);

		assert.ok(fnStartResizingSpy.calledOnce, "startResizing called once");
		assert.ok(fnStartResizingSpy.calledWith(oColumn.getDomRef()), "startResizing called with correct args");

		oMatchMediaStub.restore();
	});

	QUnit.test("getColumnResizeQuickAction", function(assert) {
		const oColumn = this.oTable.getColumns()[0],
			oColumnMenu = new Menu(),
			fnMenuCloseSpy = sinon.spy(oColumnMenu, "close"),
			fnStartResizingSpy = sinon.spy(this.oColumnResizer, "startResizing");

		const oMatchMediaStub = sinon.stub(window, "matchMedia");
		oMatchMediaStub.withArgs("(hover:none)").returns({
			matches: true
		});

		const oResizerQuickAction = this.oColumnResizer.getColumnResizeQuickAction(oColumn, oColumnMenu);
		assert.ok(oResizerQuickAction.isA("sap.m.table.columnmenu.QuickAction"), "sap.m.table.columnmenu.QuickAction instance returned");
		assert.strictEqual(oResizerQuickAction.getLabel(), "", "label is empty");
		assert.strictEqual(oResizerQuickAction.getContent()[0].getText(), Library.getResourceBundleFor("sap.m").getText("table.COLUMNMENU_RESIZE"), "button text is correct");
		assert.ok(oResizerQuickAction.getContent()[0].hasListeners("press"), "press event registered");

		oResizerQuickAction.getContent()[0].firePress(oColumn);

		assert.ok(fnMenuCloseSpy.calledOnce, "menu close called once");
		assert.ok(fnStartResizingSpy.calledOnce, "startResizing called once");
		assert.ok(fnStartResizingSpy.calledWith(oColumn.getDomRef()), "startResizing called with correct args");

		oMatchMediaStub.restore();
	});
});