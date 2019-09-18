module.exports = {
    "reportSystem.load": (player) => {
        player.load = 1;

        if (player.admin <= 0) {
            for (var i = 0; i < mp.reports.messages.length; i++) {
                var r = mp.reports.messages[i];
                if (mp.reports.reports[r.reportId - 1].sqlId == r.reportId) {
                    player.call(`reportSystem.messages`, [{
                        reportId: r.reportId,
                        name: r.name,
                        serverId: r.serverId,
                        playerId: r.playerId,
                        message: r.message,
                        date: r.date
                    }]);
                }
            }

            for (var i = 0; i < mp.reports.reports.length; i++) {
                var r = mp.reports.reports[i];
                if (r.playerId == player.sqlId) {
                    player.call(`reportSystem.reports`, [{
                        sqlId: r.sqlId,
                        reason: r.reason,
                        playerId: r.playerId,
                        adminId: r.adminId,
                        updated_at: r.updated_at,
                        created_at: r.created_at,
                        status: r.status
                    }]);
                }
            }
        }

        if (player.admin > 0) {
            for (var i = 0; i < mp.reports.reports.length; i++) {
                var r = mp.reports.reports[i];
                if (player.admin > 0 && r.status == 0) {
                    player.call(`adminPanel.reports`, [{
                        sqlId: r.sqlId,
                        reason: r.reason,
                        playerId: r.playerId,
                        adminId: r.adminId,
                        updated_at: r.updated_at,
                        created_at: r.created_at,
                        status: r.status
                    }]);
                }
            }

            for (var i = 0; i < mp.reports.messages.length; i++) {
                var r = mp.reports.messages[i];
                if (player.admin > 0 && mp.reports.reports[r.reportId - 1].status == 0) {
                    player.call(`adminPanel.messages`, [{
                        reportId: r.reportId,
                        name: r.name,
                        serverId: r.serverId,
                        playerId: r.playerId,
                        message: r.message,
                        date: r.date
                    }]);
                }
            }
        }
    },

    "reportSystem.sendMessage": (player, reportId, message) => {
        // debug(`reportSystem.sendMessage: ${player.name} ${reportId} ${message}`);
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);
        report.pushMessage(player, message);
        return;
        for (var i = 0; i < mp.reports.reports.length; i++) {
            var r = mp.reports.reports[i];
            if (r.sqlId === reportId) {
                var reportOne = mp.reports.reports[i];
            }
        }

        if (player.admin > 0 && reportOne.adminId != null && player.sqlId != reportOne.adminId) return player.utils.error(`Данный репорт занят другим администратором!`);
        if (reportOne.status == 1) return player.utils.error(`Вы не можете отправить сообщение, тикет уже закрыт!`);
        if (message.length >= 200) return player.utils.error(`Сообщение слишком длинное!`);

        reportOne.updated_at = Math.floor(Date.now() / 1000);

        var report = mp.players.getBySqlId(reportOne.playerId);

        DB.Handle.query("INSERT INTO reports_messages (reportId, name, serverId, playerId, message, date) VALUES (?, ?, ?, ?, ?, ?)",
            [reportId, player.name, player.id, player.sqlId, message, Math.floor(Date.now() / 1000)], (e, messageReport) => {
                mp.reports.messages[messageReport.insertId - 1] = {
                    reportId: reportId,
                    name: player.name,
                    serverId: player.id,
                    playerId: player.sqlId,
                    message: message,
                    date: Math.floor(Date.now() / 1000)
                };
            });

        if (player.admin > 0 && reportOne.adminId == null) {
            DB.Handle.query("UPDATE reports SET adminId = ?, updated_at = ? WHERE id = ?", [player.sqlId, Math.floor(Date.now() / 1000), reportId]);
            reportOne.adminId = player.sqlId;
            reportOne.updated_at = Math.floor(Date.now() / 1000);
        }

        if (report && reportOne.adminId == player.sqlId) report.utils.success(`Вам ответили в жалобе под номером: ${reportOne.sqlId}`);

        player.utils.success(`Вы отправили сообщение в репорт под номером: ${reportOne.sqlId}`);

        if (report) {
            report.utils.setReport('setNewMessage', {
                reportId: reportId,
                name: player.name,
                serverId: player.id,
                playerId: player.sqlId,
                message: message,
                date: Math.floor(Date.now() / 1000)
            });
        } else {
            player.utils.setReport('setNewMessage', {
                reportId: reportId,
                name: player.name,
                serverId: player.id,
                playerId: player.sqlId,
                message: message,
                date: Math.floor(Date.now() / 1000)
            });
        }
    },

    "reportSystem.createTicket": (player, message, reason) => {
        // debug(`reportSystem.createTicket: ${player.name} ${message} ${reason}`)
        if (reason == "Вопрос") mp.v2_reportsUtils.createHelp(player, message);
        else mp.v2_reportsUtils.createClaim(player, message);
        return player.utils.success(`Ожидайте ответ от Администрации!`);
        var count = 0;
        for (var i = 0; i < mp.reports.reports.length; i++) {
            var r = mp.reports.reports[i];
            if (r.playerId == player.sqlId && r.status == 0) {
                count += 1;
                if (count >= 5) return player.utils.error('У вас имеется 5 открытых репортов, для начала дождитесь ответа');
            }
        }
        DB.Handle.query("INSERT INTO reports (reason, playerId, updated_at, created_at) VALUES (?, ?, ?, ?)",
            [reason, player.sqlId, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)], (e, result) => {
                mp.reports.reports[result.insertId - 1] = {
                    sqlId: result.insertId,
                    reason: reason,
                    playerId: player.sqlId,
                    adminId: null,
                    updated_at: Math.floor(Date.now() / 1000),
                    created_at: Math.floor(Date.now() / 1000),
                    status: 0
                };
                DB.Handle.query("INSERT INTO reports_messages (reportId, name, serverId, playerId, message, date) VALUES (?, ?, ?, ?, ?, ?)",
                    [result.insertId, player.name, player.id, player.sqlId, message, Math.floor(Date.now() / 1000)], (e, messageReport) => {
                        player.utils.success(`Вы создали заявку на репорт под номером: ${result.insertId}. Ожидайте ответа!`);
                        mp.reports.messages[messageReport.insertId - 1] = {
                            reportId: result.insertId,
                            name: player.name,
                            serverId: player.id,
                            playerId: player.sqlId,
                            message: message,
                            date: Math.floor(Date.now() / 1000)
                        };
                        player.utils.setReport('setNewReport', {
                            sqlId: result.insertId,
                            reason: reason,
                            playerId: player.sqlId,
                            adminId: null,
                            updated_at: Math.floor(Date.now() / 1000),
                            created_at: Math.floor(Date.now() / 1000),
                            status: 0
                        });
                        player.utils.setReport('setNewMessage', {
                            reportId: result.insertId,
                            name: player.name,
                            serverId: player.id,
                            playerId: player.sqlId,
                            message: message,
                            date: Math.floor(Date.now() / 1000)
                        });
                    });
            });
    },

    "reportSystem.closeTicket": (player, reportId) => {
        for (var i = 0; i < mp.reports.reports.length; i++) {
            var r = mp.reports.reports[i];
            if (r.sqlId === reportId) {
                var report = mp.reports.reports[i];
            }
        }
        if (report.status === 1) return player.utils.error(`Жалоба уже была закрыта!`);
        if (report.adminId == null) return player.utils.error(`Прежде чем закрыть репорт, ответьте на него!`);
        if (player.admin < 4 && player.sqlId != report.adminId) return player.utils.error(`Вы не можете закрыть данный репорт!`);

        report.status = 1;
        report.updated_at = Math.floor(Date.now() / 1000);

        var reportPlayer = mp.players.getBySqlId(report.playerId);

        player.utils.setReport('closeTicket', {
            reportId: reportId,
            status: report.status,
            updated_at: report.updated_at
        });
        if (reportPlayer) reportPlayer.utils.setReport('closeTicket', {
            reportId: reportId,
            status: report.status,
            updated_at: report.updated_at
        });

        player.utils.success(`Вы закрыли репорт под номером: ${reportId}`);

        if (reportPlayer) reportPlayer.utils.success(`Вашу жалобу ${reportId} закрыли. Спасибо за помощь!`);

        DB.Handle.query("UPDATE reports SET status = 1, updated_at = ? WHERE id = ?", [Math.floor(Date.now() / 1000), reportId]);
        // mp.logs.sendToDiscord(`${player.name} закрыл жалобу №${reportId}`, `Social Club: ${player.socialClub}`, 20);
    },

    // Carter's console reports
    "report.addMessage": (player, data) => {
        // debug(`report.addMessage: ${player.name} ${data}`)
        data = JSON.parse(data);
        var reportId = data[0];
        var text = data[1].substr(0, 540).trim();
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);
        report.pushMessage(player, text);
    },

    "report.attach": (player, reportId) => {
        // debug(`report.attach: ${player.name} ${reportId}`);
        if (!player.admin) return player.utils.error(`Вы не админ!`);
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);
        if (report.adminId && report.adminId != player.sqlId) {
            var name = mp.players.getBySqlId(report.adminId).name;
            return player.utils.error(`Тикет занят администратором ${name}!`);
        }
        if (!report.adminId) {
            report.setAdminId(player.sqlId);
            player.utils.success(`Тикет закреплен!`);
        } else {
            report.setAdminId(0);
            player.utils.success(`Тикет откреплен!`);
        }
    },

    "report.close": (player, reportId) => {
        // debug(`report.close: ${player.name} ${reportId}`);
        if (!player.admin) return player.utils.error(`Вы не админ!`);
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);
        if (!report.adminId) return player.utils.error(`Тикет должен быть закреплен за администратором!`);
        if (report.adminId != player.sqlId) {
            var name = mp.players.getBySqlId(report.adminId).name;
            return player.utils.error(`Тикет занят администратором ${name}!`);
        }
        if (!report.status) return player.utils.error(`Тикет уже закрыт!`);

        report.setStatus(0);
        player.utils.success(`Тикет закрыт!`);
    },

    "report.goto": (player, reportId) => {
        if (!player.admin) return player.utils.error(`Вы не админ!`);
        if (player.admin < 2) return player.utils.error(`Ваш уровень мал!`);
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);

        var rec = mp.players.getBySqlId(report.playerId);
        if (!rec) return player.utils.error(`Игрок оффлайн!`);

        var pos = rec.position;
        pos.x += 2;
        player.position = pos;
        player.dimension = rec.dimension;
    },

    "report.gethere": (player, reportId) => {
        if (!player.admin) return player.utils.error(`Вы не админ!`);
        if (player.admin < 3) return player.utils.error(`Ваш уровень мал!`);
        var report = mp.v2_reports[reportId];
        if (!report) return player.utils.error(`Тикет с ID: ${reportId} не найден!`);

        var rec = mp.players.getBySqlId(report.playerId);
        if (!rec) return player.utils.error(`Игрок оффлайн!`);

        var pos = player.position;
        pos.x += 2;
        rec.position = pos;
        rec.dimension = player.dimension;
        rec.utils.info(`Вы были телепортированы Администрацией`);
    },
}
