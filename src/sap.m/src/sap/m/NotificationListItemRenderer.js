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
	var NotificationListItemRenderer = {
		apiVersion: 2
	};

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

		rm.openStart('li', control)
			.class('sapMLIB')
			.class('sapMNLIB')
			.class('sapMNLI');

		if (isUnread) {
			rm.class('sapMNLIUnread');
		}

		if (!authorAvatar) {
			rm.class('sapMNLINoAvatar');
		}

		rm.attr('tabindex', '0');

		// ARIA
		rm.accessibilityState(control, {
			role: "option",
			labelledby: {
				value: sAriaLabelledBy
			}
		});

		rm.openEnd();

		// Processing Message
		rm.renderControl(control.getProcessingMessage());

		rm.openStart('div')
			.class('sapMNLIMain')
			.openEnd();

		// actions and close
		rm.openStart('div')
			.attr('aria-hidden', 'true')
			.class('sapMNLIItem')
			.class('sapMNLIItemAC')
			.openEnd();

		// actions
		if (control._shouldRenderOverflowToolbar()) {
			rm.openStart('div')
				.class('sapMNLIItem')
				.class('sapMNLIActions')
				.openEnd();

			rm.renderControl(control._getOverflowToolbar());
			rm.close('div');
		}

		// close button
		if (control._shouldRenderCloseButton()) {

			rm.openStart('div')
				.class('sapMNLIItem')
				.class('sapMNLICloseBtn')
				.openEnd();

			rm.renderControl(control._getCloseButton());
			rm.close('div');
		}

		// end actions and close
		rm.close('div');

		// content
		rm.openStart('div')
			.class('sapMNLIContent')
			.openEnd();

		// content - title
		rm.openStart('div')
			.class('sapMNLITitle')
			.openEnd();

		// content - title - priority icon
		if (priority !== Priority.None) {
			rm.openStart('div')
				.class('sapMNLIBPriority')
				.class('sapMNLIBPriority' + priority)
				.openEnd();

			rm.renderControl(control._getPriorityIcon());
			rm.close('div');
		}

		rm.openStart('div', sControlId + '-title')
			.class('sapMNLITitleText');

		if (truncate) {
			rm.class('sapMNLIItemTextLineClamp');
		}
		rm.openEnd();
		rm.text(control.getTitle());
		rm.close('div');

		// end content - title
		rm.close('div');

		// content- description
		rm.openStart('div', sControlId + '-descr')
			.class('sapMNLIDescription');

		if (!control.getDescription()) {
			rm.class('sapMNLIDescriptionNoText');
		}
		if (truncate) {
			rm.class('sapMNLIItemTextLineClamp');
		}
		rm.openEnd();
		rm.text(control.getDescription());
		rm.close('div');


		// content - footer
		rm.openStart('div')
			.class('sapMNLIFooter')
			.openEnd();

		// content - footer - author
		rm.openStart('div')
			.class('sapMNLIFooterItem')
			.openEnd();

		rm.text(authorName);
		rm.close('div');

		// content - footer - bullet
		if (authorName && datetime) {
			rm.openStart('div')
				.class('sapMNLIFooterItem')
				.class('sapMNLIFooterBullet')
				.openEnd();

			rm.text('·');
			rm.close('div');
		}

		// content - footer - date time
		rm.openStart('div')
			.class('sapMNLIFooterItem')
			.openEnd();

		rm.text(datetime);
		rm.close('div');

		// content - footer - show more
		if (!control.getHideShowMoreButton()) {
			// aria-hidden stop show more button to read out the whole notification, when in a group
			rm.openStart('div')
				.class('sapMNLIShowMore')
				.attr('aria-hidden', 'true')
				.openEnd();

			rm.renderControl(control._getShowMoreButton());
			rm.close('div');
		}


		rm.renderControl(control._getFooterInvisibleText());
		// end content - footer
		rm.close('div');

		// end content
		rm.close('div');

		// avatar
		rm.openStart('div')
			.class('sapMNLIImage')
			.openEnd();

		if (authorAvatar) {
			rm.renderControl(authorAvatar);
		}
		rm.close('div');

		// end main
		rm.close('div');

		rm.close('li');
	};

	return NotificationListItemRenderer;
}, /* bExport= */ true);
