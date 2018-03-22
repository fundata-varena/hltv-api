import request from 'request';
import cheerio from 'cheerio';
import { CONFIG } from './config';

/**
 * Scraping results
 * 
 * @export
 * @class Results
 */
export default class Results2 {

  /**
   * Creates an instance of Results.
   * 
   * @param {any} callback 
   * 
   * @memberOf Results
   */
  constructor(offset, callback) {
    const uri = `${CONFIG.BASE}${CONFIG.RESULTS}?offset=${offset}`;

    request({ uri }, (error, response, body) => {
      const $ = cheerio.load(body, {
        normalizeWhitespace: true
      });

      const resultElements = $('.results-all .result-con');

      let results = [];

      $(resultElements).each((i, element) => {
        const el = $(element).find('tr');
        const team1 = el.children('.team-cell').first();
        const team2 = el.children('.team-cell').last();
        const matchId = $(element).children('a').attr('href');
        const matchTime = parseInt($(element).attr('data-zonedgrouping-entry-unix'));
        const maps = el.find('.map');
        const result1 = el.find('.result-score').children('span').first();
        const result2 = el.find('.result-score').children('span').last();

        const objData = {
          match_time: matchTime ? matchTime/1000 : 0,
          event: el.find('.event-name').text(),
          maps: maps.text(),
          team1: {
            name: team1.find('.team').text(),
            crest: team1.find('img').attr('src'),
            result: parseInt(result1.text()),
            is_win: result1.hasClass('score-won')
          },
          team2: {
            name: team2.find('.team').text(),
            crest: team2.find('img').attr('src'),
            result: parseInt(result2.text()),
            is_win: result2.hasClass('score-won')
          },
          matchId
        };

        results.push(objData);
      });

      callback(results, error);
    });
  }
}
