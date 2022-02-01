sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SuccessScreen', './sapIllus-Scene-SuccessScreen', './sapIllus-Spot-SuccessScreen', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSuccessScreen, sapIllusSceneSuccessScreen, sapIllusSpotSuccessScreen, i18nDefaults) { 'use strict';

	const name = "SuccessScreen";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_SUCCESSSCREEN;
	const subtitle = i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSuccessScreen,
		sceneSvg: sapIllusSceneSuccessScreen,
		spotSvg: sapIllusSpotSuccessScreen,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSuccessScreen;
	exports.sceneSvg = sapIllusSceneSuccessScreen;
	exports.spotSvg = sapIllusSpotSuccessScreen;

	Object.defineProperty(exports, '__esModule', { value: true });

});
