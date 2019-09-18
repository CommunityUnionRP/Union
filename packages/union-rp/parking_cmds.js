module.exports = {
    "parking_create": {
        description: "Создать новую парковку. Позиция блипа и расположение педа берется из позиции игрока(поворот туловища учитывается)",
        minLevel: 10,
        syntax: "[name]:s",
        handler: (player, args) => {

            DB.Handle.query("INSERT INTO parking_city (name,cords) VALUES (?,?)",
                [args[0], JSON.stringify(player.position)], (e, result) => {
                    DB.Handle.query("SELECT * FROM parking_city WHERE id=?", result.insertId, (e, result) => {
                        if (result.length == 0) return terminal.error(`Ошибка создания парковки!`, player);
                        terminal.info(`${player.name} создал парковку с ID: ${result[0].id}`);
                        const park = mp.loadParking(result[0]);
                        mp.parkings.push(park);
                    });
            });

        }
    },

    "parking_delete": {
        description: "Удалить парковку",
        minLevel: 10,
        syntax: "[idParking]:n",
        handler: (player, args) => {
            var park = mp.parkings.getBySqlId(args[0]);
            if (!park) return terminal.error(`Парковка с ID: ${args[0]} не найден!`, player);

            mp.parkings.delete(park, (e) => {
                if (e) return terminal.error(e);
                terminal.info(`${player.name} удалил парковку с ID: ${args[0]}`);
            });
        }
    },

    "parking_update": {
        description: "Изменить имя парковки и позицию блипа",
        minLevel: 10,
        syntax: "[idParking]:n [newName]:s",
        handler: (player, args) => {
            var park = mp.parkings.getBySqlId(args[0]);
            if (!park) return terminal.error(`Парковка с ID: ${args[0]} не найден!`, player);

            park.updateParkData(args[1],JSON.stringify(player.position));
            terminal.info(`${player.name} изменил имя парковки №${args[0]} на "${args[1]}"`);
        }
    },

    "parking_create_slot": {
        description: "Создать парковочное место. Позиция берется только у игрока в машине(Поставьте машину так как она спавнится)",
        minLevel: 10,
        syntax: "[idParking]:n",
        handler: (player, args) => {
            if (!player.vehicle) return terminal.error(`Необходимо находится в транспорте(Машину надо поставить как будет спавнится)!`, player);
            DB.Handle.query("INSERT INTO parking_city_slots (pid,cords) VALUES (?,?)",
                [args[0], JSON.stringify(player.position)], (e, result) => {
                    DB.Handle.query("SELECT * FROM parking_city_slots WHERE id=?", result.insertId, (e, result) => {
                        if (result.length == 0) return terminal.error(`Ошибка создания слота парковки!`, player);
                        terminal.info(`${player.name} создал слот(ID:${result[0].id}) на парковке с ID:${args[0]} `);
                        var park = mp.parkings.getBySqlId(args[0]);
                        park.loadSlotData();
                    });
            });

        }
    },

    "parking_delete_slot": {
        description: "Создать парковочное место. Позиция берется только у игрока в машине(Поставьте машину так как она спавнится)",
        minLevel: 10,
        syntax: "[idSlot]:n",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM parking_city_slots WHERE id=?", [args[0]], (e, result) => {
                if (!e) {
                    var park = mp.parkings.getBySqlId(result[0]['pid']);
                    if (!park) return terminal.error(`Парковка с ID: ${result[0]['pid']} не найдена!`, player);

                    park.deleteSlotData(args[0]);
                    terminal.info(`${player.name} удалил слот №${args[0]} на парковке №${result[0]['pid']}`);
                } else {
                    return terminal.error(`Слот парковки с SlotID: ${args[0]} не найден!`, player);
                }
            });
        }
    },

    "parking_update_slot": {
        description: "Изменить координаты парковочного места. Позиция берется только у игрока в машине(Поставьте машину так как она спавнится)",
        minLevel: 10,
        syntax: "[idSlot]:n",
        handler: (player, args) => {
            if (!player.vehicle) return terminal.error(`Необходимо находится в транспорте(Машину надо поставить как будет спавнится)!`, player);
            DB.Handle.query("SELECT * FROM parking_city_slots WHERE id=?", [args[0]], (e, result) => {
                if (!e) {
                    var park = mp.parkings.getBySqlId(result[0]['pid']);
                    if (!park) return terminal.error(`Парковка с ID: ${result[0]['pid']} не найдена!`, player);

                    park.updateSlotData(args[0],JSON.stringify(player.position));
                    terminal.info(`${player.name} изменил координаты слота №${args[0]} на парковке №${result[0]['pid']}`);
                } else {
                    return terminal.error(`Слот парковки с SlotID: ${args[0]} не найден!`, player);
                }
            });
        }
    },

    "parking_tp": {
        description: "Телепортироватся к парковке.",
        minLevel: 10,
        syntax: "[idSlot]:n",
        handler: (player, args) => {
            var park = mp.parkings.getBySqlId(args[0]);
            if (!park) return terminal.error(`Слот парковки с ID: ${args[0]} не найден!`, player);
            player.position = park.cords;

            terminal.info(`${player.name} телепортировался к парковке №${args[0]}`);
            /*
            for (var i in park.slotsData) {
                if(park.slotsData[i].sid===args[0]){
                    player.position = park.slotsData[i].cords;
                    terminal.info(`${player.name} телепортировался к слоту №${args[0]} на парковке №${result[0]['pid']}`);
                }
            }
            */
        }
    },

    "parking_slot_show": {
        description: "Отобразить маркеры и подписать SlotID слотов на парковке.",
        minLevel: 10,
        syntax: "[idParking]:n",
        handler: (player, args) => {
            var park = mp.parkings.getBySqlId(args[0]);
            if (!park) return terminal.error(`Парковка с ID: ${args[0]} не найдена!`, player);
            park.showMarker();
        }
    },

    "parking_slot_hide": {
        description: "Удалить маркеры расположения слотов на парковке.",
        minLevel: 10,
        syntax: "[idParking]:n",
        handler: (player, args) => {
            var park = mp.parkings.getBySqlId(args[0]);
            if (!park) return terminal.error(`Парковка с ID: ${args[0]} не найдена!`, player);
            park.hideMarker();
        }
    },
}
