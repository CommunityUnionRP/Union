// Создаём BLIP
mp.blips.new(198, new mp.Vector3(894.892, -179.171, 74.700), {
    name: 'Таксопарк',
    color: 5,
    scale: 0.7,
    shortRange: true
});
let jobTaxiColShape = mp.colshapes.newSphere(894.892, -179.171, 74.700, 1.5);
// Получение информации
const JobTaxi = {
    veh_pos: [{
            x: 897.44140625,
            y: -183.45106506347656,
            z: 73.37433624267578,
            rot: 238
        },
        {
            x: 908.76318359375,
            y: -183.40133666992188,
            z: 73.7649917602539,
            rot: 60
        },
        {
            x: 899.2822875976562,
            y: -180.53135681152344,
            z: 73.43856048583984,
            rot: 240
        },
        {
            x: 903.3735961914062,
            y: -191.83193969726562,
            z: 73.40705108642578,
            rot: 57
        },
        {
            x: 905.03271484375,
            y: -189.08819580078125,
            z: 73.4398422241211,
            rot: 60
        },
        {
            x: 906.8423461914062,
            y: -186.12596130371094,
            z: 73.63589477539062,
            rot: 57
        },
        {
            x: 921.05419921875,
            y: -163.5465850830078,
            z: 74.43778991699219,
            rot: 97
        },
        {
            x: 913.6771850585938,
            y: -159.73150634765625,
            z: 74.3862533569336,
            rot: 195
        },
        {
            x: 911.3737182617188,
            y: -163.572998046875,
            z: 73.96219635009766,
            rot: 191
        },
        {
            x: 918.8042602539062,
            y: -167.19261169433594,
            z: 74.25323486328125,
            rot: 101
        }
    ]
}
/* Хранение информации
  player.job - работа ( 1 = такси)
  player.taxist - статус работы;
  vehicle.taxist - хранение владельца такси.
*/
const JobTaxiContain = {
    orders: []
}
// Класс для заказа
class TaxiOrder {
    constructor(client_name, taxist_name, position, distance, status, money) {
        this.client_name = client_name;
        this.taxist_name = taxist_name;
        this.start_position = position;
        this.distance = distance;
        this.status = status;
        this.money = money;
    }
}
// Получаем все из нужного класса
function getTaxiOrder(name, type) {
    try {
        for (let i = 0; i < JobTaxiContain.orders.length; i++) {
            if (type === "client") {
                if (JobTaxiContain.orders[i].client_name == name) {
                    return JobTaxiContain.orders[i];
                }
            } else {
                if (JobTaxiContain.orders[i].taxist_name == name) {
                    return JobTaxiContain.orders[i];
                }
            }
        }
        return undefined;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}
// Подгружаем ТС
console.log("[JOB] Taxi in Los Santos started!");

function haveLicense(player, vehicle) {
    if (!vehicle.license) return true;
    var docs = player.inventory.getArrayByItemId(16);
    for (var sqlId in docs) {
        if (docs[sqlId].params.licenses.indexOf(vehicle.license) != -1) return true;
    }
    return false;
}
// Ивенты
mp.events.add("playerEnterVehicle", function playerEnterVehicleHandler(player, vehicle, seat) {
    if (vehicle.owner === -1 && seat === -1) {
        if (player.job === 1) {
            if (vehicle.taxist !== undefined) {
                if (!mp.players.exists(vehicle.taxist)) delete vehicle.taxist;
                else if (vehicle.taxist.taxist != vehicle) delete vehicle.taxist;
                else if (vehicle.taxist === player) {
                    player.call("control.taxi.menu", [true, true]);
                } else {
                    player.removeFromVehicle();
                    player.notifyWithPicture('Помощь', 'Downtown Cab Co.', 'Данный транспорт уже занят.', 'CHAR_TAXI');
                }
            } else {
                if (player.taxist !== undefined) {
                    player.removeFromVehicle();
                    player.notifyWithPicture('Помощь', 'Downtown Cab Co.', 'У вас уже есть используемый транспорт.', 'CHAR_TAXI');
                } else {
                    if (!haveLicense(player, vehicle)) return;
                    player.call("show.taxi.menu", [player.name]);
                    player.notifyWithPicture('Подсказка', 'Downtown Cab Co.', 'Нажмите ~y~"ВОЙТИ" ~w~, чтобы начать рабочий день. \n( ~y~alt ~w~- курсор )', 'CHAR_TAXI');
                    vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
                }
            }
        }
    } else if (vehicle.owner === -1 && seat !== -1) {
        if (vehicle.taxist === undefined) {
            player.removeFromVehicle();
            player.notifyWithPicture('Помощь', 'Downtown Cab Co.', 'Данное ~y~такси ~w~не работает.', 'CHAR_TAXI');
        } else {
            if (player.taxist === undefined) {
                if (getTaxiOrder(vehicle.taxist.name, "taxist") !== undefined && getTaxiOrder(vehicle.taxist.name, "taxist").client_name !== player.name) {
                    player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Таксист на данный момент ~y~занят ~w~другим заказом.', 'CHAR_TAXI');
                } else {
                    let torder = getTaxiOrder(player.name, "client");
                    if (torder !== undefined)
                    if (torder.taxist_name !== vehicle.taxist.name) cancelTaxi(player, false);
                    player.notifyWithPicture('Помощь', 'Downtown Cab Co.', 'Поставьте метку на карте, куда хотите отправиться и нажмите ~y~E', 'CHAR_TAXI');
                }
            } else {
                player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Сначала ~y~закончите ~w~рабочий день.', 'CHAR_TAXI');
            }
        }
    }
});
mp.events.add("playerExitVehicle", function playerExitVehicleHandler(player, vehicle) {
    if (vehicle.owner === -1) {
        if (vehicle.taxist !== undefined && player.taxist === undefined) {
            if (player.goingtaxi === vehicle.taxist) { // && player.goingtaxi.vehicle === vehicle
                let order = getTaxiOrder(player.name, "client");
                let dist = vehicle.dist(order.start_position);
                let money;
                if (order.distance < dist)
                    money = 0;
                else
                    money = Math.trunc((order.distance - dist) * mp.economy["taxi_salary"].value);

                if ((order.distance + dist) <= (order.distance + 30)) money = order.money;
                player.goingtaxi.call("close.taxi.control");
                player.goingtaxi.call("cancel.taxi.order", [false]);
                JobTaxiContain.orders.splice(JobTaxiContain.orders.indexOf(order), 1);
                player.utils.setMoney(player.money - money);
                player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы заплатили ~g~$' + money, 'CHAR_TAXI');
                player.goingtaxi.utils.setMoney(player.goingtaxi.money + money);
                player.goingtaxi.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Клиент заплатил ~g~$' + money, 'CHAR_TAXI');
                player.goingtaxi.call("update.taxi.stats", [money]);
                delete player.goingtaxi;
            }
        }
        if (player.job === 1) {
            if (vehicle.taxist === undefined && player.taxist === undefined) {
                player.call("close.taxi.menu");
            } else if (vehicle.taxist == player) {
                player.notifyWithPicture('Помощь', 'Downtown Cab Co.', 'У вас есть ~y~60 ~w~секунд, чтобы вернуться в транспорт.', 'CHAR_TAXI');
                player.call("control.taxi.menu", [false, false]);
            }
        }
    }
});
mp.events.add("playerQuit", function playerQuitHandler(player, exitType, reason) {
    let vehicle = player.vehicle;
    if (vehicle) {
        if (vehicle.taxist !== undefined) {
            if (vehicle.taxist === player) {
                endJobDay(player);
            }
        }
    }
    if (getTaxiOrder(player.name, "client")) cancelTaxi(player, false);
});
mp.events.add("playerEnterColshape", function onPlayerEnterColShape(player, shape) {
    try {
        if (!player.vehicle && shape == jobTaxiColShape) player.call("getTaxiJobStatus", [player.job === 1 ? true : false]);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerExitColshape", function onPlayerExitColShape(player, shape) {
    try {
        if (shape == jobTaxiColShape) player.call("getTaxiJobStatus", ["cancel"]);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("set.taxi.waypoint", (player, tname, dist, x, y, z) => {
    try {
        let money = Math.trunc(dist * mp.economy["taxi_salary"].value);
        if (player.money < money) {
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'У вас недостаточно денег! Стоимость поездки ~g~$' + money, 'CHAR_TAXI');
            return;
        }
        let order = getTaxiOrder(player.name, "client");
        if (order === undefined) {
            let order = new TaxiOrder(player.name, tname, new mp.Vector3(x, y, z), dist, true, money);
            JobTaxiContain.orders.push(order);
        } else {
            order.money = money;
            order.distance = dist;
            order.status = true;
            order.start_position = new mp.Vector3(x, y, z);
            order.taxist_name = tname;
        }

        let target = getPlayerByName(tname);
        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'В конце поездки вы заплатите ~g~$' + money, 'CHAR_TAXI');
        if (target !== undefined) {
            target.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Отвезите клиента в требуемую точку.', 'CHAR_TAXI');
            target.call("get.taxi.waypoint.driver", [player.name, money, new mp.Vector3(x, y, z)]);
        }
        player.goingtaxi = target;
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("cancels.taxi.order", (player) => {
    try {
        let order = getTaxiOrder(player.name, "taxist");
        if (order !== undefined) {
            player.call("cancel.taxi.order", [false]);
            let target = getPlayerByName(order.client_name);
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы отменили вызов.', 'CHAR_TAXI');
            if (target !== undefined) {
                target.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Таксист отменил вызов.', 'CHAR_TAXI');
                target.call("delete.taxi.player.colshape");
            }
            if (order.status === false) {
                JobTaxiContain.orders.splice(JobTaxiContain.orders.indexOf(order), 1);
            } else {
                target.removeFromVehicle();
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("end.taxi.day", (player) => {
    try {
        endJobDay(player);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("job.taxi.agree", (player) => {
    try {
        if (player.job !== 0 && player.job !== 1) {
            player.utils.warning("Вы уже где-то работаете!");
            return;
        }

        if (player.job === 1) {
            if (player.taxist !== undefined) {
                player.utils.error("Вы не можете уволиться из таксопарка, не закончив рабочий день!");
                return;
            }
            player.utils.success("Вы уволились из таксопарка!");
            player.utils.changeJob(0);
            player.call("setTaxiJobStatus", [false]);
            delete player.taxist;
        } else {
            if (mp.convertMinutesToLevelRest(player.minutes).level < 2) return player.utils.error("Вы не достигли 2 уровня!");
            player.utils.success("Вы устроились в таксопарк!");
            player.utils.changeJob(1);
            player.notifyWithPicture('Подсказка', 'Downtown Cab Co.', 'Выберите свободный транспорт и начинайте рабочий день.', 'CHAR_TAXI');
            player.call("setTaxiJobStatus", [true]);
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("accept.taxi.day", (player) => {
    try {
        let pveh = player.vehicle;
        if (player.job === 1 && pveh) {
            if (pveh.owner === -1) {
                pveh.taxist = player;
                player.taxist = pveh;
                cancelTaxi(player, false);
                player.notifyWithPicture('Информация', 'Downtown Cab Co.', 'Вы ~y~начали ~w~рабочий день.', 'CHAR_TAXI');
                player.call("update.taxi.orders", [JSON.stringify(JobTaxiContain.orders)]);
                player.call("update.taxi.interval", [true]);
                return;
            }
        }

        player.notifyWithPicture('Информация', 'Downtown Cab Co.', 'Вы ~r~не можете ~w~начать рабочий день.', 'CHAR_TAXI');
        player.call("close.taxi.menu");
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("key.taxi.down.numpad_zero", (player) => {
    try {
        let vehicle = player.vehicle;
        if (vehicle) {
            if (vehicle.owner === -1 && player.seat === -1) {
                if (player.taxist !== undefined && player.taxist === player.vehicle) player.call("displace.taxi.menu");
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("key.taxi.down.e", (player) => {
    try {
        if (player.vehicle) {
            if (player.vehicle.owner === -1) {
                if (player.taxist === undefined) {
                    if (player.vehicle.taxist !== undefined && player.vehicle.taxist.vehicle !== undefined) {
                        let order = getTaxiOrder(player.vehicle.taxist.name, "taxist");
                        if (order === undefined || (order !== undefined && order.status === false && order.client_name === player.name)) {
                            player.call("get.taxi.waypoint", [player.vehicle.taxist.name]);
                        } else {
                            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Таксист на данный момент ~y~занят ~w~другим заказом.', 'CHAR_TAXI');
                        }
                    }
                } else {
                    if (player.seat !== -1) {
                        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Сначала закончите рабочий день.', 'CHAR_TAXI');
                        return;
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("update.taxi.orders", (player) => {
    try {
        player.call("update.taxi.orders", [JSON.stringify(JobTaxiContain.orders)]);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("enter.taxi.colshape", (player) => {
    try {
        if (player.job === 1) {
            if (player.vehicle === player.taxist && player.vehicle !== undefined) {
                let order = getTaxiOrder(player.name, "taxist");
                if (order !== undefined) {
                    let target = getPlayerByName(order.client_name);
                    player.call("destroy.taxi.colshape");
                    if (target === undefined) return;

                    player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~приехали ~w~на точку вызова, ожидайте клиента.', 'CHAR_TAXI');
                    target.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Таксист ~y~приехал ~w~на точку вызова, садитесь в транспорт.', 'CHAR_TAXI');
                    target.call("delete.taxi.player.colshape");
                }
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("cancel.taxi.player", (player) => {
    try {
        cancelTaxi(player, false);
        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вызов был отменен, вы ~y~слишком далеко ~w~от места вызова!', 'CHAR_TAXI');
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("take.taxi.order", (player, name) => {
    try {
        let target = getPlayerByName(name);
        if (getTaxiOrder(name, "client") === undefined) return;

        if (getTaxiOrder(player.name, "taxist") !== undefined) {
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Сначала завершите предыдущий заказ.', 'CHAR_TAXI');
            return;
        }

        if (target === undefined || getTaxiOrder(name, "client").taxist_name !== undefined) {
            deleteOrderForTaxist(name);
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Данный заказ невозможно принять.', 'CHAR_TAXI');
            return;
        }


        getTaxiOrder(name, "client").taxist_name = player.name;
        deleteOrderForTaxist(target.name);
        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы приняли вызов ~y~' + name, 'CHAR_TAXI');
        target.notifyWithPicture('Оператор', 'Downtown Cab Co.', '~y~' + player.name + ' ~w~принял ваш вызов.', 'CHAR_TAXI');
        player.call("accept.taxi.order", [target.position]);
    } catch (err) {
        console.log(err);
        return;
    }
});
// Functions
function recallTaxi(player) {
  if (getTaxiOrder(player.name, "client") !== undefined) cancelTaxi(player, true);
  else callTaxi(player);
}

function callTaxi(player) {
    try {
        if (player.vehicle) {
            if (player.vehicle.owner === -1) {
                player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~не можете ~w~вызвать такси!', 'CHAR_TAXI');
                return;
            }
        }

        if (getTaxiOrder(player.name, "client") !== undefined) {
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы уже вызвали такси, ожидайте!', 'CHAR_TAXI');
            return;
        }

        if (player.taxist !== undefined) {
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~не можете ~w~вызвать такси!', 'CHAR_TAXI');
            return;
        }

        let order = new TaxiOrder(player.name, undefined, player.position, undefined, false, 0);
        JobTaxiContain.orders.push(order);
        player.call("create.taxi.player.colshape");
        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~вызвали ~w~такси, ожидайте!', 'CHAR_TAXI');
        player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Если ~y~отойдёте ~w~слишком далеко от места вызова, вызов будет отменен!', 'CHAR_TAXI');
    } catch (err) {
        console.log(err);
        return;
    }
}
function cancelTaxi(player, type) {
    try {
        let order = getTaxiOrder(player.name, "client");

        if (order === undefined) {
            if (type) player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы не вызывали такси!', 'CHAR_TAXI');
            return;
        }

        if (player.vehicle && type) {
            if (player.vehicle.owner === -1) {
                player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~не можете ~w~отменить заказ!', 'CHAR_TAXI');
                return;
            }
        }

        if (order.taxist_name !== undefined) {
            let target = getPlayerByName(order.taxist_name);
            if (player.vehicle) {
                if (player.vehicle === target.taxist && target.taxist === undefined) {
                    if (type) player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~не можете ~w~отменить заказ!', 'CHAR_TAXI');
                    return;
                }
            }
            if (target !== undefined) {
                target.notifyWithPicture('Оператор', 'Downtown Cab Co.', '~y~' + player.name + ' ~w~отменил заказ.', 'CHAR_TAXI');
                target.call("close.taxi.control");
                target.call("cancel.taxi.order", [false]);
            }
        }

        JobTaxiContain.orders.splice(JobTaxiContain.orders.indexOf(order), 1);
        deleteOrderForTaxist(player.name);
        player.call("delete.taxi.player.colshape");
        if (type) player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~отменили ~w~вызов!', 'CHAR_TAXI');
    } catch (err) {
        console.log(err);
        return;
    }
}

function getPlayerByName(name) {
    try {
        let rplayer;
        mp.players.forEach(
            (player, id) => {
                if (player.name === name) rplayer = player;
            },
        );
        return rplayer;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

function deleteOrderForTaxist(name) {
    try {
        mp.players.forEach(
            (player, id) => {
                if (player.job === 1 && player.taxist !== undefined) {
                    player.call('remove.taxi.order', [name]);
                }
            },
        );
    } catch (err) {
        console.log(err);
        return;
    }
}

function endJobDay(player) {
    try {
        if (player.job === 1) {
            player.notifyWithPicture('Оператор', 'Downtown Cab Co.', 'Вы ~y~закончили ~w~рабочий день!', 'CHAR_TAXI');
            player.call("close.taxi.menu");
            player.call("cancel.taxi.order", [true]);
            if (player.taxist !== undefined) {
                let order_tax = getTaxiOrder(player.name, "taxist");
                if (order_tax !== undefined) {
                    let target = getPlayerByName(order_tax.client_name);
                    if (target !== undefined) {
                        target.notifyWithPicture('Оператор', 'Downtown Cab Co.', '~y~' + player.name + ' ~w~отменил заказ.', 'CHAR_TAXI');
                        JobTaxiContain.orders.splice(JobTaxiContain.orders.indexOf(order_tax), 1);
                        if (target.vehicle === player.taxist) player.removeFromVehicle();
                    }
                }

                let vehicle = player.taxist;
                if (player.vehicle === vehicle) player.removeFromVehicle();
                removeAllHumansFromVehicle(vehicle);
                delete vehicle.taxist;
                delete player.taxist;

                setTimeout(() => {
                    try {
                        vehicle.repair();
                        vehicle.dimension = 0;
                        vehicle.position = vehicle.spawnPos;
                        vehicle.rotation = new mp.Vector3(0, 0, vehicle.spawnPos.h);
                        vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
                        vehicle.engine = false;
                    } catch (err) {
                        console.log(err);
                    }
                }, 200);
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
}

function removeAllHumansFromVehicle(vehicle) {
    try {
        let array = vehicle.getOccupants();
        for (let i = 0; i < array.length; i++) array[i].removeFromVehicle();
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports.callTaxi = callTaxi;
module.exports.cancelTaxi = cancelTaxi;
module.exports.recallTaxi = recallTaxi;
