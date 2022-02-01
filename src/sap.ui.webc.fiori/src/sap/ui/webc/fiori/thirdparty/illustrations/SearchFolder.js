sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SearchFolder', './sapIllus-Scene-SearchFolder', './sapIllus-Spot-SearchFolder', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSearchFolder, sapIllusSceneSearchFolder, sapIllusSpotSearchFolder, i18nDefaults) { 'use strict';

	const name = "SearchFolder";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSearchFolder,
		sceneSvg: sapIllusSceneSearchFolder,
		spotSvg: sapIllusSpotSearchFolder,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSearchFolder;
	exports.sceneSvg = sapIllusSceneSearchFolder;
	exports.spotSvg = sapIllusSpotSearchFolder;

	Object.defineProperty(exports, '__esModule', { value: true });

});
