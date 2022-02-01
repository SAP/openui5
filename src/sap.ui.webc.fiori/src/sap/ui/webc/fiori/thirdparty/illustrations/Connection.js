sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-Connection', './sapIllus-Scene-Connection', './sapIllus-Spot-Connection', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogConnection, sapIllusSceneConnection, sapIllusSpotConnection, i18nDefaults) { 'use strict';

	const name = "Connection";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogConnection,
		sceneSvg: sapIllusSceneConnection,
		spotSvg: sapIllusSpotConnection,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogConnection;
	exports.sceneSvg = sapIllusSceneConnection;
	exports.spotSvg = sapIllusSpotConnection;

	Object.defineProperty(exports, '__esModule', { value: true });

});
