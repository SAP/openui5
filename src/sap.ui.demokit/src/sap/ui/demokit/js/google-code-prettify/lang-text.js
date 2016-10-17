/*!
 * ${copyright}
 */

// dummy prettify extension for plain text
PR['registerLangHandler'](
	PR['createSimpleLexer']([], [
		[PR['PR_PLAIN'], /[\s\S]*/],
	]), ['plain', 'text']);