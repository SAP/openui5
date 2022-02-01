sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoMail_v1', './sapIllus-Scene-NoMail_v1', './sapIllus-Spot-NoMail_v1', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoMail_v1, sapIllusSceneNoMail_v1, sapIllusSpotNoMail_v1, i18nDefaults) { 'use strict';

	const name = "NoMail_v1";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOMAIL;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOMAIL;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoMail_v1,
		sceneSvg: sapIllusSceneNoMail_v1,
		spotSvg: sapIllusSpotNoMail_v1,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogNoMail_v1;
	exports.sceneSvg = sapIllusSceneNoMail_v1;
	exports.spotSvg = sapIllusSpotNoMail_v1;

	Object.defineProperty(exports, '__esModule', { value: true });

});
