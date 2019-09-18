module.exports = {
    "farm_field_fill": {
        description: "Засеять поле.",
        minLevel: 5,
        syntax: "[fieldId]:n [grain]:n",
        handler: (player, args) => {
            var field = mp.farmFields.getBySqlId(args[0]);
            if (!field) return terminal.error(`Поле с ID: ${args[0]} не найдено!`, player);
            args[1] = Math.clamp(args[1], 0, 3);

            field.fill(args[1]);
            terminal.info(`${player.name} засеял поле с ID: ${args[0]}`)
        }
    },

    "tp_farm": {
        description: "Телепортироваться в ферме.",
        minLevel: 3,
        syntax: "[ид_фермы]:n",
        handler: (player, args) => {
            var farm = mp.farms.getBySqlId(args[0]);
            if (!farm) return terminal.error(`Ферма с ID: ${args[0]} не найдена!`, player);
            farm.position.z += 1;
            player.position = farm.position;
            terminal.info(`Вы телепортировались к ферме с ID: ${args[0]}`, player);
        }
    },
}
