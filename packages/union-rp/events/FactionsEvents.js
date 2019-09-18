module.exports = {
    "factions.invite": (player, recId) => {
        //debug(`${player.name} factions.invite ${recId}`);
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!player.faction || player.rank < mp.factionRanks[player.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (rec.faction) return player.utils.error(`Гражданин уже в огранизации!`);

        rec.inviteOffer = {
            leaderId: player.id
        };

        player.utils.info(`Вы пригласили ${rec.name} в организацию`);
        rec.utils.info(`Получено приглашение в организацию`);
        rec.call("choiceMenu.show", ["accept_invite", {
            name: player.name,
            faction: mp.factions.getBySqlId(player.faction).name
        }]);
    },

    "factions.giverank": (player, recId) => {
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!player.faction || player.rank < mp.factionRanks[player.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (rec.faction != player.faction) return player.utils.error(`Гражданин не в Вашей организации!`);
        if (rec.rank >= player.rank - 1) return player.utils.error(`Невозможно повысить выше!`);

        var rankName = mp.factionRanks[rec.faction][rec.rank + 1].name;
        rec.utils.setFactionRank(rec.rank + 1);
        player.utils.success(`${rec.name} повышен до ${rankName}`);
        rec.utils.success(`${player.name} повысил Вас до ${rankName}`);

        mp.logs.addLog(`${player.name} повысил игрока ${rec.name} в должности. Ранг: ${rec.rank + 1}`, 'faction', player.account.id, player.sqlId, { rank: rec.rank + 1, faction: rec.faction });
        mp.logs.addLog(`${rec.name} был повышен игроком ${player.name} в должности. Ранг: ${rec.rank + 1}`, 'faction', rec.account.id, rec.sqlId, { rank: player.rank, faction: player.faction });

    },

    "factions.ungiverank": (player, recId) => {
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!player.faction || player.rank < mp.factionRanks[player.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (rec.faction != player.faction) return player.utils.error(`Гражданин не в Вашей организации!`);
        if (player.rank == mp.factionRanks[player.faction].length - 2 && rec.rank == mp.factionRanks[rec.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (rec.rank == mp.factionRanks[rec.faction].length - 1) return player.utils.error(`Невозможно понизить лидера!`);
        if (rec.rank <= 1) return player.utils.error(`Невозможно понизить ниже!`);

        var rankName = mp.factionRanks[rec.faction][rec.rank - 1].name;
        rec.utils.setFactionRank(rec.rank - 1);
        player.utils.success(`${rec.name} понижен до ${rankName}`);
        rec.utils.success(`${player.name} понизил Вас до ${rankName}`);
        
        mp.logs.addLog(`${player.name} понизил игрока ${rec.name} в должности. Ранг: ${rec.rank - 1}`, 'faction', player.account.id, player.sqlId, { rank: rec.rank - 1, faction: rec.faction });
        mp.logs.addLog(`${rec.name} был понижен игроком ${player.name} в должности. Ранг: ${rec.rank - 1}`, 'faction', rec.account.id, rec.sqlId, { rank: player.rank, faction: player.faction });

    },

    "factions.uninvite": (player, recId) => {
        //debug(`${player.name} factions.uninvite ${recId}`);
        var rec = mp.players.at(recId);
        if (!rec) return player.utils.error(`Гражданин не найден!`);
        var dist = player.dist(rec.position);
        if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
        if (!player.faction || player.rank < mp.factionRanks[player.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (player.rank == mp.factionRanks[player.faction].length - 2 && rec.rank == mp.factionRanks[rec.faction].length - 2) return player.utils.error(`У вас нет прав!`);
        if (rec.faction != player.faction) return player.utils.error(`Гражданин не в Вашей организации!`);
        if (rec.rank == mp.factionRanks[rec.faction].length - 1) return player.utils.error(`Невозможно уволить лидера!`);

        rec.utils.setFaction(0);

        player.utils.info(`Вы уволили ${rec.name} из организации`);
        rec.utils.info(`${player.name} уволил Вас из организации`);
        mp.logs.addLog(`${player.name} уволил игрока ${rec.name} из организации. Ранг: ${rec.rank}`, 'faction', player.account.id, player.sqlId, { rank: rec.rank, faction: rec.faction });
        mp.logs.addLog(`${rec.name} был уволен игроком ${player.name} из организации. Ранг: ${rec.rank}`, 'faction', rec.account.id, rec.sqlId, { rank: player.rank, faction: player.faction });

    },

    "factions.offer.agree": (player) => {
        if (!player.inviteOffer) return player.utils.error(`Предложение не найдено!`);
        var rec = mp.players.at(player.inviteOffer.leaderId);
        if (!rec) return player.utils.error(`Игрок не найден!`);
        var dist = player.dist(rec.position);
        if (dist > 5) return player.utils.error(`Игрок слишком далеко!`);
        if (!rec.faction || rec.rank < mp.factionRanks[rec.faction].length - 2) return player.utils.error(`У гражданина не имеется прав!`);
        if (player.faction) return player.utils.error(`Вы уже в организации!`);

        delete player.inviteOffer;

        player.utils.setFaction(rec.faction);

        player.utils.info(`Приглашение принято!`);
        rec.utils.info(`${player.name} принял приглашение!`);

        mp.logs.addLog(`${rec.name} принял игрока ${player.name} в организацию. Ранг: ${player.rank}`, 'faction', rec.account.id, rec.sqlId, { rank: rec.rank, faction: rec.faction });
        mp.logs.addLog(`${player.name} был принят игроком ${rec.name} в организацию. Ранг: ${player.rank}`, 'faction', player.account.id, player.sqlId, { rank: player.rank, faction: player.faction });

    },

    "factions.offer.cancel": (player) => {
        if (!player.inviteOffer) return player.utils.error(`Предложение не найдено!`);

        var rec = mp.players.at(player.inviteOffer.leaderId);
        delete player.inviteOffer;
        player.utils.info(`Приглашение отклонено`);
        if (!rec) return;
        delete rec.inviteOffer;

        rec.utils.info(`${player.name} отклонил приглашение`);
    },

    "warehouse.push": (player) => {
        if (!player.getVariable("attachedObject")) return player.utils.error(`Вы не имеете груз!`);
        if (!player.colshape || !player.colshape.warehouse) return player.utils.error(`Вы не у склада!`);
        var factionIds = [2, 3, 4, 7, 6, 5];
        var models = ['prop_box_ammo04a', 'prop_box_ammo04a', 'prop_box_ammo04a', 'prop_box_ammo04a', 'prop_box_ammo04a', 'ex_office_swag_pills4'];
        var weights = [500, 500, 500, 500, 500, 500];
        var index = factionIds.indexOf(player.colshape.warehouse.faction);
        if (index == -1) return player.utils.error(`Склад организации не найден!`);
        if (models[index] != player.getVariable("attachedObject")) return player.utils.error(`Неверный тип товара!`);
        player.setVariable("attachedObject", null);

        var faction = mp.factions.getBySqlId(player.colshape.warehouse.faction);
        if (faction.products + weights[index] > faction.maxProducts) player.utils.warning(`Склад заполнен!`);

        faction.setProducts(faction.products + weights[index]);

        if (mp.factions.isArmyFaction(player.faction)) {
            mp.events.call('army.getInfoWareHouse');
        }

        player.utils.info(`Склад: ${faction.products} / ${faction.maxProducts} ед.`);
    },

    "products.take": (player) => {
        if (player.getVariable("attachedObject")) return player.utils.error(`Недостаточно выносливости!`);
        if(!player.factionProducts) return player.utils.error(`Вы не у склада!`);

        player.utils.setLocalVar("insideProducts", false);
        player.setVariable("attachedObject", player.factionProducts.modelName);
    },
}
