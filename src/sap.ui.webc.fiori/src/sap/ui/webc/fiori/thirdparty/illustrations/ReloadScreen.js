sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-ReloadScreen', './sapIllus-Scene-ReloadScreen', './sapIllus-Spot-ReloadScreen', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogReloadScreen, sapIllusSceneReloadScreen, sapIllusSpotReloadScreen, i18nDefaults) { 'use strict';

	const name = "ReloadScreen";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogReloadScreen,
		sceneSvg: sapIllusSceneReloadScreen,
		spotSvg: sapIllusSpotReloadScreen,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogReloadScreen;
	exports.sceneSvg = sapIllusSceneReloadScreen;
	exports.spotSvg = sapIllusSpotReloadScreen;

	Object.defineProperty(exports, '__esModule', { value: true });

});
