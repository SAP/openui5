/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/LabelEnablement",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Input",
	"sap/m/Text",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/field/content/ContentFactory",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Control,
	LabelEnablement,
	Label,
	Button,
	Link,
	Input,
	Text,
	Form,
	ColumnLayout,
	FormContainer,
	FormElement,
	Field,
	ContentFactory,
	createAndAppendDiv,
	nextUIUpdate
) {
	"use strict";

	createAndAppendDiv("content");

	var AnotherTestLabel = Control.extend("AnotherTestLabel", {
		metadata : {
			interfaces : [
				"sap.ui.core.Label"
			],
			properties : {
				required : {type : "boolean", defaultValue : false}
			},
			associations : {
				labelFor : {type : "sap.ui.core.Control", multiple : false}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oCtrl) {
				oRm.openStart("label", oCtrl);
				LabelEnablement.writeLabelForAttribute(oRm, oCtrl);
				oRm.openEnd().close("label");
			}
		}
	});

	var TestLabel = Control.extend("TestLabel", {
		metadata : {
			interfaces : [
				"sap.ui.core.Label"
			],
			properties : {
				text : {type: "string", defaultValue: ""},
				required : {type : "boolean", defaultValue : false}
			},
			associations : {
				labelFor : {type : "sap.ui.core.Control", multiple : false}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oCtrl) {
				oRm.openStart("label", oCtrl);
				LabelEnablement.writeLabelForAttribute(oRm, oCtrl);
				oRm.openEnd();

				const sText = oCtrl.getText();
				if (sText) {
					oRm.text(sText);
				}

				oRm.close("label");
			}
		}
	});

	LabelEnablement.enrich(TestLabel.prototype);

	var TestControl = Control.extend("TestControl", {
		metadata : {
			associations : {
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			properties : {
				required : {type : "boolean", defaultValue : false}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oCtrl) {
				oRm.openStart("div", oCtrl)
					.accessibilityState(oCtrl, {labelledby : {value: oCtrl.getId() + "-additionalLabel", append: true}})
					.openEnd();
					oRm.openStart("label", oCtrl.getId() + "-additionalLabel")
						.openEnd()
						.close("label");
				oRm.close("div");
			}
		}
	});


	QUnit.module("LabelEnablement", {
		beforeEach : function () {
			this.oLabel = new TestLabel("testLabel");
			this.oControl1 = new TestControl("testControl1", {ariaLabelledBy: "someLabelFromApplication"});
			this.oControl2 = new TestControl("testControl2");

			this.oLabel.placeAt("content");
			this.oControl1.placeAt("content");
			this.oControl2.placeAt("content");
			return nextUIUpdate();
		},
		afterEach : function () {
			this.oLabel.destroy();
			this.oLabel = null;
			this.oControl1.destroy();
			this.oControl1 = null;
			this.oControl2.destroy();
			this.oControl2 = null;
		}
	});

	QUnit.test("Initialization", function(assert) {
		assert.throws(function(){
			LabelEnablement.enrich(new TestControl());
		}, "sap.ui.core.LabelEnablement cannot be applied on Controls which does not implement interface sap.ui.core.Label");

		try {
			LabelEnablement.enrich(new AnotherTestLabel());
		} catch (e) {
			assert.ok(false, "sap.ui.core.LabelEnablement can be applied on Controls which implement interface sap.ui.core.Label");
		}
	});

	QUnit.test("No label assignment done", function(assert) {
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 0, "No label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.ok(!this.oLabel.$().attr("for"), "Label has no for attribute");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "someLabelFromApplication testControl1-additionalLabel", "No aria-labelledby reference to label in control 1");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");
	});

	QUnit.test("Label assignment done with LabelFor association", async function(assert) {
		this.oLabel.setLabelFor(this.oControl1);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 1, "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1)[0], "testLabel", "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.strictEqual(this.oLabel.$().attr("for"), "testControl1", "Labels for attribute points to correct control");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "testLabel someLabelFromApplication testControl1-additionalLabel", "aria-labelledby reference to label in control 1 available");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");
	});

	QUnit.test("Label assignment done with setAlternativeLabelFor", async function(assert) {
		this.oLabel.setAlternativeLabelFor(this.oControl1);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 1, "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1)[0], "testLabel", "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.strictEqual(this.oLabel.$().attr("for"), "testControl1", "Labels for attribute points to correct control");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "testLabel someLabelFromApplication testControl1-additionalLabel", "aria-labelledby reference to label in control 1 available");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");
	});

	QUnit.test("Label assignment done with LabelFor association and setAlternativeLabelFor - association wins", async function(assert) {
		this.oLabel.setLabelFor(this.oControl1);
		this.oLabel.setAlternativeLabelFor(this.oControl2);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 1, "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1)[0], "testLabel", "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.strictEqual(this.oLabel.$().attr("for"), "testControl1", "Labels for attribute points to correct control");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "testLabel someLabelFromApplication testControl1-additionalLabel", "aria-labelledby reference to label in control 1 available");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");
	});

	QUnit.test("Label assignment change is reflected", async function(assert) {
		this.oLabel.setLabelFor(this.oControl1);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 1, "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1)[0], "testLabel", "Label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.strictEqual(this.oLabel.$().attr("for"), "testControl1", "Labels for attribute points to correct control");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "testLabel someLabelFromApplication testControl1-additionalLabel", "aria-labelledby reference to label in control 1 available");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");

		this.oLabel.setLabelFor(this.oControl2);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 0, "No label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 1, "Label assigned to control 2");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2)[0], "testLabel", "Label assigned to control 2");
		assert.strictEqual(this.oLabel.$().attr("for"), "testControl2", "Labels for attribute points to correct control");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "someLabelFromApplication testControl1-additionalLabel", "No aria-labelledby reference to label in control 1");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testLabel testControl2-additionalLabel", "aria-labelledby reference to label in control 2 available");

		this.oLabel.setLabelFor(null);
		await nextUIUpdate();

		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl1).length, 0, "No label assigned to control 1");
		assert.strictEqual(LabelEnablement.getReferencingLabels(this.oControl2).length, 0, "No label assigned to control 2");
		assert.ok(!this.oLabel.$().attr("for"), "Label has no for attribute");
		assert.strictEqual(this.oControl1.$().attr("aria-labelledby"), "someLabelFromApplication testControl1-additionalLabel", "No aria-labelledby reference to label in control 1");
		assert.strictEqual(this.oControl2.$().attr("aria-labelledby"), "testControl2-additionalLabel", "No aria-labelledby reference to label in control 1");
	});

	QUnit.test("_getLabelTexts with different sources", function(assert) {
		const aExpected = ["fieldHelpText", "labelEnablementText", "ariaLabelledByText"];
		this.oControl1.getFieldHelpInfo = function() {
			return { label: aExpected[0] };
		};

		this.oLabel.setText(aExpected[1]);
		this.oLabel.setLabelFor(this.oControl1);

		const oLabel1 = new TestLabel({
			text: aExpected[2]
		});

		this.oControl1.addAriaLabelledBy(oLabel1);

		const aTexts = LabelEnablement._getLabelTexts(this.oControl1);
		assert.equal(aTexts.length, 3, "3 Texts are returned");

		aTexts.forEach((sText) => {
			assert.ok(aExpected.includes(sText), `"${sText}" is expected to be returned`);
		});

		oLabel1.destroy();
	});

	QUnit.test("_getLabelTexts should filter out repeated labels", function(assert) {
		const sText = "labelText";
		this.oLabel.setText(sText);
		this.oLabel.setLabelFor(this.oControl1);

		this.oControl1.addAriaLabelledBy(this.oLabel);

		const aTexts = LabelEnablement._getLabelTexts(this.oControl1);
		assert.equal(aTexts.length, 1, "only one text is returned");

		assert.equal(aTexts[0], sText, `The returned text "${aTexts[0]}" is expected`);
	});

	QUnit.module("Required Propagation", {
		beforeEach : function () {
			this.oLabel = new TestLabel("testLabel");
			this.oControl = new TestControl("testControl");
			this.oLabel.placeAt("content");
			this.oControl.placeAt("content");
			this.oLabel.setLabelFor(this.oControl);
			return nextUIUpdate();
		},
		afterEach : function () {
			this.oLabel.destroy();
			this.oLabel = null;
			this.oControl.destroy();
			this.oControl = null;
		}
	});

