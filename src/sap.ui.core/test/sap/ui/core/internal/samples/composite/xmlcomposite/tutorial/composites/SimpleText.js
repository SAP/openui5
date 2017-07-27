sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], 
    function(jQuery, XMLComposite) {
	"use strict";
	var SimpleText = XMLComposite.extend("composites.SimpleText", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "Default Text"}
			}
		}
	});
	return SimpleText;
}, /* bExport= */true);
