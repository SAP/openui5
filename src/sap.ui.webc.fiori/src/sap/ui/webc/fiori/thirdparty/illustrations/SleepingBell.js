sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SleepingBell', './sapIllus-Scene-SleepingBell', './sapIllus-Spot-SleepingBell', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSleepingBell, sapIllusSceneSleepingBell, sapIllusSpotSleepingBell, i18nDefaults) { 'use strict';

	const name = "SleepingBell";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NONOTIFICATIONS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSleepingBell,
		sceneSvg: sapIllusSceneSleepingBell,
		spotSvg: sapIllusSpotSleepingBell,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSleepingBell;
	exports.sceneSvg = sapIllusSceneSleepingBell;
	exports.spotSvg = sapIllusSpotSleepingBell;

	Object.defineProperty(exports, '__esModule', { value: true });

});
