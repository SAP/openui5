/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/layout/Form"
],
function (
	prepareData
) {
	"use strict";

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
					]
				}],
				"default group is created properly"
			);
			assert.deepEqual(mResult.count, 2, "fields are counted properly");
		});

		QUnit.test("group creation out of empty array", function (assert) {
			var mResult = prepareData([]);
			assert.deepEqual(mResult.groups, [], "group is not created");
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
						]
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
						]
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
						]
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
						]
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
						]
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
						]
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
						]
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
						]
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
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
