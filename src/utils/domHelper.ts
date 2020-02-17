import { Method, RawResult } from "webdriverio";

/**
 * Use this class for custom js manipulation inside browser session
 * Use cases: get cookies, do inner api requests, etc
 * 
 * @example
 * const domHelper = new DomHelper(browser.sessionId);
 * await domHelper.inject();
 * const cookie = await domHelper.getCookie('CSRF-TOKEN');
 * return domHelper.doFetch('DELETE', 'users/123/delete/', cookie.value);
 * </code>
 * @class DomHelper
 */
class DomHelper {

    private helperid: string;
    private Helper = (context) => {
        context.getCookie = function (cname) {
            const name = cname + "=";
            const decodedCookie = decodeURIComponent(document.cookie);
            const ca = decodedCookie.split(';');
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };
    };

    constructor(id: string) {
        this.helperid = id;
    }


    public get name(): string {
        return `domHelper_${this.helperid}`;
    }

    /**
     * Inject domhelper into dom
     *
     * @returns {Promise<any>}
     * @memberof DomHelper
     */
    public async inject(): Promise<any> {
        return browser.executeAsync(
            (name, hlp, done) => {
                // tslint:disable-next-line:no-eval
                this[`domHelper_${name}`] = eval(hlp);
                this[`domHelper_${name}`](this[`domHelper_${name}`]);
                // tslint:disable-next-line:no-console
                console.log(`=======================================\n
                Inject JS domHelper 'domHelper_${name}'\n
                =======================================\n`);
                done();
            },
            this.helperid,
            this.Helper.toString()
        );
    }

    /**
     * Get coockies from current browser session
     *
     * @param {string} cookieName
     * @returns {Promise<RawResult<any>>}
     * @memberof DomHelper
     */
    public async getCookie(cookieName: string): Promise<RawResult<any>> {
        const result = browser.execute((helperName, cname) => {
            return this[helperName].getCookie(cname);
        }, this.name, cookieName);

        return result;
    }
    /**
     * Do fetch request fro mbrowser session
     *
     * @param {Method} method
     * @param {string} url
     * @param {string} token
     * @returns {Promise<RawResult<any>>}
     * @memberof DomHelper
     */
    public async doFetch(method: Method, url: string, token: string): Promise<RawResult<any>> {
        return browser.executeAsync((cmethod, curl, ctoken, done) => {
            // tslint:disable-next-line:no-console
            fetch(
                curl,
                {
                    method: cmethod,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': ctoken,
                    },
                },

            ).then(r => done(r));
        }, method, url, token);
    }
}

export { DomHelper };
