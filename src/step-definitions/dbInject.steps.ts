import { expect } from 'chai';
import {Given, Status, TableDefinition, Then, When} from 'cucumber';
import { Connection } from 'mysql2/promise';
import { CustomersDAO } from '../db/customers.dao';
import { MySQLHelper } from '../db/mysqlHelper';
import { passwordHash } from '../fixtures/users';
import { RMReviewType } from '../models/RMReviewType';
import { Helper } from '../utils/helper';

//
const helper = new MySQLHelper();

/** 
 * Delete data for customer in db table
 * 
 */
Given(/^user '(.*)' delete (all|\d+) existing from '(.*)'$/, async function (
  clientEmail: string, count: string, tableName: string
) {
  const limit: string = count === 'all' ? '' : ` LIMIT ${Number.parseInt(count, 0)}`;
  const conn: Connection = await helper.getConnection();
  const sql =
    `DELETE FROM ${tableName}
      WHERE
      customer_id = (SELECT customer_id
        FROM
            users
        WHERE
            email = '${clientEmail}'
        LIMIT 1)${limit}`;

  await helper.execute(conn.format(sql), conn);
});

Given(/^DB: Client access is (enabled|disabled) for location "(.*)"$/, async function (state: string, locationId: string) {

  const locID: number = Helper.replaceWithWorldValue(locationId, this);
  expect(locID).to.satisfy(Number);
  const conn: Connection = await helper.getConnection();
  const settingsId = (state.startsWith('enab')) ? await new CustomersDAO(helper).addClientAccessSettings(true, passwordHash) : 'NULL';
  let result;

  const updQ = conn.format(
    `UPDATE location_dashboard_settings 
      SET 
        client_access_settings_id = ${settingsId}
      WHERE
        location_id = ${locID}`);
  result = await helper.execute(updQ, conn);
  expect(result[0].affectedRows).to.equal(1);
});

Given(/^DB: has '(.*)' where "(.*)" as '(.*)'$/,
  async function (tableName: string, where: string, varName: string) {
    const conn: Connection = await helper.getConnection();
    const whereCondition = Helper.replaceWithWorldValue(Helper.replaceWithWorldRandom(where, this), this);
    let result;
    const selectQ = conn.format(
      `SELECT
                *
            FROM
                ${tableName}
            WHERE
                ${whereCondition}
              LIMIT 1`);

    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    this.keepValue(varName, result[0][0]);

  });

Given(/^DB: user "(.*)" has 1 existing RM report with (not responded|responded) reviews as "(.*)"$/,
  async function (userEmail: string, isResponded: string, varName: string, data: TableDefinition) {
    const conn: Connection = await helper.getConnection();
    const typeId: RMReviewType = data.hashes()[0];

    let result: any;
    let reviewsWhere: string;
    let directory: string;
    let reviewCondition: string;
    const isConnected: boolean = (typeId.connected === 'true');
    const respondedCondtion = isResponded.startsWith('not');

    switch (typeId.type) {
      case "google":
        directory = typeId.type;
        reviewCondition = isConnected ? `IN 
        (SELECT id
            FROM
                gmb_location
            WHERE
                gmb_account_id IN (SELECT 
                    id
                FROM
                    gmb_account
                WHERE
                    google_id = '${typeId.google_id}')
                    AND customer_id = (SELECT 
                        customer_id
                    FROM
                        users
                    WHERE
                        email = '${userEmail}'
                    LIMIT 1))`: 'IS NULL';
        reviewsWhere =
          `gmb_location_id ${reviewCondition}
          AND customer_id = (SELECT 
            customer_id
        FROM
            users
        WHERE
            email = '${userEmail}')`;
        break;
      case "facebook":
        directory = typeId.type;
        reviewCondition = isConnected ? ` > 0` : 'IS NULL';
        reviewsWhere =
          `facebook_page_id ${reviewCondition}
          AND customer_id = (SELECT 
            customer_id
        FROM
            users
        WHERE
            email = '${userEmail}')`;
        break;
      default:
        throw new Error(`Invalid id type ${typeId.type}`)

    }
    // get latest review
    const selectQ = conn.format(
      `SELECT DISTINCT
                *
            FROM
                rf_reviews
            WHERE
                directory = '${directory}'
            AND report_id IN (SELECT 
                  report_id
              FROM
                  rf_reports
              WHERE ${reviewsWhere})
            GROUP BY timestamp DESC`);

    result = await helper.execute(selectQ, conn, false);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      conn.end();
      return Status.PENDING;
    }

    // Update first review response field if it doesnt satisfy test precondition 
    if (respondedCondtion) {
      if (result[0].filter(x => x.response == null).length === 0) {
        const updQ =
          `UPDATE rf_reviews
          SET response = NULL, status = '-default'
          WHERE
          review_id = ${result[0][0].review_id}`;
        await helper.execute(updQ, conn, false);
      }

    } else {
      if (result[0].filter(x => x.response != null).length === 0) {
        const updQ =
          `UPDATE rf_reviews
          SET response = 'Fake response', status = 'responded'
          WHERE
          review_id = ${result[0][0].review_id}`;
        await helper.execute(updQ, conn, false);
      }
    }

    result = await helper.execute(selectQ, conn, false);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0]).to.satisfy(Object);
    respondedCondtion
      ? this.keepValue(varName, result[0].filter(x => x.response == null)[0])
      : this.keepValue(varName, result[0].filter(x => x.response != null)[0]);
  });


