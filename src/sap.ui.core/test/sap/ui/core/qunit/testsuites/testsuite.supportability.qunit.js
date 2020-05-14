sap.ui.define([], function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Supportability",
		defaults: {
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"util/jQuery.sap.measure": {
				title: "jQuery.sap.measure"
			},
			"util/jquery.sap.trace": {
				title: "jQuery.sap.trace",
				beforeBootstrap: "test-resources/sap/ui/core/qunit/util/beforeBootstrap/jQuery.sap.trace"
			},
			AppCacheBuster: {
				/**
				 * Page kept because test assumes a specific baseURI
				 */
				page: "test-resources/sap/ui/core/qunit/AppCacheBuster.qunit.html",
				title: "sap.ui.core.AppCacheBuster"
			},
			"performance/BeaconRequest": {
				title: "sap.ui.performance.BeaconRequest",
				loader: {
					paths: {
						performance: "test-resources/sap/ui/core/qunit/performance"
					}
				}
			},
			"performance/trace/FESR": {
				title: "sap.ui.performance.FESR"
			},
			"performance/trace/InitFESR_metatag": {
				page: "test-resources/sap/ui/core/qunit/performance/trace/InitFESR_metatag.qunit.html",
				title: "sap.ui.performance.trace.FESR: Activation of FESR via meta-tag"
			},
			"performance/trace/InitFESR_metatag_beaconurl": {
				page: "test-resources/sap/ui/core/qunit/performance/trace/InitFESR_metatag_beaconurl.qunit.html",
				title: "sap.ui.performance.trace.FESR: Activation of FESR via meta-tag with beacon URL"
			},
			"performance/trace/InitFESR_notactive": {
				title: "sap.ui.performance.trace.FESR: Inactivity of FESR"
			},
			"performance/trace/InitFESR_urlparam": {
				page: "test-resources/sap/ui/core/qunit/performance/trace/InitFESR_urlparam.qunit.html?sap-ui-fesr=true",
				title: "sap.ui.performance.trace.FESR: Activation of FESR via url-param"
			},
			"performance/trace/Interaction": {
				title: "sap.ui.performance.Interaction"
			},
			"performance/trace/Passport": {
				title: "sap.ui.performance.Passport"
			},
			"performance/XHRInterceptor": {
				title: "sap.ui.performance.XHRInterceptor"
			}
		}
	};
});
