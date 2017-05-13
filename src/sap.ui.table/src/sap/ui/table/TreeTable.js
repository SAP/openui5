/*!
 * ${copyright}
 */

// Provides control sap.ui.table.TreeTable.
sap.ui.define(['jquery.sap.global', './Table', 'sap/ui/model/odata/ODataTreeBindingAdapter', 'sap/ui/model/ClientTreeBindingAdapter', 'sap/ui/model/TreeBindingCompatibilityAdapter', './library', 'sap/ui/core/Element', './TableUtils'],
	function(jQuery, Table, ODataTreeBindingAdapter, ClientTreeBindingAdapter, TreeBindingCompatibilityAdapter, library, Element, TableUtils) {
	"use strict";

	/**
	 * Constructor for a new TreeTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The TreeTable control provides a comprehensive set of features to display hierarchical data.
	 * @extends sap.ui.table.Table
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.TreeTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TreeTable = Table.extend("sap.ui.table.TreeTable", /** @lends sap.ui.table.TreeTable.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Specifies whether the first level is expanded.
			 * @deprecated As of version 1.46.3, replaced by the corresponding binding parameter <code>numberOfExpandedLevels</code>.
			 *
			 * Example:
			 * <pre>
			 *   oTable.bindRows({
			 *      path: "...",
			 *      parameters: {
			 *         numberOfExpandedLevels: 1
			 *      }
			 *   });
			 * </pre>
			 *
			 * The value of the property is only taken into account if no parameter <code>numberOfExpandedLevels</code> is given in the binding information.
			 * Changes to this property after the table is bound do not have any effect unless an explicit (re-)bind of the <code>rows</code> aggregation is done.
			 */
			expandFirstLevel : {type : "boolean", defaultValue : false, deprecated: true},

			/**
			 * If group mode is enabled nodes with subitems are rendered as if they were group headers.
			 * This can be used to do the grouping for an OData service on the backend and visualize this in a table.
			 */
			useGroupMode : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * The property name of the rows data which will be displayed as a group header if the group mode is enabled
			 */
			groupHeaderProperty : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Setting collapseRecursive to true means, that when collapsing a node all subsequent child nodes will also be collapsed.
			 * This property is only supported with sap.ui.model.odata.v2.ODataModel.
			 * <b>Note:</b> collapseRecursive is currently <b>not</b> supported if your OData service exposes the hierarchy annotation <code>hierarchy-descendant-count-for</code>.
			 * In this case the value of the collapseRecursive property is ignored.
			 * For more information about the OData hierarchy annotations, please see the <b>SAP Annotations for OData Version 2.0</b> specification.
			 */
			collapseRecursive : {type: "boolean", defaultValue: true},

			/**
			 * The root level is the level of the topmost tree nodes, which will be used as an entry point for OData services.
			 * This property is only supported when the TreeTable uses an underlying odata services with hierarchy annotations.
			 * This property is only supported with sap.ui.model.odata.v2.ODataModel
			 * The hierarchy annotations may also be provided locally as a parameter for the ODataTreeBinding.
			 */
			rootLevel : {type: "int", group: "Data", defaultValue: 0}
		},
		events : {

			/**
			 * fired when a node has been expanded or collapsed (only available in hierachical mode)
			 */
			toggleOpenState : {
				parameters : {

					/**
					 * index of the expanded/collapsed row
					 */
					rowIndex : {type : "int"},

					/**
					 * binding context of the selected row
					 */
					rowContext : {type : "object"},

					/**
					 * flag whether the node has been expanded or collapsed
					 */
					expanded : {type : "boolean"}
				}
			}
		}
	}, renderer: "sap.ui.table.TableRenderer"});


	/**
	 * Initialization of the TreeTable control
	 * @private
	 */
	TreeTable.prototype.init = function() {
		Table.prototype.init.apply(this, arguments);
		TableUtils.Grouping.setTreeMode(this);
	};

	TreeTable.prototype.bindRows = function(oBindingInfo) {
		// Old API compatibility (sPath, oTemplate, oSorter, aFilters)
		if (typeof oBindingInfo === "string") {
			oBindingInfo = {
				path: oBindingInfo,
				sorter: arguments[2],
				filters: arguments[3],
				template: arguments[1]
			};
		}

		if (oBindingInfo != null) {
			if (oBindingInfo.parameters == null) {
				oBindingInfo.parameters = {};
			}

			oBindingInfo.parameters.rootLevel = this.getRootLevel();
			oBindingInfo.parameters.collapseRecursive = this.getCollapseRecursive();

			// If the number of expanded levels is not specified in the binding parameters, we use the corresponding table property
			// to determine the value.
			oBindingInfo.parameters.numberOfExpandedLevels = oBindingInfo.parameters.numberOfExpandedLevels || (this.getExpandFirstLevel() ? 1 : 0);

			oBindingInfo.events = {
				selectionChanged: this._onSelectionChanged.bind(this)
			};
		}

		return Table.prototype.bindRows.call(this, oBindingInfo);
	};

	/**
	 * Sets the selection mode. The current selection is lost.
	 * @param {string} sSelectionMode the selection mode, see sap.ui.table.SelectionMode
	 * @public
	 * @return a reference on the table for chaining
	 */
	TreeTable.prototype.setSelectionMode = function (sSelectionMode) {
		var oBinding = this.getBinding("rows");
		if (oBinding && oBinding.clearSelection) {
			oBinding.clearSelection();

			// Check for valid selection modes (e.g. change deprecated mode "Multi" to "MultiToggle")
			sSelectionMode = TableUtils.sanitizeSelectionMode(this, sSelectionMode);
			this.setProperty("selectionMode", sSelectionMode);
		} else {
			Table.prototype.setSelectionMode.call(this, sSelectionMode);
		}
		return this;
	};

	/**
	 * Setter for property <code>fixedRowCount</code>.
	 *
	 * <b>This property is not supportd for the TreeTable and will be ignored!</b>
	 *
	 * Default value is <code>0</code>
	 *
	 * @param {int} iFixedRowCount  new value for property <code>fixedRowCount</code>
	 * @return {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
	 * @public
	 */
	TreeTable.prototype.setFixedRowCount = function(iRowCount) {
		// this property makes no sense for the TreeTable
		jQuery.sap.log.warning("TreeTable: the property \"fixedRowCount\" is not supported and will be ignored!");
		return this;
	};


	TreeTable.prototype.isTreeBinding = function(sName) {
		sName = sName || "rows";
		if (sName === "rows") {
			return true;
		}
		return Element.prototype.isTreeBinding.apply(this, arguments);
	};

	TreeTable.prototype.getBinding = function(sName) {
		sName = sName || "rows";
		var oBinding = Element.prototype.getBinding.call(this, sName);

		if (oBinding && sName === "rows" && !oBinding.getLength) {
			if (TableUtils.isInstanceOf(oBinding, "sap/ui/model/odata/ODataTreeBinding")) {
				// use legacy tree binding adapter
				TreeBindingCompatibilityAdapter(oBinding, this);
			} else if (TableUtils.isInstanceOf(oBinding, "sap/ui/model/odata/v2/ODataTreeBinding")) {
				oBinding.applyAdapterInterface();
			} else if (TableUtils.isInstanceOf(oBinding, "sap/ui/model/ClientTreeBinding")) {
				ClientTreeBindingAdapter.apply(oBinding);
			} else {
				jQuery.sap.log.error("Binding not supported by sap.ui.table.TreeTable");
			}
		}

		return oBinding;
	};

	TreeTable.prototype._getContexts = function(iStartIndex, iLength, iThreshold) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			// first call getContexts to trigger data load but return nodes instead of contexts
			return oBinding.getNodes(iStartIndex, iLength, iThreshold);
		} else {
			return [];
		}
	};

	TreeTable.prototype._onGroupHeaderChanged = function(iRowIndex, bExpanded) {
		this.fireToggleOpenState({
			rowIndex: iRowIndex,
			rowContext: this.getContextByIndex(iRowIndex),
			expanded: bExpanded
		});
	};

	/**
	 * expands the row for the given row index
	 *
	 * @param {int} iRowIndex
	 *         index of the row to expand
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.expand = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding && iRowIndex >= 0) {
			oBinding.expand(iRowIndex);
		}

		return this;
	};

	/**
	 * collapses the row for the given row index
	 *
	 * @param {int} iRowIndex
	 *         index of the row to collapse
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.collapse = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding && iRowIndex >= 0) {
			oBinding.collapse(iRowIndex);
		}

		return this;
	};

	/**
	 * Collapses all nodes (and lower if collapseRecursive is activated)
	 *
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.collapseAll = function () {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			oBinding.collapseToLevel(0);
			this.setFirstVisibleRow(0);
		}

		return this;
	};

	/**
	 * Expands all nodes starting from the root level to the given level 'iLevel'.
	 *
	 * Only supported with ODataModel v2, when running in OperationMode.Client or OperationMode.Auto.
	 * Fully supported for <code>sap.ui.model.ClientTreeBinding</code>, e.g. if you are using a <code>sap.ui.model.json.JSONModel</code>.
	 *
	 * Please also see <code>sap.ui.model.odata.OperationMode</code>.
	 *
	 * @param {int} iLevel the level to which the trees shall be expanded
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.expandToLevel = function (iLevel) {
		var oBinding = this.getBinding("rows");

		jQuery.sap.assert(oBinding && oBinding.expandToLevel, "TreeTable.expandToLevel is not supported with your current Binding. Please check if you are running on an ODataModel V2.");

		if (oBinding && oBinding.expandToLevel) {
			oBinding.expandToLevel(iLevel);
		}

		return this;
	};

	/**
	 * Returns whether the row is expanded or collapsed.
	 *
	 * @param {int} iRowIndex index of the row to check
	 * @return {boolean} true if the node at "iRowIndex" is expanded, false otherwise (meaning it is collapsed)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.isExpanded = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return oBinding.isExpanded(iRowIndex);
		}
		return false;
	};

	/**
	 * Checks if the row at the given index is selected.
	 *
	 * @param {int} iRowIndex The row index for which the selection state should be retrieved
	 * @return {boolean} true if the index is selected, false otherwise
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.isIndexSelected = function (iRowIndex) {
		var oBinding = this.getBinding("rows");
		//when using the treebindingadapter, check if the node is selected
		if (oBinding && oBinding.isIndexSelected) {
			return oBinding.isIndexSelected(iRowIndex);
		} else {
			return Table.prototype.isIndexSelected.call(this, iRowIndex);
		}
	};

	/**
	 * Overridden from Table.js base class.
	 * In a TreeTable you can only select indices, which correspond to the currently visualized tree.
	 * Invisible tree nodes (e.g. collapsed child nodes) can not be selected via Index, because they do not
	 * correspond to a TreeTable row.
	 *
	 * @param {int} iRowIndex The row index which will be selected (if existing)
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.setSelectedIndex = function (iRowIndex) {
		if (iRowIndex === -1) {
			//If Index eq -1 no item is selected, therefore clear selection is called
			//SelectionModel doesn't know that -1 means no selection
			this.clearSelection();
		}

		//when using the treebindingadapter, check if the node is selected
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.findNode && oBinding.setNodeSelection) {
			// set the found node as selected
			oBinding.setSelectedIndex(iRowIndex);
			//this.fireEvent("selectionChanged");
		} else {
			Table.prototype.setSelectedIndex.call(this, iRowIndex);
		}
		return this;
	};

	/**
	 * Returns an array containing the row indices of all selected tree nodes (ordered ascending).
	 *
	 * Please be aware of the following:
	 * Due to performance/network traffic reasons, the getSelectedIndices function returns only all indices
	 * of actually selected rows/tree nodes. Unknown rows/nodes (as in "not yet loaded" to the client), will not be
	 * returned.
	 *
	 * @return {int[]} an array containing all selected indices
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.getSelectedIndices = function () {
		//when using the treebindingadapter, check if the node is selected
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.findNode && oBinding.getSelectedIndices) {
			/*jQuery.sap.log.warning("When using a TreeTable on a V2 ODataModel, you can also use 'getSelectedContexts' on the underlying TreeBinding," +
					" for an optimised retrieval of the binding contexts of the all selected rows/nodes.");*/
			return oBinding.getSelectedIndices();
		} else {
			return Table.prototype.getSelectedIndices.call(this);
		}
	};

	/**
	 * Sets the selection of the TreeTable to the given range (including boundaries).
	 * Beware: The previous selection will be lost/overriden. If this is not wanted, please use "addSelectionInterval" and
	 * "removeSelectionIntervall".
	 *
	 * @param {int} iFromIndex the start index of the selection range
	 * @param {int} iToIndex the end index of the selection range
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
		var sSelectionMode = this.getSelectionMode();

		if (sSelectionMode === library.SelectionMode.None) {
			return this;
		}

		//when using the treebindingadapter, check if the node is selected
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.findNode && oBinding.setSelectionInterval) {
			if (sSelectionMode === library.SelectionMode.Single) {
				oBinding.setSelectionInterval(iFromIndex, iFromIndex);
			} else {
				oBinding.setSelectionInterval(iFromIndex, iToIndex);
			}
		} else {
			Table.prototype.setSelectionInterval.call(this, iFromIndex, iToIndex);
		}

		return this;
	};

	/**
	 * Marks a range of tree nodes as selected, starting with iFromIndex going to iToIndex.
	 * The TreeNodes are referenced via their absolute row index.
	 * Please be aware, that the absolute row index only applies to the the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 *
	 * Please also take notice of the fact, that "addSelectionInterval" does not change any other selection.
	 * To override the current selection, please use "setSelctionInterval" or for a single entry use "setSelectedIndex".
	 *
	 * @param {int} iFromIndex The starting index of the range which will be selected.
	 * @param {int} iToIndex The starting index of the range which will be selected.
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
		var sSelectionMode = this.getSelectionMode();

		if (sSelectionMode === library.SelectionMode.None) {
			return this;
		}

		var oBinding = this.getBinding("rows");
		//TBA check
		if (oBinding && oBinding.findNode && oBinding.addSelectionInterval) {
			if (sSelectionMode === library.SelectionMode.Single) {
				oBinding.setSelectionInterval(iFromIndex, iFromIndex);
			} else {
				oBinding.addSelectionInterval(iFromIndex, iToIndex);
			}
		} else {
			Table.prototype.addSelectionInterval.call(this, iFromIndex, iToIndex);
		}
		return this;
	};

	/**
	 * All rows/tree nodes inside the range (including boundaries) will be deselected.
	 * Tree nodes are referenced with theit absolute row index inside the tree-
	 * Please be aware, that the absolute row index only applies to the the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 *
	 * @param {int} iFromIndex The starting index of the range which will be deselected.
	 * @param {int} iToIndex The starting index of the range which will be deselected.
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
		var oBinding = this.getBinding("rows");
		//TBA check
		if (oBinding && oBinding.findNode && oBinding.removeSelectionInterval) {
			oBinding.removeSelectionInterval(iFromIndex, iToIndex);
		} else {
			Table.prototype.removeSelectionInterval.call(this, iFromIndex, iToIndex);
		}
		return this;
	};

	/**
	 * Selects all available nodes/rows.
	 *
	 * All rows/tree nodes that are locally stored on the client and that are part of the currently visible tree are selected.
	 * Additional rows or tree nodes that come into view through scrolling or paging are also selected immediately as soon as they get visible.
	 * However, <code>SelectAll</code> does not retrieve any data from the back end in order to improve performance and reduce the network traffic.
	 *
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.selectAll = function () {
		//select all is only allowed when SelectionMode is "Multi" or "MultiToggle"
		var oSelMode = this.getSelectionMode();
		if (!this.getEnableSelectAll() || (oSelMode != "Multi" && oSelMode != "MultiToggle") || !this._getSelectableRowCount()) {
			return this;
		}

		//The OData TBA exposes a selectAll function
		var oBinding = this.getBinding("rows");
		if (oBinding.selectAll) {
			var $SelAll = this.$("selall");
			$SelAll.removeClass("sapUiTableSelAll");
			if (this._getShowStandardTooltips()) {
				$SelAll.attr('title', this._oResBundle.getText("TBL_DESELECT_ALL"));
			}
			this._getAccExtension().setSelectAllState(true);
			oBinding.selectAll();
		} else {
			//otherwise fallback on the tables own function
			Table.prototype.selectAll.call(this);
		}

		return this;
	};

	/**
	 * Retrieves the lead selection index. The lead selection index is, among other things, used to determine the
	 * start/end of a selection range, when using Shift-Click to select multiple entries at once.
	 *
	 * @return {int} index of lead selected row
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.getSelectedIndex = function() {
		//when using the treebindingadapter, check if the node is selected
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.findNode) {
			return oBinding.getSelectedIndex();
		} else {
			return Table.prototype.getSelectedIndex.call(this);
		}
	};

	/**
	 * Clears the complete selection (all tree table rows/nodes will lose their selection)
	 *
	 * @return {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.clearSelection = function () {
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.clearSelection) {
			oBinding.clearSelection();
		} else {
			Table.prototype.clearSelection.call(this);
		}

		return this;
	};

	TreeTable.prototype.getContextByIndex = function (iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return oBinding.getContextByIndex(iRowIndex);
		}
	};

	/**
	 * Set the rootLevel for the hierarchy
	 * The root level is the level of the topmost tree nodes, which will be used as an entry point for OData services.
	 * This setting has only effect when the binding is already initialized.
	 * @param {int} iRootLevel
	 * @returns {TreeTable}
	 */
	TreeTable.prototype.setRootLevel = function(iRootLevel) {
		this.setFirstVisibleRow(0);

		var oBinding = this.getBinding("rows");
		if (oBinding) {
			jQuery.sap.assert(oBinding.setRootLevel, "rootLevel is not supported by the used binding");
			if (oBinding.setRootLevel) {
				oBinding.setRootLevel(iRootLevel);
			}
		}
		this.setProperty("rootLevel", iRootLevel, true);

		return this;
	};

	/**
	 * Sets the node hierarchy to collapse recursive. When set to true, all child nodes will get collapsed as well.
	 * This setting has only effect when the binding is already initialized.
	 * @param {boolean} bCollapseRecursive
	 */
	TreeTable.prototype.setCollapseRecursive = function(bCollapseRecursive) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			jQuery.sap.assert(oBinding.setCollapseRecursive, "Collapse Recursive is not supported by the used binding");
			if (oBinding.setCollapseRecursive) {
				oBinding.setCollapseRecursive(bCollapseRecursive);
			}
		}
		this.setProperty("collapseRecursive", !!bCollapseRecursive, true);
		return this;
	};

	/**
	 * Returns the number of selected entries.
	 * Depending on the binding it is either retrieved from the binding or the selection model.
	 * @private
	 */
	TreeTable.prototype._getSelectedIndicesCount = function () {
		var iSelectedIndicesCount;

		//when using the treebindingadapter, check if the node is selected
		var oBinding = this.getBinding("rows");

		if (oBinding && oBinding.getSelectedNodesCount) {
			return oBinding.getSelectedNodesCount();
		} else {
			// selection model case
			return Table.prototype.getSelectedIndices.call(this);
		}

		return iSelectedIndicesCount;
	};

	TreeTable.prototype.setUseGroupMode = function (bGroup) {
		this.setProperty("useGroupMode", !!bGroup);
		if (!!bGroup) {
			TableUtils.Grouping.setGroupMode(this);
		} else {
			TableUtils.Grouping.setTreeMode(this);
		}
		return this;
	};

	/**
	 * The property <code>enableGrouping</code> is not supported by the <code>TreeTable</code> control.
	 *
	 * @deprecated
	 * @public
	 * @name sap.ui.table.AnalyticalTable#getEnableGrouping
	 * @function
	 */

	/**
	 * The property <code>enableGrouping</code> is not supported by the <code>TreeTable</code> control.
	 *
	 * @deprecated
	 * @public
	 */
	TreeTable.prototype.setEnableGrouping = function(bEnableGrouping) {
		jQuery.sap.log.warning("The property enableGrouping is not supported by control sap.ui.table.TreeTable");
		return this;
	};

	return TreeTable;

});
