sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-UnableToUpload', './sapIllus-Scene-UnableToUpload', './sapIllus-Spot-UnableToUpload', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogUnableToUpload, sapIllusSceneUnableToUpload, sapIllusSpotUnableToUpload, i18nDefaults) { 'use strict';

	const name = "UnableToUpload";
	const title = i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogUnableToUpload,
		sceneSvg: sapIllusSceneUnableToUpload,
		spotSvg: sapIllusSpotUnableToUpload,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogUnableToUpload;
	exports.sceneSvg = sapIllusSceneUnableToUpload;
	exports.spotSvg = sapIllusSpotUnableToUpload;

	Object.defineProperty(exports, '__esModule', { value: true });

});