When(/^DB: there are no review_sites for report "(.*)"$/, async function (report: string) {
  const conn: Connection = await helper.getConnection();
  let result;

  const repId = Helper.replaceWithWorldValue(report, this);

  const cleanUpTable = conn.format(
    `DELETE FROM rm_review_sites
      WHERE
      report_id LIKE '${repId}'`
  );

  result = await helper.execute(cleanUpTable, conn);
  expect(result[0][0]).to.satisfy(Object);

});

When(/^DB: clean '(.*)' for "(.*)" '(.*)'$/, async function (
  tableName: string,
  rowName: string,
  clientEmail: string
) {
  const conn: Connection = await helper.getConnection();
  let result;
  const cleanUpTable = conn.format(
    `DELETE FROM ${tableName}
      WHERE
          ${rowName} LIKE '${clientEmail}'`
  );

  result = await helper.execute(cleanUpTable, conn);
  expect(result[0][0]).to.satisfy(Object);
});

When(/^user '(.*)' has (\d+) cb_credits$/, async function (
  name: string,
  amount: number
) {
  const conn: Connection = await helper.getConnection();

  let userAmount;
  let customerId;
  let result;

  const selectCustomerId = conn.format(
    `SELECT customer_id
      FROM users
      WHERE email = ?
      LIMIT 1`,
    [name]
  );

  const selectAmountForCustomer = conn.format(
    `SELECT SUM(amount)
      AS sum
      FROM cb_credits
      WHERE customer_id = (${selectCustomerId})`
  );

  try {
    customerId = await conn.execute(selectCustomerId);
    userAmount = await conn.execute(selectAmountForCustomer);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(`Data not found for test ${error}`);
    await conn.end();
    return Status.PENDING;
  }

  // calc expected total
  const total = amount - Number.parseInt(userAmount[0][0].sum, 0);

  const insertCredits = conn.format(
    `INSERT INTO cb_credits (customer_id, amount, added)
       VALUES (${customerId[0][0].customer_id}, ${total || amount}, NOW());`
  );


  result = await helper.execute(insertCredits, conn);
  expect(result[0].insertId).to.satisfy(Number.isInteger);
});

