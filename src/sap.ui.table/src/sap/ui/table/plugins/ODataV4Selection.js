/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./PluginBase",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool"
], function(
	SelectionPlugin,
	PluginBase,
	library,
	TableUtils,
	Icon,
	IconPool
) {
	"use strict";

	const SelectionMode = library.plugins.SelectionMode;
	const TableSelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.plugins.ODataV4Selection.
	 * TODO: works only with an odata v4 model etc.
	 *
	 * @class
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 * @alias sap.ui.table.plugins.ODataV4Selection
	 * @constructor
	 * @since TODO
	 * @author SAP SE
	 * @private
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4Selection = SelectionPlugin.extend("sap.ui.table.plugins.ODataV4Selection", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * This property controls whether a single or multiple rows can be selected. It also influences the visual appearance.
				 */
				selectionMode: {type: "sap.ui.table.plugins.SelectionMode", group: "Behavior", defaultValue: SelectionMode.MultiToggle},

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
			},
			events: {
				selectionChange: {}
			}
		}
	});

	ODataV4Selection.findOn = PluginBase.findOn;

	ODataV4Selection.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);
		const oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");
		this.setAggregation("icon", oIcon, true);

		this._bLimitReached = false;
		this._oRangeSelectionStartContext = null;
	};

	ODataV4Selection.prototype.onActivate = function(oTable) {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		oTable.setProperty("selectionMode", this.getSelectionMode());
	};

	ODataV4Selection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		oTable.setProperty("selectionMode", TableSelectionMode.None);
		this.clearSelection();
	};

	ODataV4Selection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		const oContext = oRow.getRowBindingContext();

		if (!oContext || !isContextSelectable(oContext)) {
			return;
		}

		if (mConfig && mConfig.range) {
			extendLastSelectionTo(this, oRow);
			return;
		}

		if (this.isSelected(oRow) === bSelected) {
			return;
		}

		if (this.getSelectionMode() === SelectionMode.Single) {
			this._bSuppressSelectionChangeEvent = true;
			this.clearSelection();
		}

		oContext.setSelected(bSelected);
		this._oRangeSelectionStartContext = bSelected && this.getSelectionMode() === SelectionMode.MultiToggle ? oContext : null;
		this.fireSelectionChange();
	};

	function extendLastSelectionTo(oPlugin, oRow) {
		if (!oPlugin._oRangeSelectionStartContext) {
			return;
		}

		let iIndexFrom = oPlugin._oRangeSelectionStartContext.getIndex();
		const oContext = oRow.getRowBindingContext();
		const iIndexTo = oContext ? oContext.getIndex() : -1;

		// The start index is already selected in case of range selection, so the range needs to start from the next index.
		if (iIndexFrom !== iIndexTo) {
			iIndexFrom += iIndexTo > iIndexFrom ? 1 : -1;
		}

		select(oPlugin, iIndexFrom, iIndexTo);
	}

	ODataV4Selection.prototype.isSelected = function(oRow) {
		const oContext = oRow.getRowBindingContext();
		return oContext ? oContext.isSelected() : false;
	};

	ODataV4Selection.prototype.getSelectedCount = function() {
		return this.getSelectedContexts().length;
	};

	/**
	 * Returns the number of selectable rows.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The plugin to getthe number of selectable rows from.
	 * @returns {int} The number of selectable rows.
	 */
	function getSelectableCount(oPlugin) {
		return oPlugin.getTableBinding()?.getLength() ?? 0;
	}

	/**
	 * Changes the current icon and tooltip text of the header selection icon in the given plugin object based on the selection.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The plugin to change the header selection icon on.
	 */
	function updateHeaderSelectorIcon(oPlugin) {
		if (!oPlugin._isLimitDisabled()) {
			const oIcon = oPlugin.getAggregation("icon");
			const iSelectedCount = oPlugin.getSelectedCount();

			if (getSelectableCount(oPlugin) === iSelectedCount) {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon));
			} else if (iSelectedCount !== 0) {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon));
			} else {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon));
			}
		}
	}

	ODataV4Selection.prototype.getRenderConfig = function() {
		if (!this.isActive()) {
			return SelectionPlugin.prototype.getRenderConfig.apply(this, arguments);
		}

		updateHeaderSelectorIcon(this);

		return {
			headerSelector: {
				type: this._isLimitDisabled() ? "toggle" : "custom",
				icon: this.getAggregation("icon"),
				visible: this.getSelectionMode() === SelectionMode.MultiToggle && !this.getHideHeaderSelector(),
				enabled: getSelectableCount(this) > 0,
				selected: areAllRowsSelected(this),
				tooltip: this.getSelectedCount() === 0 ? TableUtils.getResourceText("TBL_SELECT_ALL") : TableUtils.getResourceText("TBL_DESELECT_ALL")
			}
		};
	};

	/**
	 * Selects all rows if not all are already selected, otherwise the selection is cleared.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @returns {boolean} The state of selection. true - all selected, false - all cleared, undefined - no action
	 */
	function toggleSelectAll(oPlugin) {
		if (areAllRowsSelected(oPlugin)) {
			oPlugin.clearSelection();
			return false;
		} else if (oPlugin._isLimitDisabled()) {
			const oBinding = oPlugin.getTableBinding();
			if (oBinding && oBinding.getLength()) {
				select(oPlugin, 0, oBinding.getLength() - 1);
				return true;
			}
		}
		return undefined;
	}

	/**
	 * Checks if all rows are selected.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @returns {boolean} Whether all rows are selected.
	 */
	function areAllRowsSelected(oPlugin) {
		const oBinding = oPlugin.getTableBinding();

		// isLengthFinal is checked in case the count is not requested. Even though it is documented that the count is required if the limit is
		// disabled (SelectAll enabled), it could still happen.
		if (!oBinding || !oBinding.isLengthFinal()) {
			return false;
		}

		const iNumberOfSelectableContexts = oBinding.getAllCurrentContexts().filter(function(oContext) {
			return isContextSelectable(oContext);
		}).length;
		const iNumberOfSelectedContexts = oPlugin.getSelectedContexts().filter(function(oContext) {
			return isContextSelectable(oContext);
		}).length;

		return iNumberOfSelectableContexts > 0 && iNumberOfSelectableContexts === iNumberOfSelectedContexts;
	}

	ODataV4Selection.prototype.onHeaderSelectorPress = function() {
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
				const oBinding = this.getTableBinding();
				if (oBinding && oBinding.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		}
	};

	ODataV4Selection.prototype.onKeyboardShortcut = function(sType, oEvent) {
		if (sType === "toggle") { // ctrl + a
			if (this.getSelectionMode() !== SelectionMode.MultiToggle) {
				return;
			}

			if (this._isLimitDisabled()) {
				if (toggleSelectAll(this) === false) {
					oEvent?.setMarked("sapUiTableClearAll");
				}
			} else {
				const oBinding = this.getTableBinding();
				if (oBinding && oBinding.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		} else if (sType === "clear") { // ctrl + shift + a
			this.clearSelection();
			oEvent?.setMarked("sapUiTableClearAll");
		}
	};

	ODataV4Selection.prototype.setSelectionMode = function(sSelectionMode) {
		const oTable = this.getTable();

		this.setProperty("selectionMode", sSelectionMode, true);
		this._oRangeSelectionStartContext = null;
		this.clearSelection();

		if (oTable) {
			oTable.setProperty("selectionMode", this.getSelectionMode());
		}

		return this;
	};

	ODataV4Selection.prototype.onTableRowsBound = function(oBinding) {
		// TODO: Same as V4Aggregation plugin, check comment there!
		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			this.deactivate();
		}
	};

	/**
	 * Checks whether the limit is disabled.
	 *
	 * @returns {boolean} Whether the limit is disabled.
	 * @private
	 */
	ODataV4Selection.prototype._isLimitDisabled = function() {
		return this.getLimit() === 0;
	};

	/**
	 * Returns <code>true</code> if the selection limit has been reached (only the last selection), <code>false</code> otherwise.
	 *
	 * @return {boolean}
	 */
	ODataV4Selection.prototype.isLimitReached = function() {
		return this._bLimitReached;
	};

	/**
	 * Calculates the correct start and end index for the range selection, loads the corresponding contexts and sets the selected state.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @param {int} iIndexFrom The start index of the range selection.
	 * @param {int} iIndexTo The end index of the range selection.
	 */
	function select(oPlugin, iIndexFrom, iIndexTo) {
		const oTable = oPlugin.getTable();
		const iLimit = oPlugin.getLimit();
		const bUpwardSelection = iIndexTo < iIndexFrom; // Indicates whether the selection is made from bottom to top.
		let iGetContextsStartIndex = bUpwardSelection ? iIndexTo : iIndexFrom;
		let iGetContextsLength = Math.abs(iIndexTo - iIndexFrom) + 1;

		if (!oPlugin._isLimitDisabled()) {
			oPlugin._bLimitReached = iGetContextsLength > iLimit;

			if (oPlugin._bLimitReached) {
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

		let bSelectionChange = false;
		TableUtils.loadContexts(oPlugin.getTableBinding(), iGetContextsStartIndex, iGetContextsLength).then(function(aContexts) {
			aContexts.forEach(function(oContext) {
				if (!isContextSelectable(oContext) || oContext.isSelected()) {
					return;
				}
				if (bUpwardSelection && oContext.getIndex() >= iIndexTo || oContext.getIndex() <= iIndexTo) {
					oContext.setSelected(true);
					bSelectionChange = true;
				}
				if (oContext.getIndex() === iIndexTo) {
					oPlugin._oRangeSelectionStartContext = oContext;
				}
			});

			if (oPlugin.isLimitReached()) {
				TableUtils.scrollTableToIndex(oTable, iIndexTo, bUpwardSelection).then(function() {
					if (oPlugin.getEnableNotification()) {
						TableUtils.showNotificationPopoverAtIndex(oTable, iIndexTo, oPlugin.getLimit());
					}
				});
			}

			if (bSelectionChange) {
				oPlugin.fireSelectionChange();
			}
		});
	}

	function isContextSelectable(oContext) {
		const bIsTree = "hierarchyQualifier" in (oContext.getBinding().getAggregation() || {});
		return bIsTree || (oContext.getProperty("@$ui5.node.isExpanded") === undefined && !oContext.getProperty("@$ui5.node.isTotal"));
	}

	ODataV4Selection.prototype.clearSelection = function() {
		let bContextDeselected = false;

		this.getSelectedContexts().forEach(function(oContext) {
			if (!bContextDeselected && oContext.isSelected()) {
				bContextDeselected = true;
			}
			oContext.setSelected(false);
		});

		if (bContextDeselected && !this._bSuppressSelectionChangeEvent) {
			this.fireSelectionChange();
		}
		this._bSuppressSelectionChangeEvent = false;
	};

	ODataV4Selection.prototype.getSelectedContexts = function() {
		const oBinding = this.getTableBinding();

		return oBinding ? oBinding.getAllCurrentContexts().filter(function(oContext) {
			return oContext.isSelected();
		}) : [];
	};

	ODataV4Selection.prototype.onThemeChanged = function() {
		updateHeaderSelectorIcon(this);
	};

	return ODataV4Selection;
});