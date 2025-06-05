/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/isReuseComponent",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	Utils,
	isReuseComponent,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("isReuseComponent", {
		beforeEach() {
			this.oComponent = new UIComponent();
		},
		afterEach() {
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the component is part of the component usages of the app component", function(assert) {
			const oParentComponent = new (UIComponent.extend("component", {
				metadata: {
					manifest: {
						"_version": "2.0.0",

						"sap.ui5": {
							componentUsages: {
								reuseComponent: {
									name: "testComponent"
								}
							}
						}
					}
				}
			}))();

			sandbox.stub(Utils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this.oComponent)
			.returns(oParentComponent);

			sandbox.stub(this.oComponent, "getManifest")
			.returns({
				"_version": "2.0.0",

				"sap.app": {
					id: "testComponent"
				}
			});
			assert.ok(isReuseComponent(this.oComponent), "then isReuseComponent returns true");
		});

		QUnit.test("when the app component does not have a componentUsages section", function(assert) {
			const oParentComponent = new (UIComponent.extend("component", {
				metadata: {
					manifest: {
						"_version": "2.0.0",
						"sap.ui5": {}
					}
				}
			}))();

			sandbox.stub(Utils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this.oComponent)
			.returns(oParentComponent);

			sandbox.stub(this.oComponent, "getManifest")
			.returns({
				"_version": "2.0.0",

				"sap.app": {
					id: "testComponent"
				}
			});
			assert.notOk(isReuseComponent(this.oComponent), "then isReuseComponent returns false");
		});

		QUnit.test("when the app component has multiple componentUsages but none fitting to the reuse component", function(assert) {
			const oParentComponent = new (UIComponent.extend("component", {
				metadata: {
					manifest: {
						"_version": "2.0.0",

						"sap.ui5": {
							componentUsages: {
								reuseComponent1: {
									name: "testComponent1"
								},
								reuseComponent2: {
									name: "testComponent2"
								}
							}
						}
					}
				}
			}))();

			sandbox.stub(Utils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this.oComponent)
			.returns(oParentComponent);

			sandbox.stub(this.oComponent, "getManifest")
			.returns({
				"_version": "2.0.0",

				"sap.app": {
					id: "testComponent"
				}
			});
			assert.notOk(isReuseComponent(this.oComponent), "then isReuseComponent returns false");
		});

		QUnit.test("when the component is not part of the app component and no app component exists", function(assert) {
			assert.notOk(isReuseComponent(this.oComponent), "then isReuseComponent returns false");
		});
	});
});

