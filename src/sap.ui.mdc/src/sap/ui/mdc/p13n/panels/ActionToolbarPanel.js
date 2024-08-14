/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/SelectionPanel",
	"sap/ui/model/Sorter",
	"sap/m/p13n/MessageStrip",
	"sap/ui/core/message/MessageType"
], (SelectionPanel, Sorter, MessageStrip, MessageType) => {
	"use strict";

	/**
	 * Constructor for a new ActionToolbarPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.m.p13n.SelectionPanel
	 * @author SAP SE
	 * @constructor The ActionToolbarPanel is a list based view to personalize selection and ordering of a Control aggregation.
	 * @private
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.ActionToolbarPanel
	 */
	const ActionToolbarPanel = SelectionPanel.extend("sap.ui.mdc.p13n.panels.ActionToolbarPanel", {
		metadata: {
			library: "sap.ui.mdc"
		},
		renderer: {
			apiVersion: 2
		}
	});

	ActionToolbarPanel.prototype._bindListItems = function(mBindingInfo) {
		const oTemplate = this.getAggregation("_template");
		if (oTemplate) {
			const fnGetAlignment = function(oContext) {
				return oContext.getProperty("alignment");
			};
			const oSorter = new Sorter({
				path: "alignment",
				descending: false,
				group: fnGetAlignment
			});
			this._oListControl.bindItems(Object.assign({
				path: this.P13N_MODEL + ">/items",
				sorter: oSorter,
				key: "name",
				templateShareable: false,
				template: this.getAggregation("_template").clone()
			}, mBindingInfo));
		}
	};

	ActionToolbarPanel.prototype._removeFactoryControl = function() {
		this._oListControl.getItems().filter((oItem) => {
			return !oItem._bGroupHeader;
		}).forEach((oItem) => {
			const oFirstCell = oItem.getCells()[0];
			if (oFirstCell.getItems().length > 1) {
				oFirstCell.removeItem(oFirstCell.getItems()[1]);
			}
		});
		this.removeStyleClass("sapUiMDCAFLabelMarkingList");
		return this._aInitializedFields;
	};

	ActionToolbarPanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		const aItems = this._oListControl.getItems();
		const aFields = this._getP13nModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		const iOlModelIndex = aFields.indexOf(this._getModelEntry(oItem));

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		const iNewModelIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext(this.P13N_MODEL).getObject());
		if (iNewModelIndex == iOlModelIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewModelIndex, 0, aFields.splice(iOlModelIndex, 1)[0]);
		this._getP13nModel().setProperty("/items", aFields);

		// store the moved item again due to binding
		this._oSelectedItem = this._oListControl.getItems()[iNewIndex];

		this._updateEnableOfMoveButtons(this._oSelectedItem, true);

		this._handleActivated(this._oSelectedItem);

		this.fireChange({
			reason: "Move",
			item: this._getModelEntry(this._oSelectedItem)
		});
		this._updateItemEnableState();
	};

	ActionToolbarPanel.prototype._onPressButtonMoveToTop = function() {
		let iIndex = this._oListControl.getItems().indexOf(this._oHoveredItem);

		while (!this._oListControl.getItems()[iIndex - 1]._bGroupHeader) {
			iIndex--;
		}

		this._moveSelectedItem(iIndex);
	};

	ActionToolbarPanel.prototype._onPressButtonMoveToBottom = function() {
		let iIndex = this._oListControl.getItems().indexOf(this._oHoveredItem);

		while (iIndex < this._oListControl.getItems().length - 1 && !this._oListControl.getItems()[iIndex + 1]._bGroupHeader) {
			iIndex++;
		}

		this._moveSelectedItem(iIndex);
	};

	ActionToolbarPanel.prototype._onItemPressed = function(oEvent) {
		const oSourceControl = oEvent.getParameter('srcControl');
		if (!this._isControlPartOfMoveButtons(oSourceControl)) {
			const oTableItem = oEvent.getParameter('listItem');
			this._oSelectedItem = oTableItem;

			const oContext = oTableItem.getBindingContext(this.P13N_MODEL);
			if (this.getEnableReorder() && oContext && oContext.getProperty(this.PRESENCE_ATTRIBUTE)) {
				this._handleActivated(oTableItem);
				this._updateEnableOfMoveButtons(oTableItem, true);
			}
		}
	};

	ActionToolbarPanel.prototype._isControlPartOfMoveButtons = function(oControl) {
		const aSelectedItemActions = this._oSelectedItem ? this._oSelectedItem.getCells()[1].getItems() : [];
		let bIsControlPartOfMoveButtons = false;

		// Starting at index 2 as 0 and 1 are occupied by the active information
		if (aSelectedItemActions.length > 2) {
			for (let iIndex = 2; iIndex < aSelectedItemActions.length; iIndex++) {
				if (aSelectedItemActions[iIndex] == oControl ||
					aSelectedItemActions[iIndex] == oControl.getParent()) {
					bIsControlPartOfMoveButtons = true;
				}
			}
		}

		return bIsControlPartOfMoveButtons;
	};

	ActionToolbarPanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
		const iTableItemPos = this._oListControl.getItems().indexOf(oTableItem);
		const iLastItemPos = this._oListControl.getItems().length - 1;
		let bUpEnabled = true,
			bDownEnabled = true;
		if (iTableItemPos == 0) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}
		if (iTableItemPos == iLastItemPos) {
			// disable move buttons downwards, if the item is at the bottom
			bDownEnabled = false;
		}
		// Check if list is grouped
		const bListIsGrouped = this._oListControl.getItems().some((oItem) => {
			return oItem._bGroupHeader;
		});
		if (bListIsGrouped) {

			if (iTableItemPos > 0 && this._oListControl.getItems()[iTableItemPos - 1]._bGroupHeader) {
				// disable move buttons upwards, if there is a group header item over it
				bUpEnabled = false;
			}
			if (iTableItemPos < iLastItemPos && this._oListControl.getItems()[iTableItemPos + 1]._bGroupHeader) {
				// disable move buttons upwards, if there is a group header item below it
				bDownEnabled = false;
			}
		}
		this._getMoveTopButton().setEnabled(bUpEnabled);
		this._getMoveUpButton().setEnabled(bUpEnabled);
		this._getMoveDownButton().setEnabled(bDownEnabled);
		this._getMoveBottomButton().setEnabled(bDownEnabled);
		if (bFocus) {
			oTableItem.focus();
		}
	};


	ActionToolbarPanel.prototype._updateMessageStripForItemEnablement = function() {
		const oListItems = this._getP13nModel().getProperty("/items");
		const bSomeItemsDisabled = oListItems.find((oItem) => oItem.enabled == false);

		if (!bSomeItemsDisabled) {
			this.setMessageStrip(null);
			return;
		}

		const oMessageStrip = new MessageStrip({
			text: this._getResourceText("p13n.MESSAGE_DISABLED_ITEMS"),
			type: MessageType.Warning,
			showIcon: true
		});
		this.setMessageStrip(oMessageStrip);
	};


	ActionToolbarPanel.prototype._updateItemEnableState = function() {
		this._oListControl.getItems().forEach((oListItem) => {
			if (!oListItem.isA("sap.m.ColumnListItem")) {
				return;
			}
			this._updateCheckboxEnablement(oListItem);
		});

		this._updateMessageStripForItemEnablement();
		this._updateClearAllButton();
    };

	ActionToolbarPanel.prototype._updateCheckboxEnablement = function(oColumnListItem) {
		oColumnListItem.onsapspace = () => {};
		oColumnListItem.removeStyleClass("sapMLIBActive");
		const oMultiSelectControl = oColumnListItem.getMultiSelectControl(true);
		oMultiSelectControl.bindProperty("enabled", {
			path: `${this.P13N_MODEL}>enabled`,
			formatter: function(oValue) {
				return oValue ?? true;
			}
		});
	};

	ActionToolbarPanel.prototype._createInnerListControl = function() {
		const oTable = SelectionPanel.prototype._createInnerListControl.apply(this, arguments);
		return oTable;
	};

	ActionToolbarPanel.prototype.setP13nData = function(aP13nData) {
		SelectionPanel.prototype.setP13nData.apply(this, arguments);
		this._updateItemEnableState();
		return this;
	};

	ActionToolbarPanel.prototype._filterList = function(bShowSelected, sSarch) {
		SelectionPanel.prototype._filterList.apply(this, arguments);
		this._updateItemEnableState();
	};

	ActionToolbarPanel.prototype._updateClearAllButton = function() {
		const oP13nItems = this._getP13nModel().getProperty("/items");
		const aDisabledItems = oP13nItems?.filter((oItem) => {
			return oItem.enabled === false;
		});

		this._oListControl._getClearAllButton()?.setVisible(aDisabledItems.length === 0);
	};


	return ActionToolbarPanel;

});