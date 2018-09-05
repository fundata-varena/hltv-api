import request from 'request';
import cheerio from 'cheerio';
import { CONFIG } from './config';
import util from 'util';

/**
 * Scraping matches
 *
 * @export
 * @class Matches
 */
export default class MatchDetail {

  /**
   * Creates an instance of Matches.
   *
   * @param {string} matchId
   * @param {any} callback
   *
   * @memberOf Matches
   */
  constructor(matchId, callback) {
    const uri = `${CONFIG.BASE}/${matchId}`;
    request({ uri }, async (error, response, body) => {
      if (error != null) {
        return callback(null, error)
      }
      if (response.statusCode != 200) {
        return callback(null, new Error(`HTTP response statusCode is ${response.statusCode}`))
      }

      let matchDetail = {}

      try {
        const $ = cheerio.load(body, {
          normalizeWhitespace: true
        });

        const allContent = $('.matchstats').find('#all-content');
        const playerStats = this.parseTotalPlayerStats(allContent, $);

        // for rounds
        const mapsContainer = $('div.maps');
        const mapHolders = mapsContainer.find('div').first().children().last().children();
        const rounds = this.parseRoundsInfo(mapHolders, $);
        const boText = mapsContainer.find('.veto-box').text().trim();

        let roundCount = null;
        let boBaseText = 'Best of ';
        let index = boText.indexOf(boText);
        if (index > -1) {
          let arr = boText.slice(index+ boBaseText.length).split(' ');
          if (arr.length > 0) {
              let numVal = parseInt(arr[0]);
              if (!isNaN(numVal)) {
                  roundCount = numVal;
              }
          }
        }
        if (roundCount === null) {
          roundCount = rounds.length > 1 ? 3 : 1;
        }

        // parse team related info
        const teamsInfo = this.parseTeamsInfo($('body'));
        const matchStatsUrl = $('.matchstats .stats-detailed-stats a').attr('href')
        const mapBP = this.parseMapBP($('body'), $)

        matchDetail = {
          teams_info: teamsInfo,
          round_scores: rounds,
          round_count: roundCount,
          total_player_stats: playerStats,
          match_stats_url: matchStatsUrl,
          map_bp: mapBP,
        };

      } catch (e) {
        return callback(null, e)
      }

      callback(matchDetail, null);
    });
  }

  parseMapBP(docBody, $) {
    let bpList = docBody.find('.match-page .maps .veto-box .padding div').map((i, elem) => {
      return $(elem).text()
    }).get()
    bpList = bpList.filter((txt) => {
      return /\d\.\s\w/.test(txt)
    })
    return bpList
  }

