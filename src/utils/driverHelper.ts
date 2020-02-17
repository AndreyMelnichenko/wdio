/**
 * Helper for manipulate WebDriver throught JSON Wire Protocol
 * @see https://webdriver.io/docs/api/jsonwp.html
 *
 * @class DriverHelper
 */
class DriverHelper {

    /**
     * Set download directory for current session
     *
     * @returns {*}
     * @memberof DriverHelper
     */
    public setChromeDownloadDir(path?: string): any {
        const body = {
            "cmd": "Page.setDownloadBehavior",
            "params": {
                "behavior": "allow",
                "downloadPath": path || require('../wdio.conf').config.downloadDir
            }
        };
        // tslint:disable-next-line:no-string-literal
        browser['requestHandler'].create({
            path: `/session/${browser.sessionId}/chromium/send_command`,
            method: 'POST'
        }, body)
    }
}

export { DriverHelper };
