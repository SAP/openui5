/*!
 * ${copyright}
 */

// Provides control sap.ui.table.DataTable.
sap.ui.define(['jquery.sap.global', './TreeTable', './Table', './library'],
	function(jQuery, TreeTable, Table, library) {
	"use strict";


	
	/**
	 * Constructor for a new DataTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The DataTable control provides a set of sophisticated and comfort functions for table design. For example, you can make settings for the number of visible rows and a number for the displayed rows in the case the user expands the table. The first visible row can be explicitly set. For the selection of columns and rows, a Multi, a Single, a None, and an All mode are available. Setting the Editable property to true lets the user make changes on the table cell entries.
	 * @extends sap.ui.table.TreeTable
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.5.1. 
	 * The DataTable has been replaced via the Table/TreeTable control.
	 * @alias sap.ui.table.DataTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DataTable = TreeTable.extend("sap.ui.table.DataTable", /** @lends sap.ui.table.DataTable.prototype */ { metadata : {
	
		deprecated : true,
		library : "sap.ui.table",
		properties : {
	
			/**
			 * Count of visible rows when expanded
			 */
			expandedVisibleRowCount : {type : "int", defaultValue : null},
	
			/**
			 * Flag whether the Table is expanded or not
			 */
			expanded : {type : "boolean", defaultValue : false},
	
			/**
			 * Flag, whether the table displays its content hierarchical or not (**experimental**!!)
			 */
			hierarchical : {type : "boolean", defaultValue : false}
		},
		events : {
	
			/**
			 * fired when the row selection of the table has been changed
			 */
			rowSelect : {
				parameters : {
	
					/**
					 * row index which row has been selected or deselected
					 */
					rowIndex : {type : "int"}, 
	
					/**
					 * binding context of the row index which row has been selected or deselected
					 */
					rowContext : {type : "object"}, 
	
					/**
					 * array of row indices which selection has been changed (either selected or deselected)
					 */
					rowIndices : {type : "int[]"}
				}
			}
		}
	}});
	
	/**
	 * Initialization of the DataTable control
	 * @private
	 */
	DataTable.prototype.init = function() {
		
		TreeTable.prototype.init.apply(this, arguments);
		
		this._bInheritEditableToControls = true;
		
		// default values for DataTable
		this.setEditable(false);
		this.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
		
		this.attachRowSelectionChange(function(oEvent) {
			this.fireRowSelect(oEvent.mParameters);
		});
		
		this._iLastFixedColIndex = -1;
	
	};
	
	DataTable.prototype.isTreeBinding = function(sName) {
		sName = sName || "rows";
		if (sName === "rows") {
			return this.getHierarchical();
		}
		return sap.ui.core.Element.prototype.isTreeBinding.apply(this, arguments);
	};
	
	DataTable.prototype.setHierarchical = function(bHierarchical) {
		this.setProperty("hierarchical", bHierarchical);
		this._iLastFixedColIndex = bHierarchical ? 0 : -1;
	};
	
	DataTable.prototype.setVisibleRowCount = function(iRowCount) {
		this._iVisibleRowCount = iRowCount;
		if (!this.getExpanded()) {
			sap.ui.table.Table.prototype.setVisibleRowCount.apply(this, arguments);
		}
	};
	
	DataTable.prototype.setExpandedVisibleRowCount = function(iRowCount) {
		this.setProperty("expandedVisibleRowCount", iRowCount, true);
		if (this.getExpanded()) {
			sap.ui.table.Table.prototype.setVisibleRowCount.apply(this, arguments);
		}
	};
	
	DataTable.prototype.setExpanded = function(bExpanded) {
		this.setProperty("expanded", bExpanded, true);
		if (this.getExpandedVisibleRowCount() > 0) {
			var iRowCount = bExpanded ? this.getExpandedVisibleRowCount() : this._iVisibleRowCount;
			sap.ui.table.Table.prototype.setVisibleRowCount.call(this, iRowCount);
		}
	};
	
	DataTable.prototype.getContextByIndex = function (iRowIndex) {
		return Table.prototype.getContextByIndex.call(this, iRowIndex);
	};
	
	DataTable.prototype._updateTableContent = function() {
		Table.prototype._updateTableContent.apply(this, arguments);
	};

	return DataTable;

}, /* bExport= */ true);
