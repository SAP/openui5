sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleCalendar', './sapIllus-Scene-SimpleCalendar', './sapIllus-Spot-SimpleCalendar', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleCalendar, sapIllusSceneSimpleCalendar, sapIllusSpotSimpleCalendar, i18nDefaults) { 'use strict';

	const name = "SimpleCalendar";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOACTIVITIES;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleCalendar,
		sceneSvg: sapIllusSceneSimpleCalendar,
		spotSvg: sapIllusSpotSimpleCalendar,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleCalendar;
	exports.sceneSvg = sapIllusSceneSimpleCalendar;
	exports.spotSvg = sapIllusSpotSimpleCalendar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
