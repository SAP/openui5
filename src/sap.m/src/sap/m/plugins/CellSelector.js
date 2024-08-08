/*!
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"sap/base/i18n/Localization",
	"sap/base/util/deepEqual",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Element",
	"sap/m/library"
], function (PluginBase, Localization, deepEqual, KeyCodes, Element, library) {
	"use strict";

	const ListMode = library.ListMode;
	const DELAY_SHORT = 250; //TBD: Are 2 different delays necessary?
	const DELAY_LONG  = DELAY_SHORT * 2;
	const DIRECTION = {
		ROW: "row",
		COL: "col"
	};

	const CellType = {
		/**
		 * Data cells that can be selected.
		 */
		Cell: "Cell",
		/**
		 * Cells that require special handling or look different.
		 */
		Other: "Other",
		/**
		 * Cells that can be ignored from selection, but should be respected to not interrupt selection.
		 */
		Ignore: "Ignore"
	};

	/**
	 * Constructor for a new CellSelector plugin.
	 *
	 * @param {string} [sId] ID for the new <code>CellSelector</code>, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new <code>CellSelector</code>
	 *
	 * @class
	 * The <code>CellSelector</code> plugin enables cell selection inside the table when it is added as a dependent to the control.
	 * It allows the user to individually select a cell block.
	 *
	 * Currently, the <code>CellSelector</code> plugin does not offer touch support.
	 *
	 * The <code>CellSelector</code> plugin can be used with the {@link sap.ui.table.Table} and {@link sap.m.Table} unless the following applies:
	 * <ul>
	 * 	<li>Drag for rows is active</li>
	 *	<li>If used in combination with {@link sap.ui.table.Table#cellClick} or {@link sap.m.Table#itemPress}</li>
	 *	<li>If the <code>sap.ui.table.SelectionBehavior.RowOnly</code> or <code>sap.ui.table.SelectionBehavior.Row</code> selection behavior is used
	 * in the <code>sap.ui.table.Table</code></li>
	 * 	<li>If the <code>sap.m.ListType.SingleSelectMaster</code> mode is used in the <code>sap.m.Table</code></li>
	 * </ul>
	 *
	 * When the <code>CellSelector</code> is used in combination with the {@link sap.ui.mdc.Table}, modifying the following settings on the {@link sap.ui.mdc.Table} may lead to problems:
	 * <ul>
	 * 	<li>attaching a {@link sap.ui.mdc.Table#rowPress rowPress} event to the table after initialization of table and plugin</li>
	 * 	<li>changing {@link sap.ui.mdc.Table#getSelectionMode selectionMode} to something else than <code>Multi</code></li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @author SAP SE
	 *
	 * @public
	 * @since 1.119
	 * @alias sap.m.plugins.CellSelector
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	var CellSelector = PluginBase.extend("sap.m.plugins.CellSelector", /** @lends sap.m.plugins.CellSelector.prototype */  {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the number of row contexts for the {@link sap.ui.table.Table} control that need to be retrieved from the binding
				 * when the range selection (e.g. enhancing the cell selection block to cover all rows of a column) is triggered by the user.
				 * This helps to make the contexts already available for the user actions after the cell selection (e.g. copy to clipboard).
				 * This property accepts positive integer values.
				 * <b>Note:</b> To avoid performance problems, the <code>rangeLimit</code> should only be set higher than the default value of 200 in the following cases:
				 * <ul>
				 *     <li>With client-side models</li>
				 *     <li>With server-side models if they are used in client mode</li>
				 *     <li>If the entity set is small</li>
				 * </ul>
				 * In other cases, it is recommended to set the <code>rangeLimit</code> to at least double the value of the {@link sap.ui.table.Table#getThreshold threshold} property.
				 */
				rangeLimit: {type: "int", group: "Behavior", defaultValue: 200},
				/**
				 * Indicates whether this plugin is active or not.
				 */
				enabled: {type: "boolean", defaultValue: true}
			},
			events: {}
		}
	});

	CellSelector.findOn = PluginBase.findOn;

	/**
	 * A selection object representing the selected cells.
	 *
	 * The selection object contains the selected cells separated into rows and columns.
	 * Rows are represented by their context, while columns are the column instance, which may vary depending on the table type.
	 * @public
	 * @typedef {object} sap.m.plugins.CellSelector.Selection
	 * @property {sap.ui.model.Context[]} rows The row contexts of the selected cells.
	 * @property {sap.ui.core.Element[]} columns The column instances of the selected cells; the content is based on the owner control.
	 */

	/**
	 * An object representing the position of a cell.
	 *
	 * Consists of a row index and a column index describing the position of the cell in the table.
	 * @private
	 * @typedef {object} sap.m.plugins.CellSelector.CellPosition
	 * @property {number} rowIndex Row index of the cell
	 * @property {number} colIndex Column index of the cell
	 */

	/**
	 * Delegate containing events that are fired after control events.
	 */
	const EventDelegate = {
		onkeydown: function(oEvent) {
			if (!this._bSelecting) {
				return;
			}

			if (isKeyCombination(oEvent, KeyCodes.A, true, true)
				|| (isKeyCombination(oEvent, KeyCodes.A, false, true) && oEvent.isMarked(this.getConfig("eventClearedAll")))) {
				if (isSelectableCell(oEvent.target, this.getConfig("selectableCells"))) {
					this.removeSelection();
					oEvent.preventDefault();
				}
			} else if (isKeyCombination(oEvent, KeyCodes.SPACE, true, false) || isKeyCombination(oEvent, KeyCodes.SPACE, false, true)) {
				// prevent scrolling by pressing space
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Delegate containing events that are fired before control events.
	 */
	const PriorityDelegate = {
		onBeforeRendering: function() {
			this._iBtt = this.getConfig("isBottomToTop", this.getControl()) ? -1 : 1;
			if (this._oResizer) {
				// Remove resizer, as due to rerendering table element may be gone
				this._oResizer.remove();
				this._oResizer = null;
			}
		},
		onAfterRendering: function() {
			this._deregisterEvents();
			this._registerEvents();

			this._bSelecting && !this._bMouseDown && this.removeSelection();
			this._bSelecting && this._selectCells();

			this._bRenderResizer = this.getConfig("shouldRenderResizer", this.getControl());
		},
		onsapupmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.ROW, -1, 0);
		},
		onsapdownmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.ROW, 1, 0);
		},
		onsapspace: function(oEvent) {
			if (isSelectableCell(oEvent.target, this.getConfig("selectableCells"))) {
				oEvent.preventDefault(); // Prevent default, otherwise m.Table will scroll
			}
		},
		onsapleftmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.COL, 0, -1);
		},
		onsaprightmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.COL, 0, 1);
		},
		onsapescape: function(oEvent) {
			if (oEvent.isMarked()) {
				return;
			}

			if (this._bSelecting && isSelectableCell(oEvent.target, this.getConfig("selectableCells"))) {
				this.removeSelection();
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		},
		onkeyup: function(oEvent) {
			if (oEvent.isMarked() || !this.getConfig("isSupported", this.getControl(), this)) {
				return;
			}

			/*
			Handling CTRL + SPACE for Column Selection. Will be handled/implemented in a separate BLI

			if (isKeyCombination(oEvent, KeyCodes.SPACE, false, true) && this._getSelectableCell(oEvent.target)) {
				if (!this._inSelection(oEvent.target)) {
					// If focus is on cell outside of selection, select focused column
					this._oSession.mSource = this._oSession.mTarget = this.getConfig("getCellInfo", this.getControl(), oEvent.target, this._oPreviousCell);
				}
				this._oSession.mSource = Object.assign({}, this._oSession.mSource, { rowIndex: 0 });
				this._oSession.mTarget = Object.assign({}, this._oSession.mTarget, { rowIndex: Infinity });

				const mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget, true);

				this._bSelecting = true;
				this._selectCells(mBounds.from, mBounds.to);

				oEvent.preventDefault();
			}
			*/

			if (isKeyCombination(oEvent, KeyCodes.SPACE, true, false)) {
				const mBounds = this._bSelecting ? this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget) : {};
				const oInfo = this.getConfig("getCellInfo", this.getControl(), oEvent.target, this._oPreviousCell);
				if (!this._inSelection(oEvent.target)) {
					mBounds.from = mBounds.to = {};
					mBounds.from.rowIndex = mBounds.to.rowIndex = oInfo.rowIndex;
				}

				this.getConfig("selectRows", this.getControl(), mBounds.from.rowIndex, mBounds.to.rowIndex, oInfo.rowIndex);

				oEvent.setMarked();
				oEvent.preventDefault();
			} else if (isKeyCombination(oEvent, KeyCodes.SPACE, false, false)) {
				if (!isSelectableCell(oEvent.target, this.getConfig("selectableCells"))) {
					return;
				}
				this._oPreviousCell = null;
				this._startSelection(oEvent, false);
				oEvent.setMarked();
			}
		},
		onmousedown: function(oEvent) {
			if (oEvent.isMarked?.() || oEvent.button != 0) {
				return;
			}

			var oSelectableCell = this._getSelectableCell(oEvent.target);

			if (!oSelectableCell) {
				return;
			}

			const oInfo = this.getConfig("getCellInfo", this.getControl(), oSelectableCell, this._oPreviousCell);
			this._bMouseDown = true;

			if (oEvent.shiftKey) {
				if (this._oPreviousCell?.rowIndex !== oInfo.rowIndex || this._oPreviousCell?.colIndex !== oInfo.colIndex) {
					window.getSelection().removeAllRanges();

					if (this._oOriginCell) {
						this._selectCells(this._oOriginCell, oInfo);
					}
				}
			}

			this._mClickedCell = this._oPreviousCell = oInfo;
			if (oEvent.ctrlKey || oEvent.metaKey) {
				this._startSelection(oEvent);
				if (this._mClickedCell) {
					this.getConfig("focusCell", this.getControl(), this._mClickedCell);
				}
			}
		},
		onmouseup: function(oEvent) {
			clearTimeout(this._iTimer);
			this._bMouseDown = false;
			this._bBorderDown = false;
			this._mClickedCell = undefined;
			this._bScrolling = false;
			this._mTempCell = undefined;
			this._oHoveredCell = undefined;
			this._endSelection(oEvent);
			this._clearScroller();
			setTimeout(() => { this._startTarget = null; }, 0);
		},
		onclick: function(oEvent) {
			var oTarget = this._getSelectableCell(oEvent.target);
			if (oTarget && this._startTarget === oTarget) {
				oEvent.stopPropagation();
			}
		}
	};

	function getRTL() {
		return Localization.getRTL() ? -1 : 1;
	}

	CellSelector.prototype.init = function() {
		this._iRtl = getRTL();
	};

	CellSelector.prototype.onLocalizationChanged = function() {
		this._iRtl = getRTL();
		this._iBtt = this.getConfig("isBottomToTop", this.getControl()) ? -1 : 1;
		this.removeSelection();
	};

	/**
	 * @inheritDoc
	 */
	CellSelector.prototype.onActivate = function (oControl) {
		oControl.addDelegate(PriorityDelegate, true, this);
		oControl.addDelegate(EventDelegate, false, this);

		this._oSession = { cellRefs: [], cellTypes: [] };
		this._iBtt = this.getConfig("isBottomToTop", this.getControl()) ? -1 : 1;
		this._mTimeouts = {};
		this._fnControlUpdate = function(oEvent) {
			if (this._bScrolling) {
				this._scrollSelect(this._oSession.scrollForward, this._oSession.isVertical, oEvent);
			} else {
				if (!this._oSession.mSource || !this._oSession.mTarget) {
					return;
				}
				this._drawSelection(this._oSession.mSource, this._oSession.mTarget);
			}
		}.bind(this);
		this._fnOnMouseEnter = this._onmouseenter.bind(this);
		this._fnOnMouseOut = this._onmouseout.bind(this);
		this._fnOnMouseMove = this._onmousemove.bind(this);
		this._fnOnMouseUp = PriorityDelegate.onmouseup.bind(this);
		this._fnOnClick = PriorityDelegate.onclick.bind(this);
		this._fnRemoveSelection = this.removeSelection.bind(this);

		// Register Events as adding dependent does not trigger rerendering
		this._registerEvents();
		this._onSelectableChange();
	};

	/**
	 * @inheritDoc
	 */
	CellSelector.prototype.onDeactivate = function (oControl) {
		oControl.removeDelegate(PriorityDelegate, this);
		oControl.removeDelegate(EventDelegate, this);

		if (this._oSession) {
			this.removeSelection();
			this._oSession = null;
			this._mTimeouts = null;
		}

		this._deregisterEvents();
		this._onSelectableChange();
	};

	CellSelector.prototype.exit = function() {
		if (this.getControl()  && !this.getControl().isDestroyed() && this._oSession) {
			this.removeSelection();
		}
		this._deregisterEvents();
		this._oSession = null;
		this._mTimeouts = null;

		PluginBase.prototype.exit.call(this);
	};

	/**
	 * Determines whether cells are selectable.
	 *
	 * @private
	 * @returns {boolean} Whether cells are selectable
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	CellSelector.prototype.isSelectable = function() {
		return this.isActive() ? this.getConfig("isSupported", this.getControl(), this) : false;
	};

	/**
	 * Determines whether there is a cell selection.
	 *
	 * @private
	 * @returns {boolean} Whether there is a cell selection
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	CellSelector.prototype.hasSelection = function() {
		return Boolean(this._bSelecting && this._oSession?.mSource);
	};

	CellSelector.prototype._onSelectableChange = function() {
		this.getPlugin("sap.m.plugins.CopyProvider")?.onCellSelectorSelectableChange(this);
	};

	CellSelector.prototype._onSelectionChange = function() {
		/* @ui5-restricted sap.m.plugins.CopyProvider */
		this.fireEvent("selectionChange");
	};

	CellSelector.prototype._registerEvents = function() {
		var oControl = this.getControl();
		if (oControl) {
			this.getConfig("scrollEvent") && oControl.attachEvent(this.getConfig("scrollEvent"), this._fnControlUpdate);
			this.getConfig("attachSelectionChange", oControl, this._fnRemoveSelection);
			this.getConfig("attachBindingUpdate", oControl, this);
			var oScrollArea = oControl.getDomRef(this.getConfig("scrollArea"));
			if (oScrollArea) {
				oScrollArea.addEventListener("mouseleave", this._fnOnMouseOut);
				oScrollArea.addEventListener("mouseenter", this._fnOnMouseEnter);
				oScrollArea.addEventListener("mousemove", this._fnOnMouseMove);
				oScrollArea.addEventListener("click", this._fnOnClick);
			}
		}
		document.addEventListener("mouseup", this._fnOnMouseUp);
	};

	CellSelector.prototype._deregisterEvents = function() {
		var oControl = this.getControl();
		if (oControl) {
			this.getConfig("scrollEvent") && oControl.detachEvent(this.getConfig("scrollEvent"), this._fnControlUpdate);
			this.getConfig("detachSelectionChange", oControl, this._fnRemoveSelection);
			this.getConfig("detachBindingUpdate", oControl, this._fnOnBindingUpdate);
			var oScrollArea = oControl.getDomRef(this.getConfig("scrollArea"));
			if (oScrollArea) {
				oScrollArea.removeEventListener("mouseleave", this._fnOnMouseOut);
				oScrollArea.removeEventListener("mouseenter", this._fnOnMouseEnter);
				oScrollArea.removeEventListener("mousemove", this._fnOnMouseMove);
				oScrollArea.removeEventListener("click", this._fnOnClick);
			}
		}
		document.removeEventListener("mouseup", this._fnOnMouseUp);
	};

	/**
	 * Returns the cell selection range.
	 * The value <code>Infinity</code> in <code>rowIndex</code> indicates that the limit is reached.
	 *
	 * @param {boolean} bIgnore Ignore group header rows within selection range
	 * @returns {object} {{from: {rowIndex: int, colIndex: int}, to: {rowIndex: int, colIndex: int}} The selection range
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 * @private
	 */
	CellSelector.prototype.getSelectionRange = function (bIgnore) {
		if (!this._bSelecting) {
			return null;
		}

		var mSelectionRange = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		if (isNaN(mSelectionRange.from.rowIndex) || isNaN(mSelectionRange.to.rowIndex)) {
			return null;
		}

		var iMaxColumnIndex = this.getConfig("numberOfColumns", this.getControl(), true) - 1;
		mSelectionRange.from.colIndex = Math.max(mSelectionRange.from.colIndex, 0);
		mSelectionRange.to.colIndex = this._oSession.cellTypes.includes(CellType.Other) ? iMaxColumnIndex : Math.min(mSelectionRange.to.colIndex, iMaxColumnIndex);
		mSelectionRange.from.rowIndex = Math.max(mSelectionRange.from.rowIndex, 0);

		if (bIgnore) {
			mSelectionRange.ignoredRows = [];
			const aContexts = this.getSelectedRowContexts();
			aContexts.forEach((oContext, iIndex) => {
				const iRowIndex = mSelectionRange.from.rowIndex + iIndex;
				if (isGroupRow(this._getBinding(), oContext, iRowIndex)) {
					mSelectionRange.ignoredRows.push(iRowIndex);
				}
			});
		}
		delete mSelectionRange.from.type;
		delete mSelectionRange.to.type;

		return mSelectionRange;
	};

	/**
	 * Returns the row binding context of the current selection.
	 *
	 * @returns {sap.ui.model.Context[]} The binding context of selected rows
	 * @private
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	CellSelector.prototype.getSelectedRowContexts = function () {
		var mSelectionRange = this.getSelectionRange();
		if (!mSelectionRange) {
			return [];
		}

		return this.getConfig("getSelectedRowContexts", this.getControl(), mSelectionRange.from.rowIndex, mSelectionRange.to.rowIndex, this.getRangeLimit());
	};

	/**
	 * Returns the selected cells separated into selected rows and columns.
	 *
	 * Example:
	 * If the cells from (0, 0) to (2, 4) are selected, this method will return the following object:
	 * <pre>
	 * 	{
	 * 		rows: [Row0_Context, Row1_Context, Row2_Context],
	 * 		columns: [Column0, Column1, Column2, Column3, Column4]
	 * 	}
	 * </pre>
	 *
	 * <b>Note:</b> The content of the <code>rows</code> and <code>columns</code> depends on the owner control.
	 * The type of the column that is returned depends on the table type for which the plugin is used (for example, <code>sap.ui.table.Column</code> for <code>sap.ui.table.Table</code>).
	 *
	 * @param {boolean} bIgnore Ignores group headers from selection
	 * @returns {sap.m.plugins.CellSelector.Selection} An object containing the selected cells separated into rows and columns
	 * @public
	 * @since 1.124
	 */
	CellSelector.prototype.getSelection = function(bIgnore) {
		var mSelectionRange = this.getSelectionRange();
		if (!mSelectionRange) {
			return {rows: [], columns: []};
		}

		var aSelection = this.getConfig("getSelectedRowContexts", this.getControl(), mSelectionRange.from.rowIndex, mSelectionRange.to.rowIndex, this.getRangeLimit());
		if (bIgnore) {
			aSelection = aSelection.filter((oContext, iIndex) => !isGroupRow(this._getBinding(), oContext, iIndex + mSelectionRange.from.rowIndex));
		}

		var aSelectedColumns = this.getConfig("getVisibleColumns", this.getControl(), true).slice(mSelectionRange.from.colIndex, mSelectionRange.to.colIndex + 1);
		if (this.getControl().getParent().isA("sap.ui.mdc.Table")) {
			aSelectedColumns = aSelectedColumns.map(function(oSelectedColumn) {
				return Element.getElementById(oSelectedColumn.getId().replace(/\-innerColumn$/, ""));
			});
		}

		return {
			rows: aSelection,
			columns: aSelectedColumns
		};
	};

	/**
	 * Remove the current selection block.
	 *
	 * @public
	 */
	CellSelector.prototype.removeSelection = function () {
		this._clearSelection();

		const bSelectionChange = this._oSession?.mSource || this._oSession?.mTarget;
		this._bSelecting = false;
		this._mClickedCell = this._oPreviousCell = this._oHoveredCell = this._oOriginCell = null;
		this._oSession = { cellRefs: [], cellTypes: [] };
		if (bSelectionChange) {
			this._onSelectionChange();
		}
	};

	CellSelector.prototype._onsaparrowmodifiers = function(oEvent, sDirectionType, iRowDiff, iColDiff) {
		if (!this._shouldBeHandled(oEvent) || !oEvent.shiftKey || !this._getSelectableCell(oEvent.target) || oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) {
			this._oPreviousCell = undefined;
			return;
		}

		var oSelectableCell = this._getSelectableCell(oEvent.target);
		if (!oSelectableCell) {
			return;
		}

		var oInfo = this.getConfig("getCellInfo", this.getControl(), oSelectableCell, this._oPreviousCell);

		if (oInfo.rowIndex < 0 || oInfo.colIndex < 0) {
			return;
		}

		if (!this._inSelection(oEvent.target) || !this._oSession.mSource || !this._oSession.mTarget) {
			if (this.getConfig("isRowSelected", this.getControl(), oInfo.rowIndex)) {
				return;
			}
			// If not in selection block, start new selection block
			this._oSession.mSource = this._oSession.mTarget = oInfo;
			this._oPreviousCell = null;
		}

		if (oInfo.type == CellType.Ignore) {
			if (sDirectionType == DIRECTION.COL || !this._oPreviousCell) {
				// Do not modify/select if on a header/group header row and navigating in column direction (as their is technically only one)
				return;
			}
			oInfo.colIndex = this._oPreviousCell.colIndex;
		}

		this._oPreviousCell = oInfo;

		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		const { from, to, focus } = this._getUpdatedBounds(iRowDiff * this._iBtt, iColDiff * this._iRtl, oInfo);

		if (focus[sDirectionType + "Index"] < 0 || focus.colIndex >= this.getConfig("numberOfColumns", this.getControl())) {
			return;
		}

		this.getConfig("focusCell", this.getControl(), focus, true, iRowDiff > 0);
		if (sDirectionType == DIRECTION.ROW && (oInfo.rowIndex == mBounds.from.rowIndex || oInfo.rowIndex == mBounds.to.rowIndex)
			|| sDirectionType == DIRECTION.COL && (oInfo.colIndex == mBounds.from.colIndex || oInfo.colIndex == mBounds.to.colIndex)) {
			this._bSelecting = true;
			this._selectCells(from, to);
		}

		oEvent.setMarked();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Event handler for <code>mousemove</code>. Handles <code>mousemove</code> event during cell selection. Takes on tasks like:
	 * - updating resizer positions
	 * - mouse selection via cell click and move
	 * - selection enhancement via border and edge
	 * @param {jQuery.Event} oEvent The mouse event
	 * @private
	 */
	CellSelector.prototype._onmousemove = function(oEvent) {
		function select() {
			if (this._bBorderDown && !this._bScrolling) {
				var oBorder = this._oSession.border;
				var mDiff = {
					colIndex: isNaN(oBorder.colIndex) ? 0 : oInfo.colIndex - oBorder.colIndex,
					rowIndex: isNaN(oBorder.rowIndex) ? 0 : oInfo.rowIndex - oBorder.rowIndex
				};

				if (mDiff.rowIndex != 0 || mDiff.colIndex != 0) {
					const { from, to } = this._getUpdatedBounds(mDiff.rowIndex, mDiff.colIndex, oBorder);
					this._selectCells(from, to);
				}
			} else {
				this._startSelection(oEvent, true);
			}

			this.getConfig("focusCell", this.getControl(), oInfo, false);
			this._oPreviousCell = oInfo;
			this._oHoveredCell = oInfo;
		}


		// Only update the resizer if during selection the border is not pressed
		if (this._bSelecting && !this._bMouseDown && this._bRenderResizer) {
			const mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
			this._updateResizers(mBounds, oEvent.clientX, oEvent.clientY);
		}

		var oSelectableCell = this._getSelectableCell(oEvent.target);
		if (!oSelectableCell || !this._bMouseDown) {
			// Selection logic should not execute if mouse is not down or target is not a cell
			return;
		}

		clearTimeout(this._iTimer);
		oEvent.stopImmediatePropagation(); // Stop propagation to surpress other actions such as column resizing

		var oInfo = this.getConfig("getCellInfo", this.getControl(), oSelectableCell, this._oPreviousCell);
		if (oInfo.rowIndex < 0 || oInfo.colIndex < 0) {
			return;
		}

		const bClickedHovered = oInfo.rowIndex == this._oPreviousCell?.rowIndex && oInfo.colIndex == this._oPreviousCell?.colIndex;
		if (bClickedHovered || oInfo.type == CellType.Ignore) {
			return;
		}

		// If previously hovered cell is the same as the currently hovered one, do not execute anything (except the hovered cell is of type Other.
		if (oInfo.type == CellType.Other && this._oHoveredCell?.rowIndex == oInfo.rowIndex && this._oHoveredCell?.colIndex == oInfo.colIndex) {
			return;
		}

		// Remove text selection during mouse cell selection
		window.getSelection().removeAllRanges();

		if (!this._oSession.mSource && !this._oSession.mTarget) {
			this._oSession.mSource = this._oSession.mTarget = this._mClickedCell;
		}

		this._oHoveredCell = null;

		if (this._oPreviousCell && this._oPreviousCell.type != oInfo.type) {
			this._iTimer = setTimeout(select.bind(this), DELAY_SHORT);
			return;
		}

		if (this._mClickedCell
			&& this._mClickedCell.type == CellType.Other
			&& this._oPreviousCell?.type == CellType.Cell
			&& oInfo.type == CellType.Other) {
			this._iTimer = setTimeout(select.bind(this), DELAY_LONG);
		} else {
			if (oInfo.type == CellType.Other && this._mClickedCell.type != CellType.Other) {
				const mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
				this._mTempCell = this._mClickedCell; // very hacky to get it to work with popin hover starting from last column
				this._mClickedCell = mBounds.from;
			} else {
				this._mClickedCell = this._mTempCell ?? this._mClickedCell;
			}
			select.call(this);
		}
	};

	/**
	 * Event handler for mouse selection (leaving table, etc.)
	 *
	 * @param {jQuery.Event} oEvent The mouse event
	 * @private
	 */
	CellSelector.prototype._onmouseout = function(oEvent) {
		var oScrollAreaRef = this.getControl().getDomRef(this.getConfig("scrollArea"));

		if (!oScrollAreaRef || !this._bMouseDown) { return; }

		var oScrollAreaRect = oScrollAreaRef.getBoundingClientRect();

		var bForward, bVertical;
		this._bScrolling = false;
		if (oEvent.clientY > oScrollAreaRect.bottom || oEvent.clientY < oScrollAreaRect.top) {
			this._oSession.scrollForward = bForward = oEvent.clientY > oScrollAreaRect.bottom;
			this._oSession.isVertical = bVertical = true;
			this._bScrolling = true;
		}

		if (oEvent.clientX > oScrollAreaRect.right || oEvent.clientX < oScrollAreaRect.left) {
			this._oSession.scrollForward = bForward = oEvent.clientX > oScrollAreaRect.right;
			this._oSession.isVertical = bVertical = false;
			this._bScrolling = true;
		}

		if (this._bScrolling) {
			this._doScroll(bForward, bVertical, oEvent);
		}
	};

	CellSelector.prototype._onmouseenter = function(oEvent) {
		this._bScrolling = false;
		this._clearScroller();
	};

	CellSelector.prototype._doScroll = function(bForward, bVertical, oEvent) {
		this._clearScroller();
		if (this._bScrolling) {
			this.getConfig("scroll", this.getControl(), bForward, bVertical);
			this._mTimeouts.scrollTimerId = setTimeout(this._doScroll.bind(this, bForward, bVertical), DELAY_LONG);

			// If vertical scrolling, wait for the event, then select the next cells, not possible currently with horizontal scrolling
			if (!bVertical) {
				this._scrollSelect(bForward, bVertical, oEvent);
			}
		}
	};

	CellSelector.prototype._scrollSelect = function(bForward, bVertical, oEvent) {
		if (!this._bSelecting) {
			return;
		}
		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		if (this._bScrolling) {
			var sDirectionType = bVertical ? DIRECTION.ROW : DIRECTION.COL;
			var mDiff = { "row": 0, "col": 0 };
			var sType = bForward ? "to" : "from";

			mDiff[sDirectionType] = bForward ? 1 : -1;
			let mOldFocus = mBounds[sType];
			if (this._bBorderDown) {
				mOldFocus = this._oSession.border;
			}
			const { from, to } = this._getUpdatedBounds(mDiff[DIRECTION.ROW], mDiff[DIRECTION.COL], mOldFocus);
			this._selectCells(from, to);
		}
	};

	CellSelector.prototype._clearScroller = function() {
		if (this._mTimeouts.scrollTimerId) {
			window.clearTimeout(this._mTimeouts.scrollTimerId);
			this._mTimeouts.scrollTimerId = null;
		}
	};

	CellSelector.prototype._onborderdown = function(oEvent) {
		this._oSession.border = Object.assign({}, this._oCurrentBorder);
		this._bBorderDown = true;
		this._bMouseDown = true;
		// TODO: When borderdown, make "border" active
	};

	/**
	 * For a given DOM reference it returns the closest selectable cell.
	 * @param {HTMLELement} oDomRef DOM reference
	 * @returns {HTMLELement|null} Selectable cell DOM reference
	 * @private
	 */
	 CellSelector.prototype._getSelectableCell = function (oDomRef) {
		if (!oDomRef) {
			return;
		}

		return oDomRef.closest(this.getConfig("selectableCells"));
	};

	CellSelector.prototype._inSelection = function(oTarget) {
		var oInfo = this.getConfig("getCellInfo", this.getControl(), oTarget, this._oPreviousCell);
		if (!oInfo || !this._oSession.mSource || !this._oSession.mTarget) {
			return false;
		}

		var oBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);

		const bInBounds = !(oInfo.rowIndex < oBounds.from.rowIndex || oInfo.rowIndex > oBounds.to.rowIndex
			|| oInfo.colIndex < oBounds.from.colIndex || oInfo.colIndex > oBounds.to.colIndex);
		const bOtherSelected = oInfo.type == CellType.Other && this._oSession.cellTypes.includes(CellType.Other);

		return bInBounds || bOtherSelected;
	};

	CellSelector.prototype._startSelection = function(oEvent, bMove) {
		if (!this._shouldBeHandled(oEvent)) {
			return;
		}

		var oTarget = this._getSelectableCell(oEvent.target);
		if (!oTarget) {
			return;
		}

		if (!this._bSelectionInProgress) {
			this.getConfig("onSelectionStart", this.getControl(), oEvent);
			this._bSelectionInProgress = true;
			if (this._oPreviousCell) {
				this._startTarget = this.getConfig("getCellRef", this.getControl(), this._oPreviousCell);
			}
		}

		if (this._inSelection(oTarget) && !bMove) {
			this.removeSelection();
		} else {
			var oCellInfo = this.getConfig("getCellInfo", this.getControl(), oTarget, this._oPreviousCell);
			var mStart = this._mClickedCell ? this._mClickedCell : oCellInfo;

			this._bSelecting = true;
			this._oSession.mSource = oCellInfo;
			this._selectCells(mStart, oCellInfo);
			this._oPreviousCell = oCellInfo;
			this._oOriginCell = mStart;
		}

		oEvent.preventDefault();
		oEvent.setMarked && oEvent.setMarked();
	};

	CellSelector.prototype._endSelection = function(oEvent) {
		if (!this._bSelectionInProgress) {
			return;
		}
		this._bSelectionInProgress = false;

		var oTarget = this._getSelectableCell(oEvent.target);
		if (!oTarget) {
			return;
		}

		this.getConfig("onSelectionEnd", this.getControl(), oEvent);
	};

	/**
	 * Selects the next cells in a specific direction (ROW, COL).
	 * @param iRowDiff {int}
	 * @param iColDiff {int}
	 * @param mOldFocus {object}
	 * @returns {object} The updated bounding
	 * @private
	 */
	CellSelector.prototype._getUpdatedBounds = function(iRowDiff, iColDiff, mOldFocus) {
		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		var mFocus = Object.assign({}, mOldFocus);

		// Determine which "side" to adjust according to current position
		var sAdjustRowType = mFocus.rowIndex == mBounds.from.rowIndex ? "from" : "to";
		var sAdjustColType = mFocus.colIndex == mBounds.from.colIndex ? "from" : "to";

		mBounds[sAdjustRowType].rowIndex = Math.max(mBounds[sAdjustRowType].rowIndex + iRowDiff, 0);
		mBounds[sAdjustColType].colIndex = Math.max(mBounds[sAdjustColType].colIndex + iColDiff, 0);

		const oAdjustedColCell = this.getConfig("getCellRef", this.getControl(), mBounds[sAdjustColType]);
		if (oAdjustedColCell) {
			mBounds[sAdjustColType].type = this.getConfig("getCellType", this.getControl(), oAdjustedColCell);
		}

		if (!this._bBorderDown) {
			mFocus.rowIndex = Math.max(0, mFocus.rowIndex + iRowDiff);
			mFocus.colIndex = Math.max(0, mFocus.colIndex + iColDiff);
		} else {
			this._oSession.border.rowIndex += iRowDiff;
			this._oSession.border.colIndex += iColDiff;
		}

		return {
			from: mBounds.from,
			to: mBounds.to,
			focus: mFocus
		};
	};

	/**
	 * Selects the cell from the source cell to the provided target cell's coordinates.
	 *
	 * The algorithm builds up a bounding box, goes through all the cells inside it and determines their selection state.
	 * The bounding box can either be ranging from
	 * a) source cell to target cell or
	 * b) source cell to current lower right cell.
	 * The bigger bounding box of the two will be inspected.
	 * @param {sap.m.plugins.CellSelector.CellPosition} mFrom Source cell coordinates
	 * @param {sap.m.plugins.CellSelector.CellPosition} mTo Target cell coordinates
	 * @private
	 */
	CellSelector.prototype._selectCells = function (mFrom, mTo) {
		if (!this._bSelecting) {
			return;
		}

		mFrom = mFrom ? mFrom : this._oSession.mSource;
		mTo = mTo ? mTo : this._oSession.mTarget;

		this._oSession.cellTypes = [mFrom.type];

		// If the cell type of the hovered cell is not in cell types add it (a Set is probably better here)
		if (!this._oSession.cellTypes.includes(mTo.type)) {
			this._oSession.cellTypes.push(mTo.type);
		}

		if (mTo.rowIndex == Infinity || mFrom.rowIndex == Infinity) {
			this.getConfig("loadContexts", this.getControl(), Math.max(Math.min(mFrom, mTo), 0), this.getRangeLimit());
		}

		this._drawSelection(mFrom, mTo);

		if (!deepEqual(this._oSession.mSource, mFrom) || !deepEqual(this._oSession.mTarget, mTo)) {
			this._oSession.mSource = mFrom;
			this._oSession.mTarget = mTo;
			this._onSelectionChange();
		}
	};

	CellSelector.prototype._drawSelection = function (mFrom, mTo) {
		const bAdjustBounds = !isFinite(mFrom.rowIndex) || !isFinite(mTo.rowIndex);
		const mBounds = this._getNormalizedBounds(mFrom, mTo, bAdjustBounds);

		if (!mBounds.from || !mBounds.to) {
			return;
		}

		this._clearSelection();

		this._oSession.cellRefs = [];

		// Check if we need to draw "Other" cells
		const bDrawOther = this._oSession.cellTypes.includes(CellType.Other);
		for (var iRow = mBounds.from.rowIndex; iRow <= mBounds.to.rowIndex; iRow++) {
			// Only draw cells, if the Cell type is included in the selection
			if (this._oSession.cellTypes.includes(CellType.Cell)) {
				for (var iCol = mBounds.from.colIndex; iCol <= mBounds.to.colIndex; iCol++) {
					const mPosition = {rowIndex: iRow, colIndex: iCol};
					var oCellRef = this.getConfig("getCellRef", this.getControl(), mPosition);
					if (oCellRef) {
						const aRefs = this.getConfig("drawCellBorder", this.getControl(), oCellRef, mPosition, mBounds);
						this._oSession.cellRefs.push(...aRefs);
					}
				}
			}
			// Draw other cells, like Popin
			if (bDrawOther) {
				const iCol = this.getConfig("numberOfColumns", this.getControl()) - 1;
				const mPosition = {rowIndex: iRow, colIndex: iCol};
				const oCellRef = this.getConfig("getCellRef", this.getControl(), mPosition);
				if (oCellRef) {
					const aRefs = this.getConfig("drawCellBorder", this.getControl(), oCellRef, mPosition, mBounds);
					this._oSession.cellRefs.push(...aRefs);
				}
			}
		}
	};

	CellSelector.prototype._updateResizers = function(mBounds, iPositionX, iPositionY) {
		var oResizer = this._getResizer();

		if (this._iRtl == -1) {
			const iFromColIndex = mBounds.from.colIndex;
			mBounds.from.colIndex = mBounds.to.colIndex;
			mBounds.to.colIndex = iFromColIndex;
		}

		var oFromRef = this.getConfig("getCellRef", this.getControl(), mBounds.from, false),
			oToRef = this.getConfig("getCellRef", this.getControl(), mBounds.to, false);
		var mOutOfBounds = { 0: false, 1: false }; // 0: top, 1: bottom

		if (!oFromRef) {
			mOutOfBounds[0] = true;
			oFromRef = this.getConfig("getCellRef", this.getControl(), mBounds.from, true);
		}

		if (!oToRef) {
			mOutOfBounds[1] = true;
			oToRef = this.getConfig("getCellRef", this.getControl(), mBounds.to, true);
		}

		if (!oFromRef || !oToRef) {
			return;
		}

		var oFromRect = oFromRef.getBoundingClientRect(),
			oToRect = oToRef.getBoundingClientRect(),
			oTableRect = this.getControl().getDomRef().getBoundingClientRect();

		var mStyleMap = {
			x: { 0: oFromRect.left - oTableRect.left, 1: oToRect.left + oToRect.width - oTableRect.left },
			y: { 0: oFromRect.top - oTableRect.top, 1: oToRect.top + oToRect.height - oTableRect.top }
		};
		var mDiffMap = {
			x: { 0: iPositionX - oFromRect.left, 1: iPositionX - oToRect.right },
			y: { 0: iPositionY - oFromRect.top, 1: iPositionY - oToRect.bottom }
		};

		// 2 Bit Flags:
		// Y Direction | X Direction
		// 0           | 0
		var mFlags = 0;
		mFlags |= Math.abs(mDiffMap.x[0]) < Math.abs(mDiffMap.x[1]) ? 0 : 1;
		mFlags |= Math.abs(mDiffMap.y[0]) < Math.abs(mDiffMap.y[1]) ? 0 : 2;

		var iDiffX = Math.abs(mDiffMap.x[mFlags & 1]), iDiffY = Math.abs(mDiffMap.y[(mFlags >> 1) & 1]);
		if (iDiffX > 10 && iDiffY > 10 || iDiffX > 10 && mOutOfBounds[(mFlags >> 1) & 1]) {
			return;
		}

		oResizer.style.left = iDiffX <= 10 ? mStyleMap.x[mFlags & 1] + "px" : mStyleMap.x[0] + "px";
		oResizer.style.top = iDiffY <= 10 ? mStyleMap.y[(mFlags >> 1) & 1] + "px" : mStyleMap.y[0] + "px";
		oResizer.style.width = iDiffX <= 10 ? "" : oToRect.right - oFromRect.left + "px";
		oResizer.style.height = iDiffX <= 10 ? oToRect.bottom - oFromRect.top + "px" : "";

		const bXinRange = iDiffX <= 10, bYinRange = iDiffY <= 10;
		oResizer.classList.toggle("sapMPluginsVerticalBorder", bXinRange);
		oResizer.classList.toggle("sapMPluginsHorizontalBorder", bYinRange);
		oResizer.classList.toggle("sapMPluginsEdge", bXinRange && bYinRange);
		oResizer.classList.toggle("sapMPluginsNESW", bXinRange && bYinRange && (mFlags == 2 || mFlags == 1));
		oResizer.classList.toggle("sapMPluginsNWSE", bXinRange && bYinRange && (mFlags == 3 || mFlags == 0));

		this._oCurrentBorder = {};
		if (bXinRange) {
			this._oCurrentBorder.colIndex = mFlags & 1 ? mBounds.to.colIndex : mBounds.from.colIndex;
			this._oCurrentBorder.type = DIRECTION.COL;
		}

		if (bYinRange) {
			this._oCurrentBorder.rowIndex = (mFlags >> 1) & 1 ? mBounds.to.rowIndex : mBounds.from.rowIndex;
			this._oCurrentBorder.type = DIRECTION.ROW;
		}
	};

	/**
	 * Retrieves the resizer element. If none exists, creates an element.
	 * @returns {HTMLELement} Resizer element
	 * @private
	 */
	CellSelector.prototype._getResizer = function() {
		if (!this._oResizer) {
			this._oResizer = document.createElement("div");
			this._oResizer.setAttribute("id", "cs-rsz");
			this._oResizer.classList.add("sapMPluginsCellSelectorRsz");

			this._oResizer.addEventListener("mousedown", this._onborderdown.bind(this));

			if (this.getControl().getDomRef()) {
				this.getControl().getDomRef().appendChild(this._oResizer);
			}
		}
		return this._oResizer;
	};

	CellSelector.prototype._clearSelection = function() {
		this._oSession?.cellRefs?.forEach(function(oCellRef) {
			oCellRef.classList.remove("sapMPluginsCellSelectorSelected", "sapMPluginsCellSelectorTop", "sapMPluginsCellSelectorBottom", "sapMPluginsCellSelectorLeft", "sapMPluginsCellSelectorRight");
			oCellRef.removeAttribute("aria-selected");
		});
		var oResizer = this._getResizer();
		oResizer.style.left = "-10000px";
		oResizer.style.top = "-10000px";
	};

	/**
	 * Returns an object containing normalized coordinates for the given bounding area.
	 * <code>from</code> contains the coordinates for the upper left corner of the bounding area,
	 * <code>to</code> contains the coordinates of the lower right corner of the bounding area.
	 * @param {Object} mFrom Source cell coordinates
	 * @param {Object} mTo Target cell coordinates
	 * @param {boolean} bAdjustBounds bounds are adjusted to fit into limit/table boundaries (e.g. range selection)
	 * @returns {object} Object containing coordinates for the bounding area
	 */
	CellSelector.prototype._getNormalizedBounds = function(mFrom, mTo, bAdjustBounds) {
		const iMaxColumns = this.getConfig("numberOfColumns", this.getControl());
		const iMaxRows = this.getRangeLimit() == 0 ? this.getConfig("getRowCount", this.getControl()) : this.getRangeLimit();

		let toRowIndex = Math.max(mFrom.rowIndex, mTo.rowIndex), toColIndex = Math.max(mFrom.colIndex, mTo.colIndex);
		if (bAdjustBounds) {
			toRowIndex = Math.min(iMaxRows, toRowIndex);
			toColIndex = Math.min(iMaxColumns, toColIndex);
		}

		return {
			from: {rowIndex: Math.max(0, Math.min(mFrom.rowIndex, mTo.rowIndex)), colIndex: Math.max(0, Math.min(mFrom.colIndex, mTo.colIndex)), type: mFrom.type},
			to: {rowIndex: toRowIndex, colIndex: toColIndex, type: mTo.type}
		};
	};

	CellSelector.prototype._shouldBeHandled = function(oEvent) {
		// Handle if event is not marked and control is applicable
		return !oEvent.isMarked?.() && this.getConfig("isSupported", this.getControl(), this);
	};

	CellSelector.prototype._getBinding = function() {
		return this.getConfig("getBinding", this.getControl());
	};

	function isSelectableCell(oDomRef, sSelectors) {
		return oDomRef.matches(sSelectors);
	}

	function isGroupRow(oBinding, oContext, iIndex) {
		const oRowContext = oBinding?.getNodeByIndex?.(iIndex) ?? oContext;
		if (oBinding?.nodeHasChildren) {
			return oBinding.nodeHasChildren(oRowContext);
		}
		return !(oRowContext.getProperty("@ui5.node.isExpanded") === undefined);
	}

	function getRow(aRows, iRow, bIsRange, fnGetIndex) {
		if (bIsRange && aRows[0]) {
			return fnGetIndex(aRows[0]) > iRow ? aRows[0] : aRows[aRows.length - 1];
		}
		return aRows.find((oRow) => fnGetIndex(oRow) == iRow);
	}

	function getCellDOM(aCells, iCol, sClasses) {
		return aCells[iCol]?.$().closest(sClasses)[0];
	}

	/**
	 * Checks whether the key press event is a key combination.
	 *
	 * @param {sap.ui.base.Event} oEvent The keyboard event
	 * @param {string} sKeyCode Key code
	 * @param {boolean} bShift Shift key pressed
	 * @param {boolean} bCtrl Control key pressed
	 * @returns {boolean} Whether the key press event is a key combination
	 * @private
	 */
	function isKeyCombination(oEvent, sKeyCode, bShift, bCtrl) {
		return oEvent.keyCode == sKeyCode && oEvent.shiftKey == bShift && (oEvent.ctrlKey == bCtrl || oEvent.metaKey == bCtrl);
	}

	/**
	 * Checks whether drag on the rows/items aggregation is activated.
	 * @param {sap.ui.core.Control} oControl Control to be checked
	 * @param {string} sAffectedAggregation Name of the aggregation which is affected by D&D
	 * @returns {boolean} Whether drag on rows is enabled
	 */
	function hasDragEnabled(oControl, sAffectedAggregation) {
		return oControl.getDragDropConfig().some((oConfig) => oConfig.getSourceAggregation?.() == sAffectedAggregation && oConfig.getEnabled());
	}

	PluginBase.setConfigs({
		"sap.ui.table.Table": {
			selectableCells: ".sapUiTableDataCell",
			scrollArea: "tableCCnt",
			scrollEvent: "firstVisibleRowChanged",
			eventClearedAll: "sapUiTableClearAll",
			onActivate: function(oTable, oPlugin) {
				oTable.attachEvent("_change", oPlugin, this._onPropertyChange);
				oTable.attachEvent("EventHandlerChange", oPlugin, this._onEventHandlerChange);
			},
			onDeactivate: function(oTable, oPlugin) {
				oTable.detachEvent("_change", this._onPropertyChange);
				oTable.detachEvent("EventHandlerChange", this._onEventHandlerChange);
			},
			_onPropertyChange: function(oEvent, oPlugin) {
				oEvent.getParameter("name") == "selectionBehavior" && oPlugin._onSelectableChange();
			},
			_onEventHandlerChange: function(oEvent, oPlugin) {
				oEvent.getParameter("EventId") == "cellClick" && oPlugin._onSelectableChange();
			},
			/**
			 * Checks whether the table is compatible with cell selection.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @returns {boolean} Compatibility with cell selection
			 */
			isSupported: function(oTable, oPlugin) {
				return !oTable.hasListeners("cellClick")
					&& oTable.getSelectionBehavior() == "RowSelector"
					&& !hasDragEnabled(oTable, "rows");
			},
			isBottomToTop: function(oTable) {
				return false;
			},
			/**
			 * Returns the visible columns of the table.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @returns {sap.ui.table.Column[]} Array of visible columns
			 */
			getVisibleColumns: function (oTable) {
				return oTable.getColumns().filter(function (oColumn) {
					return oColumn.getDomRef();
				});
			},
			/**
			 * Retrieve the number of visible columns in the table.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {boolean} bIncludeSpecial Include special columns as separate columns
			 * @returns {number} Number of columns
			 */
			numberOfColumns: function(oTable, bIncludeSpecial) {
				return this.getVisibleColumns(oTable).length;
			},
			getRowCount: function(oTable) {
				return oTable._getTotalRowCount();
			},
			/**
			 * Retrieve the cell reference for a given position
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {sap.m.plugins.CellSelector.CellPosition} mPosition position of cell
			 * @param {boolean} bRange
			 * @returns {HTMLElement|undefined} cell's DOM element or undefined if the row or column index are invalid
			 */
			getCellRef: function (oTable, mPosition, bRange) {
				const oRow = getRow(oTable.getRows(), mPosition.rowIndex, bRange, (oRow) => oRow?.getIndex());

				if (!oRow) {
					return;
				}

				const oColumn = this.getVisibleColumns(oTable)[mPosition.colIndex];
				return oColumn && getCellDOM(oRow.getCells(), mPosition.colIndex, this.selectableCells);
			},
			/**
			 * Retrieve cell information for a given DOM element.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {HTMLElement} oTarget DOM reference of cell
			 * @returns {object} Cell information containing rowIndex, colIndex and cell type
			 */
			getCellInfo: function (oTable, oTarget) {
				return {
					rowIndex: Element.closestTo(oTarget, true).getIndex(),
					colIndex: this.getVisibleColumns(oTable).indexOf(Element.getElementById(oTarget.getAttribute("data-sap-ui-colid"))),
					type: this.getCellType(oTable, oTarget)
				};
			},
			/**
			 * Returns the cell type of the given target cell.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {HTMLELement} oTarget Cell reference
			 * @returns {string} Cell type
			 */
			getCellType: function(oTable, oTarget) {
				const oRow = Element.closestTo(oTarget, true);
				let sType = CellType.Cell;

				if (oRow.isGroupHeader()) {
					sType = CellType.Ignore;
				}

				return sType;
			},
			/**
			 * Retrieves the row contexts of the table according to the specified parameters.
			 * @param {sap.ui.table.Table} oTable The table instance
			 * @param {int} iFromIndex The start index
			 * @param {int} iToIndex The end index
			 * @param {int} iLimit The range limit
			 * @returns {sap.ui.model.Context[]} A portion of the row binding contexts
			 */
			getSelectedRowContexts: function(oTable, iFromIndex, iToIndex, iLimit) {
				if (iToIndex == Infinity) {
					var iMaxIndex = oTable.getBinding("rows").getAllCurrentContexts().length - 1;
					iToIndex = Math.min(iToIndex, iFromIndex + iLimit - 1, iMaxIndex);
				}

				var aContexts = [];
				for (var i = iFromIndex; i <= iToIndex; i++) {
					aContexts.push(oTable.getContextByIndex(i));
				}
				return aContexts;
			},
			/**
			 * Selects the rows with indices between iFrom and iTo.
			 * @param {sap.ui.table.Table} oTable The table instance
			 * @param {int} iFrom Start row index
			 * @param {int} iTo End row index
			 * @param {int} iFocus Focused row index
			 * @returns {boolean} Returns true if the selection was successful
			 */
			selectRows: function(oTable, iFrom, iTo, iFocus) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				var sSelectionMode = oTable.getSelectionMode();

				if (sSelectionMode == "None") {
					return false;
				} else if (sSelectionMode == "Single") {
					iFrom = iTo = iFocus;
				}

				if (oSelectionOwner.addSelectionInterval && oSelectionOwner.removeSelectionInterval) {
					for (let i = iFrom; i <= iTo; i++) {
						const bSelected = oSelectionOwner.isIndexSelected?.(i) ?? false;
						// Toggle Selection State
						if (bSelected) {
							oSelectionOwner.removeSelectionInterval(i, i);
						} else {
							oSelectionOwner.addSelectionInterval(i, i);
						}
					}
					return true;
				}

				// TODO: Handle V4 correctly. Currrently only selects visible rows
				var aRows = oTable.getRows().filter(function(oRow) {
					return oRow.getIndex() >= iFrom && oRow.getIndex() <= iTo;
				});
				aRows.forEach((oRow) => {
					oSelectionOwner.setSelected(oRow, !this.isRowSelected(oTable, oRow));
				});
				return true;
			},
			/**
			 * Checks if the given row is selected.
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {number|sap.ui.table.Row} vRow Either row index or row instance
			 * @returns {boolean} Selection state
			 */
			isRowSelected: function(oTable, vRow) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				if (typeof vRow === "number") {
					vRow = oTable.getRows().find(function(oRow) {
						return oRow.getIndex() == vRow;
					});
				}

				let bSelectionState = oSelectionOwner.isIndexSelected?.(vRow);
				if (vRow) {
					bSelectionState = oSelectionOwner.isSelected?.(vRow);
				}
				return bSelectionState ?? false;
			},
			focusCell: function(oTable, mFocus, bIsKeyboard, bForward) {
				var oCellRef = this.getCellRef(oTable, mFocus);
				if (!oCellRef) {
					this.scroll(oTable, bForward, true);
					return;
				}
				oCellRef.focus();
			},
			scroll: function(oTable, bForward, bVertical) {
				if (bVertical) {
					var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();
					var iIndex = bForward ? iFirstVisibleRowIndex + 1 : iFirstVisibleRowIndex - 1;
					if (iIndex >= 0 && iIndex != iFirstVisibleRowIndex) {
						oTable.setFirstVisibleRow(iIndex);
						return Promise.resolve();
					}
				} else {
					var oScrollBar = oTable._getScrollExtension().getHorizontalScrollbar();
					var iScrollDiff = Math.pow(-1, +!bForward) * 10;

					oScrollBar.scrollLeft = Math.max(0, oScrollBar.scrollLeft + iScrollDiff);
					return Promise.resolve();
				}
				return false;
			},
			attachSelectionChange: function(oTable, fnCallback) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				if (oSelectionOwner.attachSelectionChange) {
					oSelectionOwner.attachSelectionChange(fnCallback);
					return;
				}
				oSelectionOwner.attachRowSelectionChange(fnCallback);
			},
			detachSelectionChange: function(oTable, fnCallback) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				if (oSelectionOwner.detachSelectionChange) {
					oSelectionOwner.detachSelectionChange(fnCallback);
					return;
				}
				oSelectionOwner.detachRowSelectionChange(fnCallback);
			},
			attachBindingUpdate: function(oTable, oPlugin) {
				oTable.attachEvent("_rowsUpdated", oPlugin, this._fnOnRowsUpdated);
			},
			detachBindingUpdate: function(oTable, oPlugin) {
				oTable.detachEvent("_rowsUpdated", this._fnOnRowsUpdated);
			},
			_fnOnRowsUpdated: function(oEvent, oPlugin) {
				// TreeTable does not rerender after expand/collapse, so we need to remove the selection
				if (["collapse", "expand"].includes(oEvent.getParameter("reason"))) {
					oPlugin.removeSelection();
				}
			},
			_getSelectionOwner: function(oTable) {
				return PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable;
			},
			getBinding: function(oTable) {
				return oTable.getBinding("rows");
			},
			shouldRenderResizer: function(oTable) {
				return true;
			},
			drawCellBorder: function(oTable, oCellRef, mPosition, mBounds) {
				const sTop = this.isBottomToTop(oTable) ? "sapMPluginsCellSelectorBottom" : "sapMPluginsCellSelectorTop";
				const sBottom = this.isBottomToTop(oTable) ? "sapMPluginsCellSelectorTop" : "sapMPluginsCellSelectorBottom";

				oCellRef.classList.toggle(sTop, mPosition.rowIndex == mBounds.from.rowIndex);
				oCellRef.classList.toggle(sBottom, mPosition.rowIndex == mBounds.to.rowIndex);
				oCellRef.classList.toggle("sapMPluginsCellSelectorRight", mPosition.colIndex == mBounds.to.colIndex);
				oCellRef.classList.toggle("sapMPluginsCellSelectorLeft", mPosition.colIndex == mBounds.from.colIndex);
				oCellRef.classList.toggle("sapMPluginsCellSelectorSelected", true);
				oCellRef.setAttribute("aria-selected", "true");

				return [oCellRef];
			},
			loadContexts: function (oTable, iStartIndex, iLength) {
				var oBinding = oTable.getBinding("rows");
				if (!oBinding || oBinding.isA("sap.ui.model.ClientListBinding")) {
					return;
				}
				oBinding.getContexts(Math.max(0, iStartIndex), Math.max(1, iLength), 0, true);
			}
		},
		"sap.m.Table": {
			selectableCells: ".sapMLIBFocusable, .sapMListTblCell, .sapMListTblSubRowCell, .sapMListTblSubCnt",
			scrollArea: "listUl",
			eventClearedAll: "sapMTableClearAll",
			onActivate: function(oTable, oPlugin) {
				oTable.attachEvent("_change", oPlugin, this._onPropertyChange);
				oTable.attachEvent("EventHandlerChange", oPlugin, this._onEventHandlerChange);
			},
			onDeactivate: function(oTable, oPlugin) {
				oTable.detachEvent("_change", this._onPropertyChange);
				oTable.detachEvent("EventHandlerChange", this._onEventHandlerChange);
			},
			_onPropertyChange: function(oEvent, oPlugin) {
				oEvent.getParameter("name") == "mode" && oPlugin._onSelectableChange();
			},
			_onEventHandlerChange: function(oEvent, oPlugin) {
				oEvent.getParameter("EventId") == "itemPress" && oPlugin._onSelectableChange();
			},
			_getVisibleItems: function(oTable) {
				return oTable.getVisibleItems();
			},
			/**
			 * Checks whether the table is compatible with cell selection.
			 * @param {sap.m.Table} oTable Table instance
			 * @returns {boolean} Whether the table is compatible with cell selection
			 */
			isSupported: function(oTable, oPlugin) {
				return oTable.getMode() != ListMode.SingleSelectMaster && !hasDragEnabled(oTable, "items");
			},
			isBottomToTop: function(oTable) {
				return oTable.getGrowingDirection() == "Upwards";
			},
			/**
			 * Returns the visible columns of the table.
			 * @param {sap.m.Table} oTable Table instance
			 * @param {boolean} bIncludeSpecial Include special columns such as popins as separate columns
			 * @returns {sap.m.Column[]} Array of visible columns
			 */
			getVisibleColumns: function (oTable, bIncludeSpecial) {
				return oTable.getColumns(true).filter(function (oColumn) {
					const bIncludePopin = bIncludeSpecial && oColumn.isPopin();
					return oColumn.getVisible() && ((oColumn.getDomRef() && !oColumn.isPopin()) || bIncludePopin);
				});
			},
			/**
			 * Retrieves the number of visible columns in the table.
			 * @param {sap.m.Table} oTable Table instance
			 * @param {boolean} bIncludeSpecial Include special columns, such as popins as separate columns
			 * @returns {number} Number of columns
			 */
			numberOfColumns: function(oTable, bIncludeSpecial) {
				var iColCount = this.getVisibleColumns(oTable, bIncludeSpecial).length;
				return bIncludeSpecial ? iColCount : iColCount + oTable.hasPopin();
			},
			/**
			 * Retrieves the current row count.
			 * @param {sap.m.Table} oTable Table instance
			 * @returns {number} Row count
			 */
			getRowCount: function(oTable) {
				return this._getVisibleItems(oTable).length;
			},
			/**
			 * Retrieves the cell reference for a given position.
			 * @param {sap.m.Table} oTable Table instance
			 * @param {sap.m.plugins.CellSelector.CellPosition} mPosition Position of cell
			 * @param {boolean} bRange
			 * @returns {HTMLElement|undefined} DOM reference of the cell, or undefined if the row or column index is invalid
			 */
			getCellRef: function (oTable, mPosition, bRange) {
				const aRows = this._getVisibleItems(oTable);
				const oRow = getRow(oTable.getItems(), mPosition.rowIndex, bRange, (oRow) => aRows.indexOf(oRow));

				if (!oRow) {
					return;
				}

				if (oRow.isGroupHeader()) {
					return oRow.getDomRef();
				}

				if (oTable.hasPopin() && mPosition.colIndex == this.numberOfColumns(oTable) - 1) {
					return oRow.$Popin()[0].querySelector(".sapMListTblSubRowCell");
				}

				const oColumn = this.getVisibleColumns(oTable)[mPosition.colIndex];
				return oColumn && getCellDOM(oRow.getCells(), oColumn.getInitialOrder(), this.selectableCells);
			},
			/**
			 * Retrieves cell information for a given DOM element.
			 * @param {sap.m.Table} oTable Table instance
			 * @param {HTMLElement} oTarget DOM reference of cell
			 * @param {object} mPrevious DOM reference of previous cell
			 * @returns {object} Cell information containing rowIndex, colIndex and cell type
			 */
			getCellInfo: function (oTable, oTarget, mPrevious) {
				const aColumns = this.getVisibleColumns(oTable);

				const oColumn = Element.getElementById(oTarget.getAttribute("data-sap-ui-column"));
				const sType = this.getCellType(oTable, oTarget);
				let iColIndex = aColumns.indexOf(oColumn);

				if (sType == CellType.Other) {
					iColIndex = this.numberOfColumns(oTable) - 1;
				}

				if (sType == CellType.Ignore) {
					iColIndex = mPrevious?.colIndex ?? iColIndex;
				}

				return {
					rowIndex: this._getVisibleItems(oTable).indexOf(Element.closestTo(oTarget, true)),
					colIndex: iColIndex,
					type: sType
				};
			},
			/**
			 * Returns the cell type of the given target cell.
			 * @param {sap.m.Table} oTable Table instance
			 * @param {HTMLELement} oTarget Cell reference
			 * @returns {string|undefined} Cell type
			 */
			getCellType: function (oTable, oTarget) {
				const oColumn = Element.getElementById(oTarget.getAttribute("data-sap-ui-column"));
				const oItem = Element.closestTo(oTarget, true);

				if (!oItem) {
					return;
				}

				if (oItem.isGroupHeader?.()) {
					return CellType.Ignore;
				}

				const bIsPopin = oTarget.classList.contains("sapMListTblSubRowCell") || oTarget.classList.contains("sapMListTblSubCnt") || oTarget.classList.contains("sapMListTblSubRow");
				if (!oColumn && bIsPopin) {
					return CellType.Other;
				}
				return CellType.Cell;
			},
			/**
			 * Retrieves the row contexts of the table according to the specified parameters.
			 * @param {sap.m.Table} oTable The table instance
			 * @param {int} iFromIndex The start index
			 * @param {int} iToIndex The end index
			 * @param {int} iLimit The range limit
			 * @returns {sap.ui.model.Context[]} A portion of the row binding contexts
			 */
			getSelectedRowContexts: function(oTable, iFromIndex, iToIndex, iLimit) {
				const oItems = this._getVisibleItems(oTable);
				if (iToIndex == Infinity) {
					const iMaxIndex = oItems.length;
					iToIndex = Math.min(iToIndex, iFromIndex + iLimit - 1, iMaxIndex);
				}

				return oItems.filter((oItem) => !oItem.isGroupHeader?.()) // ignore group headers
					.slice(iFromIndex, iToIndex + 1)
					.map((oItem) => oItem?.getBindingContext(oTable.getBindingInfo("items")?.model));
			},
			/**
			 * Selects rows between indices iFrom and iTo.
			 * @param {sap.m.Table} oTable The table instance
			 * @param {int} iFrom Start row index
			 * @param {int} iTo End row index
			 * @param {int} iFocus Focused row index
			 * @returns {boolean} Whether the selection was successful
			 */
			selectRows: function(oTable, iFrom, iTo, iFocus) {
				var sSelectionMode = oTable.getMode();

				if (sSelectionMode == "Delete" || sSelectionMode == "None") {
					return false;
				} else if (sSelectionMode == "Single") {
					iFrom = iTo = iFocus;
				}

				const oItems = this._getVisibleItems(oTable);
				for (let i = iFrom; i < iTo; i++) {
					oTable.setSelectedItem(oItems[i], !this.isRowSelected(oTable, oItems[i]));
				}
				oTable.setSelectedItem(oItems[iTo], !this.isRowSelected(oTable, oItems[iTo]), true);

				return true;
			},
			/**
			 * Returns whether the given row is selected
			 * @param {sap.m.Table} oTable Table instance
			 * @param {number|sap.m.ListBase} vRow Either row index or row instance
			 * @returns {boolean} Selection state
			 */
			isRowSelected: function(oTable, vRow) {
				if (typeof vRow === "number") {
					vRow = this._getVisibleItems(oTable)[vRow];
				}
				return vRow.getSelected();
			},
			focusCell: function(oTable, mFocus, bIsKeyboard, bForward) {
				if (bIsKeyboard) {
					// do not focus, if keyboard selection
					return;
				}

				this.getCellRef(oTable, mFocus)?.focus();
			},
			scroll: function(oTable, bForward, bVertical) {
				return Promise.resolve();
			},
			attachSelectionChange: function(oTable, fnCallback) {
				oTable.attachSelectionChange(fnCallback);
			},
			detachSelectionChange: function(oTable, fnCallback) {
				oTable.detachSelectionChange(fnCallback);
			},
			attachBindingUpdate: function(oTable, oPlugin) {
				oTable.attachUpdateFinished(oPlugin, this._fnOnUpdateFinished);
			},
			detachBindingUpdate: function(oTable, oPlugin) {
				oTable.detachUpdateFinished(this._fnOnUpdateFinished);
			},
			_fnOnUpdateFinished: function(oEvent, oPlugin) {
				// ResponsiveTable does not rerender after sort/filter, so we need to clear the selection
				if (["Sort", "Filter"].includes(oEvent.getParameter("reason"))) {
					oPlugin.removeSelection();
				}
			},
			getBinding: function(oTable) {
				return oTable.getBinding("items");
			},
			shouldRenderResizer: function(oTable) {
				return !oTable.hasPopin();
			},
			drawCellBorder: function(oTable, oCellRef, mPosition, mBounds) {
				const bHasPopin = oTable.hasPopin();
				const bPopinSelected = bHasPopin && mBounds.to.colIndex == this.numberOfColumns(oTable) - 1;

				const sTop = this.isBottomToTop(oTable) ? "sapMPluginsCellSelectorBottom" : "sapMPluginsCellSelectorTop";
				const sBottom = this.isBottomToTop(oTable) ? "sapMPluginsCellSelectorTop" : "sapMPluginsCellSelectorBottom";

				oCellRef.classList.toggle(sTop, mPosition.rowIndex == mBounds.from.rowIndex || bHasPopin);
				oCellRef.classList.toggle(sBottom, mPosition.rowIndex == mBounds.to.rowIndex || bHasPopin);
				oCellRef.classList.toggle("sapMPluginsCellSelectorRight", mPosition.colIndex == mBounds.to.colIndex || (bPopinSelected && mPosition.colIndex == mBounds.to.colIndex - 1));
				oCellRef.classList.toggle("sapMPluginsCellSelectorLeft", mPosition.colIndex == mBounds.from.colIndex || (bPopinSelected && mPosition.colIndex == mBounds.to.colIndex));
				oCellRef.classList.toggle("sapMPluginsCellSelectorSelected", true);
				oCellRef.setAttribute("aria-selected", "true");

				return [oCellRef];
			},
			onSelectionStart: function(oTable, oEvent) {
				if (oEvent.type.startsWith("mouse")) {
					// Remove focus and hover
					oTable.getItems().forEach(function(oItem) {
						oItem.setActive(false);
						oItem.getDomRef().classList.remove("sapMLIBHoverable");
					});
				}
			},
			onSelectionEnd: function(oTable, oEvent) {
				if (oEvent.type.startsWith("mouse")) {
					// Add focus and hover
					oTable.getItems().forEach(function(oItem) {
						if (oItem.isActionable()) {
							oItem.getDomRef().classList.add("sapMLIBHoverable");
						}
					});
				}
			}
		}
	}, CellSelector);

	return CellSelector;
});