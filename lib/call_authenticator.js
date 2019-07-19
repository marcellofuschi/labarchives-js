const Url = require('domurl');
const hmacsha1 = require('hmacsha1');

module.exports = class {
    constructor(accessKeyId, accessPassword) {
        this.accessKeyId = accessKeyId;
        this.accessPassword = accessPassword;
    }

    setUID(uid) {
        this.uid = uid;
    }

    authenticate(url) {
        if (!url) throw new Error;

        const expires = Date.now();
        let authenticatedUrl = new Url(url);

        const path = authenticatedUrl.path;
        const apiMethod = path.substring(path.lastIndexOf('/') + 1);

        Object.assign(authenticatedUrl.query, {
            akid: this.accessKeyId,
            expires,
            sig: hmacsha1(this.accessPassword, this.accessKeyId + apiMethod + expires),
        });
        if (this.uid)
            authenticatedUrl.query.uid = this.uid;

        return authenticatedUrl.toString();
    }
};