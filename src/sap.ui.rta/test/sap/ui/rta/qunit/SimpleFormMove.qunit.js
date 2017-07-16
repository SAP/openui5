/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "sap/ui/rta");
}

jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.dt.plugin.TabHandling");
jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
jQuery.sap.require("sap.ui.rta.plugin.CutPaste");
jQuery.sap.require("sap.ui.rta.plugin.RTAElementMover");
jQuery.sap.require("sap.ui.rta.command.CommandFactory");

(function(DesignTime, OverlayRegistry, TabHandlingPlugin, MouseSelectionPlugin, CutPastePlugin, RTAElementMover, CommandFactory) {
	"use strict";

	var MOVABLE_TYPES = ["sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];

	var fnParamerizedTest = function(oSimpleFormLayout) {

		var oComponent;
		var oView;
		var oCutPaste;
		var oDesignTime;
		var oSimpleForm;
		var oRTAElementMover;

		var sandbox = sinon.sandbox.create();
		var CommandFactory = new sap.ui.rta.command.CommandFactory();

		QUnit.module("Given the SimpleForm in RTA using " + oSimpleFormLayout, {
			beforeEach : function(assert) {

				oComponent = new sap.ui.core.UIComponent();
				sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

				oRTAElementMover = new RTAElementMover({
					movableTypes : MOVABLE_TYPES
				});

				oRTAElementMover.setCommandFactory(CommandFactory);

				var done = assert.async();

				oView = sap.ui.xmlview(oComponent.createId("testView"), "sap.ui.rta.test.TestSimpleForm");
				oSimpleForm = sap.ui.getCore().byId(oView.createId("SimpleForm0"));
				oSimpleForm.setLayout(oSimpleFormLayout);
				oView.placeAt("content");

				sap.ui.getCore().applyChanges();

				var oTabHandlingPlugin = new TabHandlingPlugin();
				var oSelectionPlugin = new MouseSelectionPlugin();
				oCutPaste = new CutPastePlugin({
					movableTypes : MOVABLE_TYPES,
					elementMover : oRTAElementMover
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
				sandbox.restore();
				oComponent.destroy();
				oView.destroy();
				oDesignTime.destroy();
				oCutPaste.destroy();
			}
		});

		QUnit.test("When moving titel1 to position of titel2", function(assert) {
			var done = assert.async();
			var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementGroup2 = sap.ui.getCore().byId(oComponent.createId("testView--Group2"));
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
				var aFormContainers = oSimpleFormForm.getFormContainers();
				var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
				assert.equal(iPosition, 2, "and the titel1 is now located at index 2");
				done();
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving titel1 to position of titel2 using pure command", function(assert) {
			var done = assert.async();
			var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
			var oSimpleForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0"));
			var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementGroup2 = sap.ui.getCore().byId(oComponent.createId("testView--Group2"));
			var aFormContainers = oSimpleFormForm.getFormContainers();
			var iSourceIndex = aFormContainers.indexOf(oElementGroup1.getParent());
			var iTargetIndex = aFormContainers.indexOf(oElementGroup2.getParent());
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());

			var oMove = CommandFactory.getCommandFor(oSimpleForm, "Move", {
				movedElements : [{
					element : oElementGroup1.getParent(),
					sourceIndex : iSourceIndex,
					targetIndex : iTargetIndex
				}],
				source : {
					publicAggregation : "form",
					publicParent : oSimpleForm,
					aggregation : "formContainers",
					parent : oSimpleFormForm
				},
				target : {
					publicAggregation : "form",
					publicParent : oSimpleForm,
					aggregation : "formContainers",
					parent : oSimpleFormForm
				}
			}, oSourceOverlay.getParentAggregationOverlay().getDesignTimeMetadata());

			oCutPaste.attachElementModified(function(oEvent) {
				sap.ui.getCore().applyChanges();
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute().then( function() {
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 2, "and the titel1 is now located at index 2");
					done();
				});
			}, this);

			oCutPaste.fireElementModified({
				"command" : oMove
			});
		});

		QUnit.test("When moving titel1 to position of titel2 and undoing the move", function(assert) {
			var done = assert.async();
			var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementGroup2 = sap.ui.getCore().byId(oComponent.createId("testView--Group2"));
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 1, "and the titel1 is again located at index 1");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving titel2 to position of titel1", function(assert) {
			var done = assert.async();
			var oElementGroup2 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group2"));
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");

				oCommand.execute()

				.then(function() {
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 1, "and the titel2 is now located at index 1");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving titel2 to position of titel1 and undoing the move", function(assert) {
			var done = assert.async();
			var oElementGroup2 = sap.ui.getCore().byId(oComponent.createId("testView--Group1"));
			var oElementGroup1 = sap.ui.getCore().byId(oComponent.createId("testView--Group2"));
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 2, "and the titel2 is again located at index 2");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving within group1 label1 to position of label2", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Input3")).getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then( function() {
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 4, "and the label1 is now located at index 4");
					assert.equal(iPositionInput1, 5, "and the Input1 is now located at index 5");
					assert.equal(iPositionInput2, 6, "and the Input2 is now located at index 6");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving within group1 label1 to position of label2 with pure command", function(assert) {
			var done = assert.async();
			var oLabel1 = sap.ui.getCore().byId(oComponent.createId("testView--Label1"));
			var oLabel2 = sap.ui.getCore().byId(oComponent.createId("testView--Label2"));
			var oFormContainer = oLabel1.getParent().getParent();
			var aFormElements = oFormContainer.getFormElements();
			var iSourceIndex = aFormElements.indexOf(oLabel1.getParent());
			var iTargetIndex = aFormElements.indexOf(oLabel2.getParent());

			var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form"));
			var oSimpleForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0"));
			var oSourceOverlay = OverlayRegistry.getOverlay(oLabel1.getParent());

			var oMove = CommandFactory.getCommandFor(oSimpleForm, "Move", {
				element : oSimpleFormForm,
				movedElements : [{
					element : oLabel1.getParent(),
					sourceIndex : iSourceIndex,
					targetIndex : iTargetIndex
				}],
				source : {
					publicAggregation : "form",
					publicParent : oSimpleForm,
					aggregation : "formElements",
					index : iSourceIndex,
					parent : oFormContainer
				},
				target : {
					publicAggregation : "form",
					publicParent : oSimpleForm,
					aggregation : "formElements",
					index : iTargetIndex,
					parent : oFormContainer
				}
			}, oSourceOverlay.getParentAggregationOverlay().getDesignTimeMetadata());

			oCutPaste.attachElementModified(function(oEvent) {
				sap.ui.getCore().applyChanges();
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then( function() {
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 4, "and the label1 is now located at index 4");
					assert.equal(iPositionInput1, 5, "and the Input1 is now located at index 5");
					assert.equal(iPositionInput2, 6, "and the Input2 is now located at index 6");
					done();
				});
			}, this);

			oCutPaste.fireElementModified({
				"command" : oMove
			});

		});

		QUnit.test("When moving within group1 label1 to position of label2 and undoing the move", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Input3")).getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 2, "and after undo the label1 is again located at index 2");
					assert.equal(iPositionInput1, 3, "and after undo the Input1 is again located at index 3");
					assert.equal(iPositionInput2, 4, "and after undo the Input2 is again located at index 4");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label1 between group1 and group3 to position of label6", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Input9")).getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(function() {
					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));
					var iPositionLabel6 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label6")));
					var iPositionInput9 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input9")));

					assert.equal(iPositionLabel1, 14, "and the label1 is now located at index 14");
					assert.equal(iPositionInput1, 15, "and the Input1 is now located at index 15");
					assert.equal(iPositionInput2, 16, "and the Input2 is now located at index 16");
					assert.equal(iPositionLabel6, 17, "and the label6 is still located at index 17");
					assert.equal(iPositionInput9, 18, "and the Input1 is still located at index 18");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label1 between group1 and group3 to position of label6 and undoing the move", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Input9")).getParent();
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));
					var iPositionLabel6 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label6")));
					var iPositionInput9 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input9")));

					assert.equal(iPositionLabel1, 2, "and the label1 is again located at index 2");
					assert.equal(iPositionInput1, 3, "and the Input1 is again located at index 3");
					assert.equal(iPositionInput2, 4, "and the Input2 is again located at index 4");
					assert.equal(iPositionLabel6, 17, "and the label6 is still located at index 17");
					assert.equal(iPositionInput9, 18, "and the Input1 is still located at index 18");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label2 into empty first group0", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Group0"));
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(function() {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 1, "and the label1 is now located at index 1");
					assert.equal(iPositionInput1, 2, "and the Input1 is now located at index 2");
					assert.equal(iPositionInput2, 3, "and the Input2 is now located at index 3");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label1 into empty first group0 and undoing the move", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Group0"));
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 2, "and the label1 is again located at index 2");
					assert.equal(iPositionInput1, 3, "and the Input1 is again located at index 3");
					assert.equal(iPositionInput2, 4, "and the Input2 is again located at index 4");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label2 into empty last group42", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Group42"));
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then( function() {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 21, "and the label1 is now located at index 21");
					assert.equal(iPositionInput1, 22, "and the Input1 is now located at index 22");
					assert.equal(iPositionInput2, 23, "and the Input2 is now located at index 23");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});

		QUnit.test("When moving label1 into empty last group42 and undoing the move", function(assert) {
			var done = assert.async();
			var oElement0 = sap.ui.getCore().byId(oComponent.createId("testView--Input1")).getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId(oComponent.createId("testView--Group42"));
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.attachElementModified(function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then an ElementModified event is recieved with a move command");
				oCommand.execute()

				.then(oCommand.undo.bind(oCommand))

				.then(function () {
					sap.ui.getCore().applyChanges();

					var oSimpleFormForm = sap.ui.getCore().byId(oComponent.createId("testView--SimpleForm0--Form")).getParent();
					var iPositionLabel = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Label1")));
					var iPositionInput1 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input1")));
					var iPositionInput2 = oSimpleFormForm.getContent().indexOf(sap.ui.getCore().byId(oComponent.createId("testView--Input2")));

					assert.equal(iPositionLabel, 2, "and the label1 is again located at index 2");
					assert.equal(iPositionInput1, 3, "and the Input1 is again located at index 3");
					assert.equal(iPositionInput2, 4, "and the Input2 is again located at index 4");
					done();
				});
			}, this);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);
		});
	};

	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.GridLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout);

}(sap.ui.dt.plugin.ElementMover, sap.ui.dt.OverlayRegistry, sap.ui.dt.plugin.TabHandling,
	sap.ui.dt.plugin.MouseSelection, sap.ui.rta.plugin.CutPaste, sap.ui.rta.plugin.RTAElementMover,
	sap.ui.rta.command.CommandFactory));