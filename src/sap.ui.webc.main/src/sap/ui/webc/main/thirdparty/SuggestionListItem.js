sap.ui.define(['./StandardListItem', './generated/templates/SuggestionListItemTemplate.lit'], function (StandardListItem, SuggestionListItemTemplate_lit) { 'use strict';

	const metadata = {
		tag: "ui5-li-suggestion-item",
		managedSlots: true,
		slots:  {
			richDescription: {
				type: HTMLElement,
			},
			"default": {
				propertyName: "titleText",
			},
		},
	};
	class SuggestionListItem extends StandardListItem {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return SuggestionListItemTemplate_lit;
		}
		onBeforeRendering(...params) {
			super.onBeforeRendering(...params);
			this.hasTitle = !!this.titleText.length;
		}
		get effectiveTitle() {
			return this.titleText.filter(node => node.nodeType !== Node.COMMENT_NODE).map(el => el.textContent).join("");
		}
		get hasDescription() {
			return this.richDescription.length || this.description;
		}
	}
	SuggestionListItem.define();

	return SuggestionListItem;

});
