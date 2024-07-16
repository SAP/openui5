/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Page,
	ComponentContainer,
	UIComponent,
	OverlayRegistry,
	PersistenceWriteAPI,
	nextUIUpdate,
	BasePlugin,
	ReloadManager,
	RuntimeAuthoring,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("basic functionality", {
		async before() {
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
					// eslint-disable-next-line no-return-assign
					return new Page("page", {
						content: [
							this.oButton1 = new Button("button1"),
							this.oButton2 = new Button("button2"),
							this.oButton3 = new Button("button3")
						]
					});
				}.bind(this)
			});

			this.oComponent = new FixtureComponent();
			this.oPage = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oHasChangeHandlerStud = sinon.stub(BasePlugin.prototype, "hasChangeHandler").resolves(true);
		},
		beforeEach() {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);

			return this.oRta.start().then(function() {
				this.oRta._oDesignTime.getElementOverlays().forEach(function(oElementOverlay) {
					oElementOverlay.setSelectable(true);
				});

				return this.oRta.getService("selection").then(function(oSelectionService) {
					this.oSelectionService = oSelectionService;
				}.bind(this));
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		},
		after() {
			QUnit.config.fixture = "";
			this.oComponentContainer.destroy();
			this.oHasChangeHandlerStud.restore();
		}
	}, function() {
		QUnit.test("get()", function(assert) {
			return this.oSelectionService.get().then(function(aSelection) {
				assert.ok(Array.isArray(aSelection));
				assert.strictEqual(aSelection.length, 0);
			});
		});
		QUnit.test("add() with a control id to the empty selection", function(assert) {
			return this.oSelectionService.add(this.oButton1.getId()).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 1);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("add() with multiple control ids the empty selection", function(assert) {
			return this.oSelectionService.add([this.oButton1.getId(), this.oButton2.getId()]).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 2);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					assert.strictEqual(aSelection[1], this.oButton2.getId());
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("add() with multiple control ids the existing selection", function(assert) {
			return this.oSelectionService.add(this.oButton1.getId()).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 1);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					return this.oSelectionService.add([this.oButton2.getId(), this.oButton3.getId()]).then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 3);
							assert.strictEqual(aSelection[0], this.oButton1.getId());
							assert.strictEqual(aSelection[1], this.oButton2.getId());
							assert.strictEqual(aSelection[2], this.oButton3.getId());
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("set() with a control id", function(assert) {
			return this.oSelectionService.add(this.oButton1.getId()).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 1);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					return this.oSelectionService.set(this.oButton2.getId()).then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 1);
							assert.strictEqual(aSelection[0], this.oButton2.getId());
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("set() with multiple control ids", function(assert) {
			return this.oSelectionService.add(this.oButton1.getId()).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 1);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					return this.oSelectionService.set([this.oButton2.getId(), this.oButton3.getId()]).then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 2);
							assert.strictEqual(aSelection[0], this.oButton2.getId());
							assert.strictEqual(aSelection[1], this.oButton3.getId());
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("remove() with a control id", function(assert) {
			return this.oSelectionService.add([this.oButton1.getId(), this.oButton2.getId()]).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 2);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					assert.strictEqual(aSelection[1], this.oButton2.getId());
					return this.oSelectionService.remove(this.oButton1.getId()).then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 1);
							assert.strictEqual(aSelection[0], this.oButton2.getId());
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("remove() with a multiple control ids", function(assert) {
			return this.oSelectionService.add([
				this.oButton1.getId(),
				this.oButton2.getId(),
				this.oButton3.getId()
			]).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 3);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					assert.strictEqual(aSelection[1], this.oButton2.getId());
					assert.strictEqual(aSelection[2], this.oButton3.getId());
					return this.oSelectionService.remove([
						this.oButton1.getId(),
						this.oButton2.getId()
					]).then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 1);
							assert.strictEqual(aSelection[0], this.oButton3.getId());
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("reset()", function(assert) {
			return this.oSelectionService.add([this.oButton1.getId(), this.oButton2.getId()]).then(function(bResult) {
				assert.strictEqual(bResult, true);
				return this.oSelectionService.get().then(function(aSelection) {
					assert.strictEqual(aSelection.length, 2);
					assert.strictEqual(aSelection[0], this.oButton1.getId());
					assert.strictEqual(aSelection[1], this.oButton2.getId());
					return this.oSelectionService.reset().then(function(bResult) {
						assert.strictEqual(bResult, true);
						return this.oSelectionService.get().then(function(aSelection) {
							assert.strictEqual(aSelection.length, 0);
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("receiving an event when selection has been changed", function(assert) {
			assert.expect(2);
			var fnDone = assert.async();
			this.oSelectionService.attachEvent("change", function(aSelection) {
				assert.ok(Array.isArray(aSelection));
				assert.strictEqual(aSelection[0], this.oButton1.getId());
				fnDone();
			}, this);
			this.oSelectionService.add(this.oButton1.getId());
		});
		QUnit.test("addHover() and RemoveHover()", async function(assert) {
			await this.oSelectionService.addHover(this.oButton1.getId());
			const oOverlay = OverlayRegistry.getOverlay(this.oButton1);
			// TODO: Replace with DT CSS class after refactoring
			assert.ok(oOverlay.hasStyleClass("sapUiRtaOverlayHover"));
			await this.oSelectionService.removeHover(this.oButton1.getId());
			// TODO: Replace with DT CSS class after refactoring
			assert.notOk(oOverlay.hasStyleClass("sapUiRtaOverlayHover"));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});