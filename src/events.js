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
export default class Events{
  /**
   * Creates an instance of Results.
   *
   * @param {any} callback
   *
   * @memberOf Results
   */
  constructor(callback) {
    const uri = `${CONFIG.BASE}${CONFIG.EVENTS}`;

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

  getUpcommingEvents() {
    let $ = this._selector;
    let events = [];

    // big-events
    $('.events-page >.events-holder .big-events > a').each((i, link) => {
        const $link = $(link);
        const eventId = $link.attr('href');
        const eventLogo = $link.find('.event-holder>img').attr('src');

        const $bigEventInfo = $link.find('.big-event-info');
        const eventName = $bigEventInfo.find('.big-event-name').text().trim();
        const eventLocation = $bigEventInfo.find('.big-event-location').text().trim();

        const $additional = $bigEventInfo.find('.additional-info');
        const eventPrize = $additional.find('tbody > tr > td').eq(1).text();

        const $timeSpans = $additional.find('tbody > tr > td').first().find('span[data-unix]');
        let eventStartTime, eventEndTime;
        $timeSpans.each((i, span) => {
            const $span = $(span);
            const time = $span.attr('data-unix') ? parseInt($span.attr('data-unix'))/1000 : 0;
            if (i === 0) {
               eventStartTime = time;
            } else {
               eventEndTime = time;
            }
        });

        events.push({
            event_id: eventId,
            event_logo: eventLogo,
            event_prize: eventPrize,
            event_name: eventName,
            event_location: eventLocation,
            event_start_time: eventStartTime,
            event_end_time: eventEndTime
        });
    });

    // normal
    $('.events-page >.events-holder .events-month > a').each((i, link) => {
        const $link = $(link);
        const eventId = $link.attr('href');

        const $logo = $link.find('>img');
        const eventLogo = $link.attr('src');

        const $firstTr = $link.find('tbody > tr').first();
        const eventName = $firstTr.find('td').first().text().trim();
        const eventPrize = $firstTr.find('.prizePoolEllipsis').text();

        const $detailTr = $link.find('tbody tr.eventDetails');
        const $detailFirstTd = $detailTr.find('td').first();

        const eventLocation = $detailFirstTd.find('.smallCountry .col-desc').text().replace('|', '').trim();

        const $timeSpans = $detailFirstTd.find('span[data-unix]');
        let eventStartTime, eventEndTime;
        $timeSpans.each((i, span) => {
            const $span = $(span);
            const time = parseInt($span.attr('data-unix'))/1000;
            if (i === 0) {
               eventStartTime = time;
            } else {
               eventEndTime = time;
            }
        });

        events.push({
            event_id: eventId,
            event_logo: eventLogo,
            event_prize: eventPrize,
            event_name: eventName,
            event_location: eventLocation,
            event_start_time: eventStartTime,
            event_end_time: eventEndTime
        });
    });

    return events;
  }

  getAllOngoingEvents() {
    let $ = this._selector;
    let events = [];

    $('#ALL').find('.ongoing-event-holder > a').each((i, link) => {
        const $link = $(link);
        const eventId = $link.attr('href');

        const $content = $link.find('> .content');
        const eventLogo = $content.find('> img').attr('src');

        const $tbody = $content.find('tbody');
        const eventName = $tbody.find('tr').first().find('td').first().find('.text-ellipsis').text().trim();

        const $detailTr = $tbody.find('tr.eventDetails');
        const $timeSpans = $detailTr.find('td').first().find('span[data-unix]');
        let eventStartTime, eventEndTime;
        $timeSpans.each((i, span) => {
            const $span = $(span);
            const time = $span.attr('data-unix') ? parseInt($span.attr('data-unix'))/1000 : 0;
            if (i === 0) {
               eventStartTime = time;
            } else {
               eventEndTime = time;
            }
        });

        events.push({
            event_id: eventId,
            event_logo: eventLogo,
            event_name: eventName,
            event_start_time: eventStartTime,
            event_end_time: eventEndTime
        });
    });

    return events;
  }
}
