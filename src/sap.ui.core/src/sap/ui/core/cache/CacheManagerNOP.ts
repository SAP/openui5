export class CacheManagerNOP {
    static set(...args: any) {
        return Promise.resolve();
    }
    static get(...args: any) {
        return Promise.resolve(undefined);
    }
    static has(...args: any) {
        return Promise.resolve(false);
    }
    static del(...args: any) {
        return Promise.resolve();
    }
    static reset(...args: any) {
        return Promise.resolve();
    }
    static init(...args: any) {
        return Promise.resolve(this);
    }
    private static _getCount(...args: any) {
        return Promise.resolve(0);
    }
    private static _destroy(...args: any) {
    }
}