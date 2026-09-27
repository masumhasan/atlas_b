const { seedLegalPart1 } = require('./seedLegalPart1');
const { seedLegalPart2 } = require('./seedLegalPart2');

const CANONICAL_LEGAL_DOCUMENTS = [...seedLegalPart1, ...seedLegalPart2];

module.exports = {
  CANONICAL_LEGAL_DOCUMENTS,
};
