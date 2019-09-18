const whitelist = require("./modules/whitelist");

module.exports = {
    "veh": {
        description: "Создать автомобиль.",
        minLevel: 3,
        syntax: "[model]:s",
        handler: (player, args) => {
            var pos = player.position;
            pos.x += 2.0;

            //var hashes = require(`./vehicle_hashes.js`);
            //var model = hashes[args[0]];
            var model = args[0];
            delete hashes;
            if (!model) return terminal.error(`Модель ${args[0]} не найдена!<br/>Сообщите команде проекта, если Вы не ошиблись в названии.`, player);

            var vehicle = mp.vehicles.new(model, pos, {
                engine: false
            });
            vehicle.name = args[0];
            vehicle.owner = 0;
            vehicle.utils.setFuel(30);
            vehicle.maxFuel = 70;
            vehicle.dimension = player.dimension;
            vehicle.license = 0;
            terminal.info(`${player.name} создал авто ${args[0]}`);
            mp.logs.addLog(`${player.name} создал авто. Марка: ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, model: args[0] });
        }
    },
    "delete_veh": {
        description: "Удалить авто. Если авто есть в БД, то также удаляется.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            var veh = player.vehicle;
            if (!veh) return terminal.error(`Вы не в авто!`, player);

            if (veh.sqlId) {
                terminal.info(`${player.name} удалил авто из БД`, player);
                mp.logs.addLog(`${player.name} удалил авто из БД`, 'main', player.account.id, player.sqlId, { level: player.admin });
                DB.Handle.query(`DELETE FROM vehicles WHERE id=?`, [veh.sqlId]);
            } else terminal.info(`${player.name} удалил авто`, player);
            veh.destroy();
        }
    },
    "veh_color": {
        description: "Изменить цвет авто.",
        minLevel: 3,
        syntax: "[colorA]:n [colorB]:n",
        handler: (player, args) => {
            var veh = player.vehicle;
            if (!veh) return player.utils.error(`Вы не в авто!`, player);

            veh.setColor(args[0], args[1]);
            mp.logs.addLog(`${player.name} изменил цвет автомобилия для авто с ID: ${veh.id}`, 'main', player.account.id, player.sqlId, { level: player.admin, vehId: veh.id });
            terminal.log(`Цвет авто изменен`, player);
        }
    },
    "veh_license": {
        description: "Изменить лицензию для вождения авто. Типы:<br/>1 - авто<br/>2 - мото<br/>3 - Лодка<br/>4 - Яхта<br/>11 - вертолёт<br/>12 - самолёт",
        minLevel: 3,
        syntax: "[license]:n",
        handler: (player, args) => {
            var veh = player.vehicle;
            if (!veh) return player.utils.error(`Вы не в авто!`, player);
            var types = [1, 2, 3, 4, 11, 12];
            if (args[0] && types.indexOf(args[0]) == -1) return terminal.error(`Неверный тип лицензии!`, player);

            veh.utils.setLicense(args[0]);
            mp.logs.addLog(`${player.name} изменил категорию лицензии для авто с ID: ${veh.id}`, 'main', player.account.id, player.sqlId, { level: player.admin, vehId: veh.id });
            terminal.info(`${player.name} изменил категорию лицензии для авто с ID: ${veh.id}`);
        }
    },
    "fix": {
        description: "Починить авто.",
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            if (!player.vehicle) return terminal.error(`Вы не в машине!`, player);
            player.vehicle.repair();
            player.vehicle.utils.setEngineBroken(false);
            player.vehicle.utils.setOilBroken(false);
            player.vehicle.utils.setAccumulatorBroken(false);
            mp.logs.addLog(`${player.name} починил авто с ID: ${player.vehicle.id}`, 'main', player.account.id, player.sqlId, { level: player.admin, vehId: player.vehicle.id });
            terminal.info(`${player.name} починил авто с ID: ${player.vehicle.id}`);
        }
    },
    "tp": {
        description: "Телепортироваться по координатам.",
        minLevel: 2,
        syntax: "[x]:n [y]:n [z]:n",
        handler: (player, args) => {
            player.position = new mp.Vector3(args[0], args[1], args[2]);
            terminal.info(`Вы телепортировались`, player);
        }
    },
    "tps": {
        description: "Телепортироваться по координатам.",
        minLevel: 2,
        syntax: "[str]:s",
        handler: (player, args) => {
            args = args.map((a) => a.replace(",", "").replace("f", ""));

            player.position = new mp.Vector3(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]));
            terminal.info(`Вы телепортировались`, player);
        }
    },
    "hp": {
        description: "Пополнить здоровье себе.",
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            player.health = 100;
            terminal.info(`Здоровье пополнено!`, player);
        }
    },
    "armour": {
        description: "Пополнить броню себе.",
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            player.armour = 100;
            terminal.info(`Броня пополнена!`, player);
        }
    },
    "kill": {
        description: "Убить себя.",
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            player.health = 0;
            terminal.info(`Вы убиты!`, player);
        }
    },

    "goto": {
        description: "Телепортироваться к игроку.",
        minLevel: 1,
        syntax: "[id/name]:s",
        handler: (player, args) => {
            if (getPlayerStatus(args[0]) === "on") {
               let recipient = mp.players.at(args[0]);
               if (!recipient) return terminal.error("Игрок не найден!", player);
               if (recipient.admin > player.admin) return terminal.error(`Нельзя телепортироваться к админу с более высоким уровнем!`, player);
               var pos = recipient.position;
               pos.x += 2;
               player.position = pos;
               player.dimension = recipient.dimension;
               terminal.info(`Вы телепортировались к ${recipient.name}`, player);
               mp.logs.addLog(`${player.name} телепортировался к ${recipient.name}. Координаты: ${recipient.position}`, 'main', player.account.id, player.sqlId, { level: player.admin, pos: recipient.position });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                let recipient = mp.players.getByName(name);
                if (!recipient) return terminal.error(`Игрок ${args[0]} не найден!`, player);
                if (recipient.admin > player.admin) return terminal.error(`Нельзя телепортироваться к админу с более высоким уровнем!`, player);
                var pos = recipient.position;
                pos.x += 2;
                player.position = pos;
                player.dimension = recipient.dimension;
                terminal.info(`Вы телепортировались к ${recipient.name}`, player);
                mp.logs.addLog(`${player.name} телепортировался к ${recipient.name}. Координаты: ${recipient.position}`, 'main', player.account.id, player.sqlId, { level: player.admin, pos: recipient.position });
            }
        }
    },
    "gethere": {
        description: "Телепортировать игрока к себе.",
        minLevel: 1,
        syntax: "[id/name]:s",
        handler: (player, args) => {
          if (getPlayerStatus(args[0]) === "on") {
              let recipient = mp.players.at(args[0]);
              if (!recipient) return terminal.error("Игрок не найден!", player);
              var pos = player.position;
              pos.x += 2;
              recipient.position = pos;
              recipient.dimension = player.dimension;
              recipient.utils.info(`${player.name} телепортировал Вас к себе`);
              terminal.info(`${recipient.name} телепортирован к Вам`, player);
              mp.logs.addLog(`${player.name} телепортировал к себе ${recipient.name}. Координаты: ${player.position}`, 'main', player.account.id, player.sqlId, { level: player.admin, pos: player.position });
          } else {
              let name = getSpecialName(args[0], player);
              if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
              let recipient = mp.players.getByName(name);
              if (!recipient) return terminal.error(`Игрок ${args[0]} не найден!`, player);
              var pos = player.position;
              pos.x += 2;
              recipient.position = pos;
              recipient.dimension = player.dimension;
              recipient.utils.info(`${player.name} телепортировал Вас к себе`);
              terminal.info(`${recipient.name} телепортирован к Вам`, player);
              mp.logs.addLog(`${player.name} телепортировал к себе ${recipient.name}. Координаты: ${player.position}`, 'main', player.account.id, player.sqlId, { level: player.admin, pos: player.position });
          }
        }
    },
    "sp": {
        description: "Начать слежку за игроком.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            let pos = player.position;
            if (player === rec) return terminal.error(`Вы не можете начать за собой слежку!`, player);
            if (!player.lastsp) player.lastsp = {
                x: pos.x,
                y: pos.y,
                z: pos.z,
                h: player.heading,
                dim: player.dimension
            };
            player.setVariable("ainvis", true);
            player.alpha = 0;
            player.position = new mp.Vector3(rec.position.x, rec.position.y, rec.position.z - 125.0);
            mp.logs.addLog(`${player.name} начал слжеку за игроком ${rec.name}. Координаты: ${rec.position}`, 'main', player.account.id, player.sqlId, { level: player.admin, pos: rec.position });
            player.call(`admin.start.spectate`, [rec]);
        }
    },
    "global": {
        description: "Написать сообщение всем игрокам.",
        minLevel: 3,
        syntax: "[text]:s",
        handler: (player, args) => {
            terminal.info(`${player.name} написал сообщение всем игрокам`);
            var text = args.join(" ");
            mp.players.forEach((rec) => {
                if (rec.sqlId) rec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}:</a> ${text}`]);
                // chatAPI.custom_push(`<a style="color: #FF0000">[A] Tomat Petruchkin:</a> всем доброго времени суток!`);
            });
            /*
            mp.players.forEach((rec) => {
                if (rec.sqlId) rec.utils.success(`[A] ${player.name}: ` + text);
            });*/
        }
    },
    "del_acc": {
        description: "Удалить аккаунт игрока.",
        minLevel: 7,
        syntax: "[login]:s",
        handler: (player, args) => {
            if(player.account.login == args[0]) return player.utils.error("Нельзя удалить свой же аккаунт");
            mp.players.forEach((rec) => { if(rec.account.login == args[0]) rec.kick('KICK') });
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result;
                if (rec) {

                    DB.Handle.query("DELETE FROM accounts WHERE login=?", [args[0]], (e, result) => {
                        if (e) return terminal.error(e);
                        if (result.length < 1) return;
                    });  

                    DB.Handle.query("SELECT * FROM characters WHERE accountId=?", [result[0].id], (e, result) => {
                        if (e) return terminal.error(e);
                        if (result.length < 1) return;
                        result.forEach((recipient) => {
                            DB.Handle.query("DELETE FROM characters WHERE id=?", [recipient.id], (e, result) => {
                                if (e) return terminal.error(e);
                                if (result.length < 1) return;
                            });

                            DB.Handle.query("SELECT * FROM vehicles WHERE owner=?", [2000 + recipient.id], (e, result) => {
                                if (e) return terminal.error(e);
                                if (result.length < 1) return;
                                result.forEach((recipient) => {
                                    DB.Handle.query("DELETE FROM vehicles WHERE owner=?", [recipient.owner]);
                                });
                            });

                            DB.Handle.query("SELECT * FROM houses WHERE owner=?", [recipient.id], (e, result) => {
                                if (e) return terminal.error(e);
                                if (result.length < 1) return;
                                result.forEach((recipient) => {
                                    var house = mp.hosues.getBySqlId(recipient.id);
                                    house.setOwner(0);
                                });
                            });
                            
                            DB.Handle.query("SELECT * FROM bizes WHERE owner=?", [recipient.id], (e, result) => {
                                if (e) return terminal.error(e);
                                if (result.length < 1) return;
                                result.forEach((recipient) => {
                                    var biz = mp.bizes.getBySqlId(recipient.id);
                                    biz.setOwner(0);
                                });
                            });

                            DB.Handle.query("SELECT * FROM characters_headoverlays WHERE character_id=?", [recipient.id], (e, result) => {
                                if (e) return terminal.error(e);
                                if (result.length < 1) return;
                                result.forEach((recipient) => {
                                    DB.Handle.query("DELETE FROM characters_headoverlays WHERE character_id=?", [recipient.character_id]);
                                });
                            });
                        });
                        

                        terminal.info(`${player.name} удалил аккаунт ${args[0]}`);
                        mp.logs.addLog(`${player.name} удалил аккаунт ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, login: args[0] });
                        mp.logs.addLog(`${args[0]} удален из базы данных`, 'main', result[0].id, 0, { login: args[0] });

                    });
                }
            });
        }
    },
    "del_char": {
        description: "Удалить персонажа аккаунта.",
        minLevel: 7,
        syntax: "[name]:s",
        handler: (player, args) => {
            let name = getSpecialName(args[0], player);
            if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
            if(player.name == args[0]) return player.utils.error("Нельзя удалить своего же персонажа!");
            mp.players.forEach((rec) => { if(rec.name == name) rec.kick('KICK') });

            DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return;

                DB.Handle.query("DELETE FROM characters WHERE id=?", [result[0].id], (e, result) => {
                    if (e) return terminal.error(e);
                    if (result.length < 1) return;
                });

                DB.Handle.query("SELECT * FROM vehicles WHERE owner=?", [2000 + result[0].id], (e, result) => {
                    if (e) return terminal.error(e);
                    if (result.length < 1) return;
                    result.forEach((recipient) => {
                        DB.Handle.query("DELETE FROM vehicles WHERE owner=?", [recipient.owner]);
                    });
                });

                DB.Handle.query("SELECT * FROM houses WHERE owner=?", [result[0].id], (e, result) => {
                    if (e) return terminal.error(e);
                    if (result.length < 1) return;
                    result.forEach((recipient) => {
                        var house = mp.hosues.getBySqlId(recipient.id);
                        house.setOwner(0);
                    });
                });
                DB.Handle.query("SELECT * FROM bizes WHERE owner=?", [result[0].id], (e, result) => {
                    if (e) return terminal.error(e);
                    if (result.length < 1) return;
                    result.forEach((recipient) => {
                        var biz = mp.bizes.getBySqlId(recipient.id);
                        biz.setOwner(0);
                    });
                });
    
                DB.Handle.query("SELECT * FROM characters_headoverlays WHERE character_id=?", [result[0].id], (e, result) => {
                    if (e) return terminal.error(e);
                    if (result.length < 1) return;
                    result.forEach((recipient) => {
                        DB.Handle.query("DELETE FROM characters_headoverlays WHERE character_id=?", [recipient.character_id]);
                    });
                });

                terminal.info(`${player.name} удалил персонажа ${name}`);
                mp.logs.addLog(`${player.name} удалил персонажа ${name}`, 'main', player.account.id, player.sqlId, { level: player.admin, name: name });
                mp.logs.addLog(`${name} удален из базы данных`, 'main', result[0].id, 0, { name: name });

            });
        }
    },
    "info_acc": {
        description: "Информация об аккаунте.",
        minLevel: 7,
        syntax: "[login]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                if (rec) {
                    terminal.info(`${player.name} посмотрел информацию об аккаунте ${args[0]}`);
                    terminal.log(`Login: <b>${result[0].login}</b><br/>SC: <b>${result[0].socialClub}</b><br/>Email: <b>${result[0].email} (${result[0].confirmEmail === 1 ? 'true' : 'false'})</b><br/>RegIP: <b>${result[0].regIp}</b><br/>LastIP: <b>${target[0].lastIp}</b><br/>LastDate: <b>${result[0].lastDate}</b><br/>`, player);
                    mp.logs.addLog(`${player.name} посмотрел информацию об аккаунте ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, login: args[0] });
                }
            });
        }
    },
    "change_login": {
        description: "Изменить логин.",
        minLevel: 7,
        syntax: "[oldLogin]:s [login]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} изменил аккаунту ${result[0].login} с логина ${args[0]} на логин ${args[1]}`);
                    mp.logs.addLog(`${player.name} изменил аккаунту ${result[0].login} с логина ${args[0]} на логин ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, oldLogin: args[0], login: args[1] });
                    if(recPlayer) {
                        recPlayer.account.login = args[1];
                        recPlayer.utils.success(`Администратор ${player.name} изменил Вам логин аккаунт на ${args[1]}`);
                    }
                    DB.Handle.query(`UPDATE accounts SET login=? WHERE login=?`, [args[0], args[0]]);
                }
            });
        }
    },
    "change_sc": {
        description: "Сменить SC.",
        minLevel: 7,
        syntax: "[oldSC]:s [SC]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE socialClub=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с SC: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getBySocialClub(args[0]);
                if (rec) {
                    terminal.info(`${player.name} изменил аккаунту ${result[0].login} с SC ${args[0]} на SC ${args[1]}`);
                    mp.logs.addLog(`${player.name} изменил аккаунту ${result[0].login} с SC ${args[0]} на SC ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, oldSC: args[0], SC: args[1] });
                    if(recPlayer) {
                        recPlayer.socialClub = args[1];
                        recPlayer.utils.success(`Администратор ${player.name} изменил Вам socialClub аккаунта на ${args[1]}`);
                    }
                    DB.Handle.query(`UPDATE accounts SET socialClub=? WHERE socialClub=?`, [args[0], args[0]]);
                }
            });
        }
    },
    "change_pass": {
        description: "Сменить пароль.",
        minLevel: 7,
        syntax: "[login]:s [pass]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} изменил пароль аккаунта ${args[0]} на ${args[1]}`);
                    mp.logs.addLog(`${player.name} изменил пароль аккаунта ${args[0]} на ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, pass: args[1], login: args[0] });
                    if(recPlayer) recPlayer.utils.success(`Администратор ${player.name} изменил Вам пароль аккаунта на ${args[1]}`);
                    DB.Handle.query(`UPDATE accounts SET password=? WHERE login=?`, [md5(args[1]), args[0]]);
                }
            });
        }
    },
    "change_email": {
        description: "Изменить почту.",
        minLevel: 7,
        syntax: "[login]:s [email]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} изменил почту аккаунта ${args[0]} на ${args[1]}`);
                    mp.logs.addLog(`${player.name} изменил почту аккаунта ${args[0]} на ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, email: args[1], login: args[0] });
                    if(recPlayer) recPlayer.utils.success(`Администратор ${player.name} изменил Вам email аккаунта на ${args[1]}`);
                    DB.Handle.query(`UPDATE accounts SET email=? WHERE login=?`, [args[1], args[0]]);
                }
            });
        }
    },
    "email_confirm": {
        description: "Подтвердить почту. Статус 1 - подтвержден, 0 - не подтвержден.",
        minLevel: 7,
        syntax: "[login]:s [status]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} изменил статус почты аккаунта ${args[0]} на ${args[1] === 1 ? 'Подтвержден' : "Не подтвержден"}`);
                    mp.logs.addLog(`${player.name} изменил статус почты аккаунта ${args[0]} на ${args[1] === 1 ? 'Подтвержден' : "Не подтвержден"}`, 'main', player.account.id, player.sqlId, { level: player.admin, email: result[0].confirmEmail, status: args[1], login: args[0] });
                    if(recPlayer) {
                        recPlayer.account.confirmEmail = args[1];
                        recPlayer.utils.success(`Администратор ${player.name} изменил Вам статус email аккаунта на ${args[1] === 1 ? 'Подтвержден' : "Не подтвержден"}`);
                    }
                    DB.Handle.query(`UPDATE accounts SET confirmEmail=? WHERE login=?`, [args[1], args[0]]);
                }
            });
        }
    },
    "info_rpr": {
        description: "Информация об аккаунте.",
        minLevel: 7,
        syntax: "[login]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                if (rec) {
                    terminal.info(`${player.name} посмотрел информацию об RP рейтинге аккаунта ${args[0]}`);
                    terminal.log(`Login: <b>${result[0].login}</b><br/>RP рейтинг: <b>${result[0].rp}</b><br/>`, player);
                    mp.logs.addLog(`${player.name} посмотрел информацию об RP рейтинге аккаунта ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, login: args[0] });
                }
            });
        }
    },
    "set_rpr": {
        description: "Установить RP рейтинг.",
        minLevel: 7,
        syntax: "[login]:s [RP]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} установил ${args[1]} RP рейтинг аккаунту ${args[0]}`);
                    mp.logs.addLog(`${player.name} установил ${args[1]} RP рейтинг аккаунту ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, rp: args[1], login: args[0] });
                    if(recPlayer) recPlayer.utils.success(`Администратор ${player.name} установил Вам RP рейтинг аккаунта на ${args[1]}`);
                    DB.Handle.query(`UPDATE accounts SET rp=? WHERE login=?`, [args[1], args[0]]);
                }
            });
        }
    },
    "give_rpr": {
        description: "Выдать RP рейтинг.",
        minLevel: 7,
        syntax: "[login]:s [RP]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} добавил ${args[1]} RP рейтинга аккаунту ${args[0]}`);
                    mp.logs.addLog(`${player.name} добавил ${args[1]} RP рейтинга аккаунту ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, rp: result[0].rp + args[1], login: args[0] });
                    if(recPlayer) recPlayer.utils.success(`Администратор ${player.name} добавил Вам ${args[1]} RP рейтинг аккаунта`);
                    DB.Handle.query(`UPDATE accounts SET rp=rp + ? WHERE login=?`, [args[1], args[0]]);
                }
            });
        }
    },
    "take_rpr": {
        description: "Забрать RP рейтинг.",
        minLevel: 7,
        syntax: "[login]:s [RP]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} забрал ${args[1]} RP рейтинга у аккаунта ${args[0]}`);
                    mp.logs.addLog(`${player.name} забрал ${args[1]} RP рейтинга у аккаунта ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, rp: result[0].rp - args[1], login: args[0] });
                    if(recPlayer) recPlayer.utils.success(`Администратор ${player.name} забрал у Вас ${args[1]} RP рейтинга аккаунта`);
                    DB.Handle.query(`UPDATE accounts SET rp=rp - ? WHERE login=?`, [args[1], args[0]]);
                }
            });
        }
    },
    "info_vc": {
        description: "Информация о VC.",
        minLevel: 7,
        syntax: "[login]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                if (rec) {
                    terminal.info(`${player.name} посмотрел информацию об VC аккаунта ${args[0]}`);
                    terminal.log(`Login: <b>${result[0].login}</b><br/>VC: <b>${result[0].donate}</b><br/>`, player);
                    mp.logs.addLog(`${player.name} посмотрел информацию об VC аккаунта ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, login: args[0] });
                }
            });
        }
    },
    "set_vc": {
        description: "Установить VC.",
        minLevel: 7,
        syntax: "[login]:s [VC]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} установил ${args[1]} VC аккаунту ${args[0]}`);
                    mp.logs.addLog(`${player.name} установил ${args[1]} VC аккаунту ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, donate: args[1], login: args[0] });
                    if(recPlayer) {
                        recPlayer.utils.setDonate(args[1]);
                        recPlayer.utils.success(`Администратор ${player.name} установил Вам VC аккаунта на ${args[1]}`);
                    }
                }
            });
        }
    },
    "give_vc": {
        description: "Выдать VC.",
        minLevel: 7,
        syntax: "[login]:s [VC]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} добавил ${args[1]} VC аккаунту ${args[0]}`);
                    mp.logs.addLog(`${player.name} добавил ${args[1]} VC аккаунту ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, donate: result[0].donate + args[1], login: args[0] });
                    if(recPlayer) {
                        recPlayer.utils.setDonate(args[1] + recPlayer.account.donate);
                        recPlayer.utils.success(`Администратор ${player.name} добавил Вам ${args[1]} VC аккаунта`);
                    }
                }
            });
        }
    },
    "take_vc": {
        description: "Забрать VC.",
        minLevel: 7,
        syntax: "[login]:s [VC]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM accounts WHERE login=?", [args[0]], (e, result) => {
                if (e) return terminal.error(e);
                if (result.length < 1) return terminal.error(`Игрок с логином: ${args[0]} не найден!`, player);
                let rec = result[0];
                let recPlayer = mp.players.getByLogin(args[0]);
                if (rec) {
                    terminal.info(`${player.name} забрал ${args[1]} VC у аккаунта ${args[0]}`);
                    mp.logs.addLog(`${player.name} забрал ${args[1]} VC у аккаунта ${args[0]}`, 'main', player.account.id, player.sqlId, { level: player.admin, donate: result[0].donate - args[1], login: args[0] });
                    if(recPlayer) {
                        recPlayer.utils.setDonate(args[1] - recPlayer.account.donate);
                        recPlayer.utils.success(`Администратор ${player.name} забрал у Вас ${args[1]} VC аккаунта`);
                    }
                }
            });
        }
    },
    "unsp": {
        description: "Закончить слежку за игроком.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            if (!player.lastsp) return terminal.error(`Вы не ведете слежку!`, player);
            player.setVariable("ainvis", null);
            player.call(`admin.start.spectate`, [undefined]);
            player.alpha = 255;
            player.position = new mp.Vector3(player.lastsp.x, player.lastsp.y, player.lastsp.z);
            player.heading = player.lastsp.h;
            player.dimension = player.lastsp.dim;
            player.utils.error("Вы прекратили слежку!");
            delete player.lastsp;
        }
    },
    "kick": {
        description: "Кикнуть игрока с сервера.",
        minLevel: 1,
        syntax: "[playerId]:n [reason]:s",
        handler: (player, args) => {
            var recipient = mp.players.at(args[0]);
            if (!recipient) return terminal.error("Игрок не найден!", player);
            args.splice(0, 1);
            var reason = args.join(" ");
            recipient.utils.error(`${player.name} кикнул Вас`);
            recipient.utils.error(`Причина: ${reason}`);
            recipient.kick(reason);
            terminal.info(`${player.name} кикнул ${recipient.name}: ${reason}`);
            mp.logs.addLog(`${player.name} кикнул ${recipient.name}. Причина: ${reason}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: reason });
            mp.logs.addLog(`${recipient.name} был кикнут администратором ${player.name}. Причина: ${reason}`, 'main', recipient.account.id, recipient.sqlId, { level: player.admin, reason: reason });
            mp.players.forEach((rec) => {
                if (rec.sqlId) rec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> кикнул <a style="color: ${adm_color}">${recipient.name}.</a> Причина: <a style="color: ${adm_color}">${reason}`]);
                // chatAPI.custom_push(`<a style="color: #FF0000">[A] Tomat Petruchkin:</a> всем доброго времени суток!`);
            });
        }
    },
    "skick": {
        description: "Кикнуть игрока с сервера ( без уведомления игрока )",
        minLevel: 1,
        syntax: "[playerId]:n [reason]:s",
        handler: (player, args) => {
            var recipient = mp.players.at(args[0]);
            if (!recipient) return terminal.error("Игрок не найден!", player);
            args.splice(0, 1);
            var reason = args.join(" ");
            terminal.info(`${player.name} тихо кикнул ${recipient.name}: ${reason}`);
            mp.logs.addLog(`${player.name} тихо кикнул ${recipient.name}. Причина: ${reason}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: reason });
            mp.logs.addLog(`${recipient.name} был тихо кикнут администратором ${player.name}. Причина: ${reason}`, 'main', recipient.account.id, recipient.sqlId, { level: player.admin, reason: reason });
            recipient.kick(reason);
        }
    },
    "hp_radius": {
        description: "Изменить игрокам здоровье в радиусе.",
        minLevel: 3,
        syntax: "[radius]:n [health]:n",
        handler: (player, args) => {
            let dist = args[0];
            if (dist < 1 || dist > 20000) return terminal.error(`Дистанция от 1 до 20000!`, player);
            let health = Math.clamp(args[1], 0, 100);
            mp.players.forEachInRange(player.position, dist,
                (rec) => {
                    rec.health = health;
                    rec.utils.info(`${player.name} изменил ваше здоровье на ${health}`);
                }
            );
            terminal.info(`${player.name} изменил здоровье всем игрокам в радиусе ${dist}м. на ${health}хп.`);
        }
    },
    "set_hp": {
        description: "Изменить здоровье игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [health]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            rec.health = Math.clamp(args[1], 0, 100);
            rec.utils.info(`${player.name} изменил ваше здоровье на ${rec.health}`);
            terminal.info(`${player.name} изменил здоровье ${rec.name} на ${rec.health}`);
        }
    },
    "id": {
        description: "Узнать имя игрока.",
        minLevel: 1,
        syntax: "[id/name]:s",
        handler: (player, args) => {
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                terminal.log(`ID: ${rec.id} | ИМЯ: ${rec.name}`, player);
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                let rec = mp.players.getByName(name);
                if (!rec) return terminal.error(`Игрок ${args[0]} не найден!`, player);
                terminal.log(`ID: ${rec.id} | ИМЯ: ${rec.name}`, player);
            }
        }
    },
    "set_armor": {
        description: "Изменить броню игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [armor]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            rec.armour = Math.clamp(args[1], 0, 100);
            rec.utils.info(`${player.name} изменил вашу броню на ${rec.armour}`);
            terminal.info(`${player.name} изменил броню ${rec.name} на ${rec.armour}`);
        }
    },
    "dm": {
        description: "Посадить игрока в деморган.",
        minLevel: 3,
        syntax: "[id/name]:s [time]:n [reason]:s",
        handler: (player, args) => {
            if (args[1] < 1 || args[1] > 5000) return terminal.error(`Деморган от 1 мин. до 5000 мин.!`, player);
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                if (rec.demorgan > 0) return terminal.error(`Игрок с ID: ${args[0]} уже сидит в деморгане!`, player);
                let spawnOpen = require("./events/CharacterEvents.js");
                rec.position = new mp.Vector3(spawnOpen.SpawnInfo.demorgan.x, spawnOpen.SpawnInfo.demorgan.y, spawnOpen.SpawnInfo.demorgan.z);
                rec.heading = spawnOpen.SpawnInfo.demorgan.h;
                let startDemorgan = parseInt(new Date().getTime() / 1000);
                rec.utils.setLocalVar("demorganSet", { startTime: startDemorgan, demorgan: args[1] });
                rec.startDemorgan = startDemorgan;
                rec.demorganTimerId = timerId = setTimeout(() => {
                    try {
                        rec.utils.leaveDemorgan();
                    } catch (err) {
                        console.log(err.stack);
                    }
                }, (args[1] * 60) * 1000);
                rec.demorgan = args[1];
                rec.utils.error(`${player.name} посадил Вас в деморган на ${args[1]} минут.`);
                rec.utils.error(`Причина: ${args[2]}`);
                DB.Handle.query("UPDATE characters SET demorgan=? WHERE id=?", [args[1], rec.sqlId]);
                terminal.info(`${player.name} посадил ${rec.name} в деморган на ${args[1]} минут. Причина: ${args[2]}`);

                mp.logs.addLog(`${player.name} посадил ${rec.name} в деморган на ${args[1]} минут. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, time: args[1], reason: args[2] });
                mp.logs.addLog(`${rec.name} был посажен администратором ${player.name} в деморган на ${args[1]} минут. Причина: ${args[2]}`, 'main', rec.account.id, rec.sqlId, { time: args[1], reason: args[2] });

                mp.players.forEach((newrec) => {
                    if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> посадил <a style="color: ${adm_color}">${rec.name}</a> в деморган на <a style="color: ${adm_color}">${args[1]}</a> минут. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let rec = result[0];
                    if (rec) {
                        DB.Handle.query("UPDATE characters SET demorgan=? WHERE id=?", [args[1], rec.id]);
                        terminal.info(`${player.name} посадил оффлайн ${rec.name} в деморган на ${args[1]} минут. Причина: ${args[2]}`);

                        mp.logs.addLog(`${player.name} посадил оффлайн ${rec.name} в деморган на ${args[1]} минут. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, time: args[1], reason: args[2] });
                        mp.logs.addLog(`${rec.name} был посажен администратором ${player.name} в оффлайн деморган на ${args[1]} минут. Причина: ${args[2]}`, 'main', rec.accountId, rec.id, { time: args[1], reason: args[2] });

                        mp.players.forEach((newrec) => {
                            if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> посадил <a style="color: ${adm_color}">${rec.name}</a> в деморган на <a style="color: ${adm_color}">${args[1]}</a> минут. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
                        });
                    }
                });
            }
        }
    },
    "undm": {
        description: "Выпустить игрока из деморгана.",
        minLevel: 3,
        syntax: "[id/name]:s",
        handler: (player, args) => {
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                if (rec.demorgan === 0) return terminal.error(`Игрок с ID: ${args[0]} не сидит в деморгане!`, player);
                rec.utils.leaveDemorgan();
                rec.utils.error(`${player.name} выпустил Вас из деморгана.`);
                terminal.info(`${player.name} выпустил ${rec.name} из деморгана.`);

                mp.logs.addLog(`${player.name} выпустил ${rec.name} из деморгана`, 'main', player.account.id, player.sqlId, { level: player.admin });
                mp.logs.addLog(`${rec.name} был выпущен администратором ${player.name} из деморгана.`, 'main', rec.account.id, rec.sqlId, { level: player.admin });

                mp.players.forEach((newrec) => {
                    if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> выпустил <a style="color: ${adm_color}">${rec.name}</a> из деморгана.`]);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let rec = result[0];
                    if (rec) {
                        if (rec.demorgan === 0) return terminal.error(`Игрок не сидит в деморгане!`, player);
                        DB.Handle.query("UPDATE characters SET demorgan=? WHERE id=?", [0, rec.id]);
                        terminal.info(`${player.name} выпустил оффлайн ${rec.name} из деморгана.`);

                        mp.logs.addLog(`${player.name} выпустил оффлайн ${rec.name} из деморгана`, 'main', player.account.id, player.sqlId, { level: player.admin });
                        mp.logs.addLog(`${rec.name} был выпущен администратором ${player.name} из оффлайн деморгана`, 'main', rec.accountId, rec.id, { level: player.admin });

                        mp.players.forEach((newrec) => {
                            if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> выпустил <a style="color: ${adm_color}">${rec.name}</a> из деморгана.`]);
                        });
                    }
                });
            }
        }
    },
    "stats": {
        description: "Просмотреть статистику игрока.",
        minLevel: 3,
        syntax: "[id/name]:s",
        handler: (player, args) => {
            if (getPlayerStatus(args[0]) === "on") {
                var rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                let add_text;
                DB.Handle.query("SELECT * FROM characters WHERE id=?", [rec.sqlId], (e, result) => {
                    add_text = `Дата регистрации: <b>${result[0].regDate}</b><br/>IP: <b>${rec.ip}</b><br/>IP при регистрации: <b>${result[0].regIp}</b><br/>`;
                    terminal.log(`Игрок: <b>${rec.name}</b><br/>Деньги: <b>$${rec.money}</b><br/>Банк: <b>$${rec.bank}</b><br/>Донат: <b>${rec.account.donate}</b><br/>Отыгранно: <b>${rec.minutes} минут</b><br/>Варны: <b>${rec.warn}</b><br/>Организация: <b>${rec.faction === 0 ? "нет" : mp.factions.getBySqlId(rec.faction).name}</b><br/>Ранг: <b>${rec.rank === 0 ? "нет" : mp.factions.getRankName(rec.faction, rec.rank)}</b><br/>Работа: <b>${rec.job  === 0 ? "нет" : mp.jobs[rec.job - 1].name}</b><br/>Кол-во домов: <b>${mp.houses.getArrayByOwner(rec.sqlId).length}</b><br/>SC: <b>${rec.socialClub}</b><br/>Общий донат: <b>${rec.account.allDonate}</b><br/>` + add_text, player);
                    terminal.info(`${player.name} просмотрел статистику ${rec.name}`);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let target = result[0];
                    if (target) {
                        terminal.log(`Игрок: <b>${target.name}</b><br/>Деньги: <b>$${target.money}</b><br/>Банк: <b>$${target.bank}</b><br/>Донат: <b>${target.donate}</b><br/>Отыгранно: <b>${target.minutes} минут</b><br/>Варны: <b>${target.warn}</b><br/>Организация: <b>${target.faction === 0 ? "нет" : mp.factions.getBySqlId(target.faction).name}</b><br/>Ранг: <b>${target.rank === 0 ? "нет" : mp.factions.getRankName(target.faction, target.rank)}</b><br/>Работа: <b>${target.job  === 0 ? "нет" : mp.jobs[target.job - 1].name}</b><br/>Кол-во домов: <b>${mp.houses.getArrayByOwner(target.sqlId).length}</b><br/>Дата регистрации: <b>${target.regDate}</b><br/>IP при последнем заходе: <b>${target.lastIp}</b><br/>IP при регистрации: <b>${target.regIp}</b><br/>`, player);
                        terminal.info(`${player.name} просмотрел оффлайн статистику ${target.name}`);
                    }
                });
            }
        }
    },
    "clist": {
        description: "Включение/выключение отображения админ-цвета в никнейме.",
        minLevel: 1,
        syntax: "",
        handler: (player, args) => {
          if (!player.getVariable("admin")) {
            player.setVariable("admin", player.admin);
            player.utils.success("Вы включили отображение админ-цвета!");
          } else {
            player.setVariable("admin", null);
            player.utils.error("Вы выключили отображение админ-цвета!");
          }
        }
    },
    "makeadminoff": {
        description: "Снять администратора оффлайн",
        minLevel: 9,
        syntax: "[name]:s [reason]:s",
        handler: (player, args) => {
            let name = getSpecialName(args[0], player);
            if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
            DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                if (e) {
                    callback("Ошибка выполнения запроса в БД!");
                    return terminal.error(e);
                }
                if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                let target = result[0];
                if (target) {
                    if (target.admin === 0) return terminal.error(`Данный игрок не является администратором!`, player);
                    if (target.admin > player.admin) return terminal.error(`Данный администратор выше вас уровнем!`, player);
                    DB.Handle.query("UPDATE characters SET admin=? WHERE id=?", [0, target.id]);
                    terminal.info(`${player.name} снял администратора ${target.name}. Причина: ${args[1]}`);
                    mp.logs.addLog(`${player.name} снял администратора персонажа ${target.name}. Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1] });
                }
            });
        }
    },
    "spawncars": {
        description: "Заспавнить свободные авто на сервере.",
        minLevel: 4,
        syntax: "",
        handler: (player, args) => {
            terminal.log(`${player.name} начал спавн всего транспорта на сервере.`);
            mp.players.forEach((newrec) => {
              if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A]</a> Все транспортные средства будут заспавнены через <a style="color: ${adm_color}">${Config.spawnCarsWaitTime / 1000}</a> секунд.`]);
            });
            setTimeout(function() {
                var startTime = new Date().getTime();
                var spawnCount = 0,
                    destroyCount = 0;
                try {
                    mp.vehicles.forEach((vehicle) => {
                        //todo не спавнить тачки, в которые загружают продукты
                        var players = vehicle.getOccupants();
                        if (players.length == 0) {
                            if (vehicle.spawnPos) {
                                let pos = vehicle.spawnPos;
                                var dist = (vehicle.position["x"] - pos["x"]) * (vehicle.position["x"] - pos["x"]) + (vehicle.position["y"] - pos["y"]) * (vehicle.position["y"] - pos["y"]) +
                                    (vehicle.position["z"] - pos["z"]) * (vehicle.position["z"] - pos["z"]);

                                if (dist >= 10) {
                                    vehicle.repair();
                                    vehicle.utils.setFuel(30);
                                    vehicle.maxFuel = 70;
                                    vehicle.position = pos;
                                    vehicle.rotation = new mp.Vector3(0, 0, pos.h);
                                    vehicle.setVariable("leftSignal", false);
                                    vehicle.setVariable("rightSignal", false);
                                    if (vehicle.getVariable("engine"))
                                        vehicle.utils.engineOn();
                                    spawnCount++;
                                }
                            } else {
                                destroyCount++;
                                vehicle.destroy();
                            }
                        }
                    });
                    var ms = new Date().getTime() - startTime;
                    mp.players.forEach((newrec) => {
                      if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A]</a> Все транспортные средства заспавнены.`]);
                    });
                    terminal.info(`${player.name} заспавнил свободную технику<br/>Авто на сервере: ${mp.vehicles.length}<br/>Заспавнено: ${spawnCount}<br/>Удалено: ${destroyCount}<br/>Время: ${ms} ms`);
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },
    "fuel_all": {
        description: "Заправить все транспортные средства на сервере.",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            terminal.log(`${player.name} начал заправлять весь транспорт на сервере.`);
            mp.players.forEach((newrec) => {
              if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A]</a> Все транспортные средства будут заправлены через <a style="color: ${adm_color}">${Config.spawnCarsWaitTime / 1000}</a> секунд.`]);
            });
            setTimeout(function() {
                var startTime = new Date().getTime();
                try {
                    mp.vehicles.forEach((vehicle) => {
                       if (vehicle.owner < 1101) vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
                    });
                    var ms = new Date().getTime() - startTime;
                    terminal.info(`${player.name} заправил весь транспорт! <br/>Время: ${ms} ms`);
                    mp.players.forEach((newrec) => {
                      if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A]</a> Все транспортные средства заправлены.`]);
                    });
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },
    "del_car": {
        description: "Удалить авто.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
            var veh = player.vehicle;
            if (!veh) return terminal.error(`Вы не в авто!`, player);
            terminal.info(`${player.name} удалил авто`, player);
            veh.destroy();
        }
    },
    "admins": {
        description: "Просмотреть список администраторов онлайн.",
        minLevel: 3,
        syntax: "",
        handler: (player, args) => {
          DB.Handle.query("SELECT * FROM characters WHERE admin>?", [0], (e, result) => {
              if (e) {
                  callback("Ошибка выполнения запроса в БД!");
                  return terminal.error(e);
              }
              if (result.length < 1) return terminal.error(`Ошибка, нет администраторов!`, player);
              let admins = ``;
              for (let i = 0; i < result.length; i++) {
                let target = mp.players.getBySqlId(result[i].id);
                admins += `[${i + 1}] Имя: <b>${result[i].name}</b> | Уровень прав: <b>${result[i].admin}</b> | Онлайн: <b>${target === undefined ? `нет` : `да ( id: ${target.id} )`}</b> <br/>`;
              }
              terminal.log(`${admins}`, player);
          });
        }
    },
    "warn": {
        description: "Выдать предупреждение.",
        minLevel: 3,
        syntax: "[id/name]:s [reason]:s",
        handler: (player, args) => {
            let date = new Date();
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                let warn = ++rec.warn;
                rec.utils.error(`${player.name} выдал Вам варн! ( ${warn}/3 )`);
                rec.utils.error(`Причина: ${args[1]}`);
                if (warn > 2) {
                    DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [0, rec.sqlId]);
                    DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, rec.sqlId]);
                    DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [date.getTime() / 1000 + 30 * 24 * 60 * 60, rec.sqlId]);
                    rec.utils.error(`Ваш аккаунт забанен на 30 дней!`);
                } else {
                    DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [warn, rec.sqlId]);
                    DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [date.getTime() / 1000 + 15 * 24 * 60 * 60, rec.sqlId]);
                }
                rec.kick("warn");
                terminal.info(`${player.name} выдал варн ${rec.name}. (${warn}/3) Причина: ${args[1]}`);

                mp.logs.addLog(`${player.name} выдал варн ${rec.name}. (${warn}/3) Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1], warn: warn });
                mp.logs.addLog(`${rec.name} получил варн ${player.name}. (${warn}/3) Причина: ${args[1]}`, 'main', rec.account.id, rec.sqlId, { time: args[1], warn: warn });

                //mp.logs.sendToDiscord(`${player.name} выдал варн ${rec.name}. ( ${warn}/3 ) Причина: ${args[1]}`, `Social Club: ${player.socialClub}`, 22);
                mp.players.forEach((newrec) => {
                    if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> выдал ${warn} предупреждение <a style="color: ${adm_color}">${rec.name}.</a> <br/><a style="color: ${adm_color}">Причина:</a> ${args[1]}`]);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let target = result[0];
                    if (target) {
                        let warn = ++target.warn;
                        if (warn > 2) {
                            DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [0, target.id]);
                            DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, target.id]);
                            DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [date.getTime() / 1000 + 30 * 24 * 60 * 60, target.id]);
                        } else {
                            DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [target, target.id]);
                            DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [date.getTime() / 1000 + 15 * 24 * 60 * 60, target.id]);
                        }
                        terminal.info(`${player.name} выдал варн оффлайн ${target.name}. ( ${warn}/3 ) Причина: ${args[1]}`);

                        mp.logs.addLog(`${player.name} выдал варн оффлайн ${target.name}. (${warn}/3) Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1], warn: warn });
                        mp.logs.addLog(`${target.name} получил оффлайн варн ${player.name}. (${warn}/3) Причина: ${args[1]}`, 'main', target.accountId, target.id, { time: args[1], warn: warn });

                        mp.players.forEach((newrec) => {
                            if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> выдал ${warn} предупреждение <a style="color: ${adm_color}">${target.name}.</a> <br/><a style="color: ${adm_color}">Причина:</a> ${args[1]}`]);
                        });
                    }
                });
            }
        }
    },
    "unwarn": {
        description: "Снять предупреждение.",
        minLevel: 3,
        syntax: "[id/name]:s [reason]:s",
        handler: (player, args) => {
            let date = new Date();
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                if (rec.warn < 1) return terminal.error(`У данного игрока 0 варнов!`, player);
                let warn = --rec.warn;
                rec.utils.error(`${player.name} снял с вас варн! ( ${warn}/3 )`);
                rec.utils.error(`Причина: ${args[1]}`);
                if (warn > 0) {
                    DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [warn, rec.sqlId]);
                    DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, rec.sqlId]);
                } else {
                    DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [0, rec.sqlId]);
                    DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, rec.sqlId]);
                }
                terminal.info(`${player.name} снял варн ${rec.name}. ( ${warn}/3 ) Причина: ${args[1]}`);

                mp.logs.addLog(`${player.name} снял варн ${rec.name}. (${warn}/3) Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1], warn: warn });
                mp.logs.addLog(`${rec.name} был снят варн администратором ${player.name}. (${warn}/3) Причина: ${args[1]}`, 'main', rec.account.id, rec.sqlId, { time: args[1], warn: warn });

                mp.players.forEach((newrec) => {
                    if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> снял предупреждение <a style="color: ${adm_color}">${rec.name}.</a>`]);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let target = result[0];
                    if (target) {
                        if (target.warn < 1) return terminal.error(`У данного игрока 0 варнов!`, player);
                        let warn = --target.warn;
                        if (warn > 0) {
                            DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [warn, target.id]);
                            DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, target.id]);
                        } else {
                            DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [0, target.id]);
                            DB.Handle.query("UPDATE characters SET warntime=? WHERE id=?", [0, target.id]);
                        }
                        terminal.info(`${player.name} снял варн оффлайн ${target.name}. ( ${warn}/3 ) Причина: ${args[1]}`);

                        mp.logs.addLog(`${player.name} снял варн оффлайн ${target.name}. (${warn}/3) Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1], warn: warn });
                        mp.logs.addLog(`${target.name} был снят оффлайн варн администратором ${player.name}. (${warn}/3) Причина: ${args[1]}`, 'main', target.accountId, target.id, { time: args[1], warn: warn });

                        //mp.logs.sendToDiscord(`${player.name} снял варн оффлайн ${target.name}. ( ${warn}/3 ) Причина: ${args[1]}`, `Social Club: ${player.socialClub}`, 22);
                        mp.players.forEach((newrec) => {
                            if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> снял предупреждение <a style="color: ${adm_color}">${target.name}.</a>`]);
                        });
                    }
                });
            }
        }
    },
    "get_ip": {
        description: "Узнать IP адрес игрока.",
        minLevel: 3,
        syntax: "[id/name]:s",
        handler: (player, args) => {
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                terminal.info(`${player.name} проверил IP адрес ${rec.name} ( IP: ${rec.ip} ) `);
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let target = result[0];
                    if (target) terminal.info(`${player.name} проверил оффлайн IP адрес ${target.name} ( IP при последнем заходе: ${target.lastIp} | IP при регистрации: ${target.regIp} )`);
                });
            }
        }
    },
    "ban_ip": {
        description: "Забанить ip адрес.",
        minLevel: 3,
        syntax: "[ip]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM ip_ban WHERE ip=?", args[0], (e, result) => {
                if (e) {
                    callback("Ошибка выполнения запроса в БД!");
                    return terminal.error(e);
                }
                if (result.length > 0) {
                    terminal.log("IP - " + args[0] + " уже внесен в список забаненых IP адресов!", player);
                    return;
                }

                DB.Handle.query("INSERT INTO ip_ban (ip) VALUES (?)", args[0], (error, sresult) => {
                    if (error) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(error);
                    }
                    terminal.info(`${player.name} забанил IP - ${args[0]}`);
                    mp.logs.addLog(`${player.name} забанил IP - ${args[0]}`, 'main', player.account.id, player.sqlId, { ip: args[0] });

                });
            });
        }
    },
    "unban_ip": {
        description: "Разбанить ip адрес.",
        minLevel: 3,
        syntax: "[ip]:s",
        handler: (player, args) => {
            DB.Handle.query("SELECT * FROM ip_ban WHERE ip=?", args[0], (e, result) => {
                if (e) {
                    callback("Ошибка выполнения запроса в БД!");
                    return terminal.error(e);
                }
                if (result.length < 1) {
                    terminal.log("IP - " + args[0] + " не внесен в список забаненых IP адресов!", player);
                    return;
                }

                DB.Handle.query(`DELETE FROM ip_ban WHERE ip=?`, args[0], (e, results) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                });
                terminal.info(`${player.name} разбанил IP - ${args[0]}`);
                mp.logs.addLog(`${player.name} разбанил IP - ${args[0]}`, 'main', player.account.id, player.sqlId, { ip: args[0] });
            });
        }
    },
    "freeze": {
        description: "Заморозить игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [time]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] < 1) return terminal.error(`Время от 0 секунд!`, player);
            rec.isFreeze = true;
            rec.call(`admin.control.freeze`, [args[1]]);
            rec.utils.info(`${player.name} заморозил Вас на ${args[1]} секунд`);
            terminal.info(`${player.name} заморозил ${rec.name} на ${args[1]} секунд`);
        }
    },
    "gg": {
        description: "Пожелать приятной игры игроку.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            rec.utils.warning("Администрация Union RolePlay желает Вам приятной игры!");
            terminal.info(`${player.name} пожелал приятной игры ${rec.name}`);
        }
    },
    /*"set_name": {
        description: "Поменять никнейм игрока.",
        minLevel: 3,
        syntax: "[old_name]:s [new_name]:s",
        handler: (player, args) => {
          let old_name = getSpecialName(args[0], player);
          let new_name = getSpecialName(args[1], player);
          if (!old_name || !new_name) return terminal.error(`Формат: Имя_Фамилия`, player);
          DB.Handle.query("SELECT * FROM characters WHERE name=?", [old_name], (e, result) => {
              if (e) {
                  callback("Ошибка выполнения запроса в БД!");
                  return terminal.error(e);
              }
              if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
              let target = result[0];
              if (target) {
                  let rec = mp.players.getByName(name);
                  if (rec) {
                    rec.utils.error(`${player.name} изменил ваш никнейм на ${new_name}`);
                    rec.kick("changename");
                  }
                  DB.Handle.query("UPDATE characters SET name=? WHERE id=?", [new_name, target.id]);
                  terminal.info(`${player.name} изменил никнейм персонажа ${old_name} на ${new_name}`);
              }
          });
        }
    },*/
    "mute": {
        description: "Выдать мут игроку.",
        minLevel: 3,
        syntax: "[player_id]:n [time]:n [reason]:s",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] < 1 || args[1] > 5000) return terminal.error(`Мут от 1 мин. до 5000 мин.!`, player);
            if (rec.mute > 0) return terminal.error(`Игрок уже в муте!`, player);
            rec.startMute = parseInt(new Date().getTime() / 1000);
            rec.muteTimerId = timerId = setTimeout(() => {
                try {
                    rec.utils.stopMute(); // rec.utils.leaveDemorgan();
                } catch (err) {
                    console.log(err.stack);
                }
            }, (args[1] * 60) * 1000);
            rec.mute = args[1];
            rec.utils.error(`${player.name} выдал Вам мут на ${args[1]} минут.`);
            rec.utils.error(`Причина: ${args[2]}`);
            DB.Handle.query("UPDATE characters SET mute=? WHERE id=?", [args[1], rec.sqlId]);
            terminal.info(`${player.name} выдал мут ${rec.name} на ${args[1]} минут. Причина: ${args[2]}`);

            mp.logs.addLog(`${player.name} выдал мут ${rec.name} на ${args[1]} минут. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, time: args[1], reason: args[2] });
            mp.logs.addLog(`${rec.name} получил мут администратором ${player.name} на ${args[1]} минут. Причина: ${args[2]}`, 'main', rec.account.id, rec.sqlId, { time: args[1], reason: args[2] });

            mp.players.forEach((newrec) => {
                if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> заблокировал чат <a style="color: ${adm_color}">${rec.name}</a> на <a style="color: ${adm_color}">${args[1]}</a> минут. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
            });
        }
    },
    "unmute": {
        description: "Снять мут с игрока.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (rec.mute < 1) return terminal.error(`У игрока нет мута!`, player);
            rec.mute = 0;
            rec.utils.error(`${player.name} снял с Вас мут.`);
            DB.Handle.query("UPDATE characters SET mute=? WHERE id=?", [0, rec.sqlId]);
            terminal.info(`${player.name} снял мут с ${rec.name}`);

            mp.logs.addLog(`${player.name} снял мут с ${rec.name}`, 'main', player.account.id, player.sqlId, { level: player.admin });
            mp.logs.addLog(`${rec.name} снят мут администратором ${player.name}`, 'main', rec.account.id, rec.sqlId, { });

            mp.players.forEach((newrec) => {
                if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> разблокировал чат <a style="color: ${adm_color}">${rec.name}.</a>`]);
            });
        }
    },
    "mute_voice": {
        description: "Выдать voice-мут игроку.",
        minLevel: 3,
        syntax: "[player_id]:n [time]:n [reason]:s",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] < 1 || args[1] > 5000) return terminal.error(`Voice-мут от 1 мин. до 5000 мин.!`, player);
            if (rec.vmute > 0) return terminal.error(`Игрок уже в voice-муте!`, player);
            rec.startVoiceMute = parseInt(new Date().getTime() / 1000);
            rec.muteVoiceTimerId = timerId = setTimeout(() => {
                try {
                    rec.utils.stopVoiceMute(); // rec.utils.leaveDemorgan();
                } catch (err) {
                    console.log(err.stack);
                }
            }, (args[1] * 60) * 1000);
            rec.vmute = args[1];
            rec.utils.error(`${player.name} выдал Вам мут микрофона на ${args[1]} минут.`);
            rec.utils.error(`Причина: ${args[2]}`);
            rec.call("control.voice.chat", [true]);
            DB.Handle.query("UPDATE characters SET vmute=? WHERE id=?", [args[1], rec.sqlId]);
            terminal.info(`${player.name} выдал voice-мут ${rec.name} на ${args[1]} минут. Причина: ${args[2]}`);

            mp.logs.addLog(`${player.name} выдал voice-мут ${rec.name} на ${args[1]} минут. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, time: args[1], reason: args[2] });
            mp.logs.addLog(`${rec.name} выдан voice-мут администраоором ${player.name} на ${args[1]} минут. Причина: ${args[2]}`, 'main', rec.account.id, rec.sqlId, { time: args[1], reason: args[2] });

            mp.players.forEach((newrec) => {
                if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> заблокировал микрофон <a style="color: ${adm_color}">${rec.name}</a> на <a style="color: ${adm_color}">${args[1]}</a> минут. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
            });
        }
    },
    "unmute_voice": {
        description: "Снять voice-мут с игрока.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (rec.vmute < 1) return terminal.error(`У игрока нет voice-мута!`, player);
            rec.vmute = 0;
            rec.utils.error(`${player.name} снял с Вас мут микрофона.`);
            rec.call("control.voice.chat", [false]);
            DB.Handle.query("UPDATE characters SET vmute=? WHERE id=?", [0, rec.sqlId]);
            terminal.info(`${player.name} снял мут микрофона с ${rec.name}`);

            mp.logs.addLog(`${player.name} снял мут микрофона с ${rec.name}`, 'main', player.account.id, player.sqlId, { level: player.admin });
            mp.logs.addLog(`${rec.name} снят мут микрофона администратором ${player.name}`, 'main', rec.account.id, rec.sqlId, {  });

            mp.players.forEach((newrec) => {
                if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> разблокировал микрофон <a style="color: ${adm_color}">${rec.name}.</a>`]);
            });
        }
    },
    "invis": {
        description: "Сделать игрока видимым/невидимым.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (rec.getVariable("ainvis")) {
                rec.setVariable("ainvis", null);
                // rec.call("admin.set.invisible", [true]);
                rec.alpha = 255;
                player.utils.error(`Вы сделали ${rec.name} видимым`);
                rec.utils.error(`${player.name} сделал Вас видимым`);
            } else {
                rec.setVariable("ainvis", true);
                // rec.call("admin.set.invisible", [false]);
                rec.alpha = 0;
                player.utils.error(`Вы сделали ${rec.name} невидимым`);
                rec.utils.error(`${player.name} сделал Вас невидимым`);
            }
        }
    },
    "ban_char": {
        description: "Выдать бан персонажу",
        minLevel: 3,
        syntax: "[id/name]:s [days]:n [reason]:s",
        handler: (player, args) => {
            if (args[1] < 1 || args[1] > 5000) return terminal.error(`Бан от 1 дня до 5000 дней!`, player);
            if (getPlayerStatus(args[0]) === "on") {
                let rec = mp.players.at(args[0]);
                if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
                let date = new Date();
                DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [date.getTime() / 1000 + args[1] * 24 * 60 * 60, rec.sqlId]);
                rec.utils.error(`${player.name} забанил Вас`);
                rec.utils.error(`Причина: ${args[2]}`);
                rec.kick(args[2]);
                terminal.info(`${player.name} забанил персонажа ${rec.name} на ${args[1]} дней. Причина: ${args[2]}`);

                // mp.logs.addLog(`${player.name} забанил персонажа ${rec.name} на ${args[1]} дней. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, days: args[1], reason: args[2] });
                // mp.logs.addLog(`${rec.name} забанен по персонажу администратором ${player.name} на ${args[1]} дней. Причина: ${args[2]}`, 'main', rec.account.id, rec.sqlId, { days: args[1], reason: args[2] });

                mp.players.forEach((newrec) => {
                    if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> забанил <a style="color: ${adm_color}">${rec.name}</a> на <a style="color: ${adm_color}">${args[1]}</a> дней. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
                });
            } else {
                let name = getSpecialName(args[0], player);
                if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
                DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                    if (e) {
                        callback("Ошибка выполнения запроса в БД!");
                        return terminal.error(e);
                    }
                    if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                    let target = result[0];
                    if (target) {
                        let date = new Date();
                        DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [date.getTime() / 1000 + args[1] * 24 * 60 * 60, target.id]);
                        terminal.info(`${player.name} забанил персонажа оффлайн ${target.name} на ${args[1]} дней. Причина: ${args[2]}`);

                        //mp.logs.addLog(`${player.name} забанил оффлайн персонажа ${rec.name} на ${args[1]} дней. Причина: ${args[2]}`, 'main', player.account.id, player.sqlId, { level: player.admin, days: args[1], reason: args[2] });
                        //mp.logs.addLog(`${target.name} забанен по оффлайн персонажу администратором ${player.name} на ${args[1]} дней. Причина: ${args[2]}`, 'main', target.accountId, target.id, { days: args[1], reason: args[2] });

                        mp.players.forEach((newrec) => {
                            if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> забанил <a style="color: ${adm_color}">${target.name}</a> на <a style="color: ${adm_color}">${args[1]}</a> дней. <br/><a style="color: ${adm_color}">Причина:</a> ${args[2]}`]);
                        });
                    }
                });
            }
        }
    },
    "unban_char": {
        description: "Разбанить персонажа",
        minLevel: 3,
        syntax: "[name]:s [reason]:s",
        handler: (player, args) => {
            let name = getSpecialName(args[0], player);
            if (!name) return terminal.error(`Формат: Имя_Фамилия`, player);
            DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
                if (e) {
                    callback("Ошибка выполнения запроса в БД!");
                    return terminal.error(e);
                }
                if (result.length < 1) return terminal.error(`Игрок с именем: ${args[0]} не найден!`, player);
                let target = result[0];
                if (target) {
                    if (target.ban === 0) return terminal.error(`Данный игрок не забанен!`, player);
                    DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [0, target.id]);
                    terminal.info(`${player.name} разбанил персонажа ${target.name}. Причина: ${args[1]}`);

                    mp.logs.addLog(`${player.name} разбанил персонажа ${target.name}. Причина: ${args[1]}`, 'main', player.account.id, player.sqlId, { level: player.admin, reason: args[1] });
                    mp.logs.addLog(`${target.name} разбанен по персонажу администратором ${player.name}. Причина: ${args[1]}`, 'main', target.accountId, target.id, { reason: args[1] });

                    mp.players.forEach((newrec) => {
                        if (newrec.sqlId) newrec.call("chat.custom.push", [`<a style="color: ${adm_color}">[A] ${player.name}</a> разбанил <a style="color: ${adm_color}">${target.name}.</a>`]);
                    });
                }
            });
        }
    },
    "unfreeze": {
        description: "Разморозить игрока.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (!rec.isFreeze) return terminal.error(`Данный игрок не заморожен!`, player);
            delete rec.isFreeze;
            rec.call(`admin.control.freeze`, [0]);
            rec.utils.info(`${player.name} разморозил Вас`);
            terminal.info(`${player.name} разморозил ${rec.name}`);
        }
    },
    "freeze_radius": {
        description: "Заморозить игроков в радиусе.",
        minLevel: 3,
        syntax: "[radius]:n [time]:n",
        handler: (player, args) => {
            let dist = args[0];
            if (dist < 1 || dist > 20000) return terminal.error(`Дистанция от 1 до 20000!`, player);
            if (args[1] < 1) return terminal.error(`Время от 0 секунд!`, player);
            mp.players.forEachInRange(player.position, dist,
                (rec) => {
                    rec.isFreeze = true;
                    rec.call(`admin.control.freeze`, [args[1]]);
                    rec.utils.info(`${player.name} заморозил Вас на ${args[1]} секунд`);
                }
            );
            terminal.info(`${player.name} заморозил всех игроков в радиусе ( ${dist}м. )`);
        }
    },
    "unfreeze_radius": {
        description: "Разморозить игроков в радиусе.",
        minLevel: 3,
        syntax: "[radius]:n",
        handler: (player, args) => {
            let dist = args[0];
            if (dist < 1 || dist > 20000) return terminal.error(`Дистанция от 1 до 20000!`, player);
            mp.players.forEachInRange(player.position, dist,
                (rec) => {
                    if (rec.isFreeze) {
                        delete rec.isFreeze;
                        rec.call(`admin.control.freeze`, [0]);
                        rec.utils.info(`${player.name} разморозил Вас`);
                    }
                }
            );
            terminal.info(`${player.name} разморозил всех игроков в радиусе ( ${dist}м. )`);
        }
    },
    "aspawn": {
        description: "Заспавнить игрока на возможных спавнах.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            let spawnOpen = require("./events/CharacterEvents.js");
            if (spawnOpen.SpawnInfo.user_spawn.length < 1) return terminal.error(`На сервере отсутствуют спавны!`, player);
            let spawn = spawnOpen.SpawnInfo.user_spawn[getRandom(0, spawnOpen.SpawnInfo.user_spawn.length)];

            terminal.info(`${player.name} зареспавнил ${rec.name}`);
            rec.position = new mp.Vector3(spawn.x, spawn.y, spawn.z);
            rec.heading = spawn.h;
            rec.dimension = 0;
            rec.utils.info(`${player.name} зареспавнил вас`);
        }
    },
    "bone_index": {
        description: "Получить индекс кости по названию.",
        minLevel: 5,
        syntax: "[bone]:s",
        handler: (player, args) => {
            player.call("admin.get.boneindex", [args[0]]);
        }
    },

    "fuel": {
        description: "Изменить количество топлива в машине.",
        minLevel: 3,
        syntax: "[fuel]:n",
        handler: (player, args) => {
            if (!player.vehicle) return terminal.error("Вы не в машине!", player);
            var veh = player.vehicle;
            if (!veh.maxFuel) veh.maxFuel = 70;
            if (veh.maxFuel < args[0]) return terminal.error(`Вместимость бака: ${veh.maxFuel} л.`, player);

            veh.utils.setFuel(args[0]);
            player.call("setVehicleVar", [veh, "fuel", args[0]]);

            terminal.info(`${player.name} заправил авто с ID: ${veh.id} на ${args[0]} л.`);
        }
    },

    "settime": {
        description: "Изменить время на сервере.",
        minLevel: 5,
        syntax: "[hours]:n",
        handler: (player, args) => {
            mp.world.time.hour = parseInt(args[0]);
            terminal.info(`${player.name} изменил время на сервере на ${args[0]} ч.`);
        }
    },

    "alock": {
        description: 'Открыть/закрыть машины в радиусе 5 м.',
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            var count = 0;
            mp.vehicles.forEachInRange(player.position, 5, (veh) => {
                veh.locked = !veh.locked;
                count++;
            });
            if (count == 0) return terminal.error(`Нет машин поблизости!`, player);
            terminal.info(`Машин открыто/закрыто: ${count} шт.`, player);
        }
    },

    "animator": {
        description: 'Вкл/Выкл режим проигрывания анимаций.',
        minLevel: 2,
        syntax: "",
        handler: (player) => {
            player.call("animator");
            terminal.info(`Режим проигрывания анимаций Вкл/Выкл!`, player);
        }
    },

    "anim": {
        description: 'Проиграть определенную анимацию.',
        minLevel: 2,
        syntax: "[animDict]:s [animName]:s",
        handler: (player, args) => {
            mp.events.call("anim", player, args[0], args[1]);
        }
    },

    "tp_interior": {
        description: "Телепортироваться в интерьер.",
        minLevel: 3,
        syntax: "[ид_интерьера]:n",
        handler: (player, args) => {
            var interior = mp.interiors.getBySqlId(args[0]);
            if (!interior) return terminal.error(`Интерьер с ID: ${args[0]} не найден!`, player);
            player.position = new mp.Vector3(interior.x, interior.y, interior.z);
            player.heading = interior.h;

            terminal.info(`Вы телепортировались в интерьер с ID: ${args[0]}`, player);
        }
    },

    "tp_garage": {
        description: "Телепортироваться в гараж.",
        minLevel: 3,
        syntax: "[ид_гаража]:n",
        handler: (player, args) => {
            var garage = mp.garages.getBySqlId(args[0]);
            if (!garage) return terminal.error(`Гараж с ID: ${args[0]} не найден!`, player);
            player.position = new mp.Vector3(garage.x, garage.y, garage.z);
            player.heading = garage.h;

            terminal.info(`Вы телепортировались в гараж с ID: ${args[0]}`, player);
        }
    },

    "tp_vehicle": {
        description: "Телепортироваться к авто.",
        minLevel: 3,
        syntax: "[vehicle_id]:n",
        handler: (player, args) => {
            var veh = mp.vehicles.at(args[0]);
            if (!veh) return terminal.error(`Авто с ID: ${args[0]} не найдено!`, player);
            var pos = veh.position;
            player.position = new mp.Vector3(pos.x, pos.y, pos.z + 1);
            player.heading = veh.rotation.z;

            terminal.info(`Вы телепортировались к авто с ID: ${args[0]}`, player);
        }
    },

    "tp_object": {
        description: "Телепортироваться к объекту.",
        minLevel: 3,
        syntax: "[object_id]:n",
        handler: (player, args) => {
            return terminal.warning(`Ожидаем фикс...`, player);
            var obj = mp.objects.at(args[0]);
            if (!obj) return terminal.error(`Объект с ID: ${args[0]} не найден!`, player);
            var pos = obj.position;
            player.position = new mp.Vector3(pos.x, pos.y, pos.z + 1);
            player.heading = obj.rotation.z;

            terminal.info(`Вы телепортировались к объекту с ID: ${args[0]}`, player);
        }
    },

    "economy_list": {
        description: "Просмотреть экономику сервера.",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            var text = "Экономика сервера:<br/>";
            for (var key in mp.economy) {
                var item = mp.economy[key];
                text += `${key} = ${item.value} (${item.description})<br/>`;
            }
            terminal.log(text, player);
        }
    },

    "set_economy": {
        description: "Изменить экономику сервера. (просмотр всех переменных - economy_list)",
        minLevel: 5,
        syntax: "[имя]:s [значение]:n",
        handler: (player, args) => {
            if (!mp.economy[args[0]]) return terminal.error(`Переменная ${args[0]} не найдена!`, player);

            mp.economy[args[0]].setValue(args[1]);
            terminal.info(`${player.name} изменил переменную ${args[0]}=${args[1]} (экономика сервера)`);
            mp.logs.addLog(`${player.name} изменил переменную ${args[0]}=${args[1]} (экономика сервера)`, 'main', player.account.id, player.sqlId, { level: player.admin, old: args[0], new: args[1] });
        }
    },

    "request_ipl": {
        description: "Загрузить IPL. (для дополнительных интерьеров и локаций)",
        minLevel: 9,
        syntax: "[iplName]:s",
        handler: (player, args) => {
            // player.call("requestIpl", [args[0]]);
            DB.Handle.query("INSERT INTO ipls (name, request) VALUES (?, 1) ON DUPLICATE KEY UPDATE request=1", [args[0]], (e) => {
                if (e) {
                    console.log(`Request ipl ${e}`);
                    terminal.error(`IPL: ${args[0]} не загружен. Ошибка`)
                    return;
                }

                mp.world.requestIpl(args[0]);
                terminal.info(`IPL: ${args[0]} загружен!`, player);
            });
        }
    },

    "remove_ipl": {
        description: "Выгрузить IPL. (для дополнительных интерьеров и локаций)",
        minLevel: 9,
        syntax: "[iplName]:s",
        handler: (player, args) => {
            // player.call("removeIpl", [args[0]]);
            DB.Handle.query("INSERT INTO ipls (name, request) VALUES (?, 0) ON DUPLICATE KEY UPDATE request=0", [args[0]], (e) => {
                if (e) {
                    console.log(`Remove ipl ${e}`);
                    terminal.error(`IPL: ${args[0]} не выгружен. Ошибка`)
                    return;
                }

                mp.world.removeIpl(args[0]);
                terminal.info(`IPL: ${args[0]} выгружен!`, player);
            });
        }
    },

    "give_money": {
        description: "Выдать деньги игроку.",
        minLevel: 9,
        syntax: "[playerId]:n [money]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] < 1) args[1] = 1;

            if (rec.sqlId) rec.utils.setMoney(rec.money + args[1]);
            rec.utils.info(`${player.name} выдал Вам ${args[1]}$`);
            terminal.info(`${player.name} выдал ${args[1]}$ игроку ${rec.name}`);
            mp.logs.addLog(`${player.name} выдал ${args[1]}$ игроку ${rec.name}`, 'main', player.account.id, player.sqlId, { level: player.admin, money: args[1] });
            mp.logs.addLog(`${rec.name} получил ${args[1]}$ от администратора ${player.name}`, 'main', rec.account.id, rec.sqlId, { money: args[1] });
        }
    },

    "give_donate": {
        description: "Выдать донат игроку.",
        minLevel: 9,
        syntax: "[playerId]:n [donateMoney]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] < 1) args[1] = 1;

            if (rec.sqlId) rec.utils.setDonate(rec.account.donate + args[1]);
            rec.utils.info(`${player.name} выдал Вам ${args[1]} V/C`);
            terminal.info(`${player.name} выдал ${args[1]} V/C игроку ${rec.name}.`);
            mp.logs.addLog(`${player.name} выдал ${args[1]} V/C игроку ${rec.name}`, 'main', player.account.id, player.sqlId, { level: player.admin, donate: args[1] });
            mp.logs.addLog(`${rec.name} получил ${args[1]} V/C от администратора ${player.name}`, 'main', rec.account.id, rec.sqlId, { donate: args[1] });
        }
    },

    "takeaway_money": {
        description: "Отнять деньги у игрока.",
        minLevel: 5,
        syntax: "[playerId]:n [money]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (args[1] > rec.money) args[1] = rec.money;

            rec.utils.setMoney(rec.money - args[1]);
            rec.utils.info(`${player.name} отнял у Вас ${args[1]}$`);
            terminal.info(`${player.name} отнял ${args[1]}$ у игрока ${rec.name}`);

            mp.logs.addLog(`${player.name} отнял ${args[1]}$ у игрока ${rec.name}`, 'main', player.account.id, player.sqlId, { level: player.admin, money: args[1] });
            mp.logs.addLog(`${rec.name} отнял ${args[1]}$ от администратора ${player.name}`, 'main', rec.account.id, rec.sqlId, { money: args[1] });
        }
    },

    "set_faction": {
        description: "Изменить организацию игрока. (0 - уволить)",
        minLevel: 5,
        syntax: "[playerId]:n [factionId]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            for (var i = 0; i < mp.factions.length; i++) {
                var f = mp.factions[i];
                if (f.leader && f.leader == rec.sqlId) {
                    f.leader = 0;
                    f.leaderName = "";
                    DB.Handle.query("UPDATE factions SET leader=?,leaderName=? WHERE id=?", [0, "", f.sqlId]);
                }
            }

            if (args[1] == 0) {
                if (!rec.faction) return terminal.error(`Игрок не состоит в организации!`, player);
                rec.utils.setFaction(0);
                rec.utils.info(`${player.name} уволил Вас из организации`);
                return terminal.info(`${player.name} уволил игрока ${rec.name} из организации`);
            }
            var faction = mp.factions.getBySqlId(args[1]);
            if (!faction) return terminal.error(`Организация с ID: ${args[1]} не найдена!`);

            rec.utils.setFaction(faction.sqlId);
            rec.utils.info(`${player.name} принял Вас в ${faction.name}`);
            terminal.info(`${player.name} принял игрока ${rec.name} в организацию ${faction.name}`);
            //mp.logs.sendToDiscord(`${player.name} принял игрока ${rec.name} в организацию ${faction.name}`, `Social Club: ${player.socialClub}`, 20);

        }
    },

    "set_dimension": {
        description: "Сменить измерение.",
        minLevel: 3,
        syntax: "[dimension]:n",
        handler: (player, args) => {
            player.dimension = args[0];
            terminal.info(`Вы сменили измерение на ${args[0]}!`);
        }
    },

    "makeadmin": {
        description: "Назначить игрока администратором.",
        minLevel: 6,
        syntax: "[player_id]:n [admin_level]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);
            if (player.admin < args[1]) return terminal.error(`Макс. уровень для выдачи - ${player.admin}!`, player);
            if (rec.admin > player.admin) return terminal.error(`${rec.name} имеет более высокий уровень администратора!`, player);

            rec.utils.setAdmin(args[1]);
            terminal.info(`${player.name} назначил администратором ${rec.name}`);
            rec.utils.success(`${player.name} назначил Вас администратором!`);
            //mp.logs.sendToDiscord(`${player.name} назначил администратором ${rec.name}`, `Social Club: ${player.socialClub}`, 20);
        }
    },

    "godmode": {
        description: "Режим бессмертия для игрока.",
        minLevel: 3,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            rec.isGodmode = !rec.isGodmode;
            rec.utils.setLocalVar("godmode", rec.isGodmode);
            if (rec.isGodmode) {
                rec.utils.info(`${player.name} сделал Вас бессмертным`);
                //terminal.info(`${player.name} сделал бессмертным ${rec.name}`);
            } else {
                rec.utils.info(`${player.name} выключил бессмертие Вас`);
                //terminal.info(`${player.name} выключил бессмертие ${rec.name}`);
            }
        }
    },

    "weapon": {
        description: "Выдать временное оружие игроку.",
        minLevel: 3,
        syntax: "[player_id]:n [model]:s [ammo]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            rec.giveWeapon(mp.joaat(args[1]), parseInt(args[2]));
            rec.utils.info(`${player.name} выдал Вам оружие`);
            terminal.info(`${player.name} выдал оружие ${args[1]} ${args[2]}`);
            //mp.logs.sendToDiscord(`${player.name} выдал оружие ${args[1]} ${args[2]}`, `Social Club: ${player.socialClub}`, 20);
        }
    },

    "spawncars": {
        description: "Заспавнить свободные авто на сервере.",
        minLevel: 4,
        syntax: "",
        handler: (player, args) => {
            terminal.log(`Свободная техника будет заспавнена через ${Config.spawnCarsWaitTime/1000} сек.`);
            setTimeout(function() {
                var startTime = new Date().getTime();
                var spawnCount = 0,
                    destroyCount = 0;;
                try {
                    mp.vehicles.forEach((vehicle) => {
                        var result = vehicle.utils.spawn();
                        if (result == 0) spawnCount++;
                        else if (result == 2) destroyCount++;
                    });
                    var ms = new Date().getTime() - startTime;
                    terminal.info(`${player.name} заспавнил свободную технику<br/>Авто на сервере: ${mp.vehicles.length}<br/>Заспавнено: ${spawnCount}<br/>Удалено: ${destroyCount}<br/>Время: ${ms} ms`);
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },

    "spawn_faction_cars": {
        description: "Заспавнить свободные авто организации на сервере.",
        minLevel: 4,
        syntax: "[faction_id]:n",
        handler: (player, args) => {
            var faction = mp.factions.getBySqlId(args[0]);
            if (!faction) return terminal.error(`Организация с ID: ${args[0]} не найдена!`, player);
            terminal.log(`Свободная техника ${faction.name} будет заспавнена через ${Config.spawnCarsWaitTime/1000} сек.`);
            setTimeout(function() {
                var startTime = new Date().getTime();
                var spawnCount = 0,
                    destroyCount = 0;
                try {
                    mp.vehicles.forEach((vehicle) => {
                        if (vehicle.owner == faction.sqlId) {
                            var result = vehicle.utils.spawn();
                            if (result == 0) spawnCount++;
                            else if (result == 2) destroyCount++;
                        }
                    });
                    var ms = new Date().getTime() - startTime;
                    terminal.info(`${player.name} заспавнил свободную технику ${faction.name}<br/>Авто на сервере: ${mp.vehicles.length}<br/>Заспавнено: ${spawnCount}<br/>Удалено: ${destroyCount}<br/>Время: ${ms} ms`);
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },

    "spawn_job_cars": {
        description: "Заспавнить свободные рабочие авто на сервере.",
        minLevel: 4,
        syntax: "[job_id]:n",
        handler: (player, args) => {
            var job = mp.jobs.getBySqlId(args[0]);
            if (!job) return terminal.error(`Работа с ID: ${args[0]} не найдена!`, player);
            terminal.log(`Свободная техника работы ${job.name} будет заспавнена через ${Config.spawnCarsWaitTime/1000} сек.`);
            setTimeout(function() {
                var startTime = new Date().getTime();
                var spawnCount = 0,
                    destroyCount = 0;
                try {
                    mp.vehicles.forEach((vehicle) => {
                        if (vehicle.owner == -job.sqlId) {
                            var result = vehicle.utils.spawn();
                            if (result == 0) spawnCount++;
                            else if (result == 2) destroyCount++;
                        }
                    });
                    var ms = new Date().getTime() - startTime;
                    terminal.info(`${player.name} заспавнил свободную технику работы ${job.name}<br/>Авто на сервере: ${mp.vehicles.length}<br/>Заспавнено: ${spawnCount}<br/>Удалено: ${destroyCount}<br/>Время: ${ms} ms`);
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },

    "spawn_range_cars": {
        description: "Заспавнить свободные авто в радиусе.",
        minLevel: 4,
        syntax: "[range]:n",
        handler: (player, args) => {
            args[0] = Math.clamp(args[0], 10, 500);
            terminal.log(`Свободная техника в радиусе ${args[0]} м. будет заспавнена через ${Config.spawnCarsWaitTime/1000} сек.`);
            setTimeout(function() {
                var startTime = new Date().getTime();
                var spawnCount = 0,
                    destroyCount = 0;
                try {
                    mp.vehicles.forEachInRange(player.position, args[0], (vehicle) => {
                            var result = vehicle.utils.spawn();
                            if (result == 0) spawnCount++;
                            else if (result == 2) destroyCount++;
                    });
                    var ms = new Date().getTime() - startTime;
                    terminal.info(`${player.name} заспавнил свободную технику в радиусе ${args[0]} м.<br/>Авто на сервере: ${mp.vehicles.length}<br/>Заспавнено: ${spawnCount}<br/>Удалено: ${destroyCount}<br/>Время: ${ms} ms`);
                } catch (err) {
                    terminal.log(err.stack);
                }
            }, Config.spawnCarsWaitTime);
        }
    },

    "save_obj": {
        description: "Сохранить объект в БД (берется из /obj).",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            return terminal.warning(`Ожидаем фикс...`, player);
            if (!player.debugObj) return terminal.error(`Объект не найден! Создайте с помощью /obj.`, player);
            var obj = player.debugObj;
            mp.objects.save(obj.name, obj.position, obj.rotation.z);
            terminal.info(`${player.name} сохранил объект ${obj.name} в БД`);
        }
    },

    "add_rent_veh": {
        description: "Добавить/обновить арендованное авто.",
        minLevel: 5,
        syntax: "[цвет1]:n [цвет2]:n",
        handler: (player, args) => {
            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);
            if (args[0] < 0 || args[1] < 0) return terminal.error(`Цвет не может быть меньше 0!`, player);
            if (newVehicle.sqlId) {
                if (mp.isOwnerVehicle(newVehicle)) return player.utils.error(`Это личное авто!`);
                DB.Handle.query("UPDATE vehicles SET owner=?,model=?,color1=?,color2=?,x=?,y=?,z=?,h=?,license=? WHERE id=?",
                    [-4001, newVehicle.name, args[0], args[1],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z, newVehicle.rotation.z, 0, newVehicle.sqlId
                    ], (e) => {
                        terminal.info(`${player.name} обновил авто для аренды`, player);
                    });
            } else {
                DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h,license) VALUES (?,?,?,?,?,?,?,?,?)",
                    [-4001, newVehicle.name, args[0], args[1],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z,
                        newVehicle.rotation.z, 0
                    ], (e, result) => {
                        newVehicle.sqlId = result.insertId;
                        terminal.info(`${player.name} добавил авто для аренды`);
                    });
            }

            newVehicle.owner = -4001;
            newVehicle.spawnPos = newVehicle.position;
        }
    },

    "add_job_veh": {
        description: "Добавить/обновить рабочее авто (цвет2 нужно указывать, пока не будет фикс RAGEMP).",
        minLevel: 5,
        syntax: "[ид_работы]:n [цвет2]:n",
        handler: (player, args) => {
            var job = mp.jobs.getBySqlId(args[0]);
            if (!job) return terminal.error(`Работа с ID: ${args[0]} не найдена!`, player);

            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);
            args[0] *= -1;

            if (newVehicle.sqlId) {
                if (mp.isOwnerVehicle(newVehicle)) return player.utils.error(`Это личное авто!`);
                DB.Handle.query("UPDATE vehicles SET owner=?,model=?,color1=?,color2=?,x=?,y=?,z=?,h=? WHERE id=?",
                    [args[0], newVehicle.name, newVehicle.getColor(0), args[1],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z, newVehicle.rotation.z, newVehicle.sqlId
                    ], (e) => {
                        terminal.info(`${player.name} обновил рабочее авто для ${job.name}`, player);
                    });
            } else {
                DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h) VALUES (?,?,?,?,?,?,?,?)",
                    [args[0], newVehicle.name, newVehicle.getColor(0), newVehicle.getColor(1),
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z,
                        newVehicle.rotation.z
                    ], (e, result) => {
                        newVehicle.sqlId = result.insertId;
                        terminal.info(`${player.name} добавил рабочее авто для ${job.name}`);
                    });
            }

            newVehicle.owner = args[0];
            newVehicle.spawnPos = newVehicle.position;
        }
    },

    "add_autosaloon_veh": {
        description: "Добавить автомобиль для автосалона. Тип: 1 - мото, 2 - авто",
        minLevel: 9,
        syntax: "[title]:s [type]:n [price]:n [max]:n",
        handler: (player, args) => {
            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);
            DB.Handle.query("INSERT INTO configvehicle (model, brend, title, fuelTank, fuelRate, price, max) VALUES (?,?,?,?,?,?,?)",
                [newVehicle.name, 888, args[1], args[0], 50, 10, args[2], args[3]], (e, result) => {
                    mp.autosaloons.vehicles.push({
                        sqlId: mp.autosaloons.vehicles.length + 1,
                        modelHash: 888,
                        model: newVehicle.name,
                        brend: args[1],
                        title: args[0],
                        fuelTank: 50,
                        fuelRate: 10,
                        price: args[2],
                        max: args[3],
                        buyed: 0
                    });

                    newVehicle.destroy();

                    terminal.info(`${player.name} добавил транспорт ${newVehicle.name} в автосалон. ID: ${result.insertId}`);
                });
        }
    },

    "delete_autosaloon_veh": {
        description: "Удалить автомобиль для автосалона.",
        minLevel: 9,
        syntax: "[id]:n",
        handler: (player, args) => {
            DB.Handle.query(`DELETE FROM configvehicle WHERE id = ?`, [args[0]], (e, result) => {
                if (result.length === 0) return player.utils.error(`Данный транспорт в автосалоне не найден`);
                terminal.info(`${player.name} удалил транспорт ${newVehicle.name} автосалона. ID: ${result.insertId}`);
            });
        }
    },

    "add_newbie_veh": {
        description: "Добавить/обновить авто для новичков (цвет2 нужно указывать, пока не будет фикс RAGEMP).",
        minLevel: 5,
        syntax: "[цвет2]:n",
        handler: (player, args) => {
            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);

            if (newVehicle.sqlId) {
                if (mp.isOwnerVehicle(newVehicle)) return player.utils.error(`Это личное авто!`);
                DB.Handle.query("UPDATE vehicles SET owner=?,model=?,color1=?,color2=?,x=?,y=?,z=?,h=? WHERE id=?",
                    [-1001, newVehicle.name, newVehicle.getColor(0), args[0],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z, newVehicle.rotation.z, newVehicle.sqlId
                    ], (e) => {
                        terminal.info(`${player.name} обновил авто для новичков`, player);
                    });
            } else {
                DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h) VALUES (?,?,?,?,?,?,?,?)",
                    [-1001, newVehicle.name, newVehicle.getColor(0), newVehicle.getColor(1),
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z,
                        newVehicle.rotation.z
                    ], (e, result) => {
                        newVehicle.sqlId = result.insertId;
                        terminal.info(`${player.name} добавил авто для новичков`);
                    });
            }

            newVehicle.owner = -1001;
            newVehicle.spawnPos = newVehicle.position;
        }
    },

    "add_lic_veh": {
        description: "Добавить/обновить авто для автошколы (цвет2 нужно указывать, пока не будет фикс RAGEMP).",
        minLevel: 5,
        syntax: "[цвет2]:n",
        handler: (player, args) => {
            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);

            if (newVehicle.sqlId) {
                if (mp.isOwnerVehicle(newVehicle)) return player.utils.error(`Это личное авто!`);
                DB.Handle.query("UPDATE vehicles SET owner=?,model=?,color1=?,color2=?,x=?,y=?,z=?,h=? WHERE id=?",
                    [-2001, newVehicle.name, newVehicle.getColor(0), args[0],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z, newVehicle.rotation.z, newVehicle.sqlId
                    ], (e) => {
                        terminal.info(`${player.name} обновил авто для автошколы`, player);
                    });
            } else {
                DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h) VALUES (?,?,?,?,?,?,?,?)",
                    [-2001, newVehicle.name, newVehicle.getColor(0), newVehicle.getColor(1),
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z,
                        newVehicle.rotation.z
                    ], (e, result) => {
                        newVehicle.sqlId = result.insertId;
                        terminal.info(`${player.name} добавил авто для автошколы`);
                    });
            }

            newVehicle.owner = -2001;
            newVehicle.spawnPos = newVehicle.position;
        }
    },

    "add_farm_veh": {
        description: "Добавить/обновить авто для фермы (цвет2 нужно указывать, пока не будет фикс RAGEMP).",
        minLevel: 5,
        syntax: "[цвет2]:n",
        handler: (player, args) => {
            var newVehicle = player.vehicle;
            if (!newVehicle) return terminal.error(`Вы не в машине!`, player);

            if (newVehicle.sqlId) {
                if (mp.isOwnerVehicle(newVehicle)) return player.utils.error(`Это личное авто!`);
                DB.Handle.query("UPDATE vehicles SET owner=?,model=?,color1=?,color2=?,x=?,y=?,z=?,h=? WHERE id=?",
                    [-3001, newVehicle.name, newVehicle.getColor(0), args[0],
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z, newVehicle.rotation.z, newVehicle.sqlId
                    ], (e) => {
                        terminal.info(`${player.name} обновил авто для фермы`, player);
                    });
            } else {
                DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h) VALUES (?,?,?,?,?,?,?,?)",
                    [-3001, newVehicle.name, newVehicle.getColor(0), newVehicle.getColor(1),
                        newVehicle.position.x, newVehicle.position.y, newVehicle.position.z,
                        newVehicle.rotation.z
                    ], (e, result) => {
                        newVehicle.sqlId = result.insertId;
                        terminal.info(`${player.name} добавил авто для фермы`);
                    });
            }

            newVehicle.owner = -3001;
            newVehicle.spawnPos = newVehicle.position;
        }
    },

    "restart": {
        description: "Рестарт сервера (только для linux).",
        minLevel: 5,
        syntax: "",
        handler: (player, args) => {
            terminal.info(`${player.name} запустил рестарт сервера через ${Config.restartWaitTime / 1000} сек.`);
            //mp.logs.sendToDiscord(`${player.name} запустил рестарт сервера через ${Config.restartWaitTime / 1000} сек.`, `Social Club: ${player.socialClub}`, 20);
            mp.players.forEach((rec) => {
                if (rec.sqlId) {
                    rec.utils.info(`${player.name} запустил рестарт сервера через 10 секунд...`);
                    savePlayerDBParams(rec);
                    saveFarmFieldsDBParams();
                }
            });
            setTimeout(() => {
                process.exit();
            }, Config.restartWaitTime);
        }
    },

    "update": {
        description: "Обновить мод до последней версии.",
        minLevel: 5,
        syntax: "[branch]:s",
        handler: (player, args) => {
            // var branches = ["master", "testing", "feature/console"];
            // if (!branches.includes(args[0])) return terminal.error(`Неверная ветка! (${branches})`);
            terminal.info(`${player.name} обновляет сервер...`);
            var exec = require("exec");
            exec(`cd ${__dirname} && git clean -d -f && git stash && git checkout ${args[0]} && git pull`, (error, stdout, stderr) => {
                if (error) console.log(stderr);
                console.log(stdout);
                terminal.log(`Последняя версия мода обновлена! Необходим рестарт.`);

                mp.players.forEach((rec) => {
                    if (rec.sqlId) {
                        rec.utils.success(`${player.name} обновил версию мода! (${args[0]})`);
                    }
                });
            });
        }
    },

    "jobs_list": {
        description: "Посмотреть список работ.",
        minLevel: 5,
        syntax: "",
        handler: (player) => {
            var text = "";
            for (var i = 0; i < mp.jobs.length; i++) {
                var job = mp.jobs[i];
                text += `${job.sqlId}) ${job.name} (${job.level} lvl)<br/>`;
            }

            terminal.log(text, player);
        }
    },

    "set_job_name": {
        description: "Изменить название работы.",
        minLevel: 5,
        syntax: "[job_id]:n [name]:s",
        handler: (player, args) => {
            var job = mp.jobs.getBySqlId(args[0]);
            if (!job) return terminal.error(`Работа с ID: ${args[0]} не найдена!`, player);

            terminal.info(`${player.name} сменил имя у организации с ID: ${args[0]}!`);
            args.splice(0, 1);
            job.setName(args.join(" "));
        }
    },

    "set_job_level": {
        description: "Изменить мин. уровень игрока для работы.",
        minLevel: 5,
        syntax: "[job_id]:n [level]:n",
        handler: (player, args) => {
            var job = mp.jobs.getBySqlId(args[0]);
            if (!job) return terminal.error(`Работа с ID: ${args[0]} не найдена!`, player);

            terminal.info(`${player.name} сменил имя мин. уровень у работы с ID: ${args[0]}!`);
            job.setLevel(args[1]);
        }
    },

    "set_job": {
        description: "Изменить работу игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [job_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            rec.utils.setJob(args[1]);
            terminal.info(`${player.name} сменил работу у ${rec.name}`);
        }
    },

    "set_job_skills": {
        description: "Изменить навыки работы игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [job_id]:n [exp]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            var job = mp.jobs.getBySqlId(args[1]);
            if (!job) return terminal.error(`Работа с ID: ${args[1]} не найдена!`, player);


            rec.utils.setJobSkills(job.sqlId, args[2]);
            terminal.info(`${player.name} изменил навыки работы у ${rec.name}`);
        }
    },

    "set_skin": {
        description: "Изменить скин игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [skin]:s",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            rec.model = mp.joaat(args[1]);
            terminal.info(`${player.name} изменил скин у ${rec.name}`);
        }
    },

    "set_walking": {
        description: "Изменить походку игрока.",
        minLevel: 3,
        syntax: "[player_id]:n [animSet]:s",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            rec.setVariable("walking", args[1]);
        }
    },

    "give_licenses": {
        description: "Выдать все лицензии игроку.",
        minLevel: 4,
        syntax: "[player_id]:n",
        handler: (player, args) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return terminal.error(`Игрок с ID: ${args[0]} не найден!`, player);

            var docs = rec.inventory.getArrayByItemId(16);
            if (!Object.keys(docs).length) {
                var params = {
                    owner: rec.sqlId,
                    licenses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    weapon: [0, 0, 0, 0, 0, 0, 0],
                    work: []
                };
                mp.fullDeleteItemsByParams(16, ["owner"], [rec.sqlId]);
                rec.inventory.add(16, params, null, (e) => {
                    if (e) return terminal.error(e, player);
                    terminal.info(`${player.name} выдал документы с лицензиями игроку ${rec.name}`);
                });
            } else {
                for (var key in docs) {
                    if (docs[key].params.owner == rec.sqlId) {
                        docs[key].params.licenses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
                        rec.inventory.updateParams(docs[key].id, docs[key]);
                        //mp.logs.sendToDiscord(`${player.name} добавил лицензии в документы игрока ${rec.name}`, `Social Club: ${player.socialClub}`, 20);
                        return terminal.info(`${player.name} добавил лицензии в документы игрока ${rec.name}`);
                    }
                }
                terminal.error(`Не получилось выдать лицензии!`, player);
            }

        }
    },

    "terminal_cmd_name": {
        description: "Изменить название команды.",
        minLevel: 6,
        syntax: "[cmd_name]:s [name]:s",
        handler: (player, args) => {
            var cmd = cmds[args[0]];
            if (!cmd) return terminal.error(`Команда ${args[0]} не найдена!`, player);
            if (cmds[args[1]]) return terminal.error(`Команда ${args[1]} уже существует!`, player);

            DB.Handle.query(`SELECT * FROM terminal_cmds WHERE name=?`, [args[0]], (e, result) => {
                terminal.info(`${player.name} изменил команду ${args[0]} на ${args[1]}`);
                if (!result.length) {
                    DB.Handle.query(`INSERT INTO terminal_cmds (cmd,name,description,minLevel) VALUES (?,?,?,?)`,
                        [args[0], args[1], cmd.description, cmd.minLevel]);
                } else {
                    DB.Handle.query(`UPDATE terminal_cmds SET name=? WHERE name=?`, [args[1], args[0]]);
                }
                delete cmds[args[0]];
                cmds[args[1]] = cmd;
            });
        }
    },

    "terminal_cmd_description": {
        description: "Изменить описание команды.",
        minLevel: 6,
        syntax: "[cmd_name]:s [description]:s",
        handler: (player, args) => {
            var cmdName = args[0];
            args.splice(0, 1);
            var description = args.join(" ");
            var cmd = cmds[cmdName];
            if (!cmd) return terminal.error(`Команда ${cmdName} не найдена!`, player);

            DB.Handle.query(`SELECT * FROM terminal_cmds WHERE name=?`, [cmdName], (e, result) => {
                terminal.info(`${player.name} изменил описание команды ${cmdName}`);
                if (!result.length) {
                    DB.Handle.query(`INSERT INTO terminal_cmds (cmd,name,description,minLevel) VALUES (?,?,?,?)`,
                        [cmdName, cmdName, description, cmd.minLevel]);
                } else {
                    DB.Handle.query(`UPDATE terminal_cmds SET description=? WHERE name=?`, [description, cmdName]);
                }
                cmd.description = description;
            });
        }
    },

    "terminal_cmd_minlevel": {
        description: "Изменить мин. уровень команды.",
        minLevel: 6,
        syntax: "[cmd_name]:s [minLevel]:n",
        handler: (player, args) => {
            var cmdName = args[0];
            var cmd = cmds[cmdName];
            if (!cmd) return terminal.error(`Команда ${cmdName} не найдена!`, player);
            if (player.admin < args[1]) return terminal.error(`Макс. уровень для изменения - ${player.admin}!`, player);
            if (cmd.minLevel > player.admin) return terminal.error(`Вам недоступна эта команда!`, player);

            DB.Handle.query(`SELECT * FROM terminal_cmds WHERE name=?`, [cmdName], (e, result) => {
                terminal.info(`${player.name} изменил мин. уровень команды ${cmdName}`);
                if (!result.length) {
                    DB.Handle.query(`INSERT INTO terminal_cmds (cmd,name,description,minLevel) VALUES (?,?,?,?)`,
                        [cmdName, cmdName, cmd.description, args[1]]);
                } else {
                    DB.Handle.query(`UPDATE terminal_cmds SET minLevel=? WHERE name=?`, [args[1], cmdName]);
                }
                cmd.minLevel = args[1];
            });
        }
    },

    "create_tpmarker": {
        description: "Создать маркер для телепорта. (укажите координаты конечного маркера)",
        minLevel: 6,
        syntax: "[x]:n [y]:n [z]:n [h]:n",
        handler: (player, args) => {
            var data = {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z - 1,
                h: player.heading,
                tpX: args[0],
                tpY: args[1],
                tpZ: args[2] - 1,
                tpH: args[3],
            };
            var dist = player.dist(new mp.Vector3(data.tpX, data.tpY, data.tpZ));
            if (dist < 2) return terminal.error(`Маркеры слишком близки друг к другу!`, player);
            DB.Handle.query("INSERT INTO markers_tp (x,y,z,h,tpX,tpY,tpZ,tpH) VALUES (?,?,?,?,?,?,?,?)",
                [data.x, data.y, data.z, data.h, data.tpX, data.tpY, data.tpZ, data.tpH], (e, result) => {
                    data.id = result.insertId;
                    createTpMarker(data);
                    terminal.info(`${player.name} создал ТП-маркер №${data.id}`);
                });
        }
    },

    "delete_tpmarker": {
        description: "Удалить маркер для телепорта.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            mp.markers.forEachInRange(player.position, 2, (m) => {
                if (m.colshape.tpMarker) {
                    DB.Handle.query("DELETE FROM markers_tp WHERE id=?", m.sqlId);
                    terminal.error(`${player.name} удалил ТП-Маркер №${m.sqlId}`);

                    m.colshape.targetMarker.destroy();
                    m.destroy();
                }
            });
        }
    },

    "create_ped": {
        description: "Создать педа.",
        minLevel: 6,
        syntax: "[model]:s",
        handler: (player, args) => {
            var pos = player.position;
            DB.Handle.query("INSERT INTO peds (model,x,y,z,h) VALUES (?,?,?,?,?)",
                [args[0], pos.x, pos.y, pos.z, player.heading], (e, result) => {
                    var data = {
                        sqlId: result.insertId,
                        position: pos,
                        heading: player.heading,
                        hash: mp.joaat(args[0].trim()),
                    };
                    mp.dbPeds.push(data);
                    mp.players.forEach((rec) => {
                        if (rec.sqlId) rec.call(`peds.create`, [
                            [data]
                        ]);
                    });

                    terminal.info(`${player.name} создал педа с ID: ${data.sqlId}`);
                });
        }
    },

    "delete_ped": {
        description: "Удалить ближайшего педа.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            var ped = mp.dbPeds.getNear(player);
            if (!ped) return terminal.error(`Пед поблизости не найден!`, player);

            mp.dbPeds.deletePed(ped);
            terminal.info(`${player.name} удалил педа с ID: ${ped.sqlId}`);
        }
    },

    "clear_chat": {
        description: "Очистить чат.",
        minLevel: 6,
        syntax: "",
        handler: (player, args) => {
            mp.players.forEach((rec) => {
                if (rec.sqlId) rec.call(`chat.clear`, [player.id]);
            });
            terminal.info(`${player.name} очистил чат`);
        }
    },

    "refresh_whitelist": {
        description: "Обновить whitelist.",
        minLevel: 9,
        syntax: "",
        handler: (player, args) => {
            whitelist.Refresh();
        }
    },

    "give_car_keys": {
        description: "Сделать админ-авто личным и выдать ключи.",
        minLevel: 9,
        syntax: "",
        handler: (player, args) => {
            if (!player.vehicle) return terminal.error(`Вы не в авто!`, player);
            if (player.vehicle.sqlId) return terminal.error(`Авто не является админским!`);
            var freeSlot = player.inventory.findFreeSlot(54);
            if (!freeSlot) return terminal.error(`Освободите место для ключей!`, player);
            var veh = player.vehicle;
            veh.owner = player.sqlId + 2000;

            DB.Handle.query("INSERT INTO vehicles (owner,model,color1,color2,x,y,z,h) VALUES (?,?,?,?,?,?,?,?)",
                [veh.owner, veh.name, veh.getColor(0), veh.getColor(1),
                    veh.position.x, veh.position.y, veh.position.z,
                    veh.rotation.z
                ], (e, result) => {
                    veh.sqlId = result.insertId;
                    terminal.info(`${player.name} сделал авто ${veh.name} личным `);

                    var params = {
                        owner: player.sqlId,
                        car: veh.sqlId,
                        model: veh.name
                    };

                    player.inventory.add(54, params, null, (e) => {
                        if (e) return terminal.error(e, player);
                    });
                });

            veh.spawnPos = veh.position;
        }
    },
    "add_green_zone": {
        description: "Добавить зелёную зону",
        minLevel: 9,
        syntax: "",
        handler: (player) => {
            player.call("green_zone::addRemove", [true]);
        }
    },
    "remove_green_zone": {
        description: "Удалить зелёную зону",
        minLevel: 9,
        syntax: "",
        handler: (player) => {
            player.call("green_zone::addRemove", [false]);
        }
    },

    "q": {
        description: "Отключиться от сервера.",
        minLevel: 1,
        syntax: "",
        handler: (player, args) => {
            player.kick();
        }
    },





    /*"chat": {
            description: 'Написать в чат от другого игрока.',
            minLevel: 4,
            syntax: '[playerId]:n [text]:s',
            handler: (player, args) => {
                  var id = parseInt(args[0]);
                  args.splice(0, 1);

                  mp.players.forEach(_player => {
                        if (_player.id == id) {
                              mp.events.call("playerChat", _player, args.join(' '));
                        }
                  });
            }
      },
      "setmoney": {
            description: 'Изменить себе количество наличных.',
            minLevel: 6,
            syntax: '[money]:n',
            handler: (player, args) => {
                  args[0] = parseInt(args[0]);
                  if (args[0] > 100000000) return terminal.error(`Сумма очень большая!`, player);
                  player.utils.setMoney(args[0]);
                  terminal.info(`${player.name} установил себе наличные: ${args[0]}$`);
            }
      },

      "warn": {
            description: "Выдать варн игроку.",
            minLevel: 2,
            syntax: "[playerId]:n [reason]:s",
            handler: (player, args) => {

                  var recipient = mp.findPlayerByIdOrNickname(args[0]);
                  if (!recipient) return terminal.error(`Игрок не найден!`,player);

                  args.splice(0, 1);
                  var reason = args.join(" ");
                  var date = new Date();
                  if (recipient.warn == 0) {
                  	//выдаем варн
                  	DB.Handle.query("UPDATE characters SET warn=? WHERE id=?", [date.getTime() / 1000 + 7 * 24 * 60 * 60, recipient.sqlId]);
                  	recipient.utils.error(`Вам выдан warn на 7 дней от ${player.name}.`);
                        recipient.utils.error(`Причина: ${reason}`);
                        terminal.info(`${player.name} выдал warn ${recipient.name}: ${reason}`);
                  	recipient.kick(reason);

                  	mp.players.forEach(_player => {
                  		_player.utils.info(`${player.name} выдал warn ${recipient.name}`);
                              _player.utils.info(`Причина: ${reason}`);
                  	});
                  } else {
                  	//баним при повторной выдаче
                  	DB.Handle.query("UPDATE characters SET warn=?,ban=? WHERE id=?", [0, date.getTime() / 1000 + 7 * 24 * 60 * 60, recipient.sqlId]);

                  	recipient.utils.error(`${player.name} забанил Вас за 2 варна`);
                        recipient.utils.error(`Причина: ${reason}`);
                        terminal.info(`${player.name} забанил ${recipient.name}: ${reason} [2 варна]`);
                  	recipient.kick(reason);

                  	mp.players.forEach(_player => {
                  		_player.utils.info(`${player.name} забанил ${recipient.name} за 2 варна`);
                              _player.utils.info(`Причина: ${reason}`);
                  	});
                  }
            }
      },
      "ban": {
            description: "Выдать бан игроку",
            minLevel: 3,
            syntax: "[playerId]:n [days]:n [reason]:s",
            handler: (player, args) => {
            	var recipient = mp.findPlayerByIdOrNickname(args[0]);
        		if (!recipient) return terminal.error(`Игрок не найден!`,player);
        		if (args[1] > 30) return terminal.error(`Не более 30 дней!`,player);

            	var date = new Date();
            	DB.Handle.query("UPDATE characters SET ban=? WHERE id=?", [date.getTime() / 1000 + args[1] * 24 * 60 * 60, recipient.sqlId]);
                  args.splice(0,2);
                  var reason = args.join(" ");

            	recipient.utils.error(`${player.name} забанил Вас`);
                  recipient.utils.error(`Причина: ${reason}`);
                  terminal.info(`${player.name} забанил ${recipient.name} на ${args[1]} дней: ${reason}`);
            	recipient.kick(reason);

            	mp.players.forEach(_player => {
                    _player.utils.info(`${player.name} забанил ${recipient.name}`);
                    mp.logs.sendToDiscord(`${player.name} забанил ${recipient.name}. Причина: ${reason}`, `Social Club: ${player.socialClub}`, 22);
                        _player.utils.info(`Причина: ${reason}`);
            	});
            }
      },
      "unban": {
            description: "Снять бан с игрока.",
            minLevel: 4,
            syntax: "[name]:s [second_name]:s",
            handler: (player, args) => {
                  DB.Handle.query("UPDATE characters SET ban=? WHERE name=? AND second_name=?", [10, args[0], args[1]]);
                  terminal.info(`${player.name} разбанил ${args[0]} ${args[1]}`);
            }
      },
      "setcam": {
            description: "Устанавить камеру на указанные координаты.",
            minLevel: 1,
            syntax: "[x]:n [y]:n [z]:n [rX]:n [rY]:n [rZ]:n",
            handler: (player, args) => {
                  args[0] = parseFloat(args[0]);
                  args[1] = parseFloat(args[1]);
                  args[2] = parseFloat(args[2]);
                  args[3] = parseFloat(args[3]);
                  args[4] = parseFloat(args[4]);
                  args[5] = parseFloat(args[5]);
                  var pos = new mp.Vector3(args[0], args[1], args[2]);
                  var rot = new mp.Vector3(args[3], args[4], args[5]);
                  player.call("setCamera", [pos, rot]);
                  terminal.info(`Камера установлена.`,player);
            },
      },
      "cutscene": {
            description: "Запустить катсцену по названию.",
            minLevel: 1,
            syntax: "[cutsceneName]:s",
            handler: (player, args) => {
                  player.call("startCutscene", [args[0]]);
                  terminal.info(`Катсцена запущена.`,player);
            }
      },
      "mute": {
            description: "Выдать мут игроку.",
            minLevel: 1,
            syntax: "[playerId]:n [minutes]:n [reason]:s",
            handler: (player, args) => {
            	var recipient = mp.findPlayerByIdOrNickname(args[0]);
            	if (!recipient) return terminal.error(`Игрок не найден!`,player);

            	var minutes = args[1];
                  args.splice(0,2);
            	var reason = args.join(" ");
                  if (minutes > 180) return terminal.error(`Не более 3 часов!`,player);

            	var date = new Date();
            	DB.Handle.query("UPDATE characters SET mute=? WHERE id=?", [date.getTime() / 1000 + minutes * 60, recipient.sqlId]);
            	recipient.mute = date.getTime() / 1000 + minutes * 60;
                  terminal.info(`${player.name} выдал мут ${recipient.name} на ${minutes} минут: ${reason}`);

      		mp.players.forEach(_player => {
  				if (_player.utils) {
        	    			_player.utils.info(`${player.name} выдал мут ${recipient.name}.`);
                              _player.utils.info(`Причина: ${reason}`);
                        }
      		});
            }
      },
      "unmute": {
            description: "Снять мут с игрока.",
            minLevel: 2,
            syntax: "[playerId]:n",
            handler: (player, args) => {
            	var recipient = mp.findPlayerByIdOrNickname(args[0]);
            	if (!recipient) return terminal.error(`Игрок не найден!`,player);
            	if (!recipient.mute) return terminal.error(`Игрок не имеет мут!`,player);

            	recipient.mute = 0;
            	DB.Handle.query("UPDATE characters SET mute=? WHERE id=?", [0, recipient.sqlId]);
            	terminal.info(`${player.name} снял мут с ${recipient.name}`);
        		recipient.utils.info(`${player.name} снял с Вас мут`);
            }
      },

      "makeadmin": {
            description: "Назначить игрока администратором.",
            minLevel: 6,
            syntax: "[playerId]:n [admin_level]:n",
            handler: (player, args) => {
                  if (args[1] < 0 || args[1] > 6) return terminal.error("Уровень админа 1-6!",player);

                  var recipient = mp.findPlayerByIdOrNickname(args[0]);
                  if (!recipient) return terminal.error("Игрок не найден!",player);

                  if (args[1] == 0) {
                        var index = mp.listenAllIds.indexOf(player.id);
                        if (index != -1) mp.listenAllIds.splice(index, 1);
                  }

                  DB.Handle.query("UPDATE characters SET admin=?,helper=? WHERE id = ?", [args[1], 0, recipient.sqlId], function (e) {
                  	recipient.admin = args[1];
                  	recipient.helper = 0;
            		recipient.utils.info(`${player.name} назначил Вас админом`);
                        terminal.info(`${player.name} назначил ${recipient.name} администратором ${args[1]}lvl.`);
            	});

            }
      },
      "makehelper": {
            description: "Назначить игрока хелпером.",
            minLevel: 5,
            syntax: "[playerId]:n [helper_level]:n",
            handler: (player, args) => {
                  if (args[1] < 0 || args[1] > 5) return terminal.error("Уровень хелпера 1-5!", player);

                  var recipient = mp.findPlayerByIdOrNickname(args[0]);
                  if (!recipient) return terminal.error("Игрок не найден!",player);

                  if (recipient.admin) return terminal.error(`Игрок является администратором!`,player);

                  DB.Handle.query("UPDATE characters SET helper = ? WHERE id = ?", [args[1], recipient.sqlId], function (e) {
                  	recipient.helper = parseInt(args[1]);
                  	recipient.utils.info(`${player.name} назначил Вас хелпером`);
                  	terminal.info(`${player.name} назначил хелпером ${recipient.name} ${args[1]}lvl.`);
                  });
            }
      },


      "makeleader": {
            description: "Назначить игрока лидером.",
            minLevel: 4,
            syntax: "[playerId]:n [factionId]:n",
            handler: (player, args) => {
      		var maxFaction;
      		DB.Handle.query("SELECT MAX(id) FROM factions", (e,result) => {
      			maxFaction = result[0]["MAX(id)"];
      			if (args[1] < 1 || args[1] > maxFaction) return terminal.error(`Фракции с ID: ${args[1]} не существует!`,player);

      			DB.Handle.query("SELECT MAX(rank) FROM faction_ranks WHERE factionId=?", args[1], (e,result) => {
      				var recipient = mp.findPlayerByIdOrNickname(args[0]);
      				if (!recipient) return terminal.error(`Игрок с ID: ${args[0]} не найден!`,player);


                              if (recipient.faction != 0) recipient.utils.deleteFactionItems();

      				recipient.faction = parseInt(args[1]);
      				recipient.rank = result[0]["MAX(rank)"];
      				recipient.leader = 1;
      				recipient.canInvite = 1;
      				recipient.inJob = null;
      				recipient.job = 0;
      				recipient.call("initPlayerFaction", [recipient.faction]);



      				Factions.initPlayer(recipient, function () {
      					recipient.utils.success(`${player.name} назначил вас контролировать фракцию ${args[1]}`);
      					mp.players.forEach((_player) => {
      						_player.utils.info(`${recipient.name} теперь контролирует фракцию ${args[1]}`);
      					});
      					terminal.info(`${player.name} назначил ${recipient.name} лидером ${recipient.factionName}`);

      					DB.Handle.query("UPDATE characters SET job=?, leader=?, canInvite=?, faction=?, rank=? WHERE id = ?",
      						[recipient.job, recipient.leader, recipient.canInvite, recipient.faction, recipient.rank, recipient.sqlId]);
      				});

      			});
      		});
      	}
      },
      "uval": {
            description: "Уволить игрока из фракции.",
            minLevel: 3,
            syntax: "[playerId]:n",
            handler: (player, args) => {
      		var recipient = mp.findPlayerByIdOrNickname(args[0]);
      		if (!recipient) return terminal.error("Игрок не найден!", player);
      		if (recipient.faction == 0) terminal.error("Игрок не состоит в организации!",player);

      		recipient.utils.deleteFactionItems();

      		recipient.faction = 0;
      		recipient.rank = 0;
      		recipient.rankName = null;
      		recipient.leader = 0;
      		recipient.canInvite = 0;
      		recipient.factionName = null;

      		DB.Handle.query("UPDATE characters SET leader=0, canInvite=0, faction=0,rank=0 WHERE id=?", recipient.sqlId);

      		recipient.utils.info(`${player.name} вас уволил!`);
      		terminal.info(`${player.name} уволил ${recipient.name} из фракции`);
      		recipient.call("initPlayerFaction", [0]);
      	}
      },

      "fspawn": {
            description: "Изменить спавн у фракции. Устанавливается по позиции игрока.",
            minLevel: 5,
            syntax: "[factionId]:n",
            handler: (player, args) => {
      		var pos = player.position;
      		DB.Handle.query("UPDATE faction_spawns SET x=?, y=?, z=?, h=? WHERE factionId=?", [pos["x"], pos["y"], pos["z"], player.heading, args[0]], function(e, result) {
                        terminal.info(`${player.name} сменил spawn у фракции с ID: ${args[0]}`);
      		});
      	}
      },
      */

}
// Functions | Изменить
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getPlayerStatus(char) {
    let num = parseInt(char, 10);
    if (isNaN(num)) return "off";
    else return "on";
}

function getSpecialName(name, player) {
    if (!name.includes("_")) return false;
    let text = name.split("_");
    return text[0] + " " + text[1];
}

mp.events.add("delete.player.admin.freeze", (player) => {
    if (player.isFreeze) delete player.isFreeze;
});

var adm_color = "#ff6666"; // Цвет для реальных пацанов: #FF0000
