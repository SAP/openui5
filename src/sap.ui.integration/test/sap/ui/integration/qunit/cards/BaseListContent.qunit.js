/* global QUnit */

sap.ui.define([
	"../services/SampleServices",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/integration/util/ServiceManager",
	"sap/ui/model/json/JSONModel"
], function (
	SampleServices,
	BaseListContent,
	ServiceManager,
	JSONModel
) {
	"use strict";

	function createFakeList() {
		return {
			getBinding: function () {
				return {
					getModel: function () {
						return new JSONModel([
							{ key: "item1" },
							{ key: "item2" }
						]);
					},
					getPath: function () {
						return "/";
					}
				};
			}
		};
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
});
