const Dash = require('dash');

const clientOpts = {
  wallet: {
    mnemonic: 'inmate attack vapor term tray bitter forward weekend grief winner tray voyage',
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 415000, // only sync from start of 2021
    },
  },  
};
const client = new Dash.Client(clientOpts);

const registerName = async () => {
  const { platform } = client;

  const identity = await platform.identities.get('254kN7apCPogHHLPbapjCLgzSJ5CU5Wjq9ppttjQa7Zh');
  const nameRegistration = await platform.names.register(
    'ASPAT1996.dash',
    { dashUniqueIdentityId: identity.getId() },
    identity,
  );

  return nameRegistration;
};

registerName()
  .then((d) => console.log('Name registered:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());