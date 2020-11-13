/* global QUnit*/

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/thirdparty/sinon-4"
],
function (
	RuntimeAuthoring,
	BasePlugin,
	UIComponent,
	ComponentContainer,
	Page,
	Button,
	OverlayRegistry,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("basic functionality", {
		before: function () {
			QUnit.config.fixture = null;
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function() {
					return new Page('page', {
						content: [
							new Button('button')
						]
					});
				}
			});

			this.oComponent = new FixtureComponent();
			this.oPage = this.oComponent.getRootControl();
			this.oButton = this.oPage.getContent()[0];

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			sandbox.stub(BasePlugin.prototype, 'hasChangeHandler').resolves(true);
		},
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oPage
			});

			return this.oRta.start().then(function () {
				return this.oRta.getService('action').then(function (oActionService) {
					this.oActionService = oActionService;
					this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
					this.oButtonOverlay.setDesignTimeMetadata(Object.assign({}, this.oButtonOverlay.getDesignTimeMetadata().getData(), {
						actions: {
							remove: {
								changeType: "hideControl"
							}
						}
					}));
					var oRemovePlugin = this.oRta.getDefaultPlugins()["remove"];
					oRemovePlugin.evaluateEditable([this.oButtonOverlay], { onRegistration: false });
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
		},
		after: function () {
			QUnit.config.fixture = '';
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get()", function (assert) {
			return this.oActionService.get(this.oButtonOverlay.getId()).then(function (aActions) {
				assert.ok(Array.isArray(aActions));
				assert.strictEqual(aActions.length, 1);
				assert.strictEqual(aActions[0].id, "CTX_REMOVE");
			});
		});
		QUnit.test("get() with non-existent control/non under RTA control", function (assert) {
			return this.oActionService.get([this.oButtonOverlay.getId(), 'fakeControl']).then(
				function () {
					assert.ok(false, 'this must never be called');
				},
				function () {
					assert.ok(true);
				}
			);
		});
		QUnit.test("execute()", function (assert) {
			return this.oActionService.execute(this.oButtonOverlay.getId(), 'CTX_REMOVE').then(function () {
				assert.ok(true);
			});
		});
		QUnit.test("execute() with non-existent control/non under RTA control", function (assert) {
			return this.oActionService.execute([this.oButtonOverlay.getId(), 'fakeControl'], 'CTX_REMOVE').then(
				function () {
					assert.ok(false, 'this must never be called');
				},
				function () {
					assert.ok(true);
				}
			);
		});
		QUnit.test("execute() with non-existent action", function (assert) {
			return this.oActionService.execute(this.oButtonOverlay.getId(), 'fakeAction').then(
				function () {
					assert.ok(false, 'this must never be called');
				},
				function () {
					assert.ok(true);
				}
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});