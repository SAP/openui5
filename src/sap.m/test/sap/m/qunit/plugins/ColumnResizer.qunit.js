/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Core',
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/events/KeyCodes',
	'sap/m/plugins/ColumnResizer',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/Text'
], function(
	jQuery,
	Core,
	QUtils,
	KeyCodes,
	ColumnResizer,
	Table,
	Column,
	ColumnListItem,
	Text
) {
	"use strict";

	function createResponsiveTable() {
		var oTable = new Table({
			autoPopinMode: true,
			contextualWidth: "Auto",
			columns: [
				new Column({
					header: new Text({
						text: "Column1"
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

		oTable.bActiveHeaders = true;

		return oTable;
	}

	function createTouchEvent(sEventName, oDomRef, iClientX, oColumnResizer) {
		var oEvent = jQuery.Event(sEventName);
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
		beforeEach: function() {
			this.oTable = createResponsiveTable();
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
			var bRTL = Core.getConfiguration().getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.oTable.destroy();
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("Add & deactivate ColumnResizer plugin as a dependent", function(assert) {
		assert.notOk(this.oTable.getDependents().length, "ColumnResizer plugin not added as a dependent by default");
		var oColumnResizer = new ColumnResizer();
		var fnOnActivate = sinon.spy(oColumnResizer, "onActivate");
		var fnOnDeactivate = sinon.spy(oColumnResizer, "onDeactivate");

		this.oTable.addDependent(oColumnResizer);
		assert.ok(this.oTable.getDependents().length, "Dependent added");
		assert.ok(this.oTable.getDependents()[0].isA("sap.m.plugins.ColumnResizer"), "ColumnResizer plugin added as a dependent");
		assert.ok(fnOnActivate.called, "Plugin is activated");
		assert.strictEqual(this.oTable.getFixedLayout(), "Strict", "fixedLayout='Strict'");

		oColumnResizer.setEnabled(false);
		assert.ok(fnOnDeactivate.called, "Plugin is deactivated");
		assert.strictEqual(this.oTable.getFixedLayout(), true, "fixedLayout='true', original value restored");
	});

	QUnit.test("Check Table DOM", function(assert) {
		var oTableDomRef  = this.oTable.getDomRef("listUl");
		assert.notOk(oTableDomRef.classList.contains("sapMPluginsColumnResizerContainer"), "ColumnResizer container style class not added");
		assert.notOk(oTableDomRef.children[oTableDomRef.children.length - 1].classList.contains("sapMPluginsColumnResizerHandle"), "ColumnResizer handle not created");
		var oColumnResizer = new ColumnResizer();
		this.oTable.addDependent(oColumnResizer);
		Core.applyChanges();
		assert.ok(oTableDomRef.classList.contains("sapMPluginsColumnResizerContainer"), "ColumnResizer container style class added");
		assert.notOk(oTableDomRef.children[oTableDomRef.children.length - 1].classList.contains("sapMPluginsColumnResizerHandle"), "ColumnResizer handle created");

		// get resizable <th> elements
		var aResizableColumns = Array.from(jQuery(oColumnResizer.getControlPluginConfig("resizable")));
		aResizableColumns.forEach(function(TH) {
			assert.ok(TH.classList.contains("sapMPluginsColumnResizerResizable"), "Resizable column have the correct style added");
			assert.strictEqual(document.getElementById(TH.firstChild.getAttribute("aria-describedby")).innerText, Core.getLibraryResourceBundle("sap.m").getText("COLUMNRESIZER_RESIZABLE"), "The column is resizable, announcement added");
		});

		oColumnResizer.setEnabled(false);
		Core.applyChanges();
		aResizableColumns = Array.from(jQuery(oColumnResizer.getControlPluginConfig("resizable")));
		aResizableColumns.forEach(function(TH) {
			assert.notOk(TH.classList.contains("sapMPluginsColumnResizerResizable"), "Resizable column styleClass removed");
			assert.notOk(TH.firstChild.hasAttribute("aria-describedby"), "announcement removed");
		});
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			this.oTable = createResponsiveTable();
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
			this.clock.tick(1);
			var bRTL = Core.getConfiguration().getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.clock.restore();
			this.oTable.destroy();
			this.oColumnResizer.destroy();
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("Resizer handle", function(assert) {
		var oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumnDomRef = this.oTable.getColumns()[0].getDomRef();
		assert.notOk(this.oColumnResizer._oHandle, "Column resizing handle not created");

		var fnDisplayHandle = sinon.spy(this.oColumnResizer, "_displayHandle");
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

		QUtils.triggerEvent("mouseleave", oTableDomRef);
		this.clock.tick(1);
		assert.ok(this.oColumnResizer._bPositionsInvalid, "Handle positions are invalidated");
	});

	QUnit.test("Resize handle should have a circle in mobile device", function(assert) {
		var oColumnDomRef = this.oTable.getColumns()[0].getDomRef();
		var fnMatchMediaOriginal = window.matchMedia;
		window.matchMedia = sinon.stub();
		window.matchMedia.returns({
			matches: true
		});

		this.oColumnResizer.startResizing(oColumnDomRef);
		this.clock.tick(1);
		assert.strictEqual(this.oColumnResizer._oHandle.childElementCount, 1, "Resize handle circle child element is visible since its a tablet/phone device");
		assert.ok(this.oColumnResizer._oHandle.firstChild.classList.contains("sapMPluginsColumnResizerHandleCircle"), "Correct style class added to the resize handle circle");

		window.matchMedia = fnMatchMediaOriginal;
	});

	QUnit.test("Resizing style class", function(assert) {
		var oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumn1Dom = this.oTable.getColumns()[1].getDomRef();

		var iClientX = oColumn1Dom.getBoundingClientRect()[this.sEndDirection];
		var oTouchStart = createTouchEvent("touchstart", oColumn1Dom, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oColumn1Dom, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(oTableDomRef.classList.contains("sapMPluginsColumnResizerResizing"), "sapMPluginsColumnResizerResizing styleClass added to the table DOM");

		var oTouchEnd = createTouchEvent("touchend", oColumn1Dom, iClientX, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		assert.notOk(oTableDomRef.classList.contains("sapMPluginsColumnResizerResizing"), "sapMPluginsColumnResizerResizing styleClass removed from the table DOM");
	});

	QUnit.test("Resize column", function(assert) {
		var oCurrentColumn = this.oTable.getColumns()[1],
			oCurrentColumnDom = oCurrentColumn.getDomRef(),
			oNextColumn = this.oTable.getColumns()[2];

		this.oColumnResizer.attachColumnResize(function(oEvent) {
			assert.ok(oEvent.getParameter("column"), "columnResize event fired for: " + oEvent.getParameter("column").getId());
		});

		var iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		this.oColumnResizer.startResizing(oCurrentColumnDom);
		var oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);

		var oCurrentColumnOriginalWidth = oCurrentColumn.getWidth();
		var oNextColumnOriginalWidth = oNextColumn.getWidth();
		var iHandleBeginPosition = parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]);

		var oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), iHandleBeginPosition + 20, "Handle position changed by 20px");

		var oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		Core.applyChanges();
		var oCurrentColumnUpdatedWidth = oCurrentColumn.getWidth();
		var oNextColumnUpdatedWidth = oNextColumn.getWidth();
		assert.ok(oCurrentColumnOriginalWidth !== oCurrentColumnUpdatedWidth, "CurrentColumn original width !== CurrentColumn updated width");
		assert.ok(oCurrentColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the CurrentColumn");
		assert.ok(oNextColumnOriginalWidth !== oNextColumnUpdatedWidth, "NextColumn original width !== NextColumn updated width");
		assert.ok(oNextColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the NextColumn");

		this.oTable.getColumns().forEach(function(oColumn) {
			assert.ok(oColumn.getWidth().indexOf("px") > -1, "All columns should have static width once a column is resized");
		});
	});

	QUnit.test("Resize columns with Table having dummy column", function(assert) {
		this.oTable.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("10rem");
		});
		Core.applyChanges();

		var oCurrentColumn = this.oTable.getColumns()[0],
			oCurrentColumnDom = oCurrentColumn.getDomRef(),
			oNextColumn = this.oTable.getColumns()[1],
			oDummyColumnDom = this.oTable.getDomRef("tblHeadDummyCell"),
			iDummyColumnWidth = oDummyColumnDom.getBoundingClientRect().width;

		assert.ok(iDummyColumnWidth > 0, "Dummy column is visible");

		var iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		this.clock.tick(1);
		QUtils.triggerEvent("mousemove", oCurrentColumnDom, {
			clientX: iClientX
		});
		var oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);

		var oCurrentColumnOriginalWidth = oCurrentColumn.getWidth();
		var oNextColumnOriginalWidth = oNextColumn.getWidth();
		var oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		var oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		Core.applyChanges();

		var oCurrentColumnUpdatedWidth = oCurrentColumn.getWidth();
		var oNextColumnUpdatedWidth = oNextColumn.getWidth();
		assert.ok(oCurrentColumnOriginalWidth !== oCurrentColumnUpdatedWidth, "Orignial column width != update column width");
		assert.ok(oCurrentColumnUpdatedWidth.indexOf("px") > -1, "px width applied to the column");
		assert.strictEqual(oNextColumnOriginalWidth, oNextColumnUpdatedWidth, "NextColumn width is not change since dummy column has width");
		assert.ok(iDummyColumnWidth > oDummyColumnDom.getBoundingClientRect().width, "Dummy column width reduced");
	});

	QUnit.test("Resize session should not start if valid resizable DOM is not found", function(assert) {
		var oColumnDom = this.oTable.getColumns()[1].getDomRef();
		this.clock.tick(1);
		var oTouchStart = createTouchEvent("touchstart", oColumnDom, 0, this.oColumnResizer);
		var fnStartResizeSession = sinon.spy(this.oColumnResizer, "_startResizeSession");
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(fnStartResizeSession.notCalled, "resize session not started");
	});

	QUnit.test("touchmove should not do anything if resizing session is not started", function(assert) {
		var oColumnDom = this.oTable.getColumns()[1].getDomRef();
		var iClientX = oColumnDom.getBoundingClientRect()[this.sEndDirection];
		var oTouchMove = createTouchEvent("touchmove", oColumnDom, iClientX, this.oColumnResizer);
		var fnSetSessionDistanceX = sinon.spy(this.oColumnResizer, "_setSessionDistanceX");
		this.oColumnResizer.ontouchmove(oTouchMove);
		assert.ok(fnSetSessionDistanceX.notCalled, "resize session not started");
	});

	QUnit.test("columnResize event if prevented then column(s) should not update its width", function(assert) {
		var oCurrentColumn = this.oTable.getColumns()[1],
			sColumnWidth = oCurrentColumn.getWidth(),
			oCurrentColumnDom = oCurrentColumn.getDomRef(),
			fnFireColumnResie = sinon.spy(this.oColumnResizer, "_fireColumnResize");

		this.clock.tick(1);
		this.oColumnResizer.attachColumnResize(function(oEvent) {
			oEvent.preventDefault();
		});

		var iClientX = oCurrentColumnDom.getBoundingClientRect()[this.sEndDirection];
		var oTouchStart = createTouchEvent("touchstart", oCurrentColumnDom, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oCurrentColumnDom, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);

		var oTouchMove = createTouchEvent("touchmove", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);

		var oTouchEnd = createTouchEvent("touchend", oCurrentColumnDom, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer._ontouchend(oTouchEnd);
		Core.applyChanges();

		assert.ok(fnFireColumnResie.called, "_fireColumnResize called");
		assert.strictEqual(oCurrentColumn.getWidth(), sColumnWidth, "Column width did not change due to preventDefault()");
	});

	QUnit.module("Keyboard events", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			this.oTable = createResponsiveTable();
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
			var bRTL = Core.getConfiguration().getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.clock.restore();
			this.oTable.destroy();
			this.oColumnResizer.destroy();
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("SHIFT + RIGHT_ARROW", function(assert) {
		var oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		var oNextColumn = this.oTable.getColumns()[1];
		oNextColumn.setWidth("100px");
		Core.applyChanges();

		oColumn.focus();
		QUtils.triggerKeydown(oColumn.getDomRef(), KeyCodes.ARROW_RIGHT, true);
		Core.applyChanges();
		assert.strictEqual(oColumn.getWidth(), "116px", "Column 0 has increased width by 16px");
		assert.strictEqual(oNextColumn.getWidth(), "84px", "Column 1 has decreased width by 16px");
	});

	QUnit.test("SHIFT + LEFT_ARROW", function(assert) {
		var oColumn = this.oTable.getColumns()[0];
		oColumn.setWidth("100px");
		var oNextColumn = this.oTable.getColumns()[1];
		oNextColumn.setWidth("100px");
		Core.applyChanges();

		oColumn.focus();
		QUtils.triggerKeydown(oColumn.getDomRef(), KeyCodes.ARROW_LEFT, true);
		Core.applyChanges();
		assert.strictEqual(oColumn.getWidth(), "84px", "Column 0 has decreased width by 16px");
		assert.strictEqual(oNextColumn.getWidth(), "116px", "Column 1 has increased width by 16px");
	});

	QUnit.test("Cancel column resize with 'ESC' key", function(assert) {
		var oTableDomRef = this.oTable.getDomRef("listUl"),
			oColumn = this.oTable.getColumns()[1],
			oColumnDomRef = oColumn.getDomRef();

		this.clock.tick(1);
		var iClientX = oColumnDomRef.getBoundingClientRect()[this.sEndDirection];
		var oTouchStart = createTouchEvent("touchstart", oColumnDomRef, iClientX, this.oColumnResizer);
		QUtils.triggerEvent("mousemove", oColumnDomRef, {
			clientX: iClientX
		});
		this.oColumnResizer.ontouchstart(oTouchStart);
		var oTouchMove = createTouchEvent("touchmove", oColumnDomRef, iClientX + 20, this.oColumnResizer);
		this.oColumnResizer.ontouchmove(oTouchMove);
		var fnCancelReszing = sinon.spy(this.oColumnResizer, "_cancelResizing");
		QUtils.triggerKeydown(oTableDomRef, KeyCodes.ESCAPE);
		assert.ok(fnCancelReszing.called, "Column resizing cancelled");
	});


	QUnit.module("API", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			this.oTable = createResponsiveTable();
			this.oColumnResizer = new ColumnResizer();
			this.oTable.addDependent(this.oColumnResizer);
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
			this.clock.tick(1);
			var bRTL = Core.getConfiguration().getRTL();
			this.sBeginDirection = bRTL ? "right" : "left";
			this.sEndDirection = bRTL ? "left" : "right";
			this.iDirectionFactor = bRTL ? -1 : 1;
		},
		afterEach: function() {
			this.clock.restore();
			this.oTable.destroy();
			this.oColumnResizer.destroy();
			this.sBeginDirection = null;
			this.sEndDirection = null;
			this.iDirectionFactor = null;
		}
	});

	QUnit.test("startResizing", function(assert) {
		var oColumnDomRef = this.oTable.getColumns()[1].getDomRef(),
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
		var oColumnDomRef = this.oTable.getColumns()[0].getDomRef();

		this.oColumnResizer.startResizing(oColumnDomRef);
		assert.ok(this.oColumnResizer._oHandle, "Resize handle is created");
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[0] - this.oColumnResizer._fContainerX), "Resize handle is visible");
		assert.ok(this.oColumnResizer._oAlternateHandle, "Alternate handle is created");
		assert.strictEqual(this.oColumnResizer._oAlternateHandle.style[this.sBeginDirection], "", "AlternateHandle is not visible");
	});

	QUnit.test("startResizing - resize column", function(assert) {
		var oColumn0DomRef = this.oTable.getColumns()[0].getDomRef(),
			oColumn1DomRef = this.oTable.getColumns()[1].getDomRef(),
			fnOnMouseMove = sinon.spy(this.oColumnResizer, "_onmousemove");

		this.oColumnResizer.startResizing(oColumn1DomRef);
		var iClientX = oColumn0DomRef.getBoundingClientRect()[this.sEndDirection];
		var oTouchStart = createTouchEvent("touchstart", oColumn0DomRef, iClientX, this.oColumnResizer);
		this.oColumnResizer.ontouchstart(oTouchStart);
		assert.ok(fnOnMouseMove.calledOnce, "_onmousemove called");
		assert.strictEqual(this.oColumnResizer._iHoveredColumnIndex, 0, "_iHoveredColumnIndex is updated correctly via _onmousemove");
		assert.strictEqual(this.oColumnResizer._oAlternateHandle.style[this.sBeginDirection], "", "AlternateHandle is not visible");
		assert.strictEqual(parseInt(this.oColumnResizer._oHandle.style[this.sBeginDirection]), parseInt(this.oColumnResizer._aPositions[0] - this.oColumnResizer._fContainerX), "Resize handle is visible");
	});
});