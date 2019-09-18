module.exports = {
    "trailerAttached": (vehicle, trailer) => {
        // debug(`trailerAttached ${vehicle.name} ${trailer}`);
        if (!vehicle.player) return;
        var player = vehicle.player;
        if (player.job == 5) { //дальнобойщик
            if (trailer) { //прицепили прицеп
                if (!trailer.loadCount) return player.utils.error(`Прицеп пустой!`);
                var maxLoad = mp.trucker.getMaxLoad(vehicle.name);
                vehicle.trailerId = trailer.id;
                player.utils.success(`Груз присоединен!`);
                player.utils.info(`Загружено: ${trailer.loadCount}/${maxLoad} тонн`);
            } else { //отцепили прицеп
                player.utils.success(`Груз отсоединен!`);
                if (!player.colshape || !player.colshape.truckerReceiver) return player.utils.warning(`Для продажи товара необходимо разгрузиться на месте приема груза`);

                var now = parseInt(new Date().getTime() / 1000);
                if (player.nextBuyTrailer) {
                    if (now < player.nextBuyTrailer) return vehicle.player.utils.error(`На складе нет места, ожидайте ${player.nextBuyTrailer - now} секунд!`);
                }
                player.nextBuyTrailer = now + 7 * 60;

                var marker = player.colshape.truckerReceiver;
                var trailer = mp.vehicles.at(vehicle.trailerId);
                if (!trailer) return player.utils.error(`Прицеп не найден!`);
                console.log(`trailer`)
                console.log(`${trailer}`)
                var price = marker.prices[trailer.loadType - 1] * trailer.loadCount;
                player.utils.setMoney(player.money + price);
                player.utils.success(`Товар продан за ${price}$`);

                var exp = player.jobSkills[5 - 1];
                var oldLevel = mp.trucker.getSkill(exp).level;
                player.utils.setJobSkills(5, exp + trailer.loadCount);
                var newLevel = mp.trucker.getSkill(exp + trailer.loadCount).level;
                if (oldLevel != newLevel) player.utils.info(`Ваш навык дальнобойщика повысился!`);

                trailer.destroy();

                var skill = mp.trucker.getSkill(0);
                var maxPlayerLoad = 4 + skill.level;
                // TODO: Игнорить мелкие лвлы для смены цены груза.
                if (true /*trailer.loadCount / maxPlayerLoad > 0.8 && skill.level >= 15*/ ) {
                    //изменяем цены
                    marker.prices[trailer.loadType - 1] -= 10;
                    if (marker.prices[trailer.loadType - 1] < 10) marker.prices[trailer.loadType - 1] = 10;
                    marker.label.text = `~g~Дерево: ~w~${marker.prices[0]}$\n ~y~Уголь: ~w~${marker.prices[1]}$\n ~b~Нефть: ~w~${marker.prices[2]}$`;
                    for (var i = 0; i < mp.truckerData.loadReceivers.length; i++) {
                        var point = mp.truckerData.loadReceivers[i];
                        if (point.id != marker.id) {
                            point.prices[trailer.loadType - 1] += 10;
                            if (point.prices[trailer.loadType - 1] > 90) point.prices[trailer.loadType - 1] = 90;
                            point.label.text = `~g~Дерево: ~w~${point.prices[0]}$\n ~y~Уголь: ~w~${point.prices[1]}$\n ~b~Нефть: ~w~${point.prices[2]}$`;
                        }
                    }
                }

                delete vehicle.trailerId;
            }
        }
    }
}
