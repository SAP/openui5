sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoSearchResults', './sapIllus-Scene-NoSearchResults', './sapIllus-Spot-NoSearchResults', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoSearchResults, sapIllusSceneNoSearchResults, sapIllusSpotNoSearchResults, i18nDefaults) { 'use strict';

	const name = "NoSearchResults";
	const title = i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoSearchResults,
		sceneSvg: sapIllusSceneNoSearchResults,
		spotSvg: sapIllusSpotNoSearchResults,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoSearchResults;
	exports.sceneSvg = sapIllusSceneNoSearchResults;
	exports.spotSvg = sapIllusSpotNoSearchResults;

	Object.defineProperty(exports, '__esModule', { value: true });

});
