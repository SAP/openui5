sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoActivities', './sapIllus-Scene-NoActivities', './sapIllus-Spot-NoActivities', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoActivities, sapIllusSceneNoActivities, sapIllusSpotNoActivities, i18nDefaults) { 'use strict';

	const name = "NoActivities";
	const title = i18nDefaults.IM_TITLE_NOACTIVITIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoActivities,
		sceneSvg: sapIllusSceneNoActivities,
		spotSvg: sapIllusSpotNoActivities,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoActivities;
	exports.sceneSvg = sapIllusSceneNoActivities;
	exports.spotSvg = sapIllusSpotNoActivities;

	Object.defineProperty(exports, '__esModule', { value: true });

});
