sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleReload', './sapIllus-Scene-SimpleReload', './sapIllus-Spot-SimpleReload', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleReload, sapIllusSceneSimpleReload, sapIllusSpotSimpleReload, i18nDefaults) { 'use strict';

	const name = "SimpleReload";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleReload,
		sceneSvg: sapIllusSceneSimpleReload,
		spotSvg: sapIllusSpotSimpleReload,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleReload;
	exports.sceneSvg = sapIllusSceneSimpleReload;
	exports.spotSvg = sapIllusSpotSimpleReload;

	Object.defineProperty(exports, '__esModule', { value: true });

});
