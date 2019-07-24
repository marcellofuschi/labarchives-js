const LabArchivesClient = require('../lib');
const AxiosMockAdapter = require('axios-mock-adapter');
const axiosMock = new AxiosMockAdapter(require('axios'));
const BASE_ENDPOINT = 'https://api.labarchives.com/api/';
let client;

beforeEach(async () => {
    client = new LabArchivesClient('akid', 'password');
    await mockAndCallLogin();
});

afterEach(() => { axiosMock.reset() });

test('login request is made with correct parameters', async () => {
    verifyIsCorrectLoginRequest(axiosMock.history.get[0]);
});

test('the UID obtained with login is used for subsequent api calls', async () => {
    await mockAndCallSomeRandomApiEndpoint();

    expect(axiosMock.history.get.length).toBe(2);
    expect(axiosMock.history.get[1].params).toHaveProperty('uid', '285489257Ho\'s9^Lt4116011183268315271');
});

test('list figure entry IDs', async () => {
    await mockApi('attachment_search');

    let entryIDs = await client.getFigureEntryIDs();

    verifyIsCorrectFiguresRequest(axiosMock.history.get[1]);
    expect(entryIDs).toEqual([
        'Ny44fC0xLzYvSW5ib3hFbnRyeVBhcnR8MTkuOA==',
        'Ni41fC0xLzUvSW5ib3hFbnRyeVBhcnR8MTYuNQ==',
        'ODUyNS40fDEvNjU1OC9FbnRyeVBhcnR8MjE2NDEuNA==',
        'ODUyNC4xfDEvNjU1Ny9FbnRyeVBhcnR8MjE2MzguMQ==',
    ]);
});

test('get URL of thumb image for attachment', () => {
    let thumbUrl = client.getThumbnailUrlOf('myEntryID');

    let parsedUrl = new URL(thumbUrl);
    expect(parsedUrl.href).toMatch(BASE_ENDPOINT + 'entries/entry_thumb');
    expect(parsedUrl.searchParams.get('eid')).toBe('myEntryID');
    ['uid', 'akid', 'expires', 'sig'].forEach(param => {
        expect(parsedUrl.searchParams.get(param)).not.toBeNull();
    });
});

test("get URL of entry's attachment", () => {
    let attachmentUrl = client.getAttachmentUrlOf('myEntryID');

    let parsedUrl = new URL(attachmentUrl);
    expect(parsedUrl.href).toMatch(BASE_ENDPOINT + 'entries/entry_attachment');
    expect(parsedUrl.searchParams.get('eid')).toBe('myEntryID');
    ['uid', 'akid', 'expires', 'sig'].forEach(param => {
        expect(parsedUrl.searchParams.get(param)).not.toBeNull();
    });
});

async function mockAndCallLogin() {
    await mockApi('user_access_info');
    await client.login('user', 'pass');
}

function verifyIsCorrectLoginRequest(request) {
    expect(request).toBeDefined();
    expect(request.params).toMatchObject({
        login_or_email: 'user',
        password: 'pass',
    });
    verifyIsAuthenticated(request);
}

function verifyIsCorrectFiguresRequest(request) {
    expect(request).toBeDefined();
    expect(request.params).toHaveProperty('max_to_return', 5000);
    verifyIsAuthenticated(request);
}

function verifyIsAuthenticated(request) {
    expect(request.params).toHaveProperty('akid', 'akid');
    expect(request.params).toHaveProperty('expires');
    expect(request.params).toHaveProperty('sig');
}

async function mockAndCallSomeRandomApiEndpoint() {
    await mockApi('attachment_search');
    await client.getFigureEntryIDs();
}

async function mockApi(apiMethod) {
    switch (apiMethod) {
        case 'user_access_info':
            axiosMock.onGet(BASE_ENDPOINT + 'users/user_access_info')
                .reply(200, await loadTextFrom('fake_xml_responses/user_access_info.xml'));
            break;
        case 'attachment_search':
            axiosMock.onGet(BASE_ENDPOINT + 'search_tools/attachment_search')
                .reply(200, await loadTextFrom('fake_xml_responses/attachment_search__figures.xml'));
            break;
        default:
            throw new Error('Tried to mock non-existing API endpoint');
    }
}

async function loadTextFrom(relativePath) {
    const fs = require('fs');
    return new Promise(resolve => {
        fs.readFile(__dirname + '/' + relativePath, 'utf-8', (error, data) => {
            resolve(data);
        });
    });
}