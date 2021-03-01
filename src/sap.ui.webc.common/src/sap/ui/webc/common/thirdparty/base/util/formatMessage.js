sap.ui.define(function () { 'use strict';

	const messageFormatRegEX = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;
	const formatMessage = (text, values) => {
		values = values || [];
		return text.replace(messageFormatRegEX, ($0, $1, $2, $3, offset) => {
			if ($1) {
				return '\'';
			}
			if ($2) {
				return $2.replace(/''/g, '\'');
			}
			if ($3) {
				return String(values[parseInt($3)]);
			}
			throw new Error(`[i18n]: pattern syntax error at pos ${offset}`);
		});
	};

	return formatMessage;

});
