sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoSavedItems', './sapIllus-Scene-NoSavedItems', './sapIllus-Spot-NoSavedItems', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoSavedItems, sapIllusSceneNoSavedItems, sapIllusSpotNoSavedItems, i18nDefaults) { 'use strict';

	const name = "NoSavedItems";
	const title = i18nDefaults.IM_TITLE_NOSAVEDITEMS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoSavedItems,
		sceneSvg: sapIllusSceneNoSavedItems,
		spotSvg: sapIllusSpotNoSavedItems,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoSavedItems;
	exports.sceneSvg = sapIllusSceneNoSavedItems;
	exports.spotSvg = sapIllusSpotNoSavedItems;

	Object.defineProperty(exports, '__esModule', { value: true });

});
