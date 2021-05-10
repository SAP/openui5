sap.ui.define([
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/model/json/JSONModel"
], function(
	List,
	CustomListItem,
	Button,
	HorizontalLayout,
	JSONModel
) {
	"use strict";

	return {
		/**
		 * Creates a list with bound items for qunit tests that requires test setup with aggregation bindings.
		 * When intern structures are required it is mandatory to call this function with outer this context.
		 * @param {string} [sIdPrefix] - prefix for ids defined with this function
		 * @returns {sap.ui.layout.HorizontalLayout} root control
		 */
		createListWithBoundItems: function(sIdPrefix) {
			//	horizontalLayout
			// 		boundList
			//			(bounded template) customListItem (model with 2 entries)
			//		unboundList
			//			customListItem-1
			//			customListItem-2
			sIdPrefix = sIdPrefix ? sIdPrefix + "-" : "";
			var oData = [
				{text: "item1-bound"},
				{text: "item2-bound"}
			];
			var oModel = new JSONModel(oData);
			this.oCustomListItemTemplate = new CustomListItem(sIdPrefix + "boundListItem", {content: [new Button(sIdPrefix + "boundListItem-btn", {text: '{text}'})]});
			this.oBoundList = new List(sIdPrefix + "boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: false
			});

			//create list with unbound items
			this.oUnBoundList = new List(sIdPrefix + "unboundlist");
			this.oUnBoundList.addItem(new CustomListItem(sIdPrefix + "unboundlist-0", {content: [new Button(sIdPrefix + "item1-btn", {text: 'item1-unbound'})]}));
			this.oUnBoundList.addItem(new CustomListItem(sIdPrefix + "unboundlist-1", {content: [new Button(sIdPrefix + "item2-btn", {text: 'item2-unbound'})]}));

			//create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout(sIdPrefix + "horizontalLayout", {
				content: [this.oBoundList, this.oUnBoundList]
			});
			this.oHorizontalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			return this.oHorizontalLayout;
		}
	};
}, true);