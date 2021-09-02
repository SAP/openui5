sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-BeforeSearch', './sapIllus-Scene-BeforeSearch', './sapIllus-Spot-BeforeSearch', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogBeforeSearch, sapIllusSceneBeforeSearch, sapIllusSpotBeforeSearch, i18nDefaults) { 'use strict';

	const name = "BeforeSearch";
	const title = i18nDefaults.IM_TITLE_BEFORESEARCH;
	const subtitle = i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogBeforeSearch,
		sceneSvg: sapIllusSceneBeforeSearch,
		spotSvg: sapIllusSpotBeforeSearch,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogBeforeSearch;
	exports.sceneSvg = sapIllusSceneBeforeSearch;
	exports.spotSvg = sapIllusSpotBeforeSearch;

	Object.defineProperty(exports, '__esModule', { value: true });

});
