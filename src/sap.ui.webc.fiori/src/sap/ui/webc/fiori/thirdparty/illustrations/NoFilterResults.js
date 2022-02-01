sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoFilterResults', './sapIllus-Scene-NoFilterResults', './sapIllus-Spot-NoFilterResults', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoFilterResults, sapIllusSceneNoFilterResults, sapIllusSpotNoFilterResults, i18nDefaults) { 'use strict';

	const name = "NoFilterResults";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOFILTERRESULTS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOFILTERRESULTS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoFilterResults,
		sceneSvg: sapIllusSceneNoFilterResults,
		spotSvg: sapIllusSpotNoFilterResults,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogNoFilterResults;
	exports.sceneSvg = sapIllusSceneNoFilterResults;
	exports.spotSvg = sapIllusSpotNoFilterResults;

	Object.defineProperty(exports, '__esModule', { value: true });

});
