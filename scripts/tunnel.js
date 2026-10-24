import localtunnel from 'localtunnel';

const PORT = 3001;
const SUBDOMAIN = `crazy-crunch-${Math.floor(100 + Math.random() * 900)}`;

async function getPublicIP() {
  try {
    const res = await fetch('https://loca.lt/mytunnelpassword');
    return (await res.text()).trim();
  } catch {
    return 'N/A';
  }
}

async function startTunnel() {
  console.log(`🚀 Connecting tunnel for Crazy Crunch on port ${PORT}...`);
  const publicIP = await getPublicIP();

  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

    console.log('\n======================================================');
    console.log(`🌐 CRAZY CRUNCH LIVE URL: ${tunnel.url}`);
    console.log(`🔑 PASSWORD IF PROMPTED: ${publicIP}`);
    console.log('======================================================\n');

    // Keepalive ping every 10 seconds to prevent timeout
    const keepalive = setInterval(async () => {
      try {
        await fetch(`${tunnel.url}/api/health`, {
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
      } catch (err) {
        // Ignore background ping errors
      }
    }, 10000);

    tunnel.on('close', () => {
      clearInterval(keepalive);
      console.log('⚠️ Tunnel connection closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
    });
  } catch (err) {
    console.error('Failed to open tunnel, retrying in 4 seconds...', err.message);
    setTimeout(startTunnel, 4000);
  }
}

startTunnel();
