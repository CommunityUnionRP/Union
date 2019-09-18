module.exports = {
    "items_list": {
        description: "Посмотреть предметы инвентаря на сервере. Обновление на вашем клиенте произойдет после релога!",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            var text = "ID) Имя (Описание) [вес] [высота X ширина] | модель | DeltaZ <br/>";
            for (var i = 0; i < mp.inventory.items.length; i++) {
                var item = mp.inventory.items[i];
                text += `${item.sqlId}) ${item.name} (${item.description}) [${item.weight} кг] [${item.height}x${item.width}] | ${item.model} | ${item.deltaZ}<br/>`;
            }

            terminal.log(text, player);
        }
    },
    "set_item_name": {
        description: "Изменить название предмета инвентаря. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [название]:s",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил название предмета с ID: ${args[0]}.`);

            args.splice(0, 1);
            item.setName(args.join(" ").trim());
        }
    },
    "set_item_desc": {
        description: "Изменить описание предмета инвентаря. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [описание]:s",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил описание предмета с ID: ${args[0]}.`);

            args.splice(0, 1);
            item.setDescription(args.join(" ").trim());
        }
    },
    "set_item_weight": {
        description: "Изменить вес предмета инвентаря. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [вес]:n",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил вес предмета с ID: ${args[0]}.`);
            item.setWeight(args[1]);
        }
    },
    "set_item_size": {
        description: "Изменить описание предмета инвентаря. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [высота]:n [ширина]:n",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил размер предмета с ID: ${args[0]}.`);
            item.setSize(args[1], args[2]);
        }
    },
    "set_item_model": {
        description: "Изменить модель предмета инвентаря. Эта модель используется, когда игрок выкидывает предмет. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [модель]:s",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил модель предмета с ID: ${args[0]}.`);
            item.setModel(args[1].trim());
        }
    },
    "set_item_deltaz": {
        description: "Изменить deltaZ предмета инвентаря. Смещение модели по высоте, когда игрок выкидывает предмет. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [deltaZ]:n",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил deltaZ предмета с ID: ${args[0]}.`);
            item.setDeltaZ(args[1]);
        }
    },
    "set_item_rotation": {
        description: "Изменить rotation предмета инвентаря. Поворота модели, когда игрок выкидывает предмет. (см. items_list)",
        minLevel: 5,
        syntax: "[ид_предмета]:n [x]:n [y]:n",
        handler: (player, args) => {
            var item = mp.inventory.getItem(args[0]);
            if (!item) return terminal.error(`Предмет с ID: ${args[0]} не найден!`, player);

            terminal.info(`${player.name} изменил rotation предмета с ID: ${args[0]}.`);
            item.setRotation(args[1], args[2]);
        }
    },
    "give_test_items": {
        description: "Выдать тестовые предметы игроку.",
        minLevel: 6,
        syntax: "[ид_игрока]:n",
        handler: (player, args) => {
            var recipient = mp.players.at(args[0]);
            if (!recipient) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            var response = (e) => {
                if (e) terminal.error(e, player);
            };

            recipient.inventory.add(1, {
                sex: recipient.sex,
                variation: 21,
                texture: 0
            }, {}, response);
            recipient.inventory.add(2, {
                sex: recipient.sex,
                variation: 35,
                texture: 0
            }, {}, response);
            recipient.inventory.add(3, {
                sex: recipient.sex,
                variation: 15,
                texture: 0,
                armour: 100
            }, {}, response);
            recipient.inventory.add(4, {
                count: 100
            }, {}, response);
            /*recipient.inventory.add(5, {
                count: 50
            }, {}, response);*/
            recipient.inventory.add(6, {
                sex: recipient.sex,
                variation: 37,
                texture: 0
            }, {}, response);
            recipient.inventory.add(7, {
                sex: recipient.sex,
                variation: 133,
                texture: 0,
                torso: 0,
                rows: 3,
                cols: 5
            }, {}, response);
            recipient.inventory.add(8, {
                sex: recipient.sex,
                variation: 54,
                texture: 0,
                rows: 3,
                cols: 3
            }, {}, response);
            recipient.inventory.add(9, {
                sex: recipient.sex,
                variation: 67,
                texture: 0
            }, {}, response);
            recipient.inventory.add(10, {
                sex: recipient.sex,
                variation: 17,
                texture: 0
            }, {}, response);
            recipient.inventory.add(11, {
                sex: recipient.sex,
                variation: 3,
                texture: 0
            }, {}, response);
            recipient.inventory.add(12, {
                sex: recipient.sex,
                variation: 3,
                texture: 0
            }, {}, response);
            recipient.inventory.add(13, {
                sex: recipient.sex,
                variation: 45,
                texture: 0,
                rows: 5,
                cols: 10
            }, {}, response);
            recipient.inventory.add(14, {
                sex: recipient.sex,
                variation: 73,
                texture: 0
            }, {}, response);

            recipient.inventory.add(15, {}, {}, response);
            recipient.inventory.add(15, {}, {}, response);
            recipient.inventory.add(15, {}, {}, response);

            recipient.inventory.add(3, {
                sex: recipient.sex,
                variation: 28,
                texture: 0,
                armour: 100
            }, {}, response);
        }
    },
    "clear_inventory": {
        description: "Очистить инвентарь игрока.",
        minLevel: 6,
        syntax: "[ид_игрока]:n",
        handler: (player, args) => {
            var recipient = mp.players.at(args[0]);
            if (!recipient) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            var response = (e) => {
                if (e) terminal.error(e, player);
            };

            for (var key in recipient.inventory.items) {
                var item = recipient.inventory.items[key];
                recipient.inventory.delete(item.id);
            }

            terminal.info(`${player.name} очистил инвентарь у ${recipient.name}`);
        }
    },
    "clear_floor_items": {
        description: "Очистить предметы инвентаря с пола на сервере.",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            var count = 0;
            mp.objects.forEach((obj) => {
                if (obj.getVariable("inventoryItemSqlId") > 0) {
                    count++;
                    obj.destroy();
                }
            });

            terminal.info(`${player.name} очистил предметы инвентаря с пола на сервере.<br/>Удалено: ${count} шт.`);
        }
    },
    "clear_player_items": {
        description: "Полностью очистить предметы инвентаря у игрока (для фикса старой структуры инвентаря)",
        minLevel: 9,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            var sqlId = rec.sqlId;
            rec.utils.success(`${player.name} очистил Ваш инвентарь! Необходимо перезайти.`);
            rec.kick();
            DB.Handle.query("DELETE FROM inventory_players WHERE playerId=?", [sqlId]);
            terminal.info(`${player.name} очистил полностью очистил предметы инвентаря у ${rec.name}`);
        }
    },



}
