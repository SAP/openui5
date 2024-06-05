sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			page: "test-resources/sap/ui/core/qunit/{name}/testsuite.{name}.qunit.html"
		},
		tests: {
			"Test Starter": {
				page: "test-resources/sap/ui/core/qunit/test/starter/testsuite.starter.qunit.html"
			},
			app: {},
			bootstrap: {},
			csp: {},
			/**
			 * Testsuite for validating the jQuery-compat layer that patches incompatibilities between jQuery v2 and v3
			 * @deprecated As of 1.112
			 */
			compat: {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/testsuite.compat.qunit.html"
			},
			component: {},
			composite: {},
			"Messaging": {
				page: "test-resources/sap/ui/core/qunit/messages/testsuite.messaging.base.qunit.html"
			},
			mvc: {},
			routing: {},
			"Core": {
				page: "test-resources/sap/ui/core/qunit/testsuite.core.qunit.html"
			},
			"Core Framework": {
				page: "test-resources/sap/ui/core/qunit/testsuite.core.framework.qunit.html"
			},
			"Browser Runtime": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.browser.runtime.qunit.html"
			},
			"Base Configuration": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.base.configuration.qunit.html"
			},
			"Control Framework": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.control.framework.qunit.html"
			},
			"Controls": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.controls.qunit.html"
			},
			"Data Binding": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.databinding.qunit.html"
			},
			"Dom": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.dom.qunit.html"
			},
			"Eventing": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.eventing.qunit.html"
			},
			"Foundation Enablement": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.foundation.enablement.qunit.html"
			},
			"BaseObject, ManagedObject and their Helpers": {
				page: "test-resources/sap/ui/core/qunit/ui5classes/testsuite.ui5classes.qunit.html"
			},
			"Modular Core": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.modular.core.qunit.html"
			},
			"Samples": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.samples.qunit.html"
			},
			"Security": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.security.qunit.html"
			},
			"Supportability": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.supportability.qunit.html"
			},
			"Theming": {
				page: "test-resources/sap/ui/core/qunit/testsuites/testsuite.theming.qunit.html"
			},
			service: {},
			tmpl: {},
			designtime: {},
			dnd: {},
			fieldhelp: {},
			generic: {},
			/**
			 * Generic testsuite exists in modern variant per library with its own "testsuite.generic.qunit.html".
			 * Generic testsuite for Core library see entry above.
			 * @deprecated As of 1.110
			 */
			"Legacy generic Testsuite": {
				page: "test-resources/sap/ui/core/qunit/generic/legacy/testsuite.generic.qunit.html"
			},
			gherkin: {},
			i18n: {},
			json: {},
			loader: {},
			mockserver: {},
			"OData Types": {
				page: "test-resources/sap/ui/core/qunit/odata/type/testsuite.odata.types.qunit.html"},
			"OData V2": {
				page: "test-resources/sap/ui/core/qunit/odata/v2/testsuite.odatav2.qunit.html"},
			"OData V4": {
				page: "test-resources/sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit.html"},
			opa: {},
			types: {},
			util: {},
			rule: {},
			xml: {}
		}
	};
});
