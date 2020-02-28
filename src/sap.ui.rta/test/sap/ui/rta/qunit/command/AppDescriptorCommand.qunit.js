/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/Button",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Layer,
	FlUtils,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button,
	ManagedObject,
	sinon
) {
	'use strict';

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
			this.oFlUtilsStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
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
		}
	}, function () {
		QUnit.test("when calling command factory for a generic app descriptor change type ...", function(assert) {
			var done = assert.async();
			var fnAssertSpy = sinon.spy(ManagedObject.prototype, "applySettings");

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

			this.createDescriptorInlineChangeStub = sinon.stub(DescriptorInlineChangeFactory, "createDescriptorInlineChange").callsFake(function (sChangeType, mParameters, mTexts) {
				assert.equal(sChangeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' function");
				assert.equal(mParameters, this.mParameters, "parameters are properly passed to the 'createDescriptorInlineChange' function");
				assert.equal(mTexts, this.mTexts, "texts are properly passed to the 'createDescriptorInlineChange' function");
				this.createDescriptorInlineChangeStub.restore();
				return Promise.resolve(oMockDescriptorInlineChange);
			}.bind(this));

			this.createNewChangeStub = sinon.stub(DescriptorChangeFactory.prototype, "createNew").callsFake(function (sReference, oInlineChange, sLayer, oAppComponent) {
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
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
