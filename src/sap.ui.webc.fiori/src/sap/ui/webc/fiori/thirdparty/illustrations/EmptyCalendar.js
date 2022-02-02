sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-EmptyCalendar', './sapIllus-Scene-EmptyCalendar', './sapIllus-Spot-EmptyCalendar', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogEmptyCalendar, sapIllusSceneEmptyCalendar, sapIllusSpotEmptyCalendar, i18nDefaults) { 'use strict';

	const name = "EmptyCalendar";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOACTIVITIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogEmptyCalendar,
		sceneSvg: sapIllusSceneEmptyCalendar,
		spotSvg: sapIllusSpotEmptyCalendar,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogEmptyCalendar;
	exports.sceneSvg = sapIllusSceneEmptyCalendar;
	exports.spotSvg = sapIllusSpotEmptyCalendar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
