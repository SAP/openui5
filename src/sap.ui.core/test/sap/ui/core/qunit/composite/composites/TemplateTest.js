/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";
	return undefined/*XMLComposite*/.extend("composites.TemplateTest", {
		metadata: {
			properties: {
				text: {
					type: "string",
					invalidate: "template"
				}
			}
		}
	});
});
