sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-PageNotFound', './sapIllus-Scene-PageNotFound', './sapIllus-Spot-PageNotFound', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogPageNotFound, sapIllusScenePageNotFound, sapIllusSpotPageNotFound, i18nDefaults) { 'use strict';

	const name = "PageNotFound";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_PAGENOTFOUND;
	const subtitle = i18nDefaults.IM_SUBTITLE_PAGENOTFOUND;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogPageNotFound,
		sceneSvg: sapIllusScenePageNotFound,
		spotSvg: sapIllusSpotPageNotFound,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogPageNotFound;
	exports.sceneSvg = sapIllusScenePageNotFound;
	exports.spotSvg = sapIllusSpotPageNotFound;

	Object.defineProperty(exports, '__esModule', { value: true });

});
