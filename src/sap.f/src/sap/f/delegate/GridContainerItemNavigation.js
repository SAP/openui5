/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"./GridItemNavigation",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/Selectors" // provides jQuery custom selector ":sapTabbable"
], function (
	ItemNavigation,
	GridItemNavigation,
	containsOrEquals,
	jQuery
) {
	"use strict";


	/**
	 * When the GridContainer list item is focused, the control inside received a virtual focus.
	 * @private
	 * @param {sap.ui.core.Control} oControl The control
	 */
	function doVirtualFocusin(oControl) {
		if (oControl.onfocusin) {
			oControl.onfocusin();
		}
	}

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
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerItemNavigation = GridItemNavigation.extend("sap.f.delegate.GridContainerItemNavigation", /** @lends sap.f.delegate.GridContainerItemNavigation.prototype */ {
		constructor: function () {
			GridItemNavigation.apply(this, arguments);

			this.attachEvent(ItemNavigation.Events.FocusLeave, this._onFocusLeave, this);
		},
		metadata: {
			library: "sap.f",
			properties: {

			},
			events: {

			}
		}
	});

	GridContainerItemNavigation.prototype._onFocusLeave = function (oEvent) {

		var currentFocused = this.getFocusedDomRef();
		this.getItemDomRefs().forEach(function (item, index) {
			if (currentFocused === item) {
				var nextFocusableIndex = index++;
				this.setFocusedIndex(nextFocusableIndex);
			}
		}.bind(this));

		this._bFocusLeft = true;
	};

	/**
	 * Forward tab before or after GridContainer
	 *
	 * @protected
	 */
	GridContainerItemNavigation.prototype.forwardTab = function(bForward) {

		var sId = this._getRootDomRefId() + "-" + (bForward ? "after" : "before");

		document.getElementById(sId).focus();
	};

	GridContainerItemNavigation.prototype._getRootDomRefId = function(bForward) {
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
			Tabbables = [];

		// Tabbable elements in wrapper
		var $AllTabbables = $LastFocused.find(":sapTabbable");

		// leave only real tabbable elements in the tab chain, GridContainer and List types have dummy areas
		$AllTabbables.map(function (index, element) {
			if (element.className.indexOf("DummyArea") === -1) {
				Tabbables.push(element);
			}
		});

		var $Tabbables = jQuery(Tabbables),
			focusableIndex = $Tabbables.length === 1 ? 0 : $Tabbables.length  - 1;

		if (focusableIndex === -1 ||
			($Tabbables.control(focusableIndex) && $Tabbables.control(focusableIndex).getId() === oEvent.target.id)) {
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
		if (!oEvent.target.classList.contains("sapFGridContainerItemWrapper")) {
			this._lastFocusedElement = oEvent.target;
			return;
		}

		var sTargetId = oEvent.target.id;
		if (sTargetId === (this._getRootDomRefId() + "-nodata")) {
			this.forwardTab(false);
		}

		// SHIFT + TAB out of the GridContainer should focused the last focused grid cell
		this._lastFocusedElement = null;
		this.forwardTab(false);
	};

	/**
	 * Handles the onmousedown event
	 * Sets the focus to the item if it occured on an item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridContainerItemNavigation.prototype.onmousedown = function(oEvent) {

		this._bIsMouseDown = true;

		ItemNavigation.prototype.onmousedown.call(this, oEvent);
	};

	GridContainerItemNavigation.prototype.onmouseup = function(oEvent) {

		var $listItem = jQuery(oEvent.target).closest('.sapFGridContainerItemWrapperNoVisualFocus'),
			oControl;

		if ($listItem.length) {
			oControl = $listItem.children().eq(0).control()[0];

			// if the list item visual focus is displayed by the currently focused control,
			// move the focus to the list item
			if (oControl && oControl.getFocusDomRef() === document.activeElement) {
				this._lastFocusedElement = null;
				$listItem.trigger("focus");
				doVirtualFocusin(oControl);
			}
		}

		this._bIsMouseDown = false;
	};

	/**
	 * Handles 'dragend' event.
	 * Used to release the mouse down flag. Needed because the browser will not fire 'mouseup' event after drag and drop.
	 */
	GridContainerItemNavigation.prototype.ondragend = function() {
		this._bIsMouseDown = false;
	};

	/**
	 * Handles 'drop' event.
	 * Used to release the mouse down flag. Needed because the browser will not fire 'mouseup' event after drag and drop.
	 */
	GridContainerItemNavigation.prototype.ondrop = function() {
		this._bIsMouseDown = false;
	};

	/**
	 * Handles the <code>focusin</code> event.
	 *
	 * Handles when it is needed to return focus to correct place
	 */
	GridContainerItemNavigation.prototype.onfocusin = function(oEvent) {
		GridItemNavigation.prototype.onfocusin.call(this, oEvent);

		// focus is coming in the grid container from Shift + Tab
		if (oEvent.target === this._getGridInstance().getDomRef("after") && !this.getRootDomRef().contains(oEvent.relatedTarget)) {
			this._focusPrevious(oEvent);
			return;
		}

		var $listItem = jQuery(oEvent.target).closest('.sapFGridContainerItemWrapperNoVisualFocus'),
			oControl,
			aNavigationDomRefs,
			iLastFocusedIndex,
			oLastFocused;

		if ($listItem.length) {
			oControl = $listItem.children().eq(0).control()[0];

			if (oControl) {
				doVirtualFocusin(oControl);

				// if the list item visual focus is displayed by the currently focused control,
				// move the focus to the list item
				if (!this._bIsMouseDown && oControl.getFocusDomRef() === oEvent.target) {
					this._lastFocusedElement = null;
					$listItem.trigger("focus");
					return;
				}
			}
		}

		if (oEvent.target.classList.contains("sapFGridContainerItemWrapper")) {
			this._lastFocusedElement = null;
		}

		if (this._bFocusLeft && !this._bIsMouseDown) {
			aNavigationDomRefs = this.getItemDomRefs();
			iLastFocusedIndex = this.getFocusedIndex();

			oLastFocused = this._lastFocusedElement || aNavigationDomRefs[iLastFocusedIndex];

			if (!containsOrEquals(oLastFocused, oEvent.target)) {
				oLastFocused.focus();
			}
		}

		this._bFocusLeft = false;
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

	/**
	 * Sets the focus to the item with the given index.
	 *
	 * @param {int} iIndex Index of the item to focus
	 * @param {jQuery.Event} oEvent Event that leads to focus change
	 * @private
	 */
	GridContainerItemNavigation.prototype.focusItem = function(iIndex, oEvent) {
		var oItemItemNavigation,
			oInnerControl,
			oInnerControlFocusDomRef;

		if (iIndex === this.iFocusedIndex && this.aItemDomRefs[this.iFocusedIndex] === document.activeElement) {
			this.fireEvent(ItemNavigation.Events.FocusAgain, {
				index: iIndex,
				event: oEvent
			});
			return; // item already focused -> nothing to do
		}

		this.fireEvent(ItemNavigation.Events.BeforeFocus, {
			index: iIndex,
			event: oEvent
		});

		this.setFocusedIndex(iIndex);
		this.bISetFocus = true;

		if (oEvent && jQuery(this.aItemDomRefs[this.iFocusedIndex]).data("sap.INRoot")) {

			// store event type for nested ItemNavigations
			oItemItemNavigation = jQuery(this.aItemDomRefs[this.iFocusedIndex]).data("sap.INRoot");
			oItemItemNavigation._sFocusEvent = oEvent.type;
		}

		// this is what the GridContainer changes
		if (!this._bIsMouseDown && this.aItemDomRefs.length) {
			this.aItemDomRefs[this.iFocusedIndex].focus();

			// make the DOM element that has the outline focus to be visible in the view area
			oInnerControl = jQuery(this.aItemDomRefs[this.iFocusedIndex].firstChild).control()[0];

			if (oInnerControl) {
				oInnerControlFocusDomRef = oInnerControl.getFocusDomRef();

				if (oInnerControlFocusDomRef) {
					this.scrollIntoViewIfNeeded(oInnerControlFocusDomRef);
				}
			}
		}
		/////////////////////////////////////////////

		this.fireEvent(ItemNavigation.Events.AfterFocus, {
			index: iIndex,
			event: oEvent
		});
	};

	GridContainerItemNavigation.prototype.scrollIntoViewIfNeeded = function(oElementDomRef) {
		var oParentDomRef = oElementDomRef.parentElement,
			oContainerRect,
			oElementRect;

		// find the closest parent container with scroll
		while (oParentDomRef &&
			oParentDomRef.offsetWidth >= oParentDomRef.scrollWidth &&
			oParentDomRef.offsetHeight >= oParentDomRef.scrollHeight) {
			oParentDomRef = oParentDomRef.parentElement;
		}

		if (!oParentDomRef) {
			return;
		}

		// we need to check according to its parent
		oParentDomRef = oParentDomRef.parentElement;

		if (!oParentDomRef) {
			return;
		}

		oContainerRect = oParentDomRef.getBoundingClientRect();
		oElementRect = oElementDomRef.getBoundingClientRect();

		if (oElementRect.top < oContainerRect.top ||
			oElementRect.bottom > oContainerRect.bottom ||
			oElementRect.right > oContainerRect.right ||
			oElementRect.left < oContainerRect.left) {
			oElementDomRef.scrollIntoView();
		}
	};

	return GridContainerItemNavigation;
});
