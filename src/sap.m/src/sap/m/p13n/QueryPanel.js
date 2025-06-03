/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/layout/Grid",
	"./BasePanel",
	"sap/ui/core/ListItem",
	"sap/m/CustomListItem",
	"sap/m/ComboBox",
	"sap/m/List",
	"sap/m/HBox",
	"sap/m/library",
	"sap/m/Button",
	"sap/base/util/merge",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleMessage"
], (
	Grid,
	BasePanel,
	Item,
	CustomListItem,
	ComboBox,
	List,
	HBox,
	mLibrary,
	Button,
	merge,
	coreLibrary,
	InvisibleMessage
) => {
	"use strict";


	const ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>QueryPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as base class for a query builder like personalization implementation.
	 *
	 * @extends sap.m.p13n.BasePanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 *
	 * @since 1.96
	 * @alias sap.m.p13n.QueryPanel
	 */
	const QueryPanel = BasePanel.extend("sap.m.p13n.QueryPanel", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The limit for the number of queries that can be created by the user. By default, no query limit is provided.
				 */
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
	const ListItemType = mLibrary.ListType;

	// shortcut for sap.m.FlexJustifyContent
	const FlexJustifyContent = mLibrary.FlexJustifyContent;

	// shortcut for sap.m.ListKeyboardMode
	const ListKeyboardMode = mLibrary.ListKeyboardMode;

	// shortcut for sap.m.ButtonType
	const ButtonType = mLibrary.ButtonType;

	QueryPanel.prototype.init = function() {
		BasePanel.prototype.init.apply(this, arguments);
		this._bFocusOnRearrange = false;
		this.setEnableReorder(true);
		this.addStyleClass("sapMP13nQueryPanel");

		this.getModel(this.LOCALIZATION_MODEL).setProperty("/placeholderText", this._getPlaceholderText());
	};

	/**
	 * Sets the personalization state of the panel instance.
	 *
	 * @public
	 * @param {sap.m.p13n.Item[]} aP13nData An array containing the personalization state that is represented by the <code>QueryPanel</code>
	 * @returns {this} The <code>QueryPanel</code> instance
	 */
	QueryPanel.prototype.setP13nData = function(aP13nData) {
		BasePanel.prototype.setP13nData.apply(this, arguments);

		this._oListControl.removeAllItems();

		//Add rows for grouped items
		if (aP13nData instanceof Array) {
			aP13nData.forEach((oItem) => {
				if (oItem[this.PRESENCE_ATTRIBUTE]) {
					this._addQueryRow(oItem);
				}
			});

			this._addQueryRow();
		}

		return this;
	};

	QueryPanel.prototype.getP13nData = function(bOnlyActive) {
		const aItems = [];
		this._oListControl.getItems().forEach((oItem) => {
			const sKey = this._getControlFromRow(oItem)._key;
			if (sKey) {
				const oField = this._getP13nModel().getProperty("/items")?.find((o) => {
					return o.name == sKey;
				});

				if (oField) {
					aItems.push(oField);
				}
			}
		});

		if (!bOnlyActive) {
			this._getP13nModel().getProperty("/items")?.forEach((oItem) => {
				if (aItems.indexOf(oItem) === -1) {
					aItems.push(oItem);
				}
			});
		}

		return merge([], aItems);
	};

	QueryPanel.prototype._allEntriesUsed = function() {
		return this.getP13nData().length === this.getP13nData(true).length;
	};

	QueryPanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		const iCurrentIndex = this._oListControl.getItems().indexOf(oItem);
		const iMaxListLength = this._oListControl.getItems().length - 1;
		const iQueryLimit = this.getQueryLimit();

		// Rules for the movement:
		// 1) The row is not the template row (dropdown for adding new items)
		// 2) queryLimit reached
		// 3) in case all entries are used, allow reordering for all rows
		// 4) in case a query limit is provided, limit the movement to the allowed limit

		const bIsNotTemplateRow = iCurrentIndex !== iMaxListLength;
		const bQueryLimitReached = iCurrentIndex === iMaxListLength && this._oListControl.getItems().length === iQueryLimit;
		if ((bIsNotTemplateRow || bQueryLimitReached || this._allEntriesUsed()) && (iQueryLimit === -1 || iNewIndex < iQueryLimit)) {
			this._oListControl.removeItem(oItem);
			this._oListControl.insertItem(oItem, iNewIndex);

			this._updateEnableOfMoveButtons(oItem, false);

			this._getP13nModel().checkUpdate(true);

			this.fireChange({
				reason: this.CHANGE_REASON_MOVE,
				item: this._getModelEntry(oItem)
			});
		}
	};

	QueryPanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
		BasePanel.prototype._updateEnableOfMoveButtons.apply(this, arguments);

		//The last item is always the "$_none" field
		// 1) check if its the item before, if yes do not allow to reorder it below
		// 2) Also check the case if all entries are used --> then there is no $_none row and the buttons can be enabled.
		if (this._oListControl.getItems().indexOf(oTableItem) === (this._oListControl.getItems().length - 2) && !this._allEntriesUsed()) {
			this._getMoveDownButton().setEnabled(false);
		}
	};

	QueryPanel.prototype._createInnerListControl = function() {
		const oList = new List(this.getId() + "-innerP13nList", {
			itemPress: [this._onItemPressed, this],
			dragDropConfig: this._getDragDropConfig()
		});
		oList.setKeyboardMode(ListKeyboardMode.Edit);
		return oList;
	};

	QueryPanel.prototype._getModelEntry = function(oRow) {
		const sKey = this._getControlFromRow(oRow)._key;
		const oField = this._getP13nModel().getProperty("/items").find((o) => {
			return o.name == sKey;
		});
		return oField;
	};

	QueryPanel.prototype._getAvailableItems = function(sKey) {
		const aItems = this._getP13nModel().getProperty("/items");

		const aAvailableItems = [];

		aItems.forEach((oNonPresent, iIndex) => {
			aAvailableItems.push(new Item({
				key: oNonPresent.name,
				text: oNonPresent.label,
				enabled: {
					path: this.P13N_MODEL + ">/items/" + iIndex + "/" + this.PRESENCE_ATTRIBUTE,
					formatter: function(bQueried) {
						const oComboBox = this.getParent();
						const selItem = oComboBox.getSelectedItem();
						const selItemIndex = selItem && oComboBox.getItems().indexOf(selItem);

						const sPath = this.getBindingPath("enabled");
						const pathIndex = parseInt(sPath.split("/")[2]);

						return !bQueried || selItemIndex === pathIndex; //Only enable the selection in case there is not yet a query present or the item is the selected item
					}
				}
			}));
		});

		return aAvailableItems;
	};

	QueryPanel.prototype._addQueryRow = function(oItem) {

		const bLimitedQueries = this.getQueryLimit() > -1;
		const bQueryLimitReached = this.getQueryLimit() <= this._oListControl.getItems().length;

		if ((bLimitedQueries && bQueryLimitReached && !oItem) || this._allEntriesUsed()) {
			return;
		}

		oItem = oItem ? oItem : {
			name: null
		};

		const oQueryRowGrid = this._createQueryRowGrid(oItem);

		const oRow = new CustomListItem({
			type: ListItemType.Active,
			content: [
				oQueryRowGrid
			]
		});

		//We only need 'move' buttons if:
		// 1) Reordering is enabled
		// 2) At least 2 queries can be made
		// 3) The row is not exeeding the query limit
		if (
			this.getEnableReorder() &&
			(this.getQueryLimit() === -1 || (this.getQueryLimit() > 1 && this._oListControl.getItems().length < this.getQueryLimit()))
		) {
			this._addHover(oRow);
		}

		this._getControlFromRow(oRow)._key = oItem.name;

		this._oListControl.addItem(oRow);

		const bShowRemoveBtn = !!oItem.name;
		const oRemoveButton = this._createRemoveButton(bShowRemoveBtn);
		oRow.getContent()[0].addContent(oRemoveButton);

		return oRow;
	};

	QueryPanel.prototype._createQueryRowGrid = function(oItem) {
		const oSelect = this._createKeySelect(oItem.name);
		return new Grid({
			containerQuery: true,
			defaultSpan: "XL6 L6 M6 S6",
			content: [
				oSelect
			]
		}).addStyleClass("sapUiTinyMargin");
	};

	QueryPanel.prototype._handleActivated = function(oHoveredItem) {
		const oQueryRow = oHoveredItem.getContent()[0];
		if (oQueryRow) {
			const oButtonBox = this._getControlFromRow(oHoveredItem, -1);

			//Only add the buttons if 1) an hovered item is provided 2) the buttons are not already there
			if (oHoveredItem && oButtonBox.getItems().length < 2) {
				oButtonBox.insertItem(this._getMoveUpButton(), 0);
				oButtonBox.insertItem(this._getMoveDownButton(), 1);
				this._updateEnableOfMoveButtons(oHoveredItem, false);
			}
		}
	};

	QueryPanel.prototype._getPlaceholderText = () => {
		return "";
	};

	QueryPanel.prototype._getRemoveButtonTooltipText = () => {
		return "";
	};

	QueryPanel.prototype._getRemoveButtonAnnouncementText = () => {
		return "";
	};

	QueryPanel.prototype._announce = (sMessage) => {
		const InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
		const oInvisibleMessage = InvisibleMessage.getInstance();
		oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Assertive);
	};

	QueryPanel.prototype._createKeySelect = function(sKey) {
		const that = this;
		const oKeySelect = new ComboBox({
			width: "14rem",
			enabled: {
				path: this.P13N_MODEL + ">/items/",
				formatter: function(aItems) {

					if (that.getQueryLimit() < 0) {
						return true;
					}

					const aPresentKeys = that.getP13nData(true).map((oItem) => {
						return oItem.name;
					});
					const sKey = this._key; //'this' is the select control passed by the formatter
					const iPositon = aPresentKeys.indexOf(sKey) + 1;
					return iPositon <= that.getQueryLimit();
				}
			},
			items: this._getAvailableItems(sKey),
			selectedKey: sKey,
			placeholder: `{${this.LOCALIZATION_MODEL}>/placeholderText}`,
			selectionChange: (oEvt) => {
				const oComboBox = oEvt.getSource();
				const oSelItem = oComboBox.getSelectedItem();
				// var sNewKey = oComboBox.getSelectedKey();
				if (!oSelItem) {
					this._selectKey(oComboBox);
				}
			},
			change: (oEvt) => {
				const oComboBox = oEvt.getSource();
				const newValue = oEvt.getParameter("newValue");
				this._selectKey(oComboBox);
				oComboBox.setValueState(newValue && !oComboBox.getSelectedItem() ? ValueState.Error : ValueState.None);
			}
		});

		return oKeySelect;
	};

	QueryPanel.prototype._selectKey = function(oComboBox) {
		const sNewKey = oComboBox.getSelectedKey();
		const sOldKey = oComboBox._key;
		const oListItem = oComboBox.getParent().getParent();
		const bIsLastRow = this._oListControl.getItems().length - 1 == this._oListControl.getItems().indexOf(oListItem);

		const oBtnContainer = this._getControlFromRow(oListItem, -1);
		oBtnContainer.setVisible(!(bIsLastRow && sNewKey == ""));

		//Remove previous
		if (sOldKey) {
			this._updatePresence(sOldKey, false, undefined);
		}

		//store old key
		oComboBox._key = sNewKey;

		//add new
		this._updatePresence(sNewKey, true, this._oListControl.getItems().indexOf(oListItem));

		//Add a new row in case the last "empty" row has been configured
		if (sNewKey !== "" && bIsLastRow) {
			this._addQueryRow();
		}
	};

	QueryPanel.prototype._createRemoveButton = function(bVisible) {
		const oRemoveBox = new HBox({
			justifyContent: FlexJustifyContent.End,
			width: "100%",
			visible: bVisible,
			items: [
				new Button({
					type: ButtonType.Transparent,
					icon: "sap-icon://decline",
					press: (oEvt) => {
						const oRow = oEvt.getSource().getParent().getParent().getParent();

						const iQueries = this._oListControl.getItems().length;
						//A new row with (none) needs to be created if either no row is left, or if the last potential row
						//has been removed, as no row will be created if every possible key has been used
						const bNewRowRequired = iQueries === 1 || iQueries == this.getP13nData(true).length;

						this._oListControl.removeItem(oRow);
						this._updatePresence(this._getControlFromRow(oRow)._key, false, undefined);
						if (bNewRowRequired) {
							this._addQueryRow();
						}

						this._announce(this._getRemoveButtonAnnouncementText());

						//In case an item has been removed, focus the Select control of the new 'none' row
						//Needs timeout because the new queryRow and control might not be rendered
						setTimeout(() => {
							if (!this.bIsDestroyed) {
								this.getInitialFocusedControl().focus();
							}
						}, 0);

						this._getP13nModel().checkUpdate(true);

					}
				})
			]
		});

		if (this._getRemoveButtonTooltipText()) {
			oRemoveBox.getItems()[0].setTooltip(this._getRemoveButtonTooltipText());
		}

		return oRemoveBox;
	};

	QueryPanel.prototype._moveSelectedItem = function() {
		this._oSelectedItem = this._getMoveUpButton().getParent().getParent().getParent();
		BasePanel.prototype._moveSelectedItem.apply(this, arguments);
	};

	QueryPanel.prototype._updatePresence = function(sKey, bAdd, iNewIndex) {
		const aItems = merge([], this._getP13nModel().getProperty("/items"));
		const aRelevant = aItems.filter((oItem) => {
			return oItem.name === sKey;
		});

		if (aRelevant[0]) {
			aRelevant[0][this.PRESENCE_ATTRIBUTE] = bAdd;
		}

		this._getP13nModel().setProperty("/items", aItems);

		this.fireChange({
			reason: bAdd ? this.CHANGE_REASON_ADD : this.CHANGE_REASON_REMOVE,
			item: aRelevant[0]
		});
	};

	QueryPanel.prototype.getInitialFocusedControl = function() {
		const oRow = this._getRow(-1);
		return this._getControlFromRow(oRow);
	};

	QueryPanel.prototype._getRow = function(iIndex) {
		const aItems = this._oListControl.getItems();
		if (iIndex < 0) {
			iIndex = aItems.length + iIndex;
		}
		return aItems[iIndex];
	};

	QueryPanel.prototype._getControlFromRow = (oRow, iIndex) => {
		const aContent = oRow.getContent()[0].getContent();
		if (iIndex === undefined) {
			iIndex = 0;
		}
		if (iIndex < 0) {
			iIndex = aContent.length + iIndex;
		}
		return aContent[iIndex];
	};


	QueryPanel.prototype._updateLocalizationTexts = function() {
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/placeholderText", this._getPlaceholderText());
	};

	return QueryPanel;

});