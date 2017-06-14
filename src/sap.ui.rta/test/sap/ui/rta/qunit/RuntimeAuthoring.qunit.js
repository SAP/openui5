/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
	// Controls
	'sap/m/Button',
	'sap/m/MessageBox',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/SmartForm',
	// internal
	'sap/ui/Device',
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/LrepConnector',
	'sap/ui/fl/Change',
	'sap/ui/fl/Utils',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/rta/qunit/RtaQunitUtils',
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	Button,
	MessageBox,
	Group,
	GroupElement,
	SmartForm,
	Device,
	ContextMenu,
	DesignTimeMetadata,
	OverlayRegistry,
	Settings,
	ChangeRegistry,
	LrepConnector,
	Change,
	Utils,
	FakeLrepLocalStorage,
	RuntimeAuthoring,
	Stack,
	CommandFactory,
	Remove,
	RtaQunitUtils,
	sinon) {
	"use strict";

	QUnit.start();

	var fnTriggerKeydown = function(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		sap.ui.test.qunit.triggerEvent("keydown", oTargetDomRef, oParams);
	};

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("test-view");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.exit();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized,", function(assert) {
		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");
	});

	QUnit.test("when the uri-parameter sap-ui-layer is set,", function(assert) {
		assert.equal(this.oRta.getLayer(), "CUSTOMER", "then the layer is the default 'CUSTOMER'");

		sandbox.stub(jQuery.sap, "getUriParameters").returns(
			{
				mParams: {
					"sap-ui-layer": ["VENDOR"]
			}
		});

		this.oRta.setFlexSettings(this.oRta.getFlexSettings());
		assert.equal(this.oRta.getLayer("CUSTOMER"), "VENDOR", "then the function reacts to the URL parameter and sets the layer to VENDOR");
	});

	QUnit.test("when setFlexSettings is called", function(assert) {
		assert.deepEqual(this.oRta.getFlexSettings(), {
			layer: "CUSTOMER",
			developerMode: true
		});

		this.oRta.setFlexSettings({
			layer: "USER",
			namespace: "namespace"
		});

		assert.deepEqual(this.oRta.getFlexSettings(), {
			layer: "USER",
			developerMode: true,
			namespace: "namespace"
		});

	});

	QUnit.test("when command stack is changed,", function(assert) {
		var oInitialCommandStack = this.oRta.getCommandStack();
		assert.ok(oInitialCommandStack, "the command stack is automatically created");
		this.oRta.setCommandStack(new Stack());
		var oNewCommandStack = this.oRta.getCommandStack();
		assert.notEqual(oInitialCommandStack, oNewCommandStack, "rta getCommandStack returns new command stack");
	});

	QUnit.test("when two overlays are added to selection", function(assert) {
		var that = this;

		var oElement1 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
		var oOverlay1 = OverlayRegistry.getOverlay(oElement1.getId());
		var oElement2 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
		var oOverlay2 = OverlayRegistry.getOverlay(oElement2.getId());

		assert.strictEqual(this.oRta.getSelection().length, 0, "initially there's no selection in RTA");

		var iFired = 0;
		this.oRta.attachSelectionChange(function(oEvent) {
			iFired++;
			assert.deepEqual(that.oRta.getSelection(), oEvent.getParameter("selection"), "the selection event from rta is fired with a coreect selection");
		});

		oOverlay1.focus();
		sap.ui.test.qunit.triggerKeydown(oOverlay1.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		assert.strictEqual(this.oRta.getSelection().length, 1, "after first selection one overlay is selected");

		this.oRta._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
		oOverlay2.focus();
		sap.ui.test.qunit.triggerKeydown(oOverlay2.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		assert.strictEqual(this.oRta.getSelection().length, 2, "after second selection two overlays are selected");

		assert.strictEqual(iFired, 2, "and selection event from RTA is fired twice");
	});

	QUnit.test("when RTA is stopped ...", function(assert) {
		return this.oRta.stop().then(function() {
			assert.ok(true, "then the promise got resolved");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
		});
	});

	QUnit.test("when transporting local changes", function(assert) {
		var oMockTransportInfo = {
					packageName : "PackageName",
					transport : "transportId"
				},
				oMockTransportedChange = {
					packageName : "aPackage",
					fileType : "change",
					id : "changeId1",
					namespace : "namespace",
					getDefinition : function(){
						return {
							packageName : this.packageName,
							fileType : this.fileType
						};
					},
					getId : function(){
						return this.id;
					},
					getNamespace : function(){
						return this.namespace;
					},
					setResponse : function(oDefinition){
						this.packageName = oDefinition.packageName;
					},
					getPackage : function(){
						return this.packageName;
					}
				},
				oMockNewChange = {
					packageName : "$TMP",
					fileType : "change",
					id : "changeId2",
					namespace : "namespace",
					getDefinition : function(){
						return {
							packageName : this.packageName,
							fileType : this.fileType
						};
					},
					getId : function(){
						return this.id;
					},
					getNamespace : function(){
						return this.namespace;
					},
					setResponse : function(oDefinition){
						this.packageName = oDefinition.packageName;
					},
					getPackage : function(){
						return this.packageName;
					}
				},
				aMockLocalChanges = [oMockTransportedChange, oMockNewChange],
				oMockFlexController = {
					getComponentChanges : function(){
						return Promise.resolve(aMockLocalChanges);
					}
				},
				oMockLrepConnector = {
					send : function(){
						return Promise.resolve();
					}
				};
		sandbox.stub(LrepConnector, "createConnector").returns(oMockLrepConnector);
		sandbox.stub(Utils, "getClient").returns('');
		sandbox.stub(this.oRta, "_getFlexController").returns(oMockFlexController);
		var stubMessageToast = sandbox.stub(this.oRta, "_showMessageToast").returns();

		return this.oRta._transportAllLocalChanges(oMockTransportInfo).then(function(){
			assert.equal(aMockLocalChanges[0].packageName, "aPackage", "then the transported local change is not updated");
			assert.equal(aMockLocalChanges[1].packageName, oMockTransportInfo.packageName, "but the new local change is updated");
			assert.ok(stubMessageToast.calledOnce, "and success message called");
		});
	});

	QUnit.module("Given a USER layer change", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

			this.oUserChange = new Change({
				"fileType": "change",
				"layer": "USER",
				"fileName": "a",
				"namespace": "b",
				"packageName": "c",
				"changeType": "labelChange",
				"creation": "",
				"reference": "",
				"selector": {
					"id": "abc123"
				},
				"content": {
					"something": "createNewVariant"
				}
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
		},
		afterEach : function(assert) {
			this.oRta.exit();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA is started in the customer layer", function(assert) {
		var done = assert.async();

		var oFlexController = this.oRta._getFlexController();
		sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));

		this.oRta.attachStart(function() {
			assert.equal(this.oRta._oToolsMenu.getControl('restore').getEnabled(), false, "then the Restore Button is disabled");
			done();
		}.bind(this));

		this.oRta.start();
	});

	QUnit.test("when RTA is started in the user layer", function(assert) {
		var done = assert.async();

		var oFlexController = this.oRta._getFlexController();
		sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([this.oUserChange]));

		this.oRta.attachStart(function() {
			assert.equal(this.oRta._oToolsMenu.getControl('restore').getEnabled(), true, "then the Restore Button is enabled");
			done();
		}.bind(this));

		this.oRta.setFlexSettings({layer: "USER"});
		this.oRta.start();
	});

	QUnit.module("Given that RuntimeAuthoring is started without toolbar...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.exit();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized,", function(assert) {
		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			var done = assert.async();

			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"hideControl" : "default"
				}
			});

			// Prepare elements an designtime
			var oElement1 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl",
							getState : function(oGroupElement) {
								return {
									visible : oGroupElement.getVisible()
								};
							},
							restoreState : function(oGroupElement, oState) {
								oGroupElement.setVisible(oState.visible);
							}
						}
					}
				}
			});

			// Create commmands
			var oCommandFactory = new CommandFactory();
			this.oRemoveCommand1 = oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement : oElement1
			}, this.oGroupElementDesignTimeMetadata);

			// Create command stack with the commands
			this.oRemoveCommand1.execute().then(function() {

				//After command has been pushed
				var fnStackModifiedSpy = sinon.spy(function() {

				// Start RTA with command stack
				var oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
				this.oRta = new RuntimeAuthoring({
					rootControl : oRootControl,
					commandStack : this.oCommandStack,
					showToolbars : true,
					flexSettings: {
						developerMode: false
					}
				});

				this.oRta.attachStart(function() {
					this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
					this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
					done();
				}.bind(this));

				this.oRta.start();

				}.bind(this));

				this.oCommandStack = new Stack();
				this.oCommandStack.attachEventOnce("modified", fnStackModifiedSpy);
				this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);

			}.bind(this));
		},

		afterEach : function(assert) {
			this.oRemoveCommand1.destroy();
			this.oRta.destroy();
			this.oCommandStack.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
		var done = assert.async();
		var fnStackModifiedSpy = sinon.spy(function() {
			if (fnStackModifiedSpy.calledOnce) {
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
			} else if (fnStackModifiedSpy.calledTwice) {
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CMD + Y is again 1 command in the stack");
				done();
			}
		}.bind(this));
		this.oCommandStack.attachModified(fnStackModifiedSpy);
		Device.os.macintosh = true;
		assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

		//undo -> _unExecute -> fireModified
		fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, false, true);

		//redo -> execute -> fireModified (inside promise)
		fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Y, false, false, false, true);

	});

	QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
		var done = assert.async();
		var fnStackModifiedSpy = sinon.spy(function() {
			if (fnStackModifiedSpy.calledOnce) {
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
			} else if (fnStackModifiedSpy.calledTwice) {
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CMD + Y is again 1 command in the stack");
				done();
			}
		}.bind(this));
		this.oCommandStack.attachModified(fnStackModifiedSpy);
		Device.os.macintosh = false;
		assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

		//undo -> _unExecute -> fireModified
		fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, true, false);

		//redo -> execute -> fireModified (inside promise)
		fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Y, false, false, true, false);
	});

	QUnit.test("when a simple form has a title", function(assert) {
		var oTitle = sap.ui.getCore().byId("Comp1---idMain1--Title1");
		var oTitleOverlay = OverlayRegistry.getOverlay(oTitle.getId());
		assert.strictEqual(oTitleOverlay.getEditable(), false, "then the title is not editable.");
	});

	QUnit.module("Given that RuntimeAuthoring is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);

			// Create the controls
			this.oGroupElement1 = new GroupElement({id : oComp.createId("element1")});
			this.oGroupElement2 = new GroupElement({id : oComp.createId("element2")});
			this.oGroup = new Group({
				id : oComp.createId("group"),
				groupElements : [this.oGroupElement1, this.oGroupElement2]
			});
			this.oSmartForm = new SmartForm({
				id : oComp.createId("smartform"),
				groups : [this.oGroup]
			});

			// Create commmands
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});

			var oCommandFactory = new CommandFactory();
			this.oRemoveCommand1 = oCommandFactory.getCommandFor(this.oGroupElement1, "Remove", {
				removedElement : this.oGroupElement1
			}, this.oGroupElementDesignTimeMetadata);
			this.oRemoveCommand2 = oCommandFactory.getCommandFor(this.oGroupElement2, "Remove", {
				removedElement : this.oGroupElement2
			}, this.oGroupElementDesignTimeMetadata);

			// Create command stack with the commands
			this.oCommandStack = new Stack();
			this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
			this.oCommandStack.pushExecutedCommand(this.oRemoveCommand2);

			// Start RTA with command stack
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oSmartForm,
				commandStack : this.oCommandStack,
				showToolbars : true
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oSmartForm.destroy();
			this.oRemoveCommand1.destroy();
			this.oRemoveCommand2.destroy();
			this.oGroupElementDesignTimeMetadata.destroy();
			this.oRta.destroy();
			this.oCommandStack.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
		var fnStubSerialize = function() {
			return Promise.reject();
		};
		sandbox.stub(this.oRta, "_serializeToLrep", fnStubSerialize);

		return this.oRta.stop(false).catch(function() {
			assert.ok(true, "then the promise got rejected");
			assert.ok(this.oRta, "RTA is still up and running");
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
			assert.strictEqual(jQuery(".sapUiRtaToolbar:visible").length, 1, "and the Toolbar is visible.");
		}.bind(this));
	});

	QUnit.test("when stopping rta without saving changes,", function(assert) {
		var done = assert.async();
		return this.oRta.stop(true).then(function() {
			assert.ok(true, "then the promise got resolved");
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "there is no change written to LREP");
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
			done();
		}.bind(this));
	});

	QUnit.test("when stopping rta with saving changes,", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(2, assert);
		return this.oRta.stop().then(function() {
			assert.ok(true, "then the promise got resolved");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenu("nonDefaultContextMenu");
			this.oRemovePlugin = new Remove({
				id : "nonDefaultRemovePlugin",
				commandFactory : oCommandFactory
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false,
				plugins : {
					remove : this.oRemovePlugin,
					contextMenu : this.oContextMenuPlugin
				}
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");

			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepLocalStorage.deleteChanges();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized with custom plugins only", function(assert) {
		var done = assert.async();

		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " and the custom ContextMenuPlugin is set");
		assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
		assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

		return this.oRta.stop(false).then(function() {
			assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			done();
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");

			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized without custom plugins and default plugins get used", function(assert) {
		var done = assert.async();

		assert.ok(this.oRta.getPlugins()['contextMenu'], " then the default ContextMenuPlugin is set");
		assert.notOk(this.oRta.getPlugins()['contextMenu'].bIsDestroyed, " and the default ContextMenuPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['dragDrop'], " and the default DragDropPlugin is set");
		assert.notOk(this.oRta.getPlugins()['dragDrop'].bIsDestroyed, " and the default DragDropPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['cutPaste'], " and the default CutPastePlugin is set");
		assert.notOk(this.oRta.getPlugins()['cutPaste'].bIsDestroyed, " and the default CutPastePlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['remove'], " and the default RemovePlugin is set");
		assert.notOk(this.oRta.getPlugins()['remove'].bIsDestroyed, " and the default RemovePlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['additionalElements'], " and the default AdditionalElementsPlugin is set");
		assert.notOk(this.oRta.getPlugins()['additionalElements'].bIsDestroyed, " and the default AdditionalElementsPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['rename'], " and the default RenamePlugin is set");
		assert.notOk(this.oRta.getPlugins()['rename'].bIsDestroyed, " and the default RenamePlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['selection'], " and the default SelectionPlugin is set");
		assert.notOk(this.oRta.getPlugins()['selection'].bIsDestroyed, " and the default SelectionPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['settings'], " and the default SettingsPlugin is set");
		assert.notOk(this.oRta.getPlugins()['settings'].bIsDestroyed, " and the default SettingsPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['createContainer'], " and the default CreateContainerPlugin is set");
		assert.notOk(this.oRta.getPlugins()['createContainer'].bIsDestroyed, " and the default CreateContainerPlugin is not destroyed");
		assert.ok(this.oRta.getPlugins()['tabHandling'], " and the default TabHandlingPlugin is set");
		assert.notOk(this.oRta.getPlugins()['tabHandling'].bIsDestroyed, " and the default TabHandlingPlugin is not destroyed");

		this.oRta.stop(false).then(function(){
			assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			done();
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();

			this.oContextMenuPlugin = new ContextMenu("nonDefaultContextMenu");

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");
			var mPlugins = this.oRta.getDefaultPlugins();

			assert.ok(mPlugins, " then default plugins are supplied by getDefaultPlugins methode");
			delete mPlugins['rename'];
			mPlugins['contextMenu'] = this.oContextMenuPlugin;
			this.oRta.setPlugins(mPlugins);

			this.oRta.attachStart(function() {
				assert.throws(function () {
					this.oRta.setPlugins(mPlugins);
				}, /Cannot replace plugins/, " and setPlugins cannot be called after DT start");
				assert.equal(this.oRta.getPlugins()['rename'], undefined, " and a custom rename plugin does not exist");
				assert.ok(this.oRta.getDefaultPlugins()['rename'].bIsDestroyed, " and the default rename plugin has been destroyed");
				assert.ok(this.oRta.getDefaultPlugins()['contextMenu'].bIsDestroyed, " and the default context menu plugin has been destroyed");
				assert.equal(this.oRta.getPlugins()['contextMenu'].getId(), this.oContextMenuPlugin.getId(), " and the custom context menu plugin is used");
				done();
			}.bind(this));

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepLocalStorage.deleteChanges();
			this.oRta.destroy();
		}
	});

	QUnit.test("when RTA gets initialized without custom plugins but set plugins with setPlugins method", function (assert) {
		var done = assert.async();

		this.oRta.attachStop(function(oEvent) {
			assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			done();
		}.bind(this));

		this.oRta.stop(false);
	});

	QUnit.module("Given that RTA is started in FLP", {
		beforeEach : function(assert) {
			window.bUShellNavigationTriggered = false;

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							},
							getHash : function() {
								return "Action-somestring";
							},
							parseShellHash : function() {
								return {
									semanticObject : "Action",
									action : "somestring"
								};
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sap.ushell = this.originalUShell;
			sandbox.restore();
			delete window.bUShellNavigationTriggered;
		}
	});

	QUnit.test("when there are personalized changes and when _handlePersonalizationChangesOnStart() method is called", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(true);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
			"show",
			function(sMessage, mOptions){
				mOptions.onClose.call(this);
			}
		);

		return this.oRta._handlePersonalizationChangesOnStart().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
				true,
				"then enableRestart() is called only once");
			assert.equal(this.fnEnableRestartSpy.calledWith("CUSTOMER"),
				true,
				"then enableRestart() is called with the correct parameter");
			assert.strictEqual(window.bUShellNavigationTriggered,
				true,
				"then the reload inside FLP is triggered");
		}.bind(this));
	});

	QUnit.test("when no personalized changes and _handlePersonalizationChangesOnStart() is called", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(false);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		return this.oRta._handlePersonalizationChangesOnStart().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount,
				0,
				"then enableRestart() is not called");
			assert.strictEqual(window.bUShellNavigationTriggered,
				false,
				"then the reload inside FLP is not triggered");
		}.bind(this));
	});

	QUnit.test("when the appClosed event is raised", function(assert) {
		var done = assert.async();

		var oCheckPersChangesSpy = sandbox.spy(this.oRta, "_handlePersonalizationChangesOnExit");
		var oSerializeSpy = sandbox.spy(this.oRta, "_serializeToLrep");

		this.oRta.attachStop(function() {
			assert.equal(oCheckPersChangesSpy.callCount, 0, "then the check for personalized changes wasn't executed");
			assert.equal(oSerializeSpy.callCount, 0, "then _serializeToLrep wasn't called");
			done();
		});

		this.oRta.attachStart(function() {
			sap.ui.getCore().getEventBus().publish("sap.ushell.renderers.fiori2.Renderer", "appClosed", this);
		});
		this.oRta.start();
	});

	QUnit.test("when RTA toolbar gets closed (exit without appClosed)", function(assert) {
		var done = assert.async();

		sandbox.stub(this.oRta, "_handlePersonalizationChangesOnExit", function(){
			//The test will timeout if the Personalization handling is not called
			assert.ok("then the check for personalized changes was executed");
			done();
		});

		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(false);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);
		sandbox.stub(this.oRta, "_checkChangesExist", function() {
			return Promise.resolve(true);
		});
		this.oRta.setShowToolbars(true);

		this.oRta.start().then(function () {
			this.oRta._oToolsMenu.getControl('exit').firePress();
		}.bind(this));
	});

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer = CUSTOMER already in the URL", {
		beforeEach : function(assert) {
			window.bUShellNavigationTriggered = false;
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!
			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							},
							getHash : function() {
								return "Action-somestring";
							},
							parseShellHash : function() {
								return {
									semanticObject : "Action",
									action : "somestring",
									params : {
									"sap-ui-fl-max-layer" : ["CUSTOMER"]
									}
								};
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach : function(assert) {
			this.oRta.exit();
			sap.ushell = this.originalUShell;
			sandbox.restore();
		}
	});

	QUnit.test("when _handlePersonalizationChangesOnStart() method is called", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(true);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
			"show",
			function(sMessage, mOptions){
				mOptions.onClose.call(this);
			}
		);

		return this.oRta._handlePersonalizationChangesOnStart().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
				false,
				"then enableRestart() is not called");
			assert.strictEqual(window.bUShellNavigationTriggered,
				false,
				"then the reload inside FLP is not triggered");
		}.bind(this));
	});

	QUnit.test("when personalized changes exist and user exits reloading the personalization...", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(true);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		var sMessageBoxConfirmText = this.oRta._getTextResources().getText("MSG_PERSONALIZATION_CONFIRM_BUTTON_TEXT");

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
			"confirm",
			function(sMessage, mOptions){
				mOptions.onClose.call(this, sMessageBoxConfirmText);
			}
		);

		return this.oRta._handlePersonalizationChangesOnExit().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount,
				0,
				"then enableRestart() is not called");
			assert.strictEqual(window.bUShellNavigationTriggered,
				true,
				"then the reload inside FLP is triggered");
		}.bind(this));
	});

	QUnit.test("when personalized changes exist and user exits without personalization...", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(true);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		var sMessageBoxCancelText = this.oRta._getTextResources().getText("MSG_PERSONALIZATION_CANCEL_BUTTON_TEXT");

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
			"confirm",
			function(sMessage, mOptions){
				mOptions.onClose.call(this, sMessageBoxCancelText);
			}
		);

		return this.oRta._handlePersonalizationChangesOnExit().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount,
				0,
				"then enableRestart() is not called");
			assert.strictEqual(window.bUShellNavigationTriggered,
				false,
				"then the reload inside FLP is not triggered");
		}.bind(this));
	});

	QUnit.test("when there are no personalized changes and _handlePersonalizationChangesOnExit() is called", function(assert) {
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(false);
			}
		};

		sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

		return this.oRta._handlePersonalizationChangesOnExit().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount,
				0,
				"then enableRestart() is not called");
			assert.strictEqual(window.bUShellNavigationTriggered,
				false,
				"then the reload inside FLP is not triggered");
		}.bind(this));
	});

	QUnit.module("Given that RTA is started on stand-alone applications", {
		beforeEach : function(assert) {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadWithPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithPersonalizationChanges");
			this.fnReloadWithoutPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithoutPersonalizationChanges");
		},
		afterEach : function(assert) {
			this.oRta.exit();
			sandbox.restore();
		}
	});

	QUnit.test("when the _handlePersonalizationChangesOnStart() method is called", function(assert) {
		return this.oRta._handlePersonalizationChangesOnStart().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then enableRestart() is not called");
			assert.strictEqual(this.fnReloadWithPersonalizationChangesSpy.callCount,
				0,
				"then reloadWithoutPersonalizationChanges() is not called");
		}.bind(this));
	});

	QUnit.test("when the _handlePersonalizationChangesOnExit() method is called", function(assert) {
		return this.oRta._handlePersonalizationChangesOnExit().then(function(){
			assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then enableRestart() is not called");
			assert.strictEqual(this.fnReloadWithoutPersonalizationChangesSpy.callCount,
				0,
				"then reloadWithPersonalizationChanges() is not called");
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl ...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: false,
				isKeyUser: true,
				isProductiveSystem: true
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("and publish is disabled", function(assert) {
		assert.equal(this.oRta._oToolsMenu.getControl('restore').getVisible(), true, "then the Reset Button is still visible");
		assert.equal(this.oRta._oToolsMenu.getControl('publish').getVisible(), false, "then the Publish Button is invisible");
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: true,
				isKeyUser: true,
				isProductiveSystem: false
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("and publish is enabled", function(assert) {
		assert.equal(this.oRta._oToolsMenu.getControl('restore').getVisible(), true, "then the Reset Button is visible");
		assert.equal(this.oRta._oToolsMenu.getControl('publish').getVisible(), true, "then the Publish Button is visible");
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.reject());

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("and FL settings return rejected promise", function(assert) {
		assert.equal(this.oRta._oToolsMenu.getControl('restore').getVisible(), true, "then the Reset Button is still visible");
		assert.equal(this.oRta._oToolsMenu.getControl('publish').getVisible(), false, "then the Publish Button is invisible");
	});

	QUnit.module("Given that changeSpecificData is given with changes for two controls...", {
		beforeEach : function(assert) {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			this.oFlexController = this.oRta._getFlexController();
			this.aChangeSpecificData = [
				{ selector : { id : "Comp1---idMain1--GeneralLedgerDocument.Name" } },
				{ selector : { id : "Comp1---idMain1--GeneralLedgerDocument.CompanyCode" } }
			];
			this.oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "createAndApplyChange");
			this.oSaveAllStub = sandbox.stub(this.oFlexController, "saveAll");
			this.oUtilsLogStub = sandbox.stub(Utils.log, "error");
			this.oShowMessageStub = sandbox.stub(this.oRta, "_showMessage").returns(Promise.resolve());
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when _createAndApplyChanges function is called and all promises are resolved", function(assert) {
		var done = assert.async();
		this.oCheckTargetAndApplyChangeStub.returns(Promise.resolve());
		this.oSaveAllStub.returns(Promise.resolve());

		var oPromiseReturn = this.oRta._createAndApplyChanges(this.aChangeSpecificData);

		assert.ok(oPromiseReturn instanceof Promise, "then promise is returned");

		oPromiseReturn.then(function() {
			assert.strictEqual(this.oCheckTargetAndApplyChangeStub.callCount, 2, "then both changes are processed");
			assert.strictEqual(this.oUtilsLogStub.callCount, 0, "then no errors occurred");
			assert.ok(this.oSaveAllStub.calledOnce, "then process was finished");
			done();
		}.bind(this));
	});

	QUnit.test("when _createAndApplyChanges function is called with rejected promises", function(assert) {
		var done = assert.async();
		this.oCheckTargetAndApplyChangeStub.onCall(0).returns(Promise.resolve());
		this.oCheckTargetAndApplyChangeStub.onCall(1).returns(Promise.reject());
		this.oSaveAllStub.returns(Promise.reject());

		var oPromiseReturn = this.oRta._createAndApplyChanges(this.aChangeSpecificData);

		assert.ok(oPromiseReturn instanceof Promise, "then promise is returned");

		oPromiseReturn.then(function() {
			assert.strictEqual(this.oCheckTargetAndApplyChangeStub.callCount, 2, "then both changes are processed");
			assert.strictEqual(this.oUtilsLogStub.callCount, 2, "then rejected errors are handled");
			assert.ok(this.oSaveAllStub.calledOnce, "then process was finished");
			assert.ok(this.oShowMessageStub.calledOnce, "then save error MessageToast called");
			done();
		}.bind(this));
	});

	QUnit.done(function( details ) {
		// If coverage is requested, remove the view to not overlap the coverage result
		if (QUnit.config.coverage == true && details.failed === 0) {
			jQuery("#test-view").hide();
		}
	});
});
