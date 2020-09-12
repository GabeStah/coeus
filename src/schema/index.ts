export const schema = {
  collection: {
    $id: 'collection',
    type: 'string',
    minLength: 4,
    maxLength: 190
  },
  db: {
    $id: 'db',
    type: 'string',
    minLength: 4,
    maxLength: 64,
    pattern: '^(?!coeus).+'
  }
};
