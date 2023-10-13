/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/changeHandler/AddXML",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/List",
	"sap/m/CustomListItem",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	CommandFactory,
	AddXML,
	ChangesWriteAPI,
	Layer,
	LayerUtils,
	DesignTime,
	OverlayRegistry,
	ElementDesignTimeMetadata,
	JSONModel,
	Button,
	Text,
	List,
	CustomListItem,
	RtaQunitUtils,
	sinon,
	nextUIUpdate
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given an AddXML command with a valid entry in the change registry,", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);
			this.oButton = new Button(this.oComponent.createId("myButton"));
		},
		afterEach() {
			this.oComponent.destroy();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an AddXML command for the change ...", function(assert) {
			var sPath = "someName/changes/pathToFragment";
			var sFragment = "fragment";
			var oApplyChangeStub = sandbox.stub(AddXML, "applyChange");
			var oCompleteChangeContentSpy = sandbox.spy(AddXML, "completeChangeContent");
			var oPreloadSpy = sandbox.spy(sap.ui.require, "preload");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			});

			return oCommandFactory.getCommandFor(this.oButton, "addXML", {
				fragmentPath: "pathToFragment",
				fragment: sFragment,
				targetAggregation: "targetAggregation",
				index: 0
			})

			.then(function(oAddXmlCommand) {
				assert.ok(oAddXmlCommand, "then command without flex settings is available");
				assert.strictEqual(oAddXmlCommand.getTargetAggregation(), "targetAggregation", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragment(), sFragment, "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getIndex(), 0, "and its settings are merged correctly");
			})

			.then(function() {
				oCommandFactory.setFlexSettings({
					layer: Layer.VENDOR,
					developerMode: true
				});
				return oCommandFactory.getCommandFor(this.oButton, "addXML", {
					fragmentPath: "pathToFragment",
					fragment: sFragment,
					targetAggregation: "targetAggregation",
					index: 0
				});
			}.bind(this))

			.then(function(oAddXmlCommand) {
				assert.ok(oAddXmlCommand, "then command with flex settings is available");
				assert.strictEqual(oAddXmlCommand.getTargetAggregation(), "targetAggregation", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragment(), sFragment, "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getIndex(), 0, "and its settings are merged correctly");
				oCommandFactory.setFlexSettings({
					layer: Layer.VENDOR,
					developerMode: false
				});
				assert.notOk(oAddXmlCommand._oPreparedChange.getContent().fragment, "after preparing, the fragment content is not yet in the change");
				return oAddXmlCommand.execute()

				.then(function() { return oAddXmlCommand; });
			})

			.then(function(oAddXmlCommand) {
				assert.equal(oCompleteChangeContentSpy.callCount, 2, "then completeChangeContent is called twice");
				assert.equal(oApplyChangeStub.callCount, 1, "then applyChange is called once");
				assert.notOk(oAddXmlCommand._oPreparedChange.getContent.fragment, "after applying, the fragment content is not in the change anymore");
				assert.ok(oPreloadSpy.lastCall.args[0][sPath], "the preload was called with the correct object");
				assert.equal(oPreloadSpy.lastCall.args[0][sPath], sFragment, "the preload was called with the correct object");
			})

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		["not-adaptable", null].forEach(function(vAction) {
			var sTitle = `when the action is disabled in the designtime via ${vAction}`;
			QUnit.test(sTitle, function(assert) {
				var oNewDesigntime = new ElementDesignTimeMetadata({
					data: {
						actions: {
							addXML: vAction
						}
					}
				});
				var oCommandFactory = new CommandFactory({
					flexSettings: {
						layer: Layer.VENDOR
					}
				});

				return oCommandFactory.getCommandFor(this.oButton, "addXML", {
					fragmentPath: "pathToFragment",
					fragment: "{@i18n>Foo}",
					targetAggregation: "targetAggregation",
					index: 0
				}, oNewDesigntime)

				.then(function(oAddXmlCommand) {
					assert.ok(oAddXmlCommand, `then command is still available with ${vAction} in the designtime`);
				});
			});
		});

		QUnit.test("When addXML is created with a fragment string containing a binding", function(assert) {
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			});

			return oCommandFactory.getCommandFor(this.oButton, "addXML", {
				fragmentPath: "pathToFragment",
				fragment: "{@i18n>Foo}",
				targetAggregation: "targetAggregation",
				index: 0
			})

			.then(function(oAddXmlCommand) {
				assert.ok(oAddXmlCommand, "then command without flex settings is available");
				assert.strictEqual(oAddXmlCommand.getTargetAggregation(), "targetAggregation", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getFragment(), "{@i18n>Foo}", "and its settings are merged correctly");
				assert.strictEqual(oAddXmlCommand.getIndex(), 0, "and its settings are merged correctly");
			});
		});

		QUnit.test("and design time metadata allows change on js only, when getting an AddXML command for the change ...", function(assert) {
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR,
					developerMode: true
				}
			});

			return oCommandFactory.getCommandFor(this.oButton, "addXML", {
				fragmentPath: "pathToFragment",
				fragment: "fragment",
				targetAggregation: "targetAggregation",
				index: 0
			}, new ElementDesignTimeMetadata({
				data: {
					actions: {
						addXML: {
							jsOnly: true
						}
					}
				}
			}))

			.then(function(oAddXmlCommand) {
				var oChange = oAddXmlCommand.getPreparedChange();
				assert.strictEqual(oChange.getJsOnly(), true, "then change is marked to be applied on js only");
			})

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});
	});

	QUnit.module("Given an AddXML command for a bound control,", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);

			var aTexts = [{text: "Text 1"}, {text: "Text 2"}, {text: "Text 3"}];
			var oModel = new JSONModel({
				texts: aTexts
			});

			this.oItemTemplate = new CustomListItem("item", {
				content: new Text("text", {text: "{text}"})
			});
			this.oList = new List("list", {
				items: {
					path: "/texts",
					template: this.oItemTemplate
				}
			}).setModel(oModel);
			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oList]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oListOverlay = OverlayRegistry.getOverlay(this.oList);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oComponent.destroy();
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an AddXML command for the change ...", function(assert) {
			var oApplyChangeStub = sandbox.stub(AddXML, "applyChange");
			var oCompleteChangeContentSpy = sandbox.spy(AddXML, "completeChangeContent");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR,
					developerMode: true
				}
			});

			return oCommandFactory.getCommandFor(this.oList.getItems()[1], "addXML", {
				fragmentPath: "pathToFragment",
				fragment: "fragment",
				targetAggregation: "content",
				index: 0
			})

			.then(function(oCommand) {
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getTargetAggregation(), "content", "and its settings are merged correctly");
				assert.strictEqual(oCommand.getFragmentPath(), "pathToFragment", "and its settings are merged correctly");
				assert.strictEqual(oCommand.getFragment(), "fragment", "and its settings are merged correctly");
				assert.strictEqual(oCommand.getIndex(), 0, "and its settings are merged correctly");
				assert.strictEqual(oCommand.getPreparedChange().getSelector().id, this.oList.getId(), "and the prepared change contains the bound control as template selector");
				assert.strictEqual(oCommand.getPreparedChange().getOriginalSelector().id, "item", "and the prepared change contains the original selector as dependency");
				assert.strictEqual(oCommand.getPreparedChange().getContent().boundAggregation, "items", "and the bound aggegation is written to the change content");
				return oCommand.execute().then(function() { return oCommand; });
			}.bind(this))

			.then(function(oCommand) {
				assert.equal(oCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(oApplyChangeStub.callCount, 1, "then applyChange is called once");
				assert.notOk(oCommand._oPreparedChange.getContent().fragment, "after applying, the fragment content is not in the change anymore");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
