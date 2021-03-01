sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "inspect-down";
	const pathData = "M480 0q14 0 23 9.5t9 22.5v320q0 14-9 23t-23 9H160q-13 0-22.5-9t-9.5-23V32q0-13 9.5-22.5T160 0h320zm0 32H160v320h320V32zM352 448h32v32q0 14-9 23t-23 9H32q-13 0-22.5-9T0 480V160q0-13 9.5-22.5T32 128h32v32H32v320h320v-32zM224 256l65-65-65-63 32-32 65 64 63-64 32 32-65 63 65 65-32 32-63-65-65 65z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var inspectDown = { pathData };

	return inspectDown;

});
