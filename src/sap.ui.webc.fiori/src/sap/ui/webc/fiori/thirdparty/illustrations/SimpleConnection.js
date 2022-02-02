sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleConnection', './sapIllus-Scene-SimpleConnection', './sapIllus-Spot-SimpleConnection', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleConnection, sapIllusSceneSimpleConnection, sapIllusSpotSimpleConnection, i18nDefaults) { 'use strict';

	const name = "SimpleConnection";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleConnection,
		sceneSvg: sapIllusSceneSimpleConnection,
		spotSvg: sapIllusSpotSimpleConnection,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleConnection;
	exports.sceneSvg = sapIllusSceneSimpleConnection;
	exports.spotSvg = sapIllusSpotSimpleConnection;

	Object.defineProperty(exports, '__esModule', { value: true });

});
