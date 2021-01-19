/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/getTokenByItem"
], function (ListHelpers, getTokenByItem) {
	"use strict";


	/**
	 * Forwards Properties from Item to Token in Multi Combo / Input controls.
	 *
	 * @param oInfo Info regarding properties to be forwarded to token
	 */
	var forwardItemPropertiesToToken = function (oInfo) {
		var oItem = oInfo.item;
		var propName = oInfo.propName;
		var propValue = oInfo.propValue;
		var oToken = getTokenByItem(oItem);

		if (!oToken) {
			return;
		}

		if (propName === "enabled") {
			oToken.setVisible(propValue);
		} else if (oToken.getMetadata().hasProperty(propName)) {
			oToken.setProperty(propName, propValue);
		}
	};

	return forwardItemPropertiesToToken;
});