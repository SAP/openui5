/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./SelectionMode",
	"./PluginBase",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool"
], function(
	SelectionPlugin,
	SelectionMode,
	PluginBase,
	library,
	TableUtils,
	Icon,
	IconPool
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * @class
	 * Integrates the selection of the {@link sap.ui.model.odata.v4.ODataListBinding} and the table.
	 *
	 * The selection of a context that is not selectable is not allowed.
	 * The following contexts are not selectable:
	 * <ul>
	 *   <li>Header context</li>
	 *   <li>Contexts that represent group headers</li>
	 *   <li>Contexts that contain totals</li>
	 * </ul>
	 * The selection of multiple contexts in <code>Single</code> selection mode is not allowed.
	 *
	 * This plugin only works in combination with a <code>sap.ui.model.odata.v4.ODataModel</code>. Do not add it to a table that is bound to another
	 * model.
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.table.plugins.ODataV4Selection
	 *
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
			}
		}
	});

	ODataV4Selection.findOn = PluginBase.findOn;

	ODataV4Selection.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);

		const oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");
		this.setAggregation("icon", oIcon, true);

		_private(this).bLimitReached = false;
		_private(this).oRangeSelectionStartContext = null;
	};

	ODataV4Selection.prototype.onActivate = function(oTable) {
		const oBinding = oTable.getBinding();

		validateBinding(this, oBinding);
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		oTable.setProperty("selectionMode", this.getSelectionMode());
		attachToBinding(this, oBinding);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	ODataV4Selection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.None);
		clearTimeout(this.iSelectionChangeTimeout);
		delete this.iSelectionChangeTimeout;
		detachFromBinding(this, oTable.getBinding());
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	ODataV4Selection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		const oContext = oRow.getRowBindingContext();
		const sSelectionMode = this.getSelectionMode();

		if (!this.isActive() || !oContext || !isContextSelectable(oContext)) {
			return;
		}

		if (mConfig?.range) {
			extendLastSelectionTo(this, oRow);
			return;
		}

		if (this.isSelected(oRow) === bSelected) {
			return;
		}

		if (sSelectionMode === SelectionMode.Single && bSelected) {
			this.clearSelection();
		}

		oContext.setSelected(bSelected);
		_private(this).oRangeSelectionStartContext = bSelected && sSelectionMode === SelectionMode.MultiToggle ? oContext : null;
	};

	function extendLastSelectionTo(oPlugin, oRow) {
		if (!_private(oPlugin).oRangeSelectionStartContext) {
			return;
		}

		let iIndexFrom = _private(oPlugin).oRangeSelectionStartContext.getIndex();
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
		return oContext ? this.isActive() && oContext.isSelected() : false;
	};

	ODataV4Selection.prototype.getSelectedCount = function() {
		return this.getSelectedContexts().length;
	};

	/**
	 * Returns the number of selectable rows.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The plugin to getthe number of selectable rows from.
	 * @returns {int} The number of selectable rows, or -1 if the number cannot be determined.
	 */
	function getSelectableCount(oPlugin) {
		const oBinding = oPlugin.getControl()?.getBinding();

		if (!oBinding) {
			return 0;
		}

		// isLengthFinal is checked in case the count is not requested. Even though it is documented that the count is required if the limit is
		// disabled (SelectAll enabled), it could still happen.
		if (!oBinding.isLengthFinal()) {
			return -1;
		}

		const oAggregation = oBinding.getAggregation();
		const bIsHierarchy = "hierarchyQualifier" in (oAggregation || {});
		const bIsDataAggregation = !bIsHierarchy && !!oAggregation;
		let iNumberOfSelectableContexts = -1;

		if (bIsDataAggregation) {
			const aAllCurrentContexts = oPlugin.aAllCurrentContexts ?? oBinding.getAllCurrentContexts();

			// If not all contexts are available, we cannot determine the number of selectable contexts, and therefore cannot determine if all are
			// selected.
			if (oBinding.getLength() === aAllCurrentContexts.length) {
				iNumberOfSelectableContexts = aAllCurrentContexts.filter(isContextSelectable).length;
			}
		} else {
			iNumberOfSelectableContexts = oBinding.getLength();
		}

		return iNumberOfSelectableContexts;
	}

	/**
	 * Changes the current icon and tooltip text of the header selection icon in the given plugin object based on the selection.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The plugin to change the header selection icon on.
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

	ODataV4Selection.prototype.getRenderConfig = function() {
		if (!this.isActive()) {
			return SelectionPlugin.prototype.getRenderConfig.apply(this, arguments);
		}
		this.aAllCurrentContexts = this.getControl().getBinding()?.getAllCurrentContexts();

		updateHeaderSelectorIcon(this);

		const mRenderConfig = {
			headerSelector: {
				type: this._isLimitDisabled() ? "toggle" : "custom",
				icon: this.getAggregation("icon"),
				visible: this.getSelectionMode() === SelectionMode.MultiToggle && !this.getHideHeaderSelector(),
				enabled: getSelectableCount(this) !== 0,
				selected: areAllRowsSelected(this),
				tooltip: this.getSelectedCount() === 0
					? TableUtils.getResourceText("TBL_SELECT_ALL")
					: TableUtils.getResourceText("TBL_DESELECT_ALL")
			}
		};

		delete this.aAllCurrentContexts;

		return mRenderConfig;
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
			const oBinding = oPlugin.getControl()?.getBinding();
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
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @returns {boolean} Whether all rows are selected.
	 */
	function areAllRowsSelected(oPlugin) {
		const iSelectableCount = getSelectableCount(oPlugin);
		return iSelectableCount > 0 && iSelectableCount === oPlugin.getSelectedCount();
	}

	ODataV4Selection.prototype.onHeaderSelectorPress = function() {
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
				const oBinding = this.getControl()?.getBinding();
				if (oBinding?.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		}
	};

	ODataV4Selection.prototype.onKeyboardShortcut = function(sType, oEvent) {
		if (!this.isActive()) {
			return;
		}

		if (sType === "toggle") { // ctrl + a
			if (this.getSelectionMode() !== SelectionMode.MultiToggle) {
				return;
			}

			if (this._isLimitDisabled()) {
				if (toggleSelectAll(this) === false) {
					oEvent.setMarked("sapUiTableClearAll");
				}
			} else {
				const oBinding = this.getControl()?.getBinding();
				if (oBinding?.getLength() > 0) {
					select(this, 0, oBinding.getLength() - 1);
				}
			}
		} else if (sType === "clear") { // ctrl + shift + a
			this.clearSelection();
			oEvent.setMarked("sapUiTableClearAll");
		}
	};

	ODataV4Selection.prototype.setSelectionMode = function(sSelectionMode) {
		const oTable = this.getControl();

		this.setProperty("selectionMode", sSelectionMode, true);
		_private(this).oRangeSelectionStartContext = null;
		this.clearSelection();

		if (oTable) {
			oTable.setProperty("selectionMode", this.getSelectionMode());
		}

		return this;
	};

	ODataV4Selection.prototype.setLimit = function(iLimit) {
		this.setProperty("limit", iLimit);
		_private(this).bLimitReached = false;
		return this;
	};

	/**
	 * Validates the given binding for the specified plugin.
	 *
	 * @param {Object} oPlugin The plugin instance to validate the binding for.
	 * @param {Object} oBinding The binding instance to be validated.
	 * @throws {Error} If the model is not an instance of sap.ui.model.odata.v4.ODataModel.
	 * @throws {Error} If the header context is selected.
	 * @throws {Error} If a context that is not selectable is selected.
	 * @throws {Error} If multiple contexts are selected in 'Single' selection mode.
	 */
	function validateBinding(oPlugin, oBinding) {
		if (!oBinding) {
			return;
		}

		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			throw new Error("Model must be sap.ui.model.odata.v4.ODataModel");
		}

		validateSelection(oPlugin, oBinding);
	}

	/**
	 * Validates the selection of contexts.
	 *
	 * @param {object} oPlugin The table plugin instance.
	 * @param {object} oBinding The binding instance associated with the table.
	 * @param {object} [oContext] The specific context to validate. If not provided, all selected contexts will be validated.
	 * @throws {Error} If the header context is selected.
	 * @throws {Error} If a context that is not selectable is selected.
	 * @throws {Error} If multiple contexts are selected in 'Single' selection mode.
	 */
	function validateSelection(oPlugin, oBinding, oContext) {
		const aAllSelectedContexts = [oBinding.getHeaderContext(), ...oBinding.getAllCurrentContexts()].filter((oContext) => oContext?.isSelected());
		let aContextsToValidate = aAllSelectedContexts;

		if (oContext) {
			aContextsToValidate = oContext.isSelected() ? [oContext] : [];
		}

		for (const oContext of aContextsToValidate) {
			// To avoid compatibility issues if support is added. Handling a selected header context might affect UI, behavior, and settings.
			if (oContext === oBinding.getHeaderContext()) {
				throw new Error("Header context must not be selected");
			}

			// To avoid compatibility issues if support is added. Handling selected sums and group headers might affect UI, behavior, and settings.
			if (!isContextSelectable(oContext)) {
				throw new Error(`Context ${oContext} is not allowed to be selected`);
			}
		}

		if (oPlugin.getSelectionMode() === SelectionMode.Single && aAllSelectedContexts.length > 1) {
			throw new Error("Multiple contexts selected. Cannot select more than one context in selection mode 'Single'");
		}
	}

	function onTableRowsBound(oBinding) {
		validateBinding(this, oBinding);
		attachToBinding(this, oBinding);
	}

	function attachToBinding(oPlugin, oBinding) {
		oBinding?.attachEvent("selectionChanged", onBindingSelectionChanged, oPlugin);
	}

	function detachFromBinding(oPlugin, oBinding) {
		oBinding?.detachEvent("selectionChanged", onBindingSelectionChanged, oPlugin);
	}

	function onBindingSelectionChanged(oEvent) {
		const oContext = oEvent.getParameter("context");

		try {
			validateSelection(this, oContext.getBinding(), oContext);
		} catch (oError) {
			oContext.setSelected(false);
			throw oError;
		}

		if (this.iSelectionChangeTimeout) {
			return;
		}

		this.iSelectionChangeTimeout = setTimeout(() => {
			this.fireSelectionChange();
			delete this.iSelectionChangeTimeout;
		}, 0);
	}

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
	 * Calculates the correct start and end index for the range selection, loads the corresponding contexts and sets the selected state.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
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
				if (!isContextSelectable(oContext) || oContext.isSelected()) {
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

	function isContextSelectable(oContext) {
		const oBinding = oContext.getBinding();
		const bIsHeaderContext = oContext === oBinding.getHeaderContext();
		const bIsLeaf = oContext.getProperty("@$ui5.node.isExpanded") === undefined;
		const bIsTotal = oContext.getProperty("@$ui5.node.isTotal");
		const bIsHierarchy = "hierarchyQualifier" in (oBinding.getAggregation() || {});

		return !bIsHeaderContext && (bIsHierarchy || (bIsLeaf && !bIsTotal));
	}

	ODataV4Selection.prototype.clearSelection = function() {
		for (const oContext of this.getSelectedContexts()) {
			oContext.setSelected(false);
		}
	};

	ODataV4Selection.prototype.getSelectedContexts = function() {
		const oBinding = this.getControl()?.getBinding();

		if (!this.isActive() || !oBinding) {
			return [];
		}

		const aAllCurrentContexts = this.aAllCurrentContexts ?? oBinding.getAllCurrentContexts();

		return aAllCurrentContexts.filter((oContext) => oContext.isSelected());
	};

	ODataV4Selection.prototype.onThemeChanged = function() {
		updateHeaderSelectorIcon(this);
	};

	return ODataV4Selection;
});