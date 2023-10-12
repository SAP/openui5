/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Layer,
	AppVariantInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button,
	Lib,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	QUnit.module("Given a list of libraries that needs to be added to the app descriptor...", {
		before() {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);
		},
		after() {
			this.oMockedAppComponent._restoreGetAppComponentStub();
			this.oMockedAppComponent.destroy();
		},
		beforeEach() {
			this.sReference = "appReference";
			this.sLayer = Layer.CUSTOMER;
			this.sChangeType = "appdescr_ui5_addLibraries";

			this.mLibraries = {
				"sap.uxap": {
					minVersion: "1.44",
					lazy: "false"
				}
			};

			this.oButton = new Button("myButton");
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when calling command factory for AddLibrary ...", function(assert) {
			var done = assert.async();
			var oAddLibraryCommand;

			var oMockDescriptorChange = {
				store() {
					assert.ok(true, "the descriptor change was submitted");
					oAddLibraryCommand.execute()
					.then(function() {
						assert.ok(
							Lib.all()["sap.uxap"], "upon execution, 'sap.uxap' library is loaded");
						done();
					});
				}
			};

			var oMockAddLibraryInlineChange = {
				mockName: "mocked"
			};

			this.createDescriptorInlineChangeStub = sinon.stub(AppVariantInlineChangeFactory, "createDescriptorInlineChange").callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.changeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' method");
				assert.equal(mPropertyBag.content.libraries, this.mLibraries, "libraries are properly passed to the 'create_ui5_addLibraries' method");
				this.createDescriptorInlineChangeStub.restore();
				return Promise.resolve(oMockAddLibraryInlineChange);
			}.bind(this));

			this.createNewChangeStub = sinon.stub(DescriptorChangeFactory.prototype, "createNew").callsFake(function(sReference, oAddLibraryInlineChange, sLayer, oAppComponent) {
				assert.equal(sReference, this.sReference, "reference is properly passed to createNew method");
				assert.equal(oAddLibraryInlineChange.mockName, oMockAddLibraryInlineChange.mockName, "oAddLibraryInlineChange is properly passed to createNew method");
				assert.equal(sLayer, this.sLayer, "layer is properly passed to createNew method");
				assert.equal(oAppComponent, this.oMockedAppComponent, "app component is properly passed to createNew method");

				this.createNewChangeStub.restore();

				return Promise.resolve(oMockDescriptorChange);
			}.bind(this));

			return CommandFactory.getCommandFor(this.oButton, "addLibrary", {
				reference: this.sReference,
				parameters: { libraries: this.mLibraries },
				appComponent: this.oMockedAppComponent
			}, {}, {layer: this.sLayer})

			.then(function(oCommand) {
				oAddLibraryCommand = oCommand;
				assert.ok(oAddLibraryCommand, "addLibrary command exists for element");
				oAddLibraryCommand.createAndStoreChange();
			});
		});

		QUnit.test("when calling execute for AddLibrary ...", function(assert) {
			this.mLibraries = {
				"sap.uxap": {
					minVersion: "1.44",
					lazy: "false"
				},
				"i.dont.exist": {
					minVersion: "1.44",
					lazy: "true"
				}
			};

			return CommandFactory.getCommandFor(this.oButton, "addLibrary", {
				reference: this.sReference,
				parameters: { libraries: this.mLibraries }
			}, {}, {layer: this.sLayer})
			.then(function(oAddLibraryCommand) {
				assert.ok(oAddLibraryCommand, "addLibrary command exists for element");
				return oAddLibraryCommand.execute();
			})
			.catch(function(e) {
				assert.ok(e, `then trying to load a non-existing library causes the error ${e}`);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
