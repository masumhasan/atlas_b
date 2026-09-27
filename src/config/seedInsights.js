const { SEED_INSIGHTS_PART_1 } = require('./seedInsightsPart1');
const { SEED_INSIGHTS_PART_2 } = require('./seedInsightsPart2');

const SEED_INSIGHTS = [...SEED_INSIGHTS_PART_1, ...SEED_INSIGHTS_PART_2];

module.exports = {
  SEED_INSIGHTS,
};
