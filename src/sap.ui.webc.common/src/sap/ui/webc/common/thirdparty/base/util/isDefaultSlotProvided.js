sap.ui.define(['./SlotsHelper'], function (SlotsHelper) { 'use strict';

	const isDefaultSlotProvided = element => {
		return Array.from(element.childNodes).filter(node => {
			return node.nodeType !== Node.COMMENT_NODE
			&& SlotsHelper.getSlotName(node) === "default"
			&& (node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim().length !== 0);
		}).length > 0;
	};

	return isDefaultSlotProvided;

});
