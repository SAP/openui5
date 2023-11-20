/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility class helping with sap.m.ComboBox control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.ComboBoxHelper
	 */
	const ComboBoxHelper = { };

	/**
	 * Sets and synchronizes value and key for ComboBox control.
	 * @param {sap.m.ComboBox} oComboBox The ComboBox.
	 * @param {string} sKey The key.
	 * @param {string} sValue The value.
	 */
	ComboBoxHelper.setValueAndKey = function(oComboBox, sKey, sValue) {
		if (sKey) {
			oComboBox.setSelectedKey(sKey);

			const oSelectedItem = oComboBox.getItems().find((oItem) => {
				return oItem.getKey() === sKey;
			});

			oComboBox.setValue(oSelectedItem ? oSelectedItem.getText() : "");
			return;
		}

		if (sValue) {
			const oSelectedItem = oComboBox.getItems().find((oItem) => {
				return oItem.getText() === sValue;
			});

			if (oSelectedItem) {
				oComboBox.setSelectedItem(oSelectedItem);
			} else {
				oComboBox.setSelectedKey(null); // now entering unknown value, reset selectedKey to keep it in sync
				oComboBox.setValue(sValue);
			}
			return;
		}

		// there is nothing selected and no value
		oComboBox.setSelectedKey(null);
		oComboBox.setValue(null);
	};

	return ComboBoxHelper;
});