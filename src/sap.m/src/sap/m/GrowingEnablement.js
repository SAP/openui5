/*!
 * ${copyright}
 */

// Provides class sap.m.GrowingEnablement
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/format/NumberFormat',
	'sap/m/library',
	'sap/ui/model/ChangeReason',
	'sap/ui/base/ManagedObjectMetadata',
	'sap/ui/core/HTML',
	'sap/m/CustomListItem',
	"sap/base/security/encodeXML"
],
	function(
		BaseObject,
		NumberFormat,
		library,
		ChangeReason,
		ManagedObjectMetadata,
		HTML,
		CustomListItem,
		encodeXML
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
			this._sGroupingPath = "";
			this._bDataRequested = false;
			this._oContainerDomRef = null;
			this._iLastItemsCount = 0;
			this._iTriggerTimer = 0;
			this._aChunk = [];
			this._oRM = null;
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

			this._oControl.$("triggerList").remove();
			this._oControl.bUseExtendedChangeDetection = false;
			this._oControl.removeDelegate(this);
			this._oContainerDomRef = null;
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

		setTriggerText : function(sText) {
			this._oControl.$("triggerText").text(sText);
		},

		// reset paging on rebind
		reset : function() {
			this._iLimit = 0;

			// if factory function is used we do not activate the replace option of the extended change detection
			var oBindingInfo = this._oControl.getBindingInfo("items");
			this._oControl.oExtendedChangeDetectionConfig = (!oBindingInfo || !oBindingInfo.template) ? null : {replace: true};
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
			var oTriggerButton = this._oControl.getDomRef("triggerList");

			if (this._bLoading || !oTriggerButton || oTriggerButton.style.display != "none") {
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
				// The GrowingEnablement has its own busy indicator. Do not show the busy indicator, if existing, of the parent control.
				if (this._oControl.getMetadata().hasProperty("enableBusyIndicator")) {
					this._bParentEnableBusyIndicator = this._oControl.getEnableBusyIndicator();
					this._oControl.setEnableBusyIndicator(false);
				}

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
			this._bLoading = false;
			this._updateTriggerDelayed(false);
			this._oControl.onAfterPageLoaded(this.getInfo(), sChangeReason);

			// After the data has been loaded, restore the busy indicator handling of the parent control.
			if (this._oControl.setEnableBusyIndicator) {
				this._oControl.setEnableBusyIndicator(this._bParentEnableBusyIndicator);
			}
		},

		// created and returns load more trigger
		_getTrigger : function() {
			var sTriggerID = this._oControl.getId() + "-trigger",
				sTriggerText = this._oControl.getGrowingTriggerText();

			sTriggerText = sTriggerText || sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LOAD_MORE_DATA");
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
								'</div>'
				})
			}).setParent(this._oControl, null, true).attachPress(this.requestNewPage, this).addDelegate({
				onsapenter : function(oEvent) {
					this.requestNewPage();
					oEvent.preventDefault();
				},
				onsapspace : function(oEvent) {
					this.requestNewPage();
					oEvent.preventDefault();
				},
				onAfterRendering : function(oEvent) {
					var $oTrigger = this._oTrigger.$();
					// aria-selected is added as the CustomListItem type="Active"
					// aria-selected should be removed as it is not allowed with role="button"
					$oTrigger.removeAttr("aria-selected");
					$oTrigger.attr({
						"tabindex": 0,
						"role": "button",
						"aria-labelledby": sTriggerID + "Text" + " " + sTriggerID + "Info"
					});
				}
			}, this);

			// stop the eventing between item and the list
			this._oTrigger.getList = function() {};
			// defines the tag name
			this._oTrigger.TagName = "div";

			return this._oTrigger;
		},

		// returns the growing information to be shown at the growing button
		_getListItemInfo : function() {
			return ("[ " + this._iRenderedDataItems + " / " + NumberFormat.getFloatInstance().format(this._oControl.getMaxItemsCount()) + " ]");
		},

		// returns the first sorters grouping path when available
		_getGroupingPath : function(oBinding) {
			var aSorters = oBinding.aSorters || [];
			var oSorter = aSorters[0] || {};
			return (oSorter.fnGroup) ? oSorter.sPath || "" : "";
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

			if (this._iRenderedDataItems >= 40) {
				return true;
			}

			// after growing-button gets hidden scroll container should still be scrollable
			return this._oScrollDelegate.getMaxScrollTop() > this._oControl.getDomRef("triggerList").clientHeight;
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
					this._fnAppendGroupItem = this.appendGroupItem.bind(this, oGroupInfo, oLastItem, bSuppressInvalidate);
					oLastItem = aItems[aItems.length - 1];
				}

				if (!oLastItem || oGroupInfo.key !== oBinding.getGroup(oLastItem.getBindingContext(sModelName)).key) {
					var oGroupHeader = (oBindingInfo.groupHeaderFactory) ? oBindingInfo.groupHeaderFactory(oGroupInfo) : null;
					if (oControl.getGrowingDirection() == ListGrowingDirection.Upwards) {
						this.applyPendingGroupItem();
						this._fnAppendGroupItem = this.appendGroupItem.bind(this, oGroupInfo, oGroupHeader, bSuppressInvalidate);
					} else {
						this.appendGroupItem(oGroupInfo, oGroupHeader, bSuppressInvalidate);
					}
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

		// creates list item from the factory
		createListItem : function(oContext, oBindingInfo) {
			this._iRenderedDataItems++;
			var oItem = oBindingInfo.factory(ManagedObjectMetadata.uid("clone"), oContext);
			return oItem.setBindingContext(oContext, oBindingInfo.model);
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
		applyChunk : function(vInsert, oDomRef) {
			this.applyPendingGroupItem();

			var iLength = this._aChunk.length;
			if (!iLength) {
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

			oDomRef = oDomRef || this._oContainerDomRef;
			this._oRM = this._oRM || sap.ui.getCore().createRenderManager();

			for (var i = 0; i < iLength; i++) {
				this._oRM.renderControl(this._aChunk[i]);
			}

			this._oRM.flush(oDomRef, false, this._getDomIndex(vInsert));
			this._aChunk = [];
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
				var bHasFocus = this._oContainerDomRef.contains(document.activeElement);
				this.applyChunk(false);
				bHasFocus && this._oControl.focus();
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
			this._oControl.getItems(true)[iIndex].destroy(true);
			this._iRenderedDataItems--;
		},

		/**
		 * refresh items only for OData model.
		 */
		refreshItems : function(sChangeReason) {
			if (!this._bDataRequested) {
				this._bDataRequested = true;
				this._onBeforePageLoaded(sChangeReason);
			}

			// set iItemCount to initial value if not set or no items at the control yet
			if (!this._iLimit || this.shouldReset(sChangeReason) || !this._oControl.getItems(true).length) {
				this._iLimit = this._oControl.getGrowingThreshold();
			}

			// send the request to get the context
			this._oControl.getBinding("items").getContexts(0, this._iLimit);
		},

		/**
		 * update control aggregation if contexts are already available
		 * or send a request to get the contexts in case of ODATA model.
		 */
		updateItems : function(sChangeReason) {
			var oControl = this._oControl,
				oBinding = oControl.getBinding("items"),
				oBindingInfo = oControl.getBindingInfo("items"),
				aItems = oControl.getItems(true);

			// set limit to initial value if not set yet or no items at the control yet
			if (!this._iLimit || this.shouldReset(sChangeReason) || !aItems.length) {
				this._iLimit = oControl.getGrowingThreshold();
			}

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
					return;
				}
			}

			// cache dom ref for internal functions not to lookup again and again
			this._oContainerDomRef = oControl.getItemsContainerDomRef();

			// aContexts.diff ==> undefined : New data we should build from scratch
			// aContexts.diff ==> [] : There is no diff, means data did not changed at all
			// aContexts.diff ==> [{index: 0, type: "delete"}, {index: 1, type: "insert"},...] : Run the diff logic
			var aDiff = aContexts.diff,
				bFromScratch = false,
				vInsertIndex;

			// process the diff
			if (!aContexts.length) {
				// no context, destroy list items
				this.destroyListItems();
			} else if (!this._oContainerDomRef) {
				// no dom ref for compatibility reason start from scratch
				this.rebuildListItems(aContexts, oBindingInfo);
			} else if (!aDiff || !aItems.length && aDiff.length) {
				// new records need to be applied from scratch
				if (oControl.shouldRenderItems()) {
					this.rebuildListItems(aContexts, oBindingInfo, true);
				}
			} else if (oBinding.isGrouped() || oControl.checkGrowingFromScratch()) {

				if (this._sGroupingPath != this._getGroupingPath(oBinding)) {
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
							this.addListItem(oContext, oBindingInfo, true);
							vInsertIndex = true;
						}
					}
				}

			} else {

				if (this._sGroupingPath) {
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
			} else if (this._oContainerDomRef && aDiff) {
				// set the binding context of items inserting/deleting entries shifts the index of all following items
				this.updateItemsBindingContext(aContexts, oBindingInfo.model);
				this.applyChunk(vInsertIndex);
			}

			this._oContainerDomRef = null;
			this._sGroupingPath = this._getGroupingPath(oBinding);

			if (!this._bDataRequested) {
				this._onAfterPageLoaded(sChangeReason);
			}
		},

		_updateTriggerDelayed: function(bLoading) {
			if (this._oControl.getGrowingScrollToLoad()) {
				this._iTriggerTimer && window.cancelAnimationFrame(this._iTriggerTimer);
				this._iTriggerTimer = window.requestAnimationFrame(this._updateTrigger.bind(this, bLoading));
			} else {
				this._updateTrigger(bLoading);
			}
		},

		// updates the trigger state
		_updateTrigger : function(bLoading) {
			var oTrigger = this._oTrigger,
				oControl = this._oControl;

			// If there are no visible columns then also hide the trigger.
			if (!oTrigger || !oControl || !oControl.shouldRenderItems() || !oControl.getDomRef()) {
				return;
			}

			var oBinding = oControl.getBinding("items");
			if (!oBinding) {
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
				if (oTriggerDomRef && oTriggerDomRef.contains(document.activeElement)) {
					(aItems[this._iLastItemsCount] || oControl).focus();
				}

				// show, update or hide the growing button
				if (!iItemsLength || !this._iLimit ||
					(bLengthFinal && this._iLimit >= iBindingLength) ||
					(bHasScrollToLoad && this._getHasScrollbars())) {
					oControl.$("triggerList").css("display", "none");
				} else {
					if (bLengthFinal) {
						oControl.$("triggerInfo").css("display", "block").text(this._getListItemInfo());
					}

					oTrigger.$().removeClass("sapMGrowingListBusyIndicatorVisible");
					oControl.$("triggerList").css("display", "");
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
		}
	});

	return GrowingEnablement;

});