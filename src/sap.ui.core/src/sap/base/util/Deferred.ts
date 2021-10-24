export class Deferred {
    constructor(...args: any) {
        var that = this;
        this.promise = new Promise(function (resolve, reject) {
            that.resolve = resolve;
            that.reject = reject;
        });
    }
}