/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementUtil',
	'sap/ui/core/UIComponent',
	'sap/ui/core/ComponentContainer',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Button'
],
function(
	DesignTime,
	OverlayRegistry,
	ElementUtil,
	UIComponent,
	ComponentContainer,
	VerticalLayout,
	Button
) {
	'use strict';
	QUnit.start();

	var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent: function() {

			return new VerticalLayout({
				content: [
					new Button({ text: "Text" })
				]
			});

		}
	});

	QUnit.module("Given the ComponentContainer is created..", {
		beforeEach: function(assert) {
			var done = assert.async();

			this.oComponent = new CustomComponent();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oLayout = new VerticalLayout({ content: [this.oComponentContainer] }).placeAt("content");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				done();
			});
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When the component container is rendered...", function(assert) {
			var oInnerLayout = this.oComponent.getRootControl();
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(oInnerLayout);

			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);

			assert.ok(oInnerLayoutOverlay, "an overlay for the root control of the UIComponent is created");
			assert.strictEqual(ElementUtil.hasAncestor(oInnerLayoutOverlay, oOuterLayoutOverlay), true, "the component root control overlay is child of the root layout overlay");
		});

		QUnit.test("When asking for the component container overlays...", function(assert) {
			var oComponentOverlay = OverlayRegistry.getOverlay(this.oComponent);
			var oComponentContainerOverlay = OverlayRegistry.getOverlay(this.oComponentContainer);

			assert.ok(oComponentOverlay, "an overlay for the UIComponent is created");
			assert.equal(oComponentOverlay.getElement().getId(), this.oComponent.getId(), "the UIComponent overlay points to the UI Component");
			assert.ok(oComponentContainerOverlay, "an overlay for the ComponentContainer is created");
			assert.equal(oComponentContainerOverlay.getElement().getId(), this.oComponentContainer.getId(), "the ComponentContainer  overlay points to the ComponentContainer");
		});

		QUnit.test("When asking for the component container association....", function(assert) {
			var sComponentId = ElementUtil.getAssociation(this.oComponentContainer, "component");
			var oComponent = ElementUtil.getAssociationInstances(this.oComponentContainer, "component").pop();
			assert.equal(sComponentId, this.oComponent.getId(), "the UIComponent returned is the same as expected");
			assert.equal(oComponent.getId(), this.oComponent.getId(), "the UIComponent returned is the same as expected");
		});
	});

	QUnit.module("Given the ComponentContainer with late components is created..", {
		beforeEach: function(assert) {
			var done = assert.async();

			this.oComponentContainer = new ComponentContainer("CompCont1");

			this.oLayout = new VerticalLayout({ content: [this.oComponentContainer, new Button({ text: "I give the layout a size" })] }).placeAt("content");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				this.oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When the component is added later...", function(assert) {
			var done = assert.async();
			var oInnerLayout;

			this.oDesignTime.attachEventOnce("synced", function() {
				var oComponentOverlay = OverlayRegistry.getOverlay(this.oComponent);
				var oInnerLayoutOverlay = OverlayRegistry.getOverlay(oInnerLayout);
				assert.ok(oComponentOverlay, "an overlay for the UIComponent is created");
				assert.ok(oInnerLayoutOverlay, "an overlay for the root control of the UIComponent is created");
				assert.strictEqual(ElementUtil.hasAncestor(oInnerLayoutOverlay, this.oOuterLayoutOverlay), true, "the component root control overlay is child of the root layout overlay");
				done();
			}.bind(this));

			//add the component later
			this.oComponent = new CustomComponent();
			oInnerLayout = this.oComponent.getRootControl();

			var oComponentOverlay = OverlayRegistry.getOverlay(this.oComponent);
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(oInnerLayout);
			assert.ok(!oComponentOverlay, "an overlay for the UIComponent is not yet created");
			assert.ok(!oInnerLayoutOverlay, "an overlay for the root control of the UIComponent is not yet created");

			this.oComponentContainer.setComponent(this.oComponent);
		});
	});

	QUnit.module("Given the ComponentContainer with component with late root control is created..", {
		beforeEach: function(assert) {
			var done = assert.async();

			var LateComponent = UIComponent.extend("sap.ui.dt.test.LateComponent", {
				createContent: function() {
					return null; //do it like fiori elements and add it later
				}
			});
			this.oComponent = new LateComponent();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oLayout = new VerticalLayout({ content: [this.oComponentContainer, new Button({ text: "I give the layout a size" })] }).placeAt("content");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oLayout.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When the root control is added later...", function(assert) {
			var done = assert.async();

			var oNewRootControl = new Button({ id: "newRootControl", text: "New root control" });

			this.oDesignTime.attachEventOnce("synced", function() {
				var oComponentOverlay = OverlayRegistry.getOverlay(this.oComponent);
				assert.ok(oComponentOverlay, "an overlay for the UIComponent is created");
				var oNewRootControlOverlay = OverlayRegistry.getOverlay(oNewRootControl);
				assert.ok(oNewRootControlOverlay, "an overlay for the new root control of the UIComponent is created");
				assert.strictEqual(ElementUtil.hasAncestor(oNewRootControlOverlay, this.oOuterLayoutOverlay), true, "the component root control overlay is child of the root layout overlay");
				done();
			}.bind(this));

			//add the root control later
			this.oComponent.setAggregation("rootControl", oNewRootControl);
		});
	});

});