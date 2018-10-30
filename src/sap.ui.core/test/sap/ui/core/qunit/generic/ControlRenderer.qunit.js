/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/Device",
	"sap/base/util/ObjectPath"
], function(ControlIterator, Device, ObjectPath) {
	"use strict";

	QUnit.module("ControlRenderer");

	QUnit.test("check async loading", function(assert) {
		if (!Device.browser.chrome) {
			assert.ok(true, "should only be executed on chrome since it is a generic browser independent test");
			return;
		}

		var aOpenUI5Libraries = [
			"sap.f",
			"sap.m",
			"sap.tnt",
			"sap.ui.codeeditor",
			"sap.ui.commons",
			"sap.ui.core",
			"sap.ui.demokit",
			"sap.ui.documentation",
			"sap.ui.dt",
			"sap.ui.fl",
			"sap.ui.layout",
			"sap.ui.rta",
			"sap.ui.suite",
			"sap.ui.support",
			"sap.ui.table",
			"sap.ui.unified",
			"sap.ui.ux3",
			"sap.uxap"
		];

		var syncSpy = sinon.spy(sap.ui, "requireSync");
		var fnFilterLibraries = function(sLibName) {
			return aOpenUI5Libraries.indexOf(sLibName) !== -1;
		};
		return ControlIterator.getAllControlNames(fnFilterLibraries).then(function(aControls) {
			var aNonExistingRenderers = [];
			aControls.forEach(function(sControlName) {
				var oControlClass = ObjectPath.get(sControlName || "");
				if (oControlClass) {
					try {
						// instantiate control
						new oControlClass();

						// check if although instantiated, retrieving the control's renderer would trigger a successful sync request
						if (ControlIterator.controlCanBeRendered(sControlName)) {
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
					} catch (e) {
						//instantiation fails
					}
				}
			});
			return aNonExistingRenderers;
		}).then(function(aNonExistingRenderers) {
			var aCalls = syncSpy.getCalls().map(function(o) {
				return o.args[0];
			});

			assert.deepEqual(aCalls.filter(function(r) {
				return r.endsWith("Renderer") && aNonExistingRenderers.indexOf(r) === -1;
			}), [], "Renderers should never be required using synchronously. Check the respective control and add a dependency to its renderer");
		});
	});

});
