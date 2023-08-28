sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Security",
		defaults: {
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"base/security/encodeCSS": {
				title: "sap.base.security.encodeCSS"
			},

			"base/security/encodeJS": {
				title: "sap.base.security.encodeJS"
			},

			"base/security/encodeURL": {
				title: "sap.base.security.encodeURL"
			},

			"base/security/encodeURLParameters": {
				title: "sap.base.security.encodeURLParameters"
			},

			"base/security/encodeXML": {
				title: "sap.base.security.encodeXML"
			},

			"base/security/sanitizeHTML": {
				title: "sap.base.security.sanitizeHTML"
			},

			"base/security/URLListValidator": {
				title: "sap.base.security.URLListValidator"
			},

			"security/FrameOptions": {
				title: "sap.ui.security.FrameOptions"
			}
		}
	};
});
