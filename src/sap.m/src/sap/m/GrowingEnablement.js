/*!
 * ${copyright}
 */

// Provides class sap.m.GrowingEnablement
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/Lib',
	'sap/ui/core/RenderManager', // Future TODO: replace the creation of new RenderManager instance
	'sap/ui/core/format/NumberFormat',
	'sap/m/library',
	'sap/ui/model/ChangeReason',
	'sap/ui/base/ManagedObjectMetadata',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/core/HTML',
	'sap/m/CustomListItem',
	'sap/base/security/encodeXML',
	"sap/ui/thirdparty/jquery"
],
	function(
		BaseObject,
		Library,
		RenderManager,
		NumberFormat,
		library,
		ChangeReason,
		ManagedObjectMetadata,
		ManagedObjectObserver,
		HTML,
		CustomListItem,
		encodeXML,
		jQuery
	) {
	"use strict";


	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;


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
			this._iLimit = iRenderedItemsLength;
			this._bLoading = false;
			this._bDataRequested = false;
			this._bSkippedItemsUpdateUntilDataReceived = false;
			this._iLastItemsCount = 0;
			this._iTriggerTimer = 0;
			this._aChunk = [];
			this._oRM = null;
			this._aItemsPool = [];
		},

		/**
		 * Destroys this GrowingEnablement delegate.
		 * This function must be called by the control which uses this delegate in the <code>exit</code> function.
		 */
		destroy : function() {
			if (this._oTrigger) {
				this._oTrigger.destroy();
				this._oTrigger = null;
			}
			if (this._oScrollDelegate) {
				this._oScrollDelegate.setGrowingList(null);
				this._oScrollDelegate = null;
			}
			if (this._oRM) {
				this._oRM.destroy();
				this._oRM = null;
			}
			if (this._oObserver) {
				this._oObserver.disconnect();
				this._oObserver = null;
			}

			this.clearItemsPool();
			this._oControl.$("triggerList").remove();
			this._oControl.bUseExtendedChangeDetection = false;
			this._oControl.removeDelegate(this);
			this._oControl = null;
		},

		// renders load more trigger
		render : function(oRm) {
			oRm.openStart("div", this._oControl.getId() + "-triggerList");
			oRm.class("sapMListUl").class("sapMGrowingList");
			oRm.style("display", "none");
			oRm.openEnd();
			oRm.renderControl(this._getTrigger());
			oRm.close("div");
		},

		onAfterRendering : function() {
			var oControl = this._oControl;
			if (oControl.getGrowingScrollToLoad()) {
				var oScrollDelegate = library.getScrollDelegate(oControl);
				if (oScrollDelegate) {
					this._oScrollDelegate = oScrollDelegate;
					oScrollDelegate.setGrowingList(this.onScrollToLoad.bind(this), oControl.getGrowingDirection(), this._updateTrigger.bind(this, false));
				}
			} else if (this._oScrollDelegate) {
				this._oScrollDelegate.setGrowingList(null);
				this._oScrollDelegate = null;
			}

			if (!this._bLoading) {
				this._updateTriggerDelayed(false);
			}
		},

		onsapdown: function(oEvent) {
			// Navigate from last item to growing trigger and vice versa via arrow keys
			var oControl = this._oControl;
			if (oControl._oItemNavigation && !oEvent.isMarked()) {
				var oItemNavigation = oControl._oItemNavigation;
				var aItemDomRefs = oItemNavigation.getItemDomRefs();
				var oFirstItemDomRef = aItemDomRefs[0];
				var oLastItemDomRef = aItemDomRefs[aItemDomRefs.length - oItemNavigation.iColumns];
				var sDir = oControl.getGrowingDirection();
				if ((sDir != ListGrowingDirection.Upwards && oEvent.type == "sapdown" && oEvent.target === oLastItemDomRef)
						|| (sDir == ListGrowingDirection.Upwards && oEvent.type == "sapup" && oEvent.target === oFirstItemDomRef)) {
					var $Trigger = oControl.$("trigger");
					$Trigger.trigger("focus");
					oEvent.setMarked();
					oEvent.stopImmediatePropagation(); // to prevent ItemNavigation
				} else if (((sDir == ListGrowingDirection.Upwards && oEvent.type == "sapdown")
						|| (sDir != ListGrowingDirection.Upwards && oEvent.type == "sapup"))
						&& oEvent.target === oControl.getDomRef("trigger")) {
					jQuery(oEvent.type == "sapdown" ? oFirstItemDomRef : oLastItemDomRef).trigger("focus");
					oEvent.setMarked();
					oEvent.stopImmediatePropagation(); // to prevent ItemNavigation
				}
			}
		},

		onsapup: function(oEvent) {
			return this.onsapdown(oEvent);
		},

		setTriggerText : function(sText) {
			this._oControl.$("triggerText").text(sText);
		},

		// reset paging on rebind
		reset : function(bPageSizeOnly) {
			this._iLimit = 0;

			if (bPageSizeOnly) {
				return;
			}

			// destroy the observer on rebind
			if (this._oObserver) {
				this._oObserver.disconnect();
				this._oObserver = null;
			}

			// if the template invalidates, then also clear the itemsPool
			this.clearItemsPool();

			// if factory function is used we do not activate the replace option of the extended change detection
			var oBindingInfo = this._oControl.getBindingInfo("items");
			this._oControl.oExtendedChangeDetectionConfig = (!oBindingInfo || !oBindingInfo.template) ? null : {replace: true};
		},

		clearItemsPool: function() {
			this._aItemsPool.forEach(function(oItem) {
				oItem.destroy();
			});
			this._aItemsPool = [];
		},

		// determines growing reset with binding change reason
		// according to UX sort/filter/context should reset the growing
		shouldReset : function(sChangeReason) {
			var mChangeReason = ChangeReason;

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

		onScrollToLoad: function() {
			if (this._bLoading) {
				return;
			}

			if (this._oControl.getGrowingDirection() == ListGrowingDirection.Upwards) {
				var oScrollDelegate = this._oScrollDelegate;
				this._oScrollPosition = {
					left : oScrollDelegate.getScrollLeft(),
					top : oScrollDelegate.getScrollHeight()
				};
			}

			this.requestNewPage();
		},

		// call to request new page
		requestNewPage : function() {
			if (!this._oControl || this._bLoading) {
				return;
			}

			// if max item count not reached or if we do not know the count
			var oBinding = this._oControl.getBinding("items");
			if (oBinding && !oBinding.isLengthFinal() || this._iLimit < this._oControl.getMaxItemsCount()) {
				// block busy indicator animation from the ListBase
				this._oControl._bBusy = true;
				this._iLimit += this._oControl.getGrowingThreshold();
				this._updateTriggerDelayed(true);
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
			if (!this._oControl) {
				return;
			}

			this._bLoading = false;
			this._updateTriggerDelayed(false);
			this._oControl.onAfterPageLoaded(this.getInfo(), sChangeReason);
		},

		// created and returns load more trigger
		_getTrigger : function() {
			var sTriggerID = this._oControl.getId() + "-trigger",
				sTriggerText = this._oControl.getGrowingTriggerText();

			sTriggerText = sTriggerText || Library.getResourceBundleFor("sap.m").getText("LOAD_MORE_DATA");
			this._oControl.addNavSection(sTriggerID);

			if (this._oTrigger) {
				this.setTriggerText(sTriggerText);
				return this._oTrigger;
			}

			// The growing button is changed to span tag as h1 tag was semantically incorrect.
			this._oTrigger = new CustomListItem({
				id: sTriggerID,
				busyIndicatorDelay: 0,
				type: ListType.Active,
				content: new HTML({
					content:	'<div class="sapMGrowingListTrigger">' +
									'<div class="sapMSLIDiv sapMGrowingListTriggerText">' +
										'<span class="sapMSLITitle" id="' + sTriggerID + 'Text">' + encodeXML(sTriggerText) + '</span>' +
									'</div>' +
									'<div class="sapMGrowingListDescription sapMSLIDescription" id="' + sTriggerID + 'Info"></div>' +
									'<div class="sapUiInvisibleText" id="' + sTriggerID + 'Message"></div>' +
								'</div>'
				})
			});

			// stop the eventing between item and the list
			this._oTrigger.getList = function() {};
			// defines the tag name
			this._oTrigger.TagName = "div";
			// trigger should not be mapped to groupHeader when setParent is called, hence overwrite this method
			this._oTrigger.setGroupedItem = function() {};

			this._oTrigger.setParent(this._oControl, null, true).attachPress(this.requestNewPage, this).addDelegate({
				onsapenter : function(oEvent) {
					this.requestNewPage();
					oEvent.preventDefault();
				},
				onsapspace : function(oEvent) {
					this._bSpaceKeyPressed = true;
					this._oTrigger.setActive(true);
					oEvent.preventDefault();
				},
				onkeydown : function(oEvent) {
					this._bSpaceKeyCancelled = this._bSpaceKeyCancelled || (oEvent.shiftKey || oEvent.which == 27 /** KeyCodes.ESCAPE */);
				},
				onkeyup: function(oEvent) {
					this._bSpaceKeyPressed && !this._bSpaceKeyCancelled && this.requestNewPage();
					this._bSpaceKeyPressed = this._bSpaceKeyCancelled = false;
					this._oTrigger.setActive(false);
				},
				onAfterRendering : function(oEvent) {
					var $oTrigger = this._oTrigger.$();
					// aria-selected is added as the CustomListItem type="Active"
					// aria-selected should be removed as it is not allowed with role="button"
					$oTrigger.removeAttr("aria-selected");
					// aria-roledescription not required for growing trigger
					$oTrigger.removeAttr("aria-roledescription");
					// aria-posinset & aria-setsize removed as it is not allowed with role="button"
					$oTrigger.removeAttr("aria-posinset").removeAttr("aria-setsize");
					$oTrigger.attr({
						"tabindex": 0,
						"role": "button",
						"aria-labelledby": sTriggerID + "Text",
						"aria-describedby": sTriggerID + "Message"
					});
				}
			}, this);

			return this._oTrigger;
		},

		// returns the growing information to be shown at the growing button
		_getListItemInfo : function() {
			var aCounts = this._getItemCounts();
			var oFormat = NumberFormat.getFloatInstance();
			return "[ " + oFormat.format(aCounts[0]) + " / " + oFormat.format(aCounts[1]) + " ]";
		},

		// returns the item counts for the growing information (current vs. total)
		_getItemCounts : function() {
			return [this._iRenderedDataItems, this._oControl.getMaxItemsCount()];
		},

		// returns the first sorters grouping path when available
		_getGroupingPath : function(oBinding) {
			var aSorters = oBinding.aSorters || [];
			var oSorter = aSorters[0] || {};
			return (oSorter.fnGroup) ? oSorter.sPath || "" : undefined;
		},

		// if table has pop-in then we have two rows for one item
		_getDomIndex : function(vIndex) {
			if (typeof vIndex != "number") {
				return vIndex;
			}

			if (this._oControl.hasPopin && this._oControl.hasPopin()) {
				return (vIndex * 2);
			}

			return vIndex;
		},

		// determines if the scroll container of the list has enough scrollable area to hide the growing button
		_getHasScrollbars : function() {
			if (!this._oScrollDelegate) {
				return false;
			}

			// 32 is the minimum height of the item
			if (this._getDomIndex(this._iRenderedDataItems) > (window.innerHeight / 32)) {
				return true;
			}

			// after growing-button gets hidden scroll container should still be scrollable
			return this._oScrollDelegate.getMaxScrollTop() > this._oControl.getDomRef("triggerList").offsetHeight;
		},

		// destroy all items in the list and cleanup
		destroyListItems : function(bSuppressInvalidate) {
			this._oControl.destroyItems(bSuppressInvalidate);
			this._iRenderedDataItems = 0;
			this._aChunk = [];
		},

		// appends single list item to the list
		addListItem : function(oContext, oBindingInfo, bSuppressInvalidate) {

			var oControl = this._oControl,
				oBinding = oBindingInfo.binding,
				oItem = this.createListItem(oContext, oBindingInfo);

			if (oBinding.isGrouped()) {
				// creates group header if need
				var aItems = oControl.getItems(true),
					oLastItem = aItems[aItems.length - 1],
					sModelName = oBindingInfo.model,
					oGroupInfo = oBinding.getGroup(oItem.getBindingContext(sModelName));

				if (oLastItem && oLastItem.isGroupHeader()) {
					oControl.removeAggregation("items", oLastItem, true);
					oControl.setLastGroupHeader(oLastItem);
					this._fnAppendGroupItem = this.appendGroupItem.bind(this, oGroupInfo, oLastItem, bSuppressInvalidate);
					oLastItem = aItems[aItems.length - 1];
				}

				if (!oLastItem || oGroupInfo.key !== oBinding.getGroup(oLastItem.getBindingContext(sModelName)).key) {
					// get the groupHeader control groupHeaderFactory or create an sap.m.GroupHeaderListItem instance with the oGroupInfo
					// required for setLastGroupHeader to correctly set the _oLastGroupHeader. The created groupHeader is later reused
					var oGroupHeader = oBindingInfo.groupHeaderFactory ? oBindingInfo.groupHeaderFactory(oGroupInfo) : oControl.getGroupHeaderTemplate(oGroupInfo);

					if (oControl.getGrowingDirection() == ListGrowingDirection.Upwards) {
						this.applyPendingGroupItem();
						oControl.setLastGroupHeader(oGroupHeader);
						this._fnAppendGroupItem = this.appendGroupItem.bind(this, oGroupInfo, oGroupHeader, bSuppressInvalidate);
					} else {
						this.appendGroupItem(oGroupInfo, oGroupHeader, bSuppressInvalidate);
					}
				}

				var oLastGroupHeader = oControl.getLastGroupHeader();
				if (oLastGroupHeader) {
					// required to update the group header aria-owns attribute
					oLastGroupHeader.invalidate();
				}
			}

			oControl.addAggregation("items", oItem, bSuppressInvalidate);
			if (bSuppressInvalidate) {
				this._aChunk.push(oItem);
			}
		},

		applyPendingGroupItem: function() {
			if (this._fnAppendGroupItem) {
				this._fnAppendGroupItem();
				this._fnAppendGroupItem = undefined;
			}
		},

		appendGroupItem: function(oGroupInfo, oGroupHeader, bSuppressInvalidate) {
			oGroupHeader = this._oControl.addItemGroup(oGroupInfo, oGroupHeader, bSuppressInvalidate);
			if (bSuppressInvalidate) {
				this._aChunk.push(oGroupHeader);
			}
		},

		fillItemsPool: function() {
			if (!this._oControl || !this._iLimit || this._iRenderedDataItems || this._aItemsPool.length) {
				return;
			}

			var oBindingInfo = this._oControl.getBindingInfo("items");
			var oTemplate = oBindingInfo.template;
			if (!oTemplate) {
				return;
			}

			// limit the number of items in the pool to 100, since have too many items in the pool is also not performant
			for (var i = 0, iLimit = Math.min(this._iLimit, 100); i < iLimit; i++) {
				this._aItemsPool.push(oBindingInfo.factory());
			}

			if (oTemplate.getCells) {
				// items pool is not usable when the template is changed e.g. p13n removes/insert cells instead of rebind
				this._oObserver = new ManagedObjectObserver(this.clearItemsPool.bind(this));
				this._oObserver.observe(oTemplate, { aggregations: ["cells"] });
			}
		},

		// creates list item from the factory
		createListItem : function(oContext, oBindingInfo) {
			this._iRenderedDataItems++;

			if (this._aItemsPool.length) {
				return this._aItemsPool.shift().setBindingContext(oContext, oBindingInfo.model);
			}

			return GrowingEnablement.createItem(oContext, oBindingInfo);
		},

		// update context on all items except group headers
		updateItemsBindingContext :  function(aContexts, oModel) {
			if (!aContexts.length) {
				return;
			}

			var aItems = this._oControl.getItems(true);
			for (var i = 0, c = 0, oItem; i < aItems.length; i++) {
				oItem = aItems[i];

				// group headers are not in binding context
				if (!oItem.isGroupHeader()) {
					oItem.setBindingContext(aContexts[c++], oModel);
				}
			}
		},

		// render all the collected items in the chunk and flush them into the DOM
		// vInsert whether to append (true) or replace (falsy) or to insert at a certain position (int)
		applyChunk : function(vInsert, bAsync) {
			if (!this._oControl) {
				return;
			}

			this.applyPendingGroupItem();

			var iTimer = this._iChunkTimer;
			var iLength = this._aChunk.length;
			var oDomRef = this._oControl.getItemsContainerDomRef();

			if (iTimer) {
				this._iChunkTimer = clearTimeout(iTimer);
			}

			if (!iLength || !oDomRef || !this._oControl.shouldRenderItems()) {
				this._aChunk = [];
				return;
			}

			if (iTimer && !bAsync) {
				this._oControl.invalidate();
				this._aChunk = [];
				return;
			}

			if (this._oControl.getGrowingDirection() == ListGrowingDirection.Upwards) {
				this._aChunk.reverse();
				if (vInsert === true) {
					vInsert = 0;
				} else if (typeof vInsert == "number") {
					vInsert = this._iRenderedDataItems - iLength - vInsert;
				}
			}

			this._oRM = this._oRM || new RenderManager(); // Future TODO: replace the creation of new RenderManager instance
			for (var i = 0; i < iLength; i++) {
				this._oRM.renderControl(this._aChunk[i]);
			}

			this._bHadFocus = (vInsert == false) && oDomRef.contains(document.activeElement);
			this._oRM.flush(oDomRef, false, this._getDomIndex(vInsert));
			this._bHadFocus && this._oControl.focus();
			if (!this._oControl.getBusy()) {
				this._bHadFocus = false;
			}
			this._aChunk = [];
		},

		// async version of applyChunk
		applyChunkAsync : function(vInsert) {
			if (this._bApplyChunkAsync) {
				this._iChunkTimer = setTimeout(this.applyChunk.bind(this, vInsert, true));
			} else {
				this.applyChunk(vInsert);
			}
		},

		// add multiple items to the list via BindingContext
		addListItems : function(aContexts, oBindingInfo, bSuppressInvalidate) {
			for (var i = 0; i < aContexts.length; i++) {
				this.addListItem(aContexts[i], oBindingInfo, bSuppressInvalidate);
			}
		},

		// destroy all the items and create from scratch
		rebuildListItems : function(aContexts, oBindingInfo, bSuppressInvalidate) {
			this.destroyListItems(bSuppressInvalidate);
			this.addListItems(aContexts, oBindingInfo, bSuppressInvalidate);
			if (bSuppressInvalidate) {
				this.applyChunkAsync(false);
			} else {
				this.applyPendingGroupItem();
			}
		},

		// inserts a single list item
		insertListItem : function(oContext, oBindingInfo, iIndex) {
			var oItem = this.createListItem(oContext, oBindingInfo);
			this._oControl.insertAggregation("items", oItem, iIndex, true);
			this._aChunk.push(oItem);
		},

		// destroy a single list item
		deleteListItem : function(iIndex) {
			var oItem = this._oControl.getItems(true)[iIndex];
			if (oItem) {
				this._oControl.getItems(true)[iIndex].destroy(true);
				this._iRenderedDataItems--;
			}
		},

		/**
		 * refresh items only for OData model.
		 */
		refreshItems : function(sChangeReason) {
			var oControl = this._oControl;
			var oBinding = oControl.getBinding("items");

			// the value of the ODataV4PropertyBinding created during the template clone gets resolved asynchronously
			this._bApplyChunkAsync = oBinding.isA("sap.ui.model.odata.v4.ODataListBinding") && oControl.checkGrowingFromScratch();

			// if the data is not already requested then let the updateStarted event to be fired
			if (!this._bDataRequested) {
				this._bDataRequested = true;
				this._onBeforePageLoaded(sChangeReason);
			}

			// set iItemCount to initial value if not set or no items at the control yet
			if (!this._iLimit || this.shouldReset(sChangeReason) || !oControl.getItems(true).length) {
				this._iLimit = oControl.getGrowingThreshold();
			}

			// pre-initialize items during the request is ongoing (but not for v1 ODataModel, since it is synchronous)
			if (!oBinding.isA("sap.ui.model.odata.ODataListBinding")) {
				if (oControl._bBusy) {
					setTimeout(this.fillItemsPool.bind(this));
				} else {
					oBinding.attachEventOnce("dataRequested", function() {
						setTimeout(this.fillItemsPool.bind(this));
					}, this);
				}
			}

			// send the request to get the context
			oBinding.getContexts(0, this._iLimit);
		},

		/**
		 * update control aggregation if contexts are already available
		 * or send a request to get the contexts in case of ODATA model.
		 */
		updateItems : function(sChangeReason) {
			var oControl = this._oControl,
				oBinding = oControl.getBinding("items"),
				oBindingInfo = oControl.getBindingInfo("items"),
				aItems = oControl.getItems(true),
				sGroupingPath = this._sGroupingPath;

			// set limit to initial value if not set yet or no items at the control yet
			if (!this._iLimit || this.shouldReset(sChangeReason) || !aItems.length) {
				this._iLimit = oControl.getGrowingThreshold();
			}

			this._bSkippedItemsUpdateUntilDataReceived = false;

			// fire growing started event if data was requested this is a followup call of updateItems
			if (this._bDataRequested) {
				this._bDataRequested = false;
			} else {
				this._onBeforePageLoaded(sChangeReason);
			}

			// get the context from the binding or request will be sent
			var aContexts = oBinding.getContexts(0, this._iLimit) || [];

			// if getContexts did cause a request to be sent, set the internal flag so growing started event is not fired again
			if (aContexts.dataRequested) {
				this._bDataRequested = true;

				// a partial response may already be contained, so only return here without updating the list when diff is empty
				if (aContexts.diff && !aContexts.diff.length) {
					if (sChangeReason === ChangeReason.Context) {
						this._bSkippedItemsUpdateUntilDataReceived = true;
					}
					return;
				}
			}

			// let the grouping path to be stored
			this._sGroupingPath = this._getGroupingPath(oBinding);

			// aContexts.diff ==> undefined : New data we should build from scratch
			// aContexts.diff ==> [] : There is no diff, means data did not changed at all
			// aContexts.diff ==> [{index: 0, type: "delete"}, {index: 1, type: "insert"},...] : Run the diff logic
			var aDiff = aContexts.diff;

			// process the diff
			if (!aContexts.length) {
				// no context, destroy list items
				this.destroyListItems();
			} else if (!aItems.length && !oControl.getItemsContainerDomRef()) {
				// no dom ref for compatibility reason start from scratch
				this.rebuildListItems(aContexts, oBindingInfo);
			} else if (!aDiff || !aItems.length && aDiff.length) {
				// new records need to be applied from scratch
				this.rebuildListItems(aContexts, oBindingInfo, oControl.shouldGrowingSuppressInvalidation());
			} else {
				// diff handling case for grouping and merging
				var bFromScratch = false, vInsertIndex = true;
				if (oBinding.isGrouped() || oControl.checkGrowingFromScratch()) {

					if (sGroupingPath != this._sGroupingPath) {
						// grouping is changed so we need to rebuild the list for the group headers
						bFromScratch = true;
					} else {
						// append items if possible
						for (var i = 0; i < aDiff.length; i++) {
							var oDiff = aDiff[i],
								oContext = aContexts[oDiff.index];

							if (oDiff.type == "delete" || oDiff.type == "replace") {
								// group header may need to be deleted as well
								bFromScratch = true;
								break;
							} else if (oDiff.index != this._iRenderedDataItems) {
								// this item is not appended
								bFromScratch = true;
								break;
							} else {
								// the item is appended
								this.addListItem(oContext, oBindingInfo, true);
							}
						}
					}

				} else {

					if (sGroupingPath != undefined && this._sGroupingPath == undefined) {
						// if it was already grouped then we need to remove group headers first
						oControl.removeGroupHeaders(true);
					}

					vInsertIndex = -1;
					var iLastInsertIndex = -1;
					for (var i = 0; i < aDiff.length; i++) {
						var oDiff = aDiff[i],
							iDiffIndex = oDiff.index,
							oContext = aContexts[iDiffIndex];

						if (oDiff.type == "delete") {
							if (vInsertIndex != -1) {
								// this record is deleted while the chunk is getting build
								this.applyChunk(vInsertIndex);
								iLastInsertIndex = -1;
								vInsertIndex = -1;
							}

							this.deleteListItem(iDiffIndex);
						} else if (oDiff.type == "insert") {
							if (vInsertIndex == -1) {
								// the subsequent of items needs to be inserted at this position
								vInsertIndex = iDiffIndex;
							} else if (iLastInsertIndex > -1 && iDiffIndex != iLastInsertIndex + 1) {
								// this item is not simply appended to the last one but has been inserted
								this.applyChunk(vInsertIndex);
								vInsertIndex = iDiffIndex;
							}

							this.insertListItem(oContext, oBindingInfo, iDiffIndex);
							iLastInsertIndex = iDiffIndex;
						}
					}
				}

				if (bFromScratch) {
					this.rebuildListItems(aContexts, oBindingInfo, true);
				} else {
					// set the binding context of items inserting/deleting entries shifts the index of all following items
					this.updateItemsBindingContext(aContexts, oBindingInfo.model);
					this.applyChunkAsync(vInsertIndex);
				}
			}

			if (!this._bDataRequested) {
				this._onAfterPageLoaded(sChangeReason);
			}
		},

		_onBindingDataReceivedListener: function(oEvent) {
			if (this._bSkippedItemsUpdateUntilDataReceived && !oEvent.getParameter("data") /* request failed */) {
				this._bSkippedItemsUpdateUntilDataReceived = false;
				this.destroyListItems();
				this._onAfterPageLoaded();
			}
		},

		_updateTriggerDelayed: function(bLoading) {
			if (this._oControl.getGrowingScrollToLoad()) {
				this._iTriggerTimer && clearTimeout(this._iTriggerTimer);
				this._iTriggerTimer = setTimeout(this._updateTrigger.bind(this, bLoading));
			} else {
				this._updateTrigger(bLoading);
			}
		},

		// updates the trigger state
		_updateTrigger : function(bLoading) {
			var oTrigger = this._oTrigger,
				oControl = this._oControl,
				bVisibleItems = oControl && oControl.getVisibleItems().length > 0,
				oBinding = oControl && oControl.getBinding("items");

			// If there are no visible columns or items then also hide the trigger.
			if (!oTrigger || !oControl || !bVisibleItems || !oBinding || !oControl.shouldRenderItems() || !oControl.getDomRef()) {
				this._bHadFocus = false;
				return;
			}

			// update busy state
			oTrigger.setBusy(bLoading);
			oTrigger.$().toggleClass("sapMGrowingListBusyIndicatorVisible", bLoading);

			if (bLoading) {
				oTrigger.setActive(false);
				oControl.$("triggerList").css("display", "");
			} else {
				var aItems = oControl.getItems(true),
					iItemsLength = aItems.length,
					iBindingLength = oBinding.getLength() || 0,
					bLengthFinal = oBinding.isLengthFinal(),
					bHasScrollToLoad = oControl.getGrowingScrollToLoad(),
					oTriggerDomRef = oTrigger.getDomRef();

				// put the focus to the newly added item if growing button is pressed
				// or to the item if the focus was on the items container
				if (this._bHadFocus) {
					this._bHadFocus = false;
					jQuery(this._oControl.getNavigationRoot()).trigger("focus");
				} else if (!this._iFocusTimer && oTriggerDomRef && oTriggerDomRef.contains(document.activeElement)) {
					var oFocusTarget = aItems[this._iLastItemsCount] || aItems[iItemsLength - 1] || oControl;
					this._iFocusTimer = setTimeout(function() {
						this._iFocusTimer = 0;
						oFocusTarget.focus();
					}.bind(this));
				}

				// show, update or hide the growing button
				if (!iItemsLength || !this._iLimit || !iBindingLength ||
					(bLengthFinal && this._iLimit >= iBindingLength) ||
					(bHasScrollToLoad && this._getHasScrollbars())) {
					oControl.$("triggerList").css("display", "none");
					oControl.$("listUl").removeClass("sapMListHasGrowing");
				} else {
					var oBundle = Library.getResourceBundleFor("sap.m");
					if (bLengthFinal) {
						oControl.$("triggerInfo").css("display", "block").text(this._getListItemInfo());
						var aCounts = this._getItemCounts();
						oControl.$("triggerMessage").text(oBundle.getText(oControl.isA("sap.m.Table") ? "LOAD_MORE_ROWS_ACC_WITH_COUNT" : "LOAD_MORE_DATA_ACC_WITH_COUNT", aCounts));
					} else {
						oControl.$("triggerMessage").text(oBundle.getText("LOAD_MORE_DATA_ACC"));
					}

					oControl.$("triggerList").css("display", "");
					oControl.$("listUl").addClass("sapMListHasGrowing");
					oTrigger.$().removeClass("sapMGrowingListBusyIndicatorVisible");
					this.adaptTriggerButtonWidth();
				}

				// store the last item count to be able to focus to the newly added item when the growing button is pressed
				this._iLastItemsCount = this._oControl.getItems(true).length;

				// at the beginning we should scroll to last item
				if (bHasScrollToLoad && this._oScrollPosition === undefined && oControl.getGrowingDirection() == ListGrowingDirection.Upwards) {
					this._oScrollPosition = {
						left : 0,
						top : 0
					};
				}

				// scroll to last position
				if (iItemsLength > 0 && this._oScrollPosition) {
					var oScrollDelegate = this._oScrollDelegate,
						oScrollPosition = this._oScrollPosition;

					oScrollDelegate.scrollTo(oScrollPosition.left, oScrollDelegate.getScrollHeight() - oScrollPosition.top);
					this._oScrollPosition = null;
				}
			}
		},

		// adapt trigger button width if dummy col is rendered
		adaptTriggerButtonWidth: function() {
			var oControl = this._oControl;
			if (!oControl.isA("sap.m.Table") || oControl.hasPopin() || !oControl.shouldRenderDummyColumn()) {
				return;
			}

			window.requestAnimationFrame(function() {
				var oTriggerDomRef = this._oTrigger && this._oTrigger.getDomRef();
				if (!oTriggerDomRef) {
					return;
				}

				var sCalWidth = Array.from(oControl.getDomRef("tblHeader").childNodes).slice(0, -1).map(function(oDomRef) {
					var sWidth = oDomRef.style.width;
					if (!sWidth || !sWidth.includes("%")) {
						return oDomRef.getBoundingClientRect().width + "px";
					} else {
						return sWidth;
					}
				}).join(" + ");
				// 1px is borderLeft of the dummyCell
				oTriggerDomRef.style.width = "calc(" + sCalWidth + " + 1px)";
				oTriggerDomRef.classList.add("sapMGrowingListDummyColumn");
			}.bind(this));
		}
	});

	GrowingEnablement.createItem = function(oContext, oBindingInfo, sIdSuffix) {
		var oItem = oBindingInfo.factory(ManagedObjectMetadata.uid(sIdSuffix ? sIdSuffix : "clone"), oContext);
		return oItem.setBindingContext(oContext, oBindingInfo.model);
	};

	return GrowingEnablement;

});