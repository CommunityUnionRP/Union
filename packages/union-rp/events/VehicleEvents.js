module.exports = {

    "vehicle.engine.on": (player) => {
        if (!player.vehicle) return;
        player.vehicle.utils.engineOn();
    },

    "setLeftSignal": (player, enable) => {
        if (!player.vehicle) return;
        player.vehicle.setVariable("leftSignal", enable);
        player.vehicle.setVariable("rightSignal", false);
    },

    "setRightSignal": (player, enable) => {
        if (!player.vehicle) return;
        player.vehicle.setVariable("rightSignal", enable);
        player.vehicle.setVariable("leftSignal", false);
    },

    "setEmergencySignal": (player, enable) => {
        if (!player.vehicle) return;
        player.vehicle.setVariable("rightSignal", enable);
        player.vehicle.setVariable("leftSignal", enable);
    },

    "belt.putOn": (player, enable) => {
        if (!player.vehicle) return;
        //if (enable) player.utils.drawTextOverPlayer(`пристегнул ремень`);
        //else player.utils.drawTextOverPlayer(`отстегнул ремень`);
    },

    "sirenSound.on": (player) => {
        //debug(`sirenSound.on`)
        if (!player.vehicle) return;
        var sirenSound = player.vehicle.getVariable("sirenSound");
        player.vehicle.setVariable("sirenSound", !sirenSound);
    },

    "addMileage": (player, value) => {
        //debug(`addMileage: ${value}`)
        // if (!player.vehicle) return terminal.error(`event "addMileage": ${player.name} не в машине, но таймер обновления пробега сработал!`);
        player.vehicle.utils.addMileage(value);
    },

    "radio.set": (player, radio) => {
        //debug(`radio.set: ${radio}`)
        if (!player.vehicle) return;
        player.vehicle.utils.setRadio(radio);
    },

    "sellCarPlayer": (player, params) => {
        params = JSON.parse(params);

        var invitePlayer = null;
        if (parseInt(params[0]) >= 0) invitePlayer = mp.players.at(parseInt(params[0]));
        else invitePlayer = mp.players.getByName(params[0]);
        if (!invitePlayer) return player.utils.error("Гражданин не найден!");
        if(player.id === invitePlayer.id) return player.utils.error("Нельзя продать авто самому себе!");
        var dist = player.dist(invitePlayer.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин слишком далеко!`);

        var price = parseInt(params[1]);
        if (price <= 0) return player.utils.error(`Неверная цена!`);

        var keys = player.inventory.getItem(params[2]);
        if (!keys) return player.utils.error(`Ключи от авто не найдены!`);
        if (player.sqlId != keys.params.owner) return player.utils.error(`Вы не владелец авто!`);

        var veh = mp.vehicles.getBySqlId(keys.params.car);
        if (!veh) return player.utils.error(`Авто не найдено!`);

        var dist = player.dist(veh.position);
        if (dist > 10) return player.utils.error(`Авто слишком далеко!`);

        player.call("choiceMenu.show", ["sellcarplayer_confirm", {
            name: invitePlayer.name,
            price: price,
            model: keys.params.model
        }]);

        player.sellCarOffer = {
            invitePlayerId: invitePlayer.id,
            price: price,
            keysSqlId: params[2],
            model: keys.params.model,
        };
    },

    "car.sellplayer.agree": (player) => {
        if (!player.sellCarOffer) return player.utils.error(`Предложение не найдено!`);

        var invitePlayer = mp.players.at(player.sellCarOffer.invitePlayerId);
        if (!invitePlayer) return player.utils.error(`Покупатель не найден!`);

        var dist = player.dist(invitePlayer.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Покупатель далеко!`);
        if (player.id == invitePlayer.id) return player.utils.error(`Нельзя продать авто самому себе!`);


        invitePlayer.call("choiceMenu.show", ["buycarplayer_confirm", {
            name: player.name,
            price: player.sellCarOffer.price,
            model: player.sellCarOffer.model,
        }]);

        invitePlayer.sellCarOffer = {
            ownerId: player.id,
            price: player.sellCarOffer.price
        };
    },

    "car.sellplayer.cancel": (player) => {
        delete player.sellCarOffer;
    },

    "car.fix.accept": (player, sqlId) => {
        if (player.money < 50) return player.utils.error(`Недостаточно средств!`);
        player.call("item.fixCarByKeys", [sqlId]);
    },

    "car.buycarplayer.agree": (player) => {
        if (!player.sellCarOffer) return player.utils.error(`Предложение не найдено!`);
        if (player.carIds.length + 1 > player.donateCars) return player.utils.error(`Нельзя приобрести больше!`);
        var owner = mp.players.at(player.sellCarOffer.ownerId);
        if (!owner) return player.utils.error(`Продавец не найден!`);

        var dist = player.dist(owner.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Продавец далеко!`);
        // if (player.id == owner.id) return player.utils.error(`Нельзя продать дом самому себе!`);

        if (!owner.sellCarOffer) return player.utils.error(`Предложение у продавца не найдено!`);

        var keys = owner.inventory.getItem(owner.sellCarOffer.keysSqlId);
        if (!keys) {
            player.utils.error(`У продавца нет ключей от авто!`);
            return owner.utils.error(`Ключи от авто не найдены!`);
        }
        if (owner.sqlId != keys.params.owner) return owner.utils.error(`Гражданин не владелец авто!`);

        var veh = mp.vehicles.getBySqlId(keys.params.car);
        if (!veh) return player.utils.error(`Авто не найдено!`);

        var dist = player.dist(veh.position);
        if (dist > 10) return player.utils.error(`Авто слишком далеко!`);

        if (veh.owner - 2000 != owner.sqlId) return player.utils.error(`Владелец авто - другой гражданин!`);

        var freeSlot = player.inventory.findFreeSlot(54);
        if (!freeSlot) {
            player.utils.error(`Освободите место для ключей!`);
            return owner.utils.error(`Гражданину необходимо место для ключей!`);
        }

        var price = player.sellCarOffer.price;
        if (player.money < price) {
            owner.utils.error(`${player.name} не имеет ${price}$`);
            return player.utils.error(`Необходимо: ${price}$`);
        }

        var params = {
            owner: player.sqlId,
            car: veh.sqlId,
            model: owner.sellCarOffer.model
        };


        player.inventory.add(54, params, null, (e) => {
            if (e) return player.utils.error(e);
            owner.utils.setMoney(owner.money + price);
            player.utils.setMoney(player.money - price);
            veh.utils.setOwner(player.sqlId + 2000);

            mp.logs.addLog(`${owner.name} продал автомобиль ${params.model} за ${price} игроку ${player.name}`, 'main', owner.account.id, owner.sqlId, { model: params.model, price: price });
            mp.logs.addLog(`${player.name} купил автомобиль ${params.model} за ${price} у ${owner.name}`, 'main', player.account.id, player.sqlId, { model: params.model, price: price });

            owner.utils.success(`Авто ${veh.name} продано`);
            player.utils.success(`Авто ${veh.name} куплено`);

            var index = owner.carIds.indexOf(veh.id);
            if (index != -1) owner.carIds.splice(index, 1);
            player.cars.push({ name: params.model });
            player.carIds.push(veh.id);

            owner.inventory.delete(owner.sellCarOffer.keysSqlId);
            delete player.sellCarOffer;
            delete owner.sellCarOffer;

            for (var i = 0; i < owner.cars.length; i++) {
                if (owner.cars[i].name == params.model) {
                    owner.cars.splice(i, 1);
                    i--;
                }
            }

            player.call(`playerMenu.cars`, [player.cars]);
            owner.call(`playerMenu.cars`, [owner.cars]);
        });
    },

    "car.buycarplayer.cancel": (player) => {
        if (!player.sellCarOffer) return;
        var owner = mp.players.at(player.sellCarOffer.ownerId);
        if (owner) {
            owner.utils.info(`${player.name} отменил предложение`);
            delete owner.sellCarOffer;
        }
        delete player.sellCarOffer;
    }
}
