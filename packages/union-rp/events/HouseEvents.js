module.exports = {
    "goInspectHouse": (player) => {
        console.log(`goInspectHouse: ${player.name}`);
    },
    "goLockUnlockHouse": (player) => {
        var house;
        if (player.colshape) house = player.colshape.house;
        if (!house) house = mp.houses.getBySqlId(player.inHouse);
        if (!house) return player.utils.error(`Вы далеко от дома!`);

        var keys = player.inventory.getArrayByItemId(59);
        for (var sqlId in keys) {
            if (keys[sqlId].params.house == house.sqlId) {
                if (house.closed) house.setClosed(0);
                else house.setClosed(1);
                player.call("houseOwnerMenu.update", [true, house.closed]);
                return;
            }
        }
        player.utils.error(`Ключ от дома не найдены!`);
    },
    "goBuyHouse": (player) => {
        const houses = mp.houses.getArrayByOwner(player.sqlId);
        if (!player.colshape || !player.colshape.house) return player.utils.error(`Вы не у дома!`);
        let house = player.colshape.house;
        if (house.owner) return player.utils.error(`Дом уже куплен!`);

        if (player.money < house.price) return player.utils.error(`Необходимо: ${house.price}$`);
        if (houses.length >= player.donateHouse) return player.utils.error(`Вы имеете максимальное количество жилья`);
        var freeSlot = player.inventory.findFreeSlot(59);
        if (!freeSlot) return player.utils.error(`Освободите место для ключей!`);

        mp.fullDeleteItemsByParams(59, ["house"], [house.sqlId]);
        player.inventory.add(59, {
            owner: player.sqlId,
            house: house.sqlId
        }, null, (e) => {
            if (e) return player.utils.error(e);

            player.utils.setMoney(player.money - house.price);
            house.setOwner(player.sqlId, player.name);
            player.utils.addHouse(house);

            player.utils.setSpawn(1);
            player.utils.setHouseId(house.sqlId);

            player.utils.success(`Дом ${house.sqlId} куплен`);
            mp.logs.addLog(`${player.name} купил дом ${house.sqlId}. Цена: ${house.price}`, 'house', player.account.id, player.sqlId, { houseId: house.sqlId, price: house.price });
            player.call("exitHouseMenu", [true]);
        });
    },
    "goEnterHouse": (player) => {
        if (!player.colshape || !player.colshape.house) return player.utils.error(`Вы не у дома!`);
        let house = player.colshape.house;

        if (house.closed) return player.utils.warning(`Дом закрыт!`);
        player.inHouse = house.sqlId;

        var interior = mp.interiors.getBySqlId(house.interior);
        if (!interior) return player.utils.error(`Интерьер не найден!`);
        if (interior.garageMarker && house.garage) interior.garageMarker.showFor(player);
        //interior.exitMarker.showFor(player);

        if (house.closed) return player.utils.error(`Дом закрыт!`);

        var pos = new mp.Vector3(interior.x, interior.y, interior.z);
        player.dimension = house.sqlId;
        player.position = pos;
        player.heading = interior.h;
        player.call("exitHouseMenu", [true]);
    },
    "goEnterStreet": (player) => {
        if (!player.inHouse) return player.utils.error(`Вы не в доме!`);
        var house = mp.houses.getBySqlId(player.inHouse);
        if (house.closed) return player.utils.warning(`Дом закрыт!`);

        player.position = house.position;
        player.heading = house.h;
        player.dimension = 0;

        var interior = mp.interiors.getBySqlId(house.interior);
        if (!interior) return player.utils.error(`Интерьер не найден!`);
        if (interior.garageMarker) interior.garageMarker.hideFor(player);
        //interior.exitMarker.hideFor(player);

        delete player.inHouse;
    },
    "goEnterGarage": (player) => {
        var enterHouse = mp.houses.getBySqlId(player.inHouse);
        if (!enterHouse) return player.utils.error(`Вы должны быть в доме!`);

        if (!enterHouse.garage) return player.utils.error(`Дом не имеет гараж!`);
        if (enterHouse.garageClosed) return player.utils.warning(`Гараж закрыт!`);

        var garage = mp.garages.getBySqlId(enterHouse.garage);
        if (!garage) return player.utils.error(`Дом не имеет гараж!`);

        delete player.inHouse;
        player.inGarage = enterHouse.sqlId;
        var pos = new mp.Vector3(garage.x, garage.y, garage.z);

        player.dimension = enterHouse.sqlId;
        player.position = pos;
        player.heading = garage.h;

        var interior = mp.interiors.getBySqlId(enterHouse.interior);
        if (!interior) return player.utils.error(`Интерьер не найден!`);
        if (interior.garageMarker) interior.garageMarker.hideFor(player);
        //interior.exitMarker.hideFor(player);

        player.call("exitHouseMenu", [true]);
    },

    "goExitGarage": (player) => {
        if (!player.inGarage) return player.utils.error(`Вы не в гараже!`);

        var house = mp.houses.getBySqlId(player.inGarage);
        if (!house) return player.utils.error(`Дом не найден!`);

        var interior = mp.interiors.getBySqlId(house.interior);
        if (!interior) return player.utils.error(`Интерьер от дома не найден!`);

        var pos = new mp.Vector3(interior.garageX, interior.garageY, interior.garageZ);
        player.dimension = house.sqlId;
        //interior.exitMarker.showFor(player);
        interior.garageMarker.showFor(player);
        player.position = pos;
        player.heading = interior.garageH;
        player.inHouse = player.inGarage;
        delete player.inGarage;
    },

    "goEnterStreetFromGarage": (player) => {
        if (!player.inGarage) return player.utils.error(`Вы не в гараже!`);

        var exitHouse = mp.houses.getBySqlId(player.inGarage);
        if (exitHouse.garageClosed) return player.utils.warning(`Гараж закрыт!`);
        if (!exitHouse.garageH && !exitHouse.garageZ) return player.utils.error(`Нет выхода на улицу!`);

        var pos = new mp.Vector3(exitHouse.garageX, exitHouse.garageY, exitHouse.garageZ);
        player.dimension = 0;
        player.position = pos;
        player.heading = exitHouse.garageH;

        delete player.inGarage;
    },

    "getHouseInfo": (player) => {
        if (!player.colshape || !player.colshape.house) return player.utils.error(`Вы не у дома!`);
        let house = player.colshape.house;

        var values = [house.sqlId, house.class, house.interior, house.ownerName, house.garage, house.closed, house.price];
        player.call("infoTable.show", ["house_info", values]);
    },

    "getGarageInfo": (player) => {
        var house;
        if (!player.inHouse) house = mp.houses.getBySqlId(player.colshape.garage.houseSqlId); // с улицы смотрим инфо
        else house = mp.houses.getBySqlId(player.inHouse); // из дома смотрим инфо

        if (!house) return player.utils.error(`Дом от гаража не найден!`);

        player.call("infoTable.show", ["garage_info", [house.sqlId, house.garage, house.garageClosed]]);
    },

    "invitePlayerInHouse": (player, params) => {
        params = JSON.parse(params);
        if (!player.colshape || !player.colshape.house) return player.utils.error(`Вы не у дома!`);
        var house = player.colshape.house;
        if (house.owner != player.sqlId) return player.utils.error(`Вы не владелец дома!`);

        var invitePlayer = null;
        if (parseInt(params[0]) >= 0) invitePlayer = mp.players.at(parseInt(params[0]));
        else invitePlayer = mp.players.getByName(params[0]);
        if (!invitePlayer) return player.utils.error("Гражданин не найден!");
        else if (player.id === invitePlayer.id) return player.utils.error("Нельзя пригласить самого себя!");
        var dist = player.dist(invitePlayer.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин слишком далеко!`);

        invitePlayer.call("choiceMenu.show", ["invite_inhouse_confirm", {
            name: player.name
        }]);
        // invitePlayer.call("exitHouseMenu", [true]);
        invitePlayer.inviteInHouse = house;
    },

    "house.invite.agree": (player) => {
        if (!player.inviteInHouse) return player.utils.error(`Вы не были приглашены в дом!`);

        // player.call("exitHouseMenu", [true]);
        var house = player.inviteInHouse;
        var interior = mp.interiors.getBySqlId(house.interior);
        if (!interior) return player.utils.error(`Интерьер не найден!`);
        if (interior.garageMarker && house.garage) interior.garageMarker.showFor(player);
        //interior.exitMarker.showFor(player);

        var pos = new mp.Vector3(interior.x, interior.y, interior.z);
        player.inHouse = house.sqlId;
        player.dimension = house.sqlId;
        player.position = pos;
        player.heading = interior.h;

        delete player.inviteInHouse;
    },

    "house.invite.cancel": (player) => {
        delete player.inviteInHouse;
    },

    "sellHouseToGov": (player) => {
        if (!player.inHouse) return player.utils.error(`Продажа осуществляется в доме!`);
        var house = mp.houses.getBySqlId(player.inHouse);
        if (!house) return player.utils.error(`Дом не найден!`);
        if (house.owner != player.sqlId) return player.utils.error(`Вы не владелец дома!`);

        var balance = house.balance;
        if (balance <= 1000) balance = 0;
        var price = parseInt(house.price * mp.economy["house_sell"].value) + balance;
        player.call("choiceMenu.show", ["sellhousegov_confirm", {
            price: price
        }]);
    },

    "house.sellgov.agree": (player) => {
        if (!player.inHouse) return player.utils.error(`Продажа осуществляется в доме!`);
        var house = mp.houses.getBySqlId(player.inHouse);
        if (!house) return player.utils.error(`Дом не найден!`);
        if (house.owner != player.sqlId) return player.utils.error(`Вы не владелец дома!`);

        var balance = house.balance;
        if (balance <= 1000) balance = 0;
        var price = parseInt(house.price * mp.economy["house_sell"].value) + balance;
        player.utils.setBankMoney(player.bank + price);
        house.setOwner(0);
        player.utils.removeHouse(house);
        if(player.houseId == house.sqlId) {
            player.utils.setSpawn(3);
            player.utils.setHouseId(0);
        }
        player.utils.bank(`Недвижимость`, `Начислено: ~g~$${price}`);
        player.utils.success(`Дом ${house.sqlId} продан государству!`);
        mp.logs.addLog(`${player.name} продал дом ${house.sqlId} государству. Цена: ${house.price}`, 'house', player.account.id, player.sqlId, { houseId: house.sqlId, price: house.price });
    },

    "sellHousePlayer": (player, params) => {
        params = JSON.parse(params);
        if (!player.inHouse) return player.utils.error(`Продажа осуществляется в доме!`);
        var house = mp.houses.getBySqlId(player.inHouse);
        if (!house) return player.utils.error(`Дом не найден!`);
        if (house.owner != player.sqlId) return player.utils.error(`Вы не владелец дома!`);

        var invitePlayer = null;
        if (parseInt(params[0]) >= 0) invitePlayer = mp.players.at(parseInt(params[0]));
        else invitePlayer = mp.players.getByName(params[0]);
        if (!invitePlayer) return player.utils.error("Гражданин не найден!");
        const houses = mp.houses.getArrayByOwner(invitePlayer.sqlId);
        if(houses.length >= invitePlayer.donateHouse) return player.utils.error("Игрок имеет максимальное количество жилья");
        if(player.id === invitePlayer.id) return player.utils.error("Нельзя продать дом самому себе!");

        var price = parseInt(params[1]);
        if (price <= 0) return player.utils.error(`Неверная цена!`);

        player.call("choiceMenu.show", ["sellhouseplayer_confirm", {
            name: invitePlayer.name,
            price: price
        }]);

        player.sellHouseOffer = {
            invitePlayerId: invitePlayer.id,
            price: price
        };
    },

    "house.sellplayer.agree": (player) => {
        if (!player.inHouse) return player.utils.error(`Продажа осуществляется в доме!`);
        var house = mp.houses.getBySqlId(player.inHouse);
        if (!house) return player.utils.error(`Дом не найден!`);
        if (house.owner != player.sqlId) return player.utils.error(`Вы не владелец дома!`);
        if (!player.sellHouseOffer) return player.utils.error(`Предложение не найдено!`);

        var invitePlayer = mp.players.at(player.sellHouseOffer.invitePlayerId);
        if (!invitePlayer) return player.utils.error(`Покупатель не найден!`);

        var dist = player.dist(invitePlayer.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Покупатель далеко!`);
        if (player.id == invitePlayer.id) return player.utils.error(`Нельзя продать дом самому себе!`);

        invitePlayer.call("choiceMenu.show", ["buyhouseplayer_confirm", {
            name: player.name,
            houseid: house.id,
            price: player.sellHouseOffer.price,
        }]);

        invitePlayer.sellHouseOffer = {
            ownerId: player.id,
            price: player.sellHouseOffer.price
        };
    },

    "house.sellplayer.cancel": (player) => {
        delete player.sellHouseOffer;
    },

    "house.buyhouseplayer.agree": (player) => {
        if (!player.sellHouseOffer) return player.utils.error(`Предложение не найдено!`);
        var owner = mp.players.at(player.sellHouseOffer.ownerId);
        if (!owner) return player.utils.error(`Продавец не найден!`);

        var dist = player.dist(owner.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Продавец далеко!`);
        if (player.id == owner.id) return player.utils.error(`Нельзя продать дом самому себе!`);

        if (!owner.inHouse) return player.utils.error(`Продажа осуществляется в доме!`);
        var house = mp.houses.getBySqlId(owner.inHouse);
        if (!house) return player.utils.error(`Дом не найден!`);
        if (house.owner != owner.sqlId) return player.utils.error(`Продавец не владелец дома!`);
        var price = player.sellHouseOffer.price;
        if (player.money < price) {
            owner.utils.info(`${player.name} не имеет ${price}$`);
            return player.utils.error(`Необходимо: ${price}$`);
        }
        // TODO: Проверка на наличие домов.
        owner.utils.setMoney(owner.money + price);
        player.utils.setMoney(player.money - price);
        house.setOwner(player.sqlId, player.name);

        owner.utils.success(`Дом ${house.sqlId} продан`);
        player.utils.success(`Дом ${house.sqlId} куплен`);
        
        mp.logs.addLog(`${owner.name} продал дом ${house.sqlId} игроку ${player.name}. Цена: ${price}`, 'house', owner.account.id, owner.sqlId, { houseId: house.sqlId, price: price });
        mp.logs.addLog(`${player.name} купил дом ${house.sqlId} у игрока ${owner.name}. Цена: ${price}`, 'house', player.account.id, player.sqlId, { houseId: house.sqlId, price: price });

        player.utils.setSpawn(1);
        player.utils.setHouseId(house.sqlId);

        owner.utils.setHouseId(0);
        owner.utils.setSpawn(3);

        owner.utils.removeHouse(house);
        player.utils.addHouse(house);
    },

    "house.buyhouseplayer.cancel": (player) => {
        if (!player.sellHouseOffer) return;
        var owner = mp.players.at(player.sellHouseOffer.ownerId);
        if (owner) {
            owner.utils.info(`${player.name} отменил предложение`);
            delete owner.sellHouseOffer;
        }
        delete player.sellHouseOffer;
    }
};
