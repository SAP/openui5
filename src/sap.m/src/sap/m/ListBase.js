/*!
 * ${copyright}
 */

// Provides control sap.m.ListBase.
sap.ui.define(['jquery.sap.global', './GroupHeaderListItem', './library', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/theming/Parameters'],
	function(jQuery, GroupHeaderListItem, library, Control, ItemNavigation, Parameters) {
	"use strict";


	
	/**
	 * Constructor for a new ListBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * sap.m.ListBase Control provides a basic functionality of List and Table. Selection, deletion, unread states and inset style are also maintained here.
	 * 
	 * Note: The ListBase including all contained items is completely re-rendered when the data of a bound model is changed. Due to the limited hardware resources of mobile devices this can lead to longer delays for lists with many items. As such the usage of a list is not recommended for these use cases.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ListBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListBase = Control.extend("sap.m.ListBase", /** @lends sap.m.ListBase.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Inset style false/true
			 */
			inset : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * The header text appearing in the list/table header.
			 * Note: if "headerToolbar" aggregation is set, then this property is ignored.
			 */
			headerText : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * List header style. Possible vales are "Standard" and "Plain"
			 * @since 1.14
			 * @deprecated Since version 1.16. 
			 * Has no functionality since 1.16
			 */
			headerDesign : {type : "sap.m.ListHeaderDesign", group : "Appearance", defaultValue : sap.m.ListHeaderDesign.Standard, deprecated: true},
	
			/**
			 * Footer Text
			 */
			footerText : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Mode of a list (e.g. None, SingleSelect, MultiSelect, Delete, etc.)
			 */
			mode : {type : "sap.m.ListMode", group : "Behavior", defaultValue : sap.m.ListMode.None},
	
			/**
			 * Sets the width of the list.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
	
			/**
			 * This property decides if the list item interacts with the selection. If it is "true", a tap on the item will set the selection control in front of the list item.
			 */
			includeItemInSelection : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * Activates the unread feature for all items.
			 */
			showUnread : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * This text is displayed when the control has no data.
			 */
			noDataText : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Enables an information text(see "noDataText" property) when the control has no data.
			 */
			showNoData : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * When this property is set to "true", the List/Table will automatically display a BusyIndicator when it detects that data is being loaded or filtered. This BusyIndicator blocks the interaction with the items until data loading is finished.
			 * For the List/Table controls BusyIndicator will be shown after one second. This behavior can be customized by setting the "busyIndicatorDelay" property.
			 * When this property is set to "false", items will stay on the List/Table until data loading is finished.
			 * @since 1.20.2
			 */
			enableBusyIndicator : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * Defines if animations will be shown when activating or deactivating selection modes.
			 */
			modeAnimationOn : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Defines which separator style will be used.
			 */
			showSeparators : {type : "sap.m.ListSeparators", group : "Appearance", defaultValue : sap.m.ListSeparators.All},
	
			/**
			 * Direction of swipe(e.g LeftToRight, RightToLeft, Both) to bring in a control on the right hand side of the list item.
			 */
			swipeDirection : {type : "sap.m.SwipeDirection", group : "Misc", defaultValue : sap.m.SwipeDirection.Both},
	
			/**
			 * Sets the growing(paging) feature of control.
			 * Note: This feature only works when "items" aggregation is bound. Growing must not be used together with two-way binding!
			 * @since 1.16
			 */
			growing : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * Number of items requested from the server. To activate this you should set the "growing" property to "true".
			 * @since 1.16
			 */
			growingThreshold : {type : "int", group : "Misc", defaultValue : 20},
	
			/**
			 * This text is displayed on the trigger button which is responsible to load new page at the end of the list. The default is a translated text ("More") coming from the message bundle.
			 * This property can be used only if "growing" property is set "true"
			 * @since 1.16
			 */
			growingTriggerText : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * If true, user can scroll end to trigger a new page request. Otherwise a trigger button is displayed at the bottom of the list.
			 * This property can be used only if "growing" property is set "true" and if you only have one instance of this control inside the scroll container(e.g Page).
			 * @since 1.16
			 */
			growingScrollToLoad : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * By default, if you have binding then the control remembers selections after binding update(sorting, filter, refresh). If this is not a desired behavior for your use case, you can switch this off with setting it to "false".
			 * @since 1.16.6
			 */
			rememberSelections : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		defaultAggregation : "items",
		aggregations : {
	
			/**
			 * The items of this list or rows of the table.
			 */
			items : {type : "sap.m.ListItemBase", multiple : true, singularName : "item", bindable : "bindable"}, 
	
			/**
			 * User can swipe to bring in this control on the right hand side of a list item.
			 * Note: This functionality gets disabled for non-touch devices.
			 */
			swipeContent : {type : "sap.ui.core.Control", multiple : false}, 
	
			/**
			 * Header can be used as a Toolbar to add extra controls for user interactions.
			 * Note: This aggregation overwrites "headerText" property.
			 * @since 1.16
			 */
			headerToolbar : {type : "sap.m.Toolbar", multiple : false}, 
	
			/**
			 * InfoBar is placed below the header and can be used to show extra information to the user.
			 * @since 1.16
			 */
			infoToolbar : {type : "sap.m.Toolbar", multiple : false}
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.28.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events : {
	
			/**
			 * Event is fired when selection is changed by user interaction. In "multi-selection" mode, this event is also fired on "deselect"
			 * @deprecated Since version 1.16. 
			 * Instead use "selectionChange" event.
			 */
			select : {deprecated: true,
				parameters : {
	
					/**
					 * The list item which fired the select.
					 */
					listItem : {type : "sap.m.ListItemBase"}
				}
			}, 
	
			/**
			 * Event is fired when selection is changed via user interaction inside the control.
			 * @since 1.16
			 */
			selectionChange : {
				parameters : {
	
					/**
					 * The list item whose selection has changed. In "multi-selection" mode, only the up-most selected item is returned. This parameter can be used for single-selection modes.
					 */
					listItem : {type : "sap.m.ListItemBase"}, 
	
					/**
					 * This parameter is filled with array of list items whose selection has changed. This parameter can be used for multi-selection mode.
					 */
					listItems : {type : "sap.m.ListItemBase[]"}, 
	
					/**
					 * This flag indicates whether the "listItem" parameter is selected or not.
					 */
					selected : {type : "boolean"}
				}
			}, 
	
			/**
			 * Event is fired when delete icon is pressed by user.
			 */
			"delete" : {
				parameters : {
	
					/**
					 * The list item which fired the delete.
					 */
					listItem : {type : "sap.m.ListItemBase"}
				}
			}, 
	
			/**
			 * This event is fired when a user swipes to bring in a control and before swipeContent is shown on the right hand side of list item. So, you can easily change swipeContent according to swiped list item. Call the preventDefault method of the event object to disable swipe.
			 */
			swipe : {allowPreventDefault : true,
				parameters : {
	
					/**
					 * The listitem which fired the swipe.
					 */
					listItem : {type : "sap.m.ListItemBase"}, 
	
					/**
					 * Given swipeContent control to show on the right hand side of a list item.
					 */
					swipeContent : {type : "sap.ui.core.Control"}, 
	
					/**
					 * Holds which control caused the swipe event in within the Item.
					 */
					srcControl : {type : "sap.ui.core.Control"}
				}
			}, 
	
			/**
			 * This event is called when "growing" feature is enabled and before new page loaded.
			 * @since 1.16
			 * @deprecated Since version 1.16.3. 
			 * Instead, use "updateStarted" event.
			 */
			growingStarted : {deprecated: true,
				parameters : {
	
					/**
					 * Actual number of items.
					 */
					actual : {type : "int"}, 
	
					/**
					 * Total number of items.
					 */
					total : {type : "int"}
				}
			}, 
	
			/**
			 * This event is called when "growing" feature is enabled and after new page loaded and DOM updated.
			 * @since 1.16
			 * @deprecated Since version 1.16.3. 
			 * Instead, use "updateFinished" event.
			 */
			growingFinished : {deprecated: true,
				parameters : {
	
					/**
					 * Actual number of items.
					 */
					actual : {type : "int"}, 
	
					/**
					 * Total number of items.
					 */
					total : {type : "int"}
				}
			}, 
	
			/**
			 * This event is called before items binding is updated.
			 * Note: Event handler should not invalidate the control.
			 * @since 1.16.3
			 */
			updateStarted : {
				parameters : {
	
					/**
					 * The reason of update. Possible values are "Binding", "Filter", "Sort", "Growing", "Change", "Refresh", "Context"
					 */
					reason : {type : "string"}, 
	
					/**
					 * Actual number of items.
					 */
					actual : {type : "int"}, 
	
					/**
					 * The total count of bound items. This parameter can be used if "growing" feature is enabled.
					 */
					total : {type : "int"}
				}
			}, 
	
			/**
			 * This event is called after items binding and afterwards related DOM is updated.
			 * @since 1.16.3
			 */
			updateFinished : {
				parameters : {
	
					/**
					 * The reason of update. Possible values are "Binding", "Filter", "Sort", "Growing", "Change", "Refresh", "Context"
					 */
					reason : {type : "string"}, 
	
					/**
					 * Actual number of items.
					 */
					actual : {type : "int"}, 
	
					/**
					 * The total count of bound items. This parameter can be used if "growing" feature is enabled.
					 */
					total : {type : "int"}
				}
			}, 
	
			/**
			 * This event is called when an item is pressed regardless of the selection mode.
			 * NOTE: This event is fired for all kind of list items unless the item's type is "Inactive".
			 * @since 1.20
			 */
			itemPress : {
				parameters : {
	
					/**
					 * The list item which fired the pressed event.
					 * NOTE: This event is fired also for "GroupHeaderListItem" which does not have binding context.
					 */
					listItem : {type : "sap.m.ListItemBase"}, 
	
					/**
					 * The control which caused the press event within the container.
					 */
					srcControl : {type : "sap.ui.core.Control"}
				}
			}
		}
	}});
	
	
	// class name for the navigation items
	ListBase.prototype.sNavItemClass = "sapMLIB";
	
	ListBase.prototype.init = function() {
		this._oGrowingDelegate = null;
		this._bSelectionMode = false;
		this._bReceivingData = false;
		this._oSelectedItem = null;
		this._aSelectedPaths = [];
		this._aNavSections = [];
		this._bUpdating = false;
		this._bRendering = false;
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};
	
	ListBase.prototype.onBeforeRendering = function() {
		this._bRendering = true;
		this._aNavSections = [];
		this._removeSwipeContent();
	};
	
	ListBase.prototype.onAfterRendering = function() {
		this._bRendering = false;
		this._sLastMode = this.getMode();
		this._bItemNavigationInvalidated = true;
	};
	
	ListBase.prototype.exit = function () {
		this._oSelectedItem = null;
		this._aNavSections = [];
		this._aSelectedPaths = [];
		this._destroyGrowingDelegate();
		this._destroyItemNavigation();
	};
	
	// this gets called only with oData Model when first load or filter/sort
	ListBase.prototype.refreshItems = function(sReason) {
		// show loading mask first
		this._showBusyIndicator();
	
		if (this._oGrowingDelegate) {
			// inform growing delegate to handle
			this._oGrowingDelegate.refreshItems(sReason);
		} else {
			// if data multiple time requested during the ongoing request
			// UI5 cancels the previous requests then we should fire updateStarted once
			if (!this._bReceivingData) {
				// handle update started event
				this._updateStarted(sReason);
				this._bReceivingData = true;
			}
	
			// for flat list get all data
			this.refreshAggregation("items");
		}
	};
	
	// this gets called via JSON and oData model when binding is updated
	// if there is no data this should get called anyway
	// TODO: if there is a network error this will not get called
	// but we need to turn back to initial state
	ListBase.prototype.updateItems = function(sReason) {
		if (this._oGrowingDelegate) {
			// inform growing delegate to handle
			this._oGrowingDelegate.updateItems(sReason);
		} else {
			if (this._bReceivingData) {
				// if we are receiving the data this should be oDataModel
				// updateStarted is already handled before on refreshItems
				// here items binding is updated because data is came from server
				// so we can convert the flag for the next request
				this._bReceivingData = false;
			} else {
				// if data is not requested this should be JSON Model
				// data is already in memory and will not be requested
				// so we do not need to change the flag
				// this._bReceivingData should be always false
				this._updateStarted(sReason);
			}
	
			// for flat list update items aggregation
			this.updateAggregation("items");

			// items binding are updated
			this._updateFinished();
		}
	};
	
	ListBase.prototype.setBindingContext = function() {
		this._resetItemsBinding();
		return Control.prototype.setBindingContext.apply(this, arguments);
	};
	
	ListBase.prototype._bindAggregation = function(sName) {
		sName == "items" && this._resetItemsBinding();
		return Control.prototype._bindAggregation.apply(this, arguments);
	};
	
	ListBase.prototype.destroyItems = function() {
		this._oSelectedItem = null;
		return this.destroyAggregation("items");
	};
	
	ListBase.prototype.removeAllItems = function(sAggregationName) {
		this._oSelectedItem = null;
		return this.removeAllAggregation("items");
	};
	
	ListBase.prototype.removeItem = function(vItem) {
		var oItem = this.removeAggregation("items", vItem);
		if (oItem && oItem === this._oSelectedItem) {
			this._oSelectedItem = null;
		}
		return oItem;
	};
	
	ListBase.prototype.getItems = function(bReadOnly) {
		if (bReadOnly) {
			return this.mAggregations["items"] || [];
		}
		
		return this.getAggregation("items", []);
	};
	
	ListBase.prototype.getId = function(sSuffix) {
		var sId = this.sId;
		return sSuffix ? sId + "-" + sSuffix : sId;
	};
	
	ListBase.prototype.setGrowing = function(bGrowing) {
		bGrowing = !!bGrowing;
		if (this.getGrowing() != bGrowing) {
			this.setProperty("growing", bGrowing, !bGrowing);
			if (bGrowing) {
				jQuery.sap.require("sap.m.GrowingEnablement");
				this._oGrowingDelegate = new sap.m.GrowingEnablement(this);
			} else if (this._oGrowingDelegate) {
				this._oGrowingDelegate.destroy();
				this._oGrowingDelegate = null;
			}
		}
		return this;
	};
	
	ListBase.prototype.setGrowingThreshold = function(iThreshold) {
		return this.setProperty("growingThreshold", iThreshold, true);
	};
	
	ListBase.prototype.setEnableBusyIndicator = function(bEnable) {
		this.setProperty("enableBusyIndicator", bEnable, true);
		if (!this.getEnableBusyIndicator()) {
			this._hideBusyIndicator();
		}
		return this;
	};
	
	ListBase.prototype.setNoDataText = function(sNoDataText) {
		this.setProperty("noDataText", sNoDataText, true);
		this.$("nodata-text").text(this.getNoDataText());
		return this;
	};
	
	ListBase.prototype.getNoDataText = function(bCheckBusy) {
		// check busy state
		if (bCheckBusy && this._bBusy) {
			return "";
		}
	
		// return no data text from resource bundle when there is no custom
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_NO_DATA");
		return sNoDataText;
	};
	

	/**
	 * Returns selected list item. When no item is selected, "null" is returned. When "multi-selection" is enabled and multiple items are selected, only the up-most selected item is returned.
	 *
	 * @type sap.m.ListItemBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.getSelectedItem = function() {
		var aItems = this.getItems(true);
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getSelected()) {
				return aItems[i];
			}
		}
		return null;
	};
	

	/**
	 * Selects or deselects the given list item.
	 *
	 * @param {sap.m.ListItemBase} oListItem
	 *         The list item whose selection to be changed. This parameter is mandatory.
	 * @param {boolean} bSelect
	 *         Sets selected status of the list item. Default value is true.
	 * @type sap.m.ListBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.setSelectedItem = function(oListItem, bSelect, bFireEvent) {
		if (this.indexOfItem(oListItem) < 0) {
			jQuery.sap.log.warning("setSelectedItem is called without valid ListItem parameter on " + this);
			return;
		}
		if (this._bSelectionMode) {
			oListItem.setSelected((bSelect === undefined) ? true : !!bSelect);
			bFireEvent && this._fireSelectionChangeEvent([oListItem]);
		}
	};
	

	/**
	 * Returns an array containing the selected list items. If no items are selected, an empty array is returned.
	 *
	 * @type sap.m.ListItemBase[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.getSelectedItems = function() {
		return this.getItems(true).filter(function(oItem) {
			return oItem.getSelected();
		});
	};
	

	/**
	 * Sets a list item to be selected by id. In single mode the method removes the previous selection.
	 *
	 * @param {string} sId
	 *         The id of the list item whose selection to be changed.
	 * @param {boolean} bSelect
	 *         Sets selected status of the list item. Default value is true.
	 * @type sap.m.ListBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.setSelectedItemById = function(sId, bSelect) {
		var oListItem = sap.ui.getCore().byId(sId);
		return this.setSelectedItem(oListItem, bSelect);
	};
	

	/**
	 * Returns the binding contexts of the selected items.
	 * Note: This method returns an empty array if no databinding is used.
	 *
	 * @param {boolean} bAll
	 *         Set true to include even invisible selected items(e.g. the selections from the previous filters).
	 *         Note: In single selection modes, only the last selected item's binding context is returned in array.
	 * @type object[]
	 * @public
	 * @since 1.18.6
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.getSelectedContexts = function(bAll) {
		var oBindingInfo = this.getBindingInfo("items"),
			sModelName = (oBindingInfo || {}).model,
			oModel = this.getModel(sModelName);
	
		// only deal with binding case
		if (!oBindingInfo || !oModel) {
			return [];
		}
	
		// return binding contexts from all selection paths
		if (bAll && this.getRememberSelections()) {
			return this._aSelectedPaths.map(function(sPath) {
				return oModel.getContext(sPath);
			});
		}
	
		// return binding context of current selected items
		return this.getSelectedItems().map(function(oItem) {
			return oItem.getBindingContext(sModelName);
		});
	};
	

	/**
	 * Removes visible selections of the current selection mode.
	 *
	 * @param {boolean} bAll
	 *         Since version 1.16.3. This control keeps old selections after filter or sorting. Set this parameter "true" to remove all selections.
	 * @type sap.m.ListBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.removeSelections = function(bAll, bFireEvent, bDetectBinding) {
		var aChangedListItems = [];
		this._oSelectedItem = null;
		bAll && (this._aSelectedPaths = []);
		this.getItems(true).forEach(function(oItem) {
			if (!oItem.getSelected()) {
				return;
			}
			
			// if the selected property is two-way bound then we do not need to update the selection
			if (bDetectBinding && oItem.isSelectedBoundTwoWay()) {
				return;
			}
			
			oItem.setSelected(false, true);
			aChangedListItems.push(oItem);
			!bAll && this._updateSelectedPaths(oItem);
		}, this);
	
		if (bFireEvent && aChangedListItems.length) {
			this._fireSelectionChangeEvent(aChangedListItems);
		}
		return this;
	};
	

	/**
	 * Select all items in "MultiSelection" mode.
	 *
	 * @type sap.m.ListBase
	 * @public
	 * @since 1.16
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.selectAll = function (bFireEvent) {
		if (this.getMode() != "MultiSelect") {
			return this;
		}
	
		var aChangedListItems = [];
		this.getItems(true).forEach(function(oItem) {
			if (!oItem.getSelected()) {
				oItem.setSelected(true, true);
				aChangedListItems.push(oItem);
				this._updateSelectedPaths(oItem);
			}
		}, this);
	
		if (bFireEvent && aChangedListItems.length) {
			this._fireSelectionChangeEvent(aChangedListItems);
		}
		return this;
	};
	
	
	/**
	 * Returns the last list mode, the mode that is rendered
	 * This can be used to detect mode changes during rendering
	 * 
	 * @protected
	 */
	sap.m.ListBase.prototype.getLastMode = function(sMode) {
		return this._sLastMode;
	};
	
	ListBase.prototype.setMode = function(sMode) {
		sMode = this.validateProperty("mode", sMode);
		var sOldMode = this.getMode();
		if (sOldMode == sMode) {
			return this;
		}
		
		// update property with invalidate
		this.setProperty("mode", sMode);
		
		// determine the selection mode
		this._bSelectionMode = sMode.indexOf("Select") > -1;
		
		// remove selections if mode is not a selection mode
		if (!this._bSelectionMode) {
			this.removeSelections(true);
			return this;
		}
		
		// update selection status of items 
		var aSelecteds = this.getSelectedItems();
		if (aSelecteds.length > 1) {
			// remove selection if there are more than one item is selected
			this.removeSelections(true);
		} else if (sOldMode === sap.m.ListMode.MultiSelect) {
			// if old mode is multi select then we need to remember selected item 
			// in case of new item selection right after setMode call
			this._oSelectedItem = aSelecteds[0];
		}
		
		return this;
	};
	

	/**
	 * Returns growing information as object with "actual" and "total" keys.
	 * Note: This function returns "null" if "growing" feature is disabled.
	 *
	 * @type object
	 * @public
	 * @since 1.16
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.getGrowingInfo = function() {
		return this._oGrowingDelegate ? this._oGrowingDelegate.getInfo() : null;
	};
	
	ListBase.prototype.setRememberSelections = function(bRemember) {
		this.setProperty("rememberSelections", bRemember, true);
		!this.getRememberSelections() && (this._aSelectedPaths = []);
		return this;
	};
	
	/*
	 * Sets internal remembered selected context paths.
	 * This method can be called to reset remembered selection
	 * and does not change selection of the items until binding update.
	 *
	 * @param {String[]} aSelectedPaths valid binding context path array
	 * @since 1.26
	 * @protected
	 */
	sap.m.ListBase.prototype.setSelectedContextPaths = function(aSelectedPaths) {
		this._aSelectedPaths = aSelectedPaths || [];
	};

	/*
	 * Returns internal remembered selected context paths as a copy
	 *
	 * @return {String[]} selected items binding context path
	 * @since 1.26
	 * @protected
	 */
	sap.m.ListBase.prototype.getSelectedContextPaths = function() {
		return this._aSelectedPaths.slice(0);
	};
	
	/* Determines is whether all selectable items are selected or not
	 * @protected
	 */
	ListBase.prototype.isAllSelectableSelected = function() {
		var aItems = this.getItems(true),
			iSelectedItemCount = this.getSelectedItems().length,
			iSelectableItemCount = aItems.filter(function(oItem) {
				return oItem.isSelectable();
			}).length;

		return aItems.length > 0 && iSelectedItemCount == iSelectableItemCount;
	};
	
	/*
	 * Returns only visible items
	 * @protected
	 */
	ListBase.prototype.getVisibleItems = function() {
		return this.getItems(true).filter(function(oItem) {
			return oItem.getVisible();
		});
	};
	
	
	// this gets called when items DOM is changed
	ListBase.prototype.onItemDOMUpdate = function(oListItem) {
		if (!this._bRendering) {
			this._startItemNavigation(true);
		}
	};
	
	// this gets called when selected property of the ListItem is changed
	ListBase.prototype.onItemSelectedChange = function(oListItem, bSelected) {
		
		if (this.getMode() == sap.m.ListMode.MultiSelect) {
			this._updateSelectedPaths(oListItem, bSelected);
			return;
		}
	
		if (bSelected) {
			this._aSelectedPaths = [];
			this._oSelectedItem && this._oSelectedItem.setSelected(false, true);
			this._oSelectedItem = oListItem;
		} else if (this._oSelectedItem === oListItem) {
			this._oSelectedItem = null;
		}
	
		// update selection path for the list item
		this._updateSelectedPaths(oListItem, bSelected);
	};
	
	/*
	 * Returns items container DOM reference
	 * @protected
	 */
	ListBase.prototype.getItemsContainerDomRef = function() {
		return this.getDomRef("listUl");
	};
	
	/*
	 * This hook method gets called if growing feature is enabled and before new page loaded
	 * @protected
	 */
	ListBase.prototype.onBeforePageLoaded = function(oGrowingInfo, sChangeReason) {
		this._fireUpdateStarted(sChangeReason, oGrowingInfo);
		this.fireGrowingStarted(oGrowingInfo);
	};
	
	/*
	 * This hook method get called if growing feature is enabled and after new page loaded
	 * @protected
	 */
	ListBase.prototype.onAfterPageLoaded = function(oGrowingInfo, sChangeReason) {
		this._fireUpdateFinished(oGrowingInfo);
		this.fireGrowingFinished(oGrowingInfo);
	};
	
	/*
	 * Adds navigation section that we can be navigate with alt + down/up
	 * @protected
	 */
	ListBase.prototype.addNavSection = function(sId) {
		this._aNavSections.push(sId);
		return sId;
	};
	
	/*
	 * Returns the max items count.
	 * If aggregation items is bound the count will be the length of the binding
	 * otherwise the length of the list items aggregation will be returned
	 * @protected
	 */
	ListBase.prototype.getMaxItemsCount = function() {
		var oBinding = this.getBinding("items");
		if (oBinding) {
			return oBinding.getLength() || 0;
		}
		return this.getItems(true).length;
	};
	
	/*
	 * This hook method is called from renderer to determine whether items should render or not
	 * @protected
	 */
	ListBase.prototype.shouldRenderItems = function() {
		return true;
	};
	
	// when new items binding we should turn back to initial state
	ListBase.prototype._resetItemsBinding = function() {
		if (this.isBound("items")) {
			this._bUpdating = false;
			this._bReceivingData = false;
			this.removeSelections(true, false, true);
			this._oGrowingDelegate && this._oGrowingDelegate.reset();
			this._hideBusyIndicator();
			
			/* reset focused position */
			if (this._oItemNavigation) {
				this._oItemNavigation.iFocusedIndex = -1;
			}
		}
	};
	
	// called before update started via sorting/filtering/growing etc.
	ListBase.prototype._updateStarted = function(sReason) {
		// if data receiving/update is not started or ongoing
		if (!this._bReceivingData && !this._bUpdating) {
			this._bUpdating = true;
			this._fireUpdateStarted(sReason);
		}
	};
	
	// fire updateStarted event with update reason and actual/total info
	ListBase.prototype._fireUpdateStarted = function(sReason, oInfo) {
		this._sUpdateReason = jQuery.sap.charToUpperCase(sReason || "Refresh");
		this.fireUpdateStarted({
			reason : this._sUpdateReason,
			actual : oInfo ? oInfo.actual : this.getItems(true).length,
			total : oInfo ? oInfo.total : this.getMaxItemsCount()
		});
	};
	
	// called on after rendering to finalize item update finished
	ListBase.prototype._updateFinished = function() {
		// check if data receiving/update is finished
		if (!this._bReceivingData && this._bUpdating) {
			this._fireUpdateFinished();
			this._bUpdating = false;
		}
	};
	
	// fire updateFinished event delayed to make sure rendering phase is done
	ListBase.prototype._fireUpdateFinished = function(oInfo) {
		this._hideBusyIndicator();
		jQuery.sap.delayedCall(0, this, function() {
			this._startItemNavigation(true);
			this.fireUpdateFinished({
				reason : this._sUpdateReason,
				actual : oInfo ? oInfo.actual : this.getItems(true).length,
				total : oInfo ? oInfo.total : this.getMaxItemsCount()
			});
		});
	};
	
	ListBase.prototype._showBusyIndicator = function() {
		if (this.getEnableBusyIndicator() && !this.getBusy() && !this._bBusy) {
			// set the busy state
			this._bBusy = true;
	
			// TODO: would be great to have an event when busy indicator visually seen
			this._sBusyTimer = jQuery.sap.delayedCall(this.getBusyIndicatorDelay(), this, function() {
				// clean no data text
				this.$("nodata-text").text("");
			});
	
			// set busy property
			this.setBusy(true, "listUl");
		}
	};
	
	ListBase.prototype._hideBusyIndicator = function() {
		if (this._bBusy) {
			// revert busy state
			this._bBusy = false;
			this.setBusy(false, "listUl");
			jQuery.sap.clearDelayedCall(this._sBusyTimer);
	
			// revert no data texts when necessary
			if (!this.getItems(true).length) {
				this.$("nodata-text").text(this.getNoDataText());
			}
		}
	};
	
	ListBase.prototype.onItemBindingContextSet = function(oItem) {
		// determine whether selection remember is necessary or not
		if (!this._bSelectionMode || !this.getRememberSelections() || !this.isBound("items")) {
			return;
		}
		
		// if selected property two-way bound then we do not need to update the selection
		if (oItem.isSelectedBoundTwoWay()) {
			return;
		}

		// update the item selection
		var sPath = oItem.getBindingContextPath();
		if (sPath) {
			var bSelected = (this._aSelectedPaths.indexOf(sPath) > -1);
			oItem.setSelected(bSelected);
		}
	};
	
	ListBase.prototype.onItemInserted = function(oItem, bSelectedDelayed) {
		if (bSelectedDelayed) {
			// item was already selected before inserted to the list 
			this.onItemSelectedChange(oItem, true);
		}
		
		if (!this._bSelectionMode ||
			!this._aSelectedPaths.length ||
			!this.getRememberSelections() ||
			!this.isBound("items") ||
			oItem.getSelected()) {
			return;
		}
	
		// retain item selection
		var sPath = oItem.getBindingContextPath();
		if (sPath && this._aSelectedPaths.indexOf(sPath) > -1) {
			oItem.setSelected(true);
		}
	};
	
	// this gets called from item when selection is changed via checkbox/radiobutton/press event
	ListBase.prototype.onItemSelect = function(oListItem, bSelected) {
		if (this.getMode() == sap.m.ListMode.MultiSelect) {
			this._fireSelectionChangeEvent([oListItem]);
		} else if (this._bSelectionMode && bSelected) {
			this._fireSelectionChangeEvent([oListItem]);
		}
	};
	
	// Fire selectionChange event and support old select event API
	ListBase.prototype._fireSelectionChangeEvent = function(aListItems) {
		var oListItem = aListItems && aListItems[0];
		if (!oListItem) {
			return;
		}
	
		// fire event
		this.fireSelectionChange({
			listItem : oListItem,
			listItems : aListItems,
			selected : oListItem.getSelected()
		});
	
		// support old API
		this.fireSelect({
			listItem : oListItem 
		});
	};
	
	// this gets called from item when delete is triggered via delete button
	ListBase.prototype.onItemDelete = function(oListItem) {
		this.fireDelete({
			listItem : oListItem
		});
	};
	
	// this gets called from item when item is pressed(enter/tap/click)
	ListBase.prototype.onItemPress = function(oListItem, oSrcControl) {
		
		// do not fire press event for inactive type 
		if (oListItem.getType() == sap.m.ListType.Inactive) {
			return;
		}
		
		// fire event async
		jQuery.sap.delayedCall(0, this, function() {
			this.fireItemPress({
				listItem : oListItem,
				srcControl : oSrcControl
			});
		});
	};
	
	// insert or remove given item's path from selection array
	ListBase.prototype._updateSelectedPaths = function(oItem, bSelect) {
		if (!this.getRememberSelections() || !this.isBound("items")) {
			return;
		}
	
		var sPath = oItem.getBindingContextPath();
		if (!sPath) {
			return;
		}
	
		bSelect = (bSelect === undefined) ? oItem.getSelected() : bSelect;
		var iIndex = this._aSelectedPaths.indexOf(sPath);
		if (bSelect) {
			iIndex < 0 && this._aSelectedPaths.push(sPath);
		} else {
			iIndex > -1 && this._aSelectedPaths.splice(iIndex, 1);
		}
	};
	
	ListBase.prototype._destroyGrowingDelegate = function() {
		if (this._oGrowingDelegate) {
			this._oGrowingDelegate.destroy();
			this._oGrowingDelegate = null;
		}
	};
	
	ListBase.prototype._destroyItemNavigation = function() {
		if (this._oItemNavigation) {
			this.removeEventDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}
	};
	
	/**
	 * After swipe content is shown on the right hand side of the list item
	 * we will block the touch events and this method defines this touch blocker area.
	 * It must be always child/ren of the area because we will listen parent's touch events
	 *
	 * @private
	 */
	ListBase.prototype._getTouchBlocker = function() {
		return this.$().children();
	};
	
	ListBase.prototype._getSwipeContainer = function() {
		return this._$swipeContainer || (
			jQuery.sap.require("sap.m.InstanceManager"),
			this._$swipeContainer = jQuery("<div>", {
				"id" : this.getId("swp"),
				"class" : "sapMListSwp"
			})
		);
	};
	
	ListBase.prototype._setSwipePosition = function() {
		if (this._isSwipeActive) {
			return this._getSwipeContainer().css("top", this._swipedItem.$().position().top);
		}
	};
	
	ListBase.prototype._renderSwipeContent = function() {
		var $listitem = this._swipedItem.$(),
			$container = this._getSwipeContainer();
	
		// add swipe container into list if it is not there
		this.$().prepend($container.css({
			top : $listitem.position().top,
			height : $listitem.outerHeight(true)
		}));
	
		// render swipe content into swipe container if needed
		if (this._bRerenderSwipeContent) {
			this._bRerenderSwipeContent = false;
			var rm = sap.ui.getCore().createRenderManager();
			rm.render(this.getSwipeContent(), $container.empty()[0]);
			rm.destroy();
		}
	
		// for method chaining
		return this;
	};
	
	ListBase.prototype._swipeIn = function() {
		var that = this,	// scope
			$blocker = that._getTouchBlocker(),
			$container = that._getSwipeContainer();
	
		// render swipe content
		that._isSwipeActive = true;
		that._renderSwipeContent();
	
		// add to instance manager
		sap.m.InstanceManager.addDialogInstance(that);
	
		// maybe keyboard is opened
		window.document.activeElement.blur();
	
		// check orientation change and recalculate the position
		jQuery(window).on("resize.swp", function() {
			that._setSwipePosition();
		});
	
		// block touch events
		$blocker.css("pointer-events", "none").on("touchstart.swp mousedown.swp", function(e){
			if (!$container[0].firstChild.contains(e.target)) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
	
		// UX: swipeout is not interruptible till animation is finished
		$container.bind("webkitAnimationEnd animationend", function() {
			jQuery(this).unbind("webkitAnimationEnd animationend");
			// disable animation and focus to container
			$container.css("opacity", 1).focus();
	
			// check parents touchend for auto hide mode
			$blocker.parent().on("touchend.swp touchcancel.swp mouseup.swp", function(e) {
				// checks if event source is coming from swipe container's first child
				if (!$container[0].firstChild.contains(e.target)) {
					that.swipeOut();
				}
			});
		}).removeClass("sapMListSwpOutAnim").addClass("sapMListSwpInAnim");
	};
	
	ListBase.prototype._onSwipeOut = function(callback) {
		// remove container from DOM and disable animation event
		this._getSwipeContainer().css("opacity", 0).remove();
	
		// remove windows resize listener
		jQuery(window).off("resize.swp");
	
		// enable touch events again
		this._getTouchBlocker().css("pointer-events", "auto").off("touchstart.swp mousedown.swp");
	
		if (typeof callback == "function") {
			callback.call(this, this._swipedItem, this.getSwipeContent());
		}
	
		this._isSwipeActive = false;
	
		// remove from instance manager
		sap.m.InstanceManager.removeDialogInstance(this);
	};
	

	/**
	 * After swipeContent is shown, user can interact with this control(e.g Tap). After interaction is done, you can/should use this method to hide swipeContent from screen.
	 * Note: If users try to tap inside of the list but outside of the swipeContent then control hides automatically.
	 *
	 * @param {any} oCallback
	 *         This callback function is called with two parameters(swipedListItem and swipedContent) after swipe-out animation is finished.
	 * @type sap.m.ListBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.swipeOut = function(callback) {
		if (!this._isSwipeActive) {
			return this;
		}
	
		var that = this,
			$container = this._getSwipeContainer();
	
		// stop listening parents touchend event
		this._getTouchBlocker().parent().off("touchend.swp touchend.swp touchcancel.swp mouseup.swp");
	
		// add swipeout animation and listen this
		$container.bind("webkitAnimationEnd animationend", function() {
			jQuery(this).unbind("webkitAnimationEnd animationend");
			that._onSwipeOut(callback);
		}).removeClass("sapMListSwpInAnim").addClass("sapMListSwpOutAnim");
	
		return this;
	};
	
	/**
	 * Close and hide the opened swipe content immediately
	 * @private
	 */
	ListBase.prototype._removeSwipeContent = function() {
		if (this._isSwipeActive) {
			this.swipeOut()._onSwipeOut();
		}
	};
	
	/**
	 * This method is required from sap.m.InstanceManager
	 * To remove swipe content when back button is pressed
	 */
	ListBase.prototype.close = ListBase.prototype._removeSwipeContent;
	
	// called on swipe event to bring in the swipeContent control
	ListBase.prototype._onSwipe = function(oEvent) {
		var oContent = this.getSwipeContent(),
			oSrcControl = oEvent.srcControl;
	
		if (oContent && oSrcControl && !this._isSwipeActive && this !== oSrcControl && !this._eventHandledByControl
				// also enable the swipe feature when runs on Windows 8 device
				&& (sap.ui.Device.support.touch || (sap.ui.Device.os.windows && sap.ui.Device.os.version >= 8))) {
			// source can be anything so, check parents and find the list item
			/*eslint-disable no-extra-semi, curly */
			for (var li = oSrcControl; li && !(li instanceof sap.m.ListItemBase); li = li.oParent);
			/*eslint-enable no-extra-semi, curly */
			if (li instanceof sap.m.ListItemBase) {
				this._swipedItem = li;
	
				// fire event earlier to let the user change swipeContent according to list item
				// if the event not is canceled then start the animation
				this.fireSwipe({
					listItem : this._swipedItem,
					swipeContent : oContent,
					srcControl : oSrcControl
				}, true) && this._swipeIn();
			}
		}
	};
	
	ListBase.prototype.ontouchstart = function(oEvent) {
		this._eventHandledByControl = oEvent.isMarked();
	};
	
	ListBase.prototype.onswipeleft = function(oEvent) {
		var exceptDirection = sap.ui.getCore().getConfiguration().getRTL() ? "RightToLeft" : "LeftToRight";
	
		if (this.getSwipeDirection() != exceptDirection) {
			this._onSwipe(oEvent);
		}
	};
	
	ListBase.prototype.onswiperight = function(oEvent) {
		var exceptDirection = sap.ui.getCore().getConfiguration().getRTL() ? "LeftToRight" : "RightToLeft";
	
		if (this.getSwipeDirection() != exceptDirection) {
			this._onSwipe(oEvent);
		}
	};
	
	ListBase.prototype.setSwipeDirection = function(sDirection) {
		return this.setProperty("swipeDirection", sDirection, true);
	};
	

	/**
	 * Returns swiped list item. When no item is swiped, "null" is returned.
	 *
	 * @type sap.m.ListItemBase
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListBase.prototype.getSwipedItem = function() {
		return (this._isSwipeActive ? this._swipedItem : null);
	};
	
	ListBase.prototype.setSwipeContent = function(oControl) {
		this._bRerenderSwipeContent = true;
	
		this.toggleStyleClass("sapMListSwipable", !!oControl);
	
		// prevent list from re-rendering on setSwipeContent
		return this.setAggregation("swipeContent", oControl, !this._isSwipeActive);
	};
	
	ListBase.prototype.invalidate = function(oOrigin) {
		if (oOrigin && oOrigin === this.getSwipeContent()) {
			this._bRerenderSwipeContent = true;
			this._isSwipeActive && this._renderSwipeContent();
			return this;
		}
	
		Control.prototype.invalidate.apply(this, arguments);
		return this;
	};
	
	ListBase.prototype.addItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new GroupHeaderListItem({
			title: oGroup.text || oGroup.key
		});
	
		this.addAggregation("items", oHeader, bSuppressInvalidate);
		return oHeader;
	};
	
	ListBase.prototype.removeGroupHeaders = function(bSuppressInvalidate) {
		this.getItems(true).forEach(function(oItem) {
			if (oItem instanceof GroupHeaderListItem) {
				oItem.destroy(bSuppressInvalidate);
			}
		});
	};
	
	// returns accessibility role
	ListBase.prototype.getRole = function() {
		var sMode = this.getMode(),
			mMode = sap.m.ListMode;
		
		return (sMode == mMode.None || sMode == mMode.Delete) ? "list" : "listbox";
	};
	
	// this gets called after navigation items are focused
	ListBase.prototype.onNavigationItemFocus = function(oEvent) {
		var iIndex = oEvent.getParameter("index"),
			aItemDomRefs = this._oItemNavigation.getItemDomRefs(),
			oItemDomRef = aItemDomRefs[iIndex],
			iSetSize = aItemDomRefs.length,
			oBinding = this.getBinding("items");

		// use binding length if list is in scroll to load growing mode
		if (this.getGrowing() && this.getGrowingScrollToLoad() && oBinding && oBinding.isLengthFinal()) {
			iSetSize = oBinding.getLength();
		}

		this.getNavigationRoot().setAttribute("aria-activedescendant", oItemDomRef.id);
		oItemDomRef.setAttribute("aria-posinset", iIndex + 1);
		oItemDomRef.setAttribute("aria-setsize", iSetSize);
	};
	
	/* Keyboard Handling */
	ListBase.prototype.getNavigationRoot = function() {
		return this.getDomRef("listUl");
	};
	
	ListBase.prototype.getFocusDomRef = function() {
		// let the item navigation handle focus
		return this.getNavigationRoot();
	};

	ListBase.prototype._startItemNavigation = function(bIfNeeded) {
		// if focus is not on the list then only invalidate the item navigation
		if (bIfNeeded) {
			var oNavigationRoot = this.getNavigationRoot();
			if (!oNavigationRoot || !oNavigationRoot.contains(document.activeElement)) {
				this._bItemNavigationInvalidated = true;
				return;
			}
		}
		
		// clear invalidation
		this._bItemNavigationInvalidated = false;
	
		// no item navigation for old android that breaks focus handling
		if (sap.ui.Device.os.android && sap.ui.Device.os.version < 4.1) {
			return;
		}
	
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.setCycling(false);
			this.addEventDelegate(this._oItemNavigation);
			
			// root element should still be tabbable
			this._oItemNavigation.setTabIndex0();
	
			// implicitly setting table mode with one column
			// to disable up/down reaction on events of the cell
			this._oItemNavigation.setTableMode(true, true).setColumns(1);
	
			// alt + up/down will be used for section navigation
			// notify item navigation not to handle alt key modifiers
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"]
			});
			
			// attach to the focus event of the navigation items
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BeforeFocus, this.onNavigationItemFocus, this);
		}
		
		// TODO: Maybe we need a real paging algorithm here
		this._oItemNavigation.setPageSize(this.getGrowingThreshold());
		
		// configure navigation root
		var oNavigationRoot = this.getNavigationRoot();
		this._oItemNavigation.setRootDomRef(oNavigationRoot);
		
		// configure navigatable items
		this.setNavigationItems(this._oItemNavigation, oNavigationRoot);
	};
	
	/*
	 * Sets DOM References for keyboard navigation
	 *
	 * @param {sap.ui.core.delegate.ItemNavigation} oItemNavigation
	 * @param {HTMLElement} [oNavigationRoot]
	 * @protected
	 * @since 1.26
	 */
	ListBase.prototype.setNavigationItems = function(oItemNavigation, oNavigationRoot) {
		var aNavigationItems = jQuery(oNavigationRoot).children(".sapMLIB").get();
		oItemNavigation.setItemDomRefs(aNavigationItems);
		if (oItemNavigation.getFocusedIndex() == -1) {
			oItemNavigation.setFocusedIndex(0);
		}
	};
	
	/**
	 * Returns ItemNavigation for controls uses List
	 * @since 1.16.5
	 * @returns {sap.ui.core.delegate.ItemNavigation|undefined}
	 * @protected
	 */
	ListBase.prototype.getItemNavigation = function() {
		return this._oItemNavigation;
	};
	
	/*
	 * Makes the given ListItem(row) focusable via ItemNavigation
	 *
	 * @since 1.26
	 * @protected
	 */
	ListBase.prototype.setItemFocusable = function(oListItem) {
		if (!this._oItemNavigation) {
			return;
		}
		
		var aItemDomRefs = this._oItemNavigation.getItemDomRefs();
		var iIndex = aItemDomRefs.indexOf(oListItem.getDomRef());
		if (iIndex >= 0) {
			this._oItemNavigation.setFocusedIndex(iIndex);
		}
	};
	
	/*
	 * Forward tab before or after List
	 * This function should be called before tab key is pressed
	 *
	 * @see sap.m.ListItemBase#onsaptabnext
	 * @see sap.m.ListItemBase#onsaptabprevious
	 * @since 1.26
	 * @protected
	 */
	ListBase.prototype.forwardTab = function(bForward) {
		this._bIgnoreFocusIn = true;
		this.$(bForward ? "after" : "listUl").focus();
	};
	
	// move focus out of the table for nodata row
	ListBase.prototype.onsaptabnext = function(oEvent) {
		if (oEvent.target.id == this.getId("nodata")) {
			this.forwardTab(true);
		}
	};
	
	// move focus out of the table for nodata row
	ListBase.prototype.onsaptabprevious = function(oEvent) {
		var sTargetId = oEvent.target.id;
		if (sTargetId == this.getId("nodata")) {
			this.forwardTab(false);
		} else if (sTargetId == this.getId("trigger")) {
			this.focusPrevious();
			oEvent.preventDefault();
		}
	};
	
	// navigate to previous or next section according to current focus position
	ListBase.prototype._navToSection = function(bForward) {
		var $TargetSection;
		var iIndex = 0;
		var iStep = bForward ? 1 : -1;
		var iLength = this._aNavSections.length;
	
		// find the current section index
		this._aNavSections.some(function(sSectionId, iSectionIndex) {
			var oSectionDomRef = jQuery.sap.domById(sSectionId);
			if (oSectionDomRef && oSectionDomRef.contains(document.activeElement)) {
				iIndex = iSectionIndex;
				return true;
			}
		});
		
		// if current section is items container then save the current focus position
		var oItemsContainerDomRef = this.getItemsContainerDomRef();
		var $CurrentSection = jQuery.sap.byId(this._aNavSections[iIndex]);
		if ($CurrentSection[0] === oItemsContainerDomRef) {
			$CurrentSection.data("redirect", this._oItemNavigation.getFocusedIndex());
		}
	
		// find the next focusable section
		this._aNavSections.some(function() {
			iIndex = (iIndex + iStep + iLength) % iLength;	// circle
			$TargetSection = jQuery.sap.byId(this._aNavSections[iIndex]);
			
			// if target is items container
			if ($TargetSection[0] === oItemsContainerDomRef) {
				var iRedirect = $TargetSection.data("redirect");
				var oItemDomRefs = this._oItemNavigation.getItemDomRefs();
				var oTargetSection = oItemDomRefs[iRedirect] || oItemsContainerDomRef.children[0];
				$TargetSection = jQuery(oTargetSection);
			}
			
			if ($TargetSection.is(":focusable")) {
				$TargetSection.focus();
				return true;
			}
			
			
		}, this);
	
		// return the found section
		return $TargetSection;
	};
	
	// Handle Alt + Down
	ListBase.prototype.onsapshow = function(oEvent) {
		// handle events that are only coming from navigation items and ignore F4
		if (oEvent.isMarked() || 
			oEvent.which == jQuery.sap.KeyCodes.F4 || 
			oEvent.target.id != this.getId("trigger") &&
			!jQuery(oEvent.target).hasClass(this.sNavItemClass)) {
			return;
		}
	
		// move focus to the next section
		if (this._navToSection(true)) {
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};
	
	// Handle Alt + Up
	ListBase.prototype.onsaphide = function(oEvent) {
		// handle events that are only coming from navigation items
		if (oEvent.isMarked() || 
			oEvent.target.id != this.getId("trigger") &&
			!jQuery(oEvent.target).hasClass(this.sNavItemClass)) {
			return;
		}
	
		// move focus to the previous section
		if (this._navToSection(false)) {
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};
	
	// Ctrl + A to switch select all/none
	ListBase.prototype.onkeydown = function(oEvent) {

		var bCtrlA = (oEvent.which == jQuery.sap.KeyCodes.A) && (oEvent.metaKey || oEvent.ctrlKey);
		if (oEvent.isMarked() || !bCtrlA || !jQuery(oEvent.target).hasClass(this.sNavItemClass)) {
			return;
		}
		
		oEvent.preventDefault();
		
		if (this.getMode() !== sap.m.ListMode.MultiSelect) {
			return;
		}
		
		if (this.isAllSelectableSelected()) {
			this.removeSelections(false, true);
		} else {
			this.selectAll(true);
		}
		
		oEvent.setMarked();
	};
	
	ListBase.prototype.onmousedown = function(oEvent) {
		// check whether item navigation should be reapplied from scratch
		if (this._bItemNavigationInvalidated) {
			this._startItemNavigation();
		}
	};
	
	// focus to previously focused element known in item navigation
	ListBase.prototype.focusPrevious = function() {
		// get the last focused element from the ItemNavigation
		var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
		var iLastFocusedIndex = this._oItemNavigation.getFocusedIndex();
		var $LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]);

		// find related item control to get tabbables
		var oRelatedControl = $LastFocused.control(0) || {};
		var $Tabbables = oRelatedControl.getTabbables ? oRelatedControl.getTabbables() : $LastFocused.find(":sapTabbable");
		
		// get the last tabbable item or itself and focus
		var $FocusElement = $Tabbables.eq(-1).add($LastFocused).eq(-1);
		$FocusElement.focus();
	};
	
	// Handles focus to reposition the focus to correct place
	ListBase.prototype.onfocusin = function(oEvent) {
		
		// ignore self focus
		if (this._bIgnoreFocusIn) {
			this._bIgnoreFocusIn = false;
			oEvent.stopImmediatePropagation(true);
			return;
		}
	
		// check whether item navigation should be reapplied from scratch
		if (this._bItemNavigationInvalidated) {
			this._startItemNavigation();
		}
	
		// handle only for backward navigation
		if (oEvent.isMarked() ||
			!this._oItemNavigation || 
			oEvent.target.id != this.getId("after")) {
			return;
		}
	
		this.focusPrevious();
		oEvent.setMarked();
	};

	return ListBase;

}, /* bExport= */ true);
