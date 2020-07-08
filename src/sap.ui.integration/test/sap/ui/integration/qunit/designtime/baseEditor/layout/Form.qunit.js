/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/layout/Form",
	"sap/base/util/includes",
	"sap/base/util/restricted/_pick",
	"sap/base/util/deepClone"
],
function (
	FormLayout,
	includes,
	_pick,
	deepClone
) {
	"use strict";

	var prepareData = FormLayout.prepareData;

	QUnit.module("Default group", {
		before: function () {
			this.aPropertyEditorsConfig = [
				{
					"tags": ["foo"],
					"path": "/foo",
					"label": "Foo",
					"value": "foo_value"
				},
				{
					"tags": ["bar"],
					"path": "/bar",
					"label": "Bar",
					"value": "bar_value"
				}
			];
		}
	}, function () {
		QUnit.test("group creation", function (assert) {
			var mResult = prepareData(this.aPropertyEditorsConfig);

			assert.deepEqual(
				mResult.groups,
				[{
					items: [
						{
							"label": "Foo",
							"value": "foo_value",
							"config": {
								"tags": ["foo"],
								"path": "/foo"
							}
						},
						{
							"label": "Bar",
							"value": "bar_value",
							"config": {
								"tags": ["bar"],
								"path": "/bar"
							}
						}
					],
					visible: true
				}],
				"default group is created properly"
			);
			assert.deepEqual(mResult.count, 2, "fields are counted properly");
		});

		QUnit.test("group creation out of empty array", function (assert) {
			var mResult = prepareData([]);
			assert.deepEqual(mResult.groups, [], "group is not created");
		});

		QUnit.test("group creation with invisible fields (1 visible field + 1 invisible)", function (assert) {
			var aPropertyEditorsConfig = deepClone(this.aPropertyEditorsConfig);
			aPropertyEditorsConfig[0].visible = false;
			var mResult = prepareData(aPropertyEditorsConfig);

			assert.strictEqual(mResult.groups[0].visible, true, "default group is visible");
		});

		QUnit.test("group creation with invisible fields (both 2 fields are invisible)", function (assert) {
			var aPropertyEditorsConfig = deepClone(this.aPropertyEditorsConfig);
			aPropertyEditorsConfig[0].visible = false;
			aPropertyEditorsConfig[1].visible = false;
			var mResult = prepareData(aPropertyEditorsConfig);

			assert.strictEqual(mResult.groups[0].visible, false, "default group is invisible");
		});
	});

	QUnit.module("Custom groups", {
		before: function () {
			this.aPropertyEditorsConfig = [
				{
					"tags": ["foo"],
					"path": "/foo1",
					"label": "Foo1",
					"value": "foo1_value",
					"__propertyName": "foo1"
				},
				{
					"tags": ["foo"],
					"path": "/foo2",
					"label": "Foo2",
					"value": "foo2_value"
				},
				{
					"tags": ["foo", "bar"],
					"path": "/foobar",
					"label": "FooBar",
					"value": "foobar_value"
				},
				{
					"tags": ["bar"],
					"path": "/bar",
					"label": "Bar",
					"value": "bar_value"
				}
			];
		}
	}, function () {
		QUnit.test("groups creation using tags", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Foo",
							"items": [
								{
									type: "tag",
									value: "foo"
								}
							]
						},
						{
							"label": "Group Bar",
							"items": [
								{
									type: "tag",
									value: "bar"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(
				mResult.groups,
				[
					{
						label: "Group Foo",
						items: [
							{
								"label": "Foo1",
								"value": "foo1_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo1",
									"__propertyName": "foo1"
								}
							},
							{
								"label": "Foo2",
								"value": "foo2_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo2"
								}
							},
							{
								"label": "FooBar",
								"value": "foobar_value",
								"config": {
									"tags": ["foo", "bar"],
									"path": "/foobar"
								}
							}
						],
						visible: true
					},
					{
						label: "Group Bar",
						items: [
							{
								"label": "Bar",
								"value": "bar_value",
								"config": {
									"tags": ["bar"],
									"path": "/bar"
								}
							}
						],
						visible: true
					}
				],
				"groups are created properly"
			);
			assert.deepEqual(mResult.count, 4, "fields count is correctly calculated");
		});

		QUnit.test("group creation using multiple tags", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group FooBar",
							"items": [
								{
									type: "tag",
									value: ["bar", "foo"]
								}
							]
						}
					]
				}
			);

			assert.deepEqual(
				mResult.groups,
				[
					{
						label: "Group FooBar",
						items: [
							{
								"label": "FooBar",
								"value": "foobar_value",
								"config": {
									"tags": ["foo", "bar"],
									"path": "/foobar"
								}
							}
						],
						visible: true
					}
				],
				"group is created properly"
			);
			assert.deepEqual(mResult.count, 1, "fields count is correctly calculated");
		});

		QUnit.test("group creation using property name", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Foo1",
							"items": [
								{
									type: "propertyName",
									value: "foo1"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(
				mResult.groups,
				[
					{
						label: "Group Foo1",
						items: [
							{
								"label": "Foo1",
								"value": "foo1_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo1",
									"__propertyName": "foo1"
								}
							}
						],
						visible: true
					}
				],
				"group is created properly"
			);
			assert.deepEqual(mResult.count, 1, "fields count is correctly calculated");
		});

		QUnit.test("group creation using unknown tag", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Phantom",
							"items": [
								{
									type: "tags",
									value: "phantom"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(mResult.groups, [], "group is not created");
			assert.deepEqual(mResult.count, 0, "fields count is correctly calculated");
		});

		QUnit.test("group creation using unknown propertyName", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Phantom",
							"items": [
								{
									type: "propertyName",
									value: "phantom"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(mResult.groups, [], "group is not created");
			assert.deepEqual(mResult.count, 0, "fields count is correctly calculated");
		});

		QUnit.test("prioritization - 2 tags have overlapping fields", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Bar",
							"items": [
								{
									type: "tag",
									value: "bar"
								}
							]
						},
						{
							"label": "Group Foo",
							"items": [
								{
									type: "tag",
									value: "foo"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(
				mResult.groups,
				[
					{
						label: "Group Bar",
						items: [
							{
								"label": "FooBar",
								"value": "foobar_value",
								"config": {
									"tags": ["foo", "bar"],
									"path": "/foobar"
								}
							},
							{
								"label": "Bar",
								"value": "bar_value",
								"config": {
									"tags": ["bar"],
									"path": "/bar"
								}
							}
						],
						visible: true
					},
					{
						label: "Group Foo",
						items: [
							{
								"label": "Foo1",
								"value": "foo1_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo1",
									"__propertyName": "foo1"
								}
							},
							{
								"label": "Foo2",
								"value": "foo2_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo2"
								}
							}
						],
						visible: true
					}
				],
				"groups are created properly"
			);
			assert.deepEqual(mResult.count, 4, "fields count is correctly calculated");
		});

		QUnit.test("prioritization - when field is picked by propertyName", function (assert) {
			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Foo1",
							"items": [
								{
									type: "propertyName",
									value: "foo1"
								}
							]
						},
						{
							"label": "Group Foo",
							"items": [
								{
									type: "tag",
									value: "foo"
								}
							]
						}
					]
				}
			);

			assert.deepEqual(
				mResult.groups,
				[
					{
						label: "Group Foo1",
						items: [
							{
								"label": "Foo1",
								"value": "foo1_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo1",
									"__propertyName": "foo1"
								}
							}
						],
						visible: true
					},
					{
						label: "Group Foo",
						items: [
							{
								"label": "Foo2",
								"value": "foo2_value",
								"config": {
									"tags": ["foo"],
									"path": "/foo2"
								}
							},
							{
								"label": "FooBar",
								"value": "foobar_value",
								"config": {
									"tags": ["foo", "bar"],
									"path": "/foobar"
								}
							}
						],
						visible: true
					}
				],
				"groups are created properly"
			);
			assert.deepEqual(mResult.count, 3, "fields count is correctly calculated");
		});

		QUnit.test("responsiveGridLayout parameter", function (assert) {
			var mResponsiveGridLayout = {
				labelSpanXL: 0,
				labelSpanL: 0,
				labelSpanM: 0,
				labelSpanS: 0,
				adjustLabelSpan: true,
				emptySpanXL: 12,
				emptySpanL: 12,
				emptySpanM: 0,
				emptySpanS: 0,
				columnsXL: 1,
				columnsL: 1,
				columnsM: 1,
				singleContainerFullSize: true
			};

			var mResult = prepareData(
				this.aPropertyEditorsConfig,
				{
					responsiveGridLayout: mResponsiveGridLayout
				}
			);

			assert.deepEqual(mResult.responsiveGridLayout, mResponsiveGridLayout, "configuration for ResponsiveGridLayout is propagated properly");
		});

		QUnit.test("groups creation with invisible fields", function (assert) {
			var aPropertyEditorsConfig = this.aPropertyEditorsConfig.map(function (mConfig) {
				return (
					includes(mConfig.tags, "foo")
						? (
							Object.assign({}, mConfig, {
								visible: false
							})
						)
						: mConfig
				);
			});

			var mResult = prepareData(
				aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Foo",
							"items": [
								{
									type: "tag",
									value: "foo"
								}
							]
						},
						{
							"label": "Group Bar",
							"items": [
								{
									type: "tag",
									value: "bar"
								}
							]
						}
					]
				}
			);

			assert.strictEqual(mResult.groups[0].visible, false, "group with `foo` fields is invisible");
			assert.strictEqual(mResult.groups[1].visible, true, "group with `bar` fields is visible");
		});

		QUnit.test("groups creation with mix of visible and invisible fields", function (assert) {
			var aPropertyEditorsConfig = this.aPropertyEditorsConfig.map(function (mConfig) {
				if (includes(mConfig.tags, "foo", "bar")) {
					return mConfig;
				} else if (includes(mConfig.tags, "foo")) {
					return Object.assign({}, mConfig, {
						visible: false
					});
				}

				return mConfig;
			});

			var mResult = prepareData(
				aPropertyEditorsConfig,
				{
					groups: [
						{
							"label": "Group Foo",
							"items": [
								{
									type: "tag",
									value: "foo"
								}
							]
						},
						{
							"label": "Group Bar",
							"items": [
								{
									type: "tag",
									value: "bar"
								}
							]
						}
					]
				}
			);

			assert.strictEqual(mResult.groups[0].visible, true, "group with `foo` fields is visible");
			assert.strictEqual(mResult.groups[1].visible, true, "group with `bar` fields is visible");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
