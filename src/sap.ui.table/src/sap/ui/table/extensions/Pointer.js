/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Pointer.
sap.ui.define([
	"./ExtensionBase",
	"../utils/TableUtils",
	"../library",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/Popup",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(ExtensionBase, TableUtils, library, Device, Element, Popup, Log, jQuery) {
	"use strict";

	// shortcuts
	const SelectionMode = library.SelectionMode;
	const SelectionBehavior = library.SelectionBehavior;

	const KNOWNCLICKABLECONTROLS = [
		"sapMBtnBase", "sapMInputBase", "sapMLnk", "sapMSlt",
		"sapMCb", "sapMRI", "sapMSegBBtn", "sapUiIconPointer", "sapMBtnIcon", "sapMObjStatusActive"];

	/*
	 * Provides utility functions used this extension
	 */
	const ExtensionHelper = {

		/*
		 * Returns true, when the given click event should be skipped because it happened on a
		 * interactive control inside a table cell.
		 */
		_skipClick: function(oEvent, $Target, oCellInfo) {
			if (!oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL | TableUtils.CELLTYPE.ROWACTION)) {
				return false;
			}

			// Common preferred way to avoid handling the click event
			if (oEvent.isMarked()) {
				return true;
			}

			// Special handling for known clickable controls
			const oClickedControl = Element.closestTo($Target[0]);
			if (oClickedControl) {
				const $ClickedControl = oClickedControl.$();
				if ($ClickedControl.length) {
					for (let i = 0; i < KNOWNCLICKABLECONTROLS.length; i++) {
						if ($ClickedControl.hasClass(KNOWNCLICKABLECONTROLS[i])) {
							return typeof oClickedControl.getEnabled === "function" ? oClickedControl.getEnabled() : true;
						}
					}
				}
			}

			return false;
		},

		/*
		 * Changes the selection based on the given click event on the given row selector, data cell or row action cell.
		 */
		_handleClickSelection: function(oEvent, $Cell, oTable) {
			TableUtils.toggleRowSelection(oTable, $Cell, null, function(oRow) {
				const oSelectionPlugin = oTable._getSelectionPlugin();

				if (oEvent.shiftKey) { // Range
					oSelectionPlugin.setSelected(oRow, true, {range: true});
				} else if (oTable._legacyMultiSelection) {
					oTable._legacyMultiSelection(oRow.getIndex(), oEvent);
				} else {
					oSelectionPlugin.setSelected(oRow, !oSelectionPlugin.isSelected(oRow));
				}
			});
		}
	};

	/*
	 * Provides helper functionality (e.g. drag&drop capabilities) for column resizing.
	 */
	const ColumnResizeHelper = {

		/*
		 * Initializes the drag&drop for resizing
		 */
		initColumnResizing: function(oTable, oEvent) {
			if (oTable._bIsColumnResizerMoving) {
				return;
			}

			oTable._bIsColumnResizerMoving = true;
			oTable._bColumnResizerMoved = false;
			oTable._iColumnResizeStart = TableUtils.getEventPosition(oEvent, oTable).x;
			oTable.$().toggleClass("sapUiTableResizing", true);

			const $Document = jQuery(document);
			const bTouch = oTable._isTouchEvent(oEvent);

			oTable._$colResize = oTable.$("rsz");

			$Document.on((bTouch ? "touchend" : "mouseup") + ".sapUiTableColumnResize",
				ColumnResizeHelper.exitColumnResizing.bind(oTable));
			$Document.on((bTouch ? "touchmove" : "mousemove") + ".sapUiTableColumnResize",
				ColumnResizeHelper.onMouseMoveWhileColumnResizing.bind(oTable));

			oTable._disableTextSelection();
		},

		/*
		 * Drops the previous dragged column resize bar and recalculates the new column width.
		 */
		exitColumnResizing: function(oEvent) {
			const iLocationX = TableUtils.getEventPosition(oEvent, this).x;
			const oColumn = this._getVisibleColumns()[this._iLastHoveredVisibleColumnIndex];
			const $RelevantColumnElement = this.$().find("th[data-sap-ui-colid=\"" + oColumn.getId() + "\"]"); // Consider span and multi-header
			const iColumnWidth = $RelevantColumnElement[0].offsetWidth; // the width of the column with padding and border
			const iInnerWidth = $RelevantColumnElement.width(); // the content width of the column without padding and border
			const iPaddingAndBorder = iColumnWidth - iInnerWidth;
			const iDeltaX = iLocationX - ($RelevantColumnElement.offset().left + (this._bRtlMode ? 0 : iColumnWidth));
			const iCalculatedColumnWidth = Math.round(iColumnWidth + iDeltaX * (this._bRtlMode ? -1 : 1)) - iPaddingAndBorder;
			const iNewColumnWidth = Math.max(iCalculatedColumnWidth, TableUtils.Column.getMinColumnWidth());

			ColumnResizeHelper._cleanupColumResizing(this);
			TableUtils.Column.resizeColumn(this, oColumn, this._bColumnResizerMoved ? iNewColumnWidth : null);
		},

		/*
		 * Handler for the move events while dragging the column resize bar.
		 */
		onMouseMoveWhileColumnResizing: function(oEvent) {
			const iLocationX = TableUtils.getEventPosition(oEvent, this).x;
			const iRszOffsetLeft = this.$().find(".sapUiTableCnt").offset().left;
			const iRszLeft = Math.floor(iLocationX - iRszOffsetLeft);

			if (!this._bColumnResizerMoved && Math.abs(iLocationX - this._iColumnResizeStart) >= 5) {
				this._bColumnResizerMoved = true;
			}

			this._$colResize.css("left", iRszLeft + "px");
			this._$colResize.toggleClass("sapUiTableColRszActive", true);

			if (this._isTouchEvent(oEvent)) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		},

		/**
		 * Cleans up the state which is created while resizing a column via drag&drop.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 */
		_cleanupColumResizing: function(oTable) {
			if (oTable._$colResize) {
				oTable._$colResize.toggleClass("sapUiTableColRszActive", false);
				oTable._$colResize = null;
			}
			oTable._bIsColumnResizerMoving = false;
			oTable.$().toggleClass("sapUiTableResizing", false);
			oTable._enableTextSelection();

			const $Document = jQuery(document);
			$Document.off("touchmove.sapUiTableColumnResize");
			$Document.off("touchend.sapUiTableColumnResize");
			$Document.off("mousemove.sapUiTableColumnResize");
			$Document.off("mouseup.sapUiTableColumnResize");
		},

		/*
		 * Initialize the event listener for positioning the column resize bar and computing the currently hovered column.
		 */
		initColumnTracking: function(oTable) {
			// attach mousemove listener to update resizer position
			oTable.$().find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").on("mousemove", function(oEvent) {
				const oDomRef = this.getDomRef("sapUiTableCnt");

				if (!oDomRef || this._bIsColumnResizerMoving) {
					return;
				}

				const iPositionX = oEvent.clientX;
				const iTableRect = oDomRef.getBoundingClientRect();
				let iLastHoveredColumn = 0;
				let iResizerPositionX = this._bRtlMode ? 10000 : -10000;

				for (let i = 0; i < this._aTableHeaders.length; i++) {
					const oTableHeaderRect = this._aTableHeaders[i].getBoundingClientRect();
					if (this._bRtlMode) {
						// 5px for resizer width
						if ((iPositionX < oTableHeaderRect.right - 5) && (iPositionX >= oTableHeaderRect.left)) {
							iLastHoveredColumn = i;
							iResizerPositionX = oTableHeaderRect.left - iTableRect.left;
							break;
						}
					} else {
						// 5px for resizer width
						if ((iPositionX > oTableHeaderRect.left + 5) && (iPositionX <= oTableHeaderRect.right)) {
							iLastHoveredColumn = i;
							iResizerPositionX = oTableHeaderRect.right - iTableRect.left;
							break;
						}
					}
				}

				const oColumn = this._getVisibleColumns()[iLastHoveredColumn];
				if (oColumn && oColumn.getResizable()) {
					this.$("rsz").css("left", iResizerPositionX + "px");
					this._iLastHoveredVisibleColumnIndex = iLastHoveredColumn;
				}
			}.bind(oTable));
		}
	};

	/*
	 * Provides drag&drop capabilities for column reordering.
	 */
	const ReorderHelper = {

		/*
		 * Initializes the drag&drop for reordering
		 */
		initReordering: function(oTable, iColIndex, oEvent) {
			const oColumn = oTable.getColumns()[iColIndex];
			const $Col = oColumn.$();
			const $Table = oTable.$();

			oTable._disableTextSelection();
			$Table.addClass("sapUiTableDragDrop");

			// Initialize the Ghost
			const $Ghost = $Col.clone();
			$Ghost.find("*").addBack($Ghost).removeAttr("id")
				  .removeAttr("data-sap-ui")
				  .removeAttr("tabindex");
			$Ghost.attr("id", oTable.getId() + "-roghost")
				  .addClass("sapUiTableColReorderGhost")
				  .css({
					  "left": -10000,
					  "top": -10000,
					  "z-index": Popup.getNextZIndex()
				  });
			$Ghost.toggleClass(TableUtils.getContentDensity(oTable), true);
			$Ghost.appendTo(document.body);
			oTable._$ReorderGhost = oTable.getDomRef("roghost");

			// Fade out whole column
			$Table.find("td[data-sap-ui-colid='" + oColumn.getId() + "']").toggleClass("sapUiTableColReorderFade", true);

			// Initialize the Indicator where to insert
			const $Indicator = jQuery("<div id='" + oTable.getId()
									+ "-roind' class='sapUiTableColReorderIndicator'><div class='sapUiTableColReorderIndicatorArrow'></div><div class='sapUiTableColReorderIndicatorInner'></div></div>");
			$Indicator.appendTo(oTable.getDomRef("sapUiTableCnt"));
			oTable._$ReorderIndicator = oTable.getDomRef("roind");

			// Collect the needed column information
			oTable._iDnDColIndex = iColIndex;

			// Bind the event handlers
			const $Document = jQuery(document);
			const bTouch = oTable._isTouchEvent(oEvent);
			$Document.on((bTouch ? "touchend" : "mouseup") + ".sapUiColumnMove", ReorderHelper.exitReordering.bind(oTable));
			$Document.on((bTouch ? "touchmove" : "mousemove") + ".sapUiColumnMove", ReorderHelper.onMouseMoveWhileReordering.bind(oTable));
		},

		/*
		 * Handler for the move events while dragging for reordering.
		 * Reposition the ghost.
		 */
		onMouseMoveWhileReordering: function(oEvent) {
			const oEventPosition = TableUtils.getEventPosition(oEvent, this);
			const iLocationX = oEventPosition.x;
			const iLocationY = oEventPosition.y;
			const iOldColPos = this._iNewColPos;

			this._iNewColPos = this._iDnDColIndex;

			oEvent.preventDefault(); // Avoid default actions e.g. scrolling on mobile devices

			const oPos = ReorderHelper.findColumnForPosition(this, iLocationX);

			if (!oPos || !oPos.id) {
				//Special handling for dummy column (in case the other columns does not occupy the whole space),
				//row selectors and row actions
				this._iNewColPos = iOldColPos;
				return;
			}

			// do scroll if needed
			const iScrollTriggerAreaWidth = 40;
			const oScrollArea = this.getDomRef("sapUiTableColHdrScr");
			const $ScrollArea = jQuery(oScrollArea);
			const oScrollAreaRect = oScrollArea.getBoundingClientRect();
			const iScrollAreaWidth = $ScrollArea.outerWidth();
			const iScrollAreaScrollLeft = this._bRtlMode ? $ScrollArea.scrollLeftRTL() : $ScrollArea.scrollLeft();

			this._bReorderScroll = false;

			if (iLocationX > oScrollAreaRect.left + iScrollAreaWidth - iScrollTriggerAreaWidth
				&& iScrollAreaScrollLeft + iScrollAreaWidth < oScrollArea.scrollWidth) {
				this._bReorderScroll = true;
				ReorderHelper.doScroll(this, !this._bRtlMode);
				ReorderHelper.adaptReorderMarkerPosition(this, oPos, false);
			} else if (iLocationX < oScrollAreaRect.left + iScrollTriggerAreaWidth
					   && iScrollAreaScrollLeft > 0) {
				this._bReorderScroll = true;
				ReorderHelper.doScroll(this, this._bRtlMode);
				ReorderHelper.adaptReorderMarkerPosition(this, oPos, false);
			}

			// update the ghost position
			jQuery(this._$ReorderGhost).css({
				"left": iLocationX + 5,
				"top": iLocationY + 5
			});

			if (this._bReorderScroll || !oPos) {
				return;
			}

			if (oPos.before || (oPos.after && oPos.index === this._iDnDColIndex)) {
				this._iNewColPos = oPos.index;
			} else if (oPos.after && oPos.index !== this._iDnDColIndex) {
				this._iNewColPos = oPos.index + 1;
			}

			if (!TableUtils.Column.isColumnMovableTo(this.getColumns()[this._iDnDColIndex], this._iNewColPos)) { // prevent the reordering of the fixed columns
				this._iNewColPos = iOldColPos;
			} else {
				ReorderHelper.adaptReorderMarkerPosition(this, oPos, true);
			}
		},

		/*
		 * Ends the column reordering process via drag&drop.
		 */
		exitReordering: function(oEvent) {
			const iOldIndex = this._iDnDColIndex;
			const iNewIndex = this._iNewColPos;

			// Unbind the event handlers
			const $Document = jQuery(document);
			$Document.off("touchmove.sapUiColumnMove");
			$Document.off("touchend.sapUiColumnMove");
			$Document.off("mousemove.sapUiColumnMove");
			$Document.off("mouseup.sapUiColumnMove");

			this._bReorderScroll = false;

			// Cleanup globals
			this.$().removeClass("sapUiTableDragDrop");
			delete this._iDnDColIndex;
			delete this._iNewColPos;

			jQuery(this._$ReorderGhost).remove();
			delete this._$ReorderGhost;
			jQuery(this._$ReorderIndicator).remove();
			delete this._$ReorderIndicator;
			this.$().find(".sapUiTableColReorderFade").removeClass("sapUiTableColReorderFade");

			this._enableTextSelection();
			TableUtils.Column.moveColumnTo(this.getColumns()[iOldIndex], iNewIndex);
		},

		/*
		 * Finds the column which belongs to the current x position and returns information about this column.
		 */
		findColumnForPosition: function(oTable, iLocationX) {
			let oHeaderDomRef; let $HeaderDomRef; let oRect; let iWidth; let oPos; let bBefore; let bAfter;

			for (let i = 0; i < oTable._aTableHeaders.length; i++) {
				oHeaderDomRef = oTable._aTableHeaders[i];
				$HeaderDomRef = jQuery(oHeaderDomRef);
				oRect = oHeaderDomRef.getBoundingClientRect();
				iWidth = $HeaderDomRef.outerWidth();
				oPos = {
					left: oRect.left,
					center: oRect.left + iWidth / 2,
					right: oRect.left + iWidth,
					width: iWidth,
					index: parseInt($HeaderDomRef.attr("data-sap-ui-headcolindex")),
					id: $HeaderDomRef.attr("data-sap-ui-colid")
				};

				bBefore = iLocationX >= oPos.left && iLocationX <= oPos.center;
				bAfter = iLocationX >= oPos.center && iLocationX <= oPos.right;

				if (bBefore || bAfter) {
					oPos.before = oTable._bRtlMode ? bAfter : bBefore;
					oPos.after = oTable._bRtlMode ? bBefore : bAfter;
					return oPos;
				}
			}

			return null;
		},

		/*
		 * Starts or continues stepwise horizontal scrolling until oTable._bReorderScroll is false.
		 */
		doScroll: function(oTable, bForward) {
			if (oTable._mTimeouts.horizontalReorderScrollTimerId) {
				window.clearTimeout(oTable._mTimeouts.horizontalReorderScrollTimerId);
				oTable._mTimeouts.horizontalReorderScrollTimerId = null;
			}
			if (oTable._bReorderScroll) {
				let iStep = bForward ? 30 : -30;
				if (oTable._bRtlMode) {
					iStep = (-1) * iStep;
				}
				oTable._mTimeouts.horizontalReorderScrollTimerId = setTimeout(ReorderHelper.doScroll.bind(oTable, oTable, bForward), 60);
				const $Scr = oTable.$("sapUiTableColHdrScr");
				const ScrollLeft = oTable._bRtlMode ? "scrollLeftRTL" : "scrollLeft";
				$Scr[ScrollLeft]($Scr[ScrollLeft]() + iStep);
			}
		},

		/*
		 * Positions the reorder marker on the column (given by the position information).
		 * @see findColumnForPosition
		 */
		adaptReorderMarkerPosition: function(oTable, oPos, bShow) {
			if (!oPos || !oTable._$ReorderIndicator) {
				return;
			}

			let iLeft = oPos.left - oTable.getDomRef().getBoundingClientRect().left;
			if (oTable._bRtlMode && oPos.before || !oTable._bRtlMode && oPos.after) {
				iLeft = iLeft + oPos.width;
			}

			jQuery(oTable._$ReorderIndicator).css({
				"left": iLeft + "px"
			}).toggleClass("sapUiTableColReorderIndicatorActive", bShow);
		}

	};

	/*
	 * Provides the event handling for the row hover effect.
	 */
	const RowHoverHandler = {

		ROWAREAS: [
			".sapUiTableRowSelectionCell", ".sapUiTableRowActionCell", ".sapUiTableCtrlFixed > tbody > .sapUiTableTr",
			".sapUiTableCtrlScroll > tbody > .sapUiTableTr"
		],

		initRowHovering: function(oTable) {
			const $Table = oTable.$();
			RowHoverHandler.ROWAREAS.forEach(function(sRowArea) {
				RowHoverHandler._initRowHoveringForArea(oTable, $Table, sRowArea);
			});
		},

		_initRowHoveringForArea: function(oTable, $Table, sArea) {
			$Table.find(sArea).on("mouseenter", function() {
				RowHoverHandler._onHover(oTable, $Table, sArea, this);
			}).on("mouseleave", function() {
				RowHoverHandler._onUnhover(oTable, $Table, sArea, this);
			});
		},

		_onHover: function(oTable, $Table, sArea, oElem) {
			if ((oTable.getSelectionMode() !== SelectionMode.None && oTable.getSelectionBehavior() !== SelectionBehavior.RowSelector) || oTable.hasListeners("cellClick")) {
				const iIndex = $Table.find(sArea).index(oElem);
				const oRow = oTable.getRows()[iIndex];

				if (oRow) {
					oRow._setHovered(true);
				}
			}
		},

		_onUnhover: function(oTable, $Table, sArea, oElem) {
			const iIndex = $Table.find(sArea).index(oElem);
			const oRow = oTable.getRows()[iIndex];

			if (oRow) {
				oRow._setHovered(false);
			}
		}

	};

	/*
	 * Event handling of touch and mouse events.
	 * "this" in the function context is the table instance.
	 */
	const ExtensionDelegate = {

		onmousedown: function(oEvent) {
			const oPointerExtension = this._getPointerExtension();
			const $Cell = TableUtils.getCell(this, oEvent.target);
			const oCellInfo = TableUtils.getCellInfo($Cell);
			const $Target = jQuery(oEvent.target);
			let oColumn;
			let oMenu;
			let bMenuOpen;

			// check whether item navigation should be reapplied from scratch
			this._getKeyboardExtension().initItemNavigation();

			if (oEvent.button === 0) { // left mouse button
				if (oEvent.target === this.getDomRef("rsz")) { // mousedown on column resize bar
					oEvent.preventDefault();
					oEvent.stopPropagation();
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if ($Target.hasClass("sapUiTableColResizer")) { // mousedown on mobile column resize button
					const iColumnIndex = $Target.closest(".sapUiTableHeaderCell").attr("data-sap-ui-colindex");
					this._iLastHoveredVisibleColumnIndex = this._getVisibleColumns().indexOf(this.getColumns()[iColumnIndex]);
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
					oColumn = this.getColumns()[oCellInfo.columnIndex];
					oMenu = oColumn.getAggregation("menu");
					bMenuOpen = oMenu && oMenu.isOpen();

					if (!bMenuOpen) {
						// A long click starts column reordering, so it should not also open the menu in the onclick event handler.
						oPointerExtension._bShowMenu = true;
						this._mTimeouts.delayedMenuTimerId = setTimeout(function() {
							delete oPointerExtension._bShowMenu;
						}, 200);
					}

					if (this.getEnableColumnReordering()
						&& !(this._isTouchEvent(oEvent)
						&& $Target.hasClass("sapUiTableColDropDown")) /* Target is not the mobile column menu button */) {
						// Start column reordering
						this._getPointerExtension().doReorderColumn(oCellInfo.columnIndex, oEvent);
					}
				}

				// In case of FireFox and CTRL+CLICK it selects the target TD
				//   => prevent the default behavior only in this case (to still allow text selection)
				// Also prevent default when clicking on scrollbars to prevent ItemNavigation to re-apply
				// focus to old position (table cell).
				if ((Device.browser.firefox && (oEvent.metaKey || oEvent.ctrlKey))
					|| $Target.closest(".sapUiTableHSb", this.getDomRef()).length === 1
					|| $Target.closest(".sapUiTableVSb", this.getDomRef()).length === 1) {
					oEvent.preventDefault();
				}
			}

			if (oEvent.button === 2) { // Right mouse button.
				if (ExtensionHelper._skipClick(oEvent, $Target, oCellInfo)) {
					oPointerExtension._bShowDefaultMenu = true;
					return;
				}

				if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
					oColumn = this.getColumns()[oCellInfo.columnIndex];
					oMenu = oColumn.getAggregation("menu");
					bMenuOpen = oMenu && oMenu.isOpen();

					if (!bMenuOpen) {
						oPointerExtension._bShowMenu = true;
					} else {
						oPointerExtension._bHideMenu = true;
					}
				} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL)) {
					oPointerExtension._bShowMenu = true;
				} else {
					oPointerExtension._bShowDefaultMenu = true;
				}
			}
		},

		onmouseup: function(oEvent) {
			// clean up the timer
			clearTimeout(this._mTimeouts.delayedColumnReorderTimerId);
		},

		ondblclick: function(oEvent) {
			if (Device.system.desktop && oEvent.target === this.getDomRef("rsz")) {
				oEvent.preventDefault();
				ColumnResizeHelper._cleanupColumResizing(this);

				const oColumn = this._getVisibleColumns()[this._iLastHoveredVisibleColumnIndex];

				if (oColumn.getAutoResizable()) {
					oColumn.autoResize();
				}
			}
		},

		ontap: function(oEvent) {
			// clean up the timer
			clearTimeout(this._mTimeouts.delayedColumnReorderTimerId);

			if (oEvent.isMarked()) {
				// the event was already handled by some other handler, do nothing.
				return;
			}

			const $Target = jQuery(oEvent.target);
			const $Cell = TableUtils.getCell(this, oEvent.target);
			const oCellInfo = TableUtils.getCellInfo($Cell);
			const oRow = this.getRows()[oCellInfo.rowIndex];

			if (!oCellInfo.isOfType(TableUtils.CELLTYPE.ANY)) {
				return;
			}

			if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
				const oPointerExtension = this._getPointerExtension();

				if (oPointerExtension._bShowMenu) {
					TableUtils.Menu.openContextMenu(this, oEvent);
					delete oPointerExtension._bShowMenu;
				}
			} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER)) {
				this._getSelectionPlugin().onHeaderSelectorPress();
			} else if (oRow && oRow.isSummary()) {
				// Sum row cannot be selected
				oEvent.preventDefault();
			} else if ($Target.hasClass("sapUiTableGroupMenuButton")) {
				// Analytical Table: Mobile group menu button in group header rows.
				TableUtils.Menu.openContextMenu(this, oEvent);
			} else if ($Target.hasClass("sapUiTableGroupIcon") || $Target.hasClass("sapUiTableTreeIcon")) {
				// Expand/Collapse icon
				oRow.toggleExpandedState();
			} else {
				if (ExtensionHelper._skipClick(oEvent, $Target, oCellInfo)) {
					return;
				}

				const sSelectedText = window.getSelection().toString();
				if (!oEvent.shiftKey && sSelectedText.length > 0 && sSelectedText !== "\n") {
					Log.debug("DOM Selection detected -> Click event on table skipped, Target: " + oEvent.target);
					return;
				}

				if (!this._findAndfireCellEvent(this.fireCellClick, oEvent)) {
					ExtensionHelper._handleClickSelection(oEvent, $Cell, this);
				} else {
					oEvent.preventDefault();
				}
			}
		},

		oncontextmenu: function(oEvent) {
			const oPointerExtension = this._getPointerExtension();

			if (oPointerExtension._bShowDefaultMenu) {
				oEvent.setMarked("sapUiTableHandledByPointerExtension");
				delete oPointerExtension._bShowDefaultMenu;

			} else if (oPointerExtension._bShowMenu) {
				TableUtils.Menu.openContextMenu(this, oEvent);
				oEvent.setMarked("sapUiTableHandledByPointerExtension");
				delete oPointerExtension._bShowMenu;

			} else if (oPointerExtension._bHideMenu) {
				oEvent.setMarked("sapUiTableHandledByPointerExtension");
				oEvent.preventDefault(); // To prevent opening the default browser context menu.
				delete oPointerExtension._bHideMenu;
			}
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles mouse and touch related things.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library is
	 * strictly prohibited!</b>
	 *
	 * @class Extension for sap.ui.table.Table which handles mouse and touch related things.
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.Pointer
	 */
	const PointerExtension = ExtensionBase.extend("sap.ui.table.extensions.Pointer",
		/** @lends sap.ui.table.extensions.Pointer.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._delegate = ExtensionDelegate;

			// Register the delegate
			TableUtils.addDelegate(oTable, this._delegate, oTable);

			oTable._iLastHoveredVisibleColumnIndex = 0;
			oTable._bIsColumnResizerMoving = false;
			oTable._iFirstReorderableIndex = sTableType === ExtensionBase.TABLETYPES.TREE ? 1 : 0;

			return "PointerExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			const oTable = this.getTable();
			if (oTable) {
				// Initialize the basic event handling for column resizing.
				ColumnResizeHelper.initColumnTracking(oTable);
				RowHoverHandler.initRowHovering(oTable);
			}
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			const oTable = this.getTable();
			if (oTable) {
				const $Table = oTable.$();

				// Cleans up the basic event handling for column resizing (and others).
				$Table.find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").off();

				// Cleans up the basic event handling for row hover effect
				$Table.find(".sapUiTableCtrl > tbody > tr").off();
				$Table.find(".sapUiTableRowSelectionCell").off();
			}
		},

		/**
		 * Enables debugging for the extension. Internal helper classes become accessible.
		 *
		 * @private
		 */
		_debug: function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ColumnResizeHelper = ColumnResizeHelper;
			this._ReorderHelper = ReorderHelper;
			this._ExtensionDelegate = ExtensionDelegate;
			this._RowHoverHandler = RowHoverHandler;
			this._KNOWNCLICKABLECONTROLS = KNOWNCLICKABLECONTROLS;
		},

		/**
		 * Initialize the basic event handling for column reordering and starts the reordering.
		 *
		 * @param {int} iColIndex The index of the column to resize.
		 * @param {jQuery.Event} oEvent The event object.
		 */
		doReorderColumn: function(iColIndex, oEvent) {
			const oTable = this.getTable();
			if (oTable && TableUtils.Column.isColumnMovable(oTable.getColumns()[iColIndex])) {
				// Starting column drag & drop. We wait 200ms to make sure it is no click on the column to open the menu.
				oTable._mTimeouts.delayedColumnReorderTimerId = setTimeout(function() {
					ReorderHelper.initReordering(this, iColIndex, oEvent);
				}.bind(oTable), 200);
			}
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			// Deregister the delegates
			const oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			ExtensionBase.prototype.destroy.apply(this, arguments);
		}

	});

	return PointerExtension;
	});

/**
 * Gets the pointer extension.
 *
 * @name sap.ui.table.Table#_getPointerExtension
 * @function
 * @returns {sap.ui.table.extensions.Pointer} The pointer extension.
 * @private
 */