sap.ui.define(['sap/ui/core/Component'],
	function(Component) {
	"use strict";
	var MySimpleComponent = Component.extend("sap.test.mysimplecomp.Component", {
		metadata : {
			manifest: "json"
		}
	});
	return MySimpleComponent;
});
