/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/escapeRegExp",
	"sap/base/util/ObjectPath",
	"sap/ui/model/Filter"
], function(Log, escapeRegExp, ObjectPath, Filter) {
	"use strict";

	/**
	 * Converts a simple string (search term) into a RegExp that behaves like Eclipse class search:
	 * - camel case words are matched by any search term consisting of prefixes of each word in the same order as in the word
	 *   e.g.
	 *      CB   matches: CheckBox, ComboBox
	 *      CoB  only matches ComboBox
	 * - additionally, each term is added "as is" (case insensitive) so
	 *      cb   also matches   MacBook
	 *
	 * @param {string} term Term to convert
	 * @returns {RegExp} Regular Expression created from term
	 * @private
	 */
	function makeJSDTStyleRegExp(term) {

		var l = term.length,
			s1 = '',
			s2 = '',
			i,c;

		for ( i = 0; i < l; i++ ) {
			c = term[i];
			if ( c >= 'A' && c <= 'Z' && i > 0 ) {
				s1 += "[a-z]*";
			}
			s1 += escapeRegExp(c);
			if ( c.toUpperCase() !== c.toLowerCase() ) {
				s2 += '[' + escapeRegExp(c.toUpperCase() + c.toLowerCase()) + ']';
			} else {
				s2 += escapeRegExp(c);
			}
		}

		Log.debug("converted '" + term + "' to /" + s1 + '|' + s2 + "/");

		return new RegExp(s1 + '|' + s2);
	}

	function makeFilterFunction(fields, terms) {

		function prepare(terms) {
			return terms.map( makeJSDTStyleRegExp );
		}

		var iFieldsLength = fields.length;
		fields = fields.map(function(field) {
			if ( typeof field !== 'object' ) {
				field = { path: field };
			}
			if ( field.path != null ) {
				if ( field.formatter ) {
					if ( field.path.indexOf("/") >= 0 ) {
						const aPath = field.path.split("/");
						return function(o) {
							return field.formatter(ObjectPath.get(aPath.slice(), o));
						};
					}
					return function(o) {
						return field.formatter(o[field.path]);
					};
				} else {
					if ( field.path.indexOf("/") >= 0 ) {
						const aPath = field.path.split("/");
						return function(o) {
							return ObjectPath.get(aPath.slice(), o);
						};
					}
					return function(o) {
						return o[field.path];
					};
				}
			} else if ( Array.isArray(field.parts) && field.parts.length === 2 ) {
				return function(o) {
					return field.formatter(o[field.parts[0]], o[field.parts[1]]);
				};
			} else if ( Array.isArray(field.parts) ) {
				return function(o) {
					return field.formatter.apply(this, field.parts.map(function(path) { return o[path]; }));
				};
			} else {
				throw new Error("invalid search field configuration: {path:" + field.path + ", parts:" + field.parts + ", ...}");
			}
		});

		function match(regexps, o) {
			var i,s;

			// concatenate all search fields to a single string for the row
			s = '';
			if ( o ) { // o might be null if data is not an object
				i = iFieldsLength;
				while ( i-- ) {
					s += fields[i](o);
				}
			}

			// all reg exp must match
			i = regexps.length;
			while ( i-- ) {
				if ( !regexps[i].test(s) ) {
					return false;
				}
			}

			return true;
		}

		if ( terms ) {
			return match.bind(this, prepare(terms.trim().split(/\s+/g)));
		} else {
			return function() { return true; };
		}

	}

	return makeFilterFunction;
});
