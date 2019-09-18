module.exports = {
    "trucker.buyTrailer": (player, count) => {
        //debug(`trucker.buyTrailer: ${player.name} ${count}`)
        count = Math.clamp(parseInt(count), 1, 50);
        if (!player.colshape || !player.colshape.truckerLoad) return player.utils.warning(`Необходимо находиться у загрузки груза!`);
        if (player.job != 5) return player.utils.error(`Вы не являетесь дальнобойщиком!`);
        if (player.rentVehicleId == null) return player.utils.error(`Арендуйте фуру!`);
        var veh = mp.vehicles.at(player.rentVehicleId);
        if (!veh || -veh.owner != player.job) return player.utils.error(`Фура не найдена!`);
        var dist = player.dist(veh.position);
        if (dist > 20) return player.utils.error(`Фура далеко!`);

        var skill = mp.trucker.getSkill(player.jobSkills[5 - 1]);
        var maxLoad = mp.trucker.getMaxLoad(veh.name);
        if (count > maxLoad) return player.utils.error(`Максимальная грузоподъемность фуры ${maxLoad} тонн!`);

        var maxPlayerLoad = 4 + skill.level;
        if (count > maxPlayerLoad) return player.utils.error(`Навыки Вашей профессии позволяют загрузить не более ${maxPlayerLoad} тонн!`);

        var truckerLoad = player.colshape.truckerLoad;

        var price = truckerLoad.price * count;
        if (player.money < price) return player.utils.error(`Необходимо: ${price}$`);

        var isFind = false;
        mp.vehicles.forEachInRange(truckerLoad.trailerPos, 5, (veh) => {
            if (veh) isFind = true;
        });
        if (isFind) return player.utils.error(`Освободите место для прицепа!`);

        var now = parseInt(new Date().getTime() / 1000);
        if (player.nextBuyTrailer) {
            if (now < player.nextBuyTrailer) return player.utils.error(`Груз подготавливается, ожидайте ${player.nextBuyTrailer - now} секунд!`);
        }
        player.nextBuyTrailer = now + 7 * 60;

        var model = mp.trucker.getTrailerModel(truckerLoad.loadType);

        var trailer = mp.vehicles.new(mp.joaat(model), truckerLoad.trailerPos, {
            locked: false,
            engine: false
        });
        trailer.rotation = new mp.Vector3(0, 0, truckerLoad.trailerPos.h);
        trailer.loadType = truckerLoad.loadType;
        trailer.loadCount = count;

        player.utils.setMoney(player.money - price);
        player.utils.success(`Прицеп куплен!`);
        player.utils.info(`Цепляйте прицеп и вперед!`);

        // TODO: Игнорить мелкие лвлы для смены цены груза.
        if (true /*count / maxPlayerLoad > 0.8 && skill.level >= 15*/ ) {
            //изменяем цены
            truckerLoad.price += 10;
            if (truckerLoad.price > 90) truckerLoad.price = 90;
            truckerLoad.label.text = `${truckerLoad.loadTypeName}\n ~b~Тонна: ~w~${truckerLoad.price}$`;
            for (var i = 0; i < mp.truckerData.loadPoints.length; i++) {
                var point = mp.truckerData.loadPoints[i];
                if (point.loadType == truckerLoad.loadType && point.id != truckerLoad.id) {
                    point.price -= 10;
                    if (point.price < 10) point.price = 10;
                    point.label.text = `${point.loadTypeName}\n ~b~Тонна: ~w~${point.price}$`;
                }
            }
        }

    }
}
