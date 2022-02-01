sap.ui.define(['./ComboBoxItem'], function (ComboBoxItem) { 'use strict';

	const metadata = {
		tag: "ui5-mcb-item",
		properties:  {
			selected: { type: Boolean },
		},
	};
	class MultiComboBoxItem extends ComboBoxItem {
		static get metadata() {
			return metadata;
		}
		get stableDomRef() {
			return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
		}
	}
	MultiComboBoxItem.define();

	return MultiComboBoxItem;

});
