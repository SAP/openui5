sap.ui.define([
	'sap/ui/core/XMLComposite'
], function (XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.TranslatableTextBundle", {
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
