sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-ResizeColumn', './sapIllus-Scene-ResizeColumn', './sapIllus-Spot-ResizeColumn', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogResizeColumn, sapIllusSceneResizeColumn, sapIllusSpotResizeColumn, i18nDefaults) { 'use strict';

	const name = "ResizeColumn";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_RESIZECOLUMN;
	const subtitle = i18nDefaults.IM_SUBTITLE_RESIZECOLUMN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogResizeColumn,
		sceneSvg: sapIllusSceneResizeColumn,
		spotSvg: sapIllusSpotResizeColumn,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogResizeColumn;
	exports.sceneSvg = sapIllusSceneResizeColumn;
	exports.spotSvg = sapIllusSpotResizeColumn;

	Object.defineProperty(exports, '__esModule', { value: true });

});
