/*!
 * ${copyright}
 */

// Provides class sap.m.GrowingEnablement
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'],
	function(jQuery, BaseObject) {
	"use strict";


	/**
	 * Creates a GrowingEnablement delegate that can be attached to ListBase Controls requiring capabilities for growing
	 *
	 * @extends sap.ui.base.Object
	 * @alias sap.m.GrowingEnablement
	 * @experimental Since 1.16. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 *
	 * @param {sap.m.ListBase} oControl the ListBase control of which this Growing is the delegate
	 *
	 * @constructor
	 * @protected
	 */
	var GrowingEnablement = BaseObject.extend("sap.m.GrowingEnablement", /** @lends sap.m.GrowingEnablement.prototype */ {

		constructor : function(oControl) {
			BaseObject.apply(this);
			this._oControl = oControl;
			this._oControl.bUseExtendedChangeDetection = true;
			this._oControl.addDelegate(this);

			/* init growing list */
			var iRenderedItemsLength = this._oControl.getItems(true).length;
			this._iRenderedDataItems = iRenderedItemsLength;
			this._iItemCount = iRenderedItemsLength;
			this._bRebuilding = false;
			this._fnRebuildQ = null;
			this._bLoading = false;
			this._sGroupingPath = "";
			this._bDataRequested = false;
		},

		/**
		 * Destroys this GrowingEnablement delegate.
		 * This function must be called by the control which uses this delegate in the <code>exit</code> function.
		 */
		destroy : function() {
			if (this._oBusyIndicator) {
				this._oBusyIndicator.destroy();
				delete this._oBusyIndicator;
			}
			if (this._oTrigger) {
				this._oTrigger.destroy();
				delete this._oTrigger;
			}
			if (this._oLoading) {
				this._oLoading.destroy();
				delete this._oLoading;
			}
			if (this._oScrollDelegate) {
				this._oScrollDelegate.setGrowingList(null);
				this._oScrollDelegate = null;
			}

			jQuery(this._oControl.getId() + "-triggerList").remove();
			this._oControl.bUseExtendedChangeDetection = false;
			this._oControl.removeDelegate(this);
			this._sGroupingPath = "";
			this._bLoading = false;
			this._oControl = null;
		},

		/**
		 * Renders loading indicator or load more trigger
		 */
		render : function(rm) {
			var bHasScrollToLoadAndScrollbars = this._oControl.getGrowingScrollToLoad() && this._getHasScrollbars();

			rm.write("<ul id='" + this._oControl.getId() + "-triggerList' role='presentation'");

			if (bHasScrollToLoadAndScrollbars) {
				rm.addStyle("display", "none");
				rm.writeStyles();
			}

			// no header or footer no div
			rm.addClass("sapMListUl");
			rm.addClass("sapMGrowingList");
			if (this._oControl.setBackgroundDesign) {
				rm.addClass("sapMListBG" + this._oControl.getBackgroundDesign());
			}

			if (this._oControl.getInset()) {
				rm.addClass("sapMListInset");
			}
			rm.writeClasses();
			rm.write(">");

			var oActionItem;
			if (bHasScrollToLoadAndScrollbars) {
				this._showsLoading = true;
				oActionItem = this._getLoading(this._oControl.getId() + "-loading");
			} else {
				this._showsTrigger = true;
				oActionItem = this._getTrigger(this._oControl.getId() + "-trigger");
			}

			// this variable is needed to render loading indicator in list even in table mode
			rm.renderControl(oActionItem);
			rm.write("</ul>");
		},

		/**
		 * Called after rendering phase of the given control
		 */
		onAfterRendering : function() {
			if (this._oControl.getGrowingScrollToLoad()) {
				var oScrollDelegate = sap.m.getScrollDelegate(this._oControl);
				if (oScrollDelegate) {
					this._oScrollDelegate = oScrollDelegate;
					oScrollDelegate.setGrowingList(this._oControl, jQuery.proxy(this._triggerLoadingByScroll, this));
				}
			} else if (this._oScrollDelegate) {
				this._oScrollDelegate.setGrowingList(null);

				this._oScrollDelegate = null;
			}

			this._updateTrigger();
		},

		setTriggerText : function(sText) {
			if (this._oTrigger) {
				this._oTrigger.getContent()[0].$().find(".sapMSLITitle").text(sText);
			}
		},

		// call to reset paging
		reset : function() {
			this._iItemCount = 0;
		},

		// determines growing reset with binding change reason
		// according to UX sort/filter/context should reset the growing
		shouldReset : function(sChangeReason) {
			var mChangeReason = sap.ui.model.ChangeReason;

			return 	sChangeReason == mChangeReason.Sort ||
					sChangeReason == mChangeReason.Filter ||
					sChangeReason == mChangeReason.Context;
		},

		// get actual and total info
		getInfo : function() {
			return {
				total : this._oControl.getMaxItemsCount(),
				actual : this._iRenderedDataItems
			};
		},

		// call to request new page
		requestNewPage : function(oEvent) {
			// if max item count not reached
			if (this._oControl && !this._bLoading && this._iItemCount < this._oControl.getMaxItemsCount()) {
				this._showIndicator();
				this._iItemCount += this._oControl.getGrowingThreshold();
				this.updateItems("Growing");
			}
		},

		// called before new page loaded
		_onBeforePageLoaded : function(sChangeReason) {
			this._bLoading = true;
			this._oControl.onBeforePageLoaded(this.getInfo(), sChangeReason);
		},

		// called after new page loaded
		_onAfterPageLoaded : function(sChangeReason) {
			this._hideIndicator();
			this._updateTrigger();
			this._bLoading = false;
			this._oControl.onAfterPageLoaded(this.getInfo(), sChangeReason);
		},

		/**
		 *
		 * this._oRenderManager is optionally used if defined in order to improve performance. It indicates a state where multiple items can be subsequently rendered.
		 * If this._oRenderManager is defined, it is the responsibility of the caller to flush and destroy the RenderManager after the last call.
		 */
		_renderItemIntoContainer : function(oItem, bDoNotPreserve, vInsert, oDomRef) {
			oDomRef = oDomRef || this._oContainerDomRef;
			if (oDomRef) {
				var rm = this._oRenderManager || sap.ui.getCore().createRenderManager();
				rm.renderControl(oItem);
				if (!this._oRenderManager) {
					rm.flush(oDomRef, bDoNotPreserve, vInsert);
					rm.destroy();
				}
			}
		},

		_getBusyIndicator : function() {
			return this._oBusyIndicator || (this._oBusyIndicator = new sap.m.BusyIndicator({
				size : "2.0em"
			}));
		},

		/**
		 * returns loading indicator
		 */
		_getLoading : function(sId) {
			var that = this;
			
			if (this._oLoading) {
				return this._oLoading;
			}
			
			this._oLoading = new sap.m.CustomListItem({
				id : sId,
				content : new sap.ui.core.HTML({
					content :	"<div class='sapMSLIDiv sapMGrowingListLoading'>" +
									"<div class='sapMGrowingListBusyIndicator' id='" + sId + "-busyIndicator'></div>" +
								"</div>",
					afterRendering : function(e) {
						var oBusyIndicator = that._getBusyIndicator();
						var rm = sap.ui.getCore().createRenderManager();
						rm.render(oBusyIndicator, this.getDomRef().firstChild);
						rm.destroy();
					}
				})
			}).setParent(this._oControl, null, true);
			
			// growing loading indicator as a list item should not be affected from the List Mode
			this._oLoading.getMode = function() {
				return sap.m.ListMode.None;
			};
			
			return this._oLoading;
		},

		/**
		 * returns load more trigger
		 */
		_getTrigger : function(sId) {
			var that = this;

			var sTriggerText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LOAD_MORE_DATA");
			if (this._oControl.getGrowingTriggerText()) {
				sTriggerText = this._oControl.getGrowingTriggerText();
			}

			this._oControl.addNavSection(sId);
			
			if (this._oTrigger) {
				this.setTriggerText(sTriggerText);
				return this._oTrigger;
			}

			this._oTrigger = new sap.m.CustomListItem({
				id : sId,
				content : new sap.ui.core.HTML({
					content :	"<div class='sapMGrowingListTrigger'>" +
									"<div class='sapMGrowingListBusyIndicator' id='" + sId + "-busyIndicator'></div>" +
									"<div class='sapMSLITitleDiv sapMGrowingListTitel'>" +
										"<h1 class='sapMSLITitle'>" + jQuery.sap.encodeHTML(sTriggerText) + "</h1>" +
									"</div>" +
									"<div class='sapMGrowingListDescription'>" +
										"<div class='sapMSLIDescription' id='" + sId + "-itemInfo'>" + that._getListItemInfo() + "</div>" +
									"</div>" +
								"</div>",
					afterRendering : function(e) {
						var oBusyIndicator = that._getBusyIndicator();
						var rm = sap.ui.getCore().createRenderManager();
						rm.render(oBusyIndicator, this.getDomRef().firstChild);
						rm.destroy();
					}
				}),
				type : sap.m.ListType.Active
			}).setParent(this._oControl, null, true).attachPress(this.requestNewPage, this).addEventDelegate({
				onsapenter : function(oEvent) {
					this.requestNewPage();
					oEvent.preventDefault();
				},
				onsapspace : function(oEvent) {
					this.requestNewPage(oEvent);
					oEvent.preventDefault();
				},
				onAfterRendering : function(oEvent) {
					this._oTrigger.$().attr({
						"tabindex": 0,
						"role": "button",
						"aria-live": "polite"
					});
				}
			}, this);
			
			// growing button as a list item should not be affected from the List Mode
			this._oTrigger.getMode = function() {
				return sap.m.ListMode.None;
			};
			
			// stop tab forwarding of the ListItemBase
			this._oTrigger.onsaptabnext = function() {
			};
			
			return this._oTrigger;
		},

		/**
		 * Returns the information about the list items.
		 * -> how many items are displayed
		 * -> maximum items to be displayed
		 */
		_getListItemInfo : function() {
			return ("[ " + this._iRenderedDataItems + " / " + this._oControl.getMaxItemsCount() + " ]");
		},

		/**
		 * Only call when grouped
		 */
		_getGroupForContext : function(oContext) {
			return this._oControl.getBinding("items").getGroup(oContext);
		},

		/**
		 * returns the first sorters grouping path when available
		 */
		_getGroupingPath : function(oBinding) {
			oBinding = oBinding || this._oControl.getBinding("items") || {};
			var aSorters = oBinding.aSorters || [];
			var oSorter = aSorters[0] || {};
			if (oSorter.fnGroup) {
				return oSorter.sPath;
			}
			return "";
		},

		/**
		 * If table has pop-in then we have two rows for one item
		 * So this method finds the correct DOM position to insert item
		 * This function should not be called within insertItem
		 */
		_getDomIndex : function(iIndex) {
			if (this._oControl.hasPopin && this._oControl.hasPopin()) {
				iIndex *= 2;
			}
			return iIndex;
		},

		/**
		 * Checks if the Scrollcontainer of the list has scrollbars
		 * @returns {Boolean}
		 */
		_getHasScrollbars : function() {
			//the containter height is needed because it gets hidden if there are scrollbars and this might lead to the list not having scrollbars again
			return this._oScrollDelegate && this._oScrollDelegate.getMaxScrollTop() > this._oControl.$("triggerList").height();
		},

		/**
		 * function is called to destroy all items in list
		 */
		destroyListItems : function() {
			this._oControl.destroyItems();
			this._iRenderedDataItems = 0;
		},

		/**
		 * function is called to add single list item or row
		 */
		addListItem : function(oItem, bSuppressInvalidate) {
			this._iRenderedDataItems++;

			// Grouping support
			var oBinding = this._oControl.getBinding("items"),
				oBindingInfo = this._oControl.getBindingInfo("items");

			if (oBinding.isGrouped() && oBindingInfo) {
				var bNewGroup = false,
					aItems = this._oControl.getItems(true),
					sModelName = oBindingInfo.model || undefined,
					oNewGroup = this._getGroupForContext(oItem.getBindingContext(sModelName));

				if (aItems.length == 0) {
					bNewGroup = true;
				} else if (oNewGroup.key !== this._getGroupForContext(aItems[aItems.length - 1].getBindingContext(sModelName)).key) {
					bNewGroup = true;
				}

				if (bNewGroup) {
					var oGroupHeader = null;
					if (oBindingInfo.groupHeaderFactory) {
						oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
					}
					this.addItemGroup(oNewGroup, oGroupHeader, bSuppressInvalidate);
				}
			}

			this._oControl.addAggregation("items", oItem, bSuppressInvalidate);
			if (bSuppressInvalidate) {
				this._renderItemIntoContainer(oItem, false, true);
			}
			return this;
		},

		/**
		 * function is called to add multiple items
		 */
		addListItems : function(aContexts, oBindingInfo, bSuppressInvalidate) {
			if (oBindingInfo && aContexts) {
				for (var i = 0, l = aContexts.length; i < l; i++) {
					var oClone = oBindingInfo.factory("", aContexts[i]);
					oClone.setBindingContext(aContexts[i], oBindingInfo.model);
					this.addListItem(oClone, bSuppressInvalidate);
				}
			}
		},

		/**
		 * destroy all list items and then insert
		 * this function take care async calls during the insertion
		 */
		rebuildListItems : function(aContexts, oBindingInfo, bSuppressInvalidate) {
			// check if building already started
			if (this._bRebuilding) {
				this._fnRebuildQ = jQuery.proxy(this, "rebuildListItems", aContexts, oBindingInfo, bSuppressInvalidate);
				return;
			}

			// rebuild list items
			this._bRebuilding = true;
			this.destroyListItems();
			this.addListItems(aContexts, oBindingInfo, bSuppressInvalidate);
			this._bRebuilding = false;

			// check if something is in the queue
			if (this._fnRebuildQ) {
				var fnRebuildQ = this._fnRebuildQ;
				this._fnRebuildQ = null;
				fnRebuildQ();
			}
		},

		/**
		 * adds a new GroupHeaderListItem
		 */
		addItemGroup : function(oGroup, oHeader, bSuppressInvalidate) {
			oHeader = this._oControl.addItemGroup(oGroup, oHeader, true);
			if (bSuppressInvalidate) {
				this._renderItemIntoContainer(oHeader, false, true);
			}
			return this;
		},

		/**
		 * function is called to insert single list item or row.
		 */
		insertListItem : function(oItem, iIndex) {
			this._oControl.insertAggregation("items", oItem, iIndex, true);
			this._iRenderedDataItems++;
			this._renderItemIntoContainer(oItem, false, this._getDomIndex(iIndex));
			return this;
		},

		/**
		 * function is called to remove single list item or row
		 */
		deleteListItem : function(oItem) {
			this._iRenderedDataItems--;
			oItem.destroy(true);
			return this;
		},

		/**
		 * refresh items ... called from oData model.
		 */
		refreshItems : function(sChangeReason) {
			if (!this._bDataRequested) {
				this._bDataRequested = true;
				this._onBeforePageLoaded(sChangeReason);
			}
			
			// set iItemCount to initial value if not set or no items at the control yet
			if (!this._iItemCount || this.shouldReset(sChangeReason) || !this._oControl.getItems(true).length) {
				this._iItemCount = this._oControl.getGrowingThreshold();
			}
			this._oControl.getBinding("items").getContexts(0, this._iItemCount);
		},

		/**
		 * update loaded items ... 2nd time called from oData model.
		 */
		updateItems : function(sChangeReason) {
			var oBindingInfo = this._oControl.getBindingInfo("items"),
				oBinding = oBindingInfo.binding,
				fnFactory = oBindingInfo.factory;

			// set iItemCount to initial value if not set or no items at the control yet
			if (!this._iItemCount || this.shouldReset(sChangeReason) || !this._oControl.getItems(true).length) {
				this._iItemCount = this._oControl.getGrowingThreshold();
			}

			// fire growing started event
			if (this._bDataRequested) {
				// if data was requested this is a followup call of updateItems, so growing started was fired already
				// and must not be fired again, instead we reset the flag
				this._bDataRequested = false;
			} else {
				this._onBeforePageLoaded(sChangeReason);
			}

			// get the context from binding
			// aContexts.diff ==> undefined : New data we should build from scratch
			// aContexts.diff ==> [] : There is no diff, means data did not changed but maybe it was already grouped and we need to handle group headers
			// aContexts.diff ==> [{index : 0, type: "delete"}, ...] : Run the diff logic
			var aContexts = oBinding ? oBinding.getContexts(0, this._iItemCount) || [] : [];

			// if getContexts did cause a request to be sent, set the internal flag so growing started event is not
			// fired again, when the response of the request is processed.
			if (aContexts.dataRequested) {
				this._bDataRequested = true;
				// a partial response may already be contained, so only return here without updating the list,
				// if no data was changed (diff is empty)
				if (aContexts.diff && aContexts.diff.length == 0) {
					return;
				}
			}

			// cache dom ref for internal functions not to lookup again and again
			this._oContainerDomRef = this._oControl.getItemsContainerDomRef();

			// check control based logic to handle from scratch is required or not
			var bCheckGrowingFromScratch = this._oControl.checkGrowingFromScratch && this._oControl.checkGrowingFromScratch();
			
			// rebuild list from scratch if there were no items and new items needs to be added 
			if (!this._oControl.getItems(true).length && aContexts.diff && aContexts.diff.length) {
				aContexts.diff = undefined;
			}

			// when data is grouped we insert the sequential items to the end
			// but with diff calculation we may need to create GroupHeaders
			// which can be complicated and we rebuild list from scratch
			if (oBinding.isGrouped() || bCheckGrowingFromScratch) {
				var bFromScratch = true;
				if (aContexts.length > 0) {
					if (this._oContainerDomRef) {
						// check if diff array exists
						if (aContexts.diff) {
							// check if the model diff-array is empty
							if (!aContexts.diff.length) {
								// no diff, we do not need to rebuild list when grouping is not changed
								if (this._sGroupingPath == this._getGroupingPath(oBinding)) {
									bFromScratch = false;
								}
							} else {
								// check the diff array and whether rebuild is required
								bFromScratch = false;
								var bFirstAddedItemChecked = false;
								for (var i = 0, l = aContexts.diff.length; i < l; i++) {
									if (aContexts.diff[i].type === "delete") {
										bFromScratch = true;
										break;
									} else if (aContexts.diff[i].type === "insert") {
										if (!bFirstAddedItemChecked && aContexts.diff[i].index !== this._iRenderedDataItems) {
											bFromScratch = true;
											break;
										}
										bFirstAddedItemChecked = true;
										var oClone = fnFactory("", aContexts[aContexts.diff[i].index]);
										oClone.setBindingContext(aContexts[aContexts.diff[i].index], oBindingInfo.model);
										this.addListItem(oClone, true);
									}
								}
							}
						}
						if (bFromScratch) {
							// renderer available - fill the aggregation and render list items
							this.rebuildListItems(aContexts, oBindingInfo, false);
						}
					} else {
						// no renderer - fill only the aggregation
						this.rebuildListItems(aContexts, oBindingInfo, true);
					}
				} else {
					// no context
					this.destroyListItems();
				}

			} else { // no grouping, stable implementation
				if (aContexts.length > 0) {
					if (this._oContainerDomRef) {
						// check if model diff-array exists and execute
						if (aContexts.diff) {
							// if previously grouped
							if (this._sGroupingPath) {
								// we need to remove all GroupHeaders first
								this._oControl.removeGroupHeaders(true);
							}

							this._oRenderManager = sap.ui.getCore().createRenderManager(); // one shared RenderManager for all the items that need to be rendered

							var aItems, oClone, iIndex, iFlushIndex = -1, iLastIndex = -1;
							for (var i = 0, l = aContexts.diff.length; i < l; i++) {
								iIndex = aContexts.diff[i].index;

								if (aContexts.diff[i].type === "delete") { // case 1: element is removed
									if (iFlushIndex !== -1) {
										this._oRenderManager.flush(this._oContainerDomRef, false, this._getDomIndex(iFlushIndex));
										iFlushIndex = -1;
										iLastIndex = -1;
									}

									aItems = this._oControl.getItems(true);
									this.deleteListItem(aItems[iIndex]);
								} else if (aContexts.diff[i].type === "insert") { // case 2: element is added
									oClone = fnFactory("", aContexts[iIndex]);
									oClone.setBindingContext(aContexts[iIndex], oBindingInfo.model);

									// start a new burst of subsequent items
									if (iFlushIndex === -1) {
										iFlushIndex = iIndex; // the subsequent run/burst of items needs to be inserted at this position

									// otherwise check for the end of a burst of subsequent items
									} else if (iLastIndex >= 0 && iIndex !== iLastIndex + 1) { // this item is not simply appended to the last one that has been inserted, so we need to flush what we have so far
										this._oRenderManager.flush(this._oContainerDomRef, false, this._getDomIndex(iFlushIndex));
										iFlushIndex = iIndex;
									}

									this.insertListItem(oClone, iIndex);
									iLastIndex = iIndex;
								}
							}
							// update context on all items after applying diff
							aItems = this._oControl.getItems(true);
							for (var i = 0, l = aContexts.length; i < l; i++) {
								aItems[i].setBindingContext(aContexts[i], oBindingInfo.model);
							}

							if (iFlushIndex !== -1) {
								this._oRenderManager.flush(this._oContainerDomRef, false, this._getDomIndex(iFlushIndex));
							}
							// clean up the shared RenderManager
							this._oRenderManager.destroy();
							delete this._oRenderManager; // make sure there is no instance anymore

						} else {
							// most likely a new binding is set in this case - therefore remove all items and fill again
							this.rebuildListItems(aContexts, oBindingInfo, false);
						}
					} else {
						// no renderer - fill only the aggregation
						this.rebuildListItems(aContexts, oBindingInfo, true);
					}
				} else {
					// there is no context
					this.destroyListItems();
				}

			}

			// remove dom cache
			this._oContainerDomRef = null;

			// remember the old grouping path
			this._sGroupingPath = this._getGroupingPath(oBinding);

			// if no request is ongoing, trigger growing finished event
			if (!this._bDataRequested) {
				this._onAfterPageLoaded(sChangeReason);
			}
		},

		/**
		 * hide or show loading trigger according to list item count.
		 */
		_updateTrigger : function() {
			// check trigger list DOM first
			var oTriggerListDomRef = document.getElementById(this._oControl.getId() + "-triggerList");
			if (!oTriggerListDomRef) {
				return;
			}

			// switch between more button and loading 
			var bHasScrollbars = this._getHasScrollbars();
			var bHasScrollToLoad = this._oControl.getGrowingScrollToLoad();
			this._checkTriggerType(bHasScrollToLoad, bHasScrollbars);

			// hide trigger if no items or maximum of items reached
			var iMaxItems = this._oControl.getMaxItemsCount();
			var iItemsLength = this._oControl.getItems(true).length;
			var sDisplay = (!iItemsLength || !this._iItemCount || this._iItemCount >= iMaxItems) ? "none" : "block";

			// if we are in the popover then hiding the trigger removes focus and closes popup
			if (sap.ui.Device.system.desktop && sDisplay == "none" && oTriggerListDomRef.contains(document.activeElement)) {
				jQuery(oTriggerListDomRef).closest("[data-sap-ui-popup]").focus();
			}

			// update trigger info
			oTriggerListDomRef.style.display = sDisplay;
			this._oControl.$("trigger-itemInfo").text(this._getListItemInfo());
		},

		/**
		 * show loading indicator
		 */
		_showIndicator : function() {
			var bHasScrollToLoad = this._oControl.getGrowingScrollToLoad(),
				bHasScrollbars = this._getHasScrollbars();

			if (bHasScrollToLoad && bHasScrollbars) {

				this._checkTriggerType(bHasScrollToLoad, bHasScrollbars);

				var $trigger = this._oControl.$("triggerList").css("display", "block");
				if (sap.ui.Device.support.touch && this._oScrollDelegate) {
					if (this._oScrollDelegate.getMaxScrollTop() - this._oScrollDelegate.getScrollTop() < $trigger.height()) {
						this._oScrollDelegate.refresh();
						this._oScrollDelegate.scrollTo(this._oScrollDelegate.getScrollLeft(), this._oScrollDelegate.getMaxScrollTop());
					}
				}
			} else {
				this._oControl.$("trigger-busyIndicator").addClass("sapMGrowingListBusyIndicatorVisible");
			}

			this._getBusyIndicator().setVisible(true);
		},

		/**
		 * Emties the trigger and puts the Loading indicator in it, without rerendering the whole control.
		 *
		 * If scroll to load is disabled, this will do nothing.
		 * If the button is shown and there are scrollbars, the loading indicator will show up.
		 * If the button is not shown and there are no scrollbars, the button will show up.
		 *
		 * @private
		 */
		_checkTriggerType : function(bHasScrollToLoad, bHasScrollbars) {

			if (!bHasScrollToLoad) {
				this._showsTrigger = this._showsLoading = false;
				return;
			}

			if (!this._showsLoading && bHasScrollbars) {
				this._showsLoading = true;
				this._showsTrigger = false;
				this._switchTriggerWithLoadingIndicator(true);
			}

			if (!this._showsTrigger && !bHasScrollbars) {
				this._showsTrigger = true;
				this._showsLoading = false;
				this._switchTriggerWithLoadingIndicator(false);
			}
		},

		/**
		 * Empties the trigger and puts the Loading indicator in it, without rerendering the whole control.
		 *
		 * @private
		 */
		_switchTriggerWithLoadingIndicator : function(bShowLoading) {
			var rm = sap.ui.getCore().createRenderManager(),
				oActionItem,
				$TriggerList = this._oControl.$("triggerList");

			if (bShowLoading) {
				oActionItem = this._getLoading();
			} else {
				oActionItem = this._getTrigger();
			}

			$TriggerList.empty();
			rm.render(oActionItem, $TriggerList[0]);
		},

		/**
		 * hide loading indicator
		 */
		_hideIndicator : function() {
			jQuery.sap.delayedCall(0, this, function() {
				if (this._oControl) {	// maybe control is already destroyed
					this._getBusyIndicator().setVisible(false);
					if (this._oControl.getGrowingScrollToLoad() && this._getHasScrollbars()) {
						this._oControl.$("triggerList").css("display", "none");
					} else {
						this._oControl.$("trigger-itemInfo").html(this._getListItemInfo());
						this._oControl.$("trigger-busyIndicator").removeClass("sapMGrowingListBusyIndicatorVisible");
					}
				}
			});
		},

		/**
		 * ScrollDelegate call this method to inform new page needs to load
		 */
		_triggerLoadingByScroll : function() {
			this.requestNewPage();
		}
	});


	return GrowingEnablement;

}, /* bExport= */ true);
