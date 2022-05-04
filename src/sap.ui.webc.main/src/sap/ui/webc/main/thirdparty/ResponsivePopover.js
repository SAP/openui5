sap.ui.define(['sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', './generated/i18n/i18n-defaults', './generated/templates/ResponsivePopoverTemplate.lit', './Popover', './Dialog', './Button', './Title', 'sap/ui/webc/common/thirdparty/icons/decline', './generated/themes/ResponsivePopover.css'], function (Device, i18nBundle, PopupUtils, i18nDefaults, ResponsivePopoverTemplate_lit, Popover, Dialog, Button, Title, decline, ResponsivePopover_css) { 'use strict';

	const metadata = {
		tag: "ui5-responsive-popover",
		properties:  {
			contentOnlyOnDesktop: {
				type: Boolean,
			},
			_hideHeader: {
				type: Boolean,
			},
			_hideCloseButton: {
				type: Boolean,
			},
		},
	};
	class ResponsivePopover extends Popover {
		constructor() {
			super();
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [Popover.styles, ResponsivePopover_css];
		}
		get classes() {
			const allClasses = super.classes;
			allClasses.header = {
				"ui5-responsive-popover-header": true,
				"ui5-responsive-popover-header-no-title": !this.headerText,
			};
			return allClasses;
		}
		static get template() {
			return ResponsivePopoverTemplate_lit;
		}
		static get dependencies() {
			return [
				...Popover.dependencies,
				Button,
				Dialog,
				Title,
			];
		}
		async showAt(opener, preventInitialFocus = false) {
			if (!Device.isPhone()) {
				await super.showAt(opener, preventInitialFocus);
			} else {
				this.style.display = "contents";
				this.style.zIndex = PopupUtils.getNextZIndex();
				await this._dialog.show(preventInitialFocus);
			}
		}
		close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
			if (!Device.isPhone()) {
				super.close(escPressed, preventRegistryUpdate, preventFocusRestore);
			} else {
				this._dialog.close(escPressed, preventRegistryUpdate, preventFocusRestore);
			}
		}
		toggle(opener) {
			if (this.isOpen()) {
				return this.close();
			}
			this.showAt(opener);
		}
		isOpen() {
			return Device.isPhone() ? this._dialog.isOpen() : super.isOpen();
		}
		get _dialog() {
			return this.shadowRoot.querySelector("[ui5-dialog]");
		}
		get contentDOM() {
			return this._isPhone ? this._dialog.contentDOM : super.contentDOM;
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _displayHeader() {
			return (this._isPhone || !this.contentOnlyOnDesktop) && super._displayHeader;
		}
		get _displayFooter() {
			return this._isPhone || !this.contentOnlyOnDesktop;
		}
		get _closeDialogAriaLabel() {
			return ResponsivePopover.i18nBundle.getText(i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
		}
		_beforeDialogOpen(event) {
			this.open = true;
			this.opened = true;
			this._propagateDialogEvent(event);
		}
		_afterDialogClose(event) {
			this.open = false;
			this.opened = false;
			this._propagateDialogEvent(event);
		}
		_propagateDialogEvent(event) {
			const type = event.type.replace("ui5-", "");
			this.fireEvent(type, event.detail);
		}
		static async onDefine() {
			ResponsivePopover.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	ResponsivePopover.define();

	return ResponsivePopover;

});
