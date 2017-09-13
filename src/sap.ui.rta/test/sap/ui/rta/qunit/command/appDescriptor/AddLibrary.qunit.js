/* global QUnit sinon */

QUnit.config.autostart = false;

sap.ui.require([
	//internal
	'sap/ui/fl/Utils',
	'sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory',
	'sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory',
	'sap/ui/rta/command/CommandFactory',
	'sap/m/Button'
],
function(
	Utils,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button
) {
	'use strict';

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
					}
				}
			};
		}
	};

	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.module("Given a list of libraries that needs to be added to the app descriptor...", {
		beforeEach : function(assert) {

			this.sReference = "appReference";
			this.sLayer = "CUSTOMER";
			this.sChangeType = "appdescr_ui5_addLibraries";

			this.mLibraries = {
				"sap.uxap": {
					"minVersion": "1.44",
					"lazy": "false"
				}
			};

			this.oButton = new Button("myButton");

		},
		afterEach : function(assert) {
			this.oButton.destroy();
		}
	});

	QUnit.test("when calling command factory for AddLibrary ...", function(assert) {
		var done = assert.async();
		var oAddLibraryCommand;

		var oMockDescriptorChange = {
			store : function() {
				assert.ok(true, "the descriptor change was submitted");
				oAddLibraryCommand.execute().then(function() {
					assert.ok(sap.uxap, "upon execution, 'sap.uxap' library is loaded");
					done();
				});
			}
		};

		var oMockAddLibraryInlineChange = {
			"mockName" : "mocked"
		};

		this.createDescriptorInlineChangeStub = sinon.stub(DescriptorInlineChangeFactory, "createDescriptorInlineChange", function(sChangeType, mParameters){
			assert.equal(sChangeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' method");
			assert.equal(mParameters.libraries, this.mLibraries, "libraries are properly passed to the 'create_ui5_addLibraries' method");
			this.createDescriptorInlineChangeStub.restore();
			return Promise.resolve(oMockAddLibraryInlineChange);
		}.bind(this));

		this.createNewChangeStub = sinon.stub(DescriptorChangeFactory.prototype, "createNew", function(sReference, oAddLibraryInlineChange, sLayer, oAppComponent){
			assert.equal(sReference, this.sReference, "reference is properly passed to createNew method");
			assert.equal(oAddLibraryInlineChange.mockName, oMockAddLibraryInlineChange.mockName, "oAddLibraryInlineChange is properly passed to createNew method");
			assert.equal(sLayer, this.sLayer, "layer is properly passed to createNew method");
			assert.equal(oAppComponent, oMockedAppComponent, "app component is properly passed to createNew method");

			this.createNewChangeStub.restore();

			return Promise.resolve(oMockDescriptorChange);
		}.bind(this));

		oAddLibraryCommand = CommandFactory.getCommandFor(this.oButton, "addLibrary", {
			reference : this.sReference,
			parameters : { libraries : this.mLibraries },
			appComponent : oMockedAppComponent
		}, {}, {"layer" : this.sLayer});

		assert.ok(oAddLibraryCommand, "addLibrary command exists for element");
		oAddLibraryCommand.createAndStoreChange();
	});

	QUnit.test("when calling execute for AddLibrary ...", function(assert) {
		var done = assert.async();

		this.mLibraries = {
			"sap.uxap": {
				"minVersion": "1.44",
				"lazy": "false"
				},
			"i.dont.exist": {
				"minVersion": "1.44",
				"lazy": "true"
				}
		};

		var oAddLibraryCommand = CommandFactory.getCommandFor(this.oButton, "addLibrary", {
			reference : this.sReference,
			parameters : { libraries : this.mLibraries }
		}, {}, {"layer" : this.sLayer});

		assert.ok(oAddLibraryCommand, "addLibrary command exists for element");

		oAddLibraryCommand.execute().catch(function(e){
			assert.ok(e, "then trying to load a non-existing library causes the error " + e);
			done();
		});
	});

});
