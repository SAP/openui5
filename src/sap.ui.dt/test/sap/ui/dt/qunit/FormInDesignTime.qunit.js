/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementUtil',
	'sap/ui/layout/form/FormElement',
	'sap/ui/layout/form/FormContainer',
	'sap/ui/layout/form/Form',
	'sap/m/Label',
	'sap/m/Input',
	'sap/ui/core/Title',
	'sap/m/CheckBox'
],
function(
	DesignTime,
	OverlayRegistry,
	ElementUtil,
	FormElement,
	FormContainer,
	Form,
	Label,
	Input,
	Title,
	CheckBox
) {
	'use strict';

	var initFormWithGivenLayout = function(assert, oLayout) {
		var fnDone = assert.async();

		this.oElement1 = new FormElement({
			label: new Label({text:"Label0"}),
			fields: [new Input({required:true})]
		});

		this.oFormContainer1 = new sap.ui.layout.form.FormContainer({
			title: "Container1",
			formElements: [
				this.oElement1,
				new FormElement({
					label: new Label({text:"Label1"}),
					fields: [new Input({required:true})]
				})
			]
		});

		this.oFormContainer2 = new FormContainer({
			title: "Container2",
			formElements: [
				new FormElement({
					label: "Label0",
					fields: [new Input({required:true})]
				}),
				new FormElement({
					label: new Label({text:"Label1"}),
					fields: [new Input( {required:true})]
				})
			]
		});

		this.oFormContainer3 = new FormContainer({
			title: new Title({text: "Container3", level: sap.ui.core.TitleLevel.H3}),
			tooltip: "Container tooltip",
			expandable: true,
			formElements: [
				new FormElement({
					fields: [new CheckBox({text: 'one'}),
					         new CheckBox({text: 'two'})]
				}),
				new FormElement({
					fields: [new CheckBox({text: 'three'})]
				})
			]
		});

		this.oForm = new Form({
			tooltip: "Form tooltip",
			layout : oLayout,
			formContainers: [
				this.oFormContainer1,
				this.oFormContainer2,
				this.oFormContainer3
			]
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		this.oFormDesignTime = new DesignTime({
			rootElements : [this.oForm]
		});

		this.oFormDesignTime.attachEventOnce("synced", function() {
			sap.ui.getCore().applyChanges();
			fnDone();
		});
	};

	var isElementChildOf = function($child, $parent) {
		return $child.parent().parent().get(0) === $parent.get(0);
	};

	var testFormHierarchyWithDesignTime = function(assert) {
		var oFormOverlay = OverlayRegistry.getOverlay(this.oForm.getId());
		var $FormOverlay = oFormOverlay.$();

		var $FormContainersOverlay = oFormOverlay.getAggregationOverlay("formContainers").$();
		assert.ok($FormContainersOverlay, "Overlay for aggregation FormContainers exists");
		assert.ok(isElementChildOf($FormContainersOverlay, $FormOverlay), "... and is a child of a form overlay");

		var oContainerOverlay1 = OverlayRegistry.getOverlay(this.oFormContainer1.getId());
		var $ContainerOverlay1 = oContainerOverlay1.$();
		assert.ok($ContainerOverlay1, "Overlay for FormContainer1 exists");
		assert.ok(isElementChildOf($ContainerOverlay1, $FormContainersOverlay), "... and is a child of a formContainers overlay");

		var $formElementsOverlay1 = oContainerOverlay1.getAggregationOverlay("formElements").$();
		assert.ok($formElementsOverlay1, "Overlay for aggregation formElements exists");
		assert.ok(isElementChildOf($formElementsOverlay1, $ContainerOverlay1), "... and is a child of a FormContainer1 overlay");

		var oElementOverlay1 = OverlayRegistry.getOverlay(this.oElement1.getId());
		var $ElementOverlay1 = oElementOverlay1.$();
		assert.ok($ElementOverlay1, "Overlay for Element0 exists");
		assert.ok(isElementChildOf($ElementOverlay1, $formElementsOverlay1), "... and is a child of a FormContainer1 overlay");

		var oContainerOverlay2 = OverlayRegistry.getOverlay(this.oFormContainer2.getId());
		var $ContainerOverlay2 = oContainerOverlay2.$();
		assert.ok($ContainerOverlay2, "Overlay for FormContainer2 exists");
		assert.ok(isElementChildOf($ContainerOverlay2, $FormContainersOverlay), "... and is a child of a formContainers overlay");


		var oContainerOverlay3 = OverlayRegistry.getOverlay(this.oFormContainer3.getId());
		var $ContainerOverlay3 = oContainerOverlay3.$();
		assert.ok($ContainerOverlay3, "Overlay for FormContainer3 exists");
		assert.ok(isElementChildOf($ContainerOverlay3, $FormContainersOverlay), "... and is a child of a formContainers overlay");
	};

	var cleanup = function() {
		this.oElement1.destroy();
		this.oFormContainer1.destroy();
		this.oFormContainer2.destroy();
		this.oFormContainer3.destroy();
		this.oForm.destroy();
		this.oFormDesignTime.destroy();
	};

	QUnit.start();

	QUnit.module('Given that overlays are created for a form with ResponsiveLayout with formContainers', {
		beforeEach: function(assert) {
			initFormWithGivenLayout.call(this, assert, new sap.ui.layout.form.ResponsiveLayout());
		},

		afterEach: function() {
			cleanup.call(this);
		}
	}, function(){
		QUnit.test("when rendering is finished overlays are visible and ...", function(assert) {
			testFormHierarchyWithDesignTime.call(this, assert);
		});
	});

	QUnit.module("Given that overlays are created for a form with ResponsiveGridLayout with formContainers", {
		beforeEach : function(assert) {
			initFormWithGivenLayout.call(this, assert, new sap.ui.layout.form.ResponsiveGridLayout());
		},
		afterEach : function() {
			cleanup.call(this);
		}
	}, function(){
		QUnit.test("when rendering is finished overlays are visible and ...", function(assert) {
			testFormHierarchyWithDesignTime.call(this, assert);
		});
	});

	QUnit.module("Given that overlays are created for a form with FormLayout with formContainers", {
		beforeEach : function(assert) {
			initFormWithGivenLayout.call(this, assert, new sap.ui.layout.form.FormLayout());
		},
		afterEach : function() {
			cleanup.call(this);
		}
	}, function(){
		QUnit.test("when rendering is finished overlays are visible and ...", function(assert) {
			testFormHierarchyWithDesignTime.call(this, assert);
		});
	});

	QUnit.module("Given that overlays are created for a form with GridLayout with formContainers", {
		beforeEach : function(assert) {
			initFormWithGivenLayout.call(this, assert, new sap.ui.layout.form.GridLayout());
		},
		afterEach : function() {
			cleanup.call(this);
		}
	}, function(){
		QUnit.test("when rendering is finished overlays are visible and ...", function(assert) {
			testFormHierarchyWithDesignTime.call(this, assert);
		});
	});

});