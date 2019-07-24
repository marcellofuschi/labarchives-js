const AuthenticationParamsGenerator = require('./authentication_params_generator');
const axios = require('axios');
const BASE_ENDPOINT = 'https://api.labarchives.com/api/';

module.exports = class {
    constructor(accessKeyId, accessPassword) {
        this.authParamsGenerator = new AuthenticationParamsGenerator(accessKeyId, accessPassword);
    }

    async login(login_or_email, password) {
        let responseData = await fetchAndParseXml('users/user_access_info', {
            login_or_email,
            password,
            ...this._authParams('user_access_info')
        });
        this.authParamsGenerator.setUID(responseData.users.id[0]);
    }

    async getFigureEntryIDs() {
        let responseData = await fetchAndParseXml('search_tools/attachment_search', {
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
        let endpoint = BASE_ENDPOINT + 'entries/entry_thumb';
        let queryString = buildQueryString({
            eid: entryID,
            ...this._authParams('entry_thumb')
        });

        return endpoint + '?' + queryString;
    }

    getAttachmentUrlOf(entryID) {
        let endpoint = BASE_ENDPOINT + 'entries/entry_attachment';
        let queryString = buildQueryString({
            eid: entryID,
            ...this._authParams('entry_thumb')
        });

        return endpoint + '?' + queryString;
    }

    _authParams(apiMethod) {
        return this.authParamsGenerator.generateFor(apiMethod);
    }
};

async function fetchAndParseXml(relativeEndpoint, params) {
    let response = await axios.get(BASE_ENDPOINT + relativeEndpoint, { params });
    return await parseXml(response.data);
}

function buildQueryString(params) {
    const esc = encodeURIComponent;
    return Object.keys(params)
        .map(key => esc(key) + '=' + esc(params[key]))
        .join('&');
}

async function parseXml(xml) {
    return new Promise(resolve => {

        let parser = new (require('xml2js').Parser);
        parser.parseString(xml, (err, result) => {
            resolve(result);
        });

    });
}