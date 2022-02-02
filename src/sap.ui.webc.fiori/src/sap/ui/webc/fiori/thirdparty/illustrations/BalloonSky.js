sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-BalloonSky', './sapIllus-Scene-BalloonSky', './sapIllus-Spot-BalloonSky', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogBalloonSky, sapIllusSceneBalloonSky, sapIllusSpotBalloonSky, i18nDefaults) { 'use strict';

	const name = "BalloonSky";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BALLOONSKY;
	const subtitle = i18nDefaults.IM_SUBTITLE_BALLOONSKY;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogBalloonSky,
		sceneSvg: sapIllusSceneBalloonSky,
		spotSvg: sapIllusSpotBalloonSky,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogBalloonSky;
	exports.sceneSvg = sapIllusSceneBalloonSky;
	exports.spotSvg = sapIllusSpotBalloonSky;

	Object.defineProperty(exports, '__esModule', { value: true });

});
