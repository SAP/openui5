sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SearchEarth', './sapIllus-Scene-SearchEarth', './sapIllus-Spot-SearchEarth', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSearchEarth, sapIllusSceneSearchEarth, sapIllusSpotSearchEarth, i18nDefaults) { 'use strict';

	const name = "SearchEarth";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BEFORESEARCH;
	const subtitle = i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSearchEarth,
		sceneSvg: sapIllusSceneSearchEarth,
		spotSvg: sapIllusSpotSearchEarth,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSearchEarth;
	exports.sceneSvg = sapIllusSceneSearchEarth;
	exports.spotSvg = sapIllusSpotSearchEarth;

	Object.defineProperty(exports, '__esModule', { value: true });

});
