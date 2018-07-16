/*global define */
define(["./bar", "sub/sub/baz"], function(Bar, Baz) {
	"use strict";
	return {
		name: "foo",
		deps: {
			bar: Bar.name,
			baz: Baz.name
		}
	};
});
