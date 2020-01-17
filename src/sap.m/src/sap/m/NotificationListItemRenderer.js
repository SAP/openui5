/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleRenderer", "sap/ui/Device"], function(coreLibrary, InvisibleRenderer, Device) {
	'use strict';

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	/**
	 * NotificationListItem renderer.
	 * @namespace
	 */
	var NotificationListItemRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} control An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.render = function (rm, control) {

		// render invisible placeholder
		if (!control.getVisible()) {
			InvisibleRenderer.render(rm, control, control.TagName);
			return false;
		}

		var truncate = control.getTruncate(),
			authorName = control.getAuthorName(),
			datetime = control.getDatetime(),
			authorAvatar = control._getAuthorAvatar(),
			priority = control.getPriority(),
			isUnread = control.getUnread(),
			priorityClass = '',
			sControlId = control.getId(),
			footerId = sControlId + '-invisibleFooterText',
			sAriaLabelledBy = '';

		if (control.getTitle()) {
			sAriaLabelledBy += ' ' + sControlId + '-title';
		}

		if (control.getDescription()) {
			sAriaLabelledBy += ' ' + sControlId + '-descr';
		}

		sAriaLabelledBy += ' ' + footerId;

		rm.write('<li');
		rm.writeControlData(control);
		rm.addClass('sapMLIB');
		rm.addClass('sapMNLIB');
		rm.addClass('sapMNLI');

		if (isUnread) {
			rm.addClass('sapMNLIUnread');
		}

		if (!authorAvatar) {
			rm.addClass('sapMNLINoAvatar');
		}

		rm.writeClasses();

		rm.writeAttribute('tabindex', '0');

		// ARIA
		rm.writeAccessibilityState(control, {
			role: "option",
			labelledby: {
				value: sAriaLabelledBy
			}
		});

		rm.write('>');

		// Processing Message
		rm.renderControl(control.getProcessingMessage());
		rm.write('<div class="sapMNLIMain">');

		// actions and close
		rm.write('<div aria-hidden="true" class="sapMNLIItem sapMNLIItemAC">');

		// actions
		if (control._shouldRenderOverflowToolbar()) {
			rm.write('<div class="sapMNLIItem sapMNLIActions">');
			rm.renderControl(control._getOverflowToolbar());
			rm.write('</div>');
		}

		// close button
		if (control._shouldRenderCloseButton()) {
			rm.write('<div class="sapMNLIItem sapMNLICloseBtn">');
			rm.renderControl(control._getCloseButton());
			rm.write('</div>');
		}

		// end actions and close
		rm.write('</div>');

		// content
		rm.write('<div class="sapMNLIContent">');

		// content - title
		rm.write('<div class="sapMNLITitle">');

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

		rm.write('<div id=' + sControlId + '-title');
		rm.addClass('sapMNLITitleText');
		if (truncate) {
			rm.addClass('sapMNLIItemTextLineClamp');
		}
		rm.writeClasses();
		rm.write('>');
		rm.writeEscaped(control.getTitle());
		rm.write('</div>');

		// end content - title
		rm.write('</div>');

		// content- description
		rm.write('<div id=' + sControlId + '-descr');
		rm.addClass('sapMNLIDescription');
		if (!control.getDescription()) {
			rm.addClass('sapMNLIDescriptionNoText');
		}
		if (truncate) {
			rm.addClass('sapMNLIItemTextLineClamp');
		}
		rm.writeClasses();
		rm.write('>');
		rm.writeEscaped(control.getDescription());
		rm.write('</div>');


		// content - footer
		rm.write('<div class="sapMNLIFooter">');

		// content - footer - author
		rm.write('<div class="sapMNLIFooterItem">');
		rm.writeEscaped(authorName);
		rm.write('</div>');


		// content - footer - bullet
		if (authorName && datetime) {
			rm.write('<div class="sapMNLIFooterItem sapMNLIFooterBullet">');
			rm.write('·');
			rm.write('</div>');
		}

		// content - footer - date time
		rm.write('<div class="sapMNLIFooterItem">');
		rm.writeEscaped(datetime);
		rm.write('</div>');

		// content - footer - show more
		if (!control.getHideShowMoreButton()) {
			// aria-hidden stop show more button to read out the whole notification, when in a group
			rm.write('<div class="sapMNLIShowMore" aria-hidden="true">');
			rm.renderControl(control._getShowMoreButton());
			rm.write('</div>');
		}


		rm.renderControl(control._getFooterInvisibleText());
		// end content - footer
		rm.write('</div>');

		// end content
		rm.write('</div>');

		// avatar
		rm.write('<div class="sapMNLIImage">');
		if (authorAvatar) {
			rm.renderControl(authorAvatar);
		}
		rm.write('</div>');

		// end main
		rm.write('</div>');

		rm.write('</li>');
	};

	return NotificationListItemRenderer;
}, /* bExport= */ true);
