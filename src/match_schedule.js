import request from 'request';
import cheerio from 'cheerio';
import { CONFIG } from './config';

const BestOfOneText = 'Best of 1';

/**
 * Scraping results
 *
 * @export
 * @class Results
 */
export default class MatchSchedule {
  /**
   * Creates an instance of Results.
   *
   * @param {any} callback
   *
   * @memberOf Results
   */
  constructor(callback) {
    const uri = `${CONFIG.BASE}${CONFIG.SCHEDULE}`;

    request({ uri }, (error, response, body) => {
      if (error) {
          return callback(null, error);
      }

      const $ = cheerio.load(body, {
        normalizeWhitespace: true
      });

      this._selector = $;
      callback(true, null);
    });
  }

  // only return a list
  getLiveMatches() {
    const $ = this._selector;
    const liveMatchRows = $('.live-matches .live-match');

    let matches = [];
    liveMatchRows.each((i, row) => {
        const $row = $(row);
        const matchId = $row.find('>a').attr('href');
        const eventName = $row.find('.live-match-header .event-name').text();
        const eventLogo = $row.find('.live-match-header img').attr('src');

        const $scores = $row.find('.scores');
        const bestOf = $scores.find('.header .bestof').text();

        let maps = [];
        $scores.find('.header td').each((i, td) => {
            const $td = $(td);
            if (!$td.hasClass('map')) {
                return
            }

            maps.push($td.text());
        });

        let teamScores = [];
        $scores.find('tbody tr').each((i, tr) => {
            const $tr = $(tr);
            if ($tr.hasClass('header')) {
                return;
            }

            let scoreValues = [];
            $tr.find('.livescore.map.mapscore').each((i, td) => {
                const $td = $(td);
                const scoreVal = parseInt($td.text());
                // const scoreTeamNum = parseInt($td.find('span').attr('data-livescore-team'));
                scoreValues.push(scoreVal);
            });

            const teamName = $tr.find('.teams .team-name').text();

            teamScores.push({
                team_name: teamName,
                score_values: scoreValues
            });
        });

        matches.push({
            maps: maps,
            team_scores: teamScores,
            best_of: bestOf,
            event_name: eventName,
            event_logo: eventLogo,
            match_id: matchId
        });
    });

    return matches;
  }

  getScheduleMatches() {
    const $ = this._selector;
    const matchRows = $('.upcoming-matches .match-day .upcoming-match');

    let matches = [];
    matchRows.each((i, row) => {
        const $row = $(row);
        let matchId = $row.attr('href');
        let matchTime = $row.find('td.time>.time').attr('data-unix');

        let teamCells = $row.find('.team-cell');
        let teamInfos = [];
        teamCells.each((i, cell) => {
            const $cell = $(cell);
            const teamName = $cell.find('.team').text();
            const teamLogo = $cell.find('img').attr('src');

            teamInfos.push({
                team_name: teamName,
                team_logo: teamLogo
            });
        });

        let $eventRow = $row.find('.event');
        const eventName = $eventRow.find('.event-name').text();
        const eventLogo = $eventRow.find('>img').attr('src');

        matches.push({
            match_id: matchId,
            match_time: matchTime ? parseInt(matchTime)/1000 : 0,
            event_name: eventName,
            event_logo: eventLogo,
            team_infos: teamInfos
        });
    });

    return matches;
  }
}
