/*
 * ! ${copyright}
 */
sap.ui.define([
	"./BasePanel",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/library",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/m/Column",
	"sap/m/Table",
	"sap/m/library",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/ui/model/Filter",
	"sap/base/util/merge",
	"sap/ui/core/InvisibleText"
], function(BasePanel, Label, ColumnListItem, HBox, VBox, coreLibrary, Icon, Text, Column, Table, mLibrary, ToolbarSpacer, Button, OverflowToolbar, Filter, merge, InvisibleText) {
	"use strict";

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = mLibrary.ListKeyboardMode;

	// shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mLibrary.FlexJustifyContent;

	// shortcut for sap.m.ListType
	var ListType = mLibrary.ListType;

	/**
	 * Constructor for a new <code>SelectionPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control can be used to customize personalization content for adding/removing items for an associated control instance.
	 *
	 * @extends sap.m.p13n.BasePanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.96.
	 * @since 1.96
	 * @alias sap.m.p13n.SelectionPanel
	 */
	var SelectionPanel = BasePanel.extend("sap.m.p13n.SelectionPanel", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Shows an additional header with a search field and the Show Selected button.
				 */
				showHeader: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Enables a count for selected items compared to available items, for example, Currency (3/12), in addition
				 * to the first column text.
				 */
				enableCount: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * The first column in the panel describing the selectable fields.
				 */
				fieldColumn: {
					type: "string",
					defaultValue: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("p13n.DEFAULT_DESCRIPTION")
				},
				 /**
				 * The second column in the panel showing the move buttons for reordering.
				 */
				activeColumn: {
					type: "string",
					defaultValue: ""
				},
				/**
				 * An optional callback that may be used to display additional custom content in each selectable item.
				 * This factory can be toggled by executing the {@link sap.m.p13n.SelectionPanel#showFactory} method.
				 */
				itemFactory: {
					type: "function"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	SelectionPanel.prototype.applySettings = function(){
		BasePanel.prototype.applySettings.apply(this, arguments);
		this._setTemplate(this._getListTemplate());
		this.addStyleClass("sapMSelectionPanel");
		this._aInitializedFields = [];
		//Do not show the factory by default
		this._bShowFactory = false;
		this.addStyleClass("SelectionPanelHover");
		this._displayColumns();
		this.setEnableReorder(true);
	};

	SelectionPanel.prototype.setItemFactory = function(fnItemFactory) {
		this.setProperty("itemFactory", fnItemFactory);
		this._oListControl.setGrowing(!!fnItemFactory);
		return this;
	};

	SelectionPanel.prototype._getListTemplate = function() {
		return new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">" + this.PRESENCE_ATTRIBUTE + "}",
			type: ListType.Active,
			cells: [
				new VBox({
					items: [
						new Label({
							wrapping: true,
							required: "{" + this.P13N_MODEL + ">required}",
							tooltip: "{" + this.P13N_MODEL + ">tooltip}",
							text: "{" + this.P13N_MODEL + ">label}"
						})
					]
				}),
				new HBox({
					justifyContent: FlexJustifyContent.Center,
					items: [
						new Icon({
							src: "sap-icon://circle-task-2",
							size: "0.5rem",
							color: IconColor.Neutral,
							visible: {
								path: this.P13N_MODEL + ">active",
								formatter: function(bactive) {
									if (bactive){
										return true;
									} else {
										return false;
									}
								}
							}
						}),
						// The active status is visiually represented as dot icon in the tabular view, for the screen reader it needs to be ensured
						// that a similar information is available without the UI. This InvisibleText will provide a text in the screen reader as:
						// "Active Field is active" & "Active Field is inactive"
						new InvisibleText({
							text: {
								path: this.P13N_MODEL + ">active",
								formatter: function(bactive) {
									return bactive ? this._getResourceText("p13n.ACTIVESTATE_ACTIVE") : this._getResourceText("p13n.ACTIVESTATE_INACTIVE");
								}.bind(this)
							}
						})
					]
				})
			]
		});
	};

	SelectionPanel.prototype.setShowHeader = function(bShowHeader) {
		if (bShowHeader){
			var sShowSelected = this._getResourceText("p13n.SHOW_SELECTED");
			var sShowAll = this._getResourceText("p13n.SHOW_ALL");
			this._oListControl.setHeaderToolbar(new OverflowToolbar({
				content: [
					this._getSearchField(),
					new ToolbarSpacer(),
					new Button({
						press: function(oEvt){
							this._bShowSelected = oEvt.getSource().getText() == sShowSelected;
							this._filterList(this._bShowSelected, this._sSearch);
							oEvt.getSource().setText(this._bShowSelected ? sShowAll : sShowSelected);
						}.bind(this),
						text: sShowSelected
					})
				]
			}));
		}
		this.setProperty("showHeader", bShowHeader);
		return this;
	};

	SelectionPanel.prototype.getSelectedFields = function() {
		var aSelectedItems = [];
		this._loopItems(this._oListControl, function(oItem, sKey){
			if (oItem.getSelected()){
				aSelectedItems.push(sKey);
			}
		});

		return aSelectedItems;
	};

	SelectionPanel.prototype._filterList = function(bShowSelected, sSarch) {
		var oSearchFilter = [], oSelectedFilter = [];
		if (bShowSelected) {
			oSelectedFilter = new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true);
		}
		if (sSarch) {
			oSearchFilter = new Filter("label", "Contains", sSarch);
		}
		this._oListControl.getBinding("items").filter(new Filter([].concat(oSelectedFilter, oSearchFilter), true));
	};

	SelectionPanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		this._sSearch = oEvent.getSource().getValue();
		this._filterList(this._bShowSelected, this._sSearch);
	};

	SelectionPanel.prototype._handleActivated = function(oHoveredItem) {
		//remove move buttons if unselected item is hovered (not covered by updateStarted)
		this._removeMoveButtons();
		//Check if the prior hovered item had a visible icon and renable it if required
		if (this._oHoveredItem && !this._oHoveredItem.bIsDestroyed && this._oHoveredItem.getBindingContextPath()){
			var bVisible = !!this._getP13nModel().getProperty(this._oHoveredItem.getBindingContextPath()).active;
			var oOldIcon = this._oHoveredItem.getCells()[1].getItems()[0];
			oOldIcon.setVisible(bVisible);
		}
		//Store (new) hovered item and set its icon to visible: false + add move buttons to it
		var oIcon = oHoveredItem.getCells()[1].getItems()[0];
		oIcon.setVisible(false);
		this._oHoveredItem = oHoveredItem;
		this._updateEnableOfMoveButtons(oHoveredItem, false);
		this._addMoveButtons(oHoveredItem);
	};

	SelectionPanel.prototype._removeMoveButtons = function() {
		var oMoveButtonBox = this._getMoveButtonContainer();
		if (oMoveButtonBox){
			oMoveButtonBox.removeItem(this._getMoveTopButton());
			oMoveButtonBox.removeItem(this._getMoveUpButton());
			oMoveButtonBox.removeItem(this._getMoveDownButton());
			oMoveButtonBox.removeItem(this._getMoveBottomButton());
		}
	};

	SelectionPanel.prototype._getMoveButtonContainer = function() {
		if (this._oMoveBottomButton &&
			this._oMoveBottomButton.getParent() &&
			this._oMoveBottomButton.getParent().isA("sap.m.FlexBox")
		){
			return this._oMoveBottomButton.getParent();
		}
	};

	SelectionPanel.prototype.showFactory = function(bShow) {
		this._bShowFactory = bShow;
		this._displayColumns();
		if (bShow){
			this.removeStyleClass("SelectionPanelHover");
			this._oListControl.setKeyboardMode(ListKeyboardMode.Edit); //--> tab through editable fields (fields shown)
			this._addFactoryControl();
		} else {
			this.addStyleClass("SelectionPanelHover");
			this._oListControl.setKeyboardMode(ListKeyboardMode.Navigation); //--> tab through list items (fields hidden)
			this._removeFactoryControl();
		}
	};

	SelectionPanel.prototype._loopItems = function(oList, fnItemCallback) {
		oList.getItems().forEach(function(oItem){

			var sPath = oItem.getBindingContextPath();
			var sKey = this._getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		}.bind(this));
	};

	/**
	 * Sets the personalization state of the panel instance.
	 * @public
	 * @param {sap.m.p13n.Item[]} aP13nData An array containing the personalization state that is represented by the <code>SelectionPanel</code>.
	 * @returns {this} The <code>SelectionPanel</code> instance
	 */
	SelectionPanel.prototype.setP13nData = function(aP13nData) {
		if (this.getEnableCount()) {
			aP13nData = merge([], aP13nData);
			this._oListControl.removeSelections();
		}
		BasePanel.prototype.setP13nData.call(this, aP13nData);
		this._updateCount();

		//After explicitly updating the data (e.g. outer influences by the p13n.Popup such as reset, open & update)
		//Ensure that the remove buttons and currently selected item will be reset, as it's not clear anymore
		//remove the reorder buttons from their current location and hence reset the hover logic
		this._removeMoveButtons();
		this._oSelectedItem = null;

		return this;
	};

	SelectionPanel.prototype._updateCount = function() {
		this._getP13nModel().setProperty("/selectedItems", this._oListControl.getSelectedContexts(true).length);
	};

	SelectionPanel.prototype._selectTableItem = function(oTableItem, bSelectAll) {
		BasePanel.prototype._selectTableItem.apply(this, arguments);
		this._updateCount();
	};

	SelectionPanel.prototype._removeFactoryControl = function() {
		this._oListControl.getItems().forEach(function(oItem){
			var oFirstCell = oItem.getCells()[0];
			if (oFirstCell.getItems().length > 1){
				oFirstCell.removeItem(oFirstCell.getItems()[1]);
			}
		});
		this.removeStyleClass("sapUiMDCAFLabelMarkingList");
		return this._aInitializedFields;
	};

	SelectionPanel.prototype._moveSelectedItem = function(){
		this._oSelectedItem = this._getMoveButtonContainer().getParent();
		BasePanel.prototype._moveSelectedItem.apply(this, arguments);
	};

	SelectionPanel.prototype._getShowFactory = function() {
		return this._bShowFactory;
	};

	SelectionPanel.prototype._displayColumns = function() {
		var aColumns = [
			this.getFieldColumn()
		];
		if (!this._bShowFactory) {
			aColumns.push(new Column({
				width: "30%",
				hAlign: "Center",
				vAlign: "Middle",
				header: new Text({
					text: this.getActiveColumn()
				})
			}));
		}
		this._setPanelColumns(aColumns);
	};

	SelectionPanel.prototype._setPanelColumns = function(aColumns) {
		this._sText = aColumns[0];
		var bEnableCount = this.getEnableCount();
		if (bEnableCount) {
			var oColumn = new Column({
				header: new Text({
					text: {
						parts: [
							{
								path: this.P13N_MODEL + '>/selectedItems'
							}, {
								path: this.P13N_MODEL + '>/items'
							}
						],
						formatter: function(iSelected, aAll) {
							return this._sText + " " + this._getResourceText('p13n.HEADER_COUNT', [
								iSelected, aAll instanceof Array ? aAll.length : 0
							]);
						}.bind(this)
					}
				})
			});
			aColumns[0] = oColumn;
		}
		BasePanel.prototype._setPanelColumns.apply(this, arguments);
	};

	SelectionPanel.prototype._addFactoryControl = function(oList) {
		this._oListControl.getItems().forEach(function(oItem){
			var oContext = oItem.getBindingContext(this.P13N_MODEL);
			var oField = this.getItemFactory().call(this, oContext);

			//set 'labelFor'
			var oFirstCell = oItem.getCells()[0];
			var oLabel = oFirstCell.getItems()[0];
			if (oLabel) {
				oLabel.setLabelFor(oField);
			}

			oFirstCell.addItem(oField);
		}.bind(this));
		this.addStyleClass("sapUiMDCAFLabelMarkingList");
	};

	SelectionPanel.prototype._createInnerListControl = function() {
		return new Table(this.getId() + "-innerSelectionPanelTable", Object.assign({
			growing: false,
			growingThreshold: 25,
			growingScrollToLoad: true,
			updateStarted: function() {
				this._removeMoveButtons();
				this._removeFactoryControl();
			}.bind(this),
			updateFinished: function() {
				if (this._getShowFactory()) {
					this._addFactoryControl();
				}
			}.bind(this)
		}, this._getListControlConfig()));
	};

	SelectionPanel.prototype.filterContent = function(aFilter) {
		if (this._oListControl.getBinding("items")){
			this._oListControl.getBinding("items").filter(aFilter, true);
		}
	};

	SelectionPanel.prototype._addMoveButtons = function(oItem) {
		var oTableItem = oItem;
		if (!oTableItem){
			return;
		}
		var bItemSelected = this._getP13nModel().getProperty(oTableItem.getBindingContextPath())[this.PRESENCE_ATTRIBUTE];
		if (bItemSelected){
			oTableItem.getCells()[1].addItem(this._getMoveTopButton());
			oTableItem.getCells()[1].addItem(this._getMoveUpButton());
			oTableItem.getCells()[1].addItem(this._getMoveDownButton());
			oTableItem.getCells()[1].addItem(this._getMoveBottomButton());
		}
	};

	SelectionPanel.prototype.exit = function() {
		BasePanel.prototype.exit.apply(this, arguments);
		this._aInitializedFields = null;
		this._oHoveredItem = null;
		this._bShowFactory = null;
		this._sSearch = null;
		this._bShowSelected = null;
	};
	return SelectionPanel;
});
