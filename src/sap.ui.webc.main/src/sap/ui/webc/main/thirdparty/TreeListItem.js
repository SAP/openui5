sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/ValueState', './ListItem', './Icon', 'sap/ui/webc/common/thirdparty/icons/navigation-right-arrow', 'sap/ui/webc/common/thirdparty/icons/navigation-down-arrow', './generated/i18n/i18n-defaults', './generated/templates/TreeListItemTemplate.lit', './generated/themes/TreeListItem.css'], function (Integer, Keys, i18nBundle, ValueState, ListItem, Icon, navigationRightArrow, navigationDownArrow, i18nDefaults, TreeListItemTemplate_lit, TreeListItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-li-tree",
		languageAware: true,
		properties:  {
			level: {
				type: Integer__default,
				defaultValue: 1,
			},
			icon: {
				type: String,
			},
			showToggleButton: {
				type: Boolean,
			},
			expanded: {
				type: Boolean,
			},
			indeterminate: {
				type: Boolean,
			},
			additionalText: {
				type: String,
			},
			additionalTextState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			_toggleButtonEnd: {
				type: Boolean,
			},
			_minimal: {
				type: Boolean,
			},
			_setsize: {
				type: Integer__default,
				defaultValue: 1,
				noAttribute: true,
			},
			_posinset: {
				type: Integer__default,
				defaultValue: 1,
				noAttribute: true,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {
			toggle: {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"step-in": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"step-out": {
				detail: {
					item: { type: HTMLElement },
				},
			},
		},
	};
	class TreeListItem extends ListItem {
		static get template() {
			return TreeListItemTemplate_lit;
		}
		static get styles() {
			return [ListItem.styles, TreeListItem_css];
		}
		static get metadata() {
			return metadata;
		}
		static get dependencies() {
			return [
				...ListItem.dependencies,
				Icon,
			];
		}
		onBeforeRendering() {
			this.actionable = false;
		}
		get classes() {
			const allClasses = super.classes;
			allClasses.main["ui5-li-root-tree"] = true;
			return allClasses;
		}
		get styles() {
			return {
				preContent: {
					"padding-left": `calc(var(--_ui5-tree-indent-step) * ${this.effectiveLevel})`,
				},
			};
		}
		get effectiveLevel() {
			return this.level - 1;
		}
		get hasParent() {
			return this.level > 1;
		}
		get _toggleIconName() {
			return this.expanded ? "navigation-down-arrow" : "navigation-right-arrow";
		}
		get _showToggleButtonBeginning() {
			return this.showToggleButton && !this._minimal && !this._toggleButtonEnd;
		}
		get _showToggleButtonEnd() {
			return this.showToggleButton && !this._minimal && this._toggleButtonEnd;
		}
		get _showTitle() {
			return this.textContent.length && !this._minimal;
		}
		get _accInfo() {
			return {
				role: "treeitem",
				ariaExpanded: this.showToggleButton ? this.expanded : undefined,
				ariaLevel: this.level,
				posinset: this._posinset,
				setsize: this._setsize,
				ariaSelectedText: this.ariaSelectedText,
				listItemAriaLabel: TreeListItem.i18nBundle.getText(i18nDefaults.TREE_ITEM_ARIA_LABEL),
			};
		}
		_toggleClick(event) {
			event.stopPropagation();
			this.fireEvent("toggle", { item: this });
		}
		_onkeydown(event) {
			super._onkeydown(event);
			if (this.showToggleButton && Keys.isRight(event)) {
				if (!this.expanded) {
					this.fireEvent("toggle", { item: this });
				} else {
					this.fireEvent("step-in", { item: this });
				}
			}
			if (Keys.isLeft(event)) {
				if (this.expanded) {
					this.fireEvent("toggle", { item: this });
				} else if (this.hasParent) {
					this.fireEvent("step-out", { item: this });
				}
			}
		}
		get iconAccessibleName() {
			return this.expanded ? TreeListItem.i18nBundle.getText(i18nDefaults.TREE_ITEM_COLLAPSE_NODE) : TreeListItem.i18nBundle.getText(i18nDefaults.TREE_ITEM_EXPAND_NODE);
		}
		static async onDefine() {
			[TreeListItem.i18nBundle] = await Promise.all([
				i18nBundle.getI18nBundle("@ui5/webcomponents"),
				super.onDefine(),
			]);
		}
	}
	TreeListItem.define();

	return TreeListItem;

});
