sap.ui.define([
	'./Abstract'
], function(Abstract) {
	"use strict";
	return Abstract.extend("fragments.ChildOfAbstract", {
		metadata: {
			properties: {
				text: {
					type: "string"
				}
			}
		}
	});
}, /* bExport= */true);
