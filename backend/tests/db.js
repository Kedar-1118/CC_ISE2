const mongoose = require('mongoose');

// Derive a test database connection string from MONGODB_URI
const getTestUri = () => {
    const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mock-api-service';
    
    try {
        const queryIndex = baseUri.indexOf('?');
        const pathPart = queryIndex === -1 ? baseUri : baseUri.substring(0, queryIndex);
        const queryPart = queryIndex === -1 ? '' : baseUri.substring(queryIndex);
        
        const protocolSeparator = '://';
        const protocolIndex = pathPart.indexOf(protocolSeparator);
        const searchStart = protocolIndex === -1 ? 0 : protocolIndex + protocolSeparator.length;
        
        const lastSlashIndex = pathPart.lastIndexOf('/');
        
        if (lastSlashIndex !== -1 && lastSlashIndex >= searchStart) {
            const dbName = pathPart.substring(lastSlashIndex + 1);
            const newDbName = dbName ? `${dbName}-test` : 'mock-api-service-test';
            return pathPart.substring(0, lastSlashIndex + 1) + newDbName + queryPart;
        } else {
            return pathPart + '/mock-api-service-test' + queryPart;
        }
    } catch (e) {
        return baseUri + '-test';
    }
};

/**
 * Connect to the derived test database.
 */
const connect = async () => {
    await mongoose.disconnect();
    const testUri = getTestUri();
    await mongoose.connect(testUri);
};

/**
 * Disconnect from the test database.
 */
const close = async () => {
    await mongoose.disconnect();
};

/**
 * Remove all documents from all collections to clear state between tests.
 */
const clear = async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
};

module.exports = {
    connect,
    close,
    clear,
};
