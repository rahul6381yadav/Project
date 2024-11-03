module.exports = {
    pick: jest.fn().mockResolvedValue([
        {
            uri: 'mock-uri',
            type: 'mock-type',
            name: 'mock-name',
            size: 1234,
        },
    ]),
    types: {
        images: 'images',
        pdf: 'pdf',
    },
};
