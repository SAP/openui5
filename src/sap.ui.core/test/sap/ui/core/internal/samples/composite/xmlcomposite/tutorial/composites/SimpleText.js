sap.ui.define([
],
	function() {
	"use strict";
	var SimpleText = undefined/*XMLComposite*/.extend("composites.SimpleText", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "Default Text"}
			}
		}
	});
	return SimpleText;
});
