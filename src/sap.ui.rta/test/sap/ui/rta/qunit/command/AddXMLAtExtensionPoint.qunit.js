/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/rta/command/AddXMLAtExtensionPoint",
	"sap/ui/fl/Change",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/thirdparty/sinon-4"
],
function (
	CommandFactory,
	AddXMLAtExtensionPoint,
	AddXMLAtExtensionPointCommand,
	Change,
	ChangesController,
	FlexController,
	Layer,
	Utils,
	LayerUtils,
	ElementDesignTimeMetadata,
	sinon
) {
	"use strict";

	var oMockedAppComponent = {
		getId: function () {
			return 'testcomponent';
		},
		getLocalId: function () {},
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
		},
		getModel: function () {},
		createId : function(sId) {
			return 'testcomponent---' + sId;
		}
	};
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AddXMLAtExtensionPoint command with a valid entry in the change registry,", {
		beforeEach : function() {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);
			var oXmlString =
				'<mvc:View id="testapp---view" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<HBox id="hbox">' +
						'<items>' +
							'<core:ExtensionPoint name="ExtensionPoint1" />' +
							'<Label id="label" text="TestLabel" />' +
						'</items>' +
					'</HBox>' +
					'<Panel id="panel">' +
						'<content>' +
							'<core:ExtensionPoint name="ExtensionPoint2" />' +
						'</content>' +
					'</Panel>' +
				'</mvc:View>';
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			return sap.ui.core.mvc.XMLView.create({id: "testapp---view", definition: oXmlString})
				.then(function(oXMLView) {
					this.oXMLView = oXMLView;
					this.mExtensionPointReference = {
						name: "ExtensionPoint1",
						view: this.oXMLView
					};
				}.bind(this));
		},
		afterEach : function() {
			this.oXMLView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an AddXMLAtExtensionPoint command for the change ...", function(assert) {
			var sPath = "abc.test";
			var sFragment = "fragment";
			var oApplyChangeStub = sandbox.stub(AddXMLAtExtensionPoint, "applyChange");
			var oCompleteChangeContentSpy = sandbox.spy(AddXMLAtExtensionPoint, "completeChangeContent");
			sandbox.stub(Change.prototype, "getModuleName").returns(sPath);
			sandbox.stub(ChangesController, "getAppComponentForSelector").returns(oMockedAppComponent);
			sandbox.stub(FlexController.prototype, "checkForOpenDependenciesForControl").returns(false);
			var oPreloadSpy = sandbox.spy(sap.ui.require, "preload");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			});

			return oCommandFactory.getCommandFor(this.mExtensionPointReference, "addXMLAtExtensionPoint", {
				fragmentPath: "pathToFragment",
				fragment: sFragment
			})

			.then(function(oAddXMLAtExtensionPointCommand) {
				assert.ok(oAddXMLAtExtensionPointCommand instanceof AddXMLAtExtensionPointCommand, "then command without flex settings is available");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragment(), sFragment, "and its settings are merged correctly");
			})

			.then(function() {
				oCommandFactory.setFlexSettings({
					layer: Layer.VENDOR,
					developerMode: true
				});
				return oCommandFactory.getCommandFor(this.mExtensionPointReference, "addXMLAtExtensionPoint", {
					fragmentPath: "pathToFragment",
					fragment: sFragment
				});
			}.bind(this))

			.then(function(oAddXMLAtExtensionPointCommand) {
				assert.ok(oAddXMLAtExtensionPointCommand, "then command with flex settings is available");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragment(), sFragment, "and its settings are merged correctly");
				oCommandFactory.setFlexSettings({
					layer: Layer.VENDOR,
					developerMode: false
				});
				assert.notOk(oAddXMLAtExtensionPointCommand._oPreparedChange.getDefinition().content.fragment, "after preparing, the fragment content is not yet in the change");
				return oAddXMLAtExtensionPointCommand.execute()

				.then(function() { return oAddXMLAtExtensionPointCommand; });
			})

			.then(function(oAddXMLAtExtensionPointCommand) {
				assert.equal(oCompleteChangeContentSpy.callCount, 2, "then completeChangeContent is called twice");
				assert.equal(oApplyChangeStub.callCount, 1, "then applyChange is called once");
				assert.notOk(oAddXMLAtExtensionPointCommand._oPreparedChange.getDefinition().content.fragment, "after applying, the fragment content is not in the change anymore");
				assert.ok(oPreloadSpy.lastCall.args[0][sPath], "the preload was called with the correct object");
				assert.equal(oPreloadSpy.lastCall.args[0][sPath], sFragment, "the preload was called with the correct object");
			})

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("When addXMLAtExtensionPoint is created with a fragment string containing a binding", function(assert) {
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			});

			return oCommandFactory.getCommandFor(this.mExtensionPointReference, "addXMLAtExtensionPoint", {
				fragmentPath: "pathToFragment",
				fragment: "{@i18n>Foo}"
			})

			.then(function(oAddXMLAtExtensionPointCommand) {
				assert.ok(oAddXMLAtExtensionPointCommand, "then command without flex settings is available");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXMLAtExtensionPointCommand.getFragment(), "{@i18n>Foo}", "and its settings are merged correctly");
			});
		});

		QUnit.test("and design time metadata allows change on js only, when getting an AddXMLAtExtensionPoint command for the change ...", function(assert) {
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR,
					developerMode: true
				}
			});

			return oCommandFactory.getCommandFor(this.mExtensionPointReference, "addXMLAtExtensionPoint", {
				fragmentPath: "pathToFragment",
				fragment: "fragment"
			}, new ElementDesignTimeMetadata({
				data : {
					actions : {
						addXMLAtExtensionPoint : {
							jsOnly : true
						}
					}
				}
			}))

			.then(function(oAddXMLAtExtensionPointCommand) {
				var oChange = oAddXMLAtExtensionPointCommand.getPreparedChange();
				assert.strictEqual(oChange.getDefinition().jsOnly, true, "then change is marked to be applied on js only");
			})

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
