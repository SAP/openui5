sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-EmptyPlanningCalendar', './sapIllus-Scene-EmptyPlanningCalendar', './sapIllus-Spot-EmptyPlanningCalendar', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogEmptyPlanningCalendar, sapIllusSceneEmptyPlanningCalendar, sapIllusSpotEmptyPlanningCalendar, i18nDefaults) { 'use strict';

	const name = "EmptyPlanningCalendar";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_EMPTYPLANNINGCALENDAR;
	const subtitle = i18nDefaults.IM_SUBTITLE_EMPTYPLANNINGCALENDAR;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogEmptyPlanningCalendar,
		sceneSvg: sapIllusSceneEmptyPlanningCalendar,
		spotSvg: sapIllusSpotEmptyPlanningCalendar,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogEmptyPlanningCalendar;
	exports.sceneSvg = sapIllusSceneEmptyPlanningCalendar;
	exports.spotSvg = sapIllusSpotEmptyPlanningCalendar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
