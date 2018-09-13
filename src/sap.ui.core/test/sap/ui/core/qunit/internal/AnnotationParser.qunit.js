/*!
 * ${copyright}
 */
/*global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"test-resources/sap/ui/core/qunit/odata/ODataAnnotations.qunit",
	"test-resources/sap/ui/core/qunit/odata/v2/ODataAnnotationsV2.qunit",
	// Note: these tests MUST run last because their afterEach() cleans up the global XHR created by
	// ODataAnnotationsFakeService.js
	"test-resources/sap/ui/core/qunit/odata/AnnotationHelper.qunit",
	"test-resources/sap/ui/core/qunit/odata/ODataMetaModel.qunit",
	"test-resources/sap/ui/core/qunit/odata/_AnnotationHelperBasics.qunit",
	"test-resources/sap/ui/core/qunit/odata/_AnnotationHelperExpression.qunit",
	"test-resources/sap/ui/core/qunit/odata/_ODataMetaModelUtils.qunit"
], function () {
	"use strict";

	QUnit.start();
});
