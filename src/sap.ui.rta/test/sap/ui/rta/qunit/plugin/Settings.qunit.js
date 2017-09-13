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

	QUnit.module("Given a designTime and settings plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

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

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout],
				plugins : [this.oSettingsPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				done();
			});

		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no settings action designTime metadata", function(assert) {

		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {}
				}
			})
		});
		this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
		this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

		assert.strictEqual(this.oSettingsPlugin.isSettingsAvailable(oButtonOverlay), false, "... then isSettingsAvailable is called, then it returns false");
		assert.strictEqual(this.oSettingsPlugin.isSettingsEnabled(oButtonOverlay), false, "... then isSettingsEnabled is called, then it returns false");
		assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), false, "then the overlay is not editable");
	});

	QUnit.test("when an overlay has settings action designTime metadata, but has no isEnabled property defined", function(assert) {

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
		this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
		this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

		assert.strictEqual(this.oSettingsPlugin.isSettingsAvailable(oButtonOverlay), true, "... then isSettingsAvailable is called, then it returns true");
		assert.strictEqual(this.oSettingsPlugin.isSettingsEnabled(oButtonOverlay), true, "... then isSettingsEnabled is called, then it returns true");
		assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has settings action designTime metadata, and isEnabled property is boolean", function(assert) {
		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
					actions : {
						settings : function() {
							return {
								isEnabled : false,
								handler : function() {}
							};
						}
					}
				}
			})
		});
		this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
		this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

		assert.strictEqual(this.oSettingsPlugin.isSettingsAvailable(oButtonOverlay), true, "... then isSettingsAvailable is called, then it returns true");
		assert.strictEqual(this.oSettingsPlugin.isSettingsEnabled(oButtonOverlay), false, "... then isSettingsEnabled is called, then it returns correct value");
		assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has settings action designTime metadata, and isEnabled is function", function(assert) {
		var oButtonOverlay = new ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new ElementDesignTimeMetadata({
				libraryName : "sap.m",
				data : {
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
			})
		});
		this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
		this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

		assert.strictEqual(this.oSettingsPlugin.isSettingsAvailable(oButtonOverlay), false, "... then isSettingsAvailable is called, then it returns false");
		assert.strictEqual(this.oSettingsPlugin.isSettingsEnabled(oButtonOverlay), false, "... then isSettingsEnabled is called, then it returns correct value from function call");
		assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), false, "then the overlay is not editable because the handler is missing");
	});

	QUnit.test("when the handle settings function is called and the handler returns a change object,", function(assert) {
		var done = assert.async();
		var oSettingsChange = {
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
		return this.oSettingsPlugin.handleSettings(aSelectedOverlays);
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

		return this.oSettingsPlugin.handleSettings(aSelectedOverlays).catch(function() {
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
		return this.oSettingsPlugin.handleSettings(aSelectedOverlays);
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
		return this.oSettingsPlugin.handleSettings(aSelectedOverlays);
	});

});
