jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.ElementOverlay");
jQuery.sap.require("sap.ui.dt.ElementDesignTimeMetadata");

jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
jQuery.sap.require("sap.ui.fl.changeHandler.PropertyChange");

jQuery.sap.require("sap.ui.rta.command.Settings");
jQuery.sap.require("sap.ui.rta.plugin.Settings");
jQuery.sap.require("sap.ui.rta.command.Stack");

(function() {
	"use strict";

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
					}
				}
			};
		}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	sinon.stub(sap.ui.fl.changeHandler.PropertyChange, "completeChangeContent");

	QUnit.module("Given a designTime and settings plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
				"changeSettings" : "sap/ui/fl/changeHandler/PropertyChange"
				}
			});

			this.oCommandStack = new sap.ui.rta.command.Stack();
			this.oSettingsPlugin = new sap.ui.rta.plugin.Settings({
				commandFactory : new sap.ui.rta.command.CommandFactory(),
				commandStack : this.oCommandStack
			});

			this.oButton = new sap.m.Button("button", {text : "Button"});

			this.oVerticalLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oButton]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
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

		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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

		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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
		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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
		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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

		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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
			var oSettingsCommand = oEvent.getParameter("command");
			assert.ok(oSettingsCommand, "... command is created");
			done();
		});
		return this.oSettingsPlugin.handleSettings(aSelectedOverlays);
	});

	QUnit.test("when the handle settings function is called and the handler returns a rejected promise with error object,", function(assert) {
		var that = this;

		var oButtonOverlay = new sap.ui.dt.ElementOverlay({
			element : this.oButton,
			designTimeMetadata : new sap.ui.dt.ElementDesignTimeMetadata({
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
		var oSettingsCmd1 = new sap.ui.rta.command.Settings({
			selector : {
				id : "stableNavPopoverId",
				controlType : "sap.m.Button",
				appComponent : oMockedAppComponent
			},
			changeType : "changeSettings",
			content : "testchange1"
		});

		var oSettingsCmd2 = new sap.ui.rta.command.Settings({
			selector : {
				id : "stableNavPopoverId",
				controlType : "sap.m.Button",
				appComponent : oMockedAppComponent
			},
			changeType : "changeSettings",
			content : "testchange2"
		});

		oSettingsCmd1.prepare();
		oSettingsCmd2.prepare();
		this.oCommandStack.pushAndExecute(oSettingsCmd1);
		this.oCommandStack.pushAndExecute(oSettingsCmd2);

		var aUnsavedChanges = this.oSettingsPlugin._getUnsavedChanges("stableNavPopoverId", ["changeSettings"]);
		assert.equal(aUnsavedChanges.length, 2, "these commands are returned by _getUnsavedChanges");
	});

})();
