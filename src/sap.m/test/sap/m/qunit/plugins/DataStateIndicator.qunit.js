sap.ui.define([
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/plugins/DataStateIndicator",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/model/DataState",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(List, StandardListItem, DataStateIndicator, ManagedObjectObserver, Messaging, Message, DataState, Filter, JSONModel, nextUIUpdate) {

	"use strict";
	/*global QUnit, sinon*/

	function timeout(iDuration) {
		return new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	QUnit.test("Not Applicable", function(assert) {
		assert.throws(function() {
			new StandardListItem({dependents: new DataStateIndicator()});
		});
	});

	QUnit.module("DataStateIndicator", {
		beforeEach: async function() {
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
			await nextUIUpdate();

			this.oAfterRendering = new Promise((fnResolve) => {
				this.oList.addEventDelegate({
					onAfterRendering: fnResolve
				});
			});

			this.addMessage = function(sType) {
				Messaging.addMessages(
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

	QUnit.test("showMessage and enabled API", async function(assert) {
		this.oPlugin.showMessage("New Message", "Error");
		await this.oAfterRendering;

		const oMsgStrp = this.oPlugin._oMessageStrip;
		assert.equal(oMsgStrp.getText(), "New Message");
		assert.equal(oMsgStrp.getType(), "Error");
		assert.ok(this.oList.getAriaLabelledBy().includes(oMsgStrp.getId()));

		this.oPlugin.showMessage("");
		assert.notOk(this.oList.getAriaLabelledBy().includes(oMsgStrp.getId()));
	});

	QUnit.test("Single Message - Error", async function(assert) {
		this.addMessage("Error");
		await this.oAfterRendering;

		const oMsgStrp = this.oPlugin._oMessageStrip;
		assert.equal(oMsgStrp.getText(), "Error Message Text");
		assert.equal(oMsgStrp.getType(), "Error");

		this.oPlugin.setEnabled(false);
		assert.notOk(this.oPlugin._oMessageStrip);
		assert.notOk(this.oList.getAriaLabelledBy().includes(oMsgStrp.getId()));
	});

	QUnit.test("Issue Message", async function(assert) {
		this.addMessage("Error");
		this.addMessage("Warning");
		await this.oAfterRendering;

		const oMsgStrp = this.oPlugin._oMessageStrip;
		assert.equal(oMsgStrp.getText(), this.oPlugin._translate("ISSUE"));
		assert.equal(oMsgStrp.getType(), "Error");

	});

	QUnit.test("Notification Message", async function(assert) {
		this.addMessage("Success");
		this.addMessage("Information");
		await this.oAfterRendering;

		const oMsgStrp = this.oPlugin._oMessageStrip;
		assert.equal(oMsgStrp.getText(), this.oPlugin._translate("NOTIFICATION"));
		assert.equal(oMsgStrp.getType(), "Success");
	});

	QUnit.test("Filtering", async function(assert) {
		assert.expect(8);

		this.oPlugin.setFilter(function() {
			assert.equal(arguments.length, 2, "2 Arguments in filter function");
			assert.ok(arguments[0].isA("sap.ui.core.message.Message"), "First argument is a message");
			assert.ok(arguments[1] === this.oPlugin.getControl(), "Second argument is the control");
			return arguments[0].getType() == "Warning";
		}.bind(this));
		this.addMessage("Error");
		this.addMessage("Warning");
		await this.oAfterRendering;

		const oMsgStrp = this.oPlugin._oMessageStrip;
		assert.equal(oMsgStrp.getText(), "Warning Message Text");
		assert.equal(oMsgStrp.getType(), "Warning");
	});

	QUnit.test("Refresh", async function(assert) {
		assert.expect(2);

		this.oPlugin.setFilter(function() {
			assert.ok(true, "Filter Called");
			return true;
		});
		this.addMessage("Error");
		await this.oAfterRendering;

		this.oPlugin.refresh();
	});

	QUnit.test("dataStateChange event and combined type", function(assert) {
		const done = assert.async();
		const that = this;

		const createTest = function(iTotalMessageCount, iFilteredMessageCount, sType, sSeverity, sText) {
			return function(oDataState, aFilteredMessages) {
				const doTest = function() {
					const oMsgStrp = that.oPlugin._oMessageStrip;
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
					const oObserver = new ManagedObjectObserver(function(){
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

		let iCurrentStep = 0;
		const aSteps = [
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
			const oDataState = oEvent.getParameter("dataState");
			const aFilteredMessages = oEvent.getParameter("filteredMessages");
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

	QUnit.test("Focus after messagestrip close / Close Event", async function(assert) {
		const done = assert.async();
		this.oPlugin.showMessage("New Message", "Error");
		const oControl = this.oPlugin.getControl();
		await this.oAfterRendering;

		const oMsgStrip = this.oPlugin._oMessageStrip;
		assert.ok(oControl.getAriaLabelledBy().includes(oMsgStrip.getId()));
		this.oPlugin.attachClose(function() {
			assert.strictEqual(document.activeElement, oControl.getItems()[0].getDomRef(), "Focus is on the parent of the message Strip");
			assert.notOk(oControl.getAriaLabelledBy().includes(oMsgStrip.getId()));
			done();
		});

		await timeout(300);

		oMsgStrip.close();
	});

	QUnit.test("Rebind", async function(assert) {
		this.addMessage("Error");
		await this.oAfterRendering;

		const oPlugin = this.oPlugin;
		const oMsgStrp = oPlugin._oMessageStrip;
		assert.ok(oMsgStrp.getText(), "There is a Message Text");

		this.oList.bindItems({
			path: "/names",
			template: new StandardListItem({
				title: "{name}"
			})
		});

		oPlugin.refresh();
		await timeout();

		assert.notOk(oMsgStrp.getText(), "There is no Message Text after rebind");
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(DataStateIndicator.findOn(this.oList) === this.oPlugin, "Plugin found via DataStateIndicator.findOn");
	});

	QUnit.module("Enable Filtering", {
		beforeEach: async function() {
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
			await nextUIUpdate();

			this.oDataState = new DataState();
			this.oList.getBinding("items").getDataState = function() {
				return this.oDataState;
			}.bind(this);

			this.aFiltersForMessages = [];
			this.oList.getBinding("items").requestFilterForMessages = function() {
				let oFilter = null;
				if (this.aFiltersForMessages.length == 1) {
					oFilter = this.aFiltersForMessages[0];
				} else if (this.aFiltersForMessages.length > 1) {
					oFilter = new Filter({filters : this.aFiltersForMessages});
				}
				return Promise.resolve(oFilter);
			}.bind(this);

			this.addTableMessage = function(sType) {
				const aMessages = this.oDataState.getMessages().concat(
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
				const sPath = oItem.getBindingContext().getPath() + "/name";
				const aMessages = this.oDataState.getMessages().concat(
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
				const aMessages = this.oDataState.getMessages();
				aMessages.pop();
				this.oDataState.setModelMessages(aMessages);
				this.aFiltersForMessages.pop();
			};

			const fnRequire = sap.ui.require;

			/*
			* Load OnDemand-Dependencies beforehand and simulate sync
			* require call to avoid race condition for async sub-control
			* instantiation
			*/
			const [Text, Toolbar] = await new Promise((fnResolve) => {
				sap.ui.require(["sap/m/Text", "sap/m/Toolbar"], function(Text, Toolbar) {
					fnResolve([Text, Toolbar]);
				});
			});

			sinon.stub(sap.ui, 'require').callsFake((aDependencies, fnCallback) => {
				if (aDependencies.length === 2 && aDependencies[0] === "sap/m/Text" && aDependencies[1] === "sap/m/Toolbar") {
					fnCallback(Text, Toolbar);
				} else {
					fnRequire(aDependencies, fnCallback);
				}
			});
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oList.destroy();
			sap.ui.require.restore();
		}
	});

	QUnit.test("List only messages", async function(assert) {
		this.addTableMessage("Error");
		this.addTableMessage("Success");
		await timeout(300);

		assert.notOk(this.oPlugin._oLink, "List specific messages did not result any link to filter");
	});

	QUnit.test("Filter Items / Clear Filter", async function(assert) {
		let bFilterInfoPressed = false;

		const oList = this.oList;
		const oPlugin = this.oPlugin;

		this.addInputMessage(oList.getItems()[0], "Error");
		oPlugin.attachEvent("filterInfoPress", function() {
			bFilterInfoPressed = true;
		});
		await timeout(300);

		assert.equal(oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

		await new Promise((fnResolve) => {
			oPlugin.attachEventOnce("applyFilter", function(oEvent) {
				assert.ok(oEvent.getParameter("filter") instanceof Filter, "Filter parameter exists");
				assert.ok(oEvent.getParameter("revert") instanceof Function, "Revert parameter exists");
				fnResolve();
			});

			assert.equal(oList.getItems().length, 4, "Before message filtering the list has 4 items");
			oPlugin._oLink.firePress();
		});

		await timeout();

		assert.equal(oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
		assert.equal(oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Errors", "InfoToolbar message is correct");
		assert.ok(oList.getInfoToolbar().getActive(), "Info toolbar is active");
		assert.equal(oList.getItems().length, 1, "After message filtering the list has only 1 item");
		assert.notOk(oPlugin._oMessageStrip.getShowCloseButton(), "Close button of the MessageStrip is hidden");

		await new Promise((fnResolve) => {
			oPlugin.attachEventOnce("clearFilter", function() {
				assert.equal(oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown after message filters are cleared");
				assert.equal(oList.getInfoToolbar(), null, "There is no InfoToolbar after message filters are cleared");
				assert.ok(oPlugin._oMessageStrip.getShowCloseButton(), "Close button of the MessageStrip is visible");
				fnResolve();
			});

			oList.getInfoToolbar().firePress();
			assert.ok(bFilterInfoPressed, "Info toolbar press event is handled");

			oPlugin._oLink.firePress();
		});

		await timeout();

		assert.equal(oList.getItems().length, 4, "After message filters are cleared there are 4 items again");
	});

	QUnit.test("Filter Items / Application Filter / Clear Filter", async function(assert) {
		const oList = this.oList;
		const oPlugin = this.oPlugin;

		this.addInputMessage(oList.getItems()[0], "Warning");
		this.addInputMessage(oList.getItems()[1], "Error");
		await timeout(300);

		assert.equal(oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

		const nextUpdateFinished = new Promise((fnResolve) => {
			oList.attachEventOnce("updateFinished", fnResolve);
		});

		const nextApplyFilterEvent = new Promise((fnResolve) => {
			oPlugin.attachEventOnce("applyFilter", fnResolve);
		});

		assert.equal(oList.getItems().length, 4, "Before message filtering the list has 4 items");
		oPlugin._oLink.firePress();
		await Promise.all([nextUpdateFinished, nextApplyFilterEvent]);

		assert.equal(oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
		assert.equal(oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Issues", "InfoToolbar message is correct");
		assert.equal(oList.getItems().length, 2, "After message filtering the list has 2 items");

		await timeout();

		await new Promise((fnResolve) => {
			oPlugin.attachEventOnce("clearFilter", function() {
				assert.equal(oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown after message filters are cleared");
				assert.equal(oList.getInfoToolbar(), null, "There is no InfoToolbar after message filters are cleared");
				fnResolve();
			});

			oList.getBinding("items").filter(new Filter("name", "EQ", "C"), "Application");
			assert.equal(oList.getItems().length, 2, "Another application filter, before Clear Filter is pressed, is temporarily ignored. The result set is not changed");
			oPlugin._oLink.firePress();
		});

		await timeout();

		assert.equal(oList.getItems().length, 1, "After message filters are cleared there is only 1 item. Previous filter taken into account now");
	});

	QUnit.test("Refresh while filtering", async function(assert) {
		const oPlugin = this.oPlugin;
		const oList = this.oList;

		this.addInputMessage(oList.getItems()[2], "Error");
		this.addInputMessage(oList.getItems()[3], "Warning");

		await timeout(300);

		assert.equal(oPlugin._oLink.getText(), "Filter Items", "Filter Items link is shown");

		const nextApplyFilterEvent = new Promise((fnResolve) => {
			oPlugin.attachEventOnce("applyFilter", fnResolve);
		});

		assert.equal(oList.getItems().length, 4, "Before message filtering the list has 4 items");
		oPlugin._oLink.firePress();

		await nextApplyFilterEvent;
		await timeout();

		assert.equal(oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
		assert.equal(oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Issues", "InfoToolbar message is correct");
		assert.equal(oList.getItems().length, 2, "After message filtering the list has 2 items");

		this.removeMessage();
		oPlugin.refresh();

		oList.getBinding("items").filter(new Filter("name", "EQ", "C"), "Application");
		assert.equal(oList.getItems().length, 2, "Another application filter, before Clear Filter is pressed, is temporarily ignored. The result set is not changed");
		oPlugin._oLink.firePress();

		await timeout();

		assert.equal(oPlugin._oLink.getText(), "Clear Filter", "Clear Filter link is shown");
		assert.equal(oList.getInfoToolbar().getContent()[0].getText(), "Filtered By: Errors", "InfoToolbar message is correct");
		assert.equal(oList.getItems().length, 1, "After message filtering the list has 1 items");
		assert.equal(oList.getItems()[0].getTitle(), "C", "After message filtering the list has 1 items");

		oPlugin.setEnabled(false);
		assert.equal(oList.getInfoToolbar(), null, "InfoToolbar is removed from the list");
		assert.equal(oPlugin._oInfoToolbar, null, "InfoToolbar is removed from plugin");
		assert.equal(oPlugin._oMessageStrip, null, "MessageStrip is removed from plugin");
	});
});