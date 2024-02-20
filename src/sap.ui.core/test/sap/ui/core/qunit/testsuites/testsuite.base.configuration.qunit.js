sap.ui.define([], function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Configuration",
		defaults: {
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"base/Config_global": {
				page: "test-resources/sap/ui/core/qunit/base/Config_global.qunit.html?sap-ui-context=global['sap-ui-config']"
			},
			"base/Config_meta": {
				page: "test-resources/sap/ui/core/qunit/base/Config_meta.qunit.html?sap-ui-context=meta tag"
			},
			"base/Config_url": {
				page: "test-resources/sap/ui/core/qunit/base/Config_url.qunit.html?sap-ui-context=url&sap-ui-hubelDubel=value1&sap-ui-hubeldubel=value2&sap-ui-fooBar=value3&sap-ui-FooBar=value4&sap-ui-foobar=value5&sap-ui-foo-bar=value6&sap-ui-5ooBar=value7&sap-ui-sap-ui-fooBar=value8&sap-ui-sapUiFooBar=value9&sap-ui-sap.foo.bar=value10&sap-ui-xxBarFoo=value11&sap-ui-xx-farBoo=value12&sap-ui-sap/foo/bar=value13&sap-ushell-foo-bar=value14&sap-ui-initialFalsyValue=false&sap-ui-initial-falsy-value=true"
			},
			"base/Config_bootstrap": {
				page: "test-resources/sap/ui/core/qunit/base/Config_bootstrap.qunit.html"
			},
			"base/Config_cascade": {
				page: "test-resources/sap/ui/core/qunit/base/Config_cascade.qunit.html?sap-ui-paramA=url&sap-ui-param-merged-object=%7B\"objectKeyUrl\":\"urlObject\"%7D"
			},
			"base/Config_noUrl": {
				page: "test-resources/sap/ui/core/qunit/base/Config_noUrl.qunit.html?sap-ui-foo-bar=url"
			}
		}
	};
});
