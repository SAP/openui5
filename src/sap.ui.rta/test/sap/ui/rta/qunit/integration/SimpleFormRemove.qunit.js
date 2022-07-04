/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/layout/library",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core"
], function(
	XMLView,
	DesignTime,
	OverlayRegistry,
	TabHandlingPlugin,
	MouseSelectionPlugin,
	RemovePlugin,
	CommandFactory,
	sinon,
	layoutLibrary,
	RtaQunitUtils,
	oCore
) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;
	var sandbox = sinon.createSandbox();

	function fnParamerizedTest(oSimpleFormLayout) {
		var oComponent;
		var oView;
		var oDesignTime;
		var oSimpleForm;
		var oRemove;

		var oCommandFactory = new CommandFactory();

		QUnit.module("Given the SimpleForm in RTA using " + oSimpleFormLayout, {
			beforeEach: function(assert) {
				oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

				var done = assert.async();

				XMLView.create({
					id: oComponent.createId("qunit-fixture"),
					viewName: "sap.ui.rta.test.TestSimpleForm"
				}).then(function(oCreatedView) {
					oView = oCreatedView;
					return oView.loaded();
				}).then(function() {
					oSimpleForm = oCore.byId(oView.createId("SimpleForm0"));
					oSimpleForm.setLayout(oSimpleFormLayout);
					oView.placeAt("qunit-fixture");

					oCore.applyChanges();

					var oTabHandlingPlugin = new TabHandlingPlugin();
					var oSelectionPlugin = new MouseSelectionPlugin();

					oRemove = new RemovePlugin({
						commandFactory: oCommandFactory
					});

					oDesignTime = new DesignTime({
						plugins: [oTabHandlingPlugin, oSelectionPlugin, oRemove],
						rootElements: [oView]
					});

					oDesignTime.attachEventOnce("synced", function() {
						done();
					});
				});
			},

			afterEach: function() {
				sandbox.restore();
				oComponent.destroy();
				oView.destroy();
				oDesignTime.destroy();
				oRemove.destroy();
			}
		});

		QUnit.test("When removing Group1 and undoing the action", function(assert) {
			var done = assert.async();
			var oElementGroup1 = oCore.byId(oComponent.createId("qunit-fixture--Group1"));
			var oElementOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());

			oRemove.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an Remove event is received with a remove command");
				oCommand.execute()

				.then(function() {
					var oSimpleFormForm = oCore.byId(oComponent.createId("qunit-fixture--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, -1, "and Group1 does not exist any more");
				})

				.then(oCommand.undo.bind(oCommand))

				.then(function() {
					oCore.applyChanges();
					var oSimpleFormForm = oCore.byId(oComponent.createId("qunit-fixture--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPositionAfterUndo = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPositionAfterUndo, 1, "and after the undo the Group1 is back");
					done();
				});
			}, this);

			oRemove.removeElement([oElementOverlay]);
		});

		QUnit.test("When removing all groups and undoing the action", function(assert) {
			var done = assert.async();
			var sID;
			var oElementGroup;
			var oElementOverlay;
			var oSimpleFormForm;
			var aElements = [];
			var aFormContainers = [];

			for (var i = 0; i <= 3; i++) {
				sID = "qunit-fixture--Group" + i;
				oElementGroup = oCore.byId(oComponent.createId(sID));
				oElementOverlay = OverlayRegistry.getOverlay(oElementGroup.getParent());
				aElements.push(oElementOverlay);
			}
			oElementGroup = oCore.byId(oComponent.createId("qunit-fixture--Group42"));
			oElementOverlay = OverlayRegistry.getOverlay(oElementGroup.getParent());
			aElements.push(oElementOverlay);

			oSimpleFormForm = oCore.byId(oComponent.createId("qunit-fixture--SimpleForm0--Form"));
			aFormContainers = oSimpleFormForm.getFormContainers();
			assert.equal(aFormContainers.length, 5, "There are 5 Groups before remove command");

			oRemove.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then a Remove event is received with a remove command for all groups");
				oCommand.execute()

				.then(function() {
					oSimpleFormForm = oCore.byId(oComponent.createId("qunit-fixture--SimpleForm0--Form"));
					aFormContainers = oSimpleFormForm.getFormContainers();
					assert.equal(aFormContainers.length, 1, "and simpleform creates one group where the 5 groups were");
				})

				.then(oCommand.undo.bind(oCommand))

				.then(function() {
					oCore.applyChanges();
					oSimpleFormForm = oCore.byId(oComponent.createId("qunit-fixture--SimpleForm0--Form"));
					aFormContainers = oSimpleFormForm.getFormContainers();
					assert.equal(aFormContainers.length, 5, "and after the undo only the original 5 groups are back");
					done();
				});
			}, this);

			oRemove.removeElement(aElements);
		});
	}

	fnParamerizedTest(SimpleFormLayout.ResponsiveLayout);
	fnParamerizedTest(SimpleFormLayout.GridLayout);
	fnParamerizedTest(SimpleFormLayout.ResponsiveGridLayout);

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});