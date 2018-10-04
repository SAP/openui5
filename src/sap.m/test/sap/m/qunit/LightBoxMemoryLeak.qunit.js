sap.ui.define([
	'sap/ui/qunit/utils/MemoryLeakCheck',
	'sap/m/LightBox',
	'sap/m/LightBoxItem'
],
	function(MemoryLeakCheck, LightBox, LightBoxItem) {
	"use strict";

	MemoryLeakCheck.checkControl("sap.m.LightBox", function(){
		return new LightBox({
			imageContent: new LightBoxItem({ // LightBox can only be rendered when some image content is available
				imageSrc: "some test image"
			})
		});
	});

});