// BCP 1680118922
	QUnit.test("it should invalidate the associated control only if the required property has changed", function(assert) {

		// arrange
		var fnInvalidateSpy = this.spy(this.oControl, "invalidate");

		// act
		this.oLabel.setRequired(false);

		// assert
		assert.strictEqual(fnInvalidateSpy.callCount, 0);
	});

	QUnit.test("LabelEnablement.isRequired", async function(assert) {
		assert.ok(!LabelEnablement.isRequired(this.oControl), "Control not required (own property and label property not set)");

		this.oControl.setRequired(true);
		await nextUIUpdate();
		assert.ok(LabelEnablement.isRequired(this.oControl), "Control required (explicitly via own property)");

		this.oControl.setRequired(false);
		await nextUIUpdate();
		assert.ok(!LabelEnablement.isRequired(this.oControl), "Control not required (own property and label property not set)");

		this.oLabel.setRequired(true);
		await nextUIUpdate();
		assert.ok(LabelEnablement.isRequired(this.oControl), "Control required (implicitly via label property)");

		this.oLabel.setLabelFor(null);
		await nextUIUpdate();
		assert.ok(!LabelEnablement.isRequired(this.oControl), "Control not required (own property not set and no label assigned)");
	});

	QUnit.test("aria-required", async function(assert) {
		assert.ok(!this.oControl.$().attr("aria-required"), "Control not required (own property and label property not set)");

		this.oControl.setRequired(true);
		await nextUIUpdate();
		assert.strictEqual(this.oControl.$().attr("aria-required"), "true", "Control required (explicitly via own property)");

		this.oControl.setRequired(false);
		await nextUIUpdate();
		assert.ok(!this.oControl.$().attr("aria-required"), "Control not required (own property and label property not set)");

		this.oLabel.setRequired(true);
		await nextUIUpdate();
		assert.strictEqual(this.oControl.$().attr("aria-required"), "true", "Control required (implicitly via label property)");

		this.oLabel.setLabelFor(null);
		await nextUIUpdate();
		assert.ok(!this.oControl.$().attr("aria-required"), "Control not required (own property not set and no label assigned)");
	});

	QUnit.module("Label For", {
		beforeEach : function () {
			// Labels referencing controls with labelable HTML elements
			this.oLabel1 = new Label("testLabel1");
			this.oControl1 = new Input("testInput");
			this.oLabel2 = new Label("testLabel2");
			this.oControl2 = new Button("testButton");

			// Label referencing control with non-labelable HTML elements
			this.oLabel3 = new Label("testLabel3");
			this.oControl3 = new Link("testLink");

			this.oLabel1.placeAt("content");
			this.oControl1.placeAt("content");
			this.oLabel2.placeAt("content");
			this.oControl2.placeAt("content");
			this.oLabel3.placeAt("content");
			this.oControl3.placeAt("content");

			this.oLabel1.setLabelFor(this.oControl1);
			this.oLabel2.setLabelFor(this.oControl2);
			this.oLabel3.setLabelFor(this.oControl3);

			return nextUIUpdate();
		},
		afterEach : function () {
			this.oLabel1.destroy();
			this.oControl1.destroy();
			this.oLabel2.destroy();
			this.oControl2.destroy();
			this.oLabel3.destroy();
			this.oControl3.destroy();

			this.oLabel1 = null;
			this.oControl1 = null;
			this.oLabel2 = null;
			this.oControl2 = null;
			this.oLabel3 = null;
			this.oControl3 = null;
		}
	});

