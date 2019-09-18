module.exports = {
    "item.throw": (player, sqlId) => {
        // debug(`${player.name} called item.throw: ${sqlId}`);
        var item = player.inventory.getItem(sqlId);
        if (!item) {
            player.call(`inventory.delete`, [sqlId]);
            return player.utils.error(`Выбросить нечего!`);
        }
        if (player.vehicle) return player.utils.error(`Выйдите из авто!`);
        if (player.hasCuffs) return player.utils.error(`Вы в наручниках!`);
        // TODO: Поумнее сделать.
        var level = mp.convertMinutesToLevelRest(player.minutes).level;
        // if (item.itemId == 4 && level < 100) return player.utils.error(`Временно выключено!`);

        player.inventory.delete(sqlId, (e) => {
            if (e) return player.utils.error(e);
            var info = mp.inventory.getItem(item.itemId);
            var pos = player.position;
            pos.z--;
            pos.z += info.deltaZ;
            var newObj = mp.objects.new(mp.joaat(info.model), pos, {
                rotation: new mp.Vector3(info.rX, info.rY, player.heading),
                dimension: player.dimension
            });
            newObj.item = item;
            newObj.setVariable("inventoryItemSqlId", sqlId);

            pos.z += 0.5;
            /*player.call("label.create", ["E", pos, {
                "inventoryItemSqlId": sqlId
            }, null, 2]);*/
            player.utils.success(`Вы выбросили предмет!`);
            mp.logs.addLog(`${player.name} выбросил на землю ${mp.inventory.getItem(item.itemId).name}`, 'inventory', player.account.id, player.sqlId, { socialClub: player.socialClub, item: mp.inventory.getItem(item.itemId).name, coord: newObj.pos, obj: newObj });

            var id = newObj.id;
            newObj.timerId = setTimeout(() => {
                try {
                    var o = mp.objects.at(id);
                    if (!o || o.getVariable("inventoryItemSqlId") != sqlId) return;

                    o.destroy();
                } catch (e) {
                    console.log(e);
                }
            }, mp.economy["alive_ground_item"].value);

            for (var i = 0; i < player.inventory.ground.length; i++) {
                var gr = player.inventory.ground[i];
                if (gr == sqlId) {
                    player.inventory.ground.splice(i, 1);
                    i--;
                }
            }

            player.inventory.ground.push(sqlId);
            if (player.inventory.ground.length > mp.economy["ground_items_count"].value) {
                var gr = player.inventory.ground.shift();
                mp.objects.forEach((o) => {
                    if (o.getVariable("inventoryItemSqlId") == gr) {
                        clearTimeout(o.timerId);
                        o.destroy();
                    }
                });
            }
            // debug(JSON.stringify(player.inventory.ground));

        });
    },

    "item.pickUp": (player, objId) => {
        //debug(`${player.name} called item.pickUp: ${objId}`);
        var itemObj = mp.objects.at(objId);
        if (!itemObj) return player.utils.error(`Объект не найден!`);
        if (!itemObj.getVariable("inventoryItemSqlId") || !itemObj.item) return player.utils.error(`Объект не является предметом!`);
        if (itemObj.denyPickUp) return player.utils.error(`Другой гражданин начал поднимать первее!`);
        if (player.hasCuffs) return player.utils.error(`Вы в наручниках!`);
        var dist = player.dist(itemObj.position);
        if (dist > Config.maxPickUpItemDist) return player.utils.error(`Вы слишком далеко от предмета!`);
        var freeSlot = player.inventory.findFreeSlot(itemObj.item.itemId);
        if (!freeSlot) {
            //ищем предметы с вместимостью
            mp.objects.forEachInRange(player.position, Config.maxPickUpItemDist, (obj) => {
                if (obj.getVariable("inventoryItemSqlId") && !obj.denyPickUp) {
                    var item = obj.item;
                    // TODO: Чекнуть, возможно, здесь не нужно условие.
                    if (item.itemId == 7 || item.itemId == 8 || item.itemId == 13) {
                        var slot = player.inventory.findFreeSlot(item.itemId);
                        if (slot) itemObj = obj;
                        return;
                    }
                }
            });
        }
        // TODO: Разрешить поднимать одежду противоположного пола.
        if (itemObj.item.params.sex != null && itemObj.item.params.sex != player.sex) return player.utils.error(`Одежда не подходит!`);

        itemObj.denyPickUp = true;
        player.inventory.addOld(itemObj.item.id, itemObj.item, (e) => {
            delete itemObj.denyPickUp;
            if (e) return player.utils.error(e);
            mp.events.call("anim", player, "random@domestic", "pickup_low", 0, 1000);
            player.utils.success(`Предмет добавлен!`);
            //player.call(`itemLabel.destroy`, [itemObj.getVariable("inventoryItemSqlId")]);
            clearTimeout(itemObj.timerId);
            itemObj.destroy();
        });
    },

    "item.updatePos": (player, data) => {
        // debug(`${player.name} called item.updatePos: ${data}`);
        data = JSON.parse(data);
        var sqlId = data[0];
        var parentSqlId = data[1];
        var index = data[2];
        var inVehicle = data[3] || false;

        if (inVehicle) {
            if (player.bootVehicleId == null) return player.utils.error(`Вы не взаимодействуете с багажником авто!`);
            var veh = mp.vehicles.at(player.bootVehicleId);
            if (!veh) return player.utils.error(`Авто с ID: ${vehId} не найдено!`);
            var dist = player.dist(veh.position);
            if (dist > Config.maxInteractionDist * 2) return player.utils.error(`Авто слишком далеко!`);
            if (!veh.getVariable("boot")) return player.utils.error(`Багажник закрыт!`);
            if (!veh.inventory) return player.utils.error(`Авто не имеет инвентаря!`);
            if (!veh.sqlId) return player.utils.error(`Авто не находится в БД!`);
            if (!parentSqlId) {
                debug(`Перемещаем внутри багажника.`);
                return veh.inventory.updatePos(sqlId, parentSqlId, index);
            }
            if (parentSqlId == -1) {
                // надели на игрока
                var item = veh.inventory.getItem(sqlId);
                if (!item) return player.utils.error(`Предмет не найден!`);
                veh.inventory.delete(sqlId, (e) => {
                    if (e) return player.utils.error(e);

                    player.inventory.add(item.itemId, item.params, item.items || {}, (e) => {
                        if (e) return player.utils.error(e);

                        player.utils.info(`Вы взяли предмет из багажника`);
                        debug(`Переместили из багажника на тело игрока.`);
                    });
                });
            } else {
                // из багажника в вещь игрока
                var item = veh.inventory.getItem(sqlId);
                if (!item) return player.utils.error(`Предмет не найден!`);
                veh.inventory.delete(sqlId, (e) => {
                    if (e) return player.utils.error(e);

                    var parentItem = player.inventory.getItem(parentSqlId);
                    if (!parentItem) return player.utils.error(`Вещь не найдена!`);

                    player.inventory.addToItem(item, parentSqlId, index, (e, insertId) => {
                        if (e) return player.utils.error(e);
                        player.call("inventory.updateSqlId", [sqlId, insertId]);
                        player.utils.info(`Вы взяли предмет из багажника`);
                        debug(`Переместили из багажника на вещь игрока.`);
                    });
                });
            }
        } else {
            if (parentSqlId == -2) {
                /* Перетащили из инвентаря игрока в багажник. */
                if (player.bootVehicleId == null) return player.utils.error(`Вы не взаимодействуете с багажником авто!`);
                var veh = mp.vehicles.at(player.bootVehicleId);
                if (!veh) return player.utils.error(`Авто с ID: ${vehId} не найдено!`);
                var dist = player.dist(veh.position);
                if (dist > Config.maxInteractionDist * 2) return player.utils.error(`Авто слишком далеко!`);
                if (!veh.getVariable("boot")) return player.utils.error(`Багажник закрыт!`);
                if (!veh.inventory) return player.utils.error(`Авто не имеет инвентаря!`);
                if (!veh.sqlId) return player.utils.error(`Авто не находится в БД!`);

                var item = player.inventory.getItem(sqlId);
                if (!item) return player.utils.error(`Предмет не найден!`);
                if (item.items && Object.keys(item.items).length > 0) return player.utils.error(`Освободите карманы!`);

                player.inventory.delete(sqlId);
                veh.inventory.add(item.itemId, item.params, item.items || {}, (e, insertId) => {
                    if (e) return player.utils.error(e);
                    item.index = index;
                    delete item.parentId;
                    var i = {};
                    i[insertId] = item;
                    player.call("inventory.vehAdd", [i]);
                    player.call("inventory.updateSqlId", [sqlId, insertId]);
                    player.utils.info(`Вы положили предмет в багажник`);
                    debug(`Перемещаем из игрока в багажник.`);
                }, false, index);
            } else {
                player.inventory.updatePos(sqlId, parentSqlId, index, (e) => {
                    if (e) return player.utils.error(e);

                    debug(`Перемещаем внутри игрока.`);
                });
            }
        }

    },

    "items.merge": (player, data) => {
        data = JSON.parse(data);
        // debug(`items.merge: ${player.name} ${data}`);
        var item = player.inventory.getItem(data[0]);
        var targetItem = player.inventory.getItem(data[1]);
        if (!item || !targetItem) return player.utils.error(`Один из предметов для слияния не найден!`);
        var drugsIds = [55, 56, 57, 58];

        if (item.itemId == 4 && targetItem.itemId == 4) { // слияние денег
            targetItem.params.count += item.params.count;
            item.params.count = 0;
            //player.utils.setMoney(player.money + item.params.count);
            player.inventory.delete(data[0]);
            player.inventory.updateParams(data[1], targetItem);
        } else if (item.params.ammo && !item.params.weaponHash && targetItem.params.ammo && !targetItem.params.weaponHash && item.itemId == targetItem.itemId) { //слияние патрон
            targetItem.params.ammo += item.params.ammo;
            item.params.ammo = 0;
            //player.utils.setMoney(player.money + item.params.count);
            player.inventory.delete(data[0]);
            player.inventory.updateParams(data[1], targetItem);
        } else if (item.params.ammo != null && !item.params.weaponHash && targetItem.params.weaponHash) {
            var weaponAmmo = {
                "20": 37, //9mm
                "21": 38, //12mm
                "22": 40, //5.56mm
                "23": 39, //7.62mm
                "44": 37,
                "45": 37,
                "46": 37,
                "47": 37,
                "48": 37,
                "49": 38,
                "50": 39,
                "51": 40,
                "52": 39,
                "53": 39,
            };
            if (item.itemId != weaponAmmo[targetItem.itemId]) return player.utils.error(`Неверный тип патрон!`);

            targetItem.params.ammo += item.params.ammo;
            //player.call(`addWeaponAmmo`, [targetItem.params.weaponHash, item.params.ammo]);
            player.setWeaponAmmo(targetItem.params.weaponHash, parseInt(targetItem.params.ammo));
            player.inventory.delete(data[0]);
            player.inventory.updateParams(data[1], targetItem);
        } else if (item.itemId == targetItem.itemId && drugsIds.indexOf(item.itemId) != -1) {
            targetItem.params.count += item.params.count;
            item.params.count = 0;
            player.inventory.delete(data[0]);
            player.inventory.updateParams(data[1], targetItem);
        } else if (item.itemId == 62 && targetItem.itemId == 34) {
            if (targetItem.params.count >= 20) return player.utils.error(`Пачка полная!`);
            targetItem.params.count++;
            player.inventory.delete(data[0]);
            player.inventory.updateParams(data[1], targetItem);
        }
    },

    "item.split": (player, data) => {
        // debug(`item.split: ${player.name} ${data}`);
        return player.utils.error(`Разделение выключено!`);
        data = JSON.parse(data);
        var item = player.inventory.getItem(data[0]);

        if (!item) return player.utils.error(`Предмет не найден!`);
        var itemIds = [4, 37, 38, 39, 40, 55, 56, 57, 58];
        if (itemIds.indexOf(item.itemId) == -1) return player.utils.error(`Неверный тип предмета!`);

        if (item.params.ammo) { // разделение патрон
            var count = Math.clamp(data[1], 0, item.params.ammo - 1);
            var freeSlot = player.inventory.findFreeSlot(item.itemId);
            if (!freeSlot) return player.utils.error(`Свободный слот не найден!`);
            if (count >= item.params.ammo) return player.utils.error(`Неверное количество!`);
            item.params.ammo -= count;
            player.inventory.updateParams(data[0], item);
            player.inventory.add(item.itemId, {
                ammo: count
            });
        } else {
            var count = Math.clamp(data[1], 0, item.params.count - 1);
            var freeSlot = player.inventory.findFreeSlot(item.itemId);
            if (!freeSlot) return player.utils.error(`Свободный слот не найден!`);
            if (count >= item.params.count) return player.utils.error(`Неверное количество!`);
            item.params.count -= count;
            player.inventory.updateParams(data[0], item);
            player.inventory.add(item.itemId, {
                count: count
            }, null, null, true);
        }

        player.utils.success(`Предмет разделен!`);
    },

    "weapon.throw": (player, itemSqlId, ammo) => {
        //debug(`weapon.throw: ${itemSqlId} ${ammo}`);
        var item = player.inventory.getItem(itemSqlId);
        if (!item) return player.utils.error(`Оружие не найдено!`);
        ammo = Math.clamp(ammo, 0, 10000);
        item.params.ammo = ammo;
        player.inventory.updateParams(itemSqlId, item);
        mp.events.call("item.throw", player, itemSqlId, ammo);
    },

    "weapon.updateAmmo": (player, weaponHash, ammo) => {
        //debug(`weapon.updateAmmo: ${weaponHash} ${ammo}`);
        //debug(mp.joaat("weapon_carbinerifle"));
        var weapons = player.inventory.getArrayWeapons();
        var fixHashes = {
            "-2084633992": "2210333304",
            "-1569615261": "2210333304",
            "-1045183535": "2210333304",
            "-1786099057": "2210333304",
            "-656458692": "2210333304",
            "-1716189206": "2210333304",
            "453432689": "2210333304",
            "584646201": "2210333304",
            "324215364": "2210333304",
            "736523883": "2210333304",
            "487013001": "2210333304",
            "2017895192": "2210333304",
            "-1074790547": "2210333304",
            "2132975508": "2210333304",
            "1649403952": "2210333304",
            "-1660422300": "2210333304",
            "100416529": "2210333304",
            "1737195953": "2210333304",
            "-1951375401": "2210333304",
            "911657153": "2210333304",
            "1593441988": "2210333304",
        }; //to do дополнить
        for (var key in weapons) {
            var item = weapons[key];
            var invWeaponHash = item.params.weaponHash;
            var fixHash = fixHashes[weaponHash];
            //debug(`weaponHash: ${weaponHash}`);
            //debug(`invWeaponHash: ${invWeaponHash}`);
            //debug(`fixHash: ${fixHash}`);
            if (invWeaponHash == weaponHash || (fixHash && fixHash == invWeaponHash)) {
                //debug(`updateAmmo ok!`);
                ammo = Math.clamp(ammo, 0, 10000);
                item.params.ammo = ammo;
                player.inventory.updateParams(item.id, item);
                return;
            }
        }

        // Перепишу, отвечаю, 27 апреля 2019 | Tomat
        /*player.removeAllWeapons();
        player.utils.error(`Оружие с HASH: ${weaponHash} не найдено!`);

        // TODO: Сделать лучше.
        var adm_color = "#ff6666"; // Цвет для реальных пацанов: #FF0000
        mp.players.forEach((rec) => {
            if (rec.sqlId && rec.admin) rec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> использует неизвестное оружие ${weaponHash}`]);
            // chatAPI.custom_push(`<a style="color: #FF0000">[A] Tomat Petruchkin:</a> всем доброго времени суток!`);
        });*/
    },

    /* Игрок начал взаимодействие с багажником. */
    "vehicle.requestItems": (player, vehId) => {
        // debug(`vehicle.requestItems: ${player.name} ${vehId}`)
        var veh = mp.vehicles.at(vehId);
        if (!veh) return player.utils.error(`Авто с ID: ${vehId} не найдено!`);
        var dist = player.dist(veh.position);
        if (dist > Config.maxInteractionDist * 2) return player.utils.error(`Авто слишком далеко!`);
        if (!veh.getVariable("boot")) return player.utils.error(`Багажник закрыт!`);
        if (!veh.inventory) return player.utils.error(`Авто не имеет багажник!`);
        if (!veh.sqlId) return player.utils.error(`Авто не находится в БД!`);
        if (veh.bootPlayerId != null) return player.utils.error(`С багажником взаимодействует другой гражданин!`);

        veh.bootPlayerId = player.id;
        player.bootVehicleId = veh.id;
        player.call(`inventory.addVehicleItems`, [veh.inventory.items, {
            name: veh.name,
            sqlId: veh.sqlId
        }, 5, 10]);
        // console.log(veh);
    },

    /* Игрок закончил взаимодействие с багажником. */
    "vehicle.requestClearItems": (player, vehId) => {
        // debug(`vehicle.requestClearItems: ${player.name} ${vehId}`)
        var veh = mp.vehicles.at(vehId);
        player.call(`inventory.deleteVehicleItems`);
        delete player.bootVehicleId;

        if (veh && player.id == veh.bootPlayerId) {
            delete veh.bootPlayerId;
        }
    },


    /* Индивидуальная Функциональность предметов инвентаря. */
    "showDocuments": (player, itemSqlId) => {
        //debug(`showDocuments: ${itemSqlId}`);
        var item = player.inventory.getItem(itemSqlId);
        if (!item || item.itemId != 16) {
            player.call("inventory.delete", [itemSqlId]);
            return player.utils.error(`Предмет не найден!`);
        }
        if (!item.params.owner) return player.utils.error(`Владелец предмета не найден!`);
        DB.Handle.query(`SELECT id,name,sex,minutes,law,relationshipName,relationshipDate
                  FROM characters WHERE id=?`, [item.params.owner], (e, result) => {
            if (result.length == 0) return player.utils.error(`Игрок с ID: ${item.params.owner} не найден!`);

            var data = {};
            for (var key in result[0]) data[key] = result[0][key];
            data.houses = convertHousesToDocHouses(mp.houses.getArrayByOwner(item.params.owner));
            data.licenses = JSON.parse(JSON.stringify(item.params.licenses || []));
            data.weapon = JSON.parse(JSON.stringify(item.params.weapon || []));
            data.work = JSON.parse(JSON.stringify(item.params.work || []));

            for (var i = 0; i < data.work.length; i++) {
                var faction = mp.factions.getBySqlId(data.work[i].faction);
                data.work[i].faction = faction.name;
                data.work[i].rank = mp.factions.getRankName(faction.sqlId, data.work[i].rank);
            }

            player.call(`documents.showAll`, [data]);
        });
    },

    "documents.show": (player, recId, docType) => {
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);

        var items = player.inventory.getArrayByItemId(16); // документы
        var keys = Object.keys(items);
        if (keys.length == 0) return player.utils.error(`Документы не найдены!`);
        var item = items[keys[0]];
        if (!item.params.owner) return player.utils.error(`Владелец предмета не найден!`);

        var data = {};
        switch (docType) {
            case "passport":
                DB.Handle.query(`SELECT id,name,sex,minutes,law,relationshipName,relationshipDate,houses FROM characters WHERE id=?`,
                    [item.params.owner], (e, result) => {

                        if (result.length == 0) return player.utils.error(`Игрок с ID: ${item.params.owner} не найден!`);

                        for (var key in result[0]) data[key] = result[0][key];
                        data.houses = JSON.parse(data.houses);

                        rec.call(`documents.showPassport`, [data]);
                    });
                break;
            case "licenses":
                data.licenses = JSON.parse(JSON.stringify(item.params.licenses || []));
                rec.call(`documents.showLicenses`, [data]);
                break;
            case "weapon":
                data.weapon = JSON.parse(JSON.stringify(item.params.weapon || []));
                rec.call(`documents.showWeapon`, [data]);
                break;
            case "work":
                data.work = JSON.parse(JSON.stringify(item.params.work || []));

                for (var i = 0; i < data.work.length; i++) {
                    var faction = mp.factions.getBySqlId(data.work[i].faction);
                    data.work[i].faction = faction.name;
                    data.work[i].rank = mp.factions.getRankName(faction.sqlId, data.work[i].rank);
                }
                rec.call(`documents.showWork`, [data]);
                break;
            default:
                player.utils.error(`Типа документа не опознан!`);
                return;
        }

        player.utils.info(`Вы показали документы`);
        rec.utils.info(`${player.name} показал Вам документы`);
    },

    "documents.showFaction": (player, recId) => {
        // debug(`documents.showFaction: ${player.name} ${recId}`);
        if (recId == -1) recId = player.id;
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);

        if (!player.faction) return player.error(`Вы не состоите в организации!`);
        var itemId;
        if (mp.factions.isPoliceFaction(player.faction)) itemId = 29;
        else if (mp.factions.isFibFaction(player.faction)) itemId = 61;
        else if (mp.factions.isHospitalFaction(player.faction)) itemId = 63;
        else if (mp.factions.isArmyFaction(player.faction)) itemId = 60;

        var items = player.inventory.getArrayByItemId(itemId); // удостоверение
        var keys = Object.keys(items);
        if (keys.length == 0) return player.utils.error(`Удостоверение не найдено!`);
        var item = items[keys[0]];
        if (!item.params.owner) return player.utils.error(`Владелец предмета не найден!`);
        if (item.params.owner != player.sqlId) return player.utils.error(`Нельзя показать чужое удостоверение!`);
        if (item.params.faction != player.faction) return player.utils.error(`Нельзя показать удостоверение другой организации!`);

        var data = {
            Name: player.name,
            Sex: player.sex,
            Minutes: player.minutes,
            Rank: mp.factions.getRankName(player.faction, player.rank),
            ID: player.sqlId,
            Area: '#1',
            faction: player.faction
        };

        rec.call(`documents.showFaction`, [data]);

        if (recId != player.id) {
            player.utils.info(`Вы показали удостоверение`);
            rec.utils.info(`${player.name} показал Вам удостоверение`);
        }
    },

    /* События копов. */
    "cuffsOnPlayer": (player, recId) => { // надеть/снять наручники
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);
        if (rec.vehicle) return player.utils.error(`Гражданин в авто!`);

        if (!rec.hasCuffs) {
            var cuffsItems = player.inventory.getArrayByItemId(28);
            if (!Object.keys(cuffsItems).length) return player.utils.error(`Вы не имеете наручники!`);
            player.inventory.delete(Object.values(cuffsItems)[0].id);

            rec.utils.info(`${player.name} надел на Вас наручники`);
            player.utils.success(`${rec.name} в наручниках`);
        } else {
            var params = {
                faction: player.faction,
                owner: player.sqlId
            };
            player.inventory.add(28, params, {}, (e) => {
                if (e) return player.utils.error(e);
            });

            rec.utils.info(`${player.name} снял с Вас наручники`);
            player.utils.info(`${rec.name} без наручников`);

            delete rec.isFollowing;
            rec.call(`stopFollowToPlayer`);
        }

        rec.utils.setCuffs(!rec.hasCuffs);
    },

    "showWantedModal": (player, recId) => { // показать окно выдачи розыска
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);
        if (rec.wanted >= Config.maxWantedLevel) return player.utils.error(`${rec.name} имеет максимальный уровень розыска!`);

        player.call(`modal.show`, ["give_wanted", {
            "playerId": recId,
            "playerName": rec.name,
            "wanted": rec.wanted
        }]);
    },

    "giveWanted": (player, data) => {
        //debug(`giveWanted: ${data}`);
        data = JSON.parse(data);
        var recId = data[0],
            wanted = data[1],
            reason = data[2];
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);
        if (wanted > Config.maxWantedLevel) return player.utils.error(`Выберите от 1 до ${Config.maxWantedLevel} уровня розыска!`);
        if (rec.wanted >= Config.maxWantedLevel) return player.utils.error(`${rec.name} имеет максимальный уровень розыска!`);

        rec.utils.setWanted(rec.wanted + wanted);
        player.utils.success(`${rec.name} объявлен в розыск`);
        rec.utils.warning(`${player.name} объявил Вас в розыск`);
        mp.logs.addLog(`${player.name} объявил игрока ${rec.name} в розыск. Звезд: ${wanted}`, 'faction', player.account.id, player.sqlId, { faction: player.faction, wanted: wanted });
        mp.logs.addLog(`${rec.name} был объявлен игроком ${player.name} в розыск. Звезд: ${wanted}`, 'faction', rec.account.id, rec.sqlId, { faction: rec.faction, wanted: wanted });


        //todo broadcast for radio
    },

    "showFinesModal": (player, recId) => { // показать окно выписки штрафа
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);

        player.call(`modal.show`, ["give_fine", {
            "playerId": recId,
            "playerName": rec.name,
            "wanted": rec.wanted
        }]);
    },

    "giveFine": (player, data) => {
        //debug(`giveWanted: ${data}`);
        data = JSON.parse(data);
        var recId = data[0],
            sum = data[1],
            reason = data[2].trim();
        sum = Math.clamp(sum, 1, mp.economy["max_fine_sum"].value);
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);

        rec.fines++;
        DB.Handle.query("INSERT INTO fines (cop,recipient,reason,price,date) VALUES (?,?,?,?,?)",
            [player.sqlId, rec.sqlId, reason, sum, new Date().getTime() / 1000], (e) => {
                if (e) terminal.error(e);
            });

        player.utils.success(`${rec.name} получил штраф на ${sum}$`);
        rec.utils.warning(`${player.name} выписал Вам штраф на ${sum}$`);
        mp.logs.addLog(`${player.name} выписал штраф игроку ${rec.name}. Причина: ${reason}, сумма: ${sum}`, 'faction', player.account.id, player.sqlId, { faction: player.faction, reason: reason, sum: sum });
        mp.logs.addLog(`${rec.name} был выписан штраф игроком ${player.name}. Причина: ${reason}, сумма: ${sum}`, 'faction', rec.account.id, rec.sqlId, { faction: rec.faction, reason: reason, sum: sum });

    },

    "startFollow": (player, recId) => {
        // debug(`startFollow: ${recId}`)
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);

        if (!rec.isFollowing) {
            if (!rec.hasCuffs) return player.utils.error(`Гражданин не в наручниках!`);
            rec.isFollowing = true;
            rec.call(`startFollowToPlayer`, [player.id]);
        } else {
            delete rec.isFollowing;
            rec.call(`stopFollowToPlayer`);
        }
    },

    "putIntoVehicle": (player, recId, vehId) => {
        //debug(`putIntoVehicle ${recId} ${vehId}`);
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        if (rec.vehicle) return player.utils.error(`Гражданин за рулем!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);

        var veh = mp.vehicles.at(vehId);
        if (!veh) return player.utils.error(`Авто не найдено!`);
        var freeSeat = [0, 1, 2];
        var occupants = veh.getOccupants();
        for (var i = 0; i < occupants.length; i++) {
            var occ = occupants[i];
            var index = freeSeat.indexOf(occ.seat);
            if (index != -1) freeSeat.splice(index, 1);
        }

        if (freeSeat.length == 0) return player.utils.error(`В машине нет места!`);
        rec.call(`stopFollowToPlayer`);
        rec.putIntoVehicle(veh, freeSeat[0]);
        player.utils.success(`${rec.name} в машине!`);
        rec.utils.info(`${player.name} посадил Вас в машину!`);
    },

    "removeFromVehicle": (player, recName) => {
        //debug(`removeFromVehicle: ${recName}`);
        var rec = mp.players.getByName(recName);
        if (!rec) return player.utils.error(`Гражданин не найден!`);

        if (rec.vehicle) rec.removeFromVehicle();

        rec.utils.info(`${player.name} вытащил Вас!`);
        player.utils.info(`${rec.name} вытащен`);
    },

    "arrestPlayer": (player, recId) => {
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        //var dist = player.dist(rec.position);
        //if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);
        if (rec.arrestTime > 0) {
            rec.utils.clearArrest();
            return rec.utils.info(`${player.name} выпустил Вас на свободу`);
        }
        if (rec.wanted < 1) return player.utils.error(`Гражданин не является преступником!`);

        var dist = player.dist(mp.policeCells[0]);
        var cellIndex = 0;
        for (var i = 1; i < mp.policeCells.length; i++) {
            if (player.dist(mp.policeCells[i]) < dist) {
                dist = player.dist(mp.policeCells[i]);
                cellIndex = i;
            }
        }
        if (dist > 5) return player.utils.error(`Вы должны находиться у камеры!`);
        if (rec.hasCuffs) {
            var params = {
                faction: player.faction,
                owner: player.sqlId
            };
            player.inventory.add(28, params, {}, (e) => {
                if (e) return player.utils.error(e);
            });
        }

        DB.Handle.query("UPDATE characters SET arrestCell=? WHERE id=?", [cellIndex, rec.sqlId]);

        rec.utils.doArrest(cellIndex, rec.wanted * (mp.economy["wanted_arrest_time"].value / 1000));
        rec.utils.setWanted(0);

        rec.utils.info(`${player.name} посадил Вас в тюрьму!`);

        player.utils.setMoney(player.money + mp.economy["police_arrest_pay"].value);
        player.utils.success(`Вы посадили ${rec.name}!`);
        mp.logs.addLog(`${player.name} арестовал игрока ${rec.name}. Время ареста: ${rec.wanted * (mp.economy["wanted_arrest_time"].value / 1000)}`, 'faction', player.account.id, player.sqlId, { faction: player.faction, time: rec.wanted * (mp.economy["wanted_arrest_time"].value / 1000) });
        mp.logs.addLog(`${rec.name} был арестован игроком ${player.name}. Время ареста: ${rec.wanted * (mp.economy["wanted_arrest_time"].value / 1000)}`, 'faction', rec.account.id, rec.sqlId, { faction: rec.faction, time: rec.wanted * (mp.economy["wanted_arrest_time"].value / 1000) });

        //player.utils.drawTextOverPlayer(`посадил ${rec.name}`);

        //todo broadcast to radio
    },

    "police.lockVeh": (player, vehId) => {
        var veh = mp.vehicles.at(vehId);
        if (!veh) return player.utils.error(`Авто не найдено!`);
        if (!mp.factions.isPoliceFaction(player.faction) && !mp.factions.isFibFaction(player.faction)) return player.utils.error(`Вы не сотрудник порядка!`);
        if (!veh.locked) return player.utils.warning(`Авто не требуется вскрывать!`);
        if (veh.isSmuggling) return player.utils.error(`Нельзя вскрыть авто диллера!`);
        veh.locked = false;
        player.utils.success(`Авто вскрыто!`);
    },

    "item.useDrugs": (player, sqlId) => {
        var drugs = player.inventory.getItem(sqlId);
        if (!drugs) return player.utils.error(`Наркотик не найден!`);
        var drugsIds = [55, 56, 57, 58];
        var effects = ["DrugsDrivingOut", "DrugsMichaelAliensFightOut", "DrugsTrevorClownsFightOut", "DrugsTrevorClownsFightOut"];
        var index = drugsIds.indexOf(drugs.itemId);
        if (index == -1) return player.utils.error(`Предмет не является наркотиком!`);
        if (!drugs.params.count) {
            player.inventory.delete(sqlId);
            return player.utils.error(`Осталось 0 грамм!`);
        }

        var count = Math.clamp(drugs.params.count, 1, 5);
        player.health = Math.clamp(player.health + count * 15, 15, 100);
        drugs.params.count -= count;
        if (drugs.params.count <= 0) player.inventory.delete(sqlId);
        else player.inventory.updateParams(sqlId, drugs);

        player.call("effect", [effects[index], count * mp.economy["drugs_effect_time"].value]);
        player.utils.success(`Вы употребили наркотик!`);
    },

    "item.useSmoke": (player, sqlId) => {
        var smoke = player.inventory.getItem(sqlId);
        if (!smoke) return player.utils.error(`Сигарета не найдена!`);
        player.health = Math.clamp(player.health + 2, 2, 100);
        player.inventory.delete(sqlId);
        player.call("effect", ["DrugsDrivingOut", 10000]);
        if (player.vehicle) return;
        mp.players.forEachInRange(player.position, 20, (rec) => {
            rec.call(`playAnim`, [player.id, 31]);
        });
    },

    "item.takeSmoke": (player, sqlId) => {
        var smokeBox = player.inventory.getItem(sqlId);
        if (!smokeBox) return player.utils.error(`Пачка не найдена!`);
        if (smokeBox.params.count <= 0) return player.utils.error(`Пачка пустая!`);

        player.inventory.add(62, {}, {}, (e) => {
            if (e) return player.utils.error(e);

            smokeBox.params.count--;
            player.inventory.updateParams(sqlId, smokeBox);
        });
    },

    "item.useHealth": (player, sqlId) => {
        var item = player.inventory.getItem(sqlId);
        if (!item || item.itemId != 25) return player.utils.error(`Пластырь не найден!`);
        if (player.health + item.params.count > 100) return player.utils.error(`Вы здоровы!`);
        if (player.getVariable("knockDown")) return player.utils.error(`Вы не в состоянии вылечиться самостоятельно!`);
        player.health = Math.clamp(player.health + item.params.count, 15, 100);
        player.inventory.delete(sqlId);
        player.utils.success(`Пластырь использован!`);
        // TODO: Анимку использования пластыря.
    },
}

/* Конвертирует дома в простые данные для документов. */
function convertHousesToDocHouses(houses) {
    var data = [];
    console.log(`a`)
    console.log(houses)
    houses.forEach((house) => {
        console.log(`b`)
        data.push({
            id: house.id,
            position: house.position
        });
        console.log(`c`)
    });
    console.log(data)
    return data;
}
