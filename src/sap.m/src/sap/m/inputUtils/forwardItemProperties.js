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
	 * Forwards properties from core Item to the mapping list item.
	 *
	 * @param oInfo Object representing info to be forwarded to the item (item, prop name and prop value)
	 * @param bShowSecondaryValues Indicates whether the secondary value of the list item will be shown
	 */
	var forwardItemProperties = function (oInfo, bShowSecondaryValues) {
		var oItem = oInfo.item;
		var oListItem = oItem.data(ListHelpers.CSS_CLASS + "ListItem");
		var sAdditionalText;
		var sProperty;
		var sSetter;
		var oDirectMapping = {
				text: "title",
				enabled: "visible",
				tooltip: "tooltip"
			};
		var propName = oInfo.propName;
		var propValue = oInfo.propValue;

		if (!oListItem) {
			return;
		}

		if (oItem.isA("sap.ui.core.Item") && propName === "enabled") {
			oItem._bSelectable = !!propValue;
		}

		if (oDirectMapping[propName]) {
			sProperty = oDirectMapping[propName];
			sSetter = "set" + sProperty.charAt(0).toUpperCase() + sProperty.slice(1);

			oListItem[sSetter](propValue);
		}

		if (propName === "additionalText") {
			sAdditionalText = bShowSecondaryValues ? propValue : "";
			oListItem.setInfo(sAdditionalText);
		}
	};

	return forwardItemProperties;
});