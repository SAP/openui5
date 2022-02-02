sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleBell', './sapIllus-Scene-SimpleBell', './sapIllus-Spot-SimpleBell', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleBell, sapIllusSceneSimpleBell, sapIllusSpotSimpleBell, i18nDefaults) { 'use strict';

	const name = "SimpleBell";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NONOTIFICATIONS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleBell,
		sceneSvg: sapIllusSceneSimpleBell,
		spotSvg: sapIllusSpotSimpleBell,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleBell;
	exports.sceneSvg = sapIllusSceneSimpleBell;
	exports.spotSvg = sapIllusSpotSimpleBell;

	Object.defineProperty(exports, '__esModule', { value: true });

});
