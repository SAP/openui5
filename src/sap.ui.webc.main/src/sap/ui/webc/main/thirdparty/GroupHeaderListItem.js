sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', './ListItemBase', './generated/i18n/i18n-defaults', './generated/templates/GroupHeaderListItemTemplate.lit', './generated/themes/GroupHeaderListItem.css'], function (i18nBundle, ListItemBase, i18nDefaults, GroupHeaderListItemTemplate_lit, GroupHeaderListItem_css) { 'use strict';

	const metadata = {
		tag: "ui5-li-groupheader",
		languageAware: true,
		properties:  {
			accessibleName: {
				type: String,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {
		},
	};
	class GroupHeaderListItem extends ListItemBase {
		static get template() {
			return GroupHeaderListItemTemplate_lit;
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [ListItemBase.styles, GroupHeaderListItem_css];
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get group() {
			return true;
		}
		get groupHeaderText() {
			return this.i18nBundle.getText(i18nDefaults.GROUP_HEADER_TEXT);
		}
		static async onDefine() {
			await Promise.all([
				i18nBundle.fetchI18nBundle("@ui5/webcomponents"),
			]);
		}
	}
	GroupHeaderListItem.define();

	return GroupHeaderListItem;

});
