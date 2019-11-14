/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleRenderer", "sap/ui/Device"], function(coreLibrary, InvisibleRenderer, Device) {
	'use strict';

	/**
	 * NotificationListGroup renderer.
	 * @namespace
	 */
	var NotificationListGroupRenderer = {};

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} control An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.render = function (rm, control) {

		// render invisible placeholder
		if (!control.getVisible()) {
			InvisibleRenderer.render(rm, control, control.TagName);
			return false;
		}

		var overflowToolbar = control._getOverflowToolbar(),
			closeButton = control._getCloseButton(),
			isCollapsed = control.getCollapsed(),
			priority = control.getPriority(),
			bShowItemsCounter = control.getShowItemsCounter(),
			isUnread = control.getUnread(),
			priorityClass = '',
			visibleItemsCount = control._getVisibleItemsCount(),
			maxNumberMsg;

		rm.write('<li');
		rm.writeControlData(control);
		rm.addClass('sapMLIB');
		rm.addClass('sapMNLIB');
		rm.addClass('sapMNLGroup');

		if (isCollapsed) {
			rm.addClass('sapMNLGroupCollapsed');
		}

		if (isUnread) {
			rm.addClass('sapMNLGroupUnread');
		}

		rm.writeClasses();

		rm.writeAttribute('tabindex', '0');

		rm.writeAccessibilityState(control, {
			role: "option",
			expanded: !control.getCollapsed(),
			label: control.getAccessibilityText()
		});

		rm.write('>');

		// group header
		rm.write('<div class="sapMNLGroupHeader">');

		// group header collapse/expand button
		rm.write('<div class="sapMNLIItem sapMNLGroupCollapseButton">');
		rm.renderControl(control._getCollapseButton());
		rm.write('</div>');

		// content - title - priority icon
		if (priority !== Priority.None) {
			rm.write('<div');

			rm.addClass("sapMNLIBPriority");

			switch (priority) {
				case Priority.High:
					priorityClass = 'sapMNLIBPriorityHigh';
					break;
				case Priority.Medium:
					priorityClass = 'sapMNLIBPriorityMedium';
					break;
				case Priority.Low:
					priorityClass = 'sapMNLIBPriorityLow';
					break;
			}

			rm.addClass(priorityClass);
			rm.writeClasses();
			rm.write('>');
			rm.renderControl(control._getPriorityIcon());
			rm.write('</div>');
		}

		// group header title
		rm.write('<div class="sapMNLIItem sapMNLGroupTitle">');
		rm.writeEscaped(control.getTitle());
		rm.write('</div>');

		if (bShowItemsCounter) {
			rm.write('<div class="sapMNLGroupCount">(' + visibleItemsCount + ')</div>');
		}

		// group header spacer
		rm.write('<div class="sapMNLGroupHeaderSpacer"></div>');

		// actions
		if (control.getShowButtons() && !isCollapsed) {
			rm.write('<div class="sapMNLIItem sapMNLIActions">');
		} else {
			rm.write('<div class="sapMNLIItem sapMNLIActions" style= "display:none">');
		}

		if (overflowToolbar) {
			rm.renderControl(overflowToolbar);
		}
		rm.write('</div>');

		// close button
		if (control.getShowCloseButton() && closeButton && !Device.system.phone) {
			rm.write('<div class="sapMNLIItem">');
			rm.renderControl(closeButton);
			rm.write('</div>');
		}

		// end group header
		rm.write('</div>');

		rm.write('<ul role="listbox" class="sapMNLGroupChildren">');

		control.getItems().forEach(function (item) {
			rm.renderControl(item);
		});

		if (control._isMaxNumberReached()) {
			maxNumberMsg = control._getMaxNumberReachedMsg();
			rm.write('<div class="sapMNLGroupMaxNotifications">');

			rm.write('<div  class="sapMNLGroupMNTitle">');
			rm.write(maxNumberMsg.title);
			rm.write('</div>');

			rm.write('<div class="sapMNLGroupMNDescription">');
			rm.write(maxNumberMsg.description);
			rm.write('</div>');

			rm.write('</div>');
		}

		rm.write('</ul>');

		rm.write('</li>');
	};

	return NotificationListGroupRenderer;
}, /* bExport= */ true);
