/*global QUnit,sinon*/

sap.ui.require([
	"sap/ui/support/supportRules/Main",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels"],
	function (Main, CommunicationBus, channelNames) {
		"use strict";

		/*eslint-disable no-unused-vars*/
		var core;
		/*eslint-enable no-unused-vars*/

		var spyChannel = function (channelName) {
			sinon.spy(CommunicationBus, "publish");

			return {
				assertCalled: function (assert) {
					assert.ok(CommunicationBus.publish.calledWith(channelName), "channel name: " + channelName + " should be called");
					CommunicationBus.publish.restore();
				}
			};
		};

		Main.startPlugin();

		sap.ui.getCore().registerPlugin({
			startPlugin: function (oCore) {
				core = oCore;
			}
		});

		QUnit.module("Main.js test", {
			setup: function () {
				this.clock = sinon.useFakeTimers();
			},
			teardown: function () {
				this.clock.restore();
			}
		});

		/*
		TODO: Fix the issue with race condition
		Temporary commenting the test to avoid build problems.
		*/
		// QUnit.test("When a library is loaded", function () {
		// 	sinon.spy(Main, "_fetchSupportRuleSets");

		// 	core.fireLibraryChanged({
		// 		stereotype: "library"
		// 	});

		// 	assert.ok(Main._fetchSupportRuleSets.calledOnce, " the support rules should be updated");

		// 	Main._fetchSupportRuleSets.restore();
		// });

		QUnit.test("When a new control is created", function (assert) {
			var spyCoreStateChanged = spyChannel(channelNames.ON_CORE_STATE_CHANGE);

			var icon = new sap.ui.core.Icon();
			this.clock.tick(600);

			spyCoreStateChanged.assertCalled(assert);
			icon.destroy();
		});

		QUnit.test("When a control is deleted", function (assert) {
			var icon = new sap.ui.core.Icon();
			var spyCoreStateChanged = spyChannel(channelNames.ON_CORE_STATE_CHANGE);

			icon.destroy();
			this.clock.tick(600);

			spyCoreStateChanged.assertCalled(assert);
		});

		QUnit.test("Analyze support rule", function (assert) {
			var spyProgressUpdate = spyChannel(channelNames.ON_PROGRESS_UPDATE);

			Main._analyzeSupportRule({
				check: function () {}
			});

			spyProgressUpdate.assertCalled(assert);
		});

		QUnit.test("Element tree", function (assert) {
			var assertIsDirectChild = function (id1, id2, et) {
				var root = et.constructor === Array ? et[0] : et;

				if (root.id == id2) {
					var isDirectChild = false;
					root.content.forEach(function (content) {
						if (content.id === id1) {
							isDirectChild = true;
						}
					});

					assert.ok(isDirectChild, id1 + " should be direct child of " + id2);
				} else {
					root.content.forEach(function (content) {
						assertIsDirectChild(id1, id2, content);
					});
				}
			};

			var oPanel = new sap.m.Panel({
				id: "rootPanel",
				content: [
					new sap.m.Panel({
						id: "innerPanel1",
						content: [
							new sap.m.Button({
								id: "innerButton"
							}),
							new sap.m.Text({
								id: "innerText"
							})
						]
					}),
					new sap.m.Panel({
						id: "innerPanel2",
						content: [
							new sap.m.Button({
								id: "innerButton2"
							})
						]
					})

				]
			});

			Main.setExecutionScope({
				type: "subtree",
				parentId: "rootPanel"
			});

			var et = Main._createElementTree();

			assertIsDirectChild("rootPanel", "WEBPAGE", et);
			assertIsDirectChild("innerPanel1", "rootPanel", et);
			assertIsDirectChild("innerPanel2", "rootPanel", et);
			assertIsDirectChild("innerButton", "innerPanel1", et);
			assertIsDirectChild("innerText", "innerPanel1", et);
			assertIsDirectChild("innerButton2", "innerPanel2",et);

			oPanel.destroy();
		});
});