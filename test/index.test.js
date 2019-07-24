const LabArchives = require('../lib');
const AxiosMockAdapter = require('axios-mock-adapter');
const qs = require('qs');

const BASE_ENDPOINT = 'https://api.labarchives.com/api/';

const axiosMock = new AxiosMockAdapter(require('axios'));
let client;

beforeEach(async () => {
    client = new LabArchives({ accessKeyId: 'akid', accessPassword: 'password' });
    await mockAndCallLogin();
});

afterEach(() => { axiosMock.reset() });

test('login request is made with correct parameters', async () => {
    assertCorrectLoginRequest(axiosMock.history.get[0]);
});

test('list all the figure entry IDs', async () => {
    await mockFigureAttachmentSearch();

    let entryIDs = await client.getFigureEntryIDs();

    assertCorrectFiguresRequest(axiosMock.history.get[1]);
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
    assertCorrectAuthenticationParams(
        qs.parse(parsedUrl.searchParams.toString()),
        'entry_thumb'
    );
});

test("get URL of entry's attachment", () => {
    let attachmentUrl = client.getAttachmentUrlOf('myEntryID');

    let parsedUrl = new URL(attachmentUrl);
    expect(parsedUrl.href).toMatch(BASE_ENDPOINT + 'entries/entry_attachment');
    expect(parsedUrl.searchParams.get('eid')).toBe('myEntryID');
    assertCorrectAuthenticationParams(
        qs.parse(parsedUrl.searchParams.toString()),
        'entry_attachment'
    );
});

async function mockAndCallLogin() {
    axiosMock.onGet(BASE_ENDPOINT + 'users/user_access_info')
        .reply(200, await loadTextFrom('fake_xml_responses/user_access_info.xml'));

    await client.login('user', 'pass');
}

function assertCorrectLoginRequest(request) {
    expect(request).toBeDefined();
    expect(request.params).toMatchObject({
        login_or_email: 'user',
        password: 'pass',
    });
    assertCorrectAuthenticationParams(request.params, 'user_access_info');
}

async function mockFigureAttachmentSearch() {
    axiosMock.onGet(BASE_ENDPOINT + 'search_tools/attachment_search')
        .reply(200, await loadTextFrom('fake_xml_responses/attachment_search__figures.xml'));
}

function assertCorrectFiguresRequest(request) {
    expect(request).toBeDefined();
    expect(request.params).toHaveProperty('extension', 'jpg,jpeg,png,tiff,gif');
    expect(request.params).toHaveProperty('max_to_return', 5000);
    expect(request.params).toHaveProperty('uid');
    assertCorrectAuthenticationParams(request.params, 'attachment_search');
}

function assertCorrectAuthenticationParams(params, apiMethod) {
    expect(params).toHaveProperty('akid', 'akid');

    expect(params).toHaveProperty('expires');

    const hmacsha1 = require('hmacsha1');
    expect(params).toHaveProperty(
        'sig',
        hmacsha1('password', 'akid' + apiMethod + params.expires)
    );
}

async function loadTextFrom(filePath) {
    const fs = require('fs');
    return new Promise(resolve => {
        fs.readFile(__dirname + '/' + filePath, 'utf-8', (error, data) => {
            resolve(data);
        });
    });
}