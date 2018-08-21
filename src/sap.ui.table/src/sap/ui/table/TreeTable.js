/*!
 * ${copyright}
 */

// Provides control sap.ui.table.TreeTable.
sap.ui.define([
	'./Table',
	'sap/ui/model/ClientTreeBindingAdapter',
	'sap/ui/model/TreeBindingCompatibilityAdapter',
	'./library',
	'sap/ui/core/Element',
	'./TableUtils',
	"sap/base/Log",
	"sap/base/assert"
],
	function(
		Table,
		ClientTreeBindingAdapter,
		TreeBindingCompatibilityAdapter,
		library,
		Element,
		TableUtils,
		Log,
		assert
	) {
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
	 * @see {@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I Choose?}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TreeTable = Table.extend("sap.ui.table.TreeTable", /** @lends sap.ui.table.TreeTable.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Specifies whether the first level is expanded.
			 *
			 * The value of the property is only taken into account if no parameter <code>numberOfExpandedLevels</code> is given in the binding information.
			 * Changes to this property after the table is bound do not have any effect unless an explicit (re-)bind of the <code>rows</code> aggregation is done.
			 *
			 * @example
			 * oTable.bindRows({
			 *    path: "...",
			 *    parameters: {
			 *       numberOfExpandedLevels: 1
			 *    }
			 * });
			 * @deprecated As of version 1.46.3, replaced by the corresponding binding parameter <code>numberOfExpandedLevels</code>.
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
			 * Fired when a row has been expanded or collapsed by user interaction. Only available in hierarchical mode.
			 */
			toggleOpenState : {
				parameters : {

					/**
					 * Index of the expanded/collapsed row
					 */
					rowIndex : {type : "int"},

					/**
					 * Binding context of the expanded/collapsed row
					 */
					rowContext : {type : "object"},

					/**
					 * Flag that indicates whether the row has been expanded or collapsed
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
		oBindingInfo = Table._getSanitizedBindingInfo(arguments);

		if (oBindingInfo) {
			if (!oBindingInfo.parameters) {
				oBindingInfo.parameters = {};
			}

			oBindingInfo.parameters.rootLevel = this.getRootLevel();
			oBindingInfo.parameters.collapseRecursive = this.getCollapseRecursive();

			// If the number of expanded levels is not specified in the binding parameters, we use the corresponding table property
			// to determine the value.
			oBindingInfo.parameters.numberOfExpandedLevels = oBindingInfo.parameters.numberOfExpandedLevels || (this.getExpandFirstLevel() ? 1 : 0);
		}

		return Table.prototype.bindRows.call(this, oBindingInfo);
	};

	/**
	 * This function will be called by either by {@link sap.ui.base.ManagedObject#bindAggregation} or {@link sap.ui.base.ManagedObject#setModel}.
	 *
	 * @override {@link sap.ui.table.Table#_bindAggregation}
	 */
	TreeTable.prototype._bindAggregation = function(sName, oBindingInfo) {
		// Create the binding.
		Table.prototype._bindAggregation.call(this, sName, oBindingInfo);

		var oBinding = this.getBinding("rows");

		if (sName === "rows" && oBinding) {
			// Table._addBindingListener can not be used here, as the selectionChanged event will be added by an adapter applied in #getBinding.
			oBinding.attachEvents({
				selectionChanged: this._onSelectionChanged.bind(this)
			});
		}
	};

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
	 * @returns {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
	 * @public
	 */
	TreeTable.prototype.setFixedRowCount = function(iRowCount) {
		// this property makes no sense for the TreeTable
		Log.warning("TreeTable: the property \"fixedRowCount\" is not supported and will be ignored!");
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
			if (oBinding.isA("sap.ui.model.odata.ODataTreeBinding")) {
				// use legacy tree binding adapter
				TreeBindingCompatibilityAdapter(oBinding, this);
			} else if (oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding")) {
				oBinding.applyAdapterInterface();
			} else if (oBinding.isA("sap.ui.model.ClientTreeBinding")) {
				ClientTreeBindingAdapter.apply(oBinding);
			} else {
				Log.error("Binding not supported by sap.ui.table.TreeTable");
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
	 * Expands one or more rows.
	 *
	 * @param {int|int[]} vRowIndex A single index or an array of indices of the rows to be expanded
	 * @returns {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.expand = function(vRowIndex) {
		TableUtils.Grouping.toggleGroupHeader(this, vRowIndex, true);
		return this;
	};

	/**
	 * Collapses one or more rows.
	 *
	 * @param {int|int[]} vRowIndex A single index or an array of indices of the rows to be collapsed
	 * @returns {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.collapse = function(vRowIndex) {
		TableUtils.Grouping.toggleGroupHeader(this, vRowIndex, false);
		return this;
	};

	/**
	 * Collapses all nodes (and lower if collapseRecursive is activated)
	 *
	 * @returns {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
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
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.expandToLevel = function (iLevel) {
		var oBinding = this.getBinding("rows");

		assert(oBinding && oBinding.expandToLevel, "TreeTable.expandToLevel is not supported with your current Binding. Please check if you are running on an ODataModel V2.");

		if (oBinding && oBinding.expandToLevel) {
			oBinding.expandToLevel(iLevel);
		}

		return this;
	};

	/**
	 * Checks whether the row is expanded or collapsed.
	 *
	 * @param {int} iRowIndex The index of the row to be checked
	 * @returns {boolean} <code>true</code> if the row is expanded, <code>false</code> if it is collapsed
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
	 * @returns {boolean} true if the index is selected, false otherwise
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
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
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
	 * @returns {int[]} an array containing all selected indices
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
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
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
	 * Please be aware, that the absolute row index only applies to the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 *
	 * Please also take notice of the fact, that "addSelectionInterval" does not change any other selection.
	 * To override the current selection, please use "setSelctionInterval" or for a single entry use "setSelectedIndex".
	 *
	 * @param {int} iFromIndex The starting index of the range which will be selected.
	 * @param {int} iToIndex The starting index of the range which will be selected.
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
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
	 * Please be aware, that the absolute row index only applies to the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 *
	 * @param {int} iFromIndex The starting index of the range which will be deselected.
	 * @param {int} iToIndex The starting index of the range which will be deselected.
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
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
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TreeTable.prototype.selectAll = function () {
		if (!TableUtils.hasSelectAll(this)) {
			return this;
		}

		//The OData TBA exposes a selectAll function
		var oBinding = this.getBinding("rows");
		if (oBinding && oBinding.selectAll) {
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
	 * @returns {int} index of lead selected row
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
	 * @returns {sap.ui.table.TreeTable} a reference on the TreeTable control, can be used for chaining
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

	/*
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
			assert(oBinding.setRootLevel, "rootLevel is not supported by the used binding");
			if (oBinding.setRootLevel) {
				oBinding.setRootLevel(iRootLevel);
			}
		}
		this.setProperty("rootLevel", iRootLevel, true);

		return this;
	};

	/*
	 * Sets the node hierarchy to collapse recursive. When set to true, all child nodes will get collapsed as well.
	 * This setting has only effect when the binding is already initialized.
	 * @param {boolean} bCollapseRecursive
	 */
	TreeTable.prototype.setCollapseRecursive = function(bCollapseRecursive) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			assert(oBinding.setCollapseRecursive, "Collapse Recursive is not supported by the used binding");
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
	 * @deprecated Since version 1.28.
	 * @public
	 * @name sap.ui.table.TreeTable#getEnableGrouping
	 * @function
	 */

	/**
	 * The property <code>enableGrouping</code> is not supported by the <code>TreeTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * To get a group-like visualization the <code>useGroupMode</code> property can be used.
	 * @returns {sap.ui.table.TreeTable} Reference to this in order to allow method chaining
	 * @see sap.ui.table.TreeTable#setUseGroupMode
	 * @public
	 */
	TreeTable.prototype.setEnableGrouping = function() {
		Log.warning("The property enableGrouping is not supported by the sap.ui.table.TreeTable control");
		return this;
	};

	/**
	 * The <code>groupBy</code> association is not supported by the <code>TreeTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @public
	 * @name sap.ui.table.TreeTable#getGroupBy
	 * @function
	 */

	/**
	 * The <code>groupBy</code> association is not supported by the <code>TreeTable</code> control.
	 *
	 * @deprecated Since version 1.28.
	 * @returns {sap.ui.table.TreeTable} Reference to this in order to allow method chaining
	 * @public
	 */
	TreeTable.prototype.setGroupBy = function() {
		Log.warning("The groupBy association is not supported by the sap.ui.table.TreeTable control");
		return this;
	};

	/**
	 * Allows to hide the tree structure (tree icons, indentation) in tree mode (property <code>useGroupMode</code> is set to <code>false</code>).
	 *
	 * This option might be useful in some scenarios when actually a tree table must be used but under certain conditions the data
	 * is not hierarchical, because it contains leafs only.
	 *
	 * <b>Note:</b> In flat mode the user of the table cannot expand or collapse certain nodes and the hierarchy is not
	 * visible to the user. The caller of this function has to ensure to use this option only with non-hierarchical data.
	 *
	 * @param {boolean} bFlat If set to <code>true</code>, the flat mode is enabled
	 *
	 * @returns {sap.ui.table.TreeTable} Reference to this in order to allow method chaining
	 * @protected
	 */
	TreeTable.prototype.setUseFlatMode = function(bFlat) {
		bFlat = !!bFlat;
		if (bFlat != this._bFlatMode) {
			this._bFlatMode = bFlat;
			if (this.getDomRef() && TableUtils.Grouping.isTreeMode(this)) {
				this.invalidate();
			}
		}
		return this;
	};

	return TreeTable;

});