const mockAsyncStorage = {
    _store: {},
    setItem: jest.fn((key, value) => {
        mockAsyncStorage._store[key] = value;
        return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
        return Promise.resolve(mockAsyncStorage._store[key] || null);
    }),
    removeItem: jest.fn((key) => {
        delete mockAsyncStorage._store[key];
        return Promise.resolve();
    }),
    clear: jest.fn(() => {
        mockAsyncStorage._store = {};
        return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
        return Promise.resolve(Object.keys(mockAsyncStorage._store));
    }),
};

export default mockAsyncStorage;
