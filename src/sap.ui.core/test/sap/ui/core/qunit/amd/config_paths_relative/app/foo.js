define(["./bar"], function(Bar) {
    return {
        name: "foo",
        deps: {
            bar: Bar.name
        }
    };
});