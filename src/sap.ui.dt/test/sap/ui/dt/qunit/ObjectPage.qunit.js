/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/DesignTime',
	'sap/uxap/ObjectPageLayout',
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSubSection',
	'sap/uxap/ObjectPageHeader',
	'sap/m/Button',
	'sap/m/VBox'
],
function(
	DesignTime,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	Button,
	VBox
) {
	'use strict';
	QUnit.start();

	QUnit.module('Basic functionality', {
		beforeEach: function(assert) {
			var fnDone = assert.async();

			this.oButton = new Button({text: "foo"});
			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [this.oButton]
			});
			this.oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "bar"})]
			});
			this.oSection = new ObjectPageSection("section", {
				visible: false,
				subSections: [this.oSubSection]
			});
			this.oSection2 = new ObjectPageSection("section2", {
				subSections: [this.oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "600px",
				sections : [this.oSection, this.oSection2],
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
				})
			});
			this.oVBox = new VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				fnDone();
			});
		},

		afterEach: function() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	});

	QUnit.test("invisible section", function(assert) {
		var fnDone = assert.async();

		this.oDesignTime.attachEventOnce("synced", function() {
			sap.ui.getCore().applyChanges();

			var oSectionOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSection);
			var oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton);

			assert.deepEqual(oSectionOverlay.$().offset(), this.oSection.$().offset(), "position of the Section overlay is correct");
			assert.deepEqual(oButtonOverlay.$().offset(), this.oButton.$().offset(), "position of the Button overlay is correct");

			fnDone();
		}, this);

		this.oSection.setVisible(true); // starts test
	});

});
