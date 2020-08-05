/*global QUnit */
sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/util/DraftEnabledMockServer",
	"jquery.sap.sjax"
], function(isEmptyObject, MockServer, DraftEnabledMockServer, jQuery) {
	"use strict";

	QUnit.module("sap/ui/core/util/DraftEnabledMockServer");

	QUnit.test("mock data generation", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice/"
		});
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/draft/metadata.xml";
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();

		assert.ok(oMockServer.isStarted(), "Mock server is started");

		var oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 100);
		var oActiveSalesOrder = oResponse.data.d.results[0];
		assert.ok(oActiveSalesOrder.IsActiveEntity);
		assert.ok(!oActiveSalesOrder.HasActiveEntity);
		assert.ok(!oActiveSalesOrder.HasDraftEntity);
		assert.equal(oActiveSalesOrder.SalesOrderDraftUUID, "00000000-0000-0000-0000-000000000000");
		var sSiblingUri = oActiveSalesOrder.SiblingEntity.__deferred.uri;
		var sItemUri = oActiveSalesOrder.Item.__deferred.uri;
		//  no “sibling” is related
		oResponse = jQuery.sap.sjax({
			url: sSiblingUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(isEmptyObject(oResponse.data.d));

		// navigate to draft nodes
		oResponse = jQuery.sap.sjax({
			url: sItemUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 1);
		var oActiveSalesOrderItem = oResponse.data.d.results[0];
		assert.ok(oActiveSalesOrderItem.IsActiveEntity);
		assert.equal(oActiveSalesOrderItem.SalesOrderDraftUUID, "00000000-0000-0000-0000-000000000000");
		assert.equal(oActiveSalesOrderItem.SalesOrderItemDraftUUID, "00000000-0000-0000-0000-000000000000");

		// All new drafts - $filter=not IsActiveEntity and not HasActiveEntity
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq false and HasActiveEntity eq false",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 25);
		sSiblingUri = oResponse.data.d.results[0].SiblingEntity.__deferred.uri;
		//  no “sibling” is related
		oResponse = jQuery.sap.sjax({
			url: sSiblingUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(isEmptyObject(oResponse.data.d));

		// All active documents - $filter=IsActiveEntity
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq true",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 50);

		// All edit drafts - $filter=not IsActiveEntity and HasActiveEntity
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq false and HasActiveEntity eq true",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 25);
		//  for edit draft the SiblingEntity points to the active document
		var sActiveSiblingUri = oResponse.data.d.results[0].SiblingEntity.__deferred.uri;
		var sId = oResponse.data.d.results[0].ActiveSalesOrderID;
		var sDraftId = oResponse.data.d.results[0].SalesOrderDraftUUID;
		oResponse = jQuery.sap.sjax({
			url: sActiveSiblingUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(oResponse.data.d.IsActiveEntity);
		assert.equal(oResponse.data.d.ActiveSalesOrderID, sId);
		assert.notEqual(oResponse.data.d.SalesOrderDraftUUID, sDraftId);
		// in active documents that have a draft the navigation property SiblingEntity points to the edit draft document
		var sDraftSiblingUri = oResponse.data.d.SiblingEntity.__deferred.uri;
		oResponse = jQuery.sap.sjax({
			url: sDraftSiblingUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.SalesOrderDraftUUID, sDraftId);
		// All draft documents (to-do list)
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq false",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 50);

		oMockServer.destroy();
	});

	QUnit.test("actions on draft", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice/"
		});
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/draft/metadata.xml";
		oMockServer.simulate(sMetadataUrl);
		oMockServer.start();

		assert.ok(oMockServer.isStarted(), "Mock server is started");

		var oNewDraft = {
			ActiveSalesOrderID: "new draft",
			SalesOrderID: "new draft",
			Approved: false
		};

		var oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder",
			type: 'POST',
			data: JSON.stringify(oNewDraft)
		});
		assert.ok(oResponse.success, "A new draft was created");

		oNewDraft = oResponse.data.d;
		assert.notEqual(oNewDraft.SalesOrderDraftUUID, "00000000-0000-0000-0000-000000000000");
		assert.ok(typeof oNewDraft.IsActiveEntity !== "undefined" && !oNewDraft.IsActiveEntity);
		assert.ok(!oNewDraft.HasActiveEntity);
		assert.ok(!oNewDraft.HasDraftEntity);

		oResponse = jQuery.sap.sjax({
			url: oNewDraft.__metadata.uri,
			type: 'PATCH',
			data: JSON.stringify({ GrossAmount: 100.0 })
		});
		assert.ok(oResponse.success);

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderActivation",
			type: 'POST',
			data: JSON.stringify({
				SalesOrderDraftUUID: oNewDraft.SalesOrderDraftUUID,
				ActiveSalesOrderID: "new draft"
			})
		});
		assert.ok(oResponse.success, "activate a new draft document");
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=ActiveSalesOrderID eq 'new draft'",
			dataType: "json"
		});
		assert.ok(oResponse.success, "activate a new draft document");
		assert.ok(oResponse.data.d.results[0].IsActiveEntity, "activate a new draft document");

		oResponse = jQuery.sap.sjax({
			url: oResponse.data.d.results[0].__metadata.uri,
			type: 'DELETE'
		});
		assert.ok(oResponse.success);

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq false and HasActiveEntity eq true",
			dataType: "json"
		});
		assert.ok(oResponse.success);

		var oEditDraft = oResponse.data.d.results[0];
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderActivation",
			type: 'POST',
			data: JSON.stringify({
				SalesOrderDraftUUID: oEditDraft.SalesOrderDraftUUID,
				ActiveSalesOrderID: oEditDraft.ActiveSalesOrderID
			})
		});
		assert.ok(oResponse.success, "activate an edit draft document");
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=ActiveSalesOrderID eq " + oEditDraft.ActiveSalesOrderID,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(oResponse.data.d.results[0].IsActiveEntity, "activated an edit draft document");

		var sSiblingUri = oResponse.data.d.results[0].SiblingEntity.__deferred.uri;

		oResponse = jQuery.sap.sjax({
			url: sSiblingUri,
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(isEmptyObject(oResponse.data.d));

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=IsActiveEntity eq true and HasActiveEntity eq false",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		var oActiveEntity = oResponse.data.d.results[0];
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderEdit",
			type: "POST",
			data: JSON.stringify({
				SalesOrderDraftUUID: oActiveEntity.SalesOrderDraftUUID,
				ActiveSalesOrderID: oActiveEntity.ActiveSalesOrderID
			})
		});
		assert.ok(oResponse.success, "edit draft created");
		assert.ok(!oResponse.data.d.IsActiveEntity, "edit draft created");
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder?$filter=ActiveSalesOrderID eq " + oActiveEntity.ActiveSalesOrderID + " and HasDraftEntity eq true",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.ok(oResponse.data.d.results[0]);

		oEditDraft = oResponse.data.d.results[0];
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderValidation?ActiveSalesOrderID=" + oEditDraft.ActiveSalesOrderID + "&SalesOrderDraftUUID=" + oEditDraft.SalesOrderDraftUUID,
			type: "GET"
		});
		assert.ok(oResponse.success, "edit draft validation");

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderPreparation",
			type: "POST",
			data: JSON.stringify({
				SalesOrderDraftUUID: oEditDraft.SalesOrderDraftUUID,
				ActiveSalesOrderID: oEditDraft.ActiveSalesOrderID
			})
		});
		assert.ok(oResponse.success, "edit draft preparation");

		oMockServer.destroy();
	});

	QUnit.test("remainder", function (assert) {
		var oMockServer = new MockServer({
			rootUri: "/myservice/"
		});
		var sMetadataUrl = "test-resources/sap/ui/core/qunit/mockserver/testdata/draft/metadata.xml";
		oMockServer.simulate(sMetadataUrl, {
			sMockdataBaseUrl: "test-resources/sap/ui/core/qunit/mockserver/testdata/draft",
			bGenerateMissingMockData: true
		});
		oMockServer.start();

		assert.ok(oMockServer.isStarted(), "Mock server is started");

		var oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder",
			dataType: "json"
		});
		assert.ok(oResponse.success);
		assert.equal(oResponse.data.d.results.length, 100);

		//var oActiveEntity = oResponse.data.d.results[0];
		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrderEdit?ActiveSalesOrderID=%27ActiveSalesOrderID%201%27&SalesOrderDraftUUID=guid%2700000000-0000-0000-0000-000000000000%27",
			type: "POST"
		});
		assert.ok(oResponse.success, "edit draft created");

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder(ActiveSalesOrderID='ActiveSalesOrderID 2',SalesOrderDraftUUID=guid'00000000-0000-0000-0000-000000000000')/DraftAdministrativeData",
			dataType: "json"
		});
		assert.ok(oResponse.success, "No DraftAdministrativeData for Active Entity");
		assert.ok(isEmptyObject(oResponse.data.d));

		oResponse = jQuery.sap.sjax({
			url: "/myservice/SalesOrder(ActiveSalesOrderID='ActiveSalesOrderID 2',SalesOrderDraftUUID=guid'00000000-0000-0000-0000-000000000000')?$expand=DraftAdministrativeData",
			dataType: "json"
		});
		assert.ok(oResponse.success, "No DraftAdministrativeData for Active Entity");
		assert.ok(isEmptyObject(oResponse.data.d.DraftAdministrativeData));

		var aSalesOrder = oMockServer.getEntitySetData("SalesOrder");
		assert.equal(aSalesOrder[2].DraftAdministrativeData, null);

		oMockServer.destroy();
	});

});