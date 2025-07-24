/*
 * ${copyright}
 */
sap.ui.define([
	"./ODataV4Selection",
	"./PluginBase",
	"../utils/TableUtils",
	"../library",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool"
], function(
	ODataV4Selection,
	PluginBase,
	TableUtils,
	library,
	Icon,
	IconPool
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * @class
	 * Integrates the selection of the {@link sap.ui.model.odata.v4.ODataListBinding} and the table. Works only in combination with a
	 * {@link sap.ui.model.odata.v4.ODataModel}.
	 *
	 * The selection of a context that is not selectable is not allowed.
	 * The following contexts are not selectable:
	 * <ul>
	 *   <li>Header context</li>
	 *   <li>Contexts that represent group headers</li>
	 *   <li>Contexts that contain totals</li>
	 * </ul>
	 *
	 * All binding-related limitations also apply in the context of this plugin. For details, see {@link sap.ui.model.odata.v4.Context#setSelected}
	 * and {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.139
	 * @alias sap.ui.table.plugins.ODataV4MultiSelection
	 * @see {@link topic:ec55312f796f45e8883810af3b68b46c OData V4: Selection}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4MultiSelection = ODataV4Selection.extend("sap.ui.table.plugins.ODataV4MultiSelection", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Number of rows which can be selected by the user with one range selection.
				 * If the user tries to select more rows than is allowed by the limit, the selection is limited and a notification may be shown
				 * (see {@link #getEnableNotification enableNotification}).
				 *
				 * Accepts positive integer values.
				 *
				 * If set to 0, the limit is disabled, and the Select All checkbox appears instead of the Deselect All button. The count needs to
				 * be available if the limit is disabled. Please refer to {@link sap.ui.model.odata.v4.ODataModel} for information on requesting
				 * the count.
				 *
				 * <b>Note:</b> To avoid severe performance problems, the limit should only be set to 0 in the following cases:
				 * <ul>
				 *   <li>If the model is used in client mode</li>
				 *   <li>If the entity set is small</li>
				 * </ul>
				 *
				 * In other cases, we recommend to set the limit to at least double the value of the {@link sap.ui.table.Table#getThreshold threshold}
				 * property of the related <code>sap.ui.table.Table</code> control.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.Table
				 */
				limit: {type: "int", group: "Behavior", defaultValue: 200},

				/**
				 * Enables notifications that are displayed once a selection has been limited.
				 */
				enableNotification: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Hide the header selector.
				 */
				hideHeaderSelector: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			aggregations: {
				icon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			}
		}
	});

	ODataV4MultiSelection.findOn = PluginBase.findOn;

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.init = function() {
		ODataV4Selection.prototype.init.apply(this, arguments);

		const oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");
		this.setAggregation("icon", oIcon, true);

		_private(this).bLimitReached = false;
		_private(this).oRangeSelectionStartContext = null;
	};

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.onActivate = function(oTable) {
		ODataV4Selection.prototype.onActivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.MultiToggle);
		attachToBinding(this, oTable.getBinding());
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateRows, clearSelectionCache, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UnbindRows, clearSelectionCache, this);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.onDeactivate = function(oTable) {
		ODataV4Selection.prototype.onDeactivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.None);
		_private(this).bLimitReached = false;
		_private(this).oRangeSelectionStartContext = null;
		detachFromBinding(this, oTable.getBinding());
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.UpdateRows, clearSelectionCache, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UnbindRows, clearSelectionCache, this);
		clearSelectionCache.call(this);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		const oContext = TableUtils.getBindingContextOfRow(oRow);

		if (!this.isActive() || !oContext || !this.isContextSelectable(oContext)) {
			return;
		}

		if (mConfig?.range) {
			extendLastSelectionTo(this, oRow);
			return;
		}

		if (this.isSelected(oRow) === bSelected) {
			return;
		}

		oContext.setSelected(bSelected);
		_private(this).oRangeSelectionStartContext = bSelected ? oContext : null;
	};

	function extendLastSelectionTo(oPlugin, oRow) {
		if (!_private(oPlugin).oRangeSelectionStartContext) {
			return;
		}

		let iIndexFrom = _private(oPlugin).oRangeSelectionStartContext.getIndex();
		const oContext = TableUtils.getBindingContextOfRow(oRow);
		const iIndexTo = oContext ? oContext.getIndex() : -1;

		// The start index is already selected in case of range selection, so the range needs to start from the next index.
		if (iIndexFrom !== iIndexTo) {
			iIndexFrom += iIndexTo > iIndexFrom ? 1 : -1;
		}

		select(oPlugin, iIndexFrom, iIndexTo);
	}

	/**
	 * Returns the number of selectable rows.
	 *
	 * @param {sap.ui.table.plugins.ODataMultiV4Selection} oPlugin The plugin to getthe number of selectable rows from.
	 * @returns {int} The number of selectable rows, or -1 if the number cannot be determined.
	 */
	function getSelectableCount(oPlugin) {
		const oBinding = oPlugin.getControl().getBinding();
		let iSelectableCount = -1;

		if (!oBinding || oBinding.getLength() === 0) {
			return 0;
		}

		if (_private(oPlugin).iSelectableCount != null) {
			return _private(oPlugin).iSelectableCount;
		}

		if (oBinding.getAggregation()) {
			/* In case of data aggregation with visual grouping and sum rows, we cannot determine the number of selectable contexts.
			 * The expected behavior is that if all visible selectable rows are selected, the state changes to "everything is selected". For example,
			 * the Select All checkbox should then be checked.
			 * visible rows = All rows that can be scrolled to. Does not include children of collapsed rows.
			 * selectable rows = All visible rows that are not group headers or sums.
			 * There are no values available to determine the number of selectable rows. Length, count, and selection count are all based on different
			 * criteria.
			 * The length would work for hierarchies, but there is nothing to compare it to. For example, selected contexts may be present in
			 * collapsed rows, increasing the selection count.
			 * We would have to load all contexts and check if all selectable contexts are selected. This would significantly impact performance.
			 *
			 * If the selection limit is disabled, the Select All checkbox is shown. In this case, not reaching the "everything is selected" state is
			 * not an option. Therefore, we have to accept the loss of performance.
			 *
			 * As a consequence:
			 * - The "everything is selected" state is never reached.
			 * - If the visible rows in the table are all group headers or sums, the header selector is enabled, but pressing it has no effect.
			 * - If the selection limit is disabled, the "everything is selected" state is reached when it shouldn't be if there are invisible
			 *   selected contexts, for example, in collapsed rows.
			 */
			if (oPlugin._isLimitDisabled()) {
				const aAllCurrentContexts = oBinding.getAllCurrentContexts();
				if (oBinding.getLength() === aAllCurrentContexts.length) {
					iSelectableCount = aAllCurrentContexts.filter((oContext) => oPlugin.isContextSelectable(oContext)).length;
				}
			}
		} else if (oBinding.isLengthFinal()) {
			iSelectableCount = oBinding.getLength();
		} // The count is not requested and not all data is loaded.

		_private(oPlugin).iSelectableCount = iSelectableCount;
		return iSelectableCount;
	}

	/**
	 * Changes the current icon and tooltip text of the header selection icon in the given plugin object based on the selection.
	 *
	 * @param {sap.ui.table.plugins.ODataV4MultiSelection} oPlugin The plugin to change the header selection icon on.
	 */
	function updateHeaderSelectorIcon(oPlugin) {
		if (oPlugin._isLimitDisabled()) {
			return;
		}

		let sIconURI = IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon);

		if (oPlugin.getSelectedCount() > 0) {
			if (areAllRowsSelected(oPlugin)) {
				sIconURI = IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon);
			} else {
				sIconURI = IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon);
			}
		}

		oPlugin.getAggregation("icon").setSrc(sIconURI);
	}

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.getRenderConfig = function() {
		if (!this.isActive()) {
			return ODataV4Selection.prototype.getRenderConfig.apply(this, arguments);
		}

		updateHeaderSelectorIcon(this);

		const mRenderConfig = {
			headerSelector: {
				type: this._isLimitDisabled() ? "toggle" : "custom",
				icon: this.getAggregation("icon"),
				visible: !this.getHideHeaderSelector(),
				enabled: getSelectableCount(this) !== 0,
				selected: areAllRowsSelected(this),
				tooltip: this.getSelectedCount() === 0
					? TableUtils.getResourceText("TBL_SELECT_ALL")
					: TableUtils.getResourceText("TBL_DESELECT_ALL")
			}
		};

		return mRenderConfig;
	};

	/**
	 * Selects all rows if not all are already selected, otherwise the selection is cleared.
	 *
	 * @param {sap.ui.table.plugins.ODataV4MultiSelection} oPlugin The selection plugin.
	 * @returns {boolean} The state of selection. true - all selected, false - all cleared, undefined - no action
	 */
	function toggleSelectAll(oPlugin) {
		if (areAllRowsSelected(oPlugin)) {
			oPlugin.clearSelection();
			return false;
		} else if (oPlugin._isLimitDisabled()) {
			const oBinding = oPlugin.getControl().getBinding();
			if (oBinding?.getLength()) {
				select(oPlugin, 0, oBinding.getLength() - 1);
				return true;
			}
		}
		return undefined;
	}

	/**
	 * Checks if all rows are selected.
	 *
	 * @param {sap.ui.table.plugins.ODataV4MultiSelection} oPlugin The selection plugin.
	 * @returns {boolean} Whether all rows are selected.
	 */
	function areAllRowsSelected(oPlugin) {
		const iSelectableCount = getSelectableCount(oPlugin);
		/* Fails to return the correct information if there are selected invisible contexts. For example, if a context is selected and after
		 * filtering the table contains 1 row with a different, unselected context -> 1 === 1.
		 * We would have to load all contexts and check if all selectable contexts are selected. This would significantly impact performance.
		 */
		return iSelectableCount > 0 && iSelectableCount === oPlugin.getSelectedCount();
	}

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.onHeaderSelectorPress = function() {
		ODataV4Selection.prototype.onHeaderSelectorPress.apply(this, arguments);

		if (!this.isActive()) {
			return;
		}

		const mRenderConfig = this.getRenderConfig();

		if (!mRenderConfig.headerSelector.visible || !mRenderConfig.headerSelector.enabled) {
			return;
		}

		if (mRenderConfig.headerSelector.type === "toggle") {
			toggleSelectAll(this);
		} else if (mRenderConfig.headerSelector.type === "custom") {
			if (this.getSelectedCount() > 0) {
				this.clearSelection();
			} else {
				const oBinding = this.getControl().getBinding();
				if (oBinding?.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		}
	};

	/**
	 * @inheritDoc
	 */
	ODataV4MultiSelection.prototype.onKeyboardShortcut = function(sType, oEvent) {
		ODataV4Selection.prototype.onKeyboardShortcut.apply(this, arguments);

		if (!this.isActive()) {
			return;
		}

		if (sType === "toggle") { // ctrl + a
			if (this._isLimitDisabled()) {
				if (toggleSelectAll(this) === false) {
					oEvent.setMarked("sapUiTableClearAll");
				}
			} else {
				const oBinding = this.getControl().getBinding();
				if (oBinding?.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		}
	};

	ODataV4MultiSelection.prototype.setLimit = function(iLimit) {
		this.setProperty("limit", iLimit);
		_private(this).bLimitReached = false;
		return this;
	};

	function onTableRowsBound(oBinding) {
		attachToBinding(this, oBinding);
	}

	function attachToBinding(oPlugin, oBinding) {
		oBinding?.attachEvent("selectionChanged", clearSelectionCache, oPlugin);
	}

	function detachFromBinding(oPlugin, oBinding) {
		oBinding?.detachEvent("selectionChanged", clearSelectionCache, oPlugin);
	}

	function clearSelectionCache() {
		delete _private(this).aSelectedContexts; // Delete the cached selected contexts to force a recalculation.
		delete _private(this).iSelectableCount; // Delete the cached selectable count to force a recalculation.
	}

	/**
	 * Checks whether the limit is disabled.
	 *
	 * @returns {boolean} Whether the limit is disabled.
	 * @private
	 */
	ODataV4MultiSelection.prototype._isLimitDisabled = function() {
		return this.getLimit() === 0;
	};

	/**
	 * Calculates the correct start and end index for the range selection, loads the corresponding contexts and sets the selected state.
	 *
	 * @param {sap.ui.table.plugins.ODataV4MultiSelection} oPlugin The selection plugin.
	 * @param {int} iIndexFrom The start index of the range selection.
	 * @param {int} iIndexTo The end index of the range selection.
	 */
	function select(oPlugin, iIndexFrom, iIndexTo) {
		const oTable = oPlugin.getControl();
		const iLimit = oPlugin.getLimit();
		const bUpwardSelection = iIndexTo < iIndexFrom; // Indicates whether the selection is made from bottom to top.
		let iGetContextsStartIndex = bUpwardSelection ? iIndexTo : iIndexFrom;
		let iGetContextsLength = Math.abs(iIndexTo - iIndexFrom) + 1;

		if (!oPlugin._isLimitDisabled()) {
			_private(oPlugin).bLimitReached = iGetContextsLength > iLimit;

			if (_private(oPlugin).bLimitReached) {
				if (bUpwardSelection) {
					iIndexTo = iIndexFrom - iLimit + 1;
					iGetContextsStartIndex = iIndexTo;
				} else {
					iIndexTo = iIndexFrom + iLimit - 1;
				}

				// The table will be scrolled one row further to make it transparent for the user where the selection ends.
				// load the extra row here to avoid additional batch request.
				iGetContextsLength = iLimit + 1;
			}
		}

		TableUtils.loadContexts(oTable.getBinding(), iGetContextsStartIndex, iGetContextsLength).then(function(aContexts) {
			aContexts.forEach(function(oContext) {
				if (!oPlugin.isContextSelectable(oContext) || oContext.isSelected()) {
					return;
				}
				if (bUpwardSelection && oContext.getIndex() >= iIndexTo || oContext.getIndex() <= iIndexTo) {
					oContext.setSelected(true);
				}
				if (oContext.getIndex() === iIndexTo) {
					_private(oPlugin).oRangeSelectionStartContext = oContext;
				}
			});

			if (_private(oPlugin).bLimitReached) {
				TableUtils.scrollTableToIndex(oTable, iIndexTo, bUpwardSelection).then(function() {
					if (oPlugin.getEnableNotification()) {
						TableUtils.showNotificationPopoverAtIndex(oTable, iIndexTo, oPlugin.getLimit());
					}
				});
			}
		});
	}

	/**
	 * Returns the selected contexts.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]} The selected contexts
	 * @public
	 */
	ODataV4MultiSelection.prototype.getSelectedContexts = function() {
		if (!this.isActive()) {
			return [];
		}

		_private(this).aSelectedContexts ??= this.getControl().getBinding()?.getAllCurrentContexts().filter((oContext) => oContext.isSelected()) ?? [];

		return _private(this).aSelectedContexts;
	};

	ODataV4MultiSelection.prototype.onThemeChanged = function() {
		updateHeaderSelectorIcon(this);
	};

	/**
	 * Clears the selection.
	 *
	 * @public
	 * @name sap.ui.table.plugins.ODataV4MultiSelection#clearSelection
	 * @function
	 */
	// Inherited from ODataV4Selection

	return ODataV4MultiSelection;
});