/*!
 * ${copyright}
 */

// Provides control sap.ui.table.TreeTable.
sap.ui.define([
	'./Table',
	"./TableRenderer",
	'sap/ui/model/ClientTreeBindingAdapter',
	'./library',
	'./utils/TableUtils',
	"./plugins/BindingSelection",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/model/controlhelper/TreeBindingProxy"
],
	function(
		Table,
		TableRenderer,
		ClientTreeBindingAdapter,
		library,
		TableUtils,
		BindingSelectionPlugin,
		Log,
		assert,
		TreeBindingProxy
	) {
		"use strict";

		const _private = TableUtils.createWeakMapFacade();

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
		 * @see {@link topic:08197fa68e4f479cbe30f639cc1cd22c sap.ui.table}
		 * @see {@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I Choose?}
		 * @see {@link fiori:/tree-table/ Tree Table}
		 */
		const TreeTable = Table.extend("sap.ui.table.TreeTable", /** @lends sap.ui.table.TreeTable.prototype */ {metadata: {

			library: "sap.ui.table",
			properties: {
				/**
				 * If group mode is enabled nodes with subitems are rendered as if they were group headers.
				 * This can be used to do the grouping for an OData service on the backend and visualize this in a table.
				 */
				useGroupMode: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * The property name of the rows data which will be displayed as a group header if the group mode is enabled
				 */
				groupHeaderProperty: {type: "string", group: "Data", defaultValue: null}
			},
			events: {

				/**
				 * Fired when a row has been expanded or collapsed by user interaction. Only available in hierarchical mode.
				 */
				toggleOpenState: {
					parameters: {

						/**
						 * Index of the expanded/collapsed row
						 */
						rowIndex: {type: "int"},

						/**
						 * Binding context of the expanded/collapsed row
						 */
						rowContext: {type: "object"},

						/**
						 * Flag that indicates whether the row has been expanded or collapsed
						 */
						expanded: {type: "boolean"}
					}
				}
			}
		}, renderer: TableRenderer});

		/**
		 * Initialization of the TreeTable control
		 * @private
		 */
		TreeTable.prototype.init = function() {
			Table.prototype.init.apply(this, arguments);

			_private(this).bPendingRequest = false;

			TableUtils.Grouping.setToDefaultTreeMode(this);
			TableUtils.Hook.register(this, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
			TableUtils.Hook.register(this, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
			TableUtils.Hook.register(this, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);

			this._oProxy = new TreeBindingProxy(this, "rows");
		};

		TreeTable.prototype._bindRows = function(oBindingInfo) {
			_private(this).bPendingRequest = false;

			const iExpandedLevels = 0;
			this._oProxy.applyLegacySettingsToBindingInfo(oBindingInfo, {
				rootLevel: this.isPropertyInitial("rootLevel") ? undefined : 0,
				collapseResursive: this.isPropertyInitial("collapseRecursive") ? undefined : true,
				numberOfExpandedLevels: this.isPropertyInitial("expandFirstLevel") ? undefined : iExpandedLevels
			});

			return Table.prototype._bindRows.call(this, oBindingInfo);
		};

		function updateRowState(oState) {
			const mProxyInfo = oState.context["_mProxyInfo"];

			oState.level = mProxyInfo.level;
			oState.expandable = !mProxyInfo.isLeaf;
			oState.expanded = mProxyInfo.isExpanded;

			if (TableUtils.Grouping.isInGroupMode(this)) {
				const sHeaderProp = this.getGroupHeaderProperty();

				if (sHeaderProp) {
					oState.title = oState.context.getProperty(sHeaderProp);
				}

				if (oState.expandable) {
					oState.type = oState.Type.GroupHeader;
					oState.contentHidden = true;
				}
			}
		}

		function expandRow(oRow) {
			const iIndex = oRow.getIndex();

			this._oProxy.expand(iIndex);
			const bIsExpanded = this._oProxy.isExpanded(iIndex);

			if (typeof bIsExpanded === "boolean") {
				this._onGroupHeaderChanged(iIndex, bIsExpanded);
			}
		}

		function collapseRow(oRow) {
			const iIndex = oRow.getIndex();

			this._oProxy.collapse(iIndex);
			const bIsExpanded = this._oProxy.isExpanded(iIndex);

			if (typeof bIsExpanded === "boolean") {
				this._onGroupHeaderChanged(iIndex, bIsExpanded);
			}
		}

		/**
		 * Setter for property <code>fixedRowCount</code>.
		 *
		 * <b>This property is not supportd for the TreeTable and will be ignored!</b>
		 *
		 * Default value is <code>0</code>
		 *
		 * @param {int} iRowCount New value for property <code>fixedRowCount</code>
		 * @returns {this} <code>this</code> to allow method chaining
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
				return this._oProxy.isTreeBinding();
			}
			return Table.prototype.isTreeBinding.apply(this, arguments);
		};

		TreeTable.prototype.getBinding = function(sName) {
			sName = sName == null ? "rows" : sName;
			const oBinding = Table.prototype.getBinding.call(this, sName);

			if (oBinding && sName === "rows" && !oBinding.getLength) {
				if (oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding")) {
					oBinding.applyAdapterInterface();
				} else if (oBinding.isA("sap.ui.model.ClientTreeBinding")) {
					ClientTreeBindingAdapter.apply(oBinding);
				} else {
					Log.error("Binding not supported by sap.ui.table.TreeTable");
				}
			}

			return oBinding;
		};

		TreeTable.prototype._getContexts = function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
			return this._oProxy.getContexts(iStartIndex, iLength, iThreshold, bKeepCurrent);
		};

		TreeTable.prototype._getRowContexts = function(iRequestLength) {
			return getRowContexts(this, iRequestLength);
		};

		function getRowContexts(oTable, iRequestLength, bSecondCall) {
			const iOldTotalRowCount = oTable._getTotalRowCount();
			let aRowContexts = Table.prototype._getRowContexts.call(oTable, iRequestLength);

			if (bSecondCall === true) {
				return aRowContexts;
			}

			const iNewTotalRowCount = oTable._getTotalRowCount();
			const iFirstVisibleRow = oTable._getFirstRenderedRowIndex();
			const iMaxRowIndex = oTable._getMaxFirstRenderedRowIndex();

			oTable._adjustToTotalRowCount();

			if (iMaxRowIndex < iFirstVisibleRow && oTable._bContextsAvailable) {
				// Get the contexts again, this time with the maximum possible value for the first visible row.
				aRowContexts = getRowContexts(oTable, iRequestLength, true);
			} else if (iOldTotalRowCount !== iNewTotalRowCount) {
				aRowContexts = getRowContexts(oTable, iRequestLength, true);
			}

			return aRowContexts;
		}

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
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		TreeTable.prototype.expand = function(vRowIndex) {
			this._oProxy.expand(vRowIndex);
			return this;
		};

		/**
		 * Collapses one or more rows.
		 *
		 * @param {int|int[]} vRowIndex A single index or an array of indices of the rows to be collapsed
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		TreeTable.prototype.collapse = function(vRowIndex) {
			this._oProxy.collapse(vRowIndex);
			return this;
		};

		/**
		 * Collapses all nodes (and lower if collapseRecursive is activated)
		 *
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		TreeTable.prototype.collapseAll = function() {
			this._oProxy.collapseAll();
			if (this.getBinding()) {
				this.setFirstVisibleRow(0);
			}

			return this;
		};

		/**
		 * Expands all nodes starting from the root level to the given level 'iLevel'.
		 *
		 * Only supported with ODataModel v2, when running in OperationMode.Client.
		 * Fully supported for <code>sap.ui.model.ClientTreeBinding</code>, e.g. if you are using a <code>sap.ui.model.json.JSONModel</code>.
		 *
		 * Please also see <code>sap.ui.model.odata.OperationMode</code>.
		 *
		 * @param {int} iLevel the level to which the trees shall be expanded
		 * @returns {this} a reference on the TreeTable control, can be used for chaining
		 * @public
		 */
		TreeTable.prototype.expandToLevel = function(iLevel) {
			this._oProxy.expandToLevel(iLevel);
			return this;
		};

		/**
		 * Checks whether the row is expanded or collapsed.
		 *
		 * @param {int} iRowIndex The index of the row to be checked
		 * @returns {boolean} <code>true</code> if the row is expanded, <code>false</code> if it is collapsed
		 * @public
		 */
		TreeTable.prototype.isExpanded = function(iRowIndex) {
			return this._oProxy.isExpanded(iRowIndex);
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
		 * @function
		 * @name sap.ui.table.TreeTable#getSelectedIndices
		 */

		/**
		 * Sets the selection of the TreeTable to the given range (including boundaries).
		 * Beware: The previous selection will be lost/overridden. If this is not wanted, please use "addSelectionInterval"
		 * and "removeSelectionInterval".
		 * Please be aware, that the absolute row index only applies to the tree which is visualized by the TreeTable.
		 *
		 * @param {int} iFromIndex the start index of the selection range
		 * @param {int} iToIndex the end index of the selection range
		 * @returns {this} a reference on the TreeTable control, can be used for chaining
		 * @public
		 * @function
		 * @name sap.ui.table.TreeTable#setSelectionInterval
		 */

		/**
		 * Sets the selected index
		 * In a TreeTable you can only select indices, which correspond to the currently visualized tree.
		 * Invisible tree nodes (e.g. collapsed child nodes) can not be selected via Index, because they do not
		 * correspond to a TreeTable row.
		 *
		 * @param {int} iRowIndex The row index which will be selected (if existing)
		 * @returns {this} a reference on the TreeTable control, can be used for chaining
		 * @public
		 * @function
		 * @name sap.ui.table.TreeTable#setSelectedIndex
		 */

		/**
		 * Adds the given selection interval to the selection. In case of single selection, only <code>iIndexTo</code> is added to the selection.
		 * Invisible nodes (collapsed child nodes) will not be regarded.
		 *
		 * Please also take notice of the fact, that "addSelectionInterval" does not change any other selection.
		 * To override the current selection, please use "setSelectionInterval" or for a single entry use "setSelectedIndex".
		 *
		 * @param {int} iIndexFrom Index from which the selection should start
		 * @param {int} iIndexTo Index up to which to select
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @function
		 * @name sap.ui.table.TreeTable#addSelectionInterval
		 */

		/**
		 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
		 * Invisible nodes (collapsed child nodes) will not be regarded.
		 *
		 * @param {int} iIndexFrom Index from which the deselection should start
		 * @param {int} iIndexTo Index up to which to deselect
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @function
		 * @name sap.ui.table.TreeTable#removeSelectionInterval
		 */

		/**
		 * Selects all available nodes/rows.
		 *
		 * All rows/tree nodes that are locally stored on the client and that are part of the currently visible tree are selected.
		 * Additional rows or tree nodes that come into view through scrolling or paging are also selected immediately as soon as they get visible.
		 * However, <code>SelectAll</code> does not retrieve any data from the back end in order to improve performance and reduce the network traffic.
		 *
		 * @returns {this} a reference on the TreeTable control, can be used for chaining
		 * @public
		 * @function
		 * @name sap.ui.table.TreeTable#selectAll
		 */

		/**
		 * @inheritDoc
		 */
		TreeTable.prototype.getContextByIndex = function(iRowIndex) {
			return this._oProxy.getContextByIndex(iRowIndex);
		};

		TreeTable.prototype.setUseGroupMode = function(bGroup) {
			this.setProperty("useGroupMode", !!bGroup);
			updateHierarchyMode(this);
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @protected
		 */
		TreeTable.prototype.setUseFlatMode = function(bFlat) {
			this._bFlatMode = !!bFlat;
			updateHierarchyMode(this);
			return this;
		};

		function updateHierarchyMode(oTable) {
			if (oTable.getUseGroupMode()) {
				TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.GroupedTree);
			} else if (oTable._bFlatMode) {
				TableUtils.Grouping.setToDefaultFlatMode(oTable);
			} else if (!oTable._bFlatMode) {
				TableUtils.Grouping.setToDefaultTreeMode(oTable);
			}
		}

		TreeTable.prototype._createLegacySelectionPlugin = function() {
			return new BindingSelectionPlugin();
		};

		// If the ODataTreeBindingFlat adapter is applied to the TreeBinding, the adapter fires a dataRequested event on every call of getNodes,
		// even if no request is sent. This can happen if the adapter ignores the request, because it finds out there is a pending request which
		// covers it. When a request is ignored, no dataReceived event is fired.
		// Therefore, a more limited method using a flag has to be used instead of a counter.

		TreeTable.prototype._onBindingDataRequested = function(oEvent) {
			_private(this).bPendingRequest = true;
			Table.prototype._onBindingDataRequested.apply(this, arguments);
		};

		TreeTable.prototype._onBindingDataReceived = function(oEvent) {
			_private(this).bPendingRequest = false;
			Table.prototype._onBindingDataReceived.apply(this, arguments);
		};

		TreeTable.prototype._hasPendingRequests = function() {
			return _private(this).bPendingRequest;
		};

		return TreeTable;
	});