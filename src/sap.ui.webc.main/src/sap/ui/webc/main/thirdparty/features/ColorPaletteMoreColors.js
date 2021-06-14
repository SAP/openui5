sap.ui.define(['sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/i18nBundle', '../Dialog', '../Button', '../ColorPicker', '../generated/i18n/i18n-defaults'], function (FeaturesRegistry, i18nBundle, Dialog, Button, ColorPicker, i18nDefaults) { 'use strict';

	class ColorPaletteMoreColors {
		constructor() {
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get dependencies() {
			return [
				Dialog,
				Button,
				ColorPicker,
			];
		}
		get colorPaletteDialogTitle() {
			return this.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_DIALOG_TITLE);
		}
		get colorPaletteDialogOKButton() {
			return this.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_DIALOG_OK_BUTTON);
		}
		get colorPaletteCancelButton() {
			return this.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_DIALOG_CANCEL_BUTTON);
		}
	}
	FeaturesRegistry.registerFeature("ColorPaletteMoreColors", ColorPaletteMoreColors);

	return ColorPaletteMoreColors;

});