  parseTotalPlayerStats(allContent, $) {
    let playerStats = [];
    const team1Stats = allContent.children('table.table').first().children('tbody');
    const list1 = team1Stats.children('tr').not('.header-row');

    list1.each((i, element) => {
      const el = $(element);
      const playerName = el.find('.players .gtSmartphone-only').text().replace(/'/g, '');
      const playerId = el.find('.players').children('a').attr('href');
      const kills = parseInt(el.find('td.kd').text().split('-')[0]);
      const deaths = parseInt(el.find('td.kd').text().split('-')[1]);
      const plusMinus = parseInt(el.find('td.plus-minus').text());
      const adr = parseFloat(el.find('td.adr').text(), 10);
      const kast = parseFloat(el.find('td.kast').text(), 10);
      const rating = parseFloat(el.find('td.rating').text(), 10);

      const objData = {
        playerName,
        playerId,
        kills,
        deaths,
        plusMinus,
        adr,
        kast,
        rating
      };

      playerStats.push(objData);
    });

    const team2Stats = allContent.children('table.table').last().children('tbody');
    const list2 = team2Stats.children('tr').not('.header-row');

    list2.each((i, element) => {
      const el = $(element);
      const playerName = el.find('.players .gtSmartphone-only').text().replace(/'/g, '');
      const playerId = el.find('.players').children('a').attr('href');
      const kills = parseInt(el.find('td.kd').text().split('-')[0]);
      const deaths = parseInt(el.find('td.kd').text().split('-')[1]);
      const plusMinus = parseInt(el.find('td.plus-minus').text());
      const adr = parseFloat(el.find('td.adr').text(), 10);
      const kast = parseFloat(el.find('td.kast').text(), 10);
      const rating = parseFloat(el.find('td.rating').text(), 10);

      const objData = {
        playerName,
        playerId,
        kills,
        deaths,
        plusMinus,
        adr,
        kast,
        rating
      };

      playerStats.push(objData);
    });

    return playerStats;
  }

  parseRoundsInfo(mapHolders, $) {
    let rounds = [];

    mapHolders.each((i, element) => {
      const el = $(element);
      const mapName = el.find('.map-name-holder .mapname').text();
      const mapUrl = el.find('.map-name-holder img').attr('src');

      let ele = el.find('.results');
      let scoreTexts = ele.text().replace(/\W+/g, ' ').trim().split(' ');
      const roles = el.find('.t, .ct').map((i, elem) => {
        return $(elem).hasClass('ct') ? 'CT' : 'T'
      }).get()

      let score = {};

      if (scoreTexts.length >= 2) {
        let winScore = parseInt(scoreTexts[0]);
        let loseScore = parseInt(scoreTexts[1]);

        score.team1_score = winScore;
        score.team2_score = loseScore;
      }

      if (scoreTexts.length >= 4) {
        let half1Team1Score = parseInt(scoreTexts[2]);
        let half1Team2Score = parseInt(scoreTexts[3]);

        score.half1_team1_score = half1Team1Score;
        score.half1_team2_score = half1Team2Score;

        score.half1_team1_role = roles[0]
        score.half1_team2_role = roles[1]
      }

      if (scoreTexts.length >= 6) {
        let half2Team1Score = parseInt(scoreTexts[4]);
        let half2Team2Score = parseInt(scoreTexts[5]);

        score.half2_team1_score = half2Team1Score;
        score.half2_team2_score = half2Team2Score;

        score.half2_team1_role = roles[2]
        score.half2_team2_role = roles[3]
      }

      if (scoreTexts.length >= 8) {
        let extraTeam1Score = parseInt(scoreTexts[6]);
        let extraTeam2Score = parseInt(scoreTexts[7]);

        score.extra_team1_score = extraTeam1Score;
        score.extra_team2_score = extraTeam2Score;

        score.extra_team1_role = roles[4]
        score.extra_team2_role = roles[5]
      }

      rounds.push({
        map_name: mapName,
        map_uri: mapUrl,
        score: score
      });
    });

    return rounds;
  }

  parseTeamsInfo(docRoot) {
    const liveScoreMatchId = docRoot.find('#scoreboardElement').attr('data-scorebot-id');
    let teamsBox = docRoot.find('.teamsBox');
    let team1Container = teamsBox.children().first();
    let team2Container = teamsBox.children().last();

    let timeEvent = teamsBox.find('.timeAndEvent');
    let unixTime = parseInt(timeEvent.find('.time').attr('data-unix'))/1000;
    let eventLink = timeEvent.find('.event a');
    let eventName = eventLink.attr('title');
    let link = eventLink.attr('href');
    let isLive = timeEvent.find('.countdown').attr('data-time-countdown') == 'LIVE';

    let countDownText = timeEvent.find('.countdown').text().trim();
    let match_status = 'wait';
    if (countDownText === 'LIVE') {
        match_status = 'start';
    } else if (countDownText === 'Match over') {
        match_status = 'end';
    }

    return {
      team1: this.parseTeamInfo(team1Container, 1),
      team2: this.parseTeamInfo(team2Container, 2),
      match_time: unixTime,
      match_status: match_status,
      event_name: eventName,
      is_live: isLive,
      live_score_match_id: liveScoreMatchId,
      event_uri: link
    };
  }

  parseTeamInfo(teamContainer, index) {
    let teamName = teamContainer.find('.teamName').text();
    let teamControuy = teamContainer.find('>img').attr('title');

    let teamLogo = teamContainer.find(util.format('.team%d-gradient img', index)).attr('src');
    let teamId = teamContainer.find(util.format('.team%d-gradient>a', index)).attr('herf');
    let isWin = teamContainer.find(util.format('.team%d-gradient .won', index)).length > 0;

    let score = 0;
    if (isWin) {
        score = parseInt(teamContainer.find(util.format('.team%d-gradient .won', index)).text());
    } else {
        score = parseInt(teamContainer.find(util.format('.team%d-gradient .lost', index)).text());
    }

    return {
      team_id: teamId, // an uri for team page
      team_name: teamName,
      team_controuy: teamControuy,
      team_logo: teamLogo, // logo url
      score: score,
      is_win: isWin
    };
  }
}
