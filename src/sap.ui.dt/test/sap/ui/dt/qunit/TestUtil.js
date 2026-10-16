sap.ui.define([
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	List,
	CustomListItem,
	Button,
	HorizontalLayout,
	VerticalLayout,
	JSONModel,
	nextUIUpdate
) {
	"use strict";

	return {
		/**
		 * Creates a list with bound items for QUnit tests that requires test setup with aggregation bindings.
		 * When internal structures are required it is mandatory to call this function with external <code>this</code> context.
		 * @param {string} [sIdPrefix] - Prefix for IDs defined with this function
		 * @returns {sap.ui.layout.HorizontalLayout} Root control
		 */
		async createListWithBoundItems(sIdPrefix) {
			//	horizontalLayout
			// 		boundList
			//			(bound template) customListItem (model with 2 entries)
			//		unboundList
			//			customListItem-1
			//			customListItem-2
			sIdPrefix = sIdPrefix ? `${sIdPrefix}-` : "";
			var oData = [
				{ text: "item1-bound" },
				{ text: "item2-bound" }
			];
			var oModel = new JSONModel(oData);
			this.oCustomListItemTemplate = new CustomListItem(`${sIdPrefix}boundListItem`, { content: [new Button(`${sIdPrefix}boundListItem-btn`, { text: "{text}" })] });
			this.oBoundList = new List(`${sIdPrefix}boundlist`).setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: false
			});

			// create list with unbound items
			this.oUnBoundList = new List(`${sIdPrefix}unboundlist`);
			this.oUnBoundList.addItem(new CustomListItem(`${sIdPrefix}unboundlist-0`, { content: [new Button(`${sIdPrefix}item1-btn`, { text: "item1-unbound" })] }));
			this.oUnBoundList.addItem(new CustomListItem(`${sIdPrefix}unboundlist-1`, { content: [new Button(`${sIdPrefix}item2-btn`, { text: "item2-unbound" })] }));

			// create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout(`${sIdPrefix}horizontalLayout`, {
				content: [this.oBoundList, this.oUnBoundList]
			});
			this.oHorizontalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			return this.oHorizontalLayout;
		},

		/**
		 * Creates a list with bound items whose template has two sibling groups, each with its own children.
		 * This is used to verify that highlighting template/clone elements stays within the matching sub-tree
		 * on intermediate levels and does not leak into sibling groups.
		 * When internal structures are required it is mandatory to call this function with external <code>this</code> context.
		 * @param {string} [sIdPrefix] - Prefix for IDs defined with this function
		 * @returns {sap.ui.layout.HorizontalLayout} Root control
		 */
		async createNestedListWithBoundItems(sIdPrefix) {
			//	horizontalLayout
			// 		boundList (items bound, model with 2 entries)
			//			(bound template) customListItem
			//				groupA (VerticalLayout)
			//					a-btn-0
			//					a-btn-1
			//				groupB (VerticalLayout)
			//					b-btn-0
			//					b-btn-1
			sIdPrefix = sIdPrefix ? `${sIdPrefix}-` : "";
			const oData = [
				{ text: "item1-bound" },
				{ text: "item2-bound" }
			];
			const oModel = new JSONModel(oData);
			this.oNestedListItemTemplate = new CustomListItem(`${sIdPrefix}nestedBoundListItem`, {
				content: [
					new VerticalLayout(`${sIdPrefix}groupA`, {
						content: [
							new Button(`${sIdPrefix}a-btn-0`, { text: "{text}" }),
							new Button(`${sIdPrefix}a-btn-1`, { text: "{text}" })
						]
					}),
					new VerticalLayout(`${sIdPrefix}groupB`, {
						content: [
							new Button(`${sIdPrefix}b-btn-0`, { text: "{text}" }),
							new Button(`${sIdPrefix}b-btn-1`, { text: "{text}" })
						]
					})
				]
			});
			this.oNestedBoundList = new List(`${sIdPrefix}nestedBoundlist`).setModel(oModel);
			this.oNestedBoundList.bindAggregation("items", {
				path: "/",
				template: this.oNestedListItemTemplate,
				templateShareable: false
			});

			this.oNestedHorizontalLayout = new HorizontalLayout(`${sIdPrefix}nestedHorizontalLayout`, {
				content: [this.oNestedBoundList]
			});
			this.oNestedHorizontalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			return this.oNestedHorizontalLayout;
		},

		/**
		 * Creates a list with bound items whose template itself contains a second, nested aggregation binding.
		 * This verifies that highlighting template/clone elements fans out at every binding boundary (the outer
		 * and the nested bound aggregation) while still staying index-restricted on the structural levels in
		 * between, so that selecting a leaf in one nested clone highlights the matching leaf in all outer and
		 * inner clones but no siblings at other indices.
		 * When internal structures are required it is mandatory to call this function with external <code>this</code> context.
		 * @param {string} [sIdPrefix] - Prefix for IDs defined with this function
		 * @returns {sap.ui.layout.HorizontalLayout} Root control
		 */
		async createDeeplyNestedListWithBoundItems(sIdPrefix) {
			//	horizontalLayout
			// 		outerList (items bound, model with 2 entries)
			//			(bound template) outerItem
			//				innerList (items bound, nested model with 2 entries)
			//					(bound template) innerItem
			//						leaf
			sIdPrefix = sIdPrefix ? `${sIdPrefix}-` : "";
			const oData = {
				rows: [
					{ cells: [{ text: "r0c0" }, { text: "r0c1" }] },
					{ cells: [{ text: "r1c0" }, { text: "r1c1" }] }
				]
			};
			const oModel = new JSONModel(oData);

			this.oInnerListItemTemplate = new CustomListItem(`${sIdPrefix}innerItem`, {
				content: [
					new Button(`${sIdPrefix}leafA`, { text: "{text}" }),
					new Button(`${sIdPrefix}leafB`, { text: "{text}" })
				]
			});
			this.oInnerList = new List(`${sIdPrefix}innerList`);
			this.oInnerList.bindAggregation("items", {
				path: "cells",
				template: this.oInnerListItemTemplate,
				templateShareable: false
			});

			this.oOuterListItemTemplate = new CustomListItem(`${sIdPrefix}outerItem`, {
				content: [this.oInnerList]
			});
			this.oOuterList = new List(`${sIdPrefix}outerList`).setModel(oModel);
			this.oOuterList.bindAggregation("items", {
				path: "/rows",
				template: this.oOuterListItemTemplate,
				templateShareable: false
			});

			this.oDeeplyNestedHorizontalLayout = new HorizontalLayout(`${sIdPrefix}deeplyNestedHorizontalLayout`, {
				content: [this.oOuterList]
			});
			this.oDeeplyNestedHorizontalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			return this.oDeeplyNestedHorizontalLayout;
		}
	};
});