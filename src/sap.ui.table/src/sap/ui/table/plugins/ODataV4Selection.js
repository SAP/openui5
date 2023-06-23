/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool"
], function(
	SelectionPlugin,
	library,
	TableUtils,
	Icon,
	IconPool
) {
	"use strict";

	var SelectionMode = library.plugins.SelectionMode;
	var TableSelectionMode = library.SelectionMode;

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
	 */
	var ODataV4Selection = SelectionPlugin.extend("sap.ui.table.plugins.ODataV4Selection", {
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
			events: {
				selectionChange: {}
			}
		}
	});

	ODataV4Selection.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);

		var oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");

		this._bLimitReached = false;
		this.oDeselectAllIcon = oIcon;
		this._oNotificationPopover = null;
		this._oRangeSelectionStartContext = null;
	};

	ODataV4Selection.prototype.exit = function() {
		SelectionPlugin.prototype.exit.apply(this, arguments);

		if (this.oDeselectAllIcon) {
			this.oDeselectAllIcon.destroy();
			this.oDeselectAllIcon = null;
		}

		if (this._oNotificationPopover) {
			this._oNotificationPopover.destroy();
			this._oNotificationPopover = null;
		}
	};

	ODataV4Selection.prototype.onActivate = function(oTable) {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		oTable.setProperty("selectionMode", this.getSelectionMode());
	};

	ODataV4Selection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		oTable.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange, this);
		oTable.setProperty("selectionMode", TableSelectionMode.None);
		this.clearSelection();

		if (this._oNotificationPopover) {
			this._oNotificationPopover.close();
		}
	};

	ODataV4Selection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		var oContext = oRow.getRowBindingContext();

		if (!oContext || !isContextSelectable(oContext)) {
			return;
		}

		if (mConfig && mConfig.range) {
			extendLastSelectionTo(this, oRow);
			// TODO: Multiple consecutive range selections don't work if the selection hits the limit. The "rangeSelectionStartContexts" needs to
			//  be the last actually selected context.
			//this._oRangeSelectionStartContext = bSelected && this.getSelectionMode() === SelectionMode.MultiToggle ? oContext : null;
			return;
		}

		if (this.getSelectionMode() === SelectionMode.Single) {
			this.clearSelection(); // TODO: Fires 2 selectionChange events, first for deselection, then for selection
		}

		oContext.setSelected(bSelected);
		this._oRangeSelectionStartContext = bSelected && this.getSelectionMode() === SelectionMode.MultiToggle ? oContext : null;
		this.fireSelectionChange(); // TODO: Only fire the event if the selection state has really changed!
	};

	ODataV4Selection.prototype.setSelectedContexts = function(aContexts) {
		this.clearSelection();
		var aNextContexts = this.getSelectionMode() === SelectionMode.Single ? aContexts.slice(0, 1) : aContexts;
		aNextContexts.forEach(function(oContext) {
			oContext.setSelected(true); // TODO: Handle illegal contexts?
		});
		this.fireSelectionChange(); // TODO: Only fire the event if the selection state has really changed!
	};

	function extendLastSelectionTo(oPlugin, oRow) {
		if (!oPlugin._oRangeSelectionStartContext) {
			return;
		}

		var iIndexFrom = oPlugin._oRangeSelectionStartContext.getIndex();
		var oContext = oRow.getRowBindingContext();
		var iIndexTo = oContext ? oContext.getIndex() : -1;

		// The start index is already selected in case of range selection, so the range needs to start from the next index.
		if (iIndexFrom !== iIndexTo) {
			iIndexFrom += iIndexTo > iIndexFrom ? 1 : -1;
		}

		select(oPlugin, iIndexFrom, iIndexTo);
	}

	ODataV4Selection.prototype.isSelected = function(oRow) {
		var oContext = oRow.getRowBindingContext();
		return oContext ? oContext.isSelected() : false;
	};

	ODataV4Selection.prototype.getSelectedCount = function() {
		return this.getSelectedContexts().length;
	};

	ODataV4Selection.prototype.getRenderConfig = function() {
		if (!this.isActive()) {
			return SelectionPlugin.prototype.getRenderConfig.apply(this, arguments);
		}

		return {
			headerSelector: {
				type: this._isLimitDisabled() ? "toggle" : "clear",
				icon: this.oDeselectAllIcon,
				visible: this.getSelectionMode() === SelectionMode.MultiToggle && !this.getHideHeaderSelector(),
				enabled: this._isLimitDisabled() || this.getSelectedCount() > 0,
				selected: areAllRowsSelected(this)
			}
		};
	};

	/**
	 * Selects all rows if not all are already selected, otherwise the selection is cleared.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 */
	function toggleSelectAll(oPlugin) {
		if (areAllRowsSelected(oPlugin)) {
			oPlugin.clearSelection();
		} else if (oPlugin._isLimitDisabled()) {
			var oBinding = oPlugin.getTableBinding();
			select(oPlugin, 0, oBinding ? oBinding.getLength() - 1 : -1);
		}
	}

	/**
	 * Checks if all rows are selected.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @returns {boolean} Whether all rows are selected.
	 */
	function areAllRowsSelected(oPlugin) {
		var oBinding = oPlugin.getTableBinding();

		// isLengthFinal is checked in case the count is not requested. Even though it is documented that the count is required if the limit is
		// disabled (SelectAll enabled), it could still happen.
		if (!oBinding || !oBinding.isLengthFinal()) {
			return false;
		}

		var iNumberOfSelectableContexts = oBinding.getAllCurrentContexts().filter(function(oContext) {
			return isContextSelectable(oContext);
		}).length;
		var iNumberOfSelectedContexts = oPlugin.getSelectedContexts().filter(function(oContext) {
			return isContextSelectable(oContext);
		}).length;

		return iNumberOfSelectableContexts > 0 && iNumberOfSelectableContexts === iNumberOfSelectedContexts;
	}

	ODataV4Selection.prototype.onHeaderSelectorPress = function() {
		var mRenderConfig = this.getRenderConfig();

		if (!mRenderConfig.headerSelector.visible || !mRenderConfig.headerSelector.enabled) {
			return;
		}

		if (mRenderConfig.headerSelector.type === "toggle") {
			toggleSelectAll(this);
		} else if (mRenderConfig.headerSelector.type === "clear") {
			this.clearSelection();
		}
	};

	ODataV4Selection.prototype.onKeyboardShortcut = function(sType) {
		if (sType === "toggle") {
			if (this._isLimitDisabled()) {
				toggleSelectAll(this);
			}
		} else if (sType === "clear") {
			this.clearSelection();
		}
	};

	ODataV4Selection.prototype.setSelectionMode = function(sSelectionMode) {
		var oTable = this.getTable();

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
	 * Calculates the correct start and end index for the range selection and loads the corresponding contexts.
	 *
	 * @param {sap.ui.table.plugins.ODataV4Selection} oPlugin The selection plugin.
	 * @param {int} iIndexFrom The start index of the range selection.
	 * @param {int} iIndexTo The end index of the range selection.
	 * @return {Promise<{indexTo: int, indexFrom: int, contexts: sap.ui.model.odata.v4.Context[]}>}
	 *   A promise that resolves with the corrected start and end index when the contexts are loaded. The Promise is rejected if the index is out of
	 *   range.
	 */
	function loadLimitedContexts(oPlugin, iIndexFrom, iIndexTo) {
		var iLimit = oPlugin.getLimit();
		var bUpwardSelection = iIndexTo < iIndexFrom; // Indicates whether the selection is made from bottom to top.
		var iGetContextsStartIndex = bUpwardSelection ? iIndexTo : iIndexFrom;
		var iGetContextsLength = Math.abs(iIndexTo - iIndexFrom) + 1;

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
				iGetContextsLength = iLimit + 1; // TODO: This additional context is only required for scrolling and must not be selected!
			}
		}

		return loadContexts(oPlugin.getTableBinding(), iGetContextsStartIndex, iGetContextsLength).then(function(aContexts) {
			return {indexFrom: iIndexFrom, indexTo: iIndexTo, contexts: aContexts};
		});
	}

	function loadContexts(oBinding, iStartIndex, iLength) {
		var aContexts = oBinding.getContexts(iStartIndex, iLength, 0, true);
		var bContextsAvailable = aContexts.length === iLength && !aContexts.includes(undefined);

		if (bContextsAvailable) {
			return Promise.resolve(aContexts);
		}

		return new Promise(function(resolve) {
			oBinding.attachEventOnce("dataReceived", function() {
				resolve(loadContexts(oBinding, iStartIndex, iLength));
			});
		});
	}

	function select(oPlugin, iIndexFrom, iIndexTo) {
		if (iIndexFrom < 0 || iIndexTo < 0) {
			return;
		}

		loadLimitedContexts(oPlugin, iIndexFrom, iIndexTo).then(function(mSelectionInfo) {
			mSelectionInfo.contexts.forEach(function(oContext) {
				if (isContextSelectable(oContext)) {
					oContext.setSelected(true);
				}
			});
			return oPlugin._scrollTableToIndex(mSelectionInfo.indexTo, mSelectionInfo.indexFrom > mSelectionInfo.indexTo);
		}).then(function() {
			oPlugin.fireSelectionChange(); // TODO: Only fire if the selection state of a context was really changed!
		});
	}

	function isContextSelectable(oContext) {
		var bIsTree = "hierarchyQualifier" in (oContext.getBinding().getAggregation() || {});
		return (bIsTree || oContext.getProperty("@$ui5.node.isExpanded") === undefined) && !oContext.getProperty("@$ui5.node.isTotal");
	}

	ODataV4Selection.prototype.clearSelection = function() {
		var bContextDeselected = false;

		this.getSelectedContexts().forEach(function(oContext) {
			if (!bContextDeselected && oContext.isSelected()) {
				bContextDeselected = true;
			}
			oContext.setSelected(false);
		});

		if (bContextDeselected) {
			this.fireSelectionChange();
		}
	};

	ODataV4Selection.prototype.getSelectedContexts = function() {
		var oBinding = this.getTableBinding();

		return oBinding ? oBinding.getAllCurrentContexts().filter(function(oContext) {
			return oContext.isSelected();
		}) : [];
	};

	/**
	 * If the limit is reached, the table is scrolled to the <code>iIndex</code>.
	 * If <code>bReverse</code> is true the <code>firstVisibleRow</code> property of the Table is set to <code>iIndex</code> - 1,
	 * otherwise to <code>iIndex</code> - row count + 2.
	 *
	 * @param {int} iIndex The index of the row to which to scroll to.
	 * @param {boolean} bReverse Whether the row should be displayed at the bottom of the table.
	 * @returns {Promise} A promise that resolves when the table is scrolled.
	 * @private
	 * TODO: For reuse between this plugin and MultiSelectionPlugin, move this to utils
	 */
	ODataV4Selection.prototype._scrollTableToIndex = function(iIndex, bReverse) {
		var oTable = this.getParent();

		if (!oTable || !this._bLimitReached) {
			return Promise.resolve();
		}

		var iFirstVisibleRow = oTable.getFirstVisibleRow();
		var mRowCounts = oTable._getRowCounts();
		var iLastVisibleRow = iFirstVisibleRow + mRowCounts.scrollable - 1;
		var bExpectRowsUpdatedEvent = false;

		if (iIndex < iFirstVisibleRow || iIndex > iLastVisibleRow) {
			var iNewIndex = bReverse ? iIndex - mRowCounts.fixedTop - 1 : iIndex - mRowCounts.scrollable - mRowCounts.fixedTop + 2;

			bExpectRowsUpdatedEvent = oTable._setFirstVisibleRowIndex(Math.max(0, iNewIndex));
		}

		this._showNotificationPopoverAtIndex(iIndex);

		return new Promise(function(resolve) {
			if (bExpectRowsUpdatedEvent) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			} else {
				resolve();
			}
		});
	};

	/**
	 * Displays a notification Popover beside the row selector that indicates a limited selection. The given index
	 * references the index of the data context in the binding.
	 *
	 * @param {number} iIndex - Index of the data context
	 * @private
	 * @returns {Promise} A Promise that resolves after the notification popover has been opened
	 */
	ODataV4Selection.prototype._showNotificationPopoverAtIndex = function(iIndex) {
		var that = this;
		var oPopover = this._oNotificationPopover;
		var oTable = this.getParent();
		var oRow = oTable.getRows()[iIndex - oTable._getFirstRenderedRowIndex()];
		var sTitle = TableUtils.getResourceText("TBL_SELECT_LIMIT_TITLE");
		var sMessage = TableUtils.getResourceText("TBL_SELECT_LIMIT", [this.getLimit()]);

		if (!this.getEnableNotification()) {
			return Promise.resolve();
		}

		return new Promise(function(resolve) {
			sap.ui.require([
				"sap/m/Popover", "sap/m/Bar", "sap/m/Title", "sap/m/Text", "sap/m/HBox", "sap/ui/core/library", "sap/m/library"
			], function(Popover, Bar, Title, Text, HBox, coreLib, mLib) {
				if (!oPopover) {
					oPopover = new Popover(that.getId() + "-notificationPopover", {
						customHeader: [
							new Bar({
								contentMiddle: [
									new HBox({
										items: [
											new Icon({src: "sap-icon://message-warning", color: coreLib.IconColor.Critical})
												.addStyleClass("sapUiTinyMarginEnd"),
											new Title({text: sTitle, level: coreLib.TitleLevel.H2})
										],
										renderType: mLib.FlexRendertype.Bare,
										justifyContent: mLib.FlexJustifyContent.Center,
										alignItems: mLib.FlexAlignItems.Center
									})
								]
							})
						],
						content: new Text({text: sMessage})
					});

					oPopover.addStyleClass("sapUiContentPadding");
					that._oNotificationPopover = oPopover;
				} else {
					oPopover.getContent()[0].setText(sMessage);
				}

				oTable.detachFirstVisibleRowChanged(that.onFirstVisibleRowChange, that);
				oTable.attachFirstVisibleRowChanged(that.onFirstVisibleRowChange, that);

				var oRowSelector = oRow.getDomRefs().rowSelector;

				if (oRowSelector) {
					oPopover.attachEventOnce("afterOpen", resolve);
					oPopover.openBy(oRowSelector);
				} else {
					resolve();
				}
			});
		});
	};

	ODataV4Selection.prototype.onFirstVisibleRowChange = function() {
		if (!this._oNotificationPopover) {
			return;
		}

		var oTable = this.getParent();
		if (oTable) {
			oTable.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange, this);
		}
		this._oNotificationPopover.close();
	};

	ODataV4Selection.prototype.onThemeChanged = function() {
		this.oDeselectAllIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon));
	};

	return ODataV4Selection;
});