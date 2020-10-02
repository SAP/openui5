/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"./GridItemNavigation"
], function (
	ItemNavigation,
	GridItemNavigation
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
	 * @alias sap.f.delegate.GridItemNavigation
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerItemNavigation = GridItemNavigation.extend("sap.f.delegate.GridContainerItemNavigation", /** @lends sap.f.GridContainerItemNavigation.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

			},
			events: {

			}
		}
	});

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
	 * Handles the <code>focusin</code> event.
	 *
	 * Handles when it is needed to return focus to correct place
	 */
	GridContainerItemNavigation.prototype.onfocusin = function(oEvent) {

		ItemNavigation.prototype.onfocusin.call(this, oEvent);

		var $listItem = jQuery(oEvent.target).closest('.sapFGridContainerItemWrapperNoVisualFocus'),
			oControl,
			aNavigationDomRefs,
			lastFocusedIndex;

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

		if (this._oItemNavigationFocusLeft) {
			this._oItemNavigationFocusLeft = false;

			aNavigationDomRefs = this.getItemDomRefs();
			lastFocusedIndex = this.getFocusedIndex();

			if (this._lastFocusedElement) {
				this._lastFocusedElement.focus();
			} else {
				aNavigationDomRefs[lastFocusedIndex].focus();
			}
		}
	};

	/**
	 * Sets the focus to the item with the given index.
	 *
	 * @param {int} iIndex Index of the item to focus
	 * @param {jQuery.Event} oEvent Event that leads to focus change
	 * @private
	 */
	GridContainerItemNavigation.prototype.focusItem = function(iIndex, oEvent) {
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
			var oItemItemNavigation = jQuery(this.aItemDomRefs[this.iFocusedIndex]).data("sap.INRoot");
			oItemItemNavigation._sFocusEvent = oEvent.type;
		}

		// this is what the GridContainer changes
		if (!this._bIsMouseDown && this.aItemDomRefs.length) {
			this.aItemDomRefs[this.iFocusedIndex].focus();
		}
		/////////////////////////////////////////////

		this.fireEvent(ItemNavigation.Events.AfterFocus, {
			index: iIndex,
			event: oEvent
		});
	};

	return GridContainerItemNavigation;
});
