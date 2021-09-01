sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-UnableToLoad', './sapIllus-Scene-UnableToLoad', './sapIllus-Spot-UnableToLoad', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogUnableToLoad, sapIllusSceneUnableToLoad, sapIllusSpotUnableToLoad, i18nDefaults) { 'use strict';

	const name = "UnableToLoad";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogUnableToLoad,
		sceneSvg: sapIllusSceneUnableToLoad,
		spotSvg: sapIllusSpotUnableToLoad,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogUnableToLoad;
	exports.sceneSvg = sapIllusSceneUnableToLoad;
	exports.spotSvg = sapIllusSpotUnableToLoad;

	Object.defineProperty(exports, '__esModule', { value: true });

});
