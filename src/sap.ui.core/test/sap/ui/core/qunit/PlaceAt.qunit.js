/* global QUnit */
sap.ui.define(["sap/ui/commons/Panel", "sap/ui/commons/Button", "sap/ui/qunit/utils/createAndAppendDiv"], function(Panel, Button, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4"]);

	var oPanel = new Panel("myPanel");
	oPanel.placeAt("uiArea1");
	var oPanel2 = new Panel("myPanel2");
	sap.ui.getCore().setRoot("uiArea3", oPanel2);

	var doPerformCall = function(oContainerRef, oPosition, sContainerId, bIsUiArea, bUsePlaceAt) {
		var oControl = new Button();
		if (bUsePlaceAt) {
			if (oPosition) {
				oControl.placeAt(oContainerRef, oPosition);
			} else {
				oControl.placeAt(oContainerRef);
			}
		} else {
			sap.ui.getCore().setRoot(oContainerRef, oControl);
		}

		var oCont = bIsUiArea ? sap.ui.getCore().getUIArea(sContainerId) : sap.ui.getCore().byId(sContainerId);

		return [oControl.getId(), oCont];
	};

	var doCheckPlaceAtResult = function(assert, aCallResult, iExpectedLength, iExpectedIndex, sText) {
		sText = " after placeAt with '" + sText + "'";
		var oContainer = aCallResult[1];
		assert.ok(oContainer, "Container available" + sText);
		if (oContainer) {
			assert.equal(oContainer.getContent().length, iExpectedLength, "# Container children" + sText);
			assert.equal(oContainer.getContent()[iExpectedIndex].getId(), aCallResult[0], "Correct Position of child" + sText);
		}
	};

	var doCheckSetRootResult = function(assert, aCallResult) {
		var oContainer = aCallResult[1];
		assert.ok(oContainer, "Container available after setRoot");
		if (oContainer) {
			assert.equal(oContainer.getContent().length, 1, "# Container children after setRoot");
			assert.equal(oContainer.getContent()[0].getId(), aCallResult[0], "Correct Position of child after setRoot");
		}
	};

	var doTestSetRoot = function(assert, oContainerRef, sContainerId, bIsUiArea) {
		var aResult = doPerformCall(oContainerRef, null, sContainerId, bIsUiArea, false);
		doCheckSetRootResult(assert, aResult);
		aResult = doPerformCall(oContainerRef, null, sContainerId, bIsUiArea, false);
		doCheckSetRootResult(assert, aResult);
	};

	var doTestPlaceAt = function(assert, oContainerRef, sContainerId, bIsUiArea) {
		//Test "only" first to bring container into a clear state
		var aResult = doPerformCall(oContainerRef, "only", sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 1, 0, "only");
		aResult = doPerformCall(oContainerRef, null, sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 2, 1, "default (last)");
		aResult = doPerformCall(oContainerRef, "last", sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 3, 2, "last");
		aResult = doPerformCall(oContainerRef, "first", sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 4, 0, "first");
		aResult = doPerformCall(oContainerRef, 2, sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 5, 2, "index 2");
		aResult = doPerformCall(oContainerRef, "only", sContainerId, bIsUiArea, true);
		doCheckPlaceAtResult(assert, aResult, 1, 0, "only");
	};


	QUnit.module("sap.ui.core.Control.placeAt");

	QUnit.test("Deferred call", function(assert) {
		doCheckPlaceAtResult(assert, ["myPanel", sap.ui.getCore().getUIArea("uiArea1")], 1, 0, "deferred call");
	});

	QUnit.test("UIArea via ID", function(assert) {
		doTestPlaceAt(assert, "uiArea2", "uiArea2", true);
	});

	QUnit.test("UIArea via DomRef", function(assert) {
		doTestPlaceAt(assert, jQuery("#uiArea2")[0], "uiArea2", true);
	});

	QUnit.test("Container Control via Control reference", function(assert) {
		doTestPlaceAt(assert, oPanel, "myPanel", false);
	});

	QUnit.test("Container Control via ID", function(assert) {
		doTestPlaceAt(assert, "myPanel", "myPanel", false);
	});

	QUnit.module("sap.ui.core.Core.setRoot");

	QUnit.test("Deferred call", function(assert) {
		doCheckSetRootResult(assert, ["myPanel2", sap.ui.getCore().getUIArea("uiArea3")]);
	});

	QUnit.test("UIArea via ID", function(assert) {
		doTestSetRoot(assert, "uiArea4", "uiArea4", true);
	});

	QUnit.test("UIArea via DomRef", function(assert) {
		doTestSetRoot(assert, jQuery("#uiArea4")[0], "uiArea4", true);
	});

	QUnit.test("Container Control via Control reference", function(assert) {
		doTestSetRoot(assert, oPanel2, "myPanel2", false);
	});

	QUnit.test("Container Control via ID", function(assert) {
		doTestSetRoot(assert, "myPanel2", "myPanel2", false);
	});

});