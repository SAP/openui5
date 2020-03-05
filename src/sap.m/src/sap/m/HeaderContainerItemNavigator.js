/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"sap/base/assert",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes"
], function (ItemNavigation, assert, containsOrEquals, KeyCodes) {
	"use strict";

	/**
	 * Creates an instance of HeaderContainerItemNavigator.
	 * @class The header container item navigator is an extension of the {@link sap.ui.core.delegate.ItemNavigation} for {@link sap.m.HeaderContainer}.
	 * @extends sap.ui.core.delegate.ItemNavigation
	 * @since 1.67.0
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.m.HeaderContainerItemNavigator
	 * @private
	 */
	var HeaderContainerItemNavigator = ItemNavigation.extend("sap.m.HeaderContainerItemNavigator");

	/**
	 * Sets the focus to the item with the given index.
	 *
	 * @param {int} iIndex Index of the item to focus
	 * @param {jQuery.Event} oEvent Event that leads to focus change
	 * @private
	 */
	HeaderContainerItemNavigator.prototype.focusItem = function (iIndex, oEvent) {
		if (oEvent.type === "mousedown") {
			// ItemNavigation on mousedown sets dom focus on the one of
			// the items defined in itemDomRefs array (In this case it is
			// the container). That triggers onsapfocusleave and interrupts
			// firing press event on the controls inside of the container
			// (e.g. delete icon on sap.m.Token in sap.m.MultiComboBox).
			// In Header container we want the dom focus to stay on the
			// control inside of the header container on mousedown event.
			// In order to prevent ItemNavigation.focusItem from setting
			// the focus on the container we temporarily replace
			// the container's focus function with empty one.
			var fnFocus = this.aItemDomRefs[iIndex].focus;
			this.aItemDomRefs[iIndex].focus = function() {};
			this._callParent("focusItem", arguments);
			this.aItemDomRefs[iIndex].focus = fnFocus;
			return;
		}
		this._callParent("focusItem", arguments);
	};

	/**
	 * Calls a parent function if it's defined.
	 * @param {string} sFnName Name of the function.
	 * @param {object} [aArguments] Arguments to pass to the function.
	 * @private
	 */
	HeaderContainerItemNavigator.prototype._callParent = function (sFnName, aArguments) {
		if (typeof ItemNavigation.prototype[sFnName] === "function") {
			ItemNavigation.prototype[sFnName].apply(this, aArguments);
		}
	};

	/**
	 * Handles the Home key event.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	HeaderContainerItemNavigator.prototype.onsaphome = function (oEvent) {
		if (this._skipNavigation(oEvent)) {
			return;
		}

		this._callParent("onsaphome", arguments);
	};

	/**
	 * Handles the End key event.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	HeaderContainerItemNavigator.prototype.onsapend = function (oEvent) {
		if (this._skipNavigation(oEvent)) {
			return;
		}

		this._callParent("onsapend", arguments);
	};

	/**
	 * Handles the <code>onsapnext</code> event
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	HeaderContainerItemNavigator.prototype.onsapnext = function (oEvent) {
		if (this._skipNavigation(oEvent)) {
			return;
		}

		this._callParent("onsapnext", arguments);
	};

	/**
	 * Handles the <code>onsapprevious</code> event.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	HeaderContainerItemNavigator.prototype.onsapprevious = function (oEvent) {
		if (this._skipNavigation(oEvent, true, false)) {
			return;
		}

		this._callParent("onsapprevious", arguments);
	};

	/**
	 * Determines whether the specified event should be handled by the navigator.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @private
	 */
	HeaderContainerItemNavigator.prototype._skipNavigation = function (oEvent) {
		return Array.prototype.indexOf.call(this.aItemDomRefs, oEvent.target) === -1;
	};

	return HeaderContainerItemNavigator;
});
