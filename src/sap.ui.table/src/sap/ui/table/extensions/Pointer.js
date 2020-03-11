/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Pointer.
sap.ui.define([
	"./ExtensionBase",
	"../utils/TableUtils",
	"../library",
	"sap/ui/Device",
	"sap/ui/core/Popup",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/scrollLeftRTL",
	"sap/ui/dom/jquery/control"
], function(ExtensionBase, TableUtils, library, Device, Popup, Log, jQuery) {
	"use strict";

	// shortcuts
	var SelectionMode = library.SelectionMode;

	var KNOWNCLICKABLECONTROLS = [
		"sapMBtnBase", "sapMInputBase", "sapMLnk", "sapMSlt",
		"sapMCb", "sapMRI", "sapMSegBBtn", "sapUiIconPointer", "sapMBtnIcon"];

	/*
	 * Provides utility functions used this extension
	 */
	var ExtensionHelper = {

		/*
		 * Returns the pageX and pageY position of the given mouse/touch event.
		 */
		_getEventPosition: function(oEvent, oTable) {
			var oPosition;

			function getTouchObject(oTouchEvent) {
				if (!oTable._isTouchEvent(oTouchEvent)) {
					return null;
				}

				var aTouchEventObjectNames = ["touches", "targetTouches", "changedTouches"];

				for (var i = 0; i < aTouchEventObjectNames.length; i++) {
					var sTouchEventObjectName = aTouchEventObjectNames[i];

					if (oEvent[sTouchEventObjectName] && oEvent[sTouchEventObjectName][0]) {
						return oEvent[sTouchEventObjectName][0];
					}
					if (oEvent.originalEvent[sTouchEventObjectName] && oEvent.originalEvent[sTouchEventObjectName][0]) {
						return oEvent.originalEvent[sTouchEventObjectName][0];
					}
				}

				return null;
			}

			oPosition = getTouchObject(oEvent) || oEvent;

			return {x: oPosition.pageX, y: oPosition.pageY};
		},

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
			var oClickedControl = $Target.control(0);
			if (oClickedControl) {
				var $ClickedControl = oClickedControl.$();
				if ($ClickedControl.length) {
					for (var i = 0; i < KNOWNCLICKABLECONTROLS.length; i++) {
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
			TableUtils.toggleRowSelection(oTable, $Cell, null, function(iRowIndex) {
				var oSelectionPlugin = oTable._getSelectionPlugin();

				// IE and Edge perform a text selection if holding shift while clicking. This is not desired for range selection of rows.
				if ((Device.browser.msie || Device.browser.edge) && oEvent.shiftKey) {
					oTable._clearTextSelection();
				}

				var oSelMode = oTable.getSelectionMode();

				// Single selection
				if (oSelMode === SelectionMode.Single) {
					if (!oSelectionPlugin.isIndexSelected(iRowIndex)) {
						oSelectionPlugin.setSelectedIndex(iRowIndex);
					} else {
						oSelectionPlugin.clearSelection();
					}

				// Multi selection (range)
				} else if (oEvent.shiftKey) {
					// If no row is selected, getSelectedIndex returns -1. Then we simply select the clicked row.
					var iSelectedIndex = oSelectionPlugin.getSelectedIndex();
					if (iSelectedIndex >= 0) {
						oSelectionPlugin.addSelectionInterval(iSelectedIndex, iRowIndex);
					} else if (oSelectionPlugin.getSelectedCount() === 0) {
						oSelectionPlugin.setSelectedIndex(iRowIndex);
					}

				// Multi selection (toggle)
				} else if (!oTable._legacyMultiSelection) {
					if (!oSelectionPlugin.isIndexSelected(iRowIndex)) {
						oSelectionPlugin.addSelectionInterval(iRowIndex, iRowIndex);
					} else {
						oSelectionPlugin.removeSelectionInterval(iRowIndex, iRowIndex);
					}

				// Multi selection (legacy)
				} else {
					oTable._legacyMultiSelection(iRowIndex, oEvent);
				}

				return true;
			});
		}
	};

	/*
	 * Provides helper functionality (e.g. drag&drop capabilities) for column resizing.
	 */
	var ColumnResizeHelper = {

		/*
		 * Initializes the drag&drop for resizing
		 */
		initColumnResizing: function(oTable, oEvent) {
			if (oTable._bIsColumnResizerMoving) {
				return;
			}

			oTable._bIsColumnResizerMoving = true;
			oTable.$().toggleClass("sapUiTableResizing", true);

			var $Document = jQuery(document),
				bTouch = oTable._isTouchEvent(oEvent);

			oTable._$colResize = oTable.$("rsz");

			$Document.bind((bTouch ? "touchend" : "mouseup") + ".sapUiTableColumnResize",
				ColumnResizeHelper.exitColumnResizing.bind(oTable));
			$Document.bind((bTouch ? "touchmove" : "mousemove") + ".sapUiTableColumnResize",
				ColumnResizeHelper.onMouseMoveWhileColumnResizing.bind(oTable));

			oTable._disableTextSelection();
		},

		/*
		 * Drops the previous dragged column resize bar and recalculates the new column width.
		 */
		exitColumnResizing: function(oEvent) {
			var iLocationX = ExtensionHelper._getEventPosition(oEvent, this).x;
			var oColumn = this._getVisibleColumns()[this._iLastHoveredVisibleColumnIndex];
			var $RelevantColumnElement = this.$().find("th[data-sap-ui-colid=\"" + oColumn.getId() + "\"]"); // Consider span and multi-header
			var iColumnWidth = $RelevantColumnElement[0].offsetWidth;
			var iDeltaX = iLocationX - ($RelevantColumnElement.offset().left + (this._bRtlMode ? 0 : iColumnWidth));
			var iCalculatedColumnWidth = Math.round(iColumnWidth + iDeltaX * (this._bRtlMode ? -1 : 1));
			var iNewColumnWidth = Math.max(iCalculatedColumnWidth, TableUtils.Column.getMinColumnWidth());

			ColumnResizeHelper._resizeColumn(this, this._iLastHoveredVisibleColumnIndex, iNewColumnWidth);
		},

		/*
		 * Handler for the move events while dragging the column resize bar.
		 */
		onMouseMoveWhileColumnResizing: function(oEvent) {
			var iLocationX = ExtensionHelper._getEventPosition(oEvent, this).x;
			var iRszOffsetLeft = this.$().find(".sapUiTableCnt").offset().left;
			var iRszLeft = Math.floor(iLocationX - iRszOffsetLeft);

			this._$colResize.css("left", iRszLeft + "px");
			this._$colResize.toggleClass("sapUiTableColRszActive", true);

			if (this._isTouchEvent(oEvent)) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		},

		/*
		 * Cleans up the state which is created while resize a column via drag&drop.
		 */
		_cleanupColumResizing: function(oTable) {
			if (oTable._$colResize) {
				oTable._$colResize.toggleClass("sapUiTableColRszActive", false);
				oTable._$colResize = null;
			}
			oTable._bIsColumnResizerMoving = false;
			oTable.$().toggleClass("sapUiTableResizing", false);
			oTable._enableTextSelection();

			var $Document = jQuery(document);
			$Document.unbind("touchmove.sapUiTableColumnResize");
			$Document.unbind("touchend.sapUiTableColumnResize");
			$Document.unbind("mousemove.sapUiTableColumnResize");
			$Document.unbind("mouseup.sapUiTableColumnResize");
		},

		/*
		 * Cleans up the state which is created while resize a column via drag&drop and recalculates the new column width.
		 */
		_resizeColumn: function(oTable, iColIndex, iNewWidth) {
			var aVisibleColumns = oTable._getVisibleColumns();
			var oColumn;

			if (iColIndex >= 0 && iColIndex < aVisibleColumns.length) {
				oColumn = aVisibleColumns[iColIndex];
				TableUtils.Column.resizeColumn(oTable, oTable.indexOfColumn(oColumn), iNewWidth);
			}

			ColumnResizeHelper._cleanupColumResizing(oTable);
			oColumn.focus();
		},

		/*
		 * Computes the optimal width for a column and changes the width if the auto resize feature is activated for the column.
		 *
		 * Experimental feature.
		 */
		doAutoResizeColumn: function(oTable, iColIndex) {
			var aVisibleColumns = oTable._getVisibleColumns(),
				oColumn;

			if (iColIndex >= 0 && iColIndex < aVisibleColumns.length) {
				oColumn = aVisibleColumns[iColIndex];
				if (!oColumn.getAutoResizable() || !oColumn.getResizable()) {
					return;
				}

				var iNewWidth = ColumnResizeHelper._calculateAutomaticColumnWidth.apply(oTable, [oColumn, iColIndex]);
				if (iNewWidth) {
					ColumnResizeHelper._resizeColumn(oTable, iColIndex, iNewWidth);
				}
			}
		},

		/*
		 * Calculates the widest content width of the currently visible column cells including headers.
		 * Headers with column span are not taken into account.
		 * @param {sap.ui.table.Column} oCol the column
		 * @param {int} iColIndex index of the column
		 * @returns {int} iWidth calculated column width
		 * @private
		 */
		_calculateAutomaticColumnWidth: function(oCol, iColIndex) {
			oCol = oCol || this.getColumns()[iColIndex];
			var $this = this.$();
			var $hiddenArea = jQuery("<div>").addClass("sapUiTableHiddenSizeDetector sapUiTableHeaderDataCell sapUiTableDataCell");
			$this.append($hiddenArea);

			// Create a copy of  all visible cells in the column, including the header cells without colspan
			var $cells = $this.find("td[data-sap-ui-colid = \"" + oCol.getId() + "\"]:not([colspan])")
							  .filter(function(index, element) {
								  return element.style.display != "none";
							  }).children().clone();
			$cells.removeAttr("id"); // remove all id attributes

			// Determine the column width
			var iWidth = $hiddenArea.append($cells).width() + 4; // widest cell + 4px for borders, padding and rounding
			iWidth = Math.min(iWidth, $this.find(".sapUiTableCnt").width()); // no wider as the table
			iWidth = Math.max(iWidth + 4, TableUtils.Column.getMinColumnWidth()); // not to small

			$hiddenArea.remove();

			return iWidth;
		},

		/*
		 * Initialize the event listener for positioning the column resize bar and computing the currently hovered column.
		 */
		initColumnTracking: function(oTable) {
			// attach mousemove listener to update resizer position
			oTable.$().find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").mousemove(function(oEvent) {
				var oDomRef = this.getDomRef();
				if (!oDomRef || this._bIsColumnResizerMoving) {
					return;
				}

				var iPositionX = oEvent.clientX,
					iTableRect = oDomRef.getBoundingClientRect(),
					iLastHoveredColumn = 0,
					iResizerPositionX = this._bRtlMode ? 10000 : -10000;

				for (var i = 0; i < this._aTableHeaders.length; i++) {
					var oTableHeaderRect = this._aTableHeaders[i].getBoundingClientRect();
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

				var oColumn = this._getVisibleColumns()[iLastHoveredColumn];
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
	var ReorderHelper = {

		/*
		 * Initializes the drag&drop for reordering
		 */
		initReordering: function(oTable, iColIndex, oEvent) {
			var oColumn = oTable.getColumns()[iColIndex],
				$Col = oColumn.$(),
				$Table = oTable.$();

			oTable._disableTextSelection();
			$Table.addClass("sapUiTableDragDrop");

			// Initialize the Ghost
			var $Ghost = $Col.clone();
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
			var $Indicator = jQuery("<div id='" + oTable.getId()
									+ "-roind' class='sapUiTableColReorderIndicator'><div class='sapUiTableColReorderIndicatorArrow'></div><div class='sapUiTableColReorderIndicatorInner'></div></div>");
			$Indicator.appendTo(oTable.getDomRef("sapUiTableCnt"));
			oTable._$ReorderIndicator = oTable.getDomRef("roind");

			// Collect the needed column information
			oTable._iDnDColIndex = iColIndex;

			// Bind the event handlers
			var $Document = jQuery(document),
				bTouch = oTable._isTouchEvent(oEvent);
			$Document.bind((bTouch ? "touchend" : "mouseup") + ".sapUiColumnMove", ReorderHelper.exitReordering.bind(oTable));
			$Document.bind((bTouch ? "touchmove" : "mousemove") + ".sapUiColumnMove", ReorderHelper.onMouseMoveWhileReordering.bind(oTable));
		},

		/*
		 * Handler for the move events while dragging for reordering.
		 * Reposition the ghost.
		 */
		onMouseMoveWhileReordering: function(oEvent) {
			var oEventPosition = ExtensionHelper._getEventPosition(oEvent, this),
				iLocationX = oEventPosition.x,
				iLocationY = oEventPosition.y,
				iOldColPos = this._iNewColPos;

			this._iNewColPos = this._iDnDColIndex;

			oEvent.preventDefault(); // Avoid default actions e.g. scrolling on mobile devices

			var oPos = ReorderHelper.findColumnForPosition(this, iLocationX);

			if (!oPos || !oPos.id) {
				//Special handling for dummy column (in case the other columns does not occupy the whole space),
				//row selectors and row actions
				this._iNewColPos = iOldColPos;
				return;
			}

			// do scroll if needed
			var iScrollTriggerAreaWidth = 40,
				oScrollArea = this.getDomRef("sapUiTableColHdrScr"),
				$ScrollArea = jQuery(oScrollArea),
				oScrollAreaRect = oScrollArea.getBoundingClientRect(),
				iScrollAreaWidth = $ScrollArea.outerWidth(),
				iScrollAreaScrollLeft = this._bRtlMode ? $ScrollArea.scrollLeftRTL() : $ScrollArea.scrollLeft();

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

			if (oPos.before || (oPos.after && oPos.index == this._iDnDColIndex)) {
				this._iNewColPos = oPos.index;
			} else if (oPos.after && oPos.index != this._iDnDColIndex) {
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
			var iOldIndex = this._iDnDColIndex;
			var iNewIndex = this._iNewColPos;

			// Unbind the event handlers
			var $Document = jQuery(document);
			$Document.unbind("touchmove.sapUiColumnMove");
			$Document.unbind("touchend.sapUiColumnMove");
			$Document.unbind("mousemove.sapUiColumnMove");
			$Document.unbind("mouseup.sapUiColumnMove");

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

			// Perform Reordering
			TableUtils.Column.moveColumnTo(this.getColumns()[iOldIndex], iNewIndex);

			// Re-apply focus
			if (this._mTimeouts.reApplyFocusTimerId) {
				window.clearTimeout(this._mTimeouts.reApplyFocusTimerId);
			}
			var that = this;
			this._mTimeouts.reApplyFocusTimerId = window.setTimeout(function() {
				var iOldFocusedIndex = TableUtils.getFocusedItemInfo(that).cell;
				TableUtils.focusItem(that, 0, oEvent);
				TableUtils.focusItem(that, iOldFocusedIndex, oEvent);
			}, 0);
		},

		/*
		 * Finds the column which belongs to the current x position and returns information about this column.
		 */
		findColumnForPosition: function(oTable, iLocationX) {
			var oHeaderDomRef, $HeaderDomRef, oRect, iWidth, oPos, bBefore, bAfter;

			for (var i = 0; i < oTable._aTableHeaders.length; i++) {
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
				var iStep = bForward ? 30 : -30;
				if (oTable._bRtlMode) {
					iStep = (-1) * iStep;
				}
				oTable._mTimeouts.horizontalReorderScrollTimerId = setTimeout(ReorderHelper.doScroll.bind(oTable, oTable, bForward), 60);
				var $Scr = oTable.$("sapUiTableColHdrScr");
				var ScrollLeft = oTable._bRtlMode ? "scrollLeftRTL" : "scrollLeft";
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

			var iLeft = oPos.left - oTable.getDomRef().getBoundingClientRect().left;
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
	var RowHoverHandler = {

		ROWAREAS: [
			".sapUiTableRowSelectionCell", ".sapUiTableRowActionCell", ".sapUiTableCtrlFixed > tbody > .sapUiTableTr",
			".sapUiTableCtrlScroll > tbody > .sapUiTableTr"
		],

		initRowHovering: function(oTable) {
			var $Table = oTable.$();
			for (var i = 0; i < RowHoverHandler.ROWAREAS.length; i++) {
				RowHoverHandler._initRowHoveringForArea(oTable, $Table, RowHoverHandler.ROWAREAS[i]);
			}
		},

		_initRowHoveringForArea: function(oTable, $Table, sArea) {
			$Table.find(sArea).hover(function() {
				RowHoverHandler._onHover(oTable, $Table, sArea, this);
			}, function() {
				RowHoverHandler._onUnhover(oTable, $Table, sArea, this);
			});
		},

		_onHover: function(oTable, $Table, sArea, oElem) {
			var iIndex = $Table.find(sArea).index(oElem);
			var oRow = oTable.getRows()[iIndex];

			if (oRow) {
				oRow._setHovered(true);
			}
		},

		_onUnhover: function(oTable, $Table, sArea, oElem) {
			var iIndex = $Table.find(sArea).index(oElem);
			var oRow = oTable.getRows()[iIndex];

			if (oRow) {
				oRow._setHovered(false);
			}
		}

	};

	/*
	 * Event handling of touch and mouse events.
	 * "this" in the function context is the table instance.
	 */
	var ExtensionDelegate = {

		onmousedown: function(oEvent) {
			var oPointerExtension = this._getPointerExtension();
			var $Cell = TableUtils.getCell(this, oEvent.target);
			var oCellInfo = TableUtils.getCellInfo($Cell);
			var $Target = jQuery(oEvent.target);
			var oColumn;
			var oMenu;
			var bMenuOpen;

			// check whether item navigation should be reapplied from scratch
			this._getKeyboardExtension().initItemNavigation();

			if (oEvent.button === 0) { // left mouse button
				if (oEvent.target === this.getDomRef("rsz")) { // mousedown on column resize bar
					oEvent.preventDefault();
					oEvent.stopPropagation();
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if ($Target.hasClass("sapUiTableColResizer")) { // mousedown on mobile column resize button
					var iColumnIndex = $Target.closest(".sapUiTableHeaderCell").attr("data-sap-ui-colindex");
					this._iLastHoveredVisibleColumnIndex = this._getVisibleColumns().indexOf(this.getColumns()[iColumnIndex]);
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
					oColumn = this.getColumns()[oCellInfo.columnIndex];
					oMenu = oColumn.getAggregation("menu");
					bMenuOpen = oMenu && oMenu.bOpen;

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
				if ((Device.browser.firefox && !!(oEvent.metaKey || oEvent.ctrlKey))
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
					bMenuOpen = oMenu && oMenu.bOpen;

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
				ColumnResizeHelper.doAutoResizeColumn(this, this._iLastHoveredVisibleColumnIndex);
			}
		},

		onclick: function(oEvent) {
			// clean up the timer
			clearTimeout(this._mTimeouts.delayedColumnReorderTimerId);

			if (oEvent.isMarked()) {
				// the event was already handled by some other handler, do nothing.
				return;
			}

			var $Target = jQuery(oEvent.target);
			var $Cell = TableUtils.getCell(this, oEvent.target);
			var oCellInfo = TableUtils.getCellInfo($Cell);
			var oRow = this.getRows()[oCellInfo.rowIndex];

			if (oRow && oRow.isSummary()) {
				// Sum row cannot be selected
				oEvent.preventDefault();
				return;
			} else if ($Target.hasClass("sapUiTableGroupMenuButton")) {
				// Analytical Table: Mobile group menu button in group header rows.
				TableUtils.Menu.openContextMenu(this, oEvent.target, oEvent);
				return;
			} else if ($Target.hasClass("sapUiTableGroupIcon") || $Target.hasClass("sapUiTableTreeIcon")) {
				// Expand/Collapse icon
				if (TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target)) {
					return;
				}
			}

			if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
				var oPointerExtension = this._getPointerExtension();
				if (oPointerExtension._bShowMenu) {
					TableUtils.Menu.openContextMenu(this, oEvent.target);
					delete oPointerExtension._bShowMenu;
				}
			} else {
				if (ExtensionHelper._skipClick(oEvent, $Target, oCellInfo)) {
					return;
				}

				if (!oEvent.shiftKey && window.getSelection().toString().length > 0) {
					Log.debug("DOM Selection detected -> Click event on table skipped, Target: " + oEvent.target);
					return;
				}

				// forward the event
				if (!this._findAndfireCellEvent(this.fireCellClick, oEvent)) {
					if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER)) {
						this._getSelectionPlugin().onHeaderSelectorPress();
					} else {
						ExtensionHelper._handleClickSelection(oEvent, $Cell, this);
					}
				} else {
					oEvent.preventDefault();
				}
			}
		},

		oncontextmenu: function(oEvent) {
			var oPointerExtension = this._getPointerExtension();

			if (oPointerExtension._bShowDefaultMenu) {
				oEvent.setMarked("handledByPointerExtension");
				delete oPointerExtension._bShowDefaultMenu;

			} else if (oPointerExtension._bShowMenu) {
				var bContextMenuOpened = TableUtils.Menu.openContextMenu(this, oEvent.target, oEvent);

				if (bContextMenuOpened) {
					oEvent.preventDefault(); // To prevent opening the default browser context menu.
				}
				oEvent.setMarked("handledByPointerExtension");
				delete oPointerExtension._bShowMenu;

			} else if (oPointerExtension._bHideMenu) {
				oEvent.setMarked("handledByPointerExtension");
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
	var PointerExtension = ExtensionBase.extend("sap.ui.table.extensions.Pointer",
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
			oTable._iFirstReorderableIndex = sTableType == ExtensionBase.TABLETYPES.TREE ? 1 : 0;

			return "PointerExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			var oTable = this.getTable();
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
			var oTable = this.getTable();
			if (oTable) {
				var $Table = oTable.$();

				// Cleans up the basic event handling for column resizing (and others).
				$Table.find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").unbind();

				// Cleans up the basic event handling for row hover effect
				$Table.find(".sapUiTableCtrl > tbody > tr").unbind();
				$Table.find(".sapUiTableRowSelectionCell").unbind();
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
		 * Resizes the given column to its optimal width if the auto resize feature is available for this column.
		 *
		 * @param {int} iColIndex The index of the column to resize.
		 */
		doAutoResizeColumn: function(iColIndex) {
			var oTable = this.getTable();
			if (oTable) {
				ColumnResizeHelper.doAutoResizeColumn(oTable, iColIndex);
			}
		},

		/**
		 * Initialize the basic event handling for column reordering and starts the reordering.
		 *
		 * @param {int} iColIndex The index of the column to resize.
		 * @param {jQuery.Event} oEvent The event object.
		 */
		doReorderColumn: function(iColIndex, oEvent) {
			var oTable = this.getTable();
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
			var oTable = this.getTable();
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