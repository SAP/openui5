sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], 
    function(jQuery, FragmentControl, XML) {
	"use strict";
	var SimpleText = FragmentControl.extend("fragments.SimpleText", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "Default Text"}
			}
		}
	});
	return SimpleText;
}, /* bExport= */true);
