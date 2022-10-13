sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core.tmpl: Templating",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			/**
			 * @deprecated Since 1.56
			 */
			Template: {
				page: "test-resources/sap/ui/core/qunit/tmpl/Template.qunit.html"
				/*
				loader: {
					paths: {
						"test": 'test-resources/sap/ui/core/qunit/tmpl/'
					}
				}*/
			}
		}
	};
});
