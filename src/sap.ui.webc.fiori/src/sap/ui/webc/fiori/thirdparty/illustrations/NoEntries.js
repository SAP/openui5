sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoEntries', './sapIllus-Scene-NoEntries', './sapIllus-Spot-NoEntries', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoEntries, sapIllusSceneNoEntries, sapIllusSpotNoEntries, i18nDefaults) { 'use strict';

	const name = "NoEntries";
	const title = i18nDefaults.IM_TITLE_NOENTRIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOENTRIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoEntries,
		sceneSvg: sapIllusSceneNoEntries,
		spotSvg: sapIllusSpotNoEntries,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoEntries;
	exports.sceneSvg = sapIllusSceneNoEntries;
	exports.spotSvg = sapIllusSpotNoEntries;

	Object.defineProperty(exports, '__esModule', { value: true });

});
