sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoData', './sapIllus-Scene-NoData', './sapIllus-Spot-NoData', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoData, sapIllusSceneNoData, sapIllusSpotNoData, i18nDefaults) { 'use strict';

	const name = "NoData";
	const title = i18nDefaults.IM_TITLE_NODATA;
	const subtitle = i18nDefaults.IM_SUBTITLE_NODATA;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoData,
		sceneSvg: sapIllusSceneNoData,
		spotSvg: sapIllusSpotNoData,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoData;
	exports.sceneSvg = sapIllusSceneNoData;
	exports.spotSvg = sapIllusSpotNoData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
