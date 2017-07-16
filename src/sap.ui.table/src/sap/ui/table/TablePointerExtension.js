/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TablePointerExtension.
sap.ui.define(['./library', 'jquery.sap.global', './TableExtension', './TableUtils', 'sap/ui/Device', 'sap/ui/core/Popup', 'jquery.sap.dom'],
	function(library, jQuery, TableExtension, TableUtils, Device, Popup, jQueryDom) {
	"use strict";

	// shortcuts
	var SelectionMode = library.SelectionMode;

	var KNOWNCLICKABLECONTROLS = ["sapMBtnBase", "sapMInputBase", "sapMLnk", "sapMSlt", "sapMCb", "sapMRI", "sapMSegBBtn", "sapUiIconPointer"];

	/*
	 * Provides utility functions used this extension
	 */
	var ExtensionHelper = {

		/*
		 * Returns the pageX and pageY position of the given mouse/touch event.
		 */
		_getEventPosition : function(oEvent, oTable) {
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
		_skipClick : function(oEvent, $Target, oCellInfo) {
			if (oCellInfo.type != TableUtils.CELLTYPES.DATACELL && oCellInfo.type != TableUtils.CELLTYPES.ROWACTION) {
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

			var bHasSelection = false;
			if (window.getSelection) {
				var oSelection = window.getSelection();
				bHasSelection = oSelection.rangeCount ? !oSelection.getRangeAt(0).collapsed : false;
			}

			if (bHasSelection) {
				jQuery.sap.log.debug("DOM Selection detected -> Click event on table skipped, Target: " + oEvent.target);
				return true;
			}

			return false;
		},

		/*
		 * Changes the selection based on the given click event on the given row selector, data cell or row action cell.
		 */
		_handleClickSelection : function(oEvent, $Cell, oTable) {

			TableUtils.toggleRowSelection(oTable, $Cell, null, function(iRowIndex) {

				// in case of IE and SHIFT we clear the text selection
				if (!!Device.browser.internet_explorer && oEvent.shiftKey) {
					oTable._clearTextSelection();
				}

				var oSelMode = oTable.getSelectionMode();

				if (oSelMode === SelectionMode.Single) {
					if (!oTable.isIndexSelected(iRowIndex)) {
						oTable.setSelectedIndex(iRowIndex);
					} else {
						oTable.clearSelection();
					}
				} else {
					var bCtrl = !!(oEvent.metaKey || oEvent.ctrlKey);

					// in case of multi toggle behavior a click on the row selection
					// header adds or removes the selected row and the previous selection
					// will not be removed
					if (oSelMode === SelectionMode.MultiToggle) {
						bCtrl = true;
					}

					if (oEvent.shiftKey) {
						// If no row is selected getSelectedIndex returns -1 - then we simply
						// select the clicked row:
						var iSelectedIndex = oTable.getSelectedIndex();
						if (iSelectedIndex >= 0) {
							oTable.addSelectionInterval(iSelectedIndex, iRowIndex);
						} else {
							oTable.setSelectedIndex(iRowIndex);
						}
					} else {
						if (!oTable.isIndexSelected(iRowIndex)) {
							if (bCtrl) {
								oTable.addSelectionInterval(iRowIndex, iRowIndex);
							} else {
								oTable.setSelectedIndex(iRowIndex);
							}
						} else {
							if (bCtrl) {
								oTable.removeSelectionInterval(iRowIndex, iRowIndex);
							} else {
								if (oTable._getSelectedIndicesCount() === 1) {
									oTable.clearSelection();
								} else {
									oTable.setSelectedIndex(iRowIndex);
								}
							}
						}
					}
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
		initColumnResizing : function(oTable, oEvent){
			if (oTable._bIsColumnResizerMoving) {
				return;
			}

			oTable._bIsColumnResizerMoving = true;
			oTable.$().toggleClass("sapUiTableResizing", true);

			var $Document = jQuery(document),
				bTouch = oTable._isTouchEvent(oEvent);

			oTable._$colResize = oTable.$("rsz");
			oTable._iColumnResizeStart = ExtensionHelper._getEventPosition(oEvent, oTable).x;

			$Document.bind((bTouch ? "touchend" : "mouseup") + ".sapUiTableColumnResize", ColumnResizeHelper.exitColumnResizing.bind(oTable));
			$Document.bind((bTouch ? "touchmove" : "mousemove") + ".sapUiTableColumnResize", ColumnResizeHelper.onMouseMoveWhileColumnResizing.bind(oTable));

			oTable._disableTextSelection();
		},

		/*
		 * Drops the previous dragged column resize bar and recalculates the new column width.
		 */
		exitColumnResizing: function(oEvent) {
			ColumnResizeHelper._resizeColumn(this, this._iLastHoveredColumnIndex);
		},

		/*
		 * Handler for the move events while dragging the column resize bar.
		 */
		onMouseMoveWhileColumnResizing: function(oEvent) {
			var iLocationX = ExtensionHelper._getEventPosition(oEvent, this).x;

			if (this._iColumnResizeStart && iLocationX < this._iColumnResizeStart + 3 && iLocationX > this._iColumnResizeStart - 3) {
				return;
			}

			if (this._isTouchEvent(oEvent)) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}

			this._$colResize.toggleClass("sapUiTableColRszActive", true);

			var oColumn = this._getVisibleColumns()[this._iLastHoveredColumnIndex];
			var iDeltaX = iLocationX - this._iColumnResizeStart;
			var iColWidth = this.$().find('th[data-sap-ui-colid="' + oColumn.getId() + '"]').width();
			var iWidth = Math.max(iColWidth + iDeltaX * (this._bRtlMode ? -1 : 1), TableUtils.Column.getMinColumnWidth());

			// calculate and set the position of the resize handle
			var iRszOffsetLeft = this.$().find(".sapUiTableCnt").offset().left;
			var iRszLeft = Math.floor((iLocationX - iRszOffsetLeft) - (this._$colResize.width() / 2));
			this._$colResize.css("left", iRszLeft + "px");

			// store the width of the column to apply later
			oColumn._iNewWidth = iWidth;
		},

		/*
		 * Cleans up the state which is created while resize a column via drag&drop.
		 */
		_cleanupColumResizing: function(oTable) {
			if (oTable._$colResize) {
				oTable._$colResize.toggleClass("sapUiTableColRszActive", false);
				oTable._$colResize = null;
			}
			oTable._iColumnResizeStart = null;
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
		_resizeColumn: function(oTable, iColIndex) {
			var aVisibleColumns = oTable._getVisibleColumns(),
				oColumn,
				bResized = false;

			if (iColIndex >= 0 && iColIndex < aVisibleColumns.length) {
				oColumn = aVisibleColumns[iColIndex];
				if (oColumn._iNewWidth) {
					TableUtils.Column.resizeColumn(oTable, oTable.indexOfColumn(oColumn), oColumn._iNewWidth);
					delete oColumn._iNewWidth;
					bResized = true;
				}
			}

			ColumnResizeHelper._cleanupColumResizing(oTable);

			oColumn.focus();

			// rerender if size of the column was changed
			if (bResized) {
				oTable.invalidate();
			}
		},

		/*
		 * Computes the optimal width for a column and changes the width if the auto resize feature is activated for the column.
		 *
		 * Experimental feature.
		 */
		doAutoResizeColumn : function(oTable, iColIndex) {
			var aVisibleColumns = oTable._getVisibleColumns(),
				oColumn;

			if (iColIndex >= 0 && iColIndex < aVisibleColumns.length) {
				oColumn = aVisibleColumns[iColIndex];
				if (!oColumn.getAutoResizable() || !oColumn.getResizable()) {
					return;
				}

				var iNewWidth = ColumnResizeHelper._calculateAutomaticColumnWidth.apply(oTable, [oColumn, iColIndex]);
				if (iNewWidth) {
					oColumn._iNewWidth = iNewWidth;
					ColumnResizeHelper._resizeColumn(oTable, iColIndex);
				}
			}
		},

		/*
		 * Calculates the widest content width of the currently visible column cells including headers.
		 * Headers with column span are not taken into account.
		 * @param {sap.ui.table.Column} oCol the column
		 * @param {int} iColIndex index of the column
		 * @return {int} iWidth calculated column width
		 * @private
		 */
		_calculateAutomaticColumnWidth : function(oCol, iColIndex) {
			oCol = oCol || this.getColumns()[iColIndex];
			var $this = this.$();
			var $hiddenArea = jQuery("<div>").addClass("sapUiTableHiddenSizeDetector");
			$this.append($hiddenArea);

			// Create a copy of  all visible cells in the column, including the header cells without colspan
			var $cells = $this.find('td[data-sap-ui-colid = "' + oCol.getId() + '"]:not([colspan])')
				.filter(function(index, element) {
					return element.style.display != "none";
				}).children().clone();
			$cells.find("[id]").removeAttr("id"); // remove all id attributes

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
		initColumnTracking : function(oTable) {
			// attach mousemove listener to update resizer position
			oTable.$().find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").mousemove(function(oEvent){
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
					this._iLastHoveredColumnIndex = iLastHoveredColumn;
				}
			}.bind(oTable));
		}
	};



	/*
	 * Provides drag&drop resize capabilities for visibleRowCountMode "Interactive".
	 */
	var InteractiveResizeHelper = {

		/*
		 * Initializes the drag&drop for resizing
		 */
		initInteractiveResizing: function(oTable, oEvent){
			var $Body = jQuery(document.body),
				$Splitter = oTable.$("sb"),
				$Document = jQuery(document),
				offset = $Splitter.offset(),
				height = $Splitter.height(),
				width = $Splitter.width(),
				bTouch = oTable._isTouchEvent(oEvent);

			// Fix for IE text selection while dragging
			$Body.bind("selectstart", InteractiveResizeHelper.onSelectStartWhileInteractiveResizing);

			$Body.append(
				"<div id=\"" + oTable.getId() + "-ghost\" class=\"sapUiTableInteractiveResizerGhost\" style =\" height:" + height + "px; width:"
				+ width + "px; left:" + offset.left + "px; top:" + offset.top + "px\" ></div>");

			// Append overlay over splitter to enable correct functionality of moving the splitter
			$Splitter.append("<div id=\"" + oTable.getId() + "-rzoverlay\" style =\"left: 0px; right: 0px; bottom: 0px; top: 0px; position:absolute\" ></div>");

			$Document.bind((bTouch ? "touchend" : "mouseup") + ".sapUiTableInteractiveResize", InteractiveResizeHelper.exitInteractiveResizing.bind(oTable));
			$Document.bind((bTouch ? "touchmove" : "mousemove") + ".sapUiTableInteractiveResize", InteractiveResizeHelper.onMouseMoveWhileInteractiveResizing.bind(oTable));

			oTable._disableTextSelection();
		},

		/*
		 * Drops the previous dragged horizontal splitter bar and recalculates the amount of rows to be displayed.
		 */
		exitInteractiveResizing : function(oEvent) {
			var $Body = jQuery(document.body),
				$Document = jQuery(document),
				$This = this.$(),
				$Ghost = this.$("ghost"),
				iLocationY = ExtensionHelper._getEventPosition(oEvent, this).y;

			var iNewHeight = iLocationY - $This.find(".sapUiTableCCnt").offset().top - $Ghost.height() - $This.find(".sapUiTableFtr").height();

			// TBD: Move this to the table code
			this._setRowContentHeight(iNewHeight);
			this._updateRows(this._calculateRowsToDisplay(iNewHeight), TableUtils.RowsUpdateReason.Resize);

			$Ghost.remove();
			this.$("rzoverlay").remove();

			$Body.unbind("selectstart", InteractiveResizeHelper.onSelectStartWhileInteractiveResizing);
			$Document.unbind("touchend.sapUiTableInteractiveResize");
			$Document.unbind("touchmove.sapUiTableInteractiveResize");
			$Document.unbind("mouseup.sapUiTableInteractiveResize");
			$Document.unbind("mousemove.sapUiTableInteractiveResize");

			this._enableTextSelection();
		},

		/*
		 * Handler for the selectstart event triggered in IE to select the text. Avoid this during resize drag&drop.
		 */
		onSelectStartWhileInteractiveResizing : function(oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			return false;
		},

		/*
		 * Handler for the move events while dragging the horizontal resize bar.
		 */
		onMouseMoveWhileInteractiveResizing : function(oEvent) {
			var iLocationY = ExtensionHelper._getEventPosition(oEvent, this).y;
			var iMin = this.$().offset().top;
			if (iLocationY > iMin) {
				this.$("ghost").css("top", iLocationY + "px");
			}
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
			$Ghost.find('*').addBack($Ghost).removeAttr("id")
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
			var $Indicator = jQuery("<div id='" + oTable.getId() + "-roind' class='sapUiTableColReorderIndicator'><div class='sapUiTableColReorderIndicatorArrow'></div><div class='sapUiTableColReorderIndicatorInner'></div></div>");
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
		onMouseMoveWhileReordering : function(oEvent) {
			var oEventPosition = ExtensionHelper._getEventPosition(oEvent, this),
				iLocationX = oEventPosition.x,
				iLocationY = oEventPosition.y,
				iOldColPos = this._iNewColPos;

			this._iNewColPos = this._iDnDColIndex;

			oEvent.preventDefault(); // Avoid default actions e.g. scrolling on mobile devices

			var oPos = ReorderHelper.findColumnForPosition(this, iLocationX);

			if ( !oPos || !oPos.id ) {
				//Special handling for dummy column (in case the other columns does not occupy the whole space),
				//row selectors and row actions
				this._iNewColPos = iOldColPos;
				return;
			}

			// do scroll if needed
			var iScrollTriggerAreaWidth = 40,
				oScrollArea = this.getDomRef("sapUiTableCtrlScr"),
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
		exitReordering : function(oEvent) {
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

			// For AnalyticalTable only
			if (this.updateAnalyticalInfo) {
				this.updateAnalyticalInfo(true, true);
			}
		},

		/*
		 * Finds the column which belongs to the current x position and returns information about this column.
		 */
		findColumnForPosition : function(oTable, iLocationX) {
			var oHeaderDomRef, $HeaderDomRef, oRect, iWidth, oPos, bBefore, bAfter;

			for (var i = 0; i < oTable._aTableHeaders.length; i++) {
				oHeaderDomRef = oTable._aTableHeaders[i];
				$HeaderDomRef = jQuery(oHeaderDomRef);
				oRect = oHeaderDomRef.getBoundingClientRect();
				iWidth = $HeaderDomRef.outerWidth();
				oPos = {
					left : oRect.left,
					center : oRect.left + iWidth / 2,
					right :  oRect.left + iWidth,
					width : iWidth,
					index : parseInt($HeaderDomRef.attr("data-sap-ui-headcolindex"), 10),
					id : $HeaderDomRef.attr("data-sap-ui-colid")
				};

				bBefore = iLocationX >= oPos.left && iLocationX <= oPos.center;
				bAfter = iLocationX >= oPos.center && iLocationX <= oPos.right;

				if (bBefore || bAfter) {
					oPos.before = oTable._bRtlMode ? bAfter : bBefore;
					oPos.after =  oTable._bRtlMode ? bBefore : bAfter;
					return oPos;
				}
			}

			return null;
		},

		/*
		 * Starts or continues stepwise horizontal scrolling until oTable._bReorderScroll is false.
		 */
		doScroll : function(oTable, bForward) {
			if (oTable._mTimeouts.horizontalReorderScrollTimerId) {
				window.clearTimeout(oTable._mTimeouts.horizontalReorderScrollTimerId);
				oTable._mTimeouts.horizontalReorderScrollTimerId = null;
			}
			if (oTable._bReorderScroll) {
				var iStep = bForward ? 30 : -30;
				if (oTable._bRtlMode) {
					iStep = (-1) * iStep;
				}
				oTable._mTimeouts.horizontalReorderScrollTimerId = jQuery.sap.delayedCall(60, oTable, ReorderHelper.doScroll, [oTable, bForward]);
				var $Scr = oTable.$("sapUiTableCtrlScr");
				var ScrollLeft = oTable._bRtlMode ? "scrollLeftRTL" : "scrollLeft";
				$Scr[ScrollLeft]($Scr[ScrollLeft]() + iStep);
			}
		},

		/*
		 * Positions the reorder marker on the column (given by the position information (@see findColumnForPosition)).
		 */
		adaptReorderMarkerPosition : function(oTable, oPos, bShow) {
			if (!oPos || !oTable._$ReorderIndicator) {
				return;
			}

			var iLeft = oPos.left - oTable.getDomRef().getBoundingClientRect().left;
			if (oTable._bRtlMode && oPos.before || !oTable._bRtlMode && oPos.after) {
				iLeft = iLeft + oPos.width;
			}

			jQuery(oTable._$ReorderIndicator).css({
				"left" : iLeft + "px"
			}).toggleClass("sapUiTableColReorderIndicatorActive", bShow);
		}

	};


	/*
	 * Provides the event handling for the row hover effect.
	 */
	var RowHoverHandler = {

		ROWAREAS : [".sapUiTableRowHdr", ".sapUiTableRowAction", ".sapUiTableCtrlFixed > tbody > .sapUiTableTr", ".sapUiTableCtrlScroll > tbody > .sapUiTableTr"],

		initRowHovering : function(oTable) {
			var $Table = oTable.$();
			for (var i = 0; i < RowHoverHandler.ROWAREAS.length; i++) {
				RowHoverHandler._initRowHoveringForArea($Table, RowHoverHandler.ROWAREAS[i]);
			}
		},

		_initRowHoveringForArea: function($Table, sArea) {
			$Table.find(sArea).hover(function() {
				RowHoverHandler._onHover(this, $Table, sArea);
			}, function() {
				RowHoverHandler._onUnhover(this, $Table);
			});
		},

		_onHover: function(oElem, $Table, sArea) {
			var iIndex = $Table.find(sArea).index(oElem);
			for (var i = 0; i < RowHoverHandler.ROWAREAS.length; i++) {
				$Table.find(RowHoverHandler.ROWAREAS[i]).filter(":eq(" + (iIndex) + ")").addClass("sapUiTableRowHvr");
			}
		},

		_onUnhover: function(oElem, $Table) {
			for (var i = 0; i < RowHoverHandler.ROWAREAS.length; i++) {
				$Table.find(RowHoverHandler.ROWAREAS[i]).removeClass("sapUiTableRowHvr");
			}
		}

	};


	/*
	 * Event handling of touch and mouse events.
	 * "this" in the function context is the table instance.
	 */
	var ExtensionDelegate = {

		onmousedown : function(oEvent) {
			var oPointerExtension = this._getPointerExtension();
			var $Cell = TableUtils.getCell(this, oEvent.target);
			var oCellInfo = TableUtils.getCellInfo($Cell) || {};
			var $Target = jQuery(oEvent.target);

			// check whether item navigation should be reapplied from scratch
			this._getKeyboardExtension().initItemNavigation();

			if (oEvent.button === 0) { // left mouse button
				if (oEvent.target === this.getDomRef("sb")) { // mousedown on interactive resize bar
					InteractiveResizeHelper.initInteractiveResizing(this, oEvent);

				} else if (oEvent.target === this.getDomRef("rsz")) { // mousedown on column resize bar
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if ($Target.hasClass("sapUiTableColResizer")) { // mousedown on mobile column resize button
					var iColIndex = $Target.closest(".sapUiTableCol").attr("data-sap-ui-colindex");
					this._iLastHoveredColumnIndex = parseInt(iColIndex, 10);
					ColumnResizeHelper.initColumnResizing(this, oEvent);

				} else if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {
					var iIndex = TableUtils.getColumnHeaderCellInfo($Cell).index;
					var oColumn = this.getColumns()[iIndex];
					var oMenu = oColumn.getAggregation("menu");
					var bMenuOpen = oMenu && oMenu.bOpen;

					if (!bMenuOpen) {
						// A long click starts column reordering, so it should not also open the menu in the onclick event handler.
						oPointerExtension._bShowMenu = true;
						this._mTimeouts.delayedMenuTimerId = jQuery.sap.delayedCall(200, this, function () {
							delete oPointerExtension._bShowMenu;
						});
					}

					if (this.getEnableColumnReordering()
						&& !(this._isTouchEvent(oEvent) && $Target.hasClass("sapUiTableColDropDown")) /*Target is not the mobile column menu button*/) {
						// Start column reordering
						this._getPointerExtension().doReorderColumn(iIndex, oEvent);
					}
				}

				// In case of FireFox and CTRL+CLICK it selects the target TD
				//   => prevent the default behavior only in this case (to still allow text selection)
				// Also prevent default when clicking on ScrollBars to prevent ItemNavigation to re-apply
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

				if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {
					var oColumnHeaderCellInfo = TableUtils.getColumnHeaderCellInfo($Cell);
					var oColumn = this.getColumns()[oColumnHeaderCellInfo.index];
					var oMenu = oColumn.getAggregation("menu");
					var bMenuOpen = oMenu && oMenu.bOpen;

					if (!bMenuOpen) {
						oPointerExtension._bShowMenu = true;
					} else {
						oPointerExtension._bHideMenu = true;
					}
				} else if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL) {
					var bMenuOpen = this._oCellContextMenu && this._oCellContextMenu.bOpen;
					var bMenuOpenedAtAnotherDataCell = bMenuOpen && this._oCellContextMenu.oOpenerRef !== $Cell[0];

					if (!bMenuOpen || bMenuOpenedAtAnotherDataCell) {
						oPointerExtension._bShowMenu = true;
					} else {
						oPointerExtension._bHideMenu = true;
					}
				} else {
					oPointerExtension._bShowDefaultMenu = true;
				}
			}
		},

		onmouseup : function(oEvent) {
			// clean up the timer
			jQuery.sap.clearDelayedCall(this._mTimeouts.delayedColumnReorderTimerId);
		},

		ondblclick : function(oEvent) {
			if (Device.system.desktop && oEvent.target === this.getDomRef("rsz")) {
				oEvent.preventDefault();
				ColumnResizeHelper.doAutoResizeColumn(this, this._iLastHoveredColumnIndex);
			}
		},

		onclick : function(oEvent) {
			// clean up the timer
			jQuery.sap.clearDelayedCall(this._mTimeouts.delayedColumnReorderTimerId);

			if (oEvent.isMarked()) {
				// the event was already handled by some other handler, do nothing.
				return;
			}

			var $Target = jQuery(oEvent.target);

			if ($Target.hasClass("sapUiAnalyticalTableSum")) {
				// Analytical Table: Sum Row cannot be selected
				oEvent.preventDefault();
				return;
			} else if ($Target.hasClass("sapUiTableGroupMenuButton")) {
				// Analytical Table: Mobile Group Menu Button in Grouping rows
				this._onContextMenu(oEvent);
				oEvent.preventDefault();
				return;
			} else if ($Target.hasClass("sapUiTableGroupIcon") || $Target.hasClass("sapUiTableTreeIcon")) {
				// Grouping Row: Toggle grouping
				if (TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target)) {
					return;
				}
			}

			var $Cell = TableUtils.getCell(this, oEvent.target);
			var oCellInfo = TableUtils.getCellInfo($Cell) || {};

			if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {
				var oPointerExtension = this._getPointerExtension();
				if (oPointerExtension._bShowMenu) {
					TableUtils.Menu.openContextMenu(this, oEvent.target, false);
					delete oPointerExtension._bShowMenu;
				}
			} else {
				if (ExtensionHelper._skipClick(oEvent, $Target, oCellInfo)) {
					return;
				}

				// forward the event
				if (!this._findAndfireCellEvent(this.fireCellClick, oEvent)) {
					if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {
						this._toggleSelectAll();
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
				oEvent.setMarked("handledByPointerExtension");
				oEvent.preventDefault(); // To prevent opening the default browser context menu.
				TableUtils.Menu.openContextMenu(this, oEvent.target, false);
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
	 *
	 * @class Extension for sap.ui.table.Table which handles mouse and touch related things.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TablePointerExtension
	 */
	var TablePointerExtension = TableExtension.extend("sap.ui.table.TablePointerExtension", /* @lends sap.ui.table.TablePointerExtension */ {

		/*
		 * @see TableExtension._init
		 */
		_init : function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;

			// Register the delegate
			oTable.addEventDelegate(this._delegate, oTable);

			oTable._iLastHoveredColumnIndex = 0;
			oTable._bIsColumnResizerMoving = false;
			oTable._iFirstReorderableIndex = sTableType == TableExtension.TABLETYPES.TREE ? 1 : 0;

			return "PointerExtension";
		},

		/*
		 * @see TableExtension._attachEvents
		 */
		_attachEvents : function() {
			var oTable = this.getTable();
			if (oTable) {
				// Initialize the basic event handling for column resizing.
				ColumnResizeHelper.initColumnTracking(oTable);
				RowHoverHandler.initRowHovering(oTable);
			}
		},

		/*
		 * @see TableExtension._detachEvents
		 */
		_detachEvents : function() {
			var oTable = this.getTable();
			if (oTable) {
				var $Table = oTable.$();

				// Cleans up the basic event handling for column resizing (and others).
				$Table.find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed").unbind();

				// Cleans up the basic event handling for row hover effect
				$Table.find(".sapUiTableCtrl > tbody > tr").unbind();
				$Table.find(".sapUiTableRowHdr").unbind();
			}
		},

		/*
		 * Enables debugging for the extension
		 */
		_debug : function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ColumnResizeHelper = ColumnResizeHelper;
			this._InteractiveResizeHelper = InteractiveResizeHelper;
			this._ReorderHelper = ReorderHelper;
			this._ExtensionDelegate = ExtensionDelegate;
			this._RowHoverHandler = RowHoverHandler;
			this._KNOWNCLICKABLECONTROLS = KNOWNCLICKABLECONTROLS;
		},

		/*
		 * Resizes the given column to its optimal width if the auto resize feature is available for this column.
		 */
		doAutoResizeColumn : function(iColIndex) {
			var oTable = this.getTable();
			if (oTable) {
				ColumnResizeHelper.doAutoResizeColumn(oTable, iColIndex);
			}
		},

		/*
		 * Initialize the basic event handling for column reordering and starts the reordering.
		 */
		doReorderColumn : function(iColIndex, oEvent) {
			var oTable = this.getTable();
			if (oTable && TableUtils.Column.isColumnMovable(oTable.getColumns()[iColIndex])) {
				// Starting column drag & drop. We wait 200ms to make sure it is no click on the column to open the menu.
				oTable._mTimeouts.delayedColumnReorderTimerId = jQuery.sap.delayedCall(200, oTable, function() {
					ReorderHelper.initReordering(this, iColIndex, oEvent);
				});
			}
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			// Deregister the delegates
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}

	});

	return TablePointerExtension;

}, /* bExport= */ true);