/*global define */
define(["./bar"], function(Bar) {
	"use strict";
	return {
		name: "foo",
		deps: {
			bar: Bar.name
		}
	};
});
