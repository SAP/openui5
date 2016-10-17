/*!
 * ${copyright}
 */

// prettify extension for *.feature files (english version)
// To properly parse the line-based structure of feature files, the first patterns all handle full lines starting with one of the
// keywords of the feature file format. The formatting of the real line content is delegated to helper languages.
PR.registerLangHandler(
	PR.createSimpleLexer([], [
		[PR.PR_COMMENT, /[ \t]*#[^\r\n]*/],
		['lang-feature.plain', /Feature:([^\r\n]*)(?:\r\n|\r|\n)/], // $1: feature description
		['lang-feature.plain', /[ \t]+Scenario:([^\r\n]*)(?:\r\n|\r|\n)/], // $1: scenario description
		['lang-feature.plain', /[ \t][ \t]+(?:Given|When|Then|And|But)([^\r\n]*)(?:\r\n|\r|\n)/], // $1: preconditions/test actions/expectation
		['lang-feature.table', /[ \t][ \t]+(\|(?:[^|]*\|)+)[^\r\n]*(?:\r\n|\r|\n)/], // $1: row of a table with data
		[PR.PR_COMMENT, /[ \t][ \t]+[^\r\n]*(?:\r\n|\r|\n)/], // any other indented line (should be a comment)
		[PR.PR_KEYWORD, /Feature:|Scenario:|Given|When|Then|And|But/],
		[PR.PR_TAG, /@\w+/], // tags
		// final pattern for any remaining text: plain text (after one of the keywords)
		[PR.PR_PLAIN, /[^\r\n]*(?:\r\n|\r|\n)/]
	]), ['feature']);
//helper language to pretty print text after a keyword
PR.registerLangHandler(
	PR.createSimpleLexer([], [
		[PR.PR_PLAIN, /[\s\S]*/]
	]), ['feature.plain']);
//helper language to pretty print data table lines
PR.registerLangHandler(
	PR.createSimpleLexer([], [
		[PR.PR_PUNCTUATION, /\|/, null, '|'],
		[PR.PR_LITERAL, /[^|]*/]
	]), ['feature.table']);
