/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/Button",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Layer,
	FlUtils,
	AppVariantInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button,
	ManagedObject,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();
	QUnit.module("Given the parameters required to create an app descriptor change...", {
		before: function () {
			this.oMockedAppComponent = {
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
				}
			};
			this.oFlUtilsStub = sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
			this.sLayer = Layer.CUSTOMER;
		},
		after: function () {
			this.oFlUtilsStub.restore();
		},
		beforeEach: function () {
			this.sReference = "appReference";
			this.mFlexSettings = {
				layer : Layer.CUSTOMER
			};
			this.sChangeType = "dummyChangeType";

			this.mParameters = {
				dataSource : {
					source1 : {
						uri : "/sap/opu/odata/snce/PO_S_SRV;v=2/"
					}
				}
			};

			this.mTexts = {
				"customer.newid_sap.ovp.cards.customer.fancy_card.settings.category": {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de"
					}
				}
			};

			this.oButton = new Button("myButton");
		},
		afterEach: function () {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for a generic app descriptor change type ...", function(assert) {
			var done = assert.async();
			var fnAssertSpy = sandbox.spy(ManagedObject.prototype, "applySettings");

			var oMockDescriptorInlineChange = {
				mockName : "mocked"
			};

			var oMockDescriptorChange = {
				store : function() {
					assert.ok(true, "the descriptor change was submitted");
					var mPassedSettings = fnAssertSpy.getCall(0).args[0];
					var bHasSelector = Object.keys(mPassedSettings).some(function(sKey) {
						return sKey === "selector";
					});
					assert.notOk(bHasSelector, "the selector is not part of the passed settings");
					fnAssertSpy.restore();
					done();
				}
			};

			this.createDescriptorInlineChangeStub = sandbox.stub(AppVariantInlineChangeFactory, "createDescriptorInlineChange").callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.changeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' function");
				assert.equal(mPropertyBag.content, this.mParameters, "parameters are properly passed to the 'createDescriptorInlineChange' function");
				assert.equal(mPropertyBag.texts, this.mTexts, "texts are properly passed to the 'createDescriptorInlineChange' function");
				this.createDescriptorInlineChangeStub.restore();
				return Promise.resolve(oMockDescriptorInlineChange);
			}.bind(this));

			this.createNewChangeStub = sandbox.stub(DescriptorChangeFactory.prototype, "createNew").callsFake(function (sReference, oInlineChange, sLayer, oAppComponent) {
				assert.equal(sReference, this.sReference, "reference is properly passed to createNew function");
				assert.equal(oInlineChange.mockName, oMockDescriptorInlineChange.mockName, "Inline Change is properly passed to createNew function");
				assert.equal(sLayer, this.sLayer, "layer is properly passed to createNew function");
				assert.equal(oAppComponent, this.oMockedAppComponent, "App Component is properly passed to createNew function");

				this.createNewChangeStub.restore();

				return Promise.resolve(oMockDescriptorChange);
			}.bind(this));

			return CommandFactory.getCommandFor(this.oButton, "appDescriptor", {
				reference : this.sReference,
				parameters : this.mParameters,
				texts : this.mTexts,
				changeType : this.sChangeType,
				appComponent : this.oMockedAppComponent
			}, {}, {layer : this.sLayer})

			.then(function(oAppDescriptorCommand) {
				assert.ok(oAppDescriptorCommand, "App Descriptor command exists for element");
				assert.ok(oAppDescriptorCommand.needsReload, "App Descriptor commands need restart to be applied");
				oAppDescriptorCommand.createAndStoreChange();
			})

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when calling command factory for 'appdescr_ui5_setFlexExtensionPointEnabled' app descriptor change type ...", function(assert) {
			var createDescriptorInlineChangeSpy = sandbox.spy(AppVariantInlineChangeFactory, "createDescriptorInlineChange");
			var createNewChangeSpy = sandbox.spy(DescriptorChangeFactory.prototype, "createNew");
			var oAppDescriptorCommand;
			var mParameters = { flexExtensionPointEnabled: true };
			var mTexts = {};
			var sChangeType = "appdescr_ui5_setFlexExtensionPointEnabled";

			return CommandFactory.getCommandFor(this.oButton, "appDescriptor", {
				reference: this.sReference,
				parameters: mParameters,
				texts: mTexts,
				changeType: sChangeType,
				appComponent: this.oMockedAppComponent
			}, {}, {layer: this.sLayer})

			.then(function(_appDescriptorCommand) {
				oAppDescriptorCommand = _appDescriptorCommand;
				assert.ok(oAppDescriptorCommand, "App Descriptor command exists for element");
				assert.ok(oAppDescriptorCommand.needsReload, "App Descriptor commands need restart to be applied");
				return oAppDescriptorCommand.createAndStoreChange();
			})

			.then(function () {
				assert.equal(createDescriptorInlineChangeSpy.getCall(0).args[0].changeType, sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' function");
				assert.deepEqual(createDescriptorInlineChangeSpy.getCall(0).args[0].content, mParameters, "parameters are properly passed to the 'createDescriptorInlineChange' function");
				assert.deepEqual(createDescriptorInlineChangeSpy.getCall(0).args[0].texts, mTexts, "texts are properly passed to the 'createDescriptorInlineChange' function");
				assert.equal(createNewChangeSpy.getCall(0).args[0], this.sReference, "reference is properly passed to createNew function");
				assert.equal(createNewChangeSpy.getCall(0).args[2], this.sLayer, "layer is properly passed to createNew function");
				assert.equal(createNewChangeSpy.getCall(0).args[3], this.oMockedAppComponent, "App Component is properly passed to createNew function");
				var oChangeDefinition = oAppDescriptorCommand.getPreparedChange().getDefinition();
				assert.ok(oChangeDefinition.appDescriptorChange, "appDescriptorChange flag is properly set to the change created by the command");
				assert.equal(oChangeDefinition.changeType, sChangeType, "change type is properly set to the change created by the command");
				assert.deepEqual(oChangeDefinition.content, mParameters, "parameters are properly set to the change created by the command");
				assert.deepEqual(oChangeDefinition.texts, mTexts, "texts are properly set to the change created by the command");
				assert.equal(oChangeDefinition.reference, this.sReference, "reference is properly set to the change created by the command");
				assert.equal(oChangeDefinition.layer, this.sLayer, "layer is properly set to the change created by the command");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
