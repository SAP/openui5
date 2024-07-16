/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Row.
sap.ui.define([
	"sap/ui/core/Element", "./utils/TableUtils", "sap/ui/thirdparty/jquery"
], function(Element, TableUtils, jQuery) {
	"use strict";

	const RowType = Object.freeze({
		Standard: "Standard",
		Summary: "Summary",
		GroupHeader: "GroupHeader"
	});

	// TODO: Write tests for the row state including the Row.UpdateState hook.

	/**
	 * Constructor for an object that contains status information for a row.
	 *
	 * @constructor
	 * @alias sap.ui.table.Row.State
	 * @private
	 */
	function RowState() {
		let oContext = null;
		let sType = RowType.Standard;
		let bContentHidden = false;
		let sTitle = "";
		let bExpanded = false;
		let bExpandable = false;
		let iLevel = 0;

		Object.defineProperties(this, {
			/** @type sap.ui.model.Context */
			context: {
				get: function() { return oContext; },
				set: function(_oContext) {
					oContext = _oContext || null;
				}
			},
			/** @type {Readonly<{GroupHeader: string, Summary: string, Standard: string}>} */
			Type: {
				get: function() { return RowType; }
			},
			/** @type string */
			type: {
				get: function() { return sType; },
				set: function(_sType) {
					if (!(_sType in RowType)) {
						throw Error("Is not a valid type for sap.ui.table.Row: " + _sType);
					}
					sType = _sType;
				}
			},
			/** @type boolean */
			empty: {
				get: function() { return this.context == null; }
			},
			/** @type boolean */
			contentHidden: {
				get: function() { return this.empty ? true : bContentHidden; },
				set: function(_bContentHidden) {
					bContentHidden = _bContentHidden === true;
				}
			},
			/** @type string */
			title: {
				get: function() { return this.empty ? "" : sTitle; },
				set: function(_sTitle) {
					sTitle = (typeof _sTitle === "string" ? _sTitle : "");
				}
			},
			/** @type boolean */
			expandable: {
				get: function() { return this.empty ? false : bExpandable; },
				set: function(_bExpandable) {
					bExpandable = _bExpandable === true;
				}
			},
			/** @type boolean */
			expanded: {
				get: function() { return this.expandable ? bExpanded : false; },
				set: function(_bExpanded) {
					bExpanded = _bExpanded === true;
				}
			},
			/** @type number */
			level: {
				get: function() { return this.empty ? 0 : iLevel; },
				set: function(_iLevel) {
					iLevel = (typeof _iLevel === "number" ? Math.max(1, _iLevel || 1) : 1);
				}
			},
			/** @type Function */
			reset: {
				value: function() {
					oContext = null;
					sType = RowType.Standard;
					bContentHidden = false;
					sTitle = "";
					bExpandable = false;
					bExpanded = false;
					iLevel = 1;
				}
			}
		});
	}

	const StateMap = new window.WeakMap();

	/**
	 * Gets the status information for a row.
	 *
	 * @param {sap.ui.table.Row} oRow The instance of the row to get the status information for.
	 * @returns {sap.ui.table.Row.State} The status information of the row.
	 * @private
	 */
	function state(oRow) {
		if (!StateMap.has(oRow)) {
			StateMap.set(oRow, Object.seal(new RowState()));
		}
		return StateMap.get(oRow);
	}

	/**
	 * Constructor for a new Row.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The row.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Row
	 */
	const Row = Element.extend("sap.ui.table.Row", /** @lends sap.ui.table.Row.prototype */ {metadata: {
		library: "sap.ui.table",
		defaultAggregation: "cells",
		aggregations: {
			/**
			 * The actual cells are a table-internal construct. The controls in this aggregation are the content of the cells.
			 * This aggregation is managed by the table and must not be manipulated. Only read access is allowed.
			 */
			cells: {type: "sap.ui.core.Control", multiple: true, singularName: "cell"},

			/*
			 * Hidden aggregation for row actions
			 */
			_rowAction: {type: "sap.ui.table.RowAction", multiple: false, visibility: "hidden"},

			/*
			 * Hidden aggregation for the settings.
			 */
			_settings: {type: "sap.ui.table.RowSettings", multiple: false, visibility: "hidden"}
		}
	}});

	Row.prototype.init = function() {
		this.initDomRefs();
	};

	Row.prototype.exit = function() {
		this.initDomRefs();
	};

	Row.prototype.getFocusInfo = function() {
		const oTable = this.getTable();
		return oTable ? oTable.getFocusInfo() : Element.prototype.getFocusInfo.apply(this, arguments);
	};

	Row.prototype.applyFocusInfo = function(mFocusInfo) {
		const oTable = this.getTable();
		if (oTable) {
			oTable.applyFocusInfo(mFocusInfo);
		} else {
			Element.prototype.applyFocusInfo.apply(this, arguments);
		}
		return this;
	};

	/**
	 * If <code>bFirstInteractiveElement</code> is <code>true</code> and there are interactive elements in the
	 * data cells, sets the focus on the first interactive element. Otherwise sets the focus on the first
	 * data cell.
	 *
	 * @param {boolean} [bFirstInteractiveElement=false] Indicates whether to set the focus on the first
	 * interactive element
	 * @private
	 */
	Row.prototype._setFocus = function(bFirstInteractiveElement) {
		const oFirstInteractiveElement = TableUtils.getFirstInteractiveElement(this);

		if (bFirstInteractiveElement === true && oFirstInteractiveElement) {
			oFirstInteractiveElement.focus();
		} else {
			this.getDomRef("col0").focus();
		}
	};

	/**
	 * @private
	 */
	Row.prototype.addStyleClass = function(sStyleClass) {
		this.getDomRefs(true).row.addClass(sStyleClass);
	};

	/**
	 * @private
	 */
	Row.prototype.removeStyleClass = function(sStyleClass) {
		this.getDomRefs(true).row.removeClass(sStyleClass);
	};

	/**
	 * @private
	 */
	Row.prototype.initDomRefs = function() {
		this._mDomRefs = {};
	};

	/**
	 * Returns the index of the row in the table or -1 if not added to a table. This
	 * function considers the scroll position of the table and also takes fixed rows and
	 * fixed bottom rows into account.
	 *
	 * @returns {int} index of the row (considers scroll position and fixed rows)
	 * @public
	 */
	Row.prototype.getIndex = function() {
		const oTable = this.getTable();

		if (!oTable) {
			return -1;
		}

		// get the index of the row in the aggregation
		const iRowIndex = oTable.indexOfRow(this);
		const mRowCount = oTable._getRowCounts();

		// check for fixed rows. In this case the index of the context is the same like the index of the row in the aggregation
		if (mRowCount.fixedTop > 0 && iRowIndex < mRowCount.fixedTop) {
			return iRowIndex;
		}

		// check for fixed bottom rows
		if (mRowCount.fixedBottom > 0 && iRowIndex >= mRowCount.count - mRowCount.fixedBottom) {
			const iTotalRowCount = oTable._getTotalRowCount();
			if (iTotalRowCount >= mRowCount.count) {
				return iTotalRowCount - (mRowCount.count - iRowIndex);
			} else {
				return iRowIndex;
			}
		}

		return oTable._getFirstRenderedRowIndex() + iRowIndex;
	};

	/**
	 * The basic {@link sap.ui.core.Element#getDomRef} only returns the main DOM reference. A row consists of multiple DOM elements, which are
	 * returned by this function, either as native DOM references or as jQuery objects. The first time this function is called the references are
	 * cached, and in subsequent calls retrieved from the cache. In case the DOM has changed, the cache has to be invalidated manually with
	 * {@link sap.ui.table.Row#initDomRefs}.
	 *
	 * @param {boolean} [bJQuery=false] If set to <code>true</code>, jQuery objects are returned, otherwise native DOM references.
	 * @param {boolean} [bCollection=false] If set to <code>true</code>, the DOM references will be returned as an array, otherwise as an object.
	 * @returns {Object|Array} An object (or array, if <code>bCollection</code> is true) containing jQuery objects, or native references to the DOM
	 *                         elements of the row.
	 * @see sap.ui.core.Element#getDomRef
	 * @see sap.ui.table.Row#initDomRefs
	 * @private
	 */
	Row.prototype.getDomRefs = function(bJQuery, bCollection) {
		bJQuery = bJQuery === true;
		bCollection = bCollection === true;

		const sKey = bJQuery ? "jQuery" : "dom";
		const mDomRefs = this._mDomRefs;

		if (!mDomRefs[sKey]) {
			const oTable = this.getTable();
			const fnGetElement = function(sId) {
				const oElement = document.getElementById(sId);
				if (oElement) {
					return bJQuery ? jQuery(oElement) : oElement;
				}
				return null;
			};
			const fnGetParent = function(vElement) {
				if (vElement) {
					return bJQuery ? vElement.parent() : vElement.parentNode;
				}
				return null;
			};

			mDomRefs[sKey] = {};

			if (oTable) {
				const iRowIndex = oTable.indexOfRow(this);
				mDomRefs[sKey].rowSelector = fnGetElement(oTable.getId() + "-rowsel" + iRowIndex);
				mDomRefs[sKey].rowAction = fnGetElement(oTable.getId() + "-rowact" + iRowIndex);
			}

			mDomRefs[sKey].rowHeaderPart = fnGetParent(mDomRefs[sKey].rowSelector);
			mDomRefs[sKey].rowFixedPart = fnGetElement(this.getId() + "-fixed");
			mDomRefs[sKey].rowScrollPart = fnGetElement(this.getId());
			mDomRefs[sKey].rowActionPart = fnGetParent(mDomRefs[sKey].rowAction);
			mDomRefs[sKey].rowSelectorText = fnGetElement(this.getId() + "-rowselecttext");

			if (bJQuery) {
				mDomRefs[sKey].row = jQuery()
					.add(mDomRefs[sKey].rowHeaderPart)
					.add(mDomRefs[sKey].rowFixedPart)
					.add(mDomRefs[sKey].rowScrollPart)
					.add(mDomRefs[sKey].rowActionPart);
			} else {
				mDomRefs[sKey].row = [
					mDomRefs[sKey].rowHeaderPart,
					mDomRefs[sKey].rowFixedPart,
					mDomRefs[sKey].rowScrollPart,
					mDomRefs[sKey].rowActionPart
				].filter(Boolean);
			}
		}

		const mKeyDomRefs = mDomRefs[sKey];
		if (bCollection) {
			return Object.keys(mKeyDomRefs).map(function(sKey) {
				return sKey === "row" ? null : mKeyDomRefs[sKey];
			}).filter(Boolean);
		}

		return mKeyDomRefs;
	};

	/**
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @private
	 */
	Row.prototype._updateSelection = function() {
		const oTable = this.getTable();
		const bIsSelected = oTable._getSelectionPlugin().isSelected(this);

		this._setSelected(bIsSelected);
		oTable._getAccExtension().updateSelectionStateOfRow(this);
	};

	Row.prototype.setRowBindingContext = function(oContext, oTable) {
		const oBindingInfo = oTable.getBindingInfo("rows");
		const sModelName = oBindingInfo ? oBindingInfo.model : undefined;
		const oState = state(this);

		oState.reset();
		oState.context = oContext;

		if (oState.context) {
			TableUtils.Hook.call(oTable, TableUtils.Hook.Keys.Row.UpdateState, oState);
		}

		this.setBindingContext(oState.context, sModelName);
		this.getDomRefs(true).row.toggleClass("sapUiTableRowHidden", this.isContentHidden());
	};

	Row.prototype.getRowBindingContext = function() {
		return state(this).context;
	};

	Row.prototype.setBindingContext = function(oContext, sModelName) {
		return Element.prototype.setBindingContext.call(this, oContext || null, sModelName);
	};

	/**
	 * Gets the type of the row.
	 *
	 * @returns {string} The type of the row.
	 * @private
	 */
	Row.prototype.getType = function() {
		return state(this).type;
	};

	/**
	 * Whether the row is a group header.
	 *
	 * @returns {boolean} Whether the row is a group header.
	 * @private
	 */
	Row.prototype.isGroupHeader = function() {
		return this.getType() === RowType.GroupHeader;
	};

	/**
	 * Whether the row is a summary. A summary row displays, for example, the sum, min, max or average values.
	 *
	 * @returns {boolean} Whether the row is a summary.
	 * @private
	 */
	Row.prototype.isSummary = function() {
		return this.getType() === RowType.Summary;
	};

	/**
	 * Whether the row is a group summary. A group summary row displays, for example, the sum, min, max or average values of a group.
	 *
	 * @returns {boolean} Whether the row is a group summary.
	 * @private
	 */
	Row.prototype.isGroupSummary = function() {
		return this.isSummary() && this.getLevel() > 1;
	};

	/**
	 * Whether the row is a total summary. A total summary row displays, for example, the sum, min, max or average values of the entire data.
	 *
	 * @returns {boolean} Whether the row is a total summary.
	 * @private
	 */
	Row.prototype.isTotalSummary = function() {
		return this.isSummary() && this.getLevel() === 1;
	};

	/**
	 * Whether the row is empty. The row is declared empty if no binding context has been set by the table. Binding contexts that have been
	 * propagated or set from outside are not relevant.
	 *
	 * @see #setRowBindingContext
	 * @returns {boolean} Whether the row is empty.
	 * @private
	 */
	Row.prototype.isEmpty = function() {
		return state(this).empty;
	};

	/**
	 * Whether the content is hidden. The content is also considered hidden if the row is empty.
	 *
	 * @returns {boolean} Whether the content of the row is hidden.
	 * @private
	 */
	Row.prototype.isContentHidden = function() {
		return state(this).contentHidden;
	};

	/**
	 * Gets the level the row is inside a hierarchy. The level is 1 if the row is in a flat list, and 0 if it is empty.
	 *
	 * @returns {number} The level.
	 * @private
	 */
	Row.prototype.getLevel = function() {
		return state(this).level;
	};

	/**
	 * Gets the title text.
	 *
	 * @returns {string} The title.
	 * @private
	 */
	Row.prototype.getTitle = function() {
		return state(this).title;
	};

	/**
	 * Whether the row is expandable.
	 *
	 * @returns {boolean} Whether the row is expanded.
	 * @private
	 */
	Row.prototype.isExpandable = function() {
		return state(this).expandable;
	};

	/**
	 * Whether the row is expanded. If the row is not expandable, it cannot be expanded.
	 *
	 * @returns {boolean} Whether the row is expanded.
	 * @private
	 */
	Row.prototype.isExpanded = function() {
		return state(this).expanded;
	};

	Row.prototype.destroy = function() {
		// when the row is destroyed, all its cell controls will be destroyed as well. Since
		// they shall be reused, the destroy function is overridden in order to remove the controls from the cell
		// aggregation. The column will take care to destroy all cell controls when the column is destroyed
		this.removeAllCells();
		return Element.prototype.destroy.apply(this, arguments);
	};

	Row.prototype.invalidate = function() {
		return this;
	};

	/**
	 * Creates a ghost of the row which will be used during drag and drop actions.
	 *
	 * @return {HTMLElement} The HTML element representing the drag ghost of the row.
	 * @private
	 */
	Row.prototype.getDragGhost = function() {
		const oTable = this.getTable();
		const oTableElement = oTable.getDomRef();
		const mRowAreas = this.getDomRefs();
		const oGhostElement = oTableElement.cloneNode();
		let oGhostAreaElement;
		let oRowElementClone;
		const iSelectedRowCount = oTable._getSelectionPlugin().getSelectedCount();

		function removeForbiddenAttributes(oElement) {
			oElement.removeAttribute("id");
			oElement.removeAttribute("data-sap-ui");
			oElement.removeAttribute("data-sap-ui-related");

			const iChildCount = oElement.children.length;
			for (let i = 0; i < iChildCount; i++) {
				removeForbiddenAttributes(oElement.children[i]);
			}
		}

		function cloneTableAndRow(oTableElement, oRowElement) {
			const oTableClone = oTableElement.cloneNode();
			const oTableHeadClone = oTableElement.querySelector("thead").cloneNode(true);
			const oTableBodyClone = oTableElement.querySelector("tbody").cloneNode();
			const oRowClone = oRowElement.cloneNode(true);

			oTableBodyClone.appendChild(oRowClone);
			oTableClone.appendChild(oTableHeadClone);
			oTableClone.appendChild(oTableBodyClone);

			return oTableClone;
		}

		oGhostElement.classList.add("sapUiTableRowGhost");
		oGhostElement.classList.remove("sapUiTableVScr");
		oGhostElement.classList.remove("sapUiTableHScr");
		oGhostElement.style.width = oTableElement.getBoundingClientRect().width + "px";

		if (mRowAreas.rowSelector) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableRowHdrScr").cloneNode();
			oRowElementClone = mRowAreas.rowSelector.cloneNode(true);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (mRowAreas.rowFixedPart) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableCtrlScrFixed").cloneNode();
			oRowElementClone = cloneTableAndRow(oTable.getDomRef("table-fixed"), mRowAreas.rowFixedPart);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (mRowAreas.rowScrollPart) {
			const oScrollableColumnsContainer = oTable.getDomRef("sapUiTableCtrlScr");

			oGhostAreaElement = oScrollableColumnsContainer.cloneNode();
			oRowElementClone = cloneTableAndRow(oTable.getDomRef("table"), mRowAreas.rowScrollPart);

			oGhostAreaElement.appendChild(oTable.getDomRef("tableCtrlCnt").cloneNode());
			oGhostAreaElement.firstChild.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);

			// Copying the scroll position currently does not work.
			// The browser seems to "shift" the whole ghost to the right by the amount of pixels that is set for "scrollLeft".
			// Could work, if custom ghost handling is implemented in D&D.
			/*Promise.resolve().then(function(oGhostAreaElement, iScrollLeft) {
				// Needs to be done asynchronously, because the browser first needs to include this element into the layout.
				if (oGhostAreaElement) {
					oGhostAreaElement.scrollLeft = iScrollLeft;
				}
			}.bind(this, oGhostAreaElement, oScrollableColumnsContainer.scrollLeft));*/
		}

		if (mRowAreas.rowAction) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableRowActionScr").cloneNode();
			oRowElementClone = mRowAreas.rowAction.cloneNode(true);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (iSelectedRowCount > 1) {
			oGhostAreaElement = document.createElement("div");
			oGhostAreaElement.classList.add("sapUiTableRowGhostCount");

			const oCountElement = document.createElement("div");
			oCountElement.textContent = iSelectedRowCount;

			oGhostAreaElement.appendChild(oCountElement);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		removeForbiddenAttributes(oGhostElement);

		return oGhostElement;
	};

	/**
	 * Sets the visual selected state of the row.
	 *
	 * @param {boolean} bSelected Whether the row should be selected.
	 * @private
	 */
	Row.prototype._setSelected = function(bSelected) {
		const oTable = this.getTable();

		if (bSelected) {
			this.addStyleClass("sapUiTableRowSel");
		} else {
			this.removeStyleClass("sapUiTableRowSel");
		}

		if (oTable) {
			TableUtils.dynamicCall(oTable._getSyncExtension, function(oSyncExtension) {
				oSyncExtension.syncRowSelection(oTable.indexOfRow(this), bSelected);
			}, this);
		}
	};

	/**
	 * Sets the visual hovered state of the row.
	 *
	 * @param {boolean} bHovered Whether the row should be hovered.
	 * @private
	 */
	Row.prototype._setHovered = function(bHovered) {
		const oTable = this.getTable();

		if (bHovered) {
			this.addStyleClass("sapUiTableRowHvr");
		} else {
			this.removeStyleClass("sapUiTableRowHvr");
		}

		if (oTable) {
			TableUtils.dynamicCall(oTable._getSyncExtension, function(oSyncExtension) {
				oSyncExtension.syncRowHover(oTable.indexOfRow(this), bHovered);
			}, this);
		}
	};

	/**
	 * Returns the related <code>RowAction</code> of the row.
	 *
	 * This function must only be used for application testing purposes.
	 * The <code>RowAction</code> is generated based on a template. Manipulations of the object or its items are not supported.
	 *
	 * @return {sap.ui.table.RowAction} The related <code>RowAction</code> of the row.
	 * @private
	 * @ui5-restricted For testing purposes only
	 */
	Row.prototype.getRowAction = function() {
		return this.getAggregation("_rowAction");
	};

	/**
	 * Gets the parent table.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table or <code>null</code>.
	 * @private
	 */
	Row.prototype.getTable = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Expands the row if it can be expanded.
	 *
	 * @private
	 */
	Row.prototype.expand = function() {
		if (this.isExpandable() && !this.isExpanded()) {
			TableUtils.Hook.call(this.getTable(), TableUtils.Hook.Keys.Row.Expand, this);
		}
	};

	/**
	 * Collapses the row if it can be collapsed.
	 *
	 * @private
	 */
	Row.prototype.collapse = function() {
		if (this.isExpandable() && this.isExpanded()) {
			TableUtils.Hook.call(this.getTable(), TableUtils.Hook.Keys.Row.Collapse, this);
		}
	};

	/**
	 * If possible, it collapses the row if it is expanded, or expands it if it is collapsed.
	 *
	 * @private
	 */
	Row.prototype.toggleExpandedState = function() {
		if (this.isExpanded()) {
			this.collapse();
		} else {
			this.expand();
		}
	};

	/**
	 * Types
	 *
	 * @type {Readonly<{GroupHeader: string, Summary: string, Standard: string}>}
	 * @private
	 */
	Row.prototype.Type = RowType;

	return Row;
});