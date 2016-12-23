sap.ui.define([
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (formatter) {
	"use strict";

	QUnit.module("Preview Panel Height");

	QUnit.test("Should return 6rem when compact mode is set on body", function (assert) {
		// Arrange
		$("body").addClass("sapUiSizeCompact");
		// Assert
		assert.strictEqual(formatter.previewPanelHeight("foo"), "6.0625rem");
		// Cleanup
		$("body").removeClass("sapUiSizeCompact");
	});

	QUnit.test("Should return 6rem when compact mode is set on any child of the body", function (assert) {
		// Arrange
		$("#qunit-fixture").addClass("sapUiSizeCompact");
		// Assert
		assert.strictEqual(formatter.previewPanelHeight("foo"), "6.0625rem");
		// Cleanup
		$("#qunit-fixture").removeClass("sapUiSizeCompact");
	});

	QUnit.test("Should return 8rem in cozy mode", function (assert) {
		// Assert
		assert.strictEqual(formatter.previewPanelHeight("foo"), "8rem");
	});

	QUnit.module("Is Favorite", {
		beforeEach : function () {
			this.getModel = sinon.stub().returns({
				isFavorite: function(sName) {
					assert.ok (this.getModel.calledWith("fav"), "fav model has has been called");
					assert.ok (true, "isFavorite method of the fav model has has been called");

					return !!sName;
				}.bind(this)
			})
		},
		afterEach : function () {
			this.getModel = undefined;
		}
	});

	QUnit.test("Should call the favorite model function", function (assert) {
		// Assert (just make sure the right methods were called, functionality is tested in FavModel itself)
		formatter.isFavorite.bind(this)();
	});

	QUnit.module("Uppercase first letter ");

	QUnit.test("Should uppercase the first letter of any given string", function (assert) {
		// Assert
		assert.strictEqual(formatter.uppercaseFirstLetter("foo"), "Foo");
		assert.strictEqual(formatter.uppercaseFirstLetter("something that is longer and has spaces"), "Something that is longer and has spaces");
	});

	QUnit.test("Should not uppercase special cases", function (assert) {
		// Assert
		assert.strictEqual(formatter.uppercaseFirstLetter(""), "");
		assert.strictEqual(formatter.uppercaseFirstLetter("$omething"), "$omething");
	});

});
