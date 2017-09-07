sap.ui.define("LightBoxMemoryLeakTest", ['sap/ui/qunit/utils/MemoryLeakCheck', 'sap/m/LightBox'],
	function(MemoryLeakCheck, LightBox) {
	"use strict";

	MemoryLeakCheck.checkControl("sap.m.LightBox", function(){
		return new LightBox({
			imageContent: new sap.m.LightBoxItem({ // LightBox can only be rendered when some image content is available
				imageSrc: "some test image"
			})
		});
	});

});