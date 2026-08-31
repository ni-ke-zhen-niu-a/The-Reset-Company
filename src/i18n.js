export const languages = {
  en: 'English',
  'zh-CN': '简体中文',
  ja: '日本語',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
}

const copy = {
  en: {
    hours: 'HOURS', minutes: 'MINUTES', seconds: 'SECONDS', days: 'DAYS',
    scheduled: 'Scheduled', detectedFrom: 'detected from @thsottiaux', source: 'SOURCE',
    viewSource: 'View on X', detected: 'Detected', lastChecked: 'Schedule updated',
    aroundWorld: 'AROUND THE WORLD', how: 'How updates work', localNote: 'Event time is converted to your selected time zone.',
    live: 'RESET SHOULD BE LIVE', liveBody: 'The announced reset time has arrived. Rollout may take a few minutes.',
    confidenceJoke: "Tibo has final say on time confidence. (doge)",
    awaiting: 'NEXT RESET NOT ANNOUNCED', awaitingBody: 'We are checking Tibo’s public posts for a new schedule.',
    announced: 'RESET ANNOUNCED · TIME TBD', announcedBody: 'A reset was mentioned, but no precise time was provided.',
    auto: 'Automatic', timezone: 'Time zone', language: 'Language', updateTitle: 'Automatic, with an honest fallback',
    updateBody: 'A scheduled job checks public posts. Exact and relative times are parsed; vague announcements remain “time TBD”. X API access is preferred, with public discovery and manual correction as fallbacks.',
    close: 'Close', openMenu: 'Open menu', day: 'day', hour: 'hour', minute: 'minute', second: 'second', ago: 'ago', justNow: 'just now',
  },
  'zh-CN': {
    hours: '小时', minutes: '分钟', seconds: '秒', days: '天',
    scheduled: '已计划', detectedFrom: '发现自 @thsottiaux', source: '信息来源',
    viewSource: '在 X 查看', detected: '发现时间', lastChecked: '计划更新时间',
    aroundWorld: '世界各地时间', how: '更新机制', localNote: '事件时间已转换为你选择的时区。',
    live: '重置应该已经生效', liveBody: '公告中的重置时间已到，实际下发可能还需要几分钟。',
    confidenceJoke: '时间置信度由 Tibo 拥有最终解释权（doge）',
    awaiting: '尚未宣布下次重置', awaitingBody: '正在检查 Tibo 的公开帖子，等待新的计划。',
    announced: '已宣布重置 · 时间待定', announcedBody: '帖子提到了重置，但没有给出精确时间。',
    auto: '自动', timezone: '时区', language: '语言', updateTitle: '自动更新，同时诚实处理不确定性',
    updateBody: '定时任务会检查公开帖子。精确时间和相对时间会被解析；模糊公告保持“时间待定”。优先使用 X API，公开检索与人工校正作为备用。',
    close: '关闭', openMenu: '打开菜单', day: '天', hour: '小时', minute: '分钟', second: '秒', ago: '前', justNow: '刚刚',
  },
  ja: {
    hours: '時間', minutes: '分', seconds: '秒', days: '日',
    scheduled: '予定済み', detectedFrom: '@thsottiaux から検出', source: '情報源',
    viewSource: 'X で見る', detected: '検出', lastChecked: '予定の更新',
    aroundWorld: '世界の時刻', how: '更新の仕組み', localNote: 'イベント時刻は選択したタイムゾーンに変換されます。',
    live: 'リセット時刻になりました', liveBody: '反映まで数分かかる場合があります。',
    confidenceJoke: '時刻の信頼度に関する最終解釈権は Tibo にあります。（doge）',
    awaiting: '次回リセットは未発表', awaitingBody: 'Tibo の公開投稿を確認しています。',
    announced: 'リセット発表済み・時刻未定', announcedBody: 'リセットへの言及はありますが、正確な時刻はありません。',
    auto: '自動', timezone: 'タイムゾーン', language: '言語', updateTitle: '自動更新と正直なフォールバック',
    updateBody: '定期ジョブが公開投稿を確認します。曖昧な発表は時刻未定のまま表示します。',
    close: '閉じる', openMenu: 'メニュー', day: '日', hour: '時間', minute: '分', second: '秒', ago: '前', justNow: 'たった今',
  },
  es: {
    hours: 'HORAS', minutes: 'MINUTOS', seconds: 'SEGUNDOS', days: 'DÍAS',
    scheduled: 'Programado', detectedFrom: 'detectado en @thsottiaux', source: 'FUENTE',
    viewSource: 'Ver en X', detected: 'Detectado', lastChecked: 'Horario actualizado',
    aroundWorld: 'HORA EN EL MUNDO', how: 'Cómo se actualiza', localNote: 'La hora se convierte a la zona horaria seleccionada.',
    live: 'EL REINICIO YA DEBERÍA ESTAR ACTIVO', liveBody: 'La hora anunciada ya llegó. El despliegue puede tardar unos minutos.',
    confidenceJoke: 'Tibo tiene la última palabra sobre la confianza horaria. (doge)',
    awaiting: 'PRÓXIMO REINICIO NO ANUNCIADO', awaitingBody: 'Estamos revisando las publicaciones públicas de Tibo.',
    announced: 'REINICIO ANUNCIADO · HORA PENDIENTE', announcedBody: 'Se anunció un reinicio, pero sin una hora precisa.',
    auto: 'Automático', timezone: 'Zona horaria', language: 'Idioma', updateTitle: 'Automático, con una alternativa transparente',
    updateBody: 'Una tarea programada revisa las publicaciones públicas. Los anuncios imprecisos permanecen como “hora pendiente”.',
    close: 'Cerrar', openMenu: 'Abrir menú', day: 'día', hour: 'hora', minute: 'minuto', second: 'segundo', ago: 'hace', justNow: 'ahora mismo',
  },
  de: {
    hours: 'STUNDEN', minutes: 'MINUTEN', seconds: 'SEKUNDEN', days: 'TAGE',
    scheduled: 'Geplant', detectedFrom: 'erkannt bei @thsottiaux', source: 'QUELLE',
    viewSource: 'Auf X ansehen', detected: 'Erkannt', lastChecked: 'Zeitplan aktualisiert',
    aroundWorld: 'ZEITEN WELTWEIT', how: 'So funktionieren Updates', localNote: 'Die Ereigniszeit wird in die gewählte Zeitzone umgerechnet.',
    live: 'RESET SOLLTE AKTIV SEIN', liveBody: 'Der angekündigte Zeitpunkt ist erreicht. Die Verteilung kann einige Minuten dauern.',
    confidenceJoke: 'Tibo hat das letzte Wort zur Zeitgenauigkeit. (doge)',
    awaiting: 'NÄCHSTER RESET NICHT ANGEKÜNDIGT', awaitingBody: 'Wir prüfen Tibos öffentliche Beiträge auf einen neuen Termin.',
    announced: 'RESET ANGEKÜNDIGT · ZEIT OFFEN', announcedBody: 'Ein Reset wurde erwähnt, aber ohne genaue Zeit.',
    auto: 'Automatisch', timezone: 'Zeitzone', language: 'Sprache', updateTitle: 'Automatisch, mit ehrlichem Fallback',
    updateBody: 'Ein geplanter Job prüft öffentliche Beiträge. Vage Ankündigungen bleiben als „Zeit offen“ markiert.',
    close: 'Schließen', openMenu: 'Menü öffnen', day: 'Tag', hour: 'Stunde', minute: 'Minute', second: 'Sekunde', ago: 'vor', justNow: 'gerade eben',
  },
  fr: {
    hours: 'HEURES', minutes: 'MINUTES', seconds: 'SECONDES', days: 'JOURS',
    scheduled: 'Planifié', detectedFrom: 'détecté depuis @thsottiaux', source: 'SOURCE',
    viewSource: 'Voir sur X', detected: 'Détecté', lastChecked: 'Planning mis à jour',
    aroundWorld: 'HEURES DANS LE MONDE', how: 'Fonctionnement des mises à jour', localNote: "L’heure est convertie dans le fuseau sélectionné.",
    live: 'LA RÉINITIALISATION DEVRAIT ÊTRE ACTIVE', liveBody: "L’heure annoncée est arrivée. Le déploiement peut prendre quelques minutes.",
    confidenceJoke: "Tibo a le dernier mot sur la fiabilité de l’heure. (doge)",
    awaiting: 'PROCHAINE RÉINITIALISATION NON ANNONCÉE', awaitingBody: 'Nous vérifions les publications publiques de Tibo.',
    announced: 'RÉINITIALISATION ANNONCÉE · HEURE À VENIR', announcedBody: "L’annonce ne donne pas d’heure précise.",
    auto: 'Automatique', timezone: 'Fuseau horaire', language: 'Langue', updateTitle: 'Automatique, avec un repli transparent',
    updateBody: 'Une tâche planifiée vérifie les publications publiques. Les annonces vagues restent marquées « heure à venir ».',
    close: 'Fermer', openMenu: 'Ouvrir le menu', day: 'jour', hour: 'heure', minute: 'minute', second: 'seconde', ago: 'il y a', justNow: "à l’instant",
  },
  pt: {
    hours: 'HORAS', minutes: 'MINUTOS', seconds: 'SEGUNDOS', days: 'DIAS',
    scheduled: 'Agendado', detectedFrom: 'detectado em @thsottiaux', source: 'FONTE',
    viewSource: 'Ver no X', detected: 'Detectado', lastChecked: 'Agenda atualizada',
    aroundWorld: 'HORÁRIOS NO MUNDO', how: 'Como as atualizações funcionam', localNote: 'O horário é convertido para o fuso selecionado.',
    live: 'A REDEFINIÇÃO JÁ DEVE ESTAR ATIVA', liveBody: 'O horário anunciado chegou. A distribuição pode levar alguns minutos.',
    confidenceJoke: 'Tibo tem a palavra final sobre a confiança do horário. (doge)',
    awaiting: 'PRÓXIMA REDEFINIÇÃO NÃO ANUNCIADA', awaitingBody: 'Estamos verificando as publicações públicas de Tibo.',
    announced: 'REDEFINIÇÃO ANUNCIADA · HORÁRIO PENDENTE', announcedBody: 'A publicação não informou um horário preciso.',
    auto: 'Automático', timezone: 'Fuso horário', language: 'Idioma', updateTitle: 'Automático, com alternativa transparente',
    updateBody: 'Uma tarefa agendada verifica publicações públicas. Anúncios vagos continuam como “horário pendente”.',
    close: 'Fechar', openMenu: 'Abrir menu', day: 'dia', hour: 'hora', minute: 'minuto', second: 'segundo', ago: 'atrás', justNow: 'agora mesmo',
  },
}

export function getCopy(locale) {
  return copy[locale] || copy.en
}

export function detectLanguage() {
  const saved = localStorage.getItem('codex-reset-language')
  if (saved && languages[saved]) return saved
  const browser = navigator.language
  if (languages[browser]) return browser
  const base = browser?.split('-')[0]
  return languages[base] ? base : 'en'
}
