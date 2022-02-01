sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-ErrorScreen', './sapIllus-Scene-ErrorScreen', './sapIllus-Spot-ErrorScreen', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogErrorScreen, sapIllusSceneErrorScreen, sapIllusSpotErrorScreen, i18nDefaults) { 'use strict';

	const name = "ErrorScreen";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogErrorScreen,
		sceneSvg: sapIllusSceneErrorScreen,
		spotSvg: sapIllusSpotErrorScreen,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogErrorScreen;
	exports.sceneSvg = sapIllusSceneErrorScreen;
	exports.spotSvg = sapIllusSpotErrorScreen;

	Object.defineProperty(exports, '__esModule', { value: true });

});
