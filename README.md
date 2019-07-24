# LabArchives API wrapper for JavaScript

Uses [Axios](https://github.com/axios/axios), which is Promise-based.

This package is currently incomplete as it lacks support for most of the features that LabArchives offers through its API.
Feel free to contribute by requesting or adding the functionalities you'd like to use.

## Installation

Available from npm:
```bash
npm install labarchives-js
```

### User's figures retrieval

Retrieve all of a user's image-type entries and get the thumbnail and attachment URL. 

```javascript
const LabArchives = require('labarchives-js');
const client = new LabArchives({
    accessKeyId: 'myAkid',
    accessPassword: 'myPassword',
});

async () => {
    await client.login('username', 'password');
    
    let entryID = await client.getFigureEntryIDs()[0];
    
    let thumbnailUrl = await client.getThumbnailUrlOf(entryID);
    let attachmentUrl = await client.getAttachmentUrlOf(entryID);
}
```


## License

This package is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).