Then(/^Clean DATA into DB for Manual Submissions test$/, async function (){
    const conn: Connection = await helper.getConnection();
    await helper.execute(conn.format(
        `
    UPDATE cb_campaigns
          SET submission_status = 'saved'
          WHERE
              customer_id = (SELECT customer_id FROM users WHERE email = 'CB_Test2@CBStep2.com' LIMIT 1)
                  AND ct_report_status = 'complete'
                  AND paid = 'No'
                  AND submission_status = 'Confirmed'
                  AND campaign_id in (SELECT campaign_id FROM cb_campaign_citations)
    `
    ), conn);
});

Given(/^cb_campaign "(.*)" have (\d+) Existing citations$/, async function (
  varName: string,
  n: number
) {
  const camp = this.findValue(varName);
  const conn: Connection = await helper.getConnection();
  // Remove all existing citations for campaign
  await helper.execute(conn.format(
    `
    UPDATE cb_campaign_citations
        SET url = NULL
        WHERE
        campaign_id = ${camp.campaign_id}
    `
  ), conn, false);
  if (n > 0) {
    const urls = ['facebook.com', 'manta.com',
      'brownbook.net',
      'salespider.com',
      'wand.com',
      'australia.myhuckleberry.com',
      'google.com',
      'mapquest.com',
      'yellowpages.com',
      'yelp.com',
      'angieslist.com',
      'citysearch.com',
      'superpages.com',
      'local.com'];
    const randomUrl = Helper.getRandomForString('test');

    await helper.execute(conn.format(
      `UPDATE cb_campaign_citations 
        SET 
            url = 'https://${randomUrl}.com'
        WHERE
            campaign_id = ${camp.campaign_id}
                AND citation IN (${urls.map(x => `'${x}'`)})
        LIMIT ${n}`
    ), conn, false);
  };
  helper.shutDown();
  browser.refresh();
});

Given(/^DB: user "(.*)" has '(.*)' as '(.*)'$/, async function (userEmail: string, tableName: string, varName: string) {

  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;

  selectQ = conn.format(`SELECT
          *
      FROM
          ${tableName}
          
      WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${userEmail}'
              LIMIT 1)`);

  result = await helper.execute(selectQ, conn);

  if (!result[0][0]) {
    // tslint:disable-next-line:no-console
    console.warn(`No data aviliable in db for test: \n${selectQ}`);
    return Status.PENDING;
  }
  expect(result[0][0].customer_id).to.satisfy(Number.isInteger);
  this.keepValue(varName, result[0][0]);
});

