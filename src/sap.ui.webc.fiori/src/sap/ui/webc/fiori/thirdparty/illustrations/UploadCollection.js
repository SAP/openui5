sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-UploadCollection', './sapIllus-Scene-UploadCollection', './sapIllus-Spot-UploadCollection', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogUploadCollection, sapIllusSceneUploadCollection, sapIllusSpotUploadCollection, i18nDefaults) { 'use strict';

	const name = "UploadCollection";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UPLOADCOLLECTION;
	const subtitle = i18nDefaults.IM_SUBTITLE_UPLOADCOLLECTION;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogUploadCollection,
		sceneSvg: sapIllusSceneUploadCollection,
		spotSvg: sapIllusSpotUploadCollection,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogUploadCollection;
	exports.sceneSvg = sapIllusSceneUploadCollection;
	exports.spotSvg = sapIllusSpotUploadCollection;

	Object.defineProperty(exports, '__esModule', { value: true });

});
