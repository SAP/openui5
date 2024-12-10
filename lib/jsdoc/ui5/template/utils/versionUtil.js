"use strict";

const rSinceVersion = /^([0-9]+(?:\.[0-9]+(?:\.[0-9]+)?)?([-.][0-9A-Z]+)?)(\.$|\.\s+|[,:;]\s*|\s-\s*|\s|$)/i;
function _parseVersion(value) {
	const m = rSinceVersion.exec(value);
	if (m) {
		// 3rd capture group contains additional characters such as ,: -
		// version is either at its own or text is separated by space
		var versionFollowedBySpace = m[3] === "" || /^\s/.test(m[3]);
		return {
			version: m[1],
			versionFollowedBySpace: versionFollowedBySpace,
			nextPosition: m[0].length
		};
	}
	return undefined;
}

/**
 * Extracts version
 *
 * @example valid versions
 * "1.33.4 "
 * "1.334"
 */
function extractVersion(value) {

	if ( !value ) {
		return undefined;
	}

	if ( value === true ) {
		value = '';
	} else {
		value = String(value);
	}

	const parseResult = _parseVersion(value);
	if (parseResult && parseResult.versionFollowedBySpace) {
		return parseResult.version;
	}
	return undefined;
}

const rSinceIndicator = /^(?:as\s+of|since)(?:\s+version)?\s*/i;

/**
 * Extracts since information from given value.
 *
 * <code>
 * pos: position of additional text
 * since: version information
 * text: additional text
 * </code>
 *
 * @example version indication with valid version
 * Input: "Since version 1.3.4. mytext"
 * Output:
 * { pos: 21, since: '1.3.4', value: 'mytext' }
 *
 * @example version indication without valid version
 * Input: "Since version mytext"
 * Output:
 * { pos: 0, since: null, value: 'Since version mytext.' }
 *
 * @example no indicator and no version present
 * Input: "mytext"
 * Output:
 * { pos: 0, value: 'mytext.' }
 *
 *
 *
 * @param {string|boolean} value
 * @returns {{pos: number, value: string, since: string|null|undefined}}
 * undefined: value is falsy
 */
function extractSince(value) {

	if ( !value ) {
		return undefined;
	}

	if ( value === true ) {
		value = '';
	} else {
		value = String(value);
	}

	const mSinceIndicator = rSinceIndicator.exec(value);
	if (mSinceIndicator) {
		const iSinceIndicatorLength = mSinceIndicator[0].length;
		const versionAndText = value.substring(iSinceIndicatorLength);
		const parseResult = _parseVersion(versionAndText);
		if ( parseResult ) {
			const textPosition = iSinceIndicatorLength + parseResult.nextPosition;
			return {
				since : parseResult.version,
				pos : textPosition,
				value : value.slice(textPosition).trim()
			};
		}
		// since indicator present but version cannot be extracted
		return {
			since: null,
			pos : 0,
			value: value.trim()
		};
	}

	return {
		pos : 0,
		value: value.trim()
	};

}

module.exports = {
	extractSince,
	extractVersion
};
