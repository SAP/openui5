/*!
 * ${copyright}
 */
sap.ui.define([
	"./BasePanel",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/m/Column",
	"sap/m/Table",
	"sap/m/library",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/BadgeCustomData",
	"sap/m/Switch",
	"sap/m/Popover",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/OverflowToolbar",
	"sap/ui/model/Filter",
	"sap/base/util/merge",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Popup"
], (
	BasePanel,
	Label,
	ColumnListItem,
	HBox,
	VBox,
	Library,
	coreLibrary,
	Icon,
	Text,
	Column,
	Table,
	mLibrary,
	ToolbarSpacer,
	Button,
	BadgeCustomData,
	Switch,
	Popover,
	HorizontalLayout,
	VerticalLayout,
	OverflowToolbar,
	Filter,
	merge,
	InvisibleText,
	Popup
) => {
	"use strict";

	// shortcut for sap.ui.core.IconColor
	const {IconColor} = coreLibrary;

	// shortcut for sap.m.*
	const {
		ListKeyboardMode,
		FlexJustifyContent,
		FlexAlignItems,
		MultiSelectMode,
		ButtonType,
		ListType,
		PlacementType,
		BadgeAnimationType
	} = mLibrary;

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
	 * @since 1.96
	 * @alias sap.m.p13n.SelectionPanel
	 */
	const SelectionPanel = BasePanel.extend("sap.m.p13n.SelectionPanel", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * A short text describing the panel.
				 * <b>Note:</b> This text will only be displayed if the panel is being used in a <code>sap.m.p13n.Popup</code>.
				 */
				title: {
					type: "string",
					defaultValue: Library.getResourceBundleFor("sap.m").getText("p13n.DEFAULT_TITLE_SELECTION")
				},
				/**
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
					defaultValue: ""
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
				 *
				 * <b>Note:</b>: The <code>getIdForLabel</code> method can be imlplemented on the returned control instance
				 * to return a focusable children control to provide the <code>labelFor</code> reference for the associated text.
				 */
				itemFactory: {
					type: "function"
				},

				/**
				 * Defines the multi-selection mode for the inner list control.
				 */
				multiSelectMode: {
					type: "sap.m.MultiSelectMode",
					defaultValue: MultiSelectMode.ClearAll
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	BasePanel.prototype.REDUNDANT_ITEMS_ATTRIBUTE = "isRedundant";
	SelectionPanel.prototype.init = function() {
		BasePanel.prototype.init.apply(this, arguments);

		this.getModel(this.P13N_MODEL).setProperty("/showSelected", false);
		this.getModel(this.P13N_MODEL).setProperty("/hideDescriptions", true);

		this.getModel(this.LOCALIZATION_MODEL).setProperty("/showSelectedText", this._getResourceText("p13n.SHOW_SELECTED"));
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/hideDescriptionsText", this._getResourceText("p13n.HIDE_DESCRIPTIONS"));
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/fieldColumn", this._getResourceText("p13n.DEFAULT_DESCRIPTION"));
		if (this.isPropertyInitial("fieldColumn")) {
			this.bindProperty("fieldColumn", {
				model: this.LOCALIZATION_MODEL,
				path: `/fieldColumn`
			});
		}
	};

	SelectionPanel.prototype.applySettings = function() {
		BasePanel.prototype.applySettings.apply(this, arguments);
		this._setTemplate(this._getListTemplate());
		this.addStyleClass("sapMSelectionPanel");
		this._aInitializedFields = [];
		//Do not show the factory by default
		this._bShowFactory = false;
		this.addStyleClass("SelectionPanelHover");
		// needed for automatic localization of text when language is switched without refreshing the browser
		this._displayColumns();
		this._updateMovement(this.getEnableReorder());
		this._oListControl.setMultiSelectMode(this.getMultiSelectMode());
	};

	SelectionPanel.prototype.setMultiSelectMode = function(sMultiSelectMode) {
		this._oListControl.setMultiSelectMode(sMultiSelectMode);
		return this.setProperty("multiSelectMode", sMultiSelectMode);
	};

	SelectionPanel.prototype.setItemFactory = function(fnItemFactory) {
		this.setProperty("itemFactory", fnItemFactory);
		this._oListControl.setGrowing(!!fnItemFactory);
		return this;
	};

	SelectionPanel.prototype._getListTemplate = function() {
		const oColumnListItem = new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">" + this.PRESENCE_ATTRIBUTE + "}",
			type: {
				path: this.P13N_MODEL + ">" + this.PRESENCE_ATTRIBUTE,
				formatter: (bSelected) => {
					//In case the factory control is displayed, no move buttons are displayed --> item should be inactive
					//to avoid issues with the label for mechanism
					return bSelected && !this._bShowFactory ? ListType.Active : ListType.Inactive;
				}
			},
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
									if (bactive) {
										return true;
									} else {
										return false;
									}
								}
							}
						})
					]
				})
			]
		});

		if (this.getActiveColumn()) {
			// The active status is visiually represented as dot icon in the tabular view, for the screen reader it needs to be ensured
			// that a similar information is available without the UI. This InvisibleText will provide a text in the screen reader as:
			// "Active Field is active" & "Active Field is inactive" --> this should only be done in case the active column is being used
			const oActiveTextOutput = new InvisibleText({
				text: {
					path: this.P13N_MODEL + ">active",
					formatter: (bactive) => {
						return bactive ? this._getResourceText("p13n.ACTIVESTATE_ACTIVE") : this._getResourceText("p13n.ACTIVESTATE_INACTIVE");
					}
				}
			});

			oColumnListItem.getCells()[1].addItem(oActiveTextOutput);
		}

		return oColumnListItem;
	};

	SelectionPanel.prototype.setActiveColumn = function(sActiveText) {
		this.setProperty("activeColumn", sActiveText);
		this._setTemplate(this._getListTemplate()); //recreate template since its depending on this property
		this._displayColumns(); //update header texts in Table columns
		return this;
	};

	SelectionPanel.prototype.setFieldColumn = function(sFieldColumn) {
		this.setProperty("fieldColumn", sFieldColumn);
		this._displayColumns();
		return this;
	};

	SelectionPanel.prototype._getListFilterLayout = function() {
		const aP13nData = this.getP13nData() ?? [];
		const bHasRendundantColumns = aP13nData.some((oItem) => oItem[this.REDUNDANT_ITEMS_ATTRIBUTE]);

		if (!bHasRendundantColumns) {
			const oShowSelectedButton = new Button({
				press: (oEvt) => {
					const bShowSelected = this.getModel(this.P13N_MODEL).getProperty("/showSelected");
					this.getModel(this.P13N_MODEL).setProperty("/showSelected", !bShowSelected);
					this._triggerFilter();
					this._updateShowSelectedButton();
				},
				text: `{${this.LOCALIZATION_MODEL}>/showSelectedText}`
			});
			this._updateShowSelectedButton();

			return oShowSelectedButton;
		} else {
			const oFilterButton = new Button({
				icon: "sap-icon://filter",
				type: ButtonType.Transparent,
				press: (oEvt) => {
					this._getFilterPopover().openBy(oFilterButton);
				}
			});

			oFilterButton.addCustomData(new BadgeCustomData({
				key: "badge",
				value: {
					parts: [{
						path: this.P13N_MODEL + '>/showSelected'
					}, {
						path: this.P13N_MODEL + '>/hideDescriptions'
					}],
					formatter: (bShowSelected, bHideDescriptions) => {
						return [bShowSelected, bHideDescriptions].filter(Boolean).length;
					}
				},
				visible: true,
				animation: BadgeAnimationType.None
			}));

			const oFilterLayout = new HorizontalLayout({
				content: [
					oFilterButton
				]
			});

			return oFilterLayout;
		}

	};

	SelectionPanel.prototype.setShowHeader = function(bShowHeader) {
		if (bShowHeader) {
			this._oListControl.setHeaderToolbar(new OverflowToolbar({
				content: [
					this._getSearchField(),
					new ToolbarSpacer(),
					this._getListFilterLayout()
				]
			}));
		}
		this.setProperty("showHeader", bShowHeader);
		return this;
	};

	/**
	 * @param {Object} oEvt Event object
	 * @param {string} sPath Path of model property that should be updated
	 */
	SelectionPanel.prototype._triggerFilter = function() {
		const bShowSelected = this.getModel(this.P13N_MODEL).getProperty("/showSelected");
		const bHideDescriptions = this.getModel(this.P13N_MODEL).getProperty("/hideDescriptions");
		this._filterList(bShowSelected, this._sSearch, bHideDescriptions);
	};

	SelectionPanel.prototype._updateShowSelectedButton = function() {
		const sShowSelected = this._getResourceText("p13n.SHOW_SELECTED");
		const sShowAll = this._getResourceText("p13n.SHOW_ALL");

		const bShowSelected = this.getModel(this.P13N_MODEL).getProperty("/showSelected");
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/showSelectedText", bShowSelected ? sShowAll : sShowSelected);
	};

	SelectionPanel.prototype._getFilterPopover = function() {
		const oExistingPopover = this.getDependents().find((oDependent) => oDependent.isA("sap.m.Popover"));
		if (oExistingPopover) {
			return oExistingPopover;
		}

		const oShowSelectedText = new Label({
			text: `{${this.LOCALIZATION_MODEL}>/showSelectedText}`
		});
		oShowSelectedText.addStyleClass("sapMSelectionPanelFilters");

		const oHideDescriptionsText = new Label({
			text: `{${this.LOCALIZATION_MODEL}>/hideDescriptionsText}`
		});
		oHideDescriptionsText.addStyleClass("sapMSelectionPanelFilters");

		const oShowSelectedButton = new Switch({
			state: `{${this.P13N_MODEL}>/showSelected}`,
			ariaLabelledBy: oShowSelectedText,
			customTextOn: " ",
			customTextOff: " ",
			change: this._triggerFilter.bind(this)
		});

		const oHideDescriptionsButton = new Switch({
			state: `{${this.P13N_MODEL}>/hideDescriptions}`,
			ariaLabelledBy: oHideDescriptionsText,
			customTextOn: " ",
			customTextOff: " ",
			change: this._triggerFilter.bind(this)
		});

		const oHideDescriptionsContainer = new HBox({
			alignItems: FlexAlignItems.Center,
			items: [
				oHideDescriptionsText,
				oHideDescriptionsButton
			]
		});
		oHideDescriptionsContainer.addStyleClass("sapMSelectionPanelFiltersContainer");

		const oShowSelectedContainer = new HBox({
			alignItems: FlexAlignItems.Center,
			items: [
				oShowSelectedText,
				oShowSelectedButton
			]
		});
		oShowSelectedContainer.addStyleClass("sapMSelectionPanelFiltersContainer");

		const oPopoverLayout = new VBox({
			alignItems: FlexAlignItems.End,
			items: [oHideDescriptionsContainer, oShowSelectedContainer]
		});

		oPopoverLayout.addStyleClass("sapMSelectionPanelFiltersPopover");
		const _oFilterPopover = new Popover({
			title: this._getResourceText("p13n.FILTERS_POPOVER_TITLE"),
			placement: PlacementType.Bottom,
			content: [oPopoverLayout],
			beforeOpen: function (oEvt) {
				const source = oEvt.getSource();
				source.setFollowOf(true);
			},
			afterOpen: function (oEvt) {
				const source = oEvt.getSource();
				source.setFollowOf(false);
			}
		});

		this.addDependent(_oFilterPopover);

		return _oFilterPopover;
	};

	SelectionPanel.prototype.getSelectedFields = function() {
		const aSelectedItems = [];
		this._loopItems(this._oListControl, (oItem, sKey) => {
			if (oItem.getSelected()) {
				aSelectedItems.push(sKey);
			}
		});

		return aSelectedItems;
	};

	SelectionPanel.prototype._filterList = function(bShowSelected, sSearch, bHideRedundant) {
		const aFilter = [];

		if (bHideRedundant && bShowSelected) {
			const oFilter1 = new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true);
			const oFilter2 = new Filter(this.REDUNDANT_ITEMS_ATTRIBUTE, "NE", true);
			const oRedundantFilter = new Filter({filters: [oFilter1, oFilter2], and: true});
			aFilter.push(oRedundantFilter);
		} else if (bShowSelected) {
			const oSelectedFilter = new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true);
			aFilter.push(oSelectedFilter);
		} else if (bHideRedundant) {
			const oRedundantFilter = new Filter(this.REDUNDANT_ITEMS_ATTRIBUTE, "NE", true);
			aFilter.push(oRedundantFilter);
		}

		if (sSearch) {
			const oSearchFilter = new Filter("label", "Contains", sSearch);
			aFilter.push(oSearchFilter);
		}

		this._oListControl.getBinding("items").filter(new Filter(aFilter, true));
	};

	SelectionPanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		this._sSearch = oEvent.getSource().getValue();
		this._filterList(this.getModel(this.P13N_MODEL).getProperty("/showSelected"), this._sSearch, this.getModel(this.P13N_MODEL).getProperty("/hideDescriptions"));
	};

	SelectionPanel.prototype._handleActivated = function(oHoveredItem) {
		// remove move buttons
		// 1. if a new item is hovered OR
		// 1. if the item is not selected
		if (this._oHoveredItem !== oHoveredItem || !oHoveredItem.getMultiSelectControl()?.getSelected()) {
			this._removeMoveButtons();
		}

		// Check if the prior hovered item had a visible icon and renable it if required
		if (this._oHoveredItem && !this._oHoveredItem.bIsDestroyed && this._oHoveredItem.getBindingContextPath()) {
			const bVisible = !!this._getP13nModel().getProperty(this._oHoveredItem.getBindingContextPath()).active;
			const [oOldIcon] = this._oHoveredItem.getCells()[1].getItems();
			oOldIcon.setVisible(bVisible);
		}
		// Store (new) hovered item and set its icon to visible: false + add move buttons to it
		const oIcon = oHoveredItem.getCells()[1]?.getItems()[0];
		if (oHoveredItem.getSelected() && oIcon) {
			oIcon.setVisible(false);
		}

		// SNOW: DINC0433588:
		// We call _handleActivated also when the hover state WITHIN a CustomListItem changes.
		// However, the oHoveredItem is still the same ColumnListItem.
		// If no selection change was done and the hoveredItem is still the same, we assume that the focus changed within a ColumnListItem.
		// Hence, there is no need to add the move buttons again as they were already added previously.

		// do not update anything or proceed to add the buttons:
		// 1. if hover state has not changed (same item is still hovered) AND
		// 2. if no selection change was done (same item is still hovered and was neither selected nor deselected) AND
		// 3. if the hovered item is enabled (move buttons are already there, hence there is no need to add them again: SNOW: DINC0433588)
		if (this._oHoveredItem === oHoveredItem &&
			this._oLastSelectedItem !== oHoveredItem &&
			oHoveredItem.getMultiSelectControl()?.getEnabled()
		) {
			return;
		}


		// if not the same,
		// if same, proceed to: add buttons

		this._oHoveredItem = oHoveredItem;
		this._oLastSelectedItem = null;
		// 1. if checkbox is enabled (disabled checkbox might be the case for rta for ActionToolbar) AND
		// 2. if checkbox is selected
		// 3. OR if there is not checkbox
		if ((oHoveredItem.getMultiSelectControl()?.getEnabled() &&
			oHoveredItem.getMultiSelectControl()?.getSelected()) ||
			!oHoveredItem.getMultiSelectControl()) {
			this._updateEnableOfMoveButtons(oHoveredItem, false);
			this._addMoveButtons(oHoveredItem);
		}
	};

	SelectionPanel.prototype._removeMoveButtons = function() {
		const oMoveButtonBox = this._getMoveButtonContainer();
		if (oMoveButtonBox) {
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
		) {
			return this._oMoveBottomButton.getParent();
		}
	};

	SelectionPanel.prototype.showFactory = function(bShow) {
		this._bShowFactory = bShow;
		this._displayColumns();

		this._oListControl.getItems().forEach((oItem) => {
			oItem.setType(bShow ? "Inactive" : "Active");
		});

		if (bShow) {
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
		oList.getItems().forEach((oItem) => {

			const sPath = oItem.getBindingContextPath();
			const sKey = this._getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		});
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

		// this is needed for updating the header toolbar of the table
		this.setShowHeader(this.getShowHeader());
		const bHasRedundantColumns = aP13nData.some((oItem) => oItem[this.REDUNDANT_ITEMS_ATTRIBUTE]);
		if (bHasRedundantColumns) {
			this._triggerFilter();
		}
		return this;
	};

	SelectionPanel.prototype.onReset = function() {
		BasePanel.prototype.onReset.apply(this, arguments);
		this._sSearch = "";
		this.getModel(this.P13N_MODEL).setProperty("/showSelected", false);
		this._updateShowSelectedButton();
	};

	SelectionPanel.prototype._updateCount = function() {
		this._getP13nModel().setProperty("/selectedItems", this._oListControl.getSelectedContexts(true).length);
	};

	SelectionPanel.prototype._selectTableItem = function(oTableItem, bSelectAll) {
		BasePanel.prototype._selectTableItem.apply(this, arguments);
		this._updateCount();
	};

	SelectionPanel.prototype._removeFactoryControl = function() {
		this._oListControl.getItems().forEach((oItem) => {
			const oFirstCell = oItem.getCells()[0];
			if (oFirstCell.getItems().length > 1) {
				oFirstCell.removeItem(oFirstCell.getItems()[1]);
			}
		});
		this.removeStyleClass("sapUiMDCAFLabelMarkingList");
		return this._aInitializedFields;
	};

	SelectionPanel.prototype._moveSelectedItem = function(){
		this._oSelectedItem = this._getMoveButtonContainer()?.getParent();
		BasePanel.prototype._moveSelectedItem.apply(this, arguments);
	};

	SelectionPanel.prototype._getShowFactory = function() {
		return this._bShowFactory;
	};

	SelectionPanel.prototype._updateMovement = function(bEnableReorder) {
		BasePanel.prototype._updateMovement.apply(this, arguments);
		this._displayColumns();
	};

	SelectionPanel.prototype._displayColumns = function() {
		const aColumns = [
			this.getFieldColumn()
		];
		const bShowActiveColumn = this.getEnableReorder() || this.getActiveColumn();
		if (!this._bShowFactory && bShowActiveColumn) {
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
		const bEnableCount = this.getEnableCount();
		if (bEnableCount) {
			const oColumn = new Column({
				header: new Text({
					text: {
						parts: [{
							path: this.P13N_MODEL + '>/selectedItems'
						}, {
							path: this.P13N_MODEL + '>/items'
						}],
						formatter: (iSelected, aAll) => {
							return this._sText + " " + this._getResourceText('p13n.HEADER_COUNT', [
								iSelected, aAll instanceof Array ? aAll.length : 0
							]);
						}
					}
				})
			});
			aColumns[0] = oColumn;
		}
		BasePanel.prototype._setPanelColumns.apply(this, arguments);
	};

	SelectionPanel.prototype._addFactoryControl = function(oList) {
		this._oListControl.getItems().forEach((oItem) => {
			const oContext = oItem.getBindingContext(this.P13N_MODEL);
			const oField = this.getItemFactory().call(this, oContext);

			//set 'labelFor'
			const oFirstCell = oItem.getCells()[0];
			const oLabel = oFirstCell.getItems()[0];
			if (oLabel) {
				oLabel.setLabelFor(oField);
			}

			oFirstCell.addItem(oField);
		});
		this.addStyleClass("sapUiMDCAFLabelMarkingList");
	};

	SelectionPanel.prototype._createInnerListControl = function() {
		const oTable = new Table(this.getId() + "-innerSelectionPanelTable", Object.assign({
			growing: false,
			growingThreshold: 25,
			growingScrollToLoad: true,
			updateStarted: () => {
				this._removeMoveButtons();
				this._removeFactoryControl();
			},
			updateFinished: () => {
				if (this._getShowFactory()) {
					this._addFactoryControl();
				}
			}
		}, this._getListControlConfig()));

		// this is required to update the reorder buttons very early. Otherwise a screenreader might not announce the correct cell content.
		const orgFocusIn = oTable.onItemFocusIn;
		oTable.onItemFocusIn = function(oItem, oFocusedControl) {
			if (this.getEnableReorder()) {
				this._handleActivated(oItem);
			}

			orgFocusIn.apply(oTable, arguments);
		}.bind(this);

		return oTable;
	};

	SelectionPanel.prototype.filterContent = function(aFilter) {
		if (this._oListControl.getBinding("items")) {
			this._oListControl.getBinding("items").filter(aFilter, true);
		}
	};

	SelectionPanel.prototype._addMoveButtons = function(oItem) {
		const oTableItem = oItem;
		if (!oTableItem) {
			return;
		}
		const bItemSelected = this._getP13nModel().getProperty(oTableItem.getBindingContextPath())[this.PRESENCE_ATTRIBUTE];
		if (bItemSelected) {
			oTableItem.getCells()[1].addItem(this._getMoveTopButton());
			oTableItem.getCells()[1].addItem(this._getMoveUpButton());
			oTableItem.getCells()[1].addItem(this._getMoveDownButton());
			oTableItem.getCells()[1].addItem(this._getMoveBottomButton());
		}
	};

	SelectionPanel.prototype._updateLocalizationTexts = function() {
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/showSelectedText", this._getResourceText("p13n.SHOW_SELECTED"));
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/showAllText", this._getResourceText("p13n.SHOW_ALL"));
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/hideDescriptionsText", this._getResourceText("p13n.HIDE_DESCRIPTIONS"));
		this.getModel(this.LOCALIZATION_MODEL).setProperty("/fieldColumn", this._getResourceText("p13n.DEFAULT_DESCRIPTION"));
		this._updateShowSelectedButton();
	};

	SelectionPanel.prototype.exit = function() {
		BasePanel.prototype.exit.apply(this, arguments);
		this._aInitializedFields = null;
		this._oHoveredItem = null;
		this._bShowFactory = null;
		this._sSearch = null;
	};
	return SelectionPanel;
});