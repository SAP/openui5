/*global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/List",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function (
	Button,
	CustomListItem,
	List,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ChangesWriteAPI,
	HorizontalLayout,
	JSONModel,
	CommandFactory,
	RemovePlugin,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a List with bound items and a List with unbound items", {
		beforeEach: function(assert) {
			var done = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			// create list with bound items
			var oData = [
				{text: "item1-bound"},
				{text: "item2-bound"}
			];
			var oModel = new JSONModel(oData);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", "/", function(sId) {
				return new CustomListItem(sId, {content: [new Button(sId + "-btn", {text: '{text}'})]});
			});

			//create list with unbound items
			this.oUnBoundList = new List("unboundlist");
			this.oUnBoundList.addItem(new CustomListItem("unboundlist-0", {content: [new Button("item1-btn", {text: 'item1-unbound'})]}));
			this.oUnBoundList.addItem(new CustomListItem("unboundlist-1", {content: [new Button("item2-btn", {text: 'item2-unbound'})]}));

			//create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout("horLyout", {
				content: [this.oBoundList, this.oUnBoundList]
			});
			this.oHorizontalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oBoundedOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[0]);
				this.oBoundedChildOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[0].getContent()[0]);
				this.oUnBoundedOverlay = OverlayRegistry.getOverlay(this.oUnBoundList.getItems()[0]);
				this.oUnBoundedChildOverlay = OverlayRegistry.getOverlay(this.oUnBoundList.getItems()[0].getContent()[0]);
				done();
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oHorizontalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("When we check if items are editable", function(assert) {
			// aggregation binding is checked by registering overlay for plugins
			this.oRemovePlugin = new RemovePlugin({
				commandFactory: new CommandFactory()
			});
			this.oDesignTime.insertPlugin(this.oRemovePlugin);
			return DtUtil.waitForSynced(this.oDesignTime)()
				.then(function() {
					assert.strictEqual(this.oBoundedOverlay.isEditable(), true, "... then the bound Item is editable");
					assert.strictEqual(this.oBoundedChildOverlay.isEditable(), true, "... then the bound Item Content is editable");
					assert.strictEqual(this.oUnBoundedOverlay.isEditable(), true, "... then the unbound Item is editable");
					assert.strictEqual(this.oUnBoundedChildOverlay.isEditable(), true, "... then the unbound Item Content is editable");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
