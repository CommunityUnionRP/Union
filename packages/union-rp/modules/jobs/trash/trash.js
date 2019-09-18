// Переписать систему после введения RAGE mp посадки боллее 2 игроков ( сделано для сокращения времени )
mp.blips.new(318, new mp.Vector3(-629.18, -1634.45, 26.04), {
    alpha: 255,
    scale: 0.7,
    color: 25,
    name: "Центр утилизации",
    shortRange: true
});
mp.blips.new(527, new mp.Vector3(-457.81, -1718.09, 19.02), {
    alpha: 255,
    scale: 0.7,
    color: 1,
    name: "Городская свалка",
    shortRange: true
});
const JobTrash = {
    salary_min: 1, // Минимальная сумма прибыли
    salary_max: 2000, // Макисмальная сумма прибыли
    trash_min: 1, // Минимальное кол-во мусора в тс
    trash_max: 30, // Максимальное кол-во мусора в тс
    distance_min: 700, // Минимальная дистанция от игрока к баку
    distance_max: 4000, // Максимум = минимум + число
    job_colshape: mp.colshapes.newSphere(-629.18, -1634.45, 26.04, 1.5),
    trash_colshape: mp.colshapes.newSphere(-467.69, -1719.06, 18.69, 3),
    backs: [],
    teams: [],
    functions: {
        enjoyJob(player) {
            if (mp.convertMinutesToLevelRest(player.minutes).level < 2) return player.utils.error("Вы не достигли 2 уровня!");
            player.call("setTrashJobStatus", [true]);
            player.utils.success("Вы устроились в Центр утилизации!");
            player.utils.success("Выберите свободный мусоровоз или вступите в бригаду с водителем!");
            player.utils.changeJob(9);
            player.body.clearItems();
            player.body.denyUpdateView = true;
            if (player.sex === 1) {
                // Одежда мужская
                player.setClothes(3, 52, 0, 2);
                player.setClothes(4, 36, 0, 2);
                player.setClothes(6, 12, 0, 2);
                player.setClothes(8, 59, 1, 2);
                player.setClothes(11, 56, 0, 2);
                player.setProp(0, 2, 0);
            } else {
                // Одежда женская
                player.setClothes(3, 70, 0, 2);
                player.setClothes(4, 35, 0, 2);
                player.setClothes(6, 26, 0, 2);
                player.setClothes(8, 36, 0, 2);
                player.setClothes(11, 49, 0, 2);
                player.setProp(0, 12, 0);
            }
        },
        leaveJob(player) {
            if (player === undefined) return;
            player.call("setTrashJobStatus", [false]);
            player.utils.success("Вы уволились из Центра утилизации!");
            player.utils.changeJob(0);
            player.call("update.trash.vehicle", ["cancel", 0, 0]);
            player.call("createPlaceTrasher", [0, 0, 0, false]);
            putTrashBox(player);
            delete player.body.denyUpdateView;
            player.body.loadItems();
            delete player.toldpos, delete player.hastrash;
            JobTrash.functions.leaveVehicle(player);
            player.utils.setLocalVar("trashLeader", undefined);
            let team = getTrashTeam(player);
            if (!team) return;
            if (team.leader === player) {
                if (team.target) {
                    team.target.utils.warning("Водитель уволился, бригада расформированна!");
                    team.target.call("update.trash.vehicle", ["cancel", 0, 0]);
                    team.target.call("createPlaceTrasher", [0, 0, 0, false]);
                    team.target.utils.putObject();
                }
                JobTrash.teams.splice(JobTrash.teams.indexOf(team), 1);
            } else {
                team.leader.utils.warning("Помощник уволился, бригада расформированна!");
                delete team.target;
            }
        },
        leaveVehicle(player) {
            let team = getTrashTeam(player);
            if (team) {
                if (team.vehicle) {
                    let vehicle = team.vehicle;
                    if (player.vehicle === vehicle) player.removeFromVehicle();
                    removeAllHumansFromVehicle(vehicle);
                    setTimeout(() => {
                        try {
                            vehicle.repair();
                            vehicle.dimension = 0;
                            vehicle.position = vehicle.spawnPos;
                            vehicle.rotation = new mp.Vector3(0, 0, vehicle.spawnPos.h);
                            vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
                            vehicle.engine = false;
                            // console.log("INFORMATION TRASH: " + vehicle.dimension + " | " + vehicle.spawnPos + " | " + vehicle.vehPropData.fuel + " | " + vehicle.engine + " | " + vehicle.spawnPos.h);
                        } catch (err) {
                            console.log(err);
                        }
                    }, 200);
                }
            }
        },
        leaveClear(player) {
            JobTrash.functions.leaveVehicle(player);
            let team = getTrashTeam(player);
            if (!team) return;
            if (team.leader === player) {
                if (team.target) {
                    team.target.utils.warning("Водитель уволился, бригада расформированна!");
                    team.target.call("update.trash.vehicle", ["cancel", 0, 0]);
                    team.target.call("createPlaceTrasher", [0, 0, 0, false]);
                    team.target.utils.putObject();
                }
                JobTrash.teams.splice(JobTrash.teams.indexOf(team), 1);
            } else {
                team.leader.utils.warning("Помощник уволился, бригада расформированна!");
                delete team.target;
            }
        },
        inviteTrashPlayer(player, recId) {
            var rec = mp.players.at(recId);
            if (!rec) return player.utils.error(`Гражданин не найден!`);
            if (rec === player) return player.utils.error(`Вы не можете пригласить себя!`);
            var dist = player.dist(rec.position);
            if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
            if (player.job !== 9) return player.utils.error(`Вы не работаете в Центре утилизации!`);
            if (rec.job !== 9) return player.utils.error(`Игрок не работает в Центре утилизации!`);
            let team = getTrashTeam(player);
            if (team === undefined) return player.utils.error(`Вы не можете пригласить игрока в бригаду!`);
            if (team.target) return player.utils.error(`У вас уже есть 1 участник в бригаде!`);

            rec.inviteOffer = {
                leaderId: player.id
            };

            player.utils.info(`Вы пригласили ${rec.name} в бригаду`);
            rec.utils.info(`Получено приглашение в бригаду`);
            rec.call("choiceMenu.show", ["acccept_trash_team", {
                name: player.name
            }]);
        },
        uninviteTrashPlayer(player, recId) {
            var rec = mp.players.at(recId);
            if (!rec) return player.utils.error(`Гражданин не найден!`);
            if (rec === player) return player.utils.error(`Вы не можете уволить себя!`);
            var dist = player.dist(rec.position);
            if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
            if (player.job !== 9) return player.utils.error(`Вы не работаете в Центре утилизации!`);
            let team = getTrashTeam(player);
            if (team === undefined) return player.utils.error(`Вы не можете уволить игрока из бригады!`);
            if (team.target !== rec) return player.utils.error(`У вас нет участников в бригаде!`);

            player.utils.warning("Вы уволили " + rec.name + " из бригады!");
            rec.utils.error(player.name + " уволил вас из бригады!");
            player.utils.setLocalVar("trashLeader", 1);
            rec.call("update.trash.vehicle", ["cancel", 0, 0]);
            rec.call("createPlaceTrasher", [0, 0, 0, false]);
            delete team.target;
        },
        acceptTrashInvite(player) {
            if (!player.inviteOffer) return player.utils.error(`Предложение не найдено!`);
            var rec = mp.players.at(player.inviteOffer.leaderId);
            if (!rec) return player.utils.error(`Отправитель не найден!`);
            var dist = player.dist(rec.position);
            if (dist > 5) return player.utils.error(`Отправитель слишком далеко!`);
            if (player.job !== 9) return player.utils.error(`Вы не работаете в Центре утилизации!`);
            if (rec.job !== 9) return player.utils.error(`Отправитель не работает в Центре утилизации!`);
            let team = getTrashTeam(rec);
            if (!team) return player.utils.error(`Отправитель больше не является главой бригады!`);
            let ourteam = getTrashTeam(player);
            if (ourteam) return player.utils.error(`Вы не можете вступить в бригаду!`);
            if (team.target) return player.utils.error(`У отправителя уже полная бригада!`);
            delete player.inviteOffer;

            player.utils.success(`Вы вступили в бригаду!`);
            player.toldpos = player.position;
            rec.utils.info(`${player.name} принял приглашение в бригаду!`);
            rec.utils.setLocalVar("trashLeader", 2);
            team.target = player;
            player.utils.info("Направляйтесь к требуемому баку вместе с водителем!");
            player.call("update.trash.vehicle", [team.vehicle, team.vehicle.countTrash, JobTrash.trash_max]);
            player.call("createPlaceTrasher", [team.place.x, team.place.y, team.place.z, true]);
        },
        unacceptTrashInvite(player) {
            if (!player.inviteOffer) return;
            var rec = mp.players.at(player.inviteOffer.leaderId);
            if (rec) rec.utils.error(`${player.name} отказался вступить в бригаду!`);
        },
    }
}
class TrashTeam {
    constructor(leader, target, vehicle, place) {
        this.leader = leader;
        this.target = target;
        this.vehicle = vehicle;
        this.place = place;
    }
}

