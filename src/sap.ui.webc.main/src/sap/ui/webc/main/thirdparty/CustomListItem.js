sap.ui.define(['sap/ui/webc/common/thirdparty/base/Keys', './ListItem', './generated/templates/CustomListItemTemplate.lit', './generated/themes/CustomListItem.css'], function (Keys, ListItem, CustomListItemTemplate_lit, CustomListItem_css) { 'use strict';

	const metadata = {
		tag: "ui5-li-custom",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			 accessibleName: {
				type: String,
			},
		},
	};
	class CustomListItem extends ListItem {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return CustomListItemTemplate_lit;
		}
		static get styles() {
			return [ListItem.styles, CustomListItem_css];
		}
		_onkeydown(event) {
			const isTab = Keys.isTabNext(event) || Keys.isTabPrevious(event);
			if (!isTab && !this.focused) {
				return;
			}
			super._onkeydown(event);
		}
		_onkeyup(event) {
			const isTab = Keys.isTabNext(event) || Keys.isTabPrevious(event);
			if (!isTab && !this.focused) {
				return;
			}
			super._onkeyup(event);
		}
		get classes() {
			const result = super.classes;
			result.main["ui5-custom-li-root"] = true;
			return result;
		}
	}
	CustomListItem.define();

	return CustomListItem;

});
