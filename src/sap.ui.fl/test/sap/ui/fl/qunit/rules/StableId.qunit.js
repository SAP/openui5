/*global QUnit*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/m/InstanceManager",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/Bootstrap",
	"sap/ui/support/RuleAnalyzer",
	"test-resources/sap/ui/support/TestHelper"
], function (
	UIComponent,
	ComponentContainer,
	XMLView,
	VerticalLayout,
	Button,
	Dialog,
	Popover,
	InstanceManager,
	MessageBox,
	JSONModel,
	Bootstrap,
	RuleAnalyzer,
	testRule
) {
	"use strict";

	QUnit.module("Base functionality for app component's root view", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							}),
							new XMLView({ // Missing ID for view and implicit missing IDs for controls inside
								viewContent:
									'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
										'<l:VerticalLayout id="layout">' +
											'<m:Button text="Button 1" id="button1" />' +
										'</l:VerticalLayout>' +
									'</mvc:View>'
							})
						]
					});
				}
			});
			this.oComponent = new CustomComponent(); // Missing ID

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
		}
	}, function () {
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 5
		});
	});

	QUnit.module("Base functionality for popups", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId")
					});
				}
			});
			this.oComponent = new CustomComponent("componentId");

			// popups with app components + unstable
			this.oComponent.runAsOwner(function () {
				this.oDialog = new Dialog({
					id: this.oComponent.createId("DialogWithComponent"),
					showHeader: false,
					content: [this.oButton0 = new Button({text: "button inside dialog with unstable id"})],
					contentHeight: "800px",
					contentWidth: "600px"
				});
				this.oPopover = new Popover({
					content: [new Button({text: "button inside popover with unstable id"})],
					showHeader: false,
					contentWidth: "270px"
				});
				// popup with adaptation disabled
				this.oPopoverAdaptationDisabled = new Popover({
					id: this.oComponent.createId("PopoverAdaptationDisabled"),
					content: [new Button({text: "button inside popover with unstable id"})],
					showHeader: false,
					contentWidth: "270px"
				});
				this.oPopoverAdaptationDisabled.isPopupAdaptationAllowed = function () {
					return false;
				};
				// when focus is taken away popover might close - resulting in failing tests
				this.oPopoverAdaptationDisabled.oPopup.setAutoClose(false);
				this.oPopover.oPopup.setAutoClose(false);
			}.bind(this));

			// popup without component
			this.oDialogWithoutComponent = new Dialog({
				showHeader: false,
				content: [this.oButton1 = new Button({text: "button inside dialog with unstable id"})],
				contentHeight: "800px",
				contentWidth: "600px"
			});

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDialog.attachAfterOpen(function () {
				this.oPopover.attachAfterOpen(function () {
					this.oDialogWithoutComponent.attachAfterOpen(function () {
						this.oPopoverAdaptationDisabled.attachAfterOpen(function () {
							// recognized as a dialog from InstanceManager
							MessageBox.show("message box");
							Bootstrap.initSupportRules(["true", "silent"], {
								onReady: fnDone
							});
						});
						this.oPopoverAdaptationDisabled.openBy(this.oButton1);
					}.bind(this));
					this.oDialogWithoutComponent.open();
				}.bind(this));
				this.oPopover.openBy(this.oButton0);
			}.bind(this));
			this.oDialog.open();
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oPopoverAdaptationDisabled.destroy();
			this.oDialog.destroy();
			this.oDialogWithoutComponent.destroy();
			InstanceManager.closeAllDialogs();
			this.oComponentContainer.destroy();
		}
	}, function () {
		QUnit.test("stableId check", function (assert) {
			return RuleAnalyzer.analyze({type: "global"},
				[{
					libName: "sap.ui.fl",
					ruleId: "stableId"
				}]
			).then(function () {
				var aUnstableIds = [
					this.oDialog.getContent()[0].getId(),
					this.oPopover.getContent()[0].getId(),
					this.oPopover.getId()
				];
				var oHistory = RuleAnalyzer.getLastAnalysisHistory();
				oHistory.issues.forEach(function (oIssue) {
					var iUnstableIdIndex = aUnstableIds.indexOf(oIssue.context.id);
					if (iUnstableIdIndex > -1) {
						aUnstableIds.splice(iUnstableIdIndex, 1);
					}
				});
				assert.strictEqual(aUnstableIds.length, 0, "then the correct no. of issues were created");
			}.bind(this));
		});
	});

	QUnit.module("Aggregation Binding via template", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new XMLView({
						id: this.createId("view"),
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
								'<l:VerticalLayout id="layout" content="{/buttons}">' +
									'<l:content>' +
										'<m:Button text="{text}" />' +
									'</l:content>' +
								'</l:VerticalLayout>' +
							'</mvc:View>'
					});
				}
			});
			this.oComponent = new CustomComponent("comp");

			this.oModel = new JSONModel({
				buttons: [
					{ text: "Button 1" },
					{ text: "Button 2" },
					{ text: "Button 3" }
				]
			});
			this.oComponent.setModel(this.oModel);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	}, function () {
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 3
		});
	});

	QUnit.module("Aggregation Binding via factory function", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new XMLView({
						id: this.createId("view"),
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:l="sap.ui.layout">' +
								'<l:VerticalLayout id="layout" />' +
							'</mvc:View>'
					});
				}
			});
			this.oComponent = new CustomComponent("comp");

			this.oModel = new JSONModel({
				buttons: [
					{ text: "Button 1" },
					{ text: "Button 2" },
					{ text: "Button 3" }
				]
			});
			this.oComponent.setModel(this.oModel);

			this.oVerticalLayout = this.oComponent.getRootControl().byId("layout");
			this.oVerticalLayout.bindAggregation("content", "/buttons", function (sId) {
				return new Button(sId, {
					text: {
						path: "text"
					}
				});
			});

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	}, function () {
		// Controls in bound aggregations should be ignored during the evaluation
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 0
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});