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
