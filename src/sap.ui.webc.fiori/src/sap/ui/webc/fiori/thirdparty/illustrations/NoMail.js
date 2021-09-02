sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoMail', './sapIllus-Scene-NoMail', './sapIllus-Spot-NoMail', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoMail, sapIllusSceneNoMail, sapIllusSpotNoMail, i18nDefaults) { 'use strict';

	const name = "NoMail";
	const title = i18nDefaults.IM_TITLE_NOMAIL;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOMAIL;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoMail,
		sceneSvg: sapIllusSceneNoMail,
		spotSvg: sapIllusSpotNoMail,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoMail;
	exports.sceneSvg = sapIllusSceneNoMail;
	exports.spotSvg = sapIllusSpotNoMail;

	Object.defineProperty(exports, '__esModule', { value: true });

});
