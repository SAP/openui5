sap.ui.define(['sap/ui/test/dependencyLoading/component1/Component'], function (Component1) {
	"use strict";

	return Component1.extend("sap.ui.test.dependencyLoading.component3.Component", {
		metadata: {
			manifest: "json"
		}
	});
});
