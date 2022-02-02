sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SuccessCheckMark', './sapIllus-Scene-SuccessCheckMark', './sapIllus-Spot-SuccessCheckMark', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSuccessCheckMark, sapIllusSceneSuccessCheckMark, sapIllusSpotSuccessCheckMark, i18nDefaults) { 'use strict';

	const name = "SuccessCheckMark";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_SUCCESSSCREEN;
	const subtitle = i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSuccessCheckMark,
		sceneSvg: sapIllusSceneSuccessCheckMark,
		spotSvg: sapIllusSpotSuccessCheckMark,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSuccessCheckMark;
	exports.sceneSvg = sapIllusSceneSuccessCheckMark;
	exports.spotSvg = sapIllusSpotSuccessCheckMark;

	Object.defineProperty(exports, '__esModule', { value: true });

});
