/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldValueHelpTableWrapperBase',
	'sap/ui/model/ChangeReason',
	'sap/base/strings/capitalize',
	'sap/m/library',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/thirdparty/jquery'
	], function(
			FieldValueHelpTableWrapperBase,
			ChangeReason,
			capitalize,
			mLibrary,
			loadModules,
			jQuery
	) {
	"use strict";

	var ListMode = mLibrary.ListMode;
	var Sticky = mLibrary.Sticky;
	var ScrollContainer;

	/**
	 * Constructor for a new <code>FieldValueHelpMTableWrapper</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. This is a wrapper to use a
	 * {@link sap.m.Table Table} control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Wrapper to use a <code>sap.m.Table</code> control as content of a <code>FieldValueHelp</code> element
	 * @extends sap.ui.mdc.field.FieldValueHelpTableWrapperBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.60.0
	 * @alias sap.ui.mdc.field.FieldValueHelpMTableWrapper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpMTableWrapper = FieldValueHelpTableWrapperBase.extend("sap.ui.mdc.field.FieldValueHelpMTableWrapper", /** @lends sap.ui.mdc.field.FieldValueHelpMTableWrapper.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				/**
				 * Table of the field help.
				 *
				 * As the <code>FieldValueHelp</code> element cannot know the semantic of the items,
				 * the caller is responsible for the item handling.
				 * The items must be active to allow interaction and selection.
				 *
				 * This can be handled automatically if the following applies:
				 * <ul>
				 * <li>No <code>keyPath</code> or <code>descriptionPath</code> is specified for the <code>FieldValueHelp</code> element</li>
				 * <li>Table has no paging </li>
				 * <li>Table uses <code>ColumnListItem</code> as item </li>
				 * <li>The first column if the table contains the key and the second column the description, using a <code>Text</code> control </li>
				 * </ul>
				 *
				 * For everything else the application has to implement the logic.
				 *
				 * If the <code>ListBinding</code> of the table is initially created to be suspended, no filtering or selection is triggered. So the table is empty.
				 * Upon user interaction (type ahead, search request, or search from <code>FilterBar</code>) the <code>ListBinding</code> is resumed so the filter
				 * is executed.
				 * If <code>FilterBar</code> is in <code>LiveMode</code>, and <code>InParameters</code> are used, this also triggers filtering.
				 */
				table: {
					type: "sap.m.Table",
					multiple: false
				}
			},
			defaultAggregation: "table"
		}
	});

	// private function to initialize globals for qUnit tests
	FieldValueHelpMTableWrapper._init = function() {
		ScrollContainer = undefined;
	};

	FieldValueHelpMTableWrapper.prototype.exit = function() {
		FieldValueHelpTableWrapperBase.prototype.exit.apply(this, arguments);
	};

	FieldValueHelpMTableWrapper.prototype.initialize = function(bSuggestion) {

		if (bSuggestion || this._oScrollContainer) {
			return this._bTableResolved ? this : this._oTablePromise;
		}

		if (!ScrollContainer) {
			loadModules("sap/m/ScrollContainer").then(function (aModules) {
				if (!this._bIsBeingDestroyed) {
					ScrollContainer = aModules[0];
					this.initialize();
					this.fireDataUpdate({contentChange: true});
				}
			}.bind(this));
			return this;
		}

		this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
			height: "100%",
			width: "100%",
			vertical: true
		});

		this._oScrollContainer._oWrapper = this;
		this._oScrollContainer.getContent = function() {
			var aContent = [];
			var oTable = this._oWrapper && this._oWrapper.getTable();
			if (oTable) {
				aContent.push(oTable);
			}
			return aContent;
		};
		return this;
	};

	FieldValueHelpMTableWrapper.prototype.dispose = function () {
		if (this._oScrollContainer) {
			this._oScrollContainer.destroy();
			delete this._oScrollContainer;
		}
	};

	FieldValueHelpMTableWrapper.prototype.getDialogContent = function() {

		return this._oScrollContainer;

	};

	FieldValueHelpMTableWrapper.prototype.getSuggestionContent = function() {

		return this._getWrappedTable();

	};

	FieldValueHelpMTableWrapper.prototype.fieldHelpOpen = function(bSuggestion) {

		FieldValueHelpTableWrapperBase.prototype.fieldHelpOpen.apply(this, arguments);

		var oTable = this._getWrappedTable();
		if (oTable) {
			if (bSuggestion) {
				var oSelectedItem = oTable.getSelectedItem();
				if (oSelectedItem) {
					this._handleScrolling(oSelectedItem);
				}
			}
		}

		return this;

	};

	FieldValueHelpMTableWrapper.prototype.getListBinding = function() {
		var oTable = this._getWrappedTable();
		return oTable && oTable.getBinding("items");
	};

	FieldValueHelpMTableWrapper.prototype._getListBindingInfo = function() {
		var oTable = this._getWrappedTable();
		return oTable && oTable.getBindingInfo("items");
	};

	FieldValueHelpMTableWrapper.prototype.isSuspended = function() {

		var oListBinding = this.getListBinding();

		if (!oListBinding) {
			// handle non existing ListBinding as suspended. (To resume it after it is assigned)
			return true;
		}

		return oListBinding.isSuspended();

	};

	FieldValueHelpMTableWrapper.prototype._handleEvents = function(bAdd) {
		var oTable = this._getWrappedTable();
		if (oTable) {
			var fnEventAction = (bAdd ? oTable.attachEvent : oTable.detachEvent).bind(oTable);
			fnEventAction("itemPress", this._handleItemPress, this);
			fnEventAction("selectionChange", this._handleSelectionChange, this);
			fnEventAction("updateFinished", this._handleUpdateFinished, this);
		}
	};

	FieldValueHelpMTableWrapper.prototype._adjustTable = function (bSuggestion, bNoSelection) {
		FieldValueHelpTableWrapperBase.prototype._adjustTable.apply(this, arguments);

		var oTable = this._getWrappedTable();
		if (oTable && this.getParent()) { // only possible if assigned to a FieldValueHelp
			oTable.setRememberSelections(false);

			if (bSuggestion) {
				if (this._getMaxConditions() === 1) {
					oTable.setMode(ListMode.SingleSelectMaster);
				} else {
					oTable.setMode(ListMode.MultiSelect);
				}
			} else if (this._getMaxConditions() === 1) {
				oTable.setMode(ListMode.SingleSelectLeft);
			} else {
				oTable.setMode(ListMode.MultiSelect);
			}

			var aSticky = oTable.getSticky();
			if (!aSticky || aSticky.length === 0) {
				// make headers sticky
				oTable.setSticky([Sticky.ColumnHeaders]);
			}

		}
	};

	var _fnHandleBindingData = function (oBinding) {
		if (oBinding) {
			this._handleModelContextChange();
			return true;
		}
	};

	FieldValueHelpMTableWrapper.prototype._handleTableChanged = function (sMutation, oTable) {

		if (sMutation === "insert") {
			this._adjustTable(true);
			if (!_fnHandleBindingData.call(this, this.getListBinding())) {
				this._oObserver.observe(oTable, {bindings: ["items"]});
			}
		} else {
			this._oObserver.unobserve(oTable);
		}

		FieldValueHelpTableWrapperBase.prototype._handleTableChanged.call(this, sMutation, oTable);
	};

	FieldValueHelpMTableWrapper.prototype._observeChanges = function (oChanges, bNoSelection) {
		if (oChanges.name === "items" && oChanges.mutation === "ready") {
			_fnHandleBindingData.call(this, oChanges.bindingInfo.binding);
		}

		FieldValueHelpTableWrapperBase.prototype._observeChanges.apply(this, arguments);
	};

	FieldValueHelpMTableWrapper.prototype._handleItemPress = function (oEvent) {

		var oItem = oEvent.getParameter("listItem");

		if (!this._bSuggestion || this._getMaxConditions() !== 1) {
			// in Dialog mode or multi-suggestion select item
			oItem.setSelected(!oItem.getSelected());
		}

		this._fireSelectionChange(true);
	};

	FieldValueHelpMTableWrapper.prototype._handleSelectionChange = function (oEvent, bForce) {

		if (!this._bSuggestion || this._getMaxConditions() !== 1 || bForce) {
			// single-suggestion handled in this._handleItemPress
			this._fireSelectionChange.call(this, false);
		}

	};


	FieldValueHelpMTableWrapper.prototype._handleUpdateFinished = function (oEvent) {
		if (!this.getParent()) {
			// if wrapper is not assigned to a FieldValueHelp the selection can not be updated, must be done if assigned
			return;
		}

		this._updateSelectedItems();
		if (this._bNavigate) {
			this._bNavigate = false;
			this.navigate(this._iStep);
		}
		this.fireDataUpdate({contentChange: false});
	};

	FieldValueHelpMTableWrapper.prototype._getTableItems = function (bSelectedOnly, bNoVirtual) {
		var oTable = this._getWrappedTable();

		if (oTable) {
			return bSelectedOnly ? oTable.getSelectedItems() : oTable.getItems();
		}

		return [];
	};

	FieldValueHelpMTableWrapper.prototype._modifyTableSelection = function (aItems, oItem, bSelected, iItemIndex) {
		if (oItem.getSelected() !== bSelected) {
			oItem.setSelected(bSelected);
		}
	};

	FieldValueHelpMTableWrapper.prototype._handleTableEvent = function (oEvent) {

		if (!this._bSuggestion) {
			return; // only in suggestion popover
		}

		var oTable = this._getWrappedTable();
		var oItem = jQuery(oEvent.target).control(0);

		switch (oEvent.type) {
			case "sapprevious":
				if (oItem.isA("sap.m.ListItemBase")) {
					if (oTable.indexOfItem(oItem) === 0) {
						// focus Field
						this.fireNavigate({key: undefined, description: undefined, leave: true});
						oEvent.preventDefault();
						oEvent.stopPropagation();
						oEvent.stopImmediatePropagation(true);
					}
				}
				break;
			default:
				break;
		}
	};

	FieldValueHelpMTableWrapper.prototype._handleScrolling = function (oItem) {
		var oScrollDelegate = this.getScrollDelegate();
		if (oScrollDelegate) {
			var oTable = this._getWrappedTable();
			var iIndex = !isNaN(oItem) ? oItem : oTable.indexOfItem(oItem);
			oTable.scrollToIndex(iIndex).catch(function (oError) {
				// TODO: Handle scroll error?
			});
			return true;
		}
	};

	FieldValueHelpMTableWrapper.prototype.enableShowAllItems = function() {
		var oTable = this._getWrappedTable();
		var oBindingInfo = oTable && oTable.getBindingInfo("items");
		return oBindingInfo && !!oBindingInfo.length;
	};

	FieldValueHelpMTableWrapper.prototype.getAllItemsShown = function() {

		var oBinding = this.getListBinding();
		return oBinding && (!oBinding.getLength() || oBinding.bLengthFinal);

	};

	return FieldValueHelpMTableWrapper;

});
