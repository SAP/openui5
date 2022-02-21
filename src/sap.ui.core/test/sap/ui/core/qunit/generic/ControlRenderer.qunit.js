
/*!
 * ${copyright}
 */

/* global sinon */
sap.ui.define([
	"sap/ui/test/generic/TestBase"
], function(TestBase) {
	"use strict";

	var syncSpy = sinon.spy(sap.ui, "requireSync");

	/**
	 * @namespace
	 * @private
	 */
	var ControlRenderer = TestBase.extend("sap.ui.core.qunit.generic.ControlRenderer", {
		/**
		 * @override
		 */
		shouldIgnoreControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.className,
				oCapabilities = this.getObjectCapabilities(sControlName) || {},
				bIgnore = false,
				oMetadata = oClassInfo.fnClass.getMetadata();

			if (oCapabilities.create === false) {
				assert.ok(true, "WARNING: " + sControlName + " cannot be instantiated on its own.");
				bIgnore = true;
			}

			if (oMetadata && oMetadata.isAbstract()) {
				assert.ok(true, "INFO: " + sControlName + " cannot be instantiated because it is abstract.");
				bIgnore = true;
			}

			if (!(oMetadata && oMetadata.isA("sap.ui.core.Control"))) {
				assert.ok(true, "INFO: " + sControlName + " cannot be rendered because its no control.");
				bIgnore = true;
			}

			if (!(oMetadata && oMetadata.getRendererName())) {
				assert.ok(true, "INFO: " + sControlName + " cannot be rendered because it has no renderer.");
				bIgnore = true;
			}

			return bIgnore;
		},

		/**
		 * @override
		 */
		testControl: function(oClassInfo, assert) {
			var oMetadata = oClassInfo.fnClass.getMetadata();

			var sRendererModuleName = oMetadata.getRendererName().replace(/\./g, "/");
			// manually call #getRenderer() to trigger a sync call (requireSync)
			try {
				oMetadata.getRenderer();
				var bTestSuccessful = !(syncSpy.getCalls().map(function(o) {
					return o.args[0];
				}).includes(sRendererModuleName));
				assert.ok(bTestSuccessful, "No sync request to get renderer for control: " + oMetadata.getName());
			} catch (e) {
				// sync request fails -> no renderer present
				assert.ok(true, "INFO: Tried to getRenderer for control: " + oMetadata.getName() + " which has no renderer");
			}
		}
	});

	return new ControlRenderer().setupAndStart();
});