/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/layout/Grid", "./BasePanel", "sap/ui/core/Item", "sap/m/CustomListItem", "sap/m/Select", "sap/m/List", "sap/m/HBox", "sap/m/library", "sap/m/Button"
], function (Grid, BasePanel, Item, CustomListItem, Select, List, HBox, mLibrary, Button) {
	"use strict";


	/**
	 * Constructor for a new <code>QueryPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as base class for a query builder like personalization implementation.
	 *
	 * @class
	 * @extends sap.m.p13n.BasePanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted
	 * @experimental
	 *
	 * @since 1.96
	 * @alias sap.m.p13n.QueryPanel
	 */
	var QueryPanel = BasePanel.extend("sap.m.p13n.QueryPanel", {
		metadata: {
			library: "sap.m",
			properties: {
				queryLimit: {
					type: "int",
					defaultValue: -1 //unlimited queries
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	// shortcut for sap.m.ListType
	var ListItemType = mLibrary.ListType;

	// shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mLibrary.FlexJustifyContent;

	// shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

	QueryPanel.prototype.NONE_KEY = "$_none";

	QueryPanel.prototype.init = function () {
		BasePanel.prototype.init.apply(this, arguments);
		this._bFocusOnRearrange = false;
		this.setEnableReorder(true);
		this.addStyleClass("sapMP13nQueryPanel");
	};

	QueryPanel.prototype.setP13nData = function(aP13nData) {
		BasePanel.prototype.setP13nData.apply(this, arguments);

		this._oListControl.removeAllItems();

		//Add rows for grouped items
		if (aP13nData instanceof Array) {
			aP13nData.forEach(function (oItem) {
				if (oItem[this.PRESENCE_ATTRIBUTE]) {
					this._addQueryRow(oItem);
				}
			}.bind(this));

			this._addQueryRow();
		}

		return this;
	};

	QueryPanel.prototype._moveTableItem = function (oItem, iNewIndex) {
		BasePanel.prototype._moveTableItem.apply(this, arguments);
		this._updateEnableOfMoveButtons(oItem, false);
		this._oListControl.removeItem(oItem);
		this._oListControl.insertItem(oItem, iNewIndex);
	};

	QueryPanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
		BasePanel.prototype._updateEnableOfMoveButtons.apply(this, arguments);

		//The last item is always the "$_none" field, check if its the item before, if yes do not allow to reorder it below
		if (this._oListControl.getItems().indexOf(oTableItem) === (this._oListControl.getItems().length - 2)) {
			this._getMoveDownButton().setEnabled(false);
		}
	};

	QueryPanel.prototype._createInnerListControl = function () {
		return new List(this.getId() + "-innerP13nList", {
			itemPress: [this._onItemPressed, this],
			dragDropConfig: this._getDragDropConfig()
		});
	};

	QueryPanel.prototype._getModelEntry = function(oRow) {
		var sKey = oRow.getContent()[0].getContent()[0]._key;
		var oField = this._getP13nModel().getProperty("/items").find(function (o) {
			return o.name == sKey;
		});
		return oField;
	};

	QueryPanel.prototype._getAvailableItems = function (sKey) {
		var aItems = this._getP13nModel().getProperty("/items");

		var aAvailableItems = [new Item({
			key: this.NONE_KEY,
			text: this._getResourceText("p13n.QUERY_NONE"),
			enabled: !sKey
		})];

		aItems.forEach(function (oNonPresent, iIndex) {
			aAvailableItems.push(new Item({
				key: oNonPresent.name,
				text: oNonPresent.label,
				enabled: {
					path: this.P13N_MODEL + ">/items/" + iIndex + "/" + this.PRESENCE_ATTRIBUTE,
					formatter: function(bQueried) {
						return !bQueried; //Only enable the selection in case there is not yet a query present
					}
				}
			}));
		}.bind(this));

		return aAvailableItems;
	};

	QueryPanel.prototype._getMoveDownButton = function() {
		var oMoveBtn = BasePanel.prototype._getMoveDownButton.apply(this, arguments);
		oMoveBtn.setIcon("sap-icon://navigation-down-arrow");
		return oMoveBtn;
	};

	QueryPanel.prototype._getMoveUpButton = function() {
		var oMoveBtn = BasePanel.prototype._getMoveUpButton.apply(this, arguments);
		oMoveBtn.setIcon("sap-icon://navigation-up-arrow");
		return oMoveBtn;
	};

	QueryPanel.prototype._addQueryRow = function (oItem) {

		if (this.getQueryLimit() > -1 && this.getQueryLimit() === this._oListControl.getItems().length) {
			return;
		}

		oItem = oItem ? oItem : {name: null};

		var oQueryRowGrid = this._createQueryRowGrid(oItem);

		var oRow = new CustomListItem({
			type: ListItemType.Active,
			content: [
				oQueryRowGrid
			]
		});

		//We only need 'move' buttons if:
		// 1) Reordering is enabled
		// 2) At least 2 queries can be made
		if (this.getEnableReorder() && (this.getQueryLimit() === -1 || this.getQueryLimit() > 1)){
			this._addHover(oRow);
		}

		oRow.getContent()[0].getContent()[0]._key = oItem.name;

		this._oListControl.addItem(oRow);

		var bShowRemoveBtn = !!oItem.name;
		var oRemoveButton = this._createRemoveButton(bShowRemoveBtn);
		oRow.getContent()[0].addContent(oRemoveButton);

		return oRow;
	};

	QueryPanel.prototype._createQueryRowGrid = function(oItem) {
		var oSelect = this._createKeySelect(oItem.name);
		return new Grid({
			containerQuery: true,
			defaultSpan: "XL6 L6 M6 S6",
			content: [
				oSelect
			]
		}).addStyleClass("sapUiTinyMargin");
	};

	QueryPanel.prototype._handleActivated = function(oHoveredItem) {
		var oQueryRow = oHoveredItem.getContent()[0];
		if (oQueryRow) {
			var iItemLength = oQueryRow.getContent().length - 1;
			var oButtonBox = oHoveredItem.getContent()[0].getContent()[iItemLength];

			//Only add the buttons if 1) an hovered item is provided 2) the buttons are not already there
			if (oHoveredItem && oButtonBox.getItems().length < 2) {
				oButtonBox.insertItem(this._getMoveUpButton(), 0);
				oButtonBox.insertItem(this._getMoveDownButton(), 1);
				this._updateEnableOfMoveButtons(oHoveredItem, false);
			}
		}
	};

	QueryPanel.prototype._createKeySelect = function (sKey) {
		var oKeySelect = new Select({
			width: "14rem",
			items: this._getAvailableItems(sKey),
			selectedKey: sKey,
			change: this._selectKey.bind(this)
		});

		return oKeySelect;
	};

	QueryPanel.prototype._selectKey = function(oEvt) {

		var oListItem = oEvt.getSource().getParent().getParent();

		var bIsLastRow = this._oListControl.getItems().length - 1 == this._oListControl.getItems().indexOf(oListItem);
		var sNewKey = oEvt.getParameter("selectedItem").getKey();
		var sOldKey = oEvt.getSource()._key;

		var oBtnContainer = oListItem.getContent()[0].getContent()[oListItem.getContent()[0].getContent().length - 1];
		//var oRemoveBtn = oBtnContainer.getItems()[oBtnContainer.getItems().length - 1];

		oBtnContainer.setVisible(sNewKey !== this.NONE_KEY);

		//Remove previous
		if (sOldKey) {
			this._updatePresence(sOldKey, false, undefined);
		}
		//store old key
		oEvt.getSource()._key = sNewKey;

		//add new
		this._updatePresence(sNewKey, true, this._oListControl.getItems().indexOf(oListItem));

		//Add a new row in case the last "empty" row has been configured
		if (sNewKey !== this.NONE_KEY && bIsLastRow) {
			this._addQueryRow();
			var oSelect = oEvt.getSource();
			var oNoneItem = oSelect.getItemByKey(this.NONE_KEY);
			oNoneItem.setEnabled(false);
		}
	};

	QueryPanel.prototype._createRemoveButton = function (bVisible) {
		var oRemoveBox = new HBox({
			justifyContent: FlexJustifyContent.End,
			width: "100%",
			visible: bVisible,
			items: [
				new Button({
					type: ButtonType.Transparent,
					icon: "sap-icon://decline",
					press: function (oEvt) {
						var oRow = oEvt.getSource().getParent().getParent().getParent();
						this._oListControl.removeItem(oRow);
						this._updatePresence(oRow.getContent()[0].getContent()[0]._key, false, undefined);
						if (this._oListControl.getItems().length === 0) {
							this._addQueryRow();
						} else {
							//In case an item has been removed, focus the Select control of the new 'none' row
							var iLastIndex = this._oListControl.getItems().length - 1;
							this._oListControl.getItems()[iLastIndex].getContent()[0].getContent()[0].focus();
						}
					}.bind(this)
				})
			]
		});

		return oRemoveBox;
	};

	QueryPanel.prototype._moveSelectedItem = function(){
		this._oSelectedItem = this._getMoveUpButton().getParent().getParent().getParent();
		BasePanel.prototype._moveSelectedItem.apply(this, arguments);
	};

	QueryPanel.prototype._updatePresence = function (sKey, bAdd, iNewIndex) {
		var aItems = this._getP13nModel().getProperty("/items");
		var aRelevant = aItems.filter(function (oItem) {
			return oItem.name === sKey;
		});

		if (aRelevant[0]) {
			aRelevant[0][this.PRESENCE_ATTRIBUTE] = bAdd;
		}

		if (iNewIndex !== undefined) {
			var iOldIndex = aItems.indexOf(aRelevant[0]);
			aItems.splice(iNewIndex, 0, aItems.splice(iOldIndex, 1)[0]);
		}

		this._getP13nModel().setProperty("/items", aItems);

		this.fireChange({
			reason: bAdd ? this.CHANGE_REASON_ADD : this.CHANGE_REASON_REMOVE,
			item: aRelevant[0]
		});
	};

	return QueryPanel;

});