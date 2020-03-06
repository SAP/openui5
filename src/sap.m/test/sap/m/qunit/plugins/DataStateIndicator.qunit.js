sap.ui.define([
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/ui/core/Core',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/message/Message',
	'sap/m/plugins/DataStateIndicator',
	'sap/m/MessageStrip'
], function(List, StandardListItem, Core, JSONModel, Message, DataStateIndicator) {

	"use strict";
	/*global QUnit */

	QUnit.test("Not Applicable", function(assert) {
		assert.throws(function() {
			new StandardListItem({dependents: new DataStateIndicator()});
		});
	});

	QUnit.module("DataStateIndicator", {
		beforeEach: function() {
			this.oModel = new JSONModel({ names: [{name: "SAP"}] });
			this.oPlugin = new DataStateIndicator();
			this.oList = new List({
				dependents: this.oPlugin
			}).bindItems({
				path : "/names",
				template : new StandardListItem({
					title: "{name}"
				})
			}).setModel(this.oModel);

			this.oList.placeAt("qunit-fixture");
			Core.applyChanges();

			this.oPromise = new Promise(function(resolve) {
				this.oList.addEventDelegate({
					onAfterRendering: resolve
				});
			}.bind(this));

			this.addMessage = function(sType) {
				Core.getMessageManager().addMessages(
					new Message({
						message: sType,
						type: sType,
						target: "/names",
						processor: this.oModel
					})
				);
			};
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oList.destroy();
		}
	});

	QUnit.test("showMessage and enabled API", function(assert) {
		var done = assert.async();
		this.oPlugin.showMessage("New Message", "Error");
		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), "New Message");
			assert.equal(oMsgStrp.getType(), "Error");

			this.oPlugin.setEnabled(false);
			assert.notOk(this.oPlugin._oMessageStrip);

			done();
		}.bind(this));
	});

	QUnit.test("Single Message - Error", function(assert) {
		var done = assert.async();
		this.addMessage("Error");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), "Error");
			assert.equal(oMsgStrp.getType(), "Error");
			done();
		}.bind(this));
	});

	QUnit.test("Issue Message", function(assert) {
		var done = assert.async();
		this.addMessage("Error");
		this.addMessage("Warning");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), this.oPlugin._translate("ISSUE"));
			assert.equal(oMsgStrp.getType(), "Error");
			done();
		}.bind(this));
	});

	QUnit.test("Notification Message", function(assert) {
		var done = assert.async();
		this.addMessage("Success");
		this.addMessage("Information");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), this.oPlugin._translate("NOTIFICATION"));
			assert.equal(oMsgStrp.getType(), "Success");
			done();
		}.bind(this));
	});

	QUnit.test("Filtering", function(assert) {
		assert.expect(8);
		var done = assert.async();
		this.oPlugin.setFilter(function() {
			assert.equal(arguments.length, 2, "2 Arguments in filter function");
			assert.ok(arguments[0].isA("sap.ui.core.message.Message"), "First argument is a message");
			assert.ok(arguments[1] === this.oPlugin.getControl(), "Second argument is the control");
			return arguments[0].getType() == "Warning";
		}.bind(this));
		this.addMessage("Error");
		this.addMessage("Warning");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), "Warning");
			assert.equal(oMsgStrp.getType(), "Warning");
			done();
		}.bind(this));
	});

	QUnit.test("Refresh", function(assert) {
		assert.expect(2);
		var done = assert.async();
		this.oPlugin.setFilter(function() {
			assert.ok(true, "Filter Called");
			return true;
		});
		this.addMessage("Error");

		this.oPromise.then(function() {
			this.oPlugin.refresh();
			done();
		}.bind(this));
	});

	QUnit.test("dataStateChange event", function(assert) {
		var done = assert.async();
		this.oPlugin.attachDataStateChange(function(oEvent) {
			var oDataState = oEvent.getParameter("dataState");
			var aMessages = oDataState.getMessages();
			var bError = aMessages.some(function(oMessage) {
				return oMessage.getType() == "Error";
			});
			if (!bError) {
				oEvent.preventDefault();
			}
		});

		this.addMessage("Information");
		this.addMessage("Success");
		this.addMessage("Error");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), this.oPlugin._translate("ERROR"));
			assert.equal(oMsgStrp.getType(), "Error");
			done();
		}.bind(this));
	});
});