/**
 * Various shared client/server functions that repeat in tests a lot
 */

const faker = require('faker');
const mongo = require('mongodb');
const _ = require('lodash');

function generateId() {
  return new mongo.ObjectId().toString();
}

const selectRandom = (list, fraction = 0.5) => {
  const count = Math.floor(list.length * fraction);
  return _.sampleSize(list, count);
};

function generateBaseUser() {
  return {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    languages: [],
  };
}

function generateServerUser(overrides = {}) {
  return {
    ...generateBaseUser(),
    locale: '',
    public: faker.random.boolean(),
    roles: ['user'],
    password: faker.internet.password(),
    ...overrides,
  };
}

function generateClientUser(overrides = {}) {
  return {
    _id: generateId(),
    displayName: faker.name.findName(),
    ...generateBaseUser(),
    ...overrides,
  };
}

/**
 * Generate user objects.
 * @returns {object[]} array of user data
 */
function generateUsers(
  count,
  {
    additionalProvidersData,
    extSitesBW,
    extSitesCS,
    extSitesWS,
    locale,
    newsletter,
    public: pub,
    pushRegistration,
  } = {},
  type = 'server',
  tribes = [],
) {
  return _.range(count).map(() => {
    switch (type) {
      case 'server':
        return generateServerUser({
          additionalProvidersData,
          extSitesBW,
          extSitesCS,
          extSitesWS,
          locale,
          newsletter,
          public: pub,
          pushRegistration,
        });
      case 'client':
        return generateClientUser({
          memberIds: selectRandom(tribes, 0.4).map(tribe => tribe._id),
        });
    }
  });
}

/**
 * Generate reference objects.
 * @param {object[]} users - array of mongodb User
 * @param {[number, number, object][]} referenceData - array of data for each reference
 * @param {number} referenceData[][0] - index of userFrom in users
 * @param {number} referenceData[][1] - index of userTo in users
 * @param {object} referenceData[][2] - object of property: value to override default reference properties
 */
function generateReferences(users, referenceData) {
  return referenceData.map(function (data) {
    const defaultReference = {
      userFrom: users[data[0]]._id,
      userTo: users[data[1]]._id,
      public: true,
      interactions: {
        met: faker.random.boolean(),
        hostedMe: faker.random.boolean(),
        hostedThem: faker.random.boolean(),
      },
      recommend: _.sample(['yes', 'no', 'unknown']),
    };

    return _.defaultsDeep({}, data[2], defaultReference);
  });
}

const generateTribe = index => ({
  _id: generateId(),
  label: faker.lorem.word() + '_' + index,
  labelHistory: faker.random.words(),
  slugHistory: faker.random.words(),
  synonyms: faker.random.words(),
  color: faker.internet.color().slice(1),
  count: Math.floor(Math.random() * 50000),
  created: Date.now(),
  modified: Date.now(),
  public: true,
  image: false,
  attribution: faker.name.findName(),
  attribution_url: faker.internet.url(),
  description: faker.lorem.sentences(),
});

const generateTribes = count => _.range(count).map(i => generateTribe(i));

module.exports = {
  generateId,
  generateClientUser,
  generateUsers,
  generateReferences,
  generateTribes,
};
