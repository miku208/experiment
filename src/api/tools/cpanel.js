const fetch = require('node-fetch');
const fs = require('fs');

module.exports = function(app) {
  app.get('/tools/cpanel', async (req, res) => {
    try {
      const {
        domain,
        capikey,
        aapikey,
        ram,
        disk,
        name,
        nestID,
        egg,
        location,
        cpu,
        node
      } = req.query;

      if (!domain) return res.status(400).json({ status: false, message: 'Parameter domain wajib diisi' });
      if (!capikey || !aapikey) return res.status(400).json({ status: false, message: 'capikey & aapikey wajib diisi' });
      if (!name) return res.status(400).json({ status: false, message: 'Parameter name wajib diisi' });
      if (!egg) return res.status(400).json({ status: false, message: 'Parameter egg wajib diisi' });
      if (!location) return res.status(400).json({ status: false, message: 'Parameter location wajib diisi' });
      if (!nestID) return res.status(400).json({ status: false, message: 'Parameter nestID wajib diisi' });
      if (!disk) return res.status(400).json({ status: false, message: 'Parameter disk wajib diisi' });
      if (!ram) return res.status(400).json({ status: false, message: 'Parameter ram wajib diisi' });
      if (!cpu) return res.status(400).json({ status: false, message: 'Parameter cpu wajib diisi' });
      if (!node) return res.status(400).json({ status: false, message: 'Parameter node wajib diisi' });



      const username = name;
      const password = username + "001";
      const email = username + "@api.ryuu-dev.offc.my.id";

      const userResp = await fetch(`${domain}/api/application/users`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aapikey}`
        },
        body: JSON.stringify({
          email,
          username,
          first_name: username,
          last_name: username,
          pw: username + '001',
          language: "en",
          password
        })
      });

      const userData = await userResp.json();
      if (userData.errors) return res.status(500).json({ status: false, error: userData.errors[0] });

      const userId = userData.attributes.id;

      const eggResp = await fetch(`${domain}/api/application/nests/${nestID}/eggs/${egg}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aapikey}`
        }
      });
      const eggData = await eggResp.json();

      const serverResp = await fetch(`${domain}/api/application/servers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aapikey}`
        },
        body: JSON.stringify({
          name,
          description: " ",
          user: userId,
          egg: parseInt(egg),
          docker_image: `ghcr.io/parkervcp/yolks:nodejs_${node}`,
          startup: "if [[ -d .git ]] && [[ ${AUTO_UPDATE} == \"1\" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}",
          environment: {
            INST: "npm",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            CMD_RUN: "npm start"
          },
          limits: {
            memory: parseInt(ram),
            swap: 0,
            disk: parseInt(disk),
            io: 500,
            cpu: cpu
          },
          feature_limits: {
            databases: 5,
            backups: 5,
            allocations: 1
          },
          deploy: {
            locations: [parseInt(location)],
            dedicated_ip: false,
            port_range: []
          }
        })
      });

      const serverData = await serverResp.json();
      if (serverData.errors) return res.status(500).json({ status: false, error: serverData.errors[0] });

      res.status(200).json({
        status: true,
        message: 'Successfully add user + server',
        pw: username + '001',
        user: userData.attributes,
        server: serverData.attributes
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message || 'Terjadi kesalahan internal' });
    }
  });
};