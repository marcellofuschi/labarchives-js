const hmacsha1 = require('hmacsha1');

module.exports = class {
    constructor(accessKeyId, accessPassword) {
        this.accessKeyId = accessKeyId;
        this.accessPassword = accessPassword;
    }

    generateFor(apiMethod) {
        const expires = Date.now();
        let results = {
            akid: this.accessKeyId,
            expires,
            sig: hmacsha1(this.accessPassword, this.accessKeyId + apiMethod + expires),
        };
        if (this.uid)
            results.uid = this.uid;

        return results;
    }

    setUID(uid) {
        this.uid = uid;
    }
};