const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const AjvErrors = require('ajv-errors');
const ObjectId = require('mongodb').ObjectID;

const ajv = new Ajv({ allErrors: true, jsonPointers: true });

const addSchemas = () => {
  const schemaDirPath = path.join(__dirname, 'schema');
  const schemaFiles = fs.readdirSync(schemaDirPath);
  schemaFiles.forEach((fileName) => {
    const filePath = path.join(schemaDirPath, fileName);
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    ajv.addSchema(fileData, fileName.substring(0, fileName.length - 5));
  });

  // ObjectId
  ajv.addFormat('objectid', {
    validate: (objId) => ObjectId.isValid(objId),
  });

  ajv.addKeyword('isNotEmpty', {
    validate: function validate(schema, data) {
      const result = typeof data === 'string' && data.trim() !== '';
      if (!result) {
        validate.errors = [{ keyword: 'isNotEmpty', message: 'Cannot be an empty string', params: { keyword: 'isNotEmpty' } }];
      }
      return result;
    },
    errors: true,
  });

  AjvErrors(ajv);
};

const validateJson = (schema, json) => {
  const result = ajv.validate(schema, json);
  return {
    result,
    errors: ajv.errors,
  };
};

module.exports = {
  addSchemas,
  validateJson,
};
