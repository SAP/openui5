sap.ui.define([
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/ui/core/Core',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/message/Message',
	'sap/m/plugins/DataStateIndicator',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/model/DataState',
	'sap/ui/model/Filter',
	'sap/m/Toolbar',
	'sap/m/Link',
	'sap/m/Text'
], function(List, StandardListItem, Core, JSONModel, Message, DataStateIndicator, ManagedObjectObserver, DataState, Filter) {

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

	QUnit.test("Focus after messagestrip close / Close Event", function(assert) {
		var done = assert.async();
		this.oPlugin.showMessage("New Message", "Error");
		var oControl = this.oPlugin.getControl();

		this.oPromise.then(function() {
			var oMsgStrip = this.oPlugin._oMessageStrip;
			this.oPlugin.attachClose(function() {
				assert.strictEqual(document.activeElement, oControl.getItems()[0].getDomRef(), "Focus is on the parent of the message Strip");
				done();
			});
			setTimeout(function() {
				oMsgStrip.close();
			}, 300);
		}.bind(this));
	});

	QUnit.module("Enable Filtering", {
		beforeEach: function() {
			this.oModel = new JSONModel({ names: [{name: "A"}, {name: "B"}, {name: "C"}, {name: "D"}] });
			this.oPlugin = new DataStateIndicator({
				enableFiltering: true
			});
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

			this.oDataState = new DataState();
			this.oList.getBinding("items").getDataState = function() {
				return this.oDataState;
			}.bind(this);

			this.aFiltersForMessages = [];
			this.oList.getBinding("items").requestFilterForMessages = function() {
				var oFilter = null;
				if (this.aFiltersForMessages.length == 1) {
					oFilter = this.aFiltersForMessages[0];
				} else if (this.aFiltersForMessages.length > 1) {
					oFilter = new Filter({filters : this.aFiltersForMessages});
				}
				return Promise.resolve(oFilter);
			}.bind(this);

			this.addTableMessage = function(sType) {
				var aMessages = this.oDataState.getMessages().concat(
					new Message({
						message: sType + " Table Message Text",
						type: sType,
						target: "/names",
						processor: this.oModel
					})
				);

				this.oDataState.setModelMessages(aMessages);
				this.oPlugin._processDataState(this.oDataState);
			};

			this.addInputMessage = function(oItem, sType) {
				var sPath = oItem.getBindingContext().getPath() + "/name";
				var aMessages = this.oDataState.getMessages().concat(
					new Message({
						message: sType + " Input Message Text ",
						type: sType,
						target: sPath,
						processor: this.oModel
					})
				);

				this.oDataState.setModelMessages(aMessages);

				this.aFiltersForMessages.push(new Filter("name", "EQ", oItem.getBindingContext().getProperty(sPath)));
				this.oPlugin._processDataState(this.oDataState);
			};

			this.removeMessage = function() {
				var aMessages = this.oDataState.getMessages();
				aMessages.pop();
				this.oDataState.setModelMessages(aMessages);
				this.aFiltersForMessages.pop();
			};
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oList.destroy();
		}
	});

	QUnit.test("List only messages", function(assert) {
		var done = assert.async();

		this.addTableMessage("Error");
		this.addTableMessage("Success");

		setTimeout(function() {
			assert.notOk(this.oPlugin._oLink, "List specific messages did not result any link to filter");
			done();
		}.bind(this), 300);

	});

	QUnit.test("Filter Items / Clear Filter", function(assert) {
		var done = assert.async();
		var bFilterInfoPressed = false;

		this.addInputMessage(this.oList.getItems()[0], "Error");
		this.oPlugin.attachEvent("filterInfoPress", function() {
			bFilterInfoPressed = true;
		});

		setTimeout(function() {
			assert.equal(this.oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

			this.oPlugin.attachEventOnce("applyFilter", function(oEvent) {

				assert.ok(oEvent.getParameter("filter") instanceof Filter, "Filter parameter exists");
				assert.ok(oEvent.getParameter("revert") instanceof Function, "Revert parameter exists");

				setTimeout(function() {

					assert.equal(this.oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
					assert.equal(this.oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Errors", "InfoToolbar message is correct");
					assert.ok(this.oList.getInfoToolbar().getActive(), "Info toolbar is active");
					assert.equal(this.oList.getItems().length, 1, "After message filtering the list has only 1 item");
					assert.notOk(this.oPlugin._oMessageStrip.getShowCloseButton(), "Close button of the MessageStrip is hidden");

					this.oPlugin.attachEventOnce("clearFilter", function() {

						assert.equal(this.oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown after message filters are cleared");
						assert.equal(this.oList.getInfoToolbar(), null, "There is no InfoToolbar after message filters are cleared");
						assert.ok(this.oPlugin._oMessageStrip.getShowCloseButton(), "Close button of the MessageStrip is visible");

						setTimeout(function() {
							assert.equal(this.oList.getItems().length, 4, "After message filters are cleared there are 4 items again");
							done();
						}.bind(this));

					}, this);

					this.oList.getInfoToolbar().firePress();
					assert.ok(bFilterInfoPressed, "Info toolbar press event is handled");

					this.oPlugin._oLink.firePress();

				}.bind(this));

			}, this);

			assert.equal(this.oList.getItems().length, 4, "Before message filtering the list has 4 items");
			this.oPlugin._oLink.firePress();

		}.bind(this), 300);

	});

	QUnit.test("Filter Items / Application Filter / Clear Filter", function(assert) {
		var done = assert.async();

		this.addInputMessage(this.oList.getItems()[0], "Warning");
		this.addInputMessage(this.oList.getItems()[1], "Error");

		setTimeout(function() {
			assert.equal(this.oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

			this.oPlugin.attachEventOnce("applyFilter", function() {

				setTimeout(function() {

					assert.equal(this.oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
					assert.equal(this.oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Issues", "InfoToolbar message is correct");
					assert.equal(this.oList.getItems().length, 2, "After message filtering the list has 2 items");

					this.oPlugin.attachEventOnce("clearFilter", function() {

						assert.equal(this.oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown after message filters are cleared");
						assert.equal(this.oList.getInfoToolbar(), null, "There is no InfoToolbar after message filters are cleared");

						setTimeout(function() {
							assert.equal(this.oList.getItems().length, 1, "After message filters are cleared there is only 1 item. Previous filter taken into account now");
							done();
						}.bind(this));

					}, this);

					this.oList.getBinding("items").filter(new Filter("name", "EQ", "C"), "Application");
					assert.equal(this.oList.getItems().length, 2, "Another application filter, before Clear Filter is pressed, is temporarily ignored. The result set is not changed");
					this.oPlugin._oLink.firePress();

				}.bind(this));

			}, this);

			assert.equal(this.oList.getItems().length, 4, "Before message filtering the list has 4 items");
			this.oPlugin._oLink.firePress();

		}.bind(this), 300);

	});

	QUnit.test("Refresh while filtering", function(assert) {
		var done = assert.async();

		this.addInputMessage(this.oList.getItems()[2], "Error");
		this.addInputMessage(this.oList.getItems()[3], "Warning");

		setTimeout(function() {
			assert.equal(this.oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

			this.oPlugin.attachEventOnce("applyFilter", function() {

				setTimeout(function() {

					assert.equal(this.oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
					assert.equal(this.oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Issues", "InfoToolbar message is correct");
					assert.equal(this.oList.getItems().length, 2, "After message filtering the list has 2 items");

					this.removeMessage();
					this.oPlugin.refresh();

					setTimeout(function() {

						assert.equal(this.oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
						assert.equal(this.oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Errors", "InfoToolbar message is correct");
						assert.equal(this.oList.getItems().length, 1, "After message filtering the list has 1 items");
						assert.equal(this.oList.getItems()[0].getTitle(), "C", "After message filtering the list has 1 items");

						this.oPlugin.setEnabled(false);
						assert.equal(this.oList.getInfoToolbar(), null, "InfoToolbar is removed from the list");
						assert.equal(this.oPlugin._oInfoToolbar, null, "InfoToolbar is removed from plugin");
						assert.equal(this.oPlugin._oMessageStrip, null, "MessageStrip is removed from plugin");

						done();

					}.bind(this));

					this.oList.getBinding("items").filter(new Filter("name", "EQ", "C"), "Application");
					assert.equal(this.oList.getItems().length, 2, "Another application filter, before Clear Filter is pressed, is temporarily ignored. The result set is not changed");
					this.oPlugin._oLink.firePress();

				}.bind(this));

			}, this);

			assert.equal(this.oList.getItems().length, 4, "Before message filtering the list has 4 items");
			this.oPlugin._oLink.firePress();

		}.bind(this), 300);

	});

});