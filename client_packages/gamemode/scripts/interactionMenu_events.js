/*
	21.01.2019 created by Carter.

	События для обработки и показа/скрытия меню взаимодействия.
*/
var interactionEntity;
var offsetX = 5,
    offsetY = 10; // смещение меню на экране
exports = (menu) => {

    mp.events.add("interactionMenu.showPlayerMenu", (player, values = null) => {
        interactionEntity = player;
        if (values) values = JSON.stringify(values);
        // debug(`interactionMenu.showPlayerMenu: ${player.name} ${values}`)
        menu.execute(`interactionMenuAPI.showPlayerMenu('${values}')`);
        setCursor(true);
    });

    mp.events.add("interactionMenu.showVehicleMenu", (vehicle, values = null) => {
        interactionEntity = vehicle;
        if (values) values = JSON.stringify(values);
        menu.execute(`interactionMenuAPI.showVehicleMenu('${values}')`);
        setCursor(true);
    });

    mp.events.add("interactionMenu.hide", () => {
        interactionEntity = null;
        menu.execute(`interactionMenuAPI.hide()`);
    });

    var playerItemHandlers = {
        "Познакомиться": () => {
            if (!mp.storage.data.familiar) mp.storage.data.familiar = {};
            var familiarList = mp.storage.data.familiar;
            if (!familiarList[mp.players.local.name]) familiarList[mp.players.local.name] = [];
            familiarList = familiarList[mp.players.local.name];
            if (!interactionEntity) return mp.events.call(`nError`, `Гражданин далеко!`);
            var name = interactionEntity.name;
            if (familiarList.indexOf(name) != -1) return mp.events.call(`nError`, `Вы уже знакомы с ${name}!`);
            mp.events.callRemote(`familiar.createOffer`, interactionEntity.remoteId);
        },
        "Обмен": () => {
            mp.events.call(`trade.createOffer`);
        },
        "Пригласить в бригаду": () => {
            mp.events.callRemote("trash.invite.player", interactionEntity.remoteId);
        },
        "Уволить из бригады": () => {
            mp.events.callRemote("trash.uninvite.player", interactionEntity.remoteId);
        },
        "Пригласить в группу": () => {
            mp.events.callRemote("gopostal.invite.player", interactionEntity.remoteId);
        },
        "Уволить из группы": () => {
            mp.events.callRemote("gopostal.uninvite.player", interactionEntity.remoteId);
        },
        "Показать документы": () => {},
        "Удостоверение": () => {
            mp.events.callRemote("documents.showFaction", interactionEntity.remoteId);
        },
        "Паспорт": () => {
            mp.events.callRemote(`documents.show`, interactionEntity.remoteId, "passport");
        },
        "Лицензии": () => {
            mp.events.callRemote(`documents.show`, interactionEntity.remoteId, "licenses");
        },
        "Выписка из тира": () => {
            mp.events.callRemote(`documents.show`, interactionEntity.remoteId, "weapon");
        },
        "Трудовая": () => {
            mp.events.callRemote(`documents.show`, interactionEntity.remoteId, "work");
        },
        "Пригласить в организацию": () => {
            mp.events.callRemote(`factions.invite`, interactionEntity.remoteId);
        },
        "Повысить в должности": () => {
            mp.events.callRemote(`factions.giverank`, interactionEntity.remoteId);
        },
        "Понизить в должности": () => {
            mp.events.callRemote(`factions.ungiverank`, interactionEntity.remoteId);
        },
        "Уволить из организации": () => {
            mp.events.callRemote(`factions.uninvite`, interactionEntity.remoteId);
        },
        "Наручники": () => {
            mp.events.callRemote(`cuffsOnPlayer`, interactionEntity.remoteId);
        },
        "Розыск": () => {
            mp.events.callRemote(`showWantedModal`, interactionEntity.remoteId);
        },
        "Вести за собой": () => {
            mp.events.callRemote(`startFollow`, interactionEntity.remoteId);
        },
        "Посадить в авто": () => {
            var veh = getNearVehicle(mp.players.local.position);
            if (!veh) return mp.events.call(`nError`, `Авто не найдено!`);
            var pos = veh.position;
            var localPos = mp.players.local.position;
            var dist = mp.game.system.vdist(pos.x, pos.y, pos.z, localPos.x, localPos.y, localPos.z);
            if (dist > 10) return mp.events.call(`nError`, `Авто далеко!`);
            mp.events.callRemote(`putIntoVehicle`, interactionEntity.remoteId, veh.remoteId);
        },
        "Штраф": () => {
            mp.events.callRemote(`showFinesModal`, interactionEntity.remoteId);
        },
        "Арестовать": () => {
            mp.events.callRemote(`arrestPlayer`, interactionEntity.remoteId);
        },
        "Вылечить": () => {
            mp.events.callRemote(`hospital.health.createOffer`, interactionEntity.remoteId);
        },
        "Передать товар": () => {
            var attachedObject = mp.players.local.getVariable("attachedObject");
            var haveProducts = (attachedObject == "prop_box_ammo04a" || attachedObject == "ex_office_swag_pills4");
            if (!haveProducts) return mp.events.call(`nError`, `Вы не имеете товар!`);

            mp.events.callRemote(`army.transferProducts`, interactionEntity.remoteId);
        },
        "Обычный": () => {
            mp.events.callRemote(`emotions.set`, 0);
        },
        "Угрюмый": () => {
            mp.events.callRemote(`emotions.set`, 1);
        },
        "Сердитый": () => {
            mp.events.callRemote(`emotions.set`, 2);
        },
        "Счастливый": () => {
            mp.events.callRemote(`emotions.set`, 3);
        },
        "Стресс": () => {
            mp.events.callRemote(`emotions.set`, 4);
        },
        "Надутый": () => {
            mp.events.callRemote(`emotions.set`, 5);
        },
        "Нормальная": () => {
            mp.events.callRemote(`walking.set`, 0);
        },
        "Храбрый": () => {
            mp.events.callRemote(`walking.set`, 1);
        },
        "Уверенный": () => {
            mp.events.callRemote(`walking.set`, 2);
        },
        "Гангстер": () => {
            mp.events.callRemote(`walking.set`, 3);
        },
        "Быстрый": () => {
            mp.events.callRemote(`walking.set`, 4);
        },
        "Грустный": () => {
            mp.events.callRemote(`walking.set`, 5);
        },
        "Крылатый": () => {
            mp.events.callRemote(`walking.set`, 6);
        },
        "Показывает фак": () => {
            mp.events.callRemote(`animation.set`, 0);
        },
        "Рок двумя руками": () => {
            mp.events.callRemote(`animation.set`, 1);
        },
        "Рок одной рукой": () => {
            mp.events.callRemote(`animation.set`, 2);
        },
        "Два пальца": () => {
            mp.events.callRemote(`animation.set`, 3);
        },
        "Бурные аплодисменты": () => {
            mp.events.callRemote(`animation.set`, 4);
        },
        "Анимация дрочки": () => {
            mp.events.callRemote(`animation.set`, 5);
        },
        "Подтягивания": () => {
            mp.events.callRemote(`animation.set`, 6);
        },
        "Тягает штангу лёжа": () => {
            mp.events.callRemote(`animation.set`, 7);
        },
        "Тягает штангу стоя": () => {
            mp.events.callRemote(`animation.set`, 8);
        },
        "Отжимания": () => {
            mp.events.callRemote(`animation.set`, 9);
        },
        "Качает пресс": () => {
            mp.events.callRemote(`animation.set`, 10);
        },
        "Спит": () => {
            mp.events.callRemote(`animation.set`, 11);
        },
        "Спит развалив руки": () => {
            mp.events.callRemote(`animation.set`, 12);
        },
        "Спит сжавшись в клубок": () => {
            mp.events.callRemote(`animation.set`, 13);
        },
        "Скорчился в клубок": () => {
            mp.events.callRemote(`animation.set`, 14);
        },
        "Сидит разглядывая что-то": () => {
            mp.events.callRemote(`animation.set`, 15);
        },
        "Сидит со стаканом и пьёт": () => {
            mp.events.callRemote(`animation.set`, 16);
        },
        "Сидит свободно раздвинув ноги": () => {
            mp.events.callRemote(`animation.set`, 17);
        },
        "Сидит рука на руке": () => {
            mp.events.callRemote(`animation.set`, 18);
        },
        "Стоя закрывается руками": () => {
            mp.events.callRemote(`animation.set`, 19);
        },
        "Закрывается руками и осм.": () => {
            mp.events.callRemote(`animation.set`, 20);
        },
        "Нагнувшись закрывается руками": () => {
            mp.events.callRemote(`animation.set`, 21);
        },
        "Нагнувшись осм. по сторонам": () => {
            mp.events.callRemote(`animation.set`, 22);
        },
        "Сжимается в клубок": () => {
            mp.events.callRemote(`animation.set`, 23);
        },
        "Сидя закрывается руками осм.": () => {
            mp.events.callRemote(`animation.set`, 24);
        },
        "Оглядывается по сторонам и трясётся": () => {
            mp.events.callRemote(`animation.set`, 25);
        },
        "Сидя на картах закрывшись кулаками": () => {
            mp.events.callRemote(`animation.set`, 26);
        },
        "Сидя на картах испугано злится": () => {
            mp.events.callRemote(`animation.set`, 27);
        },
        "Трясёт руками": () => {
            mp.events.callRemote(`animation.set`, 28);
        },
        "Облакотился на стену": () => {
            mp.events.callRemote(`animation.set`, 29);
        },
        "Танцует тряся тазом": () => {
            mp.events.callRemote(`animation.set`, 30);
        },
        "Берёт в руки сигарету": () => {
            mp.events.callRemote(`animation.set`, 31);
        },

    };
    var vehicleItemHandlers = {
        "Выкинуть из транспорта": () => {
            if (!mp.players.local.vehicle) return mp.events.call(`nError`, `Вы не в транспорте!`);
            let players = getOccupants(interactionEntity.remoteId);
            if (players.length < 2) return mp.events.call(`nError`, `Транспорт пустой!`);
            mp.events.call("interactionMenu.hide");
            mp.events.call("modal.show", "throw_from_vehicle", { count: --players.length });
        },
        "Открыть/Закрыть транспорт": () => {
            if (!mp.players.local.vehicle) return mp.events.call(`nError`, `Вы не в транспорте!`);
            mp.events.callRemote("item.lockCar", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        /*"Открыть/Закрыть капот": () => {
            if (!mp.players.local.vehicle) return mp.events.call(`nError`, `Вы не в транспорте!`);
            var hoodPos = getHoodPosition(interactionEntity);
            if (!hoodPos) return mp.events.call(`nError`, `Капот не найден!`);
            mp.events.callRemote("vehicle.hood", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Открыть/Закрыть багажник": () => {
            if (!mp.players.local.vehicle) return mp.events.call(`nError`, `Вы не в транспорте!`);
            var bootPos = getBootPosition(interactionEntity);
            if (!bootPos) return mp.events.call(`nError`, `Багажник не найден!`);
            mp.events.callRemote("vehicle.boot", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },*/
        "Двери": () => {
            var dist = vdist(mp.players.local.position, interactionEntity.position);
            if (dist > 2) return mp.events.call(`nError`, `Вы далеко от дверей!`);

            mp.events.callRemote("item.lockCar", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Капот": () => {
            var player = mp.players.local;
            var hoodPos = getHoodPosition(interactionEntity);
            if (!hoodPos) return mp.events.call(`nError`, `Капот не найден!`);
            if (vdist(player.position, hoodPos) > 2) return mp.events.call(`nError`, `Вы далеко от капота!`);

            mp.events.callRemote("vehicle.hood", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Багажник": () => {
            var player = mp.players.local;
            var bootPos = getBootPosition(interactionEntity);
            if (!bootPos) return mp.events.call(`nError`, `Багажник не найден!`);
            if (vdist(player.position, bootPos) > 2) return mp.events.call(`nError`, `Вы далеко от багажника!`);

            mp.events.callRemote("vehicle.boot", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Товар": () => {
            var player = mp.players.local;
            var bootPos = getBootPosition(interactionEntity);
            if (!bootPos) return mp.events.call(`nError`, `Багажник не найден!`);
            if (vdist(player.position, bootPos) > 2) return mp.events.call(`nError`, `Вы далеко от багажника!`);

            mp.events.callRemote("vehicle.products", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Заправить": () => {
            mp.events.callRemote("item.fuelCar", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Вскрыть": () => {
            mp.events.callRemote("police.lockVeh", interactionEntity.remoteId);
            mp.events.call("interactionMenu.hide");
        },
        "Вытолкнуть": () => {
            var occupants = getOccupants(interactionEntity.remoteId);
            //debug(`Вытолкнуть: occupants.length: ${occupants.length}`);
            if (!occupants.length) return;
            var names = [];
            for (var i = 0; i < occupants.length; i++) {
                names.push(occupants[i].name);
            }
            mp.events.call(`interactionMenu.showVehicleMenu`, interactionEntity, {
                action: "removeFromVehicle",
                names: names
            });
        },
    };

    mp.events.add("interactionMenu.onClickPlayerItem", (itemName) => {
        if (!interactionEntity) return mp.events.call(`nError`, `Гражданин далеко!`);
        if (playerItemHandlers[itemName])
            playerItemHandlers[itemName]();
        mp.events.call("interactionMenu.hide");
    });

    mp.events.add("interactionMenu.onClickVehicleItem", (itemName) => {
        if (!interactionEntity) return mp.events.call(`nError`, `Авто далеко!`);
        if (vehicleItemHandlers[itemName])
            vehicleItemHandlers[itemName]();
    });
    mp.events.add("render", () => {
        if (interactionEntity) {
            if (!mp.players.exists(interactionEntity) && !mp.vehicles.exists(interactionEntity)) interactionEntity = null; //todo fix
            else {
                var pos3d = interactionEntity.position;
                var dist = vdist(mp.players.local.position, pos3d);
                if (interactionEntity.type == "vehicle") {
                    if (dist > 2) {
                        var bootPos = getBootPosition(interactionEntity);
                        var bootDist = 10;
                        if (bootPos) bootDist = vdist(mp.players.local.position, bootPos);
                        // drawText2d(`Багажник: ${bootDist} m.`);
                        if (bootDist < 1) {
                            pos3d = bootPos;
                        } else {
                            var hoodPos = getHoodPosition(interactionEntity);
                            var hoodDist = 10;
                            if (hoodPos) hoodDist = vdist(mp.players.local.position, hoodPos);
                            // drawText2d(`Капот: ${hoodDist} m.`, [0.8, 0.55]);
                            if (hoodDist < 1) {
                                pos3d = hoodPos;
                            } else return mp.events.call("interactionMenu.hide");
                        }
                    }
                } else if (dist > 2 && interactionEntity.type == "player") return mp.events.call("interactionMenu.hide");

                var pos2d = mp.game.graphics.world3dToScreen2d(pos3d.x, pos3d.y, pos3d.z + 1);
                if (!pos2d) return;
                menu.execute(`interactionMenuAPI.move('${pos2d.x * 100 + offsetX}', '${pos2d.y * 100 + offsetY}')`);
            }
        }
    });

}
