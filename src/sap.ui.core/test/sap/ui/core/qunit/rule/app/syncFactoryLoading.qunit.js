/*global QUnit testRule*/
sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/thirdparty/sinon"
], function(Fragment, Component, Controller, ExtensionPoint, sinon) {
	"use strict";

	QUnit.module("sap.ui.fragment rule tests", {
		beforeEach: function () {
			var aLogs = jQuery.sap.log.getLogEntries();
			try {

				sap.ui.fragment("sap/ui/core/qunit/fragment/Fragment", "XML");
			} catch (e) {
				//ignore
			}
			aLogs = jQuery.sap.log.getLogEntries().slice(aLogs.length);
			this.oGetLogEntriesStub = sinon.stub(jQuery.sap.log, "getLogEntries").returns(aLogs);
		}, afterEach: function() {
			this.oGetLogEntriesStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: 1
	});

	QUnit.module("sap.ui.extensionpoint rule tests", {
		beforeEach: function () {
			var aLogs = jQuery.sap.log.getLogEntries();
			sap.ui.extensionpoint();
			aLogs = jQuery.sap.log.getLogEntries().slice(aLogs.length);
			this.oGetLogEntriesStub = sinon.stub(jQuery.sap.log, "getLogEntries").returns(aLogs);
		}, afterEach: function() {
			this.oGetLogEntriesStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: 1
	});

	QUnit.module("sap.ui.controller rule tests", {
		beforeEach: function () {
			var aLogs = jQuery.sap.log.getLogEntries();
			Controller.extend("mySyncController", function () { });
			sap.ui.controller("mySyncController");
			aLogs = jQuery.sap.log.getLogEntries().slice(aLogs.length);
			this.oGetLogEntriesStub = sinon.stub(jQuery.sap.log, "getLogEntries").returns(aLogs);
		}, afterEach: function() {
			this.oGetLogEntriesStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: 1
	});

	QUnit.module("sap.ui.component rule tests", {
		beforeEach: function () {
			var aLogs = jQuery.sap.log.getLogEntries();
			sap.ui.component("LoremIpsum");
			aLogs = jQuery.sap.log.getLogEntries().slice(aLogs.length);
			this.oGetLogEntriesStub = sinon.stub(jQuery.sap.log, "getLogEntries").returns(aLogs);
		}, afterEach: function() {
			this.oGetLogEntriesStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: 1
	});
});