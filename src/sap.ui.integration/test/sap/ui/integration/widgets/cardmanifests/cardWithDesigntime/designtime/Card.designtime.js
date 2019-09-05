/*!
 * ${copyright}
 */

 sap.ui.define([], function() {
	"use strict";
	return {
			context: "sap.card",
			properties: {
				title: {
					label: "Title",
					type: "string",
					path: "header/title",
					maxLength: 30
				},
				subTitle: {
					label: "Subtitle",
					type: "string",
					path: "header/subTitle"
				},
				icon: {
					label: "Icon src",
					type: "string",
					path: "header/icon/src"
				},
				status: {
					label: "Status",
					type: "string",
					path: "header/status/text"
				}
			},
			propertyEditors: {
				"enum" : "sap/ui/integration/designtime/controls/propertyEditors/EnumStringEditor",
				"string" : "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
			}
		};
	}
);
