const Dash = require('dash');

const clientOpts = {
  wallet: {
    mnemonic: 'inmate attack vapor term tray bitter forward weekend grief winner tray voyage',
  },
};
const client = new Dash.Client(clientOpts);

const registerAlias = async () => {
  const platform = client.platform;
  const identity = await platform.identities.get('254kN7apCPogHHLPbapjCLgzSJ5CU5Wjq9ppttjQa7Zh');
  const aliasRegistration = await platform.names.register(
    'ThePatKing.dash',
    { dashAliasIdentityId: identity.getId() },
    identity,
  );

  return aliasRegistration;
};

registerAlias()
  .then((d) => console.log('Alias registered:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());