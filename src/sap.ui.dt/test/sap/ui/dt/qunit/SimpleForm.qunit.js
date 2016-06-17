jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "sap/ui/dt");
}

jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.dt.plugin.TabHandling");
jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
jQuery.sap.require("sap.ui.dt.plugin.CutPaste");

jQuery.sap.require("sap.ui.dt.plugin.ElementMover");
(function(DesignTime, OverlayRegistry, TabHandlingPlugin, MouseSelectionPlugin, CutPastePlugin, ElementMover) {

	var aMOVABLE_TYPES = ["sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];

	var fnParamerizedTest = function(oSimpleFormLayout) {

		var oView;
		var oCutPaste;
		var oDesignTime;
		var oSimpleForm;

		QUnit.module("Given the SimpleForm using " + oSimpleFormLayout, {
			beforeEach : function(assert) {

				var done = assert.async();

				oView = sap.ui.xmlview("testView", "dt.view.TestSimpleForm");
				oSimpleForm = sap.ui.getCore().byId("testView--SimpleForm0");
				oSimpleForm.setLayout(oSimpleFormLayout);
				oView.placeAt("content");

				sap.ui.getCore().applyChanges();

				var oTabHandlingPlugin = new TabHandlingPlugin();
				var oSelectionPlugin = new MouseSelectionPlugin();
				oCutPaste = new CutPastePlugin({
					movableTypes : aMOVABLE_TYPES
				});

				oDesignTime = new sap.ui.dt.DesignTime({
					plugins : [oTabHandlingPlugin, oSelectionPlugin, oCutPaste],
					rootElements : [oView]
				});

				oDesignTime.attachEventOnce("synced", function() {
					done();
				});

			},

			afterEach : function() {
				oView.destroy();
				oDesignTime.destroy();
				oCutPaste.destroy();
			}
		});

		QUnit.test("When moving titel1 to position of titel2", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.ok(iPosition === 2, "and the titel1 is now located at index 2");
				done();
			}, this);

			var oElementGroup1 = sap.ui.getCore().byId("testView--Group1")
			var oElementGroup2 = sap.ui.getCore().byId("testView--Group2")
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving titel1 to position of titel2 and undoing the move", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();
				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.ok(iPosition === 1, "and the titel1 is again located at index 1");
				done();
			}, this);

			var oElementGroup1 = sap.ui.getCore().byId("testView--Group1")
			var oElementGroup2 = sap.ui.getCore().byId("testView--Group2")
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving titel2 to position of titel1", function(assert) {

			var done = assert.async();

			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.ok(iPosition === 1, "and the titel2 is now located at index 1");
				done();
			}, this);

			var oElementGroup2 = sap.ui.getCore().byId("testView--Group1")
			var oElementGroup1 = sap.ui.getCore().byId("testView--Group2")
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving titel2 to position of titel1 and undoing the move", function(assert) {

			var done = assert.async();

			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();
				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.ok(iPosition === 2, "and the titel2 is again located at index 2");
				done();
			}, this);

			var oElementGroup2 = sap.ui.getCore().byId("testView--Group1")
			var oElementGroup1 = sap.ui.getCore().byId("testView--Group2")
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving within group1 label1 to position of label2", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 4, "and the label1 is now located at index 4");
				assert.ok(iPositionInput1 === 5, "and the Input1 is now located at index 5");
				assert.ok(iPositionInput2 === 6, "and the Input2 is now located at index 6");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oElement1 = sap.ui.getCore().byId("testView--Input3").getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving within group1 label1 to position of label2 and undoing the move", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 2, "and after undo the label1 is again located at index 2");
				assert.ok(iPositionInput1 === 3, "and after undo the Input1 is again located at index 3");
				assert.ok(iPositionInput2 === 4, "and after undo the Input2 is again located at index 4");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oElement1 = sap.ui.getCore().byId("testView--Input3").getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label1 between group1 and group3 to position of label6", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));
				var iPositionLabel6 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label6"));
				var iPositionInput9 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input9"));

				assert.ok(iPositionLabel1 === 14, "and the label1 is now located at index 14");
				assert.ok(iPositionInput1 === 15, "and the Input1 is now located at index 15");
				assert.ok(iPositionInput2 === 16, "and the Input2 is now located at index 16");

				assert.ok(iPositionLabel6 === 17, "and the label6 is still located at index 17");
				assert.ok(iPositionInput9 === 18, "and the Input1 is still located at index 18");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oElement1 = sap.ui.getCore().byId("testView--Input9").getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label1 between group1 and group3 to position of label6 and undoing the move", function(
				assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));
				var iPositionLabel6 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label6"));
				var iPositionInput9 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input9"));

				assert.ok(iPositionLabel1 === 2, "and the label1 is again located at index 2");
				assert.ok(iPositionInput1 === 3, "and the Input1 is again located at index 3");
				assert.ok(iPositionInput2 === 4, "and the Input2 is again located at index 4");

				assert.ok(iPositionLabel6 === 17, "and the label6 is still located at index 17");
				assert.ok(iPositionInput9 === 18, "and the Input1 is still located at index 18");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oElement1 = sap.ui.getCore().byId("testView--Input9").getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label2 into empty first group0", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 1, "and the label1 is now located at index 1");
				assert.ok(iPositionInput1 === 2, "and the Input1 is now located at index 2");
				assert.ok(iPositionInput2 === 3, "and the Input2 is now located at index 3");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId("testView--Group0");
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label1 into empty first group0 and undoing the move", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 2, "and the label1 is again located at index 2");
				assert.ok(iPositionInput1 === 3, "and the Input1 is again located at index 3");
				assert.ok(iPositionInput2 === 4, "and the Input2 is again located at index 4");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId("testView--Group0");
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label2 into empty last group42", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 21, "and the label1 is now located at index 21");
				assert.ok(iPositionInput1 === 22, "and the Input1 is now located at index 22");
				assert.ok(iPositionInput2 === 23, "and the Input2 is now located at index 23");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId("testView--Group42");
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

		QUnit.test("When moving label1 into empty last group42 and undoing the move", function(assert) {

			var done = assert.async();
			oCutPaste.attachElementModified(function(oEvent) {

				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.undo();
				sap.ui.getCore().applyChanges();

				var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
				var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Label1"));
				var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input1"));
				var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId("testView--Input2"));

				assert.ok(iPositionLabel === 2, "and the label1 is again located at index 2");
				assert.ok(iPositionInput1 === 3, "and the Input1 is again located at index 3");
				assert.ok(iPositionInput2 === 4, "and the Input2 is again located at index 4");

				done();
			}, this);

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId("testView--Group42");
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

		});

	};

	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.GridLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout);

}(sap.ui.dt.plugin.ElementMover, sap.ui.dt.OverlayRegistry, sap.ui.dt.plugin.TabHandling,
		sap.ui.dt.plugin.MouseSelection, sap.ui.dt.plugin.CutPaste));
