/*global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/Utils",
	"sap/ui/layout/PaneContainer",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Bar",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/fl/registry/Settings",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function (
	AdditionalElementsPlugin,
	AdditionalElementsAnalyzer,
	AddElementsDialog,
	RTAPlugin,
	CommandFactory,
	RTAUtils,
	PaneContainer,
	Button,
	Input,
	Bar,
	DesignTime,
	OverlayRegistry,
	ChangeRegistry,
	SimpleChanges,
	Settings,
	Log,
	sinon
){
	"use strict";

	// TODO: refactor whole file:
	// 3. use before/after hooks to setup stuff for whole module if needed
	// 5. avoid creation of many DesignTime instances just for creating one single overlay <=
	// 6. add comprehensive comments at least to each module - what is going on there


	var oChangeRegistry = ChangeRegistry.getInstance();
	var oDummyChangeHandler = {
		applyChange : function(){
			return true;
		},
		completeChangeContent : function(){
			return true;
		}
	};
	oChangeRegistry.registerControlsForChanges({
		"sap.m.Button": [
			SimpleChanges.unhideControl,
			SimpleChanges.unstashControl
		],
		"sap.m.Bar": [
			{
				changeType: "addFields",
				changeHandler : oDummyChangeHandler
			},
			SimpleChanges.moveControls
		],
		"sap.ui.layout.PaneContainer": [
			{
				changeType: "addFields",
				changeHandler : oDummyChangeHandler
			},
			SimpleChanges.moveControls,
			SimpleChanges.unhideControl,
			SimpleChanges.unstashControl
		]
	});

	sinon.stub(Settings, 'getInstance').returns(Promise.resolve(new Settings({})));

	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "mockedAppComponent";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					id : "applicationId",
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};
	var sandbox = sinon.sandbox.create();

	var ON_SIBLING = "SIBLING",
		ON_CHILD = "CHILD",
		ON_IRRELEVANT = "IRRELEVANT";

	QUnit.module("Context Menu Operations: Given a plugin whose dialog always close with OK", {
		beforeEach : function(assert) {
			this.oRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var fnOriginalGetLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle;
			var oFakeLibBundle = {
				getText : sandbox.stub().returnsArg(0),
				hasText : sandbox.stub().returns(true)
			};
			sandbox.stub(sap.ui.getCore(),"getLibraryResourceBundle").callsFake(function(sLibraryName) {
				if (sLibraryName === "sap.ui.layout" || sLibraryName === "sap.m"){
					return oFakeLibBundle;
				}
				return fnOriginalGetLibraryResourceBundle.apply(this, arguments);
			});
			sandbox.stub(RTAPlugin.prototype, "hasChangeHandler").callsFake(function() {return true;});
			givenSomeBoundControls.call(this, assert);

			givenThePluginWithOKClosingDialog.call(this);

		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			sandbox.restore();
		}
	}, function () {

		[{
			dtMetadata : {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			sibling : false,
			msg : "when the control's dt metadata has NO addODataProperty and a reveal action"
		},
		{
			dtMetadata : {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			sibling : true,
			msg : " when the control's dt metadata has NO addODataProperty and a reveal action"
		},
		{
			dtMetadata : {
				"addODataProperty" : {
					changeType : "foo"
				}
			},
			sibling : false,
			msg : "when the control's dt metadata has an addODataProperty and NO reveal action"
		},
		{
			dtMetadata : {
				"addODataProperty" : {
					changeType : "foo"
				}
			},
			sibling : true,
			msg : "when the control's dt metadata has an addODataProperty and NO reveal action"
		},
		{
			dtMetadata : {
				"reveal" : {
					changeType : "unhideControl",
					changeOnRelevantContainer : true
				}
			},
			sibling : true,
			msg : " when the control's dt metadata has a reveal action with changeOnRelevantContainer"
		}].forEach(function(test){
			var sPrefix = test.sibling ? "On sibling: " : "On child: ";
			var sOverlayType =  test.sibling ? ON_SIBLING : ON_CHILD;
			QUnit.test(sPrefix + test.msg, function(assert) {
				return createOverlayWithAggregationActions.call(this, test.dtMetadata, sOverlayType)

				.then(function(oOverlay) {
					this.oPlugin.setDesignTime(this.oDesignTime);
					this.oPlugin.registerElementOverlay(oOverlay);
					var sExpectedText = this.oRTATexts.getText("CTX_ADD_ELEMENTS", "I18N_KEY_USER_FRIENDLY_CONTROL_NAME");
					assert.equal(this.oPlugin.getContextMenuTitle(test.sibling, oOverlay), sExpectedText, "then the translated context menu entry is properly set");
					assert.ok(this.oPlugin.isAvailable(test.sibling, [oOverlay]), "then the action is available");
					assert.ok(this.oPlugin.isEnabled(test.sibling, [oOverlay]), "then the action is enabled");
					assert.ok(this.oPlugin._isEditableCheck(oOverlay, test.sibling), "then the overlay is editable");
				}.bind(this));

			});
		});

		QUnit.test(" when the control's dt metadata has a reveal action with function allowing reveal only for some instances", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				"reveal" : function(oControl){
					if (oControl.getId() === "Invisible1"){
						return {
							changeType : "unhideControl"
						};
					}
					return null;
				}
			}, ON_SIBLING)

			.then(function(oOverlay) {
				this.oPlugin.setDesignTime(this.oDesignTime);
				this.oPlugin.registerElementOverlay(oOverlay);
				assert.ok(this.oPlugin.isAvailable(ON_SIBLING, [oOverlay]), "then the action is available");
				assert.ok(this.oPlugin.isEnabled(ON_SIBLING, [oOverlay]), "then the action is enabled");
				assert.ok(this.oPlugin._isEditableCheck(oOverlay, ON_SIBLING), "then the overlay is editable");
			}.bind(this));

		});

		[{
			dtMetadata : {	},
			on : ON_CHILD,
			sibling : false,
			msg : "when the control's dt metadata has NO addODataProperty and NO reveal action"
		},
		{
			dtMetadata : {	},
			on : ON_SIBLING,
			sibling : true,
			msg : "when the control's dt metadata has NO addODataProperty and NO reveal action"
		},
		{
			dtMetadata : {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			on : ON_IRRELEVANT,
			sibling : true,
			msg : " when the control's dt metadata has a reveal action but no invisible siblings"
		}].forEach(function(test){
			var sPrefix = test.sibling ? "On sibling: " : "On child: ";
			QUnit.test(sPrefix + test.msg, function (assert) {
				return createOverlayWithAggregationActions.call(this, test.dtMetadata, test.on)
				.then(function(oOverlay) {
					sandbox.stub(oOverlay, "isVisible").returns(true);
					sandbox.stub(oOverlay.getParentElementOverlay(), "isVisible").returns(true);
					assert.notOk(this.oPlugin.isAvailable(test.sibling, [oOverlay]), "then the action is not available");
					assert.notOk(this.oPlugin._isEditableCheck(oOverlay, test.sibling), "then the overlay is not editable");
				}.bind(this));
			});
		});
	});

	QUnit.module("Given a plugin whose dialog always close with CANCEL", {
		beforeEach : function(assert) {
			givenSomeBoundControls.call(this, assert);

			givenThePluginWithCancelClosingDialog.call(this);

		},
		afterEach : function () {
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the control's dt metadata has addODataProperty and reveal action", function (assert) {
			var fnElementModifiedStub = sandbox.stub();

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				},
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))
			.then(function() {
				assert.ok(this.fnGetCommandSpy.notCalled, "then no commands are created");
				assert.ok(fnElementModifiedStub.notCalled, "then the element modified event is not thrown");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has addODataProperty and reveal action with changeOnRelevantContainer", function (assert) {
			var fnElementModifiedStub = sandbox.stub();

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields",
					changeOnRelevantContainer : true
				},
				"reveal" : {
					changeType : "unhideControl",
					changeOnRelevantContainer : true
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(this.fnGetCommandSpy.notCalled, "then no commands are created");
				assert.ok(fnElementModifiedStub.notCalled, "then the element modified event is not thrown");
			}.bind(this));
		});

		QUnit.test(" when the control's dt metadata has a reveal action with function allowing reveal only for some instances", function(assert) {
			var REVEALABLE_CTRL_ID = "Invisible1";
			this.fnEnhanceInvisibleElementsStub.restore();
			this.fnEnhanceInvisibleElementsStub = sandbox.stub(AdditionalElementsAnalyzer,"enhanceInvisibleElements").returns(Promise.resolve([]));

			return createOverlayWithAggregationActions.call(this, {
				"reveal" : function(oControl){
					if (oControl.getId() === REVEALABLE_CTRL_ID){
						return {
							changeType : "unhideControl"
						};
					}
					return null;
				}
			}, ON_SIBLING)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(true, [oOverlay]);
			}.bind(this))

			.then(function() {
				var mActions = this.fnEnhanceInvisibleElementsStub.firstCall.args[1];
				assert.equal(mActions.reveal.elements.length, 1, "only one of the invisible actions can be revealed");
				assert.equal(mActions.reveal.elements[0].element.getId(), REVEALABLE_CTRL_ID, "only the control that can be revealed is found");
			}.bind(this));

		});
	});


	QUnit.module("Given a plugin whose dialog always close with OK", {
		beforeEach : function(assert) {
			givenSomeBoundControls.call(this, assert);
			sandbox.stub(RTAPlugin.prototype, "hasChangeHandler").callsFake(function () {return true;});

			givenThePluginWithOKClosingDialog.call(this);

		},
		afterEach : function() {
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			sandbox.restore();
		}
	}, function () {

		[
			{
				overlay : createOverlayWithAggregationActions,
				sibling : false
			},
			{
				overlay : createOverlayWithAggregationActions,
				sibling : true
			}
		].forEach(function (test) {
			var sPrefix = test.sibling ? "On sibling: " : "On child: ";
			QUnit.test(sPrefix + "when the control's dt metadata has NO addODataProperty and a reveal action", function (assert) {
				var done = assert.async();
				this.oPlugin.attachEventOnce("elementModified", function(oEvent){
					var oCompositeCommand = oEvent.getParameter("command");
					if (test.sibling) {
						assert.equal(oCompositeCommand.getCommands().length, 2, "then for the one selected to be revealed element reveal and move command is created as target position differs");
						assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
						assert.equal(oCompositeCommand.getCommands()[0].getChangeType(), "unstashControl", "then the reveal command has the right changeType");
						assert.equal(oCompositeCommand.getCommands()[1].getName(), "move", "then one move command is created");
						assert.equal(oCompositeCommand.getCommands()[1].getMovedElements()[0].targetIndex, 1, "then the move command goes to the right position");
					} else {
						assert.equal(oCompositeCommand.getCommands().length, 1, "then for the one selected to be revealed element reveal command is created as target position is the same as its origin");
						assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
						assert.equal(oCompositeCommand.getCommands()[0].getChangeType(), "unstashControl", "then the reveal command has the right changeType");
					}
					done();
				});

				return test.overlay.call(this,
					{
						"reveal" : {
							changeType : "unstashControl"
						},
						"move" : "moveControls"
					},
					test.sibling ? ON_SIBLING : ON_CHILD
				)

				.then(function(oOverlay) {
					return this.oPlugin.showAvailableElements(test.sibling, [oOverlay]);
				}.bind(this))

				.then(function() {
					assert.ok(this.fnEnhanceInvisibleElementsStub.calledOnce, "then the analyzer is called to return the invisible elements");
					assert.ok(this.fnGetUnboundODataPropertiesStub.notCalled, "then the analyzer is NOT called to return the unbound odata properties");
					assertDialogModelLength.call(this, assert, 2, "then both invisible elements are part of the dialog model");
					assert.equal(this.oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
				}.bind(this));
			});

			QUnit.test(sPrefix + "when the control's dt metadata has NO addODataProperty and NO reveal action", function (assert) {

				var fnElementModifiedStub = sandbox.stub();
				this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);

				return test.overlay.call(this, { }, test.sibling ? ON_SIBLING : ON_CHILD)

				.then(function(oOverlay) {
					return this.oPlugin.showAvailableElements(test.sibling, [oOverlay]);
				}.bind(this))

				.then(function() {
					assert.ok(this.fnEnhanceInvisibleElementsStub.notCalled, "then the analyzer is NOT called to return the invisible elements");
					assert.ok(this.fnGetUnboundODataPropertiesStub.notCalled, "then the analyzer is NOT called to return the unbound odata properties");
					assert.ok(this.fnGetCommandSpy.notCalled, "then no commands are created");
					assert.ok(fnElementModifiedStub.notCalled, "then the element modified event is not thrown");
					assertDialogModelLength.call(this, assert, 0, "then no elements are part of the dialog model");
				}.bind(this));
			});

			QUnit.test(sPrefix + "when the control's dt metadata has an addODataProperty and NO reveal action", function (assert) {
				var done = assert.async();
				this.oPlugin.attachEventOnce("elementModified", function(oEvent){
					var oCompositeCommand = oEvent.getParameter("command");
					var aCommands = oCompositeCommand.getCommands();
					var iExpectedIndex = test.sibling ? 1 : 4;
					assert.equal(aCommands.length, 1, "then one command for each selected element is created");
					assert.equal(aCommands[0].getChangeType(), "addFields", "then add command is created");
					assert.equal(aCommands[0].getIndex(), iExpectedIndex, "then the index to add the field is set correctly");
					done();
				});

				return test.overlay.call(this,
					{
						"addODataProperty" : {
							changeType : "addFields"
						}
					},
					test.sibling ? ON_SIBLING : ON_CHILD
				)

				.then(function (oOverlay) {
					return this.oPlugin.showAvailableElements(test.sibling, [oOverlay]);
				}.bind(this))

				.then(function () {
					assert.ok(this.fnEnhanceInvisibleElementsStub.notCalled, "then the analyzer is NOT called to return the invisible elements");
					assert.ok(this.fnGetUnboundODataPropertiesStub.calledOnce, "then the analyzer is called once to return the unbound odata properties");
					assertDialogModelLength.call(this, assert, 3, "then the 3 odata properties are part of the dialog model");
					assert.deepEqual(this.oPlugin.getDialog().getElements()[0].label, "OData1", "then the first element is an oData property");
				}.bind(this));
			});

			QUnit.test(sPrefix + "when the control's dt metadata has an addODataProperty and a reveal action (but no move because parent control might not support it so far)", function (assert) {
				var done = assert.async();
				this.oPlugin.attachEventOnce("elementModified", function(oEvent){
					var oCompositeCommand = oEvent.getParameter("command");
					assert.equal(oCompositeCommand.getCommands().length, 2, "then one command for each selected element is created");
					assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "reveal was created");
					assert.equal(oCompositeCommand.getCommands()[1].getName(), "addODataProperty", "addODataProperty was created");
					//move is not created as move was not enabled for this control
					done();
				});

				return test.overlay.call(this,
					{
						"addODataProperty" : {
							changeType : "addFields",
							getIndex : test.hiddenTree ? function(){
								return test.sibling ? 2 : 3;
							} : undefined
						},
						"reveal" : {
							changeType : "unhideControl"
						}
					},
					test.sibling ? ON_SIBLING : ON_CHILD
				)

				.then(function(oOverlay) {
					return this.oPlugin.showAvailableElements(test.sibling, [oOverlay]);
				}.bind(this))

				.then(function() {
					assert.ok(this.fnEnhanceInvisibleElementsStub.calledOnce, "then the analyzer is called once to return the invisible elements");
					assert.ok(this.fnGetUnboundODataPropertiesStub.calledOnce, "then the analyzer is called once to return the unbound odata properties");
					assertDialogModelLength.call(this, assert, 5, "then all invisible elements and odata properties are part of the dialog model, excluding the duplicate properties");
					assert.deepEqual(this.oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
				}.bind(this));
			});
		});

		QUnit.test("when when the control's dt metadata has NO addODataProperty and a reveal action and we call showAvailableElements with an index", function (assert) {
			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent){
				var oCompositeCommand = oEvent.getParameter("command");
					assert.equal(oCompositeCommand.getCommands().length, 3, "then for the one selected to be revealed element reveal and move command is created as target position differs");
					assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
					assert.equal(oCompositeCommand.getCommands()[0].getChangeType(), "unhideControl", "then the reveal command has the right changeType");
					assert.equal(oCompositeCommand.getCommands()[1].getName(), "move", "then one move command is created");
					assert.equal(oCompositeCommand.getCommands()[1].getMovedElements()[0].targetIndex, 0, "then the move command goes to the right position");
					assert.equal(oCompositeCommand.getCommands()[2].getName(), "addODataProperty", "then one reveal command is created");
					assert.equal(oCompositeCommand.getCommands()[2].getChangeType(), "addFields", "then the reveal command has the right changeType");
					assert.equal(oCompositeCommand.getCommands()[2].getIndex(), 0, "then the move command goes to the right position");

				done();
			});

			return createOverlayWithAggregationActions.call(this,
				{
					"addODataProperty" : {
						changeType : "addFields"
					},
					"reveal" : {
						changeType : "unhideControl"
					},
					"move" : "moveControls"
				},
				ON_SIBLING
			)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(true, [oOverlay], 0);
			}.bind(this))

			.then(function() {
				assert.ok(this.fnEnhanceInvisibleElementsStub.calledOnce, "then the analyzer is called to return the invisible elements");
				assert.ok(this.fnGetUnboundODataPropertiesStub.calledOnce, "then the analyzer is NOT called to return the unbound odata properties");
				assertDialogModelLength.call(this, assert, 5, "then all invisible elements and odata properties are part of the dialog model, excluding the duplicate properties");
				assert.equal(this.oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has an addODataProperty and a reveal action", function(assert) {
			var oOriginalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var fnOriginalGetLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle;
			var oFakeLibBundle = {
				getText : sandbox.stub().returnsArg(0),
				hasText : sandbox.stub().returns(true)
			};
			sandbox.stub(sap.ui.getCore(),"getLibraryResourceBundle").callsFake(function(sLibraryName) {
				if (sLibraryName === "sap.ui.layout" || sLibraryName === "sap.m"){
					return oFakeLibBundle;
				}
				return fnOriginalGetLibraryResourceBundle.apply(this, arguments);
			});

			return createOverlayWithAggregationActions.call(this, {
					"addODataProperty" : {
						changeType : "addFields"
					},
					"reveal" : {
						changeType : "unhideControl"
					}
				},
				ON_CHILD
			)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				var sExpectedText = oOriginalRTATexts.getText("HEADER_ADDITIONAL_ELEMENTS", "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL");
				assert.equal(this.oDialog.getTitle(), sExpectedText, "then the translated title is properly set");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has a reveal action with changeOnRelevantContainer true but the relevant container does not have stable ID", function(assert) {
			sandbox.stub(this.oPlugin, "hasStableId").callsFake(function(oOverlay){
				if (oOverlay === this.oParentOverlay){
					return false;
				} else {
					return true;
				}
			}.bind(this));

			return createOverlayWithAggregationActions.call(this, {
					"reveal" : {
						changeType : "unhideControl",
						changeOnRelevantContainer: true
					}
				},
				ON_CHILD
			)

			.then(function(oOverlay) {
				assert.equal(this.oPlugin._isEditableCheck(oOverlay, false), false, "then _isEditableCheck returns false");
			}.bind(this));
		});

		QUnit.test("when the control has addODataProperty and Reveal in different aggregations from DesignTimeMetadata", function(assert) {
			var fnLogErrorSpy = sandbox.spy(Log, "error");
			sandbox.stub(this.oPlugin, "_getRevealActions").returns({
				aggregation1: {
					dummy: "value"
				}
			});
			sandbox.stub(this.oPlugin, "_getAddODataPropertyActions").returns({
				aggregation2: {
					dummy: "value"
				}
			});

			this.oPlugin._getActions();

			assert.equal(fnLogErrorSpy.args[0][0].indexOf("action defined for more than 1 aggregation") > -1, true, "then the correct error is thrown");
		});

		QUnit.test("when the Child-controls have no designtime Metadata", function(assert) {
			return createOverlayWithoutDesignTimeMetadata.call(this, {
				"reveal" : {
					changeType : "unhideControl"
				}
			})

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(true, "then the plugin should not complain about it");
				assertDialogModelLength.call(this, assert, 0, "then no invisible elements are part of the dialog model");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has no addODataProperty and reveal action, and the parent is invisible", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				oOverlay.getElement().setVisible(false);
				oOverlay.getElement().getContentLeft()[0].setVisible(true);
				oOverlay.getElement().getContentLeft()[1].setVisible(true);
				oOverlay.getElement().getContentLeft()[2].setVisible(true);
				var fnElementModifiedStub = sandbox.stub();
				this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);

				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assertDialogModelLength.call(this, assert, 2, "then the two visible elements are part of the dialog model");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has an addODataProperty on relevant container with required libraries", function(assert) {
			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent){
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "addLibrary",
					"then the addLibrary command is created first");
				assert.equal(oCompositeCommand.getCommands()[1].getName(), "addODataProperty",
					"then the addODataProperty command is created second");
				assert.ok(oCompositeCommand.getCommands()[1].getNewControlId().indexOf("bar") > -1,
					"then the pseudo parent (relevant container) is used to create the new control ID");
				assert.equal(oCompositeCommand.getCommands()[0].getReference(), "applicationId",
					"then the addLibrary command is created with the proper reference");
				assert.equal(oCompositeCommand.getCommands()[0].getParameters().libraries["sap.uxap"].minVersion, "1.44",
					"then the addLibrary command is created with the proper required libraries");
				done();
			});

			return createOverlayWithAggregationActions.call(this, {
					"addODataProperty" : {
						changeType : "addFields",
						changeOnRelevantContainer : true,
						changeHandlerSettings : {
							key : {
								oDataServiceVersion : "2.0"
							},
							content : {
								requiredLibraries : {
									"sap.uxap": {
										"minVersion": "1.44",
										"lazy": "false"
									}
								}
							}
						}
					}
				},
				ON_CHILD
			)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(true, "then the plugin should not complain about it");
			});

		});

		QUnit.test("when 'registerElementOverlay' is called and the metamodel is not loaded yet", function(assert) {
			var fnDone = assert.async();
			var oSibling = this.oSibling;
			var oSiblingOverlay = {
				getElement : function(){
					return oSibling;
				}
			};

			sandbox.stub(this.oSibling, "getModel").returns({
				getMetaModel : function(){
					return {
						loaded : function(){
							return Promise.resolve();
						}
					};
				}
			});

			// prevent the RTAPlugin call to be able to check if evaluateEditable was called on this plugin
			sandbox.stub(RTAPlugin.prototype, "registerElementOverlay");

			// evaluateEditable should be called when the promise is resolved
			sandbox.stub(this.oPlugin, "evaluateEditable").callsFake(function(){
				assert.ok(true, "evaluateEditable() is called after the MetaModel is loaded");
				fnDone();
			});

			this.oPlugin.registerElementOverlay(oSiblingOverlay);
		});
	});

	QUnit.module("Given an app that is field extensible enabled...", {
		beforeEach : function(assert) {
			sandbox = sinon.sandbox.create();

			this.STUB_EXTENSIBILITY_BUSINESS_CTXT = {
				BusinessContexts : ["some context"],
				ServiceName : "servive name",
				ServiceVersion : "some dummy ServiceVersion",
				EntityType : "Header"
			};
			this.STUB_EXTENSIBILITY_USHELL_PARAMS = {
				target : {
					semanticObject : "CustomField",
					action : "develop"
				},
				params : {
					businessContexts : ["some context"],
					serviceName : "servive name",
					serviceVersion : "some dummy ServiceVersion",
					entityType : "Header"
				}
			};
			this.STUB_EXTENSIBILITY_USHELL_URL = "someURLToCheckOurParameterPassing:"
					+ JSON.stringify(this.STUB_EXTENSIBILITY_USHELL_PARAMS);

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!
			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function() {
						return {
							hrefForExternal : function(mData) {
								return "someURLToCheckOurParameterPassing:" + JSON.stringify(mData);
							}
						};
					}
				}
			});
			givenSomeBoundControls.call(this, assert);

			givenThePluginWithOKClosingDialog.call(this);
		},
		afterEach : function () {
			this.oDesignTime.destroy();
			sandbox.restore();
			sap.ushell = this.originalUShell;
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
		}
	}, function () {

		QUnit.test("when the service is not up to date and no addODataProperty action is available", function (assert) {
			var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.reject());
			return createOverlayWithAggregationActions.call(this, {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function () {
				assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
				assert.ok(fnServiceUpToDateStub.notCalled, "only addODataProperty is dependent on up to date service");
				assert.equal(this.oPlugin.getDialog()._oCustomFieldButton.getVisible(), false, "then the Button to create custom Fields is not shown");
			}.bind(this));
		});

		QUnit.test("when the service is up to date and addODataProperty action is available", function (assert) {
			var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
				assert.ok(fnServiceUpToDateStub.getCall(0).args[0], "addODataProperty is dependent on up to date service, it should be called with a control");
				assert.equal(this.oPlugin.getDialog()._oCustomFieldButton.getVisible(), true, "then the Button to create custom Fields is shown");
			}.bind(this));
		});

		QUnit.test("when the service is not up to date and addODataProperty action is available", function (assert) {
			sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.reject());
			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				},
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(this.fnDialogOpen.notCalled, "then the dialog was not opened");
			}.bind(this));
		});

		QUnit.test("when no addODataProperty action is available", function (assert) {
			var fnIsCustomFieldAvailableStub = sandbox.stub(RTAUtils, "isCustomFieldAvailable");
			return createOverlayWithAggregationActions.call(this, {
				"reveal" : {
					changeType : "unhideControl"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(fnIsCustomFieldAvailableStub.notCalled, "then custom field enabling should not be asked");
				assert.equal(this.oDialog.getCustomFieldEnabled(), false, "then in the dialog custom field is disabled");
			}.bind(this));
		});

		QUnit.test("when addODataProperty action is available and simulating a click on open custom field", function(assert) {
			var done = assert.async();
			var that = this;

			var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());
			sandbox.stub(RTAUtils, "isCustomFieldAvailable").returns(Promise.resolve(this.STUB_EXTENSIBILITY_BUSINESS_CTXT));

			sandbox.stub(RTAUtils, "openNewWindow").callsFake(function(sUrl) {
				assert.equal(sUrl, that.STUB_EXTENSIBILITY_USHELL_URL,
						"then we are calling the extensibility tool with the correct parameter");
				done();
			});

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay]);
			}.bind(this))

			.then(function() {
				assert.ok(fnServiceUpToDateStub.getCall(0).args[0], "addODataProperty is dependent on up to date service, it should be called with a control");

				assert.equal(this.oDialog.getCustomFieldEnabled(), true, "then in the dialog custom field is enabled");

				//Simulate custom field button pressed, should trigger openNewWindow
				this.oDialog.fireOpenCustomField();
			}.bind(this));
		});

		QUnit.test("when addODataProperty action is available and showAvailableElements is called 3 times and simulating a click on open custom field the last time", function (assert) {
			var done = assert.async();

			sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());
			sandbox.stub(RTAUtils, "isCustomFieldAvailable").returns(Promise.resolve(this.STUB_EXTENSIBILITY_BUSINESS_CTXT));
			var onOpenCustomFieldSpy = sandbox.spy(this.oPlugin, "_onOpenCustomField");
			var showAvailableElementsSpy = sandbox.spy(this.oPlugin, "showAvailableElements");

			sandbox.stub(RTAUtils, "openNewWindow").callsFake(function () {
				assert.ok(onOpenCustomFieldSpy.calledOnce, "then the Custom Field Handler is only called once");
				assert.ok(showAvailableElementsSpy.calledThrice, "then showAvailableElements is called 3 times");
				done();
			});

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				}
			},
			ON_CHILD)

			.then(function(oOverlay) {
				return this.oPlugin.showAvailableElements(false, [oOverlay])

				.then(function() {
					assert.equal(this.oDialog.getCustomFieldEnabled(), true, "then in the dialog custom field is enabled");
					return this.oPlugin.showAvailableElements(false, [oOverlay]);
				}.bind(this))
				.then(function() {
					return this.oPlugin.showAvailableElements(false, [oOverlay]);
				}.bind(this))
				.then(function() {
					//Simulate custom field button pressed, should trigger openNewWindow
					this.oDialog.fireOpenCustomField();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when retrieving the contextmenu items for the additional elements plugin,", function(assert){
			var bCheckValue = true;
			var bIsAvailable = true;
			var bFirstCall = true;

			return createOverlayWithAggregationActions.call(this, {
				"addODataProperty" : {
					changeType : "addFields"
				}
			}, ON_CHILD)

			.then(function(oCreatedOverlay) {
				sandbox.stub(this.oPlugin, "isAvailable").callsFake(function (bOverlayIsSibling, aElementOverlays) {
					assert.equal(bOverlayIsSibling, bFirstCall, "the isAvailable function is called once with bOverlayIsSibling = " + bFirstCall);
					assert.deepEqual(aElementOverlays[0], oCreatedOverlay, "the isAvailable function is called with the correct overlay");
					bFirstCall = false;
					return bIsAvailable;
				});
				sandbox.stub(this.oPlugin, "showAvailableElements").callsFake(function (bOverlayIsSibling, aOverlays) {
					assert.equal(bOverlayIsSibling, bCheckValue, "the 'handler' function calls showAvailableElements with bOverlayIsSibling = " + bCheckValue);
					assert.deepEqual(aOverlays, [oCreatedOverlay], "the 'handler' function calls showAvailableElements with the correct overlays");
				});
				sandbox.stub(this.oPlugin, "isEnabled").callsFake(function (bOverlayIsSibling, aElementOverlays) {
					assert.equal(bOverlayIsSibling, bCheckValue, "the 'enabled' function calls isEnabled with bOverlayIsSibling = " + bCheckValue);
					assert.deepEqual(aElementOverlays[0], oCreatedOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
				});
				var aMenuItems = this.oPlugin.getMenuItems([oCreatedOverlay]);

				assert.equal(aMenuItems[0].id, "CTX_ADD_ELEMENTS_AS_SIBLING", "there is an entry for add elements as sibling");
				aMenuItems[0].handler([oCreatedOverlay]);
				aMenuItems[0].enabled([oCreatedOverlay]);
				bCheckValue = false;
				assert.equal(aMenuItems[1].id, "CTX_ADD_ELEMENTS_AS_CHILD", "there is an entry for add elements as child");
				aMenuItems[1].handler([oCreatedOverlay]);
				aMenuItems[1].enabled([oCreatedOverlay]);

				bIsAvailable = false;
				bFirstCall = true;
				assert.equal(this.oPlugin.getMenuItems([oCreatedOverlay]).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
			}.bind(this));
		});
	});


	function givenSomeBoundControls(assert){
		sandbox.stub(sap.ui.fl.Utils, "_getAppComponentForComponent").returns(oMockedAppComponent);

		this.oSibling = new Button({id: "Sibling", visible : true});
		this.oUnsupportedInvisible = new Input({id: "UnsupportedInvisible", visible : false});
		this.oInvisible1 = new Button({id: "Invisible1", visible : false});
		this.oInvisible2 = new Button({id: "Invisible2", visible : false});
		this.oIrrelevantChild = new Button({id: "Irrelevant", visible : true});
		this.oControl = new Bar({
			id : "bar",
			contentLeft : [ this.oSibling, this.oUnsupportedInvisible, this.oInvisible1, this.oInvisible2],
			contentRight : [ this.oIrrelevantChild]
		});

		this.oPseudoPublicParent = new PaneContainer({
			id : "pseudoParent",
			panes : [ this.oControl ]
		});

		//simulate analyzer returning some elements
		this.fnEnhanceInvisibleElementsStub = sandbox.stub(AdditionalElementsAnalyzer,"enhanceInvisibleElements").callsFake(function (oParent, mActions) {
			return Promise.resolve([
				{ selected : false, label : "Invisible1", tooltip : "", type : "invisible", elementId : this.oInvisible1.getId(), bindingPaths: ["Property01"]},
				{ selected : true, label : "Invisible2", tooltip : "", type : "invisible", elementId : this.oInvisible2.getId(), bindingPaths: ["Property02"]}
			]);
		}.bind(this));
		this.fnGetUnboundODataPropertiesStub = sandbox.stub(AdditionalElementsAnalyzer,"getUnboundODataProperties").returns(Promise.resolve([
			{selected : true, label : "OData1", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property03"},
			{selected : false, label : "OData2", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property04"},
			{selected : false, label : "OData3", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property05"}
		]));

	}

	function givenThePluginWithCancelClosingDialog (){
		givenThePluginWithDialogClosing.call(this, Promise.reject());
	}

	function givenThePluginWithOKClosingDialog () {
		givenThePluginWithDialogClosing.call(this, Promise.resolve());
	}

	function givenThePluginWithDialogClosing(oDialogReturnValue){
		this.oDialog = new AddElementsDialog();
		//simulate dialog closed with OK/CANCEL
		this.fnDialogOpen = sandbox.stub(this.oDialog,"open").returns(oDialogReturnValue);

		//intercept command creation
		this.fnGetCommandSpy = sandbox.spy(CommandFactory.prototype, "getCommandFor");

		this.oPlugin = new AdditionalElementsPlugin({
			analyzer : AdditionalElementsAnalyzer,
			dialog : this.oDialog,
			commandFactory : new CommandFactory()
		});
	}

	function createOverlayWithAggregationActions(mActions, sOverlayType){
		var mChildNames =  {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};
		var mName =  {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};

		if (mActions.reveal){
			mActions.reveal.getInvisibleElements = function(){
				return [this.oInvisible1, this.oInvisible2];
			};
		}

		var oPseudoPublicParentDesignTimeMetadata = {
			aggregations : {
				panes : {
					actions : null,
					childNames : null,
					getStableElements: function() {
						return [];
					},
					getIndex: function(oBar, oBtn) {
						if (oBtn){
							return oBar.getContentLeft().indexOf(oBtn) + 1;
						} else {
							return oBar.getContentLeft().length;
						}
					}
				}
			}
		};
		var oParentDesignTimeMetadata = {
			aggregations : {
				contentLeft : {
					childNames : mChildNames,
					actions :  (mActions.addODataProperty || mActions.move) ? {
						addODataProperty : mActions.addODataProperty || null,
						move : mActions.move || null
					} : null
				}
			}
		};
		var oControlDesignTimeMetadata = {
			name : mName,
			actions :  mActions.reveal ? {
				reveal : mActions.reveal
			} : null
		};
		var oUnsupportedInvisibleDesignTimeMetadata = {
			//unsupported control without any designtime metadata
			actions : null
		};
		var oCustomDesignTimeMetadata = {
			"sap.ui.layout.PaneContainer" : oPseudoPublicParentDesignTimeMetadata,
			"sap.m.Input" : oUnsupportedInvisibleDesignTimeMetadata,
			"sap.m.Bar" : oParentDesignTimeMetadata,
			"sap.m.Button" : oControlDesignTimeMetadata
		};

		return new Promise(function(resolve) {
			this.oDesignTime = new DesignTime({
				rootElements : [this.oPseudoPublicParent],
				designTimeMetadata: oCustomDesignTimeMetadata
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPseudoPublicParentOverlay = OverlayRegistry.getOverlay(this.oPseudoPublicParent);
				this.oParentOverlay = OverlayRegistry.getOverlay(this.oControl);
				this.oSiblingOverlay = OverlayRegistry.getOverlay(this.oSibling);
				this.oIrrelevantOverlay = OverlayRegistry.getOverlay(this.oIrrelevantChild);
				resolve();
			}.bind(this));
		}.bind(this))

		.then(function() {
			sap.ui.getCore().applyChanges();
			switch (sOverlayType) {
				case ON_SIBLING : return this.oSiblingOverlay;
				case ON_CHILD : return this.oParentOverlay;
				case ON_IRRELEVANT : return this.oIrrelevantOverlay;
				default : return undefined;
			}
		}.bind(this));
	}

	function createOverlayWithoutDesignTimeMetadata(mActions, bOnSibling) {
		var oEmptyActions = { actions: null };
		var oCustomDesignTimeMetadata = {
			"sap.m.Bar" : oEmptyActions,
			"sap.m.Input" : oEmptyActions,
			"sap.m.Button" : oEmptyActions
		};

		return new Promise(function(resolve) {
			this.oDesignTime = new DesignTime({
				rootElements : [this.oControl],
				designTimeMetadata: oCustomDesignTimeMetadata
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oParentOverlay = OverlayRegistry.getOverlay(this.oControl);
				this.oSiblingOverlay = OverlayRegistry.getOverlay(this.oSibling);
				resolve();
			}.bind(this));
		}.bind(this))

		.then(function() {
			return bOnSibling ? this.oSiblingOverlay : this.oParentOverlay;
		}.bind(this));
	}

	function assertDialogModelLength(assert, iExpectedLength, sMsg) {
		var aElements = this.oPlugin.getDialog().getElements();
		assert.equal(aElements.length, iExpectedLength, sMsg);
	}

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});