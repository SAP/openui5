/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/m/Label",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/Input",
	"sap/m/DatePicker",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button"
],
function(
	DesignTime,
	OverlayRegistry,
	ElementUtil,
	Label,
	SimpleForm,
	Title,
	Input,
	DatePicker,
	VerticalLayout,
	Button
) {
	"use strict";

	QUnit.module("Given that a DesignTime is created for a SimpleForm and designTimeMetadata for SimpleForm hidden form is provided", {
		beforeEach: function(assert) {
			this.oLabel = new Label({text:"Name"});

			this.oSimpleForm = new SimpleForm("Form1", {
				maxContainerCols: 2,
				editable: true,
				content:[
					new Title({text:"Person"}),
					this.oLabel,
					new Input({value:"Max"}),
					new Input({value:"Mustermann"}),
					new Label({text:"Date of birth"}),
					new DatePicker({valueFormat:"yyyyMMdd", value:"19990909"}),
					new Label({text:"Gender"})
				]
			});

			this.oVerticalLayout = new VerticalLayout({content: [this.oSimpleForm, this.oLabel]});

			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: {
					"sap.ui.layout.form.SimpleForm" : {
						aggregations: {
							content: {
								ignore: true
							},
							form: {
								ignore: false
							}
						}
					}
				},
				rootElements: [this.oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				done();
			});
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oSimpleForm.destroy();
		}
	}, function () {
		QUnit.test("when the content is added to a SimpleForm ...", function(assert) {
			var oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
			var oFormAggregationOverlay = oSimpleFormOverlay.getAggregationOverlay("form");
			assert.ok(oFormAggregationOverlay, "aggregation overlay for not ignored aggregation is created");
		});

		QUnit.test("when the content is added to a SimpleForm ...", function(assert) {
			var fnDone = assert.async();
			this.oButton = new Button("button1", {text : "Button"});
			this.oSimpleForm.addContent(this.oButton);

			this.oDesignTime.attachEventOnce("synced", function() {
				var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				assert.ok(oButtonOverlay, "overlay for button exists");
				assert.ok(oButtonOverlay.isRendered(), "overlay for button is rendered");
				assert.ok(oButtonOverlay.isVisible(), "overlay is visible");
				fnDone();
			}, this);

		});

		QUnit.test("when the label is inserted to a SimpleForm ...", function(assert) {
			var oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
			this.oSimpleForm.insertContent(this.oLabel, 3);
			assert.ok(!oLabelOverlay.bIsDestroyed, "overlay for label wasn't destroyed");
		});

		QUnit.test("when getIndex is called in a simpleForm", function(assert) {
			var oForm = this.oSimpleForm.getAggregation('form');
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			var fnGetIndex = oFormOverlay.getDesignTimeMetadata().getAggregation('formContainers').getIndex;
			assert.equal(fnGetIndex(oForm), 1, "then the new index should be 1");
		});

		QUnit.test("when getIndex is called in a simpleForm with a sibling", function(assert) {
			var oForm = this.oSimpleForm.getAggregation('form');
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			var fnGetIndex = oFormOverlay.getDesignTimeMetadata().getAggregation('formContainers').getIndex;
			assert.equal(fnGetIndex(oForm, oForm.getFormContainers()[0]), 1, "then the new index should be 1");
		});

		QUnit.test("when getIndex is called in a simpleForm without Title", function(assert) {
			var oForm = this.oSimpleForm.getAggregation('form');
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			var fnGetIndex = oFormOverlay.getDesignTimeMetadata().getAggregation('formContainers').getIndex;
			oForm.getFormContainers()[0].removeAllFormElements();
			this.oSimpleForm.removeContent(oForm.getAggregation("formContainers")[0].getTitle());
			assert.equal(fnGetIndex(oForm), 0, "then the new index should be 0");
		});

		QUnit.test("when rename is called in a simpleForm without Title", function(assert) {
			var oFirstFormContainer = this.oSimpleForm.getAggregation('form').getAggregation('formContainers')[0];
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFirstFormContainer);
			var fnRename = oFormContainerOverlay.getDesignTimeMetadata().getData().actions.rename;
			this.oSimpleForm.removeContent(oFirstFormContainer.getTitle());
			assert.equal(fnRename(oFirstFormContainer).isEnabled, false, "then the rename should not be enabled");
		});

		QUnit.test("when remove is called in a simpleForm without Title", function(assert) {
			var oFirstFormContainer = this.oSimpleForm.getAggregation('form').getAggregation('formContainers')[0];
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFirstFormContainer);
			var fnRemove = oFormContainerOverlay.getDesignTimeMetadata().getData().actions.remove;
			this.oSimpleForm.removeContent(oFirstFormContainer.getTitle());
			assert.equal(fnRemove(oFirstFormContainer).isEnabled, false, "then the remove should not be enabled");
		});
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});

	QUnit.start();
});