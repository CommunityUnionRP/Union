  module.exports = {
    "getpos": {
        description: "Вывести координаты игрока в консоль.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            //console.log(`${player.name} position: ${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)}`);
            //console.log(`${player.name} heading: ${player.heading.toFixed(2)}`);

            terminal.info(`${player.name} position: ${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)}`, player);
            if(player.vehicle) {
                terminal.info(`${player.name} heading: ${player.vehicle.heading.toFixed(2)}`, player);
            } else {
                terminal.info(`${player.name} heading: ${player.heading.toFixed(2)}`, player);
            }
        }
    },
    "bizes": {
        description: "Вывести координаты бизы.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            //console.log(mp.bizes);
        }
    },
    "pinfo": {
        description: "Вывести игрока в консоль.",
        minLevel: 6,
        syntax: "[playerId]:n",
        handler: (player, args) => {
            var player = mp.players.at(args[0]);
            if (!player) return;
            console.log(player);
        }
    },
    "vinfo": {
        description: "Вывести машину в консоль.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            console.log(player.vehicle);
        }
    },
    "iinfo": {
        description: "Вывести предметы инвентаря в консоль.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            terminal.info(JSON.stringify(player.inventory.items), player);
        }
    },
    "bank": {
        description: "Тестовое уведомление из банка.",
        minLevel: 6,
        syntax: "[icon]:n",
        handler: (player, args) => {
            player.call("BN_ShowWithPicture", ["Заголовок", "Отправитель", "Сообщение", "CHAR_BANK_FLEECA", args[0]]);
        }
    },
    "obj": {
        description: "Создать объект.",
        minLevel: 3,
        syntax: "[model]:s [deltaZ]:n [rX]:n [rY]:n",
        handler: (player, args) => {
            if (player.debugObj) player.debugObj.destroy();

            var pos = player.position;
            pos.z--;
            pos.z += args[1];
            player.debugObj = mp.objects.new(mp.joaat(args[0]), pos, {
                rotation: new mp.Vector3(args[2], args[3], player.heading),
                dimension: 0,
            });

            player.debugObj.name = args[0];

            terminal.info(`Вы создали объект ${args[0]}!`, player);
        }
    },
    "task_goto": {
        description: "Следование игрока в точку.",
        minLevel: 3,
        syntax: "[player_id]:n [speed]:n",
        handler: (player, args) => {
            var recipient = mp.players.at(args[0]);
            if (!recipient) return terminal.error("Игрок не найден!", player);

            recipient.call(`task.goto`, [player.position, args[1]]);
            terminal.info(`${recipient.name} следует к Вам`, player);
        }
    },
    "ammo": {
        description: "Получить текущее количество патрон.",
        minLevel: 3,
        syntax: "[weapon_hash]:s",
        handler: (player, args) => {
            player.call(`getAmmoWeapon`, [mp.joaat(args[0])]);
        }
    },
    "removeWeapon": {
        description: "Удалить ган.",
        minLevel: 3,
        syntax: "[weapon_hash]:s",
        handler: (player, args) => {
            player.call(`removeWeapon`, [mp.joaat(args[0])]);
        }
    },
    "event": {
        description: "Вызвать событие на клиенте.",
        minLevel: 3,
        syntax: "[event_name]:s [params]:s",
        handler: (player, args) => {
            var name = args[0];
            args.slice(0, 1);
            player.call(name, args);
        }
    },
    "show_ai": {
        description: "Посмотреть текущий AUTO_INCREMENT от players_inventory.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            terminal.log(`AUTO_INCREMENT: ${mp.inventory.autoIncrement}`, player);
        }
    },
    "take_object": {
        description: "Взять объект.",
        minLevel: 3,
        syntax: "[playerId]:n [model]:s",
        handler: (player, args) => {
            mp.players.at(args[0]).utils.takeObject(args[1]);
        }
    },
    "put_object": {
        description: "Положить объект.",
        minLevel: 3,
        syntax: "[playerId]:n",
        handler: (player, args) => {
            mp.players.at(args[0]).utils.putObject();
        }
    },
    "test_attach": {
        description: "Тестовый аттач.",
        minLevel: 3,
        syntax: "[model]:s [bone]:n [x]:n [y]:n [z]:n [rX]:n [rY]:n [rZ]:n",
        handler: (player, args) => {
            player.call(`testAttach`, args);
        }
    },
    "test_attach_off": {
        description: "Очистить тестовый аттач.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.call(`testAttachOff`);
        }
    },
    "test_veh_attach": {
        description: "Тестовый аттач к авто. Параметр number используется для аттача нескольких объектов.",
        minLevel: 3,
        syntax: "[model]:s [bone]:n [x]:n [y]:n [z]:n [rX]:n [rY]:n [rZ]:n [number]:n",
        handler: (player, args) => {
            player.call(`testVehAttach`, args);
        }
    },
    "test_veh_attach_off": {
        description: "Очистить тестовый аттач от авто.",
        minLevel: 3,
        syntax: "[number]:n",
        handler: (player, args) => {
            player.call(`testVehAttachOff`, args);
        }
    },
    "test_cropload": {
        description: "Тестовая команда для визуализации урожая в фермерском пикапе.",
        minLevel: 3,
        syntax: "[cropLoad]:n",
        handler: (player, args) => {
            if (!player.vehicle) return;
            player.vehicle.setVariable("cropLoad", args[0]);
        }
    },
    "test_blip": {
        description: "Создать тестовый блип.",
        minLevel: 3,
        syntax: "[ид_блипа]:n [ид_цвета]:n",
        handler: (player, args) => {
            if (player.debugBlip) {
                player.debugBlip.destroy();
                delete player.debugBlip;
            }
            player.debugBlip = mp.blips.new(args[0], player.position, {
                color: args[1],
                name: "Test",
                shortRange: 10,
                scale: 1
            });
            terminal.log(`Тестовый блип создан!`, player);
        }
    },
    "clothes": {
        description: "Сменить одежду.",
        minLevel: 3,
        syntax: "[number]:n [drawable]:n [texture]:n",
        handler: (player, args) => {
            player.setClothes(args[0], args[1], args[2], 0);
            terminal.log(`Одежда изменена!`, player);
        }
    },
    "prop": {
        description: "Сменить проп.",
        minLevel: 3,
        syntax: "[id]:n [drawable]:n [texture]:n",
        handler: (player, args) => {
            player.setProp(args[0], args[1], args[2]);
            terminal.log(`Проп изменен!`, player);
        }
    },
    "info_spawn": {
        description: "Информация о спавнах.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM spawn_pos", (e, result) => {
            if (e) {
              callback("Ошибка выполнения запроса в БД!");
              return terminal.error(e);
            }
            if (result.length < 1) return terminal.log("На сервере 0 спавнов", player);
            terminal.log(`--------------------------------------------`, player);
            for (let i = 0; i < result.length; i++) terminal.log(`Спавн <b>#${result[i].id}</b> | Название: <b>${result[i].name}</b>`, player);
            terminal.log(`--------------------------------------------`, player);
          });
        }
    },
    "create_spawn": {
        description: "Создать спавн для игроков.",
        minLevel: 3,
        syntax: "[name]:s",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM spawn_pos", (e, result) => {
            if (e) {
              callback("Ошибка выполнения запроса в БД!");
              return terminal.error(e);
            }
              for (let i = 0; i < result.length; i++) {
                if (result[i].name === args[0]) {
                  terminal.log(`Спавн с таким названием уже существует!`, player);
                  return;
                }
              }

              let id = result.length + 1;
              let pos = player.position;
              DB.Handle.query("INSERT INTO spawn_pos (name, x, y, z, rot) VALUES (?, ?, ?, ?, ?)", [args[0], pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3), player.heading.toFixed(3)], (e, sresult) => {
                    if (e) {
                      callback("Ошибка выполнения запроса в БД!");
                      return terminal.error(e);
                    }
                    terminal.log("Новый спавн #" + sresult.insertId + " создан! Название: " + args[0], player);
                  });
          });
        }
    },
    "delete_spawn": {
        description: "Удалить спавн для игроков.",
        minLevel: 3,
        syntax: "[id]:n",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM spawn_pos WHERE id=?", [args[0]], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Спавн #" + args[0] + " не существует!", player);
              DB.Handle.query(`DELETE FROM spawn_pos WHERE id=?`, args[0], (e, result) => {
                  if (e) {
                      callback("Ошибка выполнения запроса в БД!");
                      return terminal.error(e);
                    }
                  });
              terminal.log("Спавн #" + args[0] + " удален!", player);
          });
        }
    },
    "tp_spawn": {
        description: "Телепортироваться к спавну.",
        minLevel: 3,
        syntax: "[id]:n",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM spawn_pos WHERE id=?", [args[0]], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Спавн #" + args[0] + " не существует!", player);
              player.dimension = 0;
              player.position = new mp.Vector3(result[0].x, result[0].y, result[0].z);
              player.heading = result[0].rot;
              terminal.log("Вы телепортировались к спавну #" + args[0] + "!", player);
          });
        }
    },
    "info_flight": {
        description: "Информация о маршрутах для Автобусов.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM bus_route", (e, result) => {
            if (e) {
              callback("Ошибка выполнения запроса в БД!");
              return terminal.error(e);
            }
            if (result.length < 1) return terminal.log("На сервере 0 маршрутов", player);
            terminal.log(`--------------------------------------------`, player);
            for (let i = 0; i < result.length; i++) terminal.log(`Маршрут <b>#${result[i].id}</b> | Название: <b>${result[i].name}</b> | Зарплата: <b>$${result[i].money}</b>`, player);
            terminal.log(`--------------------------------------------`, player);
          });
        }
    },
    "select_flight": {
        description: "Выбрать маршрут для внесения изменений в него.",
        minLevel: 3,
        syntax: "[id]:n",
        handler: (player, args) => {
          if (player.marsh) return terminal.log("Вы уже редактируете другой маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [args[0]], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Маршрут #" + args[0] + " не существует!", player);
              terminal.log("Вы начали изменять маршрут #" + args[0], player);
              player.marsh = args[0];
              let arr = [];
              DB.Handle.query("SELECT * FROM bus_place WHERE bus=?", [args[0]], (e, sresult) => {
                if (sresult.length > 0) for (let i = 0; i < sresult.length; i++) arr.push({ id: sresult[i].id, x: sresult[i].x, y: sresult[i].y, z: sresult[i].z, type: sresult[i].type });
                if (arr.length > 0) {
                   player.notify("Всего точек в маршруте: ~r~" + arr.length);
                   player.call("create.all.map.bus", [JSON.stringify(arr), true]);
                } else {
                   player.utils.error("На данный момент маршрут пустой!");
                }
              });
          });
        }
    },
    "create_point": {
        description: "Создать чекпоинт для маршрута (0 - промежуток, 1 - остановка).",
        minLevel: 3,
        syntax: "[type]:n",
        handler: (player, args) =>  {
          if (!player.marsh) return terminal.log("Вы не редактируете маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [player.marsh], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) {
                terminal.log("Маршрут #" + player.marsh + " не существует!", player);
                delete player.marsh;
                return;
              }
              if (args[0] === 0 || args[0] === 1) {
                DB.Handle.query("INSERT INTO bus_place (bus, x, y, z, type) VALUES (?, ?, ?, ?, ?)", [player.marsh, player.position.x, player.position.y, player.position.z, args[0]], (error, sresult) => {
                    if (error) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(error);
                    }
                    terminal.log("Вы создали точку #" + sresult.insertId + "! Тип: " + (args[0] === 0 ? "Промежуточный чекпоинт" : "Остановка"), player);
                    player.call("create.one.map.bus", [player.position.x, player.position.y, player.position.z, args[0], sresult.insertId]);
                });
              } else {
                terminal.log("0 - Промежуточный чекпоинт | 1 - Остановка");
              }
          });
        }
    },
    "delete_point": {
        description: "Удалить чекпоинт для маршрута.",
        minLevel: 3,
        syntax: "[num]:n",
        handler: (player, args) =>  {
          if (!player.marsh) return terminal.log("Вы не редактируете маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [player.marsh], (e, sresult) => {
              if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
              if (sresult.length < 1) {
                terminal.log("Маршрут #" + player.marsh + " не существует!", player);
                delete player.marsh;
                return;
              }

              DB.Handle.query("SELECT * FROM bus_place WHERE id=?", [args[0]], (e, result) => {
                if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
                if (result.length < 1) return terminal.log("Точки #" + args[0] + " не существует!", player);
                if (result[0].bus !== player.marsh) return terminal.log("Данная точка принадлежит маршруту #" + result[0].bus, player);
                terminal.log("Вы удалили точку #" + args[0] + "! Тип: " + (result[0].type === 0 ? "Промежуточный чекпоинт" : "Остановка"), player);
                player.call("delete.one.map.bus", [args[0]]);
                DB.Handle.query(`DELETE FROM bus_place WHERE id=?`, args[0], (e, results) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                      }
                    });
              });
          });
        }
    },
    "stop_flight": {
        description: "Прекратить работу маршрутом.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
          if (!player.marsh) return terminal.log("Вы не редактируете маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [player.marsh], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Маршрут #" + player.marsh + " не существует!", player);
              terminal.log("Вы прекратили изменение маршрута #" + player.marsh, player);
              player.call("create.all.map.bus", [0, "cancel"]);
              delete player.marsh;
          });
        }
    },
    "create_flight": {
        description: "Создать новый маршрут для Автобусов.",
        minLevel: 3,
        syntax: "[name]:s",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM bus_route", (e, result) => {
            if (e) {
              callback("Ошибка выполнения запроса в БД!");
              return terminal.error(e);
            }
              for (let i = 0; i < result.length; i++) {
                if (result[i].name === args[0]) {
                  terminal.log(`Маршрут с таким названием уже существует!`, player);
                  return;
                }
              }

              let id = result.length + 1;
              DB.Handle.query("INSERT INTO bus_route (name) VALUES (?)", [args[0]], (e, sresult) => {
                    if (e) {
                      callback("Ошибка выполнения запроса в БД!");
                      return terminal.error(e);
                    }
                    terminal.log("Новый маршрут #" + sresult.insertId + " создан! Название: " + args[0], player);
                  });
          });
        }
    },
    "delete_flight": {
        description: "Удалить маршрут для Автобусов.",
        minLevel: 3,
        syntax: "[id]:n",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [args[0]], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Маршрут #" + args[0] + " не существует!", player);
              if (player.marsh === args[0]) return terminal.log("Вы не можете удалить маршрут #" + args[0] + ", пока изменяете его!", player);
              DB.Handle.query(`DELETE FROM bus_route WHERE id=?`, args[0], (e, result) => {
                  if (e) {
                      callback("Ошибка выполнения запроса в БД!");
                      return terminal.error(e);
                    }
                  });
              terminal.log("Маршрут #" + args[0] + " удален!", player);
          });
        }
    },
    "change_pos_point": {
        description: "Изменить позицию чекпоинта для маршрута.",
        minLevel: 3,
        syntax: "[id]:n",
        handler: (player, args) =>  {
          if (!player.marsh) return terminal.log("Вы не редактируете маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [player.marsh], (e, sresult) => {
              if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
              if (sresult.length < 1) {
                terminal.log("Маршрут #" + player.marsh + " не существует!", player);
                delete player.marsh;
                return;
              }

              DB.Handle.query("SELECT * FROM bus_place WHERE id=?", [args[0]], (e, result) => {
                if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
                if (result.length < 1) return terminal.log("Точки #" + args[0] + " не существует!", player);
                if (result[0].bus !== player.marsh) return terminal.log("Данная точка принадлежит маршруту #" + result[0].bus, player);
                terminal.log("Вы изменили позицию точки #" + args[0] + "! Тип: " + (result[0].type === 0 ? "Промежуточный чекпоинт" : "Остановка"), player);
                player.call("change.one.map.bus.position", [args[0], player.position.x, player.position.y, player.position.z]);
                DB.Handle.query("UPDATE bus_place SET x=?,y=?,z=? WHERE id=?", [player.position.x, player.position.y, player.position.z, args[0]]);
              });
          });
        }
    },
    "change_status_point": {
        description: "Изменить статус чекпоинта для маршрута (0 - промежуток, 1 - остановка).",
        minLevel: 3,
        syntax: "[id]:n [type]:n",
        handler: (player, args) =>  {
          if (!player.marsh) return terminal.log("Вы не редактируете маршрут!", player);
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [player.marsh], (e, sresult) => {
              if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
              if (sresult.length < 1) {
                terminal.log("Маршрут #" + player.marsh + " не существует!", player);
                delete player.marsh;
                return;
              }
              if (args[1] === 0 || args[1] === 1) {
                DB.Handle.query("SELECT * FROM bus_place WHERE id=?", [args[0]], (e, result) => {
                  if (e) { callback("Ошибка выполнения запроса в БД!"); return terminal.error(e); }
                  if (result.length < 1) return terminal.log("Точки #" + args[0] + " не существует!", player);
                  if (result[0].bus !== player.marsh) return terminal.log("Данная точка принадлежит маршруту #" + result[0].bus, player);
                  terminal.log("Вы изменили тип точки #" + args[0] + "! Тип: " + (args[1] === 0 ? "Промежуточный чекпоинт" : "Остановка"), player);
                  player.call("change.one.map.bus.name", [args[0], args[1]]);
                  DB.Handle.query("UPDATE bus_place SET type=? WHERE id=?", [args[1], args[0]]);
                });
              } else {
                terminal.log("0 - Промежуточный чекпоинт | 1 - Остановка");
              }
          });
        }
    },
    "change_name_flight": {
        description: "Изменить название маршрута для Автобусов.",
        minLevel: 3,
        syntax: "[id]:n [name]:s",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM bus_route", (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              for (let i = 0; i < result.length; i++) {
                if (result[i].name === args[1]) return terminal.log(`Маршрут с таким названием уже существует!`, player);
                if (result[i].id === args[0]) {
                  DB.Handle.query("UPDATE bus_route SET name=? WHERE id=?", [args[1], args[0]], (e, result) => {
                      if (e) {
                          callback("Ошибка выполнения запроса в БД!");
                          return terminal.error(e);
                        }
                      });
                  terminal.log("Название маршрута #" + args[0] + " изменено! Название: " + args[1], player);
                  return;
                }
              }

              terminal.log("Маршрут #" + args[0] + " не существует!", player);
          });
        }
    },
    "change_salary_flight": {
        description: "Изменить зарплату за маршрут для Автобусов.",
        minLevel: 3,
        syntax: "[id]:n [money]:n",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM bus_route WHERE id=?", [args[0]], (e, result) => {
              if (e) {
                callback("Ошибка выполнения запроса в БД!");
                return terminal.error(e);
              }
              if (result.length < 1) return terminal.log("Маршрут #" + args[0] + " не существует!", player);
              DB.Handle.query("UPDATE bus_route SET money=? WHERE id=?", [args[1], args[0]], (e, result) => {
                  if (e) {
                      callback("Ошибка выполнения запроса в БД!");
                      return terminal.error(e);
                    }
                  });
              terminal.log("Зарплата за маршрут #" + args[0] + " изменена! Зарплата: $" + args[1], player);
          });
        }
    },
    "call": {
        description: "Позвонить по номеру телефона",
        minLevel: 10,
        syntax: "[number]:n",
        handler: (player, args) => {
          if (player.phone.number) player.phone.call(args[0]);
        }
    },
    "calltaxi": {
        description: "Вызвать такси.",
        minLevel: 9,
        syntax: "",
        handler: (player, args) => {
            let taxiOpen = require("./modules/jobs/taxi/taxi.js");
            taxiOpen.callTaxi(player);
        }
    },
    "canceltaxi": {
        description: "Отменить вызов такси такси.",
        minLevel: 9,
        syntax: "",
        handler: (player, args) => {
            let taxiOpen = require("./modules/jobs/taxi/taxi.js");
            taxiOpen.cancelTaxi(player, true);
        }
    },
    "tptaxi": {
        description: "Телепортироваться к работе Такси.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(905.71, -175.35, 74.08);
        }
    },
    "tpport": {
        description: "Телепортироваться к работе Порт.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(-404.38, -2700.34, 6.00);
        }
    },
    "tppizza": {
        description: "Телепортироваться к работе Пиццерия.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(534.20, 98.95, 96.42);
        }
    },
    "tpbank": {
        description: "Телепортироваться к Банку.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(235.43, 216.95, 106.29);
        }
    },
    "tppost": {
        description: "Телепортироваться к Go Postal.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(-258.56, -841.53, 31.42);
        }
    },
    "tptrash": {
        description: "Телепортироваться к Мусоровозу.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(-625.64, -1639.07, 25.96);
        }
    },
    "door": {
        description: "Открыть дверь авто.",
        minLevel: 3,
        syntax: "[door]:n",
        handler: (player, args) => {
            if (!player.vehicle) return;
            player.call(`door`, [args[0]]);
        }
    },
    "tpbone": {
        description: "ТП к кости авто.",
        minLevel: 3,
        syntax: "[bone_name]:s",
        handler: (player, args) => {
            if (!player.vehicle) return;
            var vehId = player.vehicle.id;
            player.call(`vehBone.tp`, [args[0]]);
            var playerId = player.id;
            setTimeout(() => {
                try {
                    var player = mp.players.at(playerId);
                    var veh = mp.vehicles.at(vehId);
                    if (!player || !veh) return;
                    player.putIntoVehicle(veh, -1);
                } catch (e) {
                    console.log(e);
                }
            }, 2000);
        }
    },
    "test_mcall": {
        description: "Тестовый вызов медика.",
        minLevel: 3,
        syntax: "[text]:s",
        handler: (player, args) => {
            mp.events.call("hospital.addCall", player, args.join(" "));
        }
    },
    "test_mcallremove": {
        description: "Тестовое принятие/отклонение вызова медика.",
        minLevel: 3,
        syntax: "[playerId]:n",
        handler: (player, args) => {
            mp.events.call("hospital.acceptCall", player, args[0]);
        }
    },
    "test_pcall": {
        description: "Тестовый вызов копа.",
        minLevel: 3,
        syntax: "[text]:s",
        handler: (player, args) => {
            mp.events.call("police.addCall", player, args.join(" "));
        }
    },
    "test_pcallremove": {
        description: "Тестовое принятие/отклонение вызова копа.",
        minLevel: 3,
        syntax: "[playerId]:n",
        handler: (player, args) => {
            mp.events.call("police.acceptCall", player, args[0]);
        }
    },
    "effect": {
        description: "Включить Screen FX.",
        minLevel: 3,
        syntax: "[name]:s [time]:n",
        handler: (player, args) => {
            player.call(`effect`, [args[0], args[1]]);
        }
    },
    "sound": {
        description: "Включить звук.",
        minLevel: 3,
        syntax: "[name]:s [setName]:s",
        handler: (player, args) => {
            player.call(`playSound`, [args[0], args[1]]);
        }
    },
    "query": {
        description: "Чекнуть время выполнения запроса.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            var time = new Date().getTime();
            DB.Handle.query("SELECT 1+1 as result", (e,result) => {
                var ms = new Date().getTime() - time;
                terminal.log(`Time: ${ms} ms.`, player);
            });
        }
    },
}
