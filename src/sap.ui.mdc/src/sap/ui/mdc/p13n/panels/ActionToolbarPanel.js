/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/m/p13n/SelectionPanel",
    "sap/ui/model/Sorter"
], function(SelectionPanel, Sorter) {
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
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.ActionToolbarPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ActionToolbarPanel = SelectionPanel.extend("sap.ui.mdc.p13n.panels.ActionToolbarPanel", {
		metadata: {
            library: "sap.ui.mdc"
        },
		renderer: {
			apiVersion: 2
		}
    });

    ActionToolbarPanel.prototype._bindListItems = function(mBindingInfo) {
        var oTemplate = this.getAggregation("_template");
		if (oTemplate) {
            var fnGetAlignment = function(oContext) {
                return oContext.getProperty("alignment");
            };
            var oSorter = new Sorter({
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
		this._oListControl.getItems().filter(function(oItem) {
			return !oItem._bGroupHeader;
		}).forEach(function(oItem){
			var oFirstCell = oItem.getCells()[0];
			if (oFirstCell.getItems().length > 1){
				oFirstCell.removeItem(oFirstCell.getItems()[1]);
			}
		});
		this.removeStyleClass("sapUiMDCAFLabelMarkingList");
		return this._aInitializedFields;
	};

	ActionToolbarPanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		var aItems = this._oListControl.getItems();
		var aFields = this._getP13nModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		var iOlModelIndex = aFields.indexOf(this._getModelEntry(oItem));

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		var iNewModelIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext(this.P13N_MODEL).getObject());
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
	};

	ActionToolbarPanel.prototype._onPressButtonMoveToTop = function() {
		var iIndex = this._oListControl.getItems().indexOf(this._oHoveredItem);

		while (!this._oListControl.getItems()[iIndex - 1]._bGroupHeader) {
			iIndex--;
		}

		this._moveSelectedItem(iIndex);
	};

	ActionToolbarPanel.prototype._onPressButtonMoveToBottom = function() {
		var iIndex = this._oListControl.getItems().indexOf(this._oHoveredItem);

		while (iIndex < this._oListControl.getItems().length - 1 && !this._oListControl.getItems()[iIndex + 1]._bGroupHeader) {
			iIndex++;
		}

		this._moveSelectedItem(iIndex);
	};

	ActionToolbarPanel.prototype._onItemPressed = function(oEvent) {
		var oSourceControl = oEvent.getParameter('srcControl');
		if (!this._isControlPartOfMoveButtons(oSourceControl)) {
			var oTableItem = oEvent.getParameter('listItem');
			this._oSelectedItem = oTableItem;

			var oContext = oTableItem.getBindingContext(this.P13N_MODEL);
			if (this.getEnableReorder() && oContext && oContext.getProperty(this.PRESENCE_ATTRIBUTE)){
				this._handleActivated(oTableItem);
				this._updateEnableOfMoveButtons(oTableItem, true);
			}
		}
	};

	ActionToolbarPanel.prototype._isControlPartOfMoveButtons = function(oControl) {
		var aSelectedItemActions = this._oSelectedItem ? this._oSelectedItem.getCells()[1].getItems() : [];
		var bIsControlPartOfMoveButtons = false;

		// Starting at index 2 as 0 and 1 are occupied by the active information
		if (aSelectedItemActions.length > 2) {
			for (var iIndex = 2; iIndex < aSelectedItemActions.length; iIndex++) {
				if (aSelectedItemActions[iIndex] == oControl ||
					aSelectedItemActions[iIndex] == oControl.getParent()) {
						bIsControlPartOfMoveButtons = true;
				}
			}
		}

		return bIsControlPartOfMoveButtons;
	};

	ActionToolbarPanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
		var iTableItemPos = this._oListControl.getItems().indexOf(oTableItem);
		var iLastItemPos =  this._oListControl.getItems().length - 1;
		var bUpEnabled = true, bDownEnabled = true;
		if (iTableItemPos == 0) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}
		if (iTableItemPos == iLastItemPos) {
			// disable move buttons downwards, if the item is at the bottom
			bDownEnabled = false;
		}
		// Check if list is grouped
		var bListIsGrouped = this._oListControl.getItems().some(function(oItem) {
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

    return ActionToolbarPanel;

});