sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-UnableToLoadImage', './sapIllus-Scene-UnableToLoadImage', './sapIllus-Spot-UnableToLoadImage', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogUnableToLoadImage, sapIllusSceneUnableToLoadImage, sapIllusSpotUnableToLoadImage, i18nDefaults) { 'use strict';

	const name = "UnableToLoadImage";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOADIMAGE;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOADIMAGE;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogUnableToLoadImage,
		sceneSvg: sapIllusSceneUnableToLoadImage,
		spotSvg: sapIllusSpotUnableToLoadImage,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogUnableToLoadImage;
	exports.sceneSvg = sapIllusSceneUnableToLoadImage;
	exports.spotSvg = sapIllusSpotUnableToLoadImage;

	Object.defineProperty(exports, '__esModule', { value: true });

});
