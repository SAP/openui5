/* global QUnit, sinon*/
/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/model/Model",
	'sap/ui/fl/FlexControllerFactory',
	'sap/ui/rta/ControlTreeModifier',
	"sap/ui/fl/library", //we have to ensure to load fl, so that change handler gets registered,
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	UIComponent,
	ComponentContainer,
	XMLView,
	CommandFactory,
	DesignTime,
	OverlayRegistry,
	ElementDesignTimeMetadata,
	ChangePersistenceFactory,
	ChangePersistence,
	Model,
	FlexControllerFactory,
	ControlTreeModifier
){

	"use strict";

	/**
	 * Utility function which builds and registers QUnit tests to check if a SAPUI5 control is ready for UI adaptation at runtime (RTA)
	 *
	 * See <code>RTAControlEnabling.qunit.html<\code> and <code>RTAControlEnabling.qunit.js<\code> as an example on how to use.
	 *
	 * During development you may insert ".skip" to ommit processing of a specific control enabling check:
	 * <code>controlEnablingCheck.skip(...);<\code> instead of <code>controlEnablingCheck(...);<\code>.
	 *
	 * Use <code>controlEnablingCheck.only( sMsgSubstring );<\code> to specify that only some tests are to be executed:
	 * E.g. <code>controlEnablingCheck.only("Remove");<\code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @static
	 * @since 1.42
	 * @alias sap.ui.rta.test.controlEnablingCheck
	 *
	 * @param {string}   sMsg - name of QUnit test - e.g. Checking the move action for a VerticalLayout control
	 * @param {object}   mOptions - configuration for this controlEnablingCheck
	 * @param {string}   [mOptions.layer] - (optional) flex layer used during testing, use it in case actions are enabled for other layers then CUSTOMER
	 * @param {string|object}   mOptions.xmlView - XML view content or all settings available to sap.ui.xmlView, to have a view to apply the action
	 * @param {sap.ui.model.Model}   [mOptions.model] - any model to be assigned on the view
	 * @param {string}   [mOptions.placeAt="content"] - Id of tag to place view at runtime
	 * @param {boolean}   [mOptions.jsOnly] - set to true, if change handler cannot work on xml view
	 * @param {object}   mOptions.action - action to operate on <code>mOptions.xmlView</code>
	 * @param {string}   mOptions.action.name - name of the action - e.g. 'remove', 'move', 'rename'
	 * @param {string}   mOptions.action.controlId - id of the control the action is executed with - may be the parent of the control beeing 'touched'
	 * @param {function} mOptions.action.parameter - (optional) function(oView) returning the parameter object of the action to be executed
	 * @param {function} mOptions.afterAction - function(oUiComponent, oView, assert) which checks the outcome of the action
	 * @param {function} mOptions.afterUndo - function(oUiComponent, oView, assert) which checks the execution of the action and an immediate undo
	 * @param {function} mOptions.afterRedo - function(oUiComponent, oView, assert) which checks the outcome of action with immediate undo and redo
	 */
	var controlEnablingCheck = function(sMsg, mOptions){

		// Return if controlEnablingCheck.only() has been used to exclude this call
		if (controlEnablingCheck._only && (sMsg.indexOf(controlEnablingCheck._only) < 0)) { return; }

		if (typeof mOptions.xmlView === "string"){
			mOptions.xmlView = {
				viewContent : mOptions.xmlView
			};
		}

		// Do QUnit tests
		QUnit.module(sMsg, {});

		QUnit.test("When using the 'controlEnablingCheck' function to test if your control is ready for UI adaptation at runtime", function(assert){
			assert.ok(mOptions.afterAction, "then you implement a function to check if your action has been successful: See the afterAction parameter.");
			assert.ok(mOptions.afterUndo, "then you implement a function to check if the undo has been successful: See the afterUndo parameter.");
			assert.ok(mOptions.afterRedo, "then you implement a function to check if the redo has been successful: See the afterRedo parameter.");
			assert.ok(mOptions.xmlView, "then you provide an XML view to test on: See the.xmlView parameter.");

			var oXmlView = new DOMParser().parseFromString(mOptions.xmlView.viewContent, "application/xml").documentElement;
			assert.ok(oXmlView.tagName.match( "View$"),"then you use the sap.ui.core.mvc View tag as the first tag in your view");

			assert.ok(mOptions.action, "then you provide an action: See the action parameter.");
			assert.ok(mOptions.action.name, "then you provide an action name: See the action.name parameter.");
			assert.ok(mOptions.action.controlId, "then you provide the id of the control to operate the action on: See the action.controlId.");
		});

		var UI_COMPONENT_NAME = "sap.ui.rta.control.enabling.comp";
		var SYNC = false;
		var ASYNC = true;
		var Comp = UIComponent.extend(UI_COMPONENT_NAME, {
			metadata: {
				manifest : {
					"sap.app": {
						"id": UI_COMPONENT_NAME,
						"type": "application"
					}
				}
			},
			createContent : function() {
				var mViewSettings = jQuery.extend({}, mOptions.xmlView);
				mViewSettings.id = this.createId("view");

				if (mViewSettings.async === undefined){
					// async = true will trigger the xml preprocessors on the xml view, but if defined preprocessors need async, we will always trigger async
					mViewSettings.async = this.getComponentData().async;
				}
				var oView = sap.ui.xmlview(mViewSettings);
				return oView;
			}

		});

		// Create UI component containing the view to adapt
		function createViewInComponent(bAsync){
			this.oUiComponent = new Comp({
				id: "comp",
				componentData : {
					async : bAsync
				}
			});

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component : this.oUiComponent
			});
			this.oUiComponentContainer.placeAt(mOptions.placeAt || "content");

			this.oView = this.oUiComponent.getRootControl();

			if (mOptions.model instanceof Model) {
				this.oView.setModel(mOptions.model);
			}

			sap.ui.getCore().applyChanges();
			return this.oView.loaded();
		}

		function buildCommand(assert){
			this.oControl = this.oView.byId(mOptions.action.controlId);
			return this.oControl.getMetadata().loadDesignTime(this.oControl).then(function(oDesignTimeMetadata) {
				var mParameter;
				if (mOptions.action.parameter) {
					if (typeof mOptions.action.parameter === "function") {
						mParameter =  mOptions.action.parameter(this.oView);
					} else {
						mParameter = mOptions.action.parameter;
					}
				} else {
					mParameter = {};
				}

				sap.ui.getCore().applyChanges();

				this.oDesignTime = new DesignTime({
					rootElements : [this.oView]
				});

				return new Promise(function(resolve){
					this.oDesignTime.attachEventOnce("synced", function() {
						this.oControlOverlay = OverlayRegistry.getOverlay(this.oControl);
						var oCommandFactory = new CommandFactory({
							flexSettings : {
								layer : mOptions.layer || "CUSTOMER"
							}
						});
						var oElementDesignTimeMetadata = this.oControlOverlay.getDesignTimeMetadata();
						if (mOptions.action.name === "move") {
							var oElementOverlay = OverlayRegistry.getOverlay(mParameter.movedElements[0].element);
							var oRelevantContainer = oElementOverlay.getRelevantContainer();

							this.oControl = oRelevantContainer;
							oElementDesignTimeMetadata = oElementOverlay.getParentAggregationOverlay().getDesignTimeMetadata();
						} else if (mOptions.action.name === "addODataProperty") {
							var aAddODataPropertyActions = oElementDesignTimeMetadata.getActionDataFromAggregations("addODataProperty", this.oControl);
							assert.equal(aAddODataPropertyActions.length, 1, "there should be only one aggregation with the possibility to do addODataProperty action");
							var oAggregationOverlay = this.oControlOverlay.getAggregationOverlay(aAddODataPropertyActions[0].aggregation);
							oElementDesignTimeMetadata = oAggregationOverlay.getDesignTimeMetadata();
						}
						this.oCommand = oCommandFactory.getCommandFor(this.oControl, mOptions.action.name, mParameter, oElementDesignTimeMetadata);

						assert.ok(this.oCommand, "then the registration for action to change type, the registration for change and control type to change handler is available and " + mOptions.action.name + " is a valid action");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}

		//XML View checks
		if (!mOptions.jsOnly) {
			QUnit.module(sMsg + " on async views", {
				afterEach : function(){
					this.oUiComponentContainer.destroy();
					this.oDesignTime.destroy();
					this.oCommand.destroy();
				}
			});

			QUnit.test("When applying the change directly on the XMLView", function(assert){
				// Stub LREP access to have the command as UI change (needs the view to build the correct ids)
				var aChanges = [];
				this.stub(ChangePersistence.prototype, "getChangesForComponent").returns(Promise.resolve(aChanges));
				this.stub(ChangePersistence.prototype, "getCacheKey").returns(Promise.resolve("etag-123"));

				return createViewInComponent.call(this, SYNC).then(function(){
					return buildCommand.call(this, assert);
				}.bind(this)).then(function(){
					var oChange = this.oCommand.getPreparedChange();
					aChanges.push(oChange);

					//destroy and recreate component and view to get the changes applied
					this.oUiComponentContainer.destroy();
					return createViewInComponent.call(this, ASYNC);
				}.bind(this)).then(function(oView){
					// Verify that UI change has been applied on XML view
					mOptions.afterAction(this.oUiComponent, oView, assert);
				}.bind(this));

			});
		}

		QUnit.module(sMsg, {

			beforeEach : function(assert){
				//no LREP response needed
				this.sandbox = sinon.sandbox.create();
				this.sandbox.stub(ChangePersistence.prototype, "getChangesForComponent").returns(Promise.resolve([]));
				this.sandbox.stub(ChangePersistence.prototype, "getCacheKey").returns(ChangePersistence.NOTAG); //no cache key => no xml view processing

				return createViewInComponent.call(this, SYNC).then(function(){
					return buildCommand.call(this, assert);
				}.bind(this));
			},

			afterEach : function(){
				this.sandbox.restore();
				this.oUiComponentContainer.destroy();
				this.oDesignTime.destroy();
				this.oCommand.destroy();
			}
		});


		QUnit.test("When executing the underlying command on the control at runtime", function(assert){
			var done = assert.async();

			// Execute the command
			this.oCommand.execute()

			.then(function() {
				sap.ui.getCore().applyChanges();

				// Verfify result
				mOptions.afterAction(this.oUiComponent, this.oView, assert);
				done();
			}.bind(this));

		});

		QUnit.test("When executing and undoing the command", function(assert){
			var done = assert.async();
			this.oCommand.execute()

			.then(this.oCommand.undo.bind(this.oCommand))

			// Since we don't use the CommandStack here, we have to take care of the applied Changes,
			// which are stored in the custom data of the control, ourselves.
			// (The original Change doesn't get deleted there, and therefore can't be applied again without this)
			.then(function() {
				var oChange = this.oCommand.getPreparedChange();
				if (this.oCommand.getAppComponent) {
					var oAppComponent = this.oCommand.getAppComponent();
					var oControl = ControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
					var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
					oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
				}
			}.bind(this))

			.then(function() {
				sap.ui.getCore().applyChanges();
				mOptions.afterUndo(this.oUiComponent, this.oView, assert);
				done();
			}.bind(this));
		});

		QUnit.test("When executing, undoing and redoing the command", function(assert){
			var done = assert.async();
			this.oCommand.execute()

			.then(this.oCommand.undo.bind(this.oCommand))

			// Since we don't use the CommandStack here, we have to take care of the applied Changes,
			// which are stored in the custom data of the control, ourselves.
			// (The original Change doesn't get deleted there, and therefore can't be applied again without this)
			.then(function() {
				var oChange = this.oCommand.getPreparedChange();
				if (this.oCommand.getAppComponent) {
					var oAppComponent = this.oCommand.getAppComponent();
					var oControl = ControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
					var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
					return oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
				}
			}.bind(this))

			.then(this.oCommand.execute.bind(this.oCommand))

			.then(function() {
				sap.ui.getCore().applyChanges();
				mOptions.afterRedo(this.oUiComponent, this.oView, assert);
				done();
			}.bind(this));
		});

	};

	controlEnablingCheck.skip = function() {};
	controlEnablingCheck.only = function(sMsgSubstring) { controlEnablingCheck._only = sMsgSubstring; };

	return controlEnablingCheck;

});