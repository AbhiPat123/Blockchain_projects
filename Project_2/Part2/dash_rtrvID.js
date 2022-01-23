const Dash = require('dash');

const client = new Dash.Client();

const retrieveIdentity = async () => {
  return client.platform.identities.get('254kN7apCPogHHLPbapjCLgzSJ5CU5Wjq9ppttjQa7Zh');
};

retrieveIdentity()
  .then((d) => console.log('Identity retrieved:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());