Given(/^DB: user "(.*)" has (no|1) created GR campaigns$/, async function (
  usr: string,
  ifExist: string
) {
  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;

  selectQ = conn.format(`SELECT
          *
      FROM
          rm_kiosk_campaigns
          WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${usr}'
              LIMIT 1)
      LIMIT 1`);

  result = await helper.execute(selectQ, conn);

  if (ifExist === "no") {
    if (result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
  } else {

    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
  }
}
);

Given(/^DB: user "(.*)" has (no|1) created campaigns as "(.*)"$/, async function (
    usr: string,
    ifExist: string,
    varName: string
    ) {
        const conn: Connection = await helper.getConnection();

        let result;
        let selectQ: string;

        selectQ = conn.format(`SELECT
          *
      FROM
          rm_kiosk_campaigns
          WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${usr}'
              LIMIT 1)
      LIMIT 1`);

        result = await helper.execute(selectQ, conn);

        if (ifExist === "no") {
            if (result[0][0]) {
                // tslint:disable-next-line:no-console
                console.warn(`No data aviliable in db for test: \n${selectQ}`);
                return Status.PENDING;
            }
        } else {

            if (!result[0][0]) {
                // tslint:disable-next-line:no-console
                console.warn(`No data aviliable in db for test: \n${selectQ}`);
                return Status.PENDING;
            }
            this.keepValue(varName, result[0][0]);
        }
    }
);

Given(/^DB: user "(.*)" has 1 existing RM report as "(.*)"$/, async function (
  usr,
  varName
) {
  //
  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;

  selectQ = conn.format(`SELECT
          *
      FROM
          rf_reports
      WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${usr}'
              LIMIT 1)
      LIMIT 1`);

  result = await helper.execute(selectQ, conn);

  if (!result[0][0]) {
    // tslint:disable-next-line:no-console
    console.warn(`No data aviliable in db for test: \n${selectQ}`);
    return Status.PENDING;
  }
  expect(result[0][0].report_id).to.satisfy(Number.isInteger);
  this.keepValue(varName, result[0][0]);
});

Given(/^DB: user "(.*)" has existing RM report as "(.*)"$/, async function (
    usr,
    varName
) {
    //
    const conn: Connection = await helper.getConnection();

    let result;
    let selectQ: string;

    selectQ = conn.format(`
    SELECT
          report_name, city, postcode
      FROM
          rf_reports
      WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${usr}'
              LIMIT 1)`);

    result = await helper.execute(selectQ, conn);

    if (!result[0][0]) {
        // tslint:disable-next-line:no-console
        console.warn(`No data aviliable in db for test: \n${selectQ}`);
        return Status.PENDING;
    }
    this.keepValue(varName, result[0]);
});

Given(
  /^DB: user has (\d+) (saved|confirmed) cb_campaign as "(.*)"$/,
  async function (n: number, state: string, varName: string) {
    await this.checkDbcampaign(this);
  }
);

Given(
  /^DB: user '(.*)' has (\d+) location with completed report as "(.*)"$/,
  async function checkDblocationsReport(
    email: string,
    limit: number,
    varName: string
  ) {
    const conn = await helper.getConnection();
    const selectQ = conn.format(
      `
    SELECT
    *
    FROM
        cl_customer_locations as clc
            INNER JOIN
        cl_rf_location loc ON (loc.location_id = clc.location_id)
            INNER JOIN
        (SELECT
            *
          FROM
              rf_reports
          WHERE
              complete = 'Y' AND is_deleted = 0) rfr ON (rfr.report_id = loc.report_id)
    WHERE
        clc.customer_id =
        (SELECT customer_id
          FROM
              users
          WHERE
              email = '${email}'
          LIMIT 1)
          AND clc.is_removed = '0'
    LIMIT ${limit}
  `
    );
    const result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0].location_id).to.satisfy(Number.isInteger);
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  }
);

Given(
    /^DB: make '(.*)' and paid status '(.*)' for cb_campaigns and user '(.*)'$/,
    async function checkDblocationsReport(
        campaignStatus:string,
        paidStatus:string,
        email: string
    ) {
        const conn = await helper.getConnection();
        const selectQ = conn.format(`
        update cb_campaigns as t1
        set t1.paid='${paidStatus}',t1.submission_status = '${campaignStatus}'
        where t1.campaign_id = (select a.ID from
                                (SELECT cb.campaign_id as ID 
                                FROM cb_campaigns AS cb
                                left join cl_cb_location AS cbl on cb.campaign_id = cbl.report_id
                                where cb.customer_id = (SELECT customer_id FROM users WHERE email = '${email}' 
                                                        LIMIT 1)
                                and cbl.location_id is null
                                order by cb.campaign_id desc) as a)
        `);
        const result = await helper.execute(selectQ, conn);
    }
);

