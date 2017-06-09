(function(){
	"use strict";
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	if (window.blanket){
		window.blanket.options("sap-ui-cover-only", "sap/ui/rta");
	}

	jQuery.sap.require("sap.ui.dt.DesignTime");
	jQuery.sap.require("sap.ui.rta.plugin.Plugin");
	jQuery.sap.require("sap.ui.rta.plugin.Remove");
	jQuery.sap.require("sap.ui.rta.command.CommandFactory");
	jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();
			var that = this;

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.VerticalLayout" : {
					"moveControls": "default"
				}
			});

			this.oButton = new sap.m.Button();
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});
			this.oRemovePlugin = new sap.ui.rta.plugin.Remove();

			sandbox.stub(this.oPlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(true);

			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oLayout);
				that.oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oButton);
				done();
			});

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the hasChangeHandler function is called", function(assert) {
		assert.strictEqual(this.oPlugin.hasChangeHandler("moveControls", this.oLayout), true, "then the function returns true");
	});

	QUnit.test("when the addToPluginsList and removeFromPluginsList methods are called", function(assert) {

		assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");

		this.oPlugin.registerElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got added");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the added plugin is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 2, "then another plugin got added");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[1], "sap.ui.rta.plugin.Remove", "then the name of the added plugin is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got removed");
		assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the plugin left is correct");
		assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");

		this.oPlugin.deregisterElementOverlay(this.oButtonOverlay);
		assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 0, "then all plugins got removed");
		assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
	});

	QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
		assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then it returns false");
	});

	QUnit.module("Given that the Plugin is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();
			var that = this;

			this.oButton = new sap.m.Button("button");
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout]
			});

			this.oPlugin = new sap.ui.rta.plugin.Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				that.oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oButton);
				done();
			});

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the control has a stable id and hasStableId method is called", function(assert) {
		assert.ok(this.oPlugin.hasStableId(this.oButtonOverlay), "then it returns true");
	});

	QUnit.module("Given that the Plugin is initialized", {
		beforeEach : function(assert) {

			this.oSmartGroup = new sap.ui.comp.smartform.Group("group");
			this.oSmartForm = new sap.ui.comp.smartform.SmartForm("SmartForm", {
				groups : [this.oSmartGroup]
			});

			this.oVerticalLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oSmartForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});
			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var that = this;
			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oSmartFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oSmartForm);
				that.oGroupOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oSmartGroup);
				done();
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregationsOnSelf method is called", function(assert) {
		this.oSmartFormOverlay.setDesignTimeMetadata({
			aggregations : {
				groups : {
					actions : {
						changeType: "addGroup"
					}
				}
			}
		});

		assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oSmartFormOverlay, "changeType"), "then it returns true");
	});

	QUnit.test("when DesignTimeMetadata has actions and checkAggregations method is called without the action name", function(assert) {
		this.oSmartFormOverlay.setDesignTimeMetadata({
			actions : {}
		});

		assert.notOk(this.oPlugin.checkAggregationsOnSelf(this.oSmartFormOverlay, undefined), "then it returns false");
	});

	QUnit.module("Given that the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new sap.ui.core.Title({id : "Title0"});
			this.oLabel0 = new sap.m.Label({id : "Label0"});
			this.oInput0 = new sap.m.Input({id : "Input0"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oForm = this.oSimpleForm.getAggregation("form");
			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oPlugin = new sap.ui.rta.plugin.Plugin({
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});
			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var that = this;
			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oSimpleFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oSimpleForm);
				that.oFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oForm);
				that.oFormContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oFormContainer);
				done();
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregations method is called", function(assert) {
		this.oFormOverlay.setDesignTimeMetadata({
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
		});

		assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "createContainer"), "then it returns true");
	});

	QUnit.test("when control has no stable id and hasStableId method is called", function(assert) {
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
		assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns true");
	});

	QUnit.module("Given that the Plugin is initialized.", {
		beforeEach : function(assert) {

			this.oTitle0 = new sap.ui.core.Title();
			this.oLabel0 = new sap.m.Label();
			this.oInput0 = new sap.m.Input();
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm("SimpleForm", {
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oSimpleForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];

			this.oPlugin = new sap.ui.rta.plugin.Plugin();
			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var that = this;
			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oSimpleFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oSimpleForm);
				that.oFormContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oFormContainer);
				done();
			});
		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
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
		assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns false");
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

})();
