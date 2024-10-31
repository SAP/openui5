/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"./GridItemNavigation",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/Selectors" // provides jQuery custom selector ":sapTabbable"
], function(
	Element,
	GridItemNavigation,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.f.delegate.GridContainerItemNavigation</code>.
	 *
	 * @param {object} [mSettings] Initial settings
	 *
	 * @class
	 * ...
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.f.delegate.GridItemNavigation
	 *
	 * @private
	 * @constructor
	 * @alias sap.f.delegate.GridContainerItemNavigation
	 */
	var GridContainerItemNavigation = GridItemNavigation.extend("sap.f.delegate.GridContainerItemNavigation", /** @lends sap.f.delegate.GridContainerItemNavigation.prototype */ {
	});

	/**
	 * Forward tab before or after GridContainer
	 *
	 * @protected
	 */
	GridContainerItemNavigation.prototype.forwardTab = function(bForward) {
		var sId = this._getRootDomRefId() + "-" + (bForward ? "after" : "before");
		document.getElementById(sId).focus();
	};

	GridContainerItemNavigation.prototype._getRootDomRefId = function() {
		return this.getRootDomRef().getAttribute("id");
	};

	/**
	 * Forward tab to next focusable element inside GridContainer or out of it
	 * This function should be called before tab key is pressed
	 *
	 * @protected
	 */
	GridContainerItemNavigation.prototype.onsaptabnext = function(oEvent) {
		// get the last focused element from the ItemNavigation
		var aNavigationDomRefs = this.getItemDomRefs(),
			iLastFocusedIndex = this.getFocusedIndex(),
			$LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]),
			aTabbables = [];

		// Tabbable elements in wrapper
		var $AllTabbables = $LastFocused.find(":sapTabbable");

		// leave only real tabbable elements in the tab chain, GridContainer and List types have dummy areas
		$AllTabbables.map(function(index, element) {
			if (element.className.indexOf("DummyArea") === -1) {
				aTabbables.push(element);
			}
		});

		var focusableIndex = aTabbables.length - 1;
		var oTabbable = Element.closestTo(aTabbables[focusableIndex]);
		var oClosestTabbable = jQuery(oEvent.target).closest(":sapTabbable").get(0);

		if (focusableIndex === -1 ||
			(oTabbable && (oTabbable.getFocusDomRef() === oClosestTabbable))) {
			this._lastFocusedElement = oEvent.target;
			this.forwardTab(true);
		}
	};

	/**
	 * Forward tab to the previous focusable element inside GridContainer or out of it
	 * This function should be called before shift + tab key is pressed
	 *
	 * @protected
	 */
	GridContainerItemNavigation.prototype.onsaptabprevious = function(oEvent) {
		if (!oEvent.target.classList.contains("sapFGridContainerItemWrapper") &&
			!oEvent.target.parentElement.classList.contains("sapFGridContainerItemWrapper")) {
			this._lastFocusedElement = oEvent.target;
			return;
		}

		var sTargetId = oEvent.target.id;
		if (sTargetId === (this._getRootDomRefId() + "-nodata")) {
			this.forwardTab(false);
		}

		// SHIFT + TAB out of the GridContainer should focus the last focused grid cell
		this._lastFocusedElement = null;
		this.forwardTab(false);
	};

	/**
	 * Handles the <code>focusin</code> event.
	 *
	 * Handles when it is needed to return focus to correct place
	 */
	GridContainerItemNavigation.prototype.onfocusin = function(oEvent) {
		GridItemNavigation.prototype.onfocusin.call(this, oEvent);

		// focus is coming in the grid container from Tab
		if (oEvent.target === this._getGridInstance().getDomRef("before") && !this.getRootDomRef().contains(oEvent.relatedTarget)) {
			var oLastFocused = this._lastFocusedElement || this.getItemDomRefs()[this.getFocusedIndex()];

			if (oLastFocused) {
				oLastFocused.focus();
			}
			return;
		}

		// focus is coming in the grid container from Shift + Tab
		if (oEvent.target === this._getGridInstance().getDomRef("after") && !this.getRootDomRef().contains(oEvent.relatedTarget)) {
			this._focusPrevious(oEvent);
		}

		var oTarget = oEvent.target;

		// update the focused index of item navigation when inner elements are focused
		if (!oTarget.matches(".sapFGridContainerItemWrapper")) {
			var oFocusableItem = oTarget.closest(".sapFGridContainerItemWrapper");

			if (oFocusableItem) {
				if (!oFocusableItem.classList.contains(".sapFGCFocusable")) {
					oFocusableItem = oFocusableItem.firstChild;
				}

				var iFocusableIndex = this.getItemDomRefs().indexOf(oFocusableItem);
				if (iFocusableIndex >= 0) {
					this.setFocusedIndex(iFocusableIndex);
				}
			}
		}
	};

	/**
	 * Focus previously focused element known in item navigation, or focus the first item or its content
	 * @param {jQuery.Event} oEvent the event
	 */
	GridContainerItemNavigation.prototype._focusPrevious = function(oEvent) {
		var aItemDomRefs = this.getItemDomRefs();
		var iLastFocusedIndex = this.getFocusedIndex(); // get the last focused element from the ItemNavigation

		if (!aItemDomRefs.length) {
			return;
		}

		var oFocusCandidate;

		if (iLastFocusedIndex < 0) {
			oFocusCandidate = aItemDomRefs[0];
			this.setFocusedIndex(0);
		} else {
			oFocusCandidate = aItemDomRefs[iLastFocusedIndex];
		}

		var $FocusCandidate = jQuery(oFocusCandidate);
		var $TabbableChildren = $FocusCandidate.find(":sapTabbable");
		$FocusCandidate.add($TabbableChildren).eq(-1).focus();
	};

	GridContainerItemNavigation.prototype.getInnerFocusItem = function (oItem) {
		if (!oItem.classList.contains("sapFGCFocusable")) {
			oItem = oItem.firstChild;
		}

		return oItem;
	};

	GridContainerItemNavigation.prototype.getWrapperItem = function (oItem) {
		if (!oItem.classList.contains("sapFGridContainerItemWrapper")) {
			oItem = oItem.closest(".sapFGridContainerItemWrapper");
		}

		return oItem;
	};

	return GridContainerItemNavigation;
});
