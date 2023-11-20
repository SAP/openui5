/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleRenderer"], function(coreLibrary, InvisibleRenderer) {
	'use strict';

	/**
	 * NotificationListGroup renderer.
	 * @namespace
	 */
	var NotificationListGroupRenderer = {
		apiVersion: 2
	};

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.NotificationListGroup} control An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.render = function (rm, control) {

		// render invisible placeholder
		if (!control.getVisible()) {
			InvisibleRenderer.render(rm, control, control.TagName);
			return false;
		}

		if (!control.getItems().length && !control.getShowEmptyGroup()) {
			InvisibleRenderer.render(rm, control, control.TagName);
			return false;
		}

		var isCollapsed = control.getCollapsed(),
			priority = control.getPriority(),
			bShowItemsCounter = control.getShowItemsCounter(),
			isUnread = control.getUnread(),
			visibleItemsCount = control._getVisibleItemsCount(),
			maxNumberMsg,
			sControlId = control.getId(),
			sGroupTitleId = sControlId + '-groupTitle',
			sInvisibleTitleText = sControlId + '-invisibleGroupTitleText',
			sAriaLablledByIds = sGroupTitleId + ' ' + sInvisibleTitleText;

		rm.openStart('li', control)
			.attr('tabindex', '-1')
			.class('sapMLIB')
			.class('sapMNLIB')
			.class('sapMNLGroup');

		if (isCollapsed) {
			rm.class('sapMNLGroupCollapsed');
		}

		if (isUnread) {
			rm.class('sapMNLGroupUnread');
		}

		rm.accessibilityState(control, {
			role: "listitem",
			labelledby: {
				value: sAriaLablledByIds
			}
		});

		rm.openEnd();

		// group header
		rm.openStart('div')
			.class('sapMNLGroupHeader')
			.openEnd();

		// group header collapse/expand button
		rm.openStart('div')
			.class('sapMNLIItem')
			.class('sapMNLGroupCollapseButton')
			.openEnd();

		rm.renderControl(control._getCollapseButton());
		rm.close('div');

		// content - title - priority icon
		if (priority !== Priority.None) {
			rm.openStart('div')
				.class('sapMNLIBPriority')
				.class('sapMNLIBPriority' + priority)
				.openEnd();

			rm.renderControl(control._getPriorityIcon());
			rm.close('div');
		}

		// group header title
		rm.openStart('div', sControlId + '-groupTitle')
			.class('sapMNLIItem')
			.class('sapMNLGroupTitle')
			.openEnd();

		rm.text(control.getTitle());
		if (bShowItemsCounter) {
			rm.text(' (' + visibleItemsCount + ')');
		}
		rm.close('div');

		// actions
		rm.openStart('div')
			.class('sapMNLIItem')
			.class('sapMNLIActions');

		if (!control._shouldRenderOverflowToolbar() || (isCollapsed && !control._isSmallSize())) {
			rm.class("sapMNLIActionsHidden");
		}

		rm.openEnd();

		if (control._shouldRenderOverflowToolbar()) {
			rm.renderControl(control._getOverflowToolbar());
		}
		rm.close('div');

		// close button
		if (control._shouldRenderCloseButton()) {
			rm.openStart('div')
				.class('sapMNLIItem')
				.class('sapMNLICloseBtn')
				.openEnd();

			rm.renderControl(control._getCloseButton());
			rm.close('div');
		}

		rm.renderControl(control._getGroupTitleInvisibleText());
		// end group header
		rm.close('div');

		rm.openStart('ul', sControlId + "-childrenList")
			.class('sapMNLGroupChildren')
			.attr('role', 'list')
			.openEnd();

		control.getItems().forEach(function (item) {
			rm.renderControl(item);
		});

		if (control._isMaxNumberReached()) {
			maxNumberMsg = control._getMaxNumberReachedMsg();

			rm.openStart('div')
				.class('sapMNLGroupMaxNotifications')
				.openEnd();

			rm.openStart('div')
				.class('sapMNLGroupMNTitle')
				.openEnd();

			rm.text(maxNumberMsg.title);
			rm.close('div');

			rm.openStart('div')
				.class('sapMNLGroupMNDescription')
				.openEnd();

			rm.text(maxNumberMsg.description);
			rm.close('div');

			rm.close('div');
		}

		rm.close('ul');

		rm.close('li');
	};

	return NotificationListGroupRenderer;
}, /* bExport= */ true);
