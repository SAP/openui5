sap.ui.define([
	'sap/ui/core/XMLComposite'],
	function(XMLComposite) {
	"use strict";
	var SimpleText = XMLComposite.extend("composites.SimpleText", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "Default Text"}
			}
		}
	});
	return SimpleText;
});
