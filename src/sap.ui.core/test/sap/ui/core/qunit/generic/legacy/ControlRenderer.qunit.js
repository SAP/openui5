/*global QUnit */
/**
 * @fileoverview
 * @deprecated As of version 1.120
 */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/Device"
], function(ControlIterator, Device) {
	"use strict";

	QUnit.module("ControlRenderer");

	QUnit.test("check async loading", function(assert) {
		if (!Device.browser.chrome) {
			assert.ok(true, "should only be executed on Chrome since it is a generic, browser independent test");
			return;
		}

		var done = assert.async();

		var syncSpy = this.spy(sap.ui, "requireSync");
		var aNonExistingRenderers = [];
		ControlIterator.run(function(sControlName, oControlClass, oInfo) {
			// check if, although control has been loaded already, retrieving the control's renderer would trigger a successful sync request
			if (oInfo.canRender) {
				var metadata = oControlClass.getMetadata();

				var rendererModuleName = metadata.getRendererName().replace(/\./g, "/");
				var renderer = sap.ui.require(rendererModuleName);
				if (!renderer) {
					// manually call #getRenderer() to trigger a sync call (requireSync)
					try {
						metadata.getRenderer();
					} catch (e) {
						// sync request fails -> no renderer present
						aNonExistingRenderers.push(rendererModuleName);
					}
				}
			}
		}, {
			librariesToTest: ControlIterator.aKnownOpenUI5Libraries,
			includeElements: false,
			done: function() {
				var aCalls = syncSpy.getCalls().map(function(o) {
					return o.args[0];
				});

				assert.deepEqual(aCalls.filter(function(r) {
					return r.endsWith("Renderer") && aNonExistingRenderers.indexOf(r) === -1;
				}), [], "Renderers should never be required using synchronously. Check the respective control and add a dependency to its renderer");

				done();
			}
		});
	});

});
