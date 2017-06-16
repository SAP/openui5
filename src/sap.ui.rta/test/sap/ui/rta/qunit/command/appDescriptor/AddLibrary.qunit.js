/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([
	//internal
	'sap/ui/fl/Utils',
	'sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory',
	'sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory',
	'sap/ui/rta/command/CommandFactory',
	'sap/m/Button',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Utils,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button
) {
	'use strict';

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

			this.mLibraries = {
			    "my.new.library": {
			        "minVersion": "1.44",
			        "lazy": "false"
			    },
			    "my.2nd.new.library": {
			        "minVersion": "1.44",
			        "lazy": "true"
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

		var oMockDescriptorChange = {
			submit : function() {
				assert.ok(true, "the descriptor change was submitted");
				done();
			}
		};

		var oMockAddLibraryInlineChange = {
			"mockName" : "mocked"
		};

		sinon.stub(DescriptorInlineChangeFactory, "create_ui5_addLibraries", function(mParameters){
			assert.equal(mParameters.libraries, this.mLibraries, "libraries are properly passed to the 'create_ui5_addLibraries' function");
			return Promise.resolve(oMockAddLibraryInlineChange);
		}.bind(this));
		sinon.stub(DescriptorChangeFactory.prototype, "createNew", function(sReference, oAddLibraryInlineChange, sLayer){
			assert.equal(sReference, this.sReference, "reference is properly passed to createNew function");
			assert.equal(oAddLibraryInlineChange.mockName, oMockAddLibraryInlineChange.mockName, "oAddLibraryInlineChange is properly passed to createNew function");
			assert.equal(sLayer, this.sLayer, "layer is properly passed to createNew function");

			return Promise.resolve(oMockDescriptorChange);
		}.bind(this));

		var oAddLibraryCommand = CommandFactory.getCommandFor(this.oButton, "addLibrary", {
			reference : this.sReference,
			requiredLibraries : this.mLibraries
		}, {}, {"layer" : this.sLayer});

		assert.ok(oAddLibraryCommand, "addLibrary command exists for element");
		oAddLibraryCommand.submit();
	});

});
