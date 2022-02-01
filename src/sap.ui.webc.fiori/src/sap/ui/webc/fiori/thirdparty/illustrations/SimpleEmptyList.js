sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleEmptyList', './sapIllus-Scene-SimpleEmptyList', './sapIllus-Spot-SimpleEmptyList', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleEmptyList, sapIllusSceneSimpleEmptyList, sapIllusSpotSimpleEmptyList, i18nDefaults) { 'use strict';

	const name = "SimpleEmptyList";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOENTRIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOENTRIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleEmptyList,
		sceneSvg: sapIllusSceneSimpleEmptyList,
		spotSvg: sapIllusSpotSimpleEmptyList,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleEmptyList;
	exports.sceneSvg = sapIllusSceneSimpleEmptyList;
	exports.spotSvg = sapIllusSpotSimpleEmptyList;

	Object.defineProperty(exports, '__esModule', { value: true });

});
