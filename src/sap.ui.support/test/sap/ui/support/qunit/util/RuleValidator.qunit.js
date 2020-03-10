/*global QUnit*/

sap.ui.define([
	'sap/ui/support/supportRules/util/RuleValidator'
], function (RuleValidator) {
		"use strict";

		var Audiences = sap.ui.support.Audiences,
			Categories = sap.ui.support.Categories;

		function fnCreateRule() {
			return {
				id : "myTestRule",
				audiences: [Audiences.Control],
				categories: [Categories.Usability],
				enabled: true,
				minversion: "-",
				title: "Lorem Ipsum",
				description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
				resolution: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
				resolutionurls: [{
					text: "Lorem Ipsum : lorem",
					href: "https://www.w3.org/"
				}],
				check: function () {

				}
			};
		}

		QUnit.module("RuleValidator - positive case", {
			beforeEach: function () {
				this.libs = [
					'sap.m',
					'sap.ui.table',
					'sap.ui.core',
					'sap.ui.layout',
					'sap.uxap',
					'sap.f',
					'sap.viz',
					'sap.ui.fl',
					'sap.ui.comp',
					'sap.ui.unified'
				];
				this.oRuleValidator = RuleValidator;
			},
			afterEach: function () {
				this.libs = null;
				this.oRuleValidator = null;
			}
		});

		QUnit.test("validateVersion", function (assert) {
			//arrange
			var oRule = fnCreateRule();

			//act - //assert

			//must work with "-"
			oRule.minversion = "-";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), true, "should validate the following character : '-'");

			//must work with "*"
			oRule.minversion = "*";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), true, "should validate the following character : '*' ");

			//must work with valid version of UI5
			oRule.minversion = sap.ui.getVersionInfo().version.match(/\d\.\d\d/)[0];

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), true, "should validate the following pattern of digits <digit>.<digit><digit>");


			oRule = null;
		});

		QUnit.test("validateRuleCollection", function (assert) {

			//arrange
			var oRule = fnCreateRule(),
				aAudiencesMock = Audiences,
				aCategoriesMock = Categories;

			//act  //assert

				//validate the audiences of a rule.
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.audiences, aAudiencesMock), true, "should validate audiences");

			//validate the categories of a rule.
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.categories, aCategoriesMock), true, "should validate categories");


			oRule = null;
			aAudiencesMock = null;
			aCategoriesMock = null;
		});

		QUnit.test("validateId", function (assert) {
			var oRule = fnCreateRule();

			assert.equal(this.oRuleValidator.validateId(oRule.id), true, "should validate id");

			oRule = null;
		});

		QUnit.test("validateStringLength", function (assert) {

			var oRule = fnCreateRule();

			assert.equal(this.oRuleValidator.validateStringLength(oRule.description, 1, 400), true, "should validate the description property if it has fewer than 400 characters");

			assert.equal(this.oRuleValidator.validateStringLength(oRule.resolution, 1, 400), true, "should validate the resolution property if it has fewer than 400 characters");

			assert.equal(this.oRuleValidator.validateStringLength(oRule.title, 1, 400), true, "should validate the dtitle property if it has fewer than 400 characters");
		});

		QUnit.module("RuleValidator - should fail", {
			beforeEach: function () {
				this.libs = [
					'sap.m',
					'sap.ui.table',
					'sap.ui.core',
					'sap.ui.layout',
					'sap.uxap',
					'sap.f',
					'sap.viz',
					'sap.ui.fl',
					'sap.ui.comp',
					'sap.ui.unified'
				];
				this.oRuleValidator = RuleValidator;
			},
			afterEach: function () {
				this.libs = null;
				this.oRuleValidator = null;
			}
		});

		QUnit.test("validateVersion - invalidVersion", function (assert) {

			//arrange
			var oRule = fnCreateRule();

			//act - //assert

			//must work with case "--"
			oRule.minversion = "--";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), false, "should fail to validate more than one of the following character : '-'");

			//must not work with case "**"
			oRule.minversion = "**";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), false, "should fail to validate more than one of the following character : '*' ");

			//must not work with case -x.xx
			oRule.minversion = "-1.38";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), false, "should fail to validate the following sequence of digits and characters '-<digit>.<digit><digit>'");

			//must not work with case x.xx*
			oRule.minversion = "1.38*";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), false, "should fail to validate the following sequence of digits and characters '<digit>.<digit><digit>*'");

			//must not work with case ' ' - space or tabs
			oRule.minversion = " ";

			assert.equal(this.oRuleValidator.validateVersion(oRule.minversion), false, "should fail to validate the space or tabs");

			oRule = null;
		});

		QUnit.test("validateRuleCollection - invalidCollection", function (assert) {

			//arrange
			var oRule = fnCreateRule(),
			aAudiencesMock = Audiences,
			aCategoriesMock = Categories;

			//act  //assert

			//invalid audiences.
			oRule.audiences = Audiences.SomethingCustom;
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.audiences, aAudiencesMock), false, "should fail to validate non-existing audiences");

			oRule.audiences = [ "FakeAudience" ];
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.audiences, aAudiencesMock), false, "should fail to validate non-existing audiences");

			//invalid categories.
			oRule.categories = Categories.SomethingCustom;
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.categories, aAudiencesMock), false, "should fail to validate non-existing categories");

			oRule.categories = [ "FakeCategory" ];
			assert.equal(this.oRuleValidator.validateRuleCollection(oRule.categories, aCategoriesMock), false, "should fail to validate non-existing categories");


			oRule = null;
			aAudiencesMock = null;
			aCategoriesMock = null;


		});

		QUnit.test("validateId - invalidId", function (assert) {
			var oRule = fnCreateRule();

			//PascalCase should be invalid.
			oRule.id = "PascalCase";

			assert.equal(this.oRuleValidator.validateId(oRule.id), false, "should fail to validate id in pascal case");

			oRule = null;
		});

		QUnit.test("validateStringLength - invalidStringLength", function (assert) {
			var oRule = fnCreateRule();

			assert.equal(this.oRuleValidator.validateStringLength(oRule.description, 1, 2), false, "should fail to validate the description property");

			assert.equal(this.oRuleValidator.validateStringLength(oRule.resolution, 1, 2), false, "should validate the resolution property");

			assert.equal(this.oRuleValidator.validateStringLength(oRule.title, 1, 2), false, "should validate the dtitle property");
		});
});