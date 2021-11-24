/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Link"
], function(
	Chart,
	Table,
	FilterBar,
	FilterBarBase,
	Field,
	FilterField,
	Link
){
	"use strict";

	QUnit.module("sap.ui.mdc.controls", {

		beforeEach: function() {
		   this.aControls = [
				new Chart(),
//				new Table(),
//				new Field(),
//				new FilterField(),
//				new Link(),
				new FilterBar(),
				new FilterBarBase()
				];
		},
		afterEach: function() {

			this.aControls.forEach(function(oControl) {
				oControl.destroy();
			});
		}
	});
	QUnit.test("XCheck if all properties are declared in design time file", function(assert) {

		var iIndex = 0;
		var fnDone = assert.async();

		this.aControls.forEach(function(oControl) {

			var mProperties = oControl.getMetadata()._mProperties;
			assert.ok(mProperties, "Properties loaded for " + oControl.getMetadata().getName());

//			if (oControl.isA("sap.ui.mdc.FilterBar")) {
//				mProperties = merge(mProperties, oControl.getMetadata().getParent()._mProperties);
//			}

			var aProperties = Object.keys(mProperties);

			oControl.getMetadata().loadDesignTime().then(function(oDesignTimeMetadata) {
				assert.ok(oDesignTimeMetadata, "Metadatafile present for " + oControl.getMetadata().getName());
				assert.ok(oDesignTimeMetadata.properties, "Properties present for " + oControl.getMetadata().getName());

				//all properties defined in the class of the control are defined in design time metadata (there are also inherited properties)
				aProperties.forEach(function(sPropertyName) {
					assert.ok(oDesignTimeMetadata.properties[sPropertyName], oControl.getMetadata().getName() + " - property: \"" + sPropertyName + "\"");
				});

				iIndex++;

				if (iIndex == this.aControls.length) {
					fnDone();
				}
			}.bind(this));

		}.bind(this));

	});
});