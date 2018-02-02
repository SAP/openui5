/*global QUnit sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/AppDescriptorCommand",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/rta/command/Settings",
	"sap/ui/rta/plugin/Settings",
	"sap/ui/rta/command/Stack",
	"sap/ui/fl/Utils"
],
function(
	Button,
	VerticalLayout,
	DesignTime,
	ElementOverlay,
	ElementDesignTimeMetadata,
	CommandFactory,
	AppDescriptorCommand,
	OverlayRegistry,
	ChangeRegistry,
	PropertyChange,
	SettingsCommand,
	SettingsPlugin,
	Stack,
	Utils
) {
	"use strict";

	QUnit.start();

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
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					},
					id : "appId"
				}
			};
		},
		getModel: function () {}
	};
	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	sinon.stub(PropertyChange, "completeChangeContent");

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and settings plugin are instantiated", {
		beforeEach : function(assert) {
			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"changeSettings" : "sap/ui/fl/changeHandler/PropertyChange"
				}
			});

			this.oCommandStack = new Stack();
			this.oSettingsPlugin = new SettingsPlugin({
				commandFactory : new CommandFactory(),
				commandStack : this.oCommandStack
			});

			this.oButton = new Button("button", {text : "Button"});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oButton]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oVerticalLayout.destroy();
		}
	});

	QUnit.test("when an overlay has no settings action designTime metadata", function(assert) {
		var fnDone = assert.async();

		this.oDesignTime = new DesignTime({
			rootElements : [this.oVerticalLayout],
			plugins : [this.oSettingsPlugin],
			designTimeMetadata : {
				"sap.m.Button" : {
					actions : {}
				}
			}
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
			this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

			assert.strictEqual(this.oSettingsPlugin.isAvailable(oButtonOverlay), false, "... then isAvailable is called, then it returns false");
			assert.strictEqual(this.oSettingsPlugin.isEnabled(oButtonOverlay), false, "... then isEnabled is called, then it returns false");
			assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), false, "then the overlay is not editable");

			this.oDesignTime.destroy();
			fnDone();
		}.bind(this));
	});

	QUnit.test("when an overlay has settings action designTime metadata, but has no isEnabled property defined", function(assert) {
		var fnDone = assert.async();

		this.oDesignTime = new DesignTime({
			rootElements : [this.oVerticalLayout],
			plugins : [this.oSettingsPlugin],
			designTimeMetadata : {
				"sap.m.Button" : {
					actions : {
						settings : function() {
							return {
								handler : function() {}
							};
						}
					}
				}
			}
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
			this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

			assert.strictEqual(this.oSettingsPlugin.isAvailable(oButtonOverlay), true, "... then isAvailable is called, then it returns true");
			assert.strictEqual(this.oSettingsPlugin.isEnabled(oButtonOverlay), true, "... then isEnabled is called, then it returns true");
			assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");

			this.oDesignTime.destroy();
			fnDone();
		}.bind(this));
	});

	QUnit.test("when an overlay has settings action designTime metadata, and isEnabled property is boolean", function(assert) {
		var fnDone = assert.async();

		this.oDesignTime = new DesignTime({
			rootElements : [this.oVerticalLayout],
			plugins : [this.oSettingsPlugin],
			designTimeMetadata : {
				"sap.m.Button" : {
					actions : {
						settings : function() {
							return {
								isEnabled : false,
								handler : function() {}
							};
						}
					}
				}
			}
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
			this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

			assert.strictEqual(this.oSettingsPlugin.isAvailable(oButtonOverlay), true, "... then isAvailable is called, then it returns true");
			assert.strictEqual(this.oSettingsPlugin.isEnabled(oButtonOverlay), false, "... then isEnabled is called, then it returns correct value");
			assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");

			this.oDesignTime.destroy();
			fnDone();
		}.bind(this));
	});

	QUnit.test("when an overlay has settings action designTime metadata, and isEnabled is function", function(assert) {
		var fnDone = assert.async();

		this.oDesignTime = new DesignTime({
			rootElements : [this.oVerticalLayout],
			plugins : [this.oSettingsPlugin],
			designTimeMetadata : {
				"sap.m.Button" : {
					actions : {
						settings : function() {
							return {
								isEnabled : function(oElementInstance) {
									return oElementInstance.getMetadata().getName() !== "sap.m.Button";
								}
							};
						}
					}
				}
			}
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
			this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

			assert.strictEqual(this.oSettingsPlugin.isAvailable(oButtonOverlay), false, "... then isAvailable is called, then it returns false");
			assert.strictEqual(this.oSettingsPlugin.isEnabled(oButtonOverlay), false, "... then isEnabled is called, then it returns correct value from function call");
			assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), false, "then the overlay is not editable because the handler is missing");

			this.oDesignTime.destroy();
			fnDone();
		}.bind(this));
	});

	QUnit.test("when the handle settings function is called and the handler returns a change object,", function(assert) {
		var done = assert.async();
		var oSettingsChange = {
			selectorControl : this.oButton,
			changeSpecificData : {
				changeType : "changeSettings",
				content : "testchange"
			}
		};

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : true,
								handler : function() {
									return new Promise(function(resolve, reject) {
										resolve([oSettingsChange]);
									});
								}
							};
						}
					}
				}
			})
		});

		var aSelectedOverlays = [oButtonOverlay];

		this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.ok(oCompositeCommand, "Composite command is created");
			var oSettingsCommand = oCompositeCommand.getCommands()[0];
			assert.ok(oSettingsCommand, "... which contains a settings command");
			done();
		});
		return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton });
	});

	QUnit.test("when the handle settings function is called and no handler is present in Designtime Metadata,", function(assert) {
		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : true
							};
						}
					}
				}
			})
		});

		var aSelectedOverlays = [oButtonOverlay];

		assert.throws(
			function(){
				this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton });
			},
			/Handler not found/,
			"an error message is raised referring to the missing handler"
		);

	});

	QUnit.test("when the handle settings function is called and the handler returns a rejected promise with error object,", function(assert) {
		var that = this;

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : true,
								handler : function() {
									return new Promise(function(resolve, reject) {
										reject(Error("Test"));
									});
								}
							};
						}
					}
				}
			})
		});

		var aSelectedOverlays = [oButtonOverlay];

		return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton }).catch(function() {
			assert.notOk(that.oSettingsCommand, "... command is not created");
		});
	});

	QUnit.test("when two changes are on the command stack,", function(assert) {
		var done = assert.async();

		var oSettingsCmd1 = this.oSettingsPlugin.getCommandFactory().getCommandFor(
			{
				id : "stableNavPopoverId",
				controlType : "sap.m.Button",
				appComponent : oMockedAppComponent
			},
			"settings",
			{
			changeType : "changeSettings",
			content : "testchange1"
			},
			new ElementDesignTimeMetadata({
			libraryName : "sap.m",
			data : {
				actions : {
					settings : function() {}
				}
			}
		}));

		var oSettingsCmd2 = this.oSettingsPlugin.getCommandFactory().getCommandFor(
			{
				id : "stableNavPopoverId",
				controlType : "sap.m.Button",
				appComponent : oMockedAppComponent
			},
			"settings",
			{
				changeType : "changeSettings",
				content : "testchange2"
			},
			new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {}
					}
				}
			}));

		oSettingsCmd1.prepare();
		oSettingsCmd2.prepare();
		this.oCommandStack.pushAndExecute(oSettingsCmd1).then(function(){
			this.oCommandStack.pushAndExecute(oSettingsCmd2).then(function(){
				var aUnsavedChanges = this.oSettingsPlugin._getUnsavedChanges("stableNavPopoverId", ["changeSettings"]);
				assert.equal(aUnsavedChanges.length, 2, "these commands are returned by _getUnsavedChanges");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("when the handle settings function is called and the handler returns a change object with an app descriptor change,", function(assert) {
		var done = assert.async();
		var mAppDescriptorChange = {
			appComponent : oMockedAppComponent,
			changeSpecificData : {
				appDescriptorChangeType : "appDescriptorChangeType",
				content : {
					parameters : {
						param1 : "param1"
					},
					texts : {
						text1 : "text1"
					}
				}
			}
		};

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : true,
								handler : function() {
									return new Promise(function(resolve, reject) {
										resolve([mAppDescriptorChange]);
									});
								}
							};
						}
					}
				}
			})
		});

		var aSelectedOverlays = [oButtonOverlay];

		this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.ok(oCompositeCommand, "Composite command is created");
			var oAppDescriptorCommand = oCompositeCommand.getCommands()[0];
			assert.ok(oAppDescriptorCommand instanceof AppDescriptorCommand, "... which contains an App Descriptor command...");
			assert.equal(oAppDescriptorCommand.getAppComponent(), oMockedAppComponent, "with the correct app component");
			assert.equal(oAppDescriptorCommand.getReference(), "appId", "with the correct reference");
			assert.equal(oAppDescriptorCommand.getChangeType(), mAppDescriptorChange.changeSpecificData.appDescriptorChangeType, "with the correct change type");
			assert.equal(oAppDescriptorCommand.getParameters(), mAppDescriptorChange.changeSpecificData.content.parameters, "with the correct parameters");
			assert.equal(oAppDescriptorCommand.getTexts(), mAppDescriptorChange.changeSpecificData.content.texts, "with the correct texts");

			done();
		});
		return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton });
	});

	QUnit.test("when the handle settings function is called and the handler returns a change object with an app descriptor change and a flex change,", function(assert) {
		var done = assert.async();
		var mAppDescriptorChange = {
			appComponent : oMockedAppComponent,
			changeSpecificData : {
				appDescriptorChangeType : "appDescriptorChangeType",
				content : {
					parameters : {
						param1 : "param1"
					},
					texts : {
						text1 : "text1"
					}
				}
			}
		};
		var mSettingsChange = {
			selectorControl : {
				id : "stableNavPopoverId",
				controlType : "sap.m.Button",
				appComponent : oMockedAppComponent
			},
			changeSpecificData : {
				changeType : "changeSettings",
				content : "testchange"
			}
		};

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : true,
								handler : function() {
									return new Promise(function(resolve, reject) {
										resolve([mAppDescriptorChange, mSettingsChange]);
									});
								}
							};
						}
					}
				}
			})
		});

		var aSelectedOverlays = [oButtonOverlay];

		this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.ok(oCompositeCommand, "Composite command is created");
			var oAppDescriptorCommand = oCompositeCommand.getCommands()[0];
			var oFlexCommand = oCompositeCommand.getCommands()[1];
			assert.ok(oAppDescriptorCommand instanceof AppDescriptorCommand, "... containing an AppDescriptorCommand");
			assert.equal(oAppDescriptorCommand.getAppComponent(), oMockedAppComponent, "with the correct app component");
			assert.equal(oAppDescriptorCommand.getReference(), "appId", "with the correct reference");
			assert.equal(oAppDescriptorCommand.getChangeType(), mAppDescriptorChange.changeSpecificData.appDescriptorChangeType, "with the correct change type");
			assert.equal(oAppDescriptorCommand.getParameters(), mAppDescriptorChange.changeSpecificData.content.parameters, "with the correct parameters");
			assert.equal(oAppDescriptorCommand.getTexts(), mAppDescriptorChange.changeSpecificData.content.texts, "with the correct texts");
			assert.ok(oFlexCommand instanceof SettingsCommand, "... and a (flex) SettingsCommand");
			assert.equal(oFlexCommand.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
			assert.equal(oFlexCommand.getChangeType(), mSettingsChange.changeSpecificData.changeType, "with the correct change type");
			assert.equal(oFlexCommand.getContent(), mSettingsChange.changeSpecificData.content, "with the correct parameters");
			done();
		});
		return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton });
	});

	QUnit.test("when retrieving the context menu item for single 'settings' action", function(assert) {
		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								handler : function() {}
							};
						}
					}
				}
			})
		});

		var bIsAvailable = true;
		sandbox.stub(this.oSettingsPlugin, "isAvailable", function(oOverlay){
			assert.equal(oOverlay, oButtonOverlay, "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		});
		sandbox.stub(this.oSettingsPlugin, "handler", function(aOverlays){
			assert.deepEqual(aOverlays, [oButtonOverlay], "the 'handler' method is called with the right overlays");
		});
		sandbox.stub(this.oSettingsPlugin, "isEnabled", function(oOverlay){
			assert.equal(oOverlay, oButtonOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
		});

		var aMenuItems = this.oSettingsPlugin.getMenuItems(oButtonOverlay);
		assert.equal(aMenuItems[0].id, "CTX_SETTINGS", "'getMenuItems' returns the context menu item for the plugin");

		aMenuItems[0].handler([oButtonOverlay]);
		aMenuItems[0].enabled(oButtonOverlay);

		bIsAvailable = false;
		assert.equal(this.oSettingsPlugin.getMenuItems(oButtonOverlay).length,
			0,
			"and if plugin is not available for the overlay, no menu items are returned");
	});

	QUnit.test("when retrieving the context menu items and executing two 'settings' actions", function(assert) {
		var done1 = assert.async();
		var done2 = assert.async();

		var mAction1Change = {
			selectorControl : this.oButton,
			changeSpecificData : {
				changeType : "changeSettings",
				content : "testchange1"
			}
		};

		var mAction2Change = {
			selectorControl : this.oButton,
			changeSpecificData : {
				changeType : "changeSettings",
				content : "testchange2"
			}
		};

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions :
					{
						settings : function(){
							return [{
								name : "CTX_ACTION1",
								handler: function(oElement, mPropertyBag) {
									return new Promise(function(resolve){
										resolve([mAction1Change]);
									});
								}
							},
							{
								name : function(){
									return "Action 2 Name";
								},
								handler: function(oElement, mPropertyBag) {
									return new Promise(function(resolve){
										resolve([mAction2Change]);
									});
								}
							}];
						}
					}
				}
			})
		});

		sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

		var bFirstChange = true;

		this.oSettingsPlugin.attachEvent("elementModified", function(oEvent) {
			if (bFirstChange){
				var oCompositeCommand1 = oEvent.getParameter("command");
				var oFlexCommand1 = oCompositeCommand1.getCommands()[0];
				assert.equal(oFlexCommand1.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
				assert.equal(oFlexCommand1.getChangeType(), mAction1Change.changeSpecificData.changeType, "with the correct change type");
				assert.equal(oFlexCommand1.getContent(), mAction1Change.changeSpecificData.content, "with the correct parameters");
				bFirstChange = false;
				done1();
			} else {
				var oCompositeCommand2 = oEvent.getParameter("command");
				var oFlexCommand2 = oCompositeCommand2.getCommands()[0];
				assert.equal(oFlexCommand2.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
				assert.equal(oFlexCommand2.getChangeType(), mAction2Change.changeSpecificData.changeType, "with the correct change type");
				assert.equal(oFlexCommand2.getContent(), mAction2Change.changeSpecificData.content, "with the correct parameters");
				done2();
			}

		});

		var aMenuItems = this.oSettingsPlugin.getMenuItems(oButtonOverlay);
		assert.equal(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
		assert.equal(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
		aMenuItems[0].handler([oButtonOverlay]);
		assert.equal(aMenuItems[1].id, "CTX_SETTINGS1", "'getMenuItems' returns the context menu item for action 2");
		assert.equal(aMenuItems[1].text, "Action 2 Name", "'getMenuItems' returns the correct item text for action 2");
		assert.equal(aMenuItems[1].rank, 111, "'getMenuItems' returns the correct item rank for action 2");
		aMenuItems[1].handler([oButtonOverlay]);
	});

	QUnit.test("when retrieving the context menu items for two 'settings' actions, but one does not have a handler", function(assert) {
		var done = assert.async();

		var mAction1Change = {
			selectorControl : this.oButton,
			changeSpecificData : {
				changeType : "changeSettings",
				content : "testchange1"
			}
		};

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								"CTX_ACTION1" : {
									name : "CTX_ACTION1",
									handler: function(oElement, mPropertyBag) {
										return new Promise(function(resolve){
											resolve([mAction1Change]);
										});
									}
								},
								"AnotherId" : {
									name : "CTX_ACTION2"
								}
							};
						}
					}
				}
			})
		});

		sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

		this.oSettingsPlugin.attachEvent("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.equal(oCompositeCommand.getCommands().length, 1, "but the action with the handler can still be executed");
			done();
		});

		var spyLog = sinon.spy(jQuery.sap.log, "warning");

		var aMenuItems = this.oSettingsPlugin.getMenuItems(oButtonOverlay);
		assert.equal(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
		assert.equal(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
		aMenuItems[0].handler([oButtonOverlay]);
		assert.equal(aMenuItems.length, 1, "'getMenuItems' only returns menu item for actions with handlers");
		assert.equal(spyLog.callCount, 1, "then there is a warning in the log saying the handler was not found for action 2");
	});

	QUnit.test("when retrieving the context menu items for two 'settings' actions, but one is disabled", function(assert) {
		var oButton = this.oButton;

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : {
							"Button Settings 1" : {
								name : function(){ return "CTX_ACTION1"; },
								handler: function(oElement, mPropertyBag) {
									return new Promise(function(resolve){
										resolve([]);
									});
								}
							},
							"Another Button Settings Action" : {
								name : function(){ return "CTX_ACTION2"; },
								handler: function(oElement, mPropertyBag) {
									return new Promise(function(resolve){
										resolve([]);
									});
								},
								isEnabled : function(oElement){
									assert.equal(oElement, oButton, "isEnabled is called with the correct element");
									return false;
								}
							}
						}
					}
				}
			})
		});

		sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

		var aMenuItems = this.oSettingsPlugin.getMenuItems(oButtonOverlay);
		assert.equal(aMenuItems[0].text, "CTX_ACTION1", "'getMenuItems' returns the context menu item for action 1");
		assert.equal(aMenuItems[0].enabled, undefined, "'getMenuItems' item for action 1 is undefined (hence default true will be used)");
		assert.equal(aMenuItems[1].text, "CTX_ACTION2", "'getMenuItems' returns the context menu item for action 2");
		assert.equal(aMenuItems[1].enabled(), false, "'getMenuItems' item for action 2 will be disabled");
	});

});
