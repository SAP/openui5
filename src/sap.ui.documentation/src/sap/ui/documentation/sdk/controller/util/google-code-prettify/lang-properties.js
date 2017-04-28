/*!
 * ${copyright}
 */

// prettify extension for *.properties files
// the pattern for style 'lang-properties.value' is used to detect a complete 'logical' line
// the key/value separator and the value are then handled by the helper language 'properties.value'
PR.registerLangHandler(
	PR.createSimpleLexer([], [
		[PR.PR_COMMENT, /^[ \t\u000c]*[#!][^\r\n]*/],
		['lang-properties.value', /[ \t\u000c]*(?:[^ \t\u000c\r\n=:\\]|\\u[0-9a-f]{4,4}|\\(?:\r\n|\r|\n)[ \t\u000c]*|\\[\s\S])+[ \t\u000c]*([ \t\u000c=:](?:[^\r\n\\]|\\u[0-9a-f]{4,4}|\\\r\n|\\[\s\S])*)/i],
		[PR.PR_KEYWORD, /(?:[^ \t\u000c\r\n=:\\]|\\u[0-9a-f]{4,4}|\\(?:\r\n|\r|\n)[ \t\u000c]*|\\[\s\S])+/i],
		[PR.PR_PLAIN, /[ \t\u000c\r\n]/]
	]), ['properties']);
// helper language to pretty print separator and value
PR.registerLangHandler(
	PR.createSimpleLexer([], [
		[PR.PR_PUNCTUATION, /^[ \t\u000c=:][ \t\u000c]*/],
		[PR.PR_STRING, /[^ \t\u000c][\s\S]*/]
	]), ['properties.value']);
