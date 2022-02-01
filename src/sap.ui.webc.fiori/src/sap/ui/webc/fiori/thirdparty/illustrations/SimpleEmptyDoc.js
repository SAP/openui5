sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleEmptyDoc', './sapIllus-Scene-SimpleEmptyDoc', './sapIllus-Spot-SimpleEmptyDoc', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleEmptyDoc, sapIllusSceneSimpleEmptyDoc, sapIllusSpotSimpleEmptyDoc, i18nDefaults) { 'use strict';

	const name = "SimpleEmptyDoc";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NODATA;
	const subtitle = i18nDefaults.IM_SUBTITLE_NODATA;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleEmptyDoc,
		sceneSvg: sapIllusSceneSimpleEmptyDoc,
		spotSvg: sapIllusSpotSimpleEmptyDoc,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleEmptyDoc;
	exports.sceneSvg = sapIllusSceneSimpleEmptyDoc;
	exports.spotSvg = sapIllusSpotSimpleEmptyDoc;

	Object.defineProperty(exports, '__esModule', { value: true });

});
