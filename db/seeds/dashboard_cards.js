
exports.seed = async function(knex) {
  return knex('dashboard_cards')
    .then(rows => {
      if (rows.length === 0) {
        return knex('dashboard_cards').insert([
          {
            id: 1,
            index: 0,
            type: 'gauge.arch',
            command: 'RPM'
          },
          {
            id: 2,
            index: 1,
            type: 'gauge.arch',
            command: 'SPEED'
          },
          {
            id: 3,
            index: 2,
            type: 'gauge.full',
            command: 'ENGINE_LOAD'
          },
          {
            id: 4,
            index: 3,
            type: 'gauge.full',
            command: 'THROTTLE_POS'
          },
          {
            id: 5,
            index: 4,
            type: 'numeric',
            command: 'ELM_VOLTAGE'
          },
          {
            id: 6,
            index: 5,
            type: 'numeric',
            command: 'INTAKE_TEMP'
          },
          {
            id: 7,
            index: 6,
            type: 'numeric',
            command: 'MAF'
          },
          {
            id: 8,
            index: 7,
            type: 'numeric',
            command: 'COOLANT_TEMP'
          }
        ])
      }
    });
};
