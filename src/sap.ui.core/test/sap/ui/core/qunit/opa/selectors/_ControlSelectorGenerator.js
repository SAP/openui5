/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/ui/test/selectors/_ControlSelectorValidator",
	"sap/m/Text",
	"sap/m/App",
	"sap/m/ToggleButton",
	"sap/m/Bar",
	"sap/m/Page",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/HBox",
	"sap/m/Link",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Toolbar",
	"sap/ui/test/_ControlFinder",
	"sap/ui/qunit/utils/nextUIUpdate",
	// only selector generators below; import in priority order
	"sap/ui/test/selectors/_GlobalID",
	"sap/ui/test/selectors/_ViewID",
	"sap/ui/test/selectors/_LabelFor",
	"sap/ui/test/selectors/_BindingPath",
	"sap/ui/test/selectors/_Properties",
	"sap/ui/test/selectors/_DropdownItem"
], function (_ControlSelectorGenerator, _ControlSelectorValidator, Text, App, ToggleButton, Bar, Page,
		JSONModel, List, CustomListItem, HBox, Link, Button, HorizontalLayout, Toolbar, _ControlFinder, nextUIUpdate) {
	"use strict";

	var aSelectorGenerators = Array.prototype.slice.call(arguments, arguments.length - 6);

	function stubSelectors() {
		var oTestSelector = {property: "text"};
		return aSelectorGenerators.map(function (selector, i) {
			var fnStub = sinon.stub(selector.prototype, "_generate");
			fnStub.returns(i === 4 ? [oTestSelector] : oTestSelector);
			return fnStub;
		});
	}

	QUnit.module("_ControlSelectorGenerator - order", {
		beforeEach: function () {
			this.aGenerateStubs = stubSelectors();
			this.fnFindControlsStub = sinon.stub(_ControlFinder, "_findControls");
			this.fnFindControlsStub.returns([{control: "test"}]);
			this.oText = new Text();
			this.oText.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oText.destroy();
			this.fnFindControlsStub.restore();
			this.aGenerateStubs.forEach(function (fnStub) {
				fnStub.restore();
			});
		}
	});

	QUnit.test("Should continue if ancestor selector generation throws error", function (assert) {
		var fnDone = assert.async();
		var oTestControl = {id: "testControl"};
		var fnAncestorStub = sinon.stub(aSelectorGenerators[0].prototype, "_getAncestor");
		var fnValidationRootStub = sinon.stub(aSelectorGenerators[0].prototype, "_getValidationRoot");
		var fnOriginalGenerate = _ControlSelectorGenerator._generate;
		_ControlSelectorGenerator._generate = function (oOptions) {
			if (oOptions.validationRoot === oTestControl || oOptions.control === oTestControl) {
				throw new Error("Test");
			}
			return fnOriginalGenerate(oOptions);
		};

		fnValidationRootStub.returns(oTestControl);
		_ControlSelectorGenerator._generate({control: this.oText})
			.then(function (mSelector) {
				assert.strictEqual(mSelector.property, "text", "Should not throw error if relative selector throws error but there are other matching selectors");
				fnAncestorStub.returns(oTestControl);
				return _ControlSelectorGenerator._generate({control: this.oText});
			}.bind(this)).then(function (mSelector) {
				assert.strictEqual(mSelector.property, "text", "Should not throw error if generation for ancestor throws error but there are other matching selectors");
				fnAncestorStub.restore();
				fnValidationRootStub.restore();
				_ControlSelectorGenerator._generate = fnOriginalGenerate;
			}).finally(fnDone);
	});

	QUnit.test("Should generate selectors in correct order", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oText, includeAll: true})
			.then(function () {
				var i = 0;
				while (i < this.aGenerateStubs.length - 1) {
					assert.ok(this.aGenerateStubs[i].calledBefore(this.aGenerateStubs[i + 1]), "Should test selectors in priority order");
					i += 1;
				}
				this.aGenerateStubs.forEach(function (fnStub) {
					assert.ok(this.fnFindControlsStub.calledAfter(fnStub), "Should test a selectors after every generation");
				}.bind(this));
			}.bind(this)).finally(fnDone);
	});

	QUnit.module("_ControlSelectorGenerator - ancestor", {
		beforeEach: function () {
			// 2 buttons with same direct (header) parents -- different ancestor when modifying the depth
			// 1 button with different icon -- has unique properties and ancestor -- check full search
			this.oButtonHeader1 = new ToggleButton({
				text: "button with icon",
				icon: "sap-icon://action"
			});
			this.oButtonHeader2 = new ToggleButton({
				text: "button with icon",
				icon: "sap-icon://action"
			});
			this.oButtonContent = new ToggleButton({
				text: "button with icon",
				icon: "sap-icon://avatar"
			});
			this.oHeader = new Bar({
				contentMiddle: [this.oButtonHeader1]
			});
			this.oSubHeader = new Bar({
				contentMiddle: [this.oButtonHeader2]
			});
			this.oPage = new Page("myPage", {
				title: "Selectors",
				showHeader: true,
				customHeader: this.oHeader,
				subHeader: this.oSubHeader
			});
			this.oPage.addContent(this.oButtonContent);
			this.oApp = new App("myApp", {initialPage: this.oPage});
			this.oApp.addPage(this.oPage);
			this.oApp.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			_ControlSelectorGenerator.resetParams();
			this.oApp.destroy();
		}
	});

	QUnit.test("Should generate unique selector for ancestor", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateUniqueAncestorSelector(this.oButtonHeader1)
			.then(function (mResult) {
				assert.strictEqual(mResult.ancestor.getId(), this.oPage.getId(), "Should find ancestor");
				assert.strictEqual(mResult.selector.id, "myPage", "Should generate unique selector for ancestor");
			}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should not generate unique selector for ancestor when depth exceeded", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator.setParams({maxDepth: 1}); // the non-unique ancestor is first => limit to it
		_ControlSelectorGenerator._generateUniqueAncestorSelector(this.oButtonHeader1)
			.catch(function (oError) {
				assert.ok(oError instanceof Error, "Should not find ancestor");
				return _ControlSelectorGenerator._generateHierarchicalUp({control: this.oButtonHeader1});
			}.bind(this)).catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate unique selector for ancestor/), "Should not find ancestor");
			}).finally(fnDone);
	});

	QUnit.test("Should generate selector with ancestors - hierarchical", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateHierarchicalUp({control: this.oButtonContent})
			.then(function (mResult) {
				assert.strictEqual(mResult.ancestor.id, "myPage", "Should find ancestor");
				assert.strictEqual(mResult.properties.icon, "sap-icon://avatar", "Should find unique selector for control in subree");
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector when unique selector in subtree is not found - hierarchical", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateHierarchicalUp({control: this.oButtonHeader1})
			.catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate a selector for control/), "Should not find control");
			}).finally(fnDone);
	});

	QUnit.module("_ControlSelectorGenerator - descendant", {
		beforeEach: function () {
			var oJSONModel = new JSONModel({
				items: [
					{id: "1", title: "SameTitle"},
					{id: "2", title: "SameTitle"}
				]
			});
			this.oList = new List();
			this.oList.bindItems({
				path: "/items",
				template: new CustomListItem({
					content: [
						new HBox({
							items: [
								new Text({text: "copy"}),
								new Link({text: "{title}"})
							]
						})
					]
				})
			});
			this.oList.placeAt("qunit-fixture");
			this.oList.getUIArea().setModel(oJSONModel);

			return nextUIUpdate();
		},
		afterEach: function () {
			_ControlSelectorGenerator.resetParams();
			this.oList.getUIArea().setModel();
			this.oList.destroy();
		}
	});

	QUnit.test("Should generate unique selector for desendant", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateUniqueDescendantSelector(this.oList.getItems()[0])
			.then(function (mResult) {
				assert.strictEqual(mResult.controlType, "sap.m.Link", "Should find the descendant");
				assert.strictEqual(mResult.bindingPath.path, "/items/0");
				assert.strictEqual(mResult.bindingPath.propertyPath, "title");
			}).finally(fnDone);
	});

	QUnit.test("Should generate selector with desendant - hierarchical", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateHierarchicalDown({control: this.oList.getItems()[0]})
			.then(function (mResult) {
				assert.strictEqual(mResult.controlType, "sap.m.CustomListItem", "Should generate selector");
				assert.strictEqual(mResult.properties.type, "Inactive");
				assert.strictEqual(mResult.descendant.controlType, "sap.m.Link", "Should find the descendant");
				assert.strictEqual(mResult.descendant.bindingPath.path, "/items/0");
				assert.strictEqual(mResult.descendant.bindingPath.propertyPath, "title");
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector for desendant with no unique 'shallow' selector", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator.setParams({maxWidth: 1, maxDepth: 2}); // the non-unique text is the first child => limit to it
		_ControlSelectorGenerator._generateUniqueDescendantSelector(this.oList.getItems()[0])
			.catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate unique selector for descendant/), "Should not find unique descendant");
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector with desendant when none has a unique selector - hierarchical", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator.setParams({maxWidth: 1, maxDepth: 2}); // the non-unique text is the first child => limit to it
		_ControlSelectorGenerator._generateHierarchicalDown({control: this.oList.getItems()[0]})
			.catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate unique selector for descendant/), "Should not find unique descendant");
			}).finally(fnDone);
	});

	QUnit.module("_ControlSelectorGenerator - sibling", {
		beforeEach: function () {
			this.oButton = new Button();
			this.oText = new Text({text: "duplicate"});
			this.oItem1 = new CustomListItem({
				content: [
					new HBox({
						items: [
							new HBox({
								items: [
									this.oText,
									new Text({text: "item1"})
								]
							}),
							new HBox({
								items: [
									new Text({text: "duplicate"}),
									new Text({text: "item2"})
								]
							})
						]
					})
				]
			});
			this.oToolbar = new Toolbar("myToolbarSibling");
			this.oLayout = new HorizontalLayout({
				content: [
					this.oButton,
					new List("list", {
						items: [
							this.oItem1
						],
						headerToolbar: this.oToolbar
					})
				]
			});

			this.oLayout.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oLayout.destroy();
		}
	});

	QUnit.test("Should generate selector with sibling", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generateWithSibling({control: this.oText})
			.then(function (mResult) {
				assert.strictEqual(mResult.controlType, "sap.m.Text", "Should generate selector");
				assert.strictEqual(mResult.properties.text, "duplicate");
				assert.strictEqual(mResult.sibling[0].controlType, "sap.m.Text", "Should find the sibling");
				assert.strictEqual(mResult.sibling[0].properties.text, "item1", "Should find the sibling");
				assert.strictEqual(mResult.sibling[1].level, 1);
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector with sibling when none has a unique selector", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator.setParams({maxWidth: 1, maxDepth: 1});
		_ControlSelectorGenerator._generateWithSibling({control: this.oButton}).catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate unique sibling selector.*/), "Should not find unique sibling");
			}).finally(fnDone);
	});

	QUnit.module("_ControlSelectorGenerator - util", {
		beforeEach: function () {
			this.oMockControl = {id: "control"};
			this.oMockAncestor = {id: "ancestor"};
			this.oMockValidationRoot = {id: "validation"};
			this.mAncestorSelector = {controlType: "sap.m.List", id: "list"};
			this.mRelativeSelector = {controlType: "sap.ui.table.Row", id: "row"};
			this.oSimpleGenerator = {
				_isAncestorRequired: function () {
					return false;
				},
				_isValidationRootRequired: function () {
					return false;
				}
			};

			this.oGeneratorWithAncestor = {
				_isAncestorRequired: function () {
					return true;
				},
				_getAncestor: function (oControl) {
					if (oControl === this.oMockControl) {
						return this.oMockAncestor;
					}
				}.bind(this)
			};
			this.oGeneratorWithValidationRoot = {
				_isValidationRootRequired: function () {
					return true;
				},
				_getValidationRoot: function (oControl) {
					if (oControl === this.oMockControl) {
						return this.oMockValidationRoot;
					}
				}.bind(this)
			};
			this.fnGenerate = sinon.stub(_ControlSelectorGenerator, "_generate");
			this.fnGenerate.withArgs({control: this.oMockAncestor}).returns(Promise.resolve(this.mAncestorSelector));
			this.fnGenerateInSubtree = sinon.stub(_ControlSelectorGenerator, "_generateUniqueSelectorInSubtree");
			this.fnGenerateInSubtree.withArgs(this.oMockControl, this.oMockValidationRoot).returns(Promise.resolve(this.mRelativeSelector));
		},
		afterEach: function () {
			this.fnGenerate.restore();
			this.fnGenerateInSubtree.restore();
		}
	});

	QUnit.test("Should get ancestor selector when required", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._getAncestorSelector(this.oGeneratorWithAncestor, {control: this.oMockControl})
			.then(function (mResult) {
				assert.strictEqual(mResult, this.mAncestorSelector, "Should generate ancestor selector when required");
			}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should not get ancestor selector when not required", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._getAncestorSelector(this.oSimpleGenerator, {control: this.oMockControl})
			.then(function (mResult) {
				assert.ok(!mResult, "Should not generate ancestor selector when not required");
				return _ControlSelectorGenerator._getAncestorSelector(this.oGeneratorWithAncestor, {
					control: this.oMockControl,
					shallow: true
				});
			}.bind(this))
			.then(function (mResult) {
				assert.ok(!mResult, "Should not generate ancestor selector for shallow search");
			}).finally(fnDone);
	});

	QUnit.test("Should get validation root selector when required", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._getValidationRootSelector(this.oGeneratorWithValidationRoot, {control: this.oMockControl})
			.then(function (mResult) {
				assert.strictEqual(mResult, this.mRelativeSelector, "Should generate validation root selector when required");
			}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should not get ancestor selector when not required", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._getValidationRootSelector(this.oSimpleGenerator, {control: this.oMockControl})
			.then(function (mResult) {
				assert.ok(!mResult, "Should not generate validation root selector when not required");
				return _ControlSelectorGenerator._getValidationRootSelector(this.oGeneratorWithValidationRoot, {
					control: this.oMockControl,
					shallow: true
				});
			}.bind(this))
			.then(function (mResult) {
				assert.ok(!mResult, "Should not generate validation root selector for shallow search");
			}).finally(fnDone);
	});

	QUnit.test("Should validate selectors", function (assert) {
		var mSelector = {id: "test"};
		var fnValidate = sinon.stub(_ControlSelectorValidator.prototype, "_validate");
		fnValidate.withArgs(mSelector).returns(true);
		var aSingle = _ControlSelectorGenerator._filterUnique(mSelector);
		var aMultiple = _ControlSelectorGenerator._filterUnique([mSelector, {id: "other"}]);
		var aNested = _ControlSelectorGenerator._filterUnique([[mSelector, {part: "other"}], [{part: "two"}, mSelector]]);
		assert.strictEqual(aSingle.length, 1);
		assert.strictEqual(aSingle[0], mSelector, "Should validate a single selector");
		assert.strictEqual(aMultiple.length, 1);
		assert.strictEqual(aMultiple[0], mSelector, "Should validate multiple selectors");
		assert.strictEqual(aNested.length, 2);
		assert.strictEqual(aNested[0], mSelector, "Should validate nested selectors");
		assert.strictEqual(aNested[1], mSelector, "Should validate nested selectors");
		fnValidate.restore();
	});

});
