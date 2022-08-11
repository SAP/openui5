/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldValueHelpTableWrapperBase',
	'sap/ui/model/ChangeReason',
	'sap/base/strings/capitalize',
	"sap/ui/table/library",
	'sap/ui/thirdparty/jquery'
	], function(
			FieldValueHelpTableWrapperBase,
			ChangeReason,
			capitalize,
			library,
			jQuery
	) {
	"use strict";

	var VisibleRowCountMode = library.VisibleRowCountMode;
	var SelectionMode = library.SelectionMode;
	var SelectionBehavior = library.SelectionBehavior;

	/**
	 * Constructor for a new <code>FieldValueHelpUITableWrapper</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. This is a wrapper to use a
	 * <code>sap.ui.table.Table</code> control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Wrapper to use a <code>sap.m.Table</code> control as content of a <code>FieldValueHelp</code> element
	 * @extends sap.ui.mdc.field.FieldValueHelpTableWrapperBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
  	 * @experimental
	 * @since 1.88.0
	 * @alias sap.ui.mdc.field.FieldValueHelpUITableWrapper
	 */
	var FieldValueHelpUITableWrapper = FieldValueHelpTableWrapperBase.extend("sap.ui.mdc.field.FieldValueHelpUITableWrapper", /** @lends sap.ui.mdc.field.FieldValueHelpUITableWrapper.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				table: {
					type: "sap.ui.table.Table",
					multiple: false
				}
			},
			defaultAggregation: "table"
		}
	});

	FieldValueHelpUITableWrapper.prototype.fieldHelpOpen = function(bSuggestion) {
		FieldValueHelpTableWrapperBase.prototype.fieldHelpOpen.apply(this, arguments);
		var oTable = this._getWrappedTable();
		if (oTable && bSuggestion) {
			var aSelectedItems = this._getTableItems(true);
			var oSelectedItem = aSelectedItems && aSelectedItems[0];
			this._handleScrolling(oSelectedItem);
		}
		return this;
	};

	FieldValueHelpUITableWrapper.prototype.getListBinding = function() {
		var oTable = this._getWrappedTable();
		return oTable && oTable.getBinding("rows");
	};

	FieldValueHelpUITableWrapper.prototype.isSuspended = function() {

		var oListBinding = this.getListBinding();

		if (!oListBinding) {
			// handle non existing ListBinding as suspended. (To resume it after it is assigned)
			return true;
		}

		return oListBinding.isSuspended();

	};

	var _getSelectionHandler = function (oTable) {
		oTable = oTable || this._getWrappedTable();
		var oSelectionPlugin = oTable.getPlugins().find(function (oPlugin) {
			return oPlugin.isA("sap.ui.table.plugins.SelectionPlugin");
		});

		return oSelectionPlugin || oTable;
	};

	var _fnHandleBindingData = function (oBinding) {
		if (oBinding) {
			this._handleModelContextChange();
			return true;
		}
	};
	FieldValueHelpUITableWrapper.prototype._handleTableChanged = function (sMutation, oTable) {

		if (sMutation === "insert") {
			this._adjustTable(true); // Force fixed mode initially to have some rows available

			// observe plugins as event handling need updating when selection plugins exist
			// observe rows, as selection should be updated when new data is received
			var bHandledBinding = _fnHandleBindingData.call(this, this.getListBinding());
			this._oObserver.observe(oTable, {aggregations: ["plugins"], bindings: [!bHandledBinding && "rows"]});

			//check for existing selection plugin and listen to selection changes
			var oSelectionHandler = _getSelectionHandler.call(this, oTable);
			if (oSelectionHandler && oSelectionHandler !== oTable) {
				oSelectionHandler.attachEvent("selectionChange", this._handleSelectionChange, this);
			}
		} else {
			this._oObserver.unobserve(oTable);
		}

		FieldValueHelpTableWrapperBase.prototype._handleTableChanged.call(this, sMutation, oTable);
	};

	FieldValueHelpUITableWrapper.prototype._observeChanges = function (oChanges, bNoSelection) {
		if (oChanges.name === "rows" && oChanges.mutation === "ready") {
			_fnHandleBindingData.call(this, oChanges.bindingInfo.binding);
		}

		// handle selection plugin eventing if wrapper handles selection events itself
		if (!bNoSelection && oChanges.name === "plugins" && oChanges.child.isA("sap.ui.table.plugins.SelectionPlugin")) {
			var fnPluginEventAction = (oChanges.mutation === "insert" ? oChanges.child.attachEvent : oChanges.child.detachEvent).bind(oChanges.child);
			fnPluginEventAction("selectionChange", this._handleSelectionChange, this);
		}

		FieldValueHelpTableWrapperBase.prototype._observeChanges.apply(this, arguments);
	};

	FieldValueHelpUITableWrapper.prototype._handleEvents = function(bAdd) {
		var oTable = this._getWrappedTable();
		if (oTable) {
			var fnEventAction = (bAdd ? oTable.attachEvent : oTable.detachEvent).bind(oTable);
			fnEventAction("cellClick", this._handleItemPress, this);
			fnEventAction("rowSelectionChange", this._handleSelectionChange, this);
			fnEventAction("rowsUpdated", this._handleUpdateFinished, this);
			fnEventAction("busyStateChanged", this._handleBusyStateChanged, this);

			var oRowBinding = this.getListBinding();
			if (oRowBinding) {
				var fnEventBindingAction = (bAdd ? oRowBinding.attachEvent : oRowBinding.detachEvent).bind(oRowBinding);
				fnEventBindingAction("change", this._handleUpdateFinished, this);
			}
		}
	};

	FieldValueHelpUITableWrapper.prototype._adjustTable = function (bSuggestion) {
		FieldValueHelpTableWrapperBase.prototype._adjustTable.apply(this, arguments);

		var oTable = this._getWrappedTable();
		var oParent = this.getParent();

		if (oTable) {
			var oRowMode = oTable.getRowMode();

			if (!oRowMode) {
				oTable.setVisibleRowCountMode(bSuggestion ? VisibleRowCountMode.Fixed : VisibleRowCountMode.Auto);
				oTable.setMinAutoRowCount(3);
			} else if (oRowMode.isA("sap.ui.table.rowmodes.AutoRowMode")) {
				oRowMode.setMinRowCount(3);
			}

			if (oParent) {
				var oSelectionHandler = _getSelectionHandler.call(this);

				var _updateSelectionMode = function (sMode, sBehavior) {
						oTable.setSelectionBehavior(sBehavior);
						oSelectionHandler.setSelectionMode(sMode);
				};

				var bSingle = this._getMaxConditions() === 1;
				var sSelectionMode = bSingle ? SelectionMode.Single : SelectionMode.MultiToggle;
				var sSelectionBehavior = bSingle ? SelectionBehavior.RowOnly : SelectionBehavior.Row;
				_updateSelectionMode(sSelectionMode, sSelectionBehavior);
			}
		}
	};

	FieldValueHelpUITableWrapper.prototype._handleSelectionChange = function (oEvent) {
		var bUserInteraction = oEvent.getParameter("userInteraction");
		if (bUserInteraction || (this._bSuggestion && this._getMaxConditions() !== 1)) {
			this._fireSelectionChange.call(this, false);
		}
	};

	FieldValueHelpUITableWrapper.prototype._handleUpdateFinished = function (oEvent) {
		if (!this.getParent()) {
			// if wrapper is not assigned to a FieldValueHelp the selection can not be updated, must be done if assigned
			return;
		}

		this._updateSelectedItems();
		if (this._bNavigate) {
			this._bNavigate = false;
			this.navigate(this._iStep);
		}
		if (!oEvent || oEvent.getParameter("reason") !== capitalize(ChangeReason.Filter)) {
			this.fireDataUpdate({contentChange: false});
		}
	};

	function _getSelectedContexts (oTable) {
		var oSelectionHandler = _getSelectionHandler.call(this, oTable);
		var aSelectedIndices = oSelectionHandler.getSelectedIndices();
		return aSelectedIndices.reduce(function(aPrevious, iCurrent) {
			var oContext = oTable.getContextByIndex(iCurrent);
			return oContext ? aPrevious.concat(oContext) : aPrevious;
		}, []);
	}

	FieldValueHelpUITableWrapper.prototype._getTableItems = function (bSelectedOnly, bNoVirtual) {
		var aResult = [];
		var oTable = this._getWrappedTable();
		if (oTable) {
			if (!bNoVirtual) {
				if (bSelectedOnly) {
					aResult = _getSelectedContexts.call(this, oTable);
				} else {
					var oBinding = oTable.getBinding();
					aResult = oBinding && oBinding.getAllCurrentContexts() || [];
				}
			} else {
				aResult = oTable.getRows().filter(function (oRow) {
					var oRowBindingContext = oRow.getBindingContext();
					return oRowBindingContext && oRowBindingContext.getObject();	// don't return empty rows
				});
				if (bSelectedOnly) {
					aResult = aResult.filter(function (oRow) {
						return _getSelectedContexts.call(this, oTable).indexOf(oRow.getBindingContext()) >= 0;
					});
				}
			}
		}
		return aResult;
	};

	FieldValueHelpUITableWrapper.prototype._modifyTableSelection = function (aItems, oItem, bSelected, iItemIndex, bSuppressEvent) {
		iItemIndex = typeof iItemIndex !== 'undefined' ? iItemIndex : aItems.indexOf(oItem);
		if (iItemIndex >= 0) {
			var oSelectionHandler = _getSelectionHandler.call(this);
			var bInSelectedIndices = oSelectionHandler.getSelectedIndices().indexOf(iItemIndex) >= 0;

			if (bSelected && !bInSelectedIndices) {
				return this._getMaxConditions() === 1 ? oSelectionHandler.setSelectedIndex(iItemIndex) : oSelectionHandler.addSelectionInterval(iItemIndex,iItemIndex);
			} else if (!bSelected && bInSelectedIndices) {
				return oSelectionHandler.removeSelectionInterval(iItemIndex,iItemIndex);
			}
		}
	};

	// TODO
	FieldValueHelpUITableWrapper.prototype._handleTableEvent = function (oEvent) {
		if (!this._bSuggestion) {
			return; // only in suggestion popover
		}

		var oItem = jQuery(oEvent.target).control(0);

		switch (oEvent.type) {
			case "sapprevious":
				if (oItem.isA("sap.ui.table.Row")) {
					if (this._getTableItems(false, true).indexOf(oItem) === 0) {
						this.fireNavigate({key: undefined, description: undefined, leave: true});
						oEvent.preventDefault();
						oEvent.stopPropagation();
						oEvent.stopImmediatePropagation(true);
					}
				}
			break;

			case "sapnext":
				if (oItem.isA("sap.ui.table.Column") && this._getMaxConditions() === 1) {
					oItem = this._getTableItems(false, true)[0];
					if (oItem) {
						var oValue = this._getDataFromItem(oItem);
						if (oValue) {
							this.fireNavigate({key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters, itemId: oItem.getId()});
							oEvent.preventDefault();
							oEvent.stopPropagation();
							oEvent.stopImmediatePropagation(true);
						}
					}
				}
			break;

		default:
			break;
		}
	};

	FieldValueHelpUITableWrapper.prototype._handleScrolling = function (oItem) {
		var oTable = this._getWrappedTable();
		var iIndex = !isNaN(oItem) && oItem;
		var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();

		if (!iIndex && oItem) {
			var oContext = oItem.isA("sap.ui.table.Row") && oItem.getBindingContext();
			if (!oContext && oItem.isA("sap.ui.model.Context")) {
				oContext = oItem;
			}
			iIndex = this._getTableItems().indexOf(oContext);
		}

		if (typeof iIndex === "undefined" || iIndex < 0) {
			iIndex = iFirstVisibleRowIndex - 1;
		}

		if (iIndex >= 0 && iIndex != iFirstVisibleRowIndex) {
			oTable.setFirstVisibleRow(iIndex);
			return Promise.resolve();
		}
	};

	FieldValueHelpUITableWrapper.prototype._handleItemPress = function (oEvent) {
	};


	return FieldValueHelpUITableWrapper;

});
