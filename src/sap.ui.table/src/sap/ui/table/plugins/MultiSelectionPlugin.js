/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./SelectionModelPlugin",
	"./BindingSelectionPlugin",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/base/Log"
], function(
	SelectionPlugin,
	SelectionModelPlugin,
	BindingSelectionPlugin,
	library,
	TableUtils,
	Icon,
	IconPool,
	Log
) {

	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.plugins.MultiSelectionPlugin
	 *
	 * @class  Implements a plugin to enable a special multi-selection behavior:
	 * <ul>
	 * <li>No Select All checkbox, select all can only be done via range selection</li>
	 * <li>Dedicated Deselect All button to clear the selection</li>
	 * <li>The number of indices which can be selected in a range is defined by the <code>limit</code> property by the application.
	 * If the user tries to select more indices, the selection is automatically limited, and the table scrolls to the last selected index.</li>
	 * <li>The plugin makes sure that the corresponding binding contexts up to the given limit are available, by requesting them from the
	 *     binding.</li>
	 * <li>Multiple consecutive selections are possible</li>
	 * </ul>
	 *
	 * This plugin is intended for the multi-selection mode, but also supports single selection for ease of use.
	 * When this plugin is applied to the table, the table's selection mode is automatically set to MultiToggle and cannot be changed.
	 *
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 * @constructor
	 * @public
	 * @since 1.64
	 * @author SAP SE
	 * @alias sap.ui.table.plugins.MultiSelectionPlugin
	 */
	var MultiSelectionPlugin = SelectionPlugin.extend("sap.ui.table.plugins.MultiSelectionPlugin", {metadata : {
		properties : {
			/**
			 * Number of indices which can be selected in a range.
			 * Accepts positive integer values. If set to 0, the limit is disabled, and the Select All checkbox appears instead of the Deselect All
			 * button.
			 * <b>Note:</b>
			 * To avoid severe performance problems, the limit should only be set to 0 in the following cases:
			 * <ul>
			 * <li>With client-side models</li>
			 * <li>With server-side models if they are used in client mode</li>
			 * <li>If the entity set is small</li>
			 * </ul>
			 * In other cases, we recommend to set the limit to at least double the value of the {@link sap.ui.table.Table#getThreshold threshold}
			 * property of the related <code>sap.ui.table.Table</code> control.
			 */
			limit : {type : "int", group : "Behavior", defaultValue : 200},
			/**
			 * Enables notifications that are displayed once a selection has been limited.
			 *
			 * @since 1.71
			 */
			enableNotification: {type: "boolean", group: "Behavior", defaultValue: false},
			/**
			 * Show header selector
			 */
			showHeaderSelector : {type : "boolean", group : "Appearance", defaultValue : true},
			/**
			 * Selection mode of the plugin. This property controls whether single or multiple rows can be selected. It also influences the visual
			 * appearance. When the selection mode is changed, the current selection is removed.
			 */
			selectionMode : {type : "sap.ui.table.SelectionMode", group : "Behavior", defaultValue : SelectionMode.MultiToggle}
		},
		events : {
			/**
			 * This event is fired when the selection is changed.
			 */
			selectionChange : {
				parameters : {

					/**
					 * Array of indices whose selection has been changed (either selected or deselected)
					 */
					indices : {type : "int[]"},

					/**
					 * Indicates whether the selection limit has been reached
					 */
					limitReached : {type : "boolean"},

					/**
					 * Contains the data passed to the function that triggered the event
					 */
					customPayload : {type : "object"}
				}
			}
		}
	}});

	MultiSelectionPlugin.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);

		var oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.resetIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");

		this._bLimitReached = false;
		this._bLimitDisabled = this.getLimit() === 0;
		this.oInnerSelectionPlugin = null;
		this.oDeselectAllIcon = oIcon;
		this._oNotificationPopover = null;
	};

	MultiSelectionPlugin.prototype.exit = function() {
		if (this.oDeselectAllIcon) {
			this.oDeselectAllIcon.destroy();
			this.oDeselectAllIcon = null;
		}

		if (this._oNotificationPopover) {
			this._oNotificationPopover.destroy();
			this._oNotificationPopover = null;
		}
	};

	/**
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.onActivate = function(oTable) {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		this.oInnerSelectionPlugin = oTable._createLegacySelectionPlugin();
		this.oInnerSelectionPlugin.attachSelectionChange(this._onSelectionChange, this);
		oTable.addAggregation("_hiddenDependents", this.oInnerSelectionPlugin);
		oTable.setProperty("selectionMode", this.getSelectionMode());
	};

	/**
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		oTable.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange, this);

		if (this._oNotificationPopover) {
			this._oNotificationPopover.close();
		}

		if (this.oInnerSelectionPlugin) {
			this.oInnerSelectionPlugin.destroy();
			this.oInnerSelectionPlugin = null;
		}
	};

	/**
	 * Returns an object containing the selection type of the header selector and a default icon.
	 *
	 * @return {{headerSelector: {type: string, icon: string}}}
	 */
	MultiSelectionPlugin.prototype.getRenderConfig = function() {
		return {
			headerSelector: {
				type: this._bLimitDisabled ? "toggle" : "clear",
				icon: this.oDeselectAllIcon,
				visible: this.getSelectionMode() === SelectionMode.MultiToggle && this.getShowHeaderSelector(),
				enabled: this._bLimitDisabled || this.getSelectedCount() > 0
			}
		};
	};

	/**
	 * This hook is called when the header selector is pressed.
	 *
	 * @private
	 */
	MultiSelectionPlugin.prototype.onHeaderSelectorPress = function() {
		var mRenderConfig = this.getRenderConfig();

		if (!mRenderConfig.headerSelector.visible || !mRenderConfig.headerSelector.enabled) {
			return;
		}

		if (mRenderConfig.headerSelector.type === "toggle") {
			toggleSelection(this);
		} else if (mRenderConfig.headerSelector.type === "clear") {
			this.clearSelection();
		}
	};

	/**
	 * This hook is called when a keyboard shortcut relevant for selection is pressed.
	 *
	 * @param {string} sType Type of the keyboard shortcut.
	 * @private
	 */
	MultiSelectionPlugin.prototype.onKeyboardShortcut = function(sType) {
		if (sType === "toggle") {
			if (this._bLimitDisabled) {
				toggleSelection(this);
			}
		} else if (sType === "clear") {
			this.clearSelection();
		}
	};

	/**
	 * If not all indices are selected, all indices are selected, otherwise the selection is removed.
	 *
	 * @param {sap.ui.table.plugins.MultiSelectionPlugin} oPlugin The plugin to toggle the selection on.
	 */
	function toggleSelection(oPlugin) {
		if (oPlugin.getSelectableCount() > oPlugin.getSelectedCount()) {
			oPlugin.selectAll();
		} else {
			oPlugin.clearSelection();
		}
	}

	MultiSelectionPlugin.prototype.setSelectionMode = function(sSelectionMode) {
		var sOldSelectionMode = this.getSelectionMode();
		var oTable = this.getParent();

		if (oTable) {
			oTable.setProperty("selectionMode", sSelectionMode, true);
		}

		this.setProperty("selectionMode", sSelectionMode);
		if (this.getSelectionMode() !== sOldSelectionMode) {
			this.clearSelection();
		}

		return this;
	};

	MultiSelectionPlugin.prototype.setLimit = function(iLimit) {
		if (typeof iLimit === "number" && iLimit < 0) {
			Log.warning("The limit must be greater than or equal to 0", this);
			return this;
		}

		// invalidate only when the limit changes from 0 to a positive value or vice versa
		this.setProperty("limit", iLimit, !!this.getLimit() === !!iLimit);
		this._bLimitDisabled = iLimit === 0;
		return this;
	};

	MultiSelectionPlugin.prototype.setEnableNotification = function(bNotify) {
		this.setProperty("enableNotification", bNotify, true);
		return this;
	};

	/**
	 * Returns <code>true</code> if the selection limit has been reached (only the last selection), <code>false</code> otherwise.
	 *
	 * @return {boolean}
	 */
	MultiSelectionPlugin.prototype.isLimitReached = function() {
		return this._bLimitReached;
	};

	/**
	 * Sets the value.
	 *
	 * @param bLimitReached
	 */
	MultiSelectionPlugin.prototype.setLimitReached = function(bLimitReached) {
		this._bLimitReached = bLimitReached;
	};

	/**
	 * Requests the binding contexts and adds all indices to the selection if the limit is disabled or the binding length is smaller then the limit.
	 *
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.selectAll = function(oEventPayload) {
		if (!this._bLimitDisabled) {
			return Promise.reject(new Error("Not possible if the limit is enabled"));
		}

		var iSelectableCount = this.getSelectableCount();

		if (iSelectableCount === 0) {
			return Promise.reject(new Error("Nothing to select"));
		}

		return this.addSelectionInterval(0, iSelectableCount - 1, oEventPayload);
	};

	/**
	 * Calculates the correct start and end index for the range selection and loads the corresponding contexts.
	 *
	 * @param {sap.ui.table.plugins.MultiSelectionPlugin} oMultiSelectionPlugin The selection plugin.
	 * @param {int} iIndexFrom The start index of the range selection.
	 * @param {int} iIndexTo The end index of the range selection.
	 * @param {boolean} [bAddSelection=false] Whether to prepare for adding or setting the selection.
	 * @return {Promise|Promise<{indexTo: int, indexFrom: int}>} A promise that resolves with the corrected start and end index when the contexts are
	 * loaded. The Promise is rejected if the index is out of range.
	 */
	function prepareSelection(oMultiSelectionPlugin, iIndexFrom, iIndexTo, bAddSelection) {
		var iSelectableCount = oMultiSelectionPlugin.getSelectableCount();

		if (iIndexFrom < 0 && iIndexTo < 0 || iIndexFrom >= iSelectableCount && iIndexTo >= iSelectableCount) {
			// Selection is not possible if the index range it completely out of the selectable range.
			return Promise.reject(new Error("Out of range"));
		}

		// Restrict indices to boundaries.
		iIndexFrom = Math.min(Math.max(0, iIndexFrom), iSelectableCount - 1);
		iIndexTo = Math.min(Math.max(0, iIndexTo), iSelectableCount - 1);

		var iLimit = oMultiSelectionPlugin.getLimit();
		var bReverse = iIndexTo < iIndexFrom; // Indicates whether the selection is made from bottom to top.
		var iGetContextsStartIndex = bReverse ? iIndexTo : iIndexFrom;
		var iGetContextsLength;

		// If the start index is already selected, the range starts from the next index.
		if (bAddSelection && oMultiSelectionPlugin.isIndexSelected(iIndexFrom)) {
			if (bReverse) {
				iIndexFrom--;
			} else if (iIndexFrom !== iIndexTo) {
				iIndexFrom++;
				iGetContextsStartIndex++;
			}
		}

		iGetContextsLength = Math.abs(iIndexTo - iIndexFrom) + 1;

		if (!oMultiSelectionPlugin._bLimitDisabled) {
			oMultiSelectionPlugin.setLimitReached(iGetContextsLength > iLimit);

			if (oMultiSelectionPlugin.isLimitReached()) {
				if (bReverse) {
					iIndexTo = iIndexFrom - iLimit + 1;
				} else {
					iIndexTo = iIndexFrom + iLimit - 1;
				}

				// The table will be scrolled one row further to make it transparent for the user where the selection ends.
				// load the extra row here to avoid additional batch request.
				iGetContextsLength = iLimit + 1;
			}
		}

		return loadMultipleContexts(oMultiSelectionPlugin.getTableBinding(), iGetContextsStartIndex, iGetContextsLength).then(function () {
			return {indexFrom: iIndexFrom, indexTo: iIndexTo};
		});
	}

	/**
	 * Sets the given selection interval as the selection and requests the corresponding binding contexts.
	 * In single-selection mode it requests the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * If the number of indices in the range is greater than the value of the <code>limit</code> property, only n=limit
	 * indices, starting from <code>iIndexFrom</code>, are selected. The table is scrolled to display the index last
	 * selected.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		var sSelectionMode = this.getSelectionMode();

		if (sSelectionMode === SelectionMode.None) {
			return Promise.reject(new Error("SelectionMode is '" + SelectionMode.None + "'"));
		}

		if (sSelectionMode === SelectionMode.Single) {
			iIndexFrom = iIndexTo;
		}

		return prepareSelection(this, iIndexFrom, iIndexTo, false).then(function(mIndices) {
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.setSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
			delete this._oCustomEventPayloadTmp;
			return this._scrollTableToIndex(mIndices.indexTo, mIndices.indexFrom > mIndices.indexTo);
		}.bind(this));
	};

	/**
	 * Requests the context and sets the selected index to <code>iIndex</code>.
	 *
	 * @param {int} iIndex The index to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.setSelectedIndex = function(iIndex, oEventPayload) {
		return this.setSelectionInterval(iIndex, iIndex, oEventPayload);
	};

	/**
	 * Adds the given selection interval to the selection and requests the corresponding binding contexts.
	 * In single-selection mode it requests the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * If the number of indices in the range is greater than the value of the <code>limit</code> property, only n=limit
	 * indices, starting from <code>iIndexFrom</code>, are selected. The table is scrolled to display the index last
	 * selected.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		var sSelectionMode = this.getSelectionMode();

		if (sSelectionMode === SelectionMode.None) {
			return Promise.reject(new Error("SelectionMode is '" + SelectionMode.None + "'"));
		}

		if (sSelectionMode === SelectionMode.Single) {
			return this.setSelectionInterval(iIndexTo, iIndexTo);
		}

		if (sSelectionMode === SelectionMode.MultiToggle) {
			return prepareSelection(this, iIndexFrom, iIndexTo, true).then(function(mIndices) {
				this._oCustomEventPayloadTmp = oEventPayload;
				this.oInnerSelectionPlugin.addSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
				delete this._oCustomEventPayloadTmp;
				return this._scrollTableToIndex(mIndices.indexTo, mIndices.indexFrom > mIndices.indexTo);
			}.bind(this));
		}
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
	 */
	MultiSelectionPlugin.prototype._scrollTableToIndex = function(iIndex, bReverse) {
		var oTable = this.getParent();

		if (!oTable || !this.isLimitReached()) {
			return Promise.resolve();
		}

		var iFirstVisibleRow = oTable.getFirstVisibleRow();
		var mRowCounts = oTable._getRowCounts();
		var iLastVisibleRow = iFirstVisibleRow + mRowCounts.scrollable - 1;
		var bExpectRowsUpdatedEvent = false;

		if (iIndex < iFirstVisibleRow || iIndex > iLastVisibleRow) {
			var iNewIndex = bReverse ? iIndex - mRowCounts.fixedTop - 1 : iIndex - mRowCounts.scrollable - mRowCounts.fixedTop + 2;

			bExpectRowsUpdatedEvent = oTable.setFirstVisibleRowIndex(Math.max(0, iNewIndex));
		}

		this._showNotificationPopoverAtIndex(iIndex);

		return new Promise(function(resolve) {
			if (bExpectRowsUpdatedEvent) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
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
	 * @returns {Promise} which resolves when the notification Popover has been initialised
	 */
	MultiSelectionPlugin.prototype._showNotificationPopoverAtIndex = function(iIndex) {
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
					oPopover.openBy(oRowSelector);
				}

				resolve();
			});
		});
	};

	MultiSelectionPlugin.prototype.onFirstVisibleRowChange = function() {
		if (!this._oNotificationPopover) {
			return;
		}

		var oTable = this.getParent();
		if (oTable) {
			oTable.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange, this);
		}
		this._oNotificationPopover.close();
	};

	function loadMultipleContexts(oBinding, iStartIndex, iLength){
		return new Promise(function(resolve){
			loadContexts(oBinding, iStartIndex, iLength, resolve);
		});
	}

	function loadContexts(oBinding, iStartIndex, iLength, fResolve) {
		var aContexts = oBinding.getContexts(iStartIndex, iLength);
		var bLoadItems = false;

		for (var i = 0; i < aContexts.length; i++) {
			if (!aContexts[i]) {
				bLoadItems = true;
				break;
			}
		}
		if (!bLoadItems && !aContexts.dataRequested) {
			fResolve(aContexts);
			return;
		}

		oBinding.attachEventOnce("dataReceived", function() {
			if (aContexts.length == iLength) {
				fResolve(aContexts);
			} else {
				loadContexts(oBinding, iStartIndex, iLength, fResolve);
			}
		});
	}

	/**
	 * Removes the complete selection.
	 *
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @public
	 */
	MultiSelectionPlugin.prototype.clearSelection = function(oEventPayload) {
		if (this.oInnerSelectionPlugin) {
			this.setLimitReached(false);
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.clearSelection();
			delete this._oCustomEventPayloadTmp;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedIndex = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedIndex();
		}
		return -1;
	};

	/**
	 * Zero-based indices of selected indices, wrapped in an array. An empty array means nothing has been selected.
	 *
	 * @returns {int[]} An array containing all selected indices
	 * @public
	 */
	MultiSelectionPlugin.prototype.getSelectedIndices = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedIndices();
		}
		return [];
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectableCount = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectableCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedCount = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.isIndexSelectable = function(iIndex) {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.isIndexSelectable(iIndex);
		}
		return false;
	};

	/**
	 * Returns the information whether the given index is selected.
	 *
	 * @param {int} iIndex The index for which the selection state is retrieved
	 * @returns {boolean} <code>true</code> if the index is selected
	 * @public
	 */
	MultiSelectionPlugin.prototype.isIndexSelected = function(iIndex) {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.isIndexSelected(iIndex);
		}
		return false;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
	 *
	 * @param {int} iIndexFrom Index from which the deselection starts
	 * @param {int} iIndexTo Index up to which to deselect
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @public
	 */
	MultiSelectionPlugin.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		if (this.oInnerSelectionPlugin) {
			this.setLimitReached(false);
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.removeSelectionInterval(iIndexFrom, iIndexTo);
			delete this._oCustomEventPayloadTmp;
		}
	};

	/**
	 * Fires the _onSelectionChange event.
	 *
	 * @param oEvent
	 * @private
	 */
	MultiSelectionPlugin.prototype._onSelectionChange = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			limitReached: this.isLimitReached(),
			customPayload: typeof this._oCustomEventPayloadTmp === "object" ? this._oCustomEventPayloadTmp : null
		});
	};

	/**
	 * Returns the last existing index of the binding.
	 *
	 * @return {int} Last index of the binding
	 * @private
	 */
	MultiSelectionPlugin.prototype._getLastIndex = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin._getLastIndex();
		}
		return 0;
	};

	MultiSelectionPlugin.prototype.onThemeChanged = function() {
		this.oDeselectAllIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.resetIcon));
	};

	return MultiSelectionPlugin;
});