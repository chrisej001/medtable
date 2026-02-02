module.exports = {
  apps: [{
    name: 'medidesk-whatsapp-bot',
    script: 'index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Restart strategies
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 5000
  }]
};
