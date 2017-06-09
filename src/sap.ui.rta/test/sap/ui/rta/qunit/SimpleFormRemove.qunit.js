jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "sap/ui/rta");
}

jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.dt.plugin.TabHandling");
jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
jQuery.sap.require("sap.ui.rta.plugin.Remove");
jQuery.sap.require("sap.ui.rta.command.CommandFactory");

(function(DesignTime, OverlayRegistry, TabHandlingPlugin, MouseSelectionPlugin, RemovePlugin, CommandFactory) {
	"use strict";

	var fnParamerizedTest = function(oSimpleFormLayout) {

		var oComponent;
		var oView;
		var oDesignTime;
		var oSimpleForm;
		var oRemove;

		var sandbox = sinon.sandbox.create();
		var CommandFactory = new sap.ui.rta.command.CommandFactory();

		QUnit.module("Given the SimpleForm in RTA using " + oSimpleFormLayout, {
			beforeEach : function(assert) {

				oComponent = new sap.ui.core.UIComponent();
				sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

				var done = assert.async();

				oView = sap.ui.xmlview(oComponent.createId("testView"), "sap.ui.rta.test.TestSimpleForm");
				oSimpleForm = sap.ui.getCore().byId(oView.createId("SimpleForm0"));
				oSimpleForm.setLayout(oSimpleFormLayout);
				oView.placeAt("content");

				sap.ui.getCore().applyChanges();

				var oTabHandlingPlugin = new TabHandlingPlugin();
				var oSelectionPlugin = new MouseSelectionPlugin();

				oRemove = new RemovePlugin({
					commandFactory : CommandFactory
				}).attachEvent("elementModified", function(oEvent) {
					var oCommand = oEvent.getParameter("command");
					assert.ok(oCommand instanceof sap.ui.rta.command.BaseCommand,
							"then an ElementModified event is receieved with a remove command");
					oCommand.execute();
				}, this);

				oDesignTime = new sap.ui.dt.DesignTime({
					plugins : [oTabHandlingPlugin, oSelectionPlugin],
					rootElements : [oView]
				});

				oDesignTime.attachEventOnce("synced", function() {
					done();
				});

			},

			afterEach : function() {
				sandbox.restore();
				oComponent.destroy();
				oView.destroy();
				oDesignTime.destroy();
				oRemove.destroy();
			}
		});


		QUnit.test("When removing Group1 and undoing the action", function(assert) {

			var done = assert.async();
			var oElementGroup1;
			oRemove.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an Remove event is recieved with a remove command");

				var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.equal(iPosition, -1, "and Group1 does not exist any more");

				oCommand.undo();
				sap.ui.getCore().applyChanges();

				oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
				aFormContainers = oSimpleFormForm.getFormContainers();
				var iPositionAfterUndo = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.equal(iPositionAfterUndo, 1, "and after the undo the Group1 is back");

				done();
			}, this);

			oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());

			oRemove.removeElement([oElementOverlay]);

		});

		QUnit.test("When removing all groups and undoing the action", function(assert) {

			var done = assert.async();
			var sID;
			var oElementGroup, oElementOverlay, oSimpleFormForm;
			var aElements = [];
			var aFormContainers = [];

			oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
			aFormContainers = oSimpleFormForm.getFormContainers();
			assert.equal(aFormContainers.length, 5, "There are 5 Groups before remove command");

			oRemove.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then a Remove event is received with a remove command for all groups");

				oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
				aFormContainers = oSimpleFormForm.getFormContainers();
				assert.equal(aFormContainers.length, 1, "and simpleform creates one group where the 5 groups were");

				oCommand.undo();
				sap.ui.getCore().applyChanges();

				oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
				aFormContainers = oSimpleFormForm.getFormContainers();
				assert.equal(aFormContainers.length, 5, "and after the undo only the original 5 groups are back");

				done();
			}, this);

			for (var i = 0; i <= 3; i++){
				sID = "testView--Group" + i;
				oElementGroup = sap.ui.getCore().byId(oComponent.createId(sID));
				oElementOverlay = OverlayRegistry.getOverlay(oElementGroup.getParent());
				aElements.push(oElementOverlay);
			}
			oElementGroup = sap.ui.getCore().byId(oComponent.createId("testView--Group42"));
			oElementOverlay = OverlayRegistry.getOverlay(oElementGroup.getParent());
			aElements.push(oElementOverlay);

			oRemove.removeElement(aElements);

		});

	};

	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.GridLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout);

	}(sap.ui.dt.DesignTime, sap.ui.dt.OverlayRegistry, sap.ui.dt.plugin.TabHandling,
		sap.ui.dt.plugin.MouseSelection, sap.ui.rta.plugin.Remove, sap.ui.rta.command.CommandFactory));
