/* global QUnit */
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DesignTimeStatus",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/model/Model",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/library" // we have to ensure to load fl, so that change handler gets registered
], function(
	UIComponent,
	ComponentContainer,
	Core,
	XMLView,
	CommandFactory,
	ChangeCategories,
	ChangeVisualization,
	DesignTime,
	DesignTimeStatus,
	OverlayRegistry,
	ChangePersistence,
	Model,
	Settings,
	PersistenceWriteAPI,
	Layer,
	sinon
) {
	"use strict";

	/**
	 * Utility function which builds and registers QUnit tests to check if a SAPUI5 control is ready for UI adaptation at runtime (RTA)
	 *
	 * See <code>elementActionTest.qunit.js</code> as an example on how to use.
	 *
	 * During development you may insert ".skip" to omit processing of a specific control enabling check:
	 * <code>elementActionTest.skip(...);</code> instead of <code>elementActionTest(...);</code>.
	 *
	 * Use <code>elementActionTest.only( sMsgSubstring );</code> to specify that only some tests are to be executed:
	 * E.g. <code>elementActionTest.only("Remove");</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @static
	 * @since 1.42
	 * @alias sap.ui.rta.enablement.elementActionTest
	 *
	 * @param {string} sMsg - Name of QUnit test - e.g. Checking the move action for a VerticalLayout control
	 * @param {object} mOptions - Configuration for this elementActionTest
	 * @param {string} [mOptions.layer] - Flex layer used during testing, use it in case actions are enabled for other layers then CUSTOMER
	 * @param {string|object} mOptions.xmlView - XML view content or all settings available to sap.ui.xmlView, to have a view to apply the action
	 * @param {sap.ui.model.Model} [mOptions.model] - Any model to be assigned on the view
	 * @param {string} [mOptions.placeAt="qunit-fixture"] - Id of tag to place view at runtime
	 * @param {boolean} [mOptions.jsOnly] - Set to true, if change handler cannot work on xml view
	 * @param {string} [mOptions.label] - Check the result of "getLabel" function from the control designtime metadata
	 * @param {object} mOptions.action - Action to operate on <code>mOptions.xmlView</code>
	 * @param {string} mOptions.action.name - Name of the action - e.g. 'remove', 'move', 'rename'
	 * @param {string} [mOptions.action.controlId] - Id of the control the action is executed with - may be the parent of the control being 'touched'
	 * @param {function():sap.ui.core.Control} [mOptions.action.control] - Function returning the control instance on which the change is being applied
	 * @param {function():sap.ui.core.Control} [mOptions.action.designtimeActionControl] - Function returning the control where the designtime action is defined
	 * @param {string} [mOptions.action.label] - Check the result of "getLabel" function from the action in the control designtime metadata
	 * @param {function} mOptions.action.parameter - Function(oView) returning the parameter object of the action to be executed
	 * @param {function} [mOptions.before] - Function(assert) hook before test execution is started
	 * @param {function} [mOptions.after] - Function(assert) hook after test execution is finished
	 * @param {number} [mOptions.changesAfterCondensing] - Amount of Changes that remain after condensing
	 * @param {object[]} [mOptions.previousActions] - Additional Action objects (see mOptions.action) that get executed first
	 * @param {function} mOptions.afterAction - Function(oUiComponent, oView, assert) which checks the outcome of the action
	 * @param {function} mOptions.afterUndo - Function(oUiComponent, oView, assert) which checks the execution of the action and an immediate undo
	 * @param {function} mOptions.afterRedo - Function(oUiComponent, oView, assert) which checks the outcome of action with immediate undo and redo
	 * @param {object|function} [mOptions.changeVisualization] - Change visualization information or function(oView) that returns the information
	 * @param {string} [mOptions.changeVisualization.displayElementId] - ID of the element where the change indicator should be displayed
	 * @param {object} [mOptions.changeVisualization.info] - Change visualization specific information from the change handler
	 * @param {string[]} [mOptions.changeVisualization.info.affectedControls] - IDs of affected controls
	 * @param {string[]} [mOptions.changeVisualization.info.dependentControls] - IDs of dependent controls
	 * @param {string[]} [mOptions.changeVisualization.info.displayControls] - IDs of the elements where the change indicator will be displayed
	 * @param {object} [mOptions.changeVisualization.info.descriptionPayload] - Payload with additional data for the change visualization
	 */
	function elementActionTest(sMsg, mOptions) {
		// Return if elementActionTest.only() has been used to exclude this call
		if (elementActionTest._only && (sMsg.indexOf(elementActionTest._only) < 0)) { return; }

		if (typeof mOptions.xmlView === "string") {
			mOptions.xmlView = {
				viewContent: mOptions.xmlView
			};
		}
		var sandbox = sinon.createSandbox();

		mOptions.before ||= function() {};
		mOptions.after ||= function() {};

		// Do QUnit tests
		QUnit.module(sMsg, function() {
			QUnit.test("When using the 'elementActionTest' function to test if your control is ready for UI adaptation at runtime", function(assert) {
				assert.ok(mOptions.afterAction,
					"then you implement a function to check if your action has been successful: See the afterAction parameter.");
				assert.ok(mOptions.afterUndo,
					"then you implement a function to check if the undo has been successful: See the afterUndo parameter.");
				assert.ok(mOptions.afterRedo,
					"then you implement a function to check if the redo has been successful: See the afterRedo parameter.");
				assert.ok(mOptions.xmlView,
					"then you provide an XML view to test on: See the.xmlView parameter.");

				var oXmlView = new DOMParser().parseFromString(mOptions.xmlView.viewContent, "application/xml").documentElement;
				assert.ok(oXmlView.tagName.match("View$"), "then you use the sap.ui.core.mvc View tag as the first tag in your view");

				assert.ok(mOptions.action, "then you provide an action: See the action parameter.");
				assert.ok(mOptions.action.name, "then you provide an action name: See the action.name parameter.");
				assert.ok(mOptions.action.controlId || mOptions.action.control,
					"then you provide the control or control's id to operate the action on: See the action.controlId.");
			});
		});

		var UI_COMPONENT_NAME = "sap.ui.rta.control.enabling.comp";
		var SYNC = false;
		var ASYNC = true;
		var Comp = UIComponent.extend(UI_COMPONENT_NAME, {
			metadata: {
				interfaces: ["sap.ui.core.IAsyncContentCreation"],
				manifest: {
					"sap.app": {
						id: UI_COMPONENT_NAME,
						type: "application"
					}
				}
			},
			createContent() {
				var mViewSettings = Object.assign({}, mOptions.xmlView);
				mViewSettings.id = this.createId("view");

				if (mViewSettings.async === undefined) {
					// async = true will trigger the xml preprocessors on the xml view,
					// but if defined preprocessors need async, we will always trigger async
					mViewSettings.async = this.getComponentData().async;
				}
				mViewSettings.definition = mViewSettings.viewContent;
				this.oViewPromise = XMLView.create(mViewSettings);
				return this.oViewPromise;
			}
		});

		// Create UI component containing the view to adapt
		function createViewInComponent(bAsync) {
			this.oUiComponent = new Comp({
				id: "comp",
				componentData: {
					async: bAsync
				}
			});
			return this.oUiComponent.oViewPromise.then(function() {
				// Place component in container and display
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					height: "100%"
				});
				this.oUiComponentContainer.placeAt(mOptions.placeAt || "qunit-fixture");

				this.oView = this.oUiComponent.getRootControl();

				if (mOptions.model instanceof Model) {
					this.oView.setModel(mOptions.model);
				}

				Core.applyChanges();

				return mOptions.model && mOptions.model.getMetaModel() && mOptions.model.getMetaModel().loaded();
			}.bind(this));
		}

		function buildAndExecuteCommands(assert) {
			var aActions = [].concat(
				mOptions.previousActions || [],
				mOptions.action
			);
			var aCommands = [];

			return aActions.reduce(function(oLastPromise, oAction) {
				return oLastPromise
				.then(buildCommand.bind(this, assert, oAction))
				.then(function(oCommand) {
					aCommands.push(oCommand);
					// Execute commands one by one to allow change dependencies
					return oCommand.execute();
				});
			}.bind(this), Promise.resolve())
			.then(function() {
				return aCommands;
			});
		}

		function getControlFromActionMap(mAction) {
			if (typeof mAction.control === "function") {
				return mAction.control(this.oView);
			}
			return this.oView.byId(mAction.controlId);
		}

		function getDesigntimeActionControl(mAction) {
			return mAction.designtimeActionControl
				? mAction.designtimeActionControl(this.oView)
				: undefined;
		}

		function startDesigntime() {
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oView
				]
			});
			return new Promise(function(resolve) {
				this.oDesignTime.attachEventOnce("synced", resolve);
			}.bind(this));
		}

		function getParameterMap(vParameter) {
			if (vParameter) {
				return typeof vParameter === "function" ? vParameter(this.oView) : vParameter;
			}
			return {};
		}

		/**
		 * Checks if the provided action can be found in the calculated designtime metadata. According to the
		 * action.name sometimes the elementdesigntime metadata or the aggregationdesigntime metadata is required
		 * for the check.
		 *
		 * @param {object} assert - QUnit Assert
		 * @param {object} oAction - Test action parameters
		 * @param {sap.ui.core.Control} oControl - Targeting control
		 * @param {sap.ui.core.Control} oMovedElement - Moved element, only available with action.name move
		 * @param {object} oElementDesignTimeMetadata - Element designtime metadata
		 * @param {object} oAggregationDesignTimeMetadata - Aggregation designtime metadata
		 */
		function checkDesigntimeMetadata(
			assert,
			oAction,
			oControl,
			oMovedElement,
			oElementDesignTimeMetadata,
			oAggregationDesignTimeMetadata
		) {
			if (Array.isArray(oAction.name)) {
				var oAddAction = oElementDesignTimeMetadata.getAction(
					oAction.name[0],
					oControl,
					oAction.name[1]
				);
				assert.ok(oAddAction,
					`the ${oAction[0]} via ${oAction.name[1]} action is available in the designtime`
				);
			} else if (oAction.name === "createContainer" || oAction.name === "addIFrame") {
				assert.ok(oAggregationDesignTimeMetadata.getAction(oAction.name, oControl),
					`the ${oAction.name}action is available in the calculated designtime metadata during execution`);
			} else if (oAction.name === "move") {
				assert.ok(oElementDesignTimeMetadata.getAction(oAction.name, oMovedElement),
					`the ${oAction.name}action is available in the calculated designtime metadata during execution`);
			} else {
				assert.ok(oElementDesignTimeMetadata.getAction(oAction.name, oControl),
					`the ${oAction.name}action is available in the calculated designtime metadata during execution`);
			}
		}

		function buildCommand(assert, oAction) {
			var oTargetControl;
			var oControlWithDesigntimeActionDefinition;
			var mParameter;
			var oElementDesignTimeMetadata;
			var oAggregationDesignTimeMetadata;
			var sCommandName = oAction.name;
			var oMovedElement;
			return Promise.resolve()
			.then(getControlFromActionMap.bind(this, oAction))

			.then(function(oRetrievedControl) {
				oTargetControl = oRetrievedControl;
				mParameter = getParameterMap.call(this, oAction.parameter);
				return getDesigntimeActionControl.call(this, oAction);
			}.bind(this))

			.then(function(oRetrievedControl) {
				oControlWithDesigntimeActionDefinition = oRetrievedControl;
				return startDesigntime.call(this);
			}.bind(this))

			// gather data for the designtime check and the command factory
			.then(function() {
				var oControlOverlay = OverlayRegistry.getOverlay(oControlWithDesigntimeActionDefinition || oTargetControl);
				if (!oControlOverlay) {
					throw new Error(
						`The provided control ${oTargetControl.getId()}does not have any overlay existing during test execution. `
						+ `With this testsetup it is no possible to check for designtime action definition. In some cases it is not `
						+ `possible to identify the control with the designtime metadata automatically just by the given 'action.control'. `
						+ `In this case please provide the 'action.designtimeActionControl' property with a valid control containing `
						+ `the designtime metadata definition for this check.`
					);
				}
				oElementDesignTimeMetadata = oControlOverlay.getDesignTimeMetadata();
				var oResponsibleElement = oElementDesignTimeMetadata.getResponsibleElement(oTargetControl);
				var oAggregationOverlay;
				if (mOptions.label) {
					assert.strictEqual(
						oElementDesignTimeMetadata.getLabel(oTargetControl),
						mOptions.label,
						"then the control label is correct"
					);
				}
				if (oAction.name === "move") {
					oMovedElement = mParameter.movedElements[0].element || mParameter.movedElements[0].id;
					var oElementOverlay = OverlayRegistry.getOverlay(oMovedElement);
					var oRelevantContainer = oElementOverlay.getRelevantContainer();
					oTargetControl = oRelevantContainer;
					oElementDesignTimeMetadata = oElementOverlay.getParentAggregationOverlay().getDesignTimeMetadata();
				} else if (Array.isArray(oAction.name)) {
					var aAddActions = oElementDesignTimeMetadata.getActionDataFromAggregations(
						oAction.name[0],
						oTargetControl,
						undefined,
						oAction.name[1]
					);
					oAggregationOverlay = oControlOverlay.getAggregationOverlay(aAddActions[0].aggregation);
					oElementDesignTimeMetadata = oAggregationOverlay.getDesignTimeMetadata();
					sCommandName = "addDelegateProperty";
				} else if (oAction.name === "createContainer" || oAction.name === "addIFrame") {
					var aCreateContainerActions = oElementDesignTimeMetadata.getActionDataFromAggregations(
						oAction.name,
						oControlWithDesigntimeActionDefinition || oTargetControl
					);
					oAggregationOverlay = oControlOverlay.getAggregationOverlay(aCreateContainerActions[0].aggregation);
					oAggregationDesignTimeMetadata = oAggregationOverlay.getDesignTimeMetadata();
				} else if (oResponsibleElement) {
					if (oAction.name === "reveal") {
						oTargetControl = oAction.revealedElement(this.oView);
						oControlOverlay = OverlayRegistry.getOverlay(oAction.revealedElement(this.oView));
						oElementDesignTimeMetadata = oControlOverlay.getDesignTimeMetadata();
						if (oAction.label) {
							var oRevealAction = oElementDesignTimeMetadata.getAction("reveal");
							assert.strictEqual(oRevealAction.getLabel(oTargetControl), oAction.label,
								"then the control label is correct");
						}
					} else {
						oTargetControl = oResponsibleElement;
						oControlOverlay = OverlayRegistry.getOverlay(oTargetControl);
						oElementDesignTimeMetadata = oControlOverlay.getDesignTimeMetadata();
						oTargetControl.getMetadata().loadDesignTime(oTargetControl);
					}
				}
			}.bind(this))

			.then(function() {
				// additional check if the required action definition exists
				// into the responsible control designtime metadata
				return checkDesigntimeMetadata.call(
					this,
					assert,
					oAction,
					oTargetControl,
					oMovedElement,
					oElementDesignTimeMetadata,
					oAggregationDesignTimeMetadata
				);
			}.bind(this))

			.then(function() {
				var oCommandFactory = new CommandFactory({
					flexSettings: {
						layer: mOptions.layer || Layer.CUSTOMER
					}
				});
				return oCommandFactory.getCommandFor(
					oTargetControl,
					sCommandName,
					mParameter,
					oElementDesignTimeMetadata
				);
			})

			.then(function(oCommand) {
				assert.ok(
					oCommand,
					`then the registration for action to change type, the registration for change and ` +
					`control type to change handler is available and ${mOptions.action.name} is a valid action`
				);
				return oCommand;
			})

			.catch(function(oMessage) {
				throw new Error(oMessage);
			});
		}

		function executeCommands(aCommands) {
			return aCommands.reduce(function(oLastPromise, oCommand) {
				return oLastPromise
				.then(oCommand.execute.bind(oCommand));
			}, Promise.resolve());
		}

		function undoCommands(aCommands) {
			var aUndoCommands = aCommands.slice().reverse();
			return aUndoCommands.reduce(function(oLastPromise, oCommand) {
				return oLastPromise
				.then(oCommand.undo.bind(oCommand));
			}, Promise.resolve());
		}

		function destroyCommands(aCommands) {
			aCommands.forEach(function(oCommand) {
				oCommand.destroy();
			});
		}

		function condenseCommands(oView, aCommands, assert) {
			var oReturn = {
				remainingCommands: [],
				deletedCommands: []
			};

			// only if mOptions.previousActions is set the length can be > 1
			if (aCommands.length === 1) {
				oReturn.remainingCommands.push(aCommands[0]);
				return Promise.resolve(oReturn);
			}

			var aChanges = aCommands.map(function(oCommand) {
				return oCommand.getPreparedChange();
			});
			return PersistenceWriteAPI._condense({
				selector: oView,
				changes: aChanges
			}).then(function(aCondensedChanges) {
				if (mOptions.changesAfterCondensing !== undefined) {
					assert.equal(
						aCondensedChanges.length,
						mOptions.changesAfterCondensing,
						"after condensing the amount of changes is correct"
					);
				}
				var aChangeIds = aCondensedChanges.map(function(oChange) {return oChange.getId();});
				aCommands.forEach(function(oCommand) {
					if (aChangeIds.indexOf(oCommand.getPreparedChange().getId()) > -1) {
						oReturn.remainingCommands.push(oCommand);
					} else {
						oReturn.deletedCommands.push(oCommand);
					}
				});
				return oReturn;
			});
		}

		function checkChangeVisualization(oView, aCommands, assert) {
			if (!mOptions.changeVisualization) {
				return Promise.resolve();
			}

			var oChangeVisualizationInput;
			if (typeof mOptions.changeVisualization === "function") {
				oChangeVisualizationInput = mOptions.changeVisualization(oView);
			} else {
				oChangeVisualizationInput = mOptions.changeVisualization;
			}

			var oChangeVisualization = new ChangeVisualization({
				rootControlId: oView.getId(),
				isActive: true
			});

			sandbox.stub(oChangeVisualization, "_updateChangeIndicators");
			var aChanges = aCommands.map(function(oCommand) {
				return oCommand.getPreparedChange();
			});
			sandbox.stub(oChangeVisualization, "_collectChanges").resolves(aChanges);

			return oChangeVisualization._updateChangeRegistry()
			.then(function() {
				return oChangeVisualization._selectChangeCategory(ChangeCategories.ALL);
			})
			.then(function() {
				var oChangeIndicatorRegistry = oChangeVisualization._oChangeIndicatorRegistry;
				var oData = oChangeIndicatorRegistry.getSelectorsWithRegisteredChanges();
				var sDisplayElementId = oChangeVisualizationInput.displayElementId;
				var sSelector = sDisplayElementId ? oView.createId(sDisplayElementId) : oView.getId();
				assert.ok(oData[sSelector] && oData[sSelector].length, "there is a change indicator at the correct element");
				var oRegisteredChange = oChangeIndicatorRegistry.getAllRegisteredChanges()[0];
				var mVisualizationInfo = oChangeVisualizationInput.info;

				function mapIds(aIds) {
					return aIds.map(function(sId) {
						return oView.createId(sId);
					});
				}

				if (mVisualizationInfo) {
					if (mVisualizationInfo.affectedControls) {
						var aAffectedControlIds = mapIds(mVisualizationInfo.affectedControls);
						assert.deepEqual(aAffectedControlIds, oRegisteredChange.visualizationInfo.affectedElementIds,
							"then the affected control ids are correct");
					}
					if (mVisualizationInfo.dependentControls) {
						var aDependentControlIds = mapIds(mVisualizationInfo.dependentControls);
						assert.deepEqual(aDependentControlIds, oRegisteredChange.visualizationInfo.dependentElementIds,
							"then the dependent control ids are correct");
					}
					if (mVisualizationInfo.displayControls) {
						var aDisplayControlIds = mapIds(mVisualizationInfo.displayControls);
						assert.deepEqual(aDisplayControlIds, oRegisteredChange.visualizationInfo.displayElementIds,
							"then the display control ids are correct");
					}
					if (mVisualizationInfo.descriptionPayload) {
						assert.deepEqual(mVisualizationInfo.descriptionPayload, oRegisteredChange.visualizationInfo.descriptionPayload,
							"then the descriptionPayload is correct");
					}
				}
			});
		}

		/**
		 * Since we don't use the CommandStack here, we have to take care of the applied Changes,
		 * which are stored in the custom data of the control, ourselves;
		 * The original Change doesn't get deleted there, and therefore can't be applied again without this
		 *
		 * @param {sap.ui.rta.command.BaseCommand[]} aCommands Commands whose change should be cleaned up
		 * @return {Promise} resolves when cleanup after undo is done
		 */
		function cleanUpAfterUndo(aCommands) {
			var aPromises = [];
			aCommands.forEach(function(oCommand) {
				var oChange = oCommand.getPreparedChange();
				if (oCommand.getAppComponent) {
					aPromises.push(PersistenceWriteAPI.remove({change: oChange, selector: oCommand.getAppComponent()}));
				}
			});
			return Promise.all(aPromises);
		}

		function applyChangeOnXML(assert) {
			// Stub LREP access to have the command as UI change (needs the view to build the correct ids)
			var aChanges = [];
			sandbox.stub(ChangePersistence.prototype, "getChangesForView").resolves(aChanges);

			return createViewInComponent.call(this, SYNC)
			.then(buildCommandsAndApplyChangesOnXML.bind(this, assert, aChanges));
		}

		function buildCommandsAndApplyChangesOnXML(assert, aChanges) {
			var aActions = [].concat(
				mOptions.previousActions || [],
				mOptions.action
			);
			var aCommands = [];

			return aActions.reduce(function(oLastPromise, oAction) {
				return oLastPromise
				.then(buildCommand.bind(this, assert, oAction))
				.then(function(oCommand) {
					aCommands.push(oCommand);
					aChanges.push(oCommand.getPreparedChange());

					// Destroy and recreate component and view to get the changes applied
					// Wait for each change to be applied individually to allow dependencies
					// between changes of different actions
					this.oUiComponentContainer.destroy();
					return createViewInComponent.call(this, ASYNC);
				}.bind(this));
			}.bind(this), Promise.resolve())
			.then(function() {
				this.aCommands = aCommands;
			}.bind(this));
		}

		// XML View checks
		if (!mOptions.jsOnly) {
			QUnit.module(`${sMsg} on async views`, {
				before(assert) {
					this.hookContext = {};
					return mOptions.before.call(this.hookContext, assert);
				},
				after(assert) {
					return mOptions.after.call(this.hookContext, assert);
				},
				beforeEach() {
					sandbox.stub(Settings, "getInstance").resolves({_oSettings: {}});
				},
				afterEach() {
					this.oUiComponentContainer.destroy();
					this.oDesignTime.destroy();
					destroyCommands(this.aCommands);
					sandbox.restore();
				}
			}, function() {
				QUnit.test("When applying the change directly on the XMLView", function(assert) {
					return applyChangeOnXML.call(this, assert)

					.then(function() {
						return checkChangeVisualization(this.oView, this.aCommands, assert);
					}.bind(this))

					.then(function() {
						// Verify that UI change has been applied on XML view
						return mOptions.afterAction(this.oUiComponent, this.oView, assert);
					}.bind(this));
				});

				QUnit.test("When executing on XML and reverting the change in JS (e.g. variant switch)", function(assert) {
					return applyChangeOnXML.call(this, assert)

					.then(function() {
						return undoCommands(this.aCommands);
					}.bind(this))

					.then(function() {
						return cleanUpAfterUndo(this.aCommands);
					}.bind(this))

					.then(function() {
						Core.applyChanges();
						mOptions.afterUndo(this.oUiComponent, this.oView, assert);
					}.bind(this));
				});

				QUnit.test("When executing on XML, reverting the change in JS (e.g. variant switch) and applying again", function(assert) {
					return applyChangeOnXML.call(this, assert)

					.then(function() {
						// condensing has to be done before the changes are reverted
						return condenseCommands(this.oView, this.aCommands, assert);
					}.bind(this))

					.then(function(mCommands) {
						this.aRemainingCommands = mCommands.remainingCommands;

						return undoCommands(this.aCommands);
					}.bind(this))

					.then(function() {
						return cleanUpAfterUndo(this.aCommands);
					}.bind(this))

					.then(function() {
						// this should have the same effect as executing all the commands
						return executeCommands(this.aRemainingCommands);
					}.bind(this))

					.then(function() {
						Core.applyChanges();
						mOptions.afterRedo(this.oUiComponent, this.oView, assert);
					}.bind(this));
				});
			});
		}

		function waitForDtSync(oDesignTime) {
			if (oDesignTime.getStatus() !== DesignTimeStatus.SYNCED) {
				return new Promise(function(fnResolve) {
					oDesignTime.attachEventOnce("synced", fnResolve);
				});
			}
			return Promise.resolve();
		}

		QUnit.module(sMsg, {
			before(assert) {
				this.hookContext = {};
				return mOptions.before.call(this.hookContext, assert);
			},
			after(assert) {
				return mOptions.after.call(this.hookContext, assert);
			},
			beforeEach(assert) {
				// no LREP response needed
				sandbox.stub(ChangePersistence.prototype, "getChangesForComponent").returns(Promise.resolve([]));
				sandbox.stub(Settings, "getInstance").returns(Promise.resolve({_oSettings: {}}));

				return createViewInComponent.call(this, SYNC)
				.then(buildAndExecuteCommands.bind(this, assert))
				.then(function(aCommands) {
					this.aCommands = aCommands;
				}.bind(this));
			},
			afterEach() {
				this.oDesignTime.destroy();
				this.oUiComponentContainer.destroy();
				destroyCommands(this.aCommands);
				sandbox.restore();
			}
		}, function() {
			QUnit.test("When executing the underlying command on the control at runtime", function(assert) {
				return waitForDtSync(this.oDesignTime)

				.then(function() {
					return checkChangeVisualization(this.oView, this.aCommands, assert);
				}.bind(this))

				.then(function() {
					Core.applyChanges();
					return mOptions.afterAction(this.oUiComponent, this.oView, assert);
				}.bind(this));
			});

			QUnit.test("When executing and undoing the command", function(assert) {
				return waitForDtSync(this.oDesignTime)

				.then(undoCommands.bind(null, this.aCommands))

				.then(cleanUpAfterUndo.bind(null, this.aCommands))

				.then(function() {
					Core.applyChanges();
					return mOptions.afterUndo(this.oUiComponent, this.oView, assert);
				}.bind(this));
			});

			QUnit.test("When executing, undoing and redoing the command", function(assert) {
				return waitForDtSync(this.oDesignTime)

				// condensing has to be done before the changes are reverted
				.then(condenseCommands.bind(this, this.oView, this.aCommands, assert))

				.then(function(mCommands) {
					this.aRemainingCommands = mCommands.remainingCommands;

					return undoCommands(this.aCommands);
				}.bind(this))

				.then(cleanUpAfterUndo.bind(null, this.aCommands))

				.then(function() {
					// this should have the same effect as executing all the commands
					return executeCommands(this.aRemainingCommands);
				}.bind(this))

				.then(function() {
					Core.applyChanges();
					return mOptions.afterRedo(this.oUiComponent, this.oView, assert);
				}.bind(this));
			});
		});
	}

	elementActionTest.skip = function() {};
	elementActionTest.only = function(sMsgSubstring) { elementActionTest._only = sMsgSubstring; };

	return elementActionTest;
});