const AuthenticationParamsGenerator = require('./authentication_params_generator');
const axios = require('axios');
const qs = require('qs');

module.exports = class {
    constructor(options) {
        this.authParamsGenerator = new AuthenticationParamsGenerator(options.accessKeyId, options.accessPassword);

        this.baseURL = options.baseURL || 'https://api.labarchives.com/api/';

        let headers = options.headers || {};
        this.axios = axios.create({
            baseURL: this.baseURL,
            headers,
        });
    }

    async login(username, password) {
        let responseData = await this.__fetchAndParseXml('users/user_access_info', {
            login_or_email: username,
            password,
            ...this._authParams('user_access_info')
        });
        this.authParamsGenerator.setUID(responseData.users.id[0]);
    }

    async getFigureEntryIDs() {
        let responseData = await this.__fetchAndParseXml('search_tools/attachment_search', {
            extension: 'jpg,jpeg,png,tiff,gif',
            max_to_return: 5000,
            ...this._authParams('attachment_search')
        });
        let entries = responseData['search-tools'].entries[0].entry;

        let entryIDs = [];
        entries.forEach(
            entry => entryIDs.push(entry.eid[0])
        );
        return entryIDs;
    }

    getThumbnailUrlOf(entryID) {
        let endpoint = this.baseURL + 'entries/entry_thumb';
        let queryString = qs.stringify({
            eid: entryID,
            ...this._authParams('entry_thumb')
        });

        return endpoint + '?' + queryString;
    }

    getAttachmentUrlOf(entryID) {
        let endpoint = this.baseURL + 'entries/entry_attachment';
        let queryString = qs.stringify({
            eid: entryID,
            ...this._authParams('entry_attachment')
        });

        return endpoint + '?' + queryString;
    }

    _authParams(apiMethod) {
        return this.authParamsGenerator.generateFor(apiMethod);
    }

    async __fetchAndParseXml(relativeEndpoint, params) {
        let response = await this.axios.get(relativeEndpoint, { params });
        return await parseXml(response.data);
    }
};

async function parseXml(xml) {
    return new Promise(resolve => {

        let parser = new (require('xml2js').Parser);
        parser.parseString(xml, (err, result) => {
            resolve(result);
        });

    });
}