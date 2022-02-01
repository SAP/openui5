sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SuccessBalloon', './sapIllus-Scene-SuccessBalloon', './sapIllus-Spot-SuccessBalloon', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSuccessBalloon, sapIllusSceneSuccessBalloon, sapIllusSpotSuccessBalloon, i18nDefaults) { 'use strict';

	const name = "SuccessBalloon";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BALLOONSKY;
	const subtitle = i18nDefaults.IM_SUBTITLE_BALLOONSKY;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSuccessBalloon,
		sceneSvg: sapIllusSceneSuccessBalloon,
		spotSvg: sapIllusSpotSuccessBalloon,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSuccessBalloon;
	exports.sceneSvg = sapIllusSceneSuccessBalloon;
	exports.spotSvg = sapIllusSpotSuccessBalloon;

	Object.defineProperty(exports, '__esModule', { value: true });

});
