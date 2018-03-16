/*global QUnit*/

sap.ui.require([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/plugin/Remove",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon",
	"sap/ui/model/json/JSONModel"
],
function(
	DesignTime,
	OverlayRegistry,
	RemovePlugin,
	List,
	CustomListItem,
	Button,
	HorizontalLayout,
	CommandFactory,
	ChangeRegistry,
	Sinon,
	JSONModel
) {
	"use strict";

	var oMockedAppComponent = {
			getLocalId: function () {
				return undefined;
			},
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

	Sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	var sandbox = Sinon.sandbox.create();

	QUnit.module("Given a List with bound items and a List with unbound items", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.StandardListItem" : {
					"hideControl" : "default"
				},
				"sap.m.Button" : {
					"hideControl" : "default"
				}
			});

			// create list with bound items
			var oData = [
				{text: "item1-bound"},
				{text: "item2-bound"}
				];
			var oModel = new JSONModel(oData);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", "/", function(sId, oContext) {
				return new CustomListItem(sId, {content: [new Button(sId + "-btn",{text:'{text}'})]});
			});

			//create list with unbound items
			this.oUnBoundList = new List("unboundlist");
			this.oUnBoundList.addItem(new CustomListItem("unboundlist-0", {content: [new Button("item1-btn",{text:'item1-unbound'})]}));
			this.oUnBoundList.addItem(new CustomListItem("unboundlist-1", {content: [new Button("item2-btn",{text:'item2-unbound'})]}));

			//create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout("horLyout",{
				content: [this.oBoundList, this.oUnBoundList]
			});
			this.oHorizontalLayout.placeAt("test-view");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oHorizontalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oBoundedOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[0]);
				this.oBoundedChildOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[0].getContent()[0]);
				this.oUnBoundedOverlay = OverlayRegistry.getOverlay(this.oUnBoundList.getItems()[0]);
				this.oUnBoundedChildOverlay = OverlayRegistry.getOverlay(this.oUnBoundList.getItems()[0].getContent()[0]);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oHorizontalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("When we check if items are editable", function(assert) {
		// aggregation binding is checked by registering overlay for plugins
		this.oRemovePlugin = new RemovePlugin({
			commandFactory : new CommandFactory()
		});
		this.oDesignTime.insertPlugin(this.oRemovePlugin);
		assert.strictEqual(this.oBoundedOverlay.isEditable(), false, "... then the bound Item is not editable");
		assert.strictEqual(this.oBoundedChildOverlay.isEditable(), false, "... then the bound Item Content is not editable");
		assert.strictEqual(this.oUnBoundedOverlay.isEditable(), true, "... then the unbound Item is editable");
		assert.strictEqual(this.oUnBoundedChildOverlay.isEditable(), true, "... then the unbound Item Content is editable");
	});

});
