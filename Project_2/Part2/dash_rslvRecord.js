const Dash = require('dash');

const client = new Dash.Client();

const retrieveNameByRecord = async () => {
  // Retrieve by a name's identity ID
  return client.platform.names.resolveByRecord(
    'dashUniqueIdentityId',
    '254kN7apCPogHHLPbapjCLgzSJ5CU5Wjq9ppttjQa7Zh',
  );
};

retrieveNameByRecord()
  .then((d) => console.log('Name retrieved:\n', d[0].toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());