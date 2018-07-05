define(["./bar", "sub/sub/baz"], function(Bar, Baz) {
    return {
        name: "foo",
        deps: {
            bar: Bar.name,
            baz: Baz.name
        }
    };
});