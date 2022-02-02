sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-EmptyList', './sapIllus-Scene-EmptyList', './sapIllus-Spot-EmptyList', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogEmptyList, sapIllusSceneEmptyList, sapIllusSpotEmptyList, i18nDefaults) { 'use strict';

	const name = "EmptyList";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOENTRIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOENTRIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogEmptyList,
		sceneSvg: sapIllusSceneEmptyList,
		spotSvg: sapIllusSpotEmptyList,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogEmptyList;
	exports.sceneSvg = sapIllusSceneEmptyList;
	exports.spotSvg = sapIllusSpotEmptyList;

	Object.defineProperty(exports, '__esModule', { value: true });

});
