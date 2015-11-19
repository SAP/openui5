sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.testblocks.BasicDivBlock", {
		metadata: {
			properties: {
				"height": {type: "string", group: "Appearance"},
				"backgroundColor": {type: "string", group: "Appearance"}
			}
		}
	});
	return myBlock;
}, true);

