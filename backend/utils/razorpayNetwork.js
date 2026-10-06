import dns from 'node:dns';
import { Agent } from 'undici';

const resolveWithDnsServers = async (hostname, family) => {
  const servers = String(process.env.RAZORPAY_DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  let lastError;
  for (const server of servers) {
    const resolver = new dns.Resolver();
    resolver.setServers([server]);
    try {
      const addresses = family === 6
        ? await new Promise((resolve, reject) => resolver.resolve6(hostname, (error, values) => error ? reject(error) : resolve(values)))
        : await new Promise((resolve, reject) => resolver.resolve4(hostname, (error, values) => error ? reject(error) : resolve(values)));
      return addresses.map((address) => ({ address, family: family === 6 ? 6 : 4 }));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Configured DNS servers could not resolve the host.');
};

export const lookupWithDnsFallback = (hostname, options, callback) => {
  dns.lookup(hostname, options, (systemError, address, family) => {
    if (!systemError) return callback(null, address, family);

    resolveWithDnsServers(hostname, options?.family)
      .then((addresses) => {
        if (options?.all) return callback(null, addresses);
        const result = addresses[0];
        if (!result) return callback(systemError);
        callback(null, result.address, result.family);
      })
      .catch(() => callback(systemError));
  });
};

export const razorpayDispatcher = new Agent({
  connect: { lookup: lookupWithDnsFallback }
});