Given(
  /^DB: user '(.*)' has (\d+) (saved|confirmed) cb_campaign as "(.*)"$/,
  async function checkDbcampaign(
    name: string,
    n: number,
    state: string,
    varName: string
  ) {
    //
    const conn: Connection = await helper.getConnection();

    let updateResult;
    let updateQ;
    let result;
    let selectQ: string;

    if (state === 'confirmed'){
        updateQ = conn.format(
            `UPDATE cb_campaigns
                    SET submission_status = 'confirmed',
                     aggregators_number = 1,
                     todo_aggregators = 1,
                     selection_type = 'auto'
                 WHERE submission_status = 'Saved'
                 AND customer_id =
                    (SELECT customer_id
                        FROM users
                            WHERE email = 'CB_Test3@CBStep3.com'
                    LIMIT 1)`);
        updateResult = await helper.execute(updateQ, conn, false);
    }

    switch (state) {
      case 'saved':
        selectQ = conn.format(
          `
          SELECT
              *
          FROM
              cb_campaigns AS cmp, cb_campaign_citations AS cit
          WHERE
              customer_id = (SELECT
                      customer_id
                  FROM
                      users
                  WHERE
                      email = '${name}'
                  LIMIT 1)
                  AND cmp.submission_status = '${state}'
                  AND cmp.campaign_id = cit.campaign_id
                  AND cmp.ct_report_status = 'complete'
                  AND cmp.paid = 'No'
                  GROUP BY cmp.campaign_id
                  HAVING COUNT(*) > 3
          LIMIT ${n};
        `
        );
        break;
      case 'confirmed':
        selectQ = conn.format(
          `
        SELECT
            *
        FROM
            cb_campaigns AS cmp
        WHERE
            customer_id = (SELECT
                    customer_id
                FROM
                    users
                WHERE
                    email = '${name}'
                LIMIT 1)
                AND cmp.submission_status = '${state}'
                                and cmp.created_by_user_id != 0
                    and cmp.paid='No'
                    order by cmp.campaign_id desc
        LIMIT ${n};
      `
        );
        break;
      default:
        throw new Error('Wrong state');
    }

    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0].campaign_id).to.satisfy(Number.isInteger);
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  }
);

Given(/^DB: user '(.*)' get api_key as "(.*)"$/, async function getApiKey(
  email: string,
  varName: string
) {
  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;
  selectQ = conn.format(
    `SELECT api_key
      FROM api_keys
      WHERE
      customer_id = (SELECT customer_id
          FROM users WHERE
          email = '${email}')`
  );
  result = await helper.execute(selectQ, conn, false);
  const apiKey = result[0][0].api_key;
  if (!apiKey) {
    // tslint:disable-next-line:no-console
    console.warn(
      `User "${email}" doesn't have an api key in database: \n${selectQ}`
    );
    return Status.PENDING;
  }
  await helper.execute(
    conn.format(
      `UPDATE api_keys
      SET requires_sig = 0
      WHERE api_key = '${apiKey}'`
    ),
    conn
  );
  this.keepValue(varName, apiKey);
  expect(this.findValue(varName));
});

Given(/^DB: user "(.*)" has (existing|completed) RM report without location as "(.*)"$/,
  async function (userEmail: string, reportState: string, varName: string) {
    const conn: Connection = await helper.getConnection();
    let result;
    let selectQ: string;
    selectQ = conn.format(
      `
    SELECT
    *
    FROM
        rf_reports
    WHERE
        COALESCE(gmb_location_id, 0) = 0 
        AND is_deleted = FALSE
        AND complete = '${(reportState === "completed") ? 'Y' : 'N'}'
        AND
        customer_id = (SELECT
                customer_id
            FROM
                users
            WHERE
                email = '${userEmail}'
            LIMIT 1)
    ORDER BY report_id DESC
    LIMIT 1;`
    );
    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  });

Given(/^DB: user "(.*)" has 1 completed RM report (without|with) location as "(.*)"$/,async function (
    userEmail:string,
    isStandalonereport:string,
    varName:string
    ) {
    if(isStandalonereport==='without'){
       isStandalonereport = 'not';
    } else {
        isStandalonereport = '';
    }
    const conn: Connection = await helper.getConnection();
    let result;
    const selectQ: string = conn.format(
        `select * from rf_reports t1
            join cl_customer_locations t2 on t2.customer_id=t1.customer_id
            where t1.customer_id = 
                (SELECT customer_id
                 FROM users
                 WHERE email = '${userEmail}' limit 1)
            and t1.complete = 'Y'
            and t1.report_id ${isStandalonereport} in (select report_id from cl_rf_location)
            group by t1.report_id`);
    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
        // tslint:disable-next-line:no-console
        console.warn(`No data aviliable in db for test: \n${selectQ}`);
        return Status.PENDING;
    }
    if(result[0].length!==1){
        const randomReport:number = Helper.getRandomInt(0,result[0].length-1);
        this.keepValue(varName, result[0][randomReport]);
    }else {
        this.keepValue(varName, result[0][0]);
    }
});

