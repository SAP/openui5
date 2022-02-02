sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleNoSavedItems', './sapIllus-Scene-SimpleNoSavedItems', './sapIllus-Spot-SimpleNoSavedItems', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleNoSavedItems, sapIllusSceneSimpleNoSavedItems, sapIllusSpotSimpleNoSavedItems, i18nDefaults) { 'use strict';

	const name = "SimpleNoSavedItems";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOSAVEDITEMS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleNoSavedItems,
		sceneSvg: sapIllusSceneSimpleNoSavedItems,
		spotSvg: sapIllusSpotSimpleNoSavedItems,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleNoSavedItems;
	exports.sceneSvg = sapIllusSceneSimpleNoSavedItems;
	exports.spotSvg = sapIllusSpotSimpleNoSavedItems;

	Object.defineProperty(exports, '__esModule', { value: true });

});
