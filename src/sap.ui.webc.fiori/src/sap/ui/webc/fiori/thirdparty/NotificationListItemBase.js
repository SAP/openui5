sap.ui.define(['sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/main/thirdparty/ListItemBase', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/main/thirdparty/types/Priority', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/message-success', 'sap/ui/webc/common/thirdparty/icons/message-error', 'sap/ui/webc/common/thirdparty/icons/message-warning', 'sap/ui/webc/common/thirdparty/icons/overflow', './generated/templates/NotifactionOverflowActionsPopoverTemplate.lit', './generated/themes/NotifactionOverflowActionsPopover.css'], function (Keys, i18nBundle, ListItemBase, Integer, Priority, decline, messageSuccess, messageError, messageWarning, overflow, NotifactionOverflowActionsPopoverTemplate_lit, NotifactionOverflowActionsPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ListItemBase__default = /*#__PURE__*/_interopDefaultLegacy(ListItemBase);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var Priority__default = /*#__PURE__*/_interopDefaultLegacy(Priority);

	const metadata = {
		managedSlots: true,
		properties:  {
			titleText: {
				type: String,
			},
			priority: {
				type: Priority__default,
				defaultValue: Priority__default.None,
			},
			showClose: {
				type: Boolean,
			},
			read: {
				type: Boolean,
			},
			busy: {
				type: Boolean,
			},
			busyDelay: {
				type: Integer__default,
				defaultValue: 1000,
			},
		},
		slots:  {
			actions: {
				type: HTMLElement,
			},
		},
		events:  {
			close: {},
		},
	};
	class NotificationListItemBase extends ListItemBase__default {
		constructor() {
			super();
			this.i18nFioriBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		static get metadata() {
			return metadata;
		}
		static get staticAreaTemplate() {
			return NotifactionOverflowActionsPopoverTemplate_lit;
		}
		static get staticAreaStyles() {
			return NotifactionOverflowActionsPopover_css;
		}
		static priorityIconsMappings() {
			return {
				"High": "message-error",
				"Medium": "message-warning",
				"Low": "message-success",
			};
		}
		get hasTitleText() {
			return !!this.titleText.length;
		}
		get hasPriority() {
			return this.priority !== Priority__default.None;
		}
		get priorityIcon() {
			return NotificationListItemBase.priorityIconsMappings()[this.priority];
		}
		get overflowButtonDOM() {
			return this.shadowRoot.querySelector(".ui5-nli-overflow-btn");
		}
		get showOverflow() {
			return !!this.overflowActions.length;
		}
		get overflowActions() {
			if (this.actions.length <= 1) {
				return [];
			}
			return this.actionsInfo;
		}
		get standardActions() {
			if (this.actions.length > 1) {
				return [];
			}
			return this.actionsInfo;
		}
		get actionsInfo() {
			return this.actions.map(action => {
				return {
					icon: action.icon,
					text: action.text,
					press: this._onCustomActionClick.bind(this),
					refItemid: action._id,
					disabled: action.disabled ? true : undefined,
					design: action.design,
				};
			});
		}
		_onBtnCloseClick() {
			this.fireEvent("close", { item: this });
		}
		_onBtnOverflowClick() {
			this.openOverflow();
		}
		_onCustomActionClick(event) {
			const refItemId = event.target.getAttribute("data-ui5-external-action-item-id");
			if (refItemId) {
				this.getActionByID(refItemId).fireEvent("click", {
					targetRef: event.target,
				}, true);
				this.closeOverflow();
			}
		}
		_onkeydown(event) {
			super._onkeydown(event);
			if (event.isMarked === "button") {
				return;
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
		}
		getActionByID(id) {
			return this.actions.find(action => action._id === id);
		}
		async openOverflow() {
			const overflowPopover = await this.getOverflowPopover();
			overflowPopover.showAt(this.overflowButtonDOM);
		}
		async closeOverflow() {
			const overflowPopover = await this.getOverflowPopover();
			overflowPopover.close();
		}
		async getOverflowPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(".ui5-notification-overflow-popover");
		}
	}

	return NotificationListItemBase;

});
