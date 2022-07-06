sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/ValueState', './ListItem', './Icon', './Avatar', './types/WrappingType', './generated/templates/StandardListItemTemplate.lit'], function (ValueState, ListItem, Icon, Avatar, WrappingType, StandardListItemTemplate_lit) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-li",
		properties:  {
			description: {
				type: String,
			},
			icon: {
				type: String,
			},
			iconEnd: {
				type: Boolean,
			},
			image: {
				type: String,
			},
			additionalText: {
				type: String,
			},
			additionalTextState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			accessibleName: {
				type: String,
			},
			 wrappingType: {
				type: WrappingType,
				defaultValue: WrappingType.None,
			},
			hasTitle: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
	};
	class StandardListItem extends ListItem {
		static get template() {
			return StandardListItemTemplate_lit;
		}
		static get metadata() {
			return metadata;
		}
		onBeforeRendering(...params) {
			super.onBeforeRendering(...params);
			this.hasTitle = !!this.textContent;
		}
		get displayImage() {
			return !!this.image;
		}
		get displayIconBegin() {
			return (this.icon && !this.iconEnd);
		}
		get displayIconEnd() {
			return (this.icon && this.iconEnd);
		}
		static get dependencies() {
			return [
				...ListItem.dependencies,
				Icon,
				Avatar,
			];
		}
	}
	StandardListItem.define();

	return StandardListItem;

});
