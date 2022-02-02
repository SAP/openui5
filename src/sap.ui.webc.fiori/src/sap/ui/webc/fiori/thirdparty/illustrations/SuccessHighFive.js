sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SuccessHighFive', './sapIllus-Scene-SuccessHighFive', './sapIllus-Spot-SuccessHighFive', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSuccessHighFive, sapIllusSceneSuccessHighFive, sapIllusSpotSuccessHighFive, i18nDefaults) { 'use strict';

	const name = "SuccessHighFive";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BALLOONSKY;
	const subtitle = i18nDefaults.IM_SUBTITLE_BALLOONSKY;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSuccessHighFive,
		sceneSvg: sapIllusSceneSuccessHighFive,
		spotSvg: sapIllusSpotSuccessHighFive,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSuccessHighFive;
	exports.sceneSvg = sapIllusSceneSuccessHighFive;
	exports.spotSvg = sapIllusSpotSuccessHighFive;

	Object.defineProperty(exports, '__esModule', { value: true });

});
