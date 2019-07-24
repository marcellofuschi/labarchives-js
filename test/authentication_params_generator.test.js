const ParamsGenerator = require('../lib/authentication_params_generator');
let generator;

beforeEach(() => {
    generator = new ParamsGenerator('akid', 'password');
});

test('call authentication parameters are generated', () => {
    Date.now = jest.fn().mockReturnValue(100);
    const hmacsha1 = require('hmacsha1');

    const generatedParams = generator.generateFor('add_comment');

    expect(generatedParams).toHaveProperty('akid', 'akid');
    expect(generatedParams).toHaveProperty('expires', 100);
    expect(generatedParams).toHaveProperty('sig', hmacsha1('password', 'akidadd_comment100'));
    expect(generatedParams).not.toHaveProperty('uid');
});

test('uid parameter is generated as well after it has been set', () => {
    generator.setUID('myUid');

    const generatedParams = generator.generateFor('add_comment');

    expect(generatedParams).toHaveProperty('uid', 'myUid');
});