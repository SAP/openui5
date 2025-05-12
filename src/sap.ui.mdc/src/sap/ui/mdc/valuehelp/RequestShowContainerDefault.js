/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device"
], (
	Device
) => {
	"use strict";

	/**
	 * This object contains default behavior for opening <code>ValueHelp</code> {@link sap.ui.mdc.valuehelp.base.Container containers} in the context of interaction on connected controls.
	 * Please also see {@link module:sap/ui/mdc/ValueHelpDelegate.requestShowContainer requestShowContainer}
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.137
	 * @alias module:sap/ui/mdc/valuehelp/RequestShowContainerDefault
	 */
	const RequestShowContainerDefault = {};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.Tap RequestShowContainerReason.Tap}.
	 *
	 * On phones, return true for multi-select usage or if the container is not used as a valuehelp.
	 * At last, check if the content is a non-boolean, unfiltered fixed list.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.Tap = async function (oValueHelp, oContainer) {
		/**
		 *  @deprecated As of version 1.137
		 */
		if (this.shouldOpenOnClick) {
			return await this.shouldOpenOnClick(oValueHelp, oContainer);
		}
		if (Device.system.phone && (!oContainer.isSingleSelect() || !oContainer.isDialog())) {
			return true;
		}

		const [oContent] = oContainer?.getContent() || [];
		return !!oContent && oContent.isA("sap.ui.mdc.valuehelp.content.FixedList") && !oContent.isA("sap.ui.mdc.valuehelp.content.Bool") && !oContent.getFilterList();
	};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.Typing RequestShowContainerReason.Typing}.
	 *
	 * Preloads delegate content.
	 * On phones, return false for single-select usage or if the container is used as a valuehelp.
	 * At last, check content's search support.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.Typing = async function (oValueHelp, oContainer) {
		await oValueHelp.retrieveDelegateContent(oContainer);

		if (Device.system.phone && (oContainer.isSingleSelect() || oContainer.isDialog())) {
			return false;
		}

		const [oContent] = oContainer?.getContent() || [];
		return !!await oContent?.isSearchSupported();
	};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.Filter RequestShowContainerReason.Filter}.
	 *
	 * On desktop, prevent showing FilterableListContent without given filterValue.
	 * On desktop, check ListContent for available data.
	 * Show all other content without further checks.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.Filter = async function (oValueHelp, oContainer) {
		const [oContent] = oContainer?.getContent() || [];
		/**
		 *  @deprecated As of version 1.137
		 */
		if (this.showTypeahead) {
			return await this.showTypeahead(oValueHelp, oContent);
		}
		if (!Device.system.phone) {
			if (oContent?.isA("sap.ui.mdc.valuehelp.base.FilterableListContent") && !oValueHelp.getFilterValue()) {
				return false;
			}
			if (oContent?.isA("sap.ui.mdc.valuehelp.base.ListContent")) {
				return oContent.getListBinding()?.getCurrentContexts().length > 0;
			}
		}
		return !!oContent;
	};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.Focus RequestShowContainerReason.Focus}.
	 *
	 * By default, a container is not shown in response to focus events, as it cannot be determined whether the event was triggered by user interaction or programmatically.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.Focus = async function (oValueHelp, oContainer) {
		/**
		 *  @deprecated As of version 1.137
		 */
		if (this.shouldOpenOnFocus) {
			return await this.shouldOpenOnFocus(oValueHelp, oContainer);
		}
		return false;
	};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.Navigate RequestShowContainerReason.Navigate}.
	 *
 	 * Preloads delegate content.
	 * By default, a container is not shown in response to navigation.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.Navigate = async function (oValueHelp, oContainer) {
		await oValueHelp.retrieveDelegateContent(oContainer); // preload potentially necessary content
		/**
		 *  @deprecated As of version 1.137
		 */
		if (this.shouldOpenOnNavigate) {
			return await this.shouldOpenOnNavigate(oValueHelp, oContainer);
		}
		return false;
	};

	/**
	 * Default behavior for {@link sap.ui.mdc.enums.RequestShowContainerReason.ValueHelpRequest RequestShowContainerReason.ValueHelpRequest}.
	 *
	 * By default, a dialog-like container should be shown on <code>ValueHelpRequest</code> events.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} <code>true</code>, if the value help should trigger opening
	 * @public
	 */
	RequestShowContainerDefault.ValueHelpRequest = function (oValueHelp, oContainer) {
		return oContainer.isDialog();
	};

	return RequestShowContainerDefault;
});