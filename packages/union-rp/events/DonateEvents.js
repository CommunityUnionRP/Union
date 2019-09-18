module.exports = {
    "donateSystem.convertMoney": (player, donate) => {
        if(player.account.donate < donate) return player.utils.error(`У вас недостаточно vc-коинов!`);
        if(donate <= 0) return player.utils.error(`Вы не можете конвертировать нуль vc-коинов!`);
        player.utils.setDonate(player.account.donate - donate);
        player.utils.setBankMoney(player.bank + donate * mp.economy["donate_vccoin"].value);
        player.utils.success(`Вы успешно конвертировали ${donate * mp.economy["donate_vccoin"].value}$ валюты`);
    },

    "donateSystem.buyPackage": (player, package) => {
        var pack = mp.donateList[package - 1];
        if(pack.price > player.account.donate) return player.utils.error(`У вас недостаточно vc-коинов!`);
        if(pack.price <= 0) return player.utils.error(`Вы не можете конвертировать нуль vc-коинов!`);
        if(pack.type == 1) {
            player.utils.setDonate(player.account.donate - pack.price);
            player.utils.setBankMoney(player.bank + pack.data.money);
            player.utils.success(`Вы успешно приобрели пакет ${pack.name}. Приятной игры!`);
        }
    },

    "donateSystem.buyExtension": (player, extension) => {
        var pack = mp.donateList[extension - 1];
        if(pack.price > player.account.donate) return player.utils.error(`У вас недостаточно vc-коинов!`);
        if(pack.price <= 0) return player.utils.error(`Вы не можете конвертировать нуль vc-коинов!`);
        if(pack.sqlId < 7) {
            if(pack.sqlId == 6) {
                if(player.donateBizes >= 2) return player.utils.error(`Вы имеете максимальное количество донат-слотов для бизнеса`);
                player.utils.setDonate(player.account.donate - pack.price);
                player.donateBizes += 1;
                DB.Handle.query("UPDATE characters SET donateBizes = ? WHERE id = ?", [player.donateBizes, player.sqlId]);
                player.utils.success(`Вы успешно приобрели дополнительные слоты для бизнеса. Приятной игры!`);
            } else {
                if(player.donateHouse >= 2) return player.utils.error(`Вы имеете максимальное количество донат-слотов для дома`);
                player.utils.setDonate(player.account.donate - pack.price);
                player.donateHouse += 1;
                DB.Handle.query("UPDATE characters SET donateHouse = ? WHERE id = ?", [player.donateHouse, player.sqlId]);
                player.utils.success(`Вы успешно приобрели дополнительные слоты для дома. Приятной игры!`);
            }
        } else {
            if(player.donateCars >= 10) return player.utils.error(`Вы имеете максимальное количество донат-слотов для машины`);
            player.utils.setDonate(player.account.donate - pack.price);
            player.donateCars += 1;
            DB.Handle.query("UPDATE characters SET donateCars = ? WHERE id = ?", [player.donateCars, player.sqlId]);
            player.utils.success(`Вы успешно приобрели дополнительные слоты для машин. Приятной игры!`);
        }
    },

    "donateSystem.updateDonate": (player) => {
        DB.Handle.query("SELECT * FROM accounts WHERE id = ?", [player.account.id], (e, result) => {
            if (result.length > 0) {
                player.account.donate = result[0].donate;
                player.utils.setLocalVar("donate", player.account.donate);
            }
        });

        DB.Handle.query(`SELECT * FROM unitpay_payments WHERE account = ? ORDER BY id DESC LIMIT 5`,
            [player.account.login], (e, result) => {
            if(result.length > 0) {
                var payments = [];
                for (var i = 0; i < result.length; i++) {
                    var r = result[i];
                    if(r.status == 1) {
                        payments.push({
                            sqlId: r.id,
                            sum: r.sum,
                            dateComplete: r.dateComplete
                        });
                        //player.account.allDonate += r.sum;
                    }
                }
                player.call(`donateSystem.paymentsAccount`, [payments]);
            } else {
                player.call(`donateSystem.paymentsAccount`, undefined);
            }
        });
    },
    
    "donateSystem.buyVip": (player, package) => {
        var pack = mp.donateList[package - 1];
        var getTime = new Date(pack.time) - Date.now();
        if(pack.price > player.account.donate) return player.utils.error(`У вас недостаточно vc-коинов!`);
        if(pack.price <= 0) return player.utils.error(`Вы не можете оплатить нуль vc-коинов!`);
        player.utils.setDonate(player.account.donate - pack.price);
        player.vipDate = pack.time;
        player.utils.success(`Вы успешно приобрели вип-пакет на ${getTime /= 24} дня(ей). Поздравляем!`);
        DB.Handle.query("UPDATE characters SET vipDate = ? WHERE id = ?", [pack.time, player.sqlId]);
    }
}