/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/apply/_internal/flexObjects/Variant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/qunit/apply/_internal/flexObjects/getFlexObjectFileContent",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Lib,
	FlexObjectFactory,
	FlexObject,
	Variant,
	CompVariant,
	getFlexObjectFileContent,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given sap.ui.fl.apply._internal.flexObjects.Variant class", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when new variant is initialized", function(assert) {
			var oBaseVariant = FlexObjectFactory.createFromFileContent({}, Variant);
			assert.ok(
				oBaseVariant instanceof FlexObject,
				"then variant is inherit from flex object"
			);
		});

		QUnit.test("when new variant is initialized and getMappingInfo function is called", function(assert) {
			var oBaseVariant = FlexObjectFactory.createFromFileContent({}, Variant);
			assert.strictEqual(
				oBaseVariant.getMappingInfo().favorite,
				"favorite",
				"then variant specific data is returned"
			);
		});

		QUnit.test("when new variant is initialized without variant id", function(assert) {
			var oBaseVariant = FlexObjectFactory.createFromFileContent({}, Variant);
			assert.ok(
				oBaseVariant.getId() === oBaseVariant.getVariantId(),
				"then the id of the instance and the variant id parameter are equal"
			);
		});

		QUnit.test("when new variant is initialized with texts", function(assert) {
			this.mFileContent = {
				texts: {
					variantName: {
						value: "variant-name-in-texts"
					}
				}
			};
			var oBaseVariant = FlexObjectFactory.createFromFileContent(this.mFileContent, Variant);
			assert.strictEqual(
				oBaseVariant.getName(),
				"variant-name-in-texts",
				"then the variant name from texts parameter is used as name"
			);
		});

		QUnit.test("when new variant is initialized with author provided", function(assert) {
			this.mFileContent = {
				layer: "PUBLIC",
				supportInformation: {
					user: "A"
				},
				author: "NameA"
			};
			const oFlVariant = new Variant(this.mFileContent);
			const oCompVariant = new CompVariant(this.mFileContent);
			assert.strictEqual(oFlVariant.getAuthor(), "NameA", "then the variant author name is from author property");
			assert.strictEqual(oCompVariant.getAuthor(), "NameA", "then the variant author name is from author property");
		});

		QUnit.test("when new variant is initialized with no author and no maps of users' ids and names provided", function(assert) {
			this.mFileContent = {
				layer: "PUBLIC",
				supportInformation: {
					user: "C"
				}
			};
			const oFlVariant = new Variant(this.mFileContent);
			const oCompVariant = new CompVariant(this.mFileContent);
			assert.strictEqual(oFlVariant.getAuthor(), "C", "then the variant author name is from support information");
			assert.strictEqual(oCompVariant.getAuthor(), "C", "then the variant author name is from support information");
		});

		QUnit.test("after variant author has been set", function(assert) {
			this.mFileContent = {
				layer: "USER",
				support: {
					user: "A"
				}
			};
			var oBaseVariant = FlexObjectFactory.createFromFileContent(this.mFileContent, Variant);
			oBaseVariant.setAuthor("new name");
			assert.strictEqual(oBaseVariant.getAuthor(), "new name", "then the variant author name is updated"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});