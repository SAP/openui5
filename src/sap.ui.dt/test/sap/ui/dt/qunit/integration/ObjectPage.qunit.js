/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/m/Button",
	"sap/m/VBox"
],
function (
	DesignTime,
	OverlayRegistry,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	Button,
	VBox
) {
	'use strict';

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
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},

		afterEach: function() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	}, function () {
		QUnit.test("invisible section", function(assert) {
			var fnDone = assert.async();

			OverlayRegistry.getOverlay(this.oSection).attachEventOnce("geometryChanged", function() {
				var oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

				assert.deepEqual(Math.ceil(oSectionOverlay.$().offset().top), Math.ceil(this.oSection.$().offset().top), "top position of the Section overlay is correct");
				assert.deepEqual(Math.ceil(oSectionOverlay.$().offset().left), Math.ceil(this.oSection.$().offset().left), "left position of the Section overlay is correct");
				assert.deepEqual(Math.ceil(oButtonOverlay.$().offset().top), Math.ceil(this.oButton.$().offset().top), "top position of the Button overlay is correct");
				assert.deepEqual(Math.ceil(oButtonOverlay.$().offset().left), Math.ceil(this.oButton.$().offset().left), "left position of the Button overlay is correct");

				fnDone();
			}, this);

			this.oSection.setVisible(true);
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
