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

	QUnit.module("Given the parameters required to create an app descriptor change...", {
		beforeEach : function(assert) {

			this.sReference = "appReference";
			this.mFlexSettings = {
				layer : "CUSTOMER"
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
					"type": "XTIT",
					"maxLength": 20,
					"comment": "example",
					"value": {
						"": "Category example default text",
						"en": "Category example text in en",
						"de": "Kategorie Beispieltext in de"
					}
				}
			};

			this.oButton = new Button("myButton");

		},
		afterEach : function(assert) {
			this.oButton.destroy();
		}
	});

	QUnit.test("when calling command factory for a generic app descriptor change type ...", function(assert) {
		var done = assert.async();

		var oMockDescriptorChange = {
			store : function() {
				assert.ok(true, "the descriptor change was submitted");
				done();
			}
		};

		var oMockDescriptorInlineChange = {
			"mockName" : "mocked"
		};

		this.createDescriptorInlineChangeStub = sinon.stub(DescriptorInlineChangeFactory, "createDescriptorInlineChange", function(sChangeType, mParameters, mTexts){
			assert.equal(sChangeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' function");
			assert.equal(mParameters, this.mParameters, "parameters are properly passed to the 'createDescriptorInlineChange' function");
			assert.equal(mTexts, this.mTexts, "texts are properly passed to the 'createDescriptorInlineChange' function");
			this.createDescriptorInlineChangeStub.restore();
			return Promise.resolve(oMockDescriptorInlineChange);
		}.bind(this));

		this.createNewChangeStub = sinon.stub(DescriptorChangeFactory.prototype, "createNew", function(sReference, oInlineChange, sLayer, oAppComponent){
			assert.equal(sReference, this.sReference, "reference is properly passed to createNew function");
			assert.equal(oInlineChange.mockName, oMockDescriptorInlineChange.mockName, "Inline Change is properly passed to createNew function");
			assert.equal(sLayer, this.sLayer, "layer is properly passed to createNew function");
			assert.equal(oAppComponent, oMockedAppComponent, "App Component is properly passed to createNew function");

			this.createNewChangeStub.restore();

			return Promise.resolve(oMockDescriptorChange);
		}.bind(this));

		this.oAppDescriptorCommand = CommandFactory.getCommandFor(this.oButton, "appDescriptor", {
			reference : this.sReference,
			parameters : this.mParameters,
			texts : this.mTexts,
			changeType : this.sChangeType,
			appComponent : oMockedAppComponent
		}, {}, {"layer" : this.sLayer});

		assert.ok(this.oAppDescriptorCommand, "App Descriptor command exists for element");

		this.oAppDescriptorCommand.createAndStoreChange();
	});

});
