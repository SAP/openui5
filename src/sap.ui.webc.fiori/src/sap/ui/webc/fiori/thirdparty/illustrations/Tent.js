sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-Tent', './sapIllus-Scene-Tent', './sapIllus-Spot-Tent', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogTent, sapIllusSceneTent, sapIllusSpotTent, i18nDefaults) { 'use strict';

	const name = "Tent";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NODATA;
	const subtitle = i18nDefaults.IM_SUBTITLE_NODATA;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogTent,
		sceneSvg: sapIllusSceneTent,
		spotSvg: sapIllusSpotTent,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogTent;
	exports.sceneSvg = sapIllusSceneTent;
	exports.spotSvg = sapIllusSpotTent;

	Object.defineProperty(exports, '__esModule', { value: true });

});
