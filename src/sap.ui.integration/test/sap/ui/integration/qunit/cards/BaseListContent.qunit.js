/* global QUnit */

sap.ui.define([
	"../services/SampleServices",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/integration/util/ServiceManager",
	"sap/ui/integration/model/ObservableModel",
	"sap/m/List",
	"sap/ui/integration/controls/ListContentItem"
], function (
	SampleServices,
	BaseListContent,
	ServiceManager,
	ObservableModel,
	List,
	ListContentItem
) {
	"use strict";

	function createFakeList() {
		var oList = new List({
			items: {
				path: "/",
				template: new ListContentItem({
					title: "{title}"
				})
			}
		});
		oList.setModel(new ObservableModel([
			{
				key: "item1",
				title: "title 1"
			},
			{
				key: "item2",
				title: "title 2"
			}
		]));

		return oList;
	}

	QUnit.module("Promises", {
		beforeEach: function () {
			this.oBLC = new BaseListContent();
			this.oBLC.getInnerList = function () {
				return createFakeList();
			};
			this.oBLC.setServiceManager(
				new ServiceManager({
						IntentBasedNavigation: {
							factoryName: "test.service.SampleNavigationFactory"
						}
					},
					this.oBLC
				)
			);
		},
		afterEach: function () {
			this.oBLC.destroy();
		}
	});

	QUnit.test("Promises are awaited correctly", function (assert) {
		// arrange
		var mItemConfig = {
				actions: [
					{
						type: "Navigation",
						service: "IntentBasedNavigation",
						parameters: {
							intentSemanticObject: "SalesOrder",
							name: "{Name}",
							hidden: "{url}"
						}
					}
				]
			};

		// act
		this.oBLC._checkHiddenNavigationItems(mItemConfig);

		//assert
		assert.ok(this.oBLC._oAwaitingPromise, "There is promise created");
	});

	QUnit.test("Promise is changed when items change", function (assert) {
		// arrange
		var mItemConfig = {
				actions: [
					{
						type: "Navigation",
						service: "IntentBasedNavigation",
						parameters: {
							intentSemanticObject: "SalesOrder",
							name: "{Name}",
							hidden: "{url}"
						}
					}
				]
			};
		this.oBLC._checkHiddenNavigationItems(mItemConfig);
		var pAwait = this.oBLC._oAwaitingPromise;

		// act
		this.oBLC._checkHiddenNavigationItems(mItemConfig);

		// assert
		assert.notStrictEqual(this.oBLC._oAwaitingPromise, pAwait, "Promise changed when items have changed");
	});

	QUnit.test("Model is not changed after service respond", function (assert) {
		// arrange
		var mItemConfig = {
			actions: [
				{
					type: "Navigation",
					service: "IntentBasedNavigation",
					parameters: {
						intentSemanticObject: "SalesOrder",
						name: "{Name}",
						hidden: "{url}"
					}
				}
			]
		};
		var oChangeEventSpy = this.spy(ObservableModel.prototype, "_handleChange");

		// act
		this.oBLC._checkHiddenNavigationItems(mItemConfig);

		// assert
		assert.ok(oChangeEventSpy.notCalled, "The model is not changed");
	});
});
