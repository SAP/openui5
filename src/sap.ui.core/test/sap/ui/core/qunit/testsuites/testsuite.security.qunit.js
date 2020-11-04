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
			"base/security/URLWhitelist": {
				title: "Deprecated API: sap.base.security.URLWhitelist"
			},
			"security/FrameOptions": {
				title: "sap.ui.security.FrameOptions"
			},
			"util/jQuery.sap.FrameOptions-meta-tag-override-mode": {
				beforeBootstrap: "test-resources/sap/ui/core/qunit/util/beforeBootstrap/jQuery.sap.FrameOptions-meta-tag",
				ui5: {
					frameOptions: "deny"
				}
			},
			"util/jQuery.sap.FrameOptions-meta-tag-override-service": {
				beforeBootstrap: "test-resources/sap/ui/core/qunit/util/beforeBootstrap/jQuery.sap.FrameOptions-meta-tag",
				ui5: {
					allowlistService: "/url/to/service/via/ui5/config"
				}
			},
			"util/jQuery.sap.FrameOptions-meta-tag": {
				beforeBootstrap: "test-resources/sap/ui/core/qunit/util/beforeBootstrap/jQuery.sap.FrameOptions-meta-tag"
			},
			"util/jQuery.sap.FrameOptions": {
				sinon: {
					useFakeTimers: true
				}
			}
		}
	};
});
