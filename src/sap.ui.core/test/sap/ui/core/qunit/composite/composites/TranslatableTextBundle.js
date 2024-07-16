sap.ui.define([
], function() {
	"use strict";
	return undefined/*XMLComposite*/.extend("composites.TranslatableTextBundle", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text"
				}
			}
		},
		messageBundle: "bundles.messagebundle"
	});
});
