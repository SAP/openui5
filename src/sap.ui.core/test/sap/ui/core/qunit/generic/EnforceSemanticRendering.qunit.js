/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/generic/TestBase"
], function(TestBase) {
	"use strict";

	/**
	 * Generic test to enforce the usage of semantic (V2) syntax for control renderers.
	 *
	 * @namespace
	 * @private
	 */
	var EnforceSemanticRendering = TestBase.extend("sap.ui.core.qunit.generic.EnforceSemanticRendering", {
		/**
		 * @override
		 */
		shouldIgnoreControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.className,
				oCapabilities = this.getObjectCapabilities(sControlName) || {},
				oRenderer,
				bIgnore = false;

			try {
				oRenderer = oClassInfo.fnClass.getMetadata().getRenderer();
			} catch (error) {
				// Do nothing in case no renderer can be retrieved
			}
			if (!oRenderer) {
				assert.ok(true, "INFO: " + sControlName + " cannot be rendered because there is no renderer.");
				bIgnore = true;
			}

			if (oCapabilities && oCapabilities.apiVersion === 1) {
				var iApiVersion = Object.hasOwn(oRenderer, "apiVersion") ? oRenderer.apiVersion : 1;
				if (iApiVersion !== oCapabilities.apiVersion) {
					assert.ok(false, "The option 'apiVersion' for control '" + sControlName + "' is set to '1', but its renderer is configured with apiVersion 2.");
				} else {
					assert.ok(true, "WARNING: " + sControlName + "Renderer is API version 1 and has therefore been EXCLUDED.");
					bIgnore = true;
				}
			}

			return bIgnore;
		},

		/**
		 * @override
		 */
		testControl: function(oClassInfo, assert) {
			var oRenderer = oClassInfo.fnClass.getMetadata().getRenderer(),
				iApiVersion = Object.hasOwn(oRenderer, "apiVersion") ? oRenderer.apiVersion : 1;
			assert.notEqual(iApiVersion, 1, "Semantic Rendering enabled for control " + oClassInfo.className);
		}
	});

	return new EnforceSemanticRendering().setupAndStart();
});
