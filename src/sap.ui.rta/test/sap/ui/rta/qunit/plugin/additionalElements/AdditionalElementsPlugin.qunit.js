/*global QUnit sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/Utils",
	"sap/ui/layout/PaneContainer",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Bar",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/fieldExt/Access",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/fl/registry/Settings"
], function(
	AdditionalElementsPlugin,
	AdditionalElementsAnalyzer,
	AddElementsDialog,
	CommandFactory,
	RTAUtils,
	PaneContainer,
	Button,
	Input,
	Bar,
	ElementOverlay,
	ElementDesignTimeMetadata,
	AggregationOverlay,
	AggregationDesignTimeMetadata,
	DesignTime,
	OverlayRegistry,
	FieldExtAccess,
	ChangeRegistry,
	SimpleChanges,
	Settings
){
	"use strict";

	// TODO: refactor whole file:
	// 1. tests should be distributed between modules explicitly (use QUnit2 for module definition)
	// 2. modules must be independent and must not depend on any global variables, pure function helpers are okay
	// 3. use before/after hooks to setup stuff for whole module if needed
	// 4. all dependencies must be specified explicitly, no e.g. "sap.ui.rta.plugin"
	// 5. avoid creation of many DesignTime instances just for creating one single overlay
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

	var oControl, oInvisible1, oInvisible2, oUnsupportedInvisible, oSibling, oIrrelevantChild,
		oPseudoPublicParent,
		//FIXME: remove eslint-disable
		oPseudoPublicParentOverlay, oParentOverlay, oSibilingOverlay, oIrrelevantOverlay, // eslint-disable-line
		oPlugin, oDialog,
		fnGetCommandSpy, fnEnhanceInvisibleElementsStub,
		fnGetUnboundODataPropertiesStub, fnDialogOpen,
		oDesignTime,
		ON_SIBLING = "SIBLING", ON_CHILD = "CHILD", ON_IRRELEVANT = "IRRELEVANT";

	QUnit.module("Context Menu Operations: Given a plugin whose dialog always close with OK", {
		beforeEach : function(assert) {
			this.oRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var fnOriginalGetLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle;
			var oFakeLibBundle = {
				getText : sandbox.stub().returnsArg(0)
			};
			sandbox.stub(sap.ui.getCore(),"getLibraryResourceBundle", function(sLibraryName) {
				if (sLibraryName === "sap.ui.layout" || sLibraryName === "sap.m"){
					return oFakeLibBundle;
				}
				return fnOriginalGetLibraryResourceBundle.apply(this, arguments);
			});
			sandbox.stub(sap.ui.rta.plugin.Plugin.prototype, "hasChangeHandler", function() {return true;});
			sandbox.stub(sap.ui.dt.Plugin.prototype, "isMultiSelectionInactive", function() {return true;});
			givenSomeBoundControls(assert);

			givenThePluginWithOKClosingDialog();

		},
		afterEach : function(assert) {
			oDesignTime.destroy();
			oPlugin.destroy();
			oPseudoPublicParent.destroy();
			sandbox.restore();
		}
	});

	[{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_CHILD),
		sibling : false,
		msg : "when the control's dt metadata has NO addODataProperty and an reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_SIBLING),
		sibling : true,
		msg : " when the control's dt metadata has NO addODataProperty and an reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"addODataProperty" : {
				changeType : "foo"
			}
		},
		ON_CHILD),
		sibling : false,
		msg : "when the control's dt metadata has an addODataProperty and NO reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"addODataProperty" : {
				changeType : "foo"
			}
		},
		ON_SIBLING),
		sibling : true,
		msg : "when the control's dt metadata has an addODataProperty and NO reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"reveal" : {
				changeType : "unhideControl",
				changeOnRelevantContainer : true
			}
		},
		ON_SIBLING),
		sibling : true,
		msg : " when the control's dt metadata has a reveal action with changeOnRelevantContainer"
	}].forEach(function(test){
		var sPrefix = test.sibling ? "On sibling: " : "On child: ";
		QUnit.test(sPrefix + test.msg, function(assert) {
			return test.overlay()

			.then(function(oOverlay) {
				oPlugin.registerElementOverlay(oOverlay);
				var sExpectedText = this.oRTATexts.getText("CTX_ADD_ELEMENTS", "I18N_KEY_USER_FRIENDLY_CONTROL_NAME");
				assert.equal(oPlugin.getContextMenuTitle(test.sibling, oOverlay), sExpectedText, "then the translated context menu entry is properly set");
				assert.ok(oPlugin.isAvailable(test.sibling, oOverlay), "then the action is available");
				assert.ok(oPlugin.isEnabled(test.sibling, oOverlay), "then the action is enabled");
				assert.ok(oPlugin._isEditableCheck(oOverlay, test.sibling), "then the overlay is editable");
			}.bind(this));

		});
	});
	[{
		overlay : createOverlayWithAggregationActions.bind(null,
				{	},
				ON_CHILD
		),
		sibling : false,
		msg : "when the control's dt metadata has NO addODataProperty and NO reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null,
				{	},
				ON_SIBLING
		),
		sibling : true,
		msg : "when the control's dt metadata has NO addODataProperty and NO reveal action"
	},
	{
		overlay : createOverlayWithAggregationActions.bind(null, {
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_IRRELEVANT),
		sibling : true,
		msg : " when the control's dt metadata has a reveal action but no invisible siblings"
	}].forEach(function(test){
		var sPrefix = test.sibling ? "On sibling: " : "On child: ";
		QUnit.test(sPrefix + test.msg, function(assert) {
			return test.overlay()
			.then(function(oOverlay) {
				sandbox.stub(oOverlay, "isVisible").returns(true);
				sandbox.stub(oOverlay.getParentElementOverlay(), "isVisible").returns(true);
				assert.notOk(oPlugin.isAvailable(test.sibling, oOverlay), "then the action is not available");
				assert.notOk(oPlugin._isEditableCheck(oOverlay, test.sibling), "then the overlay is not editable");
			});
		});
	});


	QUnit.module("Given a plugin whose dialog always close with CANCEL", {
		beforeEach : function(assert) {
			givenSomeBoundControls(assert);

			givenThePluginWithCancelClosingDialog();

		},
		afterEach : function(assert) {
			oDesignTime.destroy();
			oPlugin.destroy();
			oPseudoPublicParent.destroy();
			// this.oOverlay && this.oOverlay.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the control's dt metadata has addODataProperty and reveal action", function(assert) {
		var fnElementModifiedStub = sandbox.stub();

		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			},
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.notCalled(fnGetCommandSpy, "then no commands are created");
			sinon.assert.notCalled(fnElementModifiedStub, "then the element modified event is not thrown");
		});
	});

	QUnit.test("when the control's dt metadata has addODataProperty and reveal action with changeOnRelevantContainer", function(assert) {
		var fnElementModifiedStub = sandbox.stub();

		return createOverlayWithAggregationActions({
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
			oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.notCalled(fnGetCommandSpy, "then no commands are created");
			sinon.assert.notCalled(fnElementModifiedStub, "then the element modified event is not thrown");
		});
	});

	QUnit.module("Given a plugin whose dialog always close with OK", {
		beforeEach : function(assert) {
			givenSomeBoundControls(assert);
			sandbox.stub(sap.ui.rta.plugin.Plugin.prototype, "hasChangeHandler", function() {return true;});

			givenThePluginWithOKClosingDialog();

		},
		afterEach : function(assert) {
			oDesignTime.destroy();
			oPlugin.destroy();
			oPseudoPublicParent.destroy();
			// this.oOverlay && this.oOverlay.destroy();
			sandbox.restore();
		}
	});


	[
		{
			overlay : createOverlayWithAggregationActions,
			sibling : false
		},
		{
			overlay : createOverlayWithAggregationActions,
			sibling : true
		}
	].forEach(function(test){
		var sPrefix = test.sibling ? "On sibling: " : "On child: ";
		QUnit.test(sPrefix + "when the control's dt metadata has NO addODataProperty and an reveal action", function(assert) {
			var done = assert.async();
			oPlugin.attachEventOnce("elementModified", function(oEvent){
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

			return test.overlay(
				{
					"reveal" : {
						changeType : "unstashControl"
					},
					"move" : "moveControls"
				},
				test.sibling ? ON_SIBLING : ON_CHILD
			)

			.then(function(oOverlay) {
				return oPlugin.showAvailableElements(test.sibling, [oOverlay]);
			})

			.then(function() {
				sinon.assert.calledOnce(fnEnhanceInvisibleElementsStub, "then the analyzer is called to return the invisible elements");
				sinon.assert.notCalled(fnGetUnboundODataPropertiesStub, "then the analyzer is NOT called to return the unbound odata properties");
				assertDialogModelLength(assert, 2, "then both invisible elements are part of the dialog model");
				assert.equal(oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
			});
		});

		QUnit.test(sPrefix + "when the control's dt metadata has NO addODataProperty and NO reveal action", function(assert) {

			var fnElementModifiedStub = sandbox.stub();
			oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);

			return test.overlay({ }, test.sibling ? ON_SIBLING : ON_CHILD)

			.then(function(oOverlay) {
				return oPlugin.showAvailableElements(test.sibling, [oOverlay]);
			})

			.then(function() {
				sinon.assert.notCalled(fnEnhanceInvisibleElementsStub, "then the analyzer is NOT called to return the invisible elements");
				sinon.assert.notCalled(fnGetUnboundODataPropertiesStub, "then the analyzer is NOT called to return the unbound odata properties");
				sinon.assert.notCalled(fnGetCommandSpy, "then no commands are created");
				sinon.assert.notCalled(fnElementModifiedStub, "then the element modified event is not thrown");
				assertDialogModelLength(assert, 0, "then no elements are part of the dialog model");
			});
		});

		QUnit.test(sPrefix + "when the control's dt metadata has an addODataProperty and NO reveal action", function(assert) {
			var done = assert.async();
			oPlugin.attachEventOnce("elementModified", function(oEvent){
				var oCompositeCommand = oEvent.getParameter("command");
				var aCommands = oCompositeCommand.getCommands();
				var iExpectedIndex = test.sibling ? 1 : 4;
				assert.equal(aCommands.length, 1, "then one command for each selected element is created");
				assert.equal(aCommands[0].getChangeType(), "addFields", "then add command is created");
				assert.equal(aCommands[0].getIndex(), iExpectedIndex, "then the index to add the field is set correctly");
				done();
			});

			return test.overlay(
				{
					"addODataProperty" : {
						changeType : "addFields"
					}
				},
				test.sibling ? ON_SIBLING : ON_CHILD
			)

			.then(function(oOverlay) {
				return oPlugin.showAvailableElements(test.sibling, [oOverlay]);
			})

			.then(function() {
				sinon.assert.notCalled(fnEnhanceInvisibleElementsStub, "then the analyzer is NOT called to return the invisible elements");
				sinon.assert.calledOnce(fnGetUnboundODataPropertiesStub, "then the analyzer is called once to return the unbound odata properties");
				assertDialogModelLength(assert, 3, "then the 3 odata properties are part of the dialog model");
				assert.deepEqual(oPlugin.getDialog().getElements()[0].label, "OData1", "then the first element is an oData property");
			});
		});

		QUnit.test(sPrefix + "when the control's dt metadata has an addODataProperty and a reveal action (but no move because parent control might not support it so far)", function(assert) {
			var done = assert.async();
			oPlugin.attachEventOnce("elementModified", function(oEvent){
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then one command for each selected element is created");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "reveal was created");
				assert.equal(oCompositeCommand.getCommands()[1].getName(), "addODataProperty", "addODataProperty was created");
				//move is not created as move was not enabled for this control
				done();
			});

			return test.overlay(
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
				test.sibling ? ON_SIBLING : ON_CHILD,
				test.hiddenTree
			)

			.then(function(oOverlay) {
				return oPlugin.showAvailableElements(test.sibling, [oOverlay]);
			})

			.then(function() {
				sinon.assert.calledOnce(fnEnhanceInvisibleElementsStub, "then the analyzer is called once to return the invisible elements");
				sinon.assert.calledOnce(fnGetUnboundODataPropertiesStub, "then the analyzer is called once to return the unbound odata properties");
				assertDialogModelLength(assert, 5, "then all invisible elements and odata properties are part of the dialog model, excluding the duplicate properties");
				assert.deepEqual(oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
			});
		});
	});

	QUnit.test("when when the control's dt metadata has NO addODataProperty and an reveal action and we call showAvailableElements with an index", function(assert) {
		var done = assert.async();
		oPlugin.attachEventOnce("elementModified", function(oEvent){
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

		return createOverlayWithAggregationActions({
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
			return oPlugin.showAvailableElements(true, [oOverlay], 0);
		})

		.then(function() {
			sinon.assert.calledOnce(fnEnhanceInvisibleElementsStub, "then the analyzer is called to return the invisible elements");
			sinon.assert.calledOnce(fnGetUnboundODataPropertiesStub, "then the analyzer is NOT called to return the unbound odata properties");
			assertDialogModelLength(assert, 5, "then all invisible elements and odata properties are part of the dialog model, excluding the duplicate properties");
			assert.equal(oPlugin.getDialog().getElements()[0].label, "Invisible1", "then the first element is an invisible property");
		});
	});

	QUnit.test("when the control's dt metadata has an addODataProperty and a reveal action", function(assert) {
		var oOrignalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var fnOriginalGetLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle;
		var oFakeLibBundle = {
			getText : sandbox.stub().returnsArg(0)
		};
		sandbox.stub(sap.ui.getCore(),"getLibraryResourceBundle", function(sLibraryName) {
			if (sLibraryName === "sap.ui.layout" || sLibraryName === "sap.m"){
				return oFakeLibBundle;
			}
			return fnOriginalGetLibraryResourceBundle.apply(this, arguments);
		});

		return createOverlayWithAggregationActions({
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
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			var sExpectedText = oOrignalRTATexts.getText("HEADER_ADDITIONAL_ELEMENTS", "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL");
			assert.equal(oDialog.getTitle(), sExpectedText, "then the translated title is properly set");
		});
	});

	QUnit.test("when the control has unsupported designtime Metadata", function(assert) {
		this.oOverlay = createUnsupportedOverlayWithAggregationActions();
		return oPlugin.showAvailableElements(false, [this.oOverlay]).then(function() {
			assert.ok(false, "then the plugin should complain about it");
		})["catch"](function(oError) {
			assert.ok(oError, "then the plugin complains about it");
		});

	});

	QUnit.test("when the Child-controls have no designtime Metadata", function(assert) {
		return createOverlayWithoutDesignTime({
			"reveal" : {
				changeType : "unhideControl"
			}
		})

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			assert.ok(true, "then the plugin should not complain about it");
			assertDialogModelLength(assert, 0, "then no invisible elements are part of the dialog model");
		});
	});

	QUnit.test("when the control's dt metadata has no addODataProperty and reveal action, and the parent is invisible", function(assert) {
		return createOverlayWithAggregationActions({
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
			oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);

			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			assertDialogModelLength(assert, 2, "then the two visible elements are part of the dialog model");
		});
	});

	QUnit.test("when the control's dt metadata has an addODataProperty on relevant container with required libraries", function(assert) {
		var done = assert.async();
		oPlugin.attachEventOnce("elementModified", function(oEvent){
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

		return createOverlayWithAggregationActions({
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
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			assert.ok(true, "then the plugin should not complain about it");
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
			givenSomeBoundControls(assert);

			givenThePluginWithOKClosingDialog();
		},
		afterEach : function(assert) {
			oDesignTime.destroy();
			sandbox.restore();
			sap.ushell = this.originalUShell;
			oPlugin.destroy();
			oPseudoPublicParent.destroy();
			// this.oOverlay && this.oOverlay.destroy();
		}
	});

	QUnit.test("when the service is not up to date and no addODataProperty action is available", function(assert) {
		var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.reject());
		return createOverlayWithAggregationActions({
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.calledOnce(fnDialogOpen, "then the dialog was opened");
			sinon.assert.notCalled(fnServiceUpToDateStub, "only addODataProperty is dependent on up to date service");
			assert.equal(oPlugin.getDialog()._oCustomFieldButton.getVisible(), false, "then the Button to create custom Fields is not shown");
		});
	});

	QUnit.test("when the service is up to date and addODataProperty action is available", function(assert) {
		var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());

		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.calledOnce(fnDialogOpen, "then the dialog was opened");
			assert.ok(fnServiceUpToDateStub.getCall(0).args[0], "addODataProperty is dependent on up to date service, it should be called with a control");
			assert.equal(oPlugin.getDialog()._oCustomFieldButton.getVisible(), true, "then the Button to create custom Fields is shown");
		});
	});

	QUnit.test("when the service is not up to date and addODataProperty action is available", function(assert) {
		sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.reject());
		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			},
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.notCalled(fnDialogOpen, "then the dialog was not opened");
		});
	});

	QUnit.test("when no addODataProperty action is available", function(assert) {
		var fnIsCustomFieldAvailableStub = sandbox.stub(RTAUtils, "isCustomFieldAvailable");
		return createOverlayWithAggregationActions({
			"reveal" : {
				changeType : "unhideControl"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			sinon.assert.notCalled(fnIsCustomFieldAvailableStub, "then custom field enabling should not be asked");
			assert.equal(oDialog.getCustomFieldEnabled(), false, "then in the dialog custom field is disabled");
		});
	});

	QUnit.test("when addODataProperty action is available and simulating a click on open custom field", function(assert) {
		var done = assert.async();
		var that = this;

		var fnServiceUpToDateStub = sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());
		sandbox.stub(RTAUtils, "isCustomFieldAvailable").returns(Promise.resolve(this.STUB_EXTENSIBILITY_BUSINESS_CTXT));

		sandbox.stub(RTAUtils, "openNewWindow", function(sUrl) {
			assert.equal(sUrl, that.STUB_EXTENSIBILITY_USHELL_URL,
					"then we are calling the extensibility tool with the correct parameter");
			done();
		});

		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay]);
		})

		.then(function() {
			assert.ok(fnServiceUpToDateStub.getCall(0).args[0], "addODataProperty is dependent on up to date service, it should be called with a control");

			assert.equal(oDialog.getCustomFieldEnabled(), true, "then in the dialog custom field is enabled");

			//Simulate custom field button pressed, should trigger openNewWindow
			oDialog.fireOpenCustomField();
		});
	});

	QUnit.test("when addODataProperty action is available and showAvailableElements is called 3 times and simulating a click on open custom field the last time", function(assert) {
		var done = assert.async();

		sandbox.stub(RTAUtils, "isServiceUpToDate").returns(Promise.resolve());
		sandbox.stub(RTAUtils, "isCustomFieldAvailable").returns(Promise.resolve(this.STUB_EXTENSIBILITY_BUSINESS_CTXT));
		var onOpenCustomFieldSpy = sandbox.spy(oPlugin, "_onOpenCustomField");
		var showAvailableElementsSpy = sandbox.spy(oPlugin, "showAvailableElements");

		sandbox.stub(RTAUtils, "openNewWindow", function(sUrl) {
			sinon.assert.calledOnce(onOpenCustomFieldSpy, "then the Custom Field Handler is only called once");
			sinon.assert.calledThrice(showAvailableElementsSpy, "then showAvailableElements is called 3 times");
			done();
		});

		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			}
		},
		ON_CHILD)

		.then(function(oOverlay) {
			return oPlugin.showAvailableElements(false, [oOverlay])

			.then(function() {
				assert.equal(oDialog.getCustomFieldEnabled(), true, "then in the dialog custom field is enabled");
				return oPlugin.showAvailableElements(false, [oOverlay]);
			})
			.then(function() {
				return oPlugin.showAvailableElements(false, [oOverlay]);
			})
			.then(function() {
				//Simulate custom field button pressed, should trigger openNewWindow
				oDialog.fireOpenCustomField();
			});
		});
	});

	QUnit.test("when retrieving the contextmenu items for the additional elements plugin,", function(assert){
		var bCheckValue = true;
		var bIsAvailable = true;
		var bFirstCall = true;

		return createOverlayWithAggregationActions({
			"addODataProperty" : {
				changeType : "addFields"
			}
		}, ON_CHILD)

		.then(function(oCreatedOverlay) {
			sandbox.stub(oPlugin, "isAvailable", function(bOverlayIsSibling, oOverlay){
				assert.equal(bOverlayIsSibling, bFirstCall, "the isAvailable function is called once with bOverlayIsSibling = " + bFirstCall);
				assert.deepEqual(oOverlay, oCreatedOverlay, "the isAvailable function is called with the correct overlay");
				bFirstCall = false;
				return bIsAvailable;
			});
			sandbox.stub(oPlugin, "showAvailableElements", function(bOverlayIsSibling, aOverlays){
				assert.equal(bOverlayIsSibling, bCheckValue, "the 'handler' function calls showAvailableElements with bOverlayIsSibling = " + bCheckValue);
				assert.deepEqual(aOverlays, [oCreatedOverlay], "the 'handler' function calls showAvailableElements with the correct overlays");
			});
			sandbox.stub(oPlugin, "isEnabled", function(bOverlayIsSibling, oOverlay){
				assert.equal(bOverlayIsSibling, bCheckValue, "the 'enabled' function calls isEnabled with bOverlayIsSibling = " + bCheckValue);
				assert.deepEqual(oOverlay, oCreatedOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
			});
			var aMenuItems = oPlugin.getMenuItems(oCreatedOverlay);

			assert.equal(aMenuItems[0].id, "CTX_ADD_ELEMENTS_AS_SIBLING", "there is an entry for add elements as sibling");
			aMenuItems[0].handler([oCreatedOverlay]);
			aMenuItems[0].enabled(oCreatedOverlay);
			bCheckValue = false;
			assert.equal(aMenuItems[1].id, "CTX_ADD_ELEMENTS_AS_CHILD", "there is an entry for add elements as child");
			aMenuItems[1].handler([oCreatedOverlay]);
			aMenuItems[1].enabled(oCreatedOverlay);

			bIsAvailable = false;
			bFirstCall = true;
			assert.equal(oPlugin.getMenuItems(oCreatedOverlay).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
		});
	});

	function givenSomeBoundControls(assert){
		sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);

		oSibling = new Button({id: "Sibling", visible : true});
		oUnsupportedInvisible = new Input({id: "UnsupportedInvisible", visible : false});
		oInvisible1 = new Button({id: "Invisible1", visible : false});
		oInvisible2 = new Button({id: "Invisible2", visible : false});
		oIrrelevantChild = new Button({id: "Irrelevant", visible : true});
		oControl = new Bar({
			id : "bar",
			contentLeft : [ oSibling, oUnsupportedInvisible, oInvisible1, oInvisible2],
			contentRight : [ oIrrelevantChild]
		});

		oPseudoPublicParent = new PaneContainer({
			id : "pseudoParent",
			panes : [ oControl ],
			visible : true
		});

		//simulate analyzer returning some elements
		fnEnhanceInvisibleElementsStub = sandbox.stub(AdditionalElementsAnalyzer,"enhanceInvisibleElements", function(oParent, mActions) {
			var bUnsupportedElement = mActions.reveal.elements.some(function(oElement) {
				return !mActions.reveal.types[oElement.getMetadata().getName()];
			});
			assert.notOk(bUnsupportedElement, "no unsupported invisible controls");
			return Promise.resolve([
				{ selected : false, label : "Invisible1", tooltip : "", type : "invisible", element : oInvisible1, bindingPaths: ["Property01"]},
				{ selected : true, label : "Invisible2", tooltip : "", type : "invisible", element : oInvisible2, bindingPaths: ["Property02"]}
			]);
		});
		fnGetUnboundODataPropertiesStub = sandbox.stub(AdditionalElementsAnalyzer,"getUnboundODataProperties").returns(Promise.resolve([
			{selected : true, label : "OData1", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property03"},
			{selected : false, label : "OData2", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property04"},
			{selected : false, label : "OData3", tooltip : "", type : "odata", entityType : "EntityType01", bindingPath : "Property05"}
		]));

	}

	function givenThePluginWithCancelClosingDialog (){
		givenThePluginWithDialogClosing(Promise.reject());
	}

	function givenThePluginWithOKClosingDialog () {
		givenThePluginWithDialogClosing(Promise.resolve());
	}

	function givenThePluginWithDialogClosing(oDialogReturnValue){
		oDialog = new AddElementsDialog();
		//simulate dialog closed with OK/CANCEL
		fnDialogOpen = sandbox.stub(oDialog,"open").returns(oDialogReturnValue);

		//intercept command creation
		fnGetCommandSpy = sandbox.spy(CommandFactory.prototype, "getCommandFor");

		oPlugin = new AdditionalElementsPlugin({
			analyzer : AdditionalElementsAnalyzer,
			dialog : oDialog,
			commandFactory : new CommandFactory()
		});
	}

	function createOverlayWithAggregationActions(mActions, sOverlayType, bInHiddenTree){
		var mChildNames =  {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};
		var mName =  {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};

		if (bInHiddenTree && mActions.reveal){
			mActions.reveal.getInvisibleElements = function(){
				return [oInvisible1, oInvisible2];
			};
		}

		var oPseudoPublicParentDesignTimeMetadata = {
			aggregations : {
				panes : {
					//in hiddenTree actions and childNames belong at the public parent
					actions : bInHiddenTree ? mActions : null,
					childNames : bInHiddenTree ? mChildNames : null,
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
					childNames : !bInHiddenTree ? mChildNames : null,
					//normaly actions and childNames belong here, but in hiddenTree at the public parent
					//actions :  !bInHiddenTree ? mActions : null,
					actions :  !bInHiddenTree && (mActions.addODataProperty || mActions.move) ? {
						addODataProperty : mActions.addODataProperty || null,
						move : mActions.move || null
					} : null
				}
			}
		};
		var oControlDesignTimeMetadata = {
			name : mName,
			actions :  !bInHiddenTree && mActions.reveal ? {
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
			oDesignTime = new DesignTime({
				rootElements : [oPseudoPublicParent],
				// plugins: [this.oRemovePlugin, this.oRenamePlugin],
				designTimeMetadata: oCustomDesignTimeMetadata
			});

			oDesignTime.attachEventOnce("synced", function() {
				oPseudoPublicParentOverlay = OverlayRegistry.getOverlay(oPseudoPublicParent);
				oParentOverlay = OverlayRegistry.getOverlay(oControl);
				oSibilingOverlay = OverlayRegistry.getOverlay(oSibling);
				oIrrelevantOverlay = OverlayRegistry.getOverlay(oIrrelevantChild);
				resolve();
			});
		})

		.then(function() {
			sap.ui.getCore().applyChanges();
			switch (sOverlayType) {
				case ON_SIBLING : return oSibilingOverlay;
				case ON_CHILD : return oParentOverlay;
				case ON_IRRELEVANT : return oIrrelevantOverlay;
			}
		});

		// oPseudoPublicParentOverlay = new ElementOverlay({
		// 	element : oPseudoPublicParent,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.ui.layout",
		// 		data : {
		// 			aggregations : {
		// 				panes : {
		// 					//in hiddenTree actions and childNames belong at the public parent
		// 					actions : bInHiddenTree ? mActions : null,
		// 					childNames : bInHiddenTree ? mChildNames : null,
		// 					getStableElements: function() {
		// 						return [];
		// 					},
		// 					getIndex: function(oBar, oBtn) {
		// 						if (oBtn){
		// 							return oBar.getContentLeft().indexOf(oBtn) + 1;
		// 						} else {
		// 							return oBar.getContentLeft().length;
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	})
		// });
		// oParentOverlay = new ElementOverlay({
		// 	element : oControl,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			aggregations : {
		// 				contentLeft : {
		// 					childNames : !bInHiddenTree ? mChildNames : null,
		// 					//normaly actions and childNames belong here, but in hiddenTree at the public parent
		// 					//actions :  !bInHiddenTree ? mActions : null,
		// 					actions :  !bInHiddenTree && (mActions.addODataProperty || mActions.move) ? {
		// 						addODataProperty : mActions.addODataProperty,
		// 						move : mActions.move
		// 					} : null
		// 				}
		// 			}
		// 		}
		// 	})
		// });
		// oSibilingOverlay = new ElementOverlay({
		// 	element : oSibling,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			name : mName,
		// 			actions :  !bInHiddenTree && mActions.reveal ? {
		// 				reveal : mActions.reveal
		// 			} : null
		// 		}
		// 	})
		// });
		// oIrrelevantOverlay = new ElementOverlay({
		// 	element : oIrrelevantChild,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			name : mName,
		// 			actions :  !bInHiddenTree && mActions.reveal ? {
		// 				reveal : mActions.reveal
		// 			} : null
		// 		}
		// 	})
		// });
		// new ElementOverlay({
		// 	element : oInvisible1,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			name : mName,
		// 			actions :  !bInHiddenTree && mActions.reveal ? {
		// 				reveal : mActions.reveal
		// 			} : null
		// 		}
		// 	})
		// });
		// new ElementOverlay({
		// 	element : oInvisible2,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			name : mName,
		// 			actions :  !bInHiddenTree && mActions.reveal ? {
		// 				reveal : mActions.reveal
		// 			} : null
		// 		}
		// 	})
		// });
		// new ElementOverlay({
		// 	element : oUnsupportedInvisible,
		// 	designTimeMetadata : new ElementDesignTimeMetadata({
		// 		libraryName : "sap.m",
		// 		data : {
		// 			//unsupported control without any designtime metadata
		// 		}
		// 	})
		// });
		//AggregationOverlays will be created automatically
		// switch (sOverlayType){
		// 	case ON_SIBLING : return oSibilingOverlay;
		// 	case ON_CHILD : return oParentOverlay;
		// 	case ON_IRRELEVANT : return oIrrelevantOverlay;
		// }
	}

	function createUnsupportedOverlayWithAggregationActions(){
		return new ElementOverlay({
			element : oControl,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					aggregations : {
						name : {
							singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME1",
							plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL1"
						},
						aggregation1 : {
							actions : {
								"addODataProperty" : {
									changeType : "addFields"
								}
							},
							childNames : {
								singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME1",
								plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL1"
							}
						},
						aggregation2 : {
							actions: {
								"reveal" : {
									changeType : "unhideControl"
								}
							},
							childNames : {
								singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME2",
								plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL2"
							}
						}
					}
				}
			})
		});
	}

	function createOverlayWithoutDesignTime(mActions, bOnSibling) {
		// oParentOverlay = new ElementOverlay({
		// 	element: oControl,
		// 	designTimeMetadata: new ElementDesignTimeMetadata({
		// 	})
		// });
		// oSibilingOverlay = new ElementOverlay({
		// 	element: oSibling
		// });
		// new ElementOverlay({
		// 	element: oInvisible1
		// });
		// new ElementOverlay({
		// 	element: oInvisible2
		// });
		// new ElementOverlay({
		// 	element : oUnsupportedInvisible
		// });
		// //AggregationOverlays will be created automatically
		// return bOnSibling ? oSibilingOverlay : oParentOverlay;
		var oEmptyActions = { actions: null };
		var oCustomDesignTimeMetadata = {
			"sap.m.Bar" : oEmptyActions,
			"sap.m.Input" : oEmptyActions,
			"sap.m.Button" : oEmptyActions
		};

		return new Promise(function(resolve) {
			oDesignTime = new DesignTime({
				rootElements : [oControl],
				designTimeMetadata: oCustomDesignTimeMetadata
			});

			oDesignTime.attachEventOnce("synced", function() {
				oParentOverlay = OverlayRegistry.getOverlay(oControl);
				oSibilingOverlay = OverlayRegistry.getOverlay(oSibling);
				resolve();
			});
		})

		.then(function() {
			return bOnSibling ? oSibilingOverlay : oParentOverlay;
		});
	}

	function assertDialogModelLength(assert, iExpectedLength, sMsg) {
		var aElements = oPlugin.getDialog().getElements();
		assert.equal(aElements.length, iExpectedLength, sMsg);
	}

	QUnit.start();
});