sap.ui.define(['./generated/templates/SegmentedButtonItemTemplate.lit', './ToggleButton', './types/ButtonDesign', './Icon', './generated/i18n/i18n-defaults'], function (SegmentedButtonItemTemplate_lit, ToggleButton, ButtonDesign, Icon, i18nDefaults) { 'use strict';

	const metadata = {
		tag: "ui5-segmented-button-item",
		properties:  {
			design: {
				type: ButtonDesign,
				defaultValue: ButtonDesign.Default,
			},
			iconEnd: {
				type: Boolean,
			},
			submits: {
				type: Boolean,
			},
			posInSet: {
				type: String,
			},
			sizeOfSet: {
				type: String,
			},
		},
	};
	class SegmentedButtonItem extends ToggleButton {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return SegmentedButtonItemTemplate_lit;
		}
		static get dependencies() {
			return [Icon];
		}
		get ariaDescription() {
			return SegmentedButtonItem.i18nBundle.getText(i18nDefaults.SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION);
		}
	}
	SegmentedButtonItem.define();

	return SegmentedButtonItem;

});
