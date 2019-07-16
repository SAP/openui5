/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./SelectionModelPlugin",
	"./BindingSelectionPlugin",
	"../library",
	"../TableUtils",
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
	 * <li>The number of items which can be selected in a range is defined with the limit property by the application.
	 * If the user tries to select more items, the selection is automatically limited, and the table scrolls back to the last selected item</li>
	 * <li>If not already loaded, the table loads the selected items up to the given limit</li>
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
			 * Number of items which can be selected in a range.
			 * Accepts positive integer values. If set to 0, the limit is disabled, and the Select All checkbox appears instead of the Deselect All button. The plugin loads all selected items.
			 * <b>Note:</b> To avoid severe performance problems, the limit should only be set to 0 in the following cases:
			 * <ul>
			 * <li>With client-side models</li>
			 * <li>With server-side models if they are used in client mode</li>
			 * <li>If the entity set is small</li>
			 * </ul>
			 */
			limit : {type : "int", group : "Behavior", defaultValue : 200},
			/**
			 * Show header selector
			 */
			showHeaderSelector : {type : "boolean", group : "Appearance", defaultValue : true},
			/**
			 * Selection mode of the plugin. This property controls whether single or multiple rows can be selected. It also influences the visual appearance.
			 * When the selection mode is changed, the current selection is removed.
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
					 * Array of indices whose selection has been changed (either selected or deselected).
					 */
					indices : {type : "int[]"},

					/**
					 * Indicates whether the selection limit has been reached.
					 */
					limitReached : {type : "boolean"}
				}
			}
		}
	}});

	MultiSelectionPlugin.prototype.init = function() {
		SelectionPlugin.prototype.init.call(this);

		var oIcon = new Icon({src: IconPool.getIconURI(TableUtils.ThemeParameters.resetIcon), useIconTooltip: false});
		oIcon.addStyleClass("sapUiTableSelectClear");

		this._bLimitReached = false;
		this._bLimitDisabled = this.getLimit() === 0;
		this.oSelectionPlugin = null;
		this.oDeselectAllIcon = oIcon;
	};

	MultiSelectionPlugin.prototype.exit = function() {
		if (this.oSelectionPlugin) {
			this.oSelectionPlugin.destroy();
			this.oSelectionPlugin = null;
		}

		if (this.oDeselectAllIcon) {
			this.oDeselectAllIcon.destroy();
			this.oDeselectAllIcon = null;
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
				visible: this.getSelectionMode() === SelectionMode.MultiToggle ? this.getShowHeaderSelector() : false
			}
		};
	};

	/**
	 * This hook is called by the table when the header selector is pressed.
	 *
	 * @return {boolean}
	 */
	MultiSelectionPlugin.prototype.onHeaderSelectorPress = function() {
		if (this.getSelectionMode() === SelectionMode.MultiToggle && this.getShowHeaderSelector()) {
			if (this._bLimitDisabled && this.getSelectableCount() > this.getSelectedCount()) {
				this.selectAll();
			} else {
				this.clearSelection();
			}
			return true;
		}
	};

	/**
	 * This hook is called by the table when the "select all" keyboard shortcut is pressed.
	 *
	 * @param sType
	 * @return {boolean}
	 */
	MultiSelectionPlugin.prototype.onKeyboardShortcut = function(sType) {
		this.clearSelection();
		if (sType === "toggle") {
			return true;
		}
	};

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

		this.setProperty("limit", iLimit);
		this._bLimitDisabled = iLimit === 0;
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
	 * Loads all contexts and adds all indices to the selection if the limit is disabled.
	 *
	 * @public
	 */
	MultiSelectionPlugin.prototype.selectAll = function() {
		if (this._bLimitDisabled){
			var iLastIndex = this._getBinding().getLength() - 1;
			this.addSelectionInterval(0, iLastIndex);
		}
	};


	function prepareSelection(oMultiSelectionPlugin, iIndexFrom, iIndexTo) {
		var iLimit = oMultiSelectionPlugin.getLimit();
		var iLength = iIndexTo - iIndexFrom + 1;
		var oBinding = oMultiSelectionPlugin._getBinding();

		if (!oMultiSelectionPlugin._bLimitDisabled) {
			// in case iIndexFrom is already selected the range starts from the next index
			if (oMultiSelectionPlugin.isIndexSelected(iIndexFrom) && iIndexTo > iIndexFrom) {
				iIndexFrom++;
			}

			oMultiSelectionPlugin.setLimitReached(false);
			if (iLength > iLimit) {
				iIndexTo = iIndexFrom + iLimit - 1;
				iLength = iLimit;
				oMultiSelectionPlugin.setLimitReached(true);
			}
		}

		if (oBinding && iIndexFrom >= 0 && iLength > 0) {
			return loadMultipleContexts(oBinding, iIndexFrom, iLength).then(function () {
				return {indexFrom: iIndexFrom, indexTo: iIndexTo};
			});
		}
		return Promise.resolve();
	}

	/**
	 * Loads the contexts of the selected range and sets the given selection interval as the selection.
	 * In single-selection mode it loads the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @public
	 */
	MultiSelectionPlugin.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		var sSelectionMode = this.getSelectionMode();
		if (sSelectionMode === SelectionMode.None) {
			return;
		} else if (sSelectionMode === SelectionMode.Single) {
			iIndexFrom = iIndexTo;
		}

		prepareSelection(this, iIndexFrom, iIndexTo).then(function(mIndices) {
			if (mIndices) {
				this.oSelectionPlugin.setSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
			}
		}.bind(this));
	};

	/**
	 * Loads the context of the selected range and adds the given selection interval to the selection.
	 * In single-selection mode it loads the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @public
	 */
	MultiSelectionPlugin.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		var sSelectionMode = this.getSelectionMode();
		if (sSelectionMode === SelectionMode.None) {
			return;
		} else if (sSelectionMode === SelectionMode.Single) {
			iIndexFrom = iIndexTo;
			this.setSelectionInterval(iIndexFrom, iIndexTo);
			return;
		}

		prepareSelection(this, iIndexFrom, iIndexTo).then(function(mIndices) {
			if (mIndices) {
				this.oSelectionPlugin.addSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
			}
		}.bind(this));
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
			aContexts = oBinding.getContexts(iStartIndex, iLength);
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
	 * @public
	 */
	MultiSelectionPlugin.prototype.clearSelection = function() {
		if (this.oSelectionPlugin) {
			this.setLimitReached(false);
			this.oSelectionPlugin.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedIndex = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.getSelectedIndex();
		}
		return -1;
	};

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means nothing has been selected.
	 *
	 * @returns {int[]} An array containing all selected indices
	 * @public
	 */
	MultiSelectionPlugin.prototype.getSelectedIndices = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.getSelectedIndices();
		}
		return [];
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectableCount = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.getSelectableCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedCount = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.getSelectedCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.isIndexSelectable = function(iIndex) {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.isIndexSelectable(iIndex);
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
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin.isIndexSelected(iIndex);
		}
		return false;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
	 *
	 * @param {int} iIndexFrom Index from which the deselection starts
	 * @param {int} iIndexTo Index up to which to deselect
	 * @public
	 */
	MultiSelectionPlugin.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.oSelectionPlugin) {
			this.setLimitReached(false);
			this.oSelectionPlugin.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.setSelectedIndex = function(iIndex) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		if (this.oSelectionPlugin) {
			var that = this;
			this.setLimitReached(false);
			var oBinding = this._getBinding();
			if (oBinding && iIndex >= 0) {
				loadMultipleContexts(oBinding, iIndex, 1).then(function () {
					that.oSelectionPlugin.setSelectedIndex(iIndex);
				});
			}
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.setParent = function(oParent) {
		var vReturn = SelectionPlugin.prototype.setParent.apply(this, arguments);

		if (this.oSelectionPlugin) {
			this.oSelectionPlugin.destroy();
			this.oSelectionPlugin = null;
		}
		if (oParent) {
			this.oSelectionPlugin = new oParent._SelectionAdapterClass();
			this.oSelectionPlugin.attachSelectionChange(this._onSelectionChange, this);
			oParent.setSelectionMode(this.getSelectionMode());
		}

		return vReturn;
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
			limitReached: this.isLimitReached()
		});
	};

	/**
	 * Returns the last existing index of the binding.
	 *
	 * @return {int} Last index of the binding
	 * @private
	 */
	MultiSelectionPlugin.prototype._getLastIndex = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin._getLastIndex();
		}
		return 0;
	};

	/**
	 * Returns the binding of the associated table.
	 *
	 * @return {*}
	 * @private
	 */
	MultiSelectionPlugin.prototype._getBinding = function() {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin._getBinding();
		}
		return null;
	};

	/**
	 * Sets the binding of the associated table.
	 *
	 * @override
	 * @param {sap.ui.model.Binding} oBinding
	 * @private
	 */
	MultiSelectionPlugin.prototype._setBinding = function(oBinding) {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin._setBinding(oBinding);
		}
	};

	/**
	 * The event is fired when the binding of the table is changed.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	MultiSelectionPlugin.prototype._onBindingChange = function(oEvent) {
		if (this.oSelectionPlugin) {
			return this.oSelectionPlugin._onBindingChange(oEvent);
		}
	};

	MultiSelectionPlugin.prototype.onThemeChanged = function() {
		this.oDeselectAllIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.resetIcon));
	};

	return MultiSelectionPlugin;
});