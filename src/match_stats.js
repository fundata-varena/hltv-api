import request from 'request';
import cheerio from 'cheerio';
import { CONFIG } from './config';
import util from 'util';

export default class MatchStats {

  constructor(statsId, callback) {
    const uri = `${CONFIG.BASE}/${statsId}`;
    request({ uri }, async (error, response, body) => {
      if (error != null) {
        return callback(null, error)
      }
      if (response.statusCode != 200) {
        return callback(null, new Error(`HTTP response statusCode is ${response.statusCode}`))
      }
      
      let stats = {}

      try {
        const playerStats = this.parsePlayerStats(body)
        const mapStatsIds = this.parseMapStatsIds(body)
        const roundHistory = this.parseRoundHistory(body)

        stats = {
          playerStats,
          mapStatsIds,
          roundHistory,
        };

      } catch(e) {
        return callback(null, e)
      }

      callback(null, stats);
    });
  }

  parseMapStatsIds(body) {
    const $ = cheerio.load(body, {
      normalizeWhitespace: true
    });
    const urls = $('.stats-match-maps a').slice(1).map((i, elem) => {
      return $(elem).attr('href')
    }).get();
    return urls;
  }

  parseRoundHistory(body) {
    const $ = cheerio.load(body, {
      normalizeWhitespace: true
    });
    const teams = {}
    $('.round-history-con .round-history-team-row').each((i, row) => {
      const name = $(row).find('> img.round-history-team').attr('title')
      const halfs = []

      $(row).find('.round-history-half').each((i, half) => {
        const events = $(half).find('img.round-history-outcome').map((i, img) => {
          const src = $(img).attr('src')
          const start = src.lastIndexOf('/') + 1
          const end = src.lastIndexOf('.')
          const eventName = src.slice(start, end)
          return eventName
        }).get()
        
        halfs.push(events)
      })

      const team = {
        name, 
        halfs
      }
      teams[`team${i+1}`] = team
    })
    return teams
  }

  parsePlayerStats(body) {
    const $ = cheerio.load(body, {
      normalizeWhitespace: true
    });
    const teams = {}
    $('.stats-section .stats-table').each((i, table) => {
      const name = $(table).find('thead .st-teamname').text()
      const players = []

      $(table).find('tbody tr td.st-player').parent().each((j, tr) => {
        const $tr = $(tr)
        const playerName = $tr.find('.st-player a').text()
        const playerCountryImg = $tr.find('.st-player .gtSmartphone-only img').attr('src')
        const kills = $tr.find('.st-kills').text()
        const assists = $tr.find('.st-assists').text()
        const deaths = $tr.find('.st-deaths').text()
        const kdratio = $tr.find('.st-kdratio').text()
        const kddiff = $tr.find('.st-kddiff').text()
        const adr = $tr.find('.st-adr').text()
        const fkdiff = $tr.find('.st-fkdiff').text()
        const rating = $tr.find('.st-rating').text()
        const player = {
          playerName,
          playerCountryImg,
          kills,
          assists,
          deaths,
          kdratio,
          kddiff,
          adr,
          fkdiff,
          rating,
        }
        players.push(player)
      })

      const team = {
        name,
        players,
      }
      teams[`team${i+1}`] = team
    })
    return teams
  }

}
