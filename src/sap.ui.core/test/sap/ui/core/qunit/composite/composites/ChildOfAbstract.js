sap.ui.define([
	'./Abstract'
], function(Abstract) {
	"use strict";
	return Abstract.extend("composites.ChildOfAbstract", {
		metadata: {
			properties: {
				text: {
					type: "string"
				}
			}
		}
	});
});
