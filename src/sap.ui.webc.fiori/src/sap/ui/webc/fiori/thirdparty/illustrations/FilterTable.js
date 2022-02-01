sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-FilterTable', './sapIllus-Scene-FilterTable', './sapIllus-Spot-FilterTable', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogFilterTable, sapIllusSceneFilterTable, sapIllusSpotFilterTable, i18nDefaults) { 'use strict';

	const name = "FilterTable";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_FILTERTABLE;
	const subtitle = i18nDefaults.IM_SUBTITLE_FILTERTABLE;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogFilterTable,
		sceneSvg: sapIllusSceneFilterTable,
		spotSvg: sapIllusSpotFilterTable,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogFilterTable;
	exports.sceneSvg = sapIllusSceneFilterTable;
	exports.spotSvg = sapIllusSpotFilterTable;

	Object.defineProperty(exports, '__esModule', { value: true });

});
