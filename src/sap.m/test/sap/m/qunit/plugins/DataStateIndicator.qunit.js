sap.ui.define([
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/ui/core/Core',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/message/Message',
	'sap/m/plugins/DataStateIndicator',
	"sap/ui/base/ManagedObjectObserver"
], function(List, StandardListItem, Core, JSONModel, Message, DataStateIndicator, ManagedObjectObserver) {

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
						message: sType + " Message Text",
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
			assert.equal(oMsgStrp.getText(), "Error Message Text");
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
			assert.equal(oMsgStrp.getText(), "Warning Message Text");
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

	QUnit.test("dataStateChange event and combined type", function(assert) {
		var done = assert.async();
		var that = this;

		var createTest = function(iTotalMessageCount, iFilteredMessageCount, sType, sSeverity, sText) {
			return function(oDataState, aFilteredMessages) {
				var doTest = function() {
					var oMsgStrp = that.oPlugin._oMessageStrip;
					assert.equal(oDataState.getMessages().length, iTotalMessageCount, aSteps[iCurrentStep].name + ": DataState.getMessages()");
					assert.equal(aFilteredMessages.length, iFilteredMessageCount, aSteps[iCurrentStep].name + ": filteredMessages");
					assert.equal(that.oPlugin._getCombinedType(aFilteredMessages), sType, aSteps[iCurrentStep].name + ": Plugin._getStateType()");
					if (iFilteredMessageCount > 0) {
						assert.equal(oMsgStrp.getText(), sText !== undefined ? sText : that.oPlugin._translate(sType.toUpperCase()), aSteps[iCurrentStep].name + ": MessageStrip Text");
						assert.equal(oMsgStrp.getType(), sSeverity, aSteps[iCurrentStep].name + ": MessageStrip Severity");
						assert.ok(oMsgStrp.getVisible(), aSteps[iCurrentStep].name + ": MessageStrip Visibility");
					} else {
						assert.ok(!oMsgStrp.getVisible(), aSteps[iCurrentStep].name + ": MessageStrip Visibility");
					}
				};

				return new Promise(function(resolve) {
					var oObserver = new ManagedObjectObserver(function(){
						oObserver.disconnect();
						setTimeout(function() {
							doTest();
							resolve();
						}, 0);
					});

					if (that.oPlugin._oMessageStrip) {
						oObserver.observe(that.oPlugin._oMessageStrip, { properties: ["text"] });
					} else {
						oObserver.observe(that.oList, { aggregations: ["_messageStrip"] });
					}
				});

			};
		};

		var iCurrentStep = 0;
		var aSteps = [
			{
				name: "Only Information Message",
				action: function() {
					that.addMessage("Information");
				},
				test: createTest(1, 1, "Notification", "Information", "Information Message Text")
			},{
				name: "Information + Warning Message",
				action: function() {
					that.addMessage("Warning");
				},
				test: createTest(2, 2, "Warning", "Warning")
			},{
				name: "Information + Warning + Error Message",
				action: function() {
					that.addMessage("Error");
				},
				test: createTest(3, 3, "Issue", "Error")
			},{
				name: "Information + Warning + Error Message, filter for Error only",
				action: function() {
					that.oPlugin.setFilter(function(oMessage) {
						return oMessage.getType() == "Error";
					});
					that.oPlugin.refresh();
				},
				test: createTest(3, 1, "Error", "Error", "Error Message Text")
			},{
				name: "No messages",
				action: function() {
					that.oPlugin.setFilter(function(oMessage) {
						return false;
					});
					that.oPlugin.refresh();
				},
				test: createTest(3, 0, "", "")
			}
		];

		that.oPlugin.attachEvent("dataStateChange", function(oEvent) {
			var oDataState = oEvent.getParameter("dataState");
			var aFilteredMessages = oEvent.getParameter("filteredMessages");
			aSteps[iCurrentStep].test(oDataState, aFilteredMessages).then(function() {
				iCurrentStep++;
				if (iCurrentStep < aSteps.length) {
					aSteps[iCurrentStep].action();
				} else {
					done();
				}
			});
		});

		aSteps[iCurrentStep].action();
	});

	QUnit.test("Link control test when messageLinkText is set before MessageStrip is initialized", function(assert) {
		var done = assert.async(),
			bMessageLinkPressed = false;
		assert.ok(this.oPlugin.getMetadata().getAllPrivateProperties().hasOwnProperty("messageLinkText"), "messageLinkText is a private property of the DataPluginIndicator");
		this.oPlugin.setMessageLinkText("Test");
		assert.ok(this.oPlugin.getMetadata().getAllPrivateProperties().hasOwnProperty("messageLinkVisible"), "messageLinkVisible is a private property of the DataPluginIndicator");
		assert.ok(this.oPlugin.getMessageLinkVisible(), "messageLinkVisible=true by default");
		this.oPlugin.attachEventOnce("messageLinkPressed", function() {
			bMessageLinkPressed = true;
		});
		this.addMessage("Error");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), "Error Message Text");
			assert.equal(oMsgStrp.getType(), "Error");
			assert.equal(this.oPlugin.getMessageLinkText(), "Test");
			assert.ok(this.oPlugin._oLink, "Link control created");
			assert.equal(oMsgStrp.getLink(), this.oPlugin._oLink, "MessageStrip aggregation set correctly");
			assert.equal(this.oPlugin._oLink.getVisible(), this.oPlugin.getMessageLinkVisible());
			this.oPlugin._oLink.firePress();
			assert.ok(bMessageLinkPressed, "messageLinkPressed event fired");

			this.oPlugin.setMessageLinkText("Test2");
			assert.equal(this.oPlugin.getMessageLinkText(), "Test2", "property value updated correctly");
			assert.equal(this.oPlugin._oLink.getText(), this.oPlugin.getMessageLinkText(), "Link text updated");

			this.oPlugin.setMessageLinkVisible(false);
			assert.equal(this.oPlugin.getMessageLinkVisible(), false, "property value updated correctly");
			assert.equal(this.oPlugin._oLink.getVisible(), this.oPlugin.getMessageLinkVisible(), "link hidden");

			this.oPlugin.setMessageLinkVisible(true);
			assert.equal(this.oPlugin.getMessageLinkVisible(), true, "property value updated correctly");
			assert.equal(this.oPlugin._oLink.getVisible(), this.oPlugin.getMessageLinkVisible(), "link visible");

			this.oPlugin.setMessageLinkText("");
			assert.equal(this.oPlugin.getMessageLinkText(), "", "property value updated correctly");
			assert.equal(oMsgStrp.getLink(), null, "link aggregation set to null");
			assert.ok(this.oPlugin._oLink, "Link control available");

			this.oPlugin.setMessageLinkText("Test");
			assert.equal(this.oPlugin.getMessageLinkText(), "Test", "property value updated correctly");
			assert.equal(oMsgStrp.getLink(), this.oPlugin._oLink, "MessageStrip aggregation set correctly");
			assert.equal(this.oPlugin._oLink.getText(), this.oPlugin.getMessageLinkText(), "Link text updated");
			done();
		}.bind(this));
	});

	QUnit.test("Link control test when messageLinkText is set after MessageStrip is initialized", function(assert) {
		var done = assert.async(),
			bMessageLinkPressed = false;
		this.oPlugin.attachEventOnce("messageLinkPressed", function() {
			bMessageLinkPressed = true;
		});
		this.addMessage("Error");

		this.oPromise.then(function() {
			var oMsgStrp = this.oPlugin._oMessageStrip;
			assert.equal(oMsgStrp.getText(), "Error Message Text");
			assert.equal(oMsgStrp.getType(), "Error");
			assert.notOk(this.oPlugin._oLink, "Link control not created yet");
			assert.notOk(oMsgStrp.getLink(), "link aggreagtion not set for the MessageStrip");

			this.oPlugin.setMessageLinkText("Test");
			assert.equal(this.oPlugin.getMessageLinkText(), "Test", "property value updated correctly");

			var oPromise = new Promise(function(resolve) {
				oMsgStrp.addEventDelegate({
					onAfterRendering: resolve
				});
			});

			oPromise.then(function() {
				assert.ok(this.oPlugin._oLink, "Link control created");
				assert.equal(oMsgStrp.getLink(), this.oPlugin._oLink);
				this.oPlugin._oLink.firePress();
				assert.ok(bMessageLinkPressed, "messageLinkPressed event fired");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Focus after messagestrip close", function(assert) {
		var done = assert.async();
		this.oPlugin.showMessage("New Message", "Error");
		var oControl = this.oPlugin.getControl();

		this.oPromise.then(function() {
			var oMsgStrip = this.oPlugin._oMessageStrip;
			oMsgStrip.attachClose(function() {
				assert.strictEqual(document.activeElement, oControl.getItems()[0].getDomRef(), "Focus is on the parent of the message Strip");
				done();
			});
			setTimeout(function() {
				oMsgStrip.close();
			}, 300);
		 }.bind(this));
	});
});