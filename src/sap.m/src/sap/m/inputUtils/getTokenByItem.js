/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/ListHelpers"
], function (ListHelpers) {
	"use strict";

	/**
	 * Returns a token created by an item.
	 *
	 * @param oItem Item corresponding to a token
	 *
	 */
	var getTokenByItem = function (oItem) {
		return oItem ? oItem.data(ListHelpers.CSS_CLASS + "Token") : null;
	};

	return getTokenByItem;
});