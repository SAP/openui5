/*global QUnit testRule*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Fragment",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ExtensionPoint",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/thirdparty/sinon"
], function(Log, Fragment, Component, Controller, ExtensionPoint, TestHelper, sinon) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("sap.ui.fragment rule tests", {
		beforeEach: function () {
			var aLogs = jQuery.sap.log.getLogEntries();
			sap.ui.fragment("test-resources/sap/ui/core/qunit/fragment/Fragment", "XML");
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