// Labelable HTML elements are specified in the HTML standard.
	QUnit.test("label 'for' attribute should only reference labelable HTML elements ", function(assert) {
		assert.strictEqual(this.oLabel1.$().attr("for"), "testInput-inner", "Labels for attribute points to correct control");
		assert.strictEqual(this.oLabel2.$().attr("for"), "testButton", "Labels for attribute points to correct control");
		assert.strictEqual(this.oLabel3.$().attr("for"), undefined, "No for attribute for non-labelable elements");
	});

	QUnit.module("Label For", {
		beforeEach : function () {
			var oForm = new Form({
				title: "Form",
				editable: true,
				width: "300px",
				layout: new ColumnLayout(),
				formContainers: [
					new FormContainer({
						formElements: [
							new FormElement({
								label: new Label("lbl1", {text: "Editable"}),
								fields: [
									new Field("fld1", {
										editMode: "Editable",
										value: "Text",
										multipleLines: false
									})
								]
							}),
							new FormElement({
								label: new Label("lbl2", {text: "Display"}),
								fields: [
									new Field("fld2", {
										editMode: "Display",
										value: "Text",
										multipleLines: false
									})
								]
							})
						]
					})
				]
			}).placeAt('content');

			this.oForm = oForm;
		},
		afterEach : function () {
			this.oForm.destroy();
		}
	});

	QUnit.test("label is rendered correctly", function(assert) {
		var done = assert.async(),
			oForm = this.oForm,
			fnOriginalCreateContent = ContentFactory.prototype.createContent;

		ContentFactory.prototype.createContent = function () {
			var pResult = fnOriginalCreateContent.apply(this, arguments);

			pResult.then(function (aControls) {
				var oControl = aControls[0];
				if (oControl && oControl.isA("sap.ui.mdc.field.FieldInput")) {
					const oDelegate = {
						onAfterRendering() {
							this.removeEventDelegate(oDelegate, this);
							setTimeout(function () {
								var oLabel1DomRef = oForm.getDomRef().querySelector("#lbl1");
								var oLabel2DomRef = oForm.getDomRef().querySelector("#lbl2");

								var oField1DomRef = oForm.getDomRef().querySelector("#fld1");

								assert.strictEqual(oLabel1DomRef.tagName, "LABEL", "Label is rendered with 'label' tag.");
								assert.strictEqual(oLabel2DomRef.tagName, "SPAN", "Label is rendered with 'span' tag.");

								assert.strictEqual(oLabel1DomRef.getAttribute("for"), oField1DomRef.getAttribute("id") + "-inner-inner", "'for' attribute is correct");
								assert.notOk(oLabel2DomRef.getAttribute("for"), "'for' attribute is not set");
								done();
							}, 300);
						}
					};
					oControl.addEventDelegate(oDelegate, oControl);
				}
			});

			return pResult;
		};
	});

	QUnit.module("ILabelable interface", {
		beforeEach : function () {
			var CustomControlClass = Control.extend("CustomControlClass", {
				metadata: {
					interfaces : [
						"sap.ui.core.ILabelable"
					],
					properties: {
						isInput: {
							type: "boolean",
							defaultValue: false
						}
					}
				},
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						if (oControl.getIsInput()) {
							oRm.voidStart("input", oControl)
								.voidEnd();
						} else {
							oRm.openStart("span", oControl)
								.openEnd()
								.text("Some text")
								.close("span");
						}
					}
				},
				hasLabelableHTMLElement: function () {
					return this.getIsInput();
				}
			});

			this.oLabel = new Label({
				text: "Label",
				labelFor: "id1"
			}).placeAt("content");

			this.oControl = new CustomControlClass("id1", {
				isInput: true
			}).placeAt("content");

			return nextUIUpdate();
		},
		afterEach : function () {
			this.oLabel.destroy();
			this.oControl.destroy();
		}
	});

	QUnit.test("label is rendered correctly", async function(assert) {
		assert.strictEqual(this.oLabel.getDomRef().tagName, "LABEL", "Label is rendered with 'label' tag.");
		assert.ok(this.oLabel.getDomRef().getAttribute("for"), "'for' attribute is set");

		this.oControl.setIsInput(false);
		this.oLabel.invalidate();
		await nextUIUpdate();

		assert.strictEqual(this.oLabel.getDomRef().tagName, "SPAN", "Label is rendered with 'span' tag.");
		assert.notOk(this.oLabel.getDomRef().getAttribute("for"), "'for' attribute is not set");
	});

	var TestCompositeControl = Control.extend("TestCompositeControl", {
		metadata : {
			interfaces : [
				"sap.ui.core.ILabelable"
			],
			aggregations : {
				"_input" : {type : "sap.m.Input", multiple : false, visibility : "hidden"},
				"_text" : {type: "sap.m.Text", multiple : false, visibility : "hidden"}
			}
		},

		init() {
			const oInput = new Input();
			this.setAggregation("_input", oInput);

			const oText = new Text();
			this.setAggregation("_text", oText);
		},

		getIdForLabel() {
			return this.getAggregation("_input").getIdForLabel();
		},

		hasLabelableHTMLElement() {
			return true;
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oCtrl) {
				oRm.openStart("div", oCtrl)
					.openEnd();
					oRm.renderControl(oCtrl.getAggregation("_input"));
					oRm.renderControl(oCtrl.getAggregation("_text"));
				oRm.close("div");
			}
		}
	});

	QUnit.module("labelFor with composite control");

	QUnit.test("Composite Control that set the labelled control to its internally aggregated control", async function(assert) {
		const oCompositeControl = new TestCompositeControl().placeAt("content");
		const oInnerInput = oCompositeControl.getAggregation("_input");

		const oLabel = new Label({
			text: "Label",
			labelFor: oCompositeControl
		}).placeAt("content");

		const oLabel1 = new Label({
			text: "Label1",
			labelFor: oCompositeControl
		}).placeAt("content");

		assert.deepEqual(LabelEnablement.getReferencingLabels(oCompositeControl), [oLabel.getId(), oLabel1.getId()], "There are labels for the outer control");
		assert.equal(LabelEnablement.getReferencingLabels(oInnerInput).length, 0, "There are also labels for the inner control");

		await nextUIUpdate();

		assert.deepEqual(LabelEnablement.getReferencingLabels(oCompositeControl), [oLabel1.getId(), oLabel.getId()], "There are labels for the outer control");
		assert.deepEqual(LabelEnablement.getReferencingLabels(oInnerInput), [oLabel1.getId(), oLabel.getId()], "There are also labels for the inner control");
		assert.equal(oLabel.getDomRef().getAttribute("for"), oInnerInput.getIdForLabel(), "The 'for' attribute is set correctly for the label");

		oLabel.setLabelFor(null);
		assert.deepEqual(LabelEnablement.getReferencingLabels(oCompositeControl), [oLabel1.getId()], "There's label for the outer control");
		assert.deepEqual(LabelEnablement.getReferencingLabels(oInnerInput), [oLabel1.getId()], "There's label for the inner control");

		oLabel1.setLabelFor(null);
		assert.equal(LabelEnablement.getReferencingLabels(oCompositeControl).length, 0, "There's no label for the outer control");
		assert.equal(LabelEnablement.getReferencingLabels(oInnerInput).length, 0, "There's no label for the inner control");

		await nextUIUpdate();
		assert.equal(oLabel.getDomRef().getAttribute("for"), undefined, "The 'for' attribute is not set");

		oLabel.destroy();
		oLabel1.destroy();
		oCompositeControl.destroy();
	});

	QUnit.test("Composite Control that overwrites 'getIdForLabel' and swap to another internal control during the runtime", async function(assert) {
		const oCompositeControl = new TestCompositeControl().placeAt("content");
		const oInnerInput = oCompositeControl.getAggregation("_input");
		const oText = oCompositeControl.getAggregation("_text");

		const oLabel = new Label({
			text: "Label",
			labelFor: oCompositeControl
		}).placeAt("content");

		await nextUIUpdate();

		assert.deepEqual(LabelEnablement.getReferencingLabels(oCompositeControl), [oLabel.getId()], "There's label for the outer control");
		assert.deepEqual(LabelEnablement.getReferencingLabels(oInnerInput), [oLabel.getId()], "There's label for the inner input control");
		assert.equal(LabelEnablement.getReferencingLabels(oText).length, 0, "There's no label for the inner text control");
		assert.equal(oLabel.getDomRef().getAttribute("for"), oInnerInput.getIdForLabel(), "The 'for' attribute is set correctly for the label");

		// overwrite 'getIdForLabel' to remove the label for the inner control
		oCompositeControl.getIdForLabel = function() {
			return this.getAggregation("_text").getIdForLabel();
		};

		oLabel.setLabelFor(oCompositeControl);

		assert.deepEqual(LabelEnablement.getReferencingLabels(oCompositeControl), [oLabel.getId()], "There's no label for the outer control");
		assert.equal(LabelEnablement.getReferencingLabels(oInnerInput).length, 0, "There's no label for the inner input control");
		assert.equal(LabelEnablement.getReferencingLabels(oText).length, 1, "There's label for the inner text control");

		await nextUIUpdate();
		assert.equal(oLabel.getDomRef().getAttribute("for"), undefined, "The 'for' attribute is not set because the control is not labellable");

		oLabel.destroy();
		oCompositeControl.destroy();
	});
});
