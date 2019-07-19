const CallAuthenticator = require('../lib/call_authenticator');
let authenticator;

beforeEach(() => {
    authenticator = new CallAuthenticator('akid', 'password');
});

test('exception is raised with invalid parameters', () => {
    const attemptToAuthenticate = url => () => authenticator.authenticate(url);

    expect(attemptToAuthenticate(null)).toThrow(Error);
    expect(attemptToAuthenticate('')).toThrow(Error);
});

test('authentication parameters are added to the URL', () => {
    Date.now = jest.fn().mockReturnValue(100);
    const hmacsha1 = require('hmacsha1');

    let authenticatedUrl = authenticator.authenticate('https://example.com/api/add_comment');

    expect(authenticatedUrl).toContain('https://example.com/');
    expect(authenticatedUrl).toHaveQueryParameter('akid', 'akid');
    expect(authenticatedUrl).toHaveQueryParameter('expires', '100');
    expect(authenticatedUrl).toHaveQueryParameter(
        'sig',
        hmacsha1('password', 'akidadd_comment100')
    );
});

test('existing parameters are kept when adding authentication parameters', () => {
    let authenticatedUrl = authenticator.authenticate('https://example.com?existing=param');
    expect(authenticatedUrl).toHaveQueryParameter('existing', 'param');
});

test('UID parameter is added after UID has been set on authenticator', () => {
    authenticator.setUID('fake_uid');

    let authenticatedUrl = authenticator.authenticate('https://example.com/api/add_comment');

    expect(authenticatedUrl).toHaveQueryParameter('uid', 'fake_uid');
});

test('UID parameter is not added if it has not been set on authenticator', () => {
    let authenticatedUrl = authenticator.authenticate('https://example.com/api/add_comment');
    expect(authenticatedUrl).not.toHaveQueryParameter('uid');
});

expect.extend({
    toHaveQueryParameter(received, name, value = null) {
        const Url = require('domurl');
        const parsedUrl = new Url(received);

        const pass = (value === null) ?
                    parsedUrl.query.hasOwnProperty(name) :
                    parsedUrl.query[name] === value;

        return {
            pass,
            message: () => {
                let res = `expected ${received} `;
                res += pass ? 'not to have' : 'to have';
                res += ` query parameter '${name}'`;
                if (value)
                    res += ` with value '${value}'`;

                return res;
            }
        };
    }
});