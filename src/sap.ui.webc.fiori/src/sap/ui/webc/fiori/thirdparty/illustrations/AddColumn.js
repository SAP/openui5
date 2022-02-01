sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-AddColumn', './sapIllus-Scene-AddColumn', './sapIllus-Spot-AddColumn', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogAddColumn, sapIllusSceneAddColumn, sapIllusSpotAddColumn, i18nDefaults) { 'use strict';

	const name = "AddColumn";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_ADDCOLUMN;
	const subtitle = i18nDefaults.IM_SUBTITLE_ADDCOLUMN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogAddColumn,
		sceneSvg: sapIllusSceneAddColumn,
		spotSvg: sapIllusSpotAddColumn,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogAddColumn;
	exports.sceneSvg = sapIllusSceneAddColumn;
	exports.spotSvg = sapIllusSpotAddColumn;

	Object.defineProperty(exports, '__esModule', { value: true });

});
