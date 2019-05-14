sap.ui.define(["testdata/xml-require/extension-points/Parent/Component"], function (Parent) {
	"use strict";

	return Parent.extend("testdata.xml-require.extension-points.Child.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			Parent.prototype.init.apply(this, arguments);
		}
	});

});