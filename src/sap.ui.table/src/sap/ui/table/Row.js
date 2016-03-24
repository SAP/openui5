/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Row.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './library'],
	function(jQuery, Element, library) {
	"use strict";



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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Row = Element.extend("sap.ui.table.Row", /** @lends sap.ui.table.Row.prototype */ { metadata : {

		library : "sap.ui.table",
		defaultAggregation : "cells",
		aggregations : {

			/**
			 * The controls for the cells.
			 */
			cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell"}
		}
	}});

	Row.prototype.init = function() {
		this.initDomRefs();
	};

	Row.prototype.exit = function() {
		this.initDomRefs();
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
	 * @return {int} index of the row (considers scroll position and fixed rows)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Row.prototype.getIndex = function() {
		var oTable = this.getParent();
		if (oTable) {
			// get the index of the row in the aggregation
			var iRowIndex = oTable.indexOfRow(this);

			// check for fixed rows. In this case the index of the context is the same like the index of the row in the aggregation
			var iNumberOfFixedRows = oTable.getFixedRowCount();
			if (iNumberOfFixedRows > 0 && iRowIndex < iNumberOfFixedRows) {
				return iRowIndex;
			}

			// check for fixed bottom rows
			var iNumberOfFixedBottomRows = oTable.getFixedBottomRowCount();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			if (iNumberOfFixedBottomRows > 0 && iRowIndex >= iVisibleRowCount - iNumberOfFixedBottomRows) {
				var oBinding = oTable.getBinding("rows");
				if (oBinding && oBinding.getLength() >= iVisibleRowCount) {
					return oBinding.getLength() - (iVisibleRowCount - iRowIndex);
				} else {
					return iRowIndex;
				}
			}

			var iFirstRow = oTable.getFirstVisibleRow();
			return iFirstRow + iRowIndex;
		}
		return -1;
	};

	/**
	 *
	 * @param bJQuery Set to true to get jQuery object instead of DomRef
	 * @returns {object} contains DomRefs or jQuery objects of the row
	 */
	Row.prototype.getDomRefs = function (bJQuery) {
		var fnAccess;
		var sKey;
		if (bJQuery === true) {
			fnAccess = jQuery.sap.byId;
			sKey = "jQuery";
		} else {
			fnAccess = jQuery.sap.domById;
			sKey = "dom";
		}

		if (!this._mDomRefs[sKey]) {
			this._mDomRefs[sKey] = {};
			var oTable = this.getParent();
			if (oTable) {
				var iRowIndex = oTable.indexOfRow(this);
				// row selector domRef
				this._mDomRefs[sKey].rowSelector = fnAccess(oTable.getId() + "-rowsel" + iRowIndex);
			}

			// row domRef
			this._mDomRefs[sKey].rowScrollPart = fnAccess(this.getId());
			// row domRef (the fixed part)
			this._mDomRefs[sKey].rowFixedPart = fnAccess(this.getId() + "-fixed");
			// row selector domRef
			this._mDomRefs[sKey].rowSelectorText = fnAccess(this.getId() + "-rowselecttext");

			if (bJQuery === true) {
				this._mDomRefs[sKey].row = this._mDomRefs[sKey].rowScrollPart;

				if (this._mDomRefs[sKey].rowFixedPart.length > 0) {
					this._mDomRefs[sKey].row = this._mDomRefs[sKey].row.add(this._mDomRefs[sKey].rowFixedPart);
				} else {
					// since this won't be undefined in jQuery case
					this._mDomRefs[sKey].rowFixedPart = undefined;
				}

				if (this._mDomRefs[sKey].rowSelector && this._mDomRefs[sKey].rowSelector.length > 0) {
					this._mDomRefs[sKey].row = this._mDomRefs[sKey].row.add(this._mDomRefs[sKey].rowSelector);
				} else {
					// since this won't be undefined in jQuery case
					this._mDomRefs[sKey].rowSelector = undefined;
				}
			}
		}

		return this._mDomRefs[sKey];
	};

	/**
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @param {Object} mTooltipTexts texts for aria descriptions and tooltips
	 * @param {Object} mTooltipTexts.mouse texts for tooltips
	 * @param {String} mTooltipTexts.mouse.rowSelect text for row select tooltip (if row is unselected)
	 * @param {String} mTooltipTexts.mouse.rowDeselect text for row de-select tooltip (if row is selected)
	 * @param {Object} mTooltipTexts.keyboard texts for aria descriptions
	 * @param {String} mTooltipTexts.keyboard.rowSelect text for row select aria description (if row is unselected)
	 * @param {String} mTooltipTexts.keyboard.rowDeselect text for row de-select aria description (if row is selected)
	 * @param {Boolean} bSelectOnCellsAllowed set to true when the entire row may be clicked for selecting it
	 * @private
	 */
	Row.prototype._updateSelection = function(oTable, mTooltipTexts, bSelectOnCellsAllowed) {
		var bIsSelected = oTable.isIndexSelected(this.getIndex());
		var $DomRefs = this.getDomRefs(true);

		var sSelectReference = "rowSelect";
		if (bIsSelected) {
			// when the row is selected it must show texts how to deselect
			sSelectReference = "rowDeselect";
		}

		// update tooltips
		if ($DomRefs.rowSelector) {
			$DomRefs.rowSelector.attr("title", mTooltipTexts.mouse[sSelectReference]);
		}

		if ($DomRefs.rowSelectorText) {
			var sText = "";
			if (!(this._oNodeState && this._oNodeState.sum) && !this._bHasChildren) {
				sText = mTooltipTexts.keyboard[sSelectReference];
			}
			$DomRefs.rowSelectorText.text(sText);
		}

		var $Row = $DomRefs.rowScrollPart;
		if ($DomRefs.rowFixedPart) {
			$Row = $Row.add($DomRefs.rowFixedPart);
		}

		if (bSelectOnCellsAllowed) {
			// the row requires a tooltip for selection if the cell selection is allowed
			$Row.attr("title", mTooltipTexts.mouse[sSelectReference]);
		} else {
			$Row.removeAttr("title");
		}

		if ($DomRefs.row) {
			// update visual selection state
			$DomRefs.row.toggleClass("sapUiTableRowSel", bIsSelected);
			oTable._getAccExtension().updateAriaStateOfRow(this, $DomRefs, bIsSelected);
		}
	};

	Row.prototype.setRowBindingContext = function(oContext, sModelName, oBinding) {
		var oNode;
		if (oContext && !(oContext instanceof sap.ui.model.Context)) {
			oNode = oContext;
			oContext = oContext.context;
		}

		var $rowTargets = this.getDomRefs(true).row;
		if (oContext) {
			this._bHidden = false;
			$rowTargets.removeClass("sapUiTableRowHidden");
		} else {
			this._bHidden = true;
			$rowTargets.addClass("sapUiTableRowHidden");
		}

		// collect rendering information for new binding context
		this._collectRenderingInformation(oContext, oNode, oBinding);

		this.setBindingContext(oContext, sModelName);
	};

	Row.prototype.setBindingContext = function(oContext, sModelName) {
		var bReturn = sap.ui.core.Element.prototype.setBindingContext.call(this, oContext || null, sModelName);

		this._updateTableCells(oContext);
		return bReturn;
	};

	Row.prototype._updateTableCells = function(oContext) {
		var aCells = this.getCells();
		var iAbsoluteRowIndex = this.getIndex();
		for (var i = 0; i < aCells.length; i++) {
			var oCell = aCells[i];
			if (oCell._updateTableCell) {
				oCell._updateTableCell(oCell, oContext, oCell.$().closest("td"), iAbsoluteRowIndex);
			}
		}
	};

	Row.prototype._collectRenderingInformation = function(oContext, oNode, oBinding) {
		// init node states
		this._oNodeState = undefined;
		this._iLevel = 0;
		this._bIsExpanded = false;
		this._bHasChildren = false;
		this._sTreeIconClass = "";

		if (oNode) {
			this._oNodeState = oNode.nodeState;
			this._iLevel = oNode.level;
			this._bIsExpanded = false;
			this._bHasChildren = false;
			this._sTreeIconClass = "sapUiTableTreeIconLeaf";
			this._sGroupIconClass = "";

			if (oBinding) {
				if (oBinding.getLevel) {
					//used by the "mini-adapter" in the TreeTable ClientTreeBindings
					this._bIsExpanded = oBinding.isExpanded(this.getIndex());
				} else if (oBinding.findNode) { // the ODataTreeBinding(Adapter) provides the hasChildren method for Tree
					this._bIsExpanded = this && this._oNodeState ? this._oNodeState.expanded : false;
				}

				if (oBinding.nodeHasChildren) {
					if (this._oNodeState) {
						this._bHasChildren = oBinding.nodeHasChildren(oNode);
					}
				} else if (oBinding.hasChildren) {
					this._bHasChildren = oBinding.hasChildren(oContext);
				}

				if (this._bHasChildren) {
					this._sTreeIconClass = this._bIsExpanded ? "sapUiTableTreeIconNodeOpen" : "sapUiTableTreeIconNodeClosed";
					this._sGroupIconClass = this._bIsExpanded ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";
				}
			}
		}
	};

	return Row;

}, /* bExport= */ true);
