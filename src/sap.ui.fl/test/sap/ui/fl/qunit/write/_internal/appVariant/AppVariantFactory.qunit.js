/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	AppVariantFactory,
	WriteUtils,
	TransportSelection,
	Settings,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a AppVariantFactory for S4/Hana onPremise systems", {
		beforeEach : function() {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
		},
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When prepareUpdate is called one after another and backend responses are simulated differently", function(assert) {
			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves({response: '{ "id": "id.string", "reference":"base.id", "content": [] }'});
			fnNewConnectorCall.onSecondCall().resolves({response: '{ "id": "id.json", "reference":"base.id", "content": [] }'});
			fnNewConnectorCall.onThirdCall().resolves({response: '{ "id": "id.refVer", "reference":"base.id", "referenceVersion":"1.1", "content": [] }'});
			return AppVariantFactory.prepareUpdate({
				id: "id.string"
			}).then(function(oVariant) {
				assert.equal(oVariant.getDefinition().id, "id.string");
				assert.equal(oVariant.getDefinition().reference, "base.id");
				assert.ok(!oVariant.getDefinition().referenceVersion);
			}).then(function() {
				return AppVariantFactory.prepareUpdate({
					id: "id.json"
				});
			}).then(function(oVariant) {
				assert.equal(oVariant.getDefinition().id, "id.json");
				assert.equal(oVariant.getDefinition().reference, "base.id");
				assert.ok(!oVariant.getDefinition().referenceVersion);
			}).then(function() {
				return AppVariantFactory.prepareUpdate({
					id: "id.refVer"
				});
			}).then(function(oVariant) {
				assert.equal(oVariant.getDefinition().id, "id.refVer");
				assert.equal(oVariant.getDefinition().reference, "base.id");
				assert.equal(oVariant.getDefinition().referenceVersion, "1.1");
			});
		});

		QUnit.test("When prepareUpdate is called only once", function(assert) {
			sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference"
				})
			});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oVariant) {
				assert.notEqual(oVariant, null);
				assert.equal(oVariant.getDefinition().id, "a.id");
				assert.equal(oVariant.getDefinition().reference, "a.reference");
				assert.equal(oVariant.getMode(), "EXISTING");
			});
		});

		QUnit.test("When prepareUpdate is called and failure happens", function(assert) {
			sandbox.stub(WriteUtils, "sendRequest").rejects({message: "lalala"});

			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function() {
				assert.notOk("Should never succeed");
			}).catch(function(oError) {
				assert.ok(oError.message, "lalala");
			});
		});

		QUnit.test("When prepareUpdate is called and variant was saved as a local object", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "$TMP"
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: ""});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id?sap-language=en");
				assert.equal(JSON.parse(oNewConnectorStub.getCall(1).args[2].payload).packageName, "$TMP");
				assert.equal(JSON.parse(oNewConnectorStub.getCall(1).args[2].payload).reference, "a.reference");
				assert.equal(JSON.parse(oNewConnectorStub.getCall(1).args[2].payload).id, "a.id");
				assert.equal(JSON.parse(oNewConnectorStub.getCall(1).args[2].payload).layer, "CUSTOMER");
				assert.equal(oNewConnectorStub.getCall(1).args[1], "PUT");
			});
		});

		QUnit.test("When prepareUpdate is called and variant was already published", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER"
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id?changelist=aTransport&sap-language=en");
				assert.equal(oNewConnectorStub.getCall(1).args[1], "PUT");
			});
		});

		QUnit.test("When prepareDelete is called", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER"
				})
			});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oVariant) {
				assert.notEqual(oVariant, null);
				assert.equal(oVariant.getDefinition().id, "a.id");
				assert.equal(oVariant.getDefinition().reference, "a.reference");
				assert.equal(oNewConnectorStub.callCount, 1);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oVariant.getMode(), "DELETION");
			});
		});

		QUnit.test("Smart Business: When prepareDelete is called", function(assert) {
			return AppVariantFactory.prepareDelete({
				id: "a.id",
				isForSmartBusiness: true
			}).then(function(oVariant) {
				assert.notEqual(oVariant, null);
				assert.equal(oVariant.getDefinition().id, "a.id");
				assert.equal(oVariant.getMode(), "DELETION");
			});
		});

		QUnit.test("When prepareDelete is called to prepare a delete app variant config and submit is called to delete an app variant saved as local object", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: ""
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: ""});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(1).args[1], "DELETE");
			});
		});

		QUnit.test("When prepareDelete is called to prepare a delete app variant config and submit is called to delete a published app variant", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: ""
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id?changelist=aTransport");
				assert.equal(oNewConnectorStub.getCall(1).args[1], "DELETE");
			});
		});

		QUnit.test("Smart Business: When prepareDelete is called to prepare a delete app variant config and submit is called to delete a published app variant", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection");
			return AppVariantFactory.prepareDelete({
				id: "a.id",
				transport: "aTransport",
				isForSmartBusiness: true
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.notCalled);
				assert.equal(oResponse, undefined);
				assert.equal(oNewConnectorStub.callCount, 1);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id?changelist=aTransport");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "DELETE");
			});
		});

		QUnit.test("When prepareCreate is called and getting id of app variant is checked", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getId(), "a.id");
			});
		});

		QUnit.test("When prepareCreate is called and setting id of app variant is cross checked", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getReference(), "a.reference");
				oVariant.setReference("new.reference");
				assert.strictEqual(oVariant.getReference(), "new.reference");
			});
		});

		QUnit.test("When prepareCreate is called and setting incorrect id of app variant failed", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getReference(), "a.reference");
				oVariant.setReference(); // Setting reference with undefined value
			}).catch(function(sError) {
				assert.ok(sError);
			});
		});

		QUnit.test("When prepareCreate is called and getting id of reference app is checked", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getReference(), "a.reference");
			});
		});

		QUnit.test("When prepareCreate is called and getting version of an app variant is checked", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				version: "1.0.0"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getVersion(), "1.0.0");
			});
		});

		QUnit.test("When prepareCreate is called and namespace of an app variant is checked", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.strictEqual(oVariant.getNamespace(), "apps/a.reference/appVariants/a.id/");
			});
		});

		QUnit.test("When prepareCreate is called and setting transport is checked", function(assert) {
			var _oVariant;
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.setTransportRequest("TR12345");
			}).then(function() {
				assert.equal(_oVariant.getTransportRequest(), "TR12345");
			});
		});

		QUnit.test("When prepareCreate is called and setting transport has wrong format", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				return oVariant.setTransportRequest("WRONG_FORMAT");
			}).then(function() {
				assert.notOk("Should never succeed!");
			}).catch(function(sError) {
				assert.ok(sError);
			});
		});

		QUnit.test("When prepareCreate is called and setting package is checked", function(assert) {
			var _oVariant;
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.setPackage("/ABC/DEFGH_IJKL12345");
			}).then(function() {
				assert.equal(_oVariant.getPackage(), "/ABC/DEFGH_IJKL12345");
			});
		});

		QUnit.test("When prepareCreate is called and setting package has wrong format", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				return oVariant.setPackage("SomePackage_WrongFormat");
			}).then(function() {
				assert.notOk("Should never succeed!");
			}).catch(function(sError) {
				assert.ok(sError);
			});
		});

		QUnit.test("When prepareCreate is called and setting layer to customer", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				layer: Layer.CUSTOMER
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().layer, "CUSTOMER");
			});
		});

		QUnit.test("When prepareCreate is called and setting layer to customer", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				layer: Layer.CUSTOMER_BASE
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().layer, "CUSTOMER_BASE");
			});
		});

		QUnit.test("When prepareCreate is called and setting layer to partner", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				layer: Layer.PARTNER
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().layer, "PARTNER");
			});
		});

		QUnit.test("When prepareCreate is called and setting layer to vendor", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				layer: Layer.VENDOR
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().layer, "VENDOR");
			});
		});

		QUnit.test("When prepareCreate is called, variant saved into backend and checking app variant properties", function(assert) {
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				assert.notEqual(oVariant, null);
				assert.equal(oVariant.getId(), "a.id");
				assert.equal(oVariant.getReference(), "a.reference");
				assert.equal(oVariant.getMode(), "NEW");
				assert.equal(oVariant._getMap().layer, Layer.CUSTOMER);
				assert.equal(oVariant._getMap().fileType, "appdescr_variant");
			});
		});

		QUnit.test("When prepareCreate is called and failed with different possible failure options", function(assert) {
			return AppVariantFactory.prepareCreate({})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.prepareCreate({
						id : "a.id"
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.prepareCreate({
						reference : "a.reference"
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.createNew({
						id : 1,
						reference: "a.reference"
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.createNew({
						id : "a.id",
						reference: 1
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.createNew({
						id : "a.id",
						reference: "a.reference",
						version: 2
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				})
				.then(function() {
					return AppVariantFactory.createNew({
						id : "a.id",
						reference: "a.reference",
						layer: true
					});
				})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function(sError) {
					assert.ok(sError);
				});
		});

		QUnit.test("When prepareCreate is called and app variant is submitted", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oAppVariant) {
				return oAppVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/?sap-language=en");
			});
		});

		QUnit.test("When prepareCreate is called with referenceVersion and app variant is submitted", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				referenceVersion: "1.1"
			}).then(function(oAppVariant) {
				return oAppVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/?sap-language=en");
				assert.equal(JSON.parse(oNewConnectorStub.getCall(0).args[2].payload).referenceVersion, "1.1");
			});
		});

		QUnit.test("When prepareUpdate is called with referenceVersion and app variant is submitted as a local object", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: ""});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oAppVariant) {
				return oAppVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id?sap-language=en");
			});
		});

		QUnit.test("When prepareUpdate is called and app variant is submitted which is already published", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oAppVariant) {
				return oAppVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id?changelist=aTransport&sap-language=en");
			});
		});

		QUnit.test("When prepareDelete is called and app variant is deleted which was saved as a local object", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: ""});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oAppVariant) {
				return oAppVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/a.id');
			});
		});

		QUnit.test("When prepareDelete is called and app variant is deleted which was already published", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: Layer.CUSTOMER
				})
			});
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: "aTransport"});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id?changelist=aTransport');
			});
		});
	});

	QUnit.module("Given a AppVariantFactory for S4/Hana Cloud systems", {
		beforeEach : function() {
			//define sandboxes and stubs explicitly for each modules
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When prepareCreate is called and variant is saved into the backend", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "YY1_DEFAULT_123"
				})
			});
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/?sap-language=en');
			});
		});

		QUnit.test("SmartBusiness: When prepareCreate is called and variant is saved into the backend", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "YY1_DEFAULT_123"
				})
			});
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference",
				transport: "ATO_NOTIFICATION"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&sap-language=en');
			});
		});

		QUnit.test("Smart Business: When prepareUpdate is called and variant was already published", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "YY1_DEFAULT_123"
				})
			});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id?changelist=ATO_NOTIFICATION&sap-language=en');
			});
		});

		QUnit.test("Smart Business: When prepareUpdate is called and variant was already published", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "YY1_DEFAULT_123"
				})
			});
			return AppVariantFactory.prepareUpdate({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id?changelist=ATO_NOTIFICATION&sap-language=en');
			});
		});

		QUnit.test("When prepareDelete is called to prepare a delete app variant config and submit is called to delete an app variant saved as local object", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER"
				})
			});
			var oSpyOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection").resolves({transport: ""});
			return AppVariantFactory.prepareDelete({
				id: "a.id"
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oSpyOpenTransportSelection.calledOnce);
				assert.notEqual(oResponse, null);
				assert.equal(oNewConnectorStub.callCount, 2);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "GET");
				assert.equal(oNewConnectorStub.getCall(1).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
				assert.equal(oNewConnectorStub.getCall(1).args[1], "DELETE");
			});
		});

		QUnit.test("Smart Business: When prepareDelete is called to prepare a delete app variant config and submit is called to delete a published app variant", function(assert) {
			var oNewConnectorStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			var oStubOpenTransportSelection = sandbox.stub(TransportSelection.prototype, "openTransportSelection");
			return AppVariantFactory.prepareDelete({
				id: "a.id",
				transport: "ATO_NOTIFICATION",
				skipIam: true,
				isForSmartBusiness: true
			}).then(function(oVariant) {
				return oVariant.submit();
			}).then(function(oResponse) {
				assert.ok(oStubOpenTransportSelection.notCalled);
				assert.equal(oResponse, undefined);
				assert.equal(oNewConnectorStub.callCount, 1);
				assert.equal(oNewConnectorStub.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id?changelist=ATO_NOTIFICATION");
				assert.equal(oNewConnectorStub.getCall(0).args[1], "DELETE");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});