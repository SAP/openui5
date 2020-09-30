/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/toolbar/ChangeVisualization",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core",
	"sap/ui/rta/toolbar/ChangeIndicator",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/core/Control",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/Utils"
],
function(
	sinon,
	ChangeVisualization,
	Fragment,
	Core,
	ChangeIndicator,
	Adaptation,
	Control,
	OverlayRegistry,
	PersistenceWriteAPI,
	Component,
	JsControlTreeModifier,
	Layer,
	ChangesUtils,
	FlUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("ChangeVisualization tests with toolbar object", {
		beforeEach: function() {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are change indicators and the function switchChangeVisualizationActive is called", function(assert) {
			var done = assert.async();
			var oChangeIndicator = new ChangeIndicator();
			ChangeVisualization.changeIndicators = [
				{
					changeIndicator: oChangeIndicator
				}
			];

			this.oToolbar.onFragmentLoaded().then(function() {
				ChangeVisualization.button = this.oToolbar.getControl("showChanges");
				oChangeIndicator.onAfterRendering = function() {
					oChangeIndicator.onAfterRendering = function() { return; };
					ChangeVisualization.switchChangeVisualizationActive();
					assert.equal(ChangeVisualization.button.getType(), sap.m.ButtonType.Emphasized, "toolbar button type has changed to emphasized");
					assert.equal(ChangeVisualization.button.getTooltip(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("BUT_CHANGEVISUALIZATION_HIDECHANGES"), "toolbar button tooltip has changed");
					done();
				};
				oChangeIndicator.placeAt("qunit-fixture");
			}.bind(this));
		});

		QUnit.test("when there are no change indicators and the function switchChangeVisualizationActive is called", function(assert) {
			return this.oToolbar.onFragmentLoaded().then(function() {
				ChangeVisualization.changeIndicators = [];
				ChangeVisualization.button = this.oToolbar.getControl("showChanges");
				ChangeVisualization.switchChangeVisualizationActive();
				assert.equal(ChangeVisualization.button.getType(), sap.m.ButtonType.Transparent, "toolbar button type has changed to transparent");
				assert.equal(ChangeVisualization.button.getTooltip(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("BUT_CHANGEVISUALIZATION_SHOWCHANGES"), "toolbar button tooltip has changed");
			}.bind(this));
		});

		QUnit.test("when a specifc change type is selected in the popover", function(assert) {
			return Fragment.load({
				name: "sap.ui.rta.toolbar.Changes",
				id: "fragment_changeVisualization",
				controller: ChangeVisualization
			}).then(function(oPopover) {
				ChangeVisualization.changesPopover = oPopover;
				ChangeVisualization.updateCommandModel();
				ChangeVisualization.button = this.oToolbar.getControl("showChanges");
				ChangeVisualization.button.placeAt("qunit-fixture");
				Core.applyChanges();
				ChangeVisualization.changesPopover.openBy(ChangeVisualization.button);

				var oEvent = {
					getSource: function() {
						return {
							getBindingContext: function() {
								return {
									getModel: function() {
										return ChangeVisualization.changesPopover.getModel("commandModel");
									},
									getPath: function () {
										return "/commands/2";
									}
								};
							}
						};
					}
				};
				var oSwitchChangeVisualizationActiveStub = sandbox.stub(ChangeVisualization, "switchChangeVisualizationActive");
				var oChange = {
					getDefinition: function() {
						return {
							support: {
								command: "move"
							}
						};
					}
				};
				ChangeVisualization.changes = [oChange];
				var sParentId = "qunit-fixture";
				var aControls = [new Control()];
				var oChangeIndicator = new ChangeIndicator({
					mode: "change",
					parentId: sParentId,
					changes: [ChangeVisualization.changes[0]]
				});
				var oGetChangedElementStub = sandbox.stub(ChangeVisualization, "getChangedElements").resolves(aControls);
				var oCreateChangeIndicatorStub = sandbox.stub(ChangeVisualization, "createChangeIndicator").returns(oChangeIndicator);

				var aPromises = [];
				aPromises.push(new Promise(function(resolve) {
					oChangeIndicator.onAfterRendering = function() {
						resolve();
					};
				}));
				aPromises.push(new Promise(function(resolve) {
					ChangeVisualization.changesPopover.attachAfterClose(function() {
						resolve();
					});
				}));

				ChangeVisualization.showSpecificChanges(oEvent);
				return Promise.all(aPromises).then(function() {
					assert.ok(!ChangeVisualization.changesPopover.isOpen(), "the changes popover is closed");
					assert.equal(oSwitchChangeVisualizationActiveStub.callCount, ChangeVisualization.changes.length, "the toolbar button color changes dependent on the mode");
					assert.equal(oGetChangedElementStub.lastCall.args[0], ChangeVisualization.changes[0], "the function is called with the correct change");
					assert.equal(oGetChangedElementStub.callCount, ChangeVisualization.changes.length, "there is found a changed element for each change");
					assert.equal(oCreateChangeIndicatorStub.lastCall.args[0], ChangeVisualization.changes[0], "the function is called with the correct change");
					assert.deepEqual(oCreateChangeIndicatorStub.lastCall.args[1], aControls[0], "the function is called with the correct element");
					assert.equal(oCreateChangeIndicatorStub.lastCall.args[2], "change", "the function is called with the correct mode");
					assert.equal(oCreateChangeIndicatorStub.callCount, ChangeVisualization.changes.length, "there is created one change indicator for each change");
					var bCorrectArray = ChangeVisualization.changeIndicators[0].elementId === sParentId && ChangeVisualization.changeIndicators[0].changeIndicator === oChangeIndicator;
					assert.ok(bCorrectArray, "the change indicators are correctly pushed into the array");
				});
			}.bind(this));
		});
	});

	QUnit.module("ChangeVisualization tests", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when all change indicators should be removed", function(assert) {
			var oChangeIndicator = new ChangeIndicator();
			ChangeVisualization.changeIndicators = [
				{
					changeIndicator: oChangeIndicator
				}
			];
			var oSwitchChangeVisualizationActiveStub = sandbox.stub(ChangeVisualization, "switchChangeVisualizationActive");
			var oRemoveStub = sandbox.stub(oChangeIndicator, "remove");
			var oDestroyStub = sandbox.stub(oChangeIndicator, "destroy");
			ChangeVisualization.removeChangeIndicators();
			assert.deepEqual(ChangeVisualization.changeIndicators, [], "the change indicator array is empty");
			assert.equal(oSwitchChangeVisualizationActiveStub.callCount, 1, "the toolbar button mode has changed");
			assert.equal(oRemoveStub.callCount, 1, "the change indicators are removed");
			assert.equal(oDestroyStub.callCount, 1, "the change indicators are destroyed");
		});

		QUnit.test("when all change indicators should be hidden", function(assert) {
			var oChangeIndicator = new ChangeIndicator();
			ChangeVisualization.changeIndicators = [
				{
					changeIndicator: oChangeIndicator
				}
			];
			var oHideStub = sandbox.stub(oChangeIndicator, "hide");
			ChangeVisualization.hideChangeIndicators();
			assert.equal(oHideStub.callCount, 1, "the change indicators are hidden");
		});

		QUnit.test("when all existing change indicators should be revealed", function(assert) {
			var oChangeIndicator = new ChangeIndicator();
			ChangeVisualization.changeIndicators = [
				{
					changeIndicator: oChangeIndicator
				}
			];
			var oRevealStub = sandbox.stub(oChangeIndicator, "reveal");
			ChangeVisualization.revealChangeIndicators();
			assert.equal(oRevealStub.callCount, 1, "the change indicators are revealed");
		});

		QUnit.test("existChangeIndicators when there are change indicators", function(assert) {
			var oChangeIndicator = new ChangeIndicator();
			ChangeVisualization.changeIndicators = [
				{
					changeIndicator: oChangeIndicator
				}
			];
			assert.equal(ChangeVisualization.changeIndicators.length, 1, "the number of change indicators is greater than 0");
		});

		QUnit.test("existChangeIndicators when there are no change indicators", function(assert) {
			ChangeVisualization.changeIndicators = [];
			assert.equal(ChangeVisualization.changeIndicators.length, 0, "the number of change indicators is 0");
		});

		QUnit.test("get changed elements when there are no infos from the chanege handler", function(assert) {
			ChangeVisualization.rootControlId = "qunit-fixture";
			var oInfoFromChangeHandler;
			var oSelector = {};
			var oChange = {
				getSelector: function() {
					return oSelector;
				}
			};
			var getInfoStub = sandbox.stub(ChangeVisualization, "getInfoFromChangeHandler").resolves(oInfoFromChangeHandler);
			var oGetSelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector").resolves(oSelector);
			var aPromises = [oSelector];
			return ChangeVisualization.getChangedElements(oChange).then(function(result) {
				assert.equal(getInfoStub.callCount, 1, "getInfoFromChangeHandler is called");
				assert.equal(getInfoStub.lastCall.args[0], Component.get(ChangeVisualization.rootControlId), "the function is called with the correct root component");
				assert.equal(getInfoStub.lastCall.args[1], oChange, "the function is called with the correct change");
				assert.ok(!oInfoFromChangeHandler, "getInfoFromChangeHandler did not return any results");
				assert.equal(oGetSelectorStub.callCount, 1, "bySelector is called");
				assert.equal(oGetSelectorStub.lastCall.args[0], oSelector, "the function is called with the correct Selector");
				assert.equal(oGetSelectorStub.lastCall.args[1], Component.get(ChangeVisualization.rootControlId), "the function is called with the correct root component");
				assert.deepEqual(result, aPromises, "the function returns the correct Selector");
			});
		});

		QUnit.test("get changed elements when there are additional infos from the change handler", function(assert) {
			ChangeVisualization.rootControlId = "qunit-fixture";
			var oInfoFromChangeHandler = {
				affectedControls: [{}]
			};
			var oSelector = {};
			var oChange = {
				getSelector: function() {
					return oSelector;
				}
			};
			var getInfoStub = sandbox.stub(ChangeVisualization, "getInfoFromChangeHandler").resolves(oInfoFromChangeHandler);
			var oGetSelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector").resolves(oInfoFromChangeHandler.affectedControls[0]);
			var aPromises = [oInfoFromChangeHandler.affectedControls[0]];
			return ChangeVisualization.getChangedElements(oChange).then(function(result) {
				assert.equal(getInfoStub.callCount, 1, "getInfoFromChangeHandler is called");
				assert.equal(getInfoStub.lastCall.args[0], Component.get(ChangeVisualization.rootControlId), "the function is called with the correct root component");
				assert.equal(getInfoStub.lastCall.args[1], oChange, "the function is called with the correct change");
				assert.ok(oInfoFromChangeHandler, "getInfoFromChangeHandler did not return any results");
				assert.equal(oGetSelectorStub.callCount, 1, "bySelector is called");
				assert.equal(oGetSelectorStub.lastCall.args[0], oInfoFromChangeHandler.affectedControls[0], "the function is called with the correct Selector");
				assert.equal(oGetSelectorStub.lastCall.args[1], Component.get(ChangeVisualization.rootControlId), "the function is called with the correct root component");
				assert.deepEqual(result, aPromises, "the function return the correct Selector");
			});
		});

		QUnit.test("when the commandModel is updated", function(assert) {
			ChangeVisualization.changesPopover = new Control();
			ChangeVisualization.updateCommandModel();
			assert.ok(ChangeVisualization.changesPopover.getModel("commandModel"), "the command model is set");
		});

		QUnit.test("when a change indicator should be created with the mode 'dependent'", function(assert) {
			var sMode = "dependent";
			ChangeVisualization.changeIndicators = [];
			ChangeVisualization.rootControlId = "rootControlId";
			var oChange = {
				getDefinition: function() {
					return {
						support: {
							command: "move"
						}
					};
				}
			};
			ChangeVisualization.button = {
				getModel: function() {
					return {};
				}
			};
			var oElement = new Control();
			var oOverlay = new Control("__testOverlay0");
			oElement.placeAt("qunit-fixture");
			oOverlay.placeAt("qunit-fixture");
			oOverlay.isVisible = function() {return true;};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			var oChangeIndicator = ChangeVisualization.createChangeIndicator(oChange, oElement.getId(), sMode);

			assert.equal(oChangeIndicator.getMode(sMode), sMode, "the change indicator has the correct mode");
			assert.equal(oChangeIndicator.getParentId(), oOverlay.sId, "the change indicator has the correct overlay");
			assert.deepEqual(oChangeIndicator.getChanges(), [oChange], "the change indicator has the correct changes");
			assert.equal(oChangeIndicator.getChanges().length, 1, "the change indicator has the correct number of changes");
			assert.equal(oChangeIndicator.hideChangeIndicators.toString(), ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization).toString(), "the method 'hideChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.revealChangeIndicators.toString(), ChangeVisualization.revealChangeIndicators.bind(ChangeVisualization).toString(), "the method 'revealChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.createChangeIndicator.toString(), ChangeVisualization.createChangeIndicator.bind(ChangeVisualization).toString(), "the method 'createChangeIndicator' was transfered to the change indicator");
		});

		QUnit.test("when a change indicator should be created with the mode 'change'", function(assert) {
			var sMode = "change";
			ChangeVisualization.changeIndicators = [];
			ChangeVisualization.rootControlId = "rootControlId";
			var oChange = {
				getDefinition: function() {
					return {
						support: {
							command: "move"
						}
					};
				}
			};
			var oOverlay = {
				isVisible: function() {
					return true;
				},
				toString: function() {
					return "__Overlay01";
				}
			};
			var sOverlay = "__" + oOverlay.toString().split("__")[1];
			var oElement = {
				getId: function() {
					return "elementId";
				}
			};
			ChangeVisualization.button = {
				getModel: function() {
					return {};
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			//oGetOverlayStub.onCall(0).returns(oOverlay);
			var oChangeIndicator = ChangeVisualization.createChangeIndicator(oChange, oElement.getId(), sMode);

			assert.equal(oChangeIndicator.getMode(), sMode, "the change indicator has the correct mode");
			assert.equal(oChangeIndicator.getParentId(), sOverlay, "the change indicator has the correct overlay");
			assert.deepEqual(oChangeIndicator.getChanges(), [oChange], "the change indicator has the correct changes");
			assert.equal(oChangeIndicator.getChanges().length, 1, "the change indicator has the correct number of changes");
			assert.equal(oChangeIndicator.hideChangeIndicators.toString(), ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization).toString(), "the method 'hideChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.revealChangeIndicators.toString(), ChangeVisualization.revealChangeIndicators.bind(ChangeVisualization).toString(), "the method 'revealChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.createChangeIndicator.toString(), ChangeVisualization.createChangeIndicator.bind(ChangeVisualization).toString(), "the method 'createChangeIndicator' was transfered to the change indicator");
		});

		QUnit.test("when a change indicator should be created with the mode 'dependent'", function(assert) {
			var sMode = "dependent";
			ChangeVisualization.changeIndicators = [];
			ChangeVisualization.rootControlId = "rootControlId";
			var oChange = {
				getDefinition: function() {
					return {
						support: {
							command: "move"
						}
					};
				}
			};
			var oElement = {
				getId: function() {
					return "elementId";
				}
			};
			var oOverlay = {
				isVisible: function() {
					return true;
				},
				toString: function() {
					return "__Overlay01";
				}
			};
			var sOverlay = "__" + oOverlay.toString().split("__")[1];
			ChangeVisualization.button = {
				getModel: function() {
					return {};
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			var oChangeIndicator = ChangeVisualization.createChangeIndicator(oChange, oElement.getId(), sMode);
			assert.equal(oChangeIndicator.getMode(), sMode, "the change indicator has the correct mode");
			assert.equal(oChangeIndicator.getParentId(), sOverlay, "the change indicator has the correct overlay");
			assert.deepEqual(oChangeIndicator.getChanges(), [oChange], "the change indicator has the correct changes");
			assert.equal(oChangeIndicator.getChanges().length, 1, "the change indicator has the correct number of changes");
			assert.equal(oChangeIndicator.hideChangeIndicators.toString(), ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization).toString(), "the method 'hideChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.revealChangeIndicators.toString(), ChangeVisualization.revealChangeIndicators.bind(ChangeVisualization).toString(), "the method 'revealChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.createChangeIndicator.toString(), ChangeVisualization.createChangeIndicator.bind(ChangeVisualization).toString(), "the method 'createChangeIndicator' was transfered to the change indicator");
		});

		QUnit.test("when a change indicator should be created with the mode 'change' and two changes at the same element", function(assert) {
			var sMode = "change";
			ChangeVisualization.changeIndicators = [];
			ChangeVisualization.rootControlId = "rootControlId";
			var oChange = {
				getDefinition: function() {
					return {
						support: {
							command: "move"
						}
					};
				}
			};
			var oElement = {
				getId: function() {
					return "elementId";
				}
			};
			var oOverlay = {
				isVisible: function() {
					return true;
				},
				toString: function() {
					return "__Overlay01";
				}
			};
			var sOverlay = "__" + oOverlay.toString().split("__")[1];
			ChangeVisualization.button = {
				getModel: function() {
					return {};
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			var oChangeIndicator = ChangeVisualization.createChangeIndicator(oChange, oElement.getId(), sMode);
			ChangeVisualization.changeIndicators.push({
				elementId: oChangeIndicator.getParentId(),
				changeIndicator: oChangeIndicator
			});
			var oChangeIndicator2 = ChangeVisualization.createChangeIndicator(oChange, oElement.getId(), sMode);

			assert.equal(oChangeIndicator.getMode(sMode), sMode, "the change indicator has the correct mode");
			assert.equal(oChangeIndicator.getParentId(), sOverlay, "the change indicator has the correct overlay");
			assert.deepEqual(oChangeIndicator.getChanges(), [oChange, oChange], "the change indicator has the correct changes");
			assert.equal(oChangeIndicator.getChanges().length, 2, "the change indicator has the correct number of changes");
			assert.ok(!oChangeIndicator2, "the second change indicator is null. His change was added to the first change indicator");
			assert.equal(oChangeIndicator.hideChangeIndicators.toString(), ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization).toString(), "the method 'hideChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.revealChangeIndicators.toString(), ChangeVisualization.revealChangeIndicators.bind(ChangeVisualization).toString(), "the method 'revealChangeIndicators' was transfered to the change indicator");
			assert.equal(oChangeIndicator.createChangeIndicator.toString(), ChangeVisualization.createChangeIndicator.bind(ChangeVisualization).toString(), "the method 'createChangeIndicator' was transfered to the change indicator");
		});

		QUnit.test("getChanges", function(assert) {
			ChangeVisualization.rootControlId = "rootControlId";
			var rootComponent = {};
			var mPropertyBag = {
				oComponent : rootComponent,
				selector: rootComponent,
				invalidateCache: false,
				includeVariants: true,
				//includeCtrlVariants: true,
				currentLayer: Layer.CUSTOMER
			};
			var oGetComponentStub = sandbox.stub(Component, "get").returns(rootComponent);
			var oGetUIChangesStub = sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves([]);
			return ChangeVisualization.getChanges().then(function(aChanges) {
				assert.equal(oGetComponentStub.callCount, 1, "the function 'Component.get' is called");
				assert.equal(oGetComponentStub.lastCall.args[0], "rootControlId", "the function 'Component.get' is called with the correct Parameter");
				assert.equal(oGetUIChangesStub.callCount, 1, "the function 'getUIChanges' is called");
				assert.deepEqual(oGetUIChangesStub.lastCall.args[0], mPropertyBag, "the function 'getUIChanges' is called with the correct Parameter");
				assert.deepEqual(aChanges, [], "the method returns the correct changes");
			});
		});

		QUnit.test("getInfoFromChangeHandler when control exists and change handler has the function to get additional information", function(assert) {
			var oControl = new Control();
			var oAppComponent = {componentName: "testComponent"};
			var oChange = {
				getSelector: function() {
					return {
						isLocal: false,
						id: oControl.sId
					};
				}
			};
			var oChangeHandler = {
				getChangeVisualizationInfo: function() {return;}
			};
			var oGetControlIdBySelectorStub = sandbox.stub(JsControlTreeModifier, "getControlIdBySelector").returns(oControl.sId);
			var oGetViewForControlStub = sandbox.stub(FlUtils, "getViewForControl").returns({viewName: "testView"});
			var oGetControlIfTemplateAffectedStub = sandbox.stub(ChangesUtils, "getControlIfTemplateAffected").returns(oControl);
			var oGetChangeHandlerStub = sandbox.stub(ChangesUtils, "getChangeHandler").resolves(oChangeHandler);
			var oGetChangeVisualizationInfoStub = sandbox.stub(oChangeHandler, "getChangeVisualizationInfo").returns({info: "testInfo"});
			return ChangeVisualization.getInfoFromChangeHandler(oAppComponent, oChange).then(function(oInfo) {
				assert.equal(oGetControlIdBySelectorStub.callCount, 1, "the function 'getControlIdBySelector' is called");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[0], oChange.getSelector(), "the function 'getControlIdBySelector' is called with the correct selector");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[1], oAppComponent, "the function 'getControlIdBySelector' is called with the correct app component");
				assert.equal(oGetViewForControlStub.callCount, 1, "the function 'getViewForControl' is called");
				assert.equal(oGetViewForControlStub.lastCall.args[0], Core.byId(oControl.sId), "the function 'getViewForControl' is called with the correct control");
				assert.equal(oGetControlIfTemplateAffectedStub.callCount, 1, "the function 'getControlIfTemplateAffected' is called");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][0], oChange, "the function 'getControlIfTemplateAffected' is called with the correct change");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][1], oControl, "the function 'getControlIfTemplateAffected' is called with the correct control");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].modifier, JsControlTreeModifier, "the property bag in 'getControlIfTemplateAffected' has the correct modifier");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].appComponent, oAppComponent, "the property bag in 'getControlIfTemplateAffected' has the correct app component");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].view, {viewName: "testView"}, "the property bag in 'getControlIfTemplateAffected' has the correct view");
				assert.equal(oGetChangeHandlerStub.callCount, 1, "the function 'getChangeHandler' is called");
				assert.deepEqual(oGetChangeHandlerStub.args[0][0], oChange, "the function 'getChangeHandler' is called with the correct change");
				assert.deepEqual(oGetChangeHandlerStub.args[0][1], oControl, "the function 'getChangeHandler' is called with the correct control");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].modifier, JsControlTreeModifier, "the property bag in 'getChangeHandler' has the correct modifier");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].appComponent, oAppComponent, "the property bag in 'getChangeHandler' has the correct app component");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].view, {viewName: "testView"}, "the property bag in 'getChangeHandler' has the correct view");
				assert.equal(oGetChangeVisualizationInfoStub.callCount, 1, "the function 'getChangeVisualizationInfo' is called");
				assert.deepEqual(oGetChangeVisualizationInfoStub.lastCall.args[0], oChange, "the function 'getChangeVisualizationInfo' is called with the correct change");
				assert.deepEqual(oInfo, {info: "testInfo"}, "the correct change handler information is returned");
			});
		});

		QUnit.test("getInfoFromChangeHandler when control exists and change handler has no function to get additional information", function(assert) {
			var oControl = new Control();
			var oAppComponent = {componentName: "testComponent"};
			var oChange = {
				getSelector: function() {
					return {
						isLocal: false,
						id: oControl.sId
					};
				}
			};
			var oChangeHandler = {};
			var oGetControlIdBySelectorStub = sandbox.stub(JsControlTreeModifier, "getControlIdBySelector").returns(oControl.sId);
			var oGetViewForControlStub = sandbox.stub(FlUtils, "getViewForControl").returns({viewName: "testView"});
			var oGetControlIfTemplateAffectedStub = sandbox.stub(ChangesUtils, "getControlIfTemplateAffected").returns(oControl);
			var oGetChangeHandlerStub = sandbox.stub(ChangesUtils, "getChangeHandler").resolves(oChangeHandler);
			return ChangeVisualization.getInfoFromChangeHandler(oAppComponent, oChange).then(function(oInfo) {
				assert.equal(oGetControlIdBySelectorStub.callCount, 1, "the function 'getControlIdBySelector' is called");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[0], oChange.getSelector(), "the function 'getControlIdBySelector' is called with the correct selector");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[1], oAppComponent, "the function 'getControlIdBySelector' is called with the correct app component");
				assert.equal(oGetViewForControlStub.callCount, 1, "the function 'getViewForControl' is called");
				assert.equal(oGetViewForControlStub.lastCall.args[0], Core.byId(oControl.sId), "the function 'getViewForControl' is called with the correct control");
				assert.equal(oGetControlIfTemplateAffectedStub.callCount, 1, "the function 'getControlIfTemplateAffected' is called");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][0], oChange, "the function 'getControlIfTemplateAffected' is called with the correct change");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][1], oControl, "the function 'getControlIfTemplateAffected' is called with the correct control");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].modifier, JsControlTreeModifier, "the property bag in 'getControlIfTemplateAffected' has the correct modifier");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].appComponent, oAppComponent, "the property bag in 'getControlIfTemplateAffected' has the correct app component");
				assert.deepEqual(oGetControlIfTemplateAffectedStub.args[0][2].view, {viewName: "testView"}, "the property bag in 'getControlIfTemplateAffected' has the correct view");
				assert.equal(oGetChangeHandlerStub.callCount, 1, "the function 'getChangeHandler' is called");
				assert.deepEqual(oGetChangeHandlerStub.args[0][0], oChange, "the function 'getChangeHandler' is called with the correct change");
				assert.deepEqual(oGetChangeHandlerStub.args[0][1], oControl, "the function 'getChangeHandler' is called with the correct control");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].modifier, JsControlTreeModifier, "the property bag in 'getChangeHandler' has the correct modifier");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].appComponent, oAppComponent, "the property bag in 'getChangeHandler' has the correct app component");
				assert.deepEqual(oGetChangeHandlerStub.args[0][2].view, {viewName: "testView"}, "the property bag in 'getChangeHandler' has the correct view");
				assert.equal(oChangeHandler.getChangeVisualizationInfo, undefined, "the function 'getChangeVisualizationInfo' is not defined");
				assert.equal(oInfo, undefined, "no change handler information is returned");
			});
		});

		QUnit.test("getInfoFromChangeHandler when control does not exist", function(assert) {
			var oControl = new Control();
			var oAppComponent = {componentName: "testComponent"};
			var oChange = {
				getSelector: function() {
					return {
						isLocal: false,
						id: oControl.sId
					};
				}
			};
			var oChangeHandler = {};
			var oGetControlIdBySelectorStub = sandbox.stub(JsControlTreeModifier, "getControlIdBySelector").returns("anyId");
			var oGetViewForControlStub = sandbox.stub(FlUtils, "getViewForControl").returns({viewName: "testView"});
			var oGetControlIfTemplateAffectedStub = sandbox.stub(ChangesUtils, "getControlIfTemplateAffected").returns(oControl);
			var oGetChangeHandlerStub = sandbox.stub(ChangesUtils, "getChangeHandler").resolves(oChangeHandler);
			return ChangeVisualization.getInfoFromChangeHandler(oAppComponent, oChange).then(function(oInfo) {
				assert.equal(oGetControlIdBySelectorStub.callCount, 1, "the function 'getControlIdBySelector' is called");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[0], oChange.getSelector(), "the function 'getControlIdBySelector' is called with the correct selector");
				assert.deepEqual(oGetControlIdBySelectorStub.lastCall.args[1], oAppComponent, "the function 'getControlIdBySelector' is called with the correct app component");
				assert.equal(oGetViewForControlStub.callCount, 0, "the function 'getViewForControl' is not called");
				assert.equal(oGetControlIfTemplateAffectedStub.callCount, 0, "the function 'getControlIfTemplateAffected' is not called");
				assert.equal(oGetChangeHandlerStub.callCount, 0, "the function 'getChangeHandler' is not called");
				assert.equal(oChangeHandler.getChangeVisualizationInfo, undefined, "the function 'getChangeVisualizationInfo' is not defined");
				assert.equal(oInfo, undefined, "no change handler information is returned");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});