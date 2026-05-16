module.exports = {
  apps: [
    {
      name: "sparkirl-dashboard",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/dashboard.fincombat.xyz/app",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        DEEPINFRA_API_KEY: "IAQhGkEIsTNktH1RbfWSCaeH7GiRcPyT",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      log_file: "/var/log/pm2/sparkirl-dashboard.log",
      error_file: "/var/log/pm2/sparkirl-dashboard-error.log",
      out_file: "/var/log/pm2/sparkirl-dashboard-out.log",
    },
  ],
};
