module.exports = {
  dialect: 'postgres',
  host: '192.168.99.101',
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  define: {
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  },
};