Given(/^DB: clear password access for location '(.*)'$/, async function (worldReportValue:string) {
    const reportId = Helper.replaceWithWorldValue(worldReportValue, this);

    const conn: Connection = await helper.getConnection();
    let result;
    const selectQ: string = conn.format(
        `update location_dashboard_settings
            set client_access_settings_id = null
            where location_id = ${reportId}`);
    result = await helper.execute(selectQ, conn);
});

Given(
  /^DB: user '(.*)' has (\d+) (complete) ct_report_runs as "(.*)"$/,
  async function (userEmail: string, n: number, state: string, varName: string) {
    const conn: Connection = await helper.getConnection();

    let result;
    let selectQ: string;
    selectQ = conn.format(
      `
    SELECT
        *
    FROM
        ct_report_runs AS cmp
    WHERE
        report_id = (SELECT
                report_id
            FROM
                ct_reports
            WHERE
                customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${userEmail}'
              LIMIT 1)
            LIMIT 1)
            AND cmp.status = '${state}'
    LIMIT ${n};
      `
    );
    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0].report_run_id).to.satisfy(Number.isInteger);
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  }
);
Given(
  /^DB: user '(.*)' has at least 1 full location as "(.*)"$/,
  async function (userEmail: string, varName: string) {
    const conn: Connection = await helper.getConnection();

    let result;
    let selectQ: string;
    selectQ = conn.format(
      `
      SELECT
          *
      FROM
      cl_customer_locations
      WHERE
      customer_id = (SELECT
        customer_id
              FROM
              users
                 WHERE
                    email = '${userEmail}')
                    AND is_removed = 0
                    AND state != ''
        AND city != ''
        AND business_category_id != ''
                    LIMIT 1
        `
    );
    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0].location_id).to.satisfy(Number.isInteger);
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  }
);

Given(
  /^DB: user '(.*)' has at least 1 location as "(.*)"$/,
  async function (userEmail: string, varName: string) {
    const conn: Connection = await helper.getConnection();

    let result;
    let selectQ: string;
    selectQ = conn.format(
      `
      SELECT
          *
      FROM
      cl_customer_locations
      WHERE
      customer_id = (SELECT
        customer_id
              FROM
              users
                 WHERE
                    email = '${userEmail}')
                    AND is_removed = 0
                    LIMIT 1
        `
    );
    result = await helper.execute(selectQ, conn);
    if (!result[0][0]) {
      // tslint:disable-next-line:no-console
      console.warn(`No data aviliable in db for test: \n${selectQ}`);
      return Status.PENDING;
    }
    expect(result[0][0].location_id).to.satisfy(Number.isInteger);
    this.keepValue(varName, result[0][0]);
    expect(this.findValue(varName));
  }
);

Then(/^DB: user '(.*)' (should|should not) have "(.*)" plan$/,
    async function (userEmail: string,isShould: string, varName: string) {
    const condition: boolean = !isShould.endsWith('not');
        const conn: Connection = await helper.getConnection();

        let result;
        let selectQ: string;
        selectQ = conn.format(
            `
            SELECT subscription_display_name 
                FROM subscriptions as t1
                JOIN customer_subscriptions AS t2 ON t1.subscription_id=t2.subscription_id
                WHERE t2.customer_id = (SELECT customer_id
                                            FROM users
                                            WHERE email = 'RMinLoc@TestClAndLocs.com' 
                                            LIMIT 1)
        `
        );
        result = await helper.execute(selectQ, conn);
        // tslint:disable-next-line:no-unused-expression
        expect(result[0][0]).not.empty;
        expect(result[0][0].subscription_display_name).not.to.equal(varName)
});
