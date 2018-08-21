/*global QUnit*/

sap.ui.define([
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/rta/plugin/Rename',
	'sap/ui/rta/plugin/ControlVariant',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/OverlayUtil',
	'sap/m/Label',
	'sap/ui/core/Title',
	'sap/m/Input',
	'sap/ui/layout/form/Form',
	'sap/ui/layout/form/FormContainer',
	'sap/ui/layout/form/SimpleForm',
	'sap/uxap/ObjectPageSection',
	'sap/ui/fl/Utils',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/fl/changeHandler/MoveControls',
	'sap/ui/thirdparty/sinon-4'
],
function (
	DesignTime,
	Plugin,
	Remove,
	Rename,
	ControlVariant,
	CommandFactory,
	ChangeRegistry,
	Button,
	VerticalLayout,
	ElementOverlay,
	OverlayRegistry,
	OverlayUtil,
	Label,
	Title,
	Input,
	Form,
	FormContainer,
	SimpleForm,
	ObjectPageSection,
	FlexUtils,
	ElementDesignTimeMetadata,
	MoveControlsChangeHandler,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given this the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"VerticalLayout" : {
					"moveControls": "default"
				}
			});

			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oRemovePlugin = new Remove();

			sandbox.stub(this.oPlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(true);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the hasChangeHandler function is called", function(assert) {
			assert.strictEqual(this.oPlugin.hasChangeHandler("moveControls", this.oLayout), true, "then the function returns true");
		});

		QUnit.test("when an overlay gets deregistered and registered again and visible change event gets fired", function(assert) {
			var oGetRelevantOverlays = sandbox.spy(this.oRemovePlugin, "_getRelevantOverlays");

			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

			this.oButtonOverlay.fireElementModified({
				type: "propertyChanged",
				name: "visible"
			});
			assert.equal(oGetRelevantOverlays.callCount, 1, "then _getRelevantOverlays is only called once");
		});

		QUnit.test("when Overlays are registered/deregistered and _isEditableByPlugin method is called", function(assert) {

			assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
			assert.notOk(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oPlugin.registerElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got added");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the added plugin is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 2, "then another plugin got added");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[1], "sap.ui.rta.plugin.Remove", "then the name of the added plugin is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.ok(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got removed");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the plugin left is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oPlugin.deregisterElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 0, "then all plugins got removed");
			assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
			assert.notOk(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
		});

		QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
			assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then it returns false");
			assert.strictEqual(this.oButtonOverlay.getElementHasStableId(), false, "then the 'getElementHasStableId' property of the Overlay is set to false");
		});

		QUnit.test("when the control has no stable id but is bound and binding template has stable id", function(assert) {
			//stub list binding
			var oBindingTemplateControl = new Button("stable");
			sandbox.stub(OverlayUtil,"getAggregationInformation").returns({
				templateId : oBindingTemplateControl.getId()
			});
			assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), true, "then ID of the binding template is considered stable");
			oBindingTemplateControl.destroy();
		});

		QUnit.test("when the control has no stable id but is bound and binding template has no stable id", function(assert) {
			//stub list binding
			var oBindingTemplateControl = new Button();
			sandbox.stub(OverlayUtil,"getAggregationInformation").returns({
				templateId : oBindingTemplateControl.getId()
			});
			assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then ID of the binding template is considered unstable");
			oBindingTemplateControl.destroy();
		});

		QUnit.test("when hasStableId method is called without an overlay", function(assert) {
			assert.strictEqual(this.oPlugin.hasStableId(), false, "then it returns false");
		});

		QUnit.test("when evaluateEditable is called for elements in an aggregation binding", function(assert) {
			sandbox.stub(OverlayUtil, "isInAggregationBinding").returns(true);
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");

			this.oPlugin.evaluateEditable([this.oLayoutOverlay]);
			assert.equal(oModifyPluginListSpy.callCount, 1, "_modifyPluginList was called once");
			assert.equal(oModifyPluginListSpy.lastCall.args[0], this.oLayoutOverlay, "first parameter is the overlay");
			assert.equal(oModifyPluginListSpy.lastCall.args[1], false, "inside aggregation binding editable is always false");
		});

		QUnit.test("when evaluateEditable is called with getStableElements in DTMD returning a selector", function(assert) {
			var oAggrBindingCheck = sandbox.spy(OverlayUtil, "isInAggregationBinding");
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");
			sandbox.stub(this.oLayoutOverlay.getDesignTimeMetadata(), "getStableElements").returns([{id: "id"}]);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay]);
			assert.equal(oAggrBindingCheck.callCount, 0, "the aggregation binding check is skipped");
			assert.equal(oModifyPluginListSpy.lastCall.args[1], true, "the function returns the result of _isEditable");
		});

		QUnit.test("when evaluateEditable is called for an element whose stable element has no overlay", function(assert) {
			var oAggrBindingCheck = sandbox.spy(OverlayUtil, "isInAggregationBinding");
			var oButton = new Button("IHaveNoOverlay");
			sandbox.stub(this.oLayoutOverlay.getDesignTimeMetadata(), "getStableElements").returns([oButton]);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay]);
			assert.equal(oAggrBindingCheck.callCount, 0, "the aggregation binding check is skipped");
		});
	});

	QUnit.module("Given the Designtime is initialized with 2 Plugins with _isEditable not stubbed", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton = new Button("button");
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils,"checkControlId");

			this.oRenamePlugin = new Rename({
				commandFactory : new CommandFactory()
			});
			this.oRemovePlugin = new Remove({
				commandFactory : new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins: [this.oRemovePlugin, this.oRenamePlugin]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controls are checked for a stable id and at least one plugin has been initialized", function(assert) {
			assert.equal(this.oCheckControlIdSpy.callCount, 2, "then the utility method to check the control id has been already called element overlays");
			assert.strictEqual(this.oButtonOverlay.getElementHasStableId(), true, "and the 'getElementHasStableId' property of the Overlay is set to true");
			assert.ok(this.oPlugin.hasStableId(this.oButtonOverlay), "then if hasStableId is called again it also returns true");
			assert.equal(this.oCheckControlIdSpy.callCount, 2, "but then the utility method to check the control ids is not called another time");
		});
	});

	QUnit.module("Given the Designtime is initialized with 2 Plugins with _isEditable stubbed", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton = new Button("button");
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oRenamePlugin = new Rename({
				commandFactory : new CommandFactory()
			});
			this.oRemovePlugin = new Remove({
				commandFactory : new CommandFactory()
			});
			sandbox.stub(this.oRenamePlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(false);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins: [this.oRemovePlugin, this.oRenamePlugin]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the overlay is not registered yet (has no DTMD) or is undefined and hasStableId is called", function(assert) {
			sandbox.stub(this.oButtonOverlay, "getDesignTimeMetadata").returns(null);
			var oSetStableIdSpy = sandbox.spy(ElementOverlay.prototype, "setElementHasStableId");
			assert.notOk(this.oPlugin.hasStableId(this.oButtonOverlay), "then the button has no stable ID");
			assert.equal(oSetStableIdSpy.callCount, 0, "and the result is not saved on the overlay");

			assert.notOk(this.oPlugin.hasStableId(this.oButtonOverlay2), "then the button has no stable ID");
			assert.equal(oSetStableIdSpy.callCount, 0, "and the result is not saved on the overlay");
		});

		QUnit.test("when the event elementModified is thrown with visibility change", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oButtonOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oButtonOverlay, "getRelevantOverlays");
			sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oButtonOverlay]);
			this.oButtonOverlay.fireElementModified({
				type: "propertyChanged",
				name: "visible"
			});
			assert.equal(oSetRelevantSpy.callCount, 1, "then findAllOverlaysInContainer is only called once");
			assert.equal(oGetRelevantSpy.callCount, 2, "then getRelevantOverlays is called twice");
			assert.equal(this.oButtonOverlay.getRelevantOverlays().length, 1, "then only one overlay is relevant");
		});

		QUnit.test("when the event elementModified is thrown with aggregation change", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "getRelevantOverlays");
			sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);
			this.oLayoutOverlay.fireElementModified({
				type: "removeAggregation",
				name: "content"
			});
			assert.equal(oSetRelevantSpy.callCount, 1, "then findAllOverlaysInContainer is only called once");
			assert.equal(oGetRelevantSpy.callCount, 2, "then getRelevantOverlays is called twice");
			assert.equal(this.oLayoutOverlay.getRelevantOverlays().length, 2, "then two overlays are relevant");
		});

		QUnit.test("when the event elementModified is thrown with overlayRendered", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "getRelevantOverlays");
			var oEvaluateSpy = sandbox.spy(this.oRenamePlugin, "evaluateEditable");
			sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);
			this.oLayoutOverlay.fireElementModified({
				type: "overlayRendered",
				id: this.oLayoutOverlay.getId()
			});
			assert.equal(oSetRelevantSpy.callCount, 0, "then findAllOverlaysInContainer is not called");
			assert.equal(oGetRelevantSpy.callCount, 0, "then getRelevantOverlays is not called");
			assert.equal(oEvaluateSpy.callCount, 1, "then only evaluateEditable is called");
			assert.deepEqual(oEvaluateSpy.args[0], [[this.oLayoutOverlay], {onRegistration: true}], "then evaluateEditable is called with the correct parameters");
		});

		QUnit.test("when the event elementModified is thrown but the plugin is busy", function(assert) {
			var oModifyPluginListSpy = sandbox.spy(this.oRenamePlugin, "_modifyPluginList");
			sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);
			this.oRenamePlugin.isBusy = function(){
				return true;
			};
			this.oLayoutOverlay.fireElementModified({
				type: "overlayRendered",
				id: this.oLayoutOverlay.getId()
			});
			assert.equal(oModifyPluginListSpy.callCount, 0, "then _modifyPluginList is not called");
		});

		QUnit.test("when _modifyPluginList is called multiple times", function(assert) {
			assert.equal(this.oButtonOverlay.getEditableByPlugins(), "sap.ui.rta.plugin.Rename", "then initially the rename plugin is in the list");

			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, true);
			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, true);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, true);
			assert.deepEqual(this.oButtonOverlay.getEditableByPlugins(), ["sap.ui.rta.plugin.Rename", "sap.ui.rta.plugin.Remove"], "then both plugins are in the list once");

			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, false);
			assert.deepEqual(this.oButtonOverlay.getEditableByPlugins(), [], "then both plugins got deleted");
		});
	});

	QUnit.module("Given the Plugin is initialized", {
		beforeEach : function(assert) {

			this.oGroup = new FormContainer("group");
			this.oForm = new Form("Form", {
				formContainers : [this.oGroup]
			}).placeAt("qunit-fixture");

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils,"checkControlId");

			sap.ui.getCore().applyChanges();

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oForm
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oForm.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregationsOnSelf method is called", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							changeType: "addGroup"
						}
					}
				}
			});

			assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "changeType"), "then it returns true");
		});

		QUnit.test("when DesignTimeMetadata has actions and checkAggregations method is called without the action name", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				actions : {}
			});

			assert.notOk(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, undefined), "then it returns false");
		});
	});

	QUnit.module("Given the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new Title({id : "Title0"});
			this.oLabel0 = new Label({id : "Label0"});
			this.oInput0 = new Input({id : "Input0"});
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oForm = this.oSimpleForm.getAggregation("form");
			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils,"checkControlId");

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregations method is called", function(assert) {
			var done = assert.async();

			var oDesignTimeMetadata = {
				aggregations : {
					formContainer : {
						actions : {
							createContainer : {
								changeType : "addSimpleFormGroup",
								changeOnRelevantContainer : true
							}
						}
					}
				}
			};

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: [],
				designTimeMetadata : {
					"sap.ui.layout.form.SimpleForm" : oDesignTimeMetadata
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "createContainer"), "then it returns true");
				this.oDesignTime.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("when control has no stable id, but it has stable elements retrieved by function in DT Metadata", function(assert) {
			var done = assert.async();

			var oDesignTimeMetadata = {
				aggregations : {
					form : {
						actions : {
							getStableElements : function(oElement) {
								var aStableElements = [];
								var oLabel;
								var oTitleOrToolbar;
								if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									oLabel = oElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oElement.getFields());
								} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
									oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
									if (oTitleOrToolbar) {
										aStableElements[0] = oTitleOrToolbar;
									}
									oElement.getFormElements().forEach(function(oFormElement) {
										oLabel = oFormElement.getLabel();
										if (oLabel) {
											aStableElements.push(oLabel);
										}
										aStableElements = aStableElements.concat(oFormElement.getFields());
									});
								}
								return aStableElements;
							}
						}
					}
				}
			};

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: [],
				designTimeMetadata : {
					"sap.ui.layout.form.SimpleForm" : oDesignTimeMetadata
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				assert.equal(this.oCheckControlIdSpy.callCount, 0, "then the utility method to check the control id has not yet been called for this Overlay");
				assert.strictEqual(this.oFormContainerOverlay.getElementHasStableId(), undefined, "and the 'getElementHasStableId' property of the Overlay is still undefined");
				assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then if hasStableId is called it returns true");
				assert.equal(this.oCheckControlIdSpy.callCount, 3, "and the utility method to check the control id is called once for each stable element");
				assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then a second call of hasStableId also returns true");
				assert.equal(this.oCheckControlIdSpy.callCount, 3, "but utility method to check the control id is not called again");
				this.oDesignTime.destroy();
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given this the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new Title();
			this.oLabel0 = new Label();
			this.oInput0 = new Input();
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils,"checkControlId");

			this.oPlugin = new sap.ui.rta.plugin.Plugin();
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control has no stable id and it has no stable elements to be retrieved by function in newly set DT Metadata", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				aggregations : {
					form : {
						actions : {
							getStableElements : function(oElement) {
								var aStableElements = [];
								var oLabel;
								var oTitleOrToolbar;
								if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									oLabel = oElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oElement.getFields());
								} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
									oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
									if (oTitleOrToolbar) {
										aStableElements[0] = oTitleOrToolbar;
									}
									oElement.getFormElements().forEach(function(oFormElement) {
										oLabel = oFormElement.getLabel();
										if (oLabel) {
											aStableElements.push(oLabel);
										}
										aStableElements = aStableElements.concat(oFormElement.getFields());
									});
								}
								return aStableElements;
							}
						}
					}
				}
			});
			assert.equal(this.oCheckControlIdSpy.callCount, 0, "then the utility method to check the control id has not yet been called for this Overlay");
			assert.strictEqual(this.oFormContainerOverlay.getElementHasStableId(), undefined, "and the 'getElementHasStableId' property of the Overlay is still undefined");
			assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then if hasStableId is called it returns false");
			assert.equal(this.oCheckControlIdSpy.callCount, 1, "and the utility method to check the control id is called once for each stable element");
		});

		QUnit.test("when the control has no stable id, no actions and hasStableId method is called", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				aggregations : {
					form : {
						actions : {}
					}
				}
			});
			assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns false");
		});
	});

	QUnit.module("Given the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"ObjectPageSection" : {
					"rename": "sap/ui/fl/changeHandler/BaseRename"
				},
				"sap.m.Button" : {
					"removeButton": "sap/ui/fl/changeHandler/Base"
				},
				"sap.ui.core._StashedControl" : {
					"unstashControl": "sap/ui/fl/changeHandler/UnstashControl"
				}
			});
			this.oObjectPageSection = new ObjectPageSection();
			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [this.oObjectPageSection, this.oButton]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oControlVariantPlugin = new sap.ui.rta.plugin.ControlVariant({
				commandFactory : new CommandFactory()
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control is checked for a variant change handler", function(assert) {
			var bVariantChangeHandlerForSectionRename = this.oPlugin._hasVariantChangeHandler("rename", this.oObjectPageSection);
			var bVariantChangeHandlerForButtonRemove = this.oPlugin._hasVariantChangeHandler("removeButton", this.oButton);
			assert.ok(bVariantChangeHandlerForSectionRename, "then the control has a variant ChangeHandler");
			assert.notOk(bVariantChangeHandlerForButtonRemove, "then the control has no variant ChangeHandler");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					remove: {
						changeType: "removeButton"
					}
				}
			});

			sandbox.stub(this.oObjectPageSectionOverlay, "getVariantManagement").returns("variant-test");
			sandbox.stub(this.oButtonOverlay, "getVariantManagement").returns(undefined);
			var oObjectPageSectionAction = this.oObjectPageSectionOverlay.getDesignTimeMetadata().getAction("rename", this.oObjectPageSectionOverlay.getElement());
			var oButtonAction = this.oButtonOverlay.getDesignTimeMetadata().getAction("remove", this.oButtonOverlay.getElement());

			var sVarMgmtRefForObjectPageSection = this.oPlugin.getVariantManagementReference(this.oObjectPageSectionOverlay, oObjectPageSectionAction);
			var sVarMgmtRefForButton = this.oPlugin.getVariantManagementReference(this.oButtonOverlay, oButtonAction);
			assert.equal(sVarMgmtRefForObjectPageSection, "variant-test", "then for the control with variant ChangeHandler the variant management reference is returned");
			assert.equal(sVarMgmtRefForButton, undefined, "then for the control without variant ChangeHandler undefined is returned");
		});

		QUnit.test("when calling 'getVariantManagementReference' with a stashed control", function(assert) {
			var mSettings = {};
			mSettings.sParentId = this.oObjectPageSection.getId();
			var oStashedControl = new sap.ui.core._StashedControl("stashedControl",mSettings);


			var oDesignTimeMetadata = new ElementDesignTimeMetadata(
				{
					data: {
						actions: {
							reveal: {
								changeType: "unstashControl"
							}
						}
					}
				}
			);

			//Faked in AdditionalElementsPlugin
			var oRevealAction = oDesignTimeMetadata.getAction("reveal");
			var oObjectPageSectionAction = this.oObjectPageSectionOverlay.getDesignTimeMetadata().getAction("rename", this.oObjectPageSectionOverlay.getElement());

			sandbox.stub(this.oObjectPageSectionOverlay, "getVariantManagement").returns("variant-test");

			var sVarMgmtRefForObjectPageSection = this.oPlugin.getVariantManagementReference(this.oObjectPageSectionOverlay, oObjectPageSectionAction);
			var sVarMgmtRefForStashedControl = this.oPlugin.getVariantManagementReference(this.oObjectPageSectionOverlay, oRevealAction, false, oStashedControl);

			assert.equal(sVarMgmtRefForObjectPageSection, "variant-test", "then for the control with variant ChangeHandler the variant management reference is returned");
			assert.equal(sVarMgmtRefForStashedControl, "variant-test", "then for the stashed control with variant ChangeHandler variant management reference from parent is returned, as no overlay exists");
		});
	});

	QUnit.module("Given this the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"VerticalLayout" : {
					"moveControls": "default"
				}
			});

			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new CommandFactory()
			});
			this.oRemovePlugin = new Remove();

			sandbox.stub(this.oPlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(true);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when '_getChangeHandler' is called with a control that has the default change handler registered for 'moveControls'", function(assert) {
			assert.strictEqual(this.oPlugin._getChangeHandler("moveControls", this.oLayout), MoveControlsChangeHandler, "then the function returns the correct change handler");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});