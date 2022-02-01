sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoSavedItems_v1', './sapIllus-Scene-NoSavedItems_v1', './sapIllus-Spot-NoSavedItems_v1', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoSavedItems_v1, sapIllusSceneNoSavedItems_v1, sapIllusSpotNoSavedItems_v1, i18nDefaults) { 'use strict';

	const name = "NoSavedItems_v1";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOSAVEDITEMS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoSavedItems_v1,
		sceneSvg: sapIllusSceneNoSavedItems_v1,
		spotSvg: sapIllusSpotNoSavedItems_v1,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogNoSavedItems_v1;
	exports.sceneSvg = sapIllusSceneNoSavedItems_v1;
	exports.spotSvg = sapIllusSpotNoSavedItems_v1;

	Object.defineProperty(exports, '__esModule', { value: true });

});
