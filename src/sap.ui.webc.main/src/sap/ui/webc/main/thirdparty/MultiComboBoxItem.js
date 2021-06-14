sap.ui.define(['./ComboBoxItem'], function (ComboBoxItem) { 'use strict';

	const metadata = {
		tag: "ui5-mcb-item",
		properties:  {
			selected: { type: Boolean },
			stableDomRef: {
				type: String,
			},
		},
	};
	class MultiComboBoxItem extends ComboBoxItem {
		static get metadata() {
			return metadata;
		}
	}
	MultiComboBoxItem.define();

	return MultiComboBoxItem;

});