function getTrashTeam(data) {
    try {
        for (let i = 0; i < JobTrash.teams.length; i++) {
            if (JobTrash.teams[i].leader === data || JobTrash.teams[i].target === data || JobTrash.teams[i].vehicle === data) {
                return JobTrash.teams[i];
            }
        }
        return undefined;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}
module.exports = {
    Init: () => {
        DB.Handle.query("SELECT * FROM bins", (e, result) => {
            for (let i = 0; i < result.length; i++) JobTrash.backs.push({
                x: result[i].x,
                y: result[i].y,
                z: result[i].z
            });
            // console.log("Число загруженных коробок: " + JobTrash.backs.length);
        });
    }
}
mp.events.add("trash.team.agree", (player) => {
    try {
        JobTrash.functions.acceptTrashInvite(player);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("trash.team.cancel", (player) => {
    try {
        JobTrash.functions.unacceptTrashInvite(player);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("trash.invite.player", (player, id) => {
    try {
        JobTrash.functions.inviteTrashPlayer(player, id);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("trash.uninvite.player", (player, id) => {
    try {
        JobTrash.functions.uninviteTrashPlayer(player, id);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("take.trash.box", (player) => {
    try {
        player.utils.takeObject("hei_prop_heist_binbag");
        player.stopAnimation();
        player.hastrash = true;
    } catch (err) {
        console.log(err);
        return;
    }
});

function putTrashBox(player) {
    player.utils.putObject();
    // delete player.hastrash;
};
mp.events.add("leave.trash.job", (player) => {
    try {
        if (player.job === 9) JobTrash.functions.leaveJob(player);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("job.trash.agree", (player) => {
    try {
        if (player.job !== 0 && player.job !== 9) {
            player.utils.warning("Вы уже где-то работаете!");
            return;
        }

        if (player.job === 9) {
            JobTrash.functions.leaveJob(player);
        } else {
            JobTrash.functions.enjoyJob(player);
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerDeath", function playerDeathHandler(player, reason, killer) {
    if (player.job === 9) JobTrash.functions.leaveJob(player);
});
mp.events.add("send.trash.end", (player) => {
    try {
        if (player.job === 9) {
            let team = getTrashTeam(player);
            if (!team) return;
            if (team.vehicle.countTrash >= JobTrash.trash_max) {
                player.utils.warning("Транспорт уже переполнен, выгрузите мусор на свалку!");
                return;
            }
            let money = Math.trunc(player.dist(player.toldpos) * mp.economy["trash_salary"].value);

            if (money < JobTrash.salary_min) money = JobTrash.salary_min;
            else if (money > JobTrash.salary_max) money = JobTrash.salary_max;

            putTrashBox(player);
            player.toldpos = player.position;
            team.vehicle.countTrash++;
            player.utils.setMoney(player.money + money);
            player.utils.success("Вы заработали $" + money);
            player.utils.success("Направляйтесь к требуемому баку!");
            if (team.leader === player) {
                let place = getRandomNumber(player);
                team.place = place;
                player.call("update.trash.vehicle", [team.vehicle, team.vehicle.countTrash, JobTrash.trash_max]);
                player.call("createPlaceTrasher", [place.x, place.y, place.z, true]);
                if (team.target) {
                    if (!team.target.hastrash) return;
                    delete team.target.hastrash, delete player.hastrash;
                    team.target.call("update.trash.vehicle", [team.vehicle, team.vehicle.countTrash, JobTrash.trash_max]);
                    team.target.call("createPlaceTrasher", [place.x, place.y, place.z, true]);
                }
            } else {
                let nmoney = Math.round(money / 100 * mp.economy["trash_salary_procent"].value);
                if (nmoney < JobTrash.salary_min) nmoney = JobTrash.salary_min;
                else if (nmoney > JobTrash.salary_max) nmoney = JobTrash.salary_max;
                team.leader.utils.success("Прибавка к зарплате $" + nmoney);
                team.leader.utils.setMoney(team.leader.money + nmoney);
                team.leader.call("update.trash.vehicle", [team.vehicle, team.vehicle.countTrash, JobTrash.trash_max]);
                if (team.leader.hastrash) {
                    delete team.leader.hastrash, delete player.hastrash;
                    player.call("update.trash.vehicle", [team.vehicle, team.vehicle.countTrash, JobTrash.trash_max]);
                    player.call("createPlaceTrasher", [team.place.x, team.place.y, team.place.z, true]);
                }
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerEnterColshape", function onPlayerEnterColShape(player, shape) {
    try {
        if (!player.vehicle) {
            if (shape === JobTrash.job_colshape) player.call("getTrashJobStatus", [player.job !== 9 ? false : true]);
        } else {
            if (shape === JobTrash.trash_colshape) {
                let team = getTrashTeam(player);
                if (team) {
                    if (player.vehicle === team.vehicle) {
                        if (team.vehicle.countTrash < JobTrash.trash_min) {
                            player.utils.warning("В транспорте нет мусора!");
                            return;
                        }

                        player.utils.success("Вы разгрузили мусор на свалку!");
                        team.vehicle.countTrash = 0;
                        player.call("update.trash.vehicle", [team.vehicle, 0, JobTrash.trash_max]);
                        if (team.target) team.target.call("update.trash.vehicle", [team.vehicle, 0, JobTrash.trash_max]);
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerExitColshape", function onPlayerExitColShape(player, shape) {
    try {
        if (shape === JobTrash.job_colshape) player.call("getTrashJobStatus", ["cancel"]);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerEnterVehicle", function playerEnterVehicleHandler(player, vehicle, seat) {
    if (vehicle.owner === -9 && player.job === 9 && seat === -1) {
        let vteam = getTrashTeam(vehicle);
        if (vteam !== undefined) {
            if (!mp.players.exists(vteam.leader)) delete vteam.vehicle;
            else if (getTrashTeam(player).vehicle != vteam.vehicle) delete vteam.vehicle;
            else if (vteam.leader === player) {
                player.call("time.remove.back.trash");
            } else {
                player.removeFromVehicle();
                player.utils.warning("Данное транспортное средство уже занято!");
            }
        } else {
            if (getTrashTeam(player) !== undefined) {
                player.removeFromVehicle();
                player.utils.warning("Вы уже заняли одно транспортное средство!");
            } else {
                if (!haveLicense(player, vehicle)) return;
                player.toldpos = player.position;
                let place = getRandomNumber(player);
                player.call("createPlaceTrasher", [place.x, place.y, place.z, true]);
                vehicle.countTrash = 0;
                player.call("update.trash.vehicle", [vehicle, vehicle.countTrash, JobTrash.trash_max]);
                player.utils.success("Направляйтесь к требуемому баку!");
                vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
                let team = new TrashTeam(player, undefined, vehicle, place);
                JobTrash.teams.push(team);
                player.utils.setLocalVar("trashLeader", 1);
            }
        }
    }
});
mp.events.add("playerExitVehicle", function playerExitVehicleHandler(player, vehicle) {
    if (vehicle.owner === -9 && player.job === 9) {
        let team = getTrashTeam(player);
        if (team !== undefined) {
            if (team.vehicle === vehicle) {
                player.call("time.add.back.trash");
                player.utils.warning("У вас есть 3 минуты, чтобы вернуться в транспорт.");
            }
        }
    }
});
mp.events.add("playerQuit", function playerQuitHandler(player, exitType, reason) {
    try {
        if (player.job === 9) JobTrash.functions.leaveClear(player);
    } catch (err) {
        console.log(err);
        return;
    }
});
console.log("[JOB] Trash in Los Santos stared!");

// 0, JobTrash.backs.length
function getRandomNumber(player) {
    try {
        let max = 3; // кол-во попыток
        for (let i = 0; i < max; i++) {
            let buck = JobTrash.backs[grn(0, JobTrash.backs.length - 1)];
            let dist = player.dist(new mp.Vector3(buck.x, buck.y, buck.z));
            if (dist > JobTrash.min_dist && dist < JobTrash.max_dist) return buck;
        }
        return JobTrash.backs[grn(0, JobTrash.backs.length - 1)];
    } catch (err) {
        console.log(err);
        return -1;
    }
}
/*function getRandomNumber(player) {
    try
    {
        let min_dist = grn(JobTrash.distance_min[0], JobTrash.distance_min[1]), max_dist = min_dist + JobTrash.distance_max;
        for (let i = 0; i < JobTrash.backs.length; i++) {
          let dist = player.dist(new mp.Vector3(JobTrash.backs[i].x, JobTrash.backs[i].y, JobTrash.backs[i].z));
          if (dist < max_dist && dist > min_dist) return JobTrash.backs[i];
        }
        return grn(0, JobTrash.backs.length - 1);
    } catch (err){
        console.log(err);
        return -1;
    }
}*/
function grn(min, max) {
    try {
        return Math.floor(Math.random() * (max - min)) + min;
    } catch (err) {
        console.log(err);
        return -1;
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

function haveLicense(player, vehicle) {
    if (!vehicle.license) return true;
    var docs = player.inventory.getArrayByItemId(16);
    for (var sqlId in docs) {
        if (docs[sqlId].params.licenses.indexOf(vehicle.license) != -1) return true;
    }
    return false;
}
