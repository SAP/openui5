sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleBalloon', './sapIllus-Scene-SimpleBalloon', './sapIllus-Spot-SimpleBalloon', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleBalloon, sapIllusSceneSimpleBalloon, sapIllusSpotSimpleBalloon, i18nDefaults) { 'use strict';

	const name = "SimpleBalloon";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BALLOONSKY;
	const subtitle = i18nDefaults.IM_SUBTITLE_BALLOONSKY;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleBalloon,
		sceneSvg: sapIllusSceneSimpleBalloon,
		spotSvg: sapIllusSpotSimpleBalloon,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleBalloon;
	exports.sceneSvg = sapIllusSceneSimpleBalloon;
	exports.spotSvg = sapIllusSpotSimpleBalloon;

	Object.defineProperty(exports, '__esModule', { value: true });

});
