/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/ui/thirdparty/sinon-4"
],
function (
	FlUtils,
	ChangeRegistry,
	CommandFactory,
	FlexCommand,
	DesignTime,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	JSONModel,
	Button,
	Panel,
	Text,
	VBox,
	List,
	CustomListItem,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given two controls with designtime metadata for combine ...", {
		before: function () {
			var oMockedAppComponent = {
				getLocalId: function () {},
				getManifestEntry: function () {
					return {};
				},
				getMetadata: function () {
					return {
						getName: function () {
							return "someName";
						}
					};
				},
				getManifest: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							}
						}
					};
				},
				getModel: function () {}
			};

			this.oFlUtilsStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);
		},
		after: function () {
			this.oFlUtilsStub.restore();
		},
		beforeEach: function() {
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");

			this.oPanel = new Panel("panel", {
				content : [this.oButton1, this.oButton2]
			});

			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					combineStuff : {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy,
						revertChange: function() {}
					}
				}
			});
		},
		afterEach: function() {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for combine ...", function(assert) {
			var oOverlay = new ElementOverlay({ element: this.oButton1 });
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getRelevantContainer").returns(this.oPanel);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						combine : {
							changeType: "combineStuff",
							changeOnRelevantContainer : true,
							isEnabled : true
						}
					},
					getRelevantContainer: function() {
						return this.oPanel;
					}.bind(this)
				}
			});

			return CommandFactory.getCommandFor(this.oButton1, "combine", {
				source : this.oButton1,
				combineElements : [
					this.oButton1,
					this.oButton2
				]
			}, oDesignTimeMetadata)

			.then(function(oCombineCommand) {
				assert.ok(oCombineCommand, "combine command exists for element");
				return oCombineCommand.execute();
			})

			.then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.module("Given a command factory and a bound control containing a template binding", {
		beforeEach : function(assert) {
			var oMockedAppComponent = {
				getLocalId: sandbox.stub(),
				getManifestObject: sandbox.stub(),
				getManifestEntry: sandbox.stub(),
				getMetadata: function () {
					return {
						getName: function () {
							return "someName";
						}
					};
				},
				getManifest: function () {
					return {
						"sap.app" : {
							type: "application",
							applicationVersion : {
								version : "1.2.3"
							}
						}
					};
				},
				getModel: function () {},
				createId : function(sId) {
					return 'testcomponent---' + sId;
				}
			};

			this.oFlUtilsStub = sandbox.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);

			var done = assert.async();

			var aTexts = [{text1: "Text 1", text2: "More Text 1"}, {text1: "Text 2", text2: "More Text 2"}, {text1: "Text 3", text2: "More Text 3"}];
			var oModel = new JSONModel({
				texts : aTexts
			});

			this.oItemTemplate = new CustomListItem("item", {
				content : new VBox("vbox", {
					items : [
						new Text("text1", {text : "{text1}"}),
						new Text("text2", {text : "{text2}"})
					]
				})
			});
			this.oList = new List("list", {
				items : {
					path : "/texts",
					template : this.oItemTemplate,
					templateShareable : true
				}
			}).setModel(oModel);

			this.oList.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oVBox = this.oList.getItems()[1].getContent()[0];
			this.oText1 = this.oList.getItems()[1].getContent()[0].getItems()[0];
			this.oText2 = this.oList.getItems()[1].getContent()[0].getItems()[1];

			this.oDesignTime = new DesignTime({
				rootElements : [this.oList]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oListOverlay = OverlayRegistry.getOverlay(this.oList);
				this.oVboxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				this.oText1Overlay = OverlayRegistry.getOverlay(this.oText1);
				this.oText2Overlay = OverlayRegistry.getOverlay(this.oText2);
				done();
			}.bind(this));

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.removeRegistryItem({controlType : "sap.m.Text"});

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Text": {
					combineStuff : {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy,
						revertChange: function() {}
					}
				}
			});
		},
		afterEach : function() {
			sandbox.restore();
			this.oFlUtilsStub.restore();
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when getting a combine change command for a bound control deep inside a bound list control,", function(assert) {
			sandbox.stub(this.oText1Overlay, "getRelevantContainer").returns(this.oVBox);
			sandbox.stub(FlexCommand.prototype, "prepare").returns(true);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						combine : {
							changeType: "combineStuff",
							changeOnRelevantContainer : true,
							isEnabled : true
						}
					},
					getRelevantContainer: function() {
						return this.oVBox;
					}.bind(this)
				}
			});

			return CommandFactory.getCommandFor(this.oText1, "combine", {
				source : this.oText2,
				combineElements : [
					this.oText1,
					this.oText2
				]
			}, oDesignTimeMetadata)

			.then(function(oCombineCommand) {
				assert.ok(oCombineCommand, "then command is available");
				assert.equal(oCombineCommand.getSource(), oCombineCommand.getCombineElements()[1], "ok");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
