/*!
 * ${copyright}
 */

// Provides control sap.m.P13nColumnsPanel.
sap.ui.define(['jquery.sap.global', './ColumnListItem', './P13nColumnItem', './P13nPanel', './SearchField', './Table', './library', 'sap/ui/model/Filter'],
	function(jQuery, ColumnListItem, P13nColumnItem, P13nPanel, SearchField, Table, library, Filter) {
	"use strict";


	
	/**
	 * Constructor for a new P13nColumnsPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The ColumnsPanel can be used for personalization of the table to define column specific settings
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.P13nColumnsPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nColumnsPanel = P13nPanel.extend("sap.m.P13nColumnsPanel", /** @lends sap.m.P13nColumnsPanel.prototype */ { metadata : {
	
		library : "sap.m",
		events : {
	
			/**
			 * This event is called as soon as an item in the table shall be moved in the table
			 */
			moveItem : {
				parameters : {
	
					/**
					 * old item
					 */
					oldItem : {type : "sap.m.P13nColumnItem"}, 
	
					/**
					 * new item
					 */
					newItem : {type : "sap.m.P13nColumnItem"}
				}
			}
		}
	}});
	
	///**
	// * This file defines behavior for the ColumnsPanel control,
	// */
	
	/* =========================================================== */
	/* Private methods and properties */
	/* =========================================================== */
	
	/**
	 * reset selection
	 * 
	 * @private
	 * @name sap.m.ColumnsPanel#resetAll
	 * @function
	 */
	P13nColumnsPanel.prototype._resetAll = function() {
		// Clear search field + internal state that search is active
		this._oSearchField.clear();
		this._bSearchFilterActive = false;
	
		// Reset internal model to the origin
		if (this._oModelData4ResetAll) {
			this._oTable.removeSelections();
			this._oTable.getModel().setJSON(this._oModelData4ResetAll);
			this._updateSelectAllDescription();
		}
	
		// Remove highlighting from selected item
		if (this._oSelectedItem !== null && this._oSelectedItem !== undefined) {
			this._removeHighLightingFromItem(this._oSelectedItem);
		}
	
		// deactivate item move buttons
		this._oSelectedItem = null;
		this._calculateMoveButtonAppearance();
	};
	
	/**
	 * Move selected item to begin of the item list
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveToStart = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1;
	
		if (this._oSelectedItem) {
	
			// Determine new and old item index
			iOldItemIndex = this._getItemIndexByItemKey(this._oSelectedItem);
	
			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex > 0) {
				iNewItemIndex = 0;
			}
	
			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};
	
	/**
	 * Move selected item one position up
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveUp = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1;
	
		if (this._oSelectedItem) {
	
			// Determine new and old item index
			iOldItemIndex = this._getItemIndexByItemKey(this._oSelectedItem);
	
			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex > 0) {
				iNewItemIndex = iOldItemIndex - 1;
			}
	
			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};
	
	/**
	 * Move selected item one position down
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveDown = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1;
		var iTableMaxIndex = null;
	
		if (this._oSelectedItem) {
			iTableMaxIndex = this._oTable.getItems().length;
	
			// Determine new and old item index
			iOldItemIndex = this._getItemIndexByItemKey(this._oSelectedItem);
	
			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex < iTableMaxIndex - 1) {
				iNewItemIndex = iOldItemIndex + 1;
			}
	
			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};
	
	/**
	 * Move selected item to end of the item list
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._ItemMoveToEnd = function() {
		var iOldItemIndex = -1, iNewItemIndex = -1;
		var iTableMaxIndex = null;
	
		if (this._oSelectedItem) {
			iTableMaxIndex = this._oTable.getItems().length;
	
			// Determine new and old item index
			iOldItemIndex = this._getItemIndexByItemKey(this._oSelectedItem);
	
			iNewItemIndex = iOldItemIndex;
			if (iOldItemIndex < iTableMaxIndex) {
				iNewItemIndex = iTableMaxIndex - 1;
			}
	
			// apply new item index
			if (iNewItemIndex != -1 && iOldItemIndex != -1 && iOldItemIndex != iNewItemIndex) {
				this._moveItem(iOldItemIndex, iNewItemIndex);
			}
		}
	};
	
	/**
	 * Moves a given table item from old table index to a new given table index
	 * 
	 * @private
	 * @param {integer}
	 *            iOldIndex is the item start index
	 * @param {integer}
	 *            iNewIndex is the item target index
	 */
	P13nColumnsPanel.prototype._moveItem = function(iOldIndex, iNewIndex) {
		var aModelItems = null;
		var iLength = -1;
	
		if (iOldIndex !== null && iNewIndex !== null && iOldIndex != iNewIndex) {
			aModelItems = this._oTable.getItems();
			if (aModelItems && aModelItems.length) {
				iLength = aModelItems.length;
	
				// Boundary check
				if (iOldIndex > -1 && iOldIndex <= iLength - 1 && iNewIndex > -1 && iNewIndex <= iLength - 1) {
	
					this.fireEvent('moveItem', {
						oldItem: this._oSelectedItem,
						newItem: aModelItems[iNewIndex]
					});
				}
			}
		}
	};
	
	/**
	 * After an items was moved renewal selected items instance and it's selection
	 * 
	 * @private
	 * @param {P13nColumnItem}
	 *            oOldItem is the old item (item that was marked and that shall be moved)
	 * @param {P13nColumnItem}
	 *            oNewItem is the new item (item that shall take over the whole content from old item) 
	 */
	P13nColumnsPanel.prototype._afterMoveItem = function(oOldItem, oNewItem) {
		if (oOldItem !== null && oNewItem !== null) {
			this._removeHighLightingFromItem(oOldItem);
			this._oSelectedItem = oNewItem;
			this._setHighLightingToItem(oNewItem);
			this._scrollToSelectedItem(oNewItem);
			this._calculateMoveButtonAppearance();
		}
	};
	
	
	/**
	 * Swop "Show Selected" button to "Show All"
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._swopShowSelectedButton = function() {
		var sNewButtonText;
	
		// Swop the button text
		this._bShowSelected = !this._bShowSelected;
		if (this._bShowSelected) {
			sNewButtonText = this._oRb.getText('COLUMNSPANEL_SHOW_ALL');
		} else {
			sNewButtonText = this._oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
		}
		this._oShowSelectedButton.setText(sNewButtonText);
		this._filterItems();
		this._fnHandleResize();
	};
	
	/**
	 * Filters items by its selection status
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._filterItems = function() {
		var aSelectedItems = null, aTableItems = null;
		var iLength = 0, jLength = 0, i = 0, j = 0;
		var oItem = null, oItemTemplate = null;
		var bItemVisibleBySearchText, bItemVisibleBySelection;
		var sItemText = null, sSearchText = null;
	
		// Get table items according "Show Selected" button status
		if (this._bShowSelected) {
			aSelectedItems = this._oTable.getSelectedItems();
		} else {
			aSelectedItems = this._oTable.getItems();
		}
	
		// Get search filter value
		if (this._bSearchFilterActive) {
			sSearchText = this._oSearchField.getValue();
		}
	
		aTableItems = this._oTable.getItems();
		iLength = aTableItems.length;
		for (i = 0; i < iLength; i++) {
			oItem = aTableItems[i];
			bItemVisibleBySearchText = true;
			bItemVisibleBySelection = false;
	
			// Is filtering via search text active
			if (this._bSearchFilterActive) {
				bItemVisibleBySearchText = false;
				sItemText = oItem.getCells()[0].getText();
				if (sItemText) {
					if (sItemText.indexOf(sSearchText) > -1) {
						bItemVisibleBySearchText = true;
					}
				}
			}
			// Is filtering via selection active
			jLength = aSelectedItems.length;
			for (j = 0; j < jLength; j++) {
				oItemTemplate = aSelectedItems[j];
				if (oItemTemplate) {
					if (oItemTemplate.getId() == oItem.getId()) {
						bItemVisibleBySelection = true;
						break;
					}
				}
			}
			oItem.setVisible(bItemVisibleBySelection && bItemVisibleBySearchText);
		}
	};
	
	/**
	 * Filters the columns list with the given sValue
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._executeSearch = function() {
		var sValue = this._oSearchField.getValue();
		var iLength = sValue.length || 0;
	
		if (iLength > 0) {
			this._bSearchFilterActive = true;
			this._deactivateSelectedItem();
		} else {
			this._bSearchFilterActive = false;
		}
	
		this._filterItems();
	};
	
	/**
	 * Update Select All column count information
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._updateSelectAllDescription = function(oEvent) {
		var iTableItems = this._oTable.getItems().length;
		var iSelectedContexts = this._oTable.getSelectedContexts(true).length;
		var sSelectAllText = null;
	
		// update the selection label
		var oColumn = this._oTable.getColumns()[0];
		if (oColumn) {
			sSelectAllText = this._oRb.getText('COLUMNSPANEL_SELECT_ALL');
			if (iSelectedContexts && iSelectedContexts > 0) {
				sSelectAllText = this._oRb.getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [ iSelectedContexts, iTableItems ]);
			}
			oColumn.getHeader().setText(sSelectAllText);
		}
	
		if (this._bShowSelected) {
			this._filterItems();
		}
	};
	
	/**
	 * Item press behavior is called as soon as a table item is selected
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._itemPressed = function(oEvent) {
		var oNewSelectedItem = null;
	
		if (this._bSearchFilterActive === true) {
			return;
		}
	
		// Remove highlighting from previous item
		if (this._oSelectedItem !== null && this._oSelectedItem !== undefined) {
			this._removeHighLightingFromItem(this._oSelectedItem);
		}
	
		// Set highlighting to just selected item (only in case it is not already selected -> then do nothing)
		oNewSelectedItem = oEvent.getParameter('listItem');
		if (oNewSelectedItem != this._oSelectedItem) {
			this._oSelectedItem = oNewSelectedItem;
			this._setHighLightingToItem(this._oSelectedItem);
		} else {
			this._oSelectedItem = null;
		}
	
		// Calculate move button appearance
		this._calculateMoveButtonAppearance();
	};
	
	/**
	 * Calculates the Appearance of the move button depending of selected item instance
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._calculateMoveButtonAppearance = function() {
		var aModelItems = null;
		var iLength = -1, iItemIndex = -1;
		var bMoveUp = false, bMoveDown = false;
	
		// Now appearance status of the buttons
		if (this._oSelectedItem !== null && this._oSelectedItem !== undefined) {
			iItemIndex = this._getItemIndexByItemKey(this._oSelectedItem);
	
			if (iItemIndex !== -1) {
				aModelItems = this._oTable.getItems();
				if (aModelItems && aModelItems.length) {
					iLength = aModelItems.length;
				}
	
				// Minimum border
				if (iItemIndex === 0) {
					bMoveDown = true;
				} else if (iItemIndex === iLength - 1) {
					// Maximum border
					bMoveUp = true;
				} else if (iItemIndex > 0 && iItemIndex < iLength - 1) {
					bMoveDown = true;
					bMoveUp = true;
				}
			}
		} else {
			bMoveUp = bMoveDown = false;
		}
	
		// Now change real appearance of the buttons
		if (this._oMoveToStartButton.getEnabled() !== bMoveUp) {
			this._oMoveToStartButton.setEnabled(bMoveUp);
			this._oMoveToStartButton.rerender();
		}
		if (this._oMoveUpButton.getEnabled() !== bMoveUp) {
			this._oMoveUpButton.setEnabled(bMoveUp);
			this._oMoveUpButton.rerender();
		}
		if (this._oMoveDownButton.getEnabled() !== bMoveDown) {
			this._oMoveDownButton.setEnabled(bMoveDown);
			this._oMoveDownButton.rerender();
		}
		if (this._oMoveToEndButton.getEnabled() !== bMoveDown) {
			this._oMoveToEndButton.setEnabled(bMoveDown);
			this._oMoveToEndButton.rerender();
		}
	};
	
	/**
	 * Set highlighting to an item
	 * 
	 * @private
	 * @param {object}
	 *            oItem is that item that shall be highlighted
	 */
	P13nColumnsPanel.prototype._setHighLightingToItem = function(oItem) {
		if (oItem !== null && oItem !== undefined && oItem.addStyleClass) {
			oItem.addStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};
	
	/**
	 * Remove highlighting from an item
	 * 
	 * @private
	 * @param {object}
	 *            oItem is that item that where highlighting shall be removed from
	 */
	P13nColumnsPanel.prototype._removeHighLightingFromItem = function(oItem) {
		if (oItem !== null && oItem !== undefined && oItem.removeStyleClass) {
			oItem.removeStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};
	
	/**
	 * Deactivate selected items for any movements & all move buttons
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._deactivateSelectedItem = function() {
		if (this._oSelectedItem) {
			this._removeHighLightingFromItem(this._oSelectedItem);
			this._oSelectedItem = null;
			this._calculateMoveButtonAppearance();
		}
	};
	
	/**
	 * Delivers the index of an item that is identified by its key
	 * 
	 * @private
	 * @param {object}
	 *            oItem is the item for that the index shall be identified
	 * @returns {integer} is the index of the identified item
	 */
	P13nColumnsPanel.prototype._getItemIndexByItemKey = function(oItem) {
		var iResult = -1;
		var iLength = 0, i = 0;
		var aTableItems = null, oTableItem = null, sItemKey = null, sTableItemKey = null;
	
		if (oItem !== null && oItem !== undefined && oItem.getKey) {
			sItemKey = oItem.getKey();
			if (sItemKey !== null && sItemKey !== undefined && sItemKey !== "") {
	
				aTableItems = this._oTable.getItems();
				if (aTableItems && aTableItems.length) {
					iLength = aTableItems.length;
					for (i = 0; i < iLength; i++) {
						sTableItemKey = null;
						oTableItem = aTableItems[i];
						if (oTableItem && oTableItem.getKey) {
							sTableItemKey = oTableItem.getKey();
							if (sTableItemKey !== null && sTableItemKey !== undefined && sTableItemKey !== "") {
								if (sTableItemKey === sItemKey) {
									iResult = i;
									break;
								}
							}
						}
					}
				}
			}
		}
	
		return iResult;
	};
	
	/**
	 * Clears the model storage, which is used in case of Reset
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._clearModelStorage = function() {
		if (this._oModelData4ResetAll !== null) {
			this._oModelData4ResetAll = null;
		}
	};
	
	/**
	 * Scroll table content to given item
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype._scrollToSelectedItem = function(oItem) {
		var iMinHeight, iElementOffset, iViewPortHeight, iViewPortStart, iViewPortEnd;
		if (oItem) {
			sap.ui.getCore().applyChanges();
			// oItem needs to be rendered, otherwise we cannot perform necessary calculations
			if (!!oItem.getDomRef()) {
				iElementOffset = oItem.$().position().top;
				// this is the minimal height that should be visible from the selected item
				// 18 means 18px which corresponds to 3em
				iMinHeight = 18;
				iViewPortHeight = this._oScrollContainer.$().height();
				iViewPortStart = this._oScrollContainer.$().offset().top - this._oTable.$().offset().top;
				iViewPortEnd = iViewPortStart + iViewPortHeight;

				if (iElementOffset < iViewPortStart) {
					// selected item is above or below visible viewport -> scroll page to item
					this._oScrollContainer.scrollTo(0, Math.max(0, iViewPortStart - iViewPortHeight + iMinHeight));
				} else if (iElementOffset + iMinHeight > iViewPortEnd) {
					// selected item is above or below visible viewport -> scroll down a page (this is the height of the scroll container)
					this._oScrollContainer.scrollTo(0, iElementOffset);
				}
				// otherwise, the item is already within the scroll container's viewport, so no action is necessary
			}
		}
	};
	
	/* =========================================================== */
	/* Lifecycle methods */
	/* =========================================================== */
	
	/**
	 * Initialization hook.
	 * 
	 * @private
	 * @name sap.m.ColumnsPanel#init
	 * @function
	 */
	P13nColumnsPanel.prototype.init = function() {
		var iLiveChangeTimer = 0;
		var that = this;
		this._bOnAfterRenderingFirstTimeExecuted = false;
	
		// Call-back for handling of resizing
		// TODO: make sure we optimize calculation and respect margins and borders, use e.g. jQuery.outerHeight(true)
		this._fnHandleResize = function() {
			if (that.getParent) {
				var oParent = that.getParent();
				var $dialogCont = jQuery("#" + oParent.getId() + "-cont");
				if ($dialogCont.children().length > 0 && that._oToolbar.$().length > 0) {
					var iContentHeight = $dialogCont.children()[0].clientHeight;
					var iHeaderHeight = that._oToolbar ? that._oToolbar.$()[0].clientHeight : 0;
					that._oScrollContainer.setHeight((iContentHeight - iHeaderHeight) + 'px');
				}
			}
		};
	
		// Resource bundle, for texts
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	
		this._oMoveToStartButton = new sap.m.Button({
			icon: sap.ui.core.IconPool.getIconURI("collapse-group"),
			press: function() {
				that._ItemMoveToStart();
			}
		});
	
		this._oMoveUpButton = new sap.m.Button({
			icon: sap.ui.core.IconPool.getIconURI("slim-arrow-up"),
			press: function() {
				that._ItemMoveUp();
			}
		});
	
		this._oMoveDownButton = new sap.m.Button({
			icon: sap.ui.core.IconPool.getIconURI("slim-arrow-down"),
			press: function() {
				that._ItemMoveDown();
			}
		});
	
		this._oMoveToEndButton = new sap.m.Button({
			icon: sap.ui.core.IconPool.getIconURI("expand-group"),
			press: function() {
				that._ItemMoveToEnd();
			}
		});
	
		this._oResetAllButton = new sap.m.Button({
			text: this._oRb.getText('COLUMNSPANEL_RESET'),
			press: function() {
				that._resetAll();
			}
		});
	
		this._oShowSelectedButton = new sap.m.Button({
			text: this._oRb.getText('COLUMNSPANEL_SHOW_SELECTED'),
			press: function() {
				that._swopShowSelectedButton();
			}
		});
		this._bShowSelected = false;
		this._bSearchFilterActive = false;
	
		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			width: "100%",
			liveChange: function(oEvent) {
				var sValue = oEvent.getSource().getValue(), iDelay = (sValue ? 300 : 0); // no delay if value is empty
	
				// execute search after user stops typing for 300ms
				window.clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = window.setTimeout(function() {
						that._executeSearch();
					}, iDelay);
				} else {
					that._executeSearch();
				}
			},
			// execute the standard search
			search: function(oEvent) {
				that._executeSearch();
			}
		});
	
		this._oToolbar = new sap.m.Toolbar({
			active: true,
			design: sap.m.ToolbarDesign.Solid, // Transparent,
			content: [ this._oMoveToStartButton, this._oMoveUpButton, this._oMoveDownButton, this._oMoveToEndButton, this._oSearchField, this._oShowSelectedButton, this._oResetAllButton ]
		});
	
		this._oTable = new Table({
			// growing: false,
			// growingScrollToLoad: true,
			mode: sap.m.ListMode.MultiSelect,
			itemPress: function(oEvent) {
				that._itemPressed(oEvent);
			},
			selectionChange: function(oEvent) {
				that._updateSelectAllDescription(oEvent);
			},
			columns: [ new sap.m.Column({
				header: new sap.m.Text({
					text: this._oRb.getText('COLUMNSPANEL_SELECT_ALL')
				})
			}) ]
		});
	
		this._oScrollContainer = new sap.m.ScrollContainer({
			horizontal: false,
			vertical: true,
			content: [ this._oTable ],
			width: '100%',
			height: '100%'
		});
	
		this._oScrollContainer.setParent(this);
	};
	
	/**
	 * Required adaptations after rendering
	 * 
	 * @private
	 */
	P13nColumnsPanel.prototype.onAfterRendering = function() {
		var iLiveChangeTimer = 0;
		var that = this;
		var oData = null;

		// Execute following lines only if this control is started the first time!
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;

			// Save model data for reset
			if (this._oModelData4ResetAll === null || this._oModelData4ResetAll === undefined) {
				oData = this._oTable.getModel().getJSON();
				if (oData) {
					this._oModelData4ResetAll = oData;
				}
			}

			this._calculateMoveButtonAppearance();

			// Register call-back function for re-sizing
			sap.ui.Device.resize.attachHandler(this._fnHandleResize);

			// Re-size visible part of scroll container
			window.clearTimeout(iLiveChangeTimer);
			iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();
			}, 0);
		}

		this._updateSelectAllDescription();
	};
	
	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 * @name ColumnsPanel#exit
	 * @function
	 */
	P13nColumnsPanel.prototype.exit = function() {
	
		sap.ui.Device.resize.detachHandler(this._fnHandleResize);
	
		this._oMoveToStartButton.destroy();
		this._oMoveToStartButton = null;
	
		this._oMoveDownButton.destroy();
		this._oMoveDownButton = null;
	
		this._oMoveUpButton.destroy();
		this._oMoveUpButton = null;
	
		this._oMoveToEndButton.destroy();
		this._oMoveToEndButton = null;
	
		this._oSearchField.destroy();
		this._oSearchField = null;
	
		this._oToolbar.destroy();
		this._oToolbar = null;
	
		this._oTable.destroy();
		this._oTable = null;
	
		this._clearModelStorage();
	};
	
	/* =========================================================== */
	/* begin: forward aggregation methods to table */
	/* =========================================================== */
	
	/*
	 * Set the model for the internal table AND the current control so that both controls can be used with data binding
	 * 
	 * @public @param {sap.ui.Model} oModel the model that holds the data for the table @param {string} sName the optional model name
	 */
	P13nColumnsPanel.prototype.setModel = function(oModel, sModelName) {
		sap.m.P13nPanel.prototype.setModel.apply(this, arguments);
		this._oTable.setModel(oModel, sModelName);
	};
	
	/*
	 * Forwards a function call to a managed object based on the aggregation name. If the name is items, it will be forwarded to the table, otherwise called locally
	 * 
	 * @private @param {string} sFunctionName the name of the function to be called @param {string} sAggregationName the name of the aggregation asociated @returns
	 * {mixed} the return type of the called function
	 */
	P13nColumnsPanel.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var aArgs = Array.prototype.slice.call(arguments);
	
		if (sAggregationName === "items") {
			// apply to the internal table
			return this._oTable[sFunctionName].apply(this._oTable, aArgs.slice(1));
		} else {
			// apply to this control
			return sap.ui.base.ManagedObject.prototype[sFunctionName].apply(this, aArgs.slice(1));
		}
	};
	
	/**
	 * Forwards aggregations with the name of items or columns to the internal table.
	 * 
	 * @overwrite
	 * @public
	 * @param {string}
	 *            sAggregationName the name for the binding
	 * @param {object}
	 *            oBindingInfo the configuration parameters for the binding
	 * @returns {this} this pointer for chaining
	 */
	P13nColumnsPanel.prototype.bindAggregation = function() {
		var args = Array.prototype.slice.call(arguments);
	
		// propagate the bind aggregation function to list
		this._callMethodInManagedObject.apply(this, [ "bindAggregation" ].concat(args));
		return this;
	};
	
	P13nColumnsPanel.prototype.unbindAggregation = function() {
		var args = Array.prototype.slice.call(arguments);
	
		// propagate the unbind aggregation function to list
		this._callMethodInManagedObject.apply(this, [ "unbindAggregation" ].concat(args));
		return this;
	};
	
	P13nColumnsPanel.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};
	
	P13nColumnsPanel.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};
	
	P13nColumnsPanel.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};
	
	P13nColumnsPanel.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};
	
	P13nColumnsPanel.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};
	
	P13nColumnsPanel.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};
	
	P13nColumnsPanel.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};
	
	P13nColumnsPanel.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};
	
	P13nColumnsPanel.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};
	
	P13nColumnsPanel.prototype.getBinding = function(sAggregationName) {
		return this._callMethodInManagedObject("getBinding", sAggregationName);
	};
	
	P13nColumnsPanel.prototype.getBindingInfo = function(sAggregationName) {
		return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
	};
	
	P13nColumnsPanel.prototype.getBindingPath = function(sAggregationName) {
		return this._callMethodInManagedObject("getBindingPath", sAggregationName);
	};
	
	P13nColumnsPanel.prototype.getBindingContext = function(sModelName) {
		return this._oTable.getBindingContext(sModelName);
	};
	
	P13nColumnsPanel.prototype.removeSelections = function() {
		var args = Array.prototype.slice.call(arguments);
		return this._callMethodInManagedObject("removeSelections", 'items', args);
	};
	
	/*
	 * Set the binding context for the internal table AND the current control so that both controls can be used with the context
	 * 
	 * @overwrite @public @param {sap.ui.model.Context} oContext the new context @param {string} sModelName the optional model name @returns {this} this pointer for
	 * chaining
	 */
	P13nColumnsPanel.prototype._setBindingContext = P13nColumnsPanel.prototype.setBindingContext;
	P13nColumnsPanel.prototype.setBindingContext = function(oContext, sModelName) {
		var args = Array.prototype.slice.call(arguments);
	
		// pass the model to the list and also to the local control to allow binding of own properties
		this._oTable.setBindingContext(oContext, sModelName);
		P13nColumnsPanel.prototype._setBindingContext.apply(this, args);
	
		return this;
	};
	
	/* =========================================================== */
	/* end: forward aggregation methods to table */
	/* =========================================================== */

	return P13nColumnsPanel;

}, /* bExport= */